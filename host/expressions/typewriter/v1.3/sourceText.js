// TEXTORO Typewriter sourceText Expression v1.3
// النص مخزن في Marker (TW_TEXT:)
// ═══════════════════════════════════════════════════════════════════
// v1.3 Updates:
// - Smart Direction Detection (اكتشاف الاتجاه تلقائياً)
// - RTL Word Mode (وضع الكلمات للعربية)
// - Arabic Ligatures Support (دعم الاتصال بين الحروف)
// - Mixed Text Support (دعم النص المختلط)
// - Zero-Width Joiner (ZWJ) for connected letters
// ═══════════════════════════════════════════════════════════════════

var X = "";
var customCursor = "";
var inStart = -1, inEnd = -1, outStart = -1, outEnd = -1;
var m = thisLayer.marker;

// ═══════════════════════════════════════════════════════════════════
// قراءة جميع Markers في loop واحد (تحسين الأداء)
// ═══════════════════════════════════════════════════════════════════
if (m.numKeys > 0) {
    for (var i = 1; i <= m.numKeys; i++) {
        var c = m.key(i).comment;
        var t = m.key(i).time - inPoint;
        
        if (c.indexOf("TW_TEXT:") == 0) {
            X = c.substring(8);
        } else if (c.indexOf("CURSOR_CHAR:") == 0) {
            customCursor = c.substring(12);
        } else if (c == "IN_START") {
            inStart = t;
        } else if (c == "IN_END") {
            inEnd = t;
        } else if (c == "OUT_START") {
            outStart = t;
        } else if (c == "OUT_END") {
            outEnd = t;
        }
    }
}

var L = X.length;

// Effect Controls - Basic
var progress = effect("TW Progress")(1);
var auto = effect("TW Auto")(1);
var reverse = effect("TW Reverse")(1);
var randomSpeed = effect("Random Speed")(1) / 100;
var showCursor = effect("Show Cursor")(1);
var beforeText = effect("Cursor Before Text")(1);
var cursorType = Math.round(effect("Cursor Type")(1));
var cursorChars = ["|", "_", "\u2588", "\u258C", "\u258E", "\u25CF", "\u25C6"];
var spacing = Math.round(Math.max(0, effect("Cursor Spacing")(1)));
var wordMode = effect("Word Mode")(1);
var isRTL = effect("Box RTL")(1);

// Effect Controls - Easing
var easingType = 1;
var easingStrength = 1;
try { easingType = Math.round(effect("Easing Type")(1)); } catch(e) {}
try { easingStrength = effect("Easing Strength")(1) / 100; } catch(e) {}

// ═══════════════════════════════════════════════════════════════════
// RTL Detection & Support Functions (v1.3 NEW)
// ═══════════════════════════════════════════════════════════════════

// اكتشاف إذا كان الحرف عربي
function isArabicChar(ch) {
    var code = ch.charCodeAt(0);
    // Arabic Unicode range: 0600-06FF, Arabic Supplement: 0750-077F
    // Arabic Extended-A: 08A0-08FF, Arabic Presentation Forms: FB50-FDFF, FE70-FEFF
    return (code >= 0x0600 && code <= 0x06FF) ||
           (code >= 0x0750 && code <= 0x077F) ||
           (code >= 0x08A0 && code <= 0x08FF) ||
           (code >= 0xFB50 && code <= 0xFDFF) ||
           (code >= 0xFE70 && code <= 0xFEFF);
}

// اكتشاف إذا كان الحرف العربي يتصل بما بعده
function isConnectingChar(ch) {
    var code = ch.charCodeAt(0);
    // الحروف التي لا تتصل بما بعدها: ا د ذ ر ز و
    var nonConnecting = [0x0627, 0x062F, 0x0630, 0x0631, 0x0632, 0x0648, 
                         0x0622, 0x0623, 0x0625, 0x0624, 0x0629]; // ألف بأشكالها + تاء مربوطة
    for (var i = 0; i < nonConnecting.length; i++) {
        if (code == nonConnecting[i]) return false;
    }
    return isArabicChar(ch);
}

// اكتشاف اتجاه النص تلقائياً
function detectTextDirection(text) {
    var arabicCount = 0;
    var latinCount = 0;
    for (var i = 0; i < text.length && i < 50; i++) { // فحص أول 50 حرف فقط للأداء
        var ch = text.charAt(i);
        if (isArabicChar(ch)) arabicCount++;
        else if ((ch >= 'A' && ch <= 'Z') || (ch >= 'a' && ch <= 'z')) latinCount++;
    }
    return arabicCount > latinCount;
}

// إضافة Zero-Width Joiner للحفاظ على الاتصال
function addZWJ(text) {
    if (text.length == 0) return text;
    var lastChar = text.charAt(text.length - 1);
    // إذا كان الحرف الأخير عربي ويتصل بما بعده، نضيف ZWJ
    if (isConnectingChar(lastChar)) {
        return text + "\u200D"; // Zero-Width Joiner
    }
    return text;
}

// ═══════════════════════════════════════════════════════════════════
// Easing Functions (حركة أنعم)
// ═══════════════════════════════════════════════════════════════════
function applyEasing(t, type) {
    t = clamp(t, 0, 1);
    if (type == 0) return t; // Linear
    if (type == 1) return 1 - (1 - t) * (1 - t); // Ease Out (Quad)
    if (type == 2) return t * t; // Ease In (Quad)
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // Ease In-Out
}

// ═══════════════════════════════════════════════════════════════════
// حساب المدة والتقدم
// ═══════════════════════════════════════════════════════════════════
var inDuration = (inEnd > inStart && inStart >= 0) ? (inEnd - inStart) : 2;
var outDuration = (outEnd > outStart && outStart >= 0) ? (outEnd - outStart) : 2;

var p = 0;
var currentTime = time - inPoint;

if (auto == 1) {
    if (inStart < 0) inStart = 0;
    
    if (currentTime < inStart) {
        p = 0;
    } else if (currentTime < inEnd || inEnd < 0) {
        var elapsed = currentTime - inStart;
        var linearP = clamp(elapsed / Math.max(0.1, inDuration), 0, 1);
        var easedP = applyEasing(linearP, easingType);
        var finalP = linearP + (easedP - linearP) * easingStrength;
        p = finalP * 100;
        
        if (randomSpeed > 0 && p < 100 && p > 0) {
            seedRandom(index, true);
            var noise = (random() - 0.5) * 2;
            var timeNoise = Math.sin(time * 40 + index * 10);
            p = p + (noise * timeNoise * randomSpeed * 15);
        }
        p = clamp(p, 0, 100);
    } else if (outStart < 0 || currentTime < outStart) {
        p = 100;
    } else if (outEnd < 0 || currentTime < outEnd) {
        var elapsedOut = currentTime - outStart;
        var linearP = clamp(elapsedOut / Math.max(0.1, outDuration), 0, 1);
        var easedP = applyEasing(linearP, easingType);
        var finalP = linearP + (easedP - linearP) * easingStrength;
        p = 100 - finalP * 100;
    } else {
        p = 0;
    }
} else {
    p = progress;
}

p = clamp(p, 0, 100);

// ═══════════════════════════════════════════════════════════════════
// حساب النص المرئي (v1.3 - RTL Support)
// ═══════════════════════════════════════════════════════════════════
var visibleText = "";

// اكتشاف الاتجاه: إما من Effect Control أو تلقائياً
var textIsRTL = (isRTL == 1) || detectTextDirection(X);

if (wordMode == 1 || textIsRTL) {
    // ═══════════════════════════════════════════════════════════════
    // Word Mode (للعربية أو عند التفعيل يدوياً)
    // ═══════════════════════════════════════════════════════════════
    var words = X.split(" ");
    var W = words.length;
    var visibleCount = Math.floor(W * p / 100);
    
    if (reverse == 1) {
        visibleCount = W - visibleCount;
    }
    
    if (textIsRTL && isRTL == 1) {
        // RTL: الكلمات تظهر من اليمين (نهاية المصفوفة)
        // لكن After Effects يعرض RTL تلقائياً، فنأخذ من البداية
        visibleText = words.slice(0, visibleCount).join(" ");
    } else {
        // LTR: الكلمات تظهر من اليسار (بداية المصفوفة)
        visibleText = words.slice(0, visibleCount).join(" ");
    }
} else {
    // ═══════════════════════════════════════════════════════════════
    // Character Mode (للإنجليزية)
    // ═══════════════════════════════════════════════════════════════
    var T = reverse == 1 ? Math.floor(L * (100 - p) / 100) : Math.floor(L * p / 100);
    visibleText = X.substring(0, T);
    
    // إضافة ZWJ إذا كان هناك حروف عربية (للنص المختلط)
    if (T > 0 && T < L) {
        visibleText = addZWJ(visibleText);
    }
}

// ═══════════════════════════════════════════════════════════════════
// المؤشر
// ═══════════════════════════════════════════════════════════════════
var cursor = "";
if (showCursor == 1) {
    cursor = (cursorType == -1 && customCursor != "") ? customCursor : cursorChars[clamp(cursorType, 0, 6)];
}
var spaces = "";
for (var i = 0; i < spacing; i++) spaces += " ";

// ═══════════════════════════════════════════════════════════════════
// النتيجة النهائية (مع دعم RTL)
// ═══════════════════════════════════════════════════════════════════
// After Effects يعرض النص العربي RTL تلقائياً
// لذلك الترتيب في الكود يُعكس عند العرض:
// - في الكود: "text + cursor" → في العرض RTL: "cursor | text"
// - في الكود: "cursor + text" → في العرض RTL: "text | cursor"
// 
// للعربية: نريد المؤشر على اليسار (نهاية الكتابة)
// لذلك نضع: text + cursor (سيظهر cursor على اليسار بعد العكس)
// ═══════════════════════════════════════════════════════════════════
var result = "";

if (textIsRTL) {
    // للعربية (RTL):
    // beforeText=1 (مفعل) = المؤشر على اليسار = text + spaces + cursor
    // beforeText=0 (معطل) = المؤشر على اليمين = cursor + spaces + text
    if (beforeText == 1) {
        result = visibleText + spaces + cursor;
    } else {
        result = cursor + spaces + visibleText;
    }
} else {
    // للإنجليزية (LTR):
    // beforeText=1 = المؤشر على اليسار = cursor + spaces + text
    // beforeText=0 = المؤشر على اليمين = text + spaces + cursor
    if (beforeText == 1) {
        result = cursor + spaces + visibleText;
    } else {
        result = visibleText + spaces + cursor;
    }
}

result;
