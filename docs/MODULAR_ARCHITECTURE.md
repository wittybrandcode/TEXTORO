# TEXTORO - البنية المعمارية المُعيارية
> الإصدار: 3.2.1 | تاريخ التحديث: December 23, 2024

---

## 📋 نظرة عامة

تم تحويل TEXTORO من ملف monolithic واحد (~3000+ سطر) إلى بنية معمارية مُعيارية تتكون من 10 وحدات مستقلة. هذا التحويل يُحسّن:

- **قابلية الصيانة**: كل وحدة مسؤولة عن وظيفة محددة
- **قابلية الاختبار**: يمكن اختبار كل وحدة بشكل مستقل
- **قابلية التوسع**: إضافة ميزات جديدة بسهولة
- **التعاون**: يمكن لعدة مطورين العمل على وحدات مختلفة

---

## 🏗️ هيكل الملفات

```
TEXTORO/
├── host/
│   ├── index.jsx                    # 🎯 الملف الرئيسي (loader فقط)
│   ├── index OLD.jsx                # 📦 النسخة الأصلية (backup)
│   ├── _test_integration.jsx        # 🧪 اختبار التكامل
│   │
│   ├── modules/                     # 📁 الوحدات المُعيارية
│   │   ├── Config.jsx               # ⚙️ الإعدادات والثوابت
│   │   ├── Utilities.jsx            # 🔧 الدوال المساعدة
│   │   ├── ExpressionLoader.jsx     # 📜 نظام تحميل الـ Expressions
│   │   ├── TypewriterManager.jsx    # ⌨️ مدير تأثير Typewriter
│   │   ├── BoxManager.jsx           # 📦 مدير تأثير الصندوق
│   │   ├── MultiLinesManager.jsx    # 📝 مدير الأسطر المتعددة
│   │   ├── SogaManager.jsx          # 🎛️ مدير التحرير المباشر
│   │   ├── LayerOperations.jsx      # 🎬 عمليات الطبقات
│   │   ├── PresetManager.jsx        # 💾 مدير البريسات
│   │   └── ImportExport.jsx         # 📤 استيراد/تصدير
│   │
│   └── expressions/                 # 📁 ملفات الـ Expressions
│       ├── _config.json
│       ├── typewriter/
│       ├── cursor/
│       └── box/
```

---

## 📊 الوحدات (10 وحدات)

| # | الوحدة | الأسطر | الوصف | التبعيات |
|---|--------|--------|-------|----------|
| 1 | **Config.jsx** | ~110 | الإعدادات والثوابت العامة | لا شيء |
| 2 | **Utilities.jsx** | ~500 | الدوال المساعدة الأساسية | Config |
| 3 | **ExpressionLoader.jsx** | ~600 | نظام تحميل وإدارة الـ Expressions | Config, Utilities |
| 4 | **TypewriterManager.jsx** | ~550 | تأثير الكتابة التدريجية | Config, Utilities, ExpressionLoader |
| 5 | **BoxManager.jsx** | ~500 | الصندوق الديناميكي حول النص | Config, Utilities, ExpressionLoader |
| 6 | **MultiLinesManager.jsx** | ~350 | تقسيم النص لأسطر متعددة | TypewriterManager, BoxManager |
| 7 | **SogaManager.jsx** | ~400 | التحرير المباشر للخصائص | جميع الوحدات السابقة |
| 8 | **LayerOperations.jsx** | ~450 | عمليات على الطبقات | Utilities |
| 9 | **PresetManager.jsx** | ~1650 | إدارة البريسات (CRUD) | Config, Utilities |
| 10 | **ImportExport.jsx** | ~350 | استيراد/تصدير البريسات | PresetManager |

**المجموع: ~5,460 سطر موزعة على 10 وحدات**

---

## 🔗 ترتيب التحميل والتبعيات

```
┌─────────────────────────────────────────────────────────────┐
│                        index.jsx                            │
│                    (Loader - 60 سطر)                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  1. Config.jsx          ← لا تبعيات                         │
│  2. Utilities.jsx       ← Config                            │
│  3. ExpressionLoader.jsx ← Config, Utilities                │
│  4. TypewriterManager.jsx ← Config, Utilities, ExpressionLoader │
│  5. BoxManager.jsx      ← Config, Utilities, ExpressionLoader │
│  6. MultiLinesManager.jsx ← TypewriterManager, BoxManager   │
│  7. SogaManager.jsx     ← جميع الوحدات السابقة              │
│  8. LayerOperations.jsx ← Utilities                         │
│  9. PresetManager.jsx   ← Config, Utilities                 │
│ 10. ImportExport.jsx    ← PresetManager                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📜 index.jsx - الملف الرئيسي

الملف الرئيسي الآن يحتوي فقط على:
1. **تعليمات `#include`** لتحميل الوحدات
2. **التحقق من التحميل** للتأكد من نجاح العملية

```javascript
// index.jsx - v3.2.1 Modular Architecture

// 1. الإعدادات والثوابت
#include "modules/Config.jsx"

// 2. الدوال المساعدة
#include "modules/Utilities.jsx"

// 3. نظام تحميل الـ Expressions
#include "modules/ExpressionLoader.jsx"

// 4-10. باقي الوحدات...
#include "modules/TypewriterManager.jsx"
#include "modules/BoxManager.jsx"
// ...

// التحقق من التحميل
var _loadedModules = [];
if (typeof CONFIG_MODULE_LOADED !== "undefined") _loadedModules.push("Config");
// ...
$.writeln("[TEXTORO] Loaded: " + _loadedModules.length + "/10 modules");
```

---

## 🔖 أعلام التحميل (Load Flags)

كل وحدة تُعرّف علم تحميل للتحقق من نجاح التحميل:

```javascript
// في بداية كل وحدة
var MODULENAME_MODULE_LOADED = true;

// الأعلام المتاحة:
// - CONFIG_MODULE_LOADED
// - UTILITIES_MODULE_LOADED
// - EXPRESSIONLOADER_MODULE_LOADED
// - TYPEWRITERMANAGER_MODULE_LOADED
// - BOXMANAGER_MODULE_LOADED
// - MULTILINESMANAGER_MODULE_LOADED
// - SOGAMANAGER_MODULE_LOADED
// - LAYEROPERATIONS_MODULE_LOADED
// - PRESETMANAGER_MODULE_LOADED
// - IMPORTEXPORT_MODULE_LOADED
```

---

## 🧪 اختبار التكامل

ملف `_test_integration.jsx` يختبر:
- ✅ تحميل جميع الوحدات (10 أعلام)
- ✅ وجود الدوال الأساسية (36 اختبار)
- ✅ التبعيات بين الوحدات

**تشغيل الاختبار:**
1. افتح After Effects
2. File > Scripts > Run Script File
3. اختر `TEXTORO/host/_test_integration.jsx`
4. شاهد النتائج في Console

---

## 📦 تفاصيل الوحدات

### 1. Config.jsx
```javascript
// الثوابت العامة
var CONFIG = {
    VERSION: "3.2.1",
    DEBUG: false,
    // ...
};

// إعدادات الصندوق
var BOX_CONFIG = {
    BEZIER_K: 0.5523,
    LABEL_BOX: 9,
    DEFAULTS: { ... },
    LIMITS: { ... }
};
```

### 2. Utilities.jsx
```javascript
// دوال الاستجابة
function success(msg, data) { ... }
function error(msg) { ... }

// دوال After Effects
function getActiveComp() { ... }
function getSelectedTextLayer(comp) { ... }

// دوال Effect Controls
function addSlider(fx, name, value) { ... }
function addCheckbox(fx, name, value) { ... }
function addColor(fx, name, value) { ... }
function findEffectControl(fx, name) { ... }
function removeEffectControls(fx, names) { ... }
```

### 3. ExpressionLoader.jsx
```javascript
// تحميل Expression من ملف
function loadExpression(category, name, version) { ... }

// بناء Expressions
function buildSourceTextExpr() { ... }
function buildCursorBlinkExpr() { ... }
function _build4CornersPathExpr() { ... }
function _buildRectSizeExpr() { ... }
function _buildRectPositionExpr() { ... }
function _buildHideWhenEmptyExpr(opacityControl) { ... }

// إدارة النسخ
function getAvailableVersions(category, name) { ... }
function setActiveVersion(category, name, version) { ... }
```

### 4. TypewriterManager.jsx
```javascript
// API العام
function applyTypewriter(optsJSON) { ... }
function removeTypewriter() { ... }
function hasTypewriter(layer) { ... }

// دوال داخلية
function _applyTypewriter(textLayer, opts) { ... }
function _removeTypewriter(textLayer) { ... }

// دوال النص
function getLayerText() { ... }
function updateLayerText(optsJSON) { ... }
```

### 5. BoxManager.jsx
```javascript
// نظام معرفات الطبقات
function generateBaseId() { ... }
function parseLayerName(layerName) { ... }
function buildLayerName(baseId, hasT, hasB) { ... }
function updateLayerFlags(layer, addT, addB) { ... }

// API العام
function createBox(optsJSON) { ... }
function removeBox() { ... }
function hasBox(layer, comp) { ... }

// دوال داخلية
function _createBox(textLayer, comp, opts) { ... }
function _create4CornersBox(rectContents) { ... }
function _createSimpleBox(rectContents) { ... }
function _removeBox(textLayer, comp) { ... }
```

### 6-10. باقي الوحدات
راجع الملفات مباشرة للتفاصيل الكاملة.

---

## 🔄 الترقية من النسخة القديمة

### للمستخدمين:
لا يوجد تغيير - الإضافة تعمل بنفس الطريقة.

### للمطورين:
1. الملف الأصلي محفوظ في `index OLD.jsx`
2. جميع الدوال العامة متاحة بنفس الأسماء
3. التبعيات مُدارة تلقائياً عبر ترتيب `#include`

---

## 🐛 استكشاف الأخطاء

### الوحدة لم تُحمّل
```javascript
// تحقق من العلم
if (typeof MODULENAME_MODULE_LOADED === "undefined") {
    $.writeln("Module not loaded!");
}
```

### خطأ في التبعيات
تأكد من ترتيب `#include` في `index.jsx` - الوحدات يجب أن تُحمّل بالترتيب الصحيح.

### دالة غير معرّفة
تأكد من أن الوحدة التي تحتوي الدالة مُحمّلة قبل استخدامها.

---

## 📈 الأداء

| المقياس | قبل | بعد |
|---------|-----|-----|
| حجم index.jsx | 286 KB | 3 KB |
| عدد الأسطر | 6566 | 60 |
| وقت التحميل | ~500ms | ~600ms |
| قابلية الصيانة | ⭐ | ⭐⭐⭐⭐⭐ |

**ملاحظة:** وقت التحميل أطول قليلاً بسبب قراءة ملفات متعددة، لكن الفرق غير ملحوظ.

---

## 📝 المساهمة

عند إضافة وحدة جديدة:
1. أنشئ الملف في `host/modules/`
2. أضف علم التحميل في البداية
3. أضف `#include` في `index.jsx` بالترتيب الصحيح
4. أضف اختبارات في `_test_integration.jsx`
5. حدّث هذا التوثيق

---

*TEXTORO Modular Architecture - December 2024*
