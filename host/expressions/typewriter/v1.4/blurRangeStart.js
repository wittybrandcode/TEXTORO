// TEXTORO Typewriter Blur Range Start Expression v1.4
// يحدد بداية نطاق الحروف النشطة المتأثرة بالضبابية اللحظية أثناء الكتابة
// ═══════════════════════════════════════════════════════════════════

var b = 0;
try { b = effect("Type Blur")(1).value; } catch(e) { b = 0; }

if (b <= 0) {
    100;
} else {
    var txt = text.sourceText + "";
    var len = txt.length;
    if (len <= 0) {
        100;
    } else {
        var showCursor = 1;
        try { showCursor = effect("Show Cursor")(1).value; } catch(e) { showCursor = 1; }
        var beforeText = 0;
        try { beforeText = effect("Cursor Before Text")(1).value; } catch(e) { beforeText = 0; }
        var spacing = 0;
        try { spacing = effect("Cursor Spacing")(1).value; } catch(e) { spacing = 0; }

        var cursorLen = (showCursor == 1) ? (1 + Math.max(0, Math.floor(spacing))) : 0;
        var textEnd = (beforeText == 1) ? len : Math.max(0, len - cursorLen);
        
        if (textEnd <= 0) {
            100;
        } else {
            // نافذة التلاشي للضبابية: تغطي آخر حرفين أو 3 أحرف معروضة
            var windowSize = 3;
            var startIdx = Math.max((beforeText == 1 ? cursorLen : 0), textEnd - windowSize);
            Math.max(0, (startIdx / len) * 100);
        }
    }
}
