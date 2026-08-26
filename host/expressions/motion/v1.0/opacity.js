/**
 * TEXTORO Motion Expression - Opacity
 * حركة الشفافية IN/OUT
 * 
 * Version: 1.0.0
 * Requires: shared/easing.js, shared/timing.js
 * 
 * Controllers Used:
 *   - Animate Opacity (checkbox)
 *   - Opacity From (IN start opacity %)
 *   - Opacity To (IN end opacity %)
 *   - Opacity Link Mode (0=Linked/reverse, 1=Independent)
 *   - Opacity Out From (OUT start - when independent)
 *   - Opacity Out To (OUT end - when independent)
 */

// Check if opacity animation is enabled
var anim = 0;
try { anim = effect("Animate Opacity")(1); } catch(e) {}

if (anim == 0) {
    value;
} else {
    // === SHARED CODE INJECTION POINT ===
    // easeVal() from shared/easing.js
    // Timing variables from shared/timing.js
    
    var oF = effect("Opacity From")(1).value;
    var oT = effect("Opacity To")(1).value;
    
    var linkMode = 0;
    try { linkMode = effect("Opacity Link Mode")(1).value; } catch(e) {}
    
    var outF = linkMode == 0 ? oT : effect("Opacity Out From")(1).value;
    var outT = linkMode == 0 ? oF : effect("Opacity Out To")(1).value;
    
    var ov = oT;
    
    if (t < inS) { ov = oF; }
    else if (t <= inE) {
        var d = inE - inS; if (d <= 0) d = 0.5;
        var p = (t - inS) / d; p = easeVal(p, eT);
        ov = oF + (oT - oF) * p;
    }
    else if (outS >= 0 && t >= outS && t <= outE) {
        var d = outE - outS; if (d <= 0) d = 0.5;
        var p = (t - outS) / d; p = easeVal(p, eT);
        ov = outF + (outT - outF) * p;
    }
    else if (outS >= 0 && t > outE) { ov = outT; }
    
    ov;
}

