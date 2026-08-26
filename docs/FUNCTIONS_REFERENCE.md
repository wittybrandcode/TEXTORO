# 📝 TEXTORO Functions Reference

> **Version**: 3.3.0 | **Last Updated**: December 24, 2024

---

## 📋 Table of Contents

1. [Module Overview](#module-overview)
2. [Config Module](#config-module)
3. [Utilities Module](#utilities-module)
4. [ExpressionLoader Module](#expressionloader-module)
5. [TypewriterManager Module](#typewritermanager-module)
6. [BoxManager Module](#boxmanager-module)
7. [MultiLinesManager Module](#multilinesmanager-module)
8. [SogaManager Module](#sogamanager-module)
9. [LayerOperations Module](#layeroperations-module)
10. [PresetManager Module](#presetmanager-module)
11. [ImportExport Module](#importexport-module)
12. [MotionManager Module](#motionmanager-module)

---

## Module Overview

| Module | Functions | Lines | Purpose |
|--------|-----------|-------|---------|
| Config | 1 | 150 | Constants & Configuration |
| Utilities | 40 | 750 | Helper Functions |
| ExpressionLoader | 14 | 560 | Expression Management |
| TypewriterManager | 15 | 498 | Typewriter Effect |
| BoxManager | 18 | 527 | Box/Background System |
| MultiLinesManager | 8 | 393 | Multi-Line Text |
| SogaManager | 14 | 446 | Live Edit Panel |
| LayerOperations | 12 | 388 | Layer Utilities |
| PresetManager | 28 | 1680 | Preset System |
| ImportExport | 10 | 408 | Import/Export |
| MotionManager | 16 | 654 | Motion Animation |
| **Total** | **176** | **6,454** | |

---

## Config Module

**File**: `host/modules/Config.jsx` | **Version**: 1.1.0

### Functions

#### checkAECompatibility()
```javascript
/**
 * فحص توافق إصدار After Effects
 * @returns {Object} - {compatible: bool, version: number, message: string}
 */
function checkAECompatibility()
```

### Constants

```javascript
var AE_MIN_VERSION = 13.0;  // CC 2016
var AE_MAX_VERSION = 99.9;

var CONFIG = {
    SCRIPT_NAME: "TEXTORO",
    VERSION: "3.3.0",
    
    LIMITS: {
        MIN_DURATION: 0.1,
        MAX_DURATION: 30
    },
    
    DEFAULTS: {
        TW_DURATION: 2,
        BLINK_SPEED: 2,
        BLINK_MODE: 1,
        CURSOR_SPACING: 0,
        HIDE_DELAY: 0.5,
        RANDOM_SPEED: 0
    },
    
    TEXT: {
        RTL: "أطلق النص أطلق الثور",
        LTR: "Unleash the Text"
    },
    
    EXPRESSIONS: {
        TYPEWRITER: { DEFAULT: "v1.3", AVAILABLE: ["v1.0", "v1.1", "v1.2", "v1.3"] },
        CURSOR: { DEFAULT: "v1.0", AVAILABLE: ["v1.0"] },
        BOX: { DEFAULT: "v1.0", AVAILABLE: ["v1.0"] },
        MOTION: { DEFAULT: "v1.0", AVAILABLE: ["v1.0"] }
    },
    
    CURSOR_SHAPES: {
        0: "|", 1: "_", 2: "█", 3: "▌", 4: "▎", 5: "●", 6: "◆"
    },
    
    EASING: {
        LINEAR: 0, EASE_OUT: 1, EASE_IN: 2, EASE_IN_OUT: 3,
        BOUNCE: 4, ELASTIC: 5, SPRING: 6
    }
};

var BOX_CONFIG = {
    BEZIER_K: 0.5523,
    LABEL_BOX: 9,
    DEFAULTS: { ... },
    LIMITS: { ... }
};
```

---

## Utilities Module

**File**: `host/modules/Utilities.jsx` | **Version**: 1.2.0

### New Functions (v1.2.0)

#### getExtensionPath()
```javascript
/**
 * الحصول على مسار الإضافة ديناميكياً
 * @returns {string} مسار جذر الإضافة
 */
function getExtensionPath()
```

#### safeJSONParse()
```javascript
/**
 * تحليل JSON بشكل آمن
 * @param {string} str - نص JSON
 * @param {*} defaultVal - القيمة الافتراضية عند الفشل
 * @returns {*} الكائن المحلل أو القيمة الافتراضية
 */
function safeJSONParse(str, defaultVal)
```

#### _normalizePath()
```javascript
/**
 * تطبيع المسار (forward slashes)
 * @param {string} path - المسار
 * @returns {string} المسار المطبّع
 */
function _normalizePath(path)
```

**File**: `host/modules/Utilities.jsx`

### Response Functions

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `success(msg, data)` | msg: string, data?: any | JSON string | Create success response |
| `error(msg)` | msg: string | JSON string | Create error response |

### Validation Functions

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `validateNumber(value, min, max, defaultVal)` | value, min, max, default | number | Validate and clamp number |
| `validateBoolean(value, defaultVal)` | value, default | boolean | Validate boolean |

### Color Functions

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `hexToRgb(color)` | hex string or RGB array | [r,g,b] (0-1) | Convert hex to RGB |
| `rgbToHex(rgb)` | [r,g,b] (0-1) | hex string | Convert RGB to hex |

### Composition Functions

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `getActiveComp()` | - | CompItem or null | Get active composition |
| `getCompInfo()` | - | JSON with comp info | Get composition details |

### Layer Functions

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `getSelectedTextLayer(comp)` | CompItem | TextLayer or null | Get selected text layer |
| `getSelectedLayers(comp)` | CompItem | Array | Get all selected layers |
| `getSelectedTextLayers(comp)` | CompItem | Array | Get selected text layers |

### Effect Functions

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `findEffectControl(fx, name)` | PropertyGroup, string | Property or null | Find effect by name |
| `addSlider(fx, name, value)` | PropertyGroup, string, number | Property | Add/update slider |
| `addCheckbox(fx, name, value)` | PropertyGroup, string, boolean | Property | Add/update checkbox |
| `addColor(fx, name, value)` | PropertyGroup, string, color | Property | Add/update color |
| `addPoint(fx, name, point)` | PropertyGroup, string, [x,y] | Property | Add point control |
| `getEffectValue(layer, name, propName)` | Layer, string, string | any | Get effect value |
| `setEffectValue(layer, name, propName, value)` | Layer, string, string, any | boolean | Set effect value |
| `hasEffect(layer, name)` | Layer, string | boolean | Check if effect exists |
| `removeEffect(layer, name)` | Layer, string | boolean | Remove effect |
| `removeEffectControls(fx, names)` | PropertyGroup, Array | void | Remove multiple effects |

### Marker Functions

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `getTextFromMarker(markers)` | Property | string or null | Get text from TW_TEXT marker |
| `removeMarkers(markers, patterns)` | Property, Array | void | Remove markers by pattern |

### Animator Functions

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `removeAnimatorsByName(animators, names)` | PropertyGroup, Array | void | Remove animators by name |

### Text Functions

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `getLayerText(layer)` | TextLayer | string | Get layer text content |
| `setLayerText(layer, text)` | TextLayer, string | boolean | Set layer text content |
| `getTextProperties(layer)` | TextLayer | Object | Get text properties |

### ID System Functions

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `generateBaseId()` | - | string | Generate unique ID (tx_xxx) |
| `parseLayerName(layerName)` | string | Object | Parse layer name for flags |
| `buildLayerName(baseId, hasT, hasB)` | string, bool, bool | string | Build layer name |
| `getBaseId(layer)` | Layer | string | Get base ID from layer |
| `getOriginalText(layer)` | Layer | string or null | Get original text from comment |
| `setOriginalText(layer, text)` | Layer, string | void | Store original text |
| `clearOriginalText(layer)` | Layer | void | Clear original text |
| `updateLayerFlags(layer, addT, addB)` | Layer, bool, bool | string | Update layer flags |
| `removeLayerFlag(layer, flag, originalName)` | Layer, string, string | void | Remove flag |
| `getLayerStatus(layer)` | Layer | Object | Get layer effect status |
| `findBoxLayerById(comp, baseId)` | CompItem, string | Layer or null | Find box layer |

---

## TypewriterManager Module

**File**: `host/modules/TypewriterManager.jsx`

### Public Functions

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `applyTypewriter(optsJSON)` | JSON string | JSON result | Apply typewriter effect |
| `removeTypewriter()` | - | JSON result | Remove typewriter effect |
| `getLayerText()` | - | JSON with text | Get selected layer text |
| `updateLayerText(optsJSON)` | JSON with text | JSON result | Update layer text |
| `hasTypewriter(layer)` | Layer | boolean | Check if has typewriter |

### Options Schema

```javascript
{
    direction: "ltr" | "rtl",
    customText: string | null,
    inStart: number,
    inEnd: number,
    outStart: number,      // -1 to disable
    outEnd: number,        // -1 to disable
    noOut: boolean,
    showCursor: boolean,
    cursorBefore: boolean,
    cursorType: number,    // 0-6, -1 for custom
    customCursor: string,
    cursorColor: string,   // hex
    cursorSpacing: number,
    blinkSpeed: number,
    blinkStart: number,
    blinkEnd: number,
    blinkInHold: boolean,
    reverse: boolean,
    wordMode: boolean,
    randomSpeed: number,   // 0-100
    applyTextColor: boolean,
    textColor: string      // hex
}
```

---

## BoxManager Module

**File**: `host/modules/BoxManager.jsx`

### Public Functions

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `applyBox(optsJSON)` | JSON string | JSON result | Apply box background |
| `removeBox()` | - | JSON result | Remove box |
| `updateBox(optsJSON)` | JSON string | JSON result | Update box properties |
| `hasBox(layer)` | Layer | boolean | Check if has box |

### Options Schema

```javascript
{
    paddingLeft: number,
    paddingRight: number,
    paddingTop: number,
    paddingBottom: number,
    cornerTL: number,
    cornerTR: number,
    cornerBL: number,
    cornerBR: number,
    strokeWidth: number,
    strokeOpacity: number,
    strokeColor: string,   // hex
    strokeDash: number,
    strokeGap: number,
    fillOpacity: number,
    fillColor: string,     // hex
    lockSize: boolean,
    pathOffset: number,
    trimStart: number,
    trimEnd: number,
    trimOffset: number
}
```

---

## MotionManager Module

**File**: `host/modules/MotionManager.jsx`

### Public Functions

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `applyMotion(optsJSON)` | JSON string | JSON result | Apply motion animation |
| `removeMotion()` | - | JSON result | Remove motion |
| `applyMotionPreset(optsJSON)` | JSON string | JSON result | Apply motion preset |
| `applyMotionMulti(optsJSON)` | JSON string | JSON result | Apply to multiple layers |
| `applyMotionPresetMulti(optsJSON)` | JSON string | JSON result | Preset to multiple layers |
| `getMotionSelectionCount()` | - | JSON with count | Get selected text layers count |
| `getMotionPresets()` | - | JSON with presets | List motion presets |
| `hasMotion(layer)` | Layer | boolean | Check if has motion |

### Options Schema

```javascript
{
    inStart: number,
    inEnd: number,
    outStart: number,      // -1 to disable
    outEnd: number,        // -1 to disable
    syncMode: number,      // 0=Manual, 1=Typewriter markers
    
    // Position
    animatePosition: boolean,
    posFromX: number,
    posFromY: number,
    posToX: number,
    posToY: number,
    
    // Scale
    animateScale: boolean,
    scaleFrom: number,     // percentage
    scaleTo: number,       // percentage
    
    // Rotation
    animateRotation: boolean,
    rotFrom: number,       // degrees
    rotTo: number,         // degrees
    
    // Opacity
    animateOpacity: boolean,
    opacityFrom: number,   // 0-100
    opacityTo: number,     // 0-100
    
    // Easing
    easingType: number,    // 0-6
    easingStrength: number,// 0-200
    
    // Multi-layer
    stagger: number        // seconds between layers
}
```

### Easing Types

| Value | Type | Description |
|-------|------|-------------|
| 0 | Linear | No easing |
| 1 | Ease Out | Decelerate |
| 2 | Ease In | Accelerate |
| 3 | Ease In Out | Accelerate then decelerate |
| 4 | Bounce | Bouncy effect |
| 5 | Elastic | Elastic overshoot |
| 6 | Spring | Spring physics |

---

## PresetManager Module

**File**: `host/modules/PresetManager.jsx`

### Public Functions

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `loadPresets(optsJSON)` | JSON with category | JSON with presets | Load presets by category |
| `applyPreset(optsJSON)` | JSON with fileName | JSON result | Apply preset |
| `savePreset(optsJSON)` | JSON with preset data | JSON result | Save custom preset |
| `deletePreset(optsJSON)` | JSON with fileName | JSON result | Delete preset |
| `applyToro(optsJSON)` | JSON with fileName | JSON result | Apply TORO template |
| `applyMix(optsJSON)` | JSON with fileName | JSON result | Apply Mix preset |

### Categories

| Category | Description | Folder |
|----------|-------------|--------|
| `type` | Typewriter presets | `config/presets/type/` |
| `box` | Box presets | `config/presets/box/` |
| `motion` | Motion presets | `config/presets/motion/` |
| `mix` | Combined presets | `config/presets/mix/` |
| `toro` | Complete templates | `config/presets/toro/` |

---

## SogaManager Module

**File**: `host/modules/SogaManager.jsx`

### Public Functions

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `getSogaValues()` | - | JSON with all values | Get all effect values |
| `setSogaValues(optsJSON)` | JSON with values | JSON result | Set effect values |
| `getSogaTypewriter()` | - | JSON with TW values | Get typewriter values |
| `setSogaTypewriter(optsJSON)` | JSON with values | JSON result | Set typewriter values |
| `getSogaBox()` | - | JSON with box values | Get box values |
| `setSogaBox(optsJSON)` | JSON with values | JSON result | Set box values |
| `getSogaMotion()` | - | JSON with motion values | Get motion values |
| `setSogaMotion(optsJSON)` | JSON with values | JSON result | Set motion values |

---

## ImportExport Module

**File**: `host/modules/ImportExport.jsx`

### Public Functions

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `exportPresets(optsJSON)` | JSON with presets | JSON result | Export presets to ZIP |
| `importPresets(optsJSON)` | JSON with path | JSON result | Import presets from ZIP |
| `exportLayer(optsJSON)` | JSON with options | JSON result | Export layer settings |
| `importLayer(optsJSON)` | JSON with settings | JSON result | Import layer settings |

---

## Response Format

All public functions return JSON strings:

### Success Response

```json
{
    "success": true,
    "message": "Operation completed",
    "data": { ... }
}
```

### Error Response

```json
{
    "success": false,
    "error": "Error message"
}
```

---

<div align="center">

**TEXTORO** - Professional Text Animation for After Effects

</div>
