/**
 * TEXTORO - Typewriter Panel Module
 * Typewriter Panel Controller with Live 2-Way Property Binding
 * @version 3.4.0
 */

TEXTORO.Panels = TEXTORO.Panels || {};

TEXTORO.Panels.Typewriter = (function() {
    'use strict';

    var _updateTimer = null;
    var _isUpdatingFromHost = false;
    var _layerSnapshot = null;

    function buildPayload(values) {
        return {
            twReverse: values.reverse,
            reverse: values.reverse,
            twWordByWord: values.wordMode,
            wordMode: values.wordMode,
            boxRTL: values.direction === 'rtl',
            direction: values.direction,
            showCursor: values.showCursor,
            cursorBefore: values.cursorBefore,
            cursorType: values.cursorType,
            customCursor: values.customCursor,
            cursorColor: values.cursorColor,
            cursorSpacing: values.cursorSpacing,
            blinkSpeed: values.blinkSpeed,
            blinkInHold: values.blinkInHold,
            randomSpeed: values.randomSpeed,
            typeBlur: values.typeBlur,
            easingType: values.easingType,
            easingStrength: values.easingStrength,
            applyTextColor: values.applyTextColor,
            textColor: values.applyTextColor ? values.textColor : undefined,
            customText: values.customText,
            inStart: values.inStart,
            inEnd: values.inEnd,
            outStart: values.outStart,
            outEnd: values.outEnd,
            noOut: values.noOut,
            blinkStart: values.blinkStart,
            blinkEnd: values.blinkEnd
        };
    }

    function formatHostError(res, fallback) {
        var msg = (res && res.error) || fallback || 'Unknown error';
        if (res && res.bootstrapError) msg += ' | bootstrap=' + res.bootstrapError;
        if (res && res.rawResult) msg += ' | raw=' + String(res.rawResult);
        return msg;
    }
    
    /**
     * Initialize Typewriter Panel
     */
    function init() {
        bindEvents();
        TEXTORO.log('TypewriterPanel initialized');
    }
    
    /**
     * Bind UI Events & Live Edit Listeners
     */
    function bindEvents() {
        // Direction buttons
        var btnLTR = document.getElementById('btnLTR');
        var btnRTL = document.getElementById('btnRTL');
        
        if (btnLTR) {
            btnLTR.addEventListener('click', function() {
                setDirection('ltr');
                if (!_isUpdatingFromHost) {
                    debouncedUpdate(50);
                    if (TEXTORO.UI && TEXTORO.UI.SubBar && TEXTORO.UI.SubBar.syncTypewriter) {
                        TEXTORO.UI.SubBar.syncTypewriter();
                    }
                }
            });
        }
        if (btnRTL) {
            btnRTL.addEventListener('click', function() {
                setDirection('rtl');
                if (!_isUpdatingFromHost) {
                    debouncedUpdate(50);
                    if (TEXTORO.UI && TEXTORO.UI.SubBar && TEXTORO.UI.SubBar.syncTypewriter) {
                        TEXTORO.UI.SubBar.syncTypewriter();
                    }
                }
            });
        }
        
        // Cursor type change - show/hide custom cursor input & live sync
        var cursorType = document.getElementById('selCursorType');
        var customInput = document.getElementById('txtCustomCursor');
        
        if (cursorType) {
            cursorType.addEventListener('change', function() {
                if (customInput) {
                    customInput.style.display = this.value === 'custom' ? 'inline-block' : 'none';
                    if (this.value === 'custom') {
                        customInput.focus();
                    }
                }
                if (!_isUpdatingFromHost) debouncedUpdate(50);
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

        // Type blur slider value display & subbar sync & cursor mutual exclusivity
        var rangeTypeBlur = document.getElementById('rangeTypeBlur');
        var valTypeBlur = document.getElementById('valTypeBlur');
        var subTypeBlur = document.getElementById('subTypeBlur');
        if (rangeTypeBlur && valTypeBlur) {
            rangeTypeBlur.addEventListener('input', function() {
                var curB = parseFloat(this.value) || 0;
                valTypeBlur.textContent = curB + 'px';
                if (subTypeBlur) {
                    subTypeBlur.classList.toggle('active', curB > 0);
                }
                var chkCur = document.getElementById('chkCursor');
                var subCur = document.getElementById('subTypeCursor');
                if (curB > 0) {
                    if (chkCur && chkCur.checked) {
                        chkCur.checked = false;
                    }
                    if (chkCur) {
                        chkCur.disabled = true;
                        var chip = chkCur.closest('.studio-toggle-chip');
                        if (chip) chip.classList.add('disabled-by-blur');
                    }
                    if (subCur) {
                        subCur.classList.remove('active');
                        subCur.setAttribute('disabled', 'true');
                        subCur.style.opacity = '0.35';
                        subCur.style.pointerEvents = 'none';
                    }
                } else {
                    if (chkCur) {
                        chkCur.disabled = false;
                        var chip = chkCur.closest('.studio-toggle-chip');
                        if (chip) chip.classList.remove('disabled-by-blur');
                    }
                    if (subCur) {
                        subCur.removeAttribute('disabled');
                        subCur.style.opacity = '';
                        subCur.style.pointerEvents = '';
                    }
                }
            });
        }

        // Mutual exclusivity: Checking cursor resets Type Blur to 0
        var chkCursorEl = document.getElementById('chkCursor');
        if (chkCursorEl) {
            chkCursorEl.addEventListener('change', function() {
                if (this.checked && rangeTypeBlur) {
                    rangeTypeBlur.value = 0;
                    if (valTypeBlur) valTypeBlur.textContent = '0px';
                    if (subTypeBlur) subTypeBlur.classList.remove('active');
                }
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

        // Live typing text update with gentle debounce
        var txtInput = document.getElementById('txtInput');
        if (txtInput) {
            var textDebounce = null;
            txtInput.addEventListener('input', function() {
                if (_isUpdatingFromHost) return;
                if (textDebounce) clearTimeout(textDebounce);
                textDebounce = setTimeout(function() {
                    var val = txtInput.value.trim();
                    if (val.length > 0) {
                        debouncedUpdate(100);
                    }
                }, 500);
            });
        }

        // Live input listeners for all numeric, select & checkbox controls
        var liveControlIds = [
            'numInStart', 'numInEnd', 'numOutStart', 'numOutEnd', 'chkNoOut',
            'chkCursor', 'chkCursorBefore', 'selCursorType', 'txtCustomCursor',
            'numCursorSpacing', 'numBlinkSpeed', 'numBlinkStart', 'numBlinkEnd',
            'chkReverse', 'chkWordMode', 'rangeRandom', 'rangeTypeBlur',
            'chkTextColor', 'selEasingType', 'numEasingStrength'
        ];

        liveControlIds.forEach(function(id) {
            var el = document.getElementById(id);
            if (!el) return;

            el.addEventListener('input', function() {
                if (_isUpdatingFromHost) return;
                debouncedUpdate(150);
                if (TEXTORO.UI && TEXTORO.UI.SubBar && TEXTORO.UI.SubBar.syncTypewriter) {
                    TEXTORO.UI.SubBar.syncTypewriter();
                }
            });

            el.addEventListener('change', function() {
                if (_isUpdatingFromHost) return;
                debouncedUpdate(50);
                if (TEXTORO.UI && TEXTORO.UI.SubBar && TEXTORO.UI.SubBar.syncTypewriter) {
                    TEXTORO.UI.SubBar.syncTypewriter();
                }
            });
        });

        // Color controls
        ['colorCursor', 'colorText'].forEach(function(id) {
            var el = document.getElementById(id);
            if (!el) return;

            function updateHexDisplay() {
                var box = el.closest('.precision-color-box');
                if (box) {
                    var hexSpan = box.querySelector('.ci-hex-code');
                    if (hexSpan) hexSpan.textContent = el.value.toUpperCase();
                }
            }

            el.addEventListener('input', function() {
                updateHexDisplay();
                if (_isUpdatingFromHost) return;
                debouncedUpdate(150);
            });

            el.addEventListener('change', function() {
                updateHexDisplay();
                if (_isUpdatingFromHost) return;
                debouncedUpdate(50);
            });
        });
    }
    
    /**
     * Set Direction
     */
    function setDirection(dir) {
        var btnLTR = document.getElementById('btnLTR');
        var btnRTL = document.getElementById('btnRTL');
        
        if (btnLTR) btnLTR.classList.toggle('active', dir === 'ltr');
        if (btnRTL) btnRTL.classList.toggle('active', dir === 'rtl');
        
        var cursorBeforeCheckbox = document.getElementById('chkCursorBefore');
        if (cursorBeforeCheckbox && !_isUpdatingFromHost) {
            cursorBeforeCheckbox.checked = (dir === 'rtl');
        }
        
        TEXTORO.log('Direction set to: ' + dir);
    }
    
    /**
     * Get Direction
     */
    function getDirection() {
        var btnRTL = document.getElementById('btnRTL');
        return (btnRTL && btnRTL.classList.contains('active')) ? 'rtl' : 'ltr';
    }
    
    /**
     * Get Cursor Type
     */
    function getCursorType() {
        var sel = document.getElementById('selCursorType');
        if (!sel) return 0;
        if (sel.value === 'custom') return -1;
        return parseInt(sel.value, 10) || 0;
    }
    
    /**
     * Helper to strip cursor symbols and ZWJ from text
     */
    function stripCursorFromText(text) {
        if (!text) return '';
        var cursors = ['|', '_', '\u2588', '\u258C', '\u258E', '\u25CF', '\u25C6', '\u200D'];
        var s = String(text).trim();
        for (var i = 0; i < cursors.length; i++) {
            if (s === cursors[i]) return '';
        }
        for (var j = 0; j < cursors.length; j++) {
            var c = cursors[j];
            if (s.length > c.length && s.slice(-c.length) === c) {
                s = s.slice(0, -c.length).trim();
            }
            if (s.length > c.length && s.slice(0, c.length) === c) {
                s = s.slice(c.length).trim();
            }
        }
        return s;
    }

    /**
     * Get Layer Text
     */
    function getTextFromLayer() {
        TEXTORO.HostBridge.run('getLayerText', null, function(res) {
            if (res.success && res.data) {
                var clean = stripCursorFromText(res.data);
                if (clean) {
                    var txtInput = document.getElementById('txtInput');
                    if (txtInput) txtInput.value = clean;
                    TEXTORO.UI.StatusBar.success('Text loaded');
                } else {
                    TEXTORO.UI.StatusBar.warn('No text content on selected layer');
                }
            } else {
                TEXTORO.UI.StatusBar.error('Error: ' + formatHostError(res, 'No text layer selected'));
            }
        });
    }
    
    /**
     * Update Layer Text
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
     * Get Time Value in seconds
     */
    function getTimeNum(inputId, defaultVal) {
        return TEXTORO.Time.getInputSeconds(inputId, defaultVal);
    }
    
    /**
     * Collect Typewriter values from DOM
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
            var val = parseInt(el.value, 10);
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
            blinkInHold: true,
            // Advanced options
            reverse: getChk('chkReverse'),
            wordMode: getChk('chkWordMode'),
            randomSpeed: getNum('rangeRandom', 0),
            typeBlur: getNum('rangeTypeBlur', 0),
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
     * Debounced live update to active layer
     */
    function debouncedUpdate(delay) {
        if (_updateTimer) clearTimeout(_updateTimer);
        _updateTimer = setTimeout(function() {
            update();
        }, delay || 150);
    }

    /**
     * Update active layer typewriter properties live
     */
    function update(callback) {
        var values = getValues();
        var fullPayload = buildPayload(values);
        var payload = (TEXTORO.Utils && typeof TEXTORO.Utils.diffObjects === 'function')
            ? TEXTORO.Utils.diffObjects(fullPayload, _layerSnapshot, [
                ['inStart', 'inEnd', 'outStart', 'outEnd', 'noOut', 'blinkStart', 'blinkEnd'],
                ['cursorType', 'customCursor'],
                ['applyTextColor', 'textColor']
            ])
            : fullPayload;

        if (!Object.keys(payload).length) {
            if (typeof callback === 'function') callback({ success: true });
            return;
        }

        TEXTORO.HostBridge.run('setLayerEffectValues', { typewriter: payload }, function(res) {
            if (res && res.success) {
                _layerSnapshot = fullPayload;
                TEXTORO.log('Typewriter properties updated on layer');
            }
            if (typeof callback === 'function') callback(res);
        });
    }

    /**
     * Synchronize DOM fields from active AE layer
     */
    function syncFromLayer(callback) {
        TEXTORO.HostBridge.run('getLayerEffectValues', null, function(res) {
            if (!res || !res.success || !res.data || !res.data.typewriter) {
                _layerSnapshot = null;
                if (typeof callback === 'function') callback(false, res);
                return;
            }

            var tw = res.data.typewriter;
            _isUpdatingFromHost = true;

            try {
                function setNum(id, val) {
                    var el = document.getElementById(id);
                    if (el && val !== undefined && val !== null) el.value = val;
                }
                function setChk(id, val) {
                    var el = document.getElementById(id);
                    if (el && val !== undefined && val !== null) el.checked = !!val;
                }
                function setColor(id, rgbArr) {
                    var el = document.getElementById(id);
                    if (!el || !rgbArr) return;
                    var hex = TEXTORO.Utils.rgbToHex(rgbArr);
                    el.value = hex.toLowerCase();
                    var boxWrap = el.closest('.precision-color-box');
                    if (boxWrap) {
                        var hexSpan = boxWrap.querySelector('.ci-hex-code');
                        if (hexSpan) hexSpan.textContent = hex.toUpperCase();
                    }
                }

                if (tw.text !== undefined && tw.text !== null) {
                    var cleanTwText = stripCursorFromText(tw.text);
                    if (cleanTwText) {
                        var txtInput = document.getElementById('txtInput');
                        if (txtInput) txtInput.value = cleanTwText;
                    }
                }

                setDirection(tw.boxRTL ? 'rtl' : 'ltr');
                setChk('chkReverse', tw.twReverse);
                setChk('chkWordMode', tw.twWordByWord);

                var rangeRandom = document.getElementById('rangeRandom');
                var valRandom = document.getElementById('valRandom');
                if (rangeRandom && valRandom && tw.randomSpeed !== undefined) {
                    rangeRandom.value = tw.randomSpeed;
                    valRandom.textContent = tw.randomSpeed + '%';
                }

                var rangeTypeBlur = document.getElementById('rangeTypeBlur');
                var valTypeBlur = document.getElementById('valTypeBlur');
                var subTypeBlur = document.getElementById('subTypeBlur');
                var chkCur = document.getElementById('chkCursor');
                var subCur = document.getElementById('subTypeCursor');
                if (rangeTypeBlur && valTypeBlur && tw.typeBlur !== undefined) {
                    var curB = tw.typeBlur || 0;
                    rangeTypeBlur.value = curB;
                    valTypeBlur.textContent = curB + 'px';
                    if (subTypeBlur) {
                        subTypeBlur.classList.toggle('active', curB > 0);
                    }
                    if (curB > 0) {
                        if (chkCur) {
                            chkCur.checked = false;
                            chkCur.disabled = true;
                            var chip = chkCur.closest('.studio-toggle-chip');
                            if (chip) chip.classList.add('disabled-by-blur');
                        }
                        if (subCur) {
                            subCur.classList.remove('active');
                            subCur.setAttribute('disabled', 'true');
                            subCur.style.opacity = '0.35';
                            subCur.style.pointerEvents = 'none';
                        }
                    } else {
                        if (chkCur) {
                            chkCur.disabled = false;
                            var chip = chkCur.closest('.studio-toggle-chip');
                            if (chip) chip.classList.remove('disabled-by-blur');
                        }
                        if (subCur) {
                            subCur.removeAttribute('disabled');
                            subCur.style.opacity = '';
                            subCur.style.pointerEvents = '';
                        }
                    }
                }

                if (tw.typeBlur <= 0) {
                    setChk('chkCursor', tw.showCursor);
                } else {
                    setChk('chkCursor', false);
                }
                setChk('chkCursorBefore', tw.cursorBefore);

                var selCursor = document.getElementById('selCursorType');
                var txtCustom = document.getElementById('txtCustomCursor');
                if (selCursor) {
                    if (tw.cursorType === -1) {
                        selCursor.value = 'custom';
                        if (txtCustom) {
                            txtCustom.value = tw.customCursor || '';
                            txtCustom.style.display = 'inline-block';
                        }
                    } else {
                        selCursor.value = String(Math.round(tw.cursorType || 0));
                        if (txtCustom) txtCustom.style.display = 'none';
                    }
                }

                setColor('colorCursor', tw.cursorColor);
                setNum('numCursorSpacing', tw.cursorSpacing);
                setNum('numBlinkSpeed', tw.blinkSpeed);

                setChk('chkTextColor', !!tw.applyTextColor);
                setColor('colorText', tw.textColor);

                var selEase = document.getElementById('selEasingType');
                if (selEase && tw.easingType !== undefined) {
                    selEase.value = String(Math.round(tw.easingType));
                }
                setNum('numEasingStrength', tw.easingStrength);

                if (tw.timing) {
                    setNum('numInStart', tw.timing.inStart);
                    setNum('numInEnd', tw.timing.inEnd);
                    setChk('chkNoOut', tw.timing.noOut);
                    if (!tw.timing.noOut) {
                        setNum('numOutStart', tw.timing.outStart);
                        setNum('numOutEnd', tw.timing.outEnd);
                    }
                    setNum('numBlinkStart', tw.timing.blinkStart);
                    setNum('numBlinkEnd', tw.timing.blinkEnd);
                }

                if (TEXTORO.UI && TEXTORO.UI.SubBar && TEXTORO.UI.SubBar.syncTypewriter) {
                    TEXTORO.UI.SubBar.syncTypewriter();
                }

                _layerSnapshot = buildPayload(getValues());
                TEXTORO.log('TypewriterPanel synced from active layer');
            } catch(e) {
                TEXTORO.error('Error syncing TypewriterPanel from layer: ' + e);
            } finally {
                _isUpdatingFromHost = false;
            }

            if (typeof callback === 'function') callback(true, res.data);
        });
    }

    /**
     * Apply Typewriter
     */
    function apply() {
        var opts = getValues();
        TEXTORO.log('applyTypewriter opts: ' + JSON.stringify(opts));
        
        TEXTORO.HostBridge.run('getMultiSelectionInfo', null, function(selRes) {
            if (!selRes.success) {
                var errT = (selRes && selRes.error) || 'Unknown error';
                TEXTORO.error('[TypewriterPanel] getMultiSelectionInfo failed: ' + errT);
                TEXTORO.UI.StatusBar.warning('Type: ' + errT);
            }
            var count = (selRes.success && selRes.data) ? selRes.data.count : 1;
            
            if (count > 1) {
                TEXTORO.log('Multi Apply: ' + count + ' layers');
                TEXTORO.HostBridge.run('applyTypewriterMulti', opts, function(res) {
                    if (res.success) {
                        TEXTORO.UI.StatusBar.success('Typewriter applied to ' + count + ' layers!');
                    } else {
                        TEXTORO.UI.StatusBar.error('Error: ' + formatHostError(res));
                    }
                });
            } else {
                TEXTORO.log('Single Apply');
                TEXTORO.HostBridge.run('applyTypewriter', opts, function(res) {
                    if (res.success) {
                        _layerSnapshot = buildPayload(getValues());
                        TEXTORO.UI.StatusBar.success('Typewriter applied!');
                    } else {
                        TEXTORO.UI.StatusBar.error('Error: ' + formatHostError(res));
                    }
                });
            }
        });
    }
    
    /**
     * Remove Typewriter
     */
    function remove() {
        TEXTORO.HostBridge.run('removeTypewriter', null, function(res) {
            if (res.success) {
                _layerSnapshot = null;
                TEXTORO.UI.StatusBar.success('Typewriter removed');
            } else {
                TEXTORO.UI.StatusBar.error('Error: ' + formatHostError(res));
            }
        });
    }
    
    // Public API
    return {
        init: init,
        getValues: getValues,
        update: update,
        debouncedUpdate: debouncedUpdate,
        syncFromLayer: syncFromLayer,
        apply: apply,
        remove: remove,
        setDirection: setDirection,
        getDirection: getDirection,
        getCursorType: getCursorType,
        getTextFromLayer: getTextFromLayer,
        updateTextInLayer: updateTextInLayer
    };
})();
