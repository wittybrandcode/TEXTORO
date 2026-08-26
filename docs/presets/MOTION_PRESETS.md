# 🎬 Motion Presets - دليل بريسات الحركة

> **Version**: 3.4.0 | **Last Updated**: December 27, 2024

---

## 📊 نظرة عامة

Motion Presets تتحكم في حركة دخول وخروج النص. في الإصدار 3.4.0، تم توحيد جميع البريسات في ملفات JSON.

### البريسات المتوفرة (12)

| الاسم | الأيقونة | الوصف | Easing |
|-------|----------|-------|--------|
| **Fade** | 🌫️ | ظهور تدريجي فقط | Ease Out |
| **Up** | ⬆️ | حركة للأعلى | Ease Out |
| **Down** | ⬇️ | حركة للأسفل | Ease Out |
| **Left** | ⬅️ | حركة لليسار | Ease Out |
| **Right** | ➡️ | حركة لليمين | Ease Out |
| **Pop** | 💥 | تكبير مفاجئ | Spring (6) |
| **Zoom** | 🔍 | تكبير تدريجي | Ease Out |
| **Spin** | 🔄 | دوران مع تكبير | Ease Out |
| **Drop** | ⬇️ | سقوط مع ارتداد | Bounce (4) |
| **Bounce** | 🏀 | تكبير مرن | Elastic (5) |
| **Flip** | 🔃 | انقلاب | Spring (6) |
| **Rise** | 🌅 | صعود خفيف | Ease Out |

---

## 📁 موقع الملفات

```
TEXTORO/config/presets/motion/
├── fade.json
├── up.json
├── down.json
├── left.json
├── right.json
├── pop.json
├── zoom.json
├── spin.json
├── drop.json
├── bounce.json
├── flip.json
└── rise.json
```

---

## 📋 الهيكل الكامل

```json
{
  "name": "اسم البريست",
  "icon": "🎬",
  "category": "motion",
  "description": "وصف اختياري",
  "builtin": true,
  "values": {
    // === التوقيت ===
    "inStart": 0,
    "inEnd": 0.6,
    "outEnable": true,
    "outStart": 4.0,
    "outEnd": 4.6,
    "syncMode": 0,
    
    // === الموقع (Position) ===
    "animatePosition": true,
    "posFromX": 0,
    "posFromY": 50,
    "posToX": 0,
    "posToY": 0,
    "posLinkMode": 0,
    "posOutFromX": 0,
    "posOutFromY": 0,
    "posOutToX": 0,
    "posOutToY": -50,
    
    // === الحجم (Scale) ===
    "animateScale": false,
    "scaleFrom": 100,
    "scaleTo": 100,
    "scaleLinkMode": 0,
    "scaleOutFrom": 100,
    "scaleOutTo": 100,
    
    // === الدوران (Rotation) ===
    "animateRotation": false,
    "rotFrom": 0,
    "rotTo": 0,
    "rotLinkMode": 0,
    "rotOutFrom": 0,
    "rotOutTo": 0,
    
    // === الشفافية (Opacity) ===
    "animateOpacity": true,
    "opacityFrom": 0,
    "opacityTo": 100,
    "opacityLinkMode": 0,
    "opacityOutFrom": 100,
    "opacityOutTo": 0,
    
    // === التسهيل (Easing) ===
    "easingType": 1,
    "easingStrength": 100
  }
}
```

---

## 📖 شرح الخصائص

### التوقيت (Timing)

| الخاصية | النوع | النطاق | الوصف |
|---------|-------|--------|-------|
| `inStart` | number | 0+ | وقت بداية الدخول (ثواني) |
| `inEnd` | number | 0+ | وقت نهاية الدخول |
| `outEnable` | boolean | - | تفعيل حركة الخروج |
| `outStart` | number | 0+ | وقت بداية الخروج |
| `outEnd` | number | 0+ | وقت نهاية الخروج |
| `syncMode` | number | 0/1 | وضع المزامنة |

### الموقع (Position)

| الخاصية | النوع | النطاق | الوصف |
|---------|-------|--------|-------|
| `animatePosition` | boolean | - | تفعيل حركة الموقع |
| `posFromX` | number | -500 to 500 | الإزاحة الأفقية البدائية |
| `posFromY` | number | -500 to 500 | الإزاحة الرأسية البدائية |
| `posToX` | number | -500 to 500 | الإزاحة الأفقية النهائية |
| `posToY` | number | -500 to 500 | الإزاحة الرأسية النهائية |
| `posOutFromX/Y` | number | -500 to 500 | إزاحة بداية الخروج |
| `posOutToX/Y` | number | -500 to 500 | إزاحة نهاية الخروج |

### الحجم (Scale)

| الخاصية | النوع | النطاق | الوصف |
|---------|-------|--------|-------|
| `animateScale` | boolean | - | تفعيل حركة الحجم |
| `scaleFrom` | number | 0-200 | الحجم البدائي (%) |
| `scaleTo` | number | 0-200 | الحجم النهائي (%) |
| `scaleOutFrom/To` | number | 0-200 | حجم الخروج |

### الدوران (Rotation)

| الخاصية | النوع | النطاق | الوصف |
|---------|-------|--------|-------|
| `animateRotation` | boolean | - | تفعيل حركة الدوران |
| `rotFrom` | number | -360 to 360 | الدوران البدائي (درجات) |
| `rotTo` | number | -360 to 360 | الدوران النهائي |
| `rotOutFrom/To` | number | -360 to 360 | دوران الخروج |

### الشفافية (Opacity)

| الخاصية | النوع | النطاق | الوصف |
|---------|-------|--------|-------|
| `animateOpacity` | boolean | - | تفعيل حركة الشفافية |
| `opacityFrom` | number | 0-100 | الشفافية البدائية |
| `opacityTo` | number | 0-100 | الشفافية النهائية |
| `opacityOutFrom/To` | number | 0-100 | شفافية الخروج |

### التسهيل (Easing)

| القيمة | النوع | الوصف |
|--------|-------|-------|
| 0 | Linear | خطي (بدون تسهيل) |
| 1 | Ease Out | تباطؤ في النهاية |
| 2 | Ease In | تباطؤ في البداية |
| 3 | Ease In Out | تباطؤ في البداية والنهاية |
| 4 | Bounce | ارتداد |
| 5 | Elastic | مرن |
| 6 | Spring | زنبركي |

---

## 🎯 تفاصيل البريسات المدمجة

### 1. Fade (🌫️)
```json
{
  "animatePosition": false,
  "animateScale": false,
  "animateRotation": false,
  "animateOpacity": true,
  "opacityFrom": 0,
  "opacityTo": 100,
  "easingType": 1
}
```

### 2. Up (⬆️)
```json
{
  "animatePosition": true,
  "posFromX": 0,
  "posFromY": -60,
  "posToX": 0,
  "posToY": 0,
  "animateOpacity": true,
  "easingType": 1
}
```

### 3. Down (⬇️)
```json
{
  "animatePosition": true,
  "posFromX": 0,
  "posFromY": 60,
  "posToX": 0,
  "posToY": 0,
  "animateOpacity": true,
  "easingType": 1
}
```

### 4. Left (⬅️)
```json
{
  "animatePosition": true,
  "posFromX": -100,
  "posFromY": 0,
  "posToX": 0,
  "posToY": 0,
  "animateOpacity": true,
  "easingType": 1
}
```

### 5. Right (➡️)
```json
{
  "animatePosition": true,
  "posFromX": 100,
  "posFromY": 0,
  "posToX": 0,
  "posToY": 0,
  "animateOpacity": true,
  "easingType": 1
}
```

### 6. Pop (💥)
```json
{
  "animateScale": true,
  "scaleFrom": 0,
  "scaleTo": 100,
  "animateOpacity": true,
  "easingType": 6,
  "easingStrength": 120
}
```

### 7. Zoom (🔍)
```json
{
  "animateScale": true,
  "scaleFrom": 50,
  "scaleTo": 100,
  "animateOpacity": true,
  "easingType": 1
}
```

### 8. Spin (🔄)
```json
{
  "animateScale": true,
  "scaleFrom": 0,
  "scaleTo": 100,
  "animateRotation": true,
  "rotFrom": 180,
  "rotTo": 0,
  "animateOpacity": true,
  "easingType": 1
}
```

### 9. Drop (⬇️)
```json
{
  "animatePosition": true,
  "posFromX": 0,
  "posFromY": 100,
  "posToX": 0,
  "posToY": 0,
  "animateOpacity": true,
  "easingType": 4
}
```

### 10. Bounce (🏀)
```json
{
  "animateScale": true,
  "scaleFrom": 0,
  "scaleTo": 100,
  "animateOpacity": true,
  "easingType": 5
}
```

### 11. Flip (🔃)
```json
{
  "animateScale": true,
  "scaleFrom": 0,
  "scaleTo": 100,
  "animateRotation": true,
  "rotFrom": 90,
  "rotTo": 0,
  "animateOpacity": true,
  "easingType": 6
}
```

### 12. Rise (🌅)
```json
{
  "animatePosition": true,
  "posFromX": 0,
  "posFromY": -25,
  "posToX": 0,
  "posToY": 0,
  "animateScale": true,
  "scaleFrom": 95,
  "scaleTo": 100,
  "animateOpacity": true,
  "easingType": 1
}
```

---

## 💡 نصائح للتصميم

### اختيار التسهيل المناسب
- **Ease Out (1)**: للدخول الطبيعي
- **Ease In (2)**: للخروج الطبيعي
- **Bounce (4)**: للحركات المرحة
- **Elastic (5)**: للحركات الديناميكية
- **Spring (6)**: للحركات الواقعية

### التوقيت
- **دخول سريع**: 0.5-0.8 ثانية
- **دخول متوسط**: 0.8-1.2 ثانية
- **دخول بطيء**: 1.5+ ثانية

### الجمع بين الخصائص
- Position + Opacity = انزلاق مع تلاشي
- Scale + Opacity = تكبير مع ظهور
- Rotation + Scale = دوران مع تكبير

---

## ⚠️ أخطاء شائعة

| الخطأ | السبب | الحل |
|-------|-------|------|
| لا حركة | جميع `animate*: false` | فعّل خاصية واحدة على الأقل |
| حركة مفاجئة | `easingType: 0` | استخدم 1 أو 3 |
| الخروج لا يعمل | `outEnable: false` | غيّرها لـ `true` |

---

*TEXTORO v3.4.0 - December 2024*
