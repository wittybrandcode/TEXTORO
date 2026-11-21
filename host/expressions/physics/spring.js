/**
 * TEXTORO Physics Dynamics Engine - Analytical Spring ODE Solver
 * حل المعادلة التفاضلية لنظام الزنبرك والكتلة والتخميد في زمن ثابت O(1)
 *
 * Version: 2.5.0
 * Compliance: ECMAScript 3 (ExtendScript & After Effects JavaScript Engine)
 *
 * Mathematical Model:
 *   m * d^2x/dt^2 + c * dx/dt + k * x = 0
 *
 * Derived Constants:
 *   w0 = sqrt(k / m)               [Natural Angular Frequency]
 *   zeta = c / (2 * sqrt(k * m))   [Damping Ratio]
 *   alpha = zeta * w0              [Decay Constant]
 *
 * Regimes Handled:
 *   1. Underdamped (zeta < 1.0)       - Harmonic oscillation with exponential envelope decay
 *   2. Critically Damped (zeta == 1.0)- Fastest arrival without any overshoot (iOS fluid style)
 *   3. Overdamped (zeta > 1.0)        - Viscous non-oscillatory hydraulic deceleration
 */

/**
 * Solve analytical spring displacement for a 0 -> 1 normalized step response.
 *
 * @param {number} t  - Elapsed time in seconds (tau = time - startTime)
 * @param {number} k  - Spring stiffness / tension (default: 180)
 * @param {number} c  - Damping coefficient / friction (default: 18)
 * @param {number} m  - Mass / inertia (default: 1.0)
 * @param {number} v0 - Initial velocity boost (default: 0)
 * @returns {number}  - Normalized progress / position multiplier
 */
function solveSpring(t, k, c, m, v0) {
    if (t <= 0) return 0;
    
    var safeM = Math.max(0.001, m || 1.0);
    var safeK = Math.max(0.1, k || 180);
    var safeC = Math.max(0, c || 18);
    var v = v0 || 0;
    
    var w0 = Math.sqrt(safeK / safeM);
    var zeta = safeC / (2 * Math.sqrt(safeK * safeM));
    var alpha = zeta * w0;
    
    // 1. Critically Damped (zeta close to 1.0) - Singular limit avoidance
    if (Math.abs(zeta - 1.0) < 0.001) {
        return 1 - Math.exp(-w0 * t) * (1 + (w0 - v) * t);
    }
    // 2. Underdamped (zeta < 1.0) - Harmonic oscillation with exponential decay
    else if (zeta < 1.0) {
        var wd = w0 * Math.sqrt(1 - zeta * zeta);
        var b = (alpha - v) / wd;
        return 1 - Math.exp(-alpha * t) * (Math.cos(wd * t) + b * Math.sin(wd * t));
    }
    // 3. Overdamped (zeta > 1.0) - Dual exponential decay
    else {
        var wh = w0 * Math.sqrt(zeta * zeta - 1);
        var r1 = -alpha + wh;
        var r2 = -alpha - wh;
        return 1 - (1 / (2 * wh)) * ((wh + alpha - v) * Math.exp(r1 * t) + (wh - alpha + v) * Math.exp(r2 * t));
    }
}

/**
 * Calculate settling time in seconds when residual oscillation drops below threshold epsilon (0.001).
 *
 * @param {number} k - Stiffness
 * @param {number} c - Damping
 * @param {number} m - Mass
 * @returns {number} Settling time in seconds
 */
function solveSettlingTime(k, c, m) {
    var safeM = Math.max(0.001, m || 1.0);
    var safeK = Math.max(0.1, k || 180);
    var safeC = Math.max(0.001, c || 18);
    
    var w0 = Math.sqrt(safeK / safeM);
    var zeta = safeC / (2 * Math.sqrt(safeK * safeM));
    var alpha = zeta * w0;
    if (alpha <= 0.0001) return 5.0;
    return Math.min(10.0, 6.91 / alpha);
}
