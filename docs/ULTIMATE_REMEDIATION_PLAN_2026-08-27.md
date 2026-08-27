# TEXTORO — الخطة العلاجية الشاملة لسد كل العيوب (Ultimate Remediation Plan)

| البند | القيمة |
|---|---|
| **التاريخ** | 2026-08-27 |
| **المرجع الجنائي** | `docs/ULTIMATE_FORENSIC_ANALYSIS_2026-08-27.md` |
| **النطاق** | كل العيوب المصنفة P0→P3 + الفجوات في بوابات الـ smoke |
| **الإصدار المستهدف** | `v1.0.2` (إلزامي) → `v1.0.3` → `v1.1.0` |
| **الحالة** | معتمدة للتنفيذ |
| **قاعدة العمل** | كل مرحلة تُغلق بـ smoke أخضر + UAT موثق في `docs/UAT_V1/` |

---

## 1) الأهداف وحدود العمل

**الأهداف:**
1. إغلاق كل P0 قبل أي إصدار (حجب حمولات + قراءات موثقة + `eval`).
2. إصلاح عنق الأداء المعماري دون تغيير سلوك المستخدم.
3. تصفير الكود الميت وتوحيد التكرار تحت مصدر واحد للحقيقة.
4. سد فجوات بوابات الـ smoke حتى تصبح كاشفة لا شكلية.

**Non-goals (خارج هذه الخطة):**
- إعادة تصميم Typewriter/Box/Motion/Soga.
- ترحيل لموديول ES6 أو bundler.
- تعديل البريسات المدمجة في `config/presets/`.
- حذف الوثائق التاريخية (هذه الخطة تنسخها فقط للعيوب المذكورة).

---

## 2) جدول العيوب المُصنف (المرجع الوحيد)

| ID | الخطورة | الوصف | الملفات الأساسية |
|---|---|---|---|
| **P0-1** | حرجة | `success()` يسقط `0`/`""`/`false` | `host/modules/Utilities.jsx:35` |
| **P0-2** | حرجة | فرع `eval` في HostBridge يسمح `XSS→RCE` | `js/core/HostBridge.js:120` |
| **P0-3** | حرجة | قراءات بلا allowlist (تعداد/قراءة ملفات عشوائية) | `host/modules/PresetManager.jsx:502,609,736`, `host/modules/ExpressionLoader.jsx:176`, `host/modules/ControllerManager.jsx:131` |
| **P1-1** | عالية | `File.encoding` بعد `open()` (غير فعال) | `host/modules/ControllerManager.jsx:105,139,349,381`, `host/modules/PresetManager.jsx:45,60` |
| **P1-2** | عالية | فحص الإصدارات أعمى (بلا `?v=` → نجاح كاذب) | `tools/smoke/check-version-consistency.js:43`, `CSXS/manifest.xml:8` vs `host/modules/Config.jsx:217` |
| **P1-3** | عالية | عنق `findEffectControl` الخطي + `$.writeln` في الحلقات | `host/modules/Utilities.jsx:270`, `host/modules/SogaManager.jsx:213,265`, `host/modules/BoxManager.jsx:38,141` |
| **P1-4** | عالية | كود ميت بحجم مؤثر | `js/ui/SpectrumStepper.js:17` (533 سطر), `js/ui/Tooltip.js:41` |
| **P2-1** | متوسطة | تكرار منطق (`getTimeNum`, `hexToRgb`, `4-corners`) | أنظر §6.3 |
| **P2-2** | متوسطة | تلوث `window.*` ولقطات بدائية | `js/legacy/aliases.js:21`, `js/state/SelectionMonitor.js:161` |
| **P2-3** | متوسطة | حالة منفصلة (`textoro_favorites` خارج `TEXTORO_UI_STATE`، `FPS` قديم) | `js/panels/PresetsPanel.js:130`, `js/time/TimeUtils.js:11` |
| **P2-4** | متوسطة | ابتلاع أخطاء صامت (`count=0`, `JSON.stringify` قاسٍ) | `js/panels/SogaPanel.js:140`, `js/state/SelectionMonitor.js:22` |
| **P2-5** | متوسطة | تناقض فئات البريسات (`getAllPresets` بلا `motion-full`) | `host/modules/PresetManager.jsx:669` |

---

## 3) العقود المطلوبة (تمنع التكرار)

### 3.1 `success()` — لا إسقاط
```js
// host/modules/Utilities.jsx:35
if (data !== undefined && data !== null) result.data = data;
```

### 3.2 HostBridge — لا `eval`
- احذف الفرع `eval(__fn +"('"+__payload+"')")` نهائيًا.
- `funcName` يُمرر كمتغير ويُستدعى مباشرة `$.global[__fn](__payload)` فقط.
- تحقق `funcName` بـ `/^[A-Za-z_$][A-Za-z0-9_$]*$/` + allowlist من ~30 دالة مصدرة.

### 3.3 كل قراءة ملفات — موثقة
```js
if (!_isAllowedPresetCategory(category)) return error(...);
if (!_isSafePresetFileName(fileName)) return error(...);
var file = _getUserPresetFile(category, fileName);
if (!file || file.fsName.indexOf(expectedBase)!==0) return error(...);
```
تُطبق في: `PresetManager.loadPresets/getPreset/_loadPresetByFileName/renamePreset`, `ExpressionLoader.loadExpression`, `ControllerManager.loadCategoryControllers`.

### 3.4 `File.encoding` — قبل `open()`
```js
file.encoding = "UTF-8"; file.open("r"); // لا عكس
```

---

## 4) خطة التنفيذ بالمراحل

### المرحلة 0 — التأسيس و Fixtures (½ يوم)

**الملفات:** `tools/smoke/`, `docs/UAT_V1/`

1. شغّل `run-smoke-checks.ps1` واحفظ المخرجات في سجل المهمة.
2. Fixtures موجودة (`tools/smoke/fixtures/presets/` 6 ملفات) — أضف `no-OUT-markers.json` لاختبار P0-3 الفرعي إن لزم.
3. سجّل UAT أساسي لحفظ/استيراد/حذف Arena قبل أي تعديل.
4. **معيار القبول:** كل smoke الحالي أخضر؛ الـ fixtures موجودة.

### المرحلة 1 — إغلاق P0 (يوم واحد) — **بوابة v1.0.2**

| ID | الملفات | الخطوات | المعيار |
|---|---|---|---|
| **P0-1** | `host/modules/Utilities.jsx:35` | `if (data)` → `if (data !== undefined && data !== null)` | `getLayerText` بنص `""` يعيد `res.data===""` لا `undefined`; `check-hostbridge-contract` لا يفشل |
| **P0-2** | `js/core/HostBridge.js:23,106,120` | احذف فرع `eval`، أبقِ `$.global[__fn](__payload)`، أضف allowlist + regex | `rg "eval\(__fn"` → 0 نتائج؛ `XSS→RCE` مستحيل |
| **P0-3** | `host/modules/PresetManager.jsx:502,609,736`, `host/modules/ExpressionLoader.jsx:176` | أضف `_isAllowedPresetCategory` + `_isSafePresetFileName` + فحص `fsName` البادئة في كل دالة قراءة | محاولة `{"category":"../../Windows"}` تفشل بلا إنشاء مجلد/ملف |

### المرحلة 2 — إصلاح P1 (يومان)

| ID | الخطوات |
|---|---|
| **P1-1** | صحح ترتيب 6 مواضع (`ControllerManager.jsx:105,139,349,381` + `PresetManager.jsx:45,60`)؛ أضف فحص `check-encoding-order.js` |
| **P1-2** | `check-version-consistency.js` يفشل إذا لم يوجد أي `?v=`، ويتحقق `CONFIG_MODULE_VERSION === CONFIG.VERSION` و `AE_MIN_VERSION` ↔ `manifest Host 17.0` |
| **P1-3** | ابنِ `fxMap` مرة واحدة لكل `fx` في `SogaManager/TypewriterManager/BoxManager`؛ غلّف كل `$.writeln` في الحلقات بـ `if(CONFIG.DEBUG)` |
| **P1-4** | احذف `SpectrumStepper.js` أو اعتمده (قرار واحد)، واحذف `Tooltip.js` أو حوّل `title`→`data-tip` |

### المرحلة 3 — توحيد P2 (يومان)

| ID | الخطوات |
|---|---|
| **P2-1** | اسحب `getTimeNum` → `TimeUtils.getInputSeconds`، وحّد `hexToRgb` على `TEXTORO.Utils`، وحّد تعبير `path4corners` الثلاثي |
| **P2-2** | غلّف `aliases.js` بـ `if(!window.TEXTORO_ALIASES_LOADED)` وحوّل `DEBUG/TIMING` إلى getters حية |
| **P2-3** | ادمج `textoro_favorites` داخل `TEXTORO_UI_STATE` مع ترحيل، وأضف زر "Clear localStorage" في `SettingsPanel` |
| **P2-4** | استبدل `count = (success?count:0)` برسائل `StatusBar.warning`، وأصلح ابتلاع `SelectionMonitor:22` بعدّاد أخطاء |
| **P2-5** | `getAllPresets` → `Object.keys(PRESET_CATEGORIES_ALLOWED)` |

### المرحلة 4 — بوابات وتوثيق (½ يوم)

1. أضف `check-encoding-order.js`, `check-fxmap-usage.js` (اختياري), ووسّع `check-version-consistency`.
2. حدّث `CHANGELOG.md` بدون تفاصيل ثغرة، و `README.md` إن لزم.
3. شغّل كل smoke + UAT الكامل في AE 17.0 والأحدث.

---

## 5) نظام تتبع التنفيذ (Roadmap Tracker)

> حدّث عمود **الحالة** عند كل إغلاق: `⬜` → `🟡 قيد` → `✅` / `❌`

| ID | المهمة | الملفات | الجهد | الحالة | تاريخ الإغلاق |
|---|---|---|---|---|---|
| P0-1 | `success()` لا يسقط falsy | `host/modules/Utilities.jsx:35` | 15 د | ✅ | 2026-08-27 |
| P0-2 | حذف `eval` + allowlist `funcName` | `js/core/HostBridge.js:120` | 1 س | ✅ | 2026-08-27 |
| P0-3 | Allowlist قراءات Presets/Expressions | `host/modules/PresetManager.jsx:502` `host/modules/ExpressionLoader.jsx:176` | 1 س | ✅ | 2026-08-27 |
| P1-1 | `File.encoding` قبل `open()` | `host/modules/ControllerManager.jsx:105` `host/modules/PresetManager.jsx:45` | 1 س | ✅ | 2026-08-27 |
| P1-2 | فحص إصدارات صارم + `?v=` | `tools/smoke/check-version-consistency.js:43` | 1 س | ✅ | 2026-08-27 |
| P1-3 | `fxMap` + تغليف `$.writeln` | `host/modules/Utilities.jsx:270` `host/modules/SogaManager.jsx:213` | 3 س | ✅ | 2026-08-27 |
| P1-4 | حذف/اعتماد كود ميت | `js/ui/SpectrumStepper.js` `js/ui/Tooltip.js` | 2 س | ✅ | 2026-08-27 |
| P2-1 | توحيد التكرار | `js/panels/TypewriterPanel.js:153` `js/core/Utils.js:13` | 3 س | ⬜ | |
| P2-2 | تنظيف `window.*` | `js/legacy/aliases.js:21` | 1 س | ⬜ | |
| P2-3 | دمج الحالة | `js/panels/PresetsPanel.js:130` | 2 س | ⬜ | |
| P2-4 | إظهار الأخطاء | `js/panels/SogaPanel.js:140` | 1 س | ⬜ | |
| P2-5 | توحيد فئات البريسات | `host/modules/PresetManager.jsx:669` | 30 د | ⬜ | |

**إجمالي تقديري:** `v1.0.2` = يومان، `v1.0.3` = يوم، `v1.1.0` = يومان.

---

## 6) بوابات الإصدار (Release Gates)

لا يُطلق إصدار إلا بتحقق كل الشروط:

- [ ] `run-smoke-checks.ps1` أخضر (9 بوابات + `check-encoding-order`).
- [ ] `rg "eval\(__fn"` → 0 نتائج، `rg "File\.encoding" -A1 | rg "open"` بلا عكس.
- [ ] لا `innerHTML` مع `preset.*` (يفحصه `check-preset-ui-safety`).
- [ ] لا `deletePreset` يرسل `name` (يفحص `rg "deletePreset.*name:"`).
- [ ] `git diff` محصور بالملفات المخططة + الاختبارات + الوثائق.
- [ ] `CHANGELOG.md` يصف الإصلاح بلا تفاصيل استغلال.
- [ ] UAT في `docs/UAT_V1/UAT_PRESETS_SECURITY_2026-08-26.md` ناجح على AE 17.0 والأحدث.

---

## 7) UAT — ما قبل الإطلاق

نفّذ checklist الجديد `docs/UAT_V1/UAT_PRESETS_SECURITY_2026-08-26.md` + `docs/UAT_V1/UAT_MANUAL_CHECKLIST_2026-08-25.md` (71 اختبارًا). سجّل AE/OS/النتيجة/الدليل في نفس الملف.

---

## 8) التراجع واستعادة البيانات

1. قبل إعادة بناء أي `_index.json` انسخه إلى `_index.json.bak-YYYYMMDD-HHMMSS`.
2. لا تستبدل preset JSON موجود أثناء الاستيراد — السياسة `-2` تجعل التراجع عملية بيانات وصفية.
3. عند فشل كتابة الـ index احتفظ بالقديم وكل الملفات السابقة؛ احذف فقط الملف المؤقت أو الملف الجديد غير المفهرس.
4. عند فشل التحقق، ارجع كود التطبيق مع الإبقاء على ملفات المستخدم ونسخه الاحتياطية.

---

## 9) ترتيب التسليم المقترح

1. **P0** أولاً (يغلق الخطر الخارجي) → 2. **P1-1/P1-2** (يمنع تشوه/وهم الإصدار) → 3. **P1-3/P1-4** (أداء ونظافة) → 4. **P2** (ديون) → 5. smoke كامل + UAT + changelog + tag `v1.0.2`.

*هذه الخطة تنسخ `ULTIMATE_FORENSIC_ANALYSIS` حرفيًا — كل سطر فيها قابل للتنفيذ والاختبار.*
