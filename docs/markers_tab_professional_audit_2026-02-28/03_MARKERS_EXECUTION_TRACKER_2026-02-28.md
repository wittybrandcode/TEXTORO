# MARKERS Execution Tracker - TEXTORO

Date Opened: 2026-02-28
Program: MARKERS Remediation Plan
Status: Code Remediation Complete (Manual AE UAT pending)

## 1. Task Board

| ID | Task | Priority | Status | Evidence |
|---|---|---|---|---|
| MRK-P0-01 | Normalize timing marker source contract to `inPoint + relative` | P0 | Completed | `host/modules/TypewriterManager.jsx` `_createTypewriterMarkers(...)` now writes timing markers with `inPoint + timing.*` |
| MRK-P0-02 | Update primary Typewriter writer path to include `layer.inPoint` | P0 | Completed | `host/modules/TypewriterManager.jsx` call updated to `_createTypewriterMarkers(textLayer, ...)` and writer uses layer `inPoint` |
| MRK-P0-03 | Ensure multi/preset paths align with same timing base | P0 | Completed | Existing preset writer already uses `inPoint + relative` in `host/modules/PresetManager.jsx`; multi-line path uses shared `_applyTypewriter(...)` |
| MRK-P0-04 | Keep metadata marker behavior explicit (`TW_TEXT`, `CURSOR_CHAR`) | P0 | Completed | `host/modules/TypewriterManager.jsx` metadata markers remain at `0` and `0.001`; timing markers shifted to `inPoint + relative` |
| MRK-P0-05 | Fix motion preset sync relay to relative timing contract | P0 | Completed | `host/modules/MotionManager.jsx` `_getMarkerTiming()` now uses `keyTime - inPoint`; out timing null checks hardened |
| MRK-P1-01 | Fix marker stagger direction in host | P1 | Completed | `host/modules/LayerOperations.jsx` stagger uses signed `delay` in `baseTime + (x * delay)` |
| MRK-P1-02 | Keep stagger status message sign-aware | P1 | Completed | `js/operations/MarkersOps.js` and `js/operations/LayersOps.js` display explicit `+/-` sign |
| MRK-P1-03 | Regression checks for `M+` vs `M-` semantics | P1 | Completed (static) | Host and UI code paths verified; manual AE runtime validation remains in UAT gate |
| MRK-P2-01 | Deterministic marker identity with primary `markerIndex` matching | P2 | Completed | `host/modules/LayerOperations.jsx` added `_resolveMarkerKey(...)` and index-first matching with fallback |
| MRK-P2-02 | Selection restore robust after marker reinsert/reorder | P2 | Completed | `js/panels/MarkersPanel.js` saves/restores `layerIndex+markerIndex` with fallback `layer+type+time` tolerance |
| MRK-P2-03 | Deterministic operation ordering keys | P2 | Completed | `host/modules/LayerOperations.jsx` added `_sortMarkerOpsDescending(...)` and consistent ordering per layer operation |
| MRK-P3-01 | Replace direct `JSON.parse` with safe parse in marker ops | P3 | Completed | Marker operation entry points now use `safeJSONParse(optsJSON, null)` |
| MRK-P3-02 | Guard undo close with internal started flag | P3 | Completed | Marker operations use `undoStarted` with guarded `endUndoGroup()` in catch paths |
| MRK-P3-03 | Standardize structured failure behavior for marker ops | P3 | Completed | Marker ops consistently return `error(...)`; secondary undo exceptions are suppressed |
| MRK-P4-01 | Surface host error reason in load/select flows | P4 | Completed | `js/panels/MarkersPanel.js` now shows `res.error` in empty-state/status paths |
| MRK-P4-02 | Persist/restore MARKERS filters via state manager | P4 | Completed | `js/panels/MarkersPanel.js` added `loadSavedFilters()`, `persistFilters()`, and checkbox/UI sync |
| MRK-P4-03 | Align blink color semantics docs/UI | P4 | Completed | `docs/MARKERS_TAB_FEATURES.md` wording aligned to green blink semantics |

## 2. Validation Evidence

| Check | Result | Evidence |
|---|---|---|
| JS syntax (panel/ops) | Passed | `node --check` on `js/panels/MarkersPanel.js`, `js/operations/MarkersOps.js`, `js/operations/LayersOps.js` |
| Typewriter timing writer contract | Passed | `host/modules/TypewriterManager.jsx` timing markers use `inPoint + timing.*` |
| Motion marker relay contract | Passed | `host/modules/MotionManager.jsx` uses `markerTime = keyTime - inPoint` |
| Stagger sign propagation | Passed | `host/modules/LayerOperations.jsx` uses signed `delay`; UI status keeps sign |
| Marker ops safe parse | Passed | No `JSON.parse(optsJSON)` in marker operation entry points |
| Deterministic post-op restore support | Passed | Host returns updated marker tuples; UI refresh accepts selection override |
| Delete operation selection clearing | Passed | `js/operations/MarkersOps.js` preserves `[]` override when refreshing panel |

## 3. Open Items

1. Manual After Effects UAT is still required for release promotion:
   - Non-zero `inPoint` timing parity checks.
   - `M+` vs `M-` behavior at 24/25/30/60 fps.
   - Multi-layer and duplicate-type marker targeting under repeated operations.

## 4. Gate Status

| Gate | Status | Notes |
|---|---|---|
| Dev Gate | Passed | Core remediation implemented and syntax checks passed for modified JS files |
| Integration Gate | Passed | UI-host marker contracts aligned (`markers` payload returned and reused for restore) |
| UAT Gate | Pending Manual Run | Requires host validation in After Effects |
| Release Gate | Conditional Ready | Blocked only by manual UAT evidence |

