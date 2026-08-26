/**
 * TEXTORO - Box Panel Module
 * لوحة Box
 * @version 3.3.0
 */

TEXTORO.Panels = TEXTORO.Panels || {};

TEXTORO.Panels.Box = (function() {
    'use strict';
    
    /**
     * تهيئة اللوحة
     */
    function init() {
        bindEvents();
        TEXTORO.log('BoxPanel initialized');
    }
    
    /**
     * ربط الأحداث
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
                    // نسخ قيمة Radius إلى جميع الزوايا
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
    }
    
    /**
     * جمع القيم من الواجهة
     */
    function getValues() {
        var use4Corners = TEXTORO.Utils.getChecked('chk4Corners', false);
        var singleRadius = TEXTORO.Utils.getNum('numCorner', 15);
        
        // قراءة قيم الزوايا الأربع
        var cornerTL, cornerTR, cornerBL, cornerBR;
        
        if (use4Corners) {
            // قراءة القيم مباشرة من الحقول الأربعة
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
            fillColor: TEXTORO.Utils.hexToRgb(colorFillEl ? colorFillEl.value : '#ffffff'),
            trimStart: TEXTORO.Utils.getNum('numTrimStart', 0),
            trimEnd: TEXTORO.Utils.getNum('numTrimEnd', 100),
            trimOffset: TEXTORO.Utils.getNum('numTrimOffset', 0),
            pathOffset: TEXTORO.Utils.getNum('numPathOffset', 0), // C-03: كان الحقل مهملاً
            lockBoxSize: TEXTORO.Utils.getChecked('chkLockSize', true)
        };
    }
    
    /**
     * إنشاء Box
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
     * إزالة Box
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
        create: create,
        apply: create,  // Alias
        remove: remove
    };
})();

// Legacy aliases moved to js/legacy/aliases.js
