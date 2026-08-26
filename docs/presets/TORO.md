# 🐂 TORO - Complete Templates

> **TORO** = **T**ype + B**O**x + Motion = الثور الكامل!

TORO هو نظام القوالب الشاملة في TEXTORO. بنقرة واحدة، يتم إنشاء نص كامل مع صندوق وحركة.

## ما هو TORO؟

```
TEXT + TORO = TEXTORO
     ↓
🐂 TORO = Type + Box + Motion
```

TORO يجمع كل عناصر TEXTORO في قالب واحد:
- ⌨️ **Type**: إعدادات الآلة الكاتبة (المؤشر، السرعة، الاتجاه)
- 📦 **Box**: إعدادات الصندوق (الحشو، الزوايا، الألوان)
- 🎬 **Motion**: إعدادات الحركة (الظهور، الاختفاء، التأثيرات)

## القوالب المدمجة

| القالب | الوصف | الاتجاه |
|--------|-------|---------|
| 🐂 Minimal Fade | تصميم بسيط مع ظهور تدريجي | LTR |
| 🐂 Arabic Classic | تصميم عربي كلاسيكي ذهبي | RTL |
| 🐂 Bounce Pop | ظهور مرح مع ارتداد | LTR |
| 🐂 Professional Intro | نص احترافي مع صندوق أزرق | LTR |
| 🐂 Slide Elegant | انزلاق أنيق من اليسار | LTR |

## كيفية الاستخدام

### تطبيق TORO
1. افتح تبويب **Presets**
2. اضغط على زر **🐂 Toro** للفلترة
3. اختر القالب المطلوب
4. اضغط عليه أو على زر ✓
5. سيتم إنشاء نص كامل مع صندوق وحركة!

### حفظ TORO خاص بك
1. أنشئ نص مع Typewriter
2. أضف Box
3. أضف Motion
4. اذهب لتبويب **Presets**
5. اضغط على زر **🐂** في شريط الأدوات
6. أدخل اسم القالب
7. اضغط OK

## بنية ملف TORO

```json
{
  "name": "My TORO",
  "icon": "🐂",
  "category": "toro",
  "description": "وصف القالب",
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
      "noOut": false,
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

## مسارات الملفات

| النوع | المسار |
|-------|--------|
| المدمجة | `TEXTORO/config/presets/toro/` |
| المخصصة | `%APPDATA%/TEXTORO/presets/toro/` |

## الدوال المرتبطة

### Host Functions (index.jsx)
- `applyToro(optsJSON)` - تطبيق قالب TORO
- `getToroValuesForPreset()` - استخراج قيم Type+Box+Motion من الطبقة

### JavaScript Functions (main.js)
- `savePresetFromLayer('toro')` - حفظ TORO من الطبقة المحددة

## نصائح

1. **ابدأ بـ TORO**: إذا كنت جديداً، ابدأ بتطبيق TORO ثم عدّل من Soga
2. **احفظ قوالبك**: بعد إنشاء تصميم تحبه، احفظه كـ TORO للاستخدام لاحقاً
3. **RTL vs LTR**: استخدم Arabic Classic للنصوص العربية

---

*🐂 TORO - أطلق الثور!*
