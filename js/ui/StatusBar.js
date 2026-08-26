/**
 * TEXTORO - Status Bar Module
 * شريط الحالة
 * @version 3.3.0
 */

TEXTORO.UI = TEXTORO.UI || {};

TEXTORO.UI.StatusBar = (function() {
    'use strict';
    
    var statusEl = null;
    var clearTimer = null;
    
    /**
     * تهيئة شريط الحالة
     */
    function init() {
        statusEl = document.getElementById('status') || document.getElementById('statusText');
        TEXTORO.log('StatusBar initialized');
    }
    
    /**
     * عرض رسالة
     * @param {string} msg - الرسالة
     * @param {string} type - النوع (success, error, warning, info)
     */
    function set(msg, type) {
        if (!statusEl) {
            statusEl = document.getElementById('status') || document.getElementById('statusText');
        }
        if (!statusEl) return;
        
        statusEl.textContent = msg || '';
        statusEl.className = type || '';
        
        // مسح الرسالة بعد فترة
        if (clearTimer) clearTimeout(clearTimer);
        
        if (msg) {
            clearTimer = setTimeout(function() {
                clear();
            }, TEXTORO.Config.TIMING.STATUS_CLEAR_DELAY);
        }
    }
    
    /**
     * مسح الرسالة
     */
    function clear() {
        if (statusEl) {
            statusEl.textContent = '';
            statusEl.className = '';
        }
    }
    
    /**
     * عرض رسالة نجاح
     * @param {string} msg
     */
    function success(msg) {
        set(msg, 'success');
    }
    
    /**
     * عرض رسالة خطأ
     * @param {string} msg
     */
    function error(msg) {
        set(msg, 'error');
    }
    
    /**
     * عرض رسالة تحذير
     * @param {string} msg
     */
    function warning(msg) {
        set(msg, 'warning');
    }
    
    /**
     * عرض رسالة معلومات
     * @param {string} msg
     */
    function info(msg) {
        set(msg, 'info');
    }
    
    // Public API
    return {
        init: init,
        set: set,
        clear: clear,
        success: success,
        error: error,
        warning: warning,
        info: info
    };
})();

// Alias للتوافق مع الكود القديم
function setStatus(msg, type) {
    TEXTORO.UI.StatusBar.set(msg, type);
}
