/**
 * TEXTORO - Layers Operations Module
 * عمليات على الطبقات
 * @version 3.3.0
 */

TEXTORO.Ops = TEXTORO.Ops || {};

TEXTORO.Ops.Layers = {
    /**
     * تحديث الجدول بعد العملية
     */
    _refresh: function() {
        if (TEXTORO.Panels && TEXTORO.Panels.Markers && TEXTORO.Panels.Markers.refresh) {
            TEXTORO.Panels.Markers.refresh();
        } else if (typeof refreshMarkersTable === 'function') {
            refreshMarkersTable(false);
        }
    },
    
    /**
     * إزاحة الطبقات المحددة
     * @param {number} direction - 1 أو -1
     * @param {Function} callback
     */
    offset: function(direction, callback) {
        var seconds = TEXTORO.Time.getInputSeconds('markersOffset') * direction;
        
        TEXTORO.HostBridge.run('offsetSelectedLayers', {
            offset: seconds
        }, function(res) {
            if (res.success) {
                var msg = 'Offset ' + (direction > 0 ? '+' : '') + 
                          TEXTORO.Time.fromSeconds(seconds) + ' → ' + res.data.count + ' layers';
                TEXTORO.UI.StatusBar.success(msg);
                TEXTORO.Ops.Layers._refresh();
            } else {
                TEXTORO.UI.StatusBar.error('Error: ' + res.error);
            }
            if (callback) callback(res);
        });
    },
    
    /**
     * تطبيق Stagger على الطبقات المحددة
     * @param {number} direction - 1 أو -1
     * @param {Function} callback
     */
    stagger: function(direction, callback) {
        var delay = TEXTORO.Time.getInputSeconds('markersStagger') * direction;
        var order = TEXTORO.Utils.getSelectValue('markersStaggerOrder', 'asc');
        
        TEXTORO.HostBridge.run('staggerSelectedLayers', {
            delay: delay,
            order: order
        }, function(res) {
            if (res.success) {
                var signedDelay = (delay >= 0 ? '+' : '-') + TEXTORO.Time.fromSeconds(Math.abs(delay));
                var msg = 'Stagger ' + signedDelay + 
                          ' (' + order + ') → ' + res.data.count + ' layers';
                TEXTORO.UI.StatusBar.success(msg);
                TEXTORO.Ops.Layers._refresh();
            } else {
                TEXTORO.UI.StatusBar.error('Error: ' + res.error);
            }
            if (callback) callback(res);
        });
    },
    
    /**
     * محاذاة الطبقات المحددة لوقت محدد
     * @param {Function} callback
     */
    align: function(callback) {
        var targetTime = TEXTORO.Time.getInputSeconds('markersAlignTime');
        
        TEXTORO.HostBridge.run('alignSelectedLayers', {
            targetTime: targetTime
        }, function(res) {
            if (res.success) {
                var msg = 'Aligned ' + res.data.count + ' layers → ' + 
                          TEXTORO.Time.fromSeconds(targetTime);
                TEXTORO.UI.StatusBar.success(msg);
                TEXTORO.Ops.Layers._refresh();
            } else {
                TEXTORO.UI.StatusBar.error('Error: ' + res.error);
            }
            if (callback) callback(res);
        });
    }
};

// Aliases للتوافق مع الكود القديم
function applyLayersOffset(direction) {
    TEXTORO.Ops.Layers.offset(direction);
}

function applyLayersStagger(direction) {
    TEXTORO.Ops.Layers.stagger(direction);
}

function applyLayersAlign() {
    TEXTORO.Ops.Layers.align();
}

