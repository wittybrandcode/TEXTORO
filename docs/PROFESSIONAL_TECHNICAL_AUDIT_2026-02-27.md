# Professional Technical Audit Report - TEXTORO CEP Extension

Date: 2026-02-27
Project Path: C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\TEXTORO
Audit Scope: Runtime integrity, UI/Host contract, compatibility, reliability, maintainability.

## 1. Executive Summary

This audit found multiple confirmed defects that directly affect user behavior and production reliability.

Critical outcomes:
- Box settings are not correctly read from UI in multiple fields (wrong DOM IDs), causing user input to be ignored.
- Settings panel contract for expression version management is broken (payload/response mismatch with host API).
- Status messaging is effectively disconnected (StatusBar targets non-existent DOM node).
- JavaScript syntax level (optional chaining) conflicts with declared broad AE compatibility in manifest and likely breaks on older CEP engines.

Overall technical status: Functional but contract-drifted and unsafe for broad-version deployment without remediation.

## 2. Methodology

- Static architecture and code review across:
  - `CSXS/manifest.xml`
  - `index.html`
  - `js/core/*`, `js/state/*`, `js/ui/*`, `js/panels/*`, `js/operations/*`
  - `host/index.jsx`, `host/modules/*`
- API call mapping:
  - Extracted all `TEXTORO.HostBridge.run(...)` calls and validated host-side function existence.
- DOM contract validation:
  - Compared IDs referenced from JS against IDs actually present in `index.html`.
- Syntax and compatibility checks:
  - JS syntax check passed with Node parser.
  - Compatibility risks assessed against CEP/AE runtime assumptions.

## 3. Confirmed Findings

### Critical-01: Box panel reads wrong input IDs (user values ignored)
Severity: Critical

Evidence:
- UI actual IDs in `index.html`:
  - `numPadL/numPadR/numPadT/numPadB` at lines 190-193
  - `numStrokeW` line 224
  - `numStrokeOp` line 228
  - `numFillOp` line 254
  - `chkLockSize` line 301
- `BoxPanel.js` uses non-existent IDs:
  - `numPaddingLeft` line 79
  - `numPaddingRight` line 80
  - `numPaddingTop` line 81
  - `numPaddingBottom` line 82
  - `numStrokeWidth` line 89
  - `numStrokeOpacity` line 90
  - `numFillOpacity` line 94
  - `chkLockBoxSize` line 99

Impact:
- Box creation uses fallback defaults instead of user-entered values for key controls.
- Perceived as "Box controls not working".

Recommended fix:
- Update `js/panels/BoxPanel.js` to use actual DOM IDs from `index.html`.
- Add a lightweight DOM contract assertion during panel init to fail fast on missing IDs.

---

### Critical-02: Settings expression version API contract mismatch
Severity: Critical

Evidence:
- UI call payloads in `js/panels/SettingsPanel.js`:
  - `getAvailableVersionsJS` called with `JSON.stringify(category)` at line 70.
  - `setActiveVersionJS` payload built as array string at line 93.
- Host expects object payload:
  - `ExpressionLoader.jsx` line 359 parses `opts.category` / `opts.name`.
  - line 382 expects `opts.category`, `opts.name`, `opts.version`.
- Response mismatch:
  - Host returns `{ versions, current }` in `data` (line 372).
  - UI expects `res.data.length` and iterates `res.data.forEach` (SettingsPanel lines 71-75).

Impact:
- Expression version selector cannot reliably load available versions.
- Changing version can silently fail.

Recommended fix:
- Send object payloads from UI:
  - `{ category: 'typewriter', name: 'sourceText' }` etc.
  - `{ category, name, version }` for set.
- Consume response as `res.data.versions` and `res.data.current`.
- Add one smoke check per API call during panel init.

---

### High-01: StatusBar targets non-existent DOM node
Severity: High

Evidence:
- `StatusBar.js` uses `document.getElementById('statusText')` (lines 19, 30).
- Actual status element in `index.html` is `id="status"` (line 1026).

Impact:
- Most success/error/info feedback is not rendered to user.
- Debugging and trust are reduced due silent feedback path.

Recommended fix:
- Align on a single ID (`status`) in `js/ui/StatusBar.js`.
- Optional: keep fallback support for legacy ID if needed.

---

### High-02: Compatibility risk from modern JS syntax vs declared host range
Severity: High

Evidence:
- Manifest supports very broad AE range: `AEFT [13.0,99.9]` (`manifest.xml` line 8), `CSXS 6.0` (line 14).
- Code contains optional chaining in many files (`?.`) - 67 occurrences found.

Impact:
- On older CEP Chromium engines, parsing may fail at load time.
- Panel may fail to initialize in environments still covered by manifest range.

Recommended fix:
- Either:
  1) Narrow supported host versions in manifest to runtime levels that support modern syntax.
  2) Transpile UI JS to CEP-safe syntax (recommended for broader support).

---

### Medium-01: Main entry binds legacy action button IDs not present in HTML
Severity: Medium

Evidence:
- `main-entry.js` binds `btnApply`, `btnRemove`, `btnSplit`, `btnSplitApply` (lines 160-163).
- Buttons are dynamically generated with different IDs via `ActionBar.js`.

Impact:
- Dead/legacy binding path increases confusion and maintenance risk.

Recommended fix:
- Remove legacy binding block from `main-entry.js`.
- Keep action handling centralized in `ActionBar.js`.

---

### Medium-02: Multi-lines `blinkInHold` cannot be set to false
Severity: Medium

Evidence:
- `MultiLinesPanel.js` line 144:
  - `blinkInHold: document.getElementById('chkBlinkInHold')?.checked || true`

Impact:
- When checkbox is unchecked, expression resolves to `true`.
- User cannot disable blink-in-hold through this path.

Recommended fix:
- Use nullish-safe logic:
  - `var el = document.getElementById('chkBlinkInHold');`
  - `blinkInHold: el ? el.checked : true`

---

### Medium-03: Version identity drift across project surfaces
Severity: Medium

Evidence:
- `CHANGELOG.md` latest `3.5.4` (line 7).
- UI header shows `v3.5.0` (`index.html` line 14).
- Settings About shows `v2.5.12` (`index.html` line 1003).
- `Config.VERSION` is `3.4.0` (`js/core/Config.js` line 11).
- Manifest bundle version `3.4.0` (`manifest.xml` lines 2, 4).
- Host header comment still `v3.2.0` (`host/index.jsx` line 3).

Impact:
- Release governance confusion, support friction, misaligned bug reports.

Recommended fix:
- Establish one authoritative version source (build-injected).
- Render all UI/manifest/docs versions from that source.

## 4. Additional Technical Risks

- `clearExpressionCache()` in host does not return standardized JSON response (`host/modules/ExpressionLoader.jsx` lines 194-199), while bridge expects parseable structured responses.
- Duplicate/legacy compatibility layer is large (`js/legacy/aliases.js`) and increases surface for drift.
- No automated tests folder found; regression risk is high for refactors affecting UI-host contract.

## 5. Prioritized Remediation Plan

### Phase A (Immediate - same day)
1. Fix BoxPanel ID mapping.
2. Fix SettingsPanel payload/response contract.
3. Fix StatusBar target ID.
4. Fix `blinkInHold` boolean handling.

Exit criteria:
- Manual smoke: Box values, expression version load/change, status feedback, multi-lines blink behavior all pass.

### Phase B (1-2 days)
1. Remove legacy dead binding from `main-entry.js`.
2. Normalize clear-cache response contract (host returns `success(...)`).
3. Add defensive UI-host smoke checks at startup.

Exit criteria:
- No silent API failures at panel startup.

### Phase C (2-4 days)
1. Compatibility strategy decision:
   - transpile to CEP-safe JS, or
   - narrow manifest support range.
2. Establish single-source semantic versioning across manifest/UI/docs.

Exit criteria:
- Deterministic compatibility matrix and clean release metadata.

## 6. Suggested Validation Checklist After Fixes

- Box Tab:
  - Change padding/stroke/fill/lock values and confirm actual host output differs accordingly.
- Settings Tab:
  - Version lists load per category; changing version persists and reflects active value.
- Status Feedback:
  - Success/error messages visible for apply/remove/save actions.
- Multi-lines:
  - `blinkInHold` ON/OFF behavior verified on generated layers.
- Compatibility:
  - Launch smoke on lowest officially supported AE/CEP target.

## 7. Conclusion

TEXTORO has a strong modular foundation but currently suffers from contract drift between UI and host plus UI-level mapping errors that directly affect end-user behavior. The issues are fixable with a focused remediation cycle and should be addressed before any broad release or compatibility claims.
