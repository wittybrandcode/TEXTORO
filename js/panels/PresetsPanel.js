/**
 * TEXTORO - Presets Panel Module
 * لوحة البريسات
 * @version 3.3.0
 */

TEXTORO.Panels = TEXTORO.Panels || {};

TEXTORO.Panels.Presets = (function() {
    'use strict';
    
    var cache = [];
    var currentFilter = 'all';
    var currentSort = 'name-asc';
    var searchQuery = '';
    var favorites = [];
    var selectedPreset = null;
    
    var elements = {
        container: null,
        searchInput: null,
        searchClear: null,
        sortSelect: null
    };
    
    /**
     * تهيئة اللوحة
     */
    function init() {
        elements.container = document.getElementById('presetsListContainer');
        elements.searchInput = document.getElementById('presetsSearchInput');
        elements.searchClear = document.getElementById('presetsSearchClear');
        elements.sortSelect = document.getElementById('presetsSortSelect');
        elements.motionOptions = document.getElementById('presetsMotionOptions');
        elements.motionSync = document.getElementById('presetsMotionSync');
        
        // تحميل المفضلة
        loadFavorites();
        
        // استعادة الإعدادات
        currentFilter = (TEXTORO.State && TEXTORO.State.Manager && typeof TEXTORO.State.Manager.get === 'function') ? TEXTORO.State.Manager.get('presetsFilter', 'all') : 'all';
        currentSort = (TEXTORO.State && TEXTORO.State.Manager && typeof TEXTORO.State.Manager.get === 'function') ? TEXTORO.State.Manager.get('presetsSort', 'name-asc') : 'name-asc';
        
        if (elements.sortSelect) {
            elements.sortSelect.value = currentSort;
        }
        
        // ربط أزرار الفلتر
        document.querySelectorAll('.filter-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.filter-btn').forEach(function(b) {
                    b.classList.remove('active');
                });
                this.classList.add('active');
                currentFilter = this.dataset.filter;
                if (TEXTORO.State && TEXTORO.State.Manager && typeof TEXTORO.State.Manager.set === 'function') TEXTORO.State.Manager.set('presetsFilter', currentFilter);
                
                // إظهار/إخفاء خيارات Motion
                updateMotionOptionsVisibility();
                
                render();
            });
            
            // تفعيل الفلتر المحفوظ
            btn.classList.toggle('active', btn.dataset.filter === currentFilter);
        });
        
        // إظهار خيارات Motion إذا كان الفلتر motion-full
        updateMotionOptionsVisibility();
        
        // ربط الترتيب
        if (elements.sortSelect) {
            elements.sortSelect.addEventListener('change', function() {
                currentSort = this.value;
                if (TEXTORO.State && TEXTORO.State.Manager && typeof TEXTORO.State.Manager.set === 'function') TEXTORO.State.Manager.set('presetsSort', currentSort);
                render();
            });
        }
        
        // ربط البحث
        if (elements.searchInput) {
            var debouncedSearch = TEXTORO.Utils.debounce(function() {
                render();
            }, TEXTORO.Config.TIMING.SEARCH_DEBOUNCE_DELAY);
            
            elements.searchInput.addEventListener('input', function() {
                searchQuery = this.value.toLowerCase().trim();
                if (elements.searchClear) {
                    elements.searchClear.style.display = searchQuery ? 'flex' : 'none';
                }
                debouncedSearch();
            });
        }
        
        if (elements.searchClear) {
            elements.searchClear.addEventListener('click', function() {
                if (elements.searchInput) elements.searchInput.value = '';
                searchQuery = '';
                this.style.display = 'none';
                render();
            });
        }
        
        // زر التحديث
        TEXTORO.Utils.bindClick('presetsRefreshBtn', function() {
            load(true);
        });

        // زر التطبيق في شريط البحث / الرأس
        TEXTORO.Utils.bindClick('presetsHeaderApplyBtn', function() {
            applySelected();
        });

        // زر إنشاء جديد في شريط البحث / الرأس
        TEXTORO.Utils.bindClick('presetsHeaderNewBtn', function() {
            createFromLayer();
        });
        
        // زر فتح المجلد
        TEXTORO.Utils.bindClick('openPresetsFolderBtn', function() {
            TEXTORO.HostBridge.run('openPresetsFolder', null, function(res) {
                if (res.success) {
                    TEXTORO.UI.StatusBar.success('Folder opened');
                } else {
                    TEXTORO.UI.StatusBar.error('Cannot open folder');
                }
            });
        });
        
        // تحميل البريسات
        load();
        
        TEXTORO.log('PresetsPanel initialized');
    }
    
    /**
     * تحميل المفضلة من localStorage
     */
    function loadFavorites() {
        if (TEXTORO.State && TEXTORO.State.Manager) {
            favorites = TEXTORO.State.Manager.get('favorites', []);
        } else {
            try {
                var stored = localStorage.getItem('textoro_favorites');
                favorites = stored ? JSON.parse(stored) : [];
            } catch(e) {
                favorites = [];
            }
        }
    }
    
    /**
     * حفظ المفضلة
     */
    function saveFavorites() {
        if (TEXTORO.State && TEXTORO.State.Manager) {
            TEXTORO.State.Manager.set('favorites', favorites);
        } else {
            try {
                localStorage.setItem('textoro_favorites', JSON.stringify(favorites));
            } catch(e) {
                TEXTORO.error('Error saving favorites');
            }
        }
    }
    
    /**
     * التحقق من المفضلة
     */
    function isFavorite(preset) {
        var key = preset.fileName || preset.id || preset.name;
        return favorites.indexOf(key) > -1;
    }
    
    /**
     * تبديل المفضلة
     */
    function toggleFavorite(preset) {
        var key = preset.fileName || preset.id || preset.name;
        var idx = favorites.indexOf(key);
        if (idx > -1) {
            favorites.splice(idx, 1);
        } else {
            favorites.push(key);
        }
        saveFavorites();
        render();
    }
    
    /**
     * تحميل البريسات
     */
    function load(forceReload) {
        if (!elements.container) {
            elements.container = document.getElementById('presetsListContainer');
        }
        if (!elements.container) return;
        
        elements.container.innerHTML = '<div class="presets-loading"><i class="ph-bold ph-spinner ph-spin"></i><p>Loading...</p></div>';
        
        var categories = TEXTORO.Config.PRESET_CATEGORIES;
        var loadedCount = 0;
        var allPresets = [];
        var failCount = 0;      // E-01
        var lastError = '';     // E-01

        categories.forEach(function(category) {
            TEXTORO.HostBridge.run('loadPresets', {
                category: category,
                forceReload: forceReload || false
            }, function(res) {
                loadedCount++;

                if (res.success && res.data && res.data.presets) {
                    res.data.presets.forEach(function(preset) {
                        preset.category = category;
                        allPresets.push(preset);
                    });
                } else {
                    // E-01: لا نبتلع الفشل - نسجله ونعرفه للمستخدم
                    failCount++;
                    lastError = (res && res.error) || 'Unknown error';
                    TEXTORO.error('[PresetsPanel] loadPresets("' + category + '") failed: ' + lastError);
                }

                if (loadedCount === categories.length) {
                    cache = allPresets;
                    render();

                    // E-01: رسائل واضحة حسب حجم الفشل
                    if (!allPresets.length && failCount > 0) {
                        TEXTORO.UI.StatusBar.error('Presets failed to load (' + failCount + '/' + categories.length + '): ' + lastError);
                        var safeMsg = String(lastError).replace(/[<>&]/g, '');
                        elements.container.innerHTML = '<div class="presets-loading"><i class="ph-bold ph-warning"></i><p>Failed to load presets<br><small>' +
                            safeMsg + '</small></p></div>';
                    } else if (failCount > 0) {
                        TEXTORO.UI.StatusBar.warning(failCount + ' preset category(ies) failed: ' + lastError);
                    }

                    if (forceReload) {
                        TEXTORO.UI.StatusBar.success('Presets refreshed!');
                    }
                }
            });
        });
    }
    
    /**
     * ترتيب البريسات
     */
    function sortPresets(presets, sortType) {
        var sorted = presets.slice();
        
        switch(sortType) {
            case 'name-asc':
                sorted.sort(function(a, b) {
                    return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
                });
                break;
            case 'name-desc':
                sorted.sort(function(a, b) {
                    return b.name.toLowerCase().localeCompare(a.name.toLowerCase());
                });
                break;
            case 'category':
                sorted.sort(function(a, b) {
                    var catOrder = TEXTORO.Config.PRESET_CATEGORIES;
                    var aIdx = catOrder.indexOf(a.category);
                    var bIdx = catOrder.indexOf(b.category);
                    if (aIdx !== bIdx) return aIdx - bIdx;
                    return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
                });
                break;
            case 'favorites':
                sorted.sort(function(a, b) {
                    var aFav = isFavorite(a) ? 0 : 1;
                    var bFav = isFavorite(b) ? 0 : 1;
                    if (aFav !== bFav) return aFav - bFav;
                    return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
                });
                break;
        }
        
        return sorted;
    }
    
    /**
     * عرض البريسات
     */
    function render() {
        if (!elements.container) return;
        
        // فلترة
        var filtered = cache.filter(function(preset) {
            if (currentFilter === 'favorites') {
                return isFavorite(preset);
            }
            if (currentFilter !== 'all') {
                if (currentFilter === 'motion' || currentFilter === 'motion-full') {
                    if (preset.category !== 'motion' && preset.category !== 'motion-full') return false;
                } else if (preset.category !== currentFilter) {
                    return false;
                }
            }
            if (searchQuery && preset.name.toLowerCase().indexOf(searchQuery) === -1) {
                return false;
            }
            return true;
        });
        
        // ترتيب
        filtered = sortPresets(filtered, currentSort);
        
        elements.container.innerHTML = '';
        
        if (filtered.length === 0) {
            // SEC-01 audit: استعلام البحث من إدخال المستخدم - يُهرَّب قبل innerHTML
            var safeQuery = String(searchQuery).replace(/[<>&"]/g, '');
            var emptyMsg = currentFilter === 'favorites'
                ? 'No favorite presets yet. Click ⭐ to add.'
                : (searchQuery
                    ? 'No presets match "' + safeQuery + '"'
                    : 'No presets in this category');
            elements.container.innerHTML = '<div class="presets-empty"><i class="ph-bold ph-package"></i><p>' + emptyMsg + '</p></div>';
            return;
        }
        
        filtered.forEach(function(preset) {
            var item = createPresetItem(preset);
            elements.container.appendChild(item);
        });
    }
    
    /**
     * Helper to parse color values from preset
     */
    function parsePresetColor(c, defaultR, defaultG, defaultB) {
        if (Array.isArray(c)) {
            return [
                Math.round((c[0] != null ? c[0] : defaultR) * 255),
                Math.round((c[1] != null ? c[1] : defaultG) * 255),
                Math.round((c[2] != null ? c[2] : defaultB) * 255)
            ];
        }
        if (typeof c === 'string' && c.indexOf('#') === 0) {
            var rgb = (TEXTORO.Utils && typeof TEXTORO.Utils.hexToRgb === 'function') ? TEXTORO.Utils.hexToRgb(c) : [1, 1, 1];
            return [Math.round(rgb[0] * 255), Math.round(rgb[1] * 255), Math.round(rgb[2] * 255)];
        }
        return [defaultR, defaultG, defaultB];
    }

    /**
     * Helper to apply real box styling to preview shape
     */
    function applyBoxStyles(el, vals) {
        if (!vals) return;
        var rgb = parsePresetColor(vals.fillColor, 20, 20, 28);
        var fillOp = (vals.fillOpacity != null) ? (vals.fillOpacity / 100) : 0.85;
        
        el.style.backgroundColor = (fillOp <= 0.02) ? 'transparent' : 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + fillOp + ')';
        
        var rad = (vals.cornerRadius != null) ? vals.cornerRadius : 0;
        el.style.borderRadius = Math.min(rad, 10) + 'px';
        
        var sWidth = vals.strokeWidth || 0;
        var sOp = (vals.strokeOpacity != null) ? (vals.strokeOpacity / 100) : 1;
        if (sWidth > 0 && sOp > 0.05) {
            var sRgb = parsePresetColor(vals.strokeColor, 255, 255, 255);
            el.style.border = Math.min(Math.max(sWidth, 1), 2) + 'px solid rgba(' + sRgb[0] + ',' + sRgb[1] + ',' + sRgb[2] + ',' + sOp + ')';
        } else {
            el.style.border = '1px solid rgba(255, 255, 255, 0.08)';
        }
    }

    /**
     * Determine animation keyframe class for motion presets
     */
    function getMotionPreviewClass(preset) {
        var raw = String(preset.id || preset.fileName || preset.name || '').toLowerCase();
        if (raw.indexOf('bounce') !== -1 || raw.indexOf('pop') !== -1) return 'bounce';
        if (raw.indexOf('slide') !== -1 || raw.indexOf('up') !== -1 || raw.indexOf('down') !== -1 || raw.indexOf('rise') !== -1) return 'slide-up';
        if (raw.indexOf('spin') !== -1 || raw.indexOf('zoom') !== -1 || raw.indexOf('flip') !== -1) return 'spin-zoom';
        return 'bounce';
    }

    /**
     * Build realistic live preview window stage
     */
    function buildPresetPreview(preset) {
        var stage = document.createElement('div');
        stage.className = 'preset-preview-stage';
        
        var cat = (preset.category || '').toLowerCase();
        var vals = preset.values || {};
        
        if (cat === 'box') {
            var boxEl = document.createElement('div');
            boxEl.className = 'preview-box-shape';
            applyBoxStyles(boxEl, vals);
            
            var textEl = document.createElement('span');
            textEl.className = 'preview-box-text';
            textEl.textContent = 'TEXTORO';
            boxEl.appendChild(textEl);
            
            stage.appendChild(boxEl);
        } else if (cat === 'type') {
            var twWrap = document.createElement('div');
            twWrap.className = 'preview-type-wrap';
            
            var textEl = document.createElement('span');
            textEl.className = 'preview-type-text';
            textEl.textContent = (vals.wordMode ? 'TEXT ORO' : 'TEXTORO');
            twWrap.appendChild(textEl);
            
            if (vals.showCursor !== false) {
                var cursorEl = document.createElement('span');
                var cType = vals.cursorType || 0;
                var cursorChar = (cType === 1) ? '_' : ((cType === 2) ? '█' : '|');
                cursorEl.className = 'preview-cursor';
                cursorEl.textContent = cursorChar;
                twWrap.appendChild(cursorEl);
            }
            
            stage.appendChild(twWrap);
        } else if (cat === 'mix') {
            var boxVals = vals.box || {};
            var typeVals = vals.type || {};
            
            var boxEl = document.createElement('div');
            boxEl.className = 'preview-box-shape';
            applyBoxStyles(boxEl, boxVals);
            
            var twWrap = document.createElement('div');
            twWrap.className = 'preview-type-wrap';
            
            var textEl = document.createElement('span');
            textEl.className = 'preview-type-text';
            textEl.textContent = 'TEXTORO';
            twWrap.appendChild(textEl);
            
            if (typeVals.showCursor !== false) {
                var cursorEl = document.createElement('span');
                cursorEl.className = 'preview-cursor';
                cursorEl.textContent = '|';
                twWrap.appendChild(cursorEl);
            }
            
            boxEl.appendChild(twWrap);
            stage.appendChild(boxEl);
        } else if (cat === 'motion' || cat === 'motion-full') {
            var motionWrap = document.createElement('div');
            var mKey = getMotionPreviewClass(preset);
            motionWrap.className = 'preview-motion-wrap anim-' + mKey;
            
            var textEl = document.createElement('span');
            textEl.className = 'preview-motion-text';
            textEl.textContent = 'TEXTORO';
            motionWrap.appendChild(textEl);
            
            stage.appendChild(motionWrap);
        } else if (cat === 'toro') {
            var boxVals = vals.box || {};
            
            var motionWrap = document.createElement('div');
            motionWrap.className = 'preview-motion-wrap anim-toro';
            
            var boxEl = document.createElement('div');
            boxEl.className = 'preview-box-shape';
            applyBoxStyles(boxEl, boxVals);
            
            var textEl = document.createElement('span');
            textEl.className = 'preview-type-text';
            textEl.textContent = 'TEXTORO';
            boxEl.appendChild(textEl);
            
            motionWrap.appendChild(boxEl);
            stage.appendChild(motionWrap);
        } else {
            var genericText = document.createElement('span');
            genericText.className = 'preview-type-text';
            genericText.textContent = preset.name || 'TEXTORO';
            stage.appendChild(genericText);
        }
        
        return stage;
    }

    /**
     * إنشاء عنصر بريست (بطاقة معاينة واقعية ممتدة مع شريط الاسم والنوع)
     */
    function createPresetItem(preset) {
        var item = document.createElement('div');
        item.className = 'preset-item' + (preset.builtin ? ' builtin' : '');
        if (selectedPreset && (selectedPreset.id === preset.id || selectedPreset.fileName === preset.fileName)) {
            item.classList.add('selected');
        }
        item.dataset.category = preset.category;
        item.dataset.filename = preset.fileName || '';
        
        // 1. Realistic Preview Window (Upper Viewport)
        var previewWindow = document.createElement('div');
        previewWindow.className = 'preset-preview-window';
        
        var previewStage = buildPresetPreview(preset);
        previewWindow.appendChild(previewStage);
        
        // Apply Button in Preview Window
        var applyBtn = document.createElement('button');
        applyBtn.className = 'preset-apply-btn';
        applyBtn.innerHTML = '<i class="ph-bold ph-check"></i>';
        applyBtn.title = 'Apply to selected text layer';
        applyBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (preset.category === 'motion-full') {
                applyMotionFull(preset);
            } else {
                apply(preset);
            }
        });
        previewWindow.appendChild(applyBtn);
        item.appendChild(previewWindow);
        
        // 2. Bottom Meta Bar (Name, Badge, Star, Delete)
        var metaBar = document.createElement('div');
        metaBar.className = 'preset-meta-bar';
        
        var nameSpan = document.createElement('span');
        nameSpan.className = 'preset-name';
        nameSpan.textContent = String(preset.name || '');
        metaBar.appendChild(nameSpan);
        
        var metaRight = document.createElement('div');
        metaRight.className = 'preset-meta-right';
        
        var badge = document.createElement('span');
        var badgeCategory = (preset.category || '').replace('-full', '');
        badge.className = 'preset-badge ' + badgeCategory;
        var badgeText = preset.category === 'motion-full' ? 'Motion' : 
                        (preset.category.charAt(0).toUpperCase() + preset.category.slice(1));
        badge.textContent = badgeText;
        metaRight.appendChild(badge);
        
        var favBtn = document.createElement('button');
        favBtn.className = 'preset-fav-btn' + (isFavorite(preset) ? ' active' : '');
        favBtn.innerHTML = '<i class="ph-bold ph-star"></i>';
        favBtn.title = isFavorite(preset) ? 'Remove from favorites' : 'Add to favorites';
        favBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleFavorite(preset);
        });
        metaRight.appendChild(favBtn);
        
        if (!preset.builtin) {
            var delBtn = document.createElement('button');
            delBtn.className = 'preset-delete-btn';
            delBtn.innerHTML = '<i class="ph-bold ph-trash"></i>';
            delBtn.title = 'Delete preset';
            delBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                confirmDelete(preset);
            });
            metaRight.appendChild(delBtn);
        }
        
        metaBar.appendChild(metaRight);
        item.appendChild(metaBar);
        
        // Click to select
        item.addEventListener('click', function() {
            document.querySelectorAll('.preset-item.selected').forEach(function(el) {
                el.classList.remove('selected');
            });
            item.classList.add('selected');
            selectedPreset = preset;
        });
        
        // Double click to apply
        item.addEventListener('dblclick', function() {
            if (preset.category === 'motion-full') {
                applyMotionFull(preset);
            } else {
                apply(preset);
            }
        });
        
        // Context menu
        item.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            showContextMenu(e, preset);
        });
        
        // Tooltip
        item.title = buildTooltip(preset);
        
        return item;
    }
    
    /**
     * إظهار/إخفاء خيارات Motion
     */
    function updateMotionOptionsVisibility() {
        if (elements.motionOptions) {
            var showOptions = (currentFilter === 'motion-full' || currentFilter === 'motion');
            elements.motionOptions.style.display = showOptions ? 'block' : 'none';
        }
    }
    
    /**
     * التحقق من تفعيل Sync with Markers
     */
    function isSyncWithMarkersEnabled() {
        return elements.motionSync && elements.motionSync.checked;
    }
    
    /**
     * تطبيق Motion Full preset (بريست كامل IN+OUT)
     */
    function applyMotionFull(preset) {
        if (!preset || !preset.values) {
            TEXTORO.UI.StatusBar.error('Invalid preset');
            return;
        }
        
        var opts = {
            category: 'motion-full',
            mode: 'both', // دائماً both للبريسات الكاملة
            syncWithMarkers: isSyncWithMarkersEnabled() // استخدام توقيت الـ markers
        };
        
        if (preset.fileName) {
            opts.fileName = preset.fileName;
        } else if (preset.id) {
            opts.id = preset.id;
        }
        
        var statusMsg = 'Applying ' + preset.name;
        if (opts.syncWithMarkers) {
            statusMsg += ' (synced with markers)';
        }
        TEXTORO.UI.StatusBar.set(statusMsg + '...', '');
        
        TEXTORO.HostBridge.run('applyMotionPreset', opts, function(res) {
            if (res.success) {
                TEXTORO.UI.StatusBar.success('Applied: ' + preset.name);
            } else {
                TEXTORO.UI.StatusBar.error('Error: ' + (res.error || 'Failed'));
            }
        });
    }
    
    /**
     * بناء tooltip
     */
    function buildTooltip(preset) {
        var lines = [preset.name];
        lines.push(preset.builtin ? '📦 Built-in' : '👤 User preset');
        lines.push('Category: ' + preset.category);
        if (preset.description) lines.push(preset.description);
        lines.push('Click to apply • ⭐ to favorite');
        return lines.join('\n');
    }
    
    /**
     * تطبيق بريست
     */
    function apply(preset) {
        if (!preset) {
            TEXTORO.UI.StatusBar.error('No preset selected');
            return;
        }
        
        var opts = {
            category: preset.category
        };
        
        if (preset.fileName) {
            opts.fileName = preset.fileName;
        } else if (preset.id) {
            opts.id = preset.id;
        }
        
        var scriptName = (preset.category === 'motion' || preset.category === 'motion-full') ? 'applyMotionPreset' : 'applyPreset';
        
        TEXTORO.UI.StatusBar.set('Applying ' + preset.name + '...', '');
        
        TEXTORO.HostBridge.run(scriptName, opts, function(res) {
            if (res.success) {
                TEXTORO.UI.StatusBar.success('Applied: ' + preset.name);
            } else {
                TEXTORO.UI.StatusBar.error('Error: ' + (res.error || 'Failed'));
            }
        });
    }
    
    /**
     * تأكيد الحذف
     */
    function confirmDelete(preset) {
        // DATA-01: الحذف بالـ id فقط (§4.2)
        if (!preset.id || preset.builtin) {
            TEXTORO.UI.StatusBar.error(preset.builtin ? 'Cannot delete built-in preset' : 'Invalid preset id');
            return;
        }
        TEXTORO.UI.Modals.showConfirm({
            title: '🗑️ Delete Preset',
            message: 'Delete "' + preset.name + '"?',
            onConfirm: function() {
                TEXTORO.HostBridge.run('deletePreset', {
                    category: preset.category,
                    id: preset.id
                }, function(res) {
                    if (res.success) {
                        TEXTORO.UI.StatusBar.success('Deleted: ' + preset.name);
                        load(true);
                    } else {
                        TEXTORO.UI.StatusBar.error('Error: ' + (res.error || 'Failed'));
                    }
                });
            }
        });
    }
    
    /**
     * عرض قائمة السياق
     */
    function showContextMenu(e, preset) {
        TEXTORO.UI.ContextMenu.show(e, [
            {
                label: 'Apply',
                icon: 'ph-bold ph-play',
                action: function() { apply(preset); }
            },
            { separator: true },
            {
                label: preset.builtin ? 'Delete (Built-in)' : 'Delete',
                icon: 'ph-bold ph-trash',
                disabled: preset.builtin,
                danger: !preset.builtin,
                action: function() { confirmDelete(preset); }
            }
        ]);
    }
    
    /**
     * تطبيق البريست المحدد حالياً
     */
    function applySelected() {
        if (!selectedPreset) {
            var firstItem = elements.container ? elements.container.querySelector('.preset-item') : null;
            if (firstItem && cache.length > 0) {
                var fname = firstItem.dataset.filename;
                selectedPreset = cache.find(function(p) { return p.fileName === fname; }) || cache[0];
                if (firstItem) firstItem.classList.add('selected');
            }
        }
        
        if (!selectedPreset) {
            TEXTORO.UI.StatusBar.warning('Select a preset to apply');
            return;
        }
        
        if (selectedPreset.category === 'motion-full') {
            applyMotionFull(selectedPreset);
        } else {
            apply(selectedPreset);
        }
    }
    
    /**
     * إنشاء بريست جديد من الطبقة النشطة
     */
    function createFromLayer() {
        var cat = (currentFilter !== 'all' && currentFilter !== 'favorites') ? currentFilter : 'toro';
        if (TEXTORO.Ops && TEXTORO.Ops.Presets && typeof TEXTORO.Ops.Presets.saveFromLayer === 'function') {
            TEXTORO.Ops.Presets.saveFromLayer(cat);
        } else {
            TEXTORO.UI.StatusBar.error('Preset save operation unavailable');
        }
    }
    
    // Public API
    return {
        init: init,
        load: load,
        render: render,
        apply: apply,
        applySelected: applySelected,
        createFromLayer: createFromLayer,
        isFavorite: isFavorite,
        toggleFavorite: toggleFavorite
    };
})();

// Legacy aliases moved to js/legacy/aliases.js
