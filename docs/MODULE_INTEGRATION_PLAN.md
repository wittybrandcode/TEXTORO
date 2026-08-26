# خطة دمج الوحدات - TEXTORO Module Integration Plan

## نظرة عامة

**المشكلة الحالية:**
- ملف `index.jsx` هو ملف monolithic يحتوي على ~6772 سطر
- مجلد `modules/` يحتوي على 10 وحدات منفصلة **غير مستخدمة**
- ملف `_loader.jsx` موجود لكنه **لا يُستدعى** من `index.jsx`

**الهدف:**
- دمج الوحدات واحدة تلو الأخرى
- كل وحدة: تحليل → مقارنة → تحديث → دمج → اختبار

---

## ترتيب الدمج (حسب التبعيات)

```
1. Config.jsx          ← لا تبعيات
2. Utilities.jsx       ← يعتمد على Config
3. ExpressionLoader.jsx ← يعتمد على Utilities
4. TypewriterManager.jsx ← يعتمد على Utilities, ExpressionLoader
5. BoxManager.jsx      ← يعتمد على Utilities, ExpressionLoader
6. MultiLinesManager.jsx ← يعتمد على TypewriterManager, BoxManager
7. SogaManager.jsx     ← يعتمد على TypewriterManager, BoxManager
8. LayerOperations.jsx ← يعتمد على Utilities
9. PresetManager.jsx   ← يعتمد على كل ما سبق
10. ImportExport.jsx   ← يعتمد على PresetManager
```

---

## الوحدة 1: Config.jsx

### الحالة: جاهز للدمج مع تعديلات طفيفة

### المقارنة:

| العنصر | index.jsx | Config.jsx | الإجراء |
|--------|-----------|------------|---------|
| CONFIG.SCRIPT_NAME | ✅ | ✅ | متطابق |
| CONFIG.VERSION | ✅ | ✅ | متطابق |
| CONFIG.LIMITS | ✅ | ✅ | متطابق |
| CONFIG.DEFAULTS | ✅ | ✅ | متطابق |
| CONFIG.TEXT | ✅ | ✅ | متطابق |
| CONFIG.EXPRESSIONS | ❌ | ✅ | **إضافة للوحدة** |
| CONFIG.CURSOR_SHAPES | ❌ | ✅ | **إضافة للوحدة** |
| CONFIG.EASING | ❌ | ✅ | **إضافة للوحدة** |
| BOX_CONFIG.BEZIER_K | ✅ | ❌ | **إضافة للوحدة** |
| BOX_CONFIG.LABEL_BOX | ✅ | ❌ | **إضافة للوحدة** |
| BOX_CONFIG.DEFAULTS | ❌ | ✅ | موجود في الوحدة فقط |
| BOX_CONFIG.LIMITS | ❌ | ✅ | موجود في الوحدة فقط |

### التعديلات المطلوبة على Config.jsx:
```javascript
// إضافة BOX_CONFIG.BEZIER_K و BOX_CONFIG.LABEL_BOX
var BOX_CONFIG = {
    BEZIER_K: 0.5523,  // ← إضافة
    LABEL_BOX: 9,      // ← إضافة
    DEFAULTS: { ... },
    LIMITS: { ... }
};
```

### خطوات الدمج:
1. تحديث `Config.jsx` بإضافة `BEZIER_K` و `LABEL_BOX`
2. إضافة `#include "modules/Config.jsx"` في بداية `index.jsx`
3. حذف تعريف `CONFIG` و `BOX_CONFIG` من `index.jsx`
4. اختبار: التأكد من عدم وجود أخطاء

---

## الوحدة 2: Utilities.jsx

### الحالة: جاهز للدمج مع تعديلات

### المقارنة:

| الدالة | index.jsx | Utilities.jsx | الإجراء |
|--------|-----------|---------------|---------|
| success() | ✅ | ✅ | متطابق |
| error() | ✅ | ✅ | متطابق |
| validateNumber() | ✅ | ✅ | متطابق |
| validateBoolean() | ❌ | ✅ | موجود في الوحدة فقط |
| hexToRgb() | ✅ | ✅ | متطابق |
| rgbToHex() | ❌ | ✅ | موجود في الوحدة فقط |
| _getISODate() | ✅ | ✅ | متطابق |
| getActiveComp() | ✅ | ✅ | متطابق |
| getCompInfo() | ✅ | ✅ | **مختلف** - الوحدة أبسط |
| getSelectedTextLayer() | ✅ | ✅ | متطابق |
| getSelectedLayers() | ❌ | ✅ | موجود في الوحدة فقط |
| getSelectedTextLayers() | ❌ | ✅ | موجود في الوحدة فقط |
| addSlider() | ✅ | ✅ | **مختلف** - index أفضل |
| addCheckbox() | ✅ | ✅ | **مختلف** - index أفضل |
| addColor() | ✅ | ✅ | **مختلف** - index أفضل |
| addPoint() | ❌ | ✅ | موجود في الوحدة فقط |
| getEffectValue() | ❌ | ✅ | موجود في الوحدة فقط |
| setEffectValue() | ❌ | ✅ | موجود في الوحدة فقط |
| hasEffect() | ❌ | ✅ | موجود في الوحدة فقط |
| removeEffect() | ❌ | ✅ | موجود في الوحدة فقط |
| getLayerText() | ❌ | ✅ | موجود في الوحدة فقط |
| setLayerText() | ❌ | ✅ | موجود في الوحدة فقط |
| getTextProperties() | ❌ | ✅ | موجود في الوحدة فقط |
| findEffectControl() | ✅ | ❌ | **إضافة للوحدة** |
| removeEffectControls() | ✅ | ❌ | **إضافة للوحدة** |
| getTextFromMarker() | ✅ | ❌ | **إضافة للوحدة** |
| removeMarkers() | ✅ | ❌ | **إضافة للوحدة** |
| removeAnimatorsByName() | ✅ | ❌ | **إضافة للوحدة** |

### التعديلات المطلوبة على Utilities.jsx:
```javascript
// 1. تحديث addSlider, addCheckbox, addColor لتتطابق مع index.jsx
// 2. إضافة الدوال الناقصة:
//    - findEffectControl()
//    - removeEffectControls()
//    - getTextFromMarker()
//    - removeMarkers()
//    - removeAnimatorsByName()
```

### خطوات الدمج:
1. تحديث `Utilities.jsx` بالدوال الناقصة
2. تحديث `addSlider`, `addCheckbox`, `addColor` لتتطابق مع index.jsx
3. إضافة `#include "modules/Utilities.jsx"` بعد Config
4. حذف الدوال المكررة من `index.jsx`
5. اختبار

---

## الوحدة 3: ExpressionLoader.jsx

### الحالة: جاهز للدمج مع تعديلات طفيفة

### المقارنة:

| الدالة | index.jsx | ExpressionLoader.jsx | الإجراء |
|--------|-----------|----------------------|---------|
| _exprCache | ✅ | ✅ | متطابق |
| _exprConfig | ✅ | ✅ | متطابق |
| getExpressionsPath() | ✅ | ✅ | **مختلف** - الوحدة تصعد مستوى |
| loadExprConfig() | ✅ | ✅ | متطابق |
| loadExpression() | ✅ | ✅ | متطابق |
| clearExpressionCache() | ✅ | ✅ | متطابق |
| buildSourceTextExpr() | ✅ | ✅ | متطابق |
| buildCursorRangeExpr() | ✅ | ✅ | متطابق |
| buildCursorBlinkExpr() | ✅ | ✅ | متطابق |
| buildBoxPathExpr() | ❌ | ✅ | موجود في الوحدة فقط |
| buildBoxSizeExpr() | ❌ | ✅ | موجود في الوحدة فقط |
| buildBoxPositionExpr() | ❌ | ✅ | موجود في الوحدة فقط |
| getAvailableVersions() | ✅ | ✅ | متطابق |
| setActiveVersion() | ✅ | ✅ | متطابق |
| getAvailableVersionsJS() | ✅ | ✅ | متطابق |
| setActiveVersionJS() | ✅ | ✅ | متطابق |
| _getEmbeddedExpression() | ✅ | ✅ | **مختلف** - index أكمل |

### التعديلات المطلوبة على ExpressionLoader.jsx:
```javascript
// 1. تحديث getExpressionsPath() للعمل من modules/ أو من index.jsx
// 2. تحديث _getEmbeddedExpression() لتتطابق مع index.jsx (أكثر اكتمالاً)
```

### خطوات الدمج:
1. تحديث `ExpressionLoader.jsx`
2. إضافة `#include "modules/ExpressionLoader.jsx"` بعد Utilities
3. حذف الدوال المكررة من `index.jsx`
4. اختبار

---

## الوحدة 4: TypewriterManager.jsx

### الحالة: يحتاج تعديلات كبيرة

### المقارنة:

| الدالة | index.jsx | TypewriterManager.jsx | الإجراء |
|--------|-----------|----------------------|---------|
| applyTypewriter() | ✅ | ✅ | **مختلف** - index أكمل |
| removeTypewriter() | ✅ | ✅ | متطابق |
| getLayerText() | ✅ | ✅ | متطابق |
| updateLayerText() | ✅ | ✅ | **مختلف** - index أكمل |
| hasTypewriter() | ✅ | ✅ | متطابق |
| _applyTypewriter() | ✅ | ✅ | **مختلف** - index أكمل |
| _removeTypewriter() | ✅ | ✅ | **مختلف** - index أكمل |
| _hasCustomText() | ❌ | ✅ | موجود في الوحدة فقط |
| _getDefaultText() | ❌ | ✅ | موجود في الوحدة فقط |
| _extractTiming() | ❌ | ✅ | موجود في الوحدة فقط |
| _extractCursorOptions() | ❌ | ✅ | موجود في الوحدة فقط |
| _createTypewriterMarkers() | ❌ | ✅ | موجود في الوحدة فقط |
| _createCursorAnimator() | ❌ | ✅ | موجود في الوحدة فقط |
| _applyTextColorAnimator() | ❌ | ✅ | موجود في الوحدة فقط |
| _updateTextMarker() | ❌ | ✅ | موجود في الوحدة فقط |
| _updateBoxLockValues() | ✅ | ✅ | متطابق |
| getOriginalText() | ✅ | ✅ | متطابق |
| setOriginalText() | ✅ | ✅ | متطابق |
| clearOriginalText() | ✅ | ✅ | متطابق |

### ملاحظة مهمة:
الوحدة تستخدم دوال مساعدة مُنظمة أفضل، لكن `index.jsx` يحتوي على منطق أكثر اكتمالاً.

### التعديلات المطلوبة:
```javascript
// 1. دمج المنطق الكامل من index.jsx في الوحدة
// 2. الحفاظ على الدوال المساعدة المُنظمة في الوحدة
// 3. التأكد من دعم كل الخيارات (easing, effects, etc.)
```

### خطوات الدمج:
1. تحديث `TypewriterManager.jsx` بالمنطق الكامل من index.jsx
2. إضافة `#include "modules/TypewriterManager.jsx"` بعد ExpressionLoader
3. حذف الدوال المكررة من `index.jsx`
4. اختبار شامل لـ Typewriter

---

## الوحدة 5: BoxManager.jsx

### الحالة: يحتاج تعديلات متوسطة

### المقارنة:

| الدالة | index.jsx | BoxManager.jsx | الإجراء |
|--------|-----------|----------------|---------|
| BOX_CONFIG | ✅ | ✅ | **مختلف** - دمج |
| createBox() | ✅ | ✅ | متطابق |
| removeBox() | ✅ | ✅ | متطابق |
| hasBox() | ✅ | ✅ | متطابق |
| _createBox() | ✅ | ✅ | **مختلف** - index أكمل |
| _removeBox() | ✅ | ✅ | متطابق |
| _create4CornersBox() | ❌ | ✅ | موجود في الوحدة فقط |
| _createSimpleBox() | ❌ | ✅ | موجود في الوحدة فقط |
| _addStrokeDashes() | ❌ | ✅ | موجود في الوحدة فقط |
| _buildHideWhenEmptyExpr() | ❌ | ✅ | موجود في الوحدة فقط |
| generateBaseId() | ✅ | ✅ | متطابق |
| parseLayerName() | ✅ | ✅ | متطابق |
| buildLayerName() | ✅ | ✅ | متطابق |
| getBaseId() | ✅ | ✅ | متطابق |
| updateLayerFlags() | ✅ | ✅ | متطابق |
| removeLayerFlag() | ✅ | ✅ | **مختلف** - index أكمل |
| getLayerStatus() | ✅ | ✅ | متطابق |
| findBoxLayerById() | ✅ | ✅ | متطابق |
| getAllTextoroLayers() | ✅ | ❌ | **إضافة للوحدة** |

### التعديلات المطلوبة:
```javascript
// 1. دمج BOX_CONFIG من Config.jsx
// 2. تحديث _createBox() بالمنطق الكامل
// 3. تحديث removeLayerFlag() بالمنطق الكامل
// 4. إضافة getAllTextoroLayers()
```

### خطوات الدمج:
1. تحديث `BoxManager.jsx`
2. إزالة تعريف `BOX_CONFIG` المكرر (سيأتي من Config.jsx)
3. إضافة `#include "modules/BoxManager.jsx"` بعد ExpressionLoader
4. حذف الدوال المكررة من `index.jsx`
5. اختبار شامل لـ Box

---

## الوحدة 6: MultiLinesManager.jsx

### الحالة: جاهز للدمج

### المقارنة:

| الدالة | index.jsx | MultiLinesManager.jsx | الإجراء |
|--------|-----------|----------------------|---------|
| getSelectedTextLayers() | ❌ | ✅ | موجود في الوحدة فقط |
| getMultiSelectionInfo() | ❌ | ✅ | موجود في الوحدة فقط |
| splitTextToLayers() | ❌ | ✅ | موجود في الوحدة فقط |
| applyTypewriterMulti() | ❌ | ✅ | موجود في الوحدة فقط |
| createBoxMulti() | ❌ | ✅ | موجود في الوحدة فقط |
| splitAndApply() | ❌ | ✅ | موجود في الوحدة فقط |

### ملاحظة:
هذه الوحدة تحتوي على دوال جديدة غير موجودة في `index.jsx`.
يجب التأكد من أن الدوال التي تعتمد عليها موجودة (مثل `_applyTypewriter`, `_createBox`).

### خطوات الدمج:
1. التأكد من دمج TypewriterManager و BoxManager أولاً
2. إضافة `#include "modules/MultiLinesManager.jsx"` بعد BoxManager
3. اختبار دوال تقسيم الأسطر

---

## الوحدة 7: SogaManager.jsx

### الحالة: جاهز للدمج

### المقارنة:

| الدالة | index.jsx | SogaManager.jsx | الإجراء |
|--------|-----------|-----------------|---------|
| getLayerEffectValues() | ❌ | ✅ | موجود في الوحدة فقط |
| setLayerEffectValues() | ❌ | ✅ | موجود في الوحدة فقط |
| _readTypewriterValues() | ❌ | ✅ | موجود في الوحدة فقط |
| _readBoxValues() | ❌ | ✅ | موجود في الوحدة فقط |
| _readMotionValues() | ❌ | ✅ | موجود في الوحدة فقط |
| _writeTypewriterValues() | ❌ | ✅ | موجود في الوحدة فقط |
| _writeBoxValues() | ❌ | ✅ | موجود في الوحدة فقط |
| _writeMotionValues() | ❌ | ✅ | موجود في الوحدة فقط |
| _getSliderValue() | ❌ | ✅ | موجود في الوحدة فقط |
| _getCheckboxValue() | ❌ | ✅ | موجود في الوحدة فقط |
| _getColorValue() | ❌ | ✅ | موجود في الوحدة فقط |
| _setSliderValue() | ❌ | ✅ | موجود في الوحدة فقط |
| _setCheckboxValue() | ❌ | ✅ | موجود في الوحدة فقط |
| _setColorValue() | ❌ | ✅ | موجود في الوحدة فقط |
| _ensureMotionControl() | ❌ | ✅ | موجود في الوحدة فقط |

### ملاحظة:
هذه الوحدة تحتوي على دوال Soga Panel الجديدة.
تعتمد على `findEffectControl`, `hasTypewriter`, `hasBox`, `hasMotion`.

### خطوات الدمج:
1. التأكد من دمج الوحدات السابقة
2. إضافة `#include "modules/SogaManager.jsx"` بعد MultiLinesManager
3. اختبار لوحة Soga

---

## الوحدة 8: LayerOperations.jsx

### الحالة: جاهز للدمج مع تعديلات

### المقارنة:

| الدالة | index.jsx | LayerOperations.jsx | الإجراء |
|--------|-----------|---------------------|---------|
| offsetSelectedLayers() | ❌ | ✅ | موجود في الوحدة فقط |
| staggerSelectedLayers() | ❌ | ✅ | موجود في الوحدة فقط |
| alignSelectedLayers() | ❌ | ✅ | موجود في الوحدة فقط |
| collectTextoroMarkers() | ❌ | ✅ | موجود في الوحدة فقط |
| offsetTextoroMarkers() | ❌ | ✅ | موجود في الوحدة فقط |
| alignTextoroMarkers() | ❌ | ✅ | موجود في الوحدة فقط |
| deleteTextoroMarkers() | ❌ | ✅ | موجود في الوحدة فقط |
| createNewTextLayer() | ❌ | ✅ | موجود في الوحدة فقط |
| getSelectionInfo() | ✅ | ✅ | **مختلف** - index أكمل |

### التعديلات المطلوبة:
```javascript
// تحديث getSelectionInfo() في الوحدة لتتطابق مع index.jsx
```

### خطوات الدمج:
1. تحديث `LayerOperations.jsx` بـ `getSelectionInfo()` الكامل
2. إضافة `#include "modules/LayerOperations.jsx"` بعد SogaManager
3. حذف `getSelectionInfo()` من `index.jsx`
4. اختبار عمليات الطبقات

---

## الوحدة 9: PresetManager.jsx

### الحالة: الأكبر والأكثر تعقيداً - يحتاج مراجعة دقيقة

### المقارنة:

| الدالة | index.jsx | PresetManager.jsx | الإجراء |
|--------|-----------|-------------------|---------|
| _customPresetsPath | ❌ | ✅ | موجود في الوحدة فقط |
| _normalizePath() | ❌ | ✅ | موجود في الوحدة فقط |
| _getSettingsFilePath() | ❌ | ✅ | موجود في الوحدة فقط |
| _loadSettings() | ❌ | ✅ | موجود في الوحدة فقط |
| _saveSettings() | ❌ | ✅ | موجود في الوحدة فقط |
| _presetCache | ❌ | ✅ | موجود في الوحدة فقط |
| getCachedPresets() | ❌ | ✅ | موجود في الوحدة فقط |
| setCachedPresets() | ❌ | ✅ | موجود في الوحدة فقط |
| clearPresetCache() | ❌ | ✅ | موجود في الوحدة فقط |
| getPresetsPath() | ❌ | ✅ | موجود في الوحدة فقط |
| _ensurePresetsFolders() | ❌ | ✅ | موجود في الوحدة فقط |
| _ensureIndexFile() | ❌ | ✅ | موجود في الوحدة فقط |
| getBuiltinPresetsPath() | ❌ | ✅ | موجود في الوحدة فقط |
| loadPresetSafe() | ❌ | ✅ | موجود في الوحدة فقط |
| _loadPresetByFileName() | ❌ | ✅ | موجود في الوحدة فقط |
| loadPresets() | ❌ | ✅ | موجود في الوحدة فقط |
| generatePresetId() | ❌ | ✅ | موجود في الوحدة فقط |
| getPresetList() | ❌ | ✅ | موجود في الوحدة فقط |
| getAllPresets() | ❌ | ✅ | موجود في الوحدة فقط |
| getPreset() | ❌ | ✅ | موجود في الوحدة فقط |
| savePreset() | ❌ | ✅ | موجود في الوحدة فقط |
| deletePreset() | ❌ | ✅ | موجود في الوحدة فقط |
| renamePreset() | ❌ | ✅ | موجود في الوحدة فقط |
| getPresetsPathSetting() | ❌ | ✅ | موجود في الوحدة فقط |
| setPresetsPathSetting() | ❌ | ✅ | موجود في الوحدة فقط |
| browseForPresetsFolder() | ❌ | ✅ | موجود في الوحدة فقط |
| openPresetsFolder() | ❌ | ✅ | موجود في الوحدة فقط |
| _extractTypeValues() | ❌ | ✅ | موجود في الوحدة فقط |
| _extractBoxValues() | ❌ | ✅ | موجود في الوحدة فقط |
| getLayerValuesForPreset() | ❌ | ✅ | موجود في الوحدة فقط |
| getMotionValuesForPreset() | ❌ | ✅ | موجود في الوحدة فقط |
| getToroValuesForPreset() | ❌ | ✅ | موجود في الوحدة فقط |
| _getEffectColorValue() | ❌ | ✅ | موجود في الوحدة فقط |
| _getEffectValue() | ❌ | ✅ | موجود في الوحدة فقط |
| applyPreset() | ❌ | ✅ | موجود في الوحدة فقط |
| _applyPresetToSingleLayer() | ❌ | ✅ | موجود في الوحدة فقط |
| _updateTypewriterMarkers() | ❌ | ✅ | موجود في الوحدة فقط |
| _applyTypePreset() | ❌ | ✅ | موجود في الوحدة فقط |
| _applyBoxPreset() | ❌ | ✅ | موجود في الوحدة فقط |

### ملاحظة:
هذه الوحدة تحتوي على نظام البريسات الكامل وهي غير موجودة في `index.jsx`.
تعتمد على دوال من الوحدات السابقة.

### خطوات الدمج:
1. التأكد من دمج جميع الوحدات السابقة
2. إضافة `#include "modules/PresetManager.jsx"` بعد LayerOperations
3. اختبار شامل لنظام البريسات

---

## الوحدة 10: ImportExport.jsx

### الحالة: جاهز للدمج

### المقارنة:

| الدالة | index.jsx | ImportExport.jsx | الإجراء |
|--------|-----------|------------------|---------|
| exportPreset() | ❌ | ✅ | موجود في الوحدة فقط |
| exportAllPresets() | ❌ | ✅ | موجود في الوحدة فقط |
| importPresets() | ❌ | ✅ | موجود في الوحدة فقط |
| _importSinglePreset() | ❌ | ✅ | موجود في الوحدة فقط |
| exportPresetByFileName() | ❌ | ✅ | موجود في الوحدة فقط |
| importPresetFromPath() | ❌ | ✅ | موجود في الوحدة فقط |

### ملاحظة:
هذه الوحدة تعتمد على PresetManager.

### خطوات الدمج:
1. التأكد من دمج PresetManager أولاً
2. إضافة `#include "modules/ImportExport.jsx"` بعد PresetManager
3. اختبار استيراد/تصدير البريسات

---

## ملخص التعديلات المطلوبة

### الوحدات التي تحتاج تعديلات:

| الوحدة | مستوى التعديل | التفاصيل |
|--------|---------------|----------|
| Config.jsx | طفيف | إضافة BEZIER_K, LABEL_BOX |
| Utilities.jsx | متوسط | إضافة 5 دوال ناقصة + تحديث 3 دوال |
| ExpressionLoader.jsx | طفيف | تحديث getExpressionsPath + _getEmbeddedExpression |
| TypewriterManager.jsx | كبير | دمج المنطق الكامل من index.jsx |
| BoxManager.jsx | متوسط | إضافة getAllTextoroLayers + تحديث دوال |
| MultiLinesManager.jsx | لا شيء | جاهز |
| SogaManager.jsx | لا شيء | جاهز |
| LayerOperations.jsx | طفيف | تحديث getSelectionInfo |
| PresetManager.jsx | لا شيء | جاهز |
| ImportExport.jsx | لا شيء | جاهز |

---

## خطة التنفيذ

### المرحلة 1: Config.jsx
1. تحديث الوحدة
2. إضافة `#include` في index.jsx
3. حذف الكود المكرر
4. اختبار

### المرحلة 2: Utilities.jsx
1. تحديث الوحدة
2. إضافة `#include` في index.jsx
3. حذف الكود المكرر
4. اختبار

### المرحلة 3-10: باقي الوحدات
نفس الخطوات لكل وحدة بالترتيب.

---

## الاختبار النهائي

بعد دمج جميع الوحدات:
1. اختبار إنشاء Typewriter جديد
2. اختبار إنشاء Box
3. اختبار تقسيم الأسطر
4. اختبار Soga Panel
5. اختبار البريسات (حفظ/تحميل/تطبيق)
6. اختبار استيراد/تصدير
7. اختبار عمليات الطبقات والـ Markers

---

## هيكل index.jsx النهائي

```javascript
/**
 * TEXTORO CEP - Host Script
 * v3.2.0
 */

// تحميل الوحدات
#include "modules/Config.jsx"
#include "modules/Utilities.jsx"
#include "modules/ExpressionLoader.jsx"
#include "modules/TypewriterManager.jsx"
#include "modules/BoxManager.jsx"
#include "modules/MultiLinesManager.jsx"
#include "modules/SogaManager.jsx"
#include "modules/LayerOperations.jsx"
#include "modules/PresetManager.jsx"
#include "modules/ImportExport.jsx"

$.writeln("[TEXTORO] All modules loaded - v3.2.0");
```

---

تاريخ الإنشاء: 2024-12-22
