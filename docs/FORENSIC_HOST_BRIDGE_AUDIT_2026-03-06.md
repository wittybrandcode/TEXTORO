# TEXTORO Forensic Host-Bridge Audit
Date: 2026-03-06
Project Path: `C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\TEXTORO`
Host Observed: `AEFT 17.1.4` (from CEP log naming)

## Addendum (2026-03-06, post-audit implementation)
Implemented in current workspace after this audit:
- `js/core/HostBridge.js`: removed fragile `this[fn]`-only pre-check and switched invocation to robust global/eval flow.
- `CSXS/manifest.xml` + `.debug`: restored canonical extension identity to `com.textoro.panel` and menu label `TEXTORO`.

Status note:
- This audit captures root-cause evidence as observed before remediation.
- Use `docs/professional_remediation_plan_2026-02-28/03_EXECUTION_TRACKER.md` for latest execution status and evidence.

## 1) Executive Summary
Current failure is concentrated in the CEP-to-ExtendScript bridge path, not in tab business logic itself.

Observed runtime errors:
- `Host function not found: applyTypewriter`
- `Host function not found: loadPresets`
- `Failed to load versions ...`

This means UI modules are loaded and firing host calls, but host function resolution is failing at runtime.

## 2) Evidence Collected
### 2.1 UI call sites are valid
- `loadPresets` is called from Motion panel:
  - `js/panels/MotionPanel.js:71,84`
- `getAvailableVersionsJS` is called from Settings panel:
  - `js/panels/SettingsPanel.js:88`

### 2.2 Host functions exist in source
- `loadPresets(optsJSON)` exists:
  - `host/modules/PresetManager.jsx:341`
- `getAvailableVersionsJS(optsJSON)` exists:
  - `host/modules/ExpressionLoader.jsx:358`

### 2.3 Bridge implementation currently enforces function lookup via `this[fn]`
- `js/core/HostBridge.js:110-114`
- Code path returns `Host function not found` before attempting actual call.

### 2.4 Extension identity changed from original
- Manifest now uses:
  - `ExtensionBundleId="com.textoro.panel.fixed"`
  - `Menu>TEXTORO FIXED`
  - `CSXS/manifest.xml:2-4,29`

### 2.5 Icons are externally hosted
- Font Awesome loaded from CDN:
  - `index.html:6`
- If network/CDN blocked, icon-only buttons appear missing.

## 3) Root Cause Analysis
## RC-1 (High Confidence): HostBridge resolution regression
The bridge currently resolves host functions using:
- `var __root=this;`
- `typeof __root[__fn] !== 'function'`

In ExtendScript eval context, relying on `this` for host global symbol lookup is fragile and can produce false negatives even when global functions exist.

Impact:
- `Host function not found:*` errors across tabs.
- Core workflows fail despite host modules defining those functions.

## RC-2 (Medium Confidence): Original host availability issue still possible
Before bridge rewrite, errors were `Empty response from host`. This indicates there may be an underlying host-init problem in addition to RC-1.

Potential contributors:
- Script engine not reachable from CEP session.
- Host include chain fails at load time on a specific module (silent fail in this environment).

## RC-3 (High Confidence): UI icon disappearance is separate from host error
Icons depend on external CDN. This is independent from host function failures.

## 4) What Not To Do Next
- Do not continue broad identity/version/cache workarounds without proving bridge and host handshake first.
- Do not keep adding retries around failing calls while function resolution itself is incorrect.

## 5) Deterministic Remediation Plan (For Another Developer)
## Phase A - Stabilize Baseline
1. Revert bridge function resolution logic from `this[fn]` lookup.
2. Use direct eval invocation for host functions:
   - `fnName('jsonPayload')`
3. Keep response parser strict, but avoid pre-checking existence via `this`.

Success criterion:
- `applyTypewriter` no longer fails with `Host function not found`.

## Phase B - Probe Host Reachability First
1. Add temporary probe endpoint in panel startup:
   - `evalScript('1+1')`
   - `evalScript('$.fileName')`
2. Log raw callback exactly once at startup.

Success criterion:
- Non-empty probe response confirms evalScript channel alive.

## Phase C - Isolate Host Include Chain
1. Create temporary `host/index_min.jsx` with only:
   - `modules/Config.jsx`
   - `modules/Utilities.jsx`
   - simple `function pingHost(){ return success('pong'); }`
2. Point manifest `ScriptPath` to `index_min.jsx`.
3. Confirm `HostBridge.run('pingHost')` works.
4. Reintroduce modules incrementally in original order until failure reappears.

Success criterion:
- First failing module identified with certainty.

## Phase D - Remove External UI Dependency
1. Vendor Font Awesome locally into extension assets.
2. Replace CDN link in `index.html` with local path.

Success criterion:
- Icons stable offline and in restricted networks.

## Phase E - Final Hardening
1. Restore single canonical extension ID (no drift across debug/release).
2. Keep one menu label.
3. Add smoke tests (manual checklist) per tab:
   - Type apply/remove
   - Box apply/remove
   - Motion preset load + apply
   - Settings version load/save

## 6) Immediate Handoff Notes
- Current codebase has regression in `js/core/HostBridge.js` function resolution strategy.
- Current runtime errors are actionable and consistent with RC-1.
- Another developer should start from Phase A and Phase B before touching business logic modules.

## 7) File References
- Bridge logic: `TEXTORO/js/core/HostBridge.js:104-121`
- Motion host call: `TEXTORO/js/panels/MotionPanel.js:71,84`
- Settings host call: `TEXTORO/js/panels/SettingsPanel.js:88`
- Host function definitions:
  - `TEXTORO/host/modules/PresetManager.jsx:341`
  - `TEXTORO/host/modules/ExpressionLoader.jsx:358`
- Manifest identity/script path: `TEXTORO/CSXS/manifest.xml:2-4,22,29`
- Icon CDN dependency: `TEXTORO/index.html:6`
