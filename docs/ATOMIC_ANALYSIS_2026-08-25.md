# TEXTORO v3.5.8 — التحليل الذرّي الشامل (Atomic Analysis)

| البند | القيمة |
|---|---|
| **التاريخ** | 2026-08-25 |
| **الإصدار المُحلَّل** | 3.5.8 (manifest + cache-busters) |
| **نوع التحليل** | Static Analysis كامل للواجهة (js/) والمضيف (host/) والعقد بينهما |
| **نتيجة Smoke الحالية** | ✅ PASS (Syntax: 31 ملف، Contract: 38 نداء UI ↔ 220 دالة Host) |
| **الحكم العام** | البنية سليمة معماريًا والعقد UI↔Host مكتمل — لكن توجد **عيوب وظيفية حقيقية** (Motion متعدد الطبقات معطّل، Soga يمسح الإعدادات عند التحديد المتعدد، أخطاء ترميز عربية ظاهرة للمستخدم، تسريبات Undo Groups، كود ES5 لا يعمل على محرك ExtendScript) |

---

## 0) ملخص تنفيذي

TEXTORO إضافة CEP لـ After Effects بنية معيارية ناضجة: 12 وحدة مضيف (ExtendScript ES3)، ~30 وحدة واجهة (JS)، نظام بريسات JSON، ونظام تعبيرات (Expressions) بإصدارات. الفحص الآلي الحالي (Smoke) يجتاز لأنه يفحص **الصياغة وعقد الاستدعاء فقط** — أما التحليل العميق فقد كشف:

- 🔴 **4 أعطال وظيفية P0** (ميزات معطّلة فعليًا أو تدمج بيانات المستخدم).
- 🟠 **~14 عيبًا عالي الخطورة P1** (ترميز، Undo، ES5، مسارات، تضارب مصادر الحقيقة).
- 🟡 **~20 عيبًا متوسطًا** (كود ميت، تكرار، أداء، UX).
- ⚪ **~15 ملاحظة تحسينية**.

> **قاعدة ذهبية للتطوير القادم:** أي تعديل يجب أن يحافظ على عقد `__TX_OK__/__TX_ERR__` في `HostBridge.js` ويُشغّل `tools\smoke\run-smoke-checks.ps1` قبل التسليم.

---

## 1) خريطة البنية (Architecture Map)

### 1.1 طبقة الواجهة (CEP / Chromium)

```
index.html
 ├─ js/CSInterface.js            ← بدون ?v= cache-buster (وحده!)
 ├─ js/core/*                    ← Config, Utils, ErrorHandler, HostBridge (نقطة الدخول الوحيدة للمضيف)
 ├─ js/state/*                   ← StateManager (localStorage), SelectionMonitor (poll 300ms), Defaults
 ├─ js/time/TimeUtils.js         ← نظام s:f (ثوانٍ.فريمات)
 ├─ js/ui/*                      ← StatusBar, TabManager, ActionBar, Modals, ContextMenu, Tooltip...
 ├─ js/operations/*              ← MarkersOps, LayersOps, PresetsOps (استدعاءات مضيف مجمعة)
 ├─ js/panels/*                  ← 8 لوحات: Typewriter, Box, Soga, Markers, Presets, Motion, Settings, MultiLines
 ├─ js/legacy/aliases.js         ← ~60 global قديم (يُحمَّل أخيرًا و"يفوز" بالتصادمات)
 └─ js/main-entry.js             ← initApp(): DOMContentLoaded → HostBridge.init → UI → Panels
 ❌ js/ui/SpectrumStepper.js      ← موجود على القرص ولا يُحمَّل إطلاقًا (ملف ميت)
```

### 1.2 طبقة المضيف (ExtendScript)

```
host/index.jsx        ← #include بترتيب ثابت (Config → Utilities → Controller → ExprLoader → ...)
                        + ScriptPath في manifest.xml:22 (يتحمّل تلقائيًا أيضًا)
host/modules/*.jsx    ← 12 وحدة، كلها globals مسطّحة على $.global (لا namespace object)
host/expressions/**   ← 15 ملف تعبير بإصدارات (v1.0/v1.3) + fallbacks مدمجة
config/**             ← defaults.json + controllers/*.json + presets/**/*.json (~30 بريس)
```

### 1.3 عقد الاتصال (Contract)

`HostBridge.run(fn,args)` → يبني IIFE يبحث عن `$.global[fn] || this[fn] || eval(fn)` بوسيط JSON واحد → يغلّف النتيجة بـ `__TX_OK__`/`__TX_ERR__` → Bootstrap خامل يعيد `$.evalFile(host/index.jsx)` عند فشل أول نداء.
دوال المضيف تُرجع JSON عبر `success()/error()` (`Utilities.jsx:33-46`).

---

## 2) العيوب الحرجة P0 (تُصلح فورًا قبل أي تطوير جديد)

### P0-1: Motion متعدد الطبقات معطّل بالكامل
- `MotionPanel.updateLayerCount()` (`js/panels/MotionPanel.js:744-759`) **لا يستدعيها أحد** ⇒ `layerCount = 0` للأبد ⇒ خيار `#motionMultiLayer` لا يظهر أبدًا ⇒ فرع `applyMotionMulti` (`:587-595`) **غير قابل للوصول**. واجهة الـ Stagger (`index.html:913-923`) ميتة.
- **الإصلاح:** استدعاء `updateLayerCount()` داخل مراقبة التحديد (اشتراك `SelectionMonitor`) أو في `MotionPanel.refresh()`.

### P0-2: Soga يمسح إعدادات الطبقات عند التحديد المتعدد (Data Loss)
- عند تحديد N طبقات، `SogaPanel.showMulti` يملأ النموذج من `TEXTORO.Defaults` وليس من قيم الطبقات (`js/panels/SogaPanel.js:177-193`). أي تعديل حقل واحد يشحن **كل الحقول المرئية** (بالقيم الافتراضية) إلى `setLayerEffectValuesMulti` بعد debounce 200ms ⇒ **إعادة ضبط كل الخصائص الأخرى على كل الطبقات المحددة**.
- **الإصلاح (خياران):** (أ) قراءة القيم المشتركة من الطبقات أولًا (نداء `getLayerEffectValues` لكل طبقة/طبقة تمثيلية)، أو (ب) إرسال **الفروقات فقط** (delta diff) في `applyChanges`.

### P0-3: أخطاء ES5 تكسر ميزات على محرك ExtendScript (ES3)
- `Object.keys(...).length` (`host/modules/SogaManager.jsx:37`) — يرمي استثناء يُبتلع داخليًا ⇒ نظام Defaults المعتمد على JSON **ميت دوماً** ويسقط للافتراضيات الصلبة.
- `Array.isArray(...)` ×3 (`SogaManager.jsx:592,619,684`) ⇒ **فشل صامت في كتابة/إنشاء الألوان** (المؤشر، Stroke، Fill) من Soga على المحركات غير V8.
- **الإصلاح:** polyfill موحّد في `Config.jsx` أو استبدال بفحوصات ES3 (`instanceof Array`, عدّاد `for...in`).

### P0-4: أيقونة اللوحة فارغة + ملفات صفرية
- `assets/icon.png` = **0 بايت** بينما `CSXS/manifest.xml:37` يشير إليه ⇒ أيقونة مكسورة في قائمة Window > Extensions. كما أن `docs/TECHNICAL_ANALYSIS.md` فارغ تمامًا (مُشار إليه من README).
- **الإصلاح:** توليد أيقونة PNG صحيحة (23×23 عادي + @2x اختياري).

---

## 3) عيوب عالية الخطورة P1

### 3.1 ترميز النصوص العربية (Mojibake) — أضرار دائمة في الكود
| الملف | الحالة | الأثر |
|---|---|---|
| `host/modules/LayerOperations.jsx` | **الملف كله** مشوّه (UTF-8 قُرئ CP1252 ثم حُفظ UTF-8) | رسائل خطأ المستخدم تظهر كـ `Ø§ÙØªØ­ Composition Ø£ÙˆÙ„Ø§Ù‹` بدل "افتح Composition أولاً" (:29,:64,:280,:367...) |
| `host/modules/MotionManager.jsx` | نفس الضرر | رسائل مستخدم مشوهة (:194,:213,:785,:957...) |
| `host/modules/ControllerManager.jsx` | تعليقات مشوهة | تلوث الكود |
| `expressions/{box,cursor,motion,shared}/*.js` | ليست UTF-8 سليمة | التعليقات تُحقن داخل خصائص AE حسب Codepage الجهاز |

- **خلل نظامي إضافي:** بعض المواضع تضبط `file.encoding="UTF-8"` **بعد** `open("r")` (غير فعّالة): `ControllerManager.jsx:105-107,139-141,342-344,374-376`. ومواضع بلا encoding نهائيًا: `ExpressionLoader.jsx:102-104,161-163`، `PresetManager.jsx:592-594,609-611,909-952`.
- **الإصلاح:** إعادة كتابة الملفات الثلاثة المشوهة بنص عربي سليم (UTF-8 بلا BOM)، وتوحيد نمط القراءة: `f.encoding="UTF-8"; f.open("r")`.

### 3.2 تسريب Undo Groups (تلف تاريخ التراجع في AE)
نمط `catch { app.endUndoGroup() }` بغير شرط يغلق مجموعة لم تُفتح:
- `BoxManager.jsx:76-79,99-102`
- `LayerOperations.jsx:46-49,105-108,138-141,650-653`
- `PresetManager.jsx:1527-1530`

النمط الصحيح موجود elsewhere (علامة `undoStarted`): `TypewriterManager.jsx:32-77`. **الإصلاح:** توحيد النمط الصحيح في الجميع.

### 3.3 ExpressionLoader: مسار مكسور وسقوط صامت بالإصدار
- Method 2 في `getExpressionsPath` يحسب `<ext>/expressions/` بدل `<ext>/host/expressions/` (`ExpressionLoader.jsx:44-53`) — يفشل دائمًا.
- غياب نسخة مطلوبة ⇒ هبوط صامت إلى v1.0 **ويُخزَّن تحت مفتاح النسخة الأصلية** (`:154-157`) — كاش مغلوط الدلالة.
- `setActiveVersion` يكتب `_config.json` داخل Program Files ⇒ يفشل بدون صلاحيات admin بصمت (`:340-344`).
- فرز الإصدارات أبجدي: `"v1.10" < "v1.2"` (`:301-325`).
- **تناقض جداول المؤشر:** `CONFIG.CURSOR_SHAPES` (7 رموز، `Config.jsx:186-194`) ≠ ملفات التعبير (clamp 0..6) ≠ الـ Fallback المدمج (8 رموز، clamp 0..7، `ExpressionLoader.jsx:437,477`) — نفس رقم المؤشر يعرض رموزًا مختلفة حسب مصدر التعبير.

### 3.4 FPS جامد (Stale) — يفسد كل حسابات s:f
- يُقرأ مرة واحدة عند الإقلاع (`main-entry.js:63-71`)؛ آلية إعادة المزامنة الوحيدة `updateTimeInputSteps()` (`TimeUtils.js:209-217`) **لا تُستدعى أبدًا**، ولا يوجد listener لأحداث تغيير الكومب ⇒ العمل على كومب 60fps يحسب بـ 25fps.

### 3.5 سباق Bootstrap متزامن عند الإقلاع
- ~14 نداء أولًا متزامن (compInfo + selection poll + 5 فئات بريسات + motion + 3 نسخ تعبيرات...) كلٌّ منها قد يطلق `bootstrapHost` الخاص به ⇒ إعادة تقييم كامل المضيف عدة مرات (`HostBridge.js:260-292`). لا طابور ولا dedup.
- `cs.evalScript` غير محاط بـ try/catch (`HostBridge.js:189,252,262`) — افتح اللوحة خارج AE = استثناء غير ملتقط.

### 3.6 كشف "الصندوق الشبح" (Ghost Box)
- `hasBox` يعتبر الصندوق موجودًا مجرد وجود Effect Controls باسم "Padding Left"+"Fill Opacity" حتى لو حُذف شيب اللAYER (`BoxManager.jsx:138-141`) ⇒ Soga والبريسات تتعامل مع صندوق غير موجود.

### 3.7 ازدواج أنظمة تسمية الطبقات (ID Flags)
- نظام Utilities لاحقي `tx_xxx` (`Utilities.jsx:718-819`) مقابل نظام MotionManager **سابقي** `TB_/TM_/M_` (`MotionManager.jsx:463-513`) الذي لا تفهمه `parseLayerName` ⇒ طبقات Motion تصبح "ليست TEXTORO" في `getAllTextoroLayers/getLayerStatus`. كذلك `removeLayerFlag` يفقد الاسم الأصلي إن لم يمرَّر (`Utilities.jsx:795-819`).
- `_resolveMarkerKey` يقبل أي marker من نفس النوع مهما اختلف الزمن بعد إعادة ترتيب يدوي (`LayerOperations.jsx:206-208`).

### 3.8 حقن HTML في جدول Markers
- اسم الطبقة يُدرج في innerHTML غير مهرّب بينما الـ title مهرّب (`MarkersPanel.js:429-430`) — طبقة باسم `<img src=x onerror=…>` تنفّذ في اللوحة. استخدام `Utils.escapeHtml` الموجود أصلًا.

### 3.9 أمان — مخاطر متبقية (منخفضة الاستغلال لكنها حقيقية)
- `JSON.parse` polyfill مبني على `eval("(" + s + ")")` (`Config.jsx:78-89`) — يمرّ على محتوى `.txpreset/.txpack` الخارجية (regex json2 يخفف الخطورة).
- `importPresetFromPath(opts.filePath)` و`setPresetsPathSetting(opts.path)` يقبلان أي مسار، وجسر الاسم يسمح باستدعاء أي global بوسيط واحد (`ImportExport.jsx:368-411`, `PresetManager.jsx:1004-1040`).
- `createControllersFromRegistry` بلا try/catch لكل عنصر ⇒ بريس تالف يجهض العملية كاملة ويترك حالًا جزئيًا (`ControllerManager.jsx:169-218`).

---

## 4) عيوب متوسطة P2 (أداء، تكرار، كود ميت، UX)

### 4.1 كود ميت بحجم مؤثر (يجب حذفه/تفعيله)
| العنصر | الموقع | القرار المقترح |
|---|---|---|
| `SpectrumStepper.js` كامل | لا يُحمَّل (`index.html:1064-1109`) | حذف أو تفعيل بعد حل ازدواج الربط مع NumberSpinners |
| نظام Tooltip كامل | `Tooltip.js` يستمع `[data-tip]` — **صفر** استخدام في HTML؛ ES6 outlier في قاعدة ES5 | حذف أو اعتماده فعليًا |
| `HostBridge.runAsync` + `getSystemInfo` | `HostBridge.js:295-305,312-331` | حذف |
| `createNewText()` undefined | `ContextMenu.js:110` — عنصر قائمة لا يعمل؛ المضيف يوفر `createNewTextLayer` (`LayerOperations.jsx:636`) بلا جسر | ربط أو حذف العنصر |
| `numPathOffset` لا يُجمَع | `index.html:299` خارج `BoxPanel.getValues()` | إضافته للـ payload |
| `sogaLayerType` span | `index.html:359` بلا مراجع JS | حذف |
| `placeholder` option | `SogaPanel.js:525` يمررها و`Modals.showInput` يتجاهلها (`Modals.js:60-85`) | دعمها |
| `getLayerText` مكرر ومتجاوز | `Utilities.jsx:511` يُطغى عليه `TypewriterManager.jsx:113` | حذف نسخة Utilities |
| `_mapOptsToControllerNames`, `_updateTypewriterMarkers`, Motion V1 exprs, `buildMotionExpression` | `MotionManager.jsx:118-175,525-593`; `PresetManager.jsx:1623-1709`; `ControllerManager.jsx:330-407` | حذف |
| طبقة aliases (~60 global) | `js/legacy/aliases.js` | خطة تقاعد تدريجية |
| مفاتيح Config ميتة `MARKER_TYPES/PRESET_HUB_CATEGORIES/MOTION_SIMPLE_CATEGORY` | `Config.js:32,38,41` | حذف |

### 4.2 ازدواج منطق (نفس الكود في مكانين)
- `hexToRgb/rgbToHex`: `Utils.js:13-33` ↔ `SogaPanel.js:571-586`.
- `getTimeNum` حرفيًا: `TypewriterPanel.js:153-179` ↔ `MultiLinesPanel.js:16-42`.
- `setDirection` + stomping أحادي الاتجاه لـ cursorBefore: `TypewriterPanel.js:86-93` ↔ `MultiLinesPanel.js:206-220`.
- `setValue/setChecked`: `SogaPanel.js:556-564` ↔ `MotionPanel.js:774-782`.
- `confirmDelete` + native `confirm()` في `MarkersOps.js:138` بدل `Modals.showConfirm`.
- **3 نسخ** لتعبير path4corners: `BoxManager.jsx:379-404` + `expressions/box/v1.0/path4corners.js` + embedded `ExpressionLoader.jsx:536-560`.
- **3 مصادر حقيقة** لافتراضيات Box (40/20/15 ↔ PADDING_H 20/V 10/CORNER 0 ↔ Soga 40/20/15): `BoxManager.jsx:192-227`, `Config.jsx:212-237`, `SogaManager.jsx:79-87`.
- Globals مكررة تفوز بها aliases: `refreshMarkersTable`, `refreshSogaFromLayer`, `refreshSettingsPanel`, `getCursorType`, `DEBUG/TIMING`.

### 4.3 أداء
- فحوص O(n) متكررة لكل طبقة في العمليات المتعددة: `hasBox` (3 استراتيجيات × مسح كامل، `BoxManager.jsx:108-160`)، `_read/_writeMotionValues` (~40 مسح ضوئي للخصائص لكل طبقة، `SogaManager.jsx:261-310,420-465`)، `getToroValuesForPreset` (~30 مسح، `PresetManager.jsx:1308-1408`).
- `$.writeln` مطول داخل الحلقات الساخنة (Box/Soga/Controllers) — IO متزامن لكل عنصر.
- `splitTextToLayers` ينشئ طبقة نص مؤقتة لكل سطر للقياس ثم يحذفها (`MultiLinesManager.jsx:86-105`) — مكلف وضجيج Undo.
- `SelectionMonitor` poll كل 300ms لا يتوقف أبدًا حتى بإخفاء اللوحة (`SelectionMonitor.js:53-75`).

### 4.4 UX / i18n / State
- `<html lang="ar" dir="ltr">` (`index.html:2`) — واجهة عربية النص بمزيج رسائل إنجليزية ('Ready', 'Select markers first') بلا طبقة i18n.
- Favorites خارج StateManager (`textoro_favorites` منفصلة، `PresetsPanel.js:128-146`) — لا توجد أداة مسح localStorage رغم زر "Clear Cache" (يمسح كاش المضيف فقط).
- أخطاء المضيف تُطوى: `PresetsPanel.load` يبتلع فشل الفئات الخمس كلها (`PresetsPanel.js:186-209`)؛ `SogaPanel/TyperwriterPanel` يحوّلان فشل `getMultiSelectionInfo` لعدم تحديد (`SogaPanel.js:121-127`).
- Markers cache يتقادم: تعديلات AE أثناء تبويب آخر غير مرئية حتى refresh يدوي.
- `browseForPresetsFolder` يفتح Dialog على Thread المضيف فيجمّد AE أثناء انتظار CEP (`PresetManager.jsx:1045-1067`).
- Import/Export يقتصر على type/box/mix — motion/toro تُستبعد صمتًا (`ImportExport.jsx:108-118`).

### 4.5 تضارب إصدارات وتوثيق
| المصدر | القيمة |
|---|---|
| `CSXS/manifest.xml` + cache-busters | **3.5.8** |
| `js/core/Config.js:11` | 3.5.8 |
| `host/modules/Config.jsx:147` | **3.4.0** ← متقادم |
| README.md badge | 3.5.4 |
| `main-entry.js:4` / `index.jsx:3` headers | 3.5.4 / 3.5.4 |
| `HostBridge.js:4` | 3.5.6 |

كذلك: `CONFIG.EXPRESSIONS.TYPEWRITER.AVAILABLE` يعلن v1.0–v1.3 بينما القرص فيه v1.0 وv1.3 فقط (`Config.jsx:170-183`)، وملف v1.0 على القرص يصف نفسه "v1.2" داخليًا، وعدّاد الوحدات في index.jsx يقول "/11" وهي 12.

---

## 5) ما تغطيه الفحوصات الحالية وما لا تغطيه

| الفحص | يغطي | لا يغطي |
|---|---|---|
| `check-ui-syntax.js` | صلاحية صياغة 31 ملف JS | ES5-compliance، مراجع undefined، منطق |
| `check-hostbridge-contract.js` | تطابق أسماء النداءات الحرفية UI↔Host (PASS) | التواقيع، أنواع الإرجاع، النداءات الديناميكية الأربعة (aliases, PresetsOps, PresetsPanel, SogaPanel) |

**فجوات اختبار مطلوبة:** لا يوجد أي اختبار لوحدة ExtendScript، ولا UAT آلي داخل AE (آخر UAT يدوي: `docs/UAT_SIMPLE_AR_2026-03-06.md`)، ولا فحص encoding، ولا فحص ES5-lint (مثل eslint env es3 أو custom grep لـ `Object.keys|Array.isArray|=>|let |const `).

---

## 6) خطة المعالجة والتطوير (Roadmap مقترح)

### المرحلة 0 — تثبيت الأساس (نصف يوم)
1. توليد `assets/icon.png` حقيقي.
2. توحيد VERSION = 3.5.8 في: `host/modules/Config.jsx:147`, README badges, headers.
3. إضافة فحصين للـ Smoke: `check-es5-syntax.js` (grep لـ `Object.keys(`, `Array.isArray(`, `=>`, `` ` ``, `let `, `const ` داخل host/**) و`check-encoding.js` (رفض أي byte غير UTF-8 سليم في host/**).
4. Git repo + baseline commit قبل أي تعديل (المجلد حاليًا ليس repo!).

### المرحلة 1 — إصلاح P0 (يوم–يومان)
| # | المهمة | الملفات |
|---|---|---|
| 1 | تفعيل `updateLayerCount` وإظهار Multi-layer Motion | `MotionPanel.js`, `SelectionMonitor.js` |
| 2 | كسر حلقة المسح في Soga multi-select (populate من الطبقات أو إرسال deltas) | `SogaPanel.js`, `SogaManager.jsx` |
| 3 | Polyfill/استبدال `Object.keys` و`Array.isArray` في المضيف | `Config.jsx` أو `Utilities.jsx` + `SogaManager.jsx` |
| 4 | إعادة كتابة LayerOperations/MotionManager/ControllerManager بنص عربي سليم + توحيد نمط encoding قبل open | الملفات الثلاثة + ExpressionLoader + PresetManager |

### المرحلة 2 — إصلاح P1 (2–4 أيام)
1. توحيد نمط Undo (`undoStarted` flag) في BoxManager/LayerOperations/PresetManager.
2. إصلاح `getExpressionsPath` Method 2، ومنع هبوط الإصدار الصامت (إرجاع خطأ واضح)، نقل كتابة `_config.json` إلى مسار قابل للكتابة (userData).
3. توحيد جداول CURSOR_SHAPES في مصدر واحد (Config) وتوليد المدمج منه.
4. Queue/dedup لـ bootstrap في HostBridge + try/catch حول evalScript + timeout اختياري.
5. إصلاح `hasBox` Ghost (التحقق من وجود shape layer فعليًا).
6. توحيد نظام تسمية الطبقات (suffix-only) وهجرة `TB_/TM_/M_`.
7. escapeHtml لاسم الطبقة في MarkersPanel.
8. إعادة مزامنة FPS (استدعاء getCompInfo عند focus/tab-switch/selection-change throttled).

### المرحلة 3 — تنظيف P2 (تدريجي، مع كل PR)
1. حذف الميت: SpectrumStepper, Tooltip (أو تفعيله)، dead APIs، dead config keys، Motion V1، `_mapOptsToControllerNames`...
2. سحب التكرارات إلى Utils (hexToRgb, getTimeNum, setDirection, setValue/setChecked, confirmDelete→Modals).
3. خفض logging الحلقات خلف `CONFIG.DEBUG`.
4. i18n خفيف (جدول رسائل ar/en) أو على الأقل توحيد لغة الرسائل.
5. تقاعد aliases.js على دفعات (كل دفعة: grep الاستخدامات → حذف → smoke).

### المرحلة 4 — تطوير جديد (بعد استقرار الأساس)
- Easing Curves Preview، Text Effects (Blur/Glow)، حفظ Motion Presets المخصصة (بنود TODO.md المفتوحة) — **فقط بعد** إغلاق P0/P1.

---

## 7) معايير القبول (Definition of Done) لكل إصلاح

1. ✅ `tools\smoke\run-smoke-checks.ps1` PASS.
2. ✅ فحص ES5 الجديد PASS لملفات host.
3. ✅ اختبار يدوي موثق داخل AE (سيناريو + نتيجة) يُلحق بملف UAT جديد بتاريخ التنفيذ.
4. ✅ تحديث CHANGELOG.md وTODO.md.
5. ✅ لا تراجع عن عقد JSON `{"success":bool,...}` لأي دالة مضيف عامة.

## 8) مخاطر مفتوحة (Watchlist)

- كتابة `_config.json` في Program Files تفشل لدى المستخدم غير المرفوع صلاحيته — **سلوك حالي صامت**؛ راقب شكاوى "تبديل إصدار التعبيرات لا يعمل".
- تعارض أسماء Effects العامة (`findEffectControl` يطابق بالاسم فقط، `Utilities.jsx:233-238`) — Effect مستخدم اسمه "Fill Opacity" يُفسَّر كتحكم TEXTORO.
- `TITOUF copy.json` داخل presets/motion (مسافة وحروف كبيرة) — مرشح للحذف أو إعادة تسمية.
- ملفان باسم متقارب عربيًا ("نص" و"نص!") ينتجان نفس اسم الملف ⇒ overwrite صامت في savePreset (لا حراسة reserved/length/تصادم).

---

## ملحق أ) جرد API العام للمضيف (المستدعى فعليًا من الواجهة)

`getCompInfo`, `getSelectionInfo`, `getMultiSelectionInfo`, `getLayerText`, `updateLayerText`,
`applyTypewriter`, `applyTypewriterMulti`, `removeTypewriter`,
`createBox`, `removeBox`, `splitTextToLayers`, `splitAndApply`,
`getLayerEffectValues`, `setLayerEffectValues`, `setLayerEffectValuesMulti`,
`collectTextoroMarkers`, `offsetTextoroMarkers`, `staggerTextoroMarkers`, `alignTextoroMarkers`, `deleteTextoroMarkers`,
`offsetSelectedLayers`, `staggerSelectedLayers`, `alignSelectedLayers`,
`loadPresets`, `savePreset`, `deletePreset`, `applyPreset`, `applyMotionPreset`, `applyMotionMulti`,
`getToroValuesForPreset`, `getMotionValuesForPreset`, `getLayerValuesForPreset`,
`clearExpressionCache`, `getAvailableVersionsJS`, `setActiveVersionJS`,
`getPresetsPathSetting`, `setPresetsPathSetting`(غير مستدعى حاليًا), `browseForPresetsFolder`, `openPresetsFolder`,
`getMotionSelectionCount`, `createNewTextLayer` (موجود بالمضيف، غير مربوط بالواجهة).

## ملحق ب) مصادر هذا التقرير

- تحليل ثابت كامل لـ `js/**` و`host/**` و`index.html` و`CSXS/manifest.xml` (أغسطس 2026).
- تشغيل فعلي لـ `tools/smoke/check-ui-syntax.js` و`check-hostbridge-contract.js` ⇒ PASS.
- مقارنة مع سجل العيوب السابق: `docs/UNRESOLVED_DEFECTS_ESTIMATE_2026-03-06.md` (كل UDF مغلقة — العيوب هنا **خارج نطاق UDF التاريخي** وليست تراجعًا عنه).
