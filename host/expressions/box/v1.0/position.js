// TEXTORO Box Position Expression v1.5
// موضع الصندوق مع دعم تعويض الضبابية الحركية (Type Blur) وقفل الحجم والـ Padding
// ═══════════════════════════════════════════════════════════════════

var hasParent = false;
try { hasParent = (parent != null && parent.name != ""); } catch(e) {}

if (!hasParent) {
    value;
} else {
    var pL = 0, pR = 0, pT = 0, pB = 0;
    try { pL = Math.max(0, parent.effect("Padding Left")(1).value); } catch(e) { pL = 40; }
    try { pR = Math.max(0, parent.effect("Padding Right")(1).value); } catch(e) { pR = 40; }
    try { pT = Math.max(0, parent.effect("Padding Top")(1).value); } catch(e) { pT = 20; }
    try { pB = Math.max(0, parent.effect("Padding Bottom")(1).value); } catch(e) { pB = 20; }

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

    var w = 0, h = 0, left = 0, top = 0;
    if (isLocked == 1) {
        try { w = parent.effect("Locked Width")(1).value; } catch(e) { w = 0; }
        try { h = parent.effect("Locked Height")(1).value; } catch(e) { h = 0; }
        try { left = parent.effect("Locked Left")(1).value; } catch(e) { left = 0; }
        try { top = parent.effect("Locked Top")(1).value; } catch(e) { top = 0; }
        var liveRect = parent.sourceRectAtTime(time, false);
        if (w <= 15 || h <= 5) {
            w = Math.max(0, liveRect.width - bEff);
            h = (bEff > 0) ? Math.max(0, liveRect.height - 2 * bEff) : liveRect.height;
            left = (isRTL == 1) ? (liveRect.left + bEff) : liveRect.left;
            top = (bEff > 0) ? (liveRect.top + bEff) : liveRect.top;
        }
    } else {
        var rect = parent.sourceRectAtTime(time, false);
        var lockedH = 0, lockedTop = 0;
        try { lockedH = parent.effect("Locked Height")(1).value; } catch(e) { lockedH = 0; }
        try { lockedTop = parent.effect("Locked Top")(1).value; } catch(e) { lockedTop = 0; }

        w = Math.max(0, rect.width - bEff);
        left = (isRTL == 1) ? (rect.left + bEff) : rect.left;

        if (lockedH > 5) {
            h = lockedH;
            top = lockedTop;
        } else if (bEff > 0) {
            h = Math.max(0, rect.height - 2 * bEff);
            top = rect.top + bEff;
        } else {
            h = rect.height;
            top = rect.top;
        }
    }

    var totalW = w + pL + pR;
    var cx = left - pL + totalW/2;
    var cy = top + h/2 + (pB - pT)/2;

    [cx, cy];
}
