/**
 * TEXTORO - Legacy Aliases
 * دوال التوافق مع الكود القديم
 * @version 1.0.0
 * 
 * هذا الملف يحتوي على aliases للدوال القديمة
 * للحفاظ على التوافق مع أي كود خارجي قد يستخدمها
 * 
 * ⚠️ تحذير: هذه الدوال مهملة (deprecated)
 * يُفضل استخدام الدوال الجديدة في TEXTORO namespace
 */

(function() {
    'use strict';
    
    // ═══════════════════════════════════════════════════════════════════
    // CONFIG ALIASES
    // ═══════════════════════════════════════════════════════════════════
    
    /** @deprecated Use TEXTORO.Config.DEBUG */
    window.DEBUG = TEXTORO.Config.DEBUG;
    
    /** @deprecated Use TEXTORO.Config.TIMING */
    window.TIMING = TEXTORO.Config.TIMING;
    
    /** @deprecated Use TEXTORO.log() */
    window.debugLog = function(msg) {
        TEXTORO.log(msg);
    };
    
    // ═══════════════════════════════════════════════════════════════════
    // HOST BRIDGE ALIASES
    // ═══════════════════════════════════════════════════════════════════
    
    /** @deprecated Use TEXTORO.HostBridge.getCS() */
    window.cs = null;
    
    /** @deprecated Use TEXTORO.HostBridge.run() */
    window.runHostScript = function(funcName, args, callback) {
        TEXTORO.HostBridge.run(funcName, args, callback);
    };
    
    // Initialize cs on load
    document.addEventListener('DOMContentLoaded', function() {
        window.cs = TEXTORO.HostBridge.getCS();
    });
    
    // ═══════════════════════════════════════════════════════════════════
    // UTILS ALIASES
    // ═══════════════════════════════════════════════════════════════════
    
    /** @deprecated Use TEXTORO.Utils.getNum() */
    window.getNum = function(id, defaultVal) {
        return TEXTORO.Utils.getNum(id, defaultVal);
    };
    
    /** @deprecated Use TEXTORO.Utils.getChecked() */
    window.getChecked = function(id, defaultVal) {
        return TEXTORO.Utils.getChecked(id, defaultVal);
    };
    
    /** @deprecated Use TEXTORO.Utils.sanitizeText() */
    window.sanitizeText = function(input) {
        return TEXTORO.Utils.sanitizeText(input);
    };
    
    /** @deprecated Use TEXTORO.Utils.debounce() */
    window.debounce = function(fn, delay) {
        return TEXTORO.Utils.debounce(fn, delay);
    };
    
    /** @deprecated Use TEXTORO.Utils.truncate() */
    window.truncate = function(str, len) {
        return TEXTORO.Utils.truncate(str, len);
    };
    
    // ═══════════════════════════════════════════════════════════════════
    // STATE MANAGER ALIASES
    // ═══════════════════════════════════════════════════════════════════
    
    /** @deprecated Use TEXTORO.State.Manager */
    window.StateManager = TEXTORO.State.Manager;
    
    // ═══════════════════════════════════════════════════════════════════
    // ERROR HANDLER ALIASES
    // ═══════════════════════════════════════════════════════════════════
    
    /** @deprecated Use TEXTORO.ErrorHandler */
    window.ErrorHandler = TEXTORO.ErrorHandler;
    
    // ═══════════════════════════════════════════════════════════════════
    // TAB MANAGER ALIASES
    // ═══════════════════════════════════════════════════════════════════
    
    /** @deprecated Use TEXTORO.UI.TabManager.init() */
    window.initTabs = function() {
        TEXTORO.UI.TabManager.init();
    };
    
    /** @deprecated Use TEXTORO.UI.TabManager.isActive('markers') */
    window.isMarkersTabActive = function() {
        return TEXTORO.UI.TabManager.isActive('markers');
    };
    
    // ═══════════════════════════════════════════════════════════════════
    // TYPEWRITER PANEL ALIASES
    // ═══════════════════════════════════════════════════════════════════
    
    /** @deprecated Use TEXTORO.Panels.Typewriter.init() */
    window.initTypewriterPanel = function() {
        TEXTORO.Panels.Typewriter.init();
    };
    
    /** @deprecated Use TEXTORO.Panels.Typewriter.getCursorType() */
    window.getCursorType = function() {
        return TEXTORO.Panels.Typewriter.getCursorType();
    };
    
    /** @deprecated Use TEXTORO.Panels.Typewriter.apply() */
    window.applyTypewriter = function() {
        TEXTORO.Panels.Typewriter.apply();
    };
    
    /** @deprecated Use TEXTORO.Panels.Typewriter.remove() */
    window.removeTypewriter = function() {
        TEXTORO.Panels.Typewriter.remove();
    };
    
    /** @deprecated Use TEXTORO.Panels.Typewriter.getTextFromLayer() */
    window.getTextFromLayer = function() {
        TEXTORO.Panels.Typewriter.getTextFromLayer();
    };
    
    /** @deprecated Use TEXTORO.Panels.Typewriter.updateTextInLayer() */
    window.updateTextInLayer = function() {
        TEXTORO.Panels.Typewriter.updateTextInLayer();
    };
    
    // ═══════════════════════════════════════════════════════════════════
    // BOX PANEL ALIASES
    // ═══════════════════════════════════════════════════════════════════
    
    /** @deprecated Use TEXTORO.Panels.Box.init() */
    window.initBoxPanel = function() {
        TEXTORO.Panels.Box.init();
    };
    
    /** @deprecated Use TEXTORO.Panels.Box.create() */
    window.createBox = function() {
        TEXTORO.Panels.Box.create();
    };
    
    /** @deprecated Use TEXTORO.Panels.Box.remove() */
    window.removeBox = function() {
        TEXTORO.Panels.Box.remove();
    };
    
    // ═══════════════════════════════════════════════════════════════════
    // PRESETS PANEL ALIASES
    // ═══════════════════════════════════════════════════════════════════
    
    /** @deprecated Use TEXTORO.Panels.Presets.init() */
    window.initPresetsHub = function() {
        TEXTORO.Panels.Presets.init();
    };
    
    /** @deprecated Use TEXTORO.Panels.Presets.load() */
    window.loadAllPresetsHub = function(forceReload) {
        TEXTORO.Panels.Presets.load(forceReload);
    };
    
    /** @deprecated Use TEXTORO.Panels.Presets.render() */
    window.renderPresetsHub = function() {
        TEXTORO.Panels.Presets.render();
    };
    
    /** @deprecated Use TEXTORO.Panels.Presets.apply() */
    window.applyPresetFromHub = function(preset) {
        TEXTORO.Panels.Presets.apply(preset);
    };
    
    /** @deprecated Use TEXTORO.Panels.Presets.isFavorite() */
    window.isPresetFavorite = function(preset) {
        return TEXTORO.Panels.Presets.isFavorite(preset);
    };
    
    /** @deprecated Use TEXTORO.Panels.Presets.toggleFavorite() */
    window.togglePresetFavorite = function(preset) {
        TEXTORO.Panels.Presets.toggleFavorite(preset);
    };
    
    // ═══════════════════════════════════════════════════════════════════
    // MOTION PANEL ALIASES
    // ═══════════════════════════════════════════════════════════════════
    
    /** @deprecated Use TEXTORO.Panels.Motion.init() */
    window.initMotionPanel = function() {
        TEXTORO.Panels.Motion.init();
    };
    
    /** @deprecated - handled in init */
    window.initMotionPresetTabs = function() {};
    
    /** @deprecated - handled in init */
    window.initMotionLinkButtons = function() {};
    
    /** @deprecated Use TEXTORO.Panels.Motion.apply() */
    window.applyMotion = function() {
        TEXTORO.Panels.Motion.apply();
    };
    
    /** @deprecated Use TEXTORO.Panels.Motion.remove() */
    window.removeMotion = function() {
        TEXTORO.Panels.Motion.remove();
    };
    
    /** @deprecated Use TEXTORO.Panels.Motion.apply() */
    window.applyMotionWithPresets = function() {
        TEXTORO.Panels.Motion.apply();
    };
    
    /** @deprecated Use TEXTORO.Panels.Motion.apply() */
    window.applyMotionFromUI = function() {
        TEXTORO.Panels.Motion.apply();
    };
    
    /** @deprecated Use TEXTORO.Panels.Motion.remove() */
    window.removeMotionFromUI = function() {
        TEXTORO.Panels.Motion.remove();
    };
    
    /** @deprecated Use TEXTORO.Panels.Motion.collectValues() */
    window.collectMotionValues = function() {
        return TEXTORO.Panels.Motion.collectValues();
    };
    
    /** @deprecated Use TEXTORO.Panels.Motion.applyCustomPreset() */
    window.applyCustomMotionPreset = function(preset) {
        TEXTORO.Panels.Motion.applyCustomPreset(preset);
    };
    
    /** @deprecated Use TEXTORO.Panels.Motion.updateLayerCount() */
    window.updateMotionLayerCount = function() {
        TEXTORO.Panels.Motion.updateLayerCount();
    };
    
    /** @deprecated - internal state */
    window.motionLayerCount = 0;
    
    /** @deprecated - internal state */
    window.motionPresetState = { activeTab: 'in', selectedIn: null, selectedOut: null };
    
    // ═══════════════════════════════════════════════════════════════════
    // MARKERS PANEL ALIASES (if exists)
    // ═══════════════════════════════════════════════════════════════════
    
    /** @deprecated Use TEXTORO.Panels.Markers.refresh() */
    window.refreshMarkersTable = function(force) {
        if (TEXTORO.Panels && TEXTORO.Panels.Markers) {
            TEXTORO.Panels.Markers.refresh(force);
        }
    };
    
    // ═══════════════════════════════════════════════════════════════════
    // SOGA PANEL ALIASES (if exists)
    // ═══════════════════════════════════════════════════════════════════
    
    /** @deprecated Use TEXTORO.Panels.Soga.refresh() */
    window.refreshSogaFromLayer = function() {
        if (TEXTORO.Panels && TEXTORO.Panels.Soga) {
            TEXTORO.Panels.Soga.refresh();
        }
    };
    
    // ═══════════════════════════════════════════════════════════════════
    // SETTINGS PANEL ALIASES (if exists)
    // ═══════════════════════════════════════════════════════════════════
    
    /** @deprecated Use TEXTORO.Panels.Settings.refresh() */
    window.refreshSettingsPanel = function() {
        if (TEXTORO.Panels && TEXTORO.Panels.Settings && TEXTORO.Panels.Settings.refresh) {
            TEXTORO.Panels.Settings.refresh();
        }
    };
    
    // ═══════════════════════════════════════════════════════════════════
    // LOG DEPRECATION WARNINGS (only in debug mode)
    // ═══════════════════════════════════════════════════════════════════
    
    if (TEXTORO.Config.DEBUG) {
        TEXTORO.log('Legacy aliases loaded - consider migrating to TEXTORO namespace');
    }
    
})();
