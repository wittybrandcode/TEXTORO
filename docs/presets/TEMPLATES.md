# 📄 Preset Templates - قوالب جاهزة للنسخ

> قوالب JSON جاهزة للنسخ واللصق مباشرة
> 
> **v3.1.0** - تم إضافة 23 بريست جديد!

---

## 📊 فهرس البريسات الجديدة (v3.1.0)

### 🐂 TORO (3 جديدة)
- Arabic News - أخبار عربية
- YouTube Intro - مقدمة يوتيوب
- Minimal Modern - حديث بسيط

### ⌨️ Type (5 جديدة)
- Arabic Elegant - أناقة عربية
- Instant Appear - ظهور فوري
- Smooth Reveal - كشف سلس
- Code Terminal - طرفية برمجية
- Glitch Effect - تأثير خلل

### 📦 Box (5 جديدة)
- Neon Glow - توهج نيون
- Underline Only - خط سفلي فقط
- Glass Morphism - زجاج ضبابي
- Dark Elegant - أناقة داكنة
- Pill Shape - شكل حبة

### 🎨 Mix (5 جديدة)
- Cinematic Intro - مقدمة سينمائية
- Arabic News - أخبار عربية
- News Lower Third - شريط أخبار
- YouTube Title - عنوان يوتيوب
- Social Media - سوشيال ميديا

### 🎬 Motion (5 جديدة)
- Slide Bounce - انزلاق مرتد
- Typewriter Sync - متزامن مع الكتابة
- Zoom Blur - تكبير ضبابي
- Rotate In - دوران للداخل
- Elastic Pop - قفزة مرنة

---

## 🐂 TORO Templates

### Minimal TORO
```json
{
  "name": "My Minimal TORO",
  "icon": "🐂",
  "category": "toro",
  "description": "قالب بسيط",
  "builtin": false,
  "values": {
    "type": {
      "direction": "ltr",
      "showCursor": true,
      "cursorBefore": false,
      "cursorType": 0,
      "cursorColor": [1, 1, 1],
      "cursorSpacing": 0,
      "blinkSpeed": 2,
      "blinkInHold": true,
      "reverse": false,
      "wordMode": false,
      "randomSpeed": 0,
      "inStart": 0.5,
      "inEnd": 2.0,
      "outStart": 5.0,
      "outEnd": 6.0,
      "blinkStart": 0,
      "blinkEnd": 7,
      "easingType": 1,
      "easingStrength": 100
    },
    "box": {
      "paddingLeft": 40,
      "paddingRight": 40,
      "paddingTop": 20,
      "paddingBottom": 20,
      "cornerTL": 10,
      "cornerTR": 10,
      "cornerBL": 10,
      "cornerBR": 10,
      "strokeWidth": 2,
      "strokeOpacity": 100,
      "strokeColor": [1, 1, 1],
      "fillOpacity": 100,
      "fillColor": [0.2, 0.4, 0.9]
    },
    "motion": {
      "inStart": 0,
      "inEnd": 0.8,
      "outEnable": true,
      "outStart": 5.5,
      "outEnd": 6.5,
      "animatePosition": false,
      "posFromX": 0,
      "posFromY": 0,
      "posToX": 0,
      "posToY": 0,
      "animateScale": true,
      "scaleFrom": 80,
      "scaleTo": 100,
      "animateRotation": false,
      "rotFrom": 0,
      "rotTo": 0,
      "animateOpacity": true,
      "opacityFrom": 0,
      "opacityTo": 100,
      "easingType": 1,
      "easingStrength": 100
    }
  }
}
```

### Arabic TORO (RTL)
```json
{
  "name": "قالب عربي",
  "icon": "🐂",
  "category": "toro",
  "description": "قالب للنصوص العربية",
  "builtin": false,
  "values": {
    "type": {
      "direction": "rtl",
      "showCursor": true,
      "cursorBefore": true,
      "cursorType": 1,
      "cursorColor": [0.855, 0.647, 0.125],
      "cursorSpacing": 2,
      "blinkSpeed": 2,
      "blinkInHold": true,
      "reverse": false,
      "wordMode": false,
      "randomSpeed": 0,
      "inStart": 0.5,
      "inEnd": 2.5,
      "outStart": 6.0,
      "outEnd": 7.5,
      "blinkStart": 0,
      "blinkEnd": 8,
      "easingType": 1,
      "easingStrength": 100,
      "boxRTL": true
    },
    "box": {
      "paddingLeft": 45,
      "paddingRight": 45,
      "paddingTop": 22,
      "paddingBottom": 22,
      "cornerTL": 0,
      "cornerTR": 0,
      "cornerBL": 0,
      "cornerBR": 0,
      "strokeWidth": 3,
      "strokeOpacity": 100,
      "strokeColor": [0.855, 0.647, 0.125],
      "fillOpacity": 95,
      "fillColor": [0.1, 0.1, 0.12]
    },
    "motion": {
      "inStart": 0,
      "inEnd": 0.8,
      "outEnable": true,
      "outStart": 6.5,
      "outEnd": 7.3,
      "animatePosition": true,
      "posFromX": 80,
      "posFromY": 0,
      "posToX": 0,
      "posToY": 0,
      "animateScale": false,
      "scaleFrom": 100,
      "scaleTo": 100,
      "animateRotation": false,
      "rotFrom": 0,
      "rotTo": 0,
      "animateOpacity": true,
      "opacityFrom": 0,
      "opacityTo": 100,
      "easingType": 1,
      "easingStrength": 100
    }
  }
}
```

---

## ⌨️ Type Templates

### Fast Typing
```json
{
  "name": "Fast Typing",
  "icon": "⚡",
  "category": "type",
  "builtin": false,
  "values": {
    "twAuto": true,
    "twReverse": false,
    "randomSpeed": 30,
    "showCursor": true,
    "cursorBefore": false,
    "cursorColor": [1, 1, 1],
    "cursorSpacing": 0,
    "blinkSpeed": 4,
    "blinkInHold": true,
    "boxRTL": false,
    "inStart": 0,
    "inEnd": 1.0,
    "outStart": null,
    "outEnd": null,
    "blinkStart": 1.0,
    "blinkEnd": 3.0
  }
}
```

### Slow Reveal
```json
{
  "name": "Slow Reveal",
  "icon": "🐢",
  "category": "type",
  "builtin": false,
  "values": {
    "twAuto": true,
    "twReverse": false,
    "randomSpeed": 0,
    "showCursor": true,
    "cursorBefore": false,
    "cursorColor": [1, 1, 1],
    "cursorSpacing": 2,
    "blinkSpeed": 1.5,
    "blinkInHold": true,
    "boxRTL": false,
    "inStart": 0,
    "inEnd": 4.0,
    "outStart": 6.0,
    "outEnd": 8.0,
    "blinkStart": 0,
    "blinkEnd": 10.0
  }
}
```

---

## 📦 Box Templates

### Rounded Blue
```json
{
  "name": "Rounded Blue",
  "icon": "🔵",
  "category": "box",
  "builtin": false,
  "values": {
    "paddingLeft": 40,
    "paddingRight": 40,
    "paddingTop": 20,
    "paddingBottom": 20,
    "cornerTL": 15,
    "cornerTR": 15,
    "cornerBL": 15,
    "cornerBR": 15,
    "strokeWidth": 0,
    "strokeOpacity": 100,
    "strokeColor": [1, 1, 1],
    "fillOpacity": 100,
    "fillColor": [0.129, 0.588, 0.953]
  }
}
```

### Minimal Outline
```json
{
  "name": "Minimal Outline",
  "icon": "⬜",
  "category": "box",
  "builtin": false,
  "values": {
    "paddingLeft": 30,
    "paddingRight": 30,
    "paddingTop": 15,
    "paddingBottom": 15,
    "cornerTL": 0,
    "cornerTR": 0,
    "cornerBL": 0,
    "cornerBR": 0,
    "strokeWidth": 2,
    "strokeOpacity": 100,
    "strokeColor": [1, 1, 1],
    "fillOpacity": 0,
    "fillColor": [0, 0, 0]
  }
}
```

---

## 🎨 Mix Templates

### Professional
```json
{
  "name": "Professional",
  "icon": "💼",
  "category": "mix",
  "builtin": false,
  "values": {
    "type": {
      "twAuto": true,
      "showCursor": true,
      "cursorBefore": false,
      "cursorColor": [1, 1, 1],
      "blinkSpeed": 2,
      "inStart": 0.5,
      "inEnd": 2.0,
      "outStart": 5.0,
      "outEnd": 6.0
    },
    "box": {
      "paddingLeft": 40,
      "paddingRight": 40,
      "paddingTop": 20,
      "paddingBottom": 20,
      "cornerTL": 8,
      "cornerTR": 8,
      "cornerBL": 8,
      "cornerBR": 8,
      "strokeWidth": 0,
      "fillOpacity": 100,
      "fillColor": [0.129, 0.588, 0.953]
    }
  }
}
```

---

## 🎬 Motion Templates

### Fade In
```json
{
  "name": "Fade In",
  "icon": "🌅",
  "category": "motion",
  "builtin": false,
  "values": {
    "inStart": 0,
    "inEnd": 0.8,
    "outEnable": true,
    "outStart": 4.0,
    "outEnd": 4.8,
    "animatePosition": false,
    "posFromX": 0,
    "posFromY": 0,
    "posToX": 0,
    "posToY": 0,
    "animateScale": false,
    "scaleFrom": 100,
    "scaleTo": 100,
    "animateRotation": false,
    "rotFrom": 0,
    "rotTo": 0,
    "animateOpacity": true,
    "opacityFrom": 0,
    "opacityTo": 100,
    "easingType": 1,
    "easingStrength": 100
  }
}
```

### Slide Up
```json
{
  "name": "Slide Up",
  "icon": "⬆️",
  "category": "motion",
  "builtin": false,
  "values": {
    "inStart": 0,
    "inEnd": 0.6,
    "outEnable": true,
    "outStart": 4.0,
    "outEnd": 4.6,
    "animatePosition": true,
    "posFromX": 0,
    "posFromY": 80,
    "posToX": 0,
    "posToY": 0,
    "animateScale": false,
    "scaleFrom": 100,
    "scaleTo": 100,
    "animateRotation": false,
    "rotFrom": 0,
    "rotTo": 0,
    "animateOpacity": true,
    "opacityFrom": 0,
    "opacityTo": 100,
    "easingType": 1,
    "easingStrength": 100
  }
}
```

### Bounce Scale
```json
{
  "name": "Bounce Scale",
  "icon": "🏀",
  "category": "motion",
  "builtin": false,
  "values": {
    "inStart": 0,
    "inEnd": 1.2,
    "outEnable": true,
    "outStart": 4.0,
    "outEnd": 5.0,
    "animatePosition": false,
    "posFromX": 0,
    "posFromY": 0,
    "posToX": 0,
    "posToY": 0,
    "animateScale": true,
    "scaleFrom": 0,
    "scaleTo": 100,
    "animateRotation": false,
    "rotFrom": 0,
    "rotTo": 0,
    "animateOpacity": true,
    "opacityFrom": 0,
    "opacityTo": 100,
    "easingType": 5,
    "easingStrength": 100
  }
}
```

---

## 📝 كيفية الاستخدام

1. **انسخ** القالب المطلوب
2. **أنشئ ملف** `.json` جديد
3. **الصق** المحتوى
4. **عدّل** الاسم والقيم حسب رغبتك
5. **احفظ** في المجلد المناسب:
   - TORO: `%APPDATA%/TEXTORO/presets/toro/`
   - Type: `%APPDATA%/TEXTORO/presets/type/`
   - Box: `%APPDATA%/TEXTORO/presets/box/`
   - Mix: `%APPDATA%/TEXTORO/presets/mix/`
   - Motion: `%APPDATA%/TEXTORO/presets/motion/`

---

## 🎨 الألوان

الألوان في JSON تُكتب كـ RGB بقيم من 0 إلى 1:

| اللون | RGB Array |
|-------|-----------|
| أبيض | `[1, 1, 1]` |
| أسود | `[0, 0, 0]` |
| أحمر | `[1, 0, 0]` |
| أخضر | `[0, 1, 0]` |
| أزرق | `[0, 0, 1]` |
| ذهبي | `[0.855, 0.647, 0.125]` |
| برتقالي | `[1, 0.341, 0.133]` |

### تحويل Hex إلى RGB Array
```
#2196F3 → [0.129, 0.588, 0.953]
#FF5722 → [1, 0.341, 0.133]
```

**الصيغة**: `قيمة Hex / 255`

---

*🐂 TEXTORO v3.1.0*
