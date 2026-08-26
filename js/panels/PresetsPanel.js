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
        currentFilter = TEXTORO.State.Manager.get('presetsFilter', 'all');
        currentSort = TEXTORO.State.Manager.get('presetsSort', 'name-asc');
        
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
                TEXTORO.State.Manager.set('presetsFilter', currentFilter);
                
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
                TEXTORO.State.Manager.set('presetsSort', currentSort);
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
        try {
            var stored = localStorage.getItem('textoro_favorites');
            favorites = stored ? JSON.parse(stored) : [];
        } catch(e) {
            favorites = [];
        }
    }
    
    /**
     * حفظ المفضلة
     */
    function saveFavorites() {
        try {
            localStorage.setItem('textoro_favorites', JSON.stringify(favorites));
        } catch(e) {
            TEXTORO.error('Error saving favorites');
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
        
        elements.container.innerHTML = '<div class="presets-loading"><i class="fa-solid fa-spinner fa-spin"></i><p>Loading...</p></div>';
        
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
                        elements.container.innerHTML = '<div class="presets-loading"><i class="fa-solid fa-triangle-exclamation"></i><p>Failed to load presets<br><small>' +
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
            if (currentFilter !== 'all' && preset.category !== currentFilter) {
                return false;
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
            elements.container.innerHTML = '<div class="presets-empty"><i class="fa-solid fa-box-open"></i><p>' + emptyMsg + '</p></div>';
            return;
        }
        
        filtered.forEach(function(preset) {
            var item = createPresetItem(preset);
            elements.container.appendChild(item);
        });
    }
    
    /**
     * إنشاء عنصر بريست
     */
    function createPresetItem(preset) {
        var item = document.createElement('div');
        item.className = 'preset-item' + (preset.builtin ? ' builtin' : '');
        item.dataset.category = preset.category;
        item.dataset.filename = preset.fileName || '';
        
        // زر المفضلة
        var favBtn = document.createElement('button');
        favBtn.className = 'preset-fav-btn' + (isFavorite(preset) ? ' active' : '');
        favBtn.innerHTML = '<i class="fa-solid fa-star"></i>';
        favBtn.title = isFavorite(preset) ? 'Remove from favorites' : 'Add to favorites';
        favBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleFavorite(preset);
        });
        item.appendChild(favBtn);
        
        // الأيقونة
        var icon = document.createElement('span');
        icon.className = 'preset-icon';
        icon.textContent = preset.icon || '📄';
        item.appendChild(icon);
        
        // الاسم
        var name = document.createElement('span');
        name.className = 'preset-name';
        name.textContent = preset.name;
        item.appendChild(name);
        
        // الشارة
        var badge = document.createElement('span');
        badge.className = 'preset-badge ' + preset.category.replace('-full', '');
        var badgeText = preset.category === 'motion-full' ? 'Motion' : 
                        (preset.category.charAt(0).toUpperCase() + preset.category.slice(1));
        badge.textContent = badgeText;
        item.appendChild(badge);
        
        // motion-full: بريسات كاملة - زر تطبيق مباشر
        // motion: بريسات بسيطة - لا تظهر هنا (تظهر في تبويب Motion فقط)
        if (preset.category === 'motion-full') {
            // زر التطبيق المباشر للبريسات الكاملة
            var applyBtn = document.createElement('button');
            applyBtn.className = 'preset-apply-btn';
            applyBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
            applyBtn.title = 'Apply full motion (IN + OUT)';
            applyBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                applyMotionFull(preset);
            });
            item.appendChild(applyBtn);
            
            // النقر للتطبيق
            item.addEventListener('click', function() {
                applyMotionFull(preset);
            });
        } else {
            // زر التطبيق للبريسات الأخرى
            var applyBtn = document.createElement('button');
            applyBtn.className = 'preset-apply-btn';
            applyBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
            applyBtn.title = 'Apply preset';
            applyBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                apply(preset);
            });
            item.appendChild(applyBtn);
            
            // النقر للتطبيق
            item.addEventListener('click', function() {
                apply(preset);
            });
        }
        
        // قائمة السياق
        item.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            showContextMenu(e, preset);
        });
        
        // Tooltip
        item.title = buildTooltip(preset);
        
        // زر الحذف (للمستخدم فقط)
        if (!preset.builtin) {
            var deleteBtn = document.createElement('button');
            deleteBtn.className = 'preset-delete-btn';
            deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
            deleteBtn.title = 'Delete preset';
            deleteBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                confirmDelete(preset);
            });
            item.appendChild(deleteBtn);
        }
        
        return item;
    }
    
    /**
     * إظهار/إخفاء خيارات Motion
     */
    function updateMotionOptionsVisibility() {
        if (elements.motionOptions) {
            var showOptions = (currentFilter === 'motion-full');
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
                icon: 'fa-solid fa-play',
                action: function() { apply(preset); }
            },
            { separator: true },
            {
                label: preset.builtin ? 'Delete (Built-in)' : 'Delete',
                icon: 'fa-solid fa-trash',
                disabled: preset.builtin,
                danger: !preset.builtin,
                action: function() { confirmDelete(preset); }
            }
        ]);
    }
    
    // Public API
    return {
        init: init,
        load: load,
        render: render,
        apply: apply,
        isFavorite: isFavorite,
        toggleFavorite: toggleFavorite
    };
})();

// Legacy aliases moved to js/legacy/aliases.js
