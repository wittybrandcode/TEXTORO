/**
 * TEXTORO - Markers Operations Module
 * عمليات على الـ markers
 * @version 3.3.0
 */

TEXTORO.Ops = TEXTORO.Ops || {};

TEXTORO.Ops.Markers = {
    /**
     * التحقق من وجود تحديد
     * @returns {Array|null}
     */
    _validateSelection: function() {
        var selected = [];
        
        // محاولة الحصول من الـ Panel الجديد
        if (TEXTORO.Panels && TEXTORO.Panels.Markers && TEXTORO.Panels.Markers.getSelected) {
            selected = TEXTORO.Panels.Markers.getSelected();
        } else if (typeof getSelectedMarkersData === 'function') {
            // Fallback للدالة القديمة
            selected = getSelectedMarkersData();
        }
        
        if (!selected || selected.length === 0) {
            TEXTORO.UI.StatusBar.error('Select markers first');
            return null;
        }
        
        return selected;
    },
    
    /**
     * تحديث الجدول بعد العملية مع الحفاظ على التحديد
     */
    _refresh: function(nextSelection) {
        if (TEXTORO.Panels && TEXTORO.Panels.Markers && TEXTORO.Panels.Markers.refresh) {
            // Preserve [] so delete can explicitly clear restored selection.
            TEXTORO.Panels.Markers.refresh(true, nextSelection === undefined ? null : nextSelection); // keepSelection = true
        } else if (typeof refreshMarkersTable === 'function') {
            refreshMarkersTable(true);
        }
    },
    
    /**
     * إزاحة الـ markers
     * @param {number} direction - 1 أو -1
     * @param {Function} callback
     */
    offset: function(direction, callback) {
        var selected = this._validateSelection();
        if (!selected) return;
        
        var seconds = TEXTORO.Time.getInputSeconds('markersOffset') * direction;
        
        TEXTORO.HostBridge.run('offsetTextoroMarkers', {
            markers: selected,
            offset: seconds
        }, function(res) {
            if (res.success) {
                var msg = 'Offset ' + (direction > 0 ? '+' : '') + 
                          TEXTORO.Time.fromSeconds(seconds) + ' → ' + res.data.count + ' markers';
                TEXTORO.UI.StatusBar.success(msg);
                TEXTORO.Ops.Markers._refresh((res.data && res.data.markers) ? res.data.markers : null);
            } else {
                TEXTORO.UI.StatusBar.error('Error: ' + res.error);
            }
            if (callback) callback(res);
        });
    },
    
    /**
     * تطبيق Stagger على الـ markers
     * @param {number} direction - 1 أو -1
     * @param {Function} callback
     */
    stagger: function(direction, callback) {
        var selected = this._validateSelection();
        if (!selected) return;
        
        var delay = TEXTORO.Time.getInputSeconds('markersStagger') * direction;
        var order = TEXTORO.Utils.getSelectValue('markersStaggerOrder', 'asc');
        
        TEXTORO.log('Stagger: delay=' + delay + 's, order=' + order + ', markers=' + selected.length);
        
        TEXTORO.HostBridge.run('staggerTextoroMarkers', {
            markers: selected,
            delay: delay,
            order: order
        }, function(res) {
            if (res.success) {
                var signedDelay = (delay >= 0 ? '+' : '-') + TEXTORO.Time.fromSeconds(Math.abs(delay));
                var msg = 'Stagger ' + signedDelay + 
                          ' (' + order + ') → ' + res.data.count + ' markers';
                TEXTORO.UI.StatusBar.success(msg);
                TEXTORO.Ops.Markers._refresh((res.data && res.data.markers) ? res.data.markers : null);
            } else {
                TEXTORO.UI.StatusBar.error('Error: ' + res.error);
            }
            if (callback) callback(res);
        });
    },
    
    /**
     * محاذاة الـ markers لوقت محدد
     * @param {Function} callback
     */
    align: function(callback) {
        var selected = this._validateSelection();
        if (!selected) return;
        
        var targetTime = TEXTORO.Time.getInputSeconds('markersAlignTime');
        
        TEXTORO.HostBridge.run('alignTextoroMarkers', {
            markers: selected,
            targetTime: targetTime
        }, function(res) {
            if (res.success) {
                var msg = 'Aligned ' + res.data.count + ' markers → ' + 
                          TEXTORO.Time.fromSeconds(targetTime);
                TEXTORO.UI.StatusBar.success(msg);
                TEXTORO.Ops.Markers._refresh((res.data && res.data.markers) ? res.data.markers : null);
            } else {
                TEXTORO.UI.StatusBar.error('Error: ' + res.error);
            }
            if (callback) callback(res);
        });
    },
    
    /**
     * حذف الـ markers المحددة
     * @param {Function} callback
     */
    delete: function(callback) {
        var selected = this._validateSelection();
        if (!selected) return;
        
        if (!confirm('Delete ' + selected.length + ' markers?')) return;
        
        TEXTORO.HostBridge.run('deleteTextoroMarkers', {
            markers: selected
        }, function(res) {
            if (res.success) {
                TEXTORO.UI.StatusBar.success('Deleted ' + res.data.count + ' markers');
                TEXTORO.Ops.Markers._refresh([]);
            } else {
                TEXTORO.UI.StatusBar.error('Error: ' + res.error);
            }
            if (callback) callback(res);
        });
    }
};

// Aliases للتوافق مع الكود القديم
function applyMarkersOffset(direction) {
    TEXTORO.Ops.Markers.offset(direction);
}

function applyMarkersStagger(direction) {
    TEXTORO.Ops.Markers.stagger(direction);
}

function applyMarkersAlign() {
    TEXTORO.Ops.Markers.align();
}

function deleteSelectedMarkers() {
    TEXTORO.Ops.Markers.delete();
}

