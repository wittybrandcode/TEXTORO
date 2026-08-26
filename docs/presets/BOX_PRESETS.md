# 📦 Box Presets - دليل بريسات الصندوق

## نظرة عامة

Box Presets تتحكم في الصندوق المحيط بالنص (الخلفية، الحدود، الزوايا).

---

## 📁 موقع الملفات

```
%APPDATA%/TEXTORO/presets/box/
```

---

## 📋 الهيكل الكامل

```json
{
  "name": "اسم البريست",
  "icon": "📦",
  "category": "box",
  "description": "وصف اختياري",
  "builtin": false,
  "author": "اسمك",
  "created": "2024-12-20T00:00:00Z",
  "values": {
    // === الحشو (Padding) ===
    "paddingLeft": 20,
    "paddingRight": 20,
    "paddingTop": 10,
    "paddingBottom": 10,
    
    // === الزوايا (Corners) ===
    "use4Corners": false,
    "cornerRadius": 8,
    "cornerTL": 8,
    "cornerTR": 8,
    "cornerBR": 8,
    "cornerBL": 8,
    
    // === الحدود (Stroke) ===
    "strokeWidth": 2,
    "strokeOpacity": 100,
    "strokeColor": "#FFFFFF",
    "strokeDash": 0,
    "strokeGap": 0,
    
    // === التعبئة (Fill) ===
    "fillOpacity": 80,
    "fillColor": "#000000",
    
    // === القص (Trim) ===
    "trimStart": 0,
    "trimEnd": 100,
    "trimOffset": 0,
    
    // === إزاحة المسار ===
    "pathOffset": 0,
    
    // === لون النص ===
    "applyTextColor": false,
    "textColor": "#FFFFFF",
    
    // === قفل الحجم ===
    "lockBoxSize": true
  }
}
```

---

## 📖 شرح الخصائص

### الحشو (Padding)

| الخاصية | النوع | النطاق | الوصف |
|---------|-------|--------|-------|
| `paddingLeft` | number | 0-200 | الحشو من اليسار |
| `paddingRight` | number | 0-200 | الحشو من اليمين |
| `paddingTop` | number | 0-200 | الحشو من الأعلى |
| `paddingBottom` | number | 0-200 | الحشو من الأسفل |

### الزوايا (Corners)

| الخاصية | النوع | النطاق | الوصف |
|---------|-------|--------|-------|
| `use4Corners` | boolean | true/false | استخدام 4 زوايا مختلفة |
| `cornerRadius` | number | 0-500 | نصف قطر الزوايا (موحد) |
| `cornerTL` | number | 0-500 | الزاوية العلوية اليسرى |
| `cornerTR` | number | 0-500 | الزاوية العلوية اليمنى |
| `cornerBR` | number | 0-500 | الزاوية السفلية اليمنى |
| `cornerBL` | number | 0-500 | الزاوية السفلية اليسرى |

### الحدود (Stroke)

| الخاصية | النوع | النطاق | الوصف |
|---------|-------|--------|-------|
| `strokeWidth` | number | 0-50 | سمك الحدود |
| `strokeOpacity` | number | 0-100 | شفافية الحدود |
| `strokeColor` | string | hex | لون الحدود |
| `strokeDash` | number | 0-100 | طول الشرطة |
| `strokeGap` | number | 0-100 | الفجوة بين الشرطات |

### التعبئة (Fill)

| الخاصية | النوع | النطاق | الوصف |
|---------|-------|--------|-------|
| `fillOpacity` | number | 0-100 | شفافية التعبئة |
| `fillColor` | string | hex | لون التعبئة |

### القص (Trim)

| الخاصية | النوع | النطاق | الوصف |
|---------|-------|--------|-------|
| `trimStart` | number | 0-100 | بداية القص |
| `trimEnd` | number | 0-100 | نهاية القص |
| `trimOffset` | number | -360 to 360 | إزاحة القص |

### خيارات إضافية

| الخاصية | النوع | الوصف |
|---------|-------|-------|
| `pathOffset` | number | إزاحة المسار |
| `applyTextColor` | boolean | تطبيق لون على النص |
| `textColor` | string | لون النص (hex) |
| `lockBoxSize` | boolean | قفل حجم الصندوق |

---

## 🎯 أمثلة جاهزة

### 1. صندوق بسيط أسود
```json
{
  "name": "Simple Black",
  "icon": "⬛",
  "category": "box",
  "builtin": false,
  "values": {
    "paddingLeft": 20,
    "paddingRight": 20,
    "paddingTop": 10,
    "paddingBottom": 10,
    "use4Corners": false,
    "cornerRadius": 0,
    "strokeWidth": 0,
    "strokeOpacity": 0,
    "strokeColor": "#000000",
    "fillOpacity": 90,
    "fillColor": "#000000",
    "trimStart": 0,
    "trimEnd": 100,
    "lockBoxSize": true
  }
}
```

### 2. صندوق مستدير ملون
```json
{
  "name": "Rounded Blue",
  "icon": "🔵",
  "category": "box",
  "builtin": false,
  "values": {
    "paddingLeft": 25,
    "paddingRight": 25,
    "paddingTop": 15,
    "paddingBottom": 15,
    "use4Corners": false,
    "cornerRadius": 20,
    "strokeWidth": 3,
    "strokeOpacity": 100,
    "strokeColor": "#00AAFF",
    "fillOpacity": 70,
    "fillColor": "#001133",
    "trimStart": 0,
    "trimEnd": 100,
    "lockBoxSize": true
  }
}
```

### 3. إطار فقط (بدون تعبئة)
```json
{
  "name": "Outline Only",
  "icon": "⬜",
  "category": "box",
  "builtin": false,
  "values": {
    "paddingLeft": 15,
    "paddingRight": 15,
    "paddingTop": 8,
    "paddingBottom": 8,
    "use4Corners": false,
    "cornerRadius": 5,
    "strokeWidth": 2,
    "strokeOpacity": 100,
    "strokeColor": "#FFFFFF",
    "fillOpacity": 0,
    "fillColor": "#000000",
    "trimStart": 0,
    "trimEnd": 100,
    "lockBoxSize": true
  }
}
```

### 4. صندوق بزوايا مختلفة
```json
{
  "name": "Mixed Corners",
  "icon": "💠",
  "category": "box",
  "builtin": false,
  "values": {
    "paddingLeft": 20,
    "paddingRight": 20,
    "paddingTop": 12,
    "paddingBottom": 12,
    "use4Corners": true,
    "cornerTL": 20,
    "cornerTR": 0,
    "cornerBR": 20,
    "cornerBL": 0,
    "strokeWidth": 2,
    "strokeOpacity": 100,
    "strokeColor": "#FF6600",
    "fillOpacity": 85,
    "fillColor": "#1a0a00",
    "trimStart": 0,
    "trimEnd": 100,
    "lockBoxSize": true
  }
}
```

### 5. صندوق متقطع
```json
{
  "name": "Dashed Border",
  "icon": "🔲",
  "category": "box",
  "builtin": false,
  "values": {
    "paddingLeft": 18,
    "paddingRight": 18,
    "paddingTop": 10,
    "paddingBottom": 10,
    "use4Corners": false,
    "cornerRadius": 8,
    "strokeWidth": 2,
    "strokeOpacity": 100,
    "strokeColor": "#AAAAAA",
    "strokeDash": 10,
    "strokeGap": 5,
    "fillOpacity": 50,
    "fillColor": "#222222",
    "trimStart": 0,
    "trimEnd": 100,
    "lockBoxSize": true
  }
}
```

### 6. نيون متوهج
```json
{
  "name": "Neon Glow",
  "icon": "💜",
  "category": "box",
  "builtin": false,
  "values": {
    "paddingLeft": 22,
    "paddingRight": 22,
    "paddingTop": 12,
    "paddingBottom": 12,
    "use4Corners": false,
    "cornerRadius": 12,
    "strokeWidth": 4,
    "strokeOpacity": 100,
    "strokeColor": "#FF00FF",
    "fillOpacity": 20,
    "fillColor": "#FF00FF",
    "trimStart": 0,
    "trimEnd": 100,
    "applyTextColor": true,
    "textColor": "#FF00FF",
    "lockBoxSize": true
  }
}
```

---

## 💡 نصائح

1. **للمظهر الاحترافي**: استخدم `fillOpacity` بين 70-90
2. **للزوايا الناعمة**: `cornerRadius` بين 8-15
3. **للحدود الواضحة**: `strokeWidth` بين 2-4
4. **للشفافية**: اجعل `fillOpacity` منخفضاً (20-50)

---

## 🎨 ألوان شائعة

```
أسود:     #000000
أبيض:     #FFFFFF
رمادي:    #808080
أحمر:     #FF0000
أخضر:     #00FF00
أزرق:     #0000FF
سماوي:    #00FFFF
بنفسجي:   #FF00FF
أصفر:     #FFFF00
برتقالي:  #FF6600
```

---

## ⚠️ أخطاء شائعة

| الخطأ | السبب | الحل |
|-------|-------|------|
| الصندوق لا يظهر | `fillOpacity: 0` و `strokeWidth: 0` | زد أحدهما |
| الزوايا لا تعمل | `use4Corners: false` | فعّلها لاستخدام زوايا مختلفة |
| اللون خاطئ | صيغة hex خاطئة | استخدم `#RRGGBB` |
