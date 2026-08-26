# MARKERS Remediation Plan - TEXTORO

Date: 2026-02-28  
Based on: `01_MARKERS_TECHNICAL_AUDIT_2026-02-28.md`  
Goal: Restore deterministic, predictable, and supportable MARKERS behavior.

Execution status (as of 2026-02-28): implementation complete, manual AE UAT pending.  
Tracker: `03_MARKERS_EXECUTION_TRACKER_2026-02-28.md`

## 1. Objectives

1. Normalize marker source contract (producer and consumer use the same time base).
2. Normalize motion preset marker-sync relay to the same relative timing contract.
3. Fix functional mismatch in MARKERS stagger direction.
4. Make marker targeting deterministic after all mutation operations.
5. Harden host error handling and bridge response safety.
6. Improve MARKERS UX observability and state continuity.

## 2. Scope

In scope:
- `js/panels/MarkersPanel.js`
- `js/operations/MarkersOps.js`
- `host/modules/LayerOperations.jsx`
- `host/modules/TypewriterManager.jsx`
- `host/modules/MultiLinesManager.jsx`
- `host/modules/PresetManager.jsx`
- `host/modules/MotionManager.jsx`
- `js/panels/PresetsPanel.js`
- `js/state/StateManager.js` integration points
- `index.html` / `css/style.css` consistency fixes (if required)

Out of scope:
- Re-architecture of non-MARKERS tabs.
- New feature expansion beyond current tab contract.

## 3. Execution Phases

### Phase P0 - Source Contract Normalization (Critical)

Tasks:
1. `MRK-P0-01` Enforce one contract for timing markers: composition key time = `layer.inPoint + relativeTiming`.
2. `MRK-P0-02` Update primary writer path in `TypewriterManager` marker creation to use layer `inPoint`.
3. `MRK-P0-03` Ensure multi-apply and preset paths inherit the same writer behavior (no divergent marker writer path).
4. `MRK-P0-04` Keep metadata markers (`TW_TEXT`, `CURSOR_CHAR`) behavior explicit and documented.
5. `MRK-P0-05` Fix `applyMotionPreset(syncWithMarkers)` relay so marker-derived timing is converted to layer-relative before writing controls (or enforce `syncMode=1` with clear contract).

Acceptance Criteria:
1. For any layer with non-zero `inPoint`, extracted relative timing from markers equals the input timing values.
2. Typewriter expression and motion sync return identical behavior before/after reapply on the same layer.
3. No path writes timing markers with raw non-offset times.
4. Motion preset with `syncWithMarkers=true` starts/ends at the same visual timings as marker-driven runtime sync on non-zero `inPoint`.

### Phase P1 - Functional Correction (Critical)

Tasks:
1. `MRK-P1-01` Fix marker stagger direction in host.
2. `MRK-P1-02` Keep status message sign-aware for stagger direction.
3. `MRK-P1-03` Add regression checks for `M+` vs `M-` across `asc/desc/random`.

Acceptance Criteria:
1. `M+` and `M-` produce opposite directional timing changes on markers.
2. Status text accurately reflects effective direction.
3. Behavior is reproducible at 24/25/30/60 fps.

### Phase P2 - Deterministic Marker Identity

Tasks:
1. `MRK-P2-01` Include `markerIndex` in host operation matching logic (primary match), with safe fallback by type/time.
2. `MRK-P2-02` Update selection restore strategy to survive marker reinsert/reorder after operations.
3. `MRK-P2-03` Ensure deterministic sort keys for operation ordering (layer, time, marker index).

Acceptance Criteria:
1. Same selected markers remain targeted after repeated offset/align/stagger cycles.
2. Selection restore does not drift in standard workflows.
3. No ambiguous targeting when multiple markers share close timings.

### Phase P3 - Host Reliability Hardening

Tasks:
1. `MRK-P3-01` Replace direct `JSON.parse` with `safeJSONParse` in marker operation entry points.
2. `MRK-P3-02` Guard `app.endUndoGroup()` with an internal started flag.
3. `MRK-P3-03` Standardize structured error responses in all marker operation failures.

Acceptance Criteria:
1. Host always returns parseable JSON envelope on failure.
2. No secondary exception from `endUndoGroup` in catch path.
3. Bridge parse errors are eliminated for tested error scenarios.

### Phase P4 - UX Contract Alignment

Tasks:
1. `MRK-P4-01` Surface host error reason in MARKERS load/select flows (instead of generic empty state only).
2. `MRK-P4-02` Persist and restore `markersFilters` via `StateManager`.
3. `MRK-P4-03` Align blink color semantics across docs/UI/CSS.

Acceptance Criteria:
1. User sees actionable errors when collect/select fails.
2. Filters persist after panel reload.
3. Documentation and UI use the same marker color mapping.

## 4. Validation Matrix

1. Functional:
   - Offset/Align/Stagger on 1, 10, 50 markers.
   - `M+` and `M-` verified as opposite.
   - Layer with non-zero `inPoint` keeps correct relative animation timing after apply/reapply.
2. Determinism:
   - Repeat same operation 3 times and verify same targeted markers.
   - Test with mixed marker types per layer.
3. Reliability:
   - Invalid payload simulation should still return JSON error.
   - No host warning from unmatched undo group handling.
4. UX:
   - Simulated collect failure shows explicit message.
   - Filter state retained after reload.

## 5. Delivery Governance

Gate sequence:
1. Dev Gate: P0 + P1 + P2 code complete with static checks.
2. Integration Gate: UI-host contract verified end-to-end.
3. UAT Gate: manual After Effects validation matrix signed.
4. Release Gate: docs updated and risk log closed.

## 6. Estimated Effort

1. P0: 1.0 to 1.5 days
2. P1: 0.5 day
3. P2: 1.0 to 1.5 days
4. P3: 0.5 day
5. P4: 0.5 day

Total estimate: 3.5 to 4.5 engineering days.
