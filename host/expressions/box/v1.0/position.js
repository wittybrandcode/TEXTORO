// TEXTORO Box Position Expression v1.2
// موضع الصندوق
// إصلاح: استخدام time للحصول على الأبعاد الصحيحة
// ═══════════════════════════════════════════════════════════════════

var rect = parent.sourceRectAtTime(time, false);

var pL = Math.max(0, parent.effect("Padding Left")(1));
var pR = Math.max(0, parent.effect("Padding Right")(1));
var pT = Math.max(0, parent.effect("Padding Top")(1));
var pB = Math.max(0, parent.effect("Padding Bottom")(1));

var w = rect.width + pL + pR;
var cx = rect.left - pL + w/2;

[cx, rect.top + rect.height/2 + (pB-pT)/2];
