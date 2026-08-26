/**
 * TEXTORO - MultiLines Panel Module
 * لوحة تقسيم الأسطر المتعددة
 * @version 3.3.0
 */

TEXTORO.Panels = TEXTORO.Panels || {};

TEXTORO.Panels.MultiLines = (function() {
    'use strict';
    
    /**
     * الحصول على قيمة الوقت بالثواني من خانة إدخال
     * يدعم صيغة s:f (ثواني:فريمات) أو رقم عادي
     */
    function getTimeNum(inputId, defaultVal) {
        var input = document.getElementById(inputId);
        if (!input) return defaultVal;
        
        var value = input.value;
        
        // إذا كانت القيمة تحتوي على : استخدم TEXTORO.Time.toSeconds
        if (String(value).indexOf(':') !== -1) {
            return TEXTORO.Time.toSeconds(value);
        }
        
        // وإلا استخدم sfToSeconds للتوافق مع الصيغة القديمة (ثواني.فريمات)
        var sfValue = parseFloat(value);
        if (isNaN(sfValue)) sfValue = defaultVal;
        
        var fps = TEXTORO.Time.getFPS() || 25;
        var seconds = Math.floor(sfValue);
        var frames = Math.round((sfValue - seconds) * 100);
        
        // تصحيح الفريمات الزائدة
        while (frames >= fps) {
            seconds++;
            frames -= fps;
        }
        
        return seconds + (frames / fps);
    }
    
    /**
     * تهيئة اللوحة
     */
    function init() {
        // Alignment buttons
        var btnAlignLeft = document.getElementById('btnAlignLeft');
        var btnAlignCenter = document.getElementById('btnAlignCenter');
        var btnAlignRight = document.getElementById('btnAlignRight');
        
        if (btnAlignLeft) btnAlignLeft.addEventListener('click', function() { setAlignment('left'); });
        if (btnAlignCenter) btnAlignCenter.addEventListener('click', function() { setAlignment('center'); });
        if (btnAlignRight) btnAlignRight.addEventListener('click', function() { setAlignment('right'); });
        
        TEXTORO.log('MultiLinesPanel initialized');
    }
    
    /**
     * تعيين المحاذاة
     */
    function setAlignment(align) {
        var btnAlignLeft = document.getElementById('btnAlignLeft');
        var btnAlignCenter = document.getElementById('btnAlignCenter');
        var btnAlignRight = document.getElementById('btnAlignRight');
        
        if (btnAlignLeft) btnAlignLeft.classList.toggle('active', align === 'left');
        if (btnAlignCenter) btnAlignCenter.classList.toggle('active', align === 'center');
        if (btnAlignRight) btnAlignRight.classList.toggle('active', align === 'right');
    }
    
    /**
     * الحصول على المحاذاة الحالية
     */
    function getAlignment() {
        var btnAlignLeft = document.getElementById('btnAlignLeft');
        var btnAlignRight = document.getElementById('btnAlignRight');
        
        if (btnAlignLeft && btnAlignLeft.classList.contains('active')) return 'left';
        if (btnAlignRight && btnAlignRight.classList.contains('active')) return 'right';
        return 'center';
    }
    
    /**
     * الحصول على خيارات التقسيم
     */
    function getOptions() {
        function getNum(id, def) {
            var el = document.getElementById(id);
            if (!el) return def;
            var val = parseFloat(el.value);
            return isNaN(val) ? def : val;
        }

        var blinkInHoldEl = document.getElementById('chkBlinkInHold');
        var staggerEl = document.getElementById('numStagger');
        var deleteOriginalEl = document.getElementById('chkDeleteOriginal');
        
        return {
            lineSpacing: getNum('numLineSpacing', 10),
            alignment: getAlignment(),
            stagger: TEXTORO.Time.toSeconds(staggerEl ? staggerEl.value : '0:12'),
            deleteOriginal: deleteOriginalEl ? deleteOriginalEl.checked : false
        };
    }
    
    /**
     * تقسيم وتطبيق Typewriter
     */
    function splitAndApply() {
        var noOutEl = document.getElementById('chkNoOut');
        var noOut = noOutEl ? noOutEl.checked : false;
        var blinkInHoldEl = document.getElementById('chkBlinkInHold');
        var deleteOriginalEl = document.getElementById('chkDeleteOriginal');
        var chkCursorEl = document.getElementById('chkCursor');
        var chkCursorBeforeEl = document.getElementById('chkCursorBefore');
        var txtCustomCursorEl = document.getElementById('txtCustomCursor');
        var colorCursorEl = document.getElementById('colorCursor');
        var chkReverseEl = document.getElementById('chkReverse');
        var chkWordModeEl = document.getElementById('chkWordMode');
        
        function getNum(id, def) {
            var el = document.getElementById(id);
            if (!el) return def;
            var val = parseFloat(el.value);
            return isNaN(val) ? def : val;
        }
        
        var opts = {
            // Multi-lines options
            lineSpacing: getNum('numLineSpacing', 10),
            alignment: getAlignment(),
            stagger: getTimeNum('numStagger', 0.5),
            deleteOriginal: deleteOriginalEl ? deleteOriginalEl.checked : false,
            
            // What to apply
            applyType: true,
            applyBox: false,
            
            // Typewriter options
            direction: getDirection(),
            inStart: getTimeNum('numInStart', 2),
            inEnd: getTimeNum('numInEnd', 3),
            outStart: noOut ? -1 : getTimeNum('numOutStart', 6),
            outEnd: noOut ? -1 : getTimeNum('numOutEnd', 7),
            noOut: noOut,
            showCursor: chkCursorEl ? chkCursorEl.checked : false,
            cursorBefore: chkCursorBeforeEl ? chkCursorBeforeEl.checked : false,
            cursorType: getCursorType(),
            customCursor: txtCustomCursorEl ? txtCustomCursorEl.value : '',
            cursorColor: colorCursorEl ? colorCursorEl.value : '#ffffff',
            cursorSpacing: getNum('numCursorSpacing', 0),
            blinkSpeed: getNum('numBlinkSpeed', 2),
            blinkStart: getTimeNum('numBlinkStart', 1),
            blinkEnd: getTimeNum('numBlinkEnd', 10),
            blinkInHold: blinkInHoldEl ? blinkInHoldEl.checked : true,
            reverse: chkReverseEl ? chkReverseEl.checked : false,
            wordMode: chkWordModeEl ? chkWordModeEl.checked : false,
            randomSpeed: getNum('rangeRandom', 0)
        };
        
        TEXTORO.log('Split & Apply: ' + JSON.stringify(opts));
        
        TEXTORO.HostBridge.run('splitAndApply', opts, function(res) {
            if (res.success) {
                TEXTORO.UI.StatusBar.success(res.message);
            } else {
                TEXTORO.UI.StatusBar.error('Error: ' + res.error);
            }
        });
    }
    
    /**
     * تقسيم فقط بدون تطبيق
     */
    function splitOnly() {
        function getNum(id, def) {
            var el = document.getElementById(id);
            if (!el) return def;
            var val = parseFloat(el.value);
            return isNaN(val) ? def : val;
        }
        var deleteOriginalEl = document.getElementById('chkDeleteOriginal');
        
        var opts = {
            lineSpacing: getNum('numLineSpacing', 10),
            alignment: getAlignment(),
            deleteOriginal: deleteOriginalEl ? deleteOriginalEl.checked : false
        };
        
        TEXTORO.log('Split Only: ' + JSON.stringify(opts));
        
        TEXTORO.HostBridge.run('splitTextToLayers', opts, function(res) {
            if (res.success) {
                TEXTORO.UI.StatusBar.success(res.message);
            } else {
                TEXTORO.UI.StatusBar.error('Error: ' + res.error);
            }
        });
    }
    
    /**
     * تعيين الاتجاه
     */
    function setDirection(dir) {
        var btnLTR = document.getElementById('btnLTR');
        var btnRTL = document.getElementById('btnRTL');
        
        if (btnLTR) btnLTR.classList.toggle('active', dir === 'ltr');
        if (btnRTL) btnRTL.classList.toggle('active', dir === 'rtl');
        
        // تفعيل Cursor Before تلقائياً للعربية
        var cursorBeforeCheckbox = document.getElementById('chkCursorBefore');
        if (cursorBeforeCheckbox) {
            cursorBeforeCheckbox.checked = (dir === 'rtl');
        }
        
        TEXTORO.log('Direction set to: ' + dir);
    }
    
    /**
     * الحصول على الاتجاه الحالي
     */
    function getDirection() {
        var btnRTL = document.getElementById('btnRTL');
        return (btnRTL && btnRTL.classList.contains('active')) ? 'rtl' : 'ltr';
    }
    
    /**
     * الحصول على نوع المؤشر
     */
    function getCursorType() {
        var sel = document.getElementById('selCursorType');
        if (!sel) return 0;
        if (sel.value === 'custom') return -1;
        return parseInt(sel.value) || 0;
    }
    
    // Public API
    return {
        init: init,
        setAlignment: setAlignment,
        getAlignment: getAlignment,
        getOptions: getOptions,
        splitAndApply: splitAndApply,
        splitOnly: splitOnly,
        setDirection: setDirection,
        getDirection: getDirection,
        getCursorType: getCursorType
    };
})();

// Aliases للتوافق
function initMultiLinesPanel() { TEXTORO.Panels.MultiLines.init(); }
function setAlignment(align) { TEXTORO.Panels.MultiLines.setAlignment(align); }
function getAlignment() { return TEXTORO.Panels.MultiLines.getAlignment(); }
function getMultiLineOptions() { return TEXTORO.Panels.MultiLines.getOptions(); }
function splitAndApply() { TEXTORO.Panels.MultiLines.splitAndApply(); }
function splitOnly() { TEXTORO.Panels.MultiLines.splitOnly(); }
function splitLinesOnly() { TEXTORO.Panels.MultiLines.splitOnly(); }
function setDirection(dir) { TEXTORO.Panels.MultiLines.setDirection(dir); }
function getDirection() { return TEXTORO.Panels.MultiLines.getDirection(); }
function getCursorType() { return TEXTORO.Panels.MultiLines.getCursorType(); }
