# 🔧 التصحيحات الفورية المطلوبة
## Immediate Fixes Required

---

## 1. إزالة الدوال المكررة من BoxManager.jsx

### الدوال المطلوب حذفها (السطور 30-55):

```javascript
// ❌ يجب حذف هذه الدوال - موجودة في Utilities.jsx

/**
 * الحصول على النص الأصلي من Layer Comment
 */
function getOriginalText(layer) {
    var comment = layer.comment;
    if (!comment || comment.indexOf("TEXTORO_TEXT:") !== 0) return null;
    return comment.substring(13);
}

/**
 * تخزين النص الأصلي في Layer Comment
 */
function setOriginalText(layer, text) {
    layer.comment = "TEXTORO_TEXT:" + text;
}

/**
 * مسح النص الأصلي من Layer Comment
 */
function clearOriginalText(layer) {
    if (layer.comment && layer.comment.indexOf("TEXTORO_TEXT:") === 0) {
        layer.comment = "";
    }
}
```

**السبب:** هذه الدوال موجودة بالفعل في `Utilities.jsx` (السطور 280-310)

---

## 2. توحيد VERSION في Config.jsx

### الملف: `host/modules/Config.jsx`
### السطر: 47

```javascript
// ❌ الحالي
var CONFIG = {
    SCRIPT_NAME: "TEXTORO",
    VERSION: "3.2.0",  // غير متزامن!
    // ...
};

// ✅ التصحيح
var CONFIG = {
    SCRIPT_NAME: "TEXTORO",
    VERSION: "3.4.0",  // متزامن مع js/core/Config.js
    // ...
};
```

---

## 3. حذف المتغيرات غير المستخدمة من PresetsPanel.js

### الملف: `js/panels/PresetsPanel.js`
### السطور الأخيرة (~380-390):

```javascript
// ❌ يجب حذف هذه المتغيرات - غير مستخدمة
var currentPresetsFilter = 'all';
var presetsSearchQuery = '';
var allPresetsHubCache = [];
var currentPresetsSort = 'name-asc';
var presetsFavorites = [];
```

---

## 4. إصلاح الدوال الفارغة في PresetsPanel.js

### السطور الأخيرة:

```javascript
// ❌ دوال فارغة بلا فائدة
function loadPresetsFavorites() {}
function savePresetsFavorites() {}
function sortPresets(p, s) { return p; }
function createPresetItemElement(p) { return document.createElement('div'); }
function buildPresetTooltipHub(p) { return ''; }
function confirmDeletePreset(p) { TEXTORO.Panels.Presets.confirmDelete(p); }
function showPresetContextMenu(e, p) {}

// ✅ الحل: حذفها أو نقلها لملف legacy-aliases.js
```

---

## 5. إصلاح hexToRgb المكررة في BoxPanel.js

### الملف: `js/panels/BoxPanel.js`

```javascript
// ❌ الحالي - دالة محلية مكررة
function hexToRgb(hex) {
    if (!hex) return [1, 1, 1];
    hex = hex.replace('#', '');
    var r = parseInt(hex.substring(0, 2), 16) / 255;
    var g = parseInt(hex.substring(2, 4), 16) / 255;
    var b = parseInt(hex.substring(4, 6), 16) / 255;
    return [r, g, b];
}

// ✅ الحل: استخدام TEXTORO.Utils.hexToRgb أو إضافتها لـ Utils.js
```

---

## 📋 قائمة التحقق

- [ ] حذف `getOriginalText`, `setOriginalText`, `clearOriginalText` من BoxManager.jsx
- [ ] تحديث VERSION في Config.jsx إلى "3.4.0"
- [ ] حذف المتغيرات غير المستخدمة من PresetsPanel.js
- [ ] حذف الدوال الفارغة من PresetsPanel.js
- [ ] توحيد hexToRgb في Utils.js

---

## ⚡ أولوية التنفيذ

| الإصلاح | الأولوية | الوقت المقدر |
|---------|----------|--------------|
| توحيد VERSION | 🔴 عالية | 1 دقيقة |
| حذف الدوال المكررة | 🔴 عالية | 5 دقائق |
| حذف المتغيرات غير المستخدمة | 🟡 متوسطة | 2 دقيقة |
| توحيد hexToRgb | 🟢 منخفضة | 5 دقائق |

---

*إجمالي الوقت المقدر: 15 دقيقة*
