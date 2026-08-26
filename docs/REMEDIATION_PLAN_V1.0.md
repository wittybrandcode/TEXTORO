# TEXTORO — خطة الإصلاح الشاملة نحو الإصدار v1.0.0

| البند | القيمة |
|---|---|
| **التاريخ** | 2026-08-25 |
| **الإصدار المستهدف** | **v1.0.0** (إعادة تأسيس الترقيم — Re-baseline) |
| **المرجع التحليلي** | [ATOMIC_ANALYSIS_2026-08-25.md](ATOMIC_ANALYSIS_2026-08-25.md) |
| **الحالة** | 🟢 معتمدة للتنفيذ — Phase 0 منجَز جزئيًا اليوم |
| **قاعدة التنفيذ** | كل مهمة تمر عبر بوابة Smoke + UAT موثق قبل إغلاقها |

---

## 1) سياسة الإصدار المعتمدة (Versioning Policy)

### 1.1 القرار: إعادة تأسيس الترقيم على v1.0.0
كان الترقيم القديم متضخمًا ومتناقضًا (3.4.0 / 3.5.4 / 3.5.6 / 3.5.8 في نفس اللحظة). القرار: **الإصدار الرسمي القادم هو v1.0.0** ويُكتب دائمًا بصيغة Semver ثلاثية `MAJOR.MINOR.PATCH`.

### 1.2 قواعد رفع الأرقام
| نوع التغيير | الرقم | مثال |
|---|---|---|
| إصلاح عيب دون تغيير سلوك واجهة | PATCH → | 1.0.1 |
| ميزة جديدة أو تغيير سلوك متوافق | MINOR → | 1.1.0 |
| كسر توافق (بريسات قديمة، عقد HostBridge، بنية مجلدات) | MAJOR → | 2.0.0 |

### 1.3 المصدر الوحيد للحقيقة (Single Source of Truth)
- **`CSXS/manifest.xml` → `ExtensionBundleVersion`** = المرجع الرسمي.
- `js/core/Config.js → VERSION` يُقرأ منه شريط الواجهة ويجب أن يساوي الـ manifest عند كل commit.
- **ممنوع** كتابة رقم إصدار نصي في headers الملفات؛ إن وُجد فهو تعليقي فقط ولا يُحدَّث (سنعتمد حذفها تدريجيًا).

### 1.4 مواضع تم توحيدها إلى 1.0.0 (منفَّذة 2026-08-25 ✅)
| # | الملف | السطر | من → إلى |
|---|---|---|---|
| V-01 | `CSXS/manifest.xml` | 2 | ExtensionBundleVersion 3.5.8 → **1.0.0** |
| V-02 | `CSXS/manifest.xml` | 4 | Extension Version 3.5.8 → **1.0.0** |
| V-03 | `js/core/Config.js` | 11 | VERSION '3.5.8' → **'1.0.0'** |
| V-04 | `host/modules/Config.jsx` | 147 | VERSION "3.4.0" → **"1.0.0"** |
| V-05 | `index.html` | 14 | verBadge v3.5.8 → **v1.0.0** |
| V-06 | `index.html` | 1003 | aboutVersion v3.5.8 → **v1.0.0** |
| V-07 | `index.html` | 1064–1109 | cache-busters ?v=3.5.8.0 → **?v=1.0.0** (30 script) |
| V-08 | `js/main-entry.js` | 4 | @version 3.5.4 → **1.0.0** |
| V-09 | `js/core/HostBridge.js` | 4 | @version 3.5.6 → **1.0.0** |
| V-10 | `js/legacy/aliases.js` | 4 | @version 3.4.0 → **1.0.0** |
| V-11 | `js/panels/MotionPanel.js` | 4 | @version 3.4.0 → **1.0.0** |
| V-12 | `host/index.jsx` | 3,10 | v3.5.4 → **v1.0.0** |
| V-13 | `README.md` | badge + header | 3.5.4 → **1.0.0** |
| V-14 | `CHANGELOG.md` | أعلى الملف | إضافة قيد [1.0.0] re-baseline |

> الوثائق التاريخية في `docs/**` (تقارير سابقة بتواريخها) تبقى كما هي — لا تُعدَّل بأثر رجعي.

---

## 2) الحكامة وسير العمل (Governance & Workflow)

1. **Git**: تهيئة repo (`git init`) وbaseline commit فوري باسم `v1.0.0-baseline` قبل أي إصلاح وظيفي. فرع لكل مرحلة: `fix/p0-motion-multi`, `fix/p1-undo-groups`, ...
2. **بوابة كل مهمة (Gate)**:
   - [ ] `tools\smoke\run-smoke-checks.ps1` PASS
   - [ ] فحص ES5 الجديد PASS (T-03)
   - [ ] فحص Encoding الجديد PASS (T-04)
   - [ ] UAT يدوي داخل AE موثق في `docs/UAT_V1/` (سيناريو + نتيجة + تاريخ)
   - [ ] تحديث CHANGELOG + جدول التتبع (§5)
3. **قواعد كود ملزمة**:
   - host/** = ES3 صرف (لا `let/const`, لا arrow, لا template literals, لا `Object.keys/Array.isArray/map/filter/forEach` على Object).
   - كل قراءة/كتابة ملف: `file.encoding="UTF-8"` **قبل** `open()`.
   - كل دالة مضيف عامة تُرجع JSON `{"success":bool,...}` عبر `success()/error()` فقط.
   - نمط Undo الموحّد: علم `undoStarted`.
   - ممنوع innerHTML بمحتوى غير مهرّب (`Utils.escapeHtml`).
4. **إيقاع الدفعات**: PR واحد = مهمة واحدة من جدول §5. لا خلط إصلاح مع تنظيف.

---

## 3) المهام التفصيلية بالمراحل

> الأعراض والمراجع مستمدة حرفيًا من التحليل الذرّي. الأولوية: 🔴 حرجة / 🟠 عالية / 🟡 متوسطة / ⚪ منخفضة.

### المرحلة 0 — التأسيس (Foundation)

#### T-01 ✅ اعتماد v1.0.0 وتوحيد الإصدارات (V-01..V-14) — **منجَز 2026-08-25**
#### T-02 🔴 Git baseline
`git init` + `.gitignore` (`tools/tmp/`, `*.log`) + commit أول. **القبول:** `git log` يظهر baseline. *الجهد: 15د*
#### T-03 🟠 أداة فحص ES5 للمضيف
ملف جديد `tools/smoke/check-es5-host.js`: مسح `host/**/*.jsx` + `host/expressions/**/*.js` بحثًا عن `\blet\s|\bconst\s|=>|\`|\bObject\.keys\b|\bArray\.isArray\b|\.forEach\(|\.map\(|\.filter\(|\.includes\(|\.startsWith\(|\.endsWith\(` مع استثناءات موثقة. ربطه بـ `run-smoke-checks.ps1`. **القبول:** يلتقط حالات SogaManager الحالية (يفشل الآن، يمر بعد F-03). *الجهد: 1–2س*
#### T-04 🟠 أداة فحص الترميز
`tools/smoke/check-encoding.js`: التأكد أن كل ملفات host/ js/ css/ index.html UTF-8 سليمة (بدون bytes غير مشفرة)، وتنبيه على BOM داخل jsx. **القبول:** يكشف الملفات الثلاثة المشوهة (F-04). *الجهد: 1س*
#### T-05 🔴 توليد أيقونة PNG حقيقية
استبدال `assets/icon.png` (0 بايت) بأيقونة 23×23 و23×23@2x. **القبول:** ظهور الأيقونة في Window > Extensions. *الجهد: 30د*

---

### المرحلة 1 — إصلاحات P0 الحرجة

#### F-01 🔴 تفعيل Motion متعدد الطبقات
- **المشكلة:** `updateLayerCount()` (`js/panels/MotionPanel.js:744-759`) لا يُستدعى ⇒ الخيار المتعدد مخفي ⇒ `applyMotionMulti` غير قابل للوصول.
- **الخطوات:** (1) استدعاء `Motion.updateLayerCount()` عند تغير التحديد عبر اشتراك `TEXTORO.State.SelectionMonitor.onChange`. (2) اختبار إظهار `#motionMultiLayer` عند >1 طبقة. (3) تشغيل مسار `applyMotionMulti` مع stagger والتوثيق.
- **القبول:** تحديد 3 طبقات نص ⇒ يظهر الخيار ⇒ تطبيق Motion بتأخير متدرج يعمل. *الجهد: 1–2س* | **يعتمد على:** —

#### F-02 🔴 كسر حلقة المسح في Soga (Data Loss)
- **المشكلة:** التحديد المتعدد يملأ النموذج من Defaults (`js/panels/SogaPanel.js:177-193`) وأي تعديل يشحن كل الحقول ⇒ إعادة ضبط خصائص الطبقات.
- **الخطوات (الحل المعتمد — Deltas):** (1) تتبع snapshot لحالة النموذج وقت populate. (2) `applyChanges` يجمع **الفروقات فقط** ويرسل `{typewriter:{...changed}, box:{...}, motion:{...}}`. (3) في المضيف `setLayerEffectValuesMulti` (`SogaManager.jsx:475-528`) يتخطى المفاتيح الغائبة (تحقق موجود جزئيًا — توثيقه واختباره). 
- **القبول:** طبقتان بإعدادات مختلفة ⇒ تعديل حقل واحد ⇒ بقية القيم لا تتغير في AE. *الجهد: 3–4س*
- **بديل مؤقت إن ضاق الوقت:** تعطيل زر Apply في وضع multi مع رسالة توضيحية (يُغلق ثغرة فقدان البيانات فورًا).

#### F-03 🔴 إصلاح ES5 على محرك ExtendScript
- `SogaManager.jsx:37` (`Object.keys(...).length`) ⇒ عدّاد `for..in` أو polyfill مركزي في `Config.jsx` (يُفضَّل Polyfill مرة واحدة: `TX_objectKeys`, `TX_isArray`).
- `SogaManager.jsx:592,619,684` (`Array.isArray`) ⇒ استبدال بـ `TX_isArray`.
- **القبول:** T-03 PASS على كامل host/** + اختبار Soga: قراءة defaults من JSON + تعديل لون المؤشر/Stroke/Fill من Soga يعمل. *الجهد: 2س*

#### F-04 🔴 إصلاح الترميز العربي (Mojibake)
- إعادة كتابة النصوص العربية السليمة في: `LayerOperations.jsx` (كامل الملف :29,:64,:280,:367,:456,:575,:619,:639,:648...)، `MotionManager.jsx` (:25,:114,:194,:213,:380,:689,:785,:957,:1017,:1057...)، تعليقات `ControllerManager.jsx`.
- إصلاح ترتيب encoding: `ControllerManager.jsx:105-107,139-141,342-344,374-376` (encoding قبل open).
- إضافة encoding المفقود: `ExpressionLoader.jsx:102-104,161-163`، `PresetManager.jsx:592-594,609-611,909-952`.
- ملفات التعبيرات غير UTF-8: `box/v1.0/{size,position}.js`, `cursor/v1.0/blink.js`, `shared/{easing,timing}.js`, `motion/v1.0/*.js` ⇒ حفظها UTF-8.
- **القبول:** T-04 PASS + رسالة خطأ عربية سليمة تظهر في StatusBar عند "No Composition". *الجهد: 3–4س*

---

### المرحلة 2 — إصلاحات P1 العالية

#### F-05 🟠 توحيد نمط Undo Groups
إدخال علم `undoStarted` في: `BoxManager.jsx:76-79,99-102`، `LayerOperations.jsx:46-49,105-108,138-141,650-653`، `PresetManager.jsx:1527-1530` (النموذج المرجعي: `TypewriterManager.jsx:32-77`). **القبول:** إلغاء عملية فاشلة لا يقفل Undo group دخيل (اختبار: تطبيق Box بدون تحديد ثم Ctrl+Z لا يمسح شيء آخر). *الجهد: 2س*

#### F-06 🟠 ExpressionLoader: مسار + إصدارات + كتابة آمنة
1. إصلاح Method 2 في `getExpressionsPath` (`ExpressionLoader.jsx:44-53`): `<ext>/expressions/` ⇒ `<ext>/host/expressions/`.
2. منع هبوط الإصدار الصامت: عند غياب النسخة المطلوبة ⇒ رسالة نجاح مع `warning:"downgraded"` وليس تخزين الكاش تحت مفتاح مغلوط (`:154-157`).
3. نقل كتابة `_config.json` إلى مسار قابل للكتابة (userData: `Folder.userData`) مع fallback قراءة من مجلد التثبيت (`:340-344`).
4. فرز نسخ رقمي لا أبجدي (`:301-325`).
**القبول:** تبديل نسخة sourceText بين v1.0/v1.3 يعمل لمستخدم بدون admin وينعكس فورًا. *الجهد: 3س*

#### F-07 🟠 توحيد جداول رموز المؤشر (Cursor Glyphs)
مصدر واحد: `CONFIG.CURSOR_SHAPES` (`Config.jsx:186-194`). توليد الـ fallback المدمج (`ExpressionLoader.jsx:437,477`) وملفات التعبير (`typewriter/v1.{0,3}/sourceText.js:50-51`) من نفس الترتيب، أو توثيق الفرق وإزالة clamp 0..7 الزائد. **القبول:** نفس قيمة Cursor Type تعرض نفس الرمز مهما كان مصدر التعبير (ملف/مدمج). *الجهد: 2س*

#### F-08 🟠 سباق Bootstrap + حماية evalScript
في `HostBridge.js`: (1) طابور bootstrap واحد (Promise/flag queue) بدل انطلاقة متوازية من ~14 نداء (`:260-292`). (2) try/catch حول `cs.evalScript` في الثلاث مواضع (`:189,252,262`) مع رسالة "Panel opened outside After Effects". **القبول:** فتح index.html خارج AE لا يرمي استثناء غير ملتقط؛ الإقلاع يطلق `$.evalFile` مرة واحدة (قياس بعداد $.writeln). *الجهد: 2–3س*

#### F-09 🟠 إصلاح Ghost Box
`hasBox` (`BoxManager.jsx:108-160`): Method 2 يجب أن يتحقق من وجود Shape Layer فعلي مرتبط (ID في comment) وليس مجرد وجود Effect Controls. **القبول:** حذف طبقة الصندوق يدويًا ⇒ Soga يعرض "No Box" وتطبيق بريس Box ينشئ جديدًا بدل التعديل على شبح. *الجهد: 2س*

#### F-10 🟠 توحيد نظام تسمية الطبقات
اعتماد نظام Utilities اللاحقِ (suffix `tx_xxx`) وحيدًا؛ تحديث `_updateMotionFlag` (`MotionManager.jsx:463-513`) ليقرأ/يكتب نفس النظام؛ هجرة القراءة للـ prefixes القديمة (`TB_/TM_/M_`) للتوافق فقط. إصلاح `removeLayerFlag` ليتذكر الاسم الأصلي دائمًا (حفظه في marker/comment) (`Utilities.jsx:795-819`). **القبول:** طبقة Motion تظهر في `getAllTextoroLayers` وSoga يتعرف عليها. *الجهد: 3–4س*

#### F-11 🟠 إغلاق حقن HTML في Markers
`MarkersPanel.createRow` (`MarkersPanel.js:429-430`): تمرير اسم الطبقة عبر `Utils.escapeHtml` في الخلية المرئية أيضًا. **القبول:** طبقة باسم `<img src=x onerror=alert(1)>` تظهر كنص فقط. *الجهد: 15د*

#### F-12 🟠 إعادة مزامنة FPS
استدعاء `getCompInfo` (throttle ≥500ms) عند: تبديل التبويب، focus للوحة، وتغير التحديد، ثم تحديث `TEXTORO.Time.currentCompFPS` + خطوات المدخلات (`TimeUtils.js:209-217`). **القبول:** الانتقال بين كومب 25fps و60fps يغيّر سلوك أسهم s:f فورًا. *الجهد: 2س*

#### F-13 🟠 Marker Resolution بعد إعادة الترتيب اليدوي
`_resolveMarkerKey` (`LayerOperations.jsx:206-208`): رفض قبول key بزمن مختلف بزيادة عن التفاوت المسموح (0.01)؛ إرجاع خطأ واضح "marker moved — refresh". **القبول:** سحب marker يدويًا ثم offset من اللوحة ⇒ رسالة خطأ مفهومة لا تحريك marker الخطأ. *الجهد: 1س*

#### F-14 🟠 تقليص سطح الأمان
1. استبدال eval-based JSON polyfill (`Config.jsx:78-89`) بمنطق رفض صريح: إذا غاب JSON الأصلي ⇒ رفض استيراد بريسات خارجية برسالة بدل `eval`.
2. `createControllersFromRegistry` (`ControllerManager.jsx:169-218`): try/catch لكل عنصر مع تجميع أخطاء في النتيجة.
3. توثيق قائمة الدوال المفتوحة للاستدعاء بالاسم في `docs/UI_HOST_CONTRACT.md` (surface allowlist).
**القبول:** `.txpack` تالف يُرفض برسالة نظيفة؛ بريس controller تالف لا يجهض العملية كلها. *الجهد: 2–3س*

---

### المرحلة 3 — التنظيف P2 (Dead Code & Duplication)

#### C-01 🟡 حذف الملفات/الأكواد الميتة (دفعة واحدة موثقة)
`js/ui/SpectrumStepper.js` (غير محمّل) • Tooltip system أو تفعيله رسميًا (`Tooltip.js` — قرار: حذف، لأن HTML يستخدم title فقط) • `HostBridge.runAsync/getSystemInfo` (`HostBridge.js:295-305,312-331`) • `getLayerText` في `Utilities.jsx:511-518` (المتجاوز) • `_mapOptsToControllerNames` (`MotionManager.jsx:118-175`) • `_updateTypewriterMarkers` (`PresetManager.jsx:1623-1709`) • Motion V1 expressions + legacy MOTION_PRESETS (`MotionManager.jsx:82-93,525-593`) • `buildMotionExpression/loadSharedExpression/loadMotionExpression` غير المستخدمة (`ControllerManager.jsx:330-407`) • مفاتيح Config الميتة (`Config.js:32,38,41`) • span `sogaLayerType` (`index.html:359`) • `TITOUF copy.json`. **القبول:** smoke PASS + UAT سريع لكل تبويب. *الجهد: 3س*

#### C-02 🟡 سحب التكرارات إلى Utils
hexToRgb/rgbToHex (`SogaPanel.js:571-586`) • getTimeNum (`MultiLinesPanel.js:16-42`) • setDirection + منطق cursorBefore (`MultiLinesPanel.js:206-220`) • setValue/setChecked (`MotionPanel.js:774-782`) • confirmDelete ⇒ Modals.showConfirm واستبدال native `confirm()` في `MarkersOps.js:138`. *الجهد: 3س*

#### C-03 🟡 ربط الميزات اليتمة
(1) `createNewText` في ContextMenu (`ContextMenu.js:110`) ⇒ استدعاء `createNewTextLayer` الموجود بالمضيف. (2) جمع `numPathOffset` في `BoxPanel.getValues()` (`BoxPanel.js:53-104` + `index.html:299`). (3) دعم `options.placeholder` في `Modals.showInput` (`Modals.js:60-85`). *الجهد: 2س*

#### C-04 🟡 تقاعد aliases.js على دفعات
كل دفعة: grep استخدام كل global ⇒ نقل المستخدم إلى namespace ⇒ حذف. البدء بالمكررة الضارة (`refreshMarkersTable` إلخ). **الهدف النهائي:** حذف `js/legacy/aliases.js` كاملًا في 1.1.0. *الجهد: 4–6س موزعة*

#### C-05 🟡 توحيد مصادر افتراضيات Box
مصدر واحد `BOX_CONFIG.DEFAULTS` (`Config.jsx:212-237`) وتغذية `BoxManager.jsx:192-227` و`SogaManager.jsx:79-87` منه. *الجهد: 1س*

#### C-06 🟡 خفض logging الحلقات الساخنة
تجميع `$.writeln` خلف `CONFIG.DEBUG` في BoxManager/SogaManager/ControllerManager/PresetManager. *الجهد: 1–2س*

#### C-07 🟡 أداء المسوحات المتكررة
Cache لمرة واحدة لكل عملية (Map layerIndex→effects) في: `hasBox` loops، `_read/_writeMotionValues` (`SogaManager.jsx:261-310,420-465`)، `getToroValuesForPreset` (`PresetManager.jsx:1308-1408`). هدف: تطبيق TORO على 10 طبقات < ثانيتين. *الجهد: 4–6س*

#### C-08 🟡 حفظ Motion Presets المخصصة
إغلاق بند TODO المفتوح: زر الحفظ موجود في Soga (`SogaPanel.js:520-541`) — استكمال المسار إلى PresetManager category=motion-full. *الجهد: 3س*

---

### المرحلة 4 — تجربة الاستخدام والصلابة

#### E-01 🟡 إظهار أخطاء المضيف بدل طيّها
`PresetsPanel.load` (`PresetsPanel.js:186-209`) و`SogaPanel.refresh` (`SogaPanel.js:121-127`) و`TypewriterPanel.apply` (`TypewriterPanel.js:258-260`): عرض StatusBar.error مع تفاصel عند فشل النداء. *الجهد: 1–2س*
#### E-02 🟡 i18n خفيف
جدول `TEXTORO.I18N = {ar:{},en:{}}` للرسائل المشتركة ('Ready', 'No Selection', عناوين ContextMenu) مع لغة تتبع واجهة AE. *الجهد: 3س*
#### E-03 🟡 إدارة State
(1) دمج favorites في StateManager. (2) زر Reset Settings يمسح localStorage فعليًا (بجانب Clear Cache الخاص بكاش المضيف). (3) مزامنة `lastSelectedLayer` المزدوج (`SelectionMonitor.js:15 vs 162-171`). *الجهد: 2س*
#### E-04 🟡 Import/Export يشمل motion/toro
رفع القيد type/box/mix في `ImportExport.jsx:108-118,151,199-214` + تمرير defaultName لـ saveDialog (`:336-337`). *الجهد: 2س*
#### E-05 ⚪ منع تصادم أسماء البريسات العربية
حراسة sanitize (`PresetManager.jsx:673,805`): رفض الاسم إذا كان الملف الوجهة موجودًا باسم مختلف ⇒ رسالة "exists"، + حظر reserved names (CON/NUL...). *الجهد: 1س*
#### E-06 ⚪ RTL polish
عكس اتجاه أسهم NumberSpinners عند dir=rtl مستقبلًا + استعادة قيمة cursorBefore الأصلية عند العودة LTR (`TypewriterPanel.js:86-93`). *الجهد: 1–2س*

---

### المرحلة 5 — ميزات جديدة (بعد إغلاق P0/P1 فقط)
| ID | الميزة | المصدر | التقدير |
|---|---|---|---|
| N-01 | Easing Curves Preview | TODO.md | 4–6س |
| N-02 | Text Effects (Blur/Glow/Shadow) | TODO.md | 6–8س |
| N-03 | Batch Processing / Timeline Preview | TODO.md | دراسة أولًا |

---

## 4) تسلسل التنفيذ المقترح (Critical Path)

```
T-02 (git) ─┬─> T-03+T-04 (أدوات الفحص) ─┬─> F-04 (ترميز) ─┐
T-05 (أيقونة)┘                            ├─> F-03 (ES5) ───┤
                                          │                 ├──> F-01, F-02 (متوازيان)
                                          └──────────────────┘            │
F-05..F-14 (P1: يمكن التفرق، الأولوية F-06, F-08, F-10)                   │
                                        C-01..C-08 (بعد استقرار P1) <─────┘
                                              │
                                     E-01..E-06 ──> 🏁 RELEASE GATE v1.0.0
```

**تعريف الإنجاز لإصدار v1.0.0:** إغلاق كل مهام Phase 0–2 + C-01/C-02/C-03/E-01 + اجتياز بوابات §6.

---

## 5) جدول التتبع الرئيسي (Master Tracker)

| ID | المهمة | الأولوية | الجهد | الحالة | التاريخ |
|---|---|---|---|---|---|
| V-01..14 | توحيد الإصدار 1.0.0 | 🔴 | 30د | ✅ منجَز | 2026-08-25 |
| T-01 | (=V) اعتماد السياسة | 🔴 | — | ✅ | 2026-08-25 |
| T-02 | Git baseline | 🔴 | 15د | ⛔ محجوب: Git غير مثبّت على الجهاز | |
| T-03 | فاحص ES5 (`check-es5-host.js`) + فاحص اتساق الإصدار | 🟠 | 1–2س | ✅ منجَز — PASS | 2026-08-25 |
| T-04 | فاحص Encoding (`check-encoding.js`) وضع warn حتى F-04 | 🟠 | 1س | ✅ منجَز (warn-mode) — كشف 14 ملفًا مشوّهًا | 2026-08-25 |
| T-05 | أيقونة PNG (`tools/gen-icon.js`) | 🔴 | 30د | ✅ منجَز — 129 بايت PNG سليم | 2026-08-25 |
| F-01 | Motion Multi-layer (ربط updateLayerCount) | 🔴 | 1–2س | ✅ منجَز — TabManager + SelectionMonitor | 2026-08-25 |
| F-02 | Soga Deltas | 🔴 | 3–4س | ✅ منجَز — captureFormSnapshot + pruneToChangedOnly + إخفاء Motion في Multi | 2026-08-25 |
| F-03 | ES5 fixes (txKeyCount/txIsArray/txTrim) | 🔴 | 2س | ✅ منجَز — es5-check PASS | 2026-08-25 |
| F-06..F-10, F-13, F-14 | بقية P1 | 🟠 | ~15س | ⬜ قائمة للجولة القادمة | |
| F-04 | الترميز العربي | 🔴 | 3–4س | ✅ منجَز — إصلاح آلي لـ **14 ملفًا** عبر `tools/fix-mojibake.js` + البوابة صارت strict | 2026-08-25 | |
| F-05 | Undo Groups | 🟠 | 2س | ✅ منجَز — BoxManager ×2 + LayerOperations ×4 + PresetManager applyPreset (نمط undoStarted) | 2026-08-25 |
| F-06 | ExpressionLoader | 🟠 | 3س | ✅ منجَز — مسار Method2 + تحذير الهبوط + كاش بمفتاح فعلي + كتابة userData + فرز رقمي + UTF-8 | 2026-08-25 |
| F-07 | Cursor Glyphs | 🟠 | 2س | ✅ منجَز — 3 مصادر موحدة على CONFIG.CURSOR_SHAPES (7 رموز، clamp 0..6) | 2026-08-25 |
| F-08 | Bootstrap race | 🟠 | 2–3س | ✅ منجَز — طابور single-flight + safeRun لكل evalScript | 2026-08-25 |
| F-09 | Ghost Box | 🟠 | 2س | ✅ منجَز — يتطلب Shape Layer فعلياً (parent أو baseId_Box) | 2026-08-25 |
| F-10 | Layer Naming | 🟠 | 3–4س | ⬜ مؤجلة لـ 1.0.1 (تغيير سلوكي واسع يحتاج UAT مستقل) | |
| F-11 | XSS Markers | 🟠 | 15د | ✅ منجَز — escapeHtml على الخلية المرئية | 2026-08-25 |
| F-12 | FPS Sync | 🟠 | 2س | ✅ منجَز — syncCompFPS بـ throttle 500ms عند تغير التحديد/التبويب | 2026-08-25 |
| F-13 | Marker Resolve | 🟠 | 1س | ✅ منجَز — تطابق زمني صارم، إلغاء مرشح النوع فقط | 2026-08-25 |
| F-14 | Security surface | 🟠 | 2–3س | ✅ منجَز جزئياً — عزل أخطاء controllers فردياً؛ eval-polyfill وallowlist مؤجلة لـ 1.0.1 | 2026-08-25 |
| C-01 | Dead code purge | 🟡 | 3س | ⬜ جولة التنظيف القادمة | |
| C-02 | Dedup helpers | 🟡 | 3س | ⬜ جولة التنظيف القادمة | |
| C-03 | Orphan features | 🟡 | 2س | ✅ منجَز — createNewTextLayer مربوط + numPathOffset يُرسل + placeholder مدعوم | 2026-08-25 |
| C-04 | aliases retirement | 🟡 | 4–6س | ⬜ | |
| C-05 | Box defaults SSOT | 🟡 | 1س | ⬜ | |
| C-06 | Logging gates | 🟡 | 1–2س | ⬜ | |
| C-07 | Scan perf | 🟡 | 4–6س | ⬜ | |
| C-08 | Save Motion presets | 🟡 | 3س | ⬜ | |
| E-01 | Error surfacing | 🟡 | 1–2س | ✅ منجَز — PresetsPanel يعرض فشل الفئات في الشريط والشبكة | 2026-08-25 |
| H-1 | رموز الواجهة المشوهة + قائمة المؤشر | 🔴 | — | ✅ منجَز — نطاق إصلاح موسّع (7 ملفات) + تصحيح dropdown إلى الجدول الموحد | 2026-08-25 |
| H-2 | ابتلاع markers بنفس اللحظة | 🔴 | — | ✅ منجَز — GAP دنيا 0.02s في _extractTiming | 2026-08-25 |
| H-3 | Motion↔Markers: مطابقة صارمة + لا هبوط صامت | 🔴 | — | ✅ منجَز — _getMarkerTiming + رسالة خطأ توضيحية | 2026-08-25 |
| N-04 | **Live Text v1.4** (هدف Mogrt) | 🟠 | 5–7س | ✅ منجَز — تعبير v1.4 + كنترول Live Text + وعي Soga/Type/updateLayerText + embedded + _config→v1.4 | 2026-08-26 |
| F-14b | JSON polyfill بلا eval | 🟠 | 30د | ✅ منجَز (v2 بعد انحدار حقيقي) — مُفسّر recursive-descent كامل + بوابة اختبار #6 تمنع التكرار | 2026-08-26 |
| E-04 | Import/Export كل الفئات | 🟡 | 2س | ✅ منجَز — +motion/motion-full/toro + defaultName للـ dialog | 2026-08-26 |
| E-05 | حراسة تصادم أسماء البريسات | ⚪ | 1س | ✅ منجَز — رفض overwrite عند اختلاف id | 2026-08-26 |
| C-05 | Box defaults SSOT | 🟡 | 1س | ✅ منجَز — BOX_CONFIG.DEFAULTS مصدراً وحيداً لـ BoxManager+Soga | 2026-08-26 |
| C-06 | تقييد لوجات الحلقات | 🟡 | 1–2س | ✅ منجَز جزئياً — أسخن 10 مواضع خلف CONFIG.DEBUG | 2026-08-26 |
| C-02 | Dedup helpers | 🟡 | 3س | ✅ جزئي — محولات الألوان في SogaPanel نظّفت؛ البقية لجولة التنظيف | 2026-08-26 |

> **ملاحظة شكاوى الحقل المتبقية:** "Presets/Tأثيرات مخربة" — الأرجح كانت أثرًا لـ H-1/H-2/H-3 (رموز مؤشر خاطئة + markers مبتلعة + توقيت صامت). إن استمرت حالة فشل محددة بعد UAT الجديد، يلزم اسم البريسة المتأثرة لتحقيق أعمق في مسارها.
| E-02 | i18n | 🟡 | 3س | ⬜ | |
| E-03 | State mgmt | 🟡 | 2س | ⬜ | |
| E-04 | Import/Export scope | 🟡 | 2س | ⬜ | |
| E-05 | Preset name guards | ⚪ | 1س | ⬜ | |
| E-06 | RTL polish | ⚪ | 1–2س | ⬜ | |

> **إجمالي الجهد حتى بوابة v1.0.0:** ≈ 45–60 ساعة عمل (Phase 0–2 + C-01..03 + E-01).

---

## 6) بوابات إصدار v1.0.0 (Release Gates)

يجب اجتيازها جميعًا قبل تثبيت v1.0.0:
1. ☐ Smoke الثلاثية PASS (syntax + contract + es5 + encoding).
2. ☐ كل مهام F-xx مغلقة مع UAT موثق.
3. ☐ UAT شامل (§7) بنتائج Pass في `docs/UAT_V1/`.
4. ☐ `manifest.xml` = `Config.js.VERSION` = `Config.jsx.VERSION` = 1.0.0 (سكربت تحقق ضمن smoke: `check-version-consistency.js` — يُبنى ضمن T-03).
5. ☐ CHANGELOG مدخل [1.0.0] نهائي + README محدث.
6. ☐ Tag git: `v1.0.0`.

---

## 7) مصفوفة UAT اليدوية داخل AE (لكل إصلاح رئيسي)

| السيناريو | التبويب | الخطوات | النتيجة المتوقعة | يغطي |
|---|---|---|---|---|
| U-01 | Type | طبقة نص EN + تطبيق Typewriter | كتابة حرف بحرف + مؤشر | انحدار عام |
| U-02 | Type | طبقة نص AR + تطبيق | RTL سليم + اتصال حروف | F-04 |
| U-03 | Type | نص فيه "0" وقيم صفرية في الحقول | لا تُتجاهل القيم الصفرية | انحدار |
| U-04 | Box | تطبيق + تعديل من Soga + حذف الصندوق ثم Soga refresh | No Box وليس شبحًا | F-09 |
| U-05 | Motion | 3 طبقات ⇒ تطبيق مع Stagger | تأخير متدرج يعمل | F-01 |
| U-06 | Soga | طبقتان مختلفتا الإعدادات ⇒ تعديل حقل واحد | بقية القيم محفوظة | F-02 |
| U-07 | Soga | تعديل لون المؤشر/Stroke/Fill | يُطبق فورًا | F-03 |
| U-08 | Settings | تبديل نسخة sourceText بدون admin | يعمل ويُحفظ في userData | F-06 |
| U-09 | Markers | offset/stagger/align/delete | يعمل + أسماء عربية سليمة | F-04, F-13 |
| U-10 | Presets | تطبيق TORO على 10 طبقات | < 2s وبدون partial state | C-07, F-14 |
| U-11 | عام | Ctrl+Z بعد عملية فاشلة | لا يقفز undo group دخيل | F-05 |
| U-12 | عام | فتح اللوحة على كومب 60fps ثم 25fps | خطوات s:f تتكيف | F-12 |
| U-13 | Arena | استيراد .txpack تالف | رسالة رفض نظيفة | F-14 |
| U-14 | عام | طبقة اسمها `<img onerror>` | تظهر كنص في Markers | F-11 |

---

## 8) سجل المخاطر والتراجع

| الخطر | الاحتمال | الأثر | التخفيف |
|---|---|---|---|
| تعديل الترميز يفسد منطقًا يعتمد bytes | متوسط | عالي | T-04 قبل F-04 + diff مراجعة سطرًا بسطر |
| توحيد التسمية (F-10) يكسر مشاريع قديمة | متوسط | عالي | قراءة التوافقية للـ prefixes القديمة، كتابة الجديد فقط |
| Deltas في Soga (F-02) تخفي حقول جديدة لاحقًا | منخفض | عالي | اختبار وحدة ذهني موثق U-06 + snapshot tests يدوية |
| حذف dead code (C-01) يمس مُستخدمًا خفيًا | منخفض | متوسط | grep شامل قبل كل حذف + smoke + UAT سريع |
| كتابة userData (F-06) تختلف بين Windows versions | منخفض | متوسط | fallback للمسار القديم عند القراءة |

**التراجع:** كل مهمة على فرع git مستقل؛ التراجع = `git revert` للـ merge الخاص بها. لا يُلمس مجلد التثبيت إلا عبر النسخة العاملة.

---

## 9) قواعد التوثيق المستمرة
- كل إغلاق مهمة: سطر في CHANGELOG تحت قسم [Unreleased] حتى بوابة الإصدار.
- هذا الملف هو المرجع الحي — تحديث عمود الحالة في §5 عند كل إغلاق.
- تقارير UAT: ملف واحد لكل جلسة في `docs/UAT_V1/YYYY-MM-DD_session.md`.

---
*معتمدة: 2026-08-25 — TEXTORO v1.0.0 Remediation Plan*
