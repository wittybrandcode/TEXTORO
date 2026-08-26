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
    
    /**
     * التبديل إلى تبويب
     * @param {string} tabName
     */
    function switchTo(tabName) {
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
        TEXTORO.State.Manager.set('activeTab', tabName);
        
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
        
        TEXTORO.log('Switched to tab: ' + tabName);
    }
    
    /**
     * إجراءات خاصة عند التبديل
     * @param {string} tabName
     */
    function onTabSwitch(tabName) {
        switch(tabName) {
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
                
            case 'soga':
                // تحديث Soga
                if (TEXTORO.Panels && TEXTORO.Panels.Soga) {
                    TEXTORO.Panels.Soga.refresh();
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
        var saved = TEXTORO.State.Manager.get('activeTab', 'type');
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
        onChange: onChange,
        isActive: isActive
    };
})();

// Legacy aliases moved to js/legacy/aliases.js
