# Motion Tab - Complete Feature Documentation

## Overview

The Motion tab provides powerful layer-level animation capabilities for text layers in After Effects. It allows animating Position, Scale, Rotation, and Opacity with full control over IN (entrance) and OUT (exit) animations.

---

## Key Features

### 1. Timing System
- **Manual Timing**: Set precise IN/OUT start and end times in seconds
- **Sync with Typewriter**: Automatically sync motion timing with Typewriter markers (IN_START, IN_END, OUT_START, OUT_END)

### 2. Animatable Properties
| Property | Description | Range |
|----------|-------------|-------|
| Position | X/Y offset animation | Unlimited |
| Scale | Size animation | 0-200% |
| Rotation | Rotation animation | -360° to 360° |
| Opacity | Transparency animation | 0-100% |

### 3. Independent OUT Values (NEW)
Each property has a **Link/Unlink** button (🔗) that controls whether OUT animation reverses IN or uses independent values.

#### Linked Mode (Default)
- OUT animation automatically reverses IN
- Example: IN slides up → OUT slides down

#### Unlinked Mode
- Separate OUT values can be specified
- Example: IN slides up → OUT slides right

### 4. Easing Types
| Type | Value | Description |
|------|-------|-------------|
| Linear | 0 | Constant speed |
| Ease Out | 1 | Starts fast, ends slow |
| Ease In | 2 | Starts slow, ends fast |
| Ease In-Out | 3 | Slow start and end |
| Bounce | 4 | Bouncing effect |
| Elastic | 5 | Elastic/spring effect |
| Back | 6 | Overshoots then settles |

### 5. Presets with IN/OUT Tabs (NEW)
The presets section now features a tabbed interface for selecting different presets for IN and OUT animations.

#### Tab System
- **IN Tab** (Green): Select entrance animation preset
- **OUT Tab** (Orange): Select exit animation preset
- **Selection Summary**: Shows current selections (e.g., "IN: Pop | OUT: Fade")
- **Apply Button**: Applies selected presets
- **Clear Button**: Resets selections

#### Interaction Modes
- **Single Click**: Select preset for current tab
- **Double Click**: Instant apply (backward compatible)
- **Toggle**: Click same preset again to deselect

#### 12 Built-in Presets
| # | Name | Description |
|---|------|-------------|
| 0 | Fade | Simple opacity fade |
| 1 | Up | Slide from bottom |
| 2 | Down | Slide from top |
| 3 | Left | Slide from right |
| 4 | Right | Slide from left |
| 5 | Pop | Scale with back easing |
| 6 | Zoom | Scale with fade |
| 7 | Spin | Rotation with scale |
| 8 | Drop | Fall with bounce |
| 9 | Bounce | Elastic scale |
| 10 | Flip | Rotation flip |
| 11 | Rise | Gentle rise with scale |

#### Usage Examples
- **IN only**: Select "Pop" in IN tab → Apply (OUT reverses automatically)
- **IN + OUT**: Select "Up" in IN tab, "Fade" in OUT tab → Apply
- **OUT only**: Select "Left" in OUT tab → Apply (adds to current settings)

---

## Effect Controls Reference

### Timing Controls
| Control Name | Type | Description |
|--------------|------|-------------|
| Motion In Start | Slider | IN animation start time (seconds) |
| Motion In End | Slider | IN animation end time (seconds) |
| Motion Out Start | Slider | OUT animation start time (-1 = disabled) |
| Motion Out End | Slider | OUT animation end time |
| Motion Sync Mode | Slider | 0=Manual, 1=Sync with Typewriter |

### Position Controls
| Control Name | Type | Description |
|--------------|------|-------------|
| Animate Position | Checkbox | Enable position animation |
| Pos From X | Slider | IN start X offset |
| Pos From Y | Slider | IN start Y offset |
| Pos To X | Slider | IN end X offset |
| Pos To Y | Slider | IN end Y offset |
| Pos Link Mode | Slider | 0=Linked, 1=Independent OUT |
| Pos Out From X | Slider | OUT start X offset |
| Pos Out From Y | Slider | OUT start Y offset |
| Pos Out To X | Slider | OUT end X offset |
| Pos Out To Y | Slider | OUT end Y offset |

### Scale Controls
| Control Name | Type | Description |
|--------------|------|-------------|
| Animate Scale | Checkbox | Enable scale animation |
| Scale From | Slider | IN start scale % |
| Scale To | Slider | IN end scale % |
| Scale Link Mode | Slider | 0=Linked, 1=Independent OUT |
| Scale Out From | Slider | OUT start scale % |
| Scale Out To | Slider | OUT end scale % |

### Rotation Controls
| Control Name | Type | Description |
|--------------|------|-------------|
| Animate Rotation | Checkbox | Enable rotation animation |
| Rot From | Slider | IN start rotation ° |
| Rot To | Slider | IN end rotation ° |
| Rot Link Mode | Slider | 0=Linked, 1=Independent OUT |
| Rot Out From | Slider | OUT start rotation ° |
| Rot Out To | Slider | OUT end rotation ° |

### Opacity Controls
| Control Name | Type | Description |
|--------------|------|-------------|
| Animate Opacity | Checkbox | Enable opacity animation |
| Opacity From | Slider | IN start opacity % |
| Opacity To | Slider | IN end opacity % |
| Opacity Link Mode | Slider | 0=Linked, 1=Independent OUT |
| Opacity Out From | Slider | OUT start opacity % |
| Opacity Out To | Slider | OUT end opacity % |

### Easing Controls
| Control Name | Type | Description |
|--------------|------|-------------|
| Motion Easing Type | Slider | Easing type (0-6) |
| Motion Easing Strength | Slider | Easing intensity % |

---

## Usage Examples

### Example 1: Slide Up with Fade
```
Position: Enable ✓
  IN: From (0, 100) → To (0, 0)
Opacity: Enable ✓
  IN: From 0% → To 100%
Easing: Ease Out
```

### Example 2: Enter from Bottom, Exit to Right
```
Position: Enable ✓, Unlink OUT
  IN: From (0, 100) → To (0, 0)
  OUT: From (0, 0) → To (200, 0)
Opacity: Enable ✓
  IN: From 0% → To 100%
```

### Example 3: Pop In, Spin Out
```
Scale: Enable ✓
  IN: From 0% → To 100%
Rotation: Enable ✓, Unlink OUT
  IN: From 0° → To 0°
  OUT: From 0° → To 360°
Easing: Back (for pop effect)
```

---

## Multi-Layer Support

When multiple text layers are selected:
- **Stagger** option appears
- Each layer's animation is delayed by the stagger amount
- Useful for sequential text animations

---

## API Functions

### JavaScript (main.js)
```javascript
applyMotionFromUI()      // Apply motion from UI values
removeMotionFromUI()     // Remove motion from layer
applyMotionPreset(index) // Apply preset by index
```

### Host Script (index.jsx)
```javascript
applyMotion(optsJSON)           // Apply motion to single layer
applyMotionMulti(optsJSON)      // Apply to multiple layers
applyMotionPreset(optsJSON)     // Apply preset to single layer
applyMotionPresetMulti(optsJSON) // Apply preset to multiple layers
removeMotion()                   // Remove motion from layer
```

---

## Changelog

### v2.8.0 (December 2024)
- ✅ Added Presets IN/OUT tabs system
- ✅ Separate preset selection for entrance and exit animations
- ✅ Selection summary bar with Apply/Clear buttons
- ✅ Double-click for instant apply (backward compatible)
- ✅ Auto-unlink properties when OUT preset selected

### v2.6.0 (December 2024)
- ✅ Added Independent OUT values for all properties
- ✅ Added Link/Unlink buttons (🔗) per property
- ✅ Added 2 new presets: Flip, Rise
- ✅ Fixed timing system (respects seconds correctly)
- ✅ Added Sync with Typewriter markers
- ✅ Added all 7 easing types including Bounce, Elastic, Back
