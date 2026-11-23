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
    var activeModuleFilters = [];
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
        elements.sortToggle = document.getElementById('presetsSortToggle');
        
        // تحميل المفضلة
        loadFavorites();
        
        // استعادة الإعدادات
        currentFilter = (TEXTORO.State && TEXTORO.State.Manager && typeof TEXTORO.State.Manager.get === 'function') ? TEXTORO.State.Manager.get('presetsFilter', 'all') : 'all';
        activeModuleFilters = (TEXTORO.State && TEXTORO.State.Manager && typeof TEXTORO.State.Manager.get === 'function') ? TEXTORO.State.Manager.get('presetsActiveModules', []) : [];
        if (['type', 'box', 'motion'].indexOf(currentFilter) !== -1 && activeModuleFilters.length === 0) {
            activeModuleFilters = [currentFilter];
            currentFilter = 'modules';
        }
        currentSort = (TEXTORO.State && TEXTORO.State.Manager && typeof TEXTORO.State.Manager.get === 'function') ? TEXTORO.State.Manager.get('presetsSort', 'name-asc') : 'name-asc';
        
        syncSortToggleUI();
        
        // ربط أزرار الفلتر (دعم الفلترة المتعددة للوحدات 3-Pillar Multi-Module Filter والبريسات المحفوظة)
        document.querySelectorAll('.filter-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var filterVal = this.dataset.filter;
                handleFilterBtnClick(filterVal);
            });
        });
        
        syncFilterButtonsUI();
        
        // إظهار خيارات Motion إذا كان الفلتر motion-full
        updateMotionOptionsVisibility();
        
        // ربط زر التبديل السريع للترتيب A-Z / Z-A
        if (elements.sortToggle) {
            elements.sortToggle.addEventListener('click', function() {
                currentSort = (currentSort === 'name-asc') ? 'name-desc' : 'name-asc';
                syncSortToggleUI();
                if (TEXTORO.State && TEXTORO.State.Manager && typeof TEXTORO.State.Manager.set === 'function') {
                    TEXTORO.State.Manager.set('presetsSort', currentSort);
                }
                TEXTORO.UI.StatusBar.set(currentSort === 'name-asc' ? 'Sorted: Name A-Z' : 'Sorted: Name Z-A', '');
                render();
            });
        }
        
        // ربط البحث المطور
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

            elements.searchInput.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    this.value = '';
                    searchQuery = '';
                    if (elements.searchClear) elements.searchClear.style.display = 'none';
                    render();
                    this.blur();
                }
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
     * الحصول على وحدات البريست ديناميكياً (Text, Box, Motion)
     */
    function getPresetModules(preset) {
        if (!preset) return [];
        var mods = [];

        // 1. فحص مصفوفة modules الصريحة
        if (Array.isArray(preset.modules) && preset.modules.length > 0) {
            preset.modules.forEach(function(m) {
                var norm = String(m).toLowerCase().trim();
                if (norm === 'typewriter' || norm === 'text') norm = 'type';
                if (norm === 'shape') norm = 'box';
                if (norm === 'kinematics' || norm === 'motion-full') norm = 'motion';
                if (['type', 'box', 'motion'].indexOf(norm) !== -1 && mods.indexOf(norm) === -1) {
                    mods.push(norm);
                }
            });
            if (mods.length > 0) return mods;
        }

        // 2. فحص مصفوفة tags الصريحة
        if (Array.isArray(preset.tags) && preset.tags.length > 0) {
            preset.tags.forEach(function(t) {
                var norm = String(t).toLowerCase().trim();
                if (norm === 'typewriter' || norm === 'text') norm = 'type';
                if (norm === 'shape') norm = 'box';
                if (norm === 'kinematics' || norm === 'motion-full') norm = 'motion';
                if (['type', 'box', 'motion'].indexOf(norm) !== -1 && mods.indexOf(norm) === -1) {
                    mods.push(norm);
                }
            });
            if (mods.length > 0) return mods;
        }

        // 3. فحص بنية قيم البريست (Values Inspection)
        var vals = preset.values || {};
        var hasTypeVal = vals.type && typeof vals.type === 'object' && Object.keys(vals.type).length > 0;
        var hasBoxVal = vals.box && typeof vals.box === 'object' && Object.keys(vals.box).length > 0;
        var hasMotionVal = vals.motion && typeof vals.motion === 'object' && Object.keys(vals.motion).length > 0;

        if (hasTypeVal) mods.push('type');
        if (hasBoxVal) mods.push('box');
        if (hasMotionVal) mods.push('motion');
        if (mods.length > 0) return mods;

        // 4. Fallback حسب الفئة
        var cat = String(preset.category || '').toLowerCase().trim();
        if (cat === 'toro' || cat === 'templates') {
            return ['type', 'box', 'motion'];
        }
        if (cat === 'mix' || cat === 'compound') {
            return ['type', 'box'];
        }
        if (cat === 'type' || cat === 'typewriter') {
            return ['type'];
        }
        if (cat === 'box' || cat === 'shape') {
            return ['box'];
        }
        if (cat === 'motion' || cat === 'motion-full') {
            return ['motion'];
        }

        return ['type'];
    }

    /**
     * مزامنة حالة زر الترتيب بصرياً
     */
    function syncSortToggleUI() {
        if (!elements.sortToggle) return;
        var isAsc = (currentSort === 'name-asc');
        elements.sortToggle.innerHTML = isAsc 
            ? '<i class="ph-bold ph-sort-ascending"></i>' 
            : '<i class="ph-bold ph-sort-descending"></i>';
        elements.sortToggle.title = isAsc 
            ? 'Sort: Name A-Z (click for Z-A)' 
            : 'Sort: Name Z-A (click for A-Z)';
        elements.sortToggle.classList.toggle('active', !isAsc);
    }

    /**
     * تحديث أزرار الفلتر بصرياً
     */
    function syncFilterButtonsUI() {
        var allBtn = document.querySelector('.filter-btn[data-filter="all"]');
        var favBtn = document.querySelector('.filter-btn[data-filter="favorites"]');
        var customBtn = document.querySelector('.filter-btn[data-filter="custom"]');
        var typeBtn = document.querySelector('.filter-btn[data-filter="type"]');
        var boxBtn = document.querySelector('.filter-btn[data-filter="box"]');
        var motionBtn = document.querySelector('.filter-btn[data-filter="motion"]');

        if (currentFilter === 'all') {
            if (allBtn) allBtn.classList.add('active');
            if (favBtn) favBtn.classList.remove('active');
            if (customBtn) customBtn.classList.remove('active');
            if (typeBtn) typeBtn.classList.remove('active');
            if (boxBtn) boxBtn.classList.remove('active');
            if (motionBtn) motionBtn.classList.remove('active');
        } else if (currentFilter === 'favorites') {
            if (allBtn) allBtn.classList.remove('active');
            if (favBtn) favBtn.classList.add('active');
            if (customBtn) customBtn.classList.remove('active');
            if (typeBtn) typeBtn.classList.remove('active');
            if (boxBtn) boxBtn.classList.remove('active');
            if (motionBtn) motionBtn.classList.remove('active');
        } else if (currentFilter === 'custom') {
            if (allBtn) allBtn.classList.remove('active');
            if (favBtn) favBtn.classList.remove('active');
            if (customBtn) customBtn.classList.add('active');
            if (typeBtn) typeBtn.classList.remove('active');
            if (boxBtn) boxBtn.classList.remove('active');
            if (motionBtn) motionBtn.classList.remove('active');
        } else {
            if (allBtn) allBtn.classList.remove('active');
            if (favBtn) favBtn.classList.remove('active');
            if (customBtn) customBtn.classList.remove('active');
            if (typeBtn) typeBtn.classList.toggle('active', activeModuleFilters.indexOf('type') !== -1);
            if (boxBtn) boxBtn.classList.toggle('active', activeModuleFilters.indexOf('box') !== -1);
            if (motionBtn) motionBtn.classList.toggle('active', activeModuleFilters.indexOf('motion') !== -1);
        }
    }

    /**
     * معالجة النقر على أزرار الفلتر المتعددة
     */
    function handleFilterBtnClick(filterVal) {
        if (filterVal === 'all') {
            currentFilter = 'all';
            activeModuleFilters = [];
        } else if (filterVal === 'favorites') {
            currentFilter = 'favorites';
            activeModuleFilters = [];
        } else if (filterVal === 'custom') {
            currentFilter = 'custom';
            activeModuleFilters = [];
        } else if (filterVal === 'type' || filterVal === 'box' || filterVal === 'motion') {
            var idx = activeModuleFilters.indexOf(filterVal);
            if (idx > -1) {
                activeModuleFilters.splice(idx, 1);
            } else {
                activeModuleFilters.push(filterVal);
            }

            if (activeModuleFilters.length === 0) {
                currentFilter = 'all';
            } else {
                currentFilter = 'modules';
            }
        }

        syncFilterButtonsUI();

        if (TEXTORO.State && TEXTORO.State.Manager && typeof TEXTORO.State.Manager.set === 'function') {
            TEXTORO.State.Manager.set('presetsFilter', currentFilter);
            TEXTORO.State.Manager.set('presetsActiveModules', activeModuleFilters);
        }

        updateMotionOptionsVisibility();
        render();
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
    function load(forceReload, selectTargetName) {
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

                    if (selectTargetName && elements.container) {
                        var targetEl = null;
                        var items = elements.container.querySelectorAll('.preset-item');
                        for (var it = 0; it < items.length; it++) {
                            var pName = items[it].querySelector('.preset-name');
                            if (pName && pName.textContent.trim().indexOf(selectTargetName) !== -1) {
                                targetEl = items[it];
                                break;
                            }
                        }
                        if (targetEl) {
                            items.forEach(function(el) { el.classList.remove('selected'); });
                            targetEl.classList.add('selected');
                            try { targetEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch(e) {}
                        }
                    }

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
                    var catOrder = ['type', 'box', 'motion', 'compound', 'templates'];
                    var aNorm = (a.category === 'toro') ? 'templates' : (a.category === 'mix' ? 'compound' : (a.category === 'motion-full' ? 'motion' : a.category));
                    var bNorm = (b.category === 'toro') ? 'templates' : (b.category === 'mix' ? 'compound' : (b.category === 'motion-full' ? 'motion' : b.category));
                    var aIdx = catOrder.indexOf(aNorm);
                    var bIdx = catOrder.indexOf(bNorm);
                    if (aIdx !== -1 && bIdx !== -1 && aIdx !== bIdx) return aIdx - bIdx;
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
            if (currentFilter === 'custom') {
                return !preset.builtin;
            }
            if (currentFilter === 'modules' && activeModuleFilters.length > 0) {
                var pMods = getPresetModules(preset);
                var matchesAll = activeModuleFilters.every(function(m) {
                    return pMods.indexOf(m) !== -1;
                });
                if (!matchesAll) return false;
            } else if (currentFilter !== 'all') {
                var pMods = getPresetModules(preset);
                if (pMods.indexOf(currentFilter) === -1) return false;
            }
            if (searchQuery) {
                var q = searchQuery;
                var matchName = (preset.name || '').toLowerCase().indexOf(q) !== -1;
                var matchCat = (preset.category || '').toLowerCase().indexOf(q) !== -1;
                var iconStr = (preset.faIcon || preset.icon || '').toLowerCase();
                var matchIcon = iconStr.indexOf(q) !== -1;
                var matchMods = getPresetModules(preset).some(function(m) { return m.indexOf(q) !== -1; });
                var matchTags = Array.isArray(preset.tags) && preset.tags.some(function(t) { return String(t).toLowerCase().indexOf(q) !== -1; });
                var matchSaved = (!preset.builtin && ('saved'.indexOf(q) !== -1 || 'custom'.indexOf(q) !== -1 || 'user'.indexOf(q) !== -1));
                var matchFav = (isFavorite(preset) && 'favorite'.indexOf(q) !== -1);
                if (!matchName && !matchCat && !matchIcon && !matchMods && !matchTags && !matchSaved && !matchFav) {
                    return false;
                }
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
                : (currentFilter === 'custom'
                    ? 'No saved presets yet. Click [+] to save a new preset from layer.'
                    : (searchQuery
                        ? 'No presets match "' + safeQuery + '"'
                        : 'No presets in this category'));
            elements.container.innerHTML = '<div class="presets-empty"><i class="ph-bold ph-package"></i><p>' + emptyMsg + '</p></div>';
            return;
        }
        
        filtered.forEach(function(preset) {
            var item = createPresetItem(preset);
            elements.container.appendChild(item);
        });
    }
    
    /**
     * Typewriter Animation Controller for on-hover preview
     */
    function playTypewriterHover(textEl, fullText, isWordMode, speedMs) {
        if (!textEl) return;
        if (textEl._twInterval) clearInterval(textEl._twInterval);
        
        if (isWordMode) {
            var words = fullText.split(' ');
            textEl.textContent = '';
            var wIdx = 0;
            textEl._twInterval = setInterval(function() {
                if (wIdx < words.length) {
                    textEl.textContent = words.slice(0, wIdx + 1).join(' ');
                    wIdx++;
                } else {
                    clearInterval(textEl._twInterval);
                    textEl._twInterval = null;
                }
            }, 220);
        } else {
            textEl.textContent = '';
            var charIdx = 0;
            var step = speedMs || 50;
            textEl._twInterval = setInterval(function() {
                if (charIdx <= fullText.length) {
                    textEl.textContent = fullText.substring(0, charIdx);
                    charIdx++;
                } else {
                    clearInterval(textEl._twInterval);
                    textEl._twInterval = null;
                }
            }, step);
        }
    }

    function stopTypewriterHover(textEl, fullText) {
        if (!textEl) return;
        if (textEl._twInterval) {
            clearInterval(textEl._twInterval);
            textEl._twInterval = null;
        }
        textEl.textContent = fullText;
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
     * Helper to apply realistic box styling to preview shape with true parametric fidelity
     */
    function applyBoxStyles(el, vals, textEl) {
        if (!vals) return;
        
        // Scale factors to map AE comp pixels (1920x1080, font ~48px) to CEP preview stage (height 102px, font ~18.5px)
        var scaleRad = 0.42;
        var scalePadY = 0.52;
        var scalePadX = 0.62;

        // 1. Proportional Padding
        var pTop = vals.paddingTop != null ? Math.min(Math.max(vals.paddingTop * scalePadY, 6), 20) : 9;
        var pBottom = vals.paddingBottom != null ? Math.min(Math.max(vals.paddingBottom * scalePadY, 6), 20) : 9;
        var pLeft = vals.paddingLeft != null ? Math.min(Math.max(vals.paddingLeft * scalePadX, 12), 48) : 22;
        var pRight = vals.paddingRight != null ? Math.min(Math.max(vals.paddingRight * scalePadX, 12), 48) : 22;
        var padVal = Math.round(pTop) + 'px ' + Math.round(pRight) + 'px ' + Math.round(pBottom) + 'px ' + Math.round(pLeft) + 'px';
        el.style.setProperty('padding', padVal, 'important');

        // Estimate current box height (font 18.5px * 1.2 line-height = 22.2px + pTop + pBottom)
        var estimatedBoxH = 22.2 + pTop + pBottom;
        var maxAllowedRadius = Math.floor(estimatedBoxH / 2);

        // 2. Corner Radii (Proportionately scaled to match AE rounded rectangle geometry)
        if (vals.use4Corners) {
            var tl = vals.cornerTL != null ? Math.min(Math.max(Math.round(vals.cornerTL * scaleRad), 0), maxAllowedRadius) : 0;
            var tr = vals.cornerTR != null ? Math.min(Math.max(Math.round(vals.cornerTR * scaleRad), 0), maxAllowedRadius) : 0;
            var br = vals.cornerBR != null ? Math.min(Math.max(Math.round(vals.cornerBR * scaleRad), 0), maxAllowedRadius) : 0;
            var bl = vals.cornerBL != null ? Math.min(Math.max(Math.round(vals.cornerBL * scaleRad), 0), maxAllowedRadius) : 0;
            var radStr = tl + 'px ' + tr + 'px ' + br + 'px ' + bl + 'px';
            el.style.setProperty('border-radius', radStr, 'important');
        } else {
            var rawRad = vals.cornerRadius != null ? vals.cornerRadius : 0;
            var rad = Math.min(Math.max(Math.round(rawRad * scaleRad), 0), maxAllowedRadius);
            el.style.setProperty('border-radius', rad + 'px', 'important');
        }

        // 3. Background Fill
        var rgb = parsePresetColor(vals.fillColor, 20, 20, 28);
        var fillOp = (vals.fillOpacity != null) ? (vals.fillOpacity / 100) : 0.85;
        var bgVal = (fillOp <= 0.02) ? 'transparent' : 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + fillOp + ')';
        el.style.setProperty('background-color', bgVal, 'important');

        // 4. Border Stroke
        var sWidth = vals.strokeWidth || 0;
        var sOp = (vals.strokeOpacity != null) ? (vals.strokeOpacity / 100) : 1;
        if (sWidth > 0 && sOp > 0.05) {
            var sRgb = parsePresetColor(vals.strokeColor, 255, 255, 255);
            var sStyle = (vals.strokeDash && vals.strokeDash > 0) ? 'dashed' : 'solid';
            var borderW = Math.min(Math.max(Math.round(sWidth * 0.6), 1.5), 4);
            var borderVal = borderW + 'px ' + sStyle + ' rgba(' + sRgb[0] + ',' + sRgb[1] + ',' + sRgb[2] + ',' + sOp + ')';
            el.style.setProperty('border', borderVal, 'important');
        } else {
            var fallbackBorder = (fillOp <= 0.02) ? '1.5px dashed rgba(255, 255, 255, 0.35)' : 'none';
            el.style.setProperty('border', fallbackBorder, 'important');
        }

        // 5. Text Color from Box Settings
        if (textEl && (vals.applyTextColor || vals.textColor)) {
            var tRgb = parsePresetColor(vals.textColor, 255, 255, 255);
            textEl.style.setProperty('color', 'rgb(' + tRgb[0] + ',' + tRgb[1] + ',' + tRgb[2] + ')', 'important');
        }
    }

    /**
     * استخراج وتطبيع الحزم الفرعية من أي بريست (Type, Box, Motion)
     */
    function extractPresetSubValues(preset) {
        var rawVals = (preset && preset.values) || {};
        var cat = String(preset.category || '').toLowerCase();
        
        var boxVals = null;
        var typeVals = null;
        var motVals = null;

        if (rawVals.box && typeof rawVals.box === 'object') {
            boxVals = rawVals.box;
        } else if (cat === 'box' || rawVals.cornerRadius != null || rawVals.fillColor != null || rawVals.strokeWidth != null) {
            boxVals = rawVals;
        }

        if (rawVals.type && typeof rawVals.type === 'object') {
            typeVals = rawVals.type;
        } else if (cat === 'type' || rawVals.twAuto != null || rawVals.cursorType != null || rawVals.showCursor != null) {
            typeVals = rawVals;
        }

        if (rawVals.motion && typeof rawVals.motion === 'object') {
            motVals = rawVals.motion;
        } else if (cat === 'motion' || cat === 'motion-full' || rawVals.animatePosition != null || rawVals.animateScale != null) {
            motVals = rawVals;
        }

        return {
            box: boxVals,
            type: typeVals,
            motion: motVals
        };
    }

    /**
     * تطبيق تنسيقات النصوص ومؤشر الآلة الكاتبة
     */
    function applyTypewriterStyles(textEl, cursorEl, typeVals) {
        if (!typeVals) return;
        
        if (textEl && typeVals.textColor) {
            var tRgb = parsePresetColor(typeVals.textColor, 255, 255, 255);
            textEl.style.setProperty('color', 'rgb(' + tRgb[0] + ',' + tRgb[1] + ',' + tRgb[2] + ')', 'important');
        }

        if (cursorEl) {
            if (typeVals.cursorColor) {
                var cRgb = parsePresetColor(typeVals.cursorColor, 16, 185, 129);
                cursorEl.style.setProperty('color', 'rgb(' + cRgb[0] + ',' + cRgb[1] + ',' + cRgb[2] + ')', 'important');
            }
            if (typeVals.cursorSpacing != null) {
                var sp = Math.min(Math.max(typeVals.cursorSpacing, 1), 10);
                cursorEl.style.setProperty('margin-left', sp + 'px', 'important');
            }
            if (typeVals.blinkSpeed != null && typeVals.blinkSpeed > 0) {
                var freq = Math.min(Math.max(typeVals.blinkSpeed, 0.5), 8);
                var dur = (1 / freq).toFixed(2);
                cursorEl.style.setProperty('animation-duration', dur + 's', 'important');
            }
        }
    }

    /**
     * Compute true kinematic motion parameters directly from preset values
     */
    function getMotionKinematics(vals) {
        vals = vals || {};
        var fromX = 0;
        var fromY = 0;
        var fromScale = 1;
        var fromRot = 0;
        var fromOp = 1;
        var duration = (vals.inEnd && vals.inEnd > 0) ? Math.min(Math.max(vals.inEnd, 0.45), 1.1) : 0.75;
        var ease = 'cubic-bezier(0.16, 1, 0.3, 1)';

        if (vals.animatePosition) {
            fromX = (vals.posFromX != null) ? Math.max(-100, Math.min(100, vals.posFromX)) : 0;
            fromY = (vals.posFromY != null) ? Math.max(-60, Math.min(60, vals.posFromY)) : 0;
        }
        if (vals.animateScale) {
            fromScale = (vals.scaleFrom != null) ? (vals.scaleFrom / 100) : 1;
        }
        if (vals.animateRotation) {
            fromRot = (vals.rotFrom != null) ? vals.rotFrom : 0;
        }
        if (vals.animateOpacity) {
            fromOp = (vals.opacityFrom != null) ? (vals.opacityFrom / 100) : 1;
        }

        var eType = vals.easingType != null ? vals.easingType : 1;
        switch (eType) {
            case 0: ease = 'linear'; break;
            case 1: ease = 'cubic-bezier(0.16, 1, 0.3, 1)'; break;
            case 2: ease = 'cubic-bezier(0.7, 0, 0.84, 0)'; break;
            case 3: ease = 'cubic-bezier(0.65, 0, 0.35, 1)'; break;
            case 4: ease = 'cubic-bezier(0.34, 1.56, 0.64, 1)'; break;
            case 5: ease = 'cubic-bezier(0.175, 0.885, 0.32, 1.35)'; break;
            case 6: ease = 'cubic-bezier(0.25, 1.3, 0.5, 1)'; break;
            case 7: ease = 'cubic-bezier(0.18, 1.45, 0.38, 1)'; break;
            default: ease = 'cubic-bezier(0.16, 1, 0.3, 1)'; break;
        }

        return {
            fromX: fromX,
            fromY: fromY,
            fromScale: fromScale,
            fromRot: fromRot,
            fromOp: fromOp,
            duration: duration,
            ease: ease
        };
    }

    /**
     * Map cursor type number to visual glyph
     */
    function getCursorGlyph(type, customChar) {
        if (type === -1 || type === 'custom') return customChar || '▶';
        var map = {
            0: '|',
            1: '_',
            2: '█',
            3: '▌',
            4: '▎',
            5: '●',
            6: '◆'
        };
        return map[type] || '|';
    }

    /**
     * Build realistic live preview window stage with true parametric composition
     */
    function buildPresetPreview(preset, onHover) {
        var stage = document.createElement('div');
        stage.className = 'preset-preview-stage';
        
        var subVals = extractPresetSubValues(preset);
        var typeVals = subVals.type;
        var boxVals = subVals.box;
        var motionVals = subVals.motion;

        // 1. Text & Typewriter Element
        var isWordMode = !!(typeVals && typeVals.wordMode);
        var fullText = isWordMode ? 'TEXT ORO' : 'TEXTORO';
        
        var textEl = document.createElement('span');
        textEl.className = 'preview-type-text';
        textEl.textContent = fullText;

        var cursorEl = null;
        var showCursor = typeVals ? (typeVals.showCursor !== false) : false;
        if (showCursor) {
            cursorEl = document.createElement('span');
            cursorEl.className = 'preview-cursor';
            var cGlyph = getCursorGlyph(typeVals.cursorType, typeVals.customCursor);
            cursorEl.textContent = cGlyph;
        }

        if (typeVals) {
            applyTypewriterStyles(textEl, cursorEl, typeVals);
        }

        // Wrap text and cursor
        var textContainer = document.createElement('div');
        textContainer.className = 'preview-type-wrap';
        if (typeVals && typeVals.cursorBefore && cursorEl) {
            textContainer.appendChild(cursorEl);
            textContainer.appendChild(textEl);
        } else {
            textContainer.appendChild(textEl);
            if (cursorEl) textContainer.appendChild(cursorEl);
        }

        var twSpeed = (typeVals && typeVals.randomSpeed && typeVals.randomSpeed > 10) ? 25 : 50;
        var hasTwAnimation = !!typeVals;

        // 2. Box Decorator (if Box module is present)
        var coreElement = textContainer;
        if (boxVals) {
            var boxEl = document.createElement('div');
            boxEl.className = 'preview-box-shape';
            applyBoxStyles(boxEl, boxVals, textEl);
            boxEl.appendChild(textContainer);
            coreElement = boxEl;
        }

        // 3. Motion Kinematics Wrapper (if Motion module is present)
        if (motionVals) {
            var k = getMotionKinematics(motionVals);
            var motionWrap = document.createElement('div');
            motionWrap.className = 'preview-motion-wrap';
            motionWrap.appendChild(coreElement);
            stage.appendChild(motionWrap);

            onHover.enter = function() {
                if (hasTwAnimation) {
                    playTypewriterHover(textEl, fullText, isWordMode, twSpeed);
                }
                motionWrap.style.transition = 'none';
                motionWrap.style.transform = 'translate(' + k.fromX + 'px, ' + k.fromY + 'px) scale(' + k.fromScale + ') rotate(' + k.fromRot + 'deg)';
                motionWrap.style.opacity = k.fromOp;
                
                requestAnimationFrame(function() {
                    motionWrap.style.transition = 'transform ' + k.duration + 's ' + k.ease + ', opacity ' + k.duration + 's ease-out';
                    motionWrap.style.transform = 'translate(0, 0) scale(1) rotate(0deg)';
                    motionWrap.style.opacity = '1';
                });
            };

            onHover.leave = function() {
                if (hasTwAnimation) {
                    stopTypewriterHover(textEl, fullText);
                }
                motionWrap.style.transition = 'transform 0.25s ease-out, opacity 0.25s ease-out';
                motionWrap.style.transform = 'translate(0, 0) scale(1) rotate(0deg)';
                motionWrap.style.opacity = '1';
            };
        } else {
            // No motion module: static presentation with typewriter on hover
            stage.appendChild(coreElement);

            if (hasTwAnimation) {
                onHover.enter = function() {
                    playTypewriterHover(textEl, fullText, isWordMode, twSpeed);
                };
                onHover.leave = function() {
                    stopTypewriterHover(textEl, fullText);
                };
            }
        }

        return stage;
    }

    function createPresetItem(preset) {
        var item = document.createElement('div');
        item.className = 'preset-item' + (preset.builtin ? ' builtin' : '');
        if (selectedPreset && (selectedPreset.id === preset.id || selectedPreset.fileName === preset.fileName)) {
            item.classList.add('selected');
        }
        item.dataset.category = preset.category;
        item.dataset.filename = preset.fileName || '';
        item.dataset.name = preset.name || '';
        
        // Callback container for hover interactions
        var onHover = { enter: null, leave: null };
        
        // 1. Realistic Preview Window (Upper Viewport)
        var previewWindow = document.createElement('div');
        previewWindow.className = 'preset-preview-window';
        
        var previewStage = buildPresetPreview(preset, onHover);
        previewWindow.appendChild(previewStage);
        
        // Hover listeners for live preview playback
        item.addEventListener('mouseenter', function() {
            if (typeof onHover.enter === 'function') {
                onHover.enter();
            }
        });
        item.addEventListener('mouseleave', function() {
            if (typeof onHover.leave === 'function') {
                onHover.leave();
            }
        });
        
        // Apply Button in Preview Window
        var applyBtn = document.createElement('button');
        applyBtn.className = 'preset-apply-btn';
        applyBtn.innerHTML = '<i class="ph-bold ph-check"></i>';
        applyBtn.title = 'Apply to selected text layer';
        applyBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            apply(preset);
        });
        previewWindow.appendChild(applyBtn);
        item.appendChild(previewWindow);
        
        // 2. Bottom Meta Bar (Name with Module Icons, Badges, Star, Delete)
        var metaBar = document.createElement('div');
        metaBar.className = 'preset-meta-bar';
        
        var nameSpan = document.createElement('span');
        nameSpan.className = 'preset-name';
        
        var pMods = getPresetModules(preset);
        var iconsWrap = document.createElement('span');
        iconsWrap.className = 'preset-modules-icons';
        pMods.forEach(function(m) {
            var ico = document.createElement('i');
            var mTitle = (m === 'type') ? 'Text' : (m === 'box' ? 'Box' : 'Motion');
            if (m === 'type') {
                ico.className = 'ph-bold ph-textbox preset-icon-type';
            } else if (m === 'box') {
                ico.className = 'ph-bold ph-bounding-box preset-icon-box';
            } else if (m === 'motion') {
                ico.className = 'ph-bold ph-wave-sine preset-icon-motion';
            }
            ico.title = 'Transfer ' + mTitle + ' only to layer';
            ico.style.cursor = 'pointer';
            ico.addEventListener('click', function(e) {
                e.stopPropagation();
                applyModule(preset, m);
            });
            iconsWrap.appendChild(ico);
        });
        nameSpan.appendChild(iconsWrap);

        var textNode = document.createTextNode(String(preset.name || ''));
        nameSpan.appendChild(textNode);
        metaBar.appendChild(nameSpan);
        
        var metaRight = document.createElement('div');
        metaRight.className = 'preset-meta-right';
        
        var badgesWrap = document.createElement('div');
        badgesWrap.className = 'preset-module-badges';
        pMods.forEach(function(m) {
            var pill = document.createElement('button');
            pill.type = 'button';
            pill.className = 'preset-mod-pill ' + m;
            var label = (m === 'type') ? 'TEXT' : (m === 'box' ? 'BOX' : 'MOTION');
            pill.textContent = label;
            pill.title = 'Transfer ' + label + ' only to layer';
            pill.addEventListener('click', function(e) {
                e.stopPropagation();
                applyModule(preset, m);
            });
            badgesWrap.appendChild(pill);
        });
        metaRight.appendChild(badgesWrap);
        
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
            apply(preset);
        });
        
        // Context menu
        item.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            showContextMenu(e, preset);
        });
        
        return item;
    }
    
    /**
     * خيارات الحركة مربوطة دائماً بالـ Markers
     */
    function updateMotionOptionsVisibility() {
        // Enforced: sync with markers is always enabled and mandatory
    }
    
    /**
     * ربط الحركة بالعلامات مفروض دائماً
     */
    function isSyncWithMarkersEnabled() {
        return true;
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
            syncWithMarkers: true // ربط الحركة بالعلامات مفروض دائماً
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
        lines.push(preset.builtin ? 'Built-in' : 'Custom');
        var rawCat = (preset.category || '').toLowerCase();
        var normCat = (rawCat === 'toro') ? 'templates' : ((rawCat === 'mix') ? 'compound' : ((rawCat === 'motion-full') ? 'motion' : rawCat));
        lines.push('Category: ' + normCat);
        if (preset.description) lines.push(preset.description);
        lines.push('Click to apply • Star to favorite');
        return lines.join('\n');
    }
    
    /**
     * تطبيق خاصية وحدة معينة فقط (Text أو Box أو Motion) من القالب
     */
    function applyModule(preset, moduleType) {
        if (!preset) {
            TEXTORO.UI.StatusBar.error('No preset selected');
            return;
        }
        
        var label = (moduleType === 'type') ? 'Text' : ((moduleType === 'box') ? 'Box' : 'Motion');
        var opts = {
            category: preset.category,
            onlyModule: moduleType,
            syncWithMarkers: true
        };
        
        if (preset.fileName) {
            opts.fileName = preset.fileName;
        } else if (preset.id) {
            opts.id = preset.id;
        }
        
        TEXTORO.UI.StatusBar.set('Transferring ' + label + ' from ' + preset.name + '...', '');
        
        TEXTORO.HostBridge.run('applyPreset', opts, function(res) {
            if (res.success) {
                TEXTORO.UI.StatusBar.success('Transferred ' + label + ' from: ' + preset.name);
            } else {
                TEXTORO.UI.StatusBar.error('Error: ' + (res.error || 'Failed'));
            }
        });
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

        opts.syncWithMarkers = true;
        
        var rawCat = (preset.category || '').toLowerCase();
        var normCat = (rawCat === 'toro') ? 'templates' : ((rawCat === 'mix') ? 'compound' : ((rawCat === 'motion-full') ? 'motion' : rawCat));
        var scriptName = (normCat === 'motion') ? 'applyMotionPreset' : 'applyPreset';
        
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
            title: 'Delete Preset',
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
        
        apply(selectedPreset);
    }
    
    /**
     * تغيير الفلتر النشط برمجياً ومزامنة الأزرار
     */
    function setFilter(category) {
        if (!category) return;
        var norm = category.toLowerCase();
        if (norm === 'toro') norm = 'templates';
        if (norm === 'mix') norm = 'compound';
        if (norm === 'motion-full') norm = 'motion';
        
        currentFilter = norm;
        if (TEXTORO.State && TEXTORO.State.Manager && typeof TEXTORO.State.Manager.set === 'function') {
            TEXTORO.State.Manager.set('presetsFilter', currentFilter);
        }
        
        document.querySelectorAll('.filter-btn').forEach(function(btn) {
            btn.classList.toggle('active', btn.dataset.filter === currentFilter);
        });
        
        updateMotionOptionsVisibility();
    }

    /**
     * مسح استعلام البحث
     */
    function clearSearch() {
        if (elements.searchInput) elements.searchInput.value = '';
        searchQuery = '';
        if (elements.searchClear) elements.searchClear.style.display = 'none';
    }

    /**
     * إنشاء بريست جديد من الطبقة النشطة
     */
    function createFromLayer() {
        if (TEXTORO.Ops && TEXTORO.Ops.Presets && typeof TEXTORO.Ops.Presets.saveFromLayer === 'function') {
            var prefCat = (currentFilter !== 'all' && currentFilter !== 'favorites') ? currentFilter : null;
            TEXTORO.Ops.Presets.saveFromLayer(prefCat);
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
        setFilter: setFilter,
        clearSearch: clearSearch,
        isFavorite: isFavorite,
        toggleFavorite: toggleFavorite
    };
})();

// Legacy aliases moved to js/legacy/aliases.js
