# Professional Technical Audit - MARKERS Tab (TEXTORO)

Date: 2026-02-28  
Extension Path: `C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\TEXTORO`  
Scope: MARKERS tab UI, operations bridge, and host marker mutation logic.

## 1. Executive Summary

The MARKERS tab is generally functional, but the audit confirms several behavior mismatches and reliability risks:

1. Marker producer/consumer time-base contract is inconsistent (`inPoint` handling differs by path).
2. Motion preset marker-sync path relays absolute marker times into a relative motion controller contract.
3. `Stagger M-` and `Stagger M+` do not behave differently on markers (direction is lost in host logic).
4. Marker targeting and selection restore are not deterministic after timeline mutations because identity handling is inconsistent between UI and host.
5. Error-path handling in host marker operations can break the JSON response contract when exceptions happen before undo group begin.
6. User-facing diagnostics and state persistence are partially drifted from intended UX.

Overall status: usable for basic cases, but not yet deterministic/reliable enough for advanced batch timing edits.

## 2. Methodology

- Static code audit for:
  - `js/panels/MarkersPanel.js`
  - `js/operations/MarkersOps.js`
  - `js/operations/LayersOps.js`
  - `js/ui/ActionBar.js`
  - `host/modules/LayerOperations.jsx`
  - `index.html`, `css/style.css`
- Contract tracing:
  - UI payloads -> `HostBridge.run(...)` -> host function behavior.
- UX/logic consistency check:
  - compared runtime behavior intent vs tab controls and docs.

### 2.1 Marker Source Trace

- Full producer/consumer trace is documented in:
  - `00_MARKERS_SOURCE_FLOW_2026-02-28.md`
- Key result:
  - Typewriter apply path writes timing markers directly at raw times.
  - Expressions and motion sync read timing markers as `keyTime - inPoint`.
  - This creates a contract mismatch in non-zero `inPoint` scenarios.

## 3. Current Runtime Flow (As-Implemented)

1. MARKERS tab calls `collectTextoroMarkers` on load/refresh.
2. Host returns known timing marker types only (`IN_*`, `OUT_*`, `BLINK_*`).
3. Panel renders filtered table and allows selection.
4. Operations send selected markers to host:
   - `offsetTextoroMarkers`
   - `staggerTextoroMarkers`
   - `alignTextoroMarkers`
   - `deleteTextoroMarkers`
5. Panel refreshes and attempts selection restore by `layerIndex + markerIndex`.

## 4. Confirmed Findings

### Critical-00: Marker Time-Base Contract Mismatch (Producer vs Consumer)
Severity: Critical  
Type: Architecture / behavioral consistency

Evidence:
- Primary writer path stores timing markers without adding `layer.inPoint`:
  - `host/modules/TypewriterManager.jsx:446, 451, 455, 461, 465, 471`
- Consumers interpret marker times relative to layer start:
  - `host/expressions/typewriter/v1.3/sourceText.js:23`
  - `host/modules/ExpressionLoader.jsx:445, 504`
  - `host/modules/MotionManager.jsx:71`
- There is a relative writer implementation (`inPoint + timing`) in:
  - `host/modules/PresetManager.jsx:1623-1708`
  - but this function is not used in active apply flow.

Impact:
- Timing behavior can drift on layers with non-zero `inPoint`.
- MARKERS tab fixes alone will not fully stabilize behavior until source contract is unified.

### Critical-00B: Motion Preset Sync Relays Absolute Marker Times into Relative Controls
Severity: Critical  
Type: Cross-module timing contract

Evidence:
- `applyMotionPreset(syncWithMarkers=true)` reads marker times from `_getMarkerTiming()`:
  - `host/modules/MotionManager.jsx:770-772`
- `_getMarkerTiming()` uses raw key time:
  - `host/modules/MotionManager.jsx:693`
- Retrieved values are copied directly into motion timing controls:
  - `host/modules/MotionManager.jsx:787-788`
  - `host/modules/MotionManager.jsx:821-822`
- Motion expressions evaluate relative time (`time - inPoint`) and compare against those controls:
  - `host/modules/MotionManager.jsx:79`

Impact:
- On non-zero `inPoint` layers, motion preset timing is delayed or shifted incorrectly when sync is enabled.
- Users can see different behavior between "Sync with Typewriter" paths depending on which entry point is used.

### Critical-01: Marker Stagger Direction Is Not Applied
Severity: Critical  
Type: Functional logic mismatch

Evidence:
- UI sends signed delay by direction (`* direction`) in `js/operations/MarkersOps.js:80`.
- Host computes new times with absolute delay in `host/modules/LayerOperations.jsx:401`.
- User message also hides sign with `Math.abs(delay)` in `js/operations/MarkersOps.js:91`.

Impact:
- `M-` and `M+` in MARKERS stagger effectively produce the same direction.
- Behavior contradicts control labels and user expectation.

### High-01: Marker Identity Drift Between UI and Host
Severity: High  
Type: Determinism / targeting

Evidence:
- UI saves selection by `layerIndex + markerIndex` in `js/panels/MarkersPanel.js:230-234`.
- Host operations ignore `markerIndex` and match by `type + time`:
  - `offsetTextoroMarkers`: `host/modules/LayerOperations.jsx:223-230` and matching at `:253`
  - `alignTextoroMarkers`: `host/modules/LayerOperations.jsx:293-296` and matching at `:320`
  - `deleteTextoroMarkers`: `host/modules/LayerOperations.jsx:472-475` and matching at `:497`
- Selection restore depends on marker indices after mutation in `js/panels/MarkersPanel.js:243-264`.

Impact:
- After operations that reinsert markers, selection restore can drift.
- In edge cases (duplicate type/time patterns), targeting can become ambiguous.

### High-02: Undo-Group Error Path Can Break Host Response Contract
Severity: High  
Type: Reliability / bridge safety

Evidence:
- Marker operations parse JSON with direct `JSON.parse(...)`:
  - `host/modules/LayerOperations.jsx:210, 278, 347, 458`
- Catch blocks call `app.endUndoGroup()` unconditionally:
  - `host/modules/LayerOperations.jsx:268, 333, 448, 510` (and similar pattern in layer ops).

Impact:
- If an exception occurs before `beginUndoGroup`, error handling itself can fail.
- This risks returning non-standard host responses to `HostBridge`, complicating diagnosis and stability.

### Medium-01: Load Failure Is Shown as "No Markers Found"
Severity: Medium  
Type: Observability / supportability

Evidence:
- On failed collect call, panel sets empty state message only:
  - `js/panels/MarkersPanel.js:206`

Impact:
- Permission/bridge/runtime errors are masked as empty data.
- User cannot distinguish "real empty state" from execution failure.

### Medium-02: MARKERS Filter State Is Defined but Not Persisted/Applied
Severity: Medium  
Type: State contract drift

Evidence:
- `markersFilters` exists in state defaults:
  - `js/state/Defaults.js:72`
  - `js/state/StateManager.js:30`
- No read/write usage in MARKERS panel logic.

Impact:
- Filter choices reset each session.
- Stored state model and runtime behavior are inconsistent.

### Low-01: Blink Color Semantics Drift (Docs vs UI)
Severity: Low  
Type: UX consistency

Evidence:
- Docs describe blink markers as blue in `docs/MARKERS_TAB_FEATURES.md:20`.
- UI and CSS render blink as green:
  - `index.html:660-661`
  - `css/style.css:1418`

Impact:
- Visual semantics are inconsistent across docs and panel behavior.

## 5. Risk Prioritization

1. Critical: Normalize marker time-base contract across producer/consumer paths.
2. Critical: Fix motion preset marker-sync relay to use relative timing contract.
3. Critical: Fix stagger direction immediately (user-facing functional error).
4. High: Stabilize marker identity and host undo/error path.
5. Medium: Improve diagnostics and state persistence.
6. Low: Align UI color semantics/documentation.

## 6. Recommended Immediate Direction

1. Normalize timing marker write base to `inPoint + relativeTiming` in the primary typewriter producer path.
2. Patch motion preset marker-sync path so timing copied from markers is layer-relative (or enforce runtime sync mode consistently).
3. Patch MARKERS stagger direction semantics in host and UI message.
4. Introduce deterministic marker identity strategy for operations/restore.
5. Harden host operation wrappers with safe parse + guarded undo close.
6. Implement proper error surfacing in MARKERS load/select paths.
