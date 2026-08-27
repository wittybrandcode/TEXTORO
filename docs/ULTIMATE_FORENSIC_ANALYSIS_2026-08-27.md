# TEXTORO — التحقيق الجنائي الشامل (Ultimate Forensic Analysis)

| البند | القيمة |
|---|---|
| **التاريخ** | 2026-08-27 |
| **النطاق** | `C:\Users\User\Documents\TEXTORO` (المرآة: `C:\Program Files (x86)\...`) — 205 ملفات متتبعة، 60 وثيقة داخلية أُزيلت من المستودع النقي |
| **الإصدار المُحقق** | `1.0.1` (tag `v1.0.1`) — بعد إصلاحات F-01..F-14, H-1..H-3, N-04, C-05/C-06 |
| **المنهجية** | 3 تحقيقات متوازية: **أمن** (35 ملف)، **أداء وتوافق ES3** (host+expressions+smoke)، **بنية وجودة** (dead code/duplication/state) + إعادة فحص smoke الـ9 بوابات |
| **حالة Smoke** | `ALL CHECKS PASSED` — 9 بوابات (syntax, contract, es5-host, json-polyfill 26 حالة, versions 1.0.0×6, encoding 127 ملفًا, preset-boundaries, preset-ui-safety, host-collisions 242 unique) |

---

## 0) الخلاصة التنفيذية

المشروع **مستقر للإصدار 1.0.x** من حيث الوظائف الحرجة: الـ 4 عيوب P0 التاريخية مغلقة، والـ smoke يمر، والبريسات تحمل الآن. التحقيقات الثلاثة كشفت **لا عيوب حرجة جديدة تمنع التشغيل**، لكنها وجدت **3 ثغرات أمنية عالية متبقية** (مسار ملفات + eval احتياطي)، و**عنق أداء معماري واحد** (مسح Effect Controls الخطي)، و**تراكم كود ميت** (~2k سطر). لا شيء منها يكسر الاستخدام العادي، لكنها تحدد خارطة `v1.0.2 → v1.1.0` بوضوح.

| الخطورة | العدد | أمثلة |
|---|---|---|
| **P0 حرجة** | 3 | `Utilities.jsx:35` إسقاط `data` الكاذبة، `HostBridge.js:120` فرع `eval`، `PresetManager.jsx:502` قراءة فئة بلا allowlist |
| **P1 عالية** | 7 | ترتيب `File.encoding`، فحص الإصدارات الأعمى، `findEffectControl` في حلقات ساخنة |
| **P2 متوسطة** | 9 | كود ميت (SpectrumStepper/Tooltip)، تكرار `getTimeNum`، تلوث `window.*` |
| **P3 منخفضة** | 6 | تسريب `$.writeln`، `localStorage` منفصل، `BEZIER_K` غير مستخدم |

> **الحكم:** آمن للاستخدام اليومي وإطلاق `v1.0.1`، مع **إلزام إغلاق P0 قبل `v1.0.2`**.

---

## 1) عيوب حرجة P0 — تُصلح قبل `v1.0.2`

### P0-1 `host/modules/Utilities.jsx:35` — إسقاط الحمولات الكاذبة
```js
33: function success(msg, data){
34:   var result = { success:true, message:msg };
35:   if (data) result.data = data; // ← يسقط 0, "", false
```
- **الدليل:** `TypewriterManager.jsx:137` `success("تم", "")` لطبقة فارغة → `res.data===undefined` في `SogaPanel.js:143` فيُعتبر لا يوجد نص.
- **الإصلاح (5 دقائق):** `if (data !== undefined && data !== null) result.data = data;`
- **اختبار:** `tools/smoke/check-hostbridge-contract.js` لا يغطي falsy؛ أضف حالة `success("x","")` في `check-json-polyfill` أو وحدة اختبار خفيفة.

### P0-2 `js/core/HostBridge.js:120` — فرع `eval` الاحتياطي
```js
106: var fn=esc(funcName); var payload=esc(argsStr);
120: else{try{__res=eval(__fn + "('" + __payload + "')");}catch(__e1){}}
```
- **الثغرة:** `esc` يهرب `'` لـ literal الخارجي `'...'`، لكن `__payload` يُفك هروبه عند تخزينه كمتغير ثم يُدمج في `eval("fn('"+__payload+"')")` بلا إعادة هروب. حمولة في `preset.name = "'); $.evalFile(...); //"` تكسر السلسلة → تنفيذ ExtendScript تعسفي بصلاحيات AE (ملفات + `app.project`).
- **الوصول:** يتطلب XSS سابق (1.1/1.2) أو استدعاء `HostBridge.run("nonexistent", payload)` من كونسول CEP. السلسلة `XSS → Host RCE` مثبتة.
- **الحالة:** `safeRun` غلف `cs.evalScript` لكن **لم يحذف فرع `eval` داخل السكربت المُرسل** — لا يزال موجودًا.
- **الإصلاح:** احذف الفرع كاملاً، أبقِ `$.global[__fn](__payload)` فقط، و-validatation `funcName` بـ allowlist `^[A-Za-z_][A-Za-z0-9_]*$` + قائمة ~30 دالة مصدرة. (30 دقيقة)

### P0-3 `host/modules/PresetManager.jsx:502,609,736` + `ExpressionLoader.jsx:176` — قراءات بلا allowlist
| الموقع | الكود | الاستغلال |
|---|---|---|
| `PresetManager.jsx:509` `loadPresets` | `var category = opts.category; ... getBuiltinPresetsPath()+category+"/"` | `{"category":"../../Windows"}` → تعداد مجلد عشوائي |
| `PresetManager.jsx:301` `_loadPresetByFileName` | `category+"/"+fileName` مباشرة | `category:"../../config" fileName:"../../settings.json"` رغم `_isSafePresetFileName` لا يُستدعى هنا |
| `PresetManager.jsx:758` `getPreset` | `fileName = builtinIndex.presets[i].file` من `_index.json` القابل للكتابة | تعديل `_index.json` إلى `../../../../etc/hosts` → قراءة ملف عشوائي |
| `ExpressionLoader.jsx:176` `loadExpression` | `getExpressionsPath()+category+"/"+version+"/"+name+".js"` | `category:"..", version:".."` → قراءة `.js` عشوائي |
- **الحالة:** مسارات **الكتابة** (`savePreset`, `_importSinglePreset`) محمية بـ `_isAllowedPresetCategory` + `_isSafePresetFileName` بعد إصلاحات F-06/SEC-02، لكن مسارات **القراءة** المذكورة أعلاه لم تُحمَ بعد.
- **الإصلاح:** استدعاء `_isAllowedPresetCategory` + `_getUserPresetFile` + تحقق `file.fsName.indexOf(expectedBase)===0` في كل دالة قراءة. (ساعة)

---

## 2) عيوب عالية P1

### P1-1 ترتيب `File.encoding` بعد `open()` — غير فعال
| الموقع | الكود الخاطئ | الصحيح |
|---|---|---|
| `ControllerManager.jsx:105,139,349,381` | `file.open("r"); file.encoding="UTF-8";` | `file.encoding="UTF-8"; file.open("r");` |
| `PresetManager.jsx:45,60` | لا يضبط `encoding` إطلاقًا لقراءة/كتابة `settings.json` | أضف قبل `open` |
- **الأثر:** قراءة `settings.json` أو `controllers` بنظام `CP1252` على ويندوز → تشوه عربي (نفس جذر `fix-mojibake`). `Check-encoding` لا يفحص الترتيب.
- **الإصلاح:** إصلاح 6 مواضع + إضافة فحص `check-encoding-order.js`. (ساعة)

### P1-2 فحص الإصدارات الأعمى
- `check-version-consistency.js:43` يبحث عن `src="js/[^"]*\?v=` — حاليًا `index.html` بلا `?v=` إطلاقًا → `cache-buster` غير موجود → **نجاح كاذب**. `CONFIG_MODULE_VERSION="1.1.0"` مقابل `CONFIG.VERSION="1.0.0"`، و `AE_MIN_VERSION=13.0` مقابل `manifest Host 17.0` غير مفحوصة.
- **الإصلاح:** الفشل إذا لم يوجد أي `?v=`، والتحقق من `CONFIG_MODULE_VERSION === CONFIG.VERSION`. (30 دقيقة)

### P1-3 عنق `findEffectControl` الخطي
- `Utilities.jsx:270` `for(i=1;i<=fx.numProperties;i++)` يُستدعى **~3,500 مرة** لكل تحديث Soga (15+20+42 حقل × 50 خاصية متوسط). `setLayerEffectValuesMulti` مع 10 طبقات → **~35k قراءة** + مسح `comp.numLayers` المتداخل (`BoxManager.jsx:38,141`).
- `$.writeln` غير محجوب في الحلقات (`BoxManager:151,163`, `ControllerManager:215`) يزيد البطء.
- **الإصلاح:** بناء خريطة `fxMap` مرة واحدة لكل `fx`، وتغليف كل `$.writeln` بـ `if(CONFIG.DEBUG)`. (ساعتان)

### P1-4 كود ميت بحجم مؤثر
- `js/ui/SpectrumStepper.js` (533 سطر) لم يُحمّل إطلاقًا (`index.html` لا يتضمنه) — خطر ازدواج الربط إذا فُعّل.
- `js/ui/Tooltip.js` يستمع لـ `[data-tip]` بلا أي عنصر يحملها (HTML يستخدم `title`).
- `HostBridge.runAsync`/`getSystemInfo`, `Config.MARKER_TYPES`/`PRESET_HUB_CATEGORIES`, `BOX_CONFIG.BEZIER_K` — مفاتيح ميتة.
- **الإجراء:** حذف أو اعتماد رسمي في `v1.1.0` (قرار واحد).

---

## 3) عيوب متوسطة P2

| الفئة | المواقع | الأثر |
|---|---|---|
| **تكرار منطق** | `getTimeNum` في `TypewriterPanel.js:153` ↔ `MultiLinesPanel.js:16` (25 سطر متطابقة)، `hexToRgb` في `Utils.js:13` ↔ `SogaPanel.js:679`، `setValue/setChecked` في `SogaPanel:654` ↔ `MotionPanel:786`، `4-corners expression` في 3 أماكن | إصلاح واحد يتطلب 3 تعديلات |
| **تلوث `window.*`** | `aliases.js:21` `window.DEBUG` لقطة بدائية، `SelectionMonitor.js:161` `var SelectionMonitor` عالمي | تبديل `TEXTORO.Config.DEBUG` لا ينتشر |
| **حالة منفصلة** | `textoro_favorites` خارج `TEXTORO_UI_STATE` (`PresetsPanel.js:130`)، زر "Clear Cache" لا يمسح `localStorage` | مفضلة يتيمة بعد حذف بريست |
| **معالجة أخطاء صامتة** | `SelectionMonitor.js:22` `if(!res.success) return;` كل 300ms، `SogaPanel:140` يطوي فشل المضيف كـ 0 | 20 خطأ/دقيقة مخفية |
| **الـ presets** | `PresetManager.jsx:669` `getAllPresets` لا يعدد `motion-full`، `generatePresetId` يعتمد `Date.now` دون فحص تصادم | تصدير ناقص، تصادم محتمل بنفس الميلي ثانية |

---

## 4) إيجابيات مثبتة (تحقيقات تؤكد الإصلاح)

- **ES3 نظيف:** 0 انتهاكات في `host/` (سموك يقطع التعليقات قبل الفحص) — `txKeyCount/txIsArray/txTrim` في `Utilities.jsx:57,70,80` بدائل سليمة.
- **Undo آمن:** كل مواقع `host` الآن بنمط `undoStarted` المحروس — لا `app.endUndoGroup()` غير مشروط متبقٍ.
- **XSS مُحكم في المسارات الحرجة:** `MarkersPanel.js:429` يهرب `layerName`، `MotionPanel.js:104` يتحقق `FA_ICON_RE` ويستخدم `textContent`.
- **الكتابة الذرية:** `_writeUserPreset` + `_writeUserPresetIndex` عبر ملف مؤقت مع تحقق JSON قبل الاستبدال — يحمي من انقطاع التيار.
- **Live Text v1.4:** تعبير `value.text` مع `Live Text` checkbox — جاهز لـ Mogrt.

---

## 5) خارطة الطريق المقترحة

| المرحلة | المهام | الجهد | يغلق |
|---|---|---|---|
| **v1.0.2 (أسبوع)** | P0-1 + P0-2 (حذف `eval`) + P0-3 allowlist قراءات + P1-1 ترتيب encoding | 4 ساعات | كل P0 |
| **v1.0.3** | P1-2 فحص إصدارات + P1-3 خريطة `fxMap` + تغليف `$.writeln` | 3 ساعات | عنق الأداء |
| **v1.1.0** | حذف/اعتماد الكود الميت + توحيد `getTimeNum` + دمج `localStorage` + `v1.4` افتراضي | يومان | دين تقني |

---

## 6) أدلة سريعة للمراجع

```powershell
# إعادة إنتاج كل جدول أعلاه
Select-String -Path host\modules\*.jsx -Pattern 'open\("r"\).*encoding|encoding.*open\("r"\)' -All
Select-String -Path host\modules\*.jsx -Pattern 'findEffectControl' -All
Select-String -Path host\modules\*.jsx -Pattern 'comp\.numLayers' -All
node tools/smoke/check-host-global-collisions.js
node tools/smoke/check-preset-ui-safety.js
```

*التقرير مبني على 3 تحقيقات متوازية + فحص smoke الـ9 بوابات بتاريخ 2026-08-27.*
