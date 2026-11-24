// TEXTORO Typewriter Blur Amount Expression v1.4
// يتحكم في شدة الضبابية ديناميكياً وينتهي تماماً وبشكل حاد عند علامة IN_END
// ═══════════════════════════════════════════════════════════════════

var b = 0;
try { b = effect("Type Blur")(1).value; } catch(e) { b = 0; }

if (b <= 0) {
    [0, 0];
} else {
    var auto = 1;
    try { auto = effect("TW Auto")(1).value; } catch(e) { auto = 1; }

    if (auto == 1) {
        var inStart = -1, inEnd = -1;
        var m = thisLayer.marker;
        if (m && m.numKeys > 0) {
            for (var i = 1; i <= m.numKeys; i++) {
                var c = m.key(i).comment;
                if (c.indexOf("IN_START") == 0) inStart = m.key(i).time;
                else if (c.indexOf("IN_END") == 0) inEnd = m.key(i).time;
            }
        }

        if (inStart >= 0 && inEnd > inStart) {
            if (time < inStart || time >= inEnd) {
                [0, 0];
            } else {
                // تلاشي بصري سلس في آخر 150 ملي ثانية قبل IN_END لتنعيم استقرار الحرف الأخير
                var settleTime = 0.15;
                var timeLeft = inEnd - time;
                var factor = (timeLeft < settleTime && timeLeft >= 0) ? (timeLeft / settleTime) : 1;
                var curB = b * factor;
                [curB, curB];
            }
        } else {
            // في حال عدم وجود ماركرز نعتمد على TW Progress
            var p = 0;
            try { p = effect("TW Progress")(1).value; } catch(e) { p = 0; }
            if (p <= 0 || p >= 100) {
                [0, 0];
            } else {
                var curB = (p > 90) ? b * ((100 - p) / 10) : b;
                [curB, curB];
            }
        }
    } else {
        // الوضع اليدوي بواسطة سلايدر TW Progress
        var p = 0;
        try { p = effect("TW Progress")(1).value; } catch(e) { p = 0; }
        if (p <= 0 || p >= 100) {
            [0, 0];
        } else {
            var curB = (p > 90) ? b * ((100 - p) / 10) : b;
            [curB, curB];
        }
    }
}
