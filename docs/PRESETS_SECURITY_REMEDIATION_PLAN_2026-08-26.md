# TEXTORO - Presets Security and Reliability Remediation Plan

**Date:** 2026-08-26  
**Status:** Ready for implementation  
**Scope:** Preset import, export, save, delete, display, and host API boundaries  
**Target release:** Next patch release after full validation

## 1. Objective

Remove the security and data-integrity defects found in the preset workflow without changing the supported user experience:

1. Imported or user-created presets must never execute HTML or JavaScript in the CEP panel.
2. A preset must never write outside the configured presets root.
3. Saving, importing, renaming, deleting, exporting, and loading must keep the JSON file and `_index.json` consistent.
4. Public ExtendScript helpers must not share conflicting global names.
5. The repaired behavior must be covered by automated checks and an After Effects UAT.

## 2. Non-goals

- Do not redesign Typewriter, Box, Motion, or Soga behavior.
- Do not migrate the entire project to a new framework or module system.
- Do not modify built-in presets in `config/presets/`.
- Do not remove historical documents; this document supersedes them only for the issues listed here.

## 3. Findings and Priority

| ID | Priority | Finding | Primary files |
|---|---|---|---|
| SEC-01 | P0 | Untrusted preset metadata is inserted with `innerHTML`, allowing stored XSS in CEP. | `js/panels/MotionPanel.js` |
| SEC-02 | P0 | A single imported preset controls `category`; path concatenation permits traversal outside the presets root. | `host/modules/ImportExport.jsx` |
| DATA-01 | P1 | UI deletion uses `name`; the host deletes the file but leaves its index entry. | `js/panels/PresetsPanel.js`, `host/modules/PresetManager.jsx` |
| DATA-02 | P1 | Importing a name collision overwrites the JSON file and appends a duplicate index entry. | `host/modules/ImportExport.jsx` |
| API-01 | P2 | Two global functions named `getLayerText` expose incompatible contracts. | `host/modules/Utilities.jsx`, `host/modules/TypewriterManager.jsx` |
| DATA-03 | P2 | `_getISODate()` emits local time with a `Z` (UTC) suffix. | `host/modules/Utilities.jsx` |

## 4. Required Contract

### 4.1 Supported categories

Use one allowlist in the host layer:

```javascript
var PRESET_CATEGORIES = {
    "toro": true,
    "type": true,
    "box": true,
    "mix": true,
    "motion": true,
    "motion-full": true
};
```

Create these private helpers in `host/modules/PresetManager.jsx` (or a small dedicated host module loaded before `ImportExport.jsx`):

```javascript
function _isAllowedPresetCategory(category) { /* allowlist only */ }
function _normalizePresetCategory(category) { /* string validation + allowlist */ }
function _isSafePresetFileName(fileName) { /* no slash, backslash, colon, or .. */ }
function _getUserPresetCategoryFolder(category) { /* validated child of getPresetsPath() */ }
function _getUserPresetFile(category, fileName) { /* validated File object */ }
```

Rules:

- Reject non-string, empty, unknown, and path-like categories.
- Reject a filename containing `/`, `\\`, `:`, or `..`.
- Never accept a raw path from a preset payload as a destination.
- All callers must obtain paths through `_getUserPresetFile`; direct `base + category + "/" + fileName` concatenation is prohibited for user data.

### 4.2 Preset identity

The durable identifier is `id`, never `name` and never display order.

- Every imported or saved user preset gets a fresh `id`.
- UI actions that mutate a preset pass `{ category, id }`.
- `name` is display metadata only.
- `fileName` may be used for read-only discovery and applying a preset, but must be validated before path use.

### 4.3 Collision policy

Use a deterministic, non-destructive policy:

1. Generate a safe base filename from the display name.
2. If the destination exists, append `-2`, `-3`, and so on until it is free.
3. Never overwrite an existing user preset during import or save.
4. Append exactly one matching index entry after the file was written successfully.

This preserves both presets and prevents duplicate `_index.json` records.

### 4.4 Atomic write policy

For a preset JSON file and `_index.json`:

1. Serialize and validate the object before opening a file.
2. Write to a sibling temporary file, for example `name.json.tmp`.
3. Close the temporary file and verify it can be parsed as JSON.
4. Replace the target only after validation succeeds.
5. Update `_index.json` through the same temporary-file flow.
6. If the index update fails after a new preset file was created, remove only that newly-created file and return an error.

ExtendScript has limited filesystem primitives; the implementation must record each completed action and perform best-effort rollback in `catch` blocks. It must never delete an existing preset as rollback.

## 5. Implementation Phases

### Phase 0 - Baseline and Test Fixtures

**Files:** `tools/smoke/`, `docs/UAT_V1/`

1. Run the existing smoke suite and save its output in the implementation PR/task record.
2. Create JSON fixtures under `tools/smoke/fixtures/presets/`:
   - `valid-motion.json`
   - `xss-name.json` with HTML-like `name`, `icon`, and `faIcon`
   - `traversal-category.json` with category `../../outside`
   - `duplicate-name-a.json` and `duplicate-name-b.json`
   - `invalid-schema.json`
3. Add a Node-only test script that validates fixture acceptance/rejection rules. It must not require After Effects.
4. Record a manual UAT baseline for save, import, delete, export, Typewriter, Box, and Motion.

**Acceptance criteria:** Existing smoke checks pass; fixtures exist; baseline behavior is documented.

### Phase 1 - Close the CEP Injection Surface (SEC-01)

**Files:** `js/panels/MotionPanel.js`, optionally `js/core/Utils.js`

1. In `renderPresetButtons`, stop concatenating untrusted `preset.name`, `preset.icon`, or `preset.faIcon` into `innerHTML`.
2. Build DOM nodes explicitly:
   - Use `document.createElement('span')` and `textContent` for the display name and emoji icon.
   - Accept Font Awesome classes only from a strict pattern such as `^fa-(solid|regular|brands) fa-[a-z0-9-]+$`.
   - If a class fails validation, render the default icon instead.
3. Keep `title` as text, not HTML.
4. Audit every remaining `innerHTML` assignment in `js/` and document its data source. Replace any assignment that contains preset, marker, layer, user-input, or host-returned data with DOM APIs or a centrally tested HTML escape helper.

**Acceptance criteria:** Opening a preset whose name is `<img src=x onerror=alert(1)>` renders the literal text; no element is created from it; no script runs.

### Phase 2 - Validate Import Inputs and Paths (SEC-02)

**Files:** `host/modules/PresetManager.jsx`, `host/modules/ImportExport.jsx`

1. Implement the category and filename helpers defined in section 4.1.
2. In `importPresets`, validate `data.category` before `_importSinglePreset` for a single-preset file.
3. In `importPresetFromPath`, validate the supplied category and the category read from the file.
4. In `_importSinglePreset`, validate `preset` shape before accessing its fields:
   - object value
   - non-empty string `name`
   - object `values`
   - allowed category
5. Replace every destination-path concatenation in import/save/delete/rename with a validated helper call.
6. Return `error("Unsupported preset category")` for traversal, unknown, or malformed categories. Do not create folders before validation.

**Acceptance criteria:** `../../outside`, `type/../box`, `C:\\temp`, and unknown categories fail without creating a file or folder. All supported categories continue to import successfully.

### Phase 3 - Make CRUD Consistent (DATA-01 and DATA-02)

**Files:** `host/modules/PresetManager.jsx`, `host/modules/ImportExport.jsx`, `js/panels/PresetsPanel.js`, `js/operations/PresetsOps.js`

1. Extract shared host helpers:
   - `_readUserPresetIndex(category)`
   - `_writeUserPresetIndex(category, index)`
   - `_findIndexEntryById(index, id)`
   - `_createUniquePresetFileName(category, displayName)`
   - `_writeUserPreset(category, preset)`
   - `_deleteUserPreset(category, id)`
2. Make `savePreset` and `_importSinglePreset` call `_writeUserPreset`.
3. Make `deletePreset` require `id`; remove the name-based delete branch after all UI callers are migrated.
4. Update `PresetsPanel.confirmDelete` and `PresetsOps.confirmDelete` to pass `preset.id`. Do not expose delete controls for an item without a valid user `id`.
5. Ensure `_deleteUserPreset` removes the preset JSON and its exact index entry in one logical transaction.
6. Ensure a missing file referenced by an index entry returns a repairable error and does not silently alter unrelated files.
7. During import, select a unique filename before writing. Do not use `open("w")` on an existing preset filename.
8. Add an optional `repairPresetIndex(category)` host command only if needed for existing installations. It should rebuild user index data by scanning `*.json`, skipping `_index.json`, validating each file, and backing up the prior index before replacement.

**Acceptance criteria:**

- Save/import/delete leaves a one-to-one relationship between user JSON files and index entries.
- Deleting through the UI removes both the file and the matching id from `_index.json`.
- Importing two presets with the same name creates two separate files and two unique ids.
- No existing preset is overwritten by import.
- A corrupt or stale index can be repaired without losing valid preset files.

### Phase 4 - Resolve Host API Name Collision (API-01)

**Files:** `host/modules/Utilities.jsx`, `host/modules/TypewriterManager.jsx`, UI call sites and documentation

1. Rename the utility helper to `_getTextLayerContent(layer)`.
2. Retain the public UI host function name `getLayerText()` only if it is part of the documented HostBridge contract.
3. Update all internal callers, documentation, and smoke contract expectations.
4. Add a static smoke check that fails if two host `.jsx` files declare the same global function name, except names on an explicit allowlist.

**Acceptance criteria:** Exactly one host-level `getLayerText()` definition remains; internal helper names are unambiguous.

### Phase 5 - Correct Timestamp Semantics (DATA-03)

**Files:** `host/modules/Utilities.jsx`

Choose one of these explicit policies and document it:

- **Preferred:** Generate true UTC components with `getUTCFullYear`, `getUTCMonth`, `getUTCDate`, `getUTCHours`, `getUTCMinutes`, and `getUTCSeconds`, then append `Z`.
- **Alternative:** Keep local components and append the correct local UTC offset instead of `Z`.

Do not label local time as UTC.

**Acceptance criteria:** A known non-UTC system time produces a timestamp that round-trips correctly as ISO 8601.

### Phase 6 - Extend Automated Checks

**Files:** `tools/smoke/`, `tools/smoke/run-smoke-checks.ps1`

Add the following scripts and run all of them from `run-smoke-checks.ps1`:

| Script | Required assertions |
|---|---|
| `check-preset-input-boundaries.js` | Category allowlist, path traversal rejection, unsafe filename rejection. |
| `check-preset-ui-safety.js` | No untrusted preset fields are concatenated into `innerHTML`; approved static icon templates are allowed. |
| `check-host-global-collisions.js` | Reports duplicate `function` declarations across host modules. |
| `check-es5-host.js` update | Detects `Date.now` and any other unsupported host APIs chosen by the compatibility policy. |

Static checks are not a substitute for host execution. Keep the existing syntax, contract, ES compatibility, JSON parser, version, and encoding checks.

## 6. After Effects UAT Checklist

Run in the minimum supported AE version and the newest supported AE version.

- [ ] Open TEXTORO and confirm no bootstrap or console error.
- [ ] Save a preset for each supported category.
- [ ] Import a valid single preset and a valid preset pack.
- [ ] Import two presets with the same visible name; verify both remain available and distinct.
- [ ] Delete each imported/saved preset from the Presets panel; verify it cannot be exported or loaded by id afterwards.
- [ ] Attempt to import every malicious/invalid fixture; verify a clear error and no filesystem change outside the configured root.
- [ ] Load an imported preset with HTML-looking name/icon; verify literal text only and no script execution.
- [ ] Apply Typewriter, Box, Motion, and Motion Full presets after the changes.
- [ ] Close and reopen AE; verify valid user presets load and the rebuilt index remains consistent.
- [ ] Verify timestamps in exported files represent the selected time policy.

Document results in `docs/UAT_V1/UAT_PRESETS_SECURITY_2026-08-26.md` with AE version, OS, test result, and any failure evidence.

## 7. Release Gate

The patch may be released only when all conditions are true:

- [ ] All existing smoke checks pass.
- [ ] All new static checks pass.
- [ ] The fixture tests pass.
- [ ] UAT passes in the supported AE versions.
- [ ] No remaining caller sends `name` to `deletePreset`.
- [ ] No user-controlled preset field is passed to `innerHTML`.
- [ ] `git diff` is limited to the planned files, tests, and documentation.
- [ ] `CHANGELOG.md` describes the security fix without publishing exploit details.

## 8. Rollback and Data Recovery

1. Before migrating or rebuilding an index, copy `_index.json` to `_index.json.bak-YYYYMMDD-HHMMSS` in the same category folder.
2. Never overwrite existing preset JSON during import; this makes rollback a metadata operation rather than data recovery.
3. If an index write fails, preserve both the old index and all previous preset files. Remove only a newly created temporary file or newly created preset file whose id was not indexed.
4. If release validation fails, revert the application code while retaining user preset files and backups. Do not delete user data as part of rollback.

## 9. Suggested Delivery Order

1. SEC-01: CEP injection fix and UI safety test.
2. SEC-02: category/path validation and fixture tests.
3. DATA-01 and DATA-02: shared CRUD transaction and UI delete-by-id migration.
4. API-01 and DATA-03.
5. Full smoke run, AE UAT, changelog, and release.

This order closes the externally supplied-data risks before changing persistence behavior, then validates the user workflow end to end.
