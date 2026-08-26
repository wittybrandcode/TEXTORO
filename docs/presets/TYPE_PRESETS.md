# 📝 Type Presets - دليل بريسات الكتابة

## نظرة عامة

Type Presets تتحكم في تأثير الآلة الكاتبة (Typewriter) والمؤشر (Cursor).

---

## 📁 موقع الملفات

```
%APPDATA%/TEXTORO/presets/type/
```

---

## 📋 الهيكل الكامل

```json
{
  "name": "اسم البريست",
  "icon": "⚡",
  "category": "type",
  "description": "وصف اختياري",
  "builtin": false,
  "author": "اسمك",
  "created": "2024-12-20T00:00:00Z",
  "values": {
    // === التوقيت ===
    "inStart": 0,
    "inEnd": 2.0,
    "outStart": null,
    "outEnd": null,
    "blinkStart": 2.01,
    "blinkEnd": 4.0,
    
    // === الكتابة ===
    "twAuto": true,
    "twReverse": false,
    "randomSpeed": 0,
    
    // === المؤشر ===
    "showCursor": true,
    "cursorBefore": false,
    "cursorColor": [1, 1, 1],
    "cursorSpacing": 0,
    "blinkSpeed": 4,
    "blinkInHold": true,
    
    // === الاتجاه ===
    "boxRTL": false
  }
}
```

---

## 📖 شرح الخصائص

### التوقيت (Timing)

| الخاصية | النوع | النطاق | الوصف |
|---------|-------|--------|-------|
| `inStart` | number | 0+ | وقت بداية ظهور النص (ثواني) |
| `inEnd` | number | 0+ | وقت نهاية ظهور النص |
| `outStart` | number/null | 0+ أو null | وقت بداية اختفاء النص (null = بدون اختفاء) |
| `outEnd` | number/null | 0+ أو null | وقت نهاية اختفاء النص |
| `blinkStart` | number | 0+ | وقت بداية وميض المؤشر |
| `blinkEnd` | number | 0+ | وقت نهاية وميض المؤشر |

### الكتابة (Typewriter)

| الخاصية | النوع | القيم | الوصف |
|---------|-------|-------|-------|
| `twAuto` | boolean | true/false | تشغيل تلقائي للكتابة |
| `twReverse` | boolean | true/false | وضع الحذف (من النهاية للبداية) |
| `randomSpeed` | number | 0-100 | سرعة عشوائية للكتابة |

### المؤشر (Cursor)

| الخاصية | النوع | القيم | الوصف |
|---------|-------|-------|-------|
| `showCursor` | boolean | true/false | إظهار المؤشر |
| `cursorBefore` | boolean | true/false | المؤشر قبل النص (للعربية) |
| `cursorColor` | array | [R, G, B] | لون المؤشر (0-1 لكل قناة) |
| `cursorSpacing` | number | 0-50 | المسافة بين المؤشر والنص |
| `blinkSpeed` | number | 1-10 | سرعة الوميض |
| `blinkInHold` | boolean | true/false | الوميض أثناء الثبات |

### الاتجاه

| الخاصية | النوع | القيم | الوصف |
|---------|-------|-------|-------|
| `boxRTL` | boolean | true/false | اتجاه من اليمين لليسار |

---

## 🎯 أمثلة جاهزة

### 1. كتابة سريعة
```json
{
  "name": "Super Fast",
  "icon": "⚡",
  "category": "type",
  "builtin": false,
  "values": {
    "twAuto": true,
    "twReverse": false,
    "randomSpeed": 50,
    "showCursor": true,
    "cursorBefore": false,
    "cursorColor": [1, 1, 0],
    "cursorSpacing": 2,
    "blinkSpeed": 6,
    "blinkInHold": true,
    "inStart": 0,
    "inEnd": 0.5,
    "outStart": null,
    "outEnd": null,
    "blinkStart": 0.51,
    "blinkEnd": 2.0
  }
}
```

### 2. كتابة بطيئة درامية
```json
{
  "name": "Dramatic Slow",
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
    "cursorSpacing": 0,
    "blinkSpeed": 2,
    "blinkInHold": true,
    "inStart": 0,
    "inEnd": 5.0,
    "outStart": 6.0,
    "outEnd": 8.0,
    "blinkStart": 5.01,
    "blinkEnd": 6.0
  }
}
```

### 3. كتابة عربية
```json
{
  "name": "Arabic Type",
  "icon": "🔤",
  "category": "type",
  "builtin": false,
  "values": {
    "twAuto": true,
    "twReverse": false,
    "randomSpeed": 20,
    "showCursor": true,
    "cursorBefore": true,
    "cursorColor": [0, 1, 0.5],
    "cursorSpacing": 5,
    "blinkSpeed": 4,
    "blinkInHold": true,
    "boxRTL": true,
    "inStart": 0,
    "inEnd": 2.0,
    "outStart": null,
    "outEnd": null
  }
}
```

### 4. وضع الحذف
```json
{
  "name": "Delete Mode",
  "icon": "🗑️",
  "category": "type",
  "builtin": false,
  "values": {
    "twAuto": true,
    "twReverse": true,
    "randomSpeed": 30,
    "showCursor": true,
    "cursorBefore": false,
    "cursorColor": [1, 0, 0],
    "cursorSpacing": 0,
    "blinkSpeed": 8,
    "blinkInHold": false,
    "inStart": 0,
    "inEnd": 2.0,
    "outStart": null,
    "outEnd": null
  }
}
```

---

## 💡 نصائح

1. **للكتابة السريعة**: اجعل `inEnd - inStart` صغيراً (0.5-1 ثانية)
2. **للكتابة الطبيعية**: أضف `randomSpeed` بين 20-40
3. **للعربية**: فعّل `cursorBefore` و `boxRTL`
4. **للوميض الواضح**: استخدم `blinkSpeed` بين 3-5

---

## ⚠️ أخطاء شائعة

| الخطأ | السبب | الحل |
|-------|-------|------|
| المؤشر لا يظهر | `showCursor: false` | غيّرها لـ `true` |
| الكتابة لا تبدأ | `twAuto: false` | غيّرها لـ `true` |
| اللون خاطئ | قيم خارج 0-1 | استخدم قيم بين 0 و 1 |
