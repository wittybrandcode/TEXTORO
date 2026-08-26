/**
 * TEXTORO - Markers Panel Module
 * لوحة إدارة الـ Markers
 * @version 3.3.0
 */

TEXTORO.Panels = TEXTORO.Panels || {};

TEXTORO.Panels.Markers = (function() {
    'use strict';
    
    var data = [];
    var filters = {
        IN_START: true,
        IN_END: true,
        OUT_START: true,
        OUT_END: true,
        BLINK_START: true,
        BLINK_END: true
    };
    var FILTER_MAP = {
        filterInStart: 'IN_START',
        filterInEnd: 'IN_END',
        filterOutStart: 'OUT_START',
        filterOutEnd: 'OUT_END',
        filterBlinkStart: 'BLINK_START',
        filterBlinkEnd: 'BLINK_END'
    };
    
    var elements = {
        tbody: null,
        selectAll: null,
        countEl: null,
        selectedCountEl: null
    };
    
    // حفظ التحديد للاستعادة بعد التحديث
    var savedSelection = null;
    
    function loadSavedFilters() {
        try {
            if (!TEXTORO.State || !TEXTORO.State.Manager || !TEXTORO.State.Manager.get) {
                return;
            }
            var saved = TEXTORO.State.Manager.get('markersFilters', null);
            if (!saved) return;
            
            for (var type in filters) {
                if (filters.hasOwnProperty(type) && saved.hasOwnProperty(type)) {
                    filters[type] = !!saved[type];
                }
            }
        } catch (e) {
            TEXTORO.log('MarkersPanel loadSavedFilters failed: ' + e.message);
        }
    }
    
    function persistFilters() {
        try {
            if (!TEXTORO.State || !TEXTORO.State.Manager || !TEXTORO.State.Manager.set) {
                return;
            }
            TEXTORO.State.Manager.set('markersFilters', Object.assign({}, filters));
        } catch (e) {
            TEXTORO.log('MarkersPanel persistFilters failed: ' + e.message);
        }
    }
    
    function applyFiltersToUI() {
        for (var id in FILTER_MAP) {
            if (!FILTER_MAP.hasOwnProperty(id)) continue;
            var el = document.getElementById(id);
            if (el) {
                el.checked = filters[FILTER_MAP[id]] === true;
            }
        }
    }
    
    /**
     * تهيئة اللوحة
     */
    function init() {
        // الحصول على العناصر
        elements.tbody = document.getElementById('markersTableBody');
        elements.selectAll = document.getElementById('markersSelectAll');
        elements.countEl = document.getElementById('markersCount');
        elements.selectedCountEl = document.getElementById('markersSelectedCount');
        
        // ربط الفلاتر
        loadSavedFilters();
        applyFiltersToUI();
        
        for (var id in FILTER_MAP) {
            if (!FILTER_MAP.hasOwnProperty(id)) continue;
            var el = document.getElementById(id);
            if (!el) continue;
            
            (function(filterType) {
                el.addEventListener('change', function() {
                    filters[filterType] = this.checked;
                    persistFilters();
                    render();
                });
            })(FILTER_MAP[id]);
        }
        
        // Select All
        if (elements.selectAll) {
            elements.selectAll.addEventListener('change', function() {
                if (this.checked) selectAll();
                else selectNone();
            });
        }
        
        // تهيئة خانات الوقت
        initTimeInputs();
        
        // ربط أزرار +/- للوقت
        bindTimeButtons();
        
        // ربط أزرار العمليات
        bindOperationButtons();
        
        // ربط أزرار التحديد السريع
        bindQuickSelectButtons();
        
        TEXTORO.log('MarkersPanel initialized');
    }
    
    /**
     * تهيئة خانات الوقت
     */
    function initTimeInputs() {
        ['markersOffset', 'markersStagger', 'markersAlignTime'].forEach(function(id) {
            TEXTORO.Time.initInput(id);
        });
    }
    
    /**
     * ربط أزرار +/- للوقت
     */
    function bindTimeButtons() {
        // Offset +/-
        TEXTORO.Utils.bindClick('btnOffsetMinus', function() {
            adjustTimeInput('markersOffset', -1);
        });
        TEXTORO.Utils.bindClick('btnOffsetPlus', function() {
            adjustTimeInput('markersOffset', 1);
        });
        
        // Stagger +/-
        TEXTORO.Utils.bindClick('btnStaggerMinus', function() {
            adjustTimeInput('markersStagger', -1);
        });
        TEXTORO.Utils.bindClick('btnStaggerPlus', function() {
            adjustTimeInput('markersStagger', 1);
        });
        
        // Align +/-
        TEXTORO.Utils.bindClick('btnAlignMinus', function() {
            adjustTimeInput('markersAlignTime', -1);
        });
        TEXTORO.Utils.bindClick('btnAlignPlus', function() {
            adjustTimeInput('markersAlignTime', 1);
        });
    }
    
    /**
     * تعديل خانة وقت بثانية
     */
    function adjustTimeInput(id, delta) {
        var input = document.getElementById(id);
        if (input) {
            input.value = TEXTORO.Time.addSecond(input.value, delta);
        }
    }
    
    /**
     * ربط أزرار العمليات
     */
    function bindOperationButtons() {
        // Markers Operations
        TEXTORO.Utils.bindClick('btnMarkersOffsetPlus', function() {
            TEXTORO.Ops.Markers.offset(1);
        });
        TEXTORO.Utils.bindClick('btnMarkersOffsetMinus', function() {
            TEXTORO.Ops.Markers.offset(-1);
        });
        TEXTORO.Utils.bindClick('btnMarkersStaggerPlus', function() {
            TEXTORO.Ops.Markers.stagger(1);
        });
        TEXTORO.Utils.bindClick('btnMarkersStaggerMinus', function() {
            TEXTORO.Ops.Markers.stagger(-1);
        });
        TEXTORO.Utils.bindClick('btnMarkersAlign', function() {
            TEXTORO.Ops.Markers.align();
        });
        
        // Layers Operations
        TEXTORO.Utils.bindClick('btnLayersOffsetPlus', function() {
            TEXTORO.Ops.Layers.offset(1);
        });
        TEXTORO.Utils.bindClick('btnLayersOffsetMinus', function() {
            TEXTORO.Ops.Layers.offset(-1);
        });
        TEXTORO.Utils.bindClick('btnLayersStaggerPlus', function() {
            TEXTORO.Ops.Layers.stagger(1);
        });
        TEXTORO.Utils.bindClick('btnLayersStaggerMinus', function() {
            TEXTORO.Ops.Layers.stagger(-1);
        });
        TEXTORO.Utils.bindClick('btnLayersAlign', function() {
            TEXTORO.Ops.Layers.align();
        });
    }
    
    /**
     * ربط أزرار التحديد السريع
     */
    function bindQuickSelectButtons() {
        // منع الربط المتكرر
        var btnLayer = document.getElementById('btnSelectLayer');
        if (btnLayer && !btnLayer._textorobound) {
            btnLayer._textorobound = true;
            btnLayer.addEventListener('click', selectByLayer);
            TEXTORO.log('Bound btnSelectLayer');
        }
        
        var btnInvert = document.getElementById('btnSelectInvert');
        if (btnInvert && !btnInvert._textorobound) {
            btnInvert._textorobound = true;
            btnInvert.addEventListener('click', selectInvert);
        }
        
        var btnNone = document.getElementById('btnSelectNone');
        if (btnNone && !btnNone._textorobound) {
            btnNone._textorobound = true;
            btnNone.addEventListener('click', selectNone);
        }
    }
    
    /**
     * تحميل البيانات من AE
     */
    function load(callback) {
        TEXTORO.HostBridge.run('collectTextoroMarkers', {}, function(res) {
            if (res.success) {
                data = res.data.markers || [];
                render();
                // استعادة التحديد إذا كان محفوظاً
                restoreSelection();
            } else {
                data = [];
                var loadError = (res && res.error) ? res.error : 'Failed to load markers';
                renderEmpty(loadError);
                TEXTORO.UI.StatusBar.error(loadError);
            }
            if (callback) callback(res);
        });
    }
    
    /**
     * تحديث اللوحة مع الحفاظ على التحديد
     */
    function refresh(keepSelection, selectionOverride) {
        if (keepSelection !== false) {
            if (selectionOverride && selectionOverride.length) {
                setSavedSelection(selectionOverride);
            } else if (selectionOverride && selectionOverride.length === 0) {
                savedSelection = [];
            } else {
                saveSelection();
            }
        }
        load();
    }
    
    /**
     * حفظ التحديد الحالي
     */
    function saveSelection() {
        savedSelection = [];
        if (!elements.tbody) return;
        
        elements.tbody.querySelectorAll('input[type="checkbox"]:checked').forEach(function(cb) {
            savedSelection.push({
                layerIndex: parseInt(cb.dataset.layer, 10),
                markerIndex: parseInt(cb.dataset.marker, 10),
                type: cb.dataset.type || '',
                time: parseFloat(cb.dataset.time) || 0
            });
        });
        
        TEXTORO.log('Saved selection: ' + savedSelection.length + ' markers');
    }
    
    /**
     * استعادة التحديد المحفوظ
     */
    function restoreSelection() {
        if (!savedSelection || savedSelection.length === 0) {
            TEXTORO.log('No saved selection to restore');
            return;
        }
        if (!elements.tbody) return;
        
        // تأخير قصير للتأكد من اكتمال رسم الجدول
        setTimeout(function() {
            var restoredCount = 0;
            var usedRows = {};
            
            savedSelection.forEach(function(sel) {
                var matched = false;
                
                // 1) تطابق دقيق بالفهرس
                elements.tbody.querySelectorAll('tr').forEach(function(tr, rowIndex) {
                    if (matched || usedRows[rowIndex]) return;
                    var cb = tr.querySelector('input[type="checkbox"]');
                    if (!cb) return;
                    
                    var layerIdx = parseInt(cb.dataset.layer, 10);
                    var markerIdx = parseInt(cb.dataset.marker, 10);
                    
                    if (sel.layerIndex === layerIdx && sel.markerIndex === markerIdx) {
                        cb.checked = true;
                        tr.classList.add('selected');
                        usedRows[rowIndex] = true;
                        restoredCount++;
                        matched = true;
                    }
                });
                
                // 2) Fallback بنفس layer/type وأقرب time
                if (!matched) {
                    elements.tbody.querySelectorAll('tr').forEach(function(tr, rowIndex) {
                        if (matched || usedRows[rowIndex]) return;
                        var cb = tr.querySelector('input[type="checkbox"]');
                        if (!cb) return;
                        
                        var layerIdx = parseInt(cb.dataset.layer, 10);
                        var markerType = cb.dataset.type || '';
                        var markerTime = parseFloat(cb.dataset.time) || 0;
                        
                        if (sel.layerIndex === layerIdx && sel.type === markerType && Math.abs(markerTime - sel.time) < 0.01) {
                            cb.checked = true;
                            tr.classList.add('selected');
                            usedRows[rowIndex] = true;
                            restoredCount++;
                            matched = true;
                        }
                    });
                }
            });
            
            TEXTORO.log('Restored selection: ' + restoredCount + '/' + savedSelection.length + ' markers');
            
            // مسح التحديد المحفوظ بعد الاستعادة
            savedSelection = null;
            
            updateSelectedCount();
        }, 50);
    }
    
    /**
     * عرض الجدول
     */
    function render() {
        if (!elements.tbody) {
            elements.tbody = document.getElementById('markersTableBody');
        }
        if (!elements.tbody) return;
        
        // فلترة البيانات
        var filtered = data.filter(function(m) {
            return filters[m.type] === true;
        });
        
        // تحديث العداد
        updateCount(filtered.length);
        
        if (filtered.length === 0) {
            renderEmpty('No markers match filters');
            return;
        }
        
        elements.tbody.innerHTML = '';
        
        filtered.forEach(function(marker, idx) {
            var tr = createRow(marker, idx);
            elements.tbody.appendChild(tr);
        });
        
        updateSelectedCount();
    }
    
    /**
     * عرض رسالة فارغة
     */
    function renderEmpty(msg) {
        if (!elements.tbody) return;
        elements.tbody.innerHTML = '<tr><td colspan="4" class="empty-msg">' + (msg || 'No markers') + '</td></tr>';
        updateCount(0);
        updateSelectedCount();
    }
    
    /**
     * إنشاء صف
     */
    function createRow(marker, idx) {
        var tr = document.createElement('tr');
        tr.dataset.idx = idx;
        tr.dataset.layerIndex = marker.layerIndex;
        tr.dataset.markerIndex = marker.markerIndex;
        tr.dataset.time = marker.time;
        tr.dataset.type = marker.type;
        
        if (marker.isLayerSelected) {
            tr.classList.add('ae-layer-selected');
        }
        
        var typeClass = getTypeClass(marker.type);
        var timeStr = TEXTORO.Time.fromSeconds(marker.time);
        var layerMark = marker.isLayerSelected ? '<span class="ae-selected" title="Selected in AE">●</span> ' : '';
        
        tr.innerHTML = 
            '<td class="cb-cell"><input type="checkbox" data-layer="' + marker.layerIndex + 
            '" data-marker="' + marker.markerIndex + '" data-time="' + marker.time + 
            '" data-type="' + marker.type + '"></td>' +
            '<td class="layer-cell" title="' + TEXTORO.Utils.escapeHtml(marker.layerName) + '">' +
                layerMark + TEXTORO.Utils.escapeHtml(TEXTORO.Utils.truncate(marker.layerName, 15)) + '</td>' +
            '<td class="type-cell ' + typeClass + '">' + marker.type + '</td>' +
            '<td class="time-cell">' + timeStr + '</td>';
        
        // حدث النقر
        tr.addEventListener('click', function(e) {
            var cb = tr.querySelector('input[type="checkbox"]');
            if (e.target !== cb) {
                cb.checked = !cb.checked;
            }
            tr.classList.toggle('selected', cb.checked);
            updateSelectedCount();
        });
        
        return tr;
    }
    
    /**
     * الحصول على class النوع
     */
    function getTypeClass(type) {
        if (type.indexOf('IN') === 0) return 'marker-type-in';
        if (type.indexOf('OUT') === 0) return 'marker-type-out';
        if (type.indexOf('BLINK') === 0) return 'marker-type-blink';
        return '';
    }
    
    /**
     * تحديث عداد الإجمالي
     */
    function updateCount(total) {
        if (!elements.countEl) {
            elements.countEl = document.getElementById('markersCount');
        }
        if (elements.countEl) {
            elements.countEl.textContent = '(' + total + ')';
        }
    }
    
    /**
     * تحديث عداد المحدد
     */
    function updateSelectedCount() {
        if (!elements.tbody) return;
        
        var checkboxes = elements.tbody.querySelectorAll('input[type="checkbox"]');
        var checked = elements.tbody.querySelectorAll('input[type="checkbox"]:checked');
        var count = checked.length;
        var total = checkboxes.length;
        
        if (!elements.selectedCountEl) {
            elements.selectedCountEl = document.getElementById('markersSelectedCount');
        }
        if (elements.selectedCountEl) {
            elements.selectedCountEl.textContent = count;
        }
        
        // تحديث Select All
        if (!elements.selectAll) {
            elements.selectAll = document.getElementById('markersSelectAll');
        }
        if (elements.selectAll) {
            if (total === 0) {
                elements.selectAll.checked = false;
                elements.selectAll.indeterminate = false;
            } else if (count === 0) {
                elements.selectAll.checked = false;
                elements.selectAll.indeterminate = false;
            } else if (count === total) {
                elements.selectAll.checked = true;
                elements.selectAll.indeterminate = false;
            } else {
                elements.selectAll.checked = false;
                elements.selectAll.indeterminate = true;
            }
        }
    }
    
    /**
     * الحصول على البيانات المحددة
     */
    function getSelected() {
        var selected = [];
        if (!elements.tbody) return selected;
        
        elements.tbody.querySelectorAll('input[type="checkbox"]:checked').forEach(function(cb) {
            selected.push({
                layerIndex: parseInt(cb.dataset.layer, 10),
                markerIndex: parseInt(cb.dataset.marker, 10),
                time: parseFloat(cb.dataset.time) || 0,
                type: cb.dataset.type || ''
            });
        });
        
        return selected;
    }
    
    /**
     * تحديد الكل
     */
    function selectAll() {
        if (!elements.tbody) return;
        elements.tbody.querySelectorAll('tr').forEach(function(tr) {
            var cb = tr.querySelector('input[type="checkbox"]');
            if (cb) {
                cb.checked = true;
                tr.classList.add('selected');
            }
        });
        updateSelectedCount();
    }
    
    /**
     * إلغاء التحديد
     */
    function selectNone() {
        if (!elements.tbody) return;
        elements.tbody.querySelectorAll('tr').forEach(function(tr) {
            var cb = tr.querySelector('input[type="checkbox"]');
            if (cb) {
                cb.checked = false;
                tr.classList.remove('selected');
            }
        });
        updateSelectedCount();
    }
    
    /**
     * عكس التحديد
     */
    function selectInvert() {
        if (!elements.tbody) return;
        elements.tbody.querySelectorAll('tr').forEach(function(tr) {
            var cb = tr.querySelector('input[type="checkbox"]');
            if (cb) {
                cb.checked = !cb.checked;
                tr.classList.toggle('selected', cb.checked);
            }
        });
        updateSelectedCount();
    }
    
    /**
     * تحديد حسب الطبقة المحددة في AE
     * يُحدّث البيانات أولاً ثم يحدد الـ markers
     */
    function selectByLayer() {
        // تحديث البيانات أولاً للحصول على حالة التحديد الحالية في AE
        TEXTORO.HostBridge.run('collectTextoroMarkers', {}, function(res) {
            if (!res.success) {
                var errorMsg = (res && res.error) ? res.error : 'Failed to get markers';
                TEXTORO.UI.StatusBar.error(errorMsg);
                return;
            }
            
            // تحديث البيانات
            data = res.data.markers || [];
            
            // إعادة رسم الجدول
            render();
            
            // الآن نحدد الـ markers التي تنتمي للطبقات المحددة
            if (!elements.tbody) return;
            
            var selectedCount = 0;
            elements.tbody.querySelectorAll('tr').forEach(function(tr) {
                var cb = tr.querySelector('input[type="checkbox"]');
                var isAESelected = tr.classList.contains('ae-layer-selected');
                if (cb) {
                    cb.checked = isAESelected;
                    tr.classList.toggle('selected', isAESelected);
                    if (isAESelected) selectedCount++;
                }
            });
            
            updateSelectedCount();
            
            if (selectedCount > 0) {
                TEXTORO.UI.StatusBar.success('Selected ' + selectedCount + ' markers from AE layers');
            } else {
                TEXTORO.UI.StatusBar.info('No layers selected in AE');
            }
        });
    }
    
    /**
     * تعيين التحديد المحفوظ يدوياً (يستخدم بعد عمليات host)
     */
    function setSavedSelection(selection) {
        if (!selection || !selection.length) {
            savedSelection = [];
            return;
        }
        savedSelection = [];
        for (var i = 0; i < selection.length; i++) {
            savedSelection.push({
                layerIndex: parseInt(selection[i].layerIndex, 10),
                markerIndex: parseInt(selection[i].markerIndex, 10),
                type: selection[i].type || '',
                time: parseFloat(selection[i].time) || 0
            });
        }
    }
    
    /**
     * تعيين فلتر
     */
    function setFilter(type, enabled) {
        if (filters.hasOwnProperty(type)) {
            filters[type] = enabled;
            persistFilters();
            render();
        }
    }
    
    /**
     * الحصول على الفلاتر
     */
    function getFilters() {
        return Object.assign({}, filters);
    }
    
    // Public API
    return {
        init: init,
        load: load,
        refresh: refresh,
        render: render,
        getSelected: getSelected,
        selectAll: selectAll,
        selectNone: selectNone,
        selectInvert: selectInvert,
        selectByLayer: selectByLayer,
        setSavedSelection: setSavedSelection,
        setFilter: setFilter,
        getFilters: getFilters
    };
})();

// Aliases للتوافق مع الكود القديم
var markersData = [];

function initMarkersPanel() {
    TEXTORO.Panels.Markers.init();
}

function refreshMarkersTable(keepSelection) {
    TEXTORO.Panels.Markers.refresh(keepSelection);
}

function updateMarkersSelectedCount() {
    // يتم تلقائياً
}

function getSelectedMarkersData() {
    return TEXTORO.Panels.Markers.getSelected();
}

function selectMarkersByLayer() {
    TEXTORO.Panels.Markers.selectByLayer();
}

function invertMarkersSelection() {
    TEXTORO.Panels.Markers.selectInvert();
}

function clearMarkersSelection() {
    TEXTORO.Panels.Markers.selectNone();
}

function initTimeInputs() {
    // يتم في init
}
