# TEXTORO API Reference
## مرجع الدوال والواجهات البرمجية

**Version:** 3.2.1 | **Updated:** December 2024

---

## 🏗️ Modular Architecture (v3.2.1)

> تم تحويل الكود إلى بنية معمارية مُعيارية تتكون من 10 وحدات مستقلة.

### Module Structure

```
TEXTORO/host/
├── index.jsx              # Loader (~60 lines)
└── modules/
    ├── Config.jsx         # Settings & constants
    ├── Utilities.jsx      # Helper functions
    ├── ExpressionLoader.jsx # Expression system
    ├── TypewriterManager.jsx # Typewriter effect
    ├── BoxManager.jsx     # Box effect
    ├── MultiLinesManager.jsx # Multi-line support
    ├── SogaManager.jsx    # Live editing
    ├── LayerOperations.jsx # Layer operations
    ├── PresetManager.jsx  # Preset management
    └── ImportExport.jsx   # Import/Export
```

### Module Load Flags

```javascript
// Each module defines a load flag for verification
var CONFIG_MODULE_LOADED = true;
var UTILITIES_MODULE_LOADED = true;
var EXPRESSIONLOADER_MODULE_LOADED = true;
var TYPEWRITERMANAGER_MODULE_LOADED = true;
var BOXMANAGER_MODULE_LOADED = true;
var MULTILINESMANAGER_MODULE_LOADED = true;
var SOGAMANAGER_MODULE_LOADED = true;
var LAYEROPERATIONS_MODULE_LOADED = true;
var PRESETMANAGER_MODULE_LOADED = true;
var IMPORTEXPORT_MODULE_LOADED = true;
```

### Module Dependencies

| Module | Dependencies |
|--------|--------------|
| Config.jsx | None |
| Utilities.jsx | Config |
| ExpressionLoader.jsx | Config, Utilities |
| TypewriterManager.jsx | Config, Utilities, ExpressionLoader |
| BoxManager.jsx | Config, Utilities, ExpressionLoader |
| MultiLinesManager.jsx | TypewriterManager, BoxManager |
| SogaManager.jsx | All above |
| LayerOperations.jsx | Utilities |
| PresetManager.jsx | Config, Utilities |
| ImportExport.jsx | PresetManager |

---

## 0. UI State Management (v2.5.12)

### StateManager

```javascript
/**
 * Get current UI state
 * @returns {Object} - State object with activeTab, collapsedSections, etc.
 */
StateManager.getState()

/**
 * Set a value in state (auto-saves to localStorage)
 * @param {string} key - Dot-notation key (e.g., "collapsedSections.type-cursor")
 * @param {*} value - Value to set
 */
StateManager.setState(key, value)

/**
 * Get a value from state with fallback
 * @param {string} key - Dot-notation key
 * @param {*} defaultValue - Fallback value
 * @returns {*} - Value or default
 */
StateManager.getValue(key, defaultValue)

/**
 * Reset state to defaults
 */
StateManager.reset()
```

### CollapsibleSection

```javascript
/**
 * Initialize a collapsible section
 * @param {Object} config - {id, header, content, defaultCollapsed}
 */
CollapsibleSection.init(config)

/**
 * Toggle section state
 * @param {string} id - Section ID
 */
CollapsibleSection.toggle(id)

/**
 * Expand section
 * @param {string} id - Section ID
 * @param {boolean} animate - Enable animation (default: true)
 */
CollapsibleSection.expand(id, animate)

/**
 * Collapse section
 * @param {string} id - Section ID
 * @param {boolean} animate - Enable animation (default: true)
 */
CollapsibleSection.collapse(id, animate)

/**
 * Check if section is collapsed
 * @param {string} id - Section ID
 * @returns {boolean}
 */
CollapsibleSection.isCollapsed(id)
```

### Arena Search (v2.5.12)

```javascript
/**
 * Filter presets based on search query
 * Uses global arenaSearchQuery variable
 */
function filterArenaPresets()

/**
 * Build tooltip text for preset card
 * @param {Object} preset - Preset object
 * @param {string} category - Preset category
 * @returns {string} - Tooltip text
 */
function buildPresetTooltip(preset, category)
```

---

## 1. JavaScript Functions (main.js)

### 1.1 Frame-Based Time System

```javascript
/**
 * Normalize seconds.frames value
 * @param {number|string} value - Input value (e.g., "1.35")
 * @param {number} fps - Frames per second
 * @returns {string} - Normalized value (e.g., "2.10")
 * 
 * Examples:
 *   normalizeSF("1.35", 25) → "2.10"  // 35 frames > 25
 *   normalizeSF("2.50", 25) → "3.00"  // 50 frames = 2 seconds
 *   normalizeSF("2.3562", 25) → "2.36" // truncate to 2 decimals
 */
function normalizeSF(value, fps)

/**
 * Convert seconds.frames to real seconds
 * @param {number|string} sfValue - Value in sec.frames format
 * @param {number} fps - Frames per second
 * @returns {number} - Real seconds
 * 
 * Examples:
 *   sfToSeconds("2.12", 25) → 2.48
 *   sfToSeconds("3.00", 25) → 3.00
 */
function sfToSeconds(sfValue, fps)

/**
 * Convert real seconds to seconds.frames format
 * @param {number} realSeconds - Real seconds
 * @param {number} fps - Frames per second
 * @returns {string} - Formatted value
 * 
 * Examples:
 *   secondsToSF(2.48, 25) → "2.12"
 *   secondsToSF(3.00, 25) → "3.00"
 */
function secondsToSF(realSeconds, fps)

/**
 * Increment by 1 frame
 * @param {string} value - Current value
 * @param {number} fps - Frames per second
 * @returns {string} - New value
 * 
 * Examples:
 *   incrementFrame("2.24", 25) → "3.00"
 *   incrementFrame("2.12", 25) → "2.13"
 */
function incrementFrame(value, fps)

/**
 * Decrement by 1 frame
 * @param {string} value - Current value
 * @param {number} fps - Frames per second
 * @returns {string} - New value
 * 
 * Examples:
 *   decrementFrame("3.00", 25) → "2.24"
 *   decrementFrame("0.00", 25) → "0.00"
 */
function decrementFrame(value, fps)

/**
 * Get time value from input as real seconds
 * @param {string} inputId - Input element ID
 * @param {number} defaultVal - Default value
 * @returns {number} - Real seconds
 */
function getTimeNum(inputId, defaultVal)
```

### 1.2 Host Communication

```javascript
/**
 * Run ExtendScript function
 * @param {string} funcName - Function name in host/index.jsx
 * @param {object|null} params - Parameters (will be JSON stringified)
 * @param {function} callback - Callback function(result)
 * 
 * Example:
 *   runHostScript('applyTypewriter', opts, function(res) {
 *       if (res.success) { ... }
 *   });
 */
function runHostScript(funcName, params, callback)
```

### 1.3 UI Functions

```javascript
/**
 * Set status message
 * @param {string} msg - Message text
 * @param {string} type - 'success' | 'error' | 'info'
 */
function setStatus(msg, type)

/**
 * Update action bar buttons for tab
 * @param {string} tab - Tab name ('type', 'box', 'arena', 'soga', 'settings')
 */
function updateActionBar(tab)

/**
 * Get text direction
 * @returns {string} - 'ltr' or 'rtl'
 */
function getDirection()

/**
 * Get text alignment
 * @returns {string} - 'left', 'center', or 'right'
 */
function getAlignment()

/**
 * Get cursor type value
 * @returns {number} - 0-7 for preset, -1 for custom
 */
function getCursorType()
```

---

## 2. ExtendScript Functions (host/index.jsx)

### 2.1 Response Helpers

```javascript
/**
 * Create success response
 * @param {string} msg - Message
 * @param {*} data - Optional data
 * @returns {string} - JSON string
 */
function success(msg, data)

/**
 * Create error response
 * @param {string} msg - Error message
 * @returns {string} - JSON string
 */
function error(msg)
```

### 2.2 Typewriter Functions

```javascript
/**
 * Apply typewriter effect to selected layer
 * @param {string} optsJSON - JSON options
 * @returns {string} - JSON response
 * 
 * Options:
 *   - direction: 'ltr' | 'rtl'
 *   - customText: string | null
 *   - inStart, inEnd, outStart, outEnd: number (seconds)
 *   - noOut: boolean
 *   - showCursor: boolean
 *   - cursorBefore: boolean
 *   - cursorType: number
 *   - customCursor: string
 *   - cursorColor: string (hex)
 *   - cursorSpacing: number
 *   - blinkSpeed: number
 *   - blinkStart, blinkEnd: number
 *   - blinkInHold: boolean
 *   - reverse: boolean
 *   - randomSpeed: number (0-100)
 */
function applyTypewriter(optsJSON)

/**
 * Remove typewriter effect from selected layer
 * @returns {string} - JSON response
 */
function removeTypewriter()

/**
 * Get text from selected layer
 * @returns {string} - JSON response with text
 */
function getLayerText()

/**
 * Update text in selected layer
 * @param {string} optsJSON - {text: string}
 * @returns {string} - JSON response
 */
function updateLayerText(optsJSON)
```

### 2.3 Box Functions

```javascript
/**
 * Create box layer for selected text
 * @param {string} optsJSON - JSON options
 * @returns {string} - JSON response
 * 
 * Options:
 *   - paddingLeft, paddingRight, paddingTop, paddingBottom: number
 *   - cornerRadius: number (or cornerTL, cornerTR, cornerBL, cornerBR)
 *   - strokeWidth, strokeOpacity: number
 *   - strokeColor: string (hex)
 *   - strokeDash, strokeGap: number
 *   - fillOpacity: number
 *   - fillColor: string (hex)
 *   - textColor: string (hex)
 *   - applyTextColor: boolean
 *   - lockSize: boolean
 */
function createBox(optsJSON)

/**
 * Remove box from selected text layer
 * @returns {string} - JSON response
 */
function removeBox()
```

### 2.4 Selection & Info Functions

```javascript
/**
 * Get info about selected layer
 * @returns {string} - JSON response
 * 
 * Response data:
 *   - id: string (unique layer ID)
 *   - text: string (layer text)
 *   - compId: number (composition ID)
 */
function getSelectionInfo()

/**
 * Get composition info
 * @returns {string} - JSON response
 * 
 * Response data:
 *   - fps: number
 *   - frameDuration: number
 *   - duration: number
 *   - width, height: number
 */
function getCompInfo()

/**
 * Get multi-selection info
 * @returns {string} - JSON response
 * 
 * Response data:
 *   - count: number (selected layers count)
 *   - layers: array of layer info
 */
function getMultiSelectionInfo()
```

### 2.5 Soga (Live Edit) Functions

```javascript
/**
 * Get effect values from selected layer
 * @returns {string} - JSON response
 * 
 * Response data:
 *   - layerName: string
 *   - hasTypewriter: boolean
 *   - hasBox: boolean
 *   - typewriter: { twProgress, twAuto, ... }
 *   - box: { paddingLeft, cornerTL, ... }
 */
function getLayerEffectValues()

/**
 * Set effect values on selected layer
 * @param {string} optsJSON - JSON with values to set
 * @returns {string} - JSON response
 */
function setLayerEffectValues(optsJSON)
```

### 2.6 Preset Functions

```javascript
/**
 * Save preset to file
 * @param {string} optsJSON - Preset data
 * @returns {string} - JSON response
 */
function savePreset(optsJSON)

/**
 * Load preset from file
 * @param {string} optsJSON - {path: string}
 * @returns {string} - JSON response with preset data
 */
function loadPreset(optsJSON)

/**
 * Delete preset file
 * @param {string} optsJSON - {path: string}
 * @returns {string} - JSON response
 */
function deletePreset(optsJSON)

/**
 * Get list of all presets
 * @returns {string} - JSON response with presets array
 */
function getPresetsList()
```

### 2.7 Multi-line Functions

```javascript
/**
 * Split text layer into multiple layers
 * @param {string} optsJSON - Options
 * @returns {string} - JSON response
 * 
 * Options:
 *   - lineSpacing: number
 *   - alignment: 'left' | 'center' | 'right'
 *   - deleteOriginal: boolean
 */
function splitTextToLayers(optsJSON)

/**
 * Split text and apply typewriter to each line
 * @param {string} optsJSON - Split + typewriter options
 * @returns {string} - JSON response
 */
function splitAndApply(optsJSON)
```

### 2.8 Expression Functions

```javascript
/**
 * Load expression from file
 * @param {string} category - 'typewriter', 'cursor', 'box'
 * @param {string} name - Expression name
 * @param {string} version - Version (optional)
 * @returns {string} - Expression code
 */
function loadExpression(category, name, version)

/**
 * Get available versions for expression
 * @param {string} optsJSON - {category, name}
 * @returns {string} - JSON response with versions array
 */
function getAvailableVersionsJS(optsJSON)

/**
 * Set active version for expression
 * @param {string} optsJSON - {category, name, version}
 * @returns {string} - JSON response
 */
function setActiveVersionJS(optsJSON)
```

---

## 3. CSS Classes Reference

### 3.1 Layout Classes

| Class | Description |
|-------|-------------|
| `.soga-box` | Section container with border |
| `.soga-title` | Section header with icon |
| `.soga-group` | Property group |
| `.soga-group-title` | Group label |
| `.soga-table` | Main table layout |
| `.soga-table-4` | 4-column compact table |
| `.soga-table-props` | Properties table |

### 3.2 Input Classes

| Class | Description |
|-------|-------------|
| `.ti` | Text input |
| `.ta` | Textarea |
| `.ni` | Number input |
| `.ci` | Color input |
| `.sel` | Select dropdown |
| `.nw` | Number wrapper (with spinners) |

### 3.3 Button Classes

| Class | Description |
|-------|-------------|
| `.ab` | Action button (44x44px) |
| `.ab-p` | Primary (blue) |
| `.ab-d` | Danger (red) |
| `.ab-icon` | Icon-only button |
| `.ib` | Icon button (small) |
| `.btn-s` | Small button |
| `.tb` | Toggle button |
| `.tg` | Toggle group |

### 3.4 Checkbox Classes

| Class | Description |
|-------|-------------|
| `.ck` | Checkbox wrapper |
| `.cb` | Checkbox box |
| `.cl` | Checkbox label |

---

## 4. Event System

### 4.1 Tab Events

```javascript
// Tab change
document.querySelector('.tab').addEventListener('click', function() {
    var tab = this.dataset.tab;
    // Switch panel, update action bar
});
```

### 4.2 Selection Monitor

```javascript
// Runs every 500ms
function checkSelection() {
    runHostScript('getSelectionInfo', null, function(res) {
        // Update UI based on selection
    });
}
```

### 4.3 Time Input Events

```javascript
// Keyboard arrows
input.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowUp') incrementFrame();
    if (e.key === 'ArrowDown') decrementFrame();
});

// Blur validation
input.addEventListener('blur', function() {
    this.value = normalizeSF(this.value, currentCompFPS);
});
```

---

---

## 5. Motion Functions (v2.8.0)

### 5.1 JavaScript (main.js)

```javascript
/**
 * Apply motion from UI values
 * Reads all motion settings and sends to host
 */
function applyMotionFromUI()

/**
 * Remove motion from selected layer
 */
function removeMotionFromUI()

/**
 * Apply motion preset
 * @param {number} presetIndex - Preset index (0-11)
 */
function applyMotionPreset(presetIndex)

/**
 * Initialize Link/Unlink buttons
 */
function initMotionLinkButtons()

/**
 * Toggle Link/Unlink state
 * @param {HTMLElement} btn - Link button element
 * @param {string[]} rowIds - IDs of OUT rows to show/hide
 */
function toggleMotionLink(btn, rowIds)

/**
 * Check if property has independent OUT
 * @param {string} property - 'Pos', 'Scale', 'Rot', 'Opacity'
 * @returns {boolean}
 */
function isMotionPropertyUnlinked(property)
```

### 5.2 Host Script (index.jsx)

```javascript
/**
 * Apply motion to selected layer
 * @param {string} optsJSON - JSON options
 * @returns {string} - JSON response
 * 
 * Options:
 *   - inStart, inEnd, outStart, outEnd: number (seconds)
 *   - syncMode: 0=Manual, 1=Typewriter
 *   - animatePosition: boolean
 *   - posFromX, posFromY, posToX, posToY: number
 *   - posLinkMode: 0=Linked, 1=Independent
 *   - posOutFromX, posOutFromY, posOutToX, posOutToY: number
 *   - animateScale: boolean
 *   - scaleFrom, scaleTo: number (%)
 *   - scaleLinkMode: 0=Linked, 1=Independent
 *   - scaleOutFrom, scaleOutTo: number (%)
 *   - animateRotation: boolean
 *   - rotFrom, rotTo: number (degrees)
 *   - rotLinkMode: 0=Linked, 1=Independent
 *   - rotOutFrom, rotOutTo: number (degrees)
 *   - animateOpacity: boolean
 *   - opacityFrom, opacityTo: number (%)
 *   - opacityLinkMode: 0=Linked, 1=Independent
 *   - opacityOutFrom, opacityOutTo: number (%)
 *   - easingType: number (0-6)
 *   - easingStrength: number (%)
 */
function applyMotion(optsJSON)

/**
 * Apply motion to multiple layers with stagger
 * @param {string} optsJSON - Options + stagger
 * @returns {string} - JSON response
 */
function applyMotionMulti(optsJSON)

/**
 * Apply motion preset
 * @param {string} optsJSON - {presetIndex, syncMode, timing...}
 * @returns {string} - JSON response
 */
function applyMotionPreset(optsJSON)

/**
 * Apply motion preset to multiple layers
 * @param {string} optsJSON - Options + stagger
 * @returns {string} - JSON response
 */
function applyMotionPresetMulti(optsJSON)

/**
 * Remove motion from selected layer
 * @returns {string} - JSON response
 */
function removeMotion()

/**
 * Get count of selected text layers
 * @returns {string} - JSON response with count
 */
function getMotionSelectionCount()
```

### 5.3 Motion Effect Controls

| Control Name | Type | Description |
|--------------|------|-------------|
| Motion In Start | Slider | IN start time (seconds) |
| Motion In End | Slider | IN end time (seconds) |
| Motion Out Start | Slider | OUT start time (-1=disabled) |
| Motion Out End | Slider | OUT end time |
| Motion Sync Mode | Slider | 0=Manual, 1=Typewriter |
| Animate Position | Checkbox | Enable position |
| Pos From X/Y | Slider | IN start position |
| Pos To X/Y | Slider | IN end position |
| Pos Link Mode | Slider | 0=Linked, 1=Independent |
| Pos Out From X/Y | Slider | OUT start position |
| Pos Out To X/Y | Slider | OUT end position |
| Animate Scale | Checkbox | Enable scale |
| Scale From/To | Slider | IN scale values |
| Scale Link Mode | Slider | 0=Linked, 1=Independent |
| Scale Out From/To | Slider | OUT scale values |
| Animate Rotation | Checkbox | Enable rotation |
| Rot From/To | Slider | IN rotation values |
| Rot Link Mode | Slider | 0=Linked, 1=Independent |
| Rot Out From/To | Slider | OUT rotation values |
| Animate Opacity | Checkbox | Enable opacity |
| Opacity From/To | Slider | IN opacity values |
| Opacity Link Mode | Slider | 0=Linked, 1=Independent |
| Opacity Out From/To | Slider | OUT opacity values |
| Motion Easing Type | Slider | Easing type (0-6) |
| Motion Easing Strength | Slider | Easing intensity |

---

*API Reference v3.0.0 - December 2024*

---

## 6. TORO Functions (v3.0.0)

### 6.1 JavaScript (main.js)

```javascript
/**
 * Apply TORO template from Presets Hub
 * @param {Object} preset - Preset object with fileName and category
 */
function applyPresetFromHub(preset)
// Handles category === 'toro' by calling applyToro

/**
 * Save current layer as TORO preset
 * @param {string} category - 'toro'
 * @param {string} name - Preset name
 */
function savePresetFromLayer(category, name)
// Calls getToroValuesForPreset() for toro category
```

### 6.2 Host Script (index.jsx)

```javascript
/**
 * Apply complete TORO template (Type + Box + Motion)
 * @param {string} optsJSON - {fileName: string}
 * @returns {string} - JSON response
 * 
 * Process:
 * 1. Load TORO preset from JSON file
 * 2. Create or use selected text layer
 * 3. Apply Type preset (if exists)
 * 4. Apply Box preset (if exists)
 * 5. Apply Motion to text layer (if exists)
 * 6. Apply Motion to box layer (if exists)
 */
function applyToro(optsJSON)

/**
 * Extract Type + Box + Motion values from selected layer
 * @returns {string} - JSON response with values object
 * 
 * Response data:
 *   - values.type: Typewriter settings (if exists)
 *   - values.box: Box settings (if exists)
 *   - values.motion: Motion settings (if exists)
 */
function getToroValuesForPreset()

/**
 * Apply motion to a single layer (internal helper)
 * @param {Layer} layer - Target layer
 * @param {Object} opts - Motion options
 */
function _applyMotionToLayer(layer, opts)

/**
 * Load preset by filename from builtin or user folder
 * @param {string} category - Preset category
 * @param {string} fileName - JSON filename
 * @returns {Object|null} - Preset object or null
 */
function _loadPresetByFileName(category, fileName)

/**
 * Get color value from effect control
 * @param {PropertyGroup} fx - Effect Parade
 * @param {string} name - Control name
 * @param {Array} defaultVal - Default [r, g, b]
 * @returns {Array} - Color value [r, g, b]
 */
function _getEffectColorValue(fx, name, defaultVal)
```

### 6.3 TORO Preset Categories

| Category | Description | Folder |
|----------|-------------|--------|
| toro | Complete templates | `config/presets/toro/` |

### 6.4 TORO Values Structure

```javascript
{
  type: {
    direction: "ltr" | "rtl",
    showCursor: boolean,
    cursorBefore: boolean,
    cursorType: number,
    cursorSpacing: number,
    blinkSpeed: number,
    blinkInHold: boolean,
    reverse: boolean,
    wordMode: boolean,
    randomSpeed: number,
    inStart: number,
    inEnd: number,
    outStart: number,
    outEnd: number,
    blinkStart: number,
    blinkEnd: number,
    cursorColor: [r, g, b]
  },
  box: {
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
    strokeColor: [r, g, b],
    fillOpacity: number,
    fillColor: [r, g, b]
  },
  motion: {
    inStart: number,
    inEnd: number,
    outEnable: boolean,
    outStart: number,
    outEnd: number,
    animatePosition: boolean,
    posFromX: number,
    posFromY: number,
    posToX: number,
    posToY: number,
    animateScale: boolean,
    scaleFrom: number,
    scaleTo: number,
    animateRotation: boolean,
    rotFrom: number,
    rotTo: number,
    animateOpacity: boolean,
    opacityFrom: number,
    opacityTo: number,
    easingType: number,
    easingStrength: number
  }
}
```

### 6.5 Builtin TORO Templates

| Template | Description |
|----------|-------------|
| minimal-fade.json | Simple design with fade animation |
| arabic-classic.json | Arabic RTL with gold styling |
| bounce-pop.json | Playful bounce animation |
| professional-intro.json | Professional blue box |
| slide-elegant.json | Elegant slide from left |
