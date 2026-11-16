// TEXTORO Box Position Expression v1.3
// موضع الصندوق مع دعم قفل الحجم وPadding وتحصين الأبوة
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

    var w = 0, h = 0, left = 0, top = 0;
    if (isLocked == 1) {
        try { w = parent.effect("Locked Width")(1).value; } catch(e) { w = 0; }
        try { h = parent.effect("Locked Height")(1).value; } catch(e) { h = 0; }
        try { left = parent.effect("Locked Left")(1).value; } catch(e) { left = 0; }
        try { top = parent.effect("Locked Top")(1).value; } catch(e) { top = 0; }
        if (w <= 0 || h <= 0) {
            var rect = parent.sourceRectAtTime(time, false);
            w = rect.width;
            h = rect.height;
            left = rect.left;
            top = rect.top;
        }
    } else {
        var rect = parent.sourceRectAtTime(time, false);
        w = rect.width;
        h = rect.height;
        left = rect.left;
        top = rect.top;
    }

    var totalW = w + pL + pR;
    var cx = left - pL + totalW/2;
    var cy = top + h/2 + (pB - pT)/2;

    [cx, cy];
}
