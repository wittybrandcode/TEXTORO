/**
 * TEXTORO Motion Expression - Scale
 * حركة الحجم IN/OUT
 * 
 * Version: 1.0.0
 * Requires: shared/easing.js, shared/timing.js
 * 
 * Controllers Used:
 *   - Animate Scale (checkbox)
 *   - Scale From (IN start scale %)
 *   - Scale To (IN end scale %)
 *   - Scale Link Mode (0=Linked/reverse, 1=Independent)
 *   - Scale Out From (OUT start - when independent)
 *   - Scale Out To (OUT end - when independent)
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
    // easeVal() function from shared/easing.js
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
    
    // Before IN animation
    if (t < inS) {
        sv = sF;
    }
    // During IN animation
    else if (t <= inE) {
        var d = inE - inS;
        if (d <= 0) d = 0.5;
        var p = (t - inS) / d;
        p = easeVal(p, eT);
        sv = sF + (sT - sF) * p;
    }
    // During OUT animation (if enabled)
    else if (outS >= 0 && t >= outS && t <= outE) {
        var d = outE - outS;
        if (d <= 0) d = 0.5;
        var p = (t - outS) / d;
        p = easeVal(p, eT);
        sv = outF + (outT - outF) * p;
    }
    // After OUT animation
    else if (outS >= 0 && t > outE) {
        sv = outT;
    }
    
    // Apply scale multiplier to original value
    value * (sv / 100);
}

