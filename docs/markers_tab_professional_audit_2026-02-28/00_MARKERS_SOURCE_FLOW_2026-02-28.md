# MARKERS Source Flow Analysis - TEXTORO

Date: 2026-02-28  
Scope: Where timing markers come from, who reads them, and what contract they assume.

## 1. Producer Paths (Where markers are created)

### Path A: Typewriter apply (primary producer)

1. UI sends timing values (`inStart`, `inEnd`, `outStart`, `outEnd`, `blinkStart`, `blinkEnd`) from [TypewriterPanel.js](C:/Program Files (x86)/Common Files/Adobe/CEP/extensions/TEXTORO/js/panels/TypewriterPanel.js:204).
2. Host entry [TypewriterManager.jsx](C:/Program Files (x86)/Common Files/Adobe/CEP/extensions/TEXTORO/host/modules/TypewriterManager.jsx:31) calls `_applyTypewriter(...)`.
3. `_applyTypewriter(...)` builds timing via `_extractTiming(...)` and writes markers via `_createTypewriterMarkers(...)` at [TypewriterManager.jsx](C:/Program Files (x86)/Common Files/Adobe/CEP/extensions/TEXTORO/host/modules/TypewriterManager.jsx:204) and [TypewriterManager.jsx](C:/Program Files (x86)/Common Files/Adobe/CEP/extensions/TEXTORO/host/modules/TypewriterManager.jsx:428).

Key detail:
- Timing markers are currently written at raw values (no `layer.inPoint` offset):
  - [TypewriterManager.jsx](C:/Program Files (x86)/Common Files/Adobe/CEP/extensions/TEXTORO/host/modules/TypewriterManager.jsx:446)
  - [TypewriterManager.jsx](C:/Program Files (x86)/Common Files/Adobe/CEP/extensions/TEXTORO/host/modules/TypewriterManager.jsx:451)
  - [TypewriterManager.jsx](C:/Program Files (x86)/Common Files/Adobe/CEP/extensions/TEXTORO/host/modules/TypewriterManager.jsx:455)
  - [TypewriterManager.jsx](C:/Program Files (x86)/Common Files/Adobe/CEP/extensions/TEXTORO/host/modules/TypewriterManager.jsx:461)
  - [TypewriterManager.jsx](C:/Program Files (x86)/Common Files/Adobe/CEP/extensions/TEXTORO/host/modules/TypewriterManager.jsx:465)
  - [TypewriterManager.jsx](C:/Program Files (x86)/Common Files/Adobe/CEP/extensions/TEXTORO/host/modules/TypewriterManager.jsx:471)

### Path B: Multi-selection apply

1. Host entry `applyTypewriterMulti(...)` in [MultiLinesManager.jsx](C:/Program Files (x86)/Common Files/Adobe/CEP/extensions/TEXTORO/host/modules/MultiLinesManager.jsx:163) computes staggered timing values.
2. It reuses `_applyTypewriter(...)` for each layer at [MultiLinesManager.jsx](C:/Program Files (x86)/Common Files/Adobe/CEP/extensions/TEXTORO/host/modules/MultiLinesManager.jsx:210).

Result:
- Multi path still inherits the same marker-writing behavior from TypewriterManager.

### Path C: Preset apply (indirect)

1. Preset application path `_applyTypePreset(...)` at [PresetManager.jsx](C:/Program Files (x86)/Common Files/Adobe/CEP/extensions/TEXTORO/host/modules/PresetManager.jsx:1714).
2. It calls `_applyTypewriter(...)` at [PresetManager.jsx](C:/Program Files (x86)/Common Files/Adobe/CEP/extensions/TEXTORO/host/modules/PresetManager.jsx:1745).

Result:
- Preset path also depends on TypewriterManager marker writer.

## 2. Alternative Writer Present but Not Active

There is another implementation `_updateTypewriterMarkers(...)` in [PresetManager.jsx](C:/Program Files (x86)/Common Files/Adobe/CEP/extensions/TEXTORO/host/modules/PresetManager.jsx:1623) that writes timing markers using `inPoint + relativeTime` (e.g., [PresetManager.jsx](C:/Program Files (x86)/Common Files/Adobe/CEP/extensions/TEXTORO/host/modules/PresetManager.jsx:1670)).

Current status:
- This function is not called in runtime flow.

## 3. Consumer Paths (Who reads markers)

### Typewriter expression runtime

- Source text expression reads marker times as `m.key(i).time - inPoint` in [sourceText.js](C:/Program Files (x86)/Common Files/Adobe/CEP/extensions/TEXTORO/host/expressions/typewriter/v1.3/sourceText.js:23).

### ExpressionLoader generated expressions

- Same relative-time assumption: `keyTime - inPoint` in [ExpressionLoader.jsx](C:/Program Files (x86)/Common Files/Adobe/CEP/extensions/TEXTORO/host/modules/ExpressionLoader.jsx:445) and [ExpressionLoader.jsx](C:/Program Files (x86)/Common Files/Adobe/CEP/extensions/TEXTORO/host/modules/ExpressionLoader.jsx:504).

### Motion sync expressions

- Motion timing sync code also converts markers to layer-relative by subtracting `inPoint` in [MotionManager.jsx](C:/Program Files (x86)/Common Files/Adobe/CEP/extensions/TEXTORO/host/modules/MotionManager.jsx:71).

### Motion preset sync relay (`syncWithMarkers = true`)

1. Presets UI sends `syncWithMarkers` to host `applyMotionPreset(...)` at [PresetsPanel.js](C:/Program Files (x86)/Common Files/Adobe/CEP/extensions/TEXTORO/js/panels/PresetsPanel.js:419).
2. Host reads marker timing via `_getMarkerTiming()` at [MotionManager.jsx](C:/Program Files (x86)/Common Files/Adobe/CEP/extensions/TEXTORO/host/modules/MotionManager.jsx:672).
3. `_getMarkerTiming()` currently reads absolute comp key times (`markers.keyTime(i)`) at [MotionManager.jsx](C:/Program Files (x86)/Common Files/Adobe/CEP/extensions/TEXTORO/host/modules/MotionManager.jsx:693).
4. These values are copied directly into `motionOpts.inStart/inEnd/outStart/outEnd` at [MotionManager.jsx](C:/Program Files (x86)/Common Files/Adobe/CEP/extensions/TEXTORO/host/modules/MotionManager.jsx:787) and [MotionManager.jsx](C:/Program Files (x86)/Common Files/Adobe/CEP/extensions/TEXTORO/host/modules/MotionManager.jsx:821).
5. Motion expressions evaluate `t = time - inPoint` (relative time) in [MotionManager.jsx](C:/Program Files (x86)/Common Files/Adobe/CEP/extensions/TEXTORO/host/modules/MotionManager.jsx:79).

Result:
- `syncWithMarkers` preset path relays absolute marker times into a relative-time controller contract.

### MARKERS tab data collector

- `collectTextoroMarkers` reads known timing marker comments from text layers only at [LayerOperations.jsx](C:/Program Files (x86)/Common Files/Adobe/CEP/extensions/TEXTORO/host/modules/LayerOperations.jsx:152) and filters known types at [LayerOperations.jsx](C:/Program Files (x86)/Common Files/Adobe/CEP/extensions/TEXTORO/host/modules/LayerOperations.jsx:163).

### MARKERS tab mutation path (becomes new source of truth)

- Offset/Align/Stagger/Delete in `host/modules/LayerOperations.jsx` mutate composition marker key times directly.
- Any mismatch introduced here is consumed by:
  - Typewriter expressions
  - Motion timing sync code
  - Preset extraction logic

## 4. Core Contract Mismatch

Observed mismatch:
1. Main producer writes timing marker times as raw values (Path A).
2. Main consumers interpret timing marker times relative to layer start (`- inPoint`).
3. Motion preset `syncWithMarkers` path relays absolute marker times into relative motion controls.

Implication:
- For layers with non-zero `inPoint`, effective animation timing can drift because producer and consumer are not aligned on time base.

## 5. Correction Direction (Contract First)

Required contract:
1. Timing markers (`IN_*`, `OUT_*`, `BLINK_*`) must be stored at composition time = `layer.inPoint + relativeTime`.
2. Consumers continue using `keyTime - inPoint`.
3. MARKERS tab remains a view/editor of composition-time marker keys, with operations preserving deterministic targeting.
