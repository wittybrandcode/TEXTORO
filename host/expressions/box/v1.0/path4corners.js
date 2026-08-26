// TEXTORO Box 4 Corners Path Expression v1.2
// مسار Bezier للزوايا الأربع المستقلة
// إصلاح: استخدام time للحصول على الأبعاد الصحيحة
// ═══════════════════════════════════════════════════════════════════

var rect = parent.sourceRectAtTime(time, false);

var pL = parent.effect("Padding Left")(1);
var pR = parent.effect("Padding Right")(1);
var pT = parent.effect("Padding Top")(1);
var pB = parent.effect("Padding Bottom")(1);

var w = rect.width + pL + pR;
var h = rect.height + pT + pB;

var cx = rect.left - pL + w/2;
var cy = rect.top + rect.height/2 + (pB - pT)/2;

var rTL = parent.effect("Corner TL")(1);
var rTR = parent.effect("Corner TR")(1);
var rBR = parent.effect("Corner BR")(1);
var rBL = parent.effect("Corner BL")(1);

var left = cx - w/2;
var right = cx + w/2;
var top = cy - h/2;
var bottom = cy + h/2;

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
    [-rTL*k, 0], [0, 0], [0, -rTR*k], [0, 0],
    [rBR*k, 0], [0, 0], [0, rBL*k], [0, 0]
];

var outT = [
    [0, 0], [rTR*k, 0], [0, 0], [0, rBR*k],
    [0, 0], [-rBL*k, 0], [0, 0], [0, -rTL*k]
];

createPath(pts, inT, outT, true);
