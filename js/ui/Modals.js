/**
 * TEXTORO - Modals Module
 * النوافذ المنبثقة
 * @version 3.4.0
 */

TEXTORO.UI = TEXTORO.UI || {};

TEXTORO.UI.Modals = (function() {
    'use strict';
    
    var inputModal = null;
    var confirmModal = null;
    var colorModal = null;
    var presetSaveModal = null;

    var currentInputCallback = null;
    var currentConfirmCallback = null;
    var currentColorCallback = null;
    var currentColorTargetInput = null;
    var currentPresetSaveCallback = null;
    var presetSaveData = null;
    var selectedPresetIcon = 'ph-bold ph-sparkle';

    var originalColor = '#FFFFFF';
    var currentColor = '#FFFFFF';
    var currentHue = 0;       // 0 - 360
    var currentSat = 0;       // 0 - 1
    var currentVal = 1;       // 0 - 1
    var isDraggingSv = false;

    var STUDIO_PALETTE = [
        { hex: '#10B981', name: 'Emerald' },
        { hex: '#34D399', name: 'Mint' },
        { hex: '#06B6D4', name: 'Cyan' },
        { hex: '#3B82F6', name: 'Electric Blue' },
        { hex: '#6366F1', name: 'Indigo' },
        { hex: '#8B5CF6', name: 'Violet' },
        { hex: '#EC4899', name: 'Hot Pink' },
        { hex: '#EF4444', name: 'Crimson Red' },
        { hex: '#F97316', name: 'Bright Orange' },
        { hex: '#F59E0B', name: 'Amber Gold' },
        { hex: '#EAB308', name: 'Yellow Gold' },
        { hex: '#84CC16', name: 'Lime' },
        { hex: '#FFFFFF', name: 'Pure White' },
        { hex: '#94A3B8', name: 'Slate Silver' },
        { hex: '#334155', name: 'Slate Charcoal' },
        { hex: '#000000', name: 'Deep Black' }
    ];

    /**
     * تطبيع والتحقق من كود الـ Hex
     * يقبل #RRGGBB أو RRGGBB أو #RGB أو RGB
     * @param {string} input
     * @returns {string|null}
     */
    function normalizeHex(input) {
        if (!input) return null;
        var str = String(input).trim().replace(/^#+/, '');
        if (str.length === 3 && /^[0-9A-Fa-f]{3}$/.test(str)) {
            str = str[0] + str[0] + str[1] + str[1] + str[2] + str[2];
        }
        if (str.length === 6 && /^[0-9A-Fa-f]{6}$/.test(str)) {
            return '#' + str.toUpperCase();
        }
        return null;
    }

    /**
     * تحويل RGB إلى كود Hex
     */
    function rgbToHex(r, g, b) {
        r = Math.max(0, Math.min(255, Math.round(Number(r) || 0)));
        g = Math.max(0, Math.min(255, Math.round(Number(g) || 0)));
        b = Math.max(0, Math.min(255, Math.round(Number(b) || 0)));
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
    }

    /**
     * تحويل كود Hex إلى RGB [0-255]
     */
    function hexToRgb255(hex) {
        var norm = normalizeHex(hex);
        if (!norm) return { r: 255, g: 255, b: 255 };
        return {
            r: parseInt(norm.substring(1, 3), 16),
            g: parseInt(norm.substring(3, 5), 16),
            b: parseInt(norm.substring(5, 7), 16)
        };
    }

    /**
     * تحويل RGB إلى HSV
     */
    function rgbToHsv(r, g, b) {
        r = Math.max(0, Math.min(255, r)) / 255;
        g = Math.max(0, Math.min(255, g)) / 255;
        b = Math.max(0, Math.min(255, b)) / 255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var d = max - min;
        var h = 0;
        var s = max === 0 ? 0 : d / max;
        var v = max;
        if (max !== min) {
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return { h: Math.round(h * 360), s: s, v: v };
    }

    /**
     * تحويل HSV إلى RGB
     */
    function hsvToRgb(h, s, v) {
        h = (h % 360 + 360) % 360;
        s = Math.max(0, Math.min(1, s));
        v = Math.max(0, Math.min(1, v));
        var c = v * s;
        var x = c * (1 - Math.abs((h / 60) % 2 - 1));
        var m = v - c;
        var r1 = 0, g1 = 0, b1 = 0;
        if (h < 60) { r1 = c; g1 = x; }
        else if (h < 120) { r1 = x; g1 = c; }
        else if (h < 180) { g1 = c; b1 = x; }
        else if (h < 240) { g1 = x; b1 = c; }
        else if (h < 300) { r1 = x; b1 = c; }
        else { r1 = c; b1 = x; }
        return {
            r: Math.round((r1 + m) * 255),
            g: Math.round((g1 + m) * 255),
            b: Math.round((b1 + m) * 255)
        };
    }

    /**
     * استرجاع قائمة الألوان المستخدمة مؤخراً من التخزين المحلي
     */
    function getRecentColors() {
        try {
            var raw = localStorage.getItem('textoro_recent_colors');
            if (raw) {
                var arr = JSON.parse(raw);
                if (Array.isArray(arr)) return arr;
            }
        } catch(e) {}
        return [];
    }

    /**
     * حفظ لون جديد في قائمة الألوان الأخيرة
     */
    function saveRecentColor(hex) {
        var norm = normalizeHex(hex);
        if (!norm) return;
        var list = getRecentColors();
        list = list.filter(function(item) { return item.toUpperCase() !== norm.toUpperCase(); });
        list.unshift(norm);
        if (list.length > 8) list = list.slice(0, 8);
        try {
            localStorage.setItem('textoro_recent_colors', JSON.stringify(list));
        } catch(e) {}
    }

    /**
     * مسح قائمة الألوان الأخيرة
     */
    function clearRecentColors() {
        try {
            localStorage.removeItem('textoro_recent_colors');
        } catch(e) {}
        renderRecentColors();
    }

    /**
     * عرض الألوان الأخيرة في شبكة المودال
     */
    function renderRecentColors() {
        var container = document.getElementById('colorModalRecentSwatches');
        if (!container) return;
        container.innerHTML = '';
        var list = getRecentColors();
        if (list.length === 0) {
            var emptyNotice = document.createElement('span');
            emptyNotice.className = 'empty-recent-notice';
            emptyNotice.textContent = 'No recent colors used yet';
            container.appendChild(emptyNotice);
            return;
        }
        list.forEach(function(hex) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'recent-color-swatch studio-color-swatch';
            btn.style.backgroundColor = hex;
            btn.title = hex;
            btn.setAttribute('data-hex', hex);
            if (currentColor && currentColor.toUpperCase() === hex.toUpperCase()) {
                btn.classList.add('active');
            }
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                updateCurrentColor(hex, true);
            });
            container.appendChild(btn);
        });
    }

    /**
     * تهيئة النوافذ المنبثقة
     */
    function init() {
        inputModal = document.getElementById('inputModal');
        confirmModal = document.getElementById('confirmModal');
        
        // Input Modal events
        if (inputModal) {
            var okBtn = document.getElementById('btnInputOK');
            var cancelBtn = document.getElementById('btnInputCancel');
            var closeBtn = document.getElementById('btnCloseInput');
            var input = document.getElementById('inputModalValue');
            
            if (okBtn) okBtn.addEventListener('click', submitInputModal);
            if (cancelBtn) cancelBtn.addEventListener('click', closeInputModal);
            if (closeBtn) closeBtn.addEventListener('click', closeInputModal);
            if (input) {
                input.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter') submitInputModal();
                    if (e.key === 'Escape') closeInputModal();
                });
            }
        }
        
        // Confirm Modal events
        if (confirmModal) {
            var confirmOk = document.getElementById('btnConfirmOK');
            var confirmCancel = document.getElementById('btnConfirmCancel');
            var confirmClose = document.getElementById('btnCloseConfirm');
            
            if (confirmOk) confirmOk.addEventListener('click', submitConfirmModal);
            if (confirmCancel) confirmCancel.addEventListener('click', closeConfirmModal);
            if (confirmClose) confirmClose.addEventListener('click', closeConfirmModal);
        }

        // Color Modal events
        initColorModal();

        // Preset Save Modal events
        initPresetSaveModal();
        
        TEXTORO.log('Modals initialized');
    }

    /**
     * رسم مستطيل التشبع والقيمة (2D SV Canvas)
     */
    function drawSvCanvas() {
        var canvas = document.getElementById('colorModalSvCanvas');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        var w = canvas.width;
        var h = canvas.height;

        // 1. Base pure hue fill
        ctx.fillStyle = 'hsl(' + currentHue + ', 100%, 50%)';
        ctx.fillRect(0, 0, w, h);

        // 2. Horizontal gradient: white -> transparent
        var gradWhite = ctx.createLinearGradient(0, 0, w, 0);
        gradWhite.addColorStop(0, 'rgba(255,255,255,1)');
        gradWhite.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gradWhite;
        ctx.fillRect(0, 0, w, h);

        // 3. Vertical gradient: transparent -> black
        var gradBlack = ctx.createLinearGradient(0, 0, 0, h);
        gradBlack.addColorStop(0, 'rgba(0,0,0,0)');
        gradBlack.addColorStop(1, 'rgba(0,0,0,1)');
        ctx.fillStyle = gradBlack;
        ctx.fillRect(0, 0, w, h);
    }

    /**
     * تحديث موضع مؤشر الـ 2D Canvas
     */
    function updateSvCursor(s, v) {
        var cursor = document.getElementById('colorModalSvCursor');
        if (!cursor) return;
        var leftPct = Math.max(0, Math.min(100, s * 100));
        var topPct = Math.max(0, Math.min(100, (1 - v) * 100));
        cursor.style.left = leftPct + '%';
        cursor.style.top = topPct + '%';
    }

    /**
     * معالجة السحب على الـ 2D SV Canvas
     */
    function handleSvDrag(e) {
        var container = document.getElementById('colorModalSvContainer');
        if (!container) return;
        var rect = container.getBoundingClientRect();
        var clientX = e.touches ? e.touches[0].clientX : e.clientX;
        var clientY = e.touches ? e.touches[0].clientY : e.clientY;

        var x = Math.max(0, Math.min(rect.width, clientX - rect.left));
        var y = Math.max(0, Math.min(rect.height, clientY - rect.top));

        currentSat = rect.width > 0 ? (x / rect.width) : 0;
        currentVal = rect.height > 0 ? (1 - (y / rect.height)) : 0;

        updateSvCursor(currentSat, currentVal);
        var rgb = hsvToRgb(currentHue, currentSat, currentVal);
        var hex = rgbToHex(rgb.r, rgb.g, rgb.b);
        updateCurrentColor(hex, true, 'canvas');
    }

    /**
     * تهيئة نافذة الألوان الاحترافية (Studio Color Modal)
     */
    function initColorModal() {
        colorModal = document.getElementById('colorModal');
        if (!colorModal) return;

        var okBtn = document.getElementById('btnColorOK');
        var cancelBtn = document.getElementById('btnColorCancel');
        var closeBtn = document.getElementById('btnCloseColor');
        var copyBtn = document.getElementById('btnColorCopyHex');
        var lblPicker = document.getElementById('lblColorPicker');
        var clearRecentBtn = document.getElementById('btnClearRecentColors');
        var prevBox = document.getElementById('colorModalPrevBox');
        var hexInput = document.getElementById('colorModalHex');
        var picker = document.getElementById('colorModalPicker');
        var svContainer = document.getElementById('colorModalSvContainer');
        var hueSlider = document.getElementById('colorModalHueSlider');

        var rSlider = document.getElementById('colorModalRSlider');
        var gSlider = document.getElementById('colorModalGSlider');
        var bSlider = document.getElementById('colorModalBSlider');
        var rInput = document.getElementById('colorModalR');
        var gInput = document.getElementById('colorModalG');
        var bInput = document.getElementById('colorModalB');
        var swatchesContainer = document.getElementById('colorModalSwatches');

        if (okBtn) okBtn.addEventListener('click', submitColorModal);
        if (cancelBtn) cancelBtn.addEventListener('click', closeColorModal);
        if (closeBtn) closeBtn.addEventListener('click', closeColorModal);
        if (copyBtn) copyBtn.addEventListener('click', copyHexToClipboard);
        if (clearRecentBtn) clearRecentBtn.addEventListener('click', clearRecentColors);

        // Split preview: Click original box to restore initial color
        if (prevBox) {
            prevBox.addEventListener('click', function(e) {
                e.preventDefault();
                updateCurrentColor(originalColor, true);
            });
        }

        // Eyedropper support (Chromium EyeDropper API with native OS picker overlay fallback)
        if (lblPicker) {
            lblPicker.addEventListener('click', function(e) {
                if (window.EyeDropper) {
                    e.preventDefault();
                    var eyeDropper = new window.EyeDropper();
                    eyeDropper.open().then(function(result) {
                        if (result && result.sRGBHex) {
                            updateCurrentColor(result.sRGBHex, true);
                        }
                    }).catch(function() {
                        // User canceled sampling
                    });
                }
                // When window.EyeDropper is absent, click naturally activates the child <input type="color">
            });
        }

        // Native color picker input & change listeners
        if (picker) {
            picker.addEventListener('input', function() {
                var norm = normalizeHex(picker.value);
                if (norm) updateCurrentColor(norm, true);
            });
            picker.addEventListener('change', function() {
                var norm = normalizeHex(picker.value);
                if (norm) updateCurrentColor(norm, true);
            });
        }

        // 2D Saturation / Value Canvas interaction
        if (svContainer) {
            svContainer.addEventListener('mousedown', function(e) {
                isDraggingSv = true;
                handleSvDrag(e);
            });
            svContainer.addEventListener('touchstart', function(e) {
                isDraggingSv = true;
                handleSvDrag(e);
            }, { passive: true });

            window.addEventListener('mousemove', function(e) {
                if (isDraggingSv) handleSvDrag(e);
            });
            window.addEventListener('touchmove', function(e) {
                if (isDraggingSv) handleSvDrag(e);
            }, { passive: true });

            window.addEventListener('mouseup', function() {
                isDraggingSv = false;
            });
            window.addEventListener('touchend', function() {
                isDraggingSv = false;
            });
        }

        // Hue rainbow slider interaction
        if (hueSlider) {
            hueSlider.addEventListener('input', function() {
                currentHue = parseInt(hueSlider.value, 10) || 0;
                drawSvCanvas();
                var rgb = hsvToRgb(currentHue, currentSat, currentVal);
                var hex = rgbToHex(rgb.r, rgb.g, rgb.b);
                updateCurrentColor(hex, true, 'hue');
            });
        }

        // Hex input field events
        if (hexInput) {
            hexInput.addEventListener('input', function() {
                var val = hexInput.value.trim().replace(/^#+/, '');
                if (hexInput.value.indexOf('#') !== -1) {
                    hexInput.value = val;
                }
                var norm = normalizeHex(val);
                var status = document.getElementById('colorModalHexStatus');
                if (norm) {
                    updateCurrentColor(norm, false, 'hexInput');
                    hexInput.classList.remove('invalid');
                    hexInput.classList.add('valid');
                    if (status) {
                        status.textContent = '';
                        status.className = 'color-hex-status valid';
                    }
                } else {
                    hexInput.classList.add('invalid');
                    hexInput.classList.remove('valid');
                    if (status) {
                        status.textContent = '6 Hex digits';
                        status.className = 'color-hex-status error';
                    }
                }
            });

            hexInput.addEventListener('blur', function() {
                var norm = normalizeHex(hexInput.value);
                if (norm) {
                    hexInput.value = norm.replace(/^#/, '');
                    updateCurrentColor(norm, true);
                } else {
                    hexInput.value = currentColor.replace(/^#/, '');
                    updateCurrentColor(currentColor, true);
                }
            });

            hexInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') submitColorModal();
                if (e.key === 'Escape') closeColorModal();
            });
        }

        // Native color picker fallback
        if (picker) {
            picker.addEventListener('input', function() {
                var norm = normalizeHex(picker.value);
                if (norm) updateCurrentColor(norm, true);
            });
        }

        // RGB Sliders & Number inputs sync
        function handleRgbSliderChange() {
            var r = rSlider ? parseInt(rSlider.value, 10) : 0;
            var g = gSlider ? parseInt(gSlider.value, 10) : 0;
            var b = bSlider ? parseInt(bSlider.value, 10) : 0;
            var hex = rgbToHex(r, g, b);
            updateCurrentColor(hex, true, 'rgbSlider');
        }

        function handleRgbInputChange() {
            var r = rInput ? Math.max(0, Math.min(255, parseInt(rInput.value, 10) || 0)) : 0;
            var g = gInput ? Math.max(0, Math.min(255, parseInt(gInput.value, 10) || 0)) : 0;
            var b = bInput ? Math.max(0, Math.min(255, parseInt(bInput.value, 10) || 0)) : 0;
            var hex = rgbToHex(r, g, b);
            updateCurrentColor(hex, true, 'rgbInput');
        }

        if (rSlider) rSlider.addEventListener('input', handleRgbSliderChange);
        if (gSlider) gSlider.addEventListener('input', handleRgbSliderChange);
        if (bSlider) bSlider.addEventListener('input', handleRgbSliderChange);

        if (rInput) rInput.addEventListener('input', handleRgbInputChange);
        if (gInput) gInput.addEventListener('input', handleRgbInputChange);
        if (bInput) bInput.addEventListener('input', handleRgbInputChange);

        // Populate studio swatches
        if (swatchesContainer) {
            swatchesContainer.innerHTML = '';
            STUDIO_PALETTE.forEach(function(item) {
                var btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'studio-color-swatch';
                btn.style.backgroundColor = item.hex;
                btn.title = item.name + ' (' + item.hex + ')';
                btn.setAttribute('data-hex', item.hex);
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    updateCurrentColor(item.hex, true);
                });
                swatchesContainer.appendChild(btn);
            });
        }

        // Render Recent Colors row
        renderRecentColors();

        // Auto-bind precision color boxes
        bindColorInputs();
    }

    /**
     * تحديث اللون الحالي وعكسه على واجهة المودال
     */
    function updateCurrentColor(hex, updateHexInput, source) {
        var norm = normalizeHex(hex) || '#FFFFFF';
        currentColor = norm;

        // Preview box
        var curBox = document.getElementById('colorModalCurBox');
        if (curBox) curBox.style.backgroundColor = norm;

        var rgb = hexToRgb255(norm);

        // Update 2D SV Canvas & Hue slider if not initiated from them
        if (source !== 'canvas' && source !== 'hue') {
            var hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
            currentHue = hsv.h;
            currentSat = hsv.s;
            currentVal = hsv.v;

            var hueSlider = document.getElementById('colorModalHueSlider');
            if (hueSlider) hueSlider.value = currentHue;

            drawSvCanvas();
            updateSvCursor(currentSat, currentVal);
        } else if (source === 'hue') {
            drawSvCanvas();
            updateSvCursor(currentSat, currentVal);
        } else if (source === 'canvas') {
            updateSvCursor(currentSat, currentVal);
        }

        // Native picker sync
        var picker = document.getElementById('colorModalPicker');
        if (picker && picker.value.toLowerCase() !== norm.toLowerCase()) {
            picker.value = norm;
        }

        // Hex input field
        if (updateHexInput && source !== 'hexInput') {
            var hexInput = document.getElementById('colorModalHex');
            if (hexInput) {
                hexInput.value = norm.replace(/^#/, '');
                hexInput.classList.remove('invalid');
                hexInput.classList.add('valid');
            }
            var status = document.getElementById('colorModalHexStatus');
            if (status) {
                status.textContent = '';
                status.className = 'color-hex-status valid';
            }
        }

        // RGB channel sliders sync
        if (source !== 'rgbSlider') {
            var rSlider = document.getElementById('colorModalRSlider');
            var gSlider = document.getElementById('colorModalGSlider');
            var bSlider = document.getElementById('colorModalBSlider');
            if (rSlider) rSlider.value = rgb.r;
            if (gSlider) gSlider.value = rgb.g;
            if (bSlider) bSlider.value = rgb.b;
        }

        // RGB channel numeric fields sync
        if (source !== 'rgbInput') {
            var rInput = document.getElementById('colorModalR');
            var gInput = document.getElementById('colorModalG');
            var bInput = document.getElementById('colorModalB');
            if (rInput && document.activeElement !== rInput) rInput.value = rgb.r;
            if (gInput && document.activeElement !== gInput) gInput.value = rgb.g;
            if (bInput && document.activeElement !== bInput) bInput.value = rgb.b;
        }

        // Highlight matching swatch in Studio and Recent palettes
        var swatches = document.querySelectorAll('#colorModalSwatches .studio-color-swatch, #colorModalRecentSwatches .recent-color-swatch');
        swatches.forEach(function(swatch) {
            var sHex = swatch.getAttribute('data-hex');
            if (sHex && sHex.toUpperCase() === norm.toUpperCase()) {
                swatch.classList.add('active');
            } else {
                swatch.classList.remove('active');
            }
        });
    }

    /**
     * عرض مودال اختيار الألوان الاحترافي
     * @param {Object} options { title, value, onOK, targetInput }
     */
    function showColor(options) {
        if (!colorModal) return;
        options = options || {};

        var titleEl = document.getElementById('colorModalTitle');
        var prevBox = document.getElementById('colorModalPrevBox');
        var hexInput = document.getElementById('colorModalHex');

        var initialHex = normalizeHex(options.value) || '#FFFFFF';
        originalColor = initialHex;
        currentColor = initialHex;
        currentColorCallback = options.onOK || null;
        currentColorTargetInput = options.targetInput || null;

        if (titleEl) {
            titleEl.textContent = (options.title || 'SELECT COLOR').toUpperCase();
        }
        if (prevBox) {
            prevBox.style.backgroundColor = originalColor;
        }

        updateCurrentColor(currentColor, true);
        renderRecentColors();

        colorModal.style.display = 'flex';

        setTimeout(function() {
            drawSvCanvas();
            updateSvCursor(currentSat, currentVal);
            if (hexInput) {
                hexInput.focus();
                hexInput.select();
            }
        }, 30);
    }

    /**
     * إغلاق نافذة الألوان
     */
    function closeColorModal() {
        if (colorModal) {
            colorModal.style.display = 'none';
        }
        currentColorCallback = null;
        currentColorTargetInput = null;
    }

    /**
     * تأكيد وتطبيق اللون المختار
     */
    function submitColorModal() {
        var hexInput = document.getElementById('colorModalHex');
        var raw = hexInput ? hexInput.value : '';
        var norm = normalizeHex(raw) || currentColor || originalColor || '#FFFFFF';

        // Save to recent colors
        saveRecentColor(norm);
        renderRecentColors();

        if (currentColorTargetInput) {
            currentColorTargetInput.value = norm.toLowerCase();
            var box = currentColorTargetInput.closest('.precision-color-box');
            if (box) updateBoxVisual(box, currentColorTargetInput);

            currentColorTargetInput.dispatchEvent(new Event('input', { bubbles: true }));
            currentColorTargetInput.dispatchEvent(new Event('change', { bubbles: true }));
        }

        if (currentColorCallback) {
            currentColorCallback(norm);
        }

        closeColorModal();
    }

    /**
     * نسخ كود الـ Hex إلى الحافظة
     */
    function copyHexToClipboard() {
        var hexInput = document.getElementById('colorModalHex');
        var copyBtn = document.getElementById('btnColorCopyHex');
        var icon = copyBtn ? copyBtn.querySelector('i') : null;
        var val = hexInput ? hexInput.value.trim() : currentColor;
        var norm = normalizeHex(val) || currentColor;

        function showCopied() {
            if (!copyBtn) return;
            copyBtn.classList.add('copied');
            if (icon) {
                icon.className = 'ph-bold ph-check';
            }
            setTimeout(function() {
                copyBtn.classList.remove('copied');
                if (icon) {
                    icon.className = 'ph-bold ph-copy';
                }
            }, 1200);
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(norm).then(showCopied).catch(fallback);
        } else {
            fallback();
        }

        function fallback() {
            try {
                if (hexInput) {
                    hexInput.select();
                    document.execCommand('copy');
                    showCopied();
                }
            } catch(e) {
                TEXTORO.warn('Copy to clipboard failed: ' + e);
            }
        }
    }

    /**
     * تحديث المظهر المرئي لصندوق الألوان في اللوحة
     */
    function updateBoxVisual(box, input) {
        if (!box || !input) return;
        var hex = normalizeHex(input.value) || '#FFFFFF';

        var hexTag = box.querySelector('.ci-hex-code');
        if (!hexTag) {
            hexTag = document.createElement('span');
            hexTag.className = 'ci-hex-code';
            var wrap = box.querySelector('.color-picker-wrap');
            if (wrap) wrap.insertBefore(hexTag, input);
            else box.appendChild(hexTag);
        }
        hexTag.textContent = hex.toUpperCase();
        input.value = hex.toLowerCase();
        input.title = hex.toUpperCase();
    }

    /**
     * فتح المودال لعنصر لون محدد
     */
    function showColorForInput(input) {
        if (!input) return;
        var box = input.closest('.precision-color-box');
        var labelEl = box ? box.querySelector('.p-label') : null;
        var labelText = labelEl ? labelEl.textContent.trim() : '';

        var title = 'SELECT COLOR';
        var boxTitle = box ? (box.getAttribute('title') || '') : '';
        if (input.id === 'colorStroke' || input.id === 'inspStrokeColor' || input.id === 'sogaStrokeColor') {
            title = 'STROKE COLOR';
        } else if (input.id === 'colorFill' || input.id === 'inspFillColor' || input.id === 'sogaFillColor') {
            title = 'FILL COLOR';
        } else if (input.id === 'colorCursor' || input.id === 'inspCursorColor' || input.id === 'sogaCursorColor') {
            title = 'CURSOR COLOR';
        } else if (input.id === 'colorText' || input.id === 'inspTextColor' || input.id === 'sogaTextColor') {
            title = 'TEXT COLOR';
        } else if (boxTitle) {
            title = boxTitle.toUpperCase();
        } else if (labelText && labelText !== 'COLOR') {
            title = labelText + ' COLOR';
        } else if (input.title) {
            title = input.title;
        }

        showColor({
            title: title,
            value: input.value,
            targetInput: input
        });
    }

    /**
     * ربط جميع حقول الألوان في التطبيق بالنظام الجديد
     */
    function bindColorInputs() {
        var boxes = document.querySelectorAll('.precision-color-box');
        boxes.forEach(function(box) {
            var input = box.querySelector('input[type="color"], .ci');
            if (!input) return;

            updateBoxVisual(box, input);

            if (input._boundColorModal) return;
            input._boundColorModal = true;

            input.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                showColorForInput(input);
            });

            input.addEventListener('keydown', function(e) {
                if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    showColorForInput(input);
                }
            });

            box.addEventListener('click', function(e) {
                e.preventDefault();
                showColorForInput(input);
            });

            input.addEventListener('input', function() {
                updateBoxVisual(box, input);
            });

            input.addEventListener('change', function() {
                updateBoxVisual(box, input);
            });
        });
    }
    
    /**
     * عرض نافذة إدخال
     * @param {Object} options
     */
    function showInput(options) {
        if (!inputModal) return;
        
        var title = document.getElementById('inputModalTitle');
        var label = document.getElementById('inputModalLabel');
        var input = document.getElementById('inputModalValue');
        var iconRow = document.getElementById('inputModalIconRow');
        var iconInput = document.getElementById('inputModalIcon');
        
        if (title) title.textContent = options.title || 'Input';
        if (label) label.textContent = options.label || 'Value:';
        if (input) {
            input.value = options.value || '';
            input.placeholder = options.placeholder || '';
        }
        
        // Icon picker
        if (iconRow) {
            iconRow.style.display = options.showIcon ? 'flex' : 'none';
        }
        if (iconInput) {
            iconInput.value = options.icon || '📄';
        }
        
        currentInputCallback = options.onOK || null;
        
        inputModal.style.display = 'flex';
        if (input) input.focus();
    }
    
    /**
     * إغلاق نافذة الإدخال
     */
    function closeInputModal() {
        if (inputModal) {
            inputModal.style.display = 'none';
        }
        currentInputCallback = null;
    }
    
    /**
     * تأكيد نافذة الإدخال
     */
    function submitInputModal() {
        if (!inputModal) return;
        
        var input = document.getElementById('inputModalValue');
        var iconInput = document.getElementById('inputModalIcon');
        
        var value = input ? input.value.trim() : '';
        var icon = iconInput ? iconInput.value.trim() : '';
        
        if (currentInputCallback && value) {
            currentInputCallback(value, icon);
        }
        
        closeInputModal();
    }
    
    /**
     * عرض نافذة تأكيد
     * @param {Object} options
     */
    function showConfirm(options) {
        if (!confirmModal) return;
        
        var title = document.getElementById('confirmModalTitle');
        var message = document.getElementById('confirmModalMessage');
        
        if (title) title.textContent = options.title || 'Confirm';
        if (message) message.textContent = options.message || 'Are you sure?';
        
        currentConfirmCallback = options.onConfirm || null;
        
        confirmModal.style.display = 'flex';
    }
    
    /**
     * إغلاق نافذة التأكيد
     */
    function closeConfirmModal() {
        if (confirmModal) {
            confirmModal.style.display = 'none';
        }
        currentConfirmCallback = null;
    }
    
    /**
     * تأكيد نافذة التأكيد
     */
    function submitConfirmModal() {
        if (currentConfirmCallback) {
            currentConfirmCallback();
        }
        closeConfirmModal();
    }
    
    /**
     * تهيئة نافذة حفظ البريسات الذكية (Smart Preset Save Modal)
     */
    function initPresetSaveModal() {
        presetSaveModal = document.getElementById('presetSaveModal');
        if (!presetSaveModal) return;

        var okBtn = document.getElementById('btnPresetSaveOK');
        var cancelBtn = document.getElementById('btnPresetSaveCancel');
        var closeBtn = document.getElementById('btnClosePresetSave');
        var nameInput = document.getElementById('presetSaveNameInput');

        var chkType = document.getElementById('chkModuleType');
        var chkBox = document.getElementById('chkModuleBox');
        var chkMotion = document.getElementById('chkModuleMotion');
        var catSelect = document.getElementById('presetSaveCategorySelect');

        if (okBtn) okBtn.addEventListener('click', submitPresetSaveModal);
        if (cancelBtn) cancelBtn.addEventListener('click', closePresetSaveModal);
        if (closeBtn) closeBtn.addEventListener('click', closePresetSaveModal);

        if (nameInput) {
            nameInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') submitPresetSaveModal();
                if (e.key === 'Escape') closePresetSaveModal();
            });
        }

        if (catSelect) {
            catSelect.addEventListener('change', function() {
                var val = catSelect.value;
                if (val !== 'auto') {
                    applyCategoryToModules(val);
                }
                updatePresetSaveCategory();
            });
        }

        function onModuleToggle() {
            var s = document.getElementById('presetSaveCategorySelect');
            if (s) s.value = 'auto';
            updatePresetSaveCategory();
        }
        if (chkType) chkType.addEventListener('change', onModuleToggle);
        if (chkBox) chkBox.addEventListener('change', onModuleToggle);
        if (chkMotion) chkMotion.addEventListener('change', onModuleToggle);

        var iconBtns = document.querySelectorAll('#presetSaveIconsRow .preset-icon-choice');
        iconBtns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                iconBtns.forEach(function(b) { b.classList.remove('active'); });
                btn.classList.add('active');
                selectedPresetIcon = btn.getAttribute('data-icon') || 'ph-bold ph-sparkle';
            });
        });
    }

    /**
     * تفعيل الموديلات المناسبة للفئة المختارة يدوياً
     */
    function applyCategoryToModules(cat) {
        if (!presetSaveData) return;
        var chkType = document.getElementById('chkModuleType');
        var chkBox = document.getElementById('chkModuleBox');
        var chkMotion = document.getElementById('chkModuleMotion');

        if (cat === 'type') {
            if (chkType && presetSaveData.hasType) chkType.checked = true;
            if (chkBox) chkBox.checked = false;
            if (chkMotion) chkMotion.checked = false;
        } else if (cat === 'box') {
            if (chkType) chkType.checked = false;
            if (chkBox && presetSaveData.hasBox) chkBox.checked = true;
            if (chkMotion) chkMotion.checked = false;
        } else if (cat === 'motion') {
            if (chkType) chkType.checked = false;
            if (chkBox) chkBox.checked = false;
            if (chkMotion && presetSaveData.hasMotion) chkMotion.checked = true;
        } else if (cat === 'compound') {
            if (chkType && presetSaveData.hasType) chkType.checked = true;
            if (chkBox && presetSaveData.hasBox) chkBox.checked = true;
            if (chkMotion) chkMotion.checked = false;
        } else if (cat === 'templates') {
            if (chkType && presetSaveData.hasType) chkType.checked = true;
            if (chkBox && presetSaveData.hasBox) chkBox.checked = true;
            if (chkMotion && presetSaveData.hasMotion) chkMotion.checked = true;
        }
    }

    /**
     * تحديث فئة البريست ديناميكياً حسب الموديلات أو القائمة المنسدلة
     */
    function updatePresetSaveCategory() {
        var chkType = document.getElementById('chkModuleType');
        var chkBox = document.getElementById('chkModuleBox');
        var chkMotion = document.getElementById('chkModuleMotion');
        var badge = document.getElementById('presetSaveCategoryBadge');
        var catSelect = document.getElementById('presetSaveCategorySelect');
        var okBtn = document.getElementById('btnPresetSaveOK');

        var hasT = chkType && chkType.checked;
        var hasB = chkBox && chkBox.checked;
        var hasM = chkMotion && chkMotion.checked;

        var cat = 'templates';
        var label = 'TEMPLATES';

        if (catSelect && catSelect.value !== 'auto') {
            cat = catSelect.value;
            var catLabels = {
                'templates': 'TEMPLATES',
                'compound': 'COMPOUND',
                'type': 'TYPEWRITER',
                'box': 'BOX SHAPE',
                'motion': 'MOTION'
            };
            label = catLabels[cat] || cat.toUpperCase();
        } else {
            if (hasT && hasB && hasM) {
                cat = 'templates';
                label = 'TEMPLATES (FULL SUITE)';
            } else if (hasT && hasB) {
                cat = 'compound';
                label = 'COMPOUND (TYPE+BOX)';
            } else if (hasT && hasM) {
                cat = 'compound';
                label = 'COMPOUND (TYPE+MOTION)';
            } else if (hasB && hasM) {
                cat = 'compound';
                label = 'COMPOUND (BOX+MOTION)';
            } else if (hasT) {
                cat = 'type';
                label = 'TYPEWRITER';
            } else if (hasB) {
                cat = 'box';
                label = 'BOX SHAPE';
            } else if (hasM) {
                cat = 'motion';
                label = 'MOTION';
            } else {
                cat = '';
                label = 'SELECT AT LEAST 1';
            }
        }

        if (badge) {
            badge.className = 'preset-badge ' + (cat || '');
            badge.textContent = label;
        }

        if (okBtn) {
            var isValid = !!cat && (hasT || hasB || hasM);
            okBtn.disabled = !isValid;
            okBtn.style.opacity = isValid ? '1' : '0.4';
            okBtn.style.pointerEvents = isValid ? 'auto' : 'none';
        }

        return cat;
    }

    /**
     * عرض نافذة حفظ البريست الذكية
     */
    function showPresetSave(data, callback, preferredCategory) {
        if (!presetSaveModal) initPresetSaveModal();
        if (!presetSaveModal) return;

        presetSaveData = data || {};
        currentPresetSaveCallback = callback;

        var layerNameEl = document.getElementById('presetSaveLayerName');
        var nameInput = document.getElementById('presetSaveNameInput');
        var catSelect = document.getElementById('presetSaveCategorySelect');
        var chkType = document.getElementById('chkModuleType');
        var chkBox = document.getElementById('chkModuleBox');
        var chkMotion = document.getElementById('chkModuleMotion');
        var lblType = document.getElementById('lblModuleType');
        var lblBox = document.getElementById('lblModuleBox');
        var lblMotion = document.getElementById('lblModuleMotion');

        if (layerNameEl) layerNameEl.textContent = data.layerName || 'Selected Layer';
        
        if (chkType) {
            chkType.checked = !!data.hasType;
            chkType.disabled = !data.hasType;
            if (lblType) lblType.style.opacity = data.hasType ? '1' : '0.35';
        }
        if (chkBox) {
            chkBox.checked = !!data.hasBox;
            chkBox.disabled = !data.hasBox;
            if (lblBox) lblBox.style.opacity = data.hasBox ? '1' : '0.35';
        }
        if (chkMotion) {
            chkMotion.checked = !!data.hasMotion;
            chkMotion.disabled = !data.hasMotion;
            if (lblMotion) lblMotion.style.opacity = data.hasMotion ? '1' : '0.35';
        }

        selectedPresetIcon = 'ph-bold ph-sparkle';
        var iconBtns = document.querySelectorAll('#presetSaveIconsRow .preset-icon-choice');
        iconBtns.forEach(function(b, idx) {
            b.classList.toggle('active', idx === 0);
        });

        var cleanBase = (data.layerName || 'Preset').replace(/[^a-zA-Z0-9_\-\s]/g, '').trim();
        if (cleanBase.length > 25) cleanBase = cleanBase.substring(0, 25);
        if (nameInput) {
            nameInput.value = cleanBase ? cleanBase + ' Preset' : 'Custom Preset';
        }

        // تحديد الفئة المفضلة تلقائياً إن وجدت
        if (catSelect) {
            if (preferredCategory && ['type', 'box', 'motion', 'compound', 'templates'].indexOf(preferredCategory) !== -1) {
                catSelect.value = preferredCategory;
                applyCategoryToModules(preferredCategory);
            } else {
                catSelect.value = 'auto';
            }
        }

        updatePresetSaveCategory();

        presetSaveModal.style.display = 'flex';
        if (nameInput) {
            setTimeout(function() {
                nameInput.focus();
                nameInput.select();
            }, 60);
        }
    }

    /**
     * تأكيد وحفظ البريست
     */
    function submitPresetSaveModal() {
        var nameInput = document.getElementById('presetSaveNameInput');
        var name = nameInput ? nameInput.value.trim() : '';
        if (!name) {
            TEXTORO.UI.StatusBar.warning('Please enter a preset name');
            if (nameInput) nameInput.focus();
            return;
        }

        var cat = updatePresetSaveCategory();
        if (!cat) {
            TEXTORO.UI.StatusBar.warning('Please select at least one module');
            return;
        }

        var chkType = document.getElementById('chkModuleType');
        var chkBox = document.getElementById('chkModuleBox');
        var chkMotion = document.getElementById('chkModuleMotion');

        var includeType = chkType && chkType.checked && presetSaveData.values && presetSaveData.values.type;
        var includeBox = chkBox && chkBox.checked && presetSaveData.values && presetSaveData.values.box;
        var includeMotion = chkMotion && chkMotion.checked && presetSaveData.values && presetSaveData.values.motion;

        var finalValues = {};
        if (cat === 'templates') {
            finalValues = {
                type: presetSaveData.values.type,
                box: presetSaveData.values.box,
                motion: presetSaveData.values.motion
            };
        } else if (cat === 'compound') {
            finalValues = {};
            if (includeType) finalValues.type = presetSaveData.values.type;
            if (includeBox) finalValues.box = presetSaveData.values.box;
            if (includeMotion) finalValues.motion = presetSaveData.values.motion;
        } else if (cat === 'type') {
            finalValues = presetSaveData.values.type || {};
        } else if (cat === 'box') {
            finalValues = presetSaveData.values.box || {};
        } else if (cat === 'motion') {
            finalValues = presetSaveData.values.motion || {};
        }

        var resultPayload = {
            name: name,
            category: cat,
            icon: selectedPresetIcon,
            faIcon: selectedPresetIcon,
            values: finalValues
        };

        closePresetSaveModal();

        if (typeof currentPresetSaveCallback === 'function') {
            currentPresetSaveCallback(resultPayload);
        }
    }

    /**
     * إغلاق نافذة حفظ البريست
     */
    function closePresetSaveModal() {
        if (presetSaveModal) presetSaveModal.style.display = 'none';
        currentPresetSaveCallback = null;
        presetSaveData = null;
    }

    /**
     * إغلاق جميع النوافذ
     */
    function closeAll() {
        closeInputModal();
        closeConfirmModal();
        closeColorModal();
        closePresetSaveModal();
    }
    
    // Public API
    return {
        init: init,
        showInput: showInput,
        closeInput: closeInputModal,
        showConfirm: showConfirm,
        closeConfirm: closeConfirmModal,
        showColor: showColor,
        closeColor: closeColorModal,
        showColorForInput: showColorForInput,
        bindColorInputs: bindColorInputs,
        normalizeHex: normalizeHex,
        showPresetSave: showPresetSave,
        closePresetSave: closePresetSaveModal,
        closeAll: closeAll
    };
})();

// Aliases للتوافق
function initInputModal() {}
function initConfirmModal() {}
function initColorModal() {
    if (TEXTORO.UI && TEXTORO.UI.Modals) {
        TEXTORO.UI.Modals.init();
    }
}

function showInputModal(options) {
    TEXTORO.UI.Modals.showInput(options);
}

function closeInputModal() {
    TEXTORO.UI.Modals.closeInput();
}

function showConfirmModal(options) {
    TEXTORO.UI.Modals.showConfirm(options);
}

function closeConfirmModal() {
    TEXTORO.UI.Modals.closeConfirm();
}

function showColorModal(options) {
    TEXTORO.UI.Modals.showColor(options);
}

function closeColorModal() {
    TEXTORO.UI.Modals.closeColor();
}
