// TEXTORO Cursor Range End Selector Expression v1.0 (Percent End)
// يحدد نهاية نطاق المؤشر
// ═══════════════════════════════════════════════════════════════════
// - عند تعطيل المؤشر (Show Cursor = 0): يعود بـ 100% لعدم تحديد أي حرف (النطاق 100% إلى 100%)
// - عند تفعيل المؤشر قبل النص (beforeText = 1): ينتهي عند (1 / len) * 100 (تحديد الحرف الأول فقط)
// - عند المؤشر العادي عند رأس الكتابة (beforeText = 0): ينتهي عند 100%
// ═══════════════════════════════════════════════════════════════════

var show = 1;
try { show = effect("Show Cursor")(1).value; } catch(e) { show = 1; }

if (show == 0) {
    100;
} else {
    var before = 0;
    try { before = effect("Cursor Before Text")(1).value; } catch(e) { before = 0; }
    var txt = text.sourceText + "";
    var len = txt.length;
    if (len <= 0) {
        100;
    } else if (before == 1) {
        (1 / len) * 100;
    } else {
        100;
    }
}
