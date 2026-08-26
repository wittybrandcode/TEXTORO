# Remaining Tabs Remediation Plan - TEXTORO

Date: 2026-02-28  
Based on: `01_REMAINING_TABS_TECHNICAL_AUDIT_2026-02-28.md`  
Goal: Resolve critical/high logic defects in non-MARKERS tabs while preserving all features.

## Execution Update (2026-03-06)

Completed in current pass:
1. P0 critical fixes (`RT-P0-01`, `RT-P0-02`) implemented.
2. P1 reliability hardening (`RT-P1-01`, `RT-P1-02`, `RT-P1-03`) implemented.
3. P2 contract safety fixes (`RT-P2-01`, `RT-P2-02`, `RT-P2-03`) implemented.

Pending:
1. Manual AE host UAT evidence capture.
2. Optional P3 UX observability improvements.

## 1. Objectives

1. Remove runtime blockers in MultiLines split/apply flow.
2. Restore deterministic Typewriter timing behavior when values are `0`.
3. Harden host undo/error handling across remaining tab modules.
4. Prevent NaN timing propagation in Motion apply paths.
5. Preserve Soga Motion link-mode semantics unless explicitly changed.
6. Improve Settings error observability.

## 2. Scope

In scope:
- `js/panels/MultiLinesPanel.js`
- `js/panels/MotionPanel.js`
- `js/panels/SogaPanel.js`
- `js/panels/SettingsPanel.js`
- `host/modules/TypewriterManager.jsx`
- `host/modules/MotionManager.jsx`
- `host/modules/MultiLinesManager.jsx`
- `host/modules/SogaManager.jsx`
- `host/modules/BoxManager.jsx` (undo-safety review)
- `host/modules/PresetManager.jsx` (undo-safety review)

Out of scope:
- New UI features or redesign.
- Architecture migration beyond contract-safe hardening.

## 3. Phased Plan

### Phase P0 - Runtime Blockers (Critical)

Tasks:
1. `RT-P0-01` Fix undefined `blinkInHoldEl` scope in `splitAndApply`.
2. `RT-P0-02` Replace Typewriter timing coercion (`||`) with null-safe numeric parsing.
3. `RT-P0-03` Add regression checks for zero-time inputs (`0`, `0:00`, `0.00`).

Acceptance criteria:
1. `splitAndApply` executes without runtime reference errors.
2. Typewriter accepts valid zero-time values without default override.
3. Type presets with `inStart: 0` apply as-is.

### Phase P1 - Host Reliability Hardening (High)

Tasks:
1. `RT-P1-01` Add `undoStarted` guard pattern in affected host entry points.
2. `RT-P1-02` Ensure catch-path never introduces secondary undo exceptions.
3. `RT-P1-03` Keep structured JSON error envelopes stable under failure.

Acceptance criteria:
1. No unguarded `endUndoGroup` in audited host entry functions.
2. Failures return clean parseable error payloads to UI.

### Phase P2 - Motion/Soga Contract Safety (High/Medium)

Tasks:
1. `RT-P2-01` Sanitize Motion OUT timing inputs (`NaN` -> safe default or validation error).
2. `RT-P2-02` Preserve Soga motion link modes by default, unless explicit unlink behavior is requested.
3. `RT-P2-03` Prevent unrelated Soga edits from silently rewriting motion linkage state.

Acceptance criteria:
1. Motion apply never writes `NaN` to controllers.
2. Soga edits do not mutate link mode unexpectedly.
3. Existing linked motion remains linked after non-motion edits.

### Phase P3 - UX Observability (Medium/Low)

Tasks:
1. `RT-P3-01` Add explicit StatusBar feedback for failed Settings host calls.
2. `RT-P3-02` Add focused error messages for invalid timing inputs.

Acceptance criteria:
1. Settings failure states are visible and actionable.
2. Input validation errors are clear and non-silent.

## 4. Validation Matrix

1. MultiLines:
   - Run `splitAndApply` with/without cursor and verify success.
2. Typewriter:
   - Apply with `inStart=0`, `blinkStart=0`, `outStart=0` and verify host receives intended values.
3. Motion:
   - Enable OUT with blank/invalid fields and verify defensive handling.
4. Soga:
   - Edit Typewriter/Box on layer with Motion linked and verify link mode is preserved.
5. Reliability:
   - Simulate host exceptions and verify stable JSON error responses.

## 5. Governance

1. Dev Gate: P0 + P1 complete with static checks.
2. Integration Gate: P2 contract checks complete.
3. UAT Gate: manual AE host scenarios signed.
4. Release Gate: tracker evidence complete and open critical risks closed.
