# TEXTORO Validation and Release Gates

Date: 2026-02-28

## 1. Validation Strategy
Validation is evidence-driven and tied to each remediation task.

Evidence types:
1. Code reference (file + line).
2. Behavioral smoke result.
3. Risk/decision entry in tracker.

## 2. Smoke Test Matrix

### A. Box Flow
- Verify padding/stroke/fill/lock values from UI are applied correctly.
- Verify 4-corner and single-corner modes both work.

### B. Settings Flow
- Verify expression versions load by category.
- Verify version change persists and active value updates.
- Verify clear cache returns structured success/failure.

### C. Status Feedback
- Verify success/error messages are visible in action bar status area.

### D. Multi-lines Flow
- Verify `blinkInHold` true/false behavior is preserved correctly.

### E. Core Apply/Remove Regression
- Typewriter apply/remove
- Box create/remove
- Motion apply/remove

## 3. Gate Criteria

### Dev Gate
- All P0 tasks implemented.
- Local smoke pass for affected modules.
- No known blocking runtime errors.

### Integration Gate
- UI/Host contract checks pass for changed APIs.
- No mismatched payload format in targeted methods.

### UAT Gate
- End-to-end user workflows pass on agreed scenarios.
- No critical/high unresolved defects in scope.

### Release Gate
- Version alignment complete.
- Rollback notes complete.
- Tracker finalized with closure statement.

## 4. Exit Checklist
1. Tracker statuses all moved to Done or Accepted Risk.
2. Decision log complete.
3. Release package metadata consistent.
4. Handover notes complete.

## 5. Rollback Strategy (Minimum)
1. Keep pre-remediation checkpoint/tag.
2. Revert by scoped patch if only one module fails.
3. If multiple modules fail, restore checkpoint and re-scope.
