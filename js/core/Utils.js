/**
 * TEXTORO - Utilities Module
 * دوال مساعدة عامة
 * @version 3.3.0
 */

TEXTORO.Utils = {
    /**
     * تحويل لون hex إلى RGB array [0-1]
     * @param {string} hex - اللون بصيغة hex
     * @returns {Array} [r, g, b] بقيم 0-1
     */
    hexToRgb: function(hex) {
        if (!hex) return [1, 1, 1];
        hex = hex.replace('#', '');
        var r = parseInt(hex.substring(0, 2), 16) / 255;
        var g = parseInt(hex.substring(2, 4), 16) / 255;
        var b = parseInt(hex.substring(4, 6), 16) / 255;
        return [r, g, b];
    },
    
    /**
     * تحويل RGB array إلى hex
     * @param {Array} rgb - [r, g, b] بقيم 0-1
     * @returns {string} hex color
     */
    rgbToHex: function(rgb) {
        if (!rgb || rgb.length < 3) return '#FFFFFF';
        var r = Math.round(rgb[0] * 255).toString(16).padStart(2, '0');
        var g = Math.round(rgb[1] * 255).toString(16).padStart(2, '0');
        var b = Math.round(rgb[2] * 255).toString(16).padStart(2, '0');
        return '#' + r.toUpperCase() + g.toUpperCase() + b.toUpperCase();
    },
    
    /**
     * الحصول على قيمة رقمية من عنصر input
     * @param {string} id - معرف العنصر
     * @param {number} defaultVal - القيمة الافتراضية
     * @returns {number}
     */
    getNum: function(id, defaultVal) {
        var el = document.getElementById(id);
        if (!el) return defaultVal;
        var val = parseFloat(el.value);
        return isNaN(val) ? defaultVal : val;
    },
    
    /**
     * الحصول على حالة checkbox
     * @param {string} id - معرف العنصر
     * @param {boolean} defaultVal - القيمة الافتراضية
     * @returns {boolean}
     */
    getChecked: function(id, defaultVal) {
        var el = document.getElementById(id);
        return el ? el.checked : (defaultVal || false);
    },
    
    /**
     * تنظيف النص من الأحرف الخطرة
     * @param {string} input - النص المدخل
     * @returns {string}
     */
    sanitizeText: function(input) {
        if (typeof input !== 'string') return '';
        return input
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    },
    
    /**
     * اقتطاع النص إذا تجاوز الطول المحدد
     * @param {string} str - النص
     * @param {number} len - الطول الأقصى
     * @returns {string}
     */
    truncate: function(str, len) {
        if (!str) return '';
        return str.length > len ? str.substring(0, len) + '...' : str;
    },
    
    /**
     * تأخير تنفيذ دالة (debounce)
     * @param {Function} fn - الدالة
     * @param {number} delay - التأخير بالميلي ثانية
     * @returns {Function}
     */
    debounce: function(fn, delay) {
        var timer = null;
        return function() {
            var args = arguments;
            var context = this;
            clearTimeout(timer);
            timer = setTimeout(function() {
                fn.apply(context, args);
            }, delay);
        };
    },
    
    /**
     * تحويل HTML entities
     * @param {string} str - النص
     * @returns {string}
     */
    escapeHtml: function(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },
    
    /**
     * التحقق من أن القيمة رقم صالح
     * @param {*} val - القيمة
     * @returns {boolean}
     */
    isValidNumber: function(val) {
        return typeof val === 'number' && !isNaN(val) && isFinite(val);
    },
    
    /**
     * ربط عنصر بحدث click
     * @param {string} id - معرف العنصر
     * @param {Function} handler - الدالة
     */
    bindClick: function(id, handler) {
        var el = document.getElementById(id);
        if (el) el.addEventListener('click', handler);
    },
    
    /**
     * الحصول على قيمة select
     * @param {string} id - معرف العنصر
     * @param {string} defaultVal - القيمة الافتراضية
     * @returns {string}
     */
    getSelectValue: function(id, defaultVal) {
        var el = document.getElementById(id);
        return el ? el.value : (defaultVal || '');
    }
};

// Legacy aliases moved to js/legacy/aliases.js
