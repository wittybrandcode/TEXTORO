# TEXTORO - Professional Text Animation for After Effects

<div align="center">

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║   ████████╗███████╗██╗  ██╗████████╗ ██████╗ ██████╗  ██████╗               ║
║   ╚══██╔══╝██╔════╝╚██╗██╔╝╚══██╔══╝██╔═══██╗██╔══██╗██╔═══██╗              ║
║      ██║   █████╗   ╚███╔╝    ██║   ██║   ██║██████╔╝██║   ██║              ║
║      ██║   ██╔══╝   ██╔██╗    ██║   ██║   ██║██╔══██╗██║   ██║              ║
║      ██║   ███████╗██╔╝ ██╗   ██║   ╚██████╔╝██║  ██║╚██████╔╝              ║
║      ╚═╝   ╚══════╝╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝ ╚═════╝              ║
║                                                                              ║
║                    Professional Text Animation for AE                        ║
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Version: 1.0.0                    │  Platform: After Effects CC 2020+       ║
║  Architecture: Modular (11 modules)│  Languages: Arabic/English (RTL/LTR)    ║
║  Last Updated: August 26, 2026     │  License: Proprietary                   ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)]()
[![Platform](https://img.shields.io/badge/platform-After%20Effects%20CC%202020+-orange.svg)]()
[![Architecture](https://img.shields.io/badge/architecture-Modular-green.svg)]()

</div>

## 🎯 Overview

TEXTORO is a professional Adobe After Effects extension for typewriter text animations with cursor effects and dynamic background boxes. Built for both LTR and RTL workflows.

> **Arena** — حلبة الثور: النص هو الثور، وTEXTORO يروّضه.

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| **🐂 Arena Presets** | Complete templates (Type + Box + Motion) in one click |
| **Typewriter Effect** | Character-by-character reveal with timing control |
| **Cursor Animation** | 7 cursor styles + custom cursor |
| **Dynamic Box** | Auto-sizing background with 4 independent corners |
| **Motion System** | 12 motion presets (Fade, Up, Pop, Spin, etc.) |
| **Live Editing (Soga)** | Real-time property editing |
| **Live Text v1.4** | Edit text on layer — AE & Premiere (Mogrt) ready |
| **Frame-Based Time** | Precise `seconds.frames` timing |

## 📁 Installation

1. Copy the `TEXTORO` folder to:
   ```
   C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\
   ```
2. Enable Debug Mode (for development):
   - Registry: `HKEY_CURRENT_USER\Software\Adobe\CSXS.11`
   - String: `PlayerDebugMode` = `1`
3. Restart After Effects
4. Open: `Window > Extensions > TEXTORO` → Tab **Arena**

## 🎛️ Panel Tabs

- **Type** — Direction (LTR/RTL), Timing (In/Out), Cursor, Advanced (Reverse, Word Mode)
- **Box** — Padding, Corners, Stroke, Fill, Path Offset
- **Arena** — Presets library (Type/Box/Mix/Motion/Toro) with search & favorites
- **Soga** — Live editing for Type/Box/Motion
- **Settings** — Presets folder & Expression versions (v1.0 / v1.3 / v1.4)

## ⏱️ Frame-Based Time

| Input | Meaning | Example (25fps) |
|-------|---------|-----------------|
| `2.00` | 2s 0f | 2.00s |
| `2.12` | 2s 12f | 2.48s |
| `2.25` | Auto-corrects to `3.00` | 3.00s |

## 📖 Documentation

- [Manual UAT Checklist](docs/UAT_V1/UAT_MANUAL_CHECKLIST_2026-08-25.md) — 71 manual tests

## 🔧 Project Structure

```
TEXTORO/
├── index.html
├── css/ (Spectrum + style)
├── js/ (CEP UI, panels, state)
├── host/
│   ├── index.jsx
│   └── modules/ (11 modules)
│   └── expressions/ (typewriter v1.0/v1.3/v1.4)
├── config/ (presets, controllers)
├── CSXS/manifest.xml
└── docs/UAT_V1/ (manual tests only)
```

## 🏷️ Marker System

| Marker | Purpose |
|--------|---------|
| `TW_TEXT:` | Original text |
| `IN_START/END` | Typing range |
| `OUT_START/END` | Exit range |
| `BLINK_START/END` | Cursor blink |

## ⚡ Quick Start

1. Create text layer
2. Select it
3. Open TEXTORO → **Arena** → Apply a preset
4. Or configure **Type** tab and Apply

## 🔄 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Aug 2026 | 🐂 Arena restored, Live Text v1.4 (Mogrt-ready), security hardening, encoding fix |
| 1.0.1 | Aug 2026 | README encoding fix |

## 📝 License

TEXTORO © 2024 — All Rights Reserved

---

**Made with ❤️ for Motion Designers**
