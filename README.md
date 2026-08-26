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
║  Last Updated: December 27, 2024   │  License: Proprietary                   ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)]()
[![Platform](https://img.shields.io/badge/platform-After%20Effects%20CC%202020+-orange.svg)]()
[![Architecture](https://img.shields.io/badge/architecture-Modular-green.svg)]()

</div>

## 🎯 Overview

TEXTORO is a professional Adobe After Effects extension that creates stunning typewriter text animations with customizable cursor effects and dynamic background boxes. It supports both LTR (English) and RTL (Arabic) text directions.

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| **🐂 TORO Templates** | Complete templates (Type + Box + Motion) in one click! |
| **Typewriter Effect** | Character-by-character text reveal with timing control |
| **Cursor Animation** | 7 built-in cursor styles + custom cursor support |
| **Dynamic Box** | Auto-sizing background box with 4 independent corners |
| **Motion System** | 12 motion presets (Fade, Up, Down, Pop, Spin, etc.) |
| **Multi-line Support** | Split text layers with staggered animations |
| **Presets Hub** | 25 JSON presets (Type, Box, Motion, Mix, TORO) |
| **Live Editing (Soga)** | Real-time property editing without re-applying |
| **Frame-Based Time** | Precise timing in `seconds.frames` format |

## 📁 Installation

1. Copy the `TEXTORO` folder to:
   ```
   C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\
   ```

2. Enable Debug Mode (for development):
   - Open Registry Editor
   - Navigate to: `HKEY_CURRENT_USER\Software\Adobe\CSXS.11`
   - Create String: `PlayerDebugMode` = `1`

3. Restart After Effects

4. Open: `Window > Extensions > TEXTORO`

## 🎛️ Panel Tabs

### Type Tab
Configure typewriter animation settings:
- **Direction**: English (LTR) / العربية (RTL)
- **Timing**: In Start/End, Out Start/End
- **Cursor**: Style, Color, Spacing, Blink Speed
- **Advanced**: Reverse mode, Random speed

### Box Tab
Create dynamic background boxes:
- **Padding**: Left, Right, Top, Bottom
- **Corners**: 4 independent corner radii
- **Stroke**: Width, Color, Opacity, Dash/Gap
- **Fill**: Color, Opacity
- **Options**: Lock size, Path offset

### Arena Tab
Manage animation presets:
- **Type Presets**: Typewriter-only settings
- **Box Presets**: Box-only settings
- **Mix Presets**: Combined Type + Box
- **Import/Export**: Share presets as ZIP

### Soga Tab
Live editing of applied effects:
- Edit Typewriter properties in real-time
- Edit Box properties in real-time
- Multi-layer editing support

### Settings Tab
Configure extension options:
- Custom presets folder
- Expression version management

## ⏱️ Frame-Based Time System

TEXTORO uses a unique `seconds.frames` format for precise timing:

| Format | Meaning | Example (25fps) |
|--------|---------|-----------------|
| `2.00` | 2 seconds, 0 frames | 2.00s |
| `2.12` | 2 seconds, 12 frames | 2.48s |
| `2.24` | 2 seconds, 24 frames | 2.96s |
| `2.25` | Auto-corrects to `3.00` | 3.00s |

**Features:**
- Auto-correction of invalid values
- Arrow keys increment/decrement by 1 frame
- Spinner buttons for fine control
- Automatic FPS detection from composition

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [MODULAR_ARCHITECTURE.md](docs/MODULAR_ARCHITECTURE.md) | 🆕 Modular architecture guide |
| [TECHNICAL_ANALYSIS.md](docs/TECHNICAL_ANALYSIS.md) | Architecture & code structure |
| [API_REFERENCE.md](docs/API_REFERENCE.md) | Function reference |
| [EXPRESSIONS_REFERENCE.md](docs/EXPRESSIONS_REFERENCE.md) | Expression system |
| [FUNCTIONS_REFERENCE.md](docs/FUNCTIONS_REFERENCE.md) | Host functions |
| [UI_HOST_CONTRACT.md](docs/UI_HOST_CONTRACT.md) | UI/Backend contract |
| [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | Problem solving guide |

## 🔧 Project Structure

```
TEXTORO/
├── index.html              # Main UI
├── css/
│   ├── style.css          # Main styles
│   └── spectrum-*.css     # Adobe Spectrum
├── js/
│   ├── main.js            # UI logic (~5000 lines)
│   └── CSInterface.js     # CEP interface
├── host/
│   ├── index.jsx          # Main loader (~60 lines)
│   ├── index OLD.jsx      # Original backup
│   ├── _test_integration.jsx # Integration tests
│   └── modules/           # 🆕 Modular Architecture
│       ├── Config.jsx           # Settings & constants
│       ├── Utilities.jsx        # Helper functions
│       ├── ExpressionLoader.jsx # Expression system
│       ├── TypewriterManager.jsx # Typewriter effect
│       ├── BoxManager.jsx       # Box effect
│       ├── MultiLinesManager.jsx # Multi-line support
│       ├── SogaManager.jsx      # Live editing
│       ├── LayerOperations.jsx  # Layer operations
│       ├── PresetManager.jsx    # Preset management
│       └── ImportExport.jsx     # Import/Export
│   └── expressions/
│       ├── _config.json   # Version config
│       ├── typewriter/v1.0-v1.3/
│       ├── cursor/v1.0/
│       └── box/v1.0/
├── config/
│   ├── defaults.json      # Default values
│   └── presets/
│       ├── toro/          # Complete templates
│       ├── type/          # Typewriter presets
│       ├── box/           # Box presets
│       ├── mix/           # Combined presets
│       └── motion/        # Motion presets
├── CSXS/
│   └── manifest.xml       # CEP manifest
└── docs/                   # Documentation
```

## 🎨 Effect Controls

### Typewriter Controls (11)
| Control | Type | Description |
|---------|------|-------------|
| TW Progress | Slider | Manual progress (0-100) |
| TW Auto | Checkbox | Auto-animate based on markers |
| TW Reverse | Checkbox | Delete mode (reverse typing) |
| Random Speed | Slider | Randomize typing speed |
| Show Cursor | Checkbox | Show/hide cursor |
| Cursor Before Text | Checkbox | Cursor position |
| Cursor Color | Color | Cursor color |
| Cursor Spacing | Slider | Space between cursor and text |
| Blink Speed | Slider | Cursor blink frequency |
| Blink In Hold | Checkbox | Blink during hold phase |
| Box RTL | Checkbox | Right-to-left direction |

### Box Controls (17)
| Control | Type | Description |
|---------|------|-------------|
| Padding L/R/T/B | Slider | Box padding |
| Corner TL/TR/BL/BR | Slider | Independent corner radii |
| Stroke Width | Slider | Border thickness |
| Stroke Opacity | Slider | Border opacity |
| Stroke Color | Color | Border color |
| Stroke Dash/Gap | Slider | Dashed border |
| Fill Opacity | Slider | Background opacity |
| Fill Color | Color | Background color |
| Lock Box Size | Checkbox | Prevent size changes |

## 🏷️ Marker System

TEXTORO uses layer markers for timing:

| Marker | Purpose |
|--------|---------|
| `TW_TEXT:...` | Original text storage |
| `IN_START` | Typing animation start |
| `IN_END` | Typing animation end |
| `BLINK_START` | Cursor blink start |
| `BLINK_END` | Cursor blink end |
| `OUT_START` | Delete animation start |
| `OUT_END` | Delete animation end |
| `CURSOR_CHAR:...` | Custom cursor character |

**Important:** Markers must be in chronological order with no overlapping times.

## ⚡ Quick Start

1. **Create Text Layer**: Type your text in After Effects
2. **Select Layer**: Click on the text layer
3. **Open TEXTORO**: Window > Extensions > TEXTORO
4. **Configure**: Set timing and cursor options
5. **Apply**: Click the ✓ button

## 🔄 Version History

| Version | Date | Changes |
|---------|------|---------|
| 3.2.1 | Dec 2024 | 🏗️ Modular Architecture: 10 independent modules, Box 4-corners fix |
| 3.2.0 | Dec 2024 | 🌍 RTL Improvements: Smart Direction, Arabic Word Mode, ZWJ Support |
| 3.1.3 | Dec 2024 | 🔧 Fix: Motion Presets now work correctly with Soga editing |
| 3.1.2 | Dec 2024 | 🔧 Fix: Soga Motion editing now works properly |
| 3.1.1 | Dec 2024 | 🔧 Bug fixes: Box height, Soga Motion editing |
| 3.1.0 | Dec 2024 | 23 New Presets, Favorites & Sort in Presets Hub, Motion in Soga |
| 3.0.0 | Dec 2024 | 🐂 TORO Templates, Presets Hub unified, Bug fixes |
| 2.9.0 | Dec 2024 | JSON Presets System - Auto-discovery, Motion presets JSON |
| 2.8.0 | Dec 2024 | Presets IN/OUT Tabs, Independent OUT Animation, 12 Motion Presets |
| 2.7.0 | Dec 2024 | Motion Tab, Easing Controls, Expression v1.2 |
| 2.6.0 | Dec 2024 | Per-Character Animation, Text Effects, Motion Presets Save |
| 2.5.12 | Dec 2024 | UX/UI Redesign - Collapsible sections, Arena search |
| 2.5 | Dec 2024 | Multi-lines support, Soga live editing, Markers management |
| 1.0 | Nov 2024 | Initial stable release |

## 🆕 Latest Updates (v3.2.0)

### 🌍 RTL Improvements (تحسينات العربية)
- **Smart Direction Detection**: اكتشاف اتجاه النص تلقائياً (عربي/إنجليزي)
  - يفحص أول 50 حرف لتحديد الاتجاه السائد
  - يدعم Unicode ranges للعربية والعربية الموسعة
- **Arabic Word Mode**: وضع الكلمات للنص العربي
  - بدلاً من حرف بحرف، يظهر كلمة بكلمة
  - يحافظ على اتصال الحروف العربية (Ligatures)
- **Zero-Width Joiner (ZWJ)**: للنص المختلط
  - يضيف ZWJ بعد الحروف المتصلة
  - يحافظ على شكل الحرف الصحيح
- **Auto Cursor Position**: تفعيل موضع المؤشر تلقائياً
  - عند اختيار العربية، يُفعّل "Cursor Before Text" تلقائياً
  - المؤشر يظهر على اليسار (نهاية الكتابة للعربية)
- **Mixed Text Support**: دعم النص المختلط
  - يعمل مع نصوص تحتوي عربي وإنجليزي معاً
- **Expression v1.3**: نسخة جديدة من sourceText Expression
  - دوال جديدة: `isArabicChar()`, `isConnectingChar()`, `detectTextDirection()`, `addZWJ()`

### 🔧 Previous Fixes (v3.1.1-3.1.3)
- **Motion Presets Fix**: Fixed issue where Motion presets (Pop, Bounce, etc.) weren't working correctly with Soga editing
- **Box Height Fix**: Fixed issue where box didn't respect text height during Typewriter animation
- **Soga Motion Fix**: Fixed Motion editing in Soga tab after applying Motion presets

---

## v3.1.0 Features

### 23 New Presets
- **Type**: Arabic Elegant, Instant Appear, Smooth Reveal, Code Terminal, Glitch Effect
- **Box**: Neon Glow, Underline Only, Glass Morphism, Dark Elegant, Pill Shape
- **Mix**: Cinematic Intro, Arabic News, News Lower Third, YouTube Title, Social Media
- **Motion**: Slide Bounce, Typewriter Sync, Zoom Blur, Rotate In, Elastic Pop
- **TORO**: Arabic News, YouTube Intro, Minimal Modern

### Presets Hub UX Improvements
- **⭐ Favorites System**: Mark your favorite presets with a star
- **Sort Options**: Sort by Name (A-Z/Z-A), Category, or Favorites First
- **Enhanced Tooltips**: Preview preset properties on hover

### Motion in Soga Tab
- **Live Edit Motion**: Edit motion values directly from Soga panel
- **IN/OUT Tabs**: Separate controls for IN and OUT animations
- **Sync with Typewriter**: Option to sync motion timing with typewriter markers

---

## 🐂 TORO - Complete Templates

> **TORO** = **T**ype + B**O**x + Motion = الثور الكامل!

- **One-Click Magic**: نص كامل مع صندوق وحركة بنقرة واحدة
- **5 Builtin Templates**: Minimal Fade, Arabic Classic, Bounce Pop, Professional Intro, Slide Elegant
- **Save Your Own**: احفظ قوالبك الخاصة
- **RTL Support**: دعم كامل للعربية

### Presets Hub
- **Unified Panel**: كل البريسات في مكان واحد
- **6 Categories**: Toro, Type, Box, Mix, Motion
- **Filter & Search**: فلترة وبحث سريع
- **Quick Apply**: تطبيق بنقرة واحدة

### Bug Fixes
- Fixed: TypeError when applying presets
- Fixed: fileName support for JSON presets
- Improved: Error handling and validation

### Documentation
- [🐂 TORO Guide](docs/presets/TORO.md) - دليل القوالب الشاملة
- [📖 Presets Guide](docs/presets/README.md) - دليل شامل لإنشاء البريسات
- [📝 Type Presets](docs/presets/TYPE_PRESETS.md)
- [📦 Box Presets](docs/presets/BOX_PRESETS.md)
- [🎨 Mix Presets](docs/presets/MIX_PRESETS.md)
- [🎬 Motion Presets](docs/presets/MOTION_PRESETS.md)

## 📝 License

TEXTORO © 2024 - All Rights Reserved

---

**Made with ❤️ for Motion Designers**

