/**
 * TEXTORO - Tab Manager Module
 * إدارة التبويبات
 * @version 3.3.0
 */

TEXTORO.UI = TEXTORO.UI || {};

TEXTORO.UI.TabManager = (function() {
    'use strict';
    
    var activeTab = 'type';
    var callbacks = [];
    var TAB_LABELS = {
        type: 'TYPE',
        box: 'BOX',
        presets: 'PRESETS',
        inspector: 'INSPECTOR',
        soga: 'INSPECTOR',
        markers: 'MARKERS',
        motion: 'MOTION',
        settings: 'CONFIG'
    };
    
    /**
     * التبديل إلى تبويب
     * @param {string} tabName
     */
    function switchTo(tabName) {
        // إخفاء أي تلميح نشط فوراً
        if (typeof Tooltip !== 'undefined' && Tooltip.hide) Tooltip.hide();
        if (typeof TEXTORO !== 'undefined' && TEXTORO.UI && TEXTORO.UI.Tooltip && TEXTORO.UI.Tooltip.hide) {
            TEXTORO.UI.Tooltip.hide();
        }

        // إخفاء كل التبويبات
        document.querySelectorAll('.tab').forEach(function(t) {
            t.classList.remove('active');
        });
        document.querySelectorAll('.panel').forEach(function(p) {
            p.classList.remove('active');
        });
        
        // إظهار التبويب المطلوب
        var tab = document.querySelector('.tab[data-tab="' + tabName + '"]');
        var panel = document.getElementById('panel-' + tabName);
        
        if (tab) tab.classList.add('active');
        if (panel) panel.classList.add('active');
        
        activeTab = tabName;
        
        // حفظ الحالة
        if (TEXTORO.State && TEXTORO.State.Manager && typeof TEXTORO.State.Manager.set === 'function') {
            TEXTORO.State.Manager.set('activeTab', tabName);
        }
        
        // تحديث ActionBar
        if (TEXTORO.UI.ActionBar && TEXTORO.UI.ActionBar.update) {
            TEXTORO.UI.ActionBar.update(tabName);
        }
        
        // تنفيذ إجراءات خاصة بالتبويب
        onTabSwitch(tabName);
        
        // إشعار المستمعين
        callbacks.forEach(function(cb) {
            try { cb(tabName); } catch(e) {}
        });
        
        TEXTORO.log('Switched to tab: ' + (TAB_LABELS[tabName] || tabName));
    }
    
    /**
     * إجراءات خاصة عند التبديل
     * @param {string} tabName
     */
    function onTabSwitch(tabName) {
        switch(tabName) {
            case 'type':
                if (TEXTORO.Panels && TEXTORO.Panels.Typewriter && TEXTORO.Panels.Typewriter.syncFromLayer) {
                    TEXTORO.Panels.Typewriter.syncFromLayer();
                }
                if (TEXTORO.UI && TEXTORO.UI.SubBar && TEXTORO.UI.SubBar.syncTypewriter) {
                    TEXTORO.UI.SubBar.syncTypewriter();
                }
                break;

            case 'box':
                if (TEXTORO.Panels && TEXTORO.Panels.Box && TEXTORO.Panels.Box.syncFromLayer) {
                    TEXTORO.Panels.Box.syncFromLayer();
                }
                if (TEXTORO.UI && TEXTORO.UI.SubBar && TEXTORO.UI.SubBar.syncBox) {
                    TEXTORO.UI.SubBar.syncBox();
                }
                break;

            case 'markers':
                // تحديث جدول الـ markers
                if (TEXTORO.Panels && TEXTORO.Panels.Markers) {
                    TEXTORO.Panels.Markers.refresh();
                } else if (typeof refreshMarkersTable === 'function') {
                    refreshMarkersTable(true);
                }
                break;
                
            case 'presets':
                // تحديث البريسات
                if (TEXTORO.Panels && TEXTORO.Panels.Presets) {
                    // لا شيء - يتم التحميل عند التهيئة
                }
                break;
                
            case 'motion':
                // F-01: تحديث عدد الطبقات المحددة لإظهار خيار Multi-layer
                if (TEXTORO.Panels && TEXTORO.Panels.Motion && typeof TEXTORO.Panels.Motion.updateLayerCount === 'function') {
                    TEXTORO.Panels.Motion.updateLayerCount();
                }
                break;
                
            case 'inspector':
            case 'soga':
                // Refresh Inspector panel
                if (TEXTORO.Panels && (TEXTORO.Panels.Inspector || TEXTORO.Panels.Soga)) {
                    var insp = TEXTORO.Panels.Inspector || TEXTORO.Panels.Soga;
                    insp.refresh();
                } else if (typeof refreshInspectorPanel === 'function') {
                    refreshInspectorPanel();
                } else if (typeof refreshSogaFromLayer === 'function') {
                    refreshSogaFromLayer();
                }
                break;
                
            case 'settings':
                // تحديث الإعدادات
                if (typeof refreshSettingsPanel === 'function') {
                    refreshSettingsPanel();
                }
                break;
        }
    }
    
    /**
     * تهيئة التبويبات
     */
    function init() {
        // ربط أحداث النقر
        document.querySelectorAll('.tab').forEach(function(tab) {
            tab.addEventListener('click', function() {
                switchTo(this.dataset.tab);
            });
        });
        
        // استعادة التبويب المحفوظ
        var saved = 'type';
        if (TEXTORO.State && TEXTORO.State.Manager && typeof TEXTORO.State.Manager.get === 'function') {
            try {
                saved = TEXTORO.State.Manager.get('activeTab', 'type') || 'type';
            } catch(e) {
                saved = 'type';
            }
        }
        switchTo(saved);
        
        TEXTORO.log('TabManager initialized');
    }
    
    /**
     * الحصول على التبويب النشط
     * @returns {string}
     */
    function getActive() {
        return activeTab;
    }
    
    /**
     * Alias لـ getActive
     * @returns {string}
     */
    function getActiveTab() {
        return activeTab;
    }
    
    /**
     * الاشتراك في تغيير التبويب
     * @param {Function} callback
     */
    function onChange(callback) {
        if (typeof callback === 'function') {
            callbacks.push(callback);
        }
    }
    
    /**
     * التحقق من أن تبويب معين نشط
     * @param {string} tabName
     * @returns {boolean}
     */
    function isActive(tabName) {
        return activeTab === tabName;
    }
    
    // Public API
    return {
        init: init,
        switchTo: switchTo,
        getActive: getActive,
        getActiveTab: getActiveTab,
        getTabLabel: function(tabName) {
            return TAB_LABELS[tabName || activeTab] || tabName;
        },
        TAB_LABELS: TAB_LABELS,
        onChange: onChange,
        isActive: isActive
    };
})();

// Legacy aliases moved to js/legacy/aliases.js
