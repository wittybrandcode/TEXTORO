/**
 * TEXTORO - Collapsible Section Module
 * الأقسام القابلة للطي - Industrial Slate Accordion System
 * @version 3.4.0
 */

TEXTORO.UI = TEXTORO.UI || {};

TEXTORO.UI.CollapsibleSection = (function() {
    'use strict';
    
    var sections = {};
    var CHEVRON_SVG = '<i class="ph-bold ph-caret-down"></i>';
    
    /**
     * تهيئة قسم قابل للطي
     * @param {Object} config
     */
    function init(config) {
        if (!config || !config.id || !config.header || !config.content) {
            TEXTORO.error('CollapsibleSection: Missing required config for ' + (config ? config.id : 'unknown'));
            return;
        }
        
        var section = {
            id: config.id,
            header: config.header,
            content: config.content,
            defaultCollapsed: config.defaultCollapsed === true,
            _timer: null
        };
        
        sections[config.id] = section;
        
        // تطبيق الفئات والخصائص الأساسية
        section.header.classList.add('collapsible-header');
        section.content.classList.add('collapsible-content');
        
        // إزالة أي نمط مؤشر افتراضي قديم
        if (section.header.style.cursor === 'default') {
            section.header.style.cursor = '';
        }
        
        // حقن سهم الطي (Chevron) إن لم يكن موجوداً مسبقاً في الـ DOM
        if (!section.header.querySelector('.collapsible-chevron')) {
            var chevronWrap = document.createElement('span');
            chevronWrap.className = 'collapsible-chevron';
            chevronWrap.title = 'Toggle section';
            chevronWrap.innerHTML = CHEVRON_SVG;
            
            var btnGroup = section.header.querySelector('.studio-btn-group');
            if (btnGroup) {
                section.header.insertBefore(chevronWrap, btnGroup);
            } else {
                section.header.appendChild(chevronWrap);
            }
        }
        
        // إضافة مستمع النقر مع استثناء عناصر التحكم التفاعلية
        section.header.addEventListener('click', function(e) {
            if (e.target.closest('button, input, label, select, .studio-btn-group, .studio-toggle-chip, .link-btn, .square-icon-btn, .color-picker-wrap')) {
                return;
            }
            e.preventDefault();
            toggle(config.id);
        });
        
        // دعم التنقل بلوحة المفاتيح
        section.header.setAttribute('tabindex', '0');
        section.header.setAttribute('role', 'button');
        section.header.addEventListener('keydown', function(e) {
            if (e.target !== section.header) return;
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggle(config.id);
            }
        });
        
        // تحميل الحالة المحفوظة
        var savedState = (TEXTORO.State && TEXTORO.State.Manager && typeof TEXTORO.State.Manager.get === 'function')
            ? TEXTORO.State.Manager.get('collapsedSections.' + config.id)
            : undefined;
        var isCollapsed = savedState !== undefined ? (savedState === true) : section.defaultCollapsed;
        
        // تطبيق الحالة الأولية بدون حركة (instant)
        if (isCollapsed) {
            collapse(config.id, false);
        } else {
            expand(config.id, false);
        }
    }
    
    /**
     * تبديل حالة القسم
     * @param {string} id
     */
    function toggle(id) {
        var section = sections[id];
        if (!section) return;
        
        if (section.header.classList.contains('collapsed')) {
            expand(id, true);
        } else {
            collapse(id, true);
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
        
        if (section._timer) {
            clearTimeout(section._timer);
            section._timer = null;
        }
        
        section.header.classList.remove('collapsed');
        section.header.setAttribute('aria-expanded', 'true');
        
        var chevron = section.header.querySelector('.collapsible-chevron');
        if (chevron) {
            chevron.style.transform = 'rotate(0deg)';
        }
        
        // حفظ الحالة
        if (TEXTORO.State && TEXTORO.State.Manager && typeof TEXTORO.State.Manager.set === 'function') {
            TEXTORO.State.Manager.set('collapsedSections.' + id, false);
        }
        
        section.content.classList.remove('collapsed');
        section.content.style.display = '';
        
        if (animate === false) {
            section.content.style.maxHeight = '';
            section.content.style.opacity = '';
            section.content.style.overflow = '';
            section.content.style.transition = '';
            return;
        }
        
        // توسيع متحرك وسلس
        section.content.style.overflow = 'hidden';
        section.content.style.opacity = '0';
        section.content.style.maxHeight = '0';
        section.content.offsetHeight; // Force reflow
        
        var targetHeight = section.content.scrollHeight;
        section.content.style.transition = 'max-height 0.18s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.18s ease';
        section.content.style.maxHeight = targetHeight + 'px';
        section.content.style.opacity = '1';
        
        section._timer = setTimeout(function() {
            if (!section.header.classList.contains('collapsed')) {
                section.content.style.maxHeight = '';
                section.content.style.opacity = '';
                section.content.style.overflow = '';
                section.content.style.transition = '';
            }
        }, 200);
    }
    
    /**
     * طي القسم (إخفاء تام بنسبة 100% يمنع أي تداخل)
     * @param {string} id
     * @param {boolean} animate
     */
    function collapse(id, animate) {
        var section = sections[id];
        if (!section) return;
        
        if (section._timer) {
            clearTimeout(section._timer);
            section._timer = null;
        }
        
        section.header.classList.add('collapsed');
        section.header.setAttribute('aria-expanded', 'false');
        
        var chevron = section.header.querySelector('.collapsible-chevron');
        if (chevron) {
            chevron.style.transform = 'rotate(-90deg)';
        }
        
        // حفظ الحالة
        if (TEXTORO.State && TEXTORO.State.Manager && typeof TEXTORO.State.Manager.set === 'function') {
            TEXTORO.State.Manager.set('collapsedSections.' + id, true);
        }
        
        if (animate === false) {
            section.content.classList.add('collapsed');
            section.content.style.display = 'none';
            section.content.style.maxHeight = '0';
            section.content.style.overflow = 'hidden';
            return;
        }
        
        // طي متحرك وسلس
        section.content.style.overflow = 'hidden';
        section.content.style.maxHeight = section.content.scrollHeight + 'px';
        section.content.offsetHeight; // Force reflow
        
        section.content.style.transition = 'max-height 0.18s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.15s ease';
        section.content.style.maxHeight = '0';
        section.content.style.opacity = '0';
        
        section._timer = setTimeout(function() {
            if (section.header.classList.contains('collapsed')) {
                section.content.classList.add('collapsed');
                section.content.style.display = 'none';
                section.content.style.maxHeight = '';
                section.content.style.opacity = '';
                section.content.style.overflow = '';
                section.content.style.transition = '';
            }
        }, 190);
    }
    
    /**
     * التحقق من حالة القسم
     * @param {string} id
     * @returns {boolean}
     */
    function isCollapsed(id) {
        var section = sections[id];
        if (!section) return false;
        return section.header.classList.contains('collapsed');
    }
    
    /**
     * تهيئة جميع الأقسام عبر كل التبويبات
     */
    function initAll() {
        // Type Tab Sections
        var typeSections = [
            { id: 'type-timing', defaultCollapsed: false },
            { id: 'type-cursor', defaultCollapsed: false },
            { id: 'type-advanced', defaultCollapsed: false },
            { id: 'type-multilines', defaultCollapsed: false }
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
            { id: 'box-padding', defaultCollapsed: false },
            { id: 'box-corner', defaultCollapsed: false },
            { id: 'box-stroke', defaultCollapsed: false },
            { id: 'box-fill', defaultCollapsed: false },
            { id: 'box-trim', defaultCollapsed: false },
            { id: 'box-options', defaultCollapsed: false }
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
        
        // Motion Tab Sections
        var motionSections = [
            { id: 'motion-timing', defaultCollapsed: false },
            { id: 'motion-pos', defaultCollapsed: false },
            { id: 'motion-scale', defaultCollapsed: false },
            { id: 'motion-rot', defaultCollapsed: false },
            { id: 'motion-opacity', defaultCollapsed: false },
            { id: 'motion-easing', defaultCollapsed: false },
            { id: 'motion-presets', defaultCollapsed: false }
        ];
        
        motionSections.forEach(function(s) {
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
        
        // Markers Tab Sections
        var markersSections = [
            { id: 'markers-filter', defaultCollapsed: false },
            { id: 'markers-list', defaultCollapsed: false },
            { id: 'markers-ops', defaultCollapsed: false }
        ];
        
        markersSections.forEach(function(s) {
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
        
        // Settings Tab Sections
        var settingsSections = [
            { id: 'settings-presets', defaultCollapsed: false },
            { id: 'settings-expr', defaultCollapsed: false },
            { id: 'settings-about', defaultCollapsed: false },
            { id: 'settings-maint', defaultCollapsed: false }
        ];
        
        settingsSections.forEach(function(s) {
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
        
        // Soga Tab Sections
        var sogaSections = [
            { id: 'soga-tw', defaultCollapsed: false },
            { id: 'soga-box', defaultCollapsed: false },
            { id: 'soga-motion', defaultCollapsed: false }
        ];
        
        sogaSections.forEach(function(s) {
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
