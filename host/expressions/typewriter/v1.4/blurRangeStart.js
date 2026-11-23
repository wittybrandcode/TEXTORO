// TEXTORO Typewriter Blur Range Start Expression v1.4
// يحدد بداية نطاق الحروف النشطة المتأثرة بالضبابية اللحظية أثناء الكتابة
// وينتهي فوراً عند IN_END ليصبح النص كله حاداً بنسبة 100%
// ═══════════════════════════════════════════════════════════════════

var b = 0;
try { b = effect("Type Blur")(1).value; } catch(e) { b = 0; }

if (b <= 0) {
    100;
} else {
    var isDone = false;
    var auto = 1;
    try { auto = effect("TW Auto")(1).value; } catch(e) { auto = 1; }

    if (auto == 1) {
        var inStart = -1, inEnd = -1;
        var m = thisLayer.marker;
        if (m && m.numKeys > 0) {
            for (var i = 1; i <= m.numKeys; i++) {
                var c = m.key(i).comment;
                if (c == "IN_START") inStart = m.key(i).time;
                else if (c == "IN_END") inEnd = m.key(i).time;
            }
        }
        if (inStart >= 0 && inEnd > inStart) {
            if (time < inStart || time >= inEnd) {
                isDone = true;
            }
        } else {
            var p = 0;
            try { p = effect("TW Progress")(1).value; } catch(e) { p = 0; }
            if (p <= 0 || p >= 100) isDone = true;
        }
    } else {
        var p = 0;
        try { p = effect("TW Progress")(1).value; } catch(e) { p = 0; }
        if (p <= 0 || p >= 100) isDone = true;
    }

    if (isDone) {
        100;
    } else {
        var txt = text.sourceText + "";
        var len = txt.length;
        if (len <= 0) {
            100;
        } else {
            // نافذة التلاشي للضبابية: تغطي آخر 3 أحرف معروضة
            var windowSize = 3;
            var startIdx = Math.max(0, len - windowSize);
            Math.max(0, (startIdx / len) * 100);
        }
    }
}
