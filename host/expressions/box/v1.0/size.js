// TEXTORO Box Size Expression v1.2
// حساب حجم الصندوق مع Padding
// إصلاح: استخدام time للحصول على الأبعاد الصحيحة
// ═══════════════════════════════════════════════════════════════════

var rect = parent.sourceRectAtTime(time, false);

var pL = Math.max(0, parent.effect("Padding Left")(1));
var pR = Math.max(0, parent.effect("Padding Right")(1));
var pT = Math.max(0, parent.effect("Padding Top")(1));
var pB = Math.max(0, parent.effect("Padding Bottom")(1));

[rect.width + pL + pR, rect.height + pT + pB];
