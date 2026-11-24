// TEXTORO Cursor Range Selector Expression v1.0 (Percent Start)
// يحدد بداية نطاق المؤشر
// ═══════════════════════════════════════════════════════════════════
// - عند تعطيل المؤشر (Show Cursor = 0 أو Type Blur مفعل): يعود بـ 0% مع End = 0% لعدم تحديد أي حرف نهائياً
// - عند تفعيل المؤشر قبل النص (beforeText = 1): يبدأ من 0% (أول حرف هو المؤشر)
// - عند المؤشر العادي عند رأس الكتابة (beforeText = 0): يبدأ من ((len - 1) / len) * 100
// ═══════════════════════════════════════════════════════════════════

var show = 1;
try { show = effect("Show Cursor")(1).value; } catch(e) { show = 1; }
var tb = 0;
try { tb = effect("Type Blur")(1).value; } catch(e) { tb = 0; }
if (tb > 0) show = 0;

if (show == 0) {
    0;
} else {
    var before = 0;
    try { before = effect("Cursor Before Text")(1).value; } catch(e) { before = 0; }
    var txt = text.sourceText + "";
    var len = txt.length;
    if (len <= 0) {
        0;
    } else if (before == 1) {
        0;
    } else {
        ((len - 1) / len) * 100;
    }
}
