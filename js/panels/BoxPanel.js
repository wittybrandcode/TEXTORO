/**
 * TEXTORO - Box Panel Module
 * Box Panel Controller with Live 2-Way Property Binding
 * @version 3.4.0
 */

TEXTORO.Panels = TEXTORO.Panels || {};

TEXTORO.Panels.Box = (function() {
    'use strict';
    
    var _updateTimer = null;
    var _isUpdatingFromHost = false;

    /**
     * Initialize Box Panel
     */
    function init() {
        bindEvents();
        TEXTORO.log('BoxPanel initialized');
    }
    
    /**
     * Bind UI Events & Live Edit Listeners
     */
    function bindEvents() {
        // 4 Corners checkbox - toggle between single/4 corners mode
        var chk4Corners = document.getElementById('chk4Corners');
        if (chk4Corners) {
            chk4Corners.addEventListener('change', function() {
                var use4Corners = this.checked;
                var fourCornersRow = document.getElementById('fourCornersRow');
                var singleCornerRow = document.getElementById('singleCornerRow');
                
                if (use4Corners) {
                    if (fourCornersRow) fourCornersRow.style.display = '';
                    if (singleCornerRow) singleCornerRow.style.display = 'none';
                    var radiusEl = document.getElementById('numCorner');
                    var radiusVal = (radiusEl && radiusEl.value !== '') ? radiusEl.value : '15';
                    ['numCornerTL', 'numCornerTR', 'numCornerBL', 'numCornerBR'].forEach(function(id) {
                        var el = document.getElementById(id);
                        if (el) el.value = radiusVal;
                    });
                } else {
                    if (fourCornersRow) fourCornersRow.style.display = 'none';
                    if (singleCornerRow) singleCornerRow.style.display = '';
                }
            });
        }

        // Live input listeners for all numeric & checkbox controls
        var liveControlIds = [
            'numPadL', 'numPadR', 'numPadT', 'numPadB',
            'chk4Corners', 'numCorner', 'numCornerTL', 'numCornerTR', 'numCornerBL', 'numCornerBR',
            'numStrokeW', 'numStrokeOp', 'numStrokeDash', 'numStrokeGap',
            'numFillOp', 'numTrimStart', 'numTrimEnd', 'numTrimOffset', 'numPathOffset',
            'chkLockSize'
        ];

        liveControlIds.forEach(function(id) {
            var el = document.getElementById(id);
            if (!el) return;

            el.addEventListener('input', function() {
                if (_isUpdatingFromHost) return;
                debouncedUpdate(150);
                if (TEXTORO.UI && TEXTORO.UI.SubBar && TEXTORO.UI.SubBar.syncBox) {
                    TEXTORO.UI.SubBar.syncBox();
                }
            });

            el.addEventListener('change', function() {
                if (_isUpdatingFromHost) return;
                debouncedUpdate(50);
                if (TEXTORO.UI && TEXTORO.UI.SubBar && TEXTORO.UI.SubBar.syncBox) {
                    TEXTORO.UI.SubBar.syncBox();
                }
            });
        });

        // Color controls
        ['colorStroke', 'colorFill'].forEach(function(id) {
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
     * Collect Box values from DOM
     */
    function getValues() {
        var use4Corners = TEXTORO.Utils.getChecked('chk4Corners', false);
        var singleRadius = TEXTORO.Utils.getNum('numCorner', 15);
        
        var cornerTL, cornerTR, cornerBL, cornerBR;
        
        if (use4Corners) {
            var tlEl = document.getElementById('numCornerTL');
            var trEl = document.getElementById('numCornerTR');
            var blEl = document.getElementById('numCornerBL');
            var brEl = document.getElementById('numCornerBR');
            
            cornerTL = (tlEl && tlEl.value !== '') ? parseFloat(tlEl.value) : 15;
            cornerTR = (trEl && trEl.value !== '') ? parseFloat(trEl.value) : 15;
            cornerBL = (blEl && blEl.value !== '') ? parseFloat(blEl.value) : 15;
            cornerBR = (brEl && brEl.value !== '') ? parseFloat(brEl.value) : 15;
            
            if (isNaN(cornerTL)) cornerTL = 15;
            if (isNaN(cornerTR)) cornerTR = 15;
            if (isNaN(cornerBL)) cornerBL = 15;
            if (isNaN(cornerBR)) cornerBR = 15;
        }
        
        var colorStrokeEl = document.getElementById('colorStroke');
        var colorFillEl = document.getElementById('colorFill');
        
        return {
            paddingLeft: TEXTORO.Utils.getNum('numPadL', 40),
            paddingRight: TEXTORO.Utils.getNum('numPadR', 40),
            paddingTop: TEXTORO.Utils.getNum('numPadT', 20),
            paddingBottom: TEXTORO.Utils.getNum('numPadB', 20),
            use4Corners: use4Corners,
            cornerRadius: use4Corners ? null : singleRadius,
            cornerTL: use4Corners ? cornerTL : null,
            cornerTR: use4Corners ? cornerTR : null,
            cornerBL: use4Corners ? cornerBL : null,
            cornerBR: use4Corners ? cornerBR : null,
            strokeWidth: TEXTORO.Utils.getNum('numStrokeW', 2),
            strokeOpacity: TEXTORO.Utils.getNum('numStrokeOp', 100),
            strokeColor: TEXTORO.Utils.hexToRgb(colorStrokeEl ? colorStrokeEl.value : '#ffffff'),
            strokeDash: TEXTORO.Utils.getNum('numStrokeDash', 0),
            strokeGap: TEXTORO.Utils.getNum('numStrokeGap', 0),
            fillOpacity: TEXTORO.Utils.getNum('numFillOp', 100),
            fillColor: TEXTORO.Utils.hexToRgb(colorFillEl ? colorFillEl.value : '#10b981'),
            trimStart: TEXTORO.Utils.getNum('numTrimStart', 0),
            trimEnd: TEXTORO.Utils.getNum('numTrimEnd', 100),
            trimOffset: TEXTORO.Utils.getNum('numTrimOffset', 0),
            pathOffset: TEXTORO.Utils.getNum('numPathOffset', 0),
            lockBoxSize: TEXTORO.Utils.getChecked('chkLockSize', false),
            parentToText: true,
            autoResize: !TEXTORO.Utils.getChecked('chkLockSize', false),
            hideWhenEmpty: true
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
     * Update active layer box properties live
     */
    function update(callback) {
        var values = getValues();
        TEXTORO.HostBridge.run('setLayerEffectValues', { box: values }, function(res) {
            if (res && res.success) {
                TEXTORO.log('Box properties updated on layer');
            }
            if (typeof callback === 'function') callback(res);
        });
    }

    /**
     * Synchronize DOM fields from active AE layer
     */
    function syncFromLayer(callback) {
        TEXTORO.HostBridge.run('getLayerEffectValues', null, function(res) {
            if (!res || !res.success || !res.data || !res.data.box) {
                if (typeof callback === 'function') callback(false, res);
                return;
            }

            var box = res.data.box;
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

                setNum('numPadL', box.paddingLeft);
                setNum('numPadR', box.paddingRight);
                setNum('numPadT', box.paddingTop);
                setNum('numPadB', box.paddingBottom);

                setChk('chk4Corners', box.use4Corners);
                var fourCornersRow = document.getElementById('fourCornersRow');
                var singleCornerRow = document.getElementById('singleCornerRow');
                if (box.use4Corners) {
                    if (fourCornersRow) fourCornersRow.style.display = '';
                    if (singleCornerRow) singleCornerRow.style.display = 'none';
                    setNum('numCornerTL', box.cornerTL != null ? box.cornerTL : 15);
                    setNum('numCornerTR', box.cornerTR != null ? box.cornerTR : 15);
                    setNum('numCornerBL', box.cornerBL != null ? box.cornerBL : 15);
                    setNum('numCornerBR', box.cornerBR != null ? box.cornerBR : 15);
                } else {
                    if (fourCornersRow) fourCornersRow.style.display = 'none';
                    if (singleCornerRow) singleCornerRow.style.display = '';
                    setNum('numCorner', box.cornerRadius != null ? box.cornerRadius : 15);
                }

                setNum('numStrokeW', box.strokeWidth);
                setNum('numStrokeOp', box.strokeOpacity);
                setColor('colorStroke', box.strokeColor);
                setNum('numStrokeDash', box.strokeDash);
                setNum('numStrokeGap', box.strokeGap);

                setNum('numFillOp', box.fillOpacity);
                setColor('colorFill', box.fillColor);

                setNum('numTrimStart', box.trimStart);
                setNum('numTrimEnd', box.trimEnd);
                setNum('numTrimOffset', box.trimOffset);
                setNum('numPathOffset', box.pathOffset);

                setChk('chkLockSize', box.lockBoxSize);

                if (TEXTORO.UI && TEXTORO.UI.SubBar && TEXTORO.UI.SubBar.syncBox) {
                    TEXTORO.UI.SubBar.syncBox();
                }

                TEXTORO.log('BoxPanel synced from active layer');
            } catch(e) {
                TEXTORO.error('Error syncing BoxPanel from layer: ' + e);
            } finally {
                _isUpdatingFromHost = false;
            }

            if (typeof callback === 'function') callback(true, res.data);
        });
    }

    /**
     * Create Box
     */
    function create() {
        var values = getValues();
        TEXTORO.UI.StatusBar.set('Creating Box...', '');
        
        TEXTORO.HostBridge.run('createBox', values, function(res) {
            if (res.success) {
                TEXTORO.UI.StatusBar.success('Box created!');
            } else {
                TEXTORO.UI.StatusBar.error('Error: ' + (res.error || 'Failed'));
            }
        });
    }
    
    /**
     * Remove Box
     */
    function remove() {
        TEXTORO.HostBridge.run('removeBox', null, function(res) {
            if (res.success) {
                TEXTORO.UI.StatusBar.success('Box removed');
            } else {
                TEXTORO.UI.StatusBar.error('Error: ' + (res.error || 'Failed'));
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
        create: create,
        apply: create,  // Alias
        remove: remove
    };
})();
