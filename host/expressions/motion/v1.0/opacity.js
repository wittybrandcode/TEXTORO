/**
 * TEXTORO Motion Expression - Opacity
 * حركة الشفافية IN/OUT مع دعم محرك الفيزياء التحليلي
 * 
 * Version: 2.5.0
 * Requires: shared/easing.js, shared/timing.js
 * 
 * Controllers Used:
 *   - Animate Opacity (checkbox)
 *   - Opacity From (IN start opacity %)
 *   - Opacity To (IN end opacity %)
 *   - Opacity Link Mode (0=Linked/reverse, 1=Independent)
 *   - Opacity Out From (OUT start - when independent)
 *   - Opacity Out To (OUT end - when independent)
 *   - Spring Stiffness, Spring Damping, Spring Mass, Spring Velocity Boost (optional physics)
 */

// Check if opacity animation is enabled
var anim = 0;
try { anim = effect("Animate Opacity")(1); } catch(e) {}

if (anim == 0) {
    value;
} else {
    // === SHARED CODE INJECTION POINT ===
    // easeVal(), solveSpring(), solveSettlingTime() from shared/easing.js
    // Timing variables from shared/timing.js
    
    var oF = effect("Opacity From")(1).value;
    var oT = effect("Opacity To")(1).value;
    
    var linkMode = 0;
    try { linkMode = effect("Opacity Link Mode")(1).value; } catch(e) {}
    
    var outF = linkMode == 0 ? oT : effect("Opacity Out From")(1).value;
    var outT = linkMode == 0 ? oF : effect("Opacity Out To")(1).value;
    
    var ov = oT;
    
    var isPhys = (eT == 6 || eT == 7);
    if (isPhys) {
        var k = 180, c = 18, m = 1.0, v0 = 0;
        try { k = effect("Spring Stiffness")(1).value; } catch(e) {}
        try { c = effect("Spring Damping")(1).value; } catch(e) {}
        try { m = effect("Spring Mass")(1).value; } catch(e) {}
        try { v0 = effect("Spring Velocity Boost")(1).value / 100; } catch(e) {}
        try {
            var str = effect("Motion Easing Strength")(1).value / 100;
            if (str > 0 && str != 1) { k *= str; }
        } catch(e) {}
        
        var tSettle = solveSettlingTime(k, c, m);
        if (t < inS) {
            ov = oF;
        } else if (outS >= 0 && t >= outS) {
            var tauOut = t - outS;
            if (tauOut < tSettle) {
                var pOut = solveSpring(tauOut, k, c, m, v0);
                ov = outF + (outT - outF) * pOut;
            } else {
                ov = outT;
            }
        } else {
            var tauIn = t - inS;
            if (tauIn < tSettle) {
                var pIn = solveSpring(tauIn, k, c, m, v0);
                ov = oF + (oT - oF) * pIn;
            } else {
                ov = oT;
            }
        }
        ov = Math.max(0, Math.min(100, ov));
    } else {
        if (t < inS) { ov = oF; }
        else if (t <= inE) {
            var d = inE - inS; if (d <= 0) d = 0.5;
            var p = (t - inS) / d; p = easeVal(p, eT);
            ov = oF + (oT - oF) * p;
        } else if (outS >= 0 && t >= outS && t <= outE) {
            var d = outE - outS; if (d <= 0) d = 0.5;
            var p = (t - outS) / d; p = easeVal(p, eT);
            ov = outF + (outT - outF) * p;
        } else if (outS >= 0 && t > outE) { ov = outT; }
    }
    
    ov;
}
