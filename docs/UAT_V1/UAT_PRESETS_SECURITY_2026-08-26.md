# UAT — Presets Security and Reliability Patch

**Plan:** `docs/PRESETS_SECURITY_REMEDIATION_PLAN_2026-08-26.md`  
**Date:** 2026-08-26  
**AE version(s):** _fill_ (minimum supported + newest supported)  
**OS:** _fill_  
**Tester:** _fill_

## Prereqs

- Clean AE prefs or separate test profile recommended.
- Back up `%USERPROFILE%\Documents\Adobe\After Effects\...\TEXTORO\` presets folder if you have real user presets.

## Checklist

- [ ] Open TEXTORO and confirm no bootstrap or console error.
- [ ] Save a preset for each supported category (toro, type, box, mix, motion, motion-full). Verify files appear under user presets path and `_index.json` lists them.
- [ ] Import `tools/smoke/fixtures/presets/valid-motion.json` via Presets panel or `importPresetFromPath`; verify it appears and can be applied.
- [ ] Import `tools/smoke/fixtures/presets/duplicate-name-a.json` then `duplicate-name-b.json` (same name, different ids); verify both remain available with distinct files (`duplicate-test.json` and `duplicate-test-2.json` style) and can be applied separately.
- [ ] Delete each imported/saved preset from the Presets panel; verify file removed and `_index.json` entry removed; verify it cannot be exported or loaded by id afterwards.
- [ ] Attempt to import every malicious/invalid fixture (`traversal-category.json`, `invalid-schema.json`); verify clear error and **no** filesystem change outside the configured presets root (no folder `../../outside` created, no file outside).
- [ ] Load an imported preset with HTML-looking name/icon (`xss-name.json`); verify Presets panel and Motion panel render literal text only, no element creation, no script execution.
- [ ] Apply Typewriter, Box, Motion, and Motion Full presets after the changes; verify no blanket failure and no partial-controller abort.
- [ ] Close and reopen AE; verify valid user presets still load and index remains consistent (one file per entry, one entry per file).
- [ ] Verify timestamps in exported `.txpreset`/`.txpack` represent UTC (suffix `Z` matches UTC time, not local).

## Results

| # | Step | Result | Evidence |
|---|------|--------|----------|
| 1 | Open TEXTORO | | |
| 2 | Save per category | | |
| 3 | Import valid | | |
| 4 | Duplicate handling | | |
| 5 | Delete verification | | |
| 6 | Malicious import blocked | | |
| 7 | XSS literal rendering | | |
| 8 | Apply all categories | | |
| 9 | Restart persistence | | |
| 10 | UTC timestamp | | |

## Failure Evidence

_Paste console errors, file listings, or screenshots._

## Notes

- For step 6, confirm no new folder was created at filesystem root or outside the presets path.
- For step 7, inspect DOM: preset name should be a text node, not an element created from the name.
