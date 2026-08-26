/**
 * TEXTORO - Selection Monitor Module
 * مراقبة تحديد الطبقات في After Effects
 * @version 3.3.0
 */

TEXTORO.State = TEXTORO.State || {};

TEXTORO.State.SelectionMonitor = (function() {
    'use strict';
    
    var interval = null;
    var isRunning = false;
    var lastSelection = null;
    var lastSelectedLayer = null;
    var callbacks = [];
    
    /**
     * فحص التحديد الحالي
     */
    function check() {
        TEXTORO.HostBridge.run('getSelectionInfo', null, function(res) {
            if (!res.success) return;
            
            var data = res.data;
            var changed = JSON.stringify(data) !== JSON.stringify(lastSelection);
            
            if (changed) {
                lastSelection = data;
                
                // تحديث lastSelectedLayer
                if (data && data.textLayers && data.textLayers.length > 0) {
                    lastSelectedLayer = data.textLayers[0];
                } else {
                    lastSelectedLayer = null;
                }
                
                // إشعار المستمعين
                callbacks.forEach(function(cb) {
                    try {
                        cb(data);
                    } catch(e) {
                        TEXTORO.error('SelectionMonitor callback error: ' + e.message);
                    }
                });
            }
        });
    }
    
    /**
     * بدء المراقبة
     */
    function start() {
        if (isRunning) return;
        
        interval = setInterval(check, TEXTORO.Config.TIMING.SELECTION_CHECK_INTERVAL);
        isRunning = true;
        
        // فحص فوري
        check();
        
        TEXTORO.log('SelectionMonitor started');
    }
    
    /**
     * إيقاف المراقبة
     */
    function stop() {
        if (interval) {
            clearInterval(interval);
            interval = null;
        }
        isRunning = false;
        TEXTORO.log('SelectionMonitor stopped');
    }
    
    /**
     * إعادة تشغيل المراقبة
     */
    function restart() {
        stop();
        start();
    }
    
    /**
     * فحص فوري
     */
    function forceCheck() {
        check();
    }
    
    /**
     * الاشتراك في تغييرات التحديد
     * @param {Function} callback
     */
    function onChange(callback) {
        if (typeof callback === 'function') {
            callbacks.push(callback);
        }
    }
    
    /**
     * إلغاء الاشتراك
     * @param {Function} callback
     */
    function offChange(callback) {
        var idx = callbacks.indexOf(callback);
        if (idx > -1) {
            callbacks.splice(idx, 1);
        }
    }
    
    /**
     * الحصول على آخر تحديد
     * @returns {Object|null}
     */
    function getLastSelection() {
        return lastSelection;
    }
    
    /**
     * الحصول على آخر طبقة محددة
     * @returns {Object|null}
     */
    function getLastSelectedLayer() {
        return lastSelectedLayer;
    }
    
    /**
     * التحقق من وجود تحديد
     * @returns {boolean}
     */
    function hasSelection() {
        return lastSelectedLayer !== null;
    }
    
    /**
     * التحقق من حالة التشغيل
     * @returns {boolean}
     */
    function isActive() {
        return isRunning;
    }
    
    // Public API
    return {
        start: start,
        stop: stop,
        restart: restart,
        forceCheck: forceCheck,
        onChange: onChange,
        offChange: offChange,
        getLastSelection: getLastSelection,
        getLastSelectedLayer: getLastSelectedLayer,
        hasSelection: hasSelection,
        isActive: isActive
    };
})();

// Alias للتوافق مع الكود القديم
var SelectionMonitor = TEXTORO.State.SelectionMonitor;
var lastSelectedLayer = null;

// تحديث lastSelectedLayer عند التغيير
TEXTORO.State.SelectionMonitor.onChange(function(data) {
    if (data && data.textLayers && data.textLayers.length > 0) {
        lastSelectedLayer = data.textLayers[0];
    } else {
        lastSelectedLayer = null;
    }
});

function startSelectionMonitor() {
    TEXTORO.State.SelectionMonitor.start();
}

function checkSelection() {
    TEXTORO.State.SelectionMonitor.forceCheck();
}
