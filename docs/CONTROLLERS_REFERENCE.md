# 🎛️ TEXTORO Controllers Reference

> **Version**: 3.5.0 | **Last Updated**: December 31, 2024

---

## 📋 Overview

TEXTORO uses a centralized Controller Management System to handle all Effect Controls across modules. This system provides:

- **74 Controllers** across 3 categories
- **JSON-based registry** for easy maintenance
- **Shared expressions** to eliminate code duplication
- **Backward compatibility** with existing projects

---

## 📁 File Structure

```
TEXTORO/
├── config/
│   ├── controllers/
│   │   ├── _registry.json      # Master registry
│   │   ├── _schema.json        # JSON Schema validation
│   │   ├── typewriter.json     # 14 controllers
│   │   ├── box.json            # 26 controllers
│   │   └── motion.json         # 34 controllers
│   └── expressions/
│       └── _registry.json      # Expressions registry
│
├── host/
│   ├── modules/
│   │   └── ControllerManager.jsx  # Central management
│   └── expressions/
│       ├── shared/
│       │   ├── easing.js       # easeVal() function
│       │   └── timing.js       # Timing & Sync code
│       └── motion/v1.0/
│           ├── position.js
│           ├── scale.js
│           ├── rotation.js
│           └── opacity.js
```

---

## 📊 Controller Categories

### Typewriter (14 Controllers)

| Controller | Type | Default | Description |
|------------|------|---------|-------------|
| TW Progress | slider | 0 | نسبة التقدم اليدوي |
| TW Auto | checkbox | true | التشغيل التلقائي |
| TW Reverse | checkbox | false | وضع الحذف |
| Word Mode | checkbox | false | وضع الكلمات (للعربية) |
| Random Speed | slider | 0 | سرعة عشوائية |
| Show Cursor | checkbox | true | إظهار المؤشر |
| Cursor Before Text | checkbox | false | المؤشر قبل النص |
| Cursor Type | slider | 0 | شكل المؤشر (0-6) |
| Cursor Color | color | [1,1,1] | لون المؤشر |
| Cursor Spacing | slider | 0 | المسافة بين المؤشر والنص |
| Blink Speed | slider | 2 | سرعة الوميض |
| Blink In Hold | checkbox | true | الوميض أثناء الانتظار |
| Easing Type | slider | 1 | نوع التسهيل |
| Easing Strength | slider | 100 | قوة التسهيل |

### Box (26 Controllers)

| Group | Controllers |
|-------|-------------|
| Padding | Left, Right, Top, Bottom |
| Corner | Radius, TL, TR, BR, BL |
| Stroke | Width, Opacity, Color, Dash, Gap |
| Fill | Opacity, Color |
| Text Color | Text Color (conditional) |
| Trim | Start, End, Offset, Path Offset |
| Lock | Lock Box Size, Locked Width/Height/Left/Top/Right |

### Motion (34 Controllers)

| Group | Controllers |
|-------|-------------|
| Timing | In Start, In End, Out Start, Out End, Sync Mode |
| Position IN | Animate Position, Pos From X/Y, Pos To X/Y |
| Position OUT | Pos Link Mode, Pos Out From X/Y, Pos Out To X/Y |
| Scale IN | Animate Scale, Scale From, Scale To |
| Scale OUT | Scale Link Mode, Scale Out From/To |
| Rotation IN | Animate Rotation, Rot From, Rot To |
| Rotation OUT | Rot Link Mode, Rot Out From/To |
| Opacity IN | Animate Opacity, Opacity From, Opacity To |
| Opacity OUT | Opacity Link Mode, Opacity Out From/To |
| Easing | Motion Easing Type, Motion Easing Strength |


---

## 🔧 ControllerManager API

### Loading Functions

```javascript
// Load master registry
loadControllerRegistry(forceReload)

// Load category-specific controllers
loadCategoryControllers(category)  // "typewriter", "box", "motion"
```

### Controller Creation/Removal

```javascript
// Create controllers on a layer
createControllersFromRegistry(layer, category, values, only)

// Remove controllers from a layer
removeControllersFromRegistry(layer, category)
```

### Value Functions

```javascript
// Get controller value
getControllerValue(layer, name)

// Set controller value
setControllerValue(layer, name, value)

// Get default values for a category
getControllerDefaults(category)

// Validate a value against schema
validateControllerValue(category, name, value)
```

### Expression Building

```javascript
// Load shared expression
loadSharedExpression(name)  // "easing", "timing"

// Load motion expression
loadMotionExpression(name)  // "position", "scale", "rotation", "opacity"

// Build complete expression with shared code
buildMotionExpression(exprType, sharedList)

// Get inline code (for backward compatibility)
getEaseValCode()
getTimingSyncCode()
```

### Cache Management

```javascript
// Clear all caches
clearControllerCache()

// Reload entire system
reloadControllerSystem()
```

---

## 🎨 Easing Types

| Value | Name | Description |
|-------|------|-------------|
| 0 | Linear | خطي |
| 1 | Ease Out | تباطؤ |
| 2 | Ease In | تسارع |
| 3 | Ease In Out | تسارع وتباطؤ |
| 4 | Bounce | ارتداد |
| 5 | Elastic | مرن |
| 6 | Spring | زنبرك |

---

## 📝 Usage Examples

### Creating Motion Controllers

```javascript
// Using the new system
var values = {
    "Motion In Start": 0,
    "Motion In End": 1,
    "Animate Position": true,
    "Pos From Y": 50,
    "Motion Easing Type": 1
};
createControllersFromRegistry(layer, "motion", values);
```

### Building Motion Expression

```javascript
// Build position expression with shared code
var expr = buildMotionExpression("position", ["easing", "timing"]);
layer.property("ADBE Position").expression = expr;
```

### Getting Default Values

```javascript
var defaults = getControllerDefaults("typewriter");
// Returns: { "TW Progress": 0, "TW Auto": true, ... }
```

---

## 🔄 Backward Compatibility

The system maintains full backward compatibility:

1. **Fallback mechanism**: If ControllerManager is not loaded, modules use inline code
2. **Same controller names**: All Effect Control names remain unchanged
3. **Existing projects**: Work without modification
4. **Expression compatibility**: Expressions read the same controller names

---

## 📈 Performance Benefits

| Metric | Before | After | Savings |
|--------|--------|-------|---------|
| EASE_VAL_CODE duplicates | 8 | 1 | ~3200 chars |
| TIMING_SYNC_CODE duplicates | 8 | 1 | ~4000 chars |
| Controller definitions | Inline | JSON | Centralized |
| Expression files | Embedded | Separate | Maintainable |
