/**
 * TEXTORO - Action Bar Module
 * أزرار الإجراءات لكل تبويب
 * @version 3.3.0
 */

TEXTORO.UI = TEXTORO.UI || {};

TEXTORO.UI.ActionBar = (function() {
    'use strict';
    
    var containerEl = null;
    
    /** أزرار كل تبويب */
    var tabActions = {
        type: '<button class="ab ab-icon ab-p" id="btnApplyTypewriter" title="Apply Typewriter"><i class="fa-solid fa-check"></i></button>' +
              '<button class="ab ab-icon ab-d" id="btnRemoveTypewriter" title="Remove Typewriter"><i class="fa-solid fa-trash"></i></button>' +
              '<button class="ab ab-icon" id="btnSplitOnly" title="Split Lines Only"><i class="fa-solid fa-grip-lines"></i></button>' +
              '<button class="ab ab-icon" id="btnSplitApply" title="Split + Apply Typewriter"><i class="fa-solid fa-scissors"></i></button>',
              
        box: '<button class="ab ab-icon ab-p" id="btnCreateBox" title="Create Box"><i class="fa-solid fa-plus"></i></button>' +
             '<button class="ab ab-icon ab-d" id="btnRemoveBox" title="Remove Box"><i class="fa-solid fa-trash"></i></button>',
             
        presets: '<button class="ab ab-icon ab-toro" id="btnSaveToro" title="🐂 Save TORO (Type+Box+Motion)">🐂</button>' +
               '<button class="ab ab-icon" id="btnSaveType" title="Save Type Preset"><i class="fa-solid fa-font"></i></button>' +
               '<button class="ab ab-icon" id="btnSaveBox" title="Save Box Preset"><i class="fa-regular fa-square-full"></i></button>' +
               '<button class="ab ab-icon" id="btnSaveMix" title="Save Mix Preset"><i class="fa-solid fa-layer-group"></i></button>' +
               '<button class="ab ab-icon" id="btnSaveMotion" title="Save Motion Preset"><i class="fa-solid fa-wind"></i></button>',
               
        soga: '<button class="ab ab-icon ab-p" id="btnSogaApply" title="Apply Changes"><i class="fa-solid fa-check"></i></button>' +
              '<button class="ab ab-icon" id="btnSogaRefresh2" title="Refresh from Layer"><i class="fa-solid fa-sync"></i></button>',
              
        markers: '<button class="ab ab-icon" id="btnMarkersRefresh" title="Refresh Markers"><i class="fa-solid fa-sync"></i></button>' +
                 '<button class="ab ab-icon ab-d" id="btnMarkersDelete" title="Delete Selected Markers"><i class="fa-solid fa-trash"></i></button>',
                 
        motion: '<button class="ab ab-icon ab-p" id="btnApplyMotion" title="Apply Motion"><i class="fa-solid fa-check"></i></button>' +
                '<button class="ab ab-icon ab-d" id="btnRemoveMotion" title="Remove Motion"><i class="fa-solid fa-trash"></i></button>',
                
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
                bindClick('btnSaveToro', function() {
                    if (typeof savePresetFromLayer === 'function') savePresetFromLayer('toro');
                });
                bindClick('btnSaveType', function() {
                    if (typeof savePresetFromLayer === 'function') savePresetFromLayer('type');
                });
                bindClick('btnSaveBox', function() {
                    if (typeof savePresetFromLayer === 'function') savePresetFromLayer('box');
                });
                bindClick('btnSaveMix', function() {
                    if (typeof savePresetFromLayer === 'function') savePresetFromLayer('mix');
                });
                bindClick('btnSaveMotion', function() {
                    if (typeof savePresetFromLayer === 'function') savePresetFromLayer('motion');
                });
                break;
                
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
        if (el) el.addEventListener('click', handler);
    }
    
    /**
     * تعيين أزرار مخصصة لتبويب
     * @param {string} tabName
     * @param {string} html
     */
    function setTabActions(tabName, html) {
        tabActions[tabName] = html;
    }
    
    // Public API
    return {
        init: init,
        update: update,
        setTabActions: setTabActions
    };
})();

// Alias للتوافق
var tabActions = null; // سيتم استخدام TEXTORO.UI.ActionBar

function updateActionBar(tab) {
    TEXTORO.UI.ActionBar.update(tab);
}

function initActionButtons(tab) {
    // يتم الربط تلقائياً في update
}
