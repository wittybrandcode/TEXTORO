# 🏗️ TEXTORO Architecture Documentation

> **Version**: 3.4.0 | **Last Updated**: December 27, 2024 | **Status**: Production Ready

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Module Dependency Graph](#module-dependency-graph)
4. [Data Flow Architecture](#data-flow-architecture)
5. [Expression Engine](#expression-engine)
6. [Preset System](#preset-system)
7. [API Contract](#api-contract)
8. [Performance Metrics](#performance-metrics)

---

## Executive Summary

**TEXTORO** is a professional Adobe After Effects CEP (Common Extensibility Platform) extension designed for advanced text animation workflows. Built with a modular architecture, it provides:

| Metric | Value |
|--------|-------|
| Total Files | ~120 |
| Codebase Size | ~1.5 MB |
| Host Modules | 11 |
| Preset Categories | 5 |
| Total Presets | 25 (JSON) |
| Expression Versions | 4 |

### Core Capabilities

```
┌─────────────────────────────────────────────────────────────────┐
│                        TEXTORO v3.4.0                           │
├─────────────────────────────────────────────────────────────────┤
│  🎬 Typewriter Effect    │  📦 Smart Box System                 │
│  🎭 Motion Animation     │  📝 Multi-Line Support               │
│  🔄 RTL/LTR Support      │  💾 Preset Management (JSON)         │
│  🎨 Live Preview (Soga)  │  📤 Import/Export                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## System Architecture

### High-Level Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                           CEP PANEL (UI)                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │   index.html │  │   main.js   │  │   style.css │  │ CSInterface │  │
│  └──────┬──────┘  └──────┬──────┘  └─────────────┘  └──────┬──────┘  │
│         │                │                                  │         │
│         └────────────────┼──────────────────────────────────┘         │
│                          │ evalScript()                               │
├──────────────────────────┼────────────────────────────────────────────┤
│                          ▼                                            │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                    HOST SCRIPT (ExtendScript)                   │  │
│  │  ┌──────────────────────────────────────────────────────────┐  │  │
│  │  │                      index.jsx                            │  │  │
│  │  │                   (Module Loader)                         │  │  │
│  │  └──────────────────────────┬───────────────────────────────┘  │  │
│  │                             │ #include                          │  │
│  │  ┌──────────────────────────┼───────────────────────────────┐  │  │
│  │  │                     MODULES/                              │  │  │
│  │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────────┐ │  │  │
│  │  │  │ Config  │→│Utilities│→│ExprLoad │→│TypewriterManager│ │  │  │
│  │  │  └─────────┘ └─────────┘ └─────────┘ └─────────────────┘ │  │  │
│  │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────────┐ │  │  │
│  │  │  │BoxMgr   │→│MultiLine│→│SogaMgr  │→│ LayerOperations │ │  │  │
│  │  │  └─────────┘ └─────────┘ └─────────┘ └─────────────────┘ │  │  │
│  │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐                     │  │  │
│  │  │  │PresetMgr│→│Import/Ex│→│MotionMgr│                     │  │  │
│  │  │  └─────────┘ └─────────┘ └─────────┘                     │  │  │
│  │  └──────────────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                    AFTER EFFECTS DOM                            │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │  │
│  │  │   Comp   │  │  Layers  │  │ Effects  │  │  Expressions │   │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │  │
│  └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| UI | HTML5 + CSS3 + JavaScript | User Interface |
| Bridge | CSInterface.js | CEP Communication |
| Host | ExtendScript (ES3) | After Effects Scripting |
| Expressions | JavaScript (AE Engine) | Runtime Animation |
| Config | JSON | Presets & Settings |

---

## Module Dependency Graph

### Load Order & Dependencies

```
                    ┌─────────────────┐
                    │   index.jsx     │
                    │  (Entry Point)  │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│  1. Config    │   │               │   │               │
│   (112 LOC)   │   │               │   │               │
│   No deps     │   │               │   │               │
└───────┬───────┘   │               │   │               │
        │           │               │   │               │
        ▼           │               │   │               │
┌───────────────┐   │               │   │               │
│ 2. Utilities  │◄──┘               │   │               │
│   (660 LOC)   │                   │   │               │
│  Deps: Config │                   │   │               │
└───────┬───────┘                   │   │               │
        │                           │   │               │
        ▼                           │   │               │
┌───────────────┐                   │   │               │
│3. ExprLoader  │◄──────────────────┘   │               │
│   (525 LOC)   │                       │               │
│Deps: Config,  │                       │               │
│     Utilities │                       │               │
└───────┬───────┘                       │               │
        │                               │               │
        ├───────────────┬───────────────┤               │
        ▼               ▼               ▼               │
┌───────────────┐ ┌───────────────┐ ┌───────────────┐  │
│4. Typewriter  │ │ 5. BoxManager │ │ 6. MultiLines │◄─┘
│   (498 LOC)   │ │   (527 LOC)   │ │   (393 LOC)   │
└───────┬───────┘ └───────┬───────┘ └───────┬───────┘
        │                 │                 │
        └────────┬────────┴────────┬────────┘
                 ▼                 ▼
        ┌───────────────┐ ┌───────────────┐
        │ 7. SogaManager│ │8. LayerOps    │
        │   (446 LOC)   │ │   (388 LOC)   │
        └───────┬───────┘ └───────┬───────┘
                │                 │
                └────────┬────────┘
                         ▼
                ┌───────────────┐
                │9. PresetMgr   │
                │  (1645 LOC)   │
                └───────┬───────┘
                        │
           ┌────────────┴────────────┐
           ▼                         ▼
   ┌───────────────┐        ┌───────────────┐
   │10. Import/Exp │        │11. MotionMgr  │
   │   (408 LOC)   │        │   (654 LOC)   │
   └───────────────┘        └───────────────┘
```

### Module Statistics

| # | Module | Lines | Size | Functions | Purpose |
|---|--------|-------|------|-----------|---------|
| 1 | Config.jsx | 112 | 3.27 KB | 0 | Constants & Configuration |
| 2 | Utilities.jsx | 660 | 22.96 KB | 35 | Helper Functions |
| 3 | ExpressionLoader.jsx | 525 | 23.70 KB | 12 | Expression Management |
| 4 | TypewriterManager.jsx | 498 | 20.71 KB | 15 | Typewriter Effect |
| 5 | BoxManager.jsx | 527 | 24.00 KB | 18 | Box/Background System |
| 6 | MultiLinesManager.jsx | 393 | 14.92 KB | 8 | Multi-Line Text |
| 7 | SogaManager.jsx | 446 | 20.95 KB | 14 | Live Edit Panel |
| 8 | LayerOperations.jsx | 388 | 12.88 KB | 12 | Layer Utilities |
| 9 | PresetManager.jsx | 1645 | 58.29 KB | 28 | Preset System |
| 10 | ImportExport.jsx | 408 | 14.35 KB | 10 | Import/Export |
| 11 | MotionManager.jsx | 654 | 31.39 KB | 16 | Motion Animation |
| **Total** | **11 Modules** | **6,256** | **247.42 KB** | **168** | |



---

## Data Flow Architecture

### UI → Host Communication

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER INTERACTION                              │
│                              │                                       │
│                              ▼                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                      main.js                                 │   │
│  │  ┌─────────────────────────────────────────────────────┐    │   │
│  │  │  1. Collect UI Values                                │    │   │
│  │  │     const opts = {                                   │    │   │
│  │  │       direction: getDirection(),                     │    │   │
│  │  │       inStart: getNum('inStart', 2),                │    │   │
│  │  │       showCursor: getChecked('showCursor', true),   │    │   │
│  │  │       ...                                            │    │   │
│  │  │     };                                               │    │   │
│  │  └─────────────────────────────────────────────────────┘    │   │
│  │                              │                               │   │
│  │                              ▼                               │   │
│  │  ┌─────────────────────────────────────────────────────┐    │   │
│  │  │  2. Serialize to JSON                                │    │   │
│  │  │     const optsJSON = JSON.stringify(opts);          │    │   │
│  │  └─────────────────────────────────────────────────────┘    │   │
│  │                              │                               │   │
│  │                              ▼                               │   │
│  │  ┌─────────────────────────────────────────────────────┐    │   │
│  │  │  3. Call Host via CSInterface                        │    │   │
│  │  │     csInterface.evalScript(                          │    │   │
│  │  │       `applyTypewriter('${optsJSON}')`,             │    │   │
│  │  │       handleResponse                                 │    │   │
│  │  │     );                                               │    │   │
│  │  └─────────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              │ evalScript()                          │
│                              ▼                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    HOST (ExtendScript)                       │   │
│  │  ┌─────────────────────────────────────────────────────┐    │   │
│  │  │  4. Parse JSON & Execute                             │    │   │
│  │  │     function applyTypewriter(optsJSON) {            │    │   │
│  │  │       var opts = JSON.parse(optsJSON);              │    │   │
│  │  │       // ... apply effect                            │    │   │
│  │  │       return success("Applied!", data);             │    │   │
│  │  │     }                                                │    │   │
│  │  └─────────────────────────────────────────────────────┘    │   │
│  │                              │                               │   │
│  │                              ▼                               │   │
│  │  ┌─────────────────────────────────────────────────────┐    │   │
│  │  │  5. Return JSON Response                             │    │   │
│  │  │     { success: true, message: "...", data: {...} }  │    │   │
│  │  └─────────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    CALLBACK (main.js)                        │   │
│  │  ┌─────────────────────────────────────────────────────┐    │   │
│  │  │  6. Handle Response                                  │    │   │
│  │  │     function handleResponse(result) {               │    │   │
│  │  │       const res = JSON.parse(result);               │    │   │
│  │  │       if (res.success) setStatus(res.message);      │    │   │
│  │  │       else ErrorHandler.show(res.error);            │    │   │
│  │  │     }                                                │    │   │
│  │  └─────────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### Layer ID System

TEXTORO uses a smart naming convention to track layer states:

```
Layer Name Format: tx_<baseId>_<flags>

Examples:
  tx_m5k8j2abc_T    → Typewriter only
  tx_m5k8j2abc_B    → Box only
  tx_m5k8j2abc_TB   → Typewriter + Box
  tx_m5k8j2abc_TBM  → Typewriter + Box + Motion
  tx_m5k8j2abc_Box  → Box shape layer (child)

Layer Comment: TEXTORO_TEXT:<original text>
  → Stores original text for Typewriter restoration
```

```
┌─────────────────────────────────────────────────────────────────┐
│                    LAYER RELATIONSHIP                            │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Text Layer: tx_abc123_TB                                 │   │
│  │  ├── Comment: "TEXTORO_TEXT:Hello World"                 │   │
│  │  ├── Effects: TW Progress, Show Cursor, etc.             │   │
│  │  └── Expression: sourceText (Typewriter)                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│                         │                                        │
│                         │ Parent-Child Link                      │
│                         ▼                                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Shape Layer: tx_abc123_Box                               │   │
│  │  ├── Parent: tx_abc123_TB                                │   │
│  │  ├── Effects: Padding, Corner, Stroke, Fill              │   │
│  │  └── Expression: path, size, position (linked to text)   │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Expression Engine

### Expression Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    EXPRESSION SYSTEM                             │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                 expressions/_config.json                  │   │
│  │  {                                                        │   │
│  │    "versions": {                                          │   │
│  │      "typewriter/sourceText": "v1.3",                    │   │
│  │      "cursor/blink": "v1.0",                             │   │
│  │      "box/path4corners": "v1.0"                          │   │
│  │    },                                                     │   │
│  │    "fallback": "v1.0"                                    │   │
│  │  }                                                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    EXPRESSION FILES                       │   │
│  │                                                           │   │
│  │  expressions/                                             │   │
│  │  ├── typewriter/                                          │   │
│  │  │   ├── v1.0/sourceText.js    (Basic)                   │   │
│  │  │   ├── v1.1/sourceText.js    (Word Mode)               │   │
│  │  │   ├── v1.2/sourceText.js    (Easing)                  │   │
│  │  │   └── v1.3/sourceText.js    (RTL Smart)               │   │
│  │  ├── cursor/                                              │   │
│  │  │   └── v1.0/blink.js                                   │   │
│  │  └── box/                                                 │   │
│  │      └── v1.0/                                            │   │
│  │          ├── path4corners.js                              │   │
│  │          ├── position.js                                  │   │
│  │          └── size.js                                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              ExpressionLoader.jsx                         │   │
│  │                                                           │   │
│  │  loadExpression(category, name, version)                 │   │
│  │    1. Check _exprCache                                   │   │
│  │    2. Load from file if not cached                       │   │
│  │    3. Fallback to embedded if file missing               │   │
│  │    4. Return expression string                           │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Expression Version History

| Version | Feature | Typewriter | Cursor | Box |
|---------|---------|------------|--------|-----|
| v1.0 | Basic | ✅ | ✅ | ✅ |
| v1.1 | Word Mode | ✅ | - | - |
| v1.2 | Easing | ✅ | - | - |
| v1.3 | RTL Smart | ✅ | - | - |

### Motion Expression System

```javascript
// Motion expressions read from Effect Controls + Markers
var syncMode = effect("Motion Sync Mode")("Slider").value;

if (syncMode == 1 && thisLayer.marker.numKeys > 0) {
    // Sync with Typewriter markers
    for (var i = 1; i <= m.numKeys; i++) {
        var c = m.key(i).comment;
        if (c == "IN_START") inS = m.key(i).time - inPoint;
        else if (c == "IN_END") inE = m.key(i).time - inPoint;
        // ...
    }
}
```

---

## Preset System

### Preset Categories

```
config/presets/
├── _schema.json          # JSON Schema for validation
├── type/     (8 presets) # Typewriter presets
├── box/      (8 presets) # Box style presets
├── motion/  (17 presets) # Motion animation presets
├── mix/     (12 presets) # Combined presets
└── toro/     (8 presets) # Complete templates
```

### Preset Schema

```json
{
  "name": "Preset Name",
  "version": "1.0",
  "category": "type|box|motion|mix|toro",
  "icon": "🎬",
  "description": "Description",
  "author": "TEXTORO",
  "values": {
    // Category-specific values
  }
}
```

### Preset Loading Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRESET LOADING                                │
│                                                                  │
│  UI Request                                                      │
│      │                                                           │
│      ▼                                                           │
│  loadPresets({category: "motion"})                              │
│      │                                                           │
│      ▼                                                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  PresetManager.jsx                                        │   │
│  │                                                           │   │
│  │  1. Get presets folder path                              │   │
│  │  2. List JSON files in category folder                   │   │
│  │  3. Parse each JSON file                                 │   │
│  │  4. Validate against schema                              │   │
│  │  5. Return array of presets                              │   │
│  └──────────────────────────────────────────────────────────┘   │
│      │                                                           │
│      ▼                                                           │
│  {                                                               │
│    success: true,                                                │
│    data: {                                                       │
│      presets: [                                                  │
│        { name: "Fade In", fileName: "fade-in.json", ... },      │
│        { name: "Slide Up", fileName: "slide-up.json", ... }     │
│      ]                                                           │
│    }                                                             │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
```



---

## API Contract

### Public Functions (Host → UI)

#### Typewriter Module

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `applyTypewriter(optsJSON)` | JSON options | JSON result | Apply typewriter effect |
| `removeTypewriter()` | - | JSON result | Remove typewriter effect |
| `getLayerText()` | - | JSON with text | Get selected layer text |
| `updateLayerText(optsJSON)` | JSON with text | JSON result | Update layer text |
| `hasTypewriter(layer)` | Layer object | boolean | Check if has typewriter |

#### Box Module

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `applyBox(optsJSON)` | JSON options | JSON result | Apply box background |
| `removeBox()` | - | JSON result | Remove box |
| `updateBox(optsJSON)` | JSON options | JSON result | Update box properties |
| `hasBox(layer)` | Layer object | boolean | Check if has box |

#### Motion Module

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `applyMotion(optsJSON)` | JSON options | JSON result | Apply motion animation |
| `removeMotion()` | - | JSON result | Remove motion |
| `applyMotionPreset(optsJSON)` | JSON with preset | JSON result | Apply motion preset |
| `applyMotionMulti(optsJSON)` | JSON with stagger | JSON result | Apply to multiple layers |
| `applyMotionPresetMulti(optsJSON)` | JSON with preset+stagger | JSON result | Preset to multiple |
| `getMotionSelectionCount()` | - | JSON with count | Get selected text layers count |
| `getMotionPresets()` | - | JSON with presets | List motion presets |
| `hasMotion(layer)` | Layer object | boolean | Check if has motion |

#### Preset Module

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `loadPresets(optsJSON)` | JSON with category | JSON with presets | Load presets by category |
| `applyPreset(optsJSON)` | JSON with fileName | JSON result | Apply preset |
| `savePreset(optsJSON)` | JSON with preset data | JSON result | Save custom preset |
| `deletePreset(optsJSON)` | JSON with fileName | JSON result | Delete preset |

#### Soga Module (Live Edit)

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `getSogaValues()` | - | JSON with all values | Get current effect values |
| `setSogaValues(optsJSON)` | JSON with values | JSON result | Set effect values |
| `getSogaTypewriter()` | - | JSON with TW values | Get typewriter values |
| `getSogaBox()` | - | JSON with box values | Get box values |
| `getSogaMotion()` | - | JSON with motion values | Get motion values |

### Response Format

```typescript
// Success Response
{
  success: true,
  message: string,
  data?: any
}

// Error Response
{
  success: false,
  error: string
}
```

---

## Performance Metrics

### Module Load Times (Estimated)

```
┌─────────────────────────────────────────────────────────────────┐
│                    MODULE LOAD SEQUENCE                          │
│                                                                  │
│  Config.jsx        ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░  ~5ms      │
│  Utilities.jsx     ████████░░░░░░░░░░░░░░░░░░░░░░░░  ~15ms     │
│  ExpressionLoader  ████████░░░░░░░░░░░░░░░░░░░░░░░░  ~15ms     │
│  TypewriterMgr     ████████░░░░░░░░░░░░░░░░░░░░░░░░  ~12ms     │
│  BoxManager        ████████░░░░░░░░░░░░░░░░░░░░░░░░  ~15ms     │
│  MultiLinesMgr     ██████░░░░░░░░░░░░░░░░░░░░░░░░░░  ~10ms     │
│  SogaManager       ████████░░░░░░░░░░░░░░░░░░░░░░░░  ~12ms     │
│  LayerOperations   ██████░░░░░░░░░░░░░░░░░░░░░░░░░░  ~8ms      │
│  PresetManager     ████████████████░░░░░░░░░░░░░░░░  ~35ms     │
│  ImportExport      ██████░░░░░░░░░░░░░░░░░░░░░░░░░░  ~10ms     │
│  MotionManager     ████████████░░░░░░░░░░░░░░░░░░░░  ~20ms     │
│  ─────────────────────────────────────────────────────────────  │
│  TOTAL             ████████████████████████████████  ~157ms    │
└─────────────────────────────────────────────────────────────────┘
```

### Memory Footprint

| Component | Size | Notes |
|-----------|------|-------|
| Host Scripts | ~250 KB | Loaded once at startup |
| Expression Cache | ~50 KB | Grows with usage |
| Preset Cache | ~100 KB | Loaded on demand |
| UI Assets | ~200 KB | HTML/CSS/JS |
| **Total** | **~600 KB** | Typical session |

### Optimization Strategies

1. **Lazy Loading**: Presets loaded on-demand per category
2. **Expression Caching**: `_exprCache` prevents re-reading files
3. **Debounced Updates**: Soga live edit uses 200ms debounce
4. **Batch Operations**: Multi-layer functions use single undo group

---

## Security Considerations

### Input Validation

```javascript
// All JSON inputs are parsed with try-catch
function applyTypewriter(optsJSON) {
    try {
        var opts = JSON.parse(optsJSON);
        // Validate required fields
        // Sanitize string inputs
        // Clamp numeric values
    } catch(e) {
        return error("Invalid input: " + e.toString());
    }
}
```

### File System Access

- Presets read from `config/presets/` only
- Expressions read from `host/expressions/` only
- User presets saved to designated folder
- No arbitrary file system access

---

## Future Roadmap

### Planned Features

| Version | Feature | Status |
|---------|---------|--------|
| v3.3.0 | Preset Hub (Online) | Planned |
| v3.3.0 | Custom Expression Editor | Planned |
| v3.4.0 | Timeline Integration | Research |
| v3.4.0 | Batch Processing | Research |
| v4.0.0 | Multi-Comp Support | Future |

---

## Appendix

### File Structure Reference

```
TEXTORO/
├── assets/
│   └── icon.png
├── config/
│   ├── defaults.json
│   └── presets/
│       ├── _schema.json
│       ├── box/      (8 files)
│       ├── mix/      (12 files)
│       ├── motion/   (17 files)
│       ├── toro/     (8 files)
│       └── type/     (8 files)
├── css/
│   ├── spectrum-components.css
│   ├── spectrum-vars.css
│   └── style.css
├── CSXS/
│   └── manifest.xml
├── docs/
│   ├── presets/
│   │   ├── BOX_PRESETS.md
│   │   ├── MIX_PRESETS.md
│   │   ├── MOTION_PRESETS.md
│   │   ├── README.md
│   │   ├── TEMPLATES.md
│   │   ├── TORO.md
│   │   └── TYPE_PRESETS.md
│   ├── API_REFERENCE.md
│   ├── ARCHITECTURE.md (this file)
│   ├── EXAMPLES.md
│   ├── EXPRESSIONS_REFERENCE.md
│   ├── FUNCTIONS_REFERENCE.md
│   ├── INDEX.md
│   └── ...
├── host/
│   ├── expressions/
│   │   ├── _config.json
│   │   ├── box/v1.0/
│   │   ├── cursor/v1.0/
│   │   └── typewriter/v1.0-v1.3/
│   ├── modules/
│   │   ├── BoxManager.jsx
│   │   ├── Config.jsx
│   │   ├── ExpressionLoader.jsx
│   │   ├── ImportExport.jsx
│   │   ├── LayerOperations.jsx
│   │   ├── MotionManager.jsx
│   │   ├── MultiLinesManager.jsx
│   │   ├── PresetManager.jsx
│   │   ├── SogaManager.jsx
│   │   ├── TypewriterManager.jsx
│   │   └── Utilities.jsx
│   └── index.jsx
├── js/
│   ├── CSInterface.js
│   └── main.js
├── index.html
├── README.md
├── CHANGELOG_v3.2.0.md
├── CHANGELOG_v3.2.1.md
└── TODO.md
```

---

<div align="center">

**TEXTORO** - Professional Text Animation for After Effects

*Built with ❤️ for Motion Designers*

</div>
