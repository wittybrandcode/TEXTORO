/**
 * TEXTORO - Action Bar Module
 * أزرار الإجراءات لكل تبويب - Industrial Slate Design System
 * @version 3.4.0
 */

TEXTORO.UI = TEXTORO.UI || {};

TEXTORO.UI.ActionBar = (function() {
    'use strict';
    
    var containerEl = null;

    // Phosphor Bold Icon Templates (Crisp 14px industrial studio icons)
    var PH_CHECK = '<i class="ph-bold ph-check"></i>';
    var PH_TRASH = '<i class="ph-bold ph-trash"></i>';
    var PH_LINES = '<i class="ph-bold ph-rows"></i>';
    var PH_SCISSORS = '<i class="ph-bold ph-scissors"></i>';
    var PH_PLUS = '<i class="ph-bold ph-plus"></i>';
    var PH_STAR = '<i class="ph-bold ph-sparkle"></i>';
    var PH_TYPE = '<i class="ph-bold ph-text-t"></i>';
    var PH_BOX = '<i class="ph-bold ph-bounding-box"></i>';
    var PH_LAYERS = '<i class="ph-bold ph-stack"></i>';
    var PH_WIND = '<i class="ph-bold ph-wave-sine"></i>';
    var PH_REFRESH = '<i class="ph-bold ph-arrow-counter-clockwise"></i>';
    
    /** أزرار كل تبويب */
    var tabActions = {
        type: '<button class="ab ab-icon ab-p square-icon-btn" id="btnApplyTypewriter" title="Apply Typewriter">' + PH_CHECK + '</button>' +
              '<button class="ab ab-icon ab-d square-icon-btn" id="btnRemoveTypewriter" title="Remove Typewriter">' + PH_TRASH + '</button>' +
              '<button class="ab ab-icon square-icon-btn" id="btnSplitOnly" title="Split Lines Only">' + PH_LINES + '</button>' +
              '<button class="ab ab-icon square-icon-btn" id="btnSplitApply" title="Split + Apply Typewriter">' + PH_SCISSORS + '</button>',
              
        box: '<button class="ab ab-icon ab-p square-icon-btn" id="btnCreateBox" title="Create Box">' + PH_PLUS + '</button>' +
             '<button class="ab ab-icon ab-d square-icon-btn" id="btnRemoveBox" title="Remove Box">' + PH_TRASH + '</button>',
             
        presets: '<button class="ab ab-icon ab-p square-icon-btn" id="btnPresetsApply" title="Apply to Selected Text">' + PH_CHECK + '</button>' +
                 '<button class="ab ab-icon square-icon-btn" id="btnPresetsNew" title="Create New Preset from Layer">' + PH_PLUS + '</button>',
               
        inspector: '<button class="ab ab-icon ab-p square-icon-btn" id="btnSogaApply" title="Apply Changes">' + PH_CHECK + '</button>' +
              '<button class="ab ab-icon square-icon-btn" id="btnSogaRefresh2" title="Refresh from Layer">' + PH_REFRESH + '</button>',
        soga: '<button class="ab ab-icon ab-p square-icon-btn" id="btnSogaApply" title="Apply Changes">' + PH_CHECK + '</button>' +
              '<button class="ab ab-icon square-icon-btn" id="btnSogaRefresh2" title="Refresh from Layer">' + PH_REFRESH + '</button>',
              
        markers: '<button class="ab ab-icon square-icon-btn" id="btnMarkersRefresh" title="Refresh Markers">' + PH_REFRESH + '</button>' +
                 '<button class="ab ab-icon ab-d square-icon-btn" id="btnMarkersDelete" title="Delete Selected Markers">' + PH_TRASH + '</button>',
                 
        motion: '<button class="ab ab-icon ab-p square-icon-btn" id="btnApplyMotion" title="Apply Motion">' + PH_CHECK + '</button>' +
                '<button class="ab ab-icon ab-d square-icon-btn" id="btnRemoveMotion" title="Remove Motion">' + PH_TRASH + '</button>',
                
        settings: ''
    };
    
    /**
     * تهيئة ActionBar
     */
    function init() {
        containerEl = document.getElementById('actionBtns');
        TEXTORO.log('ActionBar initialized');
    }
    
    /**
     * تحديث الأزرار حسب التبويب
     * @param {string} tabName
     */
    function update(tabName) {
        if (!containerEl) {
            containerEl = document.getElementById('actionBtns');
        }
        if (!containerEl) return;
        
        containerEl.innerHTML = tabActions[tabName] || '';
        
        // ربط الأحداث
        bindEvents(tabName);
    }
    
    /**
     * ربط أحداث الأزرار
     * @param {string} tabName
     */
    function bindEvents(tabName) {
        switch(tabName) {
            case 'type':
                bindClick('btnApplyTypewriter', function() {
                    if (typeof applyTypewriter === 'function') applyTypewriter();
                });
                bindClick('btnRemoveTypewriter', function() {
                    if (typeof removeTypewriter === 'function') removeTypewriter();
                });
                bindClick('btnSplitOnly', function() {
                    if (typeof splitLinesOnly === 'function') splitLinesOnly();
                });
                bindClick('btnSplitApply', function() {
                    if (typeof splitAndApply === 'function') splitAndApply();
                });
                break;
                
            case 'box':
                bindClick('btnCreateBox', function() {
                    if (typeof createBox === 'function') createBox();
                });
                bindClick('btnRemoveBox', function() {
                    if (typeof removeBox === 'function') removeBox();
                });
                break;
                
            case 'presets':
                bindClick('btnPresetsApply', function() {
                    if (TEXTORO.Panels && TEXTORO.Panels.Presets && typeof TEXTORO.Panels.Presets.applySelected === 'function') {
                        TEXTORO.Panels.Presets.applySelected();
                    }
                });
                bindClick('btnPresetsNew', function() {
                    if (TEXTORO.Panels && TEXTORO.Panels.Presets && typeof TEXTORO.Panels.Presets.createFromLayer === 'function') {
                        TEXTORO.Panels.Presets.createFromLayer();
                    }
                });
                break;
                
            case 'inspector':
            case 'soga':
                bindClick('btnSogaApply', function() {
                    if (TEXTORO.Panels && TEXTORO.Panels.Soga) {
                        TEXTORO.Panels.Soga.applyChanges();
                    } else if (typeof applySogaChanges === 'function') {
                        applySogaChanges();
                    }
                });
                bindClick('btnSogaRefresh2', function() {
                    if (TEXTORO.Panels && TEXTORO.Panels.Soga) {
                        TEXTORO.Panels.Soga.refresh();
                    } else if (typeof refreshSogaFromLayer === 'function') {
                        refreshSogaFromLayer();
                    }
                });
                break;
                
            case 'markers':
                bindClick('btnMarkersRefresh', function() {
                    if (TEXTORO.Panels && TEXTORO.Panels.Markers) {
                        TEXTORO.Panels.Markers.refresh();
                    } else if (typeof refreshMarkersTable === 'function') {
                        refreshMarkersTable(false);
                    }
                });
                bindClick('btnMarkersDelete', function() {
                    if (TEXTORO.Ops && TEXTORO.Ops.Markers) {
                        TEXTORO.Ops.Markers.delete();
                    } else if (typeof deleteSelectedMarkers === 'function') {
                        deleteSelectedMarkers();
                    }
                });
                break;
                
            case 'motion':
                bindClick('btnApplyMotion', function() {
                    if (typeof applyMotion === 'function') applyMotion();
                });
                bindClick('btnRemoveMotion', function() {
                    if (typeof removeMotion === 'function') removeMotion();
                });
                break;
        }
    }
    
    /**
     * ربط حدث click
     * @param {string} id
     * @param {Function} handler
     */
    function bindClick(id, handler) {
        var el = document.getElementById(id);
        if (el) {
            el.addEventListener('click', handler);
        }
    }
    
    // Public API
    return {
        init: init,
        update: update,
        bindEvents: bindEvents
    };
})();

// Alias للتوافق مع الكود القديم
function updateActionButtons(tabName) {
    TEXTORO.UI.ActionBar.update(tabName);
}
