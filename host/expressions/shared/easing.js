/**
 * TEXTORO Shared Expression - Easing Function
 * دالة التسهيل المشتركة
 * 
 * Version: 1.0.0
 * Used by: motion/position, motion/scale, motion/rotation, motion/opacity
 * 
 * Easing Types:
 *   0 = Linear (خطي)
 *   1 = Ease Out (تباطؤ)
 *   2 = Ease In (تسارع)
 *   3 = Ease In Out (تسارع وتباطؤ)
 *   4 = Bounce (ارتداد)
 *   5 = Elastic (مرن)
 *   6 = Spring (زنبرك)
 * 
 * @param {number} p - Progress (0-1)
 * @param {number} eT - Easing Type (0-6)
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
    
    // Elastic
    if (eT == 5) {
        if (p == 0) return 0;
        if (p == 1) return 1;
        return Math.pow(2, -10 * p) * Math.sin((p * 10 - 0.75) * 2.094) + 1;
    }
    
    // Spring
    if (eT == 6) return 1 + 2.7 * Math.pow(p - 1, 3) + 1.7 * Math.pow(p - 1, 2);
    
    // Fallback
    return p;
}
