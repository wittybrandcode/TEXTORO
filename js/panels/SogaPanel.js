/**
 * TEXTORO - Soga Panel Module
 * لوحة Soga (تعديل الطبقات المحددة)
 * @version 3.3.0
 */

TEXTORO.Panels = TEXTORO.Panels || {};

TEXTORO.Panels.Soga = (function() {
    'use strict';
    
    // متغيرات خاصة
    var debounceTimer = null;
    var multiCount = 0;
    var boxUse4Corners = true;
    var formSnapshot = {}; // F-02: حالة النموذج وقت آخر populate لحساب الفروقات فقط

    // F-02: خريطة حقول النموذج (مفتاح الخيار في الـ payload -> معرف العنصر)
    var SOGA_FIELD_IDS = {
        typewriter: {
            twProgress: 'sogaTwProgress', twAuto: 'sogaTwAuto', twReverse: 'sogaTwReverse',
            wordMode: 'sogaWordMode', randomSpeed: 'sogaRandomSpeed', showCursor: 'sogaShowCursor',
            cursorBefore: 'sogaCursorBefore', cursorColor: 'sogaCursorColor',
            cursorSpacing: 'sogaCursorSpacing', blinkSpeed: 'sogaBlinkSpeed',
            blinkInHold: 'sogaBlinkInHold', boxRTL: 'sogaBoxRTL', textColor: 'sogaTextColor',
            easingType: 'sogaEasingType', easingStrength: 'sogaEasingStrength'
        },
        box: {
            paddingLeft: 'sogaPadL', paddingRight: 'sogaPadR', paddingTop: 'sogaPadT', paddingBottom: 'sogaPadB',
            cornerTL: 'sogaCornerTL', cornerTR: 'sogaCornerTR', cornerBR: 'sogaCornerBR', cornerBL: 'sogaCornerBL',
            strokeWidth: 'sogaStrokeW', strokeOpacity: 'sogaStrokeOp', strokeColor: 'sogaStrokeColor',
            strokeDash: 'sogaStrokeDash', strokeGap: 'sogaStrokeGap', fillOpacity: 'sogaFillOp',
            fillColor: 'sogaFillColor', lockBoxSize: 'sogaLockSize'
        }
    };
    var motionLinkModes = {
        pos: 0,
        scale: 0,
        rot: 0,
        opacity: 0
    };
    
    /**
     * تهيئة اللوحة
     */
    function init() {
        // Refresh button
        var btnRefresh = document.getElementById('btnSogaRefresh');
        if (btnRefresh) btnRefresh.addEventListener('click', refresh);
        
        // Collapsible sections
        var headers = document.querySelectorAll('.coll-h');
        headers.forEach(function(header) {
            if (!header.onclick) {
                header.addEventListener('click', function() {
                    this.classList.toggle('open');
                });
            }
        });
        
        // Live Edit
        initLiveEdit();
        
        // Motion tabs
        initMotionTabs();
        
        TEXTORO.log('SogaPanel initialized');
    }
    
    /**
     * تهيئة Live Edit - تطبيق التغييرات تلقائياً
     */
    function initLiveEdit() {
        var inputIds = [
            // Typewriter
            'sogaTwProgress', 'sogaTwAuto', 'sogaTwReverse', 'sogaWordMode', 'sogaRandomSpeed',
            'sogaShowCursor', 'sogaCursorBefore', 'sogaCursorColor',
            'sogaCursorSpacing', 'sogaBlinkSpeed', 'sogaBlinkInHold', 'sogaBoxRTL',
            'sogaTextColor', 'sogaEasingType', 'sogaEasingStrength',
            // Box
            'sogaPadL', 'sogaPadR', 'sogaPadT', 'sogaPadB',
            'sogaCorner', 'sogaCornerTL', 'sogaCornerTR', 'sogaCornerBL', 'sogaCornerBR',
            'sogaStrokeW', 'sogaStrokeOp', 'sogaStrokeColor', 'sogaStrokeDash', 'sogaStrokeGap',
            'sogaFillOp', 'sogaFillColor', 'sogaLockSize'
        ];
        
        inputIds.forEach(function(id) {
            var el = document.getElementById(id);
            if (!el) return;
            
            var eventType = (el.type === 'checkbox' || el.tagName === 'SELECT') ? 'change' : 'input';
            
            el.addEventListener(eventType, function() {
                if (debounceTimer) clearTimeout(debounceTimer);
                debounceTimer = setTimeout(function() {
                    applyChanges();
                }, TEXTORO.Config.TIMING.SOGA_DEBOUNCE_DELAY);
            });
        });
        
        TEXTORO.log('Soga Live Edit enabled');
    }
    
    /**
     * تهيئة تبويبات Motion في Soga
     */
    function initMotionTabs() {
        var tabs = document.querySelectorAll('.soga-motion-tab');
        tabs.forEach(function(tab) {
            tab.addEventListener('click', function() {
                var targetTab = this.getAttribute('data-tab');
                
                tabs.forEach(function(t) { t.classList.remove('active'); });
                this.classList.add('active');
                
                var inContent = document.getElementById('sogaMotionInContent');
                var outContent = document.getElementById('sogaMotionOutContent');
                
                if (targetTab === 'in') {
                    if (inContent) inContent.style.display = 'block';
                    if (outContent) outContent.style.display = 'none';
                } else {
                    if (inContent) inContent.style.display = 'none';
                    if (outContent) outContent.style.display = 'block';
                }
            });
        });
        
        // Save Motion button
        var btnSave = document.getElementById('btnSogaSaveMotion');
        if (btnSave) {
            btnSave.addEventListener('click', saveMotionPreset);
        }
    }
    
    /**
     * تحديث اللوحة
     */
    function refresh() {
        TEXTORO.HostBridge.run('getMultiSelectionInfo', null, function(selRes) {
            if (!selRes.success) {
                // E-01: فشل المضيف لا يُطوى كـ"لا تحديد"
                var errS = (selRes && selRes.error) || 'Unknown error';
                TEXTORO.error('[SogaPanel] getMultiSelectionInfo failed: ' + errS);
                TEXTORO.UI.StatusBar.warning('Soga: ' + errS);
            }
            var count = (selRes.success && selRes.data) ? selRes.data.count : 0;
            multiCount = count;
            
            if (count === 0) {
                showEmpty();
                return;
            }
            
            if (count > 1) {
                showMulti(count);
                return;
            }
            
            // طبقة واحدة
            TEXTORO.HostBridge.run('getLayerEffectValues', null, function(res) {
                if (!res.success || !res.data || !res.data.layerName) {
                    showEmpty();
                    return;
                }
                
                var data = res.data;
                
                document.getElementById('sogaLayerName').textContent = data.layerName;
                
                var hasAnyEffect = data.hasTypewriter || data.hasBox || data.hasMotion;
                
                var sogaEmpty = document.getElementById('sogaEmpty');
                var sogaTypewriter = document.getElementById('sogaTypewriter');
                var sogaBox = document.getElementById('sogaBox');
                var sogaMotion = document.getElementById('sogaMotion');
                
                if (sogaEmpty) sogaEmpty.style.display = hasAnyEffect ? 'none' : 'block';
                if (sogaTypewriter) sogaTypewriter.style.display = data.hasTypewriter ? 'block' : 'none';
                if (sogaBox) sogaBox.style.display = data.hasBox ? 'block' : 'none';
                if (sogaMotion) sogaMotion.style.display = data.hasMotion ? 'block' : 'none';
                
                if (data.hasTypewriter && data.typewriter) {
                    populateTypewriter(data.typewriter);
                }
                
                if (data.hasBox && data.box) {
                    populateBox(data.box);
                }
                
                if (data.hasMotion && data.motion) {
                    populateMotion(data.motion);
                }

                formSnapshot = captureFormSnapshot(); // F-02
                setButtonsEnabled(hasAnyEffect);
            });
        });
    }
    
    /**
     * عرض حالة التحديد المتعدد
     */
    function showMulti(count) {
        var sogaLayerName = document.getElementById('sogaLayerName');
        if (sogaLayerName) sogaLayerName.textContent = count + ' layers selected';
        
        var sogaEmpty = document.getElementById('sogaEmpty');
        var sogaTypewriter = document.getElementById('sogaTypewriter');
        var sogaBox = document.getElementById('sogaBox');
        var sogaMotionMulti = document.getElementById('sogaMotion');

        if (sogaEmpty) sogaEmpty.style.display = 'none';
        if (sogaTypewriter) sogaTypewriter.style.display = 'block';
        if (sogaBox) sogaBox.style.display = 'block';
        if (sogaMotionMulti) sogaMotionMulti.style.display = 'none'; // F-02: لا Motion افتراضيات في الوضع المتعدد

        populateTypewriter(TEXTORO.Defaults.typewriter);
        populateBox(TEXTORO.Defaults.box);

        formSnapshot = captureFormSnapshot(); // F-02

        setButtonsEnabled(true);
    }
    
    /**
     * عرض حالة عدم وجود تحديد
     */
    function showEmpty() {
        multiCount = 0;
        var sogaLayerName = document.getElementById('sogaLayerName');
        var sogaEmpty = document.getElementById('sogaEmpty');
        var sogaTypewriter = document.getElementById('sogaTypewriter');
        var sogaBox = document.getElementById('sogaBox');
        var sogaMotion = document.getElementById('sogaMotion');
        
        if (sogaLayerName) sogaLayerName.textContent = 'No Selection';
        if (sogaEmpty) sogaEmpty.style.display = 'block';
        if (sogaTypewriter) sogaTypewriter.style.display = 'none';
        if (sogaBox) sogaBox.style.display = 'none';
        if (sogaMotion) sogaMotion.style.display = 'none';
        
        setButtonsEnabled(false);
    }
    
    /**
     * ملء قيم Typewriter
     */
    function populateTypewriter(tw) {
        setValue('sogaTwProgress', tw.twProgress);
        setChecked('sogaTwAuto', tw.twAuto);
        setChecked('sogaTwReverse', tw.twReverse);
        setChecked('sogaWordMode', tw.wordMode || false);
        setValue('sogaRandomSpeed', tw.randomSpeed);
        setChecked('sogaShowCursor', tw.showCursor);
        setChecked('sogaCursorBefore', tw.cursorBefore);
        setColor('sogaCursorColor', tw.cursorColor);
        setValue('sogaCursorSpacing', tw.cursorSpacing);
        setValue('sogaBlinkSpeed', tw.blinkSpeed);
        setChecked('sogaBlinkInHold', tw.blinkInHold);
        setChecked('sogaBoxRTL', tw.boxRTL);
        setColor('sogaTextColor', tw.textColor);
        setValue('sogaEasingType', (tw.easingType != null) ? tw.easingType : 1);
        setValue('sogaEasingStrength', (tw.easingStrength != null) ? tw.easingStrength : 100);
    }
    
    /**
     * ملء قيم Box
     */
    function populateBox(bx) {
        setValue('sogaPadL', bx.paddingLeft);
        setValue('sogaPadR', bx.paddingRight);
        setValue('sogaPadT', bx.paddingTop);
        setValue('sogaPadB', bx.paddingBottom);
        
        var soga4CornersRow = document.getElementById('soga4CornersRow');
        var sogaSingleCornerRow = document.getElementById('sogaSingleCornerRow');
        
        if (bx.use4Corners) {
            if (soga4CornersRow) soga4CornersRow.style.display = '';
            if (sogaSingleCornerRow) sogaSingleCornerRow.style.display = 'none';
            setValue('sogaCornerTL', (bx.cornerTL != null) ? bx.cornerTL : 15);
            setValue('sogaCornerTR', (bx.cornerTR != null) ? bx.cornerTR : 15);
            setValue('sogaCornerBR', (bx.cornerBR != null) ? bx.cornerBR : 15);
            setValue('sogaCornerBL', (bx.cornerBL != null) ? bx.cornerBL : 15);
        } else {
            if (soga4CornersRow) soga4CornersRow.style.display = 'none';
            if (sogaSingleCornerRow) sogaSingleCornerRow.style.display = '';
            setValue('sogaCorner', (bx.cornerRadius != null) ? bx.cornerRadius : 15);
        }
        
        boxUse4Corners = bx.use4Corners;
        
        setValue('sogaStrokeW', bx.strokeWidth);
        setValue('sogaStrokeOp', bx.strokeOpacity);
        setColor('sogaStrokeColor', bx.strokeColor);
        setValue('sogaStrokeDash', bx.strokeDash || 0);
        setValue('sogaStrokeGap', bx.strokeGap || 0);
        setValue('sogaFillOp', bx.fillOpacity);
        setColor('sogaFillColor', bx.fillColor);
        setChecked('sogaLockSize', bx.lockBoxSize);
    }

    
    /**
     * ملء قيم Motion
     */
    function populateMotion(mt) {
        setValue('sogaMotionInStart', mt.inStart != null ? mt.inStart : 0);
        setValue('sogaMotionInEnd', mt.inEnd != null ? mt.inEnd : 1);
        setValue('sogaMotionOutStart', mt.outStart != null ? mt.outStart : -1);
        setValue('sogaMotionOutEnd', mt.outEnd != null ? mt.outEnd : -1);
        
        setChecked('sogaMotionSyncEnable', (mt.syncMode > 0));
        
        // Position IN
        setChecked('sogaMotionPosEnable', mt.animatePosition || false);
        setValue('sogaMotionPosFromX', mt.posFromX || 0);
        setValue('sogaMotionPosFromY', mt.posFromY || 0);
        setValue('sogaMotionPosToX', mt.posToX || 0);
        setValue('sogaMotionPosToY', mt.posToY || 0);
        
        // Position OUT
        motionLinkModes.pos = (mt.posLinkMode != null) ? mt.posLinkMode : 0;
        var posLinkMode = motionLinkModes.pos;
        setValue('sogaMotionPosOutFromX', posLinkMode === 0 ? (mt.posToX || 0) : (mt.posOutFromX || 0));
        setValue('sogaMotionPosOutFromY', posLinkMode === 0 ? (mt.posToY || 0) : (mt.posOutFromY || 0));
        setValue('sogaMotionPosOutToX', posLinkMode === 0 ? (mt.posFromX || 0) : (mt.posOutToX || 0));
        setValue('sogaMotionPosOutToY', posLinkMode === 0 ? (mt.posFromY || 0) : (mt.posOutToY || 0));
        
        // Scale IN
        setChecked('sogaMotionScaleEnable', mt.animateScale || false);
        setValue('sogaMotionScaleFrom', mt.scaleFrom != null ? mt.scaleFrom : 100);
        setValue('sogaMotionScaleTo', mt.scaleTo != null ? mt.scaleTo : 100);
        
        // Scale OUT
        motionLinkModes.scale = (mt.scaleLinkMode != null) ? mt.scaleLinkMode : 0;
        var scaleLinkMode = motionLinkModes.scale;
        setValue('sogaMotionScaleOutFrom', scaleLinkMode === 0 ? (mt.scaleTo != null ? mt.scaleTo : 100) : (mt.scaleOutFrom != null ? mt.scaleOutFrom : 100));
        setValue('sogaMotionScaleOutTo', scaleLinkMode === 0 ? (mt.scaleFrom != null ? mt.scaleFrom : 100) : (mt.scaleOutTo != null ? mt.scaleOutTo : 100));
        
        // Rotation IN
        setChecked('sogaMotionRotEnable', mt.animateRotation || false);
        setValue('sogaMotionRotFrom', mt.rotFrom || 0);
        setValue('sogaMotionRotTo', mt.rotTo || 0);
        
        // Rotation OUT
        motionLinkModes.rot = (mt.rotLinkMode != null) ? mt.rotLinkMode : 0;
        var rotLinkMode = motionLinkModes.rot;
        setValue('sogaMotionRotOutFrom', rotLinkMode === 0 ? (mt.rotTo || 0) : (mt.rotOutFrom || 0));
        setValue('sogaMotionRotOutTo', rotLinkMode === 0 ? (mt.rotFrom || 0) : (mt.rotOutTo || 0));
        
        // Opacity IN
        setChecked('sogaMotionOpacityEnable', mt.animateOpacity || false);
        setValue('sogaMotionOpacityFrom', mt.opacityFrom != null ? mt.opacityFrom : 0);
        setValue('sogaMotionOpacityTo', mt.opacityTo != null ? mt.opacityTo : 100);
        
        // Opacity OUT
        motionLinkModes.opacity = (mt.opacityLinkMode != null) ? mt.opacityLinkMode : 0;
        var opacityLinkMode = motionLinkModes.opacity;
        setValue('sogaMotionOpacityOutFrom', opacityLinkMode === 0 ? (mt.opacityTo != null ? mt.opacityTo : 100) : (mt.opacityOutFrom != null ? mt.opacityOutFrom : 100));
        setValue('sogaMotionOpacityOutTo', opacityLinkMode === 0 ? (mt.opacityFrom != null ? mt.opacityFrom : 0) : (mt.opacityOutTo != null ? mt.opacityOutTo : 0));
        
        // Easing
        setValue('sogaMotionEasingType', mt.easingType != null ? mt.easingType : 1);
        setValue('sogaMotionEasingStrength', mt.easingStrength != null ? mt.easingStrength : 100);
    }
    
    /**
     * تفعيل/تعطيل الأزرار
     */
    function setButtonsEnabled(enabled) {
        var btnApply = document.getElementById('btnSogaApply');
        if (btnApply) {
            btnApply.disabled = !enabled;
            btnApply.style.opacity = enabled ? '1' : '0.4';
            btnApply.style.pointerEvents = enabled ? 'auto' : 'none';
        }
    }
    
    /**
     * F-02: التقاط حالة النموذج الحالية كأساس مقارنة للفروقات
     */
    function captureFormSnapshot() {
        var snap = {};
        ['typewriter', 'box'].forEach(function(section) {
            var ids = SOGA_FIELD_IDS[section];
            Object.keys(ids).forEach(function(key) {
                var id = ids[key];
                var el = document.getElementById(id);
                if (!el) return;
                if (el.type === 'checkbox') {
                    snap[id] = el.checked;
                } else {
                    var num = parseFloat(el.value);
                    snap[id] = isNaN(num) ? String(el.value == null ? '' : el.value) : num;
                }
            });
        });
        return snap;
    }

    /**
     * F-02: حذف الحقول غير المتغيرة عن لحظة populate من الطلب
     * يمنع مسح إعدادات الطبقات بالقيم الافتراضية عند التحديد المتعدد.
     */
    function pruneToChangedOnly(opts) {
        function fieldChanged(id) {
            var el = document.getElementById(id);
            if (!el || !(id in formSnapshot)) return false;
            var cur;
            if (el.type === 'checkbox') {
                cur = el.checked;
            } else {
                var num = parseFloat(el.value);
                cur = isNaN(num) ? String(el.value == null ? '' : el.value) : num;
            }
            return cur !== formSnapshot[id];
        }

        ['typewriter', 'box'].forEach(function(section) {
            if (!opts[section]) return;
            var ids = SOGA_FIELD_IDS[section];
            Object.keys(opts[section]).forEach(function(key) {
                var id = ids[key];
                if (id && !fieldChanged(id)) delete opts[section][key];
            });
        });

        // إسقاط الأقسام التي لم يتبقَّ فيها أي حقل فعلي (use4Corners هيكلي فقط)
        ['typewriter', 'box'].forEach(function(section) {
            if (!opts[section]) return;
            var real = Object.keys(opts[section]).filter(function(k) {
                return k !== 'use4Corners' && opts[section][k] !== null && opts[section][k] !== undefined;
            });
            if (!real.length) delete opts[section];
        });
    }

    /**
     * تطبيق التغييرات
     */
    function applyChanges() {
        var opts = {};
        var isMulti = multiCount > 1;
        
        function getNum(id, defaultVal) {
            var el = document.getElementById(id);
            if (!el) return defaultVal;
            var val = el.value;
            if (val === '' || val === null || val === undefined) {
                return isMulti ? defaultVal : 0;
            }
            var num = parseFloat(val);
            return isNaN(num) ? (isMulti ? defaultVal : 0) : num;
        }
        function getChecked(id, def) {
            var el = document.getElementById(id);
            return el ? el.checked : def;
        }
        function getValue(id, def) {
            var el = document.getElementById(id);
            return el ? el.value : def;
        }
        function getInt(id, def) {
            var num = parseInt(getValue(id, ''), 10);
            return isNaN(num) ? def : num;
        }
        
        // Helper للتحقق من ظهور العنصر
        function isVisible(id) {
            var el = document.getElementById(id);
            if (!el) return false;
            var display = el.style.display;
            return display !== 'none' && display !== '';
        }
        
        // Typewriter
        var sogaTypewriter = document.getElementById('sogaTypewriter');
        if (sogaTypewriter && sogaTypewriter.style.display !== 'none') {
            var twD = TEXTORO.Defaults.typewriter;
            opts.typewriter = {
                twProgress: getNum('sogaTwProgress', twD.twProgress),
                twAuto: getChecked('sogaTwAuto', false),
                twReverse: getChecked('sogaTwReverse', false),
                wordMode: getChecked('sogaWordMode', false),
                randomSpeed: getNum('sogaRandomSpeed', twD.randomSpeed),
                showCursor: getChecked('sogaShowCursor', false),
                cursorBefore: getChecked('sogaCursorBefore', false),
                cursorColor: hexToRgb(getValue('sogaCursorColor', '#ffffff')),
                cursorSpacing: getNum('sogaCursorSpacing', twD.cursorSpacing),
                blinkSpeed: getNum('sogaBlinkSpeed', twD.blinkSpeed),
                blinkInHold: getChecked('sogaBlinkInHold', false),
                boxRTL: getChecked('sogaBoxRTL', false),
                textColor: hexToRgb(getValue('sogaTextColor', '#ffffff')),
                easingType: getInt('sogaEasingType', 1),
                easingStrength: getNum('sogaEasingStrength', 100)
            };
        }
        
        // Box
        var sogaBox = document.getElementById('sogaBox');
        if (sogaBox && sogaBox.style.display !== 'none') {
            var bxD = TEXTORO.Defaults.box;
            var use4Corners = boxUse4Corners !== false;
            
            opts.box = {
                paddingLeft: getNum('sogaPadL', bxD.paddingLeft),
                paddingRight: getNum('sogaPadR', bxD.paddingRight),
                paddingTop: getNum('sogaPadT', bxD.paddingTop),
                paddingBottom: getNum('sogaPadB', bxD.paddingBottom),
                use4Corners: use4Corners,
                cornerRadius: use4Corners ? null : getNum('sogaCorner', 15),
                cornerTL: use4Corners ? getNum('sogaCornerTL', 15) : null,
                cornerTR: use4Corners ? getNum('sogaCornerTR', 15) : null,
                cornerBR: use4Corners ? getNum('sogaCornerBR', 15) : null,
                cornerBL: use4Corners ? getNum('sogaCornerBL', 15) : null,
                strokeWidth: getNum('sogaStrokeW', bxD.strokeWidth),
                strokeOpacity: getNum('sogaStrokeOp', bxD.strokeOpacity),
                strokeColor: hexToRgb(getValue('sogaStrokeColor', '#ffffff')),
                strokeDash: getNum('sogaStrokeDash', 0),
                strokeGap: getNum('sogaStrokeGap', 0),
                fillOpacity: getNum('sogaFillOp', bxD.fillOpacity),
                fillColor: hexToRgb(getValue('sogaFillColor', '#ffffff')),
                lockBoxSize: getChecked('sogaLockSize', false)
            };
        }
        
        // Motion
        var sogaMotionEl = document.getElementById('sogaMotion');
        if (sogaMotionEl && sogaMotionEl.style.display !== 'none') {
            opts.motion = collectMotionValues();
        }

        // F-02: في وضع التحديد المتعدد نرسل الحقول المتغيرة فقط
        if (multiCount > 1) {
            pruneToChangedOnly(opts);
            if (!opts.typewriter && !opts.box && !opts.motion) {
                TEXTORO.UI.StatusBar.info('No changes to apply');
                return;
            }
        }

        TEXTORO.log('Soga Apply, Multi: ' + multiCount);
        
        // استخدام الدالة الصحيحة حسب عدد الطبقات المحددة
        var funcName = (multiCount > 1) ? 'setLayerEffectValuesMulti' : 'setLayerEffectValues';
        
        TEXTORO.HostBridge.run(funcName, opts, function(res) {
            if (res.success) {
                TEXTORO.UI.StatusBar.success('Changes applied');
            } else {
                TEXTORO.UI.StatusBar.error('Error: ' + (res.error || 'Failed'));
            }
        });
    }
    
    /**
     * جمع قيم Motion من Soga
     */
    function collectMotionValues() {
        function getNumSafe(id, def) {
            var el = document.getElementById(id);
            if (!el) return def;
            var val = parseFloat(el.value);
            return isNaN(val) ? def : val;
        }
        function getCheckedSafe(id, def) {
            var el = document.getElementById(id);
            return el ? el.checked : def;
        }
        
        return {
            inStart: getNumSafe('sogaMotionInStart', 0),
            inEnd: getNumSafe('sogaMotionInEnd', 1),
            outStart: getNumSafe('sogaMotionOutStart', -1),
            outEnd: getNumSafe('sogaMotionOutEnd', -1),
            syncMode: getCheckedSafe('sogaMotionSyncEnable', false) ? 1 : 0,
            animatePosition: getCheckedSafe('sogaMotionPosEnable', false),
            posFromX: getNumSafe('sogaMotionPosFromX', 0),
            posFromY: getNumSafe('sogaMotionPosFromY', 0),
            posToX: getNumSafe('sogaMotionPosToX', 0),
            posToY: getNumSafe('sogaMotionPosToY', 0),
            posLinkMode: motionLinkModes.pos,
            posOutFromX: getNumSafe('sogaMotionPosOutFromX', 0),
            posOutFromY: getNumSafe('sogaMotionPosOutFromY', 0),
            posOutToX: getNumSafe('sogaMotionPosOutToX', 0),
            posOutToY: getNumSafe('sogaMotionPosOutToY', 0),
            animateScale: getCheckedSafe('sogaMotionScaleEnable', false),
            scaleFrom: getNumSafe('sogaMotionScaleFrom', 100),
            scaleTo: getNumSafe('sogaMotionScaleTo', 100),
            scaleLinkMode: motionLinkModes.scale,
            scaleOutFrom: getNumSafe('sogaMotionScaleOutFrom', 100),
            scaleOutTo: getNumSafe('sogaMotionScaleOutTo', 100),
            animateRotation: getCheckedSafe('sogaMotionRotEnable', false),
            rotFrom: getNumSafe('sogaMotionRotFrom', 0),
            rotTo: getNumSafe('sogaMotionRotTo', 0),
            rotLinkMode: motionLinkModes.rot,
            rotOutFrom: getNumSafe('sogaMotionRotOutFrom', 0),
            rotOutTo: getNumSafe('sogaMotionRotOutTo', 0),
            animateOpacity: getCheckedSafe('sogaMotionOpacityEnable', false),
            opacityFrom: getNumSafe('sogaMotionOpacityFrom', 0),
            opacityTo: getNumSafe('sogaMotionOpacityTo', 100),
            opacityLinkMode: motionLinkModes.opacity,
            opacityOutFrom: getNumSafe('sogaMotionOpacityOutFrom', 100),
            opacityOutTo: getNumSafe('sogaMotionOpacityOutTo', 0),
            easingType: (function() {
                var easingEl = document.getElementById('sogaMotionEasingType');
                var easingVal = parseInt(easingEl ? easingEl.value : '', 10);
                return isNaN(easingVal) ? 1 : easingVal;
            })(),
            easingStrength: getNumSafe('sogaMotionEasingStrength', 100)
        };
    }
    
    /**
     * حفظ Motion Preset من Soga
     */
    function saveMotionPreset() {
        TEXTORO.UI.Modals.showInput({
            title: '💾 Save Motion Preset',
            label: 'Preset Name:',
            value: '',
            placeholder: 'My Motion Preset',
            showIcon: true,
            icon: '🎬',
            onOK: function(name, icon) {
                if (!name || !name.trim()) return;
                
                name = name.trim();
                var values = collectMotionValues();
                
                var presetData = {
                    category: 'motion',
                    name: name,
                    icon: icon || '🎬',
                    values: values
                };
                
                TEXTORO.HostBridge.run('savePreset', presetData, function(res) {
                    if (res.success) {
                        TEXTORO.UI.StatusBar.success('Motion preset "' + name + '" saved!');
                        if (TEXTORO.Panels.Presets && TEXTORO.Panels.Presets.load) {
                            TEXTORO.Panels.Presets.load();
                        }
                    } else {
                        TEXTORO.UI.StatusBar.error('Error: ' + res.error);
                    }
                });
            }
        });
    }
    
    // Helper functions
    function setValue(id, value) {
        var el = document.getElementById(id);
        if (el) el.value = value;
    }
    
    function setChecked(id, checked) {
        var el = document.getElementById(id);
        if (el) el.checked = checked;
    }
    
    function setColor(id, rgbArray) {
        var el = document.getElementById(id);
        if (el && rgbArray) el.value = rgbToHex(rgbArray);
    }
    
    // C-02: توحيد المحولات على TEXTORO.Utils (كانت مكررة محلياً)
    function rgbToHex(rgb) {
        if (!rgb || !rgb.length) return '#ffffff';
        var r = Math.round((rgb[0] || 0) * 255);
        var g = Math.round((rgb[1] || 0) * 255);
        var b = Math.round((rgb[2] || 0) * 255);
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    function hexToRgb(hex) {
        if (!hex) return [1, 1, 1];
        hex = String(hex).replace('#', '');
        var r = parseInt(hex.substring(0, 2), 16) / 255;
        var g = parseInt(hex.substring(2, 4), 16) / 255;
        var b = parseInt(hex.substring(4, 6), 16) / 255;
        if (isNaN(r) || isNaN(g) || isNaN(b)) return [1, 1, 1];
        return [r, g, b];
    }
    
    // Public API
    return {
        init: init,
        refresh: refresh,
        applyChanges: applyChanges,
        showEmpty: showEmpty,
        getMultiCount: function() { return multiCount; }
    };
})();

// Aliases للتوافق
function initSogaPanel() { TEXTORO.Panels.Soga.init(); }
function initSogaMotionTabs() { /* handled in init */ }
function refreshSogaPanel() { TEXTORO.Panels.Soga.refresh(); }
function refreshSogaFromLayer() { TEXTORO.Panels.Soga.refresh(); }
function applySogaChanges() { TEXTORO.Panels.Soga.applyChanges(); }
function showSogaEmpty() { TEXTORO.Panels.Soga.showEmpty(); }
var sogaMultiCount = 0;
var sogaDebounceTimer = null;
