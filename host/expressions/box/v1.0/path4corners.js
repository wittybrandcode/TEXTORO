// TEXTORO Box 4 Corners Path Expression v1.6
// مسار Bezier للزوايا الأربع المستقلة مع حسابات طباعية ديناميكية تلقائية بنسبة 100%
// تتأقلم فوراً وتلقائياً عند تغيير نوع الخط أو قياسه دون الاعتماد على سلايدرز ثابتة
// ═══════════════════════════════════════════════════════════════════

var hasParent = false;
try { hasParent = (parent != null && parent.name != ""); } catch(e) {}

if (!hasParent) {
    value;
} else {
    var pL = 0, pR = 0, pT = 0, pB = 0;
    try { pL = parent.effect("Padding Left")(1).value; } catch(e) { pL = 40; }
    try { pR = parent.effect("Padding Right")(1).value; } catch(e) { pR = 40; }
    try { pT = parent.effect("Padding Top")(1).value; } catch(e) { pT = 20; }
    try { pB = parent.effect("Padding Bottom")(1).value; } catch(e) { pB = 20; }

    var isLocked = 0;
    try { isLocked = parent.effect("Lock Box Size")(1).value; } catch(e) { isLocked = 0; }

    // حساب الضبابية الحركية الفعالة (Type Blur)
    var bEff = 0;
    var tb = 0;
    try { tb = parent.effect("Type Blur")(1).value; } catch(e) { tb = 0; }
    if (tb > 0) {
        var auto = 1;
        try { auto = parent.effect("TW Auto")(1).value; } catch(e) { auto = 1; }
        if (auto == 1) {
            var inStart = -1, inEnd = -1;
            var m = parent.marker;
            if (m && m.numKeys > 0) {
                for (var i = 1; i <= m.numKeys; i++) {
                    var c = m.key(i).comment;
                    if (c == "IN_START") inStart = m.key(i).time;
                    else if (c == "IN_END") inEnd = m.key(i).time;
                }
            }
            if (inStart >= 0 && inEnd > inStart) {
                if (time >= inStart && time < inEnd) {
                    var settleTime = 0.15;
                    var timeLeft = inEnd - time;
                    var factor = (timeLeft < settleTime && timeLeft >= 0) ? (timeLeft / settleTime) : 1;
                    bEff = tb * factor;
                }
            } else {
                var p = 0;
                try { p = parent.effect("TW Progress")(1).value; } catch(e) { p = 0; }
                if (p > 0 && p < 100) bEff = (p > 90) ? tb * ((100 - p) / 10) : tb;
            }
        } else {
            var p = 0;
            try { p = parent.effect("TW Progress")(1).value; } catch(e) { p = 0; }
            if (p > 0 && p < 100) bEff = (p > 90) ? tb * ((100 - p) / 10) : tb;
        }
    }

    var isRTL = 0;
    try { isRTL = parent.effect("Box RTL")(1).value; } catch(e) { isRTL = 0; }
    if (isRTL == 0) {
        try {
            var srcTxt = parent.text.sourceText + "";
            for (var ci = 0; ci < srcTxt.length && ci < 30; ci++) {
                var code = srcTxt.charCodeAt(ci);
                if ((code >= 0x0600 && code <= 0x06FF) || (code >= 0xFB50 && code <= 0xFEFF)) {
                    isRTL = 1;
                    break;
                }
            }
        } catch(e) {}
    }

    var liveRect = parent.sourceRectAtTime(time, false);

    // قياس الحيز الكامل الأصلي للنص عند اكتمال الكتابة ديناميكياً (بنفس نوع الخط الحالي)
    var inEnd = -1;
    var m = parent.marker;
    if (m && m.numKeys > 0) {
        for (var mi = 1; mi <= m.numKeys; mi++) {
            if (m.key(mi).comment == "IN_END") {
                inEnd = m.key(mi).time;
                break;
            }
        }
    }
    var fullRect = (inEnd > 0) ? parent.sourceRectAtTime(inEnd, false) : liveRect;

    var curL = liveRect.left;
    var curR = liveRect.left + liveRect.width;
    var curT = liveRect.top;
    var curH = liveRect.height;
    if (bEff > 0) {
        curL += bEff;
        curR -= bEff;
        curT += bEff;
        curH = Math.max(0, curH - 2 * bEff);
    }

    var w = 0, h = 0, left0 = 0, top0 = 0;
    if (isLocked == 1) {
        w = (fullRect.width > 0) ? fullRect.width : Math.max(0, curR - curL);
        h = (fullRect.height > 5) ? fullRect.height : curH;
        left0 = (fullRect.width > 0) ? fullRect.left : curL;
        top0 = (fullRect.height > 5) ? fullRect.top : curT;
    } else {
        h = (fullRect.height > 5) ? fullRect.height : curH;
        top0 = (fullRect.height > 5) ? fullRect.top : curT;

        if (liveRect.width > 1) {
            if (isRTL == 1) {
                var fullRight = fullRect.left + fullRect.width;
                var anchorRight = (fullRect.width > 0) ? fullRight : curR;
                w = Math.max(0, anchorRight - curL);
                if (fullRect.width > 0) w = Math.min(w, fullRect.width);
                left0 = anchorRight - w;
            } else {
                var anchorLeft = (fullRect.width > 0) ? fullRect.left : curL;
                w = Math.max(0, curR - anchorLeft);
                if (fullRect.width > 0) w = Math.min(w, fullRect.width);
                left0 = anchorLeft;
            }
        } else {
            w = 0;
            left0 = (isRTL == 1 && fullRect.width > 0) ? (fullRect.left + fullRect.width) : curL;
        }
    }

    var totalW = w + pL + pR;
    var totalH = h + pT + pB;

    var cx = left0 - pL + totalW/2;
    var cy = top0 + h/2 + (pB - pT)/2;

    var rTL = 0, rTR = 0, rBR = 0, rBL = 0;
    try { rTL = Math.max(0, parent.effect("Corner TL")(1).value); } catch(e) {}
    try { rTR = Math.max(0, parent.effect("Corner TR")(1).value); } catch(e) {}
    try { rBR = Math.max(0, parent.effect("Corner BR")(1).value); } catch(e) {}
    try { rBL = Math.max(0, parent.effect("Corner BL")(1).value); } catch(e) {}

    var maxRadius = Math.min(totalW, totalH) / 2;
    rTL = Math.min(rTL, maxRadius);
    rTR = Math.min(rTR, maxRadius);
    rBR = Math.min(rBR, maxRadius);
    rBL = Math.min(rBL, maxRadius);

    var left = cx - totalW/2;
    var right = cx + totalW/2;
    var top = cy - totalH/2;
    var bottom = cy + totalH/2;

    var k = 0.5523;

    var pts = [
        [left + rTL, top],
        [right - rTR, top],
        [right, top + rTR],
        [right, bottom - rBR],
        [right - rBR, bottom],
        [left + rBL, bottom],
        [left, bottom - rBL],
        [left, top + rTL]
    ];

    var inT = [
        [-rTL * k, 0],
        [0, 0],
        [0, -rTR * k],
        [0, 0],
        [rBR * k, 0],
        [0, 0],
        [0, rBL * k],
        [0, 0]
    ];

    var outT = [
        [0, 0],
        [rTR * k, 0],
        [0, 0],
        [0, rBR * k],
        [0, 0],
        [-rBL * k, 0],
        [0, 0],
        [0, -rTL * k]
    ];

    createPath(pts, inT, outT, true);
}
