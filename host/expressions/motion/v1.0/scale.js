/**
 * TEXTORO Motion Expression - Scale
 * حركة الحجم IN/OUT مع دعم محرك الفيزياء التحليلي
 * 
 * Version: 2.5.0
 * Requires: shared/easing.js, shared/timing.js
 * 
 * Controllers Used:
 *   - Animate Scale (checkbox)
 *   - Scale From (IN start scale %)
 *   - Scale To (IN end scale %)
 *   - Scale Link Mode (0=Linked/reverse, 1=Independent)
 *   - Scale Out From (OUT start - when independent)
 *   - Scale Out To (OUT end - when independent)
 *   - Spring Stiffness, Spring Damping, Spring Mass, Spring Velocity Boost (optional physics)
 * 
 * Timing Controllers (from shared/timing.js):
 *   - Motion In Start, Motion In End
 *   - Motion Out Start, Motion Out End (-1 = disabled)
 *   - Motion Sync Mode, Motion Easing Type
 */

// Check if scale animation is enabled
var anim = 0;
try { anim = effect("Animate Scale")(1); } catch(e) {}

if (anim == 0) {
    // No animation - return original value
    value;
} else {
    // === SHARED CODE INJECTION POINT ===
    // easeVal(), solveSpring(), solveSettlingTime() from shared/easing.js
    // Timing variables (inS, inE, outS, outE, eT, t) from shared/timing.js
    
    // Read IN scale values
    var sF = effect("Scale From")(1).value;
    var sT = effect("Scale To")(1).value;
    
    // Read Link Mode (0=Linked, 1=Independent)
    var linkMode = 0;
    try { linkMode = effect("Scale Link Mode")(1).value; } catch(e) {}
    
    // Calculate OUT values based on link mode
    var outF = linkMode == 0 ? sT : effect("Scale Out From")(1).value;
    var outT = linkMode == 0 ? sF : effect("Scale Out To")(1).value;
    
    // Calculate current scale
    var sv = sT;
    
    // Physics Mode Detection (eT == 6 Spring, eT == 7 Elastic Physics)
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
            sv = sF;
        } else if (outS >= 0 && t >= outS) {
            var tauOut = t - outS;
            if (tauOut < tSettle) {
                var pOut = solveSpring(tauOut, k, c, m, v0);
                sv = outF + (outT - outF) * pOut;
            } else {
                sv = outT;
            }
        } else {
            var tauIn = t - inS;
            if (tauIn < tSettle) {
                var pIn = solveSpring(tauIn, k, c, m, v0);
                sv = sF + (sT - sF) * pIn;
            } else {
                sv = sT;
            }
        }
    } else {
        if (t < inS) {
            sv = sF;
        } else if (t <= inE) {
            var d = inE - inS;
            if (d <= 0) d = 0.5;
            var p = (t - inS) / d;
            p = easeVal(p, eT);
            sv = sF + (sT - sF) * p;
        } else if (outS >= 0 && t >= outS && t <= outE) {
            var d = outE - outS;
            if (d <= 0) d = 0.5;
            var p = (t - outS) / d;
            p = easeVal(p, eT);
            sv = outF + (outT - outF) * p;
        } else if (outS >= 0 && t > outE) {
            sv = outT;
        }
    }
    
    // Apply scale multiplier to original value
    value * (sv / 100);
}
