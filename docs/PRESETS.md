# 📦 TEXTORO Presets System

> **Version**: 3.4.0 | **Last Updated**: December 27, 2024

---

## 🎯 نظرة عامة

نظام البريسات في TEXTORO يعتمد بالكامل على ملفات JSON. جميع البريسات (25 بريست) موحدة في مجلد واحد.

---

## 📊 إحصائيات البريسات

| الفئة | العدد | الأيقونة | الوصف |
|-------|-------|----------|-------|
| **Type** | 4 | ⌨️ | إعدادات الآلة الكاتبة |
| **Box** | 4 | 📦 | إعدادات الصندوق |
| **Motion** | 12 | 🎬 | حركات الدخول والخروج |
| **Mix** | 3 | 🎨 | دمج Type + Box |
| **TORO** | 2 | 🐂 | القالب الشامل |
| **المجموع** | **25** | | |

---

## 📁 هيكل المجلدات

```
TEXTORO/config/presets/
├── _schema.json      ← مخطط البيانات
├── type/
│   ├── classic.json
│   ├── fast.json
│   ├── no-cursor.json
│   └── word-by-word.json
├── box/
│   ├── rounded-blue.json
│   ├── solid-dark.json
│   ├── outline-white.json
│   └── sharp-corners.json
├── motion/
│   ├── fade.json
│   ├── up.json
│   ├── down.json
│   ├── left.json
│   ├── right.json
│   ├── pop.json
│   ├── zoom.json
│   ├── spin.json
│   ├── drop.json
│   ├── bounce.json
│   ├── flip.json
│   └── rise.json
├── mix/
│   ├── blue-rounded.json
│   ├── dark-modern.json
│   └── outline-clean.json
└── toro/
    ├── complete-dark.json
    └── slide-up-blue.json
```

---

## 🔗 الأدلة التفصيلية

| الدليل | الوصف |
|--------|-------|
| [📖 Getting Started](./presets/README.md) | دليل البدء السريع |
| [🐂 TORO Templates](./presets/TORO.md) | القوالب الشاملة |
| [📝 Type Presets](./presets/TYPE_PRESETS.md) | بريسات الكتابة |
| [📦 Box Presets](./presets/BOX_PRESETS.md) | بريسات الصندوق |
| [🎬 Motion Presets](./presets/MOTION_PRESETS.md) | بريسات الحركة |
| [🎨 Mix Presets](./presets/MIX_PRESETS.md) | البريسات المدمجة |

---

## ⚡ البدء السريع

### 1. تطبيق بريست
1. افتح تبويب **Presets** في TEXTORO
2. اختر الفئة (Type, Box, Motion, Mix, Toro)
3. اضغط على البريست لتطبيقه

### 2. حفظ بريست جديد
1. اضبط الإعدادات في التبويب المناسب
2. اضغط زر **Save** 💾
3. أدخل الاسم والأيقونة
4. البريست يُحفظ تلقائياً!

### 3. حذف بريست
1. اضغط بزر الماوس الأيمن على البريست
2. اختر **Delete**
3. أكد الحذف

---

## 📋 هيكل ملف البريست

```json
{
  "name": "اسم البريست",
  "icon": "🎬",
  "category": "motion",
  "description": "وصف اختياري",
  "builtin": true,
  "values": {
    // القيم حسب الفئة
  }
}
```

### الحقول المطلوبة
- `name` - اسم البريست (مطلوب)
- `category` - الفئة: type, box, motion, mix, toro (مطلوب)
- `values` - القيم (مطلوب)

### الحقول الاختيارية
- `icon` - أيقونة emoji
- `description` - وصف
- `builtin` - هل هو مدمج (true/false)
- `author` - اسم المؤلف
- `created` - تاريخ الإنشاء

---

## 🎬 بريسات Motion (12)

| الاسم | الأيقونة | الوصف | Easing |
|-------|----------|-------|--------|
| Fade | 🌫️ | ظهور تدريجي | Ease Out |
| Up | ⬆️ | حركة للأعلى | Ease Out |
| Down | ⬇️ | حركة للأسفل | Ease Out |
| Left | ⬅️ | حركة لليسار | Ease Out |
| Right | ➡️ | حركة لليمين | Ease Out |
| Pop | 💥 | تكبير مفاجئ | Spring |
| Zoom | 🔍 | تكبير تدريجي | Ease Out |
| Spin | 🔄 | دوران مع تكبير | Ease Out |
| Drop | ⬇️ | سقوط مع ارتداد | Bounce |
| Bounce | 🏀 | تكبير مرن | Elastic |
| Flip | 🔃 | انقلاب | Spring |
| Rise | 🌅 | صعود خفيف | Ease Out |

---

## ⌨️ بريسات Type (4)

| الاسم | الأيقونة | الوصف |
|-------|----------|-------|
| Classic | ⌨️ | كتابة كلاسيكية مع مؤشر |
| Fast | ⚡ | كتابة سريعة |
| No Cursor | 👻 | بدون مؤشر |
| Word by Word | 📝 | كلمة كلمة |

---

## 📦 بريسات Box (4)

| الاسم | الأيقونة | الوصف |
|-------|----------|-------|
| Rounded Blue | 🔵 | صندوق أزرق مستدير |
| Solid Dark | ⬛ | صندوق داكن صلب |
| Outline White | ⬜ | إطار أبيض فقط |
| Sharp Corners | 📐 | زوايا حادة |

---

## 🎨 بريسات Mix (3)

| الاسم | الأيقونة | الوصف |
|-------|----------|-------|
| Blue Rounded | 🔵 | Type + Box أزرق |
| Dark Modern | 🌑 | Type + Box داكن |
| Outline Clean | ⬜ | Type + Box إطار |

---

## 🐂 بريسات TORO (2)

| الاسم | الأيقونة | الوصف |
|-------|----------|-------|
| Complete Dark | 🐂 | قالب داكن كامل (Type + Box + Motion) |
| Slide Up Blue | 🐂 | قالب أزرق مع حركة صعود |

---

## 📂 مسار البريسات المخصصة

```
Windows: %APPDATA%\TEXTORO\presets\
Mac: ~/Library/Application Support/TEXTORO/presets/
```

---

## ⚠️ قواعد مهمة

1. **اسم الملف**: استخدم الإنجليزية مع `-` بدلاً من المسافات
2. **الترميز**: UTF-8
3. **JSON صحيح**: تأكد من صحة البنية
4. **الحقول المطلوبة**: `name`, `category`, `values`

---

*TEXTORO v3.4.0 - December 2024*
