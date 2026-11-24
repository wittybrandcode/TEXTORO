/**
 * TEXTORO - Inspector Panel Module
 * Layer Inspector Panel (Live Layer Control & Property Tuning)
 * @version 3.3.0
 */

TEXTORO.Panels = TEXTORO.Panels || {};

TEXTORO.Panels.Inspector = (function() {
    'use strict';
    
    // Performance: Fast DOM Cache
    var _domCache = {};

    function getDom(id) {
        if (!_domCache[id]) {
            var el = document.getElementById(id);
            if (!el && id.indexOf('insp') === 0) {
                // Defensive fallback to legacy soga prefix
                el = document.getElementById('soga' + id.substring(4));
            } else if (!el && id.indexOf('btnInsp') === 0) {
                el = document.getElementById('btnSoga' + id.substring(7));
            } else if (!el && id.indexOf('subInsp') === 0) {
                el = document.getElementById('subSoga' + id.substring(7));
            }
            _domCache[id] = el;
        }
        return _domCache[id];
    }

    function clearDomCache() {
        _domCache = {};
    }

    // Module State
    var debounceTimer = null;
    var multiCount = 0;
    var boxUse4Corners = true;
    var formSnapshot = {}; // F-02: Snapshot of values at populate time to compute diffs only

    // Canonical Inspector Field IDs
    var INSPECTOR_FIELD_IDS = {
        typewriter: {
            twProgress: 'inspTwProgress', twAuto: 'inspTwAuto', twReverse: 'inspTwReverse',
            wordMode: 'inspWordMode', randomSpeed: 'inspRandomSpeed', showCursor: 'inspShowCursor',
            cursorBefore: 'inspCursorBefore', cursorColor: 'inspCursorColor',
            cursorSpacing: 'inspCursorSpacing', blinkSpeed: 'inspBlinkSpeed',
            textColor: 'inspTextColor',
            easingType: 'inspEasingType', easingStrength: 'inspEasingStrength',
            typeBlur: 'inspTypeBlur'
        },
        box: {
            paddingLeft: 'inspPadL', paddingRight: 'inspPadR', paddingTop: 'inspPadT', paddingBottom: 'inspPadB',
            cornerTL: 'inspCornerTL', cornerTR: 'inspCornerTR', cornerBR: 'inspCornerBR', cornerBL: 'inspCornerBL',
            strokeWidth: 'inspStrokeW', strokeOpacity: 'inspStrokeOp', strokeColor: 'inspStrokeColor',
            strokeDash: 'inspStrokeDash', strokeGap: 'inspStrokeGap', fillOpacity: 'inspFillOp',
            fillColor: 'inspFillColor', lockBoxSize: 'inspLockSize'
        },
        motion: {
            inStart: 'inspMotionInStart', inEnd: 'inspMotionInEnd', outStart: 'inspMotionOutStart', outEnd: 'inspMotionOutEnd',
            posEnable: 'inspMotionPosEnable', posFromX: 'inspMotionPosFromX', posFromY: 'inspMotionPosFromY',
            posToX: 'inspMotionPosToX', posToY: 'inspMotionPosToY', scaleEnable: 'inspMotionScaleEnable',
            scaleFrom: 'inspMotionScaleFrom', scaleTo: 'inspMotionScaleTo', rotEnable: 'inspMotionRotEnable',
            rotFrom: 'inspMotionRotFrom', rotTo: 'inspMotionRotTo', opacityEnable: 'inspMotionOpacityEnable',
            opacityFrom: 'inspMotionOpacityFrom', opacityTo: 'inspMotionOpacityTo',
            posOutFromX: 'inspMotionPosOutFromX', posOutFromY: 'inspMotionPosOutFromY',
            posOutToX: 'inspMotionPosOutToX', posOutToY: 'inspMotionPosOutToY',
            scaleOutFrom: 'inspMotionScaleOutFrom', scaleOutTo: 'inspMotionScaleOutTo',
            rotOutFrom: 'inspMotionRotOutFrom', rotOutTo: 'inspMotionRotOutTo',
            opacityOutFrom: 'inspMotionOpacityOutFrom', opacityOutTo: 'inspMotionOpacityOutTo',
            easingType: 'inspMotionEasingType', easingStrength: 'inspMotionEasingStrength',
            springStiffness: 'inspSpringStiffness', springDamping: 'inspSpringDamping',
            springMass: 'inspSpringMass', springVelocityBoost: 'inspSpringVelocityBoost'
        }
    };
    var SOGA_FIELD_IDS = INSPECTOR_FIELD_IDS; // Legacy backward alias

    var motionLinkModes = {
        pos: 0,
        scale: 0,
        rot: 0,
        opacity: 0
    };
    
    /**
     * Initialize Inspector Panel
     */
    function init() {
        clearDomCache();

        // Refresh button
        var btnRefresh = getDom('btnInspRefresh') || getDom('btnSogaRefresh');
        if (btnRefresh) btnRefresh.addEventListener('click', refresh);
        
        // Collapsible sections
        var headers = document.querySelectorAll('.coll-h');
        headers.forEach(function(header) {
            if (!header.onclick) {
                header.addEventListener('click', function() {
                    this.classList.toggle('open');
                });
            }
        });
        
        // Live Edit with high-frequency debouncing
        initLiveEdit();
        
        // Motion tabs
        initMotionTabs();
        
        TEXTORO.log('InspectorPanel initialized');
    }
    
    /**
     * Initialize Live Edit - apply property changes automatically
     */
    function initLiveEdit() {
        var inputIds = [
            // Typewriter
            'inspTwProgress', 'inspTwAuto', 'inspTwReverse', 'inspWordMode', 'inspRandomSpeed',
            'inspShowCursor', 'inspCursorBefore', 'inspCursorColor',
            'inspCursorSpacing', 'inspBlinkSpeed',
            'inspTextColor', 'inspEasingType', 'inspEasingStrength', 'inspTypeBlur',
            // Box
            'inspPadL', 'inspPadR', 'inspPadT', 'inspPadB',
            'inspCorner', 'inspCornerTL', 'inspCornerTR', 'inspCornerBL', 'inspCornerBR',
            'inspStrokeW', 'inspStrokeOp', 'inspStrokeColor', 'inspStrokeDash', 'inspStrokeGap',
            'inspFillOp', 'inspFillColor', 'inspLockSize',
            // Motion
            'inspMotionInStart', 'inspMotionInEnd', 'inspMotionOutStart', 'inspMotionOutEnd',
            'inspMotionPosEnable', 'inspMotionPosFromX', 'inspMotionPosFromY',
            'inspMotionPosToX', 'inspMotionPosToY', 'inspMotionScaleEnable', 'inspMotionScaleFrom',
            'inspMotionScaleTo', 'inspMotionRotEnable', 'inspMotionRotFrom', 'inspMotionRotTo',
            'inspMotionOpacityEnable', 'inspMotionOpacityFrom', 'inspMotionOpacityTo',
            'inspMotionPosOutFromX', 'inspMotionPosOutFromY', 'inspMotionPosOutToX', 'inspMotionPosOutToY',
            'inspMotionScaleOutFrom', 'inspMotionScaleOutTo', 'inspMotionRotOutFrom', 'inspMotionRotOutTo',
            'inspMotionOpacityOutFrom', 'inspMotionOpacityOutTo', 'inspMotionEasingType', 'inspMotionEasingStrength',
            'inspSpringStiffness', 'inspSpringDamping', 'inspSpringMass', 'inspSpringVelocityBoost'
        ];
        
        inputIds.forEach(function(id) {
            var el = getDom(id);
            if (!el) return;
            
            var eventType = (el.type === 'checkbox' || el.tagName === 'SELECT') ? 'change' : 'input';
            
            el.addEventListener(eventType, function() {
                if (debounceTimer) clearTimeout(debounceTimer);
                var delay = (TEXTORO.Config && TEXTORO.Config.TIMING && TEXTORO.Config.TIMING.INSPECTOR_DEBOUNCE_DELAY) || 
                            (TEXTORO.Config && TEXTORO.Config.TIMING && TEXTORO.Config.TIMING.SOGA_DEBOUNCE_DELAY) || 40;
                debounceTimer = setTimeout(function() {
                    applyChanges();
                }, delay);
            });
        });

        var inspEasingEl = getDom('inspMotionEasingType');
        var inspPhysDrawer = getDom('inspPhysicsDrawer');
        if (inspEasingEl && inspPhysDrawer) {
            inspEasingEl.addEventListener('change', function() {
                var v = parseInt(this.value, 10);
                inspPhysDrawer.style.display = (v === 6 || v === 7) ? 'block' : 'none';
            });
        }

        // Mutual exclusivity between Type Blur and Cursor
        var inspTypeBlurEl = getDom('inspTypeBlur');
        var inspShowCursorEl = getDom('inspShowCursor');
        if (inspTypeBlurEl) {
            inspTypeBlurEl.addEventListener('input', function() {
                var v = parseFloat(this.value) || 0;
                if (v > 0 && inspShowCursorEl) {
                    inspShowCursorEl.checked = false;
                    inspShowCursorEl.disabled = true;
                    var chip = inspShowCursorEl.closest('.studio-toggle-chip');
                    if (chip) chip.classList.add('disabled-by-blur');
                } else if (v <= 0 && inspShowCursorEl) {
                    inspShowCursorEl.disabled = false;
                    var chip = inspShowCursorEl.closest('.studio-toggle-chip');
                    if (chip) chip.classList.remove('disabled-by-blur');
                }
            });
        }
        if (inspShowCursorEl) {
            inspShowCursorEl.addEventListener('change', function() {
                if (this.checked && inspTypeBlurEl) {
                    inspTypeBlurEl.value = 0;
                }
            });
        }
        
        TEXTORO.log('Inspector Live Edit enabled');
    }
    
    /**
     * Initialize Motion Tabs in Inspector
     */
    function initMotionTabs() {
        var tabs = document.querySelectorAll('.inspector-motion-tab, .soga-motion-tab');
        tabs.forEach(function(tab) {
            tab.addEventListener('click', function() {
                var targetTab = this.getAttribute('data-tab');
                
                tabs.forEach(function(t) { t.classList.remove('active'); });
                this.classList.add('active');
                
                var inContent = getDom('inspMotionInContent');
                var outContent = getDom('inspMotionOutContent');
                
                if (targetTab === 'in') {
                    if (inContent) inContent.style.display = 'block';
                    if (outContent) outContent.style.display = 'none';
                } else {
                    if (inContent) inContent.style.display = 'none';
                    if (outContent) outContent.style.display = 'block';
                }
            });
        });
        
        // Save Motion button
        var btnSave = getDom('btnInspSaveMotion') || getDom('btnSogaSaveMotion');
        if (btnSave) {
            btnSave.addEventListener('click', saveMotionPreset);
        }
    }
    
    /**
     * Refresh Inspector Panel values from AE active selection
     */
    function refresh() {
        TEXTORO.HostBridge.run('getMultiSelectionInfo', null, function(selRes) {
            if (!selRes.success) {
                var errS = (selRes && selRes.error) || 'Unknown error';
                TEXTORO.error('[InspectorPanel] getMultiSelectionInfo failed: ' + errS);
                TEXTORO.UI.StatusBar.warning('Inspector: ' + errS);
            }
            var count = (selRes.success && selRes.data) ? selRes.data.count : 0;
            multiCount = count;
            
            if (count === 0) {
                showEmpty();
                return;
            }
            
            if (count > 1) {
                showMulti(count);
                return;
            }
            
            // Single layer inspection
            TEXTORO.HostBridge.run('getLayerEffectValues', null, function(res) {
                if (!res.success || !res.data || !res.data.layerName) {
                    showEmpty();
                    return;
                }
                
                var data = res.data;
                var layerNameEl = getDom('inspLayerName') || getDom('sogaLayerName');
                if (layerNameEl) layerNameEl.textContent = data.layerName;
                
                var hasAnyEffect = data.hasTypewriter || data.hasBox || data.hasMotion;
                
                var elEmpty = getDom('inspEmpty') || getDom('sogaEmpty');
                var elTw = getDom('inspTypewriter') || getDom('sogaTypewriter');
                var elBox = getDom('inspBox') || getDom('sogaBox');
                var elMotion = getDom('inspMotion') || getDom('sogaMotion');
                
                if (elEmpty) elEmpty.style.display = hasAnyEffect ? 'none' : 'block';
                if (elTw) elTw.style.display = data.hasTypewriter ? 'block' : 'none';
                if (elBox) elBox.style.display = data.hasBox ? 'block' : 'none';
                if (elMotion) elMotion.style.display = data.hasMotion ? 'block' : 'none';
                
                if (data.hasTypewriter && data.typewriter) {
                    populateTypewriter(data.typewriter);
                }
                
                if (data.hasBox && data.box) {
                    populateBox(data.box);
                }
                
                if (data.hasMotion && data.motion) {
                    populateMotion(data.motion);
                }

                formSnapshot = captureFormSnapshot();
                setButtonsEnabled(hasAnyEffect);
                if (TEXTORO.UI && TEXTORO.UI.NumberSpinners && typeof TEXTORO.UI.NumberSpinners.init === 'function') {
                    TEXTORO.UI.NumberSpinners.init();
                }
            });
        });
    }
    
    /**
     * Show multi-selection state
     */
    function showMulti(count) {
        var layerNameEl = getDom('inspLayerName') || getDom('sogaLayerName');
        if (layerNameEl) layerNameEl.textContent = count + ' layers selected';
        
        var elEmpty = getDom('inspEmpty') || getDom('sogaEmpty');
        var elTw = getDom('inspTypewriter') || getDom('sogaTypewriter');
        var elBox = getDom('inspBox') || getDom('sogaBox');
        var elMotion = getDom('inspMotion') || getDom('sogaMotion');

        if (elEmpty) elEmpty.style.display = 'none';
        if (elTw) elTw.style.display = 'block';
        if (elBox) elBox.style.display = 'block';
        if (elMotion) elMotion.style.display = 'none';

        populateTypewriter(TEXTORO.Defaults.typewriter);
        populateBox(TEXTORO.Defaults.box);

        formSnapshot = captureFormSnapshot();

        setButtonsEnabled(true);
        if (TEXTORO.UI && TEXTORO.UI.NumberSpinners && typeof TEXTORO.UI.NumberSpinners.init === 'function') {
            TEXTORO.UI.NumberSpinners.init();
        }
    }
    
    /**
     * Show empty state (no selection)
     */
    function showEmpty() {
        multiCount = 0;
        var layerNameEl = getDom('inspLayerName') || getDom('sogaLayerName');
        var elEmpty = getDom('inspEmpty') || getDom('sogaEmpty');
        var elTw = getDom('inspTypewriter') || getDom('sogaTypewriter');
        var elBox = getDom('inspBox') || getDom('sogaBox');
        var elMotion = getDom('inspMotion') || getDom('sogaMotion');
        
        if (layerNameEl) layerNameEl.textContent = 'No Selection';
        if (elEmpty) elEmpty.style.display = 'block';
        if (elTw) elTw.style.display = 'none';
        if (elBox) elBox.style.display = 'none';
        if (elMotion) elMotion.style.display = 'none';
        
        setButtonsEnabled(false);
    }
    
    /**
     * Populate Typewriter controls
     */
    function populateTypewriter(tw) {
        setValue('inspTwProgress', tw.twProgress);
        setChecked('inspTwAuto', tw.twAuto);
        setChecked('inspTwReverse', tw.twReverse);
        setChecked('inspWordMode', tw.wordMode || false);
        setValue('inspRandomSpeed', tw.randomSpeed);
        var isBlurOn = (tw.typeBlur != null && tw.typeBlur > 0);
        setValue('inspTypeBlur', (tw.typeBlur != null) ? tw.typeBlur : 0);
        var curEl = getDom('inspShowCursor');
        if (curEl) {
            if (isBlurOn) {
                curEl.checked = false;
                curEl.disabled = true;
                var chip = curEl.closest('.studio-toggle-chip');
                if (chip) chip.classList.add('disabled-by-blur');
            } else {
                curEl.disabled = false;
                var chip = curEl.closest('.studio-toggle-chip');
                if (chip) chip.classList.remove('disabled-by-blur');
                setChecked('inspShowCursor', tw.showCursor);
            }
        }
        setChecked('inspCursorBefore', tw.cursorBefore);
        setColor('inspCursorColor', tw.cursorColor);
        setValue('inspCursorSpacing', tw.cursorSpacing);
        setValue('inspBlinkSpeed', tw.blinkSpeed);
        setColor('inspTextColor', tw.textColor);
        setValue('inspEasingType', (tw.easingType != null) ? tw.easingType : 1);
        setValue('inspEasingStrength', (tw.easingStrength != null) ? tw.easingStrength : 100);
    }
    
    /**
     * Populate Box controls
     */
    function populateBox(bx) {
        setValue('inspPadL', bx.paddingLeft);
        setValue('inspPadR', bx.paddingRight);
        setValue('inspPadT', bx.paddingTop);
        setValue('inspPadB', bx.paddingBottom);
        
        var corners4Row = getDom('insp4CornersRow') || getDom('soga4CornersRow');
        var cornerSingleRow = getDom('inspSingleCornerRow') || getDom('sogaSingleCornerRow');
        
        if (bx.use4Corners) {
            if (corners4Row) corners4Row.style.display = '';
            if (cornerSingleRow) cornerSingleRow.style.display = 'none';
            setValue('inspCornerTL', (bx.cornerTL != null) ? bx.cornerTL : 15);
            setValue('inspCornerTR', (bx.cornerTR != null) ? bx.cornerTR : 15);
            setValue('inspCornerBR', (bx.cornerBR != null) ? bx.cornerBR : 15);
            setValue('inspCornerBL', (bx.cornerBL != null) ? bx.cornerBL : 15);
        } else {
            if (corners4Row) corners4Row.style.display = 'none';
            if (cornerSingleRow) cornerSingleRow.style.display = '';
            setValue('inspCorner', (bx.cornerRadius != null) ? bx.cornerRadius : 15);
        }
        
        boxUse4Corners = bx.use4Corners;
        
        setValue('inspStrokeW', bx.strokeWidth);
        setValue('inspStrokeOp', bx.strokeOpacity);
        setColor('inspStrokeColor', bx.strokeColor);
        setValue('inspStrokeDash', bx.strokeDash || 0);
        setValue('inspStrokeGap', bx.strokeGap || 0);
        setValue('inspFillOp', bx.fillOpacity);
        setColor('inspFillColor', bx.fillColor);
        setChecked('inspLockSize', bx.lockBoxSize);
    }
    
    /**
     * Populate Motion controls
     */
    function populateMotion(mt) {
        setValue('inspMotionInStart', mt.inStart != null ? mt.inStart : 0);
        setValue('inspMotionInEnd', mt.inEnd != null ? mt.inEnd : 1);
        setValue('inspMotionOutStart', mt.outStart != null ? mt.outStart : -1);
        setValue('inspMotionOutEnd', mt.outEnd != null ? mt.outEnd : -1);
        
        // Position IN
        setChecked('inspMotionPosEnable', mt.animatePosition || false);
        setValue('inspMotionPosFromX', mt.posFromX || 0);
        setValue('inspMotionPosFromY', mt.posFromY || 0);
        setValue('inspMotionPosToX', mt.posToX || 0);
        setValue('inspMotionPosToY', mt.posToY || 0);
        
        // Position OUT
        motionLinkModes.pos = (mt.posLinkMode != null) ? mt.posLinkMode : 0;
        var posLinkMode = motionLinkModes.pos;
        setValue('inspMotionPosOutFromX', posLinkMode === 0 ? (mt.posToX || 0) : (mt.posOutFromX || 0));
        setValue('inspMotionPosOutFromY', posLinkMode === 0 ? (mt.posToY || 0) : (mt.posOutFromY || 0));
        setValue('inspMotionPosOutToX', posLinkMode === 0 ? (mt.posFromX || 0) : (mt.posOutToX || 0));
        setValue('inspMotionPosOutToY', posLinkMode === 0 ? (mt.posFromY || 0) : (mt.posOutToY || 0));
        
        // Scale IN
        setChecked('inspMotionScaleEnable', mt.animateScale || false);
        setValue('inspMotionScaleFrom', mt.scaleFrom != null ? mt.scaleFrom : 100);
        setValue('inspMotionScaleTo', mt.scaleTo != null ? mt.scaleTo : 100);
        
        // Scale OUT
        motionLinkModes.scale = (mt.scaleLinkMode != null) ? mt.scaleLinkMode : 0;
        var scaleLinkMode = motionLinkModes.scale;
        setValue('inspMotionScaleOutFrom', scaleLinkMode === 0 ? (mt.scaleTo != null ? mt.scaleTo : 100) : (mt.scaleOutFrom != null ? mt.scaleOutFrom : 100));
        setValue('inspMotionScaleOutTo', scaleLinkMode === 0 ? (mt.scaleFrom != null ? mt.scaleFrom : 100) : (mt.scaleOutTo != null ? mt.scaleOutTo : 100));
        
        // Rotation IN
        setChecked('inspMotionRotEnable', mt.animateRotation || false);
        setValue('inspMotionRotFrom', mt.rotFrom || 0);
        setValue('inspMotionRotTo', mt.rotTo || 0);
        
        // Rotation OUT
        motionLinkModes.rot = (mt.rotLinkMode != null) ? mt.rotLinkMode : 0;
        var rotLinkMode = motionLinkModes.rot;
        setValue('inspMotionRotOutFrom', rotLinkMode === 0 ? (mt.rotTo || 0) : (mt.rotOutFrom || 0));
        setValue('inspMotionRotOutTo', rotLinkMode === 0 ? (mt.rotFrom || 0) : (mt.rotOutTo || 0));
        
        // Opacity IN
        setChecked('inspMotionOpacityEnable', mt.animateOpacity || false);
        setValue('inspMotionOpacityFrom', mt.opacityFrom != null ? mt.opacityFrom : 0);
        setValue('inspMotionOpacityTo', mt.opacityTo != null ? mt.opacityTo : 100);
        
        // Opacity OUT
        motionLinkModes.opacity = (mt.opacityLinkMode != null) ? mt.opacityLinkMode : 0;
        var opacityLinkMode = motionLinkModes.opacity;
        setValue('inspMotionOpacityOutFrom', opacityLinkMode === 0 ? (mt.opacityTo != null ? mt.opacityTo : 100) : (mt.opacityOutFrom != null ? mt.opacityOutFrom : 100));
        setValue('inspMotionOpacityOutTo', opacityLinkMode === 0 ? (mt.opacityFrom != null ? mt.opacityFrom : 0) : (mt.opacityOutTo != null ? mt.opacityOutTo : 0));
        
        // Easing & Physics
        var eType = mt.easingType != null ? mt.easingType : 1;
        setValue('inspMotionEasingType', eType);
        setValue('inspMotionEasingStrength', mt.easingStrength != null ? mt.easingStrength : 100);
        setValue('inspSpringStiffness', mt.springStiffness != null ? mt.springStiffness : 180);
        setValue('inspSpringDamping', mt.springDamping != null ? mt.springDamping : 18);
        setValue('inspSpringMass', mt.springMass != null ? mt.springMass : 1.0);
        setValue('inspSpringVelocityBoost', mt.springVelocityBoost != null ? mt.springVelocityBoost : 0);
        var physDrawer = getDom('inspPhysicsDrawer') || getDom('sogaPhysicsDrawer');
        if (physDrawer) {
            physDrawer.style.display = (eType === 6 || eType === 7) ? 'block' : 'none';
        }
    }
    
    /**
     * Enable / disable action buttons
     */
    function setButtonsEnabled(enabled) {
        var btnApply = getDom('btnInspApply') || getDom('btnSogaApply');
        if (btnApply) {
            btnApply.disabled = !enabled;
            btnApply.style.opacity = enabled ? '1' : '0.4';
            btnApply.style.pointerEvents = enabled ? 'auto' : 'none';
        }
    }
    
    /**
     * Capture form snapshot to compute diffs during live edit
     */
    function captureFormSnapshot() {
        var snap = {};
        ['typewriter', 'box', 'motion'].forEach(function(section) {
            var ids = INSPECTOR_FIELD_IDS[section];
            if (!ids) return;
            Object.keys(ids).forEach(function(key) {
                var id = ids[key];
                var el = getDom(id);
                if (!el) return;
                if (el.type === 'checkbox') {
                    snap[id] = el.checked;
                } else {
                    var num = parseFloat(el.value);
                    snap[id] = isNaN(num) ? String(el.value == null ? '' : el.value) : num;
                }
            });
        });
        return snap;
    }

    /**
     * Prune unchanged fields to isolate edits strictly to changed properties only
     */
    function pruneToChangedOnly(opts) {
        function fieldChanged(id) {
            var el = getDom(id);
            if (!el || !(id in formSnapshot)) return false;
            var cur;
            if (el.type === 'checkbox') {
                cur = el.checked;
            } else {
                var num = parseFloat(el.value);
                cur = isNaN(num) ? String(el.value == null ? '' : el.value) : num;
            }
            return cur !== formSnapshot[id];
        }

        ['typewriter', 'box', 'motion'].forEach(function(section) {
            if (!opts[section]) return;
            var ids = INSPECTOR_FIELD_IDS[section];
            if (!ids) return;
            Object.keys(opts[section]).forEach(function(key) {
                var id = ids[key];
                if (id && !fieldChanged(id)) delete opts[section][key];
            });
        });

        ['typewriter', 'box', 'motion'].forEach(function(section) {
            if (!opts[section]) return;
            var real = Object.keys(opts[section]).filter(function(k) {
                return k !== 'use4Corners' && opts[section][k] !== null && opts[section][k] !== undefined;
            });
            if (!real.length) delete opts[section];
        });
    }

    /**
     * Apply property changes to Host
     */
    function applyChanges() {
        var opts = {};
        var isMulti = multiCount > 1;
        
        function getNum(id, defaultVal) {
            var el = getDom(id);
            if (!el) return defaultVal;
            var val = el.value;
            if (val === '' || val === null || val === undefined) {
                return isMulti ? defaultVal : 0;
            }
            var num = parseFloat(val);
            return isNaN(num) ? (isMulti ? defaultVal : 0) : num;
        }
        function getChecked(id, def) {
            var el = getDom(id);
            return el ? el.checked : def;
        }
        function getValue(id, def) {
            var el = getDom(id);
            return el ? el.value : def;
        }
        function getInt(id, def) {
            var num = parseInt(getValue(id, ''), 10);
            return isNaN(num) ? def : num;
        }
        
        // Typewriter
        var elTw = getDom('inspTypewriter') || getDom('sogaTypewriter');
        if (elTw && elTw.style.display !== 'none') {
            var twD = TEXTORO.Defaults.typewriter;
            var tbVal = getNum('inspTypeBlur', twD.typeBlur || 0);
            opts.typewriter = {
                twProgress: getNum('inspTwProgress', twD.twProgress),
                twAuto: getChecked('inspTwAuto', false),
                twReverse: getChecked('inspTwReverse', false),
                wordMode: getChecked('inspWordMode', false),
                randomSpeed: getNum('inspRandomSpeed', twD.randomSpeed),
                showCursor: (tbVal > 0) ? false : getChecked('inspShowCursor', false),
                cursorBefore: getChecked('inspCursorBefore', false),
                cursorColor: hexToRgb(getValue('inspCursorColor', '#ffffff')),
                cursorSpacing: getNum('inspCursorSpacing', twD.cursorSpacing),
                blinkSpeed: getNum('inspBlinkSpeed', twD.blinkSpeed),
                blinkInHold: true,
                textColor: hexToRgb(getValue('inspTextColor', '#ffffff')),
                easingType: getInt('inspEasingType', 1),
                easingStrength: getNum('inspEasingStrength', 100),
                typeBlur: tbVal
            };
        }
        
        // Box
        var elBox = getDom('inspBox') || getDom('sogaBox');
        if (elBox && elBox.style.display !== 'none') {
            var bxD = TEXTORO.Defaults.box;
            var use4Corners = boxUse4Corners !== false;
            
            opts.box = {
                paddingLeft: getNum('inspPadL', bxD.paddingLeft),
                paddingRight: getNum('inspPadR', bxD.paddingRight),
                paddingTop: getNum('inspPadT', bxD.paddingTop),
                paddingBottom: getNum('inspPadB', bxD.paddingBottom),
                use4Corners: use4Corners,
                cornerRadius: use4Corners ? null : getNum('inspCorner', 15),
                cornerTL: use4Corners ? getNum('inspCornerTL', 15) : null,
                cornerTR: use4Corners ? getNum('inspCornerTR', 15) : null,
                cornerBR: use4Corners ? getNum('inspCornerBR', 15) : null,
                cornerBL: use4Corners ? getNum('inspCornerBL', 15) : null,
                strokeWidth: getNum('inspStrokeW', bxD.strokeWidth),
                strokeOpacity: getNum('inspStrokeOp', bxD.strokeOpacity),
                strokeColor: hexToRgb(getValue('inspStrokeColor', '#ffffff')),
                strokeDash: getNum('inspStrokeDash', 0),
                strokeGap: getNum('inspStrokeGap', 0),
                fillOpacity: getNum('inspFillOp', bxD.fillOpacity),
                fillColor: hexToRgb(getValue('inspFillColor', '#ffffff')),
                lockBoxSize: getChecked('inspLockSize', false)
            };
        }
        
        // Motion
        var elMotion = getDom('inspMotion') || getDom('sogaMotion');
        if (elMotion && elMotion.style.display !== 'none') {
            opts.motion = collectMotionValues();
        }

        // Always isolate edits strictly to changed fields only to avoid property clobbering
        pruneToChangedOnly(opts);
        if (!opts.typewriter && !opts.box && !opts.motion) {
            TEXTORO.log('No changed fields to apply');
            return;
        }

        TEXTORO.log('Inspector Apply, Multi: ' + multiCount);
        
        var funcName = (multiCount > 1) ? 'setLayerEffectValuesMulti' : 'setLayerEffectValues';
        
        TEXTORO.HostBridge.run(funcName, opts, function(res) {
            if (res.success) {
                formSnapshot = captureFormSnapshot();
                TEXTORO.UI.StatusBar.success('Changes applied');
            } else {
                TEXTORO.UI.StatusBar.error('Error: ' + (res.error || 'Failed'));
            }
        });
    }
    
    /**
     * Collect Motion values from Inspector
     */
    function collectMotionValues() {
        function getNumSafe(id, def) {
            var el = getDom(id);
            if (!el) return def;
            var val = parseFloat(el.value);
            return isNaN(val) ? def : val;
        }
        function getCheckedSafe(id, def) {
            var el = getDom(id);
            return el ? el.checked : def;
        }
        
        return {
            inStart: getNumSafe('inspMotionInStart', 0),
            inEnd: getNumSafe('inspMotionInEnd', 1),
            outStart: getNumSafe('inspMotionOutStart', -1),
            outEnd: getNumSafe('inspMotionOutEnd', -1),
            syncMode: 1, // Enforced: sync motion timing with markers
            animatePosition: getCheckedSafe('inspMotionPosEnable', false),
            posFromX: getNumSafe('inspMotionPosFromX', 0),
            posFromY: getNumSafe('inspMotionPosFromY', 0),
            posToX: getNumSafe('inspMotionPosToX', 0),
            posToY: getNumSafe('inspMotionPosToY', 0),
            posLinkMode: motionLinkModes.pos,
            posOutFromX: getNumSafe('inspMotionPosOutFromX', 0),
            posOutFromY: getNumSafe('inspMotionPosOutFromY', 0),
            posOutToX: getNumSafe('inspMotionPosOutToX', 0),
            posOutToY: getNumSafe('inspMotionPosOutToY', 0),
            animateScale: getCheckedSafe('inspMotionScaleEnable', false),
            scaleFrom: getNumSafe('inspMotionScaleFrom', 100),
            scaleTo: getNumSafe('inspMotionScaleTo', 100),
            scaleLinkMode: motionLinkModes.scale,
            scaleOutFrom: getNumSafe('inspMotionScaleOutFrom', 100),
            scaleOutTo: getNumSafe('inspMotionScaleOutTo', 100),
            animateRotation: getCheckedSafe('inspMotionRotEnable', false),
            rotFrom: getNumSafe('inspMotionRotFrom', 0),
            rotTo: getNumSafe('inspMotionRotTo', 0),
            rotLinkMode: motionLinkModes.rot,
            rotOutFrom: getNumSafe('inspMotionRotOutFrom', 0),
            rotOutTo: getNumSafe('inspMotionRotOutTo', 0),
            animateOpacity: getCheckedSafe('inspMotionOpacityEnable', false),
            opacityFrom: getNumSafe('inspMotionOpacityFrom', 0),
            opacityTo: getNumSafe('inspMotionOpacityTo', 100),
            opacityLinkMode: motionLinkModes.opacity,
            opacityOutFrom: getNumSafe('inspMotionOpacityOutFrom', 100),
            opacityOutTo: getNumSafe('inspMotionOpacityOutTo', 0),
            easingType: (function() {
                var easingEl = getDom('inspMotionEasingType');
                var easingVal = parseInt(easingEl ? easingEl.value : '', 10);
                return isNaN(easingVal) ? 1 : easingVal;
            })(),
            easingStrength: getNumSafe('inspMotionEasingStrength', 100),
            springStiffness: getNumSafe('inspSpringStiffness', 180),
            springDamping: getNumSafe('inspSpringDamping', 18),
            springMass: getNumSafe('inspSpringMass', 1.0),
            springVelocityBoost: getNumSafe('inspSpringVelocityBoost', 0),
            usePhysics: (function() {
                var easingEl = getDom('inspMotionEasingType');
                var easingVal = parseInt(easingEl ? easingEl.value : '', 10);
                return (easingVal === 6 || easingVal === 7);
            })()
        };
    }
    
    /**
     * Save Motion Preset from Inspector
     */
    function saveMotionPreset() {
        TEXTORO.UI.Modals.showInput({
            title: 'Save Motion Preset',
            label: 'Preset Name:',
            value: '',
            placeholder: 'My Motion Preset',
            showIcon: false,
            onOK: function(name, icon) {
                if (!name || !name.trim()) return;
                
                name = name.trim();
                var values = collectMotionValues();
                
                var presetData = {
                    category: 'motion',
                    name: name,
                    values: values
                };
                
                TEXTORO.HostBridge.run('savePreset', presetData, function(res) {
                    if (res.success) {
                        TEXTORO.UI.StatusBar.success('Motion preset "' + name + '" saved');
                        if (TEXTORO.Panels.Presets && TEXTORO.Panels.Presets.load) {
                            TEXTORO.Panels.Presets.load();
                        }
                    } else {
                        TEXTORO.UI.StatusBar.error('Error: ' + res.error);
                    }
                });
            }
        });
    }
    
    // Helper functions
    function setValue(id, value) {
        var el = getDom(id);
        if (el) el.value = value;
    }
    
    function setChecked(id, checked) {
        var el = getDom(id);
        if (el) el.checked = checked;
    }
    
    function setColor(id, rgbArray) {
        var el = getDom(id);
        if (el && rgbArray) {
            el.value = rgbToHex(rgbArray);
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }
    
    function rgbToHex(rgb) {
        return (TEXTORO.Utils && TEXTORO.Utils.rgbToHex) ? TEXTORO.Utils.rgbToHex(rgb) : '#ffffff';
    }

    function hexToRgb(hex) {
        return (TEXTORO.Utils && TEXTORO.Utils.hexToRgb) ? TEXTORO.Utils.hexToRgb(hex) : [1, 1, 1];
    }
    
    // Public API
    return {
        init: init,
        refresh: refresh,
        applyChanges: applyChanges,
        showEmpty: showEmpty,
        getMultiCount: function() { return multiCount; },
        clearDomCache: clearDomCache
    };
})();

// Backward compatibility aliases
TEXTORO.Panels.Soga = TEXTORO.Panels.Inspector;
window.initInspectorPanel = function() { TEXTORO.Panels.Inspector.init(); };
window.refreshInspectorPanel = function() { TEXTORO.Panels.Inspector.refresh(); };
window.applyInspectorChanges = function() { TEXTORO.Panels.Inspector.applyChanges(); };
window.initSogaPanel = window.initInspectorPanel;
window.refreshSogaPanel = window.refreshInspectorPanel;
window.refreshSogaFromLayer = window.refreshInspectorPanel;
window.applySogaChanges = window.applyInspectorChanges;
window.showSogaEmpty = function() { TEXTORO.Panels.Inspector.showEmpty(); };
var sogaMultiCount = 0;
var sogaDebounceTimer = null;
