# TEXTORO Rollback Notes and Post-Release Watchlist

Date: 2026-02-28
Program: Professional Remediation Plan

## 1. Rollback Trigger Conditions

Trigger rollback if any of the following is observed during UAT or early release:
1. Settings tab cannot load or set expression versions.
2. Box controls ignore user-entered values.
3. Apply/remove flows fail due action bar event path regression.
4. Panel fails to load on supported AE hosts in compatibility range.
5. Status/error feedback becomes non-visible in action bar.

## 2. Scoped Rollback Strategy

Rollback should be scoped to the failing module first, not full package revert.

Priority rollback order:
1. `js/panels/SettingsPanel.js` and `host/modules/ExpressionLoader.jsx` for version-management issues.
2. `js/panels/BoxPanel.js` for box-value mapping regressions.
3. `js/ui/StatusBar.js` and `css/style.css` for status rendering regressions.
4. `js/main-entry.js` for action binding regressions.
5. `CSXS/manifest.xml` only if compatibility deployment scope must be widened temporarily.

If more than one functional area regresses, restore the pre-remediation package snapshot and re-scope by defect.

## 3. Operational Rollback Procedure

1. Reproduce and log exact failure path.
2. Isolate failing module using tracker evidence links.
3. Revert only the impacted file set.
4. Re-run targeted smoke checklist from `02_VALIDATION_AND_RELEASE_GATES.md`.
5. Update `03_EXECUTION_TRACKER.md` with rollback decision and resulting status.

## 4. Post-Release Watchlist (First 7 Days)

Monitor the following:
1. Expression version load/change success rate.
2. Box parameter fidelity (padding/stroke/fill/lock) against UI inputs.
3. Action bar apply/remove responsiveness by tab.
4. Error/success message visibility and clarity.
5. Any host load failure reports for AE versions in declared support range.

## 5. Escalation Matrix

1. Critical user-facing breakage: hotfix immediately, hold release promotion.
2. High severity non-blocking issue: triage within same day and patch in next build.
3. Medium/low maintainability issue: backlog unless user workflow is affected.

## 6. Ownership and Evidence

1. Owner: Engineering
2. Canonical execution record: `03_EXECUTION_TRACKER.md`
3. Closure reference: `04_CLOSURE_SUMMARY.md`
