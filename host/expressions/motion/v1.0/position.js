/**
 * TEXTORO Motion Expression - Position
 * حركة الموقع IN/OUT مع دعم محرك الفيزياء التحليلي والامتداد الديناميكي
 * 
 * Version: 2.5.0
 * Requires: shared/easing.js, shared/timing.js
 * 
 * Controllers Used:
 *   - Animate Position (checkbox)
 *   - Pos From X, Pos From Y (IN start position offset)
 *   - Pos To X, Pos To Y (IN end position offset)
 *   - Pos Link Mode (0=Linked/reverse, 1=Independent)
 *   - Pos Out From X, Pos Out From Y (OUT start - when independent)
 *   - Pos Out To X, Pos Out To Y (OUT end - when independent)
 *   - Spring Stiffness, Spring Damping, Spring Mass, Spring Velocity Boost (optional physics)
 * 
 * Timing Controllers (from shared/timing.js):
 *   - Motion In Start, Motion In End
 *   - Motion Out Start, Motion Out End (-1 = disabled)
 *   - Motion Sync Mode, Motion Easing Type
 */

// Check if position animation is enabled
var anim = 0;
try { anim = effect("Animate Position")(1); } catch(e) {}

if (anim == 0) {
    // No animation - return original value
    value;
} else {
    // === SHARED CODE INJECTION POINT ===
    // easeVal(), solveSpring(), solveSettlingTime() from shared/easing.js
    // Timing variables (inS, inE, outS, outE, eT, t) from shared/timing.js
    
    // Read IN position values
    var fX = effect("Pos From X")(1).value;
    var fY = effect("Pos From Y")(1).value;
    var tX = effect("Pos To X")(1).value;
    var tY = effect("Pos To Y")(1).value;
    
    // Read Link Mode (0=Linked, 1=Independent)
    var linkMode = 0;
    try { linkMode = effect("Pos Link Mode")(1).value; } catch(e) {}
    
    // Calculate OUT values based on link mode
    var outFX = linkMode == 0 ? tX : effect("Pos Out From X")(1).value;
    var outFY = linkMode == 0 ? tY : effect("Pos Out From Y")(1).value;
    var outTX = linkMode == 0 ? fX : effect("Pos Out To X")(1).value;
    var outTY = linkMode == 0 ? fY : effect("Pos Out To Y")(1).value;
    
    // Calculate current offset
    var oX = tX, oY = tY;
    
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
        
        // Before IN animation
        if (t < inS) {
            oX = fX;
            oY = fY;
        }
        // OUT animation takes precedence if active
        else if (outS >= 0 && t >= outS) {
            var tauOut = t - outS;
            if (tauOut < tSettle) {
                var pOut = solveSpring(tauOut, k, c, m, v0);
                oX = outFX + (outTX - outFX) * pOut;
                oY = outFY + (outTY - outFY) * pOut;
            } else {
                oX = outTX;
                oY = outTY;
            }
        }
        // IN animation & dynamic tail settling
        else {
            var tauIn = t - inS;
            if (tauIn < tSettle) {
                var pIn = solveSpring(tauIn, k, c, m, v0);
                oX = fX + (tX - fX) * pIn;
                oY = fY + (tY - fY) * pIn;
            } else {
                oX = tX;
                oY = tY;
            }
        }
    } else {
        // Standard legacy easing (eT 0-5)
        if (t < inS) {
            oX = fX;
            oY = fY;
        } else if (t <= inE) {
            var d = inE - inS;
            if (d <= 0) d = 0.5;
            var p = (t - inS) / d;
            p = easeVal(p, eT);
            oX = fX + (tX - fX) * p;
            oY = fY + (tY - fY) * p;
        } else if (outS >= 0 && t >= outS && t <= outE) {
            var d = outE - outS;
            if (d <= 0) d = 0.5;
            var p = (t - outS) / d;
            p = easeVal(p, eT);
            oX = outFX + (outTX - outFX) * p;
            oY = outFY + (outTY - outFY) * p;
        } else if (outS >= 0 && t > outE) {
            oX = outTX;
            oY = outTY;
        }
    }
    
    // Apply offset to original position
    value.length > 2 ? [value[0] + oX, value[1] + oY, value[2]] : value + [oX, oY];
}
