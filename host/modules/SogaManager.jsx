/**
 * TEXTORO - Soga Manager Module
 * لوحة التحكم السريع - قراءة وكتابة Effect Controls
 * v1.2.0 - ControllerManager Defaults Integration
 * 
 * Dependencies: Config.jsx, Utilities.jsx, ControllerManager.jsx, TypewriterManager.jsx, BoxManager.jsx, MultiLinesManager.jsx
 * 
 * Changes in v1.2.0:
 * - Uses getControllerDefaults() from ControllerManager for default values
 * - Smart Fallback: uses hardcoded defaults if ControllerManager fails
 * - Cleaner code with centralized defaults
 * 
 * Changes in v1.1.0:
 * - Can use getControllerDefaults() from ControllerManager for default values
 * - Can use validateControllerValue() for value validation
 */

$.writeln("[TEXTORO] Loading SogaManager module...");

// Module load flag
var SOGAMANAGER_MODULE_LOADED = true;

// ═══════════════════════════════════════════════════════════════════
// DEFAULTS HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * الحصول على القيم الافتراضية مع Fallback
 * @param {string} category - الفئة (typewriter, box, motion)
 * @returns {Object} القيم الافتراضية
 */
function _getDefaultsWithFallback(category) {
    // محاولة استخدام ControllerManager أولاً
    if (typeof getControllerDefaults === "function") {
        try {
            var defaults = getControllerDefaults(category);
            if (defaults && txKeyCount(defaults) > 0) {
                $.writeln("[TEXTORO Soga] Using ControllerManager defaults for " + category);
                return defaults;
            }
        } catch(e) {
            $.writeln("[TEXTORO Soga] ControllerManager error: " + e.toString());
        }
    }
    
    // Fallback للقيم المكتوبة
    $.writeln("[TEXTORO Soga] Using hardcoded defaults for " + category);
    return _getHardcodedDefaults(category);
}

/**
 * القيم الافتراضية المكتوبة (Fallback)
 * @param {string} category - الفئة
 * @returns {Object} القيم الافتراضية
 */
function _getHardcodedDefaults(category) {
    if (category === "typewriter") {
        return {
            "TW Progress": 0,
            "TW Auto": true,
            "TW Reverse": false,
            "Word Mode": false,
            "Random Speed": 0,
            "Show Cursor": true,
            "Cursor Before Text": false,
            "Cursor Color": [1, 1, 1],
            "Cursor Spacing": 0,
            "Blink Speed": 2,
            "Blink In Hold": true,
            "Box RTL": false,
            "Live Text": true,
            "Text Color": [1, 1, 1],
            "Easing Type": 1,
            "Easing Strength": 100
        };
    }
    
    if (category === "box") {
        // C-05: الافتراضيات من BOX_CONFIG.DEFAULTS (مصدر وحيد)
        var bd = BOX_CONFIG.DEFAULTS;
        return {
            "Padding Left": bd.PADDING_H,
            "Padding Right": bd.PADDING_H,
            "Padding Top": bd.PADDING_V,
            "Padding Bottom": bd.PADDING_V,
            "Corner Radius": bd.CORNER_RADIUS,
            "Corner TL": bd.CORNER_RADIUS,
            "Corner TR": bd.CORNER_RADIUS,
            "Corner BR": bd.CORNER_RADIUS,
            "Corner BL": bd.CORNER_RADIUS,
            "Stroke Width": bd.STROKE_WIDTH,
            "Stroke Opacity": bd.OPACITY,
            "Stroke Color": bd.STROKE_COLOR,
            "Stroke Dash": 0,
            "Stroke Gap": 0,
            "Fill Opacity": bd.OPACITY,
            "Fill Color": bd.FILL_COLOR,
            "Trim Start": 0,
            "Trim End": 100,
            "Trim Offset": 0,
            "Path Offset": 0,
            "Lock Box Size": false
        };
    }
    
    if (category === "motion") {
        return {
            "Motion In Start": 0,
            "Motion In End": 1,
            "Motion Out Start": -1,
            "Motion Out End": -1,
            "Motion Sync Mode": 0,
            "Animate Position": false,
            "Pos From X": 0,
            "Pos From Y": 0,
            "Pos To X": 0,
            "Pos To Y": 0,
            "Pos Link Mode": 0,
            "Pos Out From X": 0,
            "Pos Out From Y": 0,
            "Pos Out To X": 0,
            "Pos Out To Y": 0,
            "Animate Scale": false,
            "Scale From": 100,
            "Scale To": 100,
            "Scale Link Mode": 0,
            "Scale Out From": 100,
            "Scale Out To": 100,
            "Animate Rotation": false,
            "Rot From": 0,
            "Rot To": 0,
            "Rot Link Mode": 0,
            "Rot Out From": 0,
            "Rot Out To": 0,
            "Animate Opacity": false,
            "Opacity From": 0,
            "Opacity To": 100,
            "Opacity Link Mode": 0,
            "Opacity Out From": 100,
            "Opacity Out To": 0,
            "Motion Easing Type": 1,
            "Motion Easing Strength": 100
        };
    }
    
    return {};
}

// P1-3: Fast map helpers - O(m) once instead of O(fields*m)
function _getSliderValueFast(map, name, def) {
    var c = map[name];
    if (!c) return def;
    try { return c.property(1).value; } catch (e) { return def; }
}
function _getCheckboxValueFast(map, name, def) {
    var c = map[name];
    if (!c) return def;
    try { return c.property(1).value === 1; } catch (e) { return def; }
}
function _getColorValueFast(map, name, def) {
    var c = map[name];
    if (!c) return def;
    try { return c.property(1).value; } catch (e) { return def; }
}

// ═══════════════════════════════════════════════════════════════════
// READ EFFECT VALUES
// ═══════════════════════════════════════════════════════════════════

/**
 * قراءة جميع قيم Effect Controls من الطبقة المحددة
 */
function getLayerEffectValues() {
    try {
        var comp = getActiveComp();
        if (!comp) return error("افتح Composition أولاً");
        
        var layer = getSelectedTextLayer(comp);
        if (!layer) {
            return success("", {
                layerName: null,
                hasTypewriter: false,
                hasBox: false,
                hasMotion: false,
                typewriter: null,
                box: null,
                motion: null
            });
        }
        
        $.writeln("[TEXTORO getLayerEffectValues] Layer: " + layer.name);
        
        var fx = layer.property("ADBE Effect Parade");
        var hasTW = hasTypewriter(layer);
        var hasBX = hasBox(layer, comp);
        var hasMT = typeof hasMotion === "function" ? hasMotion(layer) : false;
        
        $.writeln("[TEXTORO getLayerEffectValues] hasTW=" + hasTW + ", hasBX=" + hasBX + ", hasMT=" + hasMT);
        
        var status = getLayerStatus(layer);
        
        var result = {
            layerName: layer.name,
            hasTypewriter: hasTW,
            hasBox: hasBX,
            hasMotion: hasMT,
            status: status,
            typewriter: null,
            box: null,
            motion: null
        };
        
        if (hasTW) result.typewriter = _readTypewriterValues(fx);
        if (hasBX) result.box = _readBoxValues(fx);
        if (hasMT) {
            $.writeln("[TEXTORO getLayerEffectValues] Reading Motion values...");
            result.motion = _readMotionValues(fx);
            $.writeln("[TEXTORO getLayerEffectValues] Motion values read successfully");
        }
        
        $.writeln("[TEXTORO getLayerEffectValues] Returning result: hasMotion=" + result.hasMotion);
        return success("", result);
        
    } catch(e) {
        $.writeln("[TEXTORO getLayerEffectValues] ERROR: " + e.toString());
        return error(e.toString());
    }
}

function _readTypewriterValues(fx) {
    var d = _getDefaultsWithFallback("typewriter");
    return {
        twProgress: _getSliderValue(fx, "TW Progress", d["TW Progress"]),
        twAuto: _getCheckboxValue(fx, "TW Auto", d["TW Auto"]),
        twReverse: _getCheckboxValue(fx, "TW Reverse", d["TW Reverse"]),
        wordMode: _getCheckboxValue(fx, "Word Mode", d["Word Mode"]),
        randomSpeed: _getSliderValue(fx, "Random Speed", d["Random Speed"]),
        showCursor: _getCheckboxValue(fx, "Show Cursor", d["Show Cursor"]),
        cursorBefore: _getCheckboxValue(fx, "Cursor Before Text", d["Cursor Before Text"]),
        cursorColor: _getColorValue(fx, "Cursor Color", d["Cursor Color"]),
        cursorSpacing: _getSliderValue(fx, "Cursor Spacing", d["Cursor Spacing"]),
        blinkSpeed: _getSliderValue(fx, "Blink Speed", d["Blink Speed"]),
        blinkInHold: _getCheckboxValue(fx, "Blink In Hold", d["Blink In Hold"]),
        boxRTL: _getCheckboxValue(fx, "Box RTL", d["Box RTL"]),
        liveText: _getCheckboxValue(fx, "Live Text", d["Live Text"] !== false),
        textColor: _getColorValue(fx, "Text Color", d["Text Color"]),
        easingType: _getSliderValue(fx, "Easing Type", d["Easing Type"]),
        easingStrength: _getSliderValue(fx, "Easing Strength", d["Easing Strength"])
    };
}

function _readBoxValues(fx) {
    var d = _getDefaultsWithFallback("box");
    var has4Corners = findEffectControl(fx, "Corner TL") !== null;
    
    return {
        paddingLeft: _getSliderValue(fx, "Padding Left", d["Padding Left"]),
        paddingRight: _getSliderValue(fx, "Padding Right", d["Padding Right"]),
        paddingTop: _getSliderValue(fx, "Padding Top", d["Padding Top"]),
        paddingBottom: _getSliderValue(fx, "Padding Bottom", d["Padding Bottom"]),
        use4Corners: has4Corners,
        cornerRadius: has4Corners ? null : _getSliderValue(fx, "Corner Radius", d["Corner Radius"]),
        cornerTL: has4Corners ? _getSliderValue(fx, "Corner TL", d["Corner TL"]) : null,
        cornerTR: has4Corners ? _getSliderValue(fx, "Corner TR", d["Corner TR"]) : null,
        cornerBR: has4Corners ? _getSliderValue(fx, "Corner BR", d["Corner BR"]) : null,
        cornerBL: has4Corners ? _getSliderValue(fx, "Corner BL", d["Corner BL"]) : null,
        strokeWidth: _getSliderValue(fx, "Stroke Width", d["Stroke Width"]),
        strokeOpacity: _getSliderValue(fx, "Stroke Opacity", d["Stroke Opacity"]),
        strokeColor: _getColorValue(fx, "Stroke Color", d["Stroke Color"]),
        strokeDash: _getSliderValue(fx, "Stroke Dash", d["Stroke Dash"]),
        strokeGap: _getSliderValue(fx, "Stroke Gap", d["Stroke Gap"]),
        fillOpacity: _getSliderValue(fx, "Fill Opacity", d["Fill Opacity"]),
        fillColor: _getColorValue(fx, "Fill Color", d["Fill Color"]),
        trimStart: _getSliderValue(fx, "Trim Start", d["Trim Start"]),
        trimEnd: _getSliderValue(fx, "Trim End", d["Trim End"]),
        trimOffset: _getSliderValue(fx, "Trim Offset", d["Trim Offset"]),
        pathOffset: _getSliderValue(fx, "Path Offset", d["Path Offset"]),
        lockBoxSize: _getCheckboxValue(fx, "Lock Box Size", d["Lock Box Size"])
    };
}

function _readMotionValues(fx) {
    var d = _getDefaultsWithFallback("motion");
    var map = getEffectControlMap(fx);
    return {
        // Timing
        inStart: _getSliderValueFast(map, "Motion In Start", d["Motion In Start"]),
        inEnd: _getSliderValueFast(map, "Motion In End", d["Motion In End"]),
        outStart: _getSliderValueFast(map, "Motion Out Start", d["Motion Out Start"]),
        outEnd: _getSliderValueFast(map, "Motion Out End", d["Motion Out End"]),
        syncMode: _getSliderValueFast(map, "Motion Sync Mode", d["Motion Sync Mode"]),
        // Position IN
        animatePosition: _getCheckboxValueFast(map, "Animate Position", d["Animate Position"]),
        posFromX: _getSliderValueFast(map, "Pos From X", d["Pos From X"]),
        posFromY: _getSliderValueFast(map, "Pos From Y", d["Pos From Y"]),
        posToX: _getSliderValueFast(map, "Pos To X", d["Pos To X"]),
        posToY: _getSliderValueFast(map, "Pos To Y", d["Pos To Y"]),
        // Position OUT
        posLinkMode: _getSliderValueFast(map, "Pos Link Mode", d["Pos Link Mode"]),
        posOutFromX: _getSliderValueFast(map, "Pos Out From X", d["Pos Out From X"]),
        posOutFromY: _getSliderValueFast(map, "Pos Out From Y", d["Pos Out From Y"]),
        posOutToX: _getSliderValueFast(map, "Pos Out To X", d["Pos Out To X"]),
        posOutToY: _getSliderValueFast(map, "Pos Out To Y", d["Pos Out To Y"]),
        // Scale IN
        animateScale: _getCheckboxValueFast(map, "Animate Scale", d["Animate Scale"]),
        scaleFrom: _getSliderValueFast(map, "Scale From", d["Scale From"]),
        scaleTo: _getSliderValueFast(map, "Scale To", d["Scale To"]),
        // Scale OUT
        scaleLinkMode: _getSliderValueFast(map, "Scale Link Mode", d["Scale Link Mode"]),
        scaleOutFrom: _getSliderValueFast(map, "Scale Out From", d["Scale Out From"]),
        scaleOutTo: _getSliderValueFast(map, "Scale Out To", d["Scale Out To"]),
        // Rotation IN
        animateRotation: _getCheckboxValueFast(map, "Animate Rotation", d["Animate Rotation"]),
        rotFrom: _getSliderValueFast(map, "Rot From", d["Rot From"]),
        rotTo: _getSliderValueFast(map, "Rot To", d["Rot To"]),
        // Rotation OUT
        rotLinkMode: _getSliderValueFast(map, "Rot Link Mode", d["Rot Link Mode"]),
        rotOutFrom: _getSliderValueFast(map, "Rot Out From", d["Rot Out From"]),
        rotOutTo: _getSliderValueFast(map, "Rot Out To", d["Rot Out To"]),
        // Opacity IN
        animateOpacity: _getCheckboxValueFast(map, "Animate Opacity", d["Animate Opacity"]),
        opacityFrom: _getSliderValueFast(map, "Opacity From", d["Opacity From"]),
        opacityTo: _getSliderValueFast(map, "Opacity To", d["Opacity To"]),
        // Opacity OUT
        opacityLinkMode: _getSliderValueFast(map, "Opacity Link Mode", d["Opacity Link Mode"]),
        opacityOutFrom: _getSliderValueFast(map, "Opacity Out From", d["Opacity Out From"]),
        opacityOutTo: _getSliderValueFast(map, "Opacity Out To", d["Opacity Out To"]),
        // Easing
        easingType: _getSliderValueFast(map, "Motion Easing Type", d["Motion Easing Type"]),
        easingStrength: _getSliderValueFast(map, "Motion Easing Strength", d["Motion Easing Strength"])
    };
}


// ═══════════════════════════════════════════════════════════════════
// WRITE EFFECT VALUES
// ═══════════════════════════════════════════════════════════════════

/**
 * كتابة قيم Effect Controls للطبقة المحددة
 */
function setLayerEffectValues(optsJSON) {
    var undoStarted = false;
    try {
        var opts = safeJSONParse(optsJSON, null);
        if (!opts) return error("Invalid options JSON");
        
        var comp = getActiveComp();
        if (!comp) return error("افتح Composition أولاً");
        
        var layer = getSelectedTextLayer(comp);
        if (!layer) return error("اختر طبقة نص");
        
        var fx = layer.property("ADBE Effect Parade");
        
        app.beginUndoGroup("TEXTORO - Soga Update");
        undoStarted = true;
        
        if (opts.typewriter) _writeTypewriterValues(fx, opts.typewriter);
        if (opts.box) _writeBoxValues(fx, opts.box);
        if (opts.motion) {
            $.writeln("[TEXTORO Soga] setLayerEffectValues - Motion update started");
            _writeMotionValues(fx, opts.motion);
        }
        
        app.endUndoGroup();
        undoStarted = false;
        return success("تم تحديث الخصائص");
        
    } catch(e) {
        if (undoStarted) {
            try { app.endUndoGroup(); } catch(_e) {}
        }
        return error(e.toString());
    }
}

function _writeTypewriterValues(fx, tw) {
    if (tw.twProgress !== undefined) _setSliderValue(fx, "TW Progress", tw.twProgress);
    if (tw.twAuto !== undefined) _setCheckboxValue(fx, "TW Auto", tw.twAuto);
    if (tw.twReverse !== undefined) _setCheckboxValue(fx, "TW Reverse", tw.twReverse);
    if (tw.wordMode !== undefined) _setCheckboxValue(fx, "Word Mode", tw.wordMode);
    if (tw.randomSpeed !== undefined) _setSliderValue(fx, "Random Speed", tw.randomSpeed);
    if (tw.showCursor !== undefined) _setCheckboxValue(fx, "Show Cursor", tw.showCursor);
    if (tw.cursorBefore !== undefined) _setCheckboxValue(fx, "Cursor Before Text", tw.cursorBefore);
    if (tw.cursorColor !== undefined) _setColorValue(fx, "Cursor Color", tw.cursorColor);
    if (tw.cursorSpacing !== undefined) _setSliderValue(fx, "Cursor Spacing", tw.cursorSpacing);
    if (tw.blinkSpeed !== undefined) _setSliderValue(fx, "Blink Speed", tw.blinkSpeed);
    if (tw.blinkInHold !== undefined) _setCheckboxValue(fx, "Blink In Hold", tw.blinkInHold);
    if (tw.boxRTL !== undefined) _setCheckboxValue(fx, "Box RTL", tw.boxRTL);
    if (tw.liveText !== undefined) _setCheckboxValue(fx, "Live Text", tw.liveText);
    
    // Text Color - معالجة خاصة
    if (tw.textColor !== undefined) {
        var textColorCtrl = findEffectControl(fx, "Text Color");
        if (textColorCtrl) {
            // Effect Control موجود، نحدث القيمة فقط
            _setColorValue(fx, "Text Color", tw.textColor);
        } else {
            // Effect Control غير موجود - نحتاج إنشاء Text Color مع Animator
            // نحصل على الطبقة من fx
            try {
                var layer = fx.propertyGroup(1); // الطبقة الأم
                if (layer && layer instanceof TextLayer) {
                    var animators = layer.property("ADBE Text Properties").property("ADBE Text Animators");
                    _ensureTextColorAnimator(layer, animators, fx, tw.textColor);
                }
            } catch(e) {
                $.writeln("[TEXTORO] _writeTypewriterValues: Could not create Text Color animator: " + e.toString());
            }
        }
    }
    
    if (tw.easingType !== undefined) _setSliderValue(fx, "Easing Type", tw.easingType);
    if (tw.easingStrength !== undefined) _setSliderValue(fx, "Easing Strength", tw.easingStrength);
}

function _writeBoxValues(fx, bx) {
    if (bx.paddingLeft !== undefined) _setSliderValue(fx, "Padding Left", bx.paddingLeft);
    if (bx.paddingRight !== undefined) _setSliderValue(fx, "Padding Right", bx.paddingRight);
    if (bx.paddingTop !== undefined) _setSliderValue(fx, "Padding Top", bx.paddingTop);
    if (bx.paddingBottom !== undefined) _setSliderValue(fx, "Padding Bottom", bx.paddingBottom);
    
    if (bx.use4Corners) {
        if (bx.cornerTL !== undefined && bx.cornerTL !== null) _setSliderValue(fx, "Corner TL", bx.cornerTL);
        if (bx.cornerTR !== undefined && bx.cornerTR !== null) _setSliderValue(fx, "Corner TR", bx.cornerTR);
        if (bx.cornerBR !== undefined && bx.cornerBR !== null) _setSliderValue(fx, "Corner BR", bx.cornerBR);
        if (bx.cornerBL !== undefined && bx.cornerBL !== null) _setSliderValue(fx, "Corner BL", bx.cornerBL);
    } else {
        if (bx.cornerRadius !== undefined && bx.cornerRadius !== null) _setSliderValue(fx, "Corner Radius", bx.cornerRadius);
    }
    
    if (bx.strokeWidth !== undefined) _setSliderValue(fx, "Stroke Width", bx.strokeWidth);
    if (bx.strokeOpacity !== undefined) _setSliderValue(fx, "Stroke Opacity", bx.strokeOpacity);
    if (bx.strokeColor !== undefined) _setColorValue(fx, "Stroke Color", bx.strokeColor);
    if (bx.strokeDash !== undefined) _setSliderValue(fx, "Stroke Dash", bx.strokeDash);
    if (bx.strokeGap !== undefined) _setSliderValue(fx, "Stroke Gap", bx.strokeGap);
    if (bx.fillOpacity !== undefined) _setSliderValue(fx, "Fill Opacity", bx.fillOpacity);
    if (bx.fillColor !== undefined) _setColorValue(fx, "Fill Color", bx.fillColor);
    if (bx.lockBoxSize !== undefined) _setCheckboxValue(fx, "Lock Box Size", bx.lockBoxSize);
}

function _writeMotionValues(fx, mt) {
    _ensureMotionControl(fx, "Motion In Start", mt.inStart, 0, "slider");
    _ensureMotionControl(fx, "Motion In End", mt.inEnd, 1, "slider");
    _ensureMotionControl(fx, "Motion Out Start", mt.outStart, -1, "slider");
    _ensureMotionControl(fx, "Motion Out End", mt.outEnd, -1, "slider");
    _ensureMotionControl(fx, "Motion Sync Mode", mt.syncMode, 0, "slider");
    // Position IN
    _ensureMotionControl(fx, "Animate Position", mt.animatePosition, false, "checkbox");
    _ensureMotionControl(fx, "Pos From X", mt.posFromX, 0, "slider");
    _ensureMotionControl(fx, "Pos From Y", mt.posFromY, 0, "slider");
    _ensureMotionControl(fx, "Pos To X", mt.posToX, 0, "slider");
    _ensureMotionControl(fx, "Pos To Y", mt.posToY, 0, "slider");
    // Position OUT
    _ensureMotionControl(fx, "Pos Link Mode", mt.posLinkMode, 0, "slider");
    _ensureMotionControl(fx, "Pos Out From X", mt.posOutFromX, 0, "slider");
    _ensureMotionControl(fx, "Pos Out From Y", mt.posOutFromY, 0, "slider");
    _ensureMotionControl(fx, "Pos Out To X", mt.posOutToX, 0, "slider");
    _ensureMotionControl(fx, "Pos Out To Y", mt.posOutToY, 0, "slider");
    // Scale IN
    _ensureMotionControl(fx, "Animate Scale", mt.animateScale, false, "checkbox");
    _ensureMotionControl(fx, "Scale From", mt.scaleFrom, 100, "slider");
    _ensureMotionControl(fx, "Scale To", mt.scaleTo, 100, "slider");
    // Scale OUT
    _ensureMotionControl(fx, "Scale Link Mode", mt.scaleLinkMode, 0, "slider");
    _ensureMotionControl(fx, "Scale Out From", mt.scaleOutFrom, 100, "slider");
    _ensureMotionControl(fx, "Scale Out To", mt.scaleOutTo, 100, "slider");
    // Rotation IN
    _ensureMotionControl(fx, "Animate Rotation", mt.animateRotation, false, "checkbox");
    _ensureMotionControl(fx, "Rot From", mt.rotFrom, 0, "slider");
    _ensureMotionControl(fx, "Rot To", mt.rotTo, 0, "slider");
    // Rotation OUT
    _ensureMotionControl(fx, "Rot Link Mode", mt.rotLinkMode, 0, "slider");
    _ensureMotionControl(fx, "Rot Out From", mt.rotOutFrom, 0, "slider");
    _ensureMotionControl(fx, "Rot Out To", mt.rotOutTo, 0, "slider");
    // Opacity IN
    _ensureMotionControl(fx, "Animate Opacity", mt.animateOpacity, false, "checkbox");
    _ensureMotionControl(fx, "Opacity From", mt.opacityFrom, 0, "slider");
    _ensureMotionControl(fx, "Opacity To", mt.opacityTo, 100, "slider");
    // Opacity OUT
    _ensureMotionControl(fx, "Opacity Link Mode", mt.opacityLinkMode, 0, "slider");
    _ensureMotionControl(fx, "Opacity Out From", mt.opacityOutFrom, 100, "slider");
    _ensureMotionControl(fx, "Opacity Out To", mt.opacityOutTo, 0, "slider");
    // Easing
    _ensureMotionControl(fx, "Motion Easing Type", mt.easingType, 1, "slider");
    _ensureMotionControl(fx, "Motion Easing Strength", mt.easingStrength, 100, "slider");
}


// ═══════════════════════════════════════════════════════════════════
// WRITE EFFECT VALUES TO MULTIPLE LAYERS
// ═══════════════════════════════════════════════════════════════════

/**
 * كتابة قيم Effect Controls لجميع الطبقات المحددة
 */
function setLayerEffectValuesMulti(optsJSON) {
    var undoStarted = false;
    try {
        var opts = safeJSONParse(optsJSON, null);
        if (!opts) return error("Invalid options JSON");
        
        var comp = getActiveComp();
        if (!comp) return error("افتح Composition أولاً");
        
        var layers = getSelectedTextLayers(comp);
        if (layers.length === 0) return error("اختر طبقات نص");
        
        app.beginUndoGroup("TEXTORO - Soga Multi Update");
        undoStarted = true;
        
        var updatedCount = 0;
        
        for (var i = 0; i < layers.length; i++) {
            var layer = layers[i];
            var fx = layer.property("ADBE Effect Parade");
            var hasTW = hasTypewriter(layer);
            var hasBX = hasBox(layer, comp);
            
            // تحديث قيم Typewriter إذا كان موجوداً
            if (hasTW && opts.typewriter) {
                _writeTypewriterValues(fx, opts.typewriter);
                updatedCount++;
            }
            
            // تحديث قيم Box إذا كان موجوداً
            if (hasBX && opts.box) {
                _writeBoxValues(fx, opts.box);
            }
            
            // تحديث قيم Motion إذا كان موجوداً
            var hasMT = typeof hasMotion === "function" ? hasMotion(layer) : false;
            if (CONFIG.DEBUG) $.writeln("[TEXTORO Soga] hasMotion: " + hasMT + ", opts.motion: " + (opts.motion ? "yes" : "no"));
            if (hasMT && opts.motion) {
                $.writeln("[TEXTORO Soga] Motion OUT values: posLinkMode=" + opts.motion.posLinkMode);
                _writeMotionValues(fx, opts.motion);
            }
        }
        
        app.endUndoGroup();
        undoStarted = false;
        return success("تم تحديث " + updatedCount + " طبقات");
        
    } catch(e) {
        if (undoStarted) {
            try { app.endUndoGroup(); } catch(_e) {}
        }
        return error(e.toString());
    }
}

// ═══════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

function _getSliderValue(fx, name, defaultVal) {
    var ctrl = findEffectControl(fx, name);
    if (!ctrl) return defaultVal;
    try { return ctrl.property(1).value; } catch(e) { return defaultVal; }
}

function _getCheckboxValue(fx, name, defaultVal) {
    var ctrl = findEffectControl(fx, name);
    if (!ctrl) return defaultVal;
    try { return ctrl.property(1).value === 1; } catch(e) { return defaultVal; }
}

function _getColorValue(fx, name, defaultVal) {
    var ctrl = findEffectControl(fx, name);
    if (!ctrl) return defaultVal;
    try {
        var c = ctrl.property(1).value;
        return [c[0], c[1], c[2]];
    } catch(e) { return defaultVal; }
}

function _setSliderValue(fx, name, value) {
    if (value === null || value === undefined) return;
    var ctrl = findEffectControl(fx, name);
    if (!ctrl) {
        $.writeln("[TEXTORO] _setSliderValue: Control not found: " + name);
        return;
    }
    try { 
        ctrl.property(1).setValue(value);
        $.writeln("[TEXTORO] _setSliderValue: Set " + name + " = " + value);
    } catch(e) {
        $.writeln("[TEXTORO] _setSliderValue ERROR: " + name + " - " + e.toString());
    }
}

function _setCheckboxValue(fx, name, value) {
    if (value === null || value === undefined) return;
    var ctrl = findEffectControl(fx, name);
    if (!ctrl) {
        try {
            addCheckbox(fx, name, value);
            $.writeln("[TEXTORO] _setCheckboxValue: Added missing control: " + name + " = " + value);
        } catch(e) {
            $.writeln("[TEXTORO] _setCheckboxValue: Control not found and cannot add: " + name);
        }
        return;
    }
    try { ctrl.property(1).setValue(value ? 1 : 0); } catch(e) { $.writeln("[TEXTORO] Warning: Could not set checkbox: " + e.toString()); }
}

function _setColorValue(fx, name, value) {
    if (value === null || value === undefined) return;
    var ctrl = findEffectControl(fx, name);
    if (!ctrl) {
        // محاولة إنشاء Effect Control للون إذا لم يكن موجوداً
        try {
            var rgbValue;
            if (txIsArray(value)) {
                rgbValue = value;
            } else if (typeof value === "string") {
                rgbValue = hexToRgb(value);
            } else {
                if (CONFIG.DEBUG) $.writeln("[TEXTORO] _setColorValue: Unknown value type for " + name);
                return;
            }
            
            // التأكد من أن القيم بين 0 و 1
            if (rgbValue[0] > 1 || rgbValue[1] > 1 || rgbValue[2] > 1) {
                rgbValue = [rgbValue[0] / 255, rgbValue[1] / 255, rgbValue[2] / 255];
            }
            
            addColor(fx, name, rgbValue);
            if (CONFIG.DEBUG) $.writeln("[TEXTORO] _setColorValue: Created missing control: " + name + " = [" + rgbValue.join(", ") + "]");
            return;
        } catch(e) {
            if (CONFIG.DEBUG) $.writeln("[TEXTORO] _setColorValue: Control not found and cannot create: " + name + " - " + e.toString());
            return;
        }
    }
    
    try {
        var rgbValue;
        
        // التحقق من نوع القيمة
        if (txIsArray(value)) {
            // القيمة بالفعل RGB array [r, g, b]
            rgbValue = value;
        } else if (typeof value === "string") {
            // القيمة hex string مثل "#ffffff"
            rgbValue = hexToRgb(value);
        } else {
            if (CONFIG.DEBUG) $.writeln("[TEXTORO] _setColorValue: Unknown value type for " + name);
            return;
        }
        
        // التأكد من أن القيم بين 0 و 1
        if (rgbValue[0] > 1 || rgbValue[1] > 1 || rgbValue[2] > 1) {
            // القيم بين 0-255، نحولها إلى 0-1
            rgbValue = [rgbValue[0] / 255, rgbValue[1] / 255, rgbValue[2] / 255];
        }
        
        ctrl.property(1).setValue(rgbValue);
        if (CONFIG.DEBUG) $.writeln("[TEXTORO] _setColorValue: Set " + name + " = [" + rgbValue.join(", ") + "]");
    } catch(e) {
        if (CONFIG.DEBUG) $.writeln("[TEXTORO] _setColorValue ERROR: " + name + " - " + e.toString());
    }
}

function _ensureMotionControl(fx, name, value, defaultVal, type) {
    var finalValue = (value !== undefined && value !== null) ? value : defaultVal;
    var ctrl = findEffectControl(fx, name);
    
    if (!ctrl) {
        try {
            if (type === "checkbox") addCheckbox(fx, name, finalValue);
            else addSlider(fx, name, finalValue);
        if (CONFIG.DEBUG) $.writeln("[TEXTORO] _ensureMotionControl: Created " + name + " = " + finalValue);
        } catch(e) {
            if (CONFIG.DEBUG) $.writeln("[TEXTORO] _ensureMotionControl ERROR creating " + name + ": " + e.toString());
        }
    } else {
        try {
            if (type === "checkbox") ctrl.property(1).setValue(finalValue ? 1 : 0);
            else ctrl.property(1).setValue(finalValue);
        if (CONFIG.DEBUG) $.writeln("[TEXTORO] _ensureMotionControl: Updated " + name + " = " + finalValue);
        } catch(e) {
            if (CONFIG.DEBUG) $.writeln("[TEXTORO] _ensureMotionControl ERROR updating " + name + ": " + e.toString());
        }
    }
}

/**
 * إنشاء أو تحديث Text Color Animator
 * يُستخدم عندما يكون Effect Control "Text Color" غير موجود
 */
function _ensureTextColorAnimator(textLayer, animators, fx, textColor) {
    // التحقق من وجود Color Control Animator
    var hasColorAnimator = false;
    for (var i = 1; i <= animators.numProperties; i++) {
        try {
            if (animators.property(i).name === "Color Control") {
                hasColorAnimator = true;
                break;
            }
        } catch(e) {}
    }
    
    // تحويل اللون إلى RGB array
    var rgbValue;
    if (txIsArray(textColor)) {
        rgbValue = textColor;
    } else if (typeof textColor === "string") {
        rgbValue = hexToRgb(textColor);
    } else {
        rgbValue = [1, 1, 1]; // أبيض افتراضي
    }
    
    // التأكد من أن القيم بين 0 و 1
    if (rgbValue[0] > 1 || rgbValue[1] > 1 || rgbValue[2] > 1) {
        rgbValue = [rgbValue[0] / 255, rgbValue[1] / 255, rgbValue[2] / 255];
    }
    
    // إنشاء Effect Control
    addColor(fx, "Text Color", rgbValue);
    $.writeln("[TEXTORO] _ensureTextColorAnimator: Created Text Color effect control");
    
    // إنشاء Animator إذا لم يكن موجوداً
    if (!hasColorAnimator) {
        var colorAnimator = animators.addProperty("ADBE Text Animator");
        colorAnimator.name = "Color Control";
        var colorSelector = colorAnimator.property("ADBE Text Selectors").addProperty("ADBE Text Selector");
        colorSelector.property("ADBE Text Percent Start").setValue(0);
        
        // استثناء المؤشر من Text Color
        colorSelector.property("ADBE Text Percent End").expression = 
            'var txt = text.sourceText + ""; ' +
            'var len = txt.length; ' +
            'len > 1 ? ((len - 1) / len) * 100 : 0;';
        
        var colorProp = colorAnimator.property("ADBE Text Animator Properties").addProperty("ADBE Text Fill Color");
        colorProp.expression = 'effect("Text Color")(1);';
        
        $.writeln("[TEXTORO] _ensureTextColorAnimator: Created Color Control animator");
    }
}

$.writeln("[TEXTORO] SogaManager module loaded!");


