# Professional Technical Audit - Remaining Tabs (TEXTORO)

Date: 2026-02-28  
Scope: Type, Box, Presets, Soga, Motion, Settings, MultiLines (excluding MARKERS tab).

## 1. Executive Summary

The remaining tabs are mostly functional, but the analysis found high-impact logic defects that can cause runtime failure, timing drift, and reliability regressions:

1. Runtime `ReferenceError` in MultiLines split/apply flow.
2. Typewriter timing values incorrectly coerced when value is `0`.
3. Unguarded undo-close pattern in multiple host modules.
4. Motion OUT timing can propagate `NaN` from UI to host.
5. Soga can force Motion link modes to unlinked during unrelated edits.

Overall status: stable for common use, but not release-safe without remediation of the critical/high items.

## 2. Methodology

1. Static contract trace: `Panel -> HostBridge -> host/modules`.
2. Cross-tab behavior consistency checks with shared controllers/timing logic.
3. Runtime-risk review for undo/error paths and input sanitization.

## 3. Confirmed Findings

### Critical-01: MultiLines `splitAndApply` uses undefined variable
Severity: Critical  
Area: MultiLines tab runtime

Evidence:
- Undefined variable referenced in `splitAndApply`:
  - `js/panels/MultiLinesPanel.js:146` (`blinkInHold: blinkInHoldEl ? ...`)
- Variable is declared in another function scope:
  - `js/panels/MultiLinesPanel.js:96` (inside `getOptions()`)
  - `js/panels/MultiLinesPanel.js:109` (`splitAndApply` start)

Impact:
- `splitAndApply` can fail at runtime with `ReferenceError`, blocking split+type workflows.

### Critical-02: Typewriter timing `0` values are overwritten by defaults
Severity: Critical  
Area: Typewriter core timing contract

Evidence:
- Timing extraction uses `parseFloat(...) || default`:
  - `host/modules/TypewriterManager.jsx:381-387`
  - Examples:
    - `inStart = parseFloat(opts.inStart) || 2`
    - `outStart = parseFloat(opts.outStart) || -1`

Impact:
- Valid value `0` is treated as falsy and replaced by defaults.
- User intent is lost for `inStart/inEnd/outStart/outEnd/blinkStart/blinkEnd`.
- Presets with zero timing values are altered unexpectedly at apply time.

### High-01: Undo-group close is not guarded in several host modules
Severity: High  
Area: Host reliability / bridge response safety

Evidence (representative):
- `host/modules/TypewriterManager.jsx:68-69`
- `host/modules/MotionManager.jsx:206-207`, `:377-378`
- `host/modules/MultiLinesManager.jsx:150-151`, `:216-217`, `:267-268`
- `host/modules/SogaManager.jsx:345-346`

Impact:
- If an exception happens before `beginUndoGroup`, catch-path `endUndoGroup` can throw again.
- Secondary exceptions can break consistent error envelopes returned to UI.

### High-02: Motion OUT timing may pass `NaN` from UI to host
Severity: High  
Area: Motion tab input contract

Evidence:
- UI can produce `NaN` when OUT is enabled and input is empty:
  - `js/panels/MotionPanel.js:427-428`
- Host accepts non-`undefined` values directly:
  - `host/modules/MotionManager.jsx:225-226` (`opts.outStart !== undefined ? opts.outStart : -1`)

Impact:
- `NaN` may reach slider controller writes, causing unstable or failed motion apply.

### Medium-01: Soga forces Motion link modes to unlinked
Severity: Medium  
Area: Soga behavior consistency

Evidence:
- Soga sends motion values whenever motion panel is visible:
  - `js/panels/SogaPanel.js:418-420`
- Collected motion values hardcode link modes:
  - `js/panels/SogaPanel.js:463`, `:471`, `:477`, `:483` (all set to `1`)

Impact:
- Existing linked motion behavior can be rewritten to unlinked, even when user edits non-motion controls.

### Low-01: Settings host failures are not surfaced clearly
Severity: Low  
Area: Settings observability

Evidence:
- Success-only branches without explicit error status:
  - `js/panels/SettingsPanel.js:136-138`
  - `js/panels/SettingsPanel.js:166-168`

Impact:
- Users may see stale values without knowing host call failed.

## 4. Tab-by-Tab Status

1. Type: Functional with critical timing coercion issue (`0` values).
2. Box: No critical contract mismatch found in current pass.
3. Presets: Functionally aligned, but inherits Typewriter timing coercion risk when applying type-based presets.
4. Soga: Core flow works; medium behavior drift in Motion link-mode handling.
5. Motion: Core flow works; high input-sanitization gap for OUT timing.
6. Settings: Functional but weak failure observability.
7. MultiLines: Critical runtime defect in split+apply path.

## 5. Immediate Priority

1. Fix MultiLines runtime variable scope defect.
2. Replace Typewriter timing parsing with null-safe numeric parsing (not falsy coercion).
3. Harden undo handling in host modules with `undoStarted` guards.
4. Sanitize Motion OUT timings in UI and host.
5. Preserve or explicitly control Soga Motion link modes.

