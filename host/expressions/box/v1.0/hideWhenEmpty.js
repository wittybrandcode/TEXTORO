// TEXTORO Hide When Empty Expression v1.2
// إخفاء الصندوق عند عدم وجود نص حقيقي
// ═══════════════════════════════════════════════════════════════════
// يُستخدم في Fill/Stroke Opacity للصندوق
// تحصين كائن TextDocument عبر String() لمنع خطأ TypeError
// ═══════════════════════════════════════════════════════════════════

var hasParent = false;
try { hasParent = (parent != null && parent.name != ""); } catch(e) {}

if (!hasParent) {
    value;
} else {
    var src = "";
    try { src = String(parent.text.sourceText); } catch(e) { src = ""; }
    var customCur = "";
    try {
        var pm = parent.marker;
        if (pm && pm.numKeys > 0) {
            for (var mi = 1; mi <= pm.numKeys; mi++) {
                var mc = pm.key(mi).comment;
                if (mc && mc.indexOf("CURSOR_CHAR:") == 0) {
                    customCur = mc.substring(12);
                    break;
                }
            }
        }
    } catch(eC) {}
    var txt = src.replace(/[\|\s_\u2588\u258C\u258E\u25CF\u25C6\u200D]/g, "");
    if (customCur && txt.length > 0) {
        txt = txt.split(customCur).join("");
    }
    var ctrlVal = 100;
    try { ctrlVal = parent.effect("{{OPACITY_CONTROL}}")(1).value; } catch(e) {}
    txt.length > 0 ? clamp(ctrlVal, 0, 100) : 0;
}
