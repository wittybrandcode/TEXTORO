/**
 * TEXTORO - Action Bar Module
 * أزرار الإجراءات لكل تبويب - Industrial Slate Design System
 * @version 3.4.0
 */

TEXTORO.UI = TEXTORO.UI || {};

TEXTORO.UI.ActionBar = (function() {
    'use strict';
    
    var containerEl = null;

    // SVG Icon Templates (Lucide 2px stroke, crisp 14x14)
    var SVG_CHECK = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    var SVG_TRASH = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>';
    var SVG_LINES = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
    var SVG_SCISSORS = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><line x1="20" y1="4" x2="8.12" y2="15.88"></line><line x1="14.47" y1="14.48" x2="20" y2="20"></line><line x1="8.12" y1="8.12" x2="12" y2="12"></line></svg>';
    var SVG_PLUS = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>';
    var SVG_STAR = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>';
    var SVG_TYPE = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>';
    var SVG_BOX = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18"></rect></svg>';
    var SVG_LAYERS = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>';
    var SVG_WIND = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"></path></svg>';
    var SVG_REFRESH = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>';
    
    /** أزرار كل تبويب */
    var tabActions = {
        type: '<button class="ab ab-icon ab-p square-icon-btn" id="btnApplyTypewriter" title="Apply Typewriter">' + SVG_CHECK + '</button>' +
              '<button class="ab ab-icon ab-d square-icon-btn" id="btnRemoveTypewriter" title="Remove Typewriter">' + SVG_TRASH + '</button>' +
              '<button class="ab ab-icon square-icon-btn" id="btnSplitOnly" title="Split Lines Only">' + SVG_LINES + '</button>' +
              '<button class="ab ab-icon square-icon-btn" id="btnSplitApply" title="Split + Apply Typewriter">' + SVG_SCISSORS + '</button>',
              
        box: '<button class="ab ab-icon ab-p square-icon-btn" id="btnCreateBox" title="Create Box">' + SVG_PLUS + '</button>' +
             '<button class="ab ab-icon ab-d square-icon-btn" id="btnRemoveBox" title="Remove Box">' + SVG_TRASH + '</button>',
             
        presets: '<button class="ab ab-icon ab-toro square-icon-btn" id="btnSaveToro" title="Save TORO (Type+Box+Motion)">' + SVG_STAR + '</button>' +
               '<button class="ab ab-icon square-icon-btn" id="btnSaveType" title="Save Type Preset">' + SVG_TYPE + '</button>' +
               '<button class="ab ab-icon square-icon-btn" id="btnSaveBox" title="Save Box Preset">' + SVG_BOX + '</button>' +
               '<button class="ab ab-icon square-icon-btn" id="btnSaveMix" title="Save Mix Preset">' + SVG_LAYERS + '</button>' +
               '<button class="ab ab-icon square-icon-btn" id="btnSaveMotion" title="Save Motion Preset">' + SVG_WIND + '</button>',
               
        soga: '<button class="ab ab-icon ab-p square-icon-btn" id="btnSogaApply" title="Apply Changes">' + SVG_CHECK + '</button>' +
              '<button class="ab ab-icon square-icon-btn" id="btnSogaRefresh2" title="Refresh from Layer">' + SVG_REFRESH + '</button>',
              
        markers: '<button class="ab ab-icon square-icon-btn" id="btnMarkersRefresh" title="Refresh Markers">' + SVG_REFRESH + '</button>' +
                 '<button class="ab ab-icon ab-d square-icon-btn" id="btnMarkersDelete" title="Delete Selected Markers">' + SVG_TRASH + '</button>',
                 
        motion: '<button class="ab ab-icon ab-p square-icon-btn" id="btnApplyMotion" title="Apply Motion">' + SVG_CHECK + '</button>' +
                '<button class="ab ab-icon ab-d square-icon-btn" id="btnRemoveMotion" title="Remove Motion">' + SVG_TRASH + '</button>',
                
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
