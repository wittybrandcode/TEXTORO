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
            if (currentFilter !== 'all') {
                var pCat = (preset.category || '').toLowerCase();
                var fCat = (currentFilter || '').toLowerCase();
                if (pCat === 'toro') pCat = 'templates';
                if (pCat === 'mix') pCat = 'compound';
                if (pCat === 'motion-full') pCat = 'motion';
                if (fCat === 'toro') fCat = 'templates';
                if (fCat === 'mix') fCat = 'compound';
                if (fCat === 'motion-full') fCat = 'motion';
                if (pCat !== fCat) return false;
            }
            if (searchQuery) {
                var q = searchQuery;
                var matchName = (preset.name || '').toLowerCase().indexOf(q) !== -1;
                var matchCat = (preset.category || '').toLowerCase().indexOf(q) !== -1;
                var iconStr = (preset.faIcon || preset.icon || '').toLowerCase();
                var matchIcon = iconStr.indexOf(q) !== -1;
                if (!matchName && !matchCat && !matchIcon) {
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
     * Helper to apply realistic box styling to preview shape
     */
    function applyBoxStyles(el, vals) {
        if (!vals) return;
        var rgb = parsePresetColor(vals.fillColor, 20, 20, 28);
        var fillOp = (vals.fillOpacity != null) ? (vals.fillOpacity / 100) : 0.85;
        
        el.style.backgroundColor = (fillOp <= 0.02) ? 'transparent' : 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + fillOp + ')';
        
        if (vals.use4Corners) {
            var tl = vals.cornerTL != null ? Math.min(vals.cornerTL, 18) : 0;
            var tr = vals.cornerTR != null ? Math.min(vals.cornerTR, 18) : 0;
            var br = vals.cornerBR != null ? Math.min(vals.cornerBR, 18) : 0;
            var bl = vals.cornerBL != null ? Math.min(vals.cornerBL, 18) : 0;
            el.style.borderRadius = tl + 'px ' + tr + 'px ' + br + 'px ' + bl + 'px';
        } else {
            var rad = vals.cornerRadius != null ? Math.min(vals.cornerRadius, 18) : 0;
            el.style.borderRadius = rad + 'px';
        }
        
        var sWidth = vals.strokeWidth || 0;
        var sOp = (vals.strokeOpacity != null) ? (vals.strokeOpacity / 100) : 1;
        if (sWidth > 0 && sOp > 0.05) {
            var sRgb = parsePresetColor(vals.strokeColor, 255, 255, 255);
            var sStyle = (vals.strokeDash && vals.strokeDash > 0) ? 'dashed' : 'solid';
            el.style.border = Math.min(Math.max(sWidth, 1.5), 3) + 'px ' + sStyle + ' rgba(' + sRgb[0] + ',' + sRgb[1] + ',' + sRgb[2] + ',' + sOp + ')';
        } else {
            el.style.border = (fillOp <= 0.02) ? '1.5px dashed rgba(255, 255, 255, 0.35)' : 'none';
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
     * Build realistic live preview window stage with parametric dynamics
     */
    function buildPresetPreview(preset, onHover) {
        var stage = document.createElement('div');
        stage.className = 'preset-preview-stage';
        
        var rawCat = (preset.category || '').toLowerCase();
        var cat = (rawCat === 'toro') ? 'templates' : ((rawCat === 'mix') ? 'compound' : ((rawCat === 'motion-full') ? 'motion' : rawCat));
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
            
            var isWordMode = !!vals.wordMode;
            var fullText = isWordMode ? 'TEXT ORO' : 'TEXTORO';
            
            var textEl = document.createElement('span');
            textEl.className = 'preview-type-text';
            textEl.textContent = fullText;
            twWrap.appendChild(textEl);
            
            if (vals.showCursor !== false) {
                var cursorEl = document.createElement('span');
                var cGlyph = getCursorGlyph(vals.cursorType, vals.customCursor);
                cursorEl.className = 'preview-cursor';
                cursorEl.textContent = cGlyph;
                twWrap.appendChild(cursorEl);
            }
            
            stage.appendChild(twWrap);
            
            var speed = (vals.randomSpeed && vals.randomSpeed > 10) ? 25 : 55;
            onHover.enter = function() {
                playTypewriterHover(textEl, fullText, isWordMode, speed);
            };
            onHover.leave = function() {
                stopTypewriterHover(textEl, fullText);
            };
        } else if (cat === 'compound') {
            var boxVals = vals.box || {};
            var typeVals = vals.type || {};
            
            var boxEl = document.createElement('div');
            boxEl.className = 'preview-box-shape';
            applyBoxStyles(boxEl, boxVals);
            
            var twWrap = document.createElement('div');
            twWrap.className = 'preview-type-wrap';
            
            var isWordMode = !!typeVals.wordMode;
            var fullText = isWordMode ? 'TEXT ORO' : 'TEXTORO';
            
            var textEl = document.createElement('span');
            textEl.className = 'preview-type-text';
            textEl.textContent = fullText;
            twWrap.appendChild(textEl);
            
            if (typeVals.showCursor !== false) {
                var cursorEl = document.createElement('span');
                var cGlyph = getCursorGlyph(typeVals.cursorType, typeVals.customCursor);
                cursorEl.className = 'preview-cursor';
                cursorEl.textContent = cGlyph;
                twWrap.appendChild(cursorEl);
            }
            
            boxEl.appendChild(twWrap);
            stage.appendChild(boxEl);
            
            var speed = (typeVals.randomSpeed && typeVals.randomSpeed > 10) ? 25 : 55;
            onHover.enter = function() {
                playTypewriterHover(textEl, fullText, isWordMode, speed);
            };
            onHover.leave = function() {
                stopTypewriterHover(textEl, fullText);
            };
        } else if (cat === 'motion') {
            var k = getMotionKinematics(vals);
            var motionWrap = document.createElement('div');
            motionWrap.className = 'preview-motion-wrap';
            
            var textEl = document.createElement('span');
            textEl.className = 'preview-motion-text';
            textEl.textContent = 'TEXTORO';
            motionWrap.appendChild(textEl);
            
            stage.appendChild(motionWrap);

            onHover.enter = function() {
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
                motionWrap.style.transition = 'transform 0.25s ease-out, opacity 0.25s ease-out';
                motionWrap.style.transform = 'translate(0, 0) scale(1) rotate(0deg)';
                motionWrap.style.opacity = '1';
            };
        } else if (cat === 'templates') {
            var boxVals = vals.box || {};
            var typeVals = vals.type || {};
            var motVals = vals.motion || {};
            var k = getMotionKinematics(motVals);
            
            var motionWrap = document.createElement('div');
            motionWrap.className = 'preview-motion-wrap';
            
            var boxEl = document.createElement('div');
            boxEl.className = 'preview-box-shape';
            applyBoxStyles(boxEl, boxVals);
            
            var isWordMode = !!typeVals.wordMode;
            var fullText = isWordMode ? 'TEXT ORO' : 'TEXTORO';
            
            var textEl = document.createElement('span');
            textEl.className = 'preview-type-text';
            textEl.textContent = fullText;
            boxEl.appendChild(textEl);
            
            if (typeVals.showCursor !== false) {
                var cursorEl = document.createElement('span');
                var cGlyph = getCursorGlyph(typeVals.cursorType, typeVals.customCursor);
                cursorEl.className = 'preview-cursor';
                cursorEl.textContent = cGlyph;
                boxEl.appendChild(cursorEl);
            }
            
            motionWrap.appendChild(boxEl);
            stage.appendChild(motionWrap);
            
            onHover.enter = function() {
                playTypewriterHover(textEl, fullText, isWordMode, 50);
                
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
                stopTypewriterHover(textEl, fullText);
                motionWrap.style.transition = 'transform 0.25s ease-out, opacity 0.25s ease-out';
                motionWrap.style.transform = 'translate(0, 0) scale(1) rotate(0deg)';
                motionWrap.style.opacity = '1';
            };
        } else {
            var genericText = document.createElement('span');
            genericText.className = 'preview-type-text';
            genericText.textContent = preset.name || 'TEXTORO';
            stage.appendChild(genericText);
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
        
        // 2. Bottom Meta Bar (Name, Badge, Star, Delete)
        var metaBar = document.createElement('div');
        metaBar.className = 'preset-meta-bar';
        
        var nameSpan = document.createElement('span');
        nameSpan.className = 'preset-name';
        var iconClass = preset.faIcon || preset.icon;
        if (iconClass && typeof iconClass === 'string' && iconClass.indexOf('ph-') !== -1) {
            var iconEl = document.createElement('i');
            iconEl.className = iconClass;
            iconEl.style.marginRight = '6px';
            iconEl.style.fontSize = '12px';
            iconEl.style.opacity = '0.85';
            nameSpan.appendChild(iconEl);
        }
        var textNode = document.createTextNode(String(preset.name || ''));
        nameSpan.appendChild(textNode);
        metaBar.appendChild(nameSpan);
        
        var metaRight = document.createElement('div');
        metaRight.className = 'preset-meta-right';
        
        var badge = document.createElement('span');
        var rawCat = (preset.category || '').toLowerCase();
        var normCat = (rawCat === 'toro') ? 'templates' : ((rawCat === 'mix') ? 'compound' : ((rawCat === 'motion-full') ? 'motion' : rawCat));
        badge.className = 'preset-badge ' + normCat;
        var badgeLabels = {
            'templates': 'Template',
            'compound': 'Compound',
            'type': 'Type',
            'box': 'Box',
            'motion': 'Motion'
        };
        badge.textContent = badgeLabels[normCat] || (normCat.charAt(0).toUpperCase() + normCat.slice(1));
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
            apply(preset);
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
        lines.push(preset.builtin ? 'Built-in' : 'Custom');
        var rawCat = (preset.category || '').toLowerCase();
        var normCat = (rawCat === 'toro') ? 'templates' : ((rawCat === 'mix') ? 'compound' : ((rawCat === 'motion-full') ? 'motion' : rawCat));
        lines.push('Category: ' + normCat);
        if (preset.description) lines.push(preset.description);
        lines.push('Click to apply • Star to favorite');
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

        if (isSyncWithMarkersEnabled()) {
            opts.syncWithMarkers = true;
        }
        
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
