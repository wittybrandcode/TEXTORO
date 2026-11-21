/**
 * TEXTORO - Custom Select Dropdown Module
 * قوائم منسدلة احترافية بدون زوايا مدورة - Industrial Slate Architecture
 * @version 1.1.0
 */

TEXTORO.UI = TEXTORO.UI || {};

TEXTORO.UI.CustomSelect = (function() {
    'use strict';
    
    var instances = [];
    var CHEVRON_SVG = '<i class="ph-bold ph-caret-down"></i>';
    
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

                // حساب وتطبيق التموضع الذكي (Dropup أو Dropdown وضبط الحدود)
                updatePlacement(this);

                // تمرير الخيار المحدد إلى مجال الرؤية داخل القائمة
                var selectedOpt = this.dropdown.querySelector('.custom-select-opt.selected');
                if (selectedOpt && typeof selectedOpt.scrollIntoView === 'function') {
                    selectedOpt.scrollIntoView({ block: 'nearest' });
                }
            },
            close: function() {
                this.isOpen = false;
                this.wrapper.classList.remove('open');
                this.wrapper.classList.remove('dropup');
                if (this.parentBox) {
                    this.parentBox.classList.remove('select-open');
                    this.parentBox.classList.remove('dropup');
                }
                this.dropdown.classList.remove('align-right');
                this.dropdown.style.maxHeight = '';
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
     * حساب وتحديث التموضع الذكي للقائمة المنسدلة (اتجاه الفتح والحدود)
     * يمنع الفتح إلى ما وراء شريط الإجراءات أو حدود الشاشة
     * @param {Object} controller
     */
    function updatePlacement(controller) {
        if (!controller || !controller.isOpen) return;

        var trigger = controller.trigger;
        var dropdown = controller.dropdown;
        var wrapper = controller.wrapper;
        var parentBox = controller.parentBox;

        var triggerRect = trigger.getBoundingClientRect();
        var viewportHeight = window.innerHeight || (document.documentElement ? document.documentElement.clientHeight : 600);
        var viewportWidth = window.innerWidth || (document.documentElement ? document.documentElement.clientWidth : 800);

        // 1. الحد السفلي: مراعاة شريط الإجراءات السفلي (Action Bar)
        var bottomBoundary = viewportHeight;
        var actionBar = document.querySelector('.action-bar');
        if (actionBar) {
            var actionRect = actionBar.getBoundingClientRect();
            if (actionRect.top > 0 && actionRect.top < bottomBoundary) {
                bottomBoundary = actionRect.top;
            }
        }

        // 2. الحد العلوي: مراعاة الهيدر وشريط التبويبات العلوي
        var topBoundary = 0;
        var header = document.querySelector('.header') || document.querySelector('header');
        if (header) {
            var headerRect = header.getBoundingClientRect();
            if (headerRect.bottom > 0 && headerRect.bottom < triggerRect.top) {
                topBoundary = headerRect.bottom;
            }
        }

        // حساب المساحة المتاحة للأعلى والأسفل مع هامش أمان 8px
        var spaceBelow = Math.max(0, bottomBoundary - triggerRect.bottom - 8);
        var spaceAbove = Math.max(0, triggerRect.top - topBoundary - 8);

        // قياس الارتفاع الفعلي المطلوب للقائمة
        dropdown.style.visibility = 'hidden';
        dropdown.style.display = 'block';
        dropdown.style.maxHeight = 'none';
        var neededHeight = dropdown.scrollHeight || 180;
        dropdown.style.display = '';
        dropdown.style.visibility = '';

        // القرار الذكي:
        // إذا كانت المساحة بالأسفل غير كافية، والمساحة بالأعلى أكبر، نفتح للأعلى (Dropup)
        var isDropup = false;
        var availableHeight = spaceBelow;

        if (spaceBelow < neededHeight && spaceAbove > spaceBelow) {
            isDropup = true;
            availableHeight = spaceAbove;
        } else {
            isDropup = false;
            availableHeight = spaceBelow;
        }

        if (isDropup) {
            wrapper.classList.add('dropup');
            if (parentBox) parentBox.classList.add('dropup');
        } else {
            wrapper.classList.remove('dropup');
            if (parentBox) parentBox.classList.remove('dropup');
        }

        // تحديد أقصى ارتفاع مسموح به بحيث لا تتجاوز القائمة أي حد خارجي
        var finalMaxHeight = Math.max(65, Math.min(neededHeight, availableHeight));
        dropdown.style.maxHeight = finalMaxHeight + 'px';

        // 3. فحص الحدود الأفقية (اليمين واليسار)
        var dropRect = dropdown.getBoundingClientRect();
        if (dropRect.right > viewportWidth - 6 && triggerRect.left > 80) {
            dropdown.classList.add('align-right');
        } else {
            dropdown.classList.remove('align-right');
        }
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

    window.addEventListener('scroll', function() {
        closeAll();
    }, true);

    window.addEventListener('resize', function() {
        closeAll();
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
