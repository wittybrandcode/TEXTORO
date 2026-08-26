/**
 * TEXTORO - State Manager Module
 * إدارة حالة الواجهة (localStorage)
 * @version 3.3.0
 */

TEXTORO.State = TEXTORO.State || {};

TEXTORO.State.Manager = (function() {
    'use strict';
    
    var STORAGE_KEY = 'TEXTORO_UI_STATE';
    var currentState = null;
    
    /** الحالة الافتراضية */
    var defaultState = {
        activeTab: 'type',
        collapsedSections: {
            'type-cursor': true,
            'type-advanced': true,
            'type-effects': true,
            'type-multilines': true,
            'box-stroke': true,
            'box-fill': true,
            'box-trim': true,
            'box-options': true
        },
        presetsFilter: 'all',
        presetsSort: 'name-asc',
        markersFilters: {
            IN_START: true,
            IN_END: true,
            OUT_START: true,
            OUT_END: true,
            BLINK_START: true,
            BLINK_END: true
        }
    };
    
    /**
     * دمج عميق لكائنين
     * @param {Object} target
     * @param {Object} source
     * @returns {Object}
     */
    function mergeDeep(target, source) {
        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    if (!target[key]) target[key] = {};
                    mergeDeep(target[key], source[key]);
                } else {
                    target[key] = source[key];
                }
            }
        }
        return target;
    }
    
    /**
     * تحميل الحالة من localStorage
     * @returns {Object}
     */
    function load() {
        try {
            var stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                var parsed = JSON.parse(stored);
                currentState = mergeDeep(JSON.parse(JSON.stringify(defaultState)), parsed);
            } else {
                currentState = JSON.parse(JSON.stringify(defaultState));
            }
        } catch (e) {
            TEXTORO.error('Failed to load UI state: ' + e.message);
            currentState = JSON.parse(JSON.stringify(defaultState));
        }
        return currentState;
    }
    
    /**
     * حفظ الحالة إلى localStorage
     */
    function save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
        } catch (e) {
            TEXTORO.error('Failed to save UI state: ' + e.message);
        }
    }
    
    /**
     * الحصول على الحالة الحالية
     * @returns {Object}
     */
    function getState() {
        if (!currentState) load();
        return currentState;
    }
    
    /**
     * تعيين قيمة في الحالة
     * @param {string} key - المفتاح (يدعم النقاط)
     * @param {*} value - القيمة
     */
    function set(key, value) {
        if (!currentState) load();
        
        var keys = key.split('.');
        var obj = currentState;
        
        for (var i = 0; i < keys.length - 1; i++) {
            if (!obj[keys[i]]) obj[keys[i]] = {};
            obj = obj[keys[i]];
        }
        
        obj[keys[keys.length - 1]] = value;
        save();
    }
    
    /**
     * الحصول على قيمة من الحالة
     * @param {string} key - المفتاح (يدعم النقاط)
     * @param {*} defaultValue - القيمة الافتراضية
     * @returns {*}
     */
    function get(key, defaultValue) {
        if (!currentState) load();
        
        var keys = key.split('.');
        var obj = currentState;
        
        for (var i = 0; i < keys.length; i++) {
            if (obj === undefined || obj === null || !obj.hasOwnProperty(keys[i])) {
                return defaultValue;
            }
            obj = obj[keys[i]];
        }
        
        return obj;
    }
    
    /**
     * إعادة تعيين الحالة للافتراضية
     */
    function reset() {
        currentState = JSON.parse(JSON.stringify(defaultState));
        save();
    }
    
    // Public API
    return {
        load: load,
        save: save,
        getState: getState,
        set: set,
        get: get,
        reset: reset,
        // Aliases
        setState: set,
        getValue: get,
        saveToStorage: save,
        loadFromStorage: load
    };
})();

// Legacy aliases moved to js/legacy/aliases.js
