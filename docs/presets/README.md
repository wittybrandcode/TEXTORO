# 📦 TEXTORO Presets System

> **Version**: 3.4.0 | **Last Updated**: December 27, 2024

---

## 🎯 نظرة عامة

نظام البريسات في TEXTORO يعتمد بالكامل على ملفات JSON. لإضافة بريست جديد:

1. أنشئ ملف `.json`
2. ضعه في المجلد الصحيح
3. البريست يظهر تلقائياً! 🎉

**لا حاجة لتعديل أي كود.**

---

## 📊 البريسات المتوفرة (25)

| الفئة | العدد | الملفات |
|-------|-------|---------|
| **Type** | 4 | classic, fast, no-cursor, word-by-word |
| **Box** | 4 | rounded-blue, solid-dark, outline-white, sharp-corners |
| **Motion** | 12 | fade, up, down, left, right, pop, zoom, spin, drop, bounce, flip, rise |
| **Mix** | 3 | blue-rounded, dark-modern, outline-clean |
| **TORO** | 2 | complete-dark, slide-up-blue |

---

## 📁 هيكل المجلدات

### البريسات المدمجة
```
TEXTORO/config/presets/
├── type/      ← بريسات الكتابة
├── box/       ← بريسات الصندوق
├── motion/    ← بريسات الحركة (12 بريست)
├── mix/       ← بريسات مدمجة
└── toro/      ← قوالب شاملة
```

### البريسات المخصصة
```
Windows: %APPDATA%\TEXTORO\presets\
Mac: ~/Library/Application Support/TEXTORO/presets/
```

---

## 📋 أنواع البريسات

| النوع | المجلد | الوصف |
|-------|--------|-------|
| **🐂 Toro** | `toro/` | قوالب شاملة (Type + Box + Motion) |
| **⌨️ Type** | `type/` | تأثير الآلة الكاتبة والمؤشر |
| **📦 Box** | `box/` | الصندوق المحيط بالنص |
| **🎨 Mix** | `mix/` | دمج Type + Box معاً |
| **🎬 Motion** | `motion/` | حركة الدخول والخروج |

---

## 📖 الأدلة التفصيلية

- [🐂 دليل TORO Templates](./TORO.md)
- [📝 دليل Type Presets](./TYPE_PRESETS.md)
- [📦 دليل Box Presets](./BOX_PRESETS.md)
- [🎨 دليل Mix Presets](./MIX_PRESETS.md)
- [🎬 دليل Motion Presets](./MOTION_PRESETS.md)

---

## ⚡ البدء السريع

### مثال: إنشاء Motion Preset

```json
{
  "name": "My Slide",
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
    "posFromY": -60,
    "posToX": 0,
    "posToY": 0,
    "animateOpacity": true,
    "opacityFrom": 0,
    "opacityTo": 100,
    "easingType": 1,
    "easingStrength": 100
  }
}
```

احفظ الملف كـ `my-slide.json` في مجلد `motion/`.

---

## 📋 هيكل ملف البريست

```json
{
  "name": "اسم البريست",
  "icon": "🎬",
  "category": "motion",
  "description": "وصف اختياري",
  "builtin": false,
  "values": {
    // القيم حسب الفئة
  }
}
```

### الحقول المطلوبة
| الحقل | النوع | الوصف |
|-------|-------|-------|
| `name` | string | اسم البريست |
| `category` | string | type, box, motion, mix, toro |
| `values` | object | القيم |

### الحقول الاختيارية
| الحقل | النوع | الوصف |
|-------|-------|-------|
| `icon` | string | أيقونة emoji |
| `description` | string | وصف |
| `builtin` | boolean | مدمج أم لا |
| `author` | string | اسم المؤلف |
| `created` | string | تاريخ ISO |

---

## 🔄 تحديث البريسات

- البريسات تُحمّل تلقائياً عند فتح اللوحة
- لتحديث فوري: اضغط زر 🔄 Refresh في تبويب Presets

---

## ⚠️ قواعد مهمة

1. **اسم الملف**: استخدم الإنجليزية فقط مع `-` بدلاً من المسافات
   - ✅ `my-preset.json`
   - ❌ `بريستي.json`

2. **الترميز**: احفظ الملف بترميز UTF-8

3. **JSON صحيح**: تأكد من صحة بنية JSON

4. **الحقول المطلوبة**: `name`, `category`, `values`

---

## 🎨 الأيقونات المقترحة

```
Toro:    🐂 🎯 ⭐ 🏆 💎 🚀
Type:    ⌨️ ⚡ 🐢 📝 👻 ✨
Box:     📦 🔵 ⬛ ⬜ 📐 💠
Mix:     🎨 🎭 🌟 🔮 💼
Motion:  🎬 ⬆️ ⬇️ ⬅️ ➡️ 💥 🔄 🏀 🌫️ 🔍 🔃 🌅
```

---

## 🆘 استكشاف الأخطاء

| المشكلة | الحل |
|---------|------|
| البريست لا يظهر | تأكد من صحة JSON وموقع الملف |
| خطأ عند التطبيق | تحقق من أسماء الخصائص |
| القيم لا تعمل | راجع النطاقات المسموحة |

---

*TEXTORO v3.4.0 - December 2024*
