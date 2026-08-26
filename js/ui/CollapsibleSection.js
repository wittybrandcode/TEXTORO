/**
 * TEXTORO - Collapsible Section Module
 * الأقسام القابلة للطي
 * @version 3.3.0
 */

TEXTORO.UI = TEXTORO.UI || {};

TEXTORO.UI.CollapsibleSection = (function() {
    'use strict';
    
    var sections = {};
    
    /**
     * تهيئة قسم قابل للطي
     * @param {Object} config
     */
    function init(config) {
        if (!config.id || !config.header || !config.content) {
            TEXTORO.error('CollapsibleSection: Missing required config');
            return;
        }
        
        var section = {
            id: config.id,
            header: config.header,
            content: config.content,
            defaultCollapsed: config.defaultCollapsed !== false
        };
        
        sections[config.id] = section;
        
        // تحميل الحالة المحفوظة
        var savedState = TEXTORO.State.Manager.get('collapsedSections.' + config.id);
        var isCollapsed = savedState !== undefined ? savedState : section.defaultCollapsed;
        
        // تطبيق الحالة الأولية
        if (isCollapsed) {
            collapse(config.id, false);
        } else {
            expand(config.id, false);
        }
        
        // إضافة مستمع الأحداث
        section.header.addEventListener('click', function(e) {
            e.preventDefault();
            toggle(config.id);
        });
        
        // دعم لوحة المفاتيح
        section.header.setAttribute('tabindex', '0');
        section.header.setAttribute('role', 'button');
        section.header.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggle(config.id);
            }
        });
    }
    
    /**
     * تبديل حالة القسم
     * @param {string} id
     */
    function toggle(id) {
        var section = sections[id];
        if (!section) return;
        
        if (section.content.classList.contains('collapsed')) {
            expand(id);
        } else {
            collapse(id);
        }
    }
    
    /**
     * توسيع القسم
     * @param {string} id
     * @param {boolean} animate
     */
    function expand(id, animate) {
        var section = sections[id];
        if (!section) return;
        
        section.content.classList.remove('collapsed');
        section.header.classList.remove('collapsed');
        section.header.setAttribute('aria-expanded', 'true');
        
        // تحديث الأيقونة
        var chevron = section.header.querySelector('.collapsible-chevron');
        if (chevron) {
            chevron.style.transform = 'rotate(180deg)';
        }
        
        // حفظ الحالة
        TEXTORO.State.Manager.set('collapsedSections.' + id, false);
        
        if (animate !== false) {
            section.content.style.maxHeight = section.content.scrollHeight + 'px';
            setTimeout(function() {
                section.content.style.maxHeight = 'none';
            }, 200);
        }
    }
    
    /**
     * طي القسم
     * @param {string} id
     * @param {boolean} animate
     */
    function collapse(id, animate) {
        var section = sections[id];
        if (!section) return;
        
        if (animate !== false) {
            section.content.style.maxHeight = section.content.scrollHeight + 'px';
            section.content.offsetHeight; // Force reflow
        }
        
        section.content.classList.add('collapsed');
        section.header.classList.add('collapsed');
        section.header.setAttribute('aria-expanded', 'false');
        
        // تحديث الأيقونة
        var chevron = section.header.querySelector('.collapsible-chevron');
        if (chevron) {
            chevron.style.transform = 'rotate(0deg)';
        }
        
        // حفظ الحالة
        TEXTORO.State.Manager.set('collapsedSections.' + id, true);
        
        if (animate !== false) {
            section.content.style.maxHeight = '0';
        }
    }
    
    /**
     * التحقق من حالة القسم
     * @param {string} id
     * @returns {boolean}
     */
    function isCollapsed(id) {
        var section = sections[id];
        if (!section) return true;
        return section.content.classList.contains('collapsed');
    }
    
    /**
     * تهيئة جميع الأقسام
     */
    function initAll() {
        // Type Tab Sections
        var typeSections = [
            { id: 'type-cursor', defaultCollapsed: true },
            { id: 'type-advanced', defaultCollapsed: true },
            { id: 'type-effects', defaultCollapsed: true },
            { id: 'type-multilines', defaultCollapsed: true }
        ];
        
        typeSections.forEach(function(s) {
            var header = document.getElementById(s.id + '-header');
            var content = document.getElementById(s.id + '-content');
            if (header && content) {
                init({
                    id: s.id,
                    header: header,
                    content: content,
                    defaultCollapsed: s.defaultCollapsed
                });
            }
        });
        
        // Box Tab Sections
        var boxSections = [
            { id: 'box-stroke', defaultCollapsed: true },
            { id: 'box-fill', defaultCollapsed: true },
            { id: 'box-trim', defaultCollapsed: true },
            { id: 'box-options', defaultCollapsed: true }
        ];
        
        boxSections.forEach(function(s) {
            var header = document.getElementById(s.id + '-header');
            var content = document.getElementById(s.id + '-content');
            if (header && content) {
                init({
                    id: s.id,
                    header: header,
                    content: content,
                    defaultCollapsed: s.defaultCollapsed
                });
            }
        });
        
        TEXTORO.log('CollapsibleSections initialized');
    }
    
    // Public API
    return {
        init: init,
        initAll: initAll,
        toggle: toggle,
        expand: expand,
        collapse: collapse,
        isCollapsed: isCollapsed,
        getSections: function() { return sections; }
    };
})();

// Alias للتوافق
var CollapsibleSection = TEXTORO.UI.CollapsibleSection;

function initCollapsibleSections() {
    TEXTORO.UI.CollapsibleSection.initAll();
}
