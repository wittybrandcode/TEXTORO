# TEXTORO - أفكار التحسين المستقبلية
> تاريخ الإنشاء: December 21, 2024 | v3.1.3

---

## 1️⃣ Per-Character Animation (تحريك كل حرف) ⭐ الأهم

**الفكرة**: بدلاً من تحريك الطبقة ككل، تحريك كل حرف بشكل منفصل.

```
الحالي: النص يظهر حرف حرف (Typewriter)
المقترح: كل حرف يظهر مع حركة خاصة (Scale, Rotation, Position)
```

**التنفيذ**: استخدام Text Animators مع Range Selector

```javascript
// مثال: كل حرف يظهر من الأسفل مع Scale
var animator = textLayer.property("ADBE Text Properties")
    .property("ADBE Text Animators").addProperty("ADBE Text Animator");
animator.name = "Char Motion";

var selector = animator.property("ADBE Text Selectors")
    .addProperty("ADBE Text Selector");
// ربط الـ Range بـ Typewriter progress
selector.property("ADBE Text Percent Start").expression = 
    'effect("TW Progress")("Slider")';

var props = animator.property("ADBE Text Animator Properties");
props.addProperty("ADBE Text Position");
props.addProperty("ADBE Text Scale");
```

**الفائدة**: تأثيرات احترافية مثل:
- كل حرف يقفز للأعلى عند الظهور
- كل حرف يدور عند الظهور
- تأثير "Wave" على الحروف

---

## 2️⃣ Typewriter Modes (أوضاع الكتابة)

**الحالي**: وضع واحد (حرف بحرف)

**المقترح**: 4 أوضاع:

| الوضع | الوصف |
|-------|-------|
| `Character` | حرف بحرف (الحالي) |
| `Word` | كلمة بكلمة (موجود جزئياً) |
| `Line` | سطر بسطر |
| `Scramble` | حروف عشوائية ثم تترتب |

**تنفيذ Scramble Mode**:
```javascript
// النص يظهر كحروف عشوائية ثم يترتب تدريجياً
var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZأبتثجحخدذرزسشصضطظعغفقكلمنهوي";
var result = "";
for (var i = 0; i < visibleCount; i++) {
    if (progress > (i / L) * 100 + 10) {
        result += originalText[i]; // الحرف الصحيح
    } else {
        result += chars[Math.floor(random() * chars.length)]; // حرف عشوائي
    }
}
```

---

## 3️⃣ Cursor Styles المتقدمة

**الحالي**: 7 أشكال ثابتة + مخصص

**المقترح**: إضافة:

| الميزة | الوصف |
|--------|-------|
| `Cursor Trail` | ذيل يتبع المؤشر |
| `Cursor Glow` | توهج حول المؤشر |
| `Cursor Scale` | المؤشر يكبر/يصغر مع الكتابة |
| `Cursor Color Shift` | تغيير لون المؤشر تدريجياً |

**تنفيذ Cursor Glow**:
```javascript
// إضافة Glow Animator للمؤشر
var glowAnim = animators.addProperty("ADBE Text Animator");
glowAnim.name = "Cursor Glow";
// ... selector للحرف الأخير فقط
var blur = glowAnim.property("ADBE Text Animator Properties")
    .addProperty("ADBE Text Blur");
blur.expression = 'Math.sin(time * 5) * 3 + 5'; // وميض الـ Glow
```

---

## 4️⃣ Box Animations (تحريك الصندوق)

**الحالي**: الصندوق يتبع حجم النص فقط

**المقترح**: تأثيرات للصندوق:

| التأثير | الوصف |
|---------|-------|
| `Box Reveal` | الصندوق يظهر قبل النص |
| `Box Wipe` | الصندوق يمسح من اتجاه |
| `Box Pulse` | نبض عند اكتمال الكتابة |
| `Box Morph` | تغيير شكل الزوايا تدريجياً |

**تنفيذ Box Reveal**:
```javascript
// Trim Paths مرتبط بـ Typewriter
trimPaths.property("ADBE Vector Trim End").expression = 
    'var p = parent.effect("TW Progress")("Slider");' +
    'var boxLead = 20; // الصندوق يسبق النص بـ 20%' +
    'clamp(p + boxLead, 0, 100);';
```

---

## 5️⃣ Smart Timing (التوقيت الذكي)

**الحالي**: توقيت يدوي بالثواني

**المقترح**: توقيت ذكي:

| الميزة | الوصف |
|--------|-------|
| `Auto Duration` | حساب المدة تلقائياً حسب طول النص |
| `Speed (chars/sec)` | تحديد السرعة بالحروف/ثانية |
| `Sync to Audio` | مزامنة مع الصوت (markers) |
| `Fit to Layer` | ملء مدة الطبقة |

**تنفيذ Auto Duration**:
```javascript
// حساب المدة المثالية: 10 حروف/ثانية
var textLength = originalText.length;
var charsPerSecond = 10;
var optimalDuration = textLength / charsPerSecond;
addSlider(fx, "TW Duration", optimalDuration);
```

---

## 6️⃣ Text Effects (تأثيرات النص)

**المقترح**: تأثيرات مدمجة:

| التأثير | الوصف |
|---------|-------|
| `Blur In` | النص يظهر من ضبابي لواضح |
| `Tracking Expand` | التباعد يتغير أثناء الكتابة |
| `Color Reveal` | لون يتغير من رمادي للون النهائي |
| `Shadow Grow` | ظل يكبر مع الكتابة |

**تنفيذ Blur In**:
```javascript
// Text Animator للـ Blur
var blurAnim = animators.addProperty("ADBE Text Animator");
blurAnim.name = "Blur In";
var blurSelector = blurAnim.property("ADBE Text Selectors")
    .addProperty("ADBE Text Selector");
blurSelector.property("ADBE Text Percent End").expression = 
    'effect("TW Progress")("Slider")';
var blur = blurAnim.property("ADBE Text Animator Properties")
    .addProperty("ADBE Text Blur");
blur.setValue(10); // الحروف غير المكتوبة ضبابية
```

---

## 7️⃣ Multi-Layer Sync (مزامنة الطبقات)

**الحالي**: Stagger بسيط

**المقترح**: أوضاع مزامنة متقدمة:

| الوضع | الوصف |
|-------|-------|
| `Sequential` | واحدة تلو الأخرى (الحالي) |
| `Overlap` | تداخل بنسبة محددة |
| `Cascade` | تأثير الشلال |
| `Random` | ترتيب عشوائي |
| `Reverse` | من الأخير للأول |

---

## 8️⃣ Presets Enhancements (تحسين البريسات)

| الميزة | الوصف |
|--------|-------|
| `Preview Thumbnail` | صورة مصغرة للبريست |
| `Preset Variations` | نسخ مختلفة من نفس البريست |
| `Preset Blending` | دمج بريستين معاً |
| `Quick Apply` | تطبيق بضغطة واحدة بدون نافذة |

---

## 9️⃣ Expression Optimization (تحسين الأداء)

**المشكلة**: الـ Expressions الحالية تُقيّم في كل frame

**الحل**: 
```javascript
// استخدام posterizeTime لتقليل التقييم
posterizeTime(24); // تقييم 24 مرة/ثانية فقط

// أو استخدام valueAtTime للقيم الثابتة
var cachedValue = effect("TW Progress")("Slider").valueAtTime(0);
```

---

## 🔟 RTL Improvements (تحسينات العربية) ⭐⭐⭐

| الميزة | الوصف |
|--------|-------|
| `Smart Direction` | اكتشاف الاتجاه تلقائياً |
| `Mixed Text` | دعم النص المختلط (عربي + إنجليزي) |
| `Arabic Ligatures` | الحفاظ على الاتصال بين الحروف |

**ملاحظة**: هذه الميزة ذات أولوية عالية - راجع ملف منفصل للتفاصيل.

---

## 📊 ترتيب الأولويات

| # | الميزة | الجهد | التأثير | الأولوية |
|---|--------|-------|---------|----------|
| 1 | RTL Improvements | عالي | عالي جداً | ⭐⭐⭐ |
| 2 | Per-Character Animation | عالي | عالي جداً | ⭐⭐⭐ |
| 3 | Typewriter Modes (Scramble) | متوسط | عالي | ⭐⭐⭐ |
| 4 | Box Animations | متوسط | عالي | ⭐⭐ |
| 5 | Smart Timing | منخفض | متوسط | ⭐⭐ |
| 6 | Text Effects (Blur, Tracking) | متوسط | عالي | ⭐⭐ |
| 7 | Cursor Styles المتقدمة | منخفض | متوسط | ⭐ |

---

*TEXTORO Future Ideas - December 2024*
