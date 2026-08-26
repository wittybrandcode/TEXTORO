# 🎨 Mix Presets - دليل البريسات المدمجة

## نظرة عامة

Mix Presets تجمع بين إعدادات Type و Box في بريست واحد، مما يوفر تجربة متكاملة.

---

## 📁 موقع الملفات

```
%APPDATA%/TEXTORO/presets/mix/
```

---

## 📋 الهيكل الكامل

```json
{
  "name": "اسم البريست",
  "icon": "🎨",
  "category": "mix",
  "description": "وصف اختياري",
  "builtin": false,
  "author": "اسمك",
  "created": "2024-12-20T00:00:00Z",
  "type": {
    // جميع خصائص Type Preset
  },
  "box": {
    // جميع خصائص Box Preset
  }
}
```

---

## 📖 الهيكل التفصيلي

```json
{
  "name": "Professional Dark",
  "icon": "💼",
  "category": "mix",
  "builtin": false,
  
  "type": {
    "twAuto": true,
    "twReverse": false,
    "randomSpeed": 20,
    "showCursor": true,
    "cursorBefore": false,
    "cursorColor": [1, 1, 1],
    "cursorSpacing": 2,
    "blinkSpeed": 4,
    "blinkInHold": true,
    "boxRTL": false,
    "inStart": 0,
    "inEnd": 2.0,
    "outStart": null,
    "outEnd": null,
    "blinkStart": 2.01,
    "blinkEnd": 4.0
  },
  
  "box": {
    "paddingLeft": 20,
    "paddingRight": 20,
    "paddingTop": 10,
    "paddingBottom": 10,
    "use4Corners": false,
    "cornerRadius": 8,
    "strokeWidth": 2,
    "strokeOpacity": 100,
    "strokeColor": "#FFFFFF",
    "fillOpacity": 85,
    "fillColor": "#1a1a1a",
    "trimStart": 0,
    "trimEnd": 100,
    "lockBoxSize": true
  }
}
```

---

## 🎯 أمثلة جاهزة

### 1. احترافي داكن
```json
{
  "name": "Professional Dark",
  "icon": "💼",
  "category": "mix",
  "builtin": false,
  "type": {
    "twAuto": true,
    "twReverse": false,
    "randomSpeed": 15,
    "showCursor": true,
    "cursorBefore": false,
    "cursorColor": [0.3, 0.7, 1],
    "cursorSpacing": 2,
    "blinkSpeed": 3,
    "blinkInHold": true,
    "inStart": 0,
    "inEnd": 1.5,
    "outStart": null,
    "outEnd": null
  },
  "box": {
    "paddingLeft": 25,
    "paddingRight": 25,
    "paddingTop": 12,
    "paddingBottom": 12,
    "cornerRadius": 6,
    "strokeWidth": 1,
    "strokeOpacity": 50,
    "strokeColor": "#4A90D9",
    "fillOpacity": 90,
    "fillColor": "#0D1117",
    "lockBoxSize": true
  }
}
```

### 2. مرح وملون
```json
{
  "name": "Playful Colors",
  "icon": "🎮",
  "category": "mix",
  "builtin": false,
  "type": {
    "twAuto": true,
    "twReverse": false,
    "randomSpeed": 40,
    "showCursor": true,
    "cursorBefore": false,
    "cursorColor": [1, 1, 0],
    "cursorSpacing": 3,
    "blinkSpeed": 6,
    "blinkInHold": true,
    "inStart": 0,
    "inEnd": 1.0,
    "outStart": null,
    "outEnd": null
  },
  "box": {
    "paddingLeft": 20,
    "paddingRight": 20,
    "paddingTop": 10,
    "paddingBottom": 10,
    "cornerRadius": 15,
    "strokeWidth": 3,
    "strokeOpacity": 100,
    "strokeColor": "#FF6B6B",
    "fillOpacity": 80,
    "fillColor": "#2D1B69",
    "lockBoxSize": true
  }
}
```

### 3. أنيق بسيط
```json
{
  "name": "Minimal Elegant",
  "icon": "✨",
  "category": "mix",
  "builtin": false,
  "type": {
    "twAuto": true,
    "twReverse": false,
    "randomSpeed": 0,
    "showCursor": true,
    "cursorBefore": false,
    "cursorColor": [1, 1, 1],
    "cursorSpacing": 0,
    "blinkSpeed": 2,
    "blinkInHold": true,
    "inStart": 0,
    "inEnd": 3.0,
    "outStart": 5.0,
    "outEnd": 7.0
  },
  "box": {
    "paddingLeft": 30,
    "paddingRight": 30,
    "paddingTop": 15,
    "paddingBottom": 15,
    "cornerRadius": 0,
    "strokeWidth": 1,
    "strokeOpacity": 100,
    "strokeColor": "#FFFFFF",
    "fillOpacity": 0,
    "fillColor": "#000000",
    "lockBoxSize": true
  }
}
```

### 4. نيون سايبربانك
```json
{
  "name": "Cyberpunk Neon",
  "icon": "🔮",
  "category": "mix",
  "builtin": false,
  "type": {
    "twAuto": true,
    "twReverse": false,
    "randomSpeed": 60,
    "showCursor": true,
    "cursorBefore": false,
    "cursorColor": [0, 1, 1],
    "cursorSpacing": 1,
    "blinkSpeed": 8,
    "blinkInHold": false,
    "inStart": 0,
    "inEnd": 0.8,
    "outStart": null,
    "outEnd": null
  },
  "box": {
    "paddingLeft": 18,
    "paddingRight": 18,
    "paddingTop": 8,
    "paddingBottom": 8,
    "cornerRadius": 3,
    "strokeWidth": 2,
    "strokeOpacity": 100,
    "strokeColor": "#00FFFF",
    "fillOpacity": 30,
    "fillColor": "#00FFFF",
    "applyTextColor": true,
    "textColor": "#00FFFF",
    "lockBoxSize": true
  }
}
```

### 5. عربي كلاسيكي
```json
{
  "name": "Arabic Classic",
  "icon": "🕌",
  "category": "mix",
  "builtin": false,
  "type": {
    "twAuto": true,
    "twReverse": false,
    "randomSpeed": 10,
    "showCursor": true,
    "cursorBefore": true,
    "cursorColor": [0.85, 0.65, 0.13],
    "cursorSpacing": 5,
    "blinkSpeed": 3,
    "blinkInHold": true,
    "boxRTL": true,
    "inStart": 0,
    "inEnd": 2.5,
    "outStart": null,
    "outEnd": null
  },
  "box": {
    "paddingLeft": 25,
    "paddingRight": 25,
    "paddingTop": 12,
    "paddingBottom": 12,
    "cornerRadius": 10,
    "strokeWidth": 2,
    "strokeOpacity": 100,
    "strokeColor": "#D4AF37",
    "fillOpacity": 85,
    "fillColor": "#1A0A00",
    "lockBoxSize": true
  }
}
```

### 6. تقني حديث
```json
{
  "name": "Tech Modern",
  "icon": "💻",
  "category": "mix",
  "builtin": false,
  "type": {
    "twAuto": true,
    "twReverse": false,
    "randomSpeed": 25,
    "showCursor": true,
    "cursorBefore": false,
    "cursorColor": [0, 1, 0.5],
    "cursorSpacing": 2,
    "blinkSpeed": 5,
    "blinkInHold": true,
    "inStart": 0,
    "inEnd": 1.2,
    "outStart": null,
    "outEnd": null
  },
  "box": {
    "paddingLeft": 15,
    "paddingRight": 15,
    "paddingTop": 8,
    "paddingBottom": 8,
    "use4Corners": true,
    "cornerTL": 0,
    "cornerTR": 10,
    "cornerBR": 0,
    "cornerBL": 10,
    "strokeWidth": 1,
    "strokeOpacity": 80,
    "strokeColor": "#00FF88",
    "fillOpacity": 70,
    "fillColor": "#0A1A0A",
    "lockBoxSize": true
  }
}
```

---

## 💡 نصائح للتصميم

### تناسق الألوان
- اجعل `cursorColor` متناسقاً مع `strokeColor`
- استخدم ألوان متكاملة للـ `fillColor` و `strokeColor`

### التوقيت
- اجعل `blinkStart` بعد `inEnd` مباشرة
- للاختفاء السلس: `outStart` بعد `blinkEnd`

### الحجم
- للنصوص القصيرة: padding أصغر (10-15)
- للنصوص الطويلة: padding أكبر (20-30)

---

## 🎨 مجموعات ألوان مقترحة

### داكن احترافي
```
Fill: #0D1117, Stroke: #4A90D9, Cursor: [0.3, 0.7, 1]
```

### نيون وردي
```
Fill: #1A0A1A, Stroke: #FF00FF, Cursor: [1, 0, 1]
```

### طبيعي أخضر
```
Fill: #0A1A0A, Stroke: #00FF88, Cursor: [0, 1, 0.5]
```

### ذهبي فاخر
```
Fill: #1A0A00, Stroke: #D4AF37, Cursor: [0.85, 0.65, 0.13]
```

---

## ⚠️ ملاحظات مهمة

1. **الترتيب**: `type` و `box` يجب أن يكونا كائنات منفصلة
2. **الاختياري**: يمكنك حذف `type` أو `box` إذا أردت تطبيق أحدهما فقط
3. **التوافق**: تأكد من تطابق `boxRTL` في type مع اتجاه النص
