// TEXTORO Typewriter sourceText Expression v1.2
// النص مخزن في Marker (TW_TEXT:)
// ═══════════════════════════════════════════════════════════════════
// v1.2 Updates:
// - User-controllable Easing Type (Linear, Ease Out, Ease In, Ease In-Out)
// - Easing Strength control (0-100%)
// - Optimized marker reading (single loop)
// - Improved random speed algorithm
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

// Effect Controls - Easing (NEW in v1.2)
// Default: Ease Out (1), 100% strength - for backward compatibility
var easingType = 1;
var easingStrength = 1;
try { easingType = Math.round(effect("Easing Type")(1)); } catch(e) {}
try { easingStrength = effect("Easing Strength")(1) / 100; } catch(e) {}

// ═══════════════════════════════════════════════════════════════════
// Easing Functions (حركة أنعم)
// 0 = Linear, 1 = Ease Out, 2 = Ease In, 3 = Ease In-Out
// ═══════════════════════════════════════════════════════════════════
function applyEasing(t, type) {
    t = clamp(t, 0, 1);
    if (type == 0) return t; // Linear
    if (type == 1) return 1 - (1 - t) * (1 - t); // Ease Out (Quad)
    if (type == 2) return t * t; // Ease In (Quad)
    // Ease In-Out (Quad)
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
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
        // مرحلة الكتابة مع Easing
        var elapsed = currentTime - inStart;
        var linearP = clamp(elapsed / Math.max(0.1, inDuration), 0, 1);
        
        // تطبيق Easing مع التحكم في القوة
        var easedP = applyEasing(linearP, easingType);
        var finalP = linearP + (easedP - linearP) * easingStrength;
        p = finalP * 100;
        
        // سرعة عشوائية محسّنة
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
        // مرحلة الحذف مع Easing
        var elapsedOut = currentTime - outStart;
        var linearP = clamp(elapsedOut / Math.max(0.1, outDuration), 0, 1);
        
        // تطبيق Easing مع التحكم في القوة
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
// حساب النص المرئي
// ═══════════════════════════════════════════════════════════════════
var visibleText = "";
if (wordMode == 1) {
    var words = X.split(" ");
    var W = words.length;
    var visibleCount = reverse == 1 ? Math.floor(W * (100 - p) / 100) : Math.floor(W * p / 100);
    visibleText = words.slice(0, visibleCount).join(" ");
} else {
    var T = reverse == 1 ? Math.floor(L * (100 - p) / 100) : Math.floor(L * p / 100);
    visibleText = X.substring(0, T);
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

// النتيجة النهائية
beforeText == 1 ? cursor + spaces + visibleText : visibleText + spaces + cursor;
