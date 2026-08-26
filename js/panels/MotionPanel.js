/**
 * TEXTORO - Motion Panel Module
 * لوحة Motion - تحميل البريسات من ملفات JSON
 * @version 1.0.0
 */

TEXTORO.Panels = TEXTORO.Panels || {};

TEXTORO.Panels.Motion = (function() {
    'use strict';
    
    // البريسات المحملة من الملفات
    var loadedPresets = [];
    var presetsLoaded = false;
    
    // State
    var presetState = {
        activeTab: 'in',
        selectedIn: null,
        selectedOut: null
    };
    var layerCount = 0;
    
    /**
     * تهيئة اللوحة
     */
    function init() {
        // تحميل البريسات من الملفات أولاً
        loadPresetsFromFiles(function() {
            renderPresetButtons(); // توليد الأزرار ديناميكياً
            initPresetTabs();
            initSyncToggle();
            initLinkButtons();
            TEXTORO.log('MotionPanel initialized with ' + loadedPresets.length + ' presets');
        });
    }
    
    /**
     * تحميل البريسات من ملفات JSON
     */
    function loadPresetsFromFiles(callback) {
        var maxAttempts = 3;
        var attempt = 1;

        function isRetryableHostBootError(res) {
            if (!res || !res.error) return false;
            var msg = String(res.error);
            if (msg === 'Empty response from host') return true;

            // CEP can return a non-JSON "EvalScript error." before host is fully ready.
            if (msg.indexOf('Parse error:') === 0 && res.rawResult) {
                return String(res.rawResult).indexOf('EvalScript error') !== -1;
            }

            return false;
        }

        function handleResult(res) {
            if (res && res.success && res.data && res.data.presets) {
                loadedPresets = res.data.presets;
                presetsLoaded = true;
                TEXTORO.log('Loaded ' + loadedPresets.length + ' motion presets from files');
                if (callback) callback();
                return;
            }

            if (attempt < maxAttempts && isRetryableHostBootError(res)) {
                var delay = attempt * 120;
                attempt++;
                window.setTimeout(function() {
                    TEXTORO.HostBridge.run('loadPresets', { category: 'motion', forceReload: true }, handleResult);
                }, delay);
                return;
            }

            var details = (res && res.error) || 'Unknown error';
            if (res && res.bootstrapError) details += ' | bootstrap=' + res.bootstrapError;
            if (res && res.rawResult) details += ' | raw=' + String(res.rawResult);
            TEXTORO.error('Failed to load motion presets: ' + details);
            loadedPresets = [];
            if (callback) callback();
        }

        TEXTORO.HostBridge.run('loadPresets', { category: 'motion', forceReload: false }, handleResult);
    }
    
    /**
     * توليد أزرار البريسات ديناميكياً من ملفات JSON
     */
    function renderPresetButtons() {
        var grid = document.getElementById('motionPresetsGrid');
        if (!grid) return;
        
        // مسح المحتوى الحالي
        grid.innerHTML = '';
        
        if (loadedPresets.length === 0) {
            grid.innerHTML = '<div class="presets-empty">No presets found</div>';
            return;
        }
        
        // توليد زر لكل بريست
        // SEC-01: حقول البريس غير موثوقة (مستوردة) - بناء DOM صريح بلا innerHTML
        var FA_ICON_RE = /^fa-(solid|regular|brands) fa-[a-z0-9-]+$/;

        loadedPresets.forEach(function(preset, index) {
            var btn = document.createElement('button');
            btn.className = 'motion-preset-btn';
            btn.setAttribute('data-preset', index);
            btn.setAttribute('title', preset.description || preset.name || '');

            // الأيقونة: faIcon موثّق بنمط صارم، أو emoji كنص، أو افتراضي
            var iconEl;
            if (preset.faIcon && FA_ICON_RE.test(String(preset.faIcon))) {
                iconEl = document.createElement('i');
                iconEl.className = String(preset.faIcon);
            } else if (preset.icon) {
                iconEl = document.createElement('span');
                iconEl.className = 'preset-emoji';
                iconEl.textContent = String(preset.icon);
            } else {
                iconEl = document.createElement('i');
                iconEl.className = 'fa-solid fa-play';
            }

            var nameEl = document.createElement('span');
            nameEl.textContent = String(preset.name || '');

            btn.appendChild(iconEl);
            btn.appendChild(document.createTextNode(' '));
            btn.appendChild(nameEl);
            grid.appendChild(btn);
        });
        
        TEXTORO.log('Rendered ' + loadedPresets.length + ' preset buttons');
    }
    
    /**
     * الحصول على بريست بواسطة الفهرس
     */
    function getPresetByIndex(index) {
        if (index >= 0 && index < loadedPresets.length) {
            return loadedPresets[index];
        }
        return null;
    }
    
    /**
     * الحصول على اسم البريست بواسطة الفهرس
     */
    function getPresetName(index) {
        var preset = getPresetByIndex(index);
        return preset ? preset.name : 'Unknown';
    }
    
    /**
     * الحصول على قائمة أسماء البريسات
     */
    function getPresetNames() {
        return loadedPresets.map(function(p) { return p.name; });
    }
    
    /**
     * تهيئة تبويبات Presets
     */
    function initPresetTabs() {
        // Tab buttons
        var tabBtns = document.querySelectorAll('.preset-tab');
        tabBtns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                var tab = this.getAttribute('data-tab');
                switchPresetTab(tab);
            });
        });
        
        // Preset buttons
        var presetBtns = document.querySelectorAll('.motion-preset-btn');
        presetBtns.forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                var presetIndex = parseInt(this.getAttribute('data-preset'));
                selectPreset(presetIndex);
            });
            
            btn.addEventListener('dblclick', function(e) {
                e.stopPropagation();
                var presetIndex = parseInt(this.getAttribute('data-preset'));
                presetState.selectedIn = presetIndex;
                presetState.selectedOut = null;
                applySelectedPresets();
            });
        });
        
        // Clear button
        var clearBtn = document.getElementById('btnClearPresets');
        if (clearBtn) {
            clearBtn.addEventListener('click', clearPresetSelection);
        }
    }
    
    /**
     * تهيئة Sync toggle
     */
    function initSyncToggle() {
        var syncCheckbox = document.getElementById('motionSyncEnable');
        if (syncCheckbox) {
            syncCheckbox.addEventListener('change', function() {
                var timingInputs = ['motionInStart', 'motionInEnd', 'motionOutStart', 'motionOutEnd'];
                var disabled = this.checked;
                
                timingInputs.forEach(function(id) {
                    var el = document.getElementById(id);
                    if (el) {
                        el.disabled = disabled;
                        el.style.opacity = disabled ? '0.5' : '1';
                    }
                });
            });
        }
    }
    
    /**
     * تهيئة أزرار Link/Unlink
     */
    function initLinkButtons() {
        var linkConfigs = [
            { btn: 'motionPosLink', rows: ['motionPosOutRow1', 'motionPosOutRow2'] },
            { btn: 'motionScaleLink', rows: ['motionScaleOutRow'] },
            { btn: 'motionRotLink', rows: ['motionRotOutRow'] },
            { btn: 'motionOpacityLink', rows: ['motionOpacityOutRow'] }
        ];
        
        linkConfigs.forEach(function(config) {
            var btn = document.getElementById(config.btn);
            if (btn) {
                btn.addEventListener('click', function() {
                    toggleLink(this, config.rows);
                });
            }
        });
    }
    
    /**
     * تبديل حالة Link
     */
    function toggleLink(btn, rowIds) {
        var isLinked = btn.classList.contains('linked');
        
        if (isLinked) {
            btn.classList.remove('linked');
            btn.classList.add('unlinked');
            btn.innerHTML = '<i class="fa-solid fa-link-slash"></i>';
            btn.title = 'Click to link OUT with IN (reverse)';
            
            rowIds.forEach(function(rowId) {
                var row = document.getElementById(rowId);
                if (row) row.style.display = '';
            });
        } else {
            btn.classList.remove('unlinked');
            btn.classList.add('linked');
            btn.innerHTML = '<i class="fa-solid fa-link"></i>';
            btn.title = 'Click to set independent OUT values';
            
            rowIds.forEach(function(rowId) {
                var row = document.getElementById(rowId);
                if (row) row.style.display = 'none';
            });
        }
    }
    
    /**
     * التحقق من حالة Unlink
     */
    function isPropertyUnlinked(property) {
        var linkBtn = document.getElementById('motion' + property + 'Link');
        return linkBtn && linkBtn.classList.contains('unlinked');
    }
    
    /**
     * تبديل تبويب Preset
     */
    function switchPresetTab(tab) {
        presetState.activeTab = tab;
        
        var tabBtns = document.querySelectorAll('.preset-tab');
        tabBtns.forEach(function(btn) {
            btn.classList.toggle('active', btn.getAttribute('data-tab') === tab);
        });
    }
    
    /**
     * اختيار Preset
     */
    function selectPreset(presetIndex) {
        if (presetState.activeTab === 'in') {
            presetState.selectedIn = (presetState.selectedIn === presetIndex) ? null : presetIndex;
        } else {
            presetState.selectedOut = (presetState.selectedOut === presetIndex) ? null : presetIndex;
        }
        
        updatePresetGridUI();
        updatePresetSummaryUI();
    }
    
    /**
     * تحديث واجهة الـ Grid
     */
    function updatePresetGridUI() {
        var presetBtns = document.querySelectorAll('.motion-preset-btn');
        presetBtns.forEach(function(btn) {
            var index = parseInt(btn.getAttribute('data-preset'));
            btn.classList.remove('selected-in', 'selected-out');
            if (presetState.selectedIn === index) btn.classList.add('selected-in');
            if (presetState.selectedOut === index) btn.classList.add('selected-out');
        });
    }
    
    /**
     * تحديث ملخص الاختيار
     */
    function updatePresetSummaryUI() {
        var inSpan = document.getElementById('selectedInPreset');
        var outSpan = document.getElementById('selectedOutPreset');
        
        if (inSpan) {
            inSpan.textContent = presetState.selectedIn !== null ? getPresetName(presetState.selectedIn) : 'None';
        }
        if (outSpan) {
            outSpan.textContent = presetState.selectedOut !== null ? getPresetName(presetState.selectedOut) : 'None';
        }
    }
    
    /**
     * مسح اختيار Presets
     */
    function clearPresetSelection() {
        presetState.selectedIn = null;
        presetState.selectedOut = null;
        updatePresetGridUI();
        updatePresetSummaryUI();
    }
    
    /**
     * تطبيق Presets المحددة
     */
    function applySelectedPresets() {
        var inPreset = presetState.selectedIn;
        var outPreset = presetState.selectedOut;
        
        if (inPreset === null && outPreset === null) {
            TEXTORO.UI.StatusBar.set('Select at least one preset', 'warning');
            return;
        }
        
        // إذا لم يتم اختيار IN، نستخدم قيم افتراضية (لا حركة IN)
        if (inPreset === null && outPreset !== null) {
            setChecked('motionPosEnable', false);
            setChecked('motionScaleEnable', false);
            setChecked('motionRotEnable', false);
            setChecked('motionOpacityEnable', false);
        }
        
        if (inPreset !== null) {
            fillUIFromPreset(inPreset, 'in');
        }
        
        if (outPreset !== null) {
            fillUIFromPreset(outPreset, 'out');
            unlinkAllProperties();
            setChecked('motionOutEnable', true);
            
            var outStartEl = document.getElementById('motionOutStart');
            var outEndEl = document.getElementById('motionOutEnd');
            if (outStartEl && (outStartEl.value === '' || parseFloat(outStartEl.value) < 0)) {
                outStartEl.value = '4';
            }
            if (outEndEl && (outEndEl.value === '' || parseFloat(outEndEl.value) < 0)) {
                outEndEl.value = '5';
            }
        }
        
        setTimeout(function() {
            var submitted = applyFromUI();
            if (submitted !== false) {
                TEXTORO.UI.StatusBar.success('Motion applied! IN: ' + 
                    (inPreset !== null ? getPresetName(inPreset) : '-') + 
                    ', OUT: ' + (outPreset !== null ? getPresetName(outPreset) : '-'));
            }
        }, 50);
    }

    
    /**
     * ملء الواجهة من Preset (من ملف JSON)
     */
    function fillUIFromPreset(presetIndex, target) {
        var preset = getPresetByIndex(presetIndex);
        if (!preset || !preset.values) return;
        
        var v = preset.values;
        
        if (target === 'in') {
            // IN: تعيين القيم مباشرة من ملف JSON
            setChecked('motionPosEnable', v.animatePosition);
            setValue('motionPosFromX', v.posFromX);
            setValue('motionPosFromY', v.posFromY);
            setValue('motionPosToX', v.posToX);
            setValue('motionPosToY', v.posToY);
            
            setChecked('motionScaleEnable', v.animateScale);
            setValue('motionScaleFrom', v.scaleFrom);
            setValue('motionScaleTo', v.scaleTo);
            
            setChecked('motionRotEnable', v.animateRotation);
            setValue('motionRotFrom', v.rotFrom);
            setValue('motionRotTo', v.rotTo);
            
            setChecked('motionOpacityEnable', v.animateOpacity);
            setValue('motionOpacityFrom', v.opacityFrom);
            setValue('motionOpacityTo', v.opacityTo);
            
            setValue('motionEasingType', v.easingType);
            setValue('motionEasingStrength', v.easingStrength);
        } else {
            // OUT: استخدام قيم OUT من الملف أو عكس قيم IN
            setValue('motionPosOutFromX', v.posOutFromX !== undefined ? v.posOutFromX : v.posToX);
            setValue('motionPosOutFromY', v.posOutFromY !== undefined ? v.posOutFromY : v.posToY);
            setValue('motionPosOutToX', v.posOutToX !== undefined ? v.posOutToX : v.posFromX);
            setValue('motionPosOutToY', v.posOutToY !== undefined ? v.posOutToY : v.posFromY);
            if (v.animatePosition) setChecked('motionPosEnable', true);
            
            setValue('motionScaleOutFrom', v.scaleOutFrom !== undefined ? v.scaleOutFrom : v.scaleTo);
            setValue('motionScaleOutTo', v.scaleOutTo !== undefined ? v.scaleOutTo : v.scaleFrom);
            if (v.animateScale) setChecked('motionScaleEnable', true);
            
            setValue('motionRotOutFrom', v.rotOutFrom !== undefined ? v.rotOutFrom : v.rotTo);
            setValue('motionRotOutTo', v.rotOutTo !== undefined ? v.rotOutTo : v.rotFrom);
            if (v.animateRotation) setChecked('motionRotEnable', true);
            
            setValue('motionOpacityOutFrom', v.opacityOutFrom !== undefined ? v.opacityOutFrom : v.opacityTo);
            setValue('motionOpacityOutTo', v.opacityOutTo !== undefined ? v.opacityOutTo : v.opacityFrom);
            if (v.animateOpacity) setChecked('motionOpacityEnable', true);
        }
    }
    
    /**
     * فك ربط جميع الخصائص
     */
    function unlinkAllProperties() {
        var linkButtons = [
            { btn: 'motionPosLink', rows: ['motionPosOutRow1', 'motionPosOutRow2'] },
            { btn: 'motionScaleLink', rows: ['motionScaleOutRow'] },
            { btn: 'motionRotLink', rows: ['motionRotOutRow'] },
            { btn: 'motionOpacityLink', rows: ['motionOpacityOutRow'] }
        ];
        
        linkButtons.forEach(function(item) {
            var btn = document.getElementById(item.btn);
            if (btn && btn.classList.contains('linked')) {
                toggleLink(btn, item.rows);
            }
        });
    }
    
    /**
     * تطبيق Motion من الواجهة
     */
    function applyFromUI() {
        function showTimingError(message, fieldId) {
            TEXTORO.UI.StatusBar.error(message);
            var field = fieldId ? document.getElementById(fieldId) : null;
            if (field && field.focus) {
                field.focus();
            }
        }
        function readTimingValue(id, label) {
            var el = document.getElementById(id);
            var raw = el ? String(el.value).replace(/^\s+|\s+$/g, '') : '';
            if (raw === '') {
                return { ok: false, fieldId: id, message: label + ' is required.' };
            }

            var value = parseFloat(raw);
            if (isNaN(value)) {
                return { ok: false, fieldId: id, message: label + ' must be a valid number (seconds).' };
            }
            if (value < 0) {
                return { ok: false, fieldId: id, message: label + ' cannot be negative.' };
            }

            return { ok: true, value: value };
        }
        function getNumOrDefault(id, def) {
            var el = document.getElementById(id);
            var raw = el ? el.value : '';
            var num = parseFloat(raw);
            return isNaN(num) ? def : num;
        }
        function getChecked(id) {
            var el = document.getElementById(id);
            return el ? el.checked : false;
        }
        function getIntOrDefault(id, def) {
            var el = document.getElementById(id);
            var raw = el ? el.value : '';
            var num = parseInt(raw, 10);
            return isNaN(num) ? def : num;
        }
        
        var outEnable = getChecked('motionOutEnable');
        var inStartResult = readTimingValue('motionInStart', 'IN start');
        if (!inStartResult.ok) {
            showTimingError(inStartResult.message, inStartResult.fieldId);
            return false;
        }

        var inEndResult = readTimingValue('motionInEnd', 'IN end');
        if (!inEndResult.ok) {
            showTimingError(inEndResult.message, inEndResult.fieldId);
            return false;
        }

        var inStart = inStartResult.value;
        var inEnd = inEndResult.value;

        if (inEnd < inStart) {
            showTimingError('IN end must be greater than or equal to IN start.', 'motionInEnd');
            return false;
        }

        var outStart = -1;
        var outEnd = -1;
        if (outEnable) {
            var outStartResult = readTimingValue('motionOutStart', 'OUT start');
            if (!outStartResult.ok) {
                showTimingError(outStartResult.message, outStartResult.fieldId);
                return false;
            }

            var outEndResult = readTimingValue('motionOutEnd', 'OUT end');
            if (!outEndResult.ok) {
                showTimingError(outEndResult.message, outEndResult.fieldId);
                return false;
            }

            outStart = outStartResult.value;
            outEnd = outEndResult.value;

            if (outEnd < outStart) {
                showTimingError('OUT end must be greater than or equal to OUT start.', 'motionOutEnd');
                return false;
            }
        }
        
        var opts = {
            inStart: inStart,
            inEnd: inEnd,
            outStart: outStart,
            outEnd: outEnd,
            syncMode: getChecked('motionSyncEnable') ? 1 : 0,
            
            animatePosition: getChecked('motionPosEnable'),
            posFromX: getNumOrDefault('motionPosFromX', 0),
            posFromY: getNumOrDefault('motionPosFromY', 0),
            posToX: getNumOrDefault('motionPosToX', 0),
            posToY: getNumOrDefault('motionPosToY', 0),
            posLinkMode: isPropertyUnlinked('Pos') ? 1 : 0,
            posOutFromX: getNumOrDefault('motionPosOutFromX', 0),
            posOutFromY: getNumOrDefault('motionPosOutFromY', 0),
            posOutToX: getNumOrDefault('motionPosOutToX', 0),
            posOutToY: getNumOrDefault('motionPosOutToY', 0),
            
            animateScale: getChecked('motionScaleEnable'),
            scaleFrom: getNumOrDefault('motionScaleFrom', 100),
            scaleTo: getNumOrDefault('motionScaleTo', 100),
            scaleLinkMode: isPropertyUnlinked('Scale') ? 1 : 0,
            scaleOutFrom: getNumOrDefault('motionScaleOutFrom', 100),
            scaleOutTo: getNumOrDefault('motionScaleOutTo', 100),
            
            animateRotation: getChecked('motionRotEnable'),
            rotFrom: getNumOrDefault('motionRotFrom', 0),
            rotTo: getNumOrDefault('motionRotTo', 0),
            rotLinkMode: isPropertyUnlinked('Rot') ? 1 : 0,
            rotOutFrom: getNumOrDefault('motionRotOutFrom', 0),
            rotOutTo: getNumOrDefault('motionRotOutTo', 0),
            
            animateOpacity: getChecked('motionOpacityEnable'),
            opacityFrom: getNumOrDefault('motionOpacityFrom', 0),
            opacityTo: getNumOrDefault('motionOpacityTo', 100),
            opacityLinkMode: isPropertyUnlinked('Opacity') ? 1 : 0,
            opacityOutFrom: getNumOrDefault('motionOpacityOutFrom', 100),
            opacityOutTo: getNumOrDefault('motionOpacityOutTo', 0),
            
            easingType: getIntOrDefault('motionEasingType', 1),
            easingStrength: getNumOrDefault('motionEasingStrength', 100)
        };
        
        if (layerCount > 1) {
            opts.stagger = getNumOrDefault('motionStagger', 0);
            TEXTORO.HostBridge.run('applyMotionMulti', opts, function(res) {
                if (res.success) {
                    TEXTORO.UI.StatusBar.success('Motion applied to ' + layerCount + ' layers!');
                } else {
                    TEXTORO.UI.StatusBar.error('Error: ' + res.error);
                }
            });
        } else {
            TEXTORO.HostBridge.run('applyMotion', opts, function(res) {
                if (res.success) {
                    TEXTORO.UI.StatusBar.success('Motion applied!');
                } else {
                    TEXTORO.UI.StatusBar.error('Error: ' + res.error);
                }
            });
        }
        return true;
    }
    
    /**
     * تطبيق Motion (يتحقق من Presets أولاً)
     */
    function apply() {
        if (presetState.selectedIn !== null || presetState.selectedOut !== null) {
            applySelectedPresets();
        } else {
            applyFromUI();
        }
    }
    
    /**
     * إزالة Motion
     */
    function remove() {
        TEXTORO.HostBridge.run('removeMotion', null, function(res) {
            if (res.success) {
                TEXTORO.UI.StatusBar.success('Motion removed!');
            } else {
                TEXTORO.UI.StatusBar.error('Error: ' + res.error);
            }
        });
    }
    
    /**
     * جمع قيم Motion الحالية
     */
    function collectValues() {
        function getVal(id, def) {
            var el = document.getElementById(id);
            if (!el) return def;
            var v = parseFloat(el.value);
            return isNaN(v) ? def : v;
        }
        function getChk(id) {
            var el = document.getElementById(id);
            return el ? el.checked : false;
        }
        
        return {
            inStart: getVal('motionInStart', 0),
            inEnd: getVal('motionInEnd', 1),
            outEnable: getChk('motionOutEnable'),
            outStart: getVal('motionOutStart', 4),
            outEnd: getVal('motionOutEnd', 5),
            syncMode: getChk('motionSyncEnable') ? 1 : 0,
            animatePosition: getChk('motionPosEnable'),
            posFromX: getVal('motionPosFromX', 0),
            posFromY: getVal('motionPosFromY', 0),
            posToX: getVal('motionPosToX', 0),
            posToY: getVal('motionPosToY', 0),
            posLinkMode: isPropertyUnlinked('Pos') ? 1 : 0,
            posOutFromX: getVal('motionPosOutFromX', 0),
            posOutFromY: getVal('motionPosOutFromY', 0),
            posOutToX: getVal('motionPosOutToX', 0),
            posOutToY: getVal('motionPosOutToY', 0),
            animateScale: getChk('motionScaleEnable'),
            scaleFrom: getVal('motionScaleFrom', 100),
            scaleTo: getVal('motionScaleTo', 100),
            scaleLinkMode: isPropertyUnlinked('Scale') ? 1 : 0,
            scaleOutFrom: getVal('motionScaleOutFrom', 100),
            scaleOutTo: getVal('motionScaleOutTo', 100),
            animateRotation: getChk('motionRotEnable'),
            rotFrom: getVal('motionRotFrom', 0),
            rotTo: getVal('motionRotTo', 0),
            rotLinkMode: isPropertyUnlinked('Rot') ? 1 : 0,
            rotOutFrom: getVal('motionRotOutFrom', 0),
            rotOutTo: getVal('motionRotOutTo', 0),
            animateOpacity: getChk('motionOpacityEnable'),
            opacityFrom: getVal('motionOpacityFrom', 0),
            opacityTo: getVal('motionOpacityTo', 100),
            opacityLinkMode: isPropertyUnlinked('Opacity') ? 1 : 0,
            opacityOutFrom: getVal('motionOpacityOutFrom', 100),
            opacityOutTo: getVal('motionOpacityOutTo', 0),
            easingType: (function() {
                var easingEl = document.getElementById('motionEasingType');
                var easingVal = parseInt(easingEl ? easingEl.value : '', 10);
                return isNaN(easingVal) ? 1 : easingVal;
            })(),
            easingStrength: getVal('motionEasingStrength', 100)
        };
    }
    
    /**
     * تطبيق Custom Preset (من Presets Hub)
     */
    function applyCustomPreset(preset) {
        if (!preset || !preset.values) return;
        
        var v = preset.values;
        
        setValue('motionInStart', v.inStart);
        setValue('motionInEnd', v.inEnd);
        setChecked('motionOutEnable', v.outEnable);
        setValue('motionOutStart', v.outStart);
        setValue('motionOutEnd', v.outEnd);
        setChecked('motionSyncEnable', v.syncMode === 1);
        
        setChecked('motionPosEnable', v.animatePosition);
        setValue('motionPosFromX', v.posFromX);
        setValue('motionPosFromY', v.posFromY);
        setValue('motionPosToX', v.posToX);
        setValue('motionPosToY', v.posToY);
        setValue('motionPosOutFromX', v.posOutFromX);
        setValue('motionPosOutFromY', v.posOutFromY);
        setValue('motionPosOutToX', v.posOutToX);
        setValue('motionPosOutToY', v.posOutToY);
        
        setChecked('motionScaleEnable', v.animateScale);
        setValue('motionScaleFrom', v.scaleFrom);
        setValue('motionScaleTo', v.scaleTo);
        setValue('motionScaleOutFrom', v.scaleOutFrom);
        setValue('motionScaleOutTo', v.scaleOutTo);
        
        setChecked('motionRotEnable', v.animateRotation);
        setValue('motionRotFrom', v.rotFrom);
        setValue('motionRotTo', v.rotTo);
        setValue('motionRotOutFrom', v.rotOutFrom);
        setValue('motionRotOutTo', v.rotOutTo);
        
        setChecked('motionOpacityEnable', v.animateOpacity);
        setValue('motionOpacityFrom', v.opacityFrom);
        setValue('motionOpacityTo', v.opacityTo);
        setValue('motionOpacityOutFrom', v.opacityOutFrom);
        setValue('motionOpacityOutTo', v.opacityOutTo);
        
        setValue('motionEasingType', v.easingType);
        setValue('motionEasingStrength', v.easingStrength);
        
        applyFromUI();
        TEXTORO.UI.StatusBar.success('Applied preset: ' + preset.name);
    }
    
    /**
     * تحديث عدد الطبقات
     */
    function updateLayerCount() {
        TEXTORO.HostBridge.run('getMotionSelectionCount', null, function(res) {
            if (res.success && res.data) {
                layerCount = res.data.count || 0;
                var multiLayerDiv = document.getElementById('motionMultiLayer');
                var countSpan = document.getElementById('motionLayerCount');
                
                if (multiLayerDiv) {
                    multiLayerDiv.style.display = layerCount > 1 ? 'block' : 'none';
                }
                if (countSpan) {
                    countSpan.textContent = layerCount > 1 ? '(' + layerCount + ' layers)' : '';
                }
            }
        });
    }
    
    /**
     * إعادة تحميل البريسات وتحديث الواجهة
     */
    function reloadPresets(callback) {
        loadPresetsFromFiles(function() {
            renderPresetButtons();
            initPresetTabs(); // إعادة ربط الأحداث
            clearPresetSelection();
            if (callback) callback();
        });
    }
    
    // Helper functions
    function setValue(id, value) {
        var el = document.getElementById(id);
        if (el && value !== undefined) el.value = value;
    }
    
    function setChecked(id, checked) {
        var el = document.getElementById(id);
        if (el) el.checked = checked;
    }
    
    // Public API
    return {
        init: init,
        apply: apply,
        remove: remove,
        collectValues: collectValues,
        applyCustomPreset: applyCustomPreset,
        updateLayerCount: updateLayerCount,
        clearPresetSelection: clearPresetSelection,
        reloadPresets: reloadPresets,
        getPresetNames: getPresetNames,
        getPresetByIndex: getPresetByIndex,
        get PRESET_NAMES() { return getPresetNames(); }
    };
})();

// Legacy aliases moved to js/legacy/aliases.js
