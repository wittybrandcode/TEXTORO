/**
 * TEXTORO Motion Manager Module
 * تحريك طبقات النص ككتلة كاملة
 * Version: 2.4.0 - Smart ControllerManager Integration
 * 
 * Dependencies: Config.jsx, Utilities.jsx, ControllerManager.jsx
 * 
 * Changes in v2.4.0:
 * - Smart integration with ControllerManager with automatic fallback
 * - If createControllersFromRegistry succeeds → uses JSON registry
 * - If it fails → falls back to direct controller creation
 * - Same pattern as TypewriterManager v1.4.0 and BoxManager v1.5.0
 * 
 * Changes in v2.3:
 * - Integrated with ControllerManager for centralized controller management
 * - Uses getEaseValCode() and getTimingSyncCode() from ControllerManager
 * - Backward compatible with existing layers
 */

// Module load flag for verification
var MOTIONMANAGER_MODULE_LOADED = true;

$.writeln("[TEXTORO] Loading MotionManager module...");

// ═══════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════

var MOTION_EASING_TYPES = {
    LINEAR: 0,
    EASE_OUT: 1,
    EASE_IN: 2,
    EASE_IN_OUT: 3,
    BOUNCE: 4,
    ELASTIC: 5,
    SPRING: 6
};

// ═══════════════════════════════════════════════════════════════════
// SHARED EXPRESSION CODE - Now uses ControllerManager
// ═══════════════════════════════════════════════════════════════════

/**
 * دالة Easing المشتركة - تُستخدم في كل Motion Expressions
 * الآن تستخدم ControllerManager.getEaseValCode() إذا كان متاحاً
 */
var EASE_VAL_CODE = (typeof getEaseValCode === "function") ? getEaseValCode() :
    'function easeVal(p,eT){' +
        'if(eT==0)return p;' +
        'if(eT==1)return 1-Math.pow(1-p,2);' +
        'if(eT==2)return Math.pow(p,2);' +
        'if(eT==3)return p<0.5?2*p*p:1-Math.pow(-2*p+2,2)/2;' +
        'if(eT==4){var n=7.5625,d=2.75;if(p<1/d)return n*p*p;if(p<2/d)return n*(p-=1.5/d)*p+0.75;if(p<2.5/d)return n*(p-=2.25/d)*p+0.9375;return n*(p-=2.625/d)*p+0.984375;}' +
        'if(eT==5)return p==0?0:p==1?1:Math.pow(2,-10*p)*Math.sin((p*10-0.75)*2.094)+1;' +
        'if(eT==6)return 1+2.7*Math.pow(p-1,3)+1.7*Math.pow(p-1,2);' +
        'return p;}';

/**
 * كود قراءة التوقيت والـ Sync - مشترك بين كل الـ Expressions
 * الآن تستخدم ControllerManager.getTimingSyncCode() إذا كان متاحاً
 */
var TIMING_SYNC_CODE = (typeof getTimingSyncCode === "function") ? getTimingSyncCode() :
    'var inS=effect("Motion In Start")(1).value;' +
    'var inE=effect("Motion In End")(1).value;' +
    'var outS=effect("Motion Out Start")(1).value;' +
    'var outE=effect("Motion Out End")(1).value;' +
    'var syncMode=0;try{syncMode=effect("Motion Sync Mode")(1).value;}catch(e){}' +
    'if(syncMode==1&&thisLayer.marker.numKeys>0){' +
        'var m=thisLayer.marker;' +
        'for(var i=1;i<=m.numKeys;i++){' +
            'var c=m.key(i).comment,mt=m.key(i).time-inPoint;' +
            'if(c=="IN_START")inS=mt;' +
            'else if(c=="IN_END")inE=mt;' +
            'else if(c=="OUT_START")outS=mt;' +
            'else if(c=="OUT_END")outE=mt;' +
        '}' +
    '}' +
    'var eT=effect("Motion Easing Type")(1).value;' +
    'var t=time-inPoint;';

// Legacy presets for backward compatibility
var MOTION_PRESETS = [
    { name: "Fade In", duration: 1.0, position: { enabled: false }, scale: { enabled: false }, rotation: { enabled: false }, opacity: { enabled: true, from: 0, to: 100 }, easing: { type: 1, strength: 100 } },
    { name: "Slide Up", duration: 1.0, position: { enabled: true, fromX: 0, fromY: 50, toX: 0, toY: 0 }, scale: { enabled: false }, rotation: { enabled: false }, opacity: { enabled: true, from: 0, to: 100 }, easing: { type: 1, strength: 100 } },
    { name: "Slide Down", duration: 1.0, position: { enabled: true, fromX: 0, fromY: -50, toX: 0, toY: 0 }, scale: { enabled: false }, rotation: { enabled: false }, opacity: { enabled: true, from: 0, to: 100 }, easing: { type: 1, strength: 100 } },
    { name: "Slide Left", duration: 1.0, position: { enabled: true, fromX: 100, fromY: 0, toX: 0, toY: 0 }, scale: { enabled: false }, rotation: { enabled: false }, opacity: { enabled: true, from: 0, to: 100 }, easing: { type: 1, strength: 100 } },
    { name: "Slide Right", duration: 1.0, position: { enabled: true, fromX: -100, fromY: 0, toX: 0, toY: 0 }, scale: { enabled: false }, rotation: { enabled: false }, opacity: { enabled: true, from: 0, to: 100 }, easing: { type: 1, strength: 100 } },
    { name: "Pop", duration: 1.2, position: { enabled: false }, scale: { enabled: true, from: 0, to: 100 }, rotation: { enabled: false }, opacity: { enabled: true, from: 0, to: 100 }, easing: { type: 4, strength: 120 } },
    { name: "Zoom In", duration: 1.0, position: { enabled: false }, scale: { enabled: true, from: 50, to: 100 }, rotation: { enabled: false }, opacity: { enabled: true, from: 0, to: 100 }, easing: { type: 1, strength: 100 } },
    { name: "Spin In", duration: 1.5, position: { enabled: false }, scale: { enabled: true, from: 0, to: 100 }, rotation: { enabled: true, from: 360, to: 0 }, opacity: { enabled: true, from: 0, to: 100 }, easing: { type: 1, strength: 100 } },
    { name: "Drop", duration: 1.5, position: { enabled: true, fromX: 0, fromY: -100, toX: 0, toY: 0 }, scale: { enabled: false }, rotation: { enabled: false }, opacity: { enabled: false }, easing: { type: 4, strength: 150 } },
    { name: "Bounce In", duration: 1.8, position: { enabled: false }, scale: { enabled: true, from: 0, to: 100 }, rotation: { enabled: false }, opacity: { enabled: true, from: 0, to: 100 }, easing: { type: 5, strength: 120 } }
];

// ═══════════════════════════════════════════════════════════════════
// MOTION DETECTION
// ═══════════════════════════════════════════════════════════════════

function hasMotion(layer) {
    var fx = layer.property("ADBE Effect Parade");
    for (var i = 1; i <= fx.numProperties; i++) {
        if (fx.property(i).name === "Motion In Start") {
            return true;
        }
    }
    return false;
}

// ═══════════════════════════════════════════════════════════════════
// OPTIONS TO CONTROLLER NAMES MAPPING
// ═══════════════════════════════════════════════════════════════════

/**
 * تحويل opts من الـ UI إلى أسماء Controllers في JSON
 * @param {Object} opts - الخيارات من الـ UI
 * @returns {Object} - القيم بأسماء Controllers
 */
function _mapOptsToControllerNames(opts) {
    return {
        // Timing
        "Motion In Start": opts.inStart || 0,
        "Motion In End": opts.inEnd || 1,
        "Motion Out Start": opts.outStart !== undefined ? opts.outStart : -1,
        "Motion Out End": opts.outEnd !== undefined ? opts.outEnd : -1,
        "Motion Sync Mode": opts.syncMode || 0,
        
        // Position IN
        "Animate Position": opts.animatePosition || false,
        "Pos From X": opts.posFromX || 0,
        "Pos From Y": opts.posFromY || 0,
        "Pos To X": opts.posToX || 0,
        "Pos To Y": opts.posToY || 0,
        
        // Position OUT
        "Pos Link Mode": opts.posLinkMode || 0,
        "Pos Out From X": opts.posOutFromX || 0,
        "Pos Out From Y": opts.posOutFromY || 0,
        "Pos Out To X": opts.posOutToX || 0,
        "Pos Out To Y": opts.posOutToY || 0,
        
        // Scale IN
        "Animate Scale": opts.animateScale || false,
        "Scale From": opts.scaleFrom !== undefined ? opts.scaleFrom : 100,
        "Scale To": opts.scaleTo !== undefined ? opts.scaleTo : 100,
        
        // Scale OUT
        "Scale Link Mode": opts.scaleLinkMode || 0,
        "Scale Out From": opts.scaleOutFrom !== undefined ? opts.scaleOutFrom : 100,
        "Scale Out To": opts.scaleOutTo !== undefined ? opts.scaleOutTo : 100,
        
        // Rotation IN
        "Animate Rotation": opts.animateRotation || false,
        "Rot From": opts.rotFrom || 0,
        "Rot To": opts.rotTo || 0,
        
        // Rotation OUT
        "Rot Link Mode": opts.rotLinkMode || 0,
        "Rot Out From": opts.rotOutFrom || 0,
        "Rot Out To": opts.rotOutTo || 0,
        
        // Opacity IN
        "Animate Opacity": opts.animateOpacity || false,
        "Opacity From": opts.opacityFrom !== undefined ? opts.opacityFrom : 0,
        "Opacity To": opts.opacityTo !== undefined ? opts.opacityTo : 100,
        
        // Opacity OUT
        "Opacity Link Mode": opts.opacityLinkMode || 0,
        "Opacity Out From": opts.opacityOutFrom !== undefined ? opts.opacityOutFrom : 100,
        "Opacity Out To": opts.opacityOutTo !== undefined ? opts.opacityOutTo : 0,
        
        // Easing
        "Motion Easing Type": opts.easingType || 1,
        "Motion Easing Strength": opts.easingStrength || 100
    };
}

function _toFiniteNumber(value, fallback) {
    if (value === null || value === undefined || value === "") return fallback;
    var n = parseFloat(value);
    return isNaN(n) ? fallback : n;
}

// ═══════════════════════════════════════════════════════════════════
// APPLY MOTION
// ═══════════════════════════════════════════════════════════════════

function applyMotion(optsJSON) {
    var undoStarted = false;
    try {
        var opts = safeJSONParse(optsJSON, null);
        if (!opts) return error("Invalid options JSON");
        
        var comp = getActiveComp();
        if (!comp) return error("افتح Composition أولاً");
        
        var layer = getSelectedTextLayer(comp);
        if (!layer) return error("اختر طبقة نص");
        
        app.beginUndoGroup("TEXTORO - Motion");
        undoStarted = true;
        
        // إزالة Motion القديم إن وجد
        _removeMotion(layer);
        
        // تطبيق Motion الجديد
        _applyMotion(layer, opts);
        
        // تحديث اسم الطبقة
        _updateMotionFlag(layer, true);
        
        app.endUndoGroup();
        undoStarted = false;
        return success("تم تطبيق Motion!");
        
    } catch(e) {
        if (undoStarted) {
            try { app.endUndoGroup(); } catch(_e) {}
        }
        return error(e.toString());
    }
}

function _applyMotion(layer, opts) {
    var fx = layer.property("ADBE Effect Parade");
    var transform = layer.property("ADBE Transform Group");
    var motionInStart = _toFiniteNumber(opts.inStart, 0);
    var motionInEnd = _toFiniteNumber(opts.inEnd, 1);
    var motionOutStart = _toFiniteNumber(opts.outStart, -1);
    var motionOutEnd = _toFiniteNumber(opts.outEnd, -1);
    
    $.writeln("[TEXTORO] Creating motion controllers...");
    
    // ═══════════════════════════════════════════════════════════════
    // تحضير القيم للـ Controllers
    // ═══════════════════════════════════════════════════════════════
    var controllerValues = {
        // Timing
        "Motion In Start": motionInStart,
        "Motion In End": motionInEnd,
        "Motion Out Start": motionOutStart,
        "Motion Out End": motionOutEnd,
        "Motion Sync Mode": opts.syncMode || 0,
        
        // Position IN
        "Animate Position": opts.animatePosition || false,
        "Pos From X": opts.posFromX || 0,
        "Pos From Y": opts.posFromY || 0,
        "Pos To X": opts.posToX || 0,
        "Pos To Y": opts.posToY || 0,
        
        // Position OUT
        "Pos Link Mode": opts.posLinkMode || 0,
        "Pos Out From X": opts.posOutFromX || 0,
        "Pos Out From Y": opts.posOutFromY || 0,
        "Pos Out To X": opts.posOutToX || 0,
        "Pos Out To Y": opts.posOutToY || 0,
        
        // Scale IN
        "Animate Scale": opts.animateScale || false,
        "Scale From": opts.scaleFrom !== undefined ? opts.scaleFrom : 100,
        "Scale To": opts.scaleTo !== undefined ? opts.scaleTo : 100,
        
        // Scale OUT
        "Scale Link Mode": opts.scaleLinkMode || 0,
        "Scale Out From": opts.scaleOutFrom !== undefined ? opts.scaleOutFrom : 100,
        "Scale Out To": opts.scaleOutTo !== undefined ? opts.scaleOutTo : 100,
        
        // Rotation IN
        "Animate Rotation": opts.animateRotation || false,
        "Rot From": opts.rotFrom || 0,
        "Rot To": opts.rotTo || 0,
        
        // Rotation OUT
        "Rot Link Mode": opts.rotLinkMode || 0,
        "Rot Out From": opts.rotOutFrom || 0,
        "Rot Out To": opts.rotOutTo || 0,
        
        // Opacity IN
        "Animate Opacity": opts.animateOpacity || false,
        "Opacity From": opts.opacityFrom !== undefined ? opts.opacityFrom : 0,
        "Opacity To": opts.opacityTo !== undefined ? opts.opacityTo : 100,
        
        // Opacity OUT
        "Opacity Link Mode": opts.opacityLinkMode || 0,
        "Opacity Out From": opts.opacityOutFrom !== undefined ? opts.opacityOutFrom : 100,
        "Opacity Out To": opts.opacityOutTo !== undefined ? opts.opacityOutTo : 0,
        
        // Easing
        "Motion Easing Type": opts.easingType || 1,
        "Motion Easing Strength": opts.easingStrength || 100
    };
    
    // ═══════════════════════════════════════════════════════════════
    // محاولة استخدام ControllerManager مع Fallback ذكي
    // ═══════════════════════════════════════════════════════════════
    var useControllerManager = false;
    if (typeof createControllersFromRegistry === "function") {
        if (CONFIG.DEBUG) $.writeln("[TEXTORO] Attempting ControllerManager for motion...");
        useControllerManager = createControllersFromRegistry(layer, "motion", controllerValues);
        if (CONFIG.DEBUG) $.writeln("[TEXTORO] ControllerManager result: " + useControllerManager);
    }
    
    // Fallback إذا فشل ControllerManager
    if (!useControllerManager) {
        $.writeln("[TEXTORO] Using direct controller creation for motion (fallback)");
        
        // Timing
        addSlider(fx, "Motion In Start", controllerValues["Motion In Start"]);
        addSlider(fx, "Motion In End", controllerValues["Motion In End"]);
        addSlider(fx, "Motion Out Start", controllerValues["Motion Out Start"]);
        addSlider(fx, "Motion Out End", controllerValues["Motion Out End"]);
        addSlider(fx, "Motion Sync Mode", controllerValues["Motion Sync Mode"]);
        
        // Position IN
        addCheckbox(fx, "Animate Position", controllerValues["Animate Position"]);
        addSlider(fx, "Pos From X", controllerValues["Pos From X"]);
        addSlider(fx, "Pos From Y", controllerValues["Pos From Y"]);
        addSlider(fx, "Pos To X", controllerValues["Pos To X"]);
        addSlider(fx, "Pos To Y", controllerValues["Pos To Y"]);
        
        // Position OUT
        addSlider(fx, "Pos Link Mode", controllerValues["Pos Link Mode"]);
        addSlider(fx, "Pos Out From X", controllerValues["Pos Out From X"]);
        addSlider(fx, "Pos Out From Y", controllerValues["Pos Out From Y"]);
        addSlider(fx, "Pos Out To X", controllerValues["Pos Out To X"]);
        addSlider(fx, "Pos Out To Y", controllerValues["Pos Out To Y"]);
        
        // Scale IN
        addCheckbox(fx, "Animate Scale", controllerValues["Animate Scale"]);
        addSlider(fx, "Scale From", controllerValues["Scale From"]);
        addSlider(fx, "Scale To", controllerValues["Scale To"]);
        
        // Scale OUT
        addSlider(fx, "Scale Link Mode", controllerValues["Scale Link Mode"]);
        addSlider(fx, "Scale Out From", controllerValues["Scale Out From"]);
        addSlider(fx, "Scale Out To", controllerValues["Scale Out To"]);
        
        // Rotation IN
        addCheckbox(fx, "Animate Rotation", controllerValues["Animate Rotation"]);
        addSlider(fx, "Rot From", controllerValues["Rot From"]);
        addSlider(fx, "Rot To", controllerValues["Rot To"]);
        
        // Rotation OUT
        addSlider(fx, "Rot Link Mode", controllerValues["Rot Link Mode"]);
        addSlider(fx, "Rot Out From", controllerValues["Rot Out From"]);
        addSlider(fx, "Rot Out To", controllerValues["Rot Out To"]);
        
        // Opacity IN
        addCheckbox(fx, "Animate Opacity", controllerValues["Animate Opacity"]);
        addSlider(fx, "Opacity From", controllerValues["Opacity From"]);
        addSlider(fx, "Opacity To", controllerValues["Opacity To"]);
        
        // Opacity OUT
        addSlider(fx, "Opacity Link Mode", controllerValues["Opacity Link Mode"]);
        addSlider(fx, "Opacity Out From", controllerValues["Opacity Out From"]);
        addSlider(fx, "Opacity Out To", controllerValues["Opacity Out To"]);
        
        // Easing
        addSlider(fx, "Motion Easing Type", controllerValues["Motion Easing Type"]);
        addSlider(fx, "Motion Easing Strength", controllerValues["Motion Easing Strength"]);
    }
    
    $.writeln("[TEXTORO] Motion controllers created successfully");
    
    // Apply Expressions with OUT support
    transform.property("ADBE Position").expression = _getMotionPositionExprV2();
    transform.property("ADBE Scale").expression = _getMotionScaleExprV2();
    transform.property("ADBE Rotate Z").expression = _getMotionRotationExprV2();
    transform.property("ADBE Opacity").expression = _getMotionOpacityExprV2();
}

// ═══════════════════════════════════════════════════════════════════
// REMOVE MOTION
// ═══════════════════════════════════════════════════════════════════

function removeMotion() {
    var undoStarted = false;
    try {
        var comp = getActiveComp();
        if (!comp) return error("افتح Composition أولاً");
        
        var layer = getSelectedTextLayer(comp);
        if (!layer) return error("اختر طبقة نص");
        
        app.beginUndoGroup("TEXTORO - Remove Motion");
        undoStarted = true;
        
        _removeMotion(layer);
        _updateMotionFlag(layer, false);
        
        app.endUndoGroup();
        undoStarted = false;
        return success("تم إزالة Motion!");
        
    } catch(e) {
        if (undoStarted) {
            try { app.endUndoGroup(); } catch(_e) {}
        }
        return error(e.toString());
    }
}

function _removeMotion(layer) {
    var fx = layer.property("ADBE Effect Parade");
    var transform = layer.property("ADBE Transform Group");
    
    // ═══════════════════════════════════════════════════════════════
    // إزالة Controllers - استخدام ControllerManager مع Fallback
    // ═══════════════════════════════════════════════════════════════
    var removed = false;
    if (typeof removeControllersFromRegistry === "function") {
        if (CONFIG.DEBUG) $.writeln("[TEXTORO] Attempting ControllerManager to remove motion controllers...");
        removed = removeControllersFromRegistry(layer, "motion");
    }
    
    // Fallback: إزالة مباشرة
    if (!removed) {
        $.writeln("[TEXTORO] Using direct controller removal for motion (fallback)");
        var motionControls = [
            "Motion In Start", "Motion In End", "Motion Out Start", "Motion Out End",
            "Motion Sync Mode",
            "Animate Position", "Pos From X", "Pos From Y", "Pos To X", "Pos To Y",
            "Pos Link Mode", "Pos Out From X", "Pos Out From Y", "Pos Out To X", "Pos Out To Y",
            "Animate Scale", "Scale From", "Scale To",
            "Scale Link Mode", "Scale Out From", "Scale Out To",
            "Animate Rotation", "Rot From", "Rot To",
            "Rot Link Mode", "Rot Out From", "Rot Out To",
            "Animate Opacity", "Opacity From", "Opacity To",
            "Opacity Link Mode", "Opacity Out From", "Opacity Out To",
            "Motion Easing Type", "Motion Easing Strength"
        ];
        
        for (var i = fx.numProperties; i >= 1; i--) {
            var prop = fx.property(i);
            for (var j = 0; j < motionControls.length; j++) {
                if (prop.name === motionControls[j]) {
                    prop.remove();
                    break;
                }
            }
        }
    }
    
    // إزالة Expressions
    try { transform.property("ADBE Position").expression = ""; } catch(e) { $.writeln("[TEXTORO] Warning: Could not clear Position expression"); }
    try { transform.property("ADBE Scale").expression = ""; } catch(e) { $.writeln("[TEXTORO] Warning: Could not clear Scale expression"); }
    try { transform.property("ADBE Rotate Z").expression = ""; } catch(e) { $.writeln("[TEXTORO] Warning: Could not clear Rotation expression"); }
    try { transform.property("ADBE Opacity").expression = ""; } catch(e) { $.writeln("[TEXTORO] Warning: Could not clear Opacity expression"); }
}

// ═══════════════════════════════════════════════════════════════════
// LAYER FLAG
// ═══════════════════════════════════════════════════════════════════

function _updateMotionFlag(layer, addFlag) {
    var name = layer.name;
    
    // التحقق من وجود M بشكل صحيح باستخدام regex دقيق
    // الأنماط الممكنة: _TBM, _TM, _BM, _M (في النهاية) أو TBM_, TM_, BM_, M_ (في البداية)
    var hasMotionFlag = false;
    
    // تحقق من النهاية
    if (/_TBM$/.test(name) || /_TM$/.test(name) || /_BM$/.test(name) || /_M$/.test(name)) {
        hasMotionFlag = true;
    }
    // تحقق من البداية
    if (/^TBM_/.test(name) || /^TM_/.test(name) || /^BM_/.test(name) || /^M_/.test(name)) {
        hasMotionFlag = true;
    }
    
    $.writeln("[TEXTORO] _updateMotionFlag: name=" + name + ", addFlag=" + addFlag + ", hasMotionFlag=" + hasMotionFlag);
    
    if (addFlag) {
        // لا تضف M إذا كان موجوداً بالفعل
        if (hasMotionFlag) {
            $.writeln("[TEXTORO] Motion flag already exists, skipping");
            return;
        }
        
        // إضافة M بالترتيب الصحيح - استخدام regex للنهاية فقط
        if (/_TB$/.test(name)) {
            layer.name = name.replace(/_TB$/, "_TBM");
        } else if (/^TB_/.test(name)) {
            layer.name = name.replace(/^TB_/, "TBM_");
        } else if (/_T$/.test(name)) {
            layer.name = name.replace(/_T$/, "_TM");
        } else if (/^T_/.test(name)) {
            layer.name = name.replace(/^T_/, "TM_");
        } else if (/_B$/.test(name)) {
            layer.name = name.replace(/_B$/, "_BM");
        } else if (/^B_/.test(name)) {
            layer.name = name.replace(/^B_/, "BM_");
        } else {
            layer.name = name + "_M";
        }
        $.writeln("[TEXTORO] Added motion flag: " + layer.name);
    } else {
        // إزالة M فقط إذا كان موجوداً
        if (!hasMotionFlag) {
            $.writeln("[TEXTORO] No motion flag to remove");
            return;
        }
        
        // إزالة M من النهاية أو البداية
        var newName = name
            .replace(/_TBM$/, "_TB")
            .replace(/^TBM_/, "TB_")
            .replace(/_TM$/, "_T")
            .replace(/^TM_/, "T_")
            .replace(/_BM$/, "_B")
            .replace(/^BM_/, "B_")
            .replace(/_M$/, "")
            .replace(/^M_/, "");
        
        layer.name = newName;
        $.writeln("[TEXTORO] Removed motion flag: " + layer.name);
    }
}

// ═══════════════════════════════════════════════════════════════════
// EXPRESSIONS V1 - LEGACY (kept for backward compatibility)
// Using shared EASE_VAL_CODE and TIMING_SYNC_CODE constants
// ═══════════════════════════════════════════════════════════════════

function _getMotionPositionExpr() {
    return 'var anim=0;try{anim=effect("Animate Position")(1);}catch(e){}' +
        'if(anim==0){value;}else{' +
        EASE_VAL_CODE +
        TIMING_SYNC_CODE +
        'var fX=effect("Pos From X")(1).value;' +
        'var fY=effect("Pos From Y")(1).value;' +
        'var tX=effect("Pos To X")(1).value;' +
        'var tY=effect("Pos To Y")(1).value;' +
        'var oX=tX,oY=tY;' +
        'if(t<inS){oX=fX;oY=fY;}' +
        'else if(t<=inE){' +
            'var d=inE-inS;if(d<=0)d=0.5;' +
            'var p=(t-inS)/d;p=easeVal(p,eT);' +
            'oX=fX+(tX-fX)*p;oY=fY+(tY-fY)*p;' +
        '}' +
        'else if(outS>=0&&t>=outS&&t<=outE){' +
            'var d=outE-outS;if(d<=0)d=0.5;' +
            'var p=(t-outS)/d;p=easeVal(p,eT);' +
            'oX=tX+(fX-tX)*p;oY=tY+(fY-tY)*p;' +
        '}' +
        'else if(outS>=0&&t>outE){oX=fX;oY=fY;}' +
        'value+[oX,oY];}';
}

function _getMotionScaleExpr() {
    return 'var anim=0;try{anim=effect("Animate Scale")(1);}catch(e){}' +
        'if(anim==0){value;}else{' +
        EASE_VAL_CODE +
        TIMING_SYNC_CODE +
        'var sF=effect("Scale From")(1).value;' +
        'var sT=effect("Scale To")(1).value;' +
        'var sv=sT;' +
        'if(t<inS){sv=sF;}' +
        'else if(t<=inE){var d=inE-inS;if(d<=0)d=0.5;var p=(t-inS)/d;p=easeVal(p,eT);sv=sF+(sT-sF)*p;}' +
        'else if(outS>=0&&t>=outS&&t<=outE){var d=outE-outS;if(d<=0)d=0.5;var p=(t-outS)/d;p=easeVal(p,eT);sv=sT+(sF-sT)*p;}' +
        'else if(outS>=0&&t>outE){sv=sF;}' +
        'value*(sv/100);}';
}

function _getMotionRotationExpr() {
    return 'var anim=0;try{anim=effect("Animate Rotation")(1);}catch(e){}' +
        'if(anim==0){value;}else{' +
        EASE_VAL_CODE +
        TIMING_SYNC_CODE +
        'var rF=effect("Rot From")(1).value;' +
        'var rT=effect("Rot To")(1).value;' +
        'var rv=rT;' +
        'if(t<inS){rv=rF;}' +
        'else if(t<=inE){var d=inE-inS;if(d<=0)d=0.5;var p=(t-inS)/d;p=easeVal(p,eT);rv=rF+(rT-rF)*p;}' +
        'else if(outS>=0&&t>=outS&&t<=outE){var d=outE-outS;if(d<=0)d=0.5;var p=(t-outS)/d;p=easeVal(p,eT);rv=rT+(rF-rT)*p;}' +
        'else if(outS>=0&&t>outE){rv=rF;}' +
        'value+rv;}';
}

function _getMotionOpacityExpr() {
    return 'var anim=0;try{anim=effect("Animate Opacity")(1);}catch(e){}' +
        'if(anim==0){value;}else{' +
        EASE_VAL_CODE +
        TIMING_SYNC_CODE +
        'var oF=effect("Opacity From")(1).value;' +
        'var oT=effect("Opacity To")(1).value;' +
        'var ov=oT;' +
        'if(t<inS){ov=oF;}' +
        'else if(t<=inE){var d=inE-inS;if(d<=0)d=0.5;var p=(t-inS)/d;p=easeVal(p,eT);ov=oF+(oT-oF)*p;}' +
        'else if(outS>=0&&t>=outS&&t<=outE){var d=outE-outS;if(d<=0)d=0.5;var p=(t-outS)/d;p=easeVal(p,eT);ov=oT+(oF-oT)*p;}' +
        'else if(outS>=0&&t>outE){ov=oF;}' +
        'ov;}';
}

// ═══════════════════════════════════════════════════════════════════
// EXPRESSIONS V2 - WITH INDEPENDENT OUT VALUES
// Using shared EASE_VAL_CODE and TIMING_SYNC_CODE constants
// ═══════════════════════════════════════════════════════════════════

function _getMotionPositionExprV2() {
    return 'var anim=0;try{anim=effect("Animate Position")(1);}catch(e){}' +
        'if(anim==0){value;}else{' +
        EASE_VAL_CODE +
        TIMING_SYNC_CODE +
        'var fX=effect("Pos From X")(1).value;' +
        'var fY=effect("Pos From Y")(1).value;' +
        'var tX=effect("Pos To X")(1).value;' +
        'var tY=effect("Pos To Y")(1).value;' +
        'var linkMode=0;try{linkMode=effect("Pos Link Mode")(1).value;}catch(e){}' +
        'var outFX=linkMode==0?tX:effect("Pos Out From X")(1).value;' +
        'var outFY=linkMode==0?tY:effect("Pos Out From Y")(1).value;' +
        'var outTX=linkMode==0?fX:effect("Pos Out To X")(1).value;' +
        'var outTY=linkMode==0?fY:effect("Pos Out To Y")(1).value;' +
        'var oX=tX,oY=tY;' +
        'if(t<inS){oX=fX;oY=fY;}' +
        'else if(t<=inE){' +
            'var d=inE-inS;if(d<=0)d=0.5;' +
            'var p=(t-inS)/d;p=easeVal(p,eT);' +
            'oX=fX+(tX-fX)*p;oY=fY+(tY-fY)*p;' +
        '}' +
        'else if(outS>=0&&t>=outS&&t<=outE){' +
            'var d=outE-outS;if(d<=0)d=0.5;' +
            'var p=(t-outS)/d;p=easeVal(p,eT);' +
            'oX=outFX+(outTX-outFX)*p;oY=outFY+(outTY-outFY)*p;' +
        '}' +
        'else if(outS>=0&&t>outE){oX=outTX;oY=outTY;}' +
        'value+[oX,oY];}';
}

function _getMotionScaleExprV2() {
    return 'var anim=0;try{anim=effect("Animate Scale")(1);}catch(e){}' +
        'if(anim==0){value;}else{' +
        EASE_VAL_CODE +
        TIMING_SYNC_CODE +
        'var sF=effect("Scale From")(1).value;' +
        'var sT=effect("Scale To")(1).value;' +
        'var linkMode=0;try{linkMode=effect("Scale Link Mode")(1).value;}catch(e){}' +
        'var outF=linkMode==0?sT:effect("Scale Out From")(1).value;' +
        'var outT=linkMode==0?sF:effect("Scale Out To")(1).value;' +
        'var sv=sT;' +
        'if(t<inS){sv=sF;}' +
        'else if(t<=inE){var d=inE-inS;if(d<=0)d=0.5;var p=(t-inS)/d;p=easeVal(p,eT);sv=sF+(sT-sF)*p;}' +
        'else if(outS>=0&&t>=outS&&t<=outE){var d=outE-outS;if(d<=0)d=0.5;var p=(t-outS)/d;p=easeVal(p,eT);sv=outF+(outT-outF)*p;}' +
        'else if(outS>=0&&t>outE){sv=outT;}' +
        'value*(sv/100);}';
}

function _getMotionRotationExprV2() {
    return 'var anim=0;try{anim=effect("Animate Rotation")(1);}catch(e){}' +
        'if(anim==0){value;}else{' +
        EASE_VAL_CODE +
        TIMING_SYNC_CODE +
        'var rF=effect("Rot From")(1).value;' +
        'var rT=effect("Rot To")(1).value;' +
        'var linkMode=0;try{linkMode=effect("Rot Link Mode")(1).value;}catch(e){}' +
        'var outF=linkMode==0?rT:effect("Rot Out From")(1).value;' +
        'var outT=linkMode==0?rF:effect("Rot Out To")(1).value;' +
        'var rv=rT;' +
        'if(t<inS){rv=rF;}' +
        'else if(t<=inE){var d=inE-inS;if(d<=0)d=0.5;var p=(t-inS)/d;p=easeVal(p,eT);rv=rF+(rT-rF)*p;}' +
        'else if(outS>=0&&t>=outS&&t<=outE){var d=outE-outS;if(d<=0)d=0.5;var p=(t-outS)/d;p=easeVal(p,eT);rv=outF+(outT-outF)*p;}' +
        'else if(outS>=0&&t>outE){rv=outT;}' +
        'value+rv;}';
}

function _getMotionOpacityExprV2() {
    return 'var anim=0;try{anim=effect("Animate Opacity")(1);}catch(e){}' +
        'if(anim==0){value;}else{' +
        EASE_VAL_CODE +
        TIMING_SYNC_CODE +
        'var oF=effect("Opacity From")(1).value;' +
        'var oT=effect("Opacity To")(1).value;' +
        'var linkMode=0;try{linkMode=effect("Opacity Link Mode")(1).value;}catch(e){}' +
        'var outF=linkMode==0?oT:effect("Opacity Out From")(1).value;' +
        'var outT=linkMode==0?oF:effect("Opacity Out To")(1).value;' +
        'var ov=oT;' +
        'if(t<inS){ov=oF;}' +
        'else if(t<=inE){var d=inE-inS;if(d<=0)d=0.5;var p=(t-inS)/d;p=easeVal(p,eT);ov=oF+(oT-oF)*p;}' +
        'else if(outS>=0&&t>=outS&&t<=outE){var d=outE-outS;if(d<=0)d=0.5;var p=(t-outS)/d;p=easeVal(p,eT);ov=outF+(outT-outF)*p;}' +
        'else if(outS>=0&&t>outE){ov=outT;}' +
        'ov;}';
}

// ═══════════════════════════════════════════════════════════════════
// PRESETS
// ═══════════════════════════════════════════════════════════════════

/**
 * قراءة توقيت الحركة من markers الطبقة المحددة
 * يبحث عن: IN_START, IN_END, OUT_START, OUT_END
 * ترجع قيمًا نسبية للطبقة (keyTime - inPoint)
 */
function _getMarkerTiming() {
    try {
        var comp = getActiveComp();
        if (!comp) return null;
        
        var layer = comp.selectedLayers[0];
        if (!layer) return null;
        
        var markers = layer.property("Marker");
        if (!markers || markers.numKeys === 0) return null;
        
        var timing = {
            inStart: null,
            inEnd: null,
            outStart: null,
            outEnd: null
        };
        
        // البحث في جميع الـ markers
        for (var i = 1; i <= markers.numKeys; i++) {
            var markerValue = markers.keyValue(i);
            var markerTime = markers.keyTime(i) - layer.inPoint;
            var comment = markerValue.comment || "";
            
            // F-M2: مطابقة صارمة بالتساوي - تعليق مثل "OUT_START_old" لن يطابق بعد الآن
            if (comment === "IN_START") {
                timing.inStart = markerTime;
            } else if (comment === "IN_END") {
                timing.inEnd = markerTime;
            } else if (comment === "OUT_START") {
                timing.outStart = markerTime;
            } else if (comment === "OUT_END") {
                timing.outEnd = markerTime;
            }
        }
        
        // التحقق من وجود IN على الأقل
        if (timing.inStart === null || timing.inEnd === null) {
            return null;
        }
        
        return timing;
        
    } catch(e) {
        $.writeln("[TEXTORO] _getMarkerTiming error: " + e.toString());
        return null;
    }
}

function applyMotionPreset(optsJSON) {
    try {
        var opts = safeJSONParse(optsJSON, null);
        if (!opts) return error("Invalid options JSON");
        
        var preset = null;
        var mode = opts.mode || 'both'; // 'in', 'out', or 'both'
        var category = opts.category || 'motion'; // 'motion' or 'motion-full'
        var syncWithMarkers = opts.syncWithMarkers || false;
        
        // Check if using JSON preset (by fileName)
        if (opts.fileName) {
            // البحث في الفئة المحددة
            var result = safeJSONParse(loadPresets(JSON.stringify({ category: category })), null);
            if (result.success && result.data && result.data.presets) {
                for (var i = 0; i < result.data.presets.length; i++) {
                    if (result.data.presets[i].fileName === opts.fileName) {
                        preset = result.data.presets[i];
                        break;
                    }
                }
            }
            
            // إذا لم نجد في motion-full، نبحث في motion
            if (!preset && category === 'motion-full') {
                result = safeJSONParse(loadPresets(JSON.stringify({ category: 'motion' })), null);
                if (result.success && result.data && result.data.presets) {
                    for (var j = 0; j < result.data.presets.length; j++) {
                        if (result.data.presets[j].fileName === opts.fileName) {
                            preset = result.data.presets[j];
                            break;
                        }
                    }
                }
            }
        } else if (opts.presetIndex !== undefined) {
            // Legacy: use index from MOTION_PRESETS array
            var presetIndex = opts.presetIndex || 0;
            if (presetIndex >= 0 && presetIndex < MOTION_PRESETS.length) {
                preset = MOTION_PRESETS[presetIndex];
            }
        }
        
        if (!preset) return error("Preset غير موجود");
        
        var v = preset.values || preset;
        
        // إذا كان syncWithMarkers مفعل، نقرأ التوقيت من markers الطبقة
        var markerTiming = null;
        if (syncWithMarkers) {
            markerTiming = _getMarkerTiming();
            if (!markerTiming) {
                return error("لم يتم العثور على markers. تأكد من وجود IN_START, IN_END, OUT_START, OUT_END");
            }
        }
        
        // بناء الخيارات حسب الـ mode
        var motionOpts = {
            easingType: v.easingType || (v.easing && v.easing.type) || 1,
            easingStrength: v.easingStrength || (v.easing && v.easing.strength) || 100
        };
        
        // IN Animation
        if (mode === 'in' || mode === 'both') {
            // استخدام توقيت markers إذا كان متاحاً
            if (markerTiming) {
                motionOpts.inStart = markerTiming.inStart;
                motionOpts.inEnd = markerTiming.inEnd;
            } else {
                motionOpts.inStart = v.inStart || 0;
                motionOpts.inEnd = v.inEnd || v.duration || 1.0;
            }
            motionOpts.animatePosition = v.animatePosition || (v.position && v.position.enabled) || false;
            motionOpts.posFromX = v.posFromX || (v.position && v.position.fromX) || 0;
            motionOpts.posFromY = v.posFromY || (v.position && v.position.fromY) || 0;
            motionOpts.posToX = v.posToX || (v.position && v.position.toX) || 0;
            motionOpts.posToY = v.posToY || (v.position && v.position.toY) || 0;
            motionOpts.animateScale = v.animateScale || (v.scale && v.scale.enabled) || false;
            motionOpts.scaleFrom = v.scaleFrom || (v.scale && v.scale.from) || 100;
            motionOpts.scaleTo = v.scaleTo || (v.scale && v.scale.to) || 100;
            motionOpts.animateRotation = v.animateRotation || (v.rotation && v.rotation.enabled) || false;
            motionOpts.rotFrom = v.rotFrom || (v.rotation && v.rotation.from) || 0;
            motionOpts.rotTo = v.rotTo || (v.rotation && v.rotation.to) || 0;
            motionOpts.animateOpacity = v.animateOpacity || (v.opacity && v.opacity.enabled) || false;
            motionOpts.opacityFrom = v.opacityFrom !== undefined ? v.opacityFrom : (v.opacity && v.opacity.from !== undefined ? v.opacity.from : 100);
            motionOpts.opacityTo = v.opacityTo !== undefined ? v.opacityTo : (v.opacity && v.opacity.to !== undefined ? v.opacity.to : 100);
        } else {
            // OUT only - no IN animation
            motionOpts.inStart = 0;
            motionOpts.inEnd = 0;
            motionOpts.animatePosition = false;
            motionOpts.animateScale = false;
            motionOpts.animateRotation = false;
            motionOpts.animateOpacity = false;
        }
        
        // OUT Animation
        if (mode === 'out' || mode === 'both') {
            // استخدام توقيت markers إذا كان متاحاً
            if (markerTiming && markerTiming.outStart !== null && markerTiming.outEnd !== null) {
                motionOpts.outStart = markerTiming.outStart;
                motionOpts.outEnd = markerTiming.outEnd;
            } else if (syncWithMarkers) {
                // F-M3: لا هبوط صامت لتوقيت افتراضي - رسالة تشرح السبب والحل
                return error("Sync with Markers مطلوب لكن OUT markers غير موجودة على الطبقة. فعّل OUT animation في تبويب Type أو أوقف خيار Sync With Markers.");
            } else {
                motionOpts.outStart = v.outStart || 4.0;
                motionOpts.outEnd = v.outEnd || 5.0;
            }
            
            // للـ OUT mode، نستخدم قيم IN كـ OUT (عكسها)
            if (mode === 'out') {
                motionOpts.animatePosition = v.animatePosition || false;
                motionOpts.animateScale = v.animateScale || false;
                motionOpts.animateRotation = v.animateRotation || false;
                motionOpts.animateOpacity = v.animateOpacity || false;
                
                // Position: OUT يبدأ من To وينتهي عند From
                motionOpts.posLinkMode = 1; // Unlinked
                motionOpts.posOutFromX = v.posToX || 0;
                motionOpts.posOutFromY = v.posToY || 0;
                motionOpts.posOutToX = v.posFromX || 0;
                motionOpts.posOutToY = v.posFromY || 0;
                
                // Scale: OUT يبدأ من To وينتهي عند From
                motionOpts.scaleLinkMode = 1;
                motionOpts.scaleOutFrom = v.scaleTo || 100;
                motionOpts.scaleOutTo = v.scaleFrom || 100;
                
                // Rotation: OUT يبدأ من To وينتهي عند From
                motionOpts.rotLinkMode = 1;
                motionOpts.rotOutFrom = v.rotTo || 0;
                motionOpts.rotOutTo = v.rotFrom || 0;
                
                // Opacity: OUT يبدأ من To وينتهي عند From
                motionOpts.opacityLinkMode = 1;
                motionOpts.opacityOutFrom = v.opacityTo !== undefined ? v.opacityTo : 100;
                motionOpts.opacityOutTo = v.opacityFrom !== undefined ? v.opacityFrom : 0;
            } else {
                // BOTH mode - استخدم قيم OUT من الملف إن وجدت
                if (v.posOutFromX !== undefined || v.posOutToX !== undefined) {
                    motionOpts.posLinkMode = 1;
                    motionOpts.posOutFromX = v.posOutFromX !== undefined ? v.posOutFromX : v.posToX || 0;
                    motionOpts.posOutFromY = v.posOutFromY !== undefined ? v.posOutFromY : v.posToY || 0;
                    motionOpts.posOutToX = v.posOutToX !== undefined ? v.posOutToX : v.posFromX || 0;
                    motionOpts.posOutToY = v.posOutToY !== undefined ? v.posOutToY : v.posFromY || 0;
                }
                if (v.scaleOutFrom !== undefined || v.scaleOutTo !== undefined) {
                    motionOpts.scaleLinkMode = 1;
                    motionOpts.scaleOutFrom = v.scaleOutFrom !== undefined ? v.scaleOutFrom : v.scaleTo || 100;
                    motionOpts.scaleOutTo = v.scaleOutTo !== undefined ? v.scaleOutTo : v.scaleFrom || 100;
                }
                if (v.rotOutFrom !== undefined || v.rotOutTo !== undefined) {
                    motionOpts.rotLinkMode = 1;
                    motionOpts.rotOutFrom = v.rotOutFrom !== undefined ? v.rotOutFrom : v.rotTo || 0;
                    motionOpts.rotOutTo = v.rotOutTo !== undefined ? v.rotOutTo : v.rotFrom || 0;
                }
                if (v.opacityOutFrom !== undefined || v.opacityOutTo !== undefined) {
                    motionOpts.opacityLinkMode = 1;
                    motionOpts.opacityOutFrom = v.opacityOutFrom !== undefined ? v.opacityOutFrom : v.opacityTo || 100;
                    motionOpts.opacityOutTo = v.opacityOutTo !== undefined ? v.opacityOutTo : v.opacityFrom || 0;
                }
            }
        } else {
            // IN only - no OUT animation
            motionOpts.outStart = -1;
            motionOpts.outEnd = -1;
        }
        
        return applyMotion(JSON.stringify(motionOpts));
        
    } catch(e) {
        return error(e.toString());
    }
}

function getMotionPresets() {
    try {
        var presets = [];
        
        var result = safeJSONParse(loadPresets(JSON.stringify({ category: 'motion' })), null);
        if (result.success && result.data && result.data.presets && result.data.presets.length > 0) {
            for (var i = 0; i < result.data.presets.length; i++) {
                var p = result.data.presets[i];
                presets.push({
                    name: p.name,
                    icon: p.icon || "🎬",
                    fileName: p.fileName,
                    source: p.source || "builtin",
                    hasValues: !!p.values
                });
            }
        }
        
        if (presets.length === 0) {
            for (var j = 0; j < MOTION_PRESETS.length; j++) {
                presets.push({
                    index: j,
                    name: MOTION_PRESETS[j].name,
                    source: "legacy"
                });
            }
        }
        
        return success("", presets);
        
    } catch(e) {
        return error(e.toString());
    }
}

// ═══════════════════════════════════════════════════════════════════
// MULTI-LAYER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

// NOTE: getSelectedTextLayers() is defined in Utilities.jsx (Single Source of Truth)
// All modules should use the shared function from Utilities.jsx

/**
 * الحصول على عدد طبقات النص المحددة
 */
function getMotionSelectionCount() {
    try {
        var comp = getActiveComp();
        if (!comp) return success("", { count: 0 });
        
        var layers = getSelectedTextLayers(comp);
        return success("", { count: layers.length });
    } catch(e) {
        return error(e.toString());
    }
}

/**
 * تطبيق Motion على طبقات متعددة مع Stagger
 */
function applyMotionMulti(optsJSON) {
    var undoStarted = false;
    try {
        var opts = safeJSONParse(optsJSON, null);
        if (!opts) return error("Invalid options JSON");
        
        var comp = getActiveComp();
        if (!comp) return error("افتح Composition أولاً");
        
        var layers = getSelectedTextLayers(comp);
        if (layers.length === 0) return error("اختر طبقات نص");
        
        var stagger = _toFiniteNumber(opts.stagger, 0);
        var baseInStart = _toFiniteNumber(opts.inStart, 0);
        var baseInEnd = _toFiniteNumber(opts.inEnd, 1);
        var baseOutStart = _toFiniteNumber(opts.outStart, -1);
        var baseOutEnd = _toFiniteNumber(opts.outEnd, -1);
        
        app.beginUndoGroup("TEXTORO - Motion Multi");
        undoStarted = true;
        
        for (var i = 0; i < layers.length; i++) {
            var layerOpts = {};
            // نسخ الخيارات
            for (var key in opts) {
                if (key !== 'stagger') layerOpts[key] = opts[key];
            }
            // تطبيق Stagger
            layerOpts.inStart = baseInStart + (i * stagger);
            layerOpts.inEnd = baseInEnd + (i * stagger);
            if (baseOutStart >= 0) {
                layerOpts.outStart = baseOutStart + (i * stagger);
                layerOpts.outEnd = baseOutEnd + (i * stagger);
            }
            
            _removeMotion(layers[i]);
            _applyMotion(layers[i], layerOpts);
            _updateMotionFlag(layers[i], true);
        }
        
        app.endUndoGroup();
        undoStarted = false;
        return success("تم تطبيق Motion على " + layers.length + " طبقات!");
        
    } catch(e) {
        if (undoStarted) {
            try { app.endUndoGroup(); } catch(_e) {}
        }
        return error(e.toString());
    }
}

/**
 * تطبيق preset حركة على طبقات متعددة مع Stagger
 */
function applyMotionPresetMulti(optsJSON) {
    var undoStarted = false;
    try {
        var opts = safeJSONParse(optsJSON, null);
        if (!opts) return error("Invalid options JSON");
        
        var preset = null;
        
        // Check if using JSON preset (by fileName)
        if (opts.fileName) {
            var result = safeJSONParse(loadPresets(JSON.stringify({ category: 'motion' })), null);
            if (result.success && result.data && result.data.presets) {
                for (var i = 0; i < result.data.presets.length; i++) {
                    if (result.data.presets[i].fileName === opts.fileName) {
                        preset = result.data.presets[i];
                        break;
                    }
                }
            }
        } else if (opts.presetIndex !== undefined) {
            // Legacy: use index from MOTION_PRESETS array
            var presetIndex = opts.presetIndex || 0;
            if (presetIndex >= 0 && presetIndex < MOTION_PRESETS.length) {
                preset = MOTION_PRESETS[presetIndex];
            }
        }
        
        if (!preset) return error("Preset غير موجود");
        
        var v = preset.values || preset;
        var comp = getActiveComp();
        if (!comp) return error("افتح Composition أولاً");
        
        var layers = getSelectedTextLayers(comp);
        if (layers.length === 0) return error("اختر طبقات نص");
        
        var stagger = _toFiniteNumber(opts.stagger, 0);
        var inStart = (opts.inStart !== undefined) ? _toFiniteNumber(opts.inStart, 0) : _toFiniteNumber(v.inStart, 0);
        var inEnd = (opts.inEnd !== undefined) ? _toFiniteNumber(opts.inEnd, 1) : _toFiniteNumber(v.inEnd, _toFiniteNumber(v.duration, 1));
        var outStart = (opts.outStart !== undefined) ? _toFiniteNumber(opts.outStart, -1) : _toFiniteNumber(v.outStart, -1);
        var outEnd = (opts.outEnd !== undefined) ? _toFiniteNumber(opts.outEnd, -1) : _toFiniteNumber(v.outEnd, -1);
        var easingType = (opts.easingType !== undefined) ? opts.easingType : (v.easingType || (v.easing && v.easing.type) || 1);
        var easingStrength = (opts.easingStrength !== undefined) ? opts.easingStrength : (v.easingStrength || (v.easing && v.easing.strength) || 100);
        
        // Extract values from preset
        var posFromX = _toFiniteNumber(v.posFromX, (v.position && v.position.fromX !== undefined) ? v.position.fromX : 0);
        var posFromY = _toFiniteNumber(v.posFromY, (v.position && v.position.fromY !== undefined) ? v.position.fromY : 0);
        var posToX = _toFiniteNumber(v.posToX, (v.position && v.position.toX !== undefined) ? v.position.toX : 0);
        var posToY = _toFiniteNumber(v.posToY, (v.position && v.position.toY !== undefined) ? v.position.toY : 0);
        var scaleFrom = _toFiniteNumber(v.scaleFrom, (v.scale && v.scale.from !== undefined) ? v.scale.from : 100);
        var scaleTo = _toFiniteNumber(v.scaleTo, (v.scale && v.scale.to !== undefined) ? v.scale.to : 100);
        var rotFrom = _toFiniteNumber(v.rotFrom, (v.rotation && v.rotation.from !== undefined) ? v.rotation.from : 0);
        var rotTo = _toFiniteNumber(v.rotTo, (v.rotation && v.rotation.to !== undefined) ? v.rotation.to : 0);
        var opacityFrom = v.opacityFrom !== undefined ? v.opacityFrom : (v.opacity && v.opacity.from !== undefined ? v.opacity.from : 0);
        var opacityTo = v.opacityTo !== undefined ? v.opacityTo : (v.opacity && v.opacity.to !== undefined ? v.opacity.to : 100);
        
        app.beginUndoGroup("TEXTORO - Motion Preset Multi");
        undoStarted = true;
        
        for (var i = 0; i < layers.length; i++) {
            var motionOpts = {
                inStart: inStart + (i * stagger),
                inEnd: inEnd + (i * stagger),
                outStart: outStart >= 0 ? outStart + (i * stagger) : -1,
                outEnd: outEnd >= 0 ? outEnd + (i * stagger) : -1,
                // Position
                animatePosition: v.animatePosition || (v.position && v.position.enabled) || false,
                posFromX: posFromX, posFromY: posFromY,
                posToX: posToX, posToY: posToY,
                // Scale
                animateScale: v.animateScale || (v.scale && v.scale.enabled) || false,
                scaleFrom: scaleFrom, scaleTo: scaleTo,
                // Rotation
                animateRotation: v.animateRotation || (v.rotation && v.rotation.enabled) || false,
                rotFrom: rotFrom, rotTo: rotTo,
                // Opacity
                animateOpacity: v.animateOpacity || (v.opacity && v.opacity.enabled) || false,
                opacityFrom: opacityFrom, opacityTo: opacityTo,
                // Easing
                easingType: easingType, easingStrength: easingStrength
            };
            
            _removeMotion(layers[i]);
            _applyMotion(layers[i], motionOpts);
            _updateMotionFlag(layers[i], true);
        }
        
        app.endUndoGroup();
        undoStarted = false;
        return success("تم تطبيق Preset على " + layers.length + " طبقات!");
        
    } catch(e) {
        if (undoStarted) {
            try { app.endUndoGroup(); } catch(_e) {}
        }
        return error(e.toString());
    }
}

$.writeln("[TEXTORO] MotionManager module loaded!");

