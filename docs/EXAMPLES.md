# TEXTORO - Examples & Use Cases

## 📝 Basic Typewriter Effect

### Simple Typewriter
```javascript
// Settings
Direction: LTR
In Start: 1.00
In End: 3.00
Show Cursor: ✓
Cursor Type: Line (|)
```

### Arabic Typewriter (RTL)
```javascript
// Settings
Direction: RTL
In Start: 1.00
In End: 3.00
Show Cursor: ✓
Cursor Type: Block (█)
```

---

## 🎭 Per-Character Animation Examples

### Bounce In Effect
```javascript
// Per-Character Settings
Enable: ✓
Delay: 0.05s
Offset Y: 50px
Scale: -50%
Opacity: 0%
Duration: 0.4s
Easing: Bounce
```

### Fade Up Effect
```javascript
// Per-Character Settings
Enable: ✓
Delay: 0.03s
Offset Y: 30px
Scale: 0%
Opacity: 0%
Duration: 0.3s
Easing: Ease Out
```

### Rotate In Effect
```javascript
// Per-Character Settings
Enable: ✓
Delay: 0.04s
Offset Y: 0px
Scale: 0%
Rotation: 90°
Opacity: 0%
Duration: 0.35s
Easing: Ease Out
```

### Scale Pop Effect
```javascript
// Per-Character Settings
Enable: ✓
Delay: 0.05s
Offset Y: 0px
Scale: 100%
Opacity: 0%
Duration: 0.25s
Easing: Ease Out
```

---

## ✨ Text Effects Examples

### Soft Glow
```javascript
// Effects Settings
Blur: ✗
Glow: ✓
  Radius: 15
  Color: #ffffff
Shadow: ✗
```

### Neon Effect
```javascript
// Effects Settings
Blur: ✗
Glow: ✓
  Radius: 30
  Color: #00ffff
Shadow: ✗
```

### Cinematic Shadow
```javascript
// Effects Settings
Blur: ✗
Glow: ✗
Shadow: ✓
  Distance: 8
  Color: #000000
```

### Dreamy Effect
```javascript
// Effects Settings
Blur: ✓
  Amount: 5
Glow: ✓
  Radius: 20
  Color: #ffffff
Shadow: ✗
```

---

## 📦 Box Effect Examples

### Simple Rounded Box
```javascript
// Box Settings
Padding: 20, 20, 10, 10
Corners: 10, 10, 10, 10
Stroke Width: 2
Stroke Color: #ffffff
Fill Opacity: 80%
Fill Color: #000000
```

### Speech Bubble Style
```javascript
// Box Settings
Padding: 25, 25, 15, 15
Corners: 20, 20, 20, 5
Stroke Width: 0
Fill Opacity: 100%
Fill Color: #ffffff
```

### Outline Only
```javascript
// Box Settings
Padding: 15, 15, 10, 10
Corners: 5, 5, 5, 5
Stroke Width: 3
Stroke Color: #00ff00
Fill Opacity: 0%
```

### Dashed Border
```javascript
// Box Settings
Padding: 20, 20, 12, 12
Corners: 8, 8, 8, 8
Stroke Width: 2
Stroke Dash: 10
Stroke Gap: 5
Fill Opacity: 50%
```

---

## 🎬 Motion Examples

### Slide In from Left
```javascript
// Motion IN Settings
Position X: -500
Position Y: 0
Scale: 100%
Rotation: 0°
Opacity: 100%
Duration: 0.5s
Easing: Ease Out
```

### Zoom In
```javascript
// Motion IN Settings
Position X: 0
Position Y: 0
Scale: 0%
Rotation: 0°
Opacity: 0%
Duration: 0.4s
Easing: Ease Out
```

### Rotate In
```javascript
// Motion IN Settings
Position X: 0
Position Y: 0
Scale: 50%
Rotation: 180°
Opacity: 0%
Duration: 0.6s
Easing: Ease Out
```

### Drop In
```javascript
// Motion IN Settings
Position X: 0
Position Y: -300
Scale: 100%
Rotation: 0°
Opacity: 100%
Duration: 0.5s
Easing: Bounce
```

---

## 🔄 Combined Effects

### Professional Title
```javascript
// Typewriter
Direction: LTR
In Start: 0.50
In End: 2.00
Cursor: Line, White

// Per-Character
Enable: ✓
Delay: 0.03s
Offset Y: 20px
Easing: Ease Out

// Box
Padding: 30, 30, 15, 15
Corners: 0, 0, 0, 0
Stroke: 2px, White
Fill: 80%, Black

// Motion IN
Position Y: 50
Opacity: 0%
Duration: 0.3s
```

### Social Media Style
```javascript
// Typewriter
Direction: LTR
In Start: 0.30
In End: 1.50
Cursor: None

// Per-Character
Enable: ✓
Delay: 0.02s
Scale: -30%
Opacity: 0%
Easing: Ease Out

// Effects
Glow: ✓, Radius 10, White

// Box
Padding: 20, 20, 12, 12
Corners: 25, 25, 25, 25
Fill: 100%, Gradient
```

---

## 💡 Tips & Tricks

### 1. Smooth Character Animation
- Use small delay values (0.02-0.05s)
- Keep duration short (0.2-0.4s)
- Ease Out works best for entrance

### 2. Readable Text Effects
- Don't combine Blur with small text
- Glow radius should be proportional to font size
- Shadow distance: 3-8px for readability

### 3. Performance
- Disable effects you don't need
- Per-Character animation is GPU intensive
- Use Motion presets for consistency

### 4. RTL Text
- Always set Direction to RTL for Arabic
- Cursor Before Text works differently in RTL
- Box padding may need adjustment

---

## 📁 Preset Locations

```
Built-in Presets:
  TEXTORO/config/presets/type/
  TEXTORO/config/presets/box/
  TEXTORO/config/presets/mix/
  TEXTORO/config/presets/motion/

User Presets:
  %APPDATA%/TEXTORO/presets/type/
  %APPDATA%/TEXTORO/presets/box/
  %APPDATA%/TEXTORO/presets/mix/
  %APPDATA%/TEXTORO/presets/motion/
```

---

## 🔧 Troubleshooting

### Per-Character Animation Not Working
1. Make sure "Enable" checkbox is checked
2. Check that Offset Y or other values are not 0
3. Verify IN_START marker exists on layer

### Text Effects Not Visible
1. Check that effect checkbox is enabled
2. Increase effect values (Blur amount, Glow radius)
3. Make sure text layer is selected

### Motion Not Applying
1. Select a text layer first
2. Check Motion IN/OUT values are not all 0
3. Verify layer has enough duration

---

**Made with ❤️ for Motion Designers**
