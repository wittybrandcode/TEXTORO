/**
 * TEXTORO - Context Menu Module
 * قوائم السياق
 * @version 3.3.0
 */

TEXTORO.UI = TEXTORO.UI || {};

TEXTORO.UI.ContextMenu = (function() {
    'use strict';
    
    var menuEl = null;
    var globalMenuEl = null;
    
    /**
     * تهيئة قوائم السياق
     */
    function init() {
        // إغلاق القائمة عند النقر في أي مكان
        document.addEventListener('click', function(e) {
            if (menuEl && !menuEl.contains(e.target)) {
                close();
            }
            if (globalMenuEl && !globalMenuEl.contains(e.target)) {
                closeGlobal();
            }
        });
        
        // قائمة السياق العامة
        document.body.addEventListener('contextmenu', function(e) {
            // تجاهل إذا كان النقر على preset
            if (e.target.closest('.preset-card') || e.target.closest('.preset-item')) return;
            // تجاهل إذا كان النقر على input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            e.preventDefault();
            showGlobal(e);
        });
        
        TEXTORO.log('ContextMenu initialized');
    }
    
    /**
     * عرض قائمة سياق
     * @param {MouseEvent} e
     * @param {Array} items - [{label, icon, action, disabled, danger}]
     */
    function show(e, items) {
        close();
        
        menuEl = document.createElement('div');
        menuEl.className = 'ctx show';
        
        items.forEach(function(item) {
            if (item.separator) {
                var sep = document.createElement('div');
                sep.className = 'ctx-sep';
                menuEl.appendChild(sep);
            } else {
                var el = document.createElement('div');
                el.className = 'ctx-item';
                if (item.disabled) el.className += ' disabled';
                if (item.danger) el.className += ' danger';
                
                el.innerHTML = (item.icon ? '<i class="' + item.icon + '"></i> ' : '') + item.label;
                
                if (!item.disabled && item.action) {
                    el.addEventListener('click', function() {
                        close();
                        item.action();
                    });
                }
                
                menuEl.appendChild(el);
            }
        });
        
        document.body.appendChild(menuEl);
        positionMenu(menuEl, e.pageX, e.pageY);
    }
    
    /**
     * إغلاق قائمة السياق
     */
    function close() {
        if (menuEl) {
            menuEl.remove();
            menuEl = null;
        }
    }
    
    /**
     * عرض القائمة العامة
     * @param {MouseEvent} e
     */
    function showGlobal(e) {
        closeGlobal();
        close();
        
        var hasSelection = TEXTORO.State.SelectionMonitor.hasSelection();
        
        globalMenuEl = document.createElement('div');
        globalMenuEl.className = 'ctx show';
        
        var items = [
            {
                label: 'Create New Text',
                icon: 'fa-solid fa-plus',
                action: function() {
                    // C-03: ربط بالمضيف عبر HostBridge (كانت تستدعي دالة غير موجودة)
                    TEXTORO.HostBridge.run('createNewTextLayer', null, function(res) {
                        if (res.success) {
                            TEXTORO.UI.StatusBar.success(res.message || 'New text layer created');
                            if (TEXTORO.State && TEXTORO.State.SelectionMonitor) {
                                TEXTORO.State.SelectionMonitor.forceCheck();
                            }
                        } else {
                            TEXTORO.UI.StatusBar.error('Error: ' + (res.error || 'Failed'));
                        }
                    });
                }
            },
            { separator: true },
            {
                label: 'Apply Typewriter',
                icon: 'fa-solid fa-keyboard',
                disabled: !hasSelection,
                action: function() {
                    if (typeof applyTypewriter === 'function') applyTypewriter();
                }
            },
            {
                label: 'Create Box',
                icon: 'fa-solid fa-square',
                disabled: !hasSelection,
                action: function() {
                    if (typeof createBox === 'function') createBox();
                }
            },
            { separator: true },
            {
                label: 'Remove Typewriter',
                icon: 'fa-solid fa-trash',
                disabled: !hasSelection,
                danger: true,
                action: function() {
                    if (typeof removeTypewriter === 'function') removeTypewriter();
                }
            },
            {
                label: 'Remove Box',
                icon: 'fa-solid fa-trash',
                disabled: !hasSelection,
                danger: true,
                action: function() {
                    if (typeof removeBox === 'function') removeBox();
                }
            },
            { separator: true },
            {
                label: 'Settings',
                icon: 'fa-solid fa-gear',
                action: function() {
                    TEXTORO.UI.TabManager.switchTo('settings');
                }
            }
        ];
        
        items.forEach(function(item) {
            if (item.separator) {
                var sep = document.createElement('div');
                sep.className = 'ctx-sep';
                globalMenuEl.appendChild(sep);
            } else {
                var el = document.createElement('div');
                el.className = 'ctx-item';
                if (item.disabled) el.className += ' disabled';
                if (item.danger) el.className += ' danger';
                
                el.innerHTML = '<i class="' + item.icon + '"></i> ' + item.label;
                
                if (!item.disabled && item.action) {
                    el.addEventListener('click', function() {
                        closeGlobal();
                        item.action();
                    });
                }
                
                globalMenuEl.appendChild(el);
            }
        });
        
        document.body.appendChild(globalMenuEl);
        positionMenu(globalMenuEl, e.pageX, e.pageY);
    }
    
    /**
     * إغلاق القائمة العامة
     */
    function closeGlobal() {
        if (globalMenuEl) {
            globalMenuEl.remove();
            globalMenuEl = null;
        }
    }
    
    /**
     * ضبط موقع القائمة
     * @param {HTMLElement} menu
     * @param {number} x
     * @param {number} y
     */
    function positionMenu(menu, x, y) {
        var menuWidth = menu.offsetWidth;
        var menuHeight = menu.offsetHeight;
        var windowWidth = window.innerWidth;
        var windowHeight = window.innerHeight;
        
        if (x + menuWidth > windowWidth) {
            x = windowWidth - menuWidth - 5;
        }
        if (y + menuHeight > windowHeight) {
            y = windowHeight - menuHeight - 5;
        }
        if (x < 5) x = 5;
        if (y < 5) y = 5;
        
        menu.style.left = x + 'px';
        menu.style.top = y + 'px';
    }
    
    // Public API
    return {
        init: init,
        show: show,
        close: close,
        showGlobal: showGlobal,
        closeGlobal: closeGlobal
    };
})();

// Aliases للتوافق
var contextMenu = null;
var globalContextMenu = null;

function initGlobalContextMenu() {
    TEXTORO.UI.ContextMenu.init();
}

function showGlobalContextMenu(e) {
    TEXTORO.UI.ContextMenu.showGlobal(e);
}

function closeGlobalContextMenu() {
    TEXTORO.UI.ContextMenu.closeGlobal();
}

function closeContextMenu() {
    TEXTORO.UI.ContextMenu.close();
}
