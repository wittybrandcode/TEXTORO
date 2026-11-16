/**
 * TEXTORO - Custom Select Dropdown Module
 * قوائم منسدلة احترافية بدون زوايا مدورة - Industrial Slate Architecture
 * @version 1.1.0
 */

TEXTORO.UI = TEXTORO.UI || {};

TEXTORO.UI.CustomSelect = (function() {
    'use strict';
    
    var instances = [];
    var CHEVRON_SVG = '<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
    
    /**
     * إغلاق جميع القوائم المفتوحة
     */
    function closeAll() {
        instances.forEach(function(inst) {
            inst.close();
        });
    }
    
    /**
     * تهيئة عنصر select مخصص
     * @param {HTMLSelectElement} selectEl
     */
    function init(selectEl) {
        if (!selectEl || selectEl.dataset.customized === 'true') {
            return;
        }
        
        selectEl.dataset.customized = 'true';
        
        // إنشاء الحاوية الخارجية
        var wrapper = document.createElement('div');
        wrapper.className = 'custom-select-wrap';
        if (selectEl.id) {
            wrapper.id = selectEl.id + '-custom-wrap';
        }
        
        // نقل أي فئات خاصة بالحجم أو التموضع
        if (selectEl.classList.contains('presets-sort')) {
            wrapper.classList.add('presets-sort-wrap');
        }
        
        // نقل select داخل الحاوية
        var parent = selectEl.parentNode;
        parent.insertBefore(wrapper, selectEl);
        wrapper.appendChild(selectEl);
        
        // فحص ما إذا كان العنصر الأب عبارة عن precision-select-box
        var parentBox = (wrapper.closest && wrapper.closest('.precision-select-box')) ||
                        (parent && parent.classList && parent.classList.contains('precision-select-box') ? parent : null);
        
        if (parentBox) {
            wrapper.classList.add('precision-custom-wrap');
        }
        
        // زر التفعيل (Trigger)
        var trigger = document.createElement('div');
        trigger.className = 'custom-select-trigger';
        trigger.setAttribute('tabindex', '0');
        trigger.setAttribute('role', 'button');
        trigger.setAttribute('aria-haspopup', 'listbox');
        trigger.setAttribute('aria-expanded', 'false');
        
        var valSpan = document.createElement('span');
        valSpan.className = 'custom-select-val';
        
        var arrowSpan = document.createElement('span');
        arrowSpan.className = 'custom-select-arrow';
        arrowSpan.innerHTML = CHEVRON_SVG;
        
        trigger.appendChild(valSpan);
        trigger.appendChild(arrowSpan);
        wrapper.appendChild(trigger);
        
        // القائمة المنبثقة (Dropdown Menu)
        var dropdown = document.createElement('div');
        dropdown.className = 'custom-select-dropdown';
        dropdown.setAttribute('role', 'listbox');
        wrapper.appendChild(dropdown);
        
        var controller = {
            wrapper: wrapper,
            parentBox: parentBox,
            selectEl: selectEl,
            trigger: trigger,
            dropdown: dropdown,
            valSpan: valSpan,
            isOpen: false,
            open: function() {
                closeAll();
                this.isOpen = true;
                this.wrapper.classList.add('open');
                if (this.parentBox) {
                    this.parentBox.classList.add('select-open');
                }
                this.trigger.setAttribute('aria-expanded', 'true');
            },
            close: function() {
                this.isOpen = false;
                this.wrapper.classList.remove('open');
                if (this.parentBox) {
                    this.parentBox.classList.remove('select-open');
                }
                this.trigger.setAttribute('aria-expanded', 'false');
            },
            toggle: function() {
                if (this.isOpen) {
                    this.close();
                } else {
                    this.open();
                }
            },
            sync: function() {
                this.buildOptions();
            },
            buildOptions: function() {
                var self = this;
                this.dropdown.innerHTML = '';
                var options = this.selectEl.options;
                
                for (var i = 0; i < options.length; i++) {
                    var opt = options[i];
                    var item = document.createElement('div');
                    item.className = 'custom-select-opt' + (opt.selected ? ' selected' : '');
                    item.setAttribute('role', 'option');
                    item.dataset.value = opt.value;
                    item.textContent = opt.textContent;
                    
                    item.addEventListener('click', (function(val) {
                        return function(e) {
                            e.stopPropagation();
                            self.selectValue(val);
                        };
                    })(opt.value));
                    
                    this.dropdown.appendChild(item);
                }
                
                this.updateLabel();
            },
            selectValue: function(val) {
                if (this.selectEl.value !== val) {
                    this.selectEl.value = val;
                    // إطلاق حدث change للأكواد المرتبطة
                    var event = new Event('change', { bubbles: true });
                    this.selectEl.dispatchEvent(event);
                }
                this.updateLabel();
                this.close();
            },
            updateLabel: function() {
                var selectedOpt = this.selectEl.options[this.selectEl.selectedIndex];
                this.valSpan.textContent = selectedOpt ? selectedOpt.textContent : '';
                
                var items = this.dropdown.querySelectorAll('.custom-select-opt');
                for (var i = 0; i < items.length; i++) {
                    items[i].classList.toggle('selected', items[i].dataset.value === this.selectEl.value);
                }
            }
        };
        
        // ربط النقر على تسمية الصندوق p-label لفتح القائمة أيضاً
        if (parentBox) {
            var label = parentBox.querySelector('.p-label');
            if (label) {
                label.style.cursor = 'pointer';
                label.addEventListener('click', function(e) {
                    e.stopPropagation();
                    controller.toggle();
                });
            }
        }
        
        // بناء الخيارات وتحديث النص
        controller.buildOptions();
        
        // ربط النقر على الزر
        trigger.addEventListener('click', function(e) {
            e.stopPropagation();
            controller.toggle();
        });
        
        // دعم لوحة المفاتيح
        trigger.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                controller.toggle();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                controller.close();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                var nextIdx = Math.min(selectEl.options.length - 1, selectEl.selectedIndex + 1);
                controller.selectValue(selectEl.options[nextIdx].value);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                var prevIdx = Math.max(0, selectEl.selectedIndex - 1);
                controller.selectValue(selectEl.options[prevIdx].value);
            }
        });
        
        // الاستماع للتغييرات البرمجية على select الأصلي
        selectEl.addEventListener('change', function() {
            controller.updateLabel();
        });
        
        instances.push(controller);
        return controller;
    }
    
    /**
     * مستمع عام للنقر خارج القوائم لإغلاقها
     */
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.custom-select-wrap') && !e.target.closest('.precision-select-box')) {
            closeAll();
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAll();
        }
    });
    
    /**
     * تهيئة جميع عناصر select في اللوحة
     */
    function initAll() {
        // تهيئة قائمة ترتيب القوالب أولاً
        var sortSelect = document.getElementById('presetsSortSelect');
        if (sortSelect) {
            init(sortSelect);
        }
        
        // تهيئة بقية القوائم ذات الفئة .sel
        var selects = document.querySelectorAll('select.sel, select.sel-sm');
        selects.forEach(function(sel) {
            init(sel);
        });
        
        TEXTORO.log('CustomSelect initialized (' + instances.length + ' instances)');
    }
    
    return {
        init: init,
        initAll: initAll,
        closeAll: closeAll,
        sync: function(selectEl) {
            instances.forEach(function(inst) {
                if (inst.selectEl === selectEl) {
                    inst.sync();
                }
            });
        }
    };
})();
