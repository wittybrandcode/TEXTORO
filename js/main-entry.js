/**
 * TEXTORO - Main Entry Point
 * نقطة الدخول الرئيسية - تهيئة جميع الوحدات
 * @version 1.0.0
 */

(function() {
    'use strict';
    
    /**
     * تهيئة التطبيق عند تحميل الصفحة
     */
    function initApp() {
        TEXTORO.log('=== TEXTORO Initializing ===');
        
        // 1. تهيئة HostBridge أولاً
        TEXTORO.HostBridge.init();
        
        // 2. تحديث FPS من الكومبوزيشن
        updateCompFPS();
        
        // 3. تهيئة UI Components
        initUIComponents();
        
        // 4. تهيئة Panels
        initPanels();
        
        // 5. تهيئة Event Listeners
        initEventListeners();
        
        // 6. بدء مراقبة التحديد
        if (TEXTORO.State && TEXTORO.State.SelectionMonitor) {
            TEXTORO.State.SelectionMonitor.start();
            
            // ربط Soga بتغيير التحديد
            TEXTORO.State.SelectionMonitor.onChange(function(data) {
                // تحديث Soga فقط إذا كان التبويب نشطاً
                if (TEXTORO.UI.TabManager && TEXTORO.UI.TabManager.isActive('soga')) {
                    if (TEXTORO.Panels && TEXTORO.Panels.Soga) {
                        TEXTORO.Panels.Soga.refresh();
                    }
                }
                
                // F-01: تحديث عدد الطبقات للوحة Motion إذا كان التبويب نشطاً
                if (TEXTORO.UI.TabManager && TEXTORO.UI.TabManager.isActive('motion')) {
                    if (TEXTORO.Panels && TEXTORO.Panels.Motion && typeof TEXTORO.Panels.Motion.updateLayerCount === 'function') {
                        TEXTORO.Panels.Motion.updateLayerCount();
                    }
                }

                // F-12: إعادة مزامنة FPS عند تغير التحديد (قد يعني تغيّر كومب)
                syncCompFPS(false);
            });

            // F-12: مزامنة FPS عند تبديل التبويبات أيضاً
            if (TEXTORO.UI.TabManager && TEXTORO.UI.TabManager.onChange) {
                TEXTORO.UI.TabManager.onChange(function() {
                    syncCompFPS(false);
                });
            }
        }
        
        // 7. تحميل الإعدادات المحفوظة
        loadSavedSettings();

        // 8. مزامنة عرض الإصدار من المصدر المركزي
        syncVersionLabels();
        
        TEXTORO.log('=== TEXTORO Ready ===');
        
        // عرض رسالة ترحيب
        if (TEXTORO.UI && TEXTORO.UI.StatusBar) {
            TEXTORO.UI.StatusBar.success('TEXTORO v' + TEXTORO.Config.VERSION + ' Ready!');
        }
    }
    
    /**
     * تحديث FPS من الكومبوزيشن الحالي
     */
    var lastFpsSync = 0; // F-12
    function updateCompFPS() {
        syncCompFPS(true);
    }

    /**
     * F-12: مزامنة FPS مع throttle لمنع إغراق المضيف بالنداءات
     * @param {boolean} force - تجاوز الـ throttle (للاقلاع الأول)
     */
    function syncCompFPS(force) {
        var now = Date.now();
        if (!force && (now - lastFpsSync) < 500) return;
        lastFpsSync = now;

        TEXTORO.HostBridge.run('getCompInfo', null, function(res) {
            if (res.success && res.data && res.data.fps) {
                var fps = Math.round(res.data.fps) || 25;
                if (TEXTORO.Time.getFPS && TEXTORO.Time.getFPS() !== fps) {
                    TEXTORO.Time.setFPS(fps);
                    TEXTORO.log('FPS re-synced to: ' + fps);
                } else if (!TEXTORO.Time.getFPS) {
                    TEXTORO.Time.setFPS(fps);
                }
            }
        });
    }
    
    /**
     * تهيئة مكونات UI
     */
    function initUIComponents() {
        // StatusBar
        if (TEXTORO.UI && TEXTORO.UI.StatusBar) {
            TEXTORO.UI.StatusBar.init();
        }
        
        // TabManager
        if (TEXTORO.UI && TEXTORO.UI.TabManager) {
            TEXTORO.UI.TabManager.init();
        }
        
        // ActionBar
        if (TEXTORO.UI && TEXTORO.UI.ActionBar) {
            TEXTORO.UI.ActionBar.init();
        }
        
        // CollapsibleSections
        if (TEXTORO.UI && TEXTORO.UI.CollapsibleSection) {
            TEXTORO.UI.CollapsibleSection.initAll();
        }
        
        // Modals
        if (TEXTORO.UI && TEXTORO.UI.Modals) {
            TEXTORO.UI.Modals.init();
        }
        
        // NumberSpinners
        if (TEXTORO.UI && TEXTORO.UI.NumberSpinners) {
            TEXTORO.UI.NumberSpinners.init();
        }
        
        // ContextMenu
        if (TEXTORO.UI && TEXTORO.UI.ContextMenu) {
            TEXTORO.UI.ContextMenu.init();
        }
    }
    
    /**
     * تهيئة اللوحات
     */
    function initPanels() {
        // Typewriter Panel
        if (TEXTORO.Panels && TEXTORO.Panels.Typewriter) {
            TEXTORO.Panels.Typewriter.init();
        }
        
        // Box Panel
        if (TEXTORO.Panels && TEXTORO.Panels.Box) {
            TEXTORO.Panels.Box.init();
        }
        
        // Soga Panel
        if (TEXTORO.Panels && TEXTORO.Panels.Soga) {
            TEXTORO.Panels.Soga.init();
        }
        
        // Markers Panel
        if (TEXTORO.Panels && TEXTORO.Panels.Markers) {
            TEXTORO.Panels.Markers.init();
        }
        
        // Presets Panel
        if (TEXTORO.Panels && TEXTORO.Panels.Presets) {
            TEXTORO.Panels.Presets.init();
        }
        
        // Motion Panel
        if (TEXTORO.Panels && TEXTORO.Panels.Motion) {
            TEXTORO.Panels.Motion.init();
        }
        
        // Settings Panel
        if (TEXTORO.Panels && TEXTORO.Panels.Settings) {
            TEXTORO.Panels.Settings.init();
        }
        
        // MultiLines Panel
        if (TEXTORO.Panels && TEXTORO.Panels.MultiLines) {
            TEXTORO.Panels.MultiLines.init();
        }
    }
    
    /**
     * تهيئة Event Listeners العامة
     */
    function initEventListeners() {
        // Keyboard shortcuts
        document.addEventListener('keydown', handleKeyboard);
    }

    /**
     * مزامنة الإصدار في الواجهة من TEXTORO.Config.VERSION
     */
    function syncVersionLabels() {
        var version = 'v' + (TEXTORO.Config && TEXTORO.Config.VERSION ? TEXTORO.Config.VERSION : '0.0.0');
        var badge = document.getElementById('verBadge');
        var about = document.getElementById('aboutVersion');

        if (badge) badge.textContent = version;
        if (about) about.textContent = version;
    }
    
    /**
     * معالجة زر Apply
     */
    function handleApply() {
        var activeTab = TEXTORO.UI.TabManager ? TEXTORO.UI.TabManager.getActiveTab() : 'type';
        
        switch(activeTab) {
            case 'type':
                if (TEXTORO.Panels.Typewriter) {
                    TEXTORO.Panels.Typewriter.apply();
                }
                break;
            case 'box':
                if (TEXTORO.Panels.Box) {
                    TEXTORO.Panels.Box.apply();
                }
                break;
            case 'motion':
                if (TEXTORO.Panels.Motion) {
                    TEXTORO.Panels.Motion.apply();
                }
                break;
            default:
                TEXTORO.log('Apply not available for tab: ' + activeTab);
        }
    }
    
    /**
     * معالجة زر Remove
     */
    function handleRemove() {
        var activeTab = TEXTORO.UI.TabManager ? TEXTORO.UI.TabManager.getActiveTab() : 'type';
        
        switch(activeTab) {
            case 'type':
                if (TEXTORO.Panels.Typewriter) {
                    TEXTORO.Panels.Typewriter.remove();
                }
                break;
            case 'box':
                if (TEXTORO.Panels.Box) {
                    TEXTORO.Panels.Box.remove();
                }
                break;
            case 'motion':
                if (TEXTORO.Panels.Motion) {
                    TEXTORO.Panels.Motion.remove();
                }
                break;
            default:
                TEXTORO.log('Remove not available for tab: ' + activeTab);
        }
    }
    
    /**
     * معالجة اختصارات لوحة المفاتيح
     */
    function handleKeyboard(e) {
        // Ctrl+Enter = Apply
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            handleApply();
        }
        
        // Escape = Close modals
        if (e.key === 'Escape') {
            if (TEXTORO.UI && TEXTORO.UI.Modals) {
                TEXTORO.UI.Modals.closeAll();
            }
        }
    }
    
    /**
     * تحميل الإعدادات المحفوظة
     */
    function loadSavedSettings() {
        if (TEXTORO.Panels && TEXTORO.Panels.Settings) {
            TEXTORO.Panels.Settings.loadSettings();
        }
    }
    
    // تشغيل التطبيق عند تحميل DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        initApp();
    }
    
    // تصدير للاستخدام الخارجي
    window.TEXTORO_Init = initApp;
    
})();
