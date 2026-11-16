// TEXTORO Box 4 Corners Path Expression v1.3
// مسار Bezier للزوايا الأربع المستقلة مع دعم قفل الحجم وتحصين الأبوة
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

    var w = 0, h = 0, left0 = 0, top0 = 0;
    if (isLocked == 1) {
        try { w = parent.effect("Locked Width")(1).value; } catch(e) { w = 0; }
        try { h = parent.effect("Locked Height")(1).value; } catch(e) { h = 0; }
        try { left0 = parent.effect("Locked Left")(1).value; } catch(e) { left0 = 0; }
        try { top0 = parent.effect("Locked Top")(1).value; } catch(e) { top0 = 0; }
        if (w <= 0 || h <= 0) {
            var rect = parent.sourceRectAtTime(time, false);
            w = rect.width;
            h = rect.height;
            left0 = rect.left;
            top0 = rect.top;
        }
    } else {
        var rect = parent.sourceRectAtTime(time, false);
        w = rect.width;
        h = rect.height;
        left0 = rect.left;
        top0 = rect.top;
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
