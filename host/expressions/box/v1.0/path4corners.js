// TEXTORO Box 4 Corners Path Expression v1.5
// مسار Bezier للزوايا الأربع المستقلة مع دعم تعويض الضبابية الحركية وقفل الحجم
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

    var w = 0, h = 0, left0 = 0, top0 = 0;
    if (isLocked == 1) {
        try { w = parent.effect("Locked Width")(1).value; } catch(e) { w = 0; }
        try { h = parent.effect("Locked Height")(1).value; } catch(e) { h = 0; }
        try { left0 = parent.effect("Locked Left")(1).value; } catch(e) { left0 = 0; }
        try { top0 = parent.effect("Locked Top")(1).value; } catch(e) { top0 = 0; }
        var liveRect = parent.sourceRectAtTime(time, false);
        if (w <= 15 || h <= 5) {
            w = Math.max(0, liveRect.width - bEff);
            h = (bEff > 0) ? Math.max(0, liveRect.height - 2 * bEff) : liveRect.height;
            left0 = (isRTL == 1) ? (liveRect.left + bEff) : liveRect.left;
            top0 = (bEff > 0) ? (liveRect.top + bEff) : liveRect.top;
        }
    } else {
        var rect = parent.sourceRectAtTime(time, false);
        var lockedH = 0, lockedTop = 0;
        try { lockedH = parent.effect("Locked Height")(1).value; } catch(e) { lockedH = 0; }
        try { lockedTop = parent.effect("Locked Top")(1).value; } catch(e) { lockedTop = 0; }

        w = Math.max(0, rect.width - bEff);
        left0 = (isRTL == 1) ? (rect.left + bEff) : rect.left;

        if (lockedH > 5) {
            h = lockedH;
            top0 = lockedTop;
        } else if (bEff > 0) {
            h = Math.max(0, rect.height - 2 * bEff);
            top0 = rect.top + bEff;
        } else {
            h = rect.height;
            top0 = rect.top;
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
