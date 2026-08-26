/**
 * TEXTORO - Typewriter Panel Module
 * لوحة Typewriter
 * @version 3.3.0
 */

TEXTORO.Panels = TEXTORO.Panels || {};

TEXTORO.Panels.Typewriter = (function() {
    'use strict';

    function formatHostError(res, fallback) {
        var msg = (res && res.error) || fallback || 'Unknown error';
        if (res && res.bootstrapError) msg += ' | bootstrap=' + res.bootstrapError;
        if (res && res.rawResult) msg += ' | raw=' + String(res.rawResult);
        return msg;
    }
    
    /**
     * تهيئة اللوحة
     */
    function init() {
        bindEvents();
        TEXTORO.log('TypewriterPanel initialized');
    }
    
    /**
     * ربط الأحداث
     */
    function bindEvents() {
        // Direction buttons
        var btnLTR = document.getElementById('btnLTR');
        var btnRTL = document.getElementById('btnRTL');
        
        if (btnLTR) {
            btnLTR.addEventListener('click', function() {
                setDirection('ltr');
            });
        }
        if (btnRTL) {
            btnRTL.addEventListener('click', function() {
                setDirection('rtl');
            });
        }
        
        // Cursor type change - show/hide custom cursor input
        var cursorType = document.getElementById('selCursorType');
        if (cursorType) {
            cursorType.addEventListener('change', function() {
                var customInput = document.getElementById('txtCustomCursor');
                if (customInput) {
                    customInput.style.display = this.value === 'custom' ? 'inline-block' : 'none';
                }
            });
        }
        
        // Random speed slider value display
        var rangeRandom = document.getElementById('rangeRandom');
        var valRandom = document.getElementById('valRandom');
        if (rangeRandom && valRandom) {
            rangeRandom.addEventListener('input', function() {
                valRandom.textContent = this.value + '%';
            });
        }
        
        // Get text from layer button
        var btnGetText = document.getElementById('btnGetText');
        if (btnGetText) {
            btnGetText.addEventListener('click', getTextFromLayer);
        }
        
        // Update text in layer button
        var btnUpdateText = document.getElementById('btnUpdateText');
        if (btnUpdateText) {
            btnUpdateText.addEventListener('click', updateTextInLayer);
        }
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
     * الحصول على الاتجاه
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
    
    /**
     * جلب النص من الطبقة
     */
    function getTextFromLayer() {
        TEXTORO.HostBridge.run('getLayerText', null, function(res) {
            if (res.success && res.data) {
                document.getElementById('txtInput').value = res.data;
                TEXTORO.UI.StatusBar.success('Text loaded');
            } else {
                TEXTORO.UI.StatusBar.error('Error: ' + formatHostError(res, 'No text layer selected'));
            }
        });
    }
    
    /**
     * تحديث النص في الطبقة
     */
    function updateTextInLayer() {
        var newText = document.getElementById('txtInput').value.trim();
        if (!newText) {
            TEXTORO.UI.StatusBar.error('Enter text first');
            return;
        }
        
        TEXTORO.HostBridge.run('updateLayerText', { text: newText }, function(res) {
            if (res.success) {
                TEXTORO.UI.StatusBar.success('Text updated');
            } else {
                TEXTORO.UI.StatusBar.error('Error: ' + formatHostError(res, 'Failed'));
            }
        });
    }
    
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
     * جمع القيم من الواجهة
     */
    function getValues() {
        var txtInputEl = document.getElementById('txtInput');
        var chkNoOutEl = document.getElementById('chkNoOut');
        var txtCustomCursorEl = document.getElementById('txtCustomCursor');
        var colorCursorEl = document.getElementById('colorCursor');
        var colorTextEl = document.getElementById('colorText');
        
        var customText = (txtInputEl && txtInputEl.value) ? txtInputEl.value.trim() : '';
        var noOut = chkNoOutEl ? chkNoOutEl.checked : false;
        
        function getNum(id, def) {
            var el = document.getElementById(id);
            if (!el) return def;
            var val = parseFloat(el.value);
            return isNaN(val) ? def : val;
        }
        
        function getChk(id) {
            var el = document.getElementById(id);
            return el ? el.checked : false;
        }
        
        function getInt(id, def) {
            var el = document.getElementById(id);
            if (!el) return def;
            var val = parseInt(el.value);
            return isNaN(val) ? def : val;
        }
        
        return {
            direction: getDirection(),
            customText: (customText.length > 0) ? customText : null,
            // Timing - 4 markers
            inStart: getTimeNum('numInStart', 2),
            inEnd: getTimeNum('numInEnd', 3),
            outStart: noOut ? -1 : getTimeNum('numOutStart', 6),
            outEnd: noOut ? -1 : getTimeNum('numOutEnd', 7),
            noOut: noOut,
            // Cursor options
            showCursor: getChk('chkCursor'),
            cursorBefore: getChk('chkCursorBefore'),
            cursorType: getCursorType(),
            customCursor: txtCustomCursorEl ? txtCustomCursorEl.value : '',
            cursorColor: colorCursorEl ? colorCursorEl.value : '#ffffff',
            cursorSpacing: getNum('numCursorSpacing', 0),
            blinkSpeed: getNum('numBlinkSpeed', 2),
            // Cursor Blink Timing
            blinkStart: getTimeNum('numBlinkStart', 1),
            blinkEnd: getTimeNum('numBlinkEnd', 10),
            blinkInHold: getChk('chkBlinkInHold'),
            // Advanced options
            reverse: getChk('chkReverse'),
            wordMode: getChk('chkWordMode'),
            randomSpeed: getNum('rangeRandom', 0),
            // Easing options
            easingType: getInt('selEasingType', 1),
            easingStrength: getNum('numEasingStrength', 100),
            // Text Color
            applyTextColor: getChk('chkTextColor'),
            textColor: colorTextEl ? colorTextEl.value : '#ffffff',
            // Multi-selection stagger
            stagger: getTimeNum('numStagger', 0.5)
        };
    }
    
    /**
     * تطبيق Typewriter
     */
    function apply() {
        var opts = getValues();
        
        TEXTORO.log('applyTypewriter opts: ' + JSON.stringify(opts));
        
        // التحقق من التحديد المتعدد
        TEXTORO.HostBridge.run('getMultiSelectionInfo', null, function(selRes) {
            if (!selRes.success) {
                // E-01: فشل المضيف يُسجَّل ويُعرض بدل افتراض طبقة واحدة
                var errT = (selRes && selRes.error) || 'Unknown error';
                TEXTORO.error('[TypewriterPanel] getMultiSelectionInfo failed: ' + errT);
                TEXTORO.UI.StatusBar.warning('Type: ' + errT);
            }
            var count = (selRes.success && selRes.data) ? selRes.data.count : 1;
            
            if (count > 1) {
                // تحديد متعدد
                TEXTORO.log('Multi Apply: ' + count + ' layers');
                TEXTORO.HostBridge.run('applyTypewriterMulti', opts, function(res) {
                    if (res.success) {
                        TEXTORO.UI.StatusBar.success('Typewriter applied to ' + count + ' layers!');
                    } else {
                        TEXTORO.UI.StatusBar.error('Error: ' + formatHostError(res));
                    }
                });
            } else {
                // تحديد فردي
                TEXTORO.log('Single Apply');
                TEXTORO.HostBridge.run('applyTypewriter', opts, function(res) {
                    if (res.success) {
                        TEXTORO.UI.StatusBar.success('Typewriter applied!');
                    } else {
                        TEXTORO.UI.StatusBar.error('Error: ' + formatHostError(res));
                    }
                });
            }
        });
    }
    
    /**
     * إزالة Typewriter
     */
    function remove() {
        TEXTORO.HostBridge.run('removeTypewriter', null, function(res) {
            if (res.success) {
                TEXTORO.UI.StatusBar.success('Typewriter removed');
            } else {
                TEXTORO.UI.StatusBar.error('Error: ' + formatHostError(res, 'Failed'));
            }
        });
    }
    
    // Public API
    return {
        init: init,
        getValues: getValues,
        getCursorType: getCursorType,
        getDirection: getDirection,
        setDirection: setDirection,
        apply: apply,
        remove: remove,
        getTextFromLayer: getTextFromLayer,
        updateTextInLayer: updateTextInLayer
    };
})();

// Legacy aliases moved to js/legacy/aliases.js

