// TEXTORO Cursor Blink Opacity Expression v1.0
// وميض المؤشر مع دعم مراحل الكتابة والحذف والانتظار
// ═══════════════════════════════════════════════════════════════════

var showCursor = effect("Show Cursor")(1);
var blinkSpeed = effect("Blink Speed")(1);
var blinkInHold = effect("Blink In Hold")(1);

// قراءة Markers
var inStart = -1, inEnd = -1, outStart = -1, outEnd = -1;
var blinkStart = -1, blinkEnd = -1;
var m = thisLayer.marker;

if (m.numKeys > 0) {
    for (var i = 1; i <= m.numKeys; i++) {
        var comment = m.key(i).comment;
        var t = m.key(i).time - inPoint;
        if (comment == "IN_START") inStart = t;
        else if (comment == "IN_END") inEnd = t;
        else if (comment == "OUT_START") outStart = t;
        else if (comment == "OUT_END") outEnd = t;
        else if (comment == "BLINK_START") blinkStart = t;
        else if (comment == "BLINK_END") blinkEnd = t;
    }
}

if (showCursor == 0) {
    100;  // إخفاء المؤشر (opacity = 100 للحرف العادي)
} else {
    var currentTime = time - inPoint;
    if (inStart < 0) inStart = 0;
    
    var shouldBlink = false;
    
    // وميض أثناء الكتابة (IN phase)
    if (currentTime >= inStart && (inEnd < 0 || currentTime < inEnd)) {
        shouldBlink = true;
    }
    
    // وميض أثناء الحذف (OUT phase)
    if (outStart >= 0 && currentTime >= outStart && (outEnd < 0 || currentTime < outEnd)) {
        shouldBlink = true;
    }
    
    // وميض في فترة الانتظار (Hold phase)
    if (blinkInHold == 1 && blinkStart >= 0 && blinkEnd >= 0) {
        if (currentTime >= blinkStart && currentTime < blinkEnd) {
            shouldBlink = true;
        }
    }
    
    if (!shouldBlink) {
        0;  // إخفاء المؤشر
    } else {
        // حساب الوميض
        var frameNum = Math.floor(time / thisComp.frameDuration);
        var blinkFrames = Math.round(10 / blinkSpeed);
        (frameNum % (blinkFrames * 2)) < blinkFrames ? 100 : 0;
    }
}
