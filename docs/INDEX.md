# 📚 TEXTORO Documentation Index

> **Version**: 3.4.0 | **Last Updated**: December 27, 2024

---

## 🗂️ Documentation Structure

```
docs/
├── 📋 INDEX.md                 ← أنت هنا
├── 📐 ARCHITECTURE.md          ← هيكل النظام الكامل
├── 🔧 API_REFERENCE.md         ← مرجع الدوال والاستخدام
├── 📖 TECHNICAL_ANALYSIS.md    ← تحليل الكود
├── 🎭 EXPRESSIONS_REFERENCE.md ← دليل التعبيرات
├── 📝 FUNCTIONS_REFERENCE.md   ← مرجع دوال Host
├── 🔗 UI_HOST_CONTRACT.md      ← التواصل بين UI و Backend
├── 🐛 TROUBLESHOOTING.md       ← حل المشاكل
├── 💡 EXAMPLES.md              ← أمثلة الاستخدام
├── 🚀 FUTURE_IDEAS.md          ← خارطة الطريق
├── 🏗️ MODULAR_ARCHITECTURE.md  ← دليل الوحدات
├── 🎬 MOTION_TAB_FEATURES.md   ← دليل نظام Motion
├── 🏷️ MARKERS_TAB_FEATURES.md  ← دليل نظام Markers
├── 📊 PRESETS_ANALYSIS.md      ← تحليل نظام البريسات
└── presets/
    ├── README.md               ← نظرة عامة على البريسات
    ├── TORO.md                 ← دليل قوالب TORO
    ├── TYPE_PRESETS.md         ← بريسات Typewriter
    ├── BOX_PRESETS.md          ← بريسات Box
    ├── MIX_PRESETS.md          ← بريسات Mix
    └── MOTION_PRESETS.md       ← بريسات Motion
```

---

## 📖 التنقل السريع

### للمستخدمين

| المستند | الوصف | متى تقرأه |
|---------|-------|-----------|
| [README.md](../README.md) | نظرة عامة | أول استخدام |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | حل المشاكل | عند حدوث مشكلة |
| [EXAMPLES.md](EXAMPLES.md) | أمثلة عملية | تعلم سير العمل |
| [presets/README.md](presets/README.md) | دليل البريسات | إنشاء بريسات |

### للمطورين

| المستند | الوصف | متى تقرأه |
|---------|-------|-----------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | هيكل النظام | فهم الكود |
| [API_REFERENCE.md](API_REFERENCE.md) | مرجع الدوال | تطوير ميزات |
| [MODULAR_ARCHITECTURE.md](MODULAR_ARCHITECTURE.md) | نظام الوحدات | إضافة وحدات |
| [UI_HOST_CONTRACT.md](UI_HOST_CONTRACT.md) | التواصل | تكامل UI/Host |
| [PRESETS_ANALYSIS.md](PRESETS_ANALYSIS.md) | تحليل البريسات | فهم نظام البريسات |

---

## 🏗️ نظرة عامة على الهيكل

```
┌─────────────────────────────────────────────────────────────────┐
│                        TEXTORO v3.4.0                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐ │
│  │   UI Layer  │───▶│   Bridge    │───▶│    Host Layer       │ │
│  │  (HTML/JS)  │    │(CSInterface)│    │   (ExtendScript)    │ │
│  └─────────────┘    └─────────────┘    └─────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    11 HOST MODULES                       │   │
│  │  Config │ Utilities │ ExpressionLoader │ TypewriterMgr  │   │
│  │  BoxMgr │ MultiLinesMgr │ SogaMgr │ LayerOperations     │   │
│  │  PresetManager │ ImportExport │ MotionManager           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    25 PRESETS (JSON)                     │   │
│  │  Type(4) │ Box(4) │ Motion(12) │ Mix(3) │ Toro(2)       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 إحصائيات المشروع

| المقياس | القيمة |
|---------|--------|
| إجمالي الملفات | ~120 |
| الحجم الكلي | ~1.5 MB |
| وحدات Host | 11 |
| دوال Host | 170+ |
| إصدارات التعبيرات | 4 |
| فئات البريسات | 5 |
| إجمالي البريسات | 25 |
| أسطر الكود (Host) | ~7,000 |
| أسطر الكود (UI) | ~5,500 |

---

## 📦 نظام البريسات (v3.4.0)

جميع البريسات الآن موحدة في ملفات JSON:

| الفئة | العدد | الوصف |
|-------|-------|-------|
| **Type** | 4 | Classic, Fast, No Cursor, Word by Word |
| **Box** | 4 | Rounded Blue, Solid Dark, Outline White, Sharp Corners |
| **Motion** | 12 | Fade, Up, Down, Left, Right, Pop, Zoom, Spin, Drop, Bounce, Flip, Rise |
| **Mix** | 3 | Blue Rounded, Dark Modern, Outline Clean |
| **TORO** | 2 | Complete Dark, Slide Up Blue |

📁 **المسار:** `TEXTORO/config/presets/`

---

## 🔄 سجل الإصدارات

| الإصدار | التاريخ | أبرز التغييرات |
|---------|---------|----------------|
| **3.4.0** | Dec 27, 2024 | توحيد البريسات في JSON، إصلاح المودال |
| 3.3.0 | Dec 25, 2024 | إصلاح 4 Corners، تحسين Soga |
| 3.2.1 | Dec 24, 2024 | إصلاحات Motion، دعم Multi-layer |
| 3.2.0 | Dec 23, 2024 | الهيكل المعياري |
| 3.1.0 | Dec 15, 2024 | Soga, Motion, Presets Hub |
| 3.0.0 | Dec 01, 2024 | إعادة كتابة شاملة |

راجع [CHANGELOG.md](../CHANGELOG.md) للتفاصيل الكاملة.

---

## 🔗 موارد خارجية

- [Adobe CEP Documentation](https://github.com/Adobe-CEP/CEP-Resources)
- [ExtendScript Reference](https://extendscript.docsforadobe.dev/)
- [After Effects Scripting Guide](https://ae-scripting.docsforadobe.dev/)

---

<div align="center">

**TEXTORO** - Professional Text Animation for After Effects

*Built with ❤️ for Motion Designers*

</div>
