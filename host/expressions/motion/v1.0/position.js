/**
 * TEXTORO Motion Expression - Position
 * حركة الموقع IN/OUT
 * 
 * Version: 1.0.0
 * Requires: shared/easing.js, shared/timing.js
 * 
 * Controllers Used:
 *   - Animate Position (checkbox)
 *   - Pos From X, Pos From Y (IN start position offset)
 *   - Pos To X, Pos To Y (IN end position offset)
 *   - Pos Link Mode (0=Linked/reverse, 1=Independent)
 *   - Pos Out From X, Pos Out From Y (OUT start - when independent)
 *   - Pos Out To X, Pos Out To Y (OUT end - when independent)
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
    // easeVal() function from shared/easing.js
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
    
    // Before IN animation
    if (t < inS) {
        oX = fX;
        oY = fY;
    }
    // During IN animation
    else if (t <= inE) {
        var d = inE - inS;
        if (d <= 0) d = 0.5;
        var p = (t - inS) / d;
        p = easeVal(p, eT);
        oX = fX + (tX - fX) * p;
        oY = fY + (tY - fY) * p;
    }
    // During OUT animation (if enabled)
    else if (outS >= 0 && t >= outS && t <= outE) {
        var d = outE - outS;
        if (d <= 0) d = 0.5;
        var p = (t - outS) / d;
        p = easeVal(p, eT);
        oX = outFX + (outTX - outFX) * p;
        oY = outFY + (outTY - outFY) * p;
    }
    // After OUT animation
    else if (outS >= 0 && t > outE) {
        oX = outTX;
        oY = outTY;
    }
    
    // Apply offset to original position
    value + [oX, oY];
}

