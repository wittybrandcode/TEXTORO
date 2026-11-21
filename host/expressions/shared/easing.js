/**
 * TEXTORO Shared Expression - Easing & Physics Engine
 * دالة التسهيل المشتركة ومحرك الفيزياء التحليلي
 * 
 * Version: 2.5.0
 * Used by: motion/position, motion/scale, motion/rotation, motion/opacity
 * 
 * Easing Types:
 *   0 = Linear (خطي)
 *   1 = Ease Out (تباطؤ)
 *   2 = Ease In (تسارع)
 *   3 = Ease In Out (تسارع وتباطؤ)
 *   4 = Bounce (ارتداد)
 *   5 = Elastic (مرن)
 *   6 = Spring (زنبرك فيزيائي تحليلي)
 *   7 = Elastic Physics (فيزياء ارتداد متقدمة)
 * 
 * @param {number} p - Progress (0-1)
 * @param {number} eT - Easing Type (0-7)
 * @returns {number} Eased progress (0-1)
 */
function easeVal(p, eT) {
    // Linear
    if (eT == 0) return p;
    
    // Ease Out (Quadratic)
    if (eT == 1) return 1 - Math.pow(1 - p, 2);
    
    // Ease In (Quadratic)
    if (eT == 2) return Math.pow(p, 2);
    
    // Ease In Out (Quadratic)
    if (eT == 3) return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
    
    // Bounce
    if (eT == 4) {
        var n = 7.5625, d = 2.75;
        if (p < 1/d) return n * p * p;
        if (p < 2/d) return n * (p -= 1.5/d) * p + 0.75;
        if (p < 2.5/d) return n * (p -= 2.25/d) * p + 0.9375;
        return n * (p -= 2.625/d) * p + 0.984375;
    }
    
    // Elastic (Classic)
    if (eT == 5) {
        if (p <= 0) return 0;
        if (p >= 1) return 1;
        return Math.pow(2, -10 * p) * Math.sin((p * 10 - 0.75) * 2.094) + 1;
    }
    
    // Spring (Analytical Harmonic Oscillator - Normalized)
    if (eT == 6) {
        if (p <= 0) return 0;
        if (p >= 1) return 1;
        return 1 - Math.exp(-6.91 * p) * (Math.cos(9.213 * p) + 0.75 * Math.sin(9.213 * p));
    }
    
    // Elastic Physics (Dynamic Multi-wave Harmonic Oscillator)
    if (eT == 7) {
        if (p <= 0) return 0;
        if (p >= 1) return 1;
        return 1 - Math.exp(-4.5 * p) * (Math.cos(14.5 * p) + 0.4 * Math.sin(14.5 * p));
    }
    
    // Fallback
    return p;
}

/**
 * Analytical Spring ODE Solver for variable time and physics sliders
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
    if (Math.abs(zeta - 1.0) < 0.001) {
        return 1 - Math.exp(-w0 * t) * (1 + (w0 - v) * t);
    } else if (zeta < 1.0) {
        var wd = w0 * Math.sqrt(1 - zeta * zeta);
        var b = (alpha - v) / wd;
        return 1 - Math.exp(-alpha * t) * (Math.cos(wd * t) + b * Math.sin(wd * t));
    } else {
        var wh = w0 * Math.sqrt(zeta * zeta - 1);
        var r1 = -alpha + wh;
        var r2 = -alpha - wh;
        return 1 - (1 / (2 * wh)) * ((wh + alpha - v) * Math.exp(r1 * t) + (wh - alpha + v) * Math.exp(r2 * t));
    }
}

/**
 * Calculate settling time in seconds
 */
function solveSettlingTime(k, c, m) {
    var safeM = Math.max(0.001, m || 1.0);
    var safeK = Math.max(0.1, k || 180);
    var safeC = Math.max(0.001, c || 18);
    var alpha = (safeC / (2 * Math.sqrt(safeK * safeM))) * Math.sqrt(safeK / safeM);
    if (alpha <= 0.0001) return 5.0;
    return Math.min(10.0, 6.91 / alpha);
}
