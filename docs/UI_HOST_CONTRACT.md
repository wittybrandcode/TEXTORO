# TEXTORO - UI/Host Contract
## العقد بين الواجهة والـ Backend - دليل إعادة التصميم الآمن

```
╔════════════════════════════════════════════════════════════════════════════╗
║                    TEXTORO UI/Host Contract v2.0                            ║
║                 القوانين الذهبية لإعادة تصميم الواجهة                        ║
╠════════════════════════════════════════════════════════════════════════════╣
║  تاريخ الإنشاء: December 15, 2024                                          ║
║  آخر تحديث: December 17, 2024                                              ║
║  الإصدار: v3.0.0                                                          ║
║  الحالة: 📜 SACRED - لا تُكسر هذه القواعد!                                  ║
╚════════════════════════════════════════════════════════════════════════════╝
```

---

## 📐 البنية المعمارية

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           PRESENTATION LAYER                             │
│                              (الواجهة)                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                      │
│  │ index.html  │  │  style.css  │  │   main.js   │                      │
│  │  (هيكل)     │  │  (تنسيق)    │  │  (تفاعل)    │                      │
│  └─────────────┘  └─────────────┘  └──────┬──────┘                      │
│                                           │                              │
│  🟢 يمكن تغييره بالكامل                   │                              │
└───────────────────────────────────────────┼──────────────────────────────┘
                                            │
                    ════════════════════════╪════════════════════════
                              THE CONTRACT  │  العقد
                              (لا يُكسر!)   │
                    ════════════════════════╪════════════════════════
                                            │
                                            │ runHostScript(funcName, args)
                                            │ JSON ↓↑ JSON
                                            │
┌───────────────────────────────────────────┼──────────────────────────────┐
│                            HOST LAYER                                    │
│                           (المنطق)                                       │
│                                           │                              │
│  ┌────────────────────────────────────────▼─────────────────────────┐   │
│  │                      host/index.jsx                               │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │   │
│  │  │ Typewriter  │  │    Box      │  │   Presets   │  ...          │   │
│  │  │  Functions  │  │  Functions  │  │  Functions  │               │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘               │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  🔴 لا يتأثر بتغييرات الواجهة                                           │
└──────────────────────────────────────────────────────────────────────────┘
                                            │
                                            ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                         AFTER EFFECTS API                                │
│              Layers • Effects • Markers • Expressions                    │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 🔐 القوانين الذهبية

### القانون #1: الاتصال عبر JSON فقط
```javascript
// ✅ صحيح - JSON parameters
runHostScript('applyTypewriter', { direction: "rtl", inStart: 0.01 });

// ❌ خطأ - لا ترسل objects معقدة أو functions
runHostScript('applyTypewriter', someComplexObject);
```

### القانون #2: أسماء الدوال ثابتة
```javascript
// هذه الأسماء مقدسة - لا تغيرها!
'applyTypewriter'
'removeTypewriter'
'createBox'
'removeBox'
// ... إلخ
```

### القانون #3: هيكل الاستجابة موحد
```javascript
// كل دالة ترجع هذا الهيكل
{
    success: true|false,
    message: "...",      // رسالة النجاح
    error: "...",        // رسالة الخطأ (إذا فشل)
    data: { ... }        // البيانات (اختياري)
}
```

### القانون #4: الواجهة لا تعرف شيئاً عن After Effects
```javascript
// ✅ صحيح - الواجهة تجمع القيم فقط
var opts = {
    paddingLeft: document.getElementById('numPadL').value
};
runHostScript('createBox', opts);

// ❌ خطأ - الواجهة لا تتعامل مع AE مباشرة
app.project.activeItem.selectedLayers[0]  // هذا في Host فقط!
```

---

## 📋 API Reference - العقد الكامل

### 1. Typewriter Functions

#### `applyTypewriter(optsJSON)`
```javascript
// INPUT
{
    direction: "ltr" | "rtl",           // اتجاه الكتابة
    customText: string | null,          // نص مخصص (اختياري)
    
    // Timing
    inStart: number,                    // >= 0.01
    inEnd: number,                      // > inStart
    outStart: number | -1,              // > blinkEnd أو -1 لتعطيل
    outEnd: number | -1,                // > outStart أو -1
    noOut: boolean,                     // true = بدون اختفاء
    
    // Cursor
    showCursor: boolean,
    cursorBefore: boolean,
    cursorSpacing: number,              // 0-10
    blinkSpeed: number,                 // 0.5-10
    
    // Blink Timing
    blinkStart: number,                 // > inEnd
    blinkEnd: number,                   // > blinkStart
    blinkInHold: boolean,
    
    // Advanced
    reverse: boolean,
    randomSpeed: number                 // 0-100
}

// OUTPUT
{
    success: true,
    message: "Typewriter applied!"
}
```

#### `removeTypewriter()`
```javascript
// INPUT: none

// OUTPUT
{
    success: true,
    message: "Typewriter removed"
}
```

#### `getLayerText()`
```javascript
// INPUT: none

// OUTPUT
{
    success: true,
    data: "النص من الطبقة"
}
```

#### `updateLayerText(optsJSON)`
```javascript
// INPUT
{
    text: string                        // النص الجديد
}

// OUTPUT
{
    success: true,
    message: "تم تحديث النص"
}
```

#### `applyTypewriterMulti(optsJSON)`
```javascript
// INPUT
{
    layerIndices: number[] | null,      // indices الطبقات (اختياري)
    stagger: number,                    // التأخير بين الطبقات
    // ... باقي خيارات applyTypewriter
}

// OUTPUT
{
    success: true,
    message: "تم تطبيق Typewriter على N طبقات"
}
```

---

### 2. Box Functions

#### `createBox(optsJSON)`
```javascript
// INPUT
{
    // Padding
    paddingLeft: number,                // 0-500
    paddingRight: number,
    paddingTop: number,
    paddingBottom: number,
    
    // Corner
    use4Corners: boolean,
    cornerRadius: number,               // إذا use4Corners = false
    cornerTL: number,                   // إذا use4Corners = true
    cornerTR: number,
    cornerBL: number,
    cornerBR: number,
    
    // Stroke
    strokeWidth: number,                // 0-50
    strokeOpacity: number,              // 0-100
    strokeColor: [r,g,b] | "#hex",      // RGB array أو hex string
    
    // Fill
    fillOpacity: number,                // 0-100
    fillColor: [r,g,b] | "#hex",
    
    // Text Color
    applyTextColor: boolean,
    textColor: [r,g,b] | "#hex",
    
    // Trim
    trimStart: number,                  // 0-100
    trimEnd: number,                    // 0-100
    trimOffset: number,                 // -100 to 100
    
    // Path Offset
    pathOffset: number,                 // -50 to 50
    
    // Options
    lockBoxSize: boolean
}

// OUTPUT
{
    success: true,
    message: "Box created!"
}
```

#### `removeBox()`
```javascript
// INPUT: none

// OUTPUT
{
    success: true,
    message: "Box removed"
}
```

#### `createBoxMulti(optsJSON)`
```javascript
// INPUT
{
    layerIndices: number[] | null,
    // ... باقي خيارات createBox
}

// OUTPUT
{
    success: true,
    message: "تم إنشاء Box لـ N طبقات"
}
```

---

### 3. Multi-lines Functions

#### `splitTextToLayers(optsJSON)`
```javascript
// INPUT
{
    lineSpacing: number,                // 0-200
    alignment: "left" | "center" | "right",
    deleteOriginal: boolean
}

// OUTPUT
{
    success: true,
    data: {
        layers: number[],               // indices الطبقات الجديدة
        count: number                   // عدد الأسطر
    }
}
```

#### `splitAndApply(optsJSON)`
```javascript
// INPUT
{
    // Split options
    lineSpacing: number,
    alignment: string,
    deleteOriginal: boolean,
    
    // What to apply
    applyType: boolean,
    applyBox: boolean,
    
    // Typewriter options (if applyType)
    stagger: number,
    direction: string,
    // ... باقي خيارات Typewriter
    
    // Box options (if applyBox)
    // ... خيارات Box
}

// OUTPUT
{
    success: true,
    message: "تم تقسيم N أسطر + Typewriter + Box",
    data: {
        layersCreated: number
    }
}
```

---

### 4. Soga Functions

#### `getLayerEffectValues()`
```javascript
// INPUT: none

// OUTPUT
{
    success: true,
    data: {
        layerName: string | null,
        hasTypewriter: boolean,
        hasBox: boolean,
        
        typewriter: {                   // إذا hasTypewriter = true
            twProgress: number,
            twAuto: boolean,
            twReverse: boolean,
            randomSpeed: number,
            showCursor: boolean,
            cursorBefore: boolean,
            cursorSpacing: number,
            blinkSpeed: number,
            blinkInHold: boolean,
            boxRTL: boolean
        } | null,
        
        box: {                          // إذا hasBox = true
            paddingLeft: number,
            paddingRight: number,
            paddingTop: number,
            paddingBottom: number,
            use4Corners: boolean,
            cornerRadius: number | null,
            cornerTL: number | null,
            cornerTR: number | null,
            cornerBR: number | null,
            cornerBL: number | null,
            strokeWidth: number,
            strokeOpacity: number,
            strokeColor: [r,g,b],
            fillOpacity: number,
            fillColor: [r,g,b],
            lockBoxSize: boolean
        } | null
    }
}
```

#### `setLayerEffectValues(optsJSON)`
```javascript
// INPUT
{
    typewriter: {                       // اختياري
        twProgress: number,
        twAuto: boolean,
        // ... القيم المراد تغييرها
    },
    box: {                              // اختياري
        paddingLeft: number,
        // ... القيم المراد تغييرها
    }
}

// OUTPUT
{
    success: true,
    message: "Changes applied!"
}
```

#### `setLayerEffectValuesMulti(optsJSON)`
```javascript
// INPUT: نفس setLayerEffectValues

// OUTPUT
{
    success: true,
    message: "Applied to N layers!"
}
```

---

### 5. Preset Functions

#### `getPresetList(optsJSON)`
```javascript
// INPUT
{
    category: "type" | "box" | "mix"
}

// OUTPUT
{
    success: true,
    data: [
        {
            id: string,
            name: string,
            icon: string,
            category: string,
            builtin: boolean
        },
        // ...
    ]
}
```

#### `getAllPresets()`
```javascript
// INPUT: none

// OUTPUT
{
    success: true,
    data: {
        type: [...],
        box: [...],
        mix: [...]
    }
}
```

#### `getPreset(optsJSON)`
```javascript
// INPUT
{
    category: string,
    id: string
}

// OUTPUT
{
    success: true,
    data: {
        id: string,
        name: string,
        icon: string,
        category: string,
        builtin: boolean,
        values: { ... }
    }
}
```

#### `savePreset(optsJSON)`
```javascript
// INPUT
{
    category: "type" | "box" | "mix",
    name: string,
    icon: string,                       // emoji
    values: { ... }                     // القيم حسب الفئة
}

// OUTPUT
{
    success: true,
    message: "Preset saved!",
    data: {
        id: string                      // ID البريست الجديد
    }
}
```

#### `deletePreset(optsJSON)`
```javascript
// INPUT
{
    category: string,
    id: string
}

// OUTPUT
{
    success: true,
    message: "Preset deleted"
}
```

#### `renamePreset(optsJSON)`
```javascript
// INPUT
{
    category: string,
    id: string,
    newName: string
}

// OUTPUT
{
    success: true,
    message: "Preset renamed"
}
```

#### `applyPreset(optsJSON)`
```javascript
// INPUT
{
    category: string,
    id: string
}

// OUTPUT
{
    success: true,
    message: "Preset applied!"
}
```

---

### 6. Selection Functions

#### `getSelectionInfo()`
```javascript
// INPUT: none

// OUTPUT
{
    success: true,
    data: {
        id: string | null,
        name: string | null,
        text: string | null,
        isTextLayer: boolean
    }
}
```

#### `getMultiSelectionInfo()`
```javascript
// INPUT: none

// OUTPUT
{
    success: true,
    data: {
        count: number                   // عدد طبقات النص المحددة
    }
}
```

---

### 7. Settings Functions

#### `getPresetsPath()`
```javascript
// INPUT: none

// OUTPUT
{
    success: true,
    data: {
        settingsFile: string,
        savedPath: string,
        activePath: string,
        builtinPath: string,
        customExists: boolean,
        builtinExists: boolean
    }
}
```

#### `setPresetsPath(optsJSON)`
```javascript
// INPUT
{
    path: string
}

// OUTPUT
{
    success: true,
    message: "Path saved"
}
```

#### `getAvailableVersionsJS(optsJSON)`
```javascript
// INPUT
{
    category: string,
    name: string
}

// OUTPUT
{
    success: true,
    data: ["v1.0", "v2.0", ...]
}
```

#### `setActiveVersionJS(optsJSON)`
```javascript
// INPUT
{
    category: string,
    name: string,
    version: string
}

// OUTPUT
{
    success: true,
    message: "Version set"
}
```

---

### 8. Debug Functions

#### `testExpressionLoader()`
```javascript
// INPUT: none

// OUTPUT
{
    success: true,
    data: {
        path: string,
        pathExists: boolean,
        configLoaded: boolean,
        expressions: { ... }
    }
}
```

#### `debugPreset(optsJSON)`
```javascript
// INPUT
{
    category: string,
    id: string
}

// OUTPUT
{
    success: true,
    data: { ... }                       // معلومات تشخيصية
}
```

---

## 🎨 دليل إعادة التصميم

### ما يمكنك تغييره بحرية

| الملف | ما يمكن تغييره |
|-------|----------------|
| `index.html` | كل شيء: الهيكل، IDs، classes، الترتيب |
| `style.css` | كل شيء: الألوان، الخطوط، التخطيط، الأنيميشن |
| `main.js` | كل شيء ما عدا استدعاءات `runHostScript()` |

### ما يجب الحفاظ عليه

| العنصر | السبب |
|--------|-------|
| أسماء الدوال في `runHostScript()` | الـ Host يتوقع هذه الأسماء |
| هيكل الـ JSON parameters | الـ Host يقرأ هذه الخصائص |
| معالجة `success/error` | الاستجابة موحدة |

### خطوات إعادة التصميم الآمن

```
1. 📋 احتفظ بنسخة من main.js الحالي
   └── للرجوع إلى استدعاءات runHostScript()

2. 🎨 صمم HTML/CSS الجديد
   └── بحرية كاملة

3. 🔗 اكتب main.js الجديد
   └── استخدم نفس استدعاءات runHostScript()
   └── غيّر فقط كيفية جمع القيم من الواجهة

4. ✅ اختبر كل وظيفة
   └── تأكد من أن الـ JSON المرسل صحيح
```

### مثال: تغيير ID عنصر

```javascript
// main.js القديم
var padding = document.getElementById('numPadL').value;

// main.js الجديد (بعد تغيير ID في HTML)
var padding = document.getElementById('padding-left-input').value;

// ✅ لا مشكلة! طالما القيمة تُرسل بنفس الاسم للـ Host
runHostScript('createBox', { paddingLeft: padding });
```

---

## ⚠️ الأخطاء الشائعة

### ❌ خطأ #1: تغيير اسم الدالة
```javascript
// خطأ!
runHostScript('applyTypewriterEffect', opts);  // اسم خاطئ

// صحيح
runHostScript('applyTypewriter', opts);
```

### ❌ خطأ #2: تغيير اسم الخاصية في JSON
```javascript
// خطأ!
runHostScript('createBox', { leftPadding: 40 });  // اسم خاطئ

// صحيح
runHostScript('createBox', { paddingLeft: 40 });
```

### ❌ خطأ #3: إرسال نوع خاطئ
```javascript
// خطأ!
runHostScript('applyTypewriter', { inStart: "2" });  // string بدل number

// صحيح
runHostScript('applyTypewriter', { inStart: 2 });
```

### ❌ خطأ #4: نسيان معالجة الخطأ
```javascript
// خطأ!
runHostScript('applyTypewriter', opts, function(res) {
    setStatus('Done!');  // ماذا لو فشل؟
});

// صحيح
runHostScript('applyTypewriter', opts, function(res) {
    if (res.success) {
        setStatus(res.message, 'success');
    } else {
        setStatus('Error: ' + res.error, 'error');
    }
});
```

---

## 📊 Checklist لإعادة التصميم

```
□ نسخت main.js القديم للمرجعية
□ صممت HTML الجديد
□ صممت CSS الجديد
□ كتبت main.js الجديد
□ تحققت من كل استدعاء runHostScript():
  □ applyTypewriter
  □ removeTypewriter
  □ getLayerText
  □ updateLayerText
  □ createBox
  □ removeBox
  □ splitTextToLayers
  □ splitAndApply
  □ getLayerEffectValues
  □ setLayerEffectValues
  □ getPresetList
  □ getAllPresets
  □ getPreset
  □ savePreset
  □ deletePreset
  □ renamePreset
  □ applyPreset
  □ getSelectionInfo
  □ getMultiSelectionInfo
□ اختبرت كل وظيفة في After Effects
□ تحققت من معالجة الأخطاء
```

---

## 🔮 للمستقبل

إذا أردت إضافة دالة جديدة:

1. **أضفها في `host/index.jsx`:**
```javascript
function myNewFunction(optsJSON) {
    try {
        var opts = JSON.parse(optsJSON);
        // ... التنفيذ
        return success("Done!", { result: ... });
    } catch(e) {
        return error(e.toString());
    }
}
```

2. **استدعها من الواجهة:**
```javascript
runHostScript('myNewFunction', { param1: value1 }, function(res) {
    // معالجة الاستجابة
});
```

3. **وثّقها في هذا الملف!**

---

**آخر تحديث:** December 15, 2024
**الحالة:** 📜 SACRED CONTRACT
