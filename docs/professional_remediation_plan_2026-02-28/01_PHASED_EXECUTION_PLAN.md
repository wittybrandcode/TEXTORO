# TEXTORO Phased Execution Plan

Date: 2026-02-28
Reference Audit: `docs/PROFESSIONAL_TECHNICAL_AUDIT_2026-02-27.md`

## 1. Prioritization Framework
- Priority P0: Direct functional breakage and contract failures.
- Priority P1: Compatibility and release governance risks.
- Priority P2: Maintainability and cleanup after stabilization.

## 2. Phase 0 - Baseline and Change Safety
Status: Completed (2026-02-28)

Tasks:
- TXR-P0-BASE-01: Create remediation branch/tag strategy.
- TXR-P0-BASE-02: Capture pre-fix baseline behavior notes.
- TXR-P0-BASE-03: Freeze scope to audited defects only.

Definition of Done:
- Branch and rollback approach documented.
- Baseline behavior recorded in tracker.

## 3. Phase 1 - Critical Functional Fixes (P0)
Status: Completed (2026-02-28)

Tasks:
- TXR-P0-01: Fix BoxPanel DOM ID mapping to actual `index.html` IDs.
- TXR-P0-02: Fix SettingsPanel payload and response contract for:
  - `getAvailableVersionsJS`
  - `setActiveVersionJS`
- TXR-P0-03: Fix StatusBar target element binding (`status` vs `statusText`).
- TXR-P0-04: Fix `blinkInHold` boolean handling in MultiLines flow.
- TXR-P0-05: Standardize `clearExpressionCache` host response contract.

Definition of Done:
- Each task has code diff + smoke evidence.
- No regression in core apply/remove flows.

## 4. Phase 2 - Integration Integrity and Compatibility (P1)
Status: Completed (2026-02-28)

Tasks:
- TXR-P1-01: Remove dead/legacy event binding path from `main-entry.js`.
- TXR-P1-02: Resolve compatibility strategy for modern JS syntax:
  - Option A: Manifest support range narrowing.
  - Option B: Build transpilation path for CEP-safe syntax.
- TXR-P1-03: Align version identity across manifest, config, UI surfaces, and docs.

Definition of Done:
- Selected compatibility strategy is explicit and implemented.
- Single authoritative version reference is applied.

## 5. Phase 3 - Validation and Release Readiness
Status: In Progress (Dev/Integration passed, UAT host-manual pending)

Tasks:
- TXR-P1-04: Execute gate checklist (Dev/Integration/UAT/Release).
- TXR-P1-05: Produce final remediation closure summary.
- TXR-P1-06: Publish rollback notes and post-release watchlist.

Definition of Done:
- All gates passed with evidence in tracker.
- Residual risks are listed and accepted.

## 6. Dependency Map
1. Phase 0 must complete before any implementation.
2. Phase 1 must complete before compatibility finalization.
3. Phase 2 must complete before UAT gate.
4. Phase 3 closes the cycle.

## 7. Estimated Sequence (Working Sessions)
1. Session A: Phase 0 + TXR-P0-01/02
2. Session B: TXR-P0-03/04/05
3. Session C: TXR-P1-01/02/03
4. Session D: Validation gates + closure

## 8. Execution Snapshot (2026-02-28)
1. Completed tasks: TXR-P0-BASE-01/02/03, TXR-P0-01/02/03/04/05, TXR-P1-01/02/03, TXR-P1-05/06.
2. In-progress task: TXR-P1-04 (manual UAT in After Effects required to close final gate).
