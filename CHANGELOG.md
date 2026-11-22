# 📋 TEXTORO Changelog

All notable changes to TEXTORO are documented in this file.

---

## [Unreleased]

### 🏛️ Methodological Architecture Overhaul: Canonical Presets, Parametric Kinematics & Zero-Radius Arena — 2026-11-22
- **Canonical Presets System Architecture & Directory Restructuring**:
  - Standardized on 5 canonical technical roles: `type`, `box`, `motion`, `compound`, and `templates`.
  - Upgraded `PresetManager.jsx` with `_ensurePresetsFolders` auto-migration, consolidating legacy fragmented folders (`toro`, `mix`, `motion-full`).
  - Rewrote `config/presets/_schema.json` in professional technical English with full support for easing curve type 7 (Spring ODE).
  - Sanitized all 32 presets in `config/presets/`: eliminated all legacy emoji `icon` properties and assigned standardized Phosphor Bold vector icons (`faIcon`).
  - Synchronized the Presets filter SubBar in `index.html` with canonical categories and responsive counts.
- **Parametric Kinematic Preview Engine (`PresetsPanel.js` & `panel-presets.css`)**:
  - Replaced hardcoded string-matching CSS classes with a true mathematical kinematic vector simulation engine on hover.
  - Dynamically computes trajectory displacements (`posFromX`, `posFromY`), scaling (`scaleFrom`, `scaleTo`), rotation (`rotFrom`, `rotTo`), opacity, and cubic-bezier easing curves directly from preset JSON values.
  - Realistic shape styling in `applyBoxStyles`: true dashed borders for outline styles, accurate 4-corner radii, and proportional text boxes.
  - High-fidelity Typewriter preview: word-by-word and character reveals with exact cursor glyph representation (`|`, `_`, `█`, `▌`, `▎`, `●`, `◆`, custom) and synchronized blinking.
  - Elevated card geometry in `panel-presets.css`: spacious 136px cards with 102px preview stages, eliminating squishing and content clipping.
- **Motion Arena Elevation & Zero-Radius Compliance (`panel-motion.css`)**:
  - Refactored `.motion-preset-btn` into spacious 68x68px square cards with crisp industrial borders.
  - Replaced circular `.preset-motion-disc` with a 12x12px rectangular industrial kinematic wafer, restoring 100% `border-radius: 0 !important` compliance.
  - Replaced emoji pills in `index.html` physics tuning with crisp Phosphor Bold vector icons (`ph-drop`, `ph-basketball`, `ph-lightning`, `ph-wave-sine`, `ph-magnet`, `ph-wind`).
- **Live 2-Way Selection Monitoring Integration (`main-entry.js`)**:
  - Connected `SelectionMonitor.onChange` directly to `Typewriter.syncFromLayer()` and `Box.syncFromLayer()`, enabling real-time UI population upon AE layer clicks without requiring manual tab switches.
- **Language Hygiene & Localization Architecture**:
  - Enforced `lang="en"` across `index.html`, replaced hardcoded Arabic literals in `SogaPanel.js` with `'No Selection'`, and sanitized all residual UI emojis.
  - Introduced lightweight `TEXTORO.I18n` localization module (`js/core/I18n.js`) with default technical English dictionary (`config/i18n/en.json`).
- **Verification & CEP Mirroring**:
  - Passed all 13 automated smoke validation checks (100% pass rate).
  - Compiled modular CSS and mirrored all changes to the active Adobe CEP directory.

### ⚡ Live 2-Way Property Binding, Active Layer Synchronization & Robust Controls — 2026-11-22
- **Live 2-Way Property Binding for Typewriter & Box Panels**:
  - Bound all 40+ controls in Typewriter (`#panel-type`) and Box (`#panel-box`) panels to update active After Effects layers live with debounced execution (`150ms` for sliders/inputs, `50ms` for toggles/dropdowns).
  - Implemented `update()` and `debouncedUpdate()` methods on `TEXTORO.Panels.Typewriter` and `TEXTORO.Panels.Box`, delegating composite payloads to `HostBridge.run('setLayerEffectValues', ...)`.
  - Added live layer text auto-synchronization when typing into `#txtInput` with gentle debounce.
- **Bi-Directional Active Layer State Synchronization (`syncFromLayer`)**:
  - Implemented `syncFromLayer()` on both `TEXTORO.Panels.Typewriter` and `TEXTORO.Panels.Box` reading live effect values, custom cursor, layer text, and timing markers from the selected layer.
  - Automatically triggers on tab switch in `TEXTORO.UI.TabManager` (`case 'type'`, `case 'box'`), guaranteeing the UI always accurately reflects the active composition layer.
  - Populates all precision inputs, steppers, toggle chips, color badges (`.ci-hex-code`), and secondary SubBar buttons without desynchronization.
- **Enhanced ExtendScript Host Effect Readers & Writers (`SogaManager.jsx`)**:
  - `_readTypewriterValues`: Enhanced to read live layer text document, custom cursor character marker (`CURSOR_CHAR:`), cursor type, and timing markers (`IN_START`, `IN_END`, `OUT_START`, `OUT_END`, `BLINK_START`, `BLINK_END`, `noOut`).
  - `_writeTypewriterValues`: Enhanced with support for cursor type, custom cursor marker creation/update, layer text document update with text marker sync, and non-destructive marker time updates (`_updateTypewriterTimingMarkers`). Added resilient alias fallbacks (`twReverse`/`reverse`, `wordMode`/`twWordByWord`, `boxRTL`/`direction`, `liveText`/`applyTextColor`).
  - `_writeBoxValues`: Enhanced to write `Trim Start`, `Trim End`, `Trim Offset`, `Path Offset`, and `Lock Box Size`. Also synchronizes all 4 corner sliders (`Corner TL`, `TR`, `BR`, `BL`) when uniform `Corner Radius` is adjusted.
- **Smart Text/Box Layer Selection Resolution (`Utilities.jsx`)**:
  - Enhanced `getSelectedTextLayer` and `getSelectedTextLayers` to detect if the user selected the shape layer (`_Box`) in the AE viewport and automatically resolve its parent TextLayer, preventing "No text layer selected" errors.
- **SubBar ID Resolution & 2-Way State Synchronization (`SubBar.js`)**:
  - Resolved ID discrepancies: mapped `fourCornersRow` (was `box4CornersRow`), `numFillOp` (was `boxFillOpacity`), `numStrokeW` (was `boxStrokeWidth`), and `chkHideEmpty` (was `chkHideWhenEmpty`).
  - Directly triggers live panel updates on subbar button toggles (Auto Resize, 4 Corners, Fill, Stroke, Word Mode, Cursor, Reverse, No OUT, Blink In Hold).
- **Quality & Contract Compliance**:
  - 100% pass on all 13 smoke tests with strict zero-radius and English UI compliance.

### 🎨 World-Class Studio Color Modal & Precision Color Elevating Across All Panels — 2026-11-22
- **World-Class Interactive 2D Color Spectrum & Hue Engine**:
  - Replaced legacy squished native color input with a 2D Saturation / Value (`SV`) interactive Canvas engine with tactile crosshair target pin.
  - Implemented continuous 1D Hue rainbow slider (0° to 360°) with custom slider thumb and smooth real-time color recalculation via HSV/RGB color space algorithms.
  - Added Chromium `EyeDropper` API integration (`#btnColorEyeDropper`) with phosphor bold vector icon, allowing one-click sampling from the composition and screen with graceful native picker fallback.
- **Bi-Directional Split Comparison Bar**:
  - Replaced unstyled preview box with a split dual-preview (`ORIGINAL` vs `CURRENT`) complete with subtle transparency checkerboard backing.
  - Clicking the `ORIGINAL` box immediately reverts the color to the initial state without closing the dialog.
- **Precision Hex Bar & Real-Time Feedback**:
  - Monospace uppercase Hex input field with emerald `#` prefix tag, validation badge, and keyboard shortcuts (`Enter` to apply, `Esc` to cancel).
  - Quick-copy button with live animated `COPIED!` emerald feedback.
- **Multi-Channel RGB Sliders & Precision Steppers**:
  - Three color-coded RGB channel rows with high-contrast channel badges (`R`: `#ef4444`, `G`: `#10b981`, `B`: `#3b82f6`).
  - Interactive range sliders with live color gradients synced 2-way with numeric steppers (0-255).
- **Curated Studio Palette & Persistent Recent Colors Memory**:
  - 16-color curated professional studio palette in a clean 8x2 grid.
  - Added persistent Recent Colors memory (`localStorage['textoro_recent_colors']`) saving up to 8 recent project colors with dedicated `CLEAR` button.
  - Visual active ring indicator on swatches matching the current color.
- **Elevated Precision Color Inputs Across Panels**:
  - Upgraded `.precision-color-box` across Typewriter (`#colorCursor`, `#colorText`), Box (`#colorStroke`, `#colorFill`), and Control/SOGA (`#sogaCursorColor`, `#sogaTextColor`, `#sogaStrokeColor`, `#sogaFillColor`).
  - Tactile studio styling with emerald border glow on hover, monospace hex code badge, crisp swatch thumbnail with border, and one-click modal opening.
- **Design System & Zero-Radius Compliance**:
  - 100% English UI, zero emojis, strict `border-radius: 0 !important`, passed all 13 smoke tests with 100% CSS coverage.

### 📌 Fixed Sticky SubBars & Critical Quick Toggle Strips Across All Panels — 2026-11-22
- **Pinned Top Navigation & Secondary SubBar Dock**:
  - Enforced sticky behavior (`position: sticky; top: -4px; z-index: var(--z-subbar, 900)`) on `.panel-subbar` across all 7 panels.
  - When scrolling inside any tab, both the top header tabs and the secondary toolbar strip remain permanently docked at the top without scrolling away with the content.
- **Dedicated Critical Quick-Toggle Strips Across All Panels**:
  - **Typewriter Panel (`#panel-type`)**: Direction (LTR / RTL), Word Mode (`chkWordMode`), Cursor Toggle (`chkCursor`), Reverse (`chkReverse`), No OUT Animation (`chkNoOut`), Blink in Hold (`chkBlinkInHold`), and Layer Get/Update Text actions.
  - **Box Panel (`#panel-box`)**: Auto-Resize (`chkAutoResize`), Hide When Empty (`chkHideEmpty`), Parent to Text (`chkParentToText`), 4 Corners Radius mode (`chk4Corners`), Box Fill visibility toggle, Box Stroke toggle, and Lock Box Size (`chkLockSize`).
  - **Presets Panel (`#panel-presets`)**: Sticky filter category icons (`all`, `templates`, `type`, `box`, `compound`, `motion`, `favorites`) plus search, sort, and quick actions pinned above scrolling cards.
  - **Control / SOGA Panel (`#panel-soga`)**: Layer refresh, jump/scroll buttons to Typewriter / Box / Motion cards, Auto Typewriter toggle (`sogaTwAuto`), Box RTL mode (`sogaBoxRTL`), and Expand/Collapse All toggle.
  - **Markers Panel (`#panel-markers`)**: Filter IN, OUT, and BLINK markers, Select Layer markers, Invert Selection, Clear Selection, and Refresh markers list.
  - **Motion Panel (`#panel-motion`)**: IN / OUT mode selector, Sync with Typewriter (`motionSyncEnable`), OUT Enable (`motionOutEnable`), Position / Scale / Rotation / Opacity kinetic toggles, and Impulse physics simulation trigger.
  - **Settings Panel (`#panel-settings`)**: Open Presets Folder, Reload Extension, and Reset to Defaults.
- **Bi-Directional State Synchronization Controller (`js/ui/SubBar.js`)**:
  - Integrated `TEXTORO.UI.SubBar` providing real-time 2-way event binding: clicking subbar icons updates source controls and active AE layer live, while changing card controls updates subbar icon states instantaneously.


### 📐 Technical Taxonomy Reorganization & Smart Layer Auto-Detect Preset Studio — 2026-11-22
- **Technical Preset Category Taxonomy**:
  - Reorganized all preset categories and directories to mirror their technical function in After Effects:
    - `templates/` (Full Suite: Typewriter + Box Shape + Motion Transitions) — *replaces arbitrary brand name `toro/`*
    - `compound/` (Combined Typewriter + Box Shape) — *replaces arbitrary `mix/`*
    - `type/` (Typewriter typography and cursor dynamics)
    - `box/` (Parametric shape container)
    - `motion/` (Kinetic transitions & physics ODE springs) — *united with paired motion presets from `motion-full/`*
  - Reorganized file system directories under `config/presets/` with backward compatibility mapping for existing user presets in AppData.
  - Updated `config/presets/_schema.json` and smoke boundary assertions (`check-preset-input-boundaries.js`).
- **Smart Studio Preset Save Modal with Auto-Detection**:
  - Implemented `inspectLayerForPreset` in ExtendScript (`PresetManager.jsx`) that inspects the active text layer in After Effects and detects which modules exist (`hasType`, `hasBox`, `hasMotion`).
  - Added modern Studio Save Modal (`#presetSaveModal`) with:
    - Active layer name banner
    - Interactive module inclusion checkboxes (`[✓] Typewriter`, `[✓] Box Shape`, `[✓] Motion`) that dynamically auto-calculate and display the resulting technical category badge (`TEMPLATES`, `COMPOUND`, `TYPE`, `BOX`, `MOTION`)
    - Preset name text input with autofocus
    - Phosphor Bold vector icon picker (no emojis)
    - Save and cancel buttons adhering to zero-radius styling
  - Completely replaced legacy multi-step emoji prompts (`showInput`) with this unified studio workflow in `PresetsOps.saveFromLayer()`.
- **Presets Panel Hub & Motion Arena Polish**:
  - Updated filter buttons in Presets Hub to technical taxonomy (`all`, `templates`, `type`, `box`, `compound`, `motion`, `favorites`).
  - Updated live realistic preview builder and category badge coloring in `PresetsPanel.js` (`#f59e0b` amber for templates, `#6366f1` indigo for compound, `#8b5cf6` violet for motion, `#10b981` emerald for type, `#0284c7` sky for box).
  - Preserved strictly the 16 core single-axis buttons in Motion Panel Arena (`arena: true` filter) while housing paired motion presets cleanly in Presets Hub.
  - Zero emojis in tooltips, modals, or preset listings; 100% English UI and DOM-safe rendering.


### 🛠️ Methodical Presets Live Preview Engine, Studio Dark Tooltips & 100% English UI — 2026-11-22
- **Spacious Studio Presets Preview Stage (124px Height)**:
  - Substantially expanded Presets card height to 124px (92px upper viewport + 32px lower meta strip), completely eliminating vertical clipping on box borders (such as Outline Clean and Outline White) and motion trajectories.
  - Composition stage features an authentic AE dark canvas (`#09090e`) with a subtle 10px dot grid (`radial-gradient`).
- **Authentic After Effects Shape & Type Simulation Engine**:
  - `Box`: Renders real After Effects shape geometry directly from preset values (exact fill color and opacity, stroke width, stroke color, and proportional corner radius: sharp 0px vs rounded 16px).
  - `Type`: Live typewriter engine running on hover with blinking cursor indicator (`|`, `_`, or `█`) in letter-by-letter or word-by-word mode.
  - `Mix` & `Toro`: Combined true shape geometry and live typing typography.
  - `Motion` & `Motion-Full`: Renders centered in idle state, executing single-play CSS keyframe animations (bounce, slide up, spin zoom) strictly on hover.
- **On-Hover-Exclusively Interactive Playback**:
  - Live typing and motion animations run strictly on `mouseenter` / `:hover` and cleanly reset to idle upon `mouseleave`, avoiding distracting continuous looping.
- **Dual Action Header & ActionBar Workflow**:
  - Primary **Apply to Selected Text** button (`ph-check`) and **Create New Preset from Layer** button (`ph-plus`) in both ActionBar and header toolbar.
  - Hover quick-apply overlay button on each card with single-click and double-click execution.
- **Tab Header Tooltip Elimination & Studio Dark Theme**:
  - Removed tooltips from header tab buttons to prevent visual obstruction.
  - Added strict isolation in `Tooltip.js` barring tabs and motion presets, added a 3-second safety auto-dismiss timer, and transformed tooltip styling from harsh white to sleek studio dark (`#181824`, `#f1f5f9` text, emerald accent).
- **English-Only Standardization**:
  - Converted remaining ExtendScript host messages in `MultiLinesManager.jsx` and `PresetManager.jsx` into English.

### 🛠️ Full Studio Component Styling Restoration & 100% Panel CSS Coverage — 2026-11-22
- **Realistic Presets Live Preview Cards & Dual Action Workflow**:
  - Re-architected Presets list items into tactile, extended cards (82px height) featuring a realistic upper preview window and lower meta strip matching user specifications.
  - Built live miniature rendering system:
    - `Box`: Real background color/opacity, stroke width, and corner radius (rounded vs sharp) with styled text inside.
    - `Type`: Live typewriter typography with blinking cursor indicator (`|`, `_`, or `█`).
    - `Mix`: Combined real box shape + typewriter typography.
    - `Motion / Motion-Full`: Live CSS keyframe animations (bounce, slide up, spin zoom).
    - `Toro`: Complete unified template preview.
  - Implemented dual action workflow:
    - Primary **Apply to Selected Text** icon button (`ph-check`) in both ActionBar and header toolbar.
    - **Create New Preset from Layer** icon button (`ph-plus`) in both ActionBar and header toolbar.
    - Hover quick-apply overlay button on each card with single-click and double-click execution.
- **Large Square Motion Arena Cards & Dedicated Kinematic Discs**:
  - Re-architected Motion Presets Arena into square tactile studio cards (`aspect-ratio: 1/1`, min-height 64px) matching user specifications.
  - Implemented upper preview stage with circular vector icon container (`.preset-motion-icon-wrap`, Phosphor Bold) for idle state, and glowing kinematic disc (`.preset-motion-disc`) executing real-time trajectory upon hover.
  - Attached clean bottom name strip (`.preset-motion-name`) with high-contrast typography and subtle borders.
  - Completely removed tooltips from motion cards; integrated hard barrier in `Tooltip.js` preventing tooltips from triggering on `.motion-preset-btn`.
- **English-Only Standardization (i18n Readiness)**:
  - Standardized 100% of user-facing strings into clean English (textarea placeholder in `index.html`, all 32 preset descriptions in `config/presets/`, and 57 ExtendScript return messages in `host/modules/`).
- **Persistent Tooltip Bug Fix**: Resolved sticky tooltips across all tabs. Active tab buttons are now strictly barred from opening tooltips; tooltips immediately vanish on `mouseout`, `mousedown`, `click`, `tab switch`, and panel `blur` with complete race condition prevention.
- **Motion Presets Arena Styling**: Restored `.motion-preset-btn`, `.selected-in`, `.selected-out`, and `.preset-emoji` dark slate styling across all 16 motion preset buttons in the Motion tab, replacing stark white rectangles.
- **Presets Panel Item Polish & Search**: Restored `.preset-apply-btn` (hidden by default, revealed on hover with emerald `#10b981`), `.preset-badge` category chips (`Type`, `Box`, `Mix`, `Motion`, `Toro`), and single-row `.presets-search` flex layout with sort select and refresh button.
- **Modal & Swatch Styles**: Added `.color-hex-status`, `.studio-color-swatch`, `button.copied`, and `.precision-custom-wrap`.
- **Dynamic JS CSS Coverage Smoke Gate**: Added `tools/smoke/check-js-css-coverage.js` verifying that 100% of classes dynamically injected by JS files have compiled CSS definitions; suite expanded to 13/13 passing automated checks.
- **Numeric Precision Steppers**: Restored dark slate `.stepper-actions` and `.step-arrow` styling across all numeric inputs, replacing stark white browser default button boxes with integrated subtle arrows and emerald hover feedback.
- **Markers Panel Full Architecture**: Restored all 31 missing component rules for `FILTER BY TYPE` chips (color-coded Emerald `IN`, Crimson `OUT`, Amber `BLINK`), markers table container, sort headers, empty message alignment, and unified obsidian operation buttons (`< M`, `M >`, `< L`, `L >`, `ALIGN M`, `ALIGN L`).
- **Control (SOGA) Panel Studio Empty State & Layer Bar**: Restored full studio empty state container with dashed slate border, centered cursor icon, and descriptive typography; restored `.soga-header` layer info bar and square refresh button.
- **CEP Mirror & Repository Sync**: 100% synchronized with Adobe CEP mirror and verified.

### 🎨 Modular CSS Architecture & Dead-Weight Purge — 2026-11-21
- **Modular CSS Source Tree**: Deconstructed monolithic `style.css` into 25 clean, modular files organized under `css/src/` (Tokens, Base, Shared Components, Panels, Utilities), each scoped between 50-250 lines.
- **Zero-Dependency Fast CSS Bundler**: Added `tools/build-css.js` compiling modular sources into a unified production `css/style.css` (reduced from 150KB to 53KB, compiled in ~7ms), integrated with `--watch` development mode and automated smoke gate.
- **Dead-Weight & Font Purge**: Removed 100% of legacy FontAwesome icons in favor of Phosphor Bold; deleted `css/fontawesome/` and `css/webfonts/` freeing over 1.2MB of dead weight; deleted ghost files `spectrum-components.css`, `spectrum-vars.css`, `spectrum-bundle.css`, and `css/spectrum/`.
- **Zero Visual Regression**: 100% preservation of all Obsidian dark surfaces, Emerald active states, zero-radius aesthetics, 32px top/action bars, and 26px high-density preset list items.
- **Automated Smoke Gate**: Integrated CSS compilation and syntax verification directly into `tools/smoke/run-smoke-checks.ps1` with 11/11 automated checks passing.

### 🧹 Cleanup, Parity & Quality Hardening — 2026-11-11
- **Repo & Extension Parity**: Full cleanup of CEP installed extension matching git repository (removed dead code `SpectrumStepper.js`, removed duplicate `TITOUF copy.json`, cleaned 59 obsolete draft documents).
- **P2-5 Presets Category Parity**: Included `motion-full` category in `getAllPresets()` and added strict allowlist validation to `getPresetList()`.
- **P2-1 Logic Duplication**:
  - Unified `getTimeNum` across `TypewriterPanel` and `MultiLinesPanel` onto `TEXTORO.Time.getInputSeconds` with full support for `s:f`, `sf`, and numeric formats.
  - Unified color converters `hexToRgb` and `rgbToHex` in `TEXTORO.Utils` with strict ES5/ES3 compatibility (removing ES2017 `padStart`), delegating from `SogaPanel`.
  - Unified box path expression generation in `BoxManager.jsx` using `buildBoxPathExpr()`.
- **P2-2 Scope & Aliases**: Configured live property descriptors for `window.DEBUG` and `window.TIMING` to reflect `TEXTORO.Config` changes dynamically; scoped compatibility aliases in `SelectionMonitor.js`.
- **P2-3 Unified State & Storage**: Migrated `textoro_favorites` into `TEXTORO_UI_STATE` inside `StateManager`; updated Settings panel to clear both host expression cache and UI localStorage state simultaneously.
- **P2-4 Error Resilience**: Added failure threshold and backoff in `SelectionMonitor.js` to prevent silent high-frequency failure logs while keeping the UI responsive.
- **Tooltip Modernization**: Enhanced `Tooltip.js` to automatically support all 283 `title` attributes with styled Spectrum tooltips, converted rendering to `textContent` for full XSS safety, and ensured ES5 runtime compatibility.
- **Smoke Gate #10**: Added `tools/smoke/check-encoding-order.js` to ensure `file.encoding = "UTF-8"` strictly precedes `file.open()` calls in all host scripts.

### 🔒 Security — Presets Hardening — 2026-08-26
- Hardened preset import, export, save, and delete against path traversal via category/filename allowlist and validated helpers.
- Preset display in Motion/Presets panels now uses DOM text APIs and validated icon classes.
- Preset lifecycle (save/import/delete) uses stable ids and atomic file+index updates; duplicate names create distinct files (`-2`, `-3`).
- Timestamps now use UTC components with `Z` suffix.

### 🔥 Hotfix — 2026-08-26 (Field regression)

#### Fixed
- **CRITICAL REGRESSION (F-14b follow-up)**: Yesterday's eval-removal replaced the JSON polyfill with a hard refusal — but field environment's ExtendScript has **no native JSON**, so the polyfill WAS the working parse path. Result: every preset/marker/host call failed with "Invalid options JSON".
  - **Fix**: full pure **recursive-descent JSON parser** (ES3, zero eval) in `Config.jsx` — objects/arrays/strings with all escapes (`\n`, `\"`, `\\`, `\uXXXX` incl. Arabic), numbers (exp notation), strict rejection of malformed input.
  - **Regression guard**: new `tools/smoke/check-json-polyfill.js` extracts the exact polyfill from source and runs 26 parity+rejection cases (incl. Arabic preset-shaped docs); wired into the smoke runner as gate #6. A broken polyfill can never ship silently again.

### Feature Sprint — 2026-08-26

#### Added
- **N-04 LIVE TEXT (v1.4 expression)** 🌟: Edit text directly on the layer — in AE *and* Premiere Essential Graphics (Mogrt-ready).
  - New `Live Text` checkbox effect control (default ON for new applies); expression reads `value.text` when ON, falls back to `TW_TEXT` marker when OFF or control missing.
  - `typewriter/sourceText` active version bumped to **v1.4** (`_config.json`), embedded fallback updated too.
  - Panel awareness: `getLayerText`/Soga read the live layer text while Live is ON; `updateLayerText` also writes the real source text so panel edits apply instantly.
  - Preset round-trips capture/restore `liveText`.
- Settings → Expression Versions now lists **v1.0 / v1.3 / v1.4**.

#### Changed
- **E-04**: Export/Import packs cover **all categories** (type/box/mix/motion/motion-full/toro); export dialog pre-filled with suggested filename.
- **C-05**: Box defaults unified — `BOX_CONFIG.DEFAULTS` is the single source (BoxManager + Soga hardcoded fallbacks removed).
- **C-06**: Hottest per-item logs gated behind `CONFIG.DEBUG` (hasBox probes, controller creation, Soga motion/color writes).
- **C-02 (partial)**: SogaPanel color converters cleaned up.

#### Fixed
- **F-14b**: JSON polyfill no longer uses `eval` in any path — engines without native JSON get an explicit clear error instead of a code-execution surface.
- **E-05**: Saving a preset whose normalized filename collides with a different existing preset id is now rejected with a clear Arabic message (no more silent overwrites for names like "نص" vs "نص!").

### Field Report Hotfixes (H-series) — 2026-08-25

- **H-1 (UI glyphs)**: Widened mojibake lead-range to full UTF-8 span (`C2-F4`) — repaired 7 more files incl. index.html arrows/stars, MarkersPanel `●`, status messages, and box-drawing comment separators. **Cursor dropdown itself was wrong**: now 7 options matching unified table `| _ █ ▌ ▎ ● ◆` (was 6 options, wrong order, no underscore).
- **H-2 (swallowed markers)**: Root cause found — AE `setValueAtTime` REPLACES any key at an identical time; legacy timing chain produced BLINK_START and IN_START at exactly the same second (e.g. 1.005), silently swallowing one. `_extractTiming` now enforces a minimum 0.02s gap between consecutive markers while preserving larger user timings.
- **H-3 (Motion↔Markers)**: `_getMarkerTiming` uses strict comment equality (`OUT_START_old` no longer matches); sync-with-markers requests missing OUT markers now return an explicit explanatory error instead of silently falling back to default timing.

#### Fixed
- **F-06**: ExpressionLoader overhauled — Method-2 path now resolves `modules/` nesting correctly; missing version downgrades log a WARNING and cache under the **actual** version key (was silently cached under requested key); `setActiveVersion` writes to `%USERDATA%/TEXTORO/expressions_config.json` (no more admin requirement) with install-dir config merged as base; version sort is numeric; UTF-8 set before every file open.
- **F-07**: Cursor glyph tables unified to single source `CONFIG.CURSOR_SHAPES` (`| _ █ ▌ ▎ ● ◆`, clamp 0..6) across embedded fallback + typewriter v1.0/v1.3 expressions — cursor type 1 now shows underscore everywhere (was half-block).
- **F-09**: Ghost-box detection fixed — `hasBox` requires an actual box shape layer (parented `_Box` or `<baseId>_Box`); orphaned Effect Controls no longer fake a box in Soga/presets.
- **F-13**: Marker resolution hardened — type-only match removed from both resolvers; markers moved manually in the timeline are skipped instead of moving the wrong same-type marker.
- **F-14 (partial)**: Per-controller try/catch in `createControllersFromRegistry` — a bad preset entry logs and continues instead of aborting the whole apply with partial state.
- **E-01**: PresetsPanel surfaces load failures — per-category errors logged, status bar warning/error, visible error card in the grid when everything fails (no more silent empty grid).
- **C-03**: Orphan features wired — context menu "Create New Text" now calls host `createNewTextLayer` via HostBridge; Box tab `numPathOffset` is collected into the payload (host consumes it at BoxManager); input modal supports `options.placeholder`.
- **F-02**: Soga multi-select no longer resets layer settings. Form state is snapshotted at populate time (`captureFormSnapshot`) and multi-mode applies **only changed fields** (`pruneToChangedOnly`); empty deltas are skipped with an "No changes to apply" status. Motion section is now hidden in multi-mode so stale defaults can never ship. Host contract unchanged (`!== undefined` guards already existed).
- **F-04**: Arabic encoding repaired across 14 files (host modules: MotionManager/LayerOperations/ControllerManager; UI: MarkersPanel/TypewriterPanel/Config.js/MarkersOps/LayersOps; index.html; 5 expression files). New `tools/fix-mojibake.js` reverses the CP1252 double-encoding per validated run (U+201A/U+201E continuation gap fixed during dev). Encoding gate is now **strict/fatal** in smoke.
- **F-05**: Undo-group leak fixed in 8 sites — BoxManager (create/remove), LayerOperations (offset/stagger/align/createNewTextLayer), PresetManager (applyPreset). Unified `undoStarted` flag pattern; failed operations no longer close a foreign undo group.
- **F-08**: HostBridge bootstrap race eliminated — single-flight bootstrap with callback queue (`bootInFlight` + `bootQueue`); all `cs.evalScript` calls wrapped via `safeRun()` which feeds synchronous exceptions through the `__TX_ERR__` sentinel path (panel opened outside AE no longer throws uncaught).
- **F-11**: Layer-name HTML injection closed in Markers table — visible cell now passes through `Utils.escapeHtml` (title attr was already escaped).
- **F-12**: FPS auto re-sync — throttled `syncCompFPS()` (≥500ms) wired to selection changes and tab switches; s:f inputs now adapt when switching between 25fps and 60fps comps.
- User-facing error messages now display correct Arabic instead of mojibake.

#### Added
- `tools/fix-mojibake.js` — dry-run/--apply repair tool with per-run validation (no U+FFFD, strict-progress guard, multi-pass peeling for double-damaged regions).
- `docs/UAT_V1/UAT_MANUAL_CHECKLIST_2026-08-25.md` — 60-step manual UAT checklist covering all fixes + full regression suite.

### Earlier today

#### Added
- **T-03**: `tools/smoke/check-es5-host.js` — ES3 compliance gate for host code (strict) + expressions (syntax-only).
- **T-04**: `tools/smoke/check-encoding.js` — UTF-8 validity + BOM + mojibake-heuristic scanner (strict since F-04).
- **Version Gate**: `tools/smoke/check-version-consistency.js` — manifest ⇄ Config.js ⇄ Config.jsx ⇄ cache-busters.
- **T-05**: `tools/gen-icon.js` + real `assets/icon.png` (23×23 RGBA, was 0 bytes).
- Smoke runner now executes 5 gates (`run-smoke-checks.ps1`).

#### Fixed
- **F-01**: Multi-layer Motion restored — `Motion.updateLayerCount()` now wired to tab switch + selection change; `applyMotionMulti` reachable.
- **F-03**: ExtendScript ES3 compliance — new `txKeyCount()/txIsArray()/txTrim()` helpers in Utilities; replaced `Object.keys` (SogaManager), `Array.isArray` ×3 (SogaManager), `.trim()` (ControllerManager). Restores JSON-driven defaults and color set/create in Soga.

#### Blocked
- **T-02**: git baseline — Git not installed on this machine.

## [1.0.0] - 2026-08-25

### 🏁 Re-baseline: اعتماد نظام إصدار جديد v1.0.0

- **Versioning Policy**: إعادة تأسيس الترقيم على Semver (`MAJOR.MINOR.PATCH`) — المصدر الرسمي `CSXS/manifest.xml`.
- **Unified**: جميع مراجع الإصدار (manifest, Config.js, Config.jsx, cache-busters, badges, headers) موحدة إلى 1.0.0.
- **Analysis**: تحليل ذرّي شامل — `docs/ATOMIC_ANALYSIS_2026-08-25.md`.
- **Plan**: خطة الإصلاح الشاملة المعتمدة — `docs/REMEDIATION_PLAN_V1.0.md`.

---

## [3.5.4] - 2024-12-31

### 🔧 SogaManager Defaults Integration

#### SogaManager v1.2.0
- **ControllerManager Defaults Integration**: Now uses `getControllerDefaults()` from ControllerManager
- **Smart Fallback**: If ControllerManager fails, uses hardcoded defaults
- **New Helper Functions**:
  - `_getDefaultsWithFallback(category)` - Gets defaults from JSON or fallback
  - `_getHardcodedDefaults(category)` - Returns hardcoded defaults for fallback
- **Cleaner Code**: Removed ~50 duplicated default values from read functions
- **All 3 Categories Updated**:
  - `_readTypewriterValues()` - 15 controllers
  - `_readBoxValues()` - 21 controllers
  - `_readMotionValues()` - 34 controllers

#### How It Works
```javascript
// Before (v1.1.0)
twProgress: _getSliderValue(fx, "TW Progress", 0),  // hardcoded default

// After (v1.2.0)
var d = _getDefaultsWithFallback("typewriter");
twProgress: _getSliderValue(fx, "TW Progress", d["TW Progress"]),  // from JSON
```

#### Benefits
- Single source of truth for default values (JSON files)
- Easier maintenance - change defaults in one place
- Automatic fallback ensures stability
- Better logging for debugging

---

## [3.5.3] - 2024-12-31

### 🔧 Smart ControllerManager Integration with Fallback

#### Root Cause Fix
- Fixed `getExtensionPath()` in Utilities.jsx with better path detection
- Added extensive debug logging to trace path resolution
- Added `testExtensionPath()` function in ControllerManager for debugging

#### TypewriterManager v1.4.0
- Smart ControllerManager integration with automatic fallback
- If `createControllersFromRegistry()` succeeds → uses JSON registry
- If it fails → falls back to direct controller creation
- Same logic for `removeControllersFromRegistry()`

#### BoxManager v1.5.0
- Smart ControllerManager integration with automatic fallback
- Same pattern as TypewriterManager

#### ControllerManager v1.1.0
- Added `testExtensionPath()` function for debugging
- Better logging for path resolution

#### MotionManager v2.4.0
- Smart ControllerManager integration with automatic fallback
- Same pattern as TypewriterManager and BoxManager
- 34 motion controllers now use the unified system

#### How It Works
```
1. Try ControllerManager.createControllersFromRegistry()
2. If returns true → Controllers created from JSON
3. If returns false → Fallback to direct addSlider/addCheckbox/addColor
4. Either way, the effect works!
```

---

## [3.5.2] - 2024-12-31

### 🔧 Critical Fix: Reverted to Direct Controller Creation (SUPERSEDED by 3.5.3)

#### Issue
- ControllerManager integration caused Typewriter to stop working
- Error: `effect named 'Show Cursor' is missing or does not exist`
- Root cause: `getExtensionPath()` returns incorrect path in CEP environment, preventing JSON file loading

#### Solution
- Reverted TypewriterManager and BoxManager to direct controller creation
- Controllers are now created using `addSlider/addCheckbox/addColor` directly
- JSON registry files remain available for documentation and future use

#### TypewriterManager v1.3.1
- Reverted to direct controller creation for stability
- Removed ControllerManager dependency
- All 15 typewriter controllers created directly

#### BoxManager v1.4.1
- Reverted to direct controller creation for stability
- Removed ControllerManager dependency
- All 26 box controllers created directly

#### Note
- ControllerManager module remains in codebase for future use
- JSON registry files (`config/controllers/*.json`) remain as documentation
- Future integration will require fixing `getExtensionPath()` for CEP environment

---

## [3.5.1] - 2024-12-31

### 🔧 ControllerManager Integration Complete (REVERTED in 3.5.2)

#### TypewriterManager v1.3.0
- **Full ControllerManager integration**:
  - `_applyTypewriter()` now uses `createControllersFromRegistry()`
  - `_removeTypewriter()` now uses `removeControllersFromRegistry()`
  - Fallback to legacy system for backward compatibility
- **Added Text Color controller** to typewriter.json (15 controllers total)

#### BoxManager v1.4.0
- **Full ControllerManager integration**:
  - `_createBox()` now uses `createControllersFromRegistry()` with conditional controllers
  - `_removeBox()` now uses `removeControllersFromRegistry()`
  - Supports conditional controllers (Corner Radius vs 4 Corners, Text Color)
  - Fallback to legacy system for backward compatibility

#### Motion Presets Fixes
- **Fixed direction values** in motion presets (up, down, left, right, rise, drop)
- **Fixed PresetsPanel.js** to call `applyMotionPreset` for both `motion` and `motion-full` categories

### 📊 Updated Statistics
| Category | Controllers | Status |
|----------|-------------|--------|
| Typewriter | 15 | ✅ Integrated |
| Box | 26 | ✅ Integrated |
| Motion | 34 | ⏳ Pending |

---

## [3.5.0] - 2024-12-31

### 🎯 Controllers & Expressions Central System

#### New Infrastructure
- **Central Controllers Registry**: All 74 controllers now documented in JSON files
  - `config/controllers/_registry.json` - Master registry with statistics
  - `config/controllers/typewriter.json` - 14 Typewriter controllers
  - `config/controllers/box.json` - 26 Box controllers
  - `config/controllers/motion.json` - 34 Motion controllers
  - `config/controllers/_schema.json` - JSON Schema for validation

#### Shared Expressions (DRY Principle)
- **Extracted shared code** to eliminate duplication:
  - `host/expressions/shared/easing.js` - easeVal() function (7 easing types)
  - `host/expressions/shared/timing.js` - Timing & Sync code with Markers support
- **Estimated savings**: ~7200 characters of duplicated code

#### Motion Expressions (Modular)
- **Separated motion expressions** into individual files:
  - `host/expressions/motion/v1.0/position.js`
  - `host/expressions/motion/v1.0/scale.js`
  - `host/expressions/motion/v1.0/rotation.js`
  - `host/expressions/motion/v1.0/opacity.js`

#### New Module: ControllerManager.jsx
- **Central controller management** with functions:
  - `loadControllerRegistry()` - Load JSON registry
  - `loadCategoryControllers()` - Load category-specific controllers
  - `createControllersFromRegistry()` - Create controllers on layers
  - `removeControllersFromRegistry()` - Remove controllers from layers
  - `getControllerDefaults()` - Get default values
  - `validateControllerValue()` - Validate values against schema
  - `buildMotionExpression()` - Build expressions with shared code
  - `getEaseValCode()` / `getTimingSyncCode()` - Backward compatibility

#### Expressions Registry
- **New registry**: `config/expressions/_registry.json`
- Documents all 11 expressions with their dependencies

### 📊 Statistics
| Category | Controllers | Status |
|----------|-------------|--------|
| Typewriter | 14 | ✅ Documented |
| Box | 26 | ✅ Documented |
| Motion | 34 | ✅ Documented |
| **Total** | **74** | ✅ Complete |

### 🔧 Technical Changes
- Updated `host/index.jsx` to include ControllerManager module
- Module load order: Config → Utilities → ControllerManager → ExpressionLoader → ...

---

## [3.4.0] - 2024-12-27

### 🎯 Presets System Overhaul

#### Unified JSON Presets
- **All presets now in JSON files**: Removed hardcoded presets from JavaScript
- **12 Motion presets exported**: fade, up, down, left, right, pop, zoom, spin, drop, bounce, flip, rise
- **Total 25 presets**: Type(4), Box(4), Motion(12), Mix(3), TORO(2)
- **Dynamic loading**: MotionPanel.js now loads presets from files via `loadPresetsFromFiles()`

#### New Motion Presets
| Preset | Icon | Description | Easing |
|--------|------|-------------|--------|
| Fade | 🌫️ | Opacity only | Ease Out |
| Up | ⬆️ | Slide up | Ease Out |
| Down | ⬇️ | Slide down | Ease Out |
| Left | ⬅️ | Slide left | Ease Out |
| Right | ➡️ | Slide right | Ease Out |
| Pop | 💥 | Scale pop | Spring |
| Zoom | 🔍 | Gradual zoom | Ease Out |
| Spin | 🔄 | Rotate + scale | Ease Out |
| Drop | ⬇️ | Drop with bounce | Bounce |
| Bounce | 🏀 | Elastic scale | Elastic |
| Flip | 🔃 | Flip rotation | Spring |
| Rise | 🌅 | Subtle rise | Ease Out |

### 🐛 Bug Fixes

#### Modal System Fix
- **Fixed save preset modal**: OK/Cancel buttons now work correctly
- **Root cause**: Selectors were using CSS classes instead of element IDs
- **Files fixed**: `js/ui/Modals.js`

#### 4 Corners Box Fix (from v3.3.0)
- **Fixed independent corner values**: Each corner now reads its own value
- **Removed linkCorners logic**: Was causing all corners to copy TL value
- **Files fixed**: `js/panels/BoxPanel.js`

### 📚 Documentation Updates
- Updated `docs/INDEX.md` with v3.4.0 info
- Updated `docs/PRESETS.md` with new preset list
- Updated `docs/presets/README.md` with JSON structure
- Updated `docs/presets/MOTION_PRESETS.md` with all 12 presets
- Created `docs/PRESETS_ANALYSIS.md` with technical analysis
- Updated `docs/ARCHITECTURE.md` with new stats
- Updated `README.md` with v3.4.0 features

---

## [3.3.0] - 2024-12-25

### 🏗️ Major Architecture Refactoring

#### Modular JavaScript Architecture
- **Complete main.js Modularization**: Split 5400+ lines into 26 focused modules
- **New Module Structure**:
  - `js/core/` - Config, Utils, ErrorHandler, HostBridge
  - `js/state/` - Defaults, StateManager, SelectionMonitor
  - `js/time/` - TimeUtils (unified time handling)
  - `js/ui/` - StatusBar, TabManager, ActionBar, CollapsibleSection, Modals, NumberSpinners, ContextMenu
  - `js/operations/` - MarkersOps, LayersOps, PresetsOps
  - `js/panels/` - TypewriterPanel, BoxPanel, SogaPanel, MarkersPanel, PresetsPanel, MotionPanel, SettingsPanel, MultiLinesPanel
- **TEXTORO Namespace**: All modules use `TEXTORO.*` namespace pattern
- **Backward Compatibility**: Legacy function aliases maintained for existing code
- **main.js**: Now ~380 lines (entry point only)

### 🎨 UI/UX Improvements

#### Motion Panel Simplification
- **Removed duplicate Apply button**: Now only one Apply button in Action Bar
- **Removed My Presets tab**: Custom presets now appear in main Presets Hub
- **Save button moved to Soga**: Save Motion preset from Soga panel (where you edit values)
- **Improved Quick Presets**: Better preset values for smoother animations
  - Reduced position offsets for subtler movements
  - Optimized easing types for each preset
  - Added Arabic comments for preset descriptions

#### Preset System
- Custom Motion presets now saved to `config/presets/motion/` folder
- All saved presets visible in main Presets tab with other categories
- Cleaner Motion panel without redundant tabs

### 🔧 Code Quality Improvements

#### Phase 1: Critical Fixes ✅
- **Duplicate Functions Removed**: `getSelectedTextLayers()` now exists only in `Utilities.jsx`
- **Legacy Files Archived**: Moved `index OLD.jsx` and `index old 2.jsx` to `_archive/`
- **Debug Mode**: Confirmed `DEBUG = false` in production

#### Phase 2: High Priority Fixes ✅
- **Dynamic Path Detection**: Added `getExtensionPath()` to `Utilities.jsx`
  - Automatically detects extension path on Windows and macOS
  - Falls back to platform-specific defaults if detection fails
- **ExpressionLoader**: Updated to use dynamic path detection
- **PresetManager**: Updated to use dynamic path detection
- **Safe JSON Parsing**: Added `safeJSONParse()` function to `Utilities.jsx`
  - Handles null, undefined, empty strings gracefully
  - Logs errors without crashing
  - Returns default value on parse failure
- **JSON.parse Migration**: Replaced all `JSON.parse()` calls with `safeJSONParse()` in:
  - TypewriterManager, BoxManager, MotionManager
  - MultiLinesManager, SogaManager, LayerOperations
  - PresetManager, ImportExport
- **Error Logging**: Added logging to empty catch blocks

#### Phase 3: Medium Priority Fixes ✅
- **AE Version Check**: Added `checkAECompatibility()` to `Config.jsx`
  - Minimum version: CC 2016 (v13.0)
  - Logs warning if incompatible
- **Expression Cache Management**: Added LRU-style cache with 50 item limit
  - `EXPR_CACHE_LIMIT = 50`
  - `_manageCacheSize()` for automatic cleanup
  - `clearExpressionCache()` for manual clearing
- **Type Validation**: Enhanced effect control functions:
  - `addSlider()` - validates number, defaults to 0 on NaN
  - `addCheckbox()` - validates boolean, handles truthy/falsy values
  - `addColor()` - validates RGB array, clamps to 0-1 range
- **Motion Expression Files**: Created external expression files:
  - `expressions/motion/v1.0/position.js`
  - `expressions/motion/v1.0/scale.js`
  - `expressions/motion/v1.0/rotation.js`
  - `expressions/motion/v1.0/opacity.js`

#### Phase 4: Low Priority Fixes ✅
- **Deprecated API Fix**: Replaced `substr()` with `substring()` in:
  - `Utilities.jsx` - 3 replacements
  - `PresetManager.jsx` - 1 replacement
  - `BoxManager.jsx` - 2 replacements
- **Coding Standards**: Created `docs/CODING_STANDARDS.md` with:
  - Function naming conventions (camelCase, _prefix for private)
  - Variable naming (camelCase, UPPER_CASE for constants)
  - Module flags pattern (MODULE_NAME_LOADED)
  - Error handling patterns
  - Type validation patterns
- **Documentation**: Updated `FUNCTIONS_REFERENCE.md` with new functions
- **JSDoc**: Verified all public functions have documentation

### 📁 Module Updates
- `Utilities.jsx`: v1.1.0 → v1.2.0 (+100 lines)
- `Config.jsx`: v1.0.0 → v1.1.0 (+40 lines)
- `ExpressionLoader.jsx`: Improved path detection and cache management
- `PresetManager.jsx`: Improved path detection, safe JSON parsing
- All managers: Safe JSON parsing migration

---

## [3.2.1] - 2024-12-24

### 🔧 Fixed
- **Motion Expressions**: Fixed syntax errors in minified expressions (`Expected: ;`)
- **Motion Sync Mode**: Added `Motion Sync Mode` effect control for marker synchronization
- **Motion Timing**: Expressions now correctly read from Typewriter markers when `syncMode=1`
- **MotionManager**: Added missing functions:
  - `applyMotionMulti()` - Apply motion to multiple layers with stagger
  - `applyMotionPresetMulti()` - Apply preset to multiple layers with stagger
  - `getMotionSelectionCount()` - Get count of selected text layers
  - `getSelectedTextLayers()` - Helper function for multi-layer operations

### ✨ Improved
- **Motion Easing**: Simplified easing functions (7 types: Linear, EaseOut, EaseIn, EaseInOut, Bounce, Elastic, Spring)
- **Division Protection**: Added `if(d<=0)d=0.5;` to prevent division by zero
- **Effect Controls**: Using `!== undefined` checks for proper 0 value handling

### 📁 Module Updates
- `MotionManager.jsx`: +150 lines (new functions + improved expressions)

---

## [3.2.0] - 2024-12-23

### 🏗️ Architecture
- **Modular Migration**: Migrated from monolithic `index.jsx` (~6500 lines) to 11 independent modules
- **Module Loader**: New `index.jsx` serves as lightweight loader with `#include` statements
- **Load Verification**: Each module exports `*_MODULE_LOADED` flag for verification

### 📦 New Modules
| Module | Lines | Purpose |
|--------|-------|---------|
| Config.jsx | 112 | Constants & Configuration |
| Utilities.jsx | 660 | Helper Functions & ID System |
| ExpressionLoader.jsx | 525 | Expression Management |
| TypewriterManager.jsx | 498 | Typewriter Effect |
| BoxManager.jsx | 527 | Box/Background System |
| MultiLinesManager.jsx | 393 | Multi-Line Text |
| SogaManager.jsx | 446 | Live Edit Panel |
| LayerOperations.jsx | 388 | Layer Utilities |
| PresetManager.jsx | 1645 | Preset System |
| ImportExport.jsx | 408 | Import/Export |
| MotionManager.jsx | 504 | Motion Animation |

### ✨ Features
- **Layer ID System**: Smart naming convention (`tx_<id>_<flags>`)
- **Expression Versioning**: Support for multiple expression versions
- **Preset Categories**: type, box, motion, mix, toro

---

## [3.1.1] - 2024-12-20

### 🔧 Fixed
- **Box Expressions**: Fixed `sourceRectAtTime(0, false)` → `sourceRectAtTime(time, false)`
- **RTL Support**: Improved Arabic text handling in expressions
- **Cursor Positioning**: Fixed cursor spacing for RTL text

### ✨ Improved
- **Expression v1.3**: Smart direction detection for mixed RTL/LTR text
- **Word Mode**: Better word boundary detection for Arabic

---

## [3.1.0] - 2024-12-15

### ✨ Features
- **Soga Panel**: Live edit panel for real-time effect adjustments
- **Motion Tab**: Complete motion animation system
- **Preset System**: JSON-based preset management
- **Multi-Line Support**: Apply effects to multiple text layers

### 🔧 Fixed
- Various bug fixes and performance improvements

---

## [3.0.0] - 2024-12-01

### 🎉 Major Release
- Complete rewrite of TEXTORO
- New UI design with Adobe Spectrum
- Expression-based animation system
- Box background system
- Motion animation support

---

## Version History Summary

| Version | Date | Highlights |
|---------|------|------------|
| 3.2.1 | 2024-12-24 | Motion fixes, Multi-layer support |
| 3.2.0 | 2024-12-23 | Modular architecture |
| 3.1.1 | 2024-12-20 | Box & RTL fixes |
| 3.1.0 | 2024-12-15 | Soga, Motion, Presets |
| 3.0.0 | 2024-12-01 | Major rewrite |

---

## Migration Guide

### From 3.1.x to 3.2.x

No breaking changes. The modular architecture is internal and doesn't affect the API.

### From 2.x to 3.x

Major rewrite - not backward compatible. Re-apply effects to existing layers.

---

<div align="center">

**TEXTORO** - Professional Text Animation for After Effects

</div>
