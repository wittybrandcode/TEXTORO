/**
 * TEXTORO Motion Expression - Rotation
 * حركة الدوران IN/OUT
 * 
 * Version: 1.0.0
 * Requires: shared/easing.js, shared/timing.js
 * 
 * Controllers Used:
 *   - Animate Rotation (checkbox)
 *   - Rot From (IN start rotation degrees)
 *   - Rot To (IN end rotation degrees)
 *   - Rot Link Mode (0=Linked/reverse, 1=Independent)
 *   - Rot Out From (OUT start - when independent)
 *   - Rot Out To (OUT end - when independent)
 */

// Check if rotation animation is enabled
var anim = 0;
try { anim = effect("Animate Rotation")(1); } catch(e) {}

if (anim == 0) {
    value;
} else {
    // === SHARED CODE INJECTION POINT ===
    // easeVal() from shared/easing.js
    // Timing variables from shared/timing.js
    
    var rF = effect("Rot From")(1).value;
    var rT = effect("Rot To")(1).value;
    
    var linkMode = 0;
    try { linkMode = effect("Rot Link Mode")(1).value; } catch(e) {}
    
    var outF = linkMode == 0 ? rT : effect("Rot Out From")(1).value;
    var outT = linkMode == 0 ? rF : effect("Rot Out To")(1).value;
    
    var rv = rT;
    
    if (t < inS) { rv = rF; }
    else if (t <= inE) {
        var d = inE - inS; if (d <= 0) d = 0.5;
        var p = (t - inS) / d; p = easeVal(p, eT);
        rv = rF + (rT - rF) * p;
    }
    else if (outS >= 0 && t >= outS && t <= outE) {
        var d = outE - outS; if (d <= 0) d = 0.5;
        var p = (t - outS) / d; p = easeVal(p, eT);
        rv = outF + (outT - outF) * p;
    }
    else if (outS >= 0 && t > outE) { rv = outT; }
    
    value + rv;
}

