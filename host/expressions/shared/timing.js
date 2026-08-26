/**
 * TEXTORO Shared Expression - Timing & Sync Code
 * كود قراءة التوقيت والمزامنة
 * 
 * Version: 1.0.0
 * Used by: motion/position, motion/scale, motion/rotation, motion/opacity
 * 
 * Controllers Used:
 *   - Motion In Start
 *   - Motion In End
 *   - Motion Out Start
 *   - Motion Out End
 *   - Motion Sync Mode (0=Manual, 1=Markers)
 *   - Motion Easing Type
 * 
 * Markers Supported:
 *   - IN_START
 *   - IN_END
 *   - OUT_START
 *   - OUT_END
 * 
 * Variables Exported:
 *   - inS: In Start time
 *   - inE: In End time
 *   - outS: Out Start time (-1 = disabled)
 *   - outE: Out End time
 *   - eT: Easing Type
 *   - t: Current time relative to inPoint
 */

// Read timing from Effect Controls
var inS = effect("Motion In Start")(1).value;
var inE = effect("Motion In End")(1).value;
var outS = effect("Motion Out Start")(1).value;
var outE = effect("Motion Out End")(1).value;

// Sync Mode: 0=Manual, 1=Markers (Typewriter)
var syncMode = 0;
try { syncMode = effect("Motion Sync Mode")(1).value; } catch(e) {}

// Override timing from markers if sync mode is enabled
if (syncMode == 1 && thisLayer.marker.numKeys > 0) {
    var m = thisLayer.marker;
    for (var i = 1; i <= m.numKeys; i++) {
        var c = m.key(i).comment;
        var mt = m.key(i).time - inPoint;
        
        if (c == "IN_START") inS = mt;
        else if (c == "IN_END") inE = mt;
        else if (c == "OUT_START") outS = mt;
        else if (c == "OUT_END") outE = mt;
    }
}

// Easing type
var eT = effect("Motion Easing Type")(1).value;

// Current time relative to layer in-point
var t = time - inPoint;

