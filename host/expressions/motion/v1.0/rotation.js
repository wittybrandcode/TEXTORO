/**
 * TEXTORO Motion Expression - Rotation
 * حركة الدوران IN/OUT مع دعم محرك الفيزياء التحليلي
 * 
 * Version: 2.5.0
 * Requires: shared/easing.js, shared/timing.js
 * 
 * Controllers Used:
 *   - Animate Rotation (checkbox)
 *   - Rot From (IN start rotation degrees)
 *   - Rot To (IN end rotation degrees)
 *   - Rot Link Mode (0=Linked/reverse, 1=Independent)
 *   - Rot Out From (OUT start - when independent)
 *   - Rot Out To (OUT end - when independent)
 *   - Spring Stiffness, Spring Damping, Spring Mass, Spring Velocity Boost (optional physics)
 */

// Check if rotation animation is enabled
var anim = 0;
try { anim = effect("Animate Rotation")(1); } catch(e) {}

if (anim == 0) {
    value;
} else {
    // === SHARED CODE INJECTION POINT ===
    // easeVal(), solveSpring(), solveSettlingTime() from shared/easing.js
    // Timing variables from shared/timing.js
    
    var rF = effect("Rot From")(1).value;
    var rT = effect("Rot To")(1).value;
    
    var linkMode = 0;
    try { linkMode = effect("Rot Link Mode")(1).value; } catch(e) {}
    
    var outF = linkMode == 0 ? rT : effect("Rot Out From")(1).value;
    var outT = linkMode == 0 ? rF : effect("Rot Out To")(1).value;
    
    var rv = rT;
    
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
            rv = rF;
        } else if (outS >= 0 && t >= outS) {
            var tauOut = t - outS;
            if (tauOut < tSettle) {
                var pOut = solveSpring(tauOut, k, c, m, v0);
                rv = outF + (outT - outF) * pOut;
            } else {
                rv = outT;
            }
        } else {
            var tauIn = t - inS;
            if (tauIn < tSettle) {
                var pIn = solveSpring(tauIn, k, c, m, v0);
                rv = rF + (rT - rF) * pIn;
            } else {
                rv = rT;
            }
        }
    } else {
        if (t < inS) { rv = rF; }
        else if (t <= inE) {
            var d = inE - inS; if (d <= 0) d = 0.5;
            var p = (t - inS) / d; p = easeVal(p, eT);
            rv = rF + (rT - rF) * p;
        } else if (outS >= 0 && t >= outS && t <= outE) {
            var d = outE - outS; if (d <= 0) d = 0.5;
            var p = (t - outS) / d; p = easeVal(p, eT);
            rv = outF + (outT - outF) * p;
        } else if (outS >= 0 && t > outE) { rv = outT; }
    }
    
    value + rv;
}
