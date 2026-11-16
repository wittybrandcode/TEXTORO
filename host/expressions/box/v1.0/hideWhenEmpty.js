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
    var txt = src.replace(/[\|\s_\u2588\u258C\u258E\u25CF\u25C6]/g, "");
    var ctrlVal = 100;
    try { ctrlVal = parent.effect("{{OPACITY_CONTROL}}")(1).value; } catch(e) {}
    txt.length > 0 ? clamp(ctrlVal, 0, 100) : 0;
}
