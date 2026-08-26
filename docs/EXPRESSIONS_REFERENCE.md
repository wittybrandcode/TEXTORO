# TEXTORO - Expressions Reference
> الإصدار: v3.0.0 | آخر تحديث: December 20, 2024

---

## 📋 فهرس الـ Expressions

1. [Typewriter Expressions](#typewriter-expressions)
2. [Cursor Expressions](#cursor-expressions)
3. [Box Expressions](#box-expressions)
4. [Expression Loader](#expression-loader)
5. [Marker System](#marker-system)

---

## هيكل المجلدات

```
host/expressions/
├── _config.json              # إعدادات النسخ النشطة
├── typewriter/
│   └── v1.0/
│       └── sourceText.js     # Expression النص
├── cursor/
│   └── v1.0/
│       ├── range.js          # Range Selector
│       └── blink.js          # Opacity للوميض
└── box/
    └── v1.0/
        ├── size.js           # حجم الصندوق
        ├── position.js       # موضع الصندوق
        ├── path4corners.js   # مسار 4 زوايا
        └── hideWhenEmpty.js  # إخفاء عند الفراغ
```

---

## Typewriter Expressions

### sourceText.js
يتحكم في عرض النص حرفاً بحرف.

**الموقع:** `typewriter/v1.0/sourceText.js`

**يُطبق على:** Text Layer → Source Text

**Effect Controls المطلوبة:**
| Control | النوع | الوصف |
|---------|-------|-------|
| TW Progress | Slider | نسبة التقدم (0-100) |
| TW Auto | Checkbox | تشغيل تلقائي |
| TW Reverse | Checkbox | وضع الحذف |
| Random Speed | Slider | سرعة عشوائية (0-100) |
| Show Cursor | Checkbox | إظهار المؤشر |
| Cursor Before Text | Checkbox | المؤشر قبل النص |
| Cursor Spacing | Slider | المسافة |
| Box RTL | Checkbox | اتجاه من اليمين |

**Markers المطلوبة:**
| Marker | الوصف |
|--------|-------|
| TW_TEXT:... | النص الأصلي |
| IN_START | بداية الظهور |
| IN_END | نهاية الظهور |
| OUT_START | بداية الاختفاء (اختياري) |
| OUT_END | نهاية الاختفاء (اختياري) |

**كيفية العمل:**
1. يقرأ النص من marker `TW_TEXT:`
2. يحسب التقدم بناءً على الوقت أو `TW Progress`
3. يعرض الحروف تدريجياً
4. يضيف المؤشر `|` إذا مفعّل

---

## Cursor Expressions

### range.js
يتحكم في Range Selector للمؤشر.

**الموقع:** `cursor/v1.0/range.js`

**يُطبق على:** Text Animator → Range Selector → Start

**الوظيفة:**
- يحدد موضع المؤشر بناءً على عدد الحروف الظاهرة
- يتبع نفس منطق sourceText

---

### blink.js
يتحكم في وميض المؤشر.

**الموقع:** `cursor/v1.0/blink.js`

**يُطبق على:** Text Animator → Opacity

**Effect Controls المطلوبة:**
| Control | النوع | الوصف |
|---------|-------|-------|
| Blink Speed | Slider | سرعة الوميض |
| Blink In Hold | Checkbox | الوميض في المنتصف |

**Markers المطلوبة:**
| Marker | الوصف |
|--------|-------|
| BLINK_START | بداية الوميض |
| BLINK_END | نهاية الوميض |

**كيفية العمل:**
1. يتحقق من الوقت الحالي
2. إذا كان بين BLINK_START و BLINK_END:
   - يحسب الوميض بناءً على Blink Speed
   - يُرجع 0 أو 100 (مخفي/ظاهر)
3. خارج الفترة: يُرجع 100 (ظاهر دائماً)

---

## Box Expressions

### size.js
يحسب حجم الصندوق بناءً على حجم النص.

**الموقع:** `box/v1.0/size.js`

**يُطبق على:** Shape Layer → Rectangle → Size

**Effect Controls المطلوبة (على طبقة النص):**
| Control | النوع | الوصف |
|---------|-------|-------|
| Padding Left | Slider | الحشو الأيسر |
| Padding Right | Slider | الحشو الأيمن |
| Padding Top | Slider | الحشو العلوي |
| Padding Bottom | Slider | الحشو السفلي |
| Lock Box Size | Checkbox | قفل الحجم |
| Locked Width | Slider | العرض المقفل |
| Locked Height | Slider | الارتفاع المقفل |

**كيفية العمل:**
1. يقرأ sourceRectAtTime من طبقة النص
2. يضيف الـ Padding
3. إذا Lock Box Size مفعّل: يستخدم القيم المقفلة

---

### position.js
يحسب موضع الصندوق ليتمركز حول النص.

**الموقع:** `box/v1.0/position.js`

**يُطبق على:** Shape Layer → Position

**كيفية العمل:**
1. يقرأ sourceRectAtTime من طبقة النص
2. يحسب المركز مع مراعاة الـ Padding
3. يُرجع الموضع الصحيح

---

### path4corners.js
يرسم مسار الصندوق مع 4 زوايا مختلفة.

**الموقع:** `box/v1.0/path4corners.js`

**يُطبق على:** Shape Layer → Path

**Effect Controls المطلوبة:**
| Control | النوع | الوصف |
|---------|-------|-------|
| Corner TL | Slider | الزاوية العلوية اليسرى |
| Corner TR | Slider | الزاوية العلوية اليمنى |
| Corner BL | Slider | الزاوية السفلية اليسرى |
| Corner BR | Slider | الزاوية السفلية اليمنى |
| Path Offset | Slider | توسيع/تقليص المسار |

**كيفية العمل:**
1. يحسب حجم الصندوق
2. يرسم مسار مع bezier curves لكل زاوية
3. يطبق Path Offset إن وُجد

---

### hideWhenEmpty.js
يخفي الصندوق عندما لا يوجد نص.

**الموقع:** `box/v1.0/hideWhenEmpty.js`

**يُطبق على:** Shape Layer → Fill/Stroke Opacity

**كيفية العمل:**
1. يقرأ sourceRectAtTime من طبقة النص
2. إذا العرض أو الارتفاع = 0: يُرجع 0
3. غير ذلك: يُرجع قيمة الـ Opacity الأصلية

---

## Expression Loader

### _config.json
ملف إعدادات النسخ النشطة.

```json
{
  "activeVersions": {
    "typewriter/sourceText": "v1.0",
    "cursor/range": "v1.0",
    "cursor/blink": "v1.0",
    "box/size": "v1.0",
    "box/position": "v1.0",
    "box/path4corners": "v1.0",
    "box/hideWhenEmpty": "v1.0"
  }
}
```

### دوال التحميل

```javascript
// تحميل Expression
var expr = loadExpression("typewriter", "sourceText");
var expr = loadExpression("box", "path4corners", "v1.0");

// مسح الـ cache
clearExpressionCache();

// جلب النسخ المتاحة
var versions = getAvailableVersions("cursor", "blink");

// تعيين النسخة النشطة
setActiveVersion("cursor", "blink", "v1.0");
```

---

## Marker System

### أنواع الـ Markers

| Marker | الوصف | مثال |
|--------|-------|------|
| TW_TEXT:... | النص الأصلي | `TW_TEXT:مرحبا` |
| IN_START | بداية الظهور | @ 0.01s |
| IN_END | نهاية الظهور | @ 2.0s |
| BLINK_START | بداية الوميض | @ 2.01s |
| BLINK_END | نهاية الوميض | @ 4.0s |
| OUT_START | بداية الاختفاء | @ 4.01s |
| OUT_END | نهاية الاختفاء | @ 5.0s |

### ⚠️ قواعد الـ Markers (مهم جداً!)

> **After Effects لا يسمح بـ Markers متعددة في نفس الوقت!**

**الترتيب المطلوب:**
```
TW_TEXT (0) < IN_START < IN_END < BLINK_START < BLINK_END < OUT_START < OUT_END
```

**القواعد:**
1. `inStart >= 0.01` (لا يساوي صفر)
2. `blinkStart > inEnd` (مثال: inEnd=1.0, blinkStart=1.01)
3. `outStart > blinkEnd` (إذا وُجد)
4. الفرق الأدنى = 0.01 ثانية

**مثال صحيح ✅:**
```
TW_TEXT     @ 0.000s
IN_START    @ 0.010s
IN_END      @ 2.000s
BLINK_START @ 2.010s
BLINK_END   @ 4.000s
OUT_START   @ 4.010s
OUT_END     @ 5.000s
```

**مثال خاطئ ❌:**
```
TW_TEXT     @ 0.000s
IN_START    @ 0.000s  ← تطابق!
IN_END      @ 2.000s
BLINK_START @ 2.000s  ← تطابق!
```

📖 **للمزيد:** راجع `MARKER_COLLISION_FIX.md`

---

## كيفية قراءة الـ Markers في Expression

```javascript
// البحث عن marker بالاسم
function getMarkerTime(name) {
    var m = thisLayer.marker;
    for (var i = 1; i <= m.numKeys; i++) {
        if (m.key(i).comment == name) {
            return m.key(i).time;
        }
    }
    return null;
}

// البحث عن marker يبدأ بـ prefix
function getMarkerByPrefix(prefix) {
    var m = thisLayer.marker;
    for (var i = 1; i <= m.numKeys; i++) {
        var c = m.key(i).comment;
        if (c.indexOf(prefix) == 0) {
            return c.substr(prefix.length);
        }
    }
    return null;
}

// استخدام
var inStart = getMarkerTime("IN_START");
var originalText = getMarkerByPrefix("TW_TEXT:");
```

---

## Effect Controls Reference

### Typewriter Controls
```javascript
// على طبقة النص
effect("TW Progress")("Slider")
effect("TW Auto")("Checkbox")
effect("TW Reverse")("Checkbox")
effect("Random Speed")("Slider")
effect("Show Cursor")("Checkbox")
effect("Cursor Before Text")("Checkbox")
effect("Cursor Spacing")("Slider")
effect("Blink Speed")("Slider")
effect("Blink In Hold")("Checkbox")
effect("Box RTL")("Checkbox")
```

### Box Controls
```javascript
// على طبقة النص (يقرأها الصندوق)
effect("Padding Left")("Slider")
effect("Padding Right")("Slider")
effect("Padding Top")("Slider")
effect("Padding Bottom")("Slider")
effect("Corner Radius")("Slider")
// أو 4 Corners
effect("Corner TL")("Slider")
effect("Corner TR")("Slider")
effect("Corner BL")("Slider")
effect("Corner BR")("Slider")
effect("Stroke Width")("Slider")
effect("Stroke Opacity")("Slider")
effect("Stroke Color")("Color")
effect("Fill Opacity")("Slider")
effect("Fill Color")("Color")
effect("Trim Start")("Slider")
effect("Trim End")("Slider")
effect("Trim Offset")("Slider")
effect("Path Offset")("Slider")
effect("Lock Box Size")("Checkbox")
effect("Locked Width")("Slider")
effect("Locked Height")("Slider")
```

---

## إضافة نسخة جديدة

1. أنشئ مجلد جديد: `expressions/{category}/v2.0/`
2. انسخ الملفات من النسخة السابقة
3. عدّل الكود حسب الحاجة
4. حدّث `_config.json` إذا أردت تفعيلها افتراضياً
5. استخدم Settings Panel لتبديل النسخ

---

## Motion Expressions (v2.8.0)

### Position Expression
يتحكم في تحريك الموضع مع دعم Independent OUT.

**يُطبق على:** Transform → Position

**Effect Controls:**
| Control | النوع | الوصف |
|---------|-------|-------|
| Animate Position | Checkbox | تفعيل التحريك |
| Motion In Start | Slider | بداية الدخول |
| Motion In End | Slider | نهاية الدخول |
| Motion Out Start | Slider | بداية الخروج (-1=معطل) |
| Motion Out End | Slider | نهاية الخروج |
| Motion Sync Mode | Slider | 0=يدوي, 1=Typewriter |
| Pos From X/Y | Slider | موضع البداية (IN) |
| Pos To X/Y | Slider | موضع النهاية (IN) |
| Pos Link Mode | Slider | 0=مربوط, 1=مستقل |
| Pos Out From X/Y | Slider | موضع البداية (OUT) |
| Pos Out To X/Y | Slider | موضع النهاية (OUT) |
| Motion Easing Type | Slider | نوع الـ Easing (0-6) |

**كيفية العمل:**
1. يتحقق من `Animate Position`
2. يقرأ التوقيت (يدوي أو من Markers)
3. يتحقق من `Pos Link Mode`:
   - 0: OUT يعكس IN تلقائياً
   - 1: يقرأ قيم OUT المستقلة
4. يطبق الـ Easing على الحركة

---

### Scale Expression
يتحكم في تحريك الحجم مع دعم Independent OUT.

**يُطبق على:** Transform → Scale

**Effect Controls:**
| Control | النوع | الوصف |
|---------|-------|-------|
| Animate Scale | Checkbox | تفعيل التحريك |
| Scale From | Slider | حجم البداية (IN) |
| Scale To | Slider | حجم النهاية (IN) |
| Scale Link Mode | Slider | 0=مربوط, 1=مستقل |
| Scale Out From | Slider | حجم البداية (OUT) |
| Scale Out To | Slider | حجم النهاية (OUT) |

---

### Rotation Expression
يتحكم في تحريك الدوران مع دعم Independent OUT.

**يُطبق على:** Transform → Rotation

**Effect Controls:**
| Control | النوع | الوصف |
|---------|-------|-------|
| Animate Rotation | Checkbox | تفعيل التحريك |
| Rot From | Slider | دوران البداية (IN) |
| Rot To | Slider | دوران النهاية (IN) |
| Rot Link Mode | Slider | 0=مربوط, 1=مستقل |
| Rot Out From | Slider | دوران البداية (OUT) |
| Rot Out To | Slider | دوران النهاية (OUT) |

---

### Opacity Expression
يتحكم في تحريك الشفافية مع دعم Independent OUT.

**يُطبق على:** Transform → Opacity

**Effect Controls:**
| Control | النوع | الوصف |
|---------|-------|-------|
| Animate Opacity | Checkbox | تفعيل التحريك |
| Opacity From | Slider | شفافية البداية (IN) |
| Opacity To | Slider | شفافية النهاية (IN) |
| Opacity Link Mode | Slider | 0=مربوط, 1=مستقل |
| Opacity Out From | Slider | شفافية البداية (OUT) |
| Opacity Out To | Slider | شفافية النهاية (OUT) |

---

### Easing Types

| القيمة | النوع | الوصف |
|--------|-------|-------|
| 0 | Linear | سرعة ثابتة |
| 1 | Ease Out | بداية سريعة، نهاية بطيئة |
| 2 | Ease In | بداية بطيئة، نهاية سريعة |
| 3 | Ease In-Out | بداية ونهاية بطيئة |
| 4 | Bounce | تأثير الارتداد |
| 5 | Elastic | تأثير مطاطي |
| 6 | Back | تجاوز ثم استقرار |

---

**آخر تحديث:** December 19, 2024
