/**
 * TEXTORO - Inspector Manager Module
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

$.writeln("[TEXTORO] Loading InspectorManager module...");

var CONFIG = (typeof $.global !== "undefined" && $.global.CONFIG) ? $.global.CONFIG : (typeof CONFIG !== "undefined" ? CONFIG : { DEBUG: false, TEXT: { RTL: "", LTR: "" } });
var BOX_CONFIG = (typeof $.global !== "undefined" && $.global.BOX_CONFIG) ? $.global.BOX_CONFIG : (typeof BOX_CONFIG !== "undefined" ? BOX_CONFIG : {});


// Module load flag
var INSPECTORMANAGER_MODULE_LOADED = true;
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
                $.writeln("[TEXTORO Inspector] Using ControllerManager defaults for " + category);
                return defaults;
            }
        } catch(e) {
            $.writeln("[TEXTORO Inspector] ControllerManager error: " + e.toString());
        }
    }
    
    // Fallback للقيم المكتوبة
    $.writeln("[TEXTORO Inspector] Using hardcoded defaults for " + category);
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
            "Motion Easing Strength": 100,
            "Spring Stiffness": 180,
            "Spring Damping": 18,
            "Spring Mass": 1.0,
            "Spring Velocity Boost": 0
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
        if (!comp) return error("Open a composition first");
        
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
    var layer = null;
    try { layer = fx.propertyGroup(1); } catch(_eGrp) {}
    
    var currentText = "";
    var customCursor = "";
    var timing = { inStart: 2, inEnd: 3, outStart: 6, outEnd: 7, blinkStart: 1, blinkEnd: 10, noOut: false };

    if (layer && layer instanceof TextLayer) {
        var origFromComment = (typeof getOriginalText === "function") ? getOriginalText(layer) : null;
        var cleanComment = (typeof txStripCursor === "function") ? txStripCursor(origFromComment) : origFromComment;
        if (cleanComment && cleanComment.length > 0) {
            currentText = cleanComment;
        } else {
            var markers = layer.property("Marker");
            var origFromMarker = (typeof getTextFromMarker === "function") ? getTextFromMarker(markers) : null;
            var cleanMarker = (typeof txStripCursor === "function") ? txStripCursor(origFromMarker) : origFromMarker;
            if (cleanMarker && cleanMarker.length > 0) {
                currentText = cleanMarker;
            } else {
                try {
                    var doc = layer.property("ADBE Text Properties").property("ADBE Text Document").value;
                    currentText = (typeof txStripCursor === "function") ? txStripCursor(doc.text || "") : (doc.text || "");
                } catch(_eDoc) {}
            }
        }

        var markers = layer.property("Marker");
        if (markers && markers.numKeys > 0) {
            var inPoint = layer.inPoint;
            var hasOutStart = false;
            for (var m = 1; m <= markers.numKeys; m++) {
                var mv = markers.keyValue(m);
                var comm = mv.comment || "";
                var relTime = Math.round((markers.keyTime(m) - inPoint) * 100) / 100;
                if (comm === "IN_START") timing.inStart = relTime;
                else if (comm === "IN_END") timing.inEnd = relTime;
                else if (comm === "OUT_START") { timing.outStart = relTime; hasOutStart = true; }
                else if (comm === "OUT_END") timing.outEnd = relTime;
                else if (comm === "BLINK_START") timing.blinkStart = relTime;
                else if (comm === "BLINK_END") timing.blinkEnd = relTime;
                else if (comm.indexOf("CURSOR_CHAR:") === 0) customCursor = comm.substring("CURSOR_CHAR:".length);
            }
            if (!hasOutStart) timing.noOut = true;
        }
    }

    return {
        text: currentText,
        twProgress: _getSliderValue(fx, "TW Progress", d["TW Progress"]),
        twAuto: _getCheckboxValue(fx, "TW Auto", d["TW Auto"]),
        twReverse: _getCheckboxValue(fx, "TW Reverse", d["TW Reverse"]),
        wordMode: _getCheckboxValue(fx, "Word Mode", d["Word Mode"]),
        twWordByWord: _getCheckboxValue(fx, "Word Mode", d["Word Mode"]),
        randomSpeed: _getSliderValue(fx, "Random Speed", d["Random Speed"]),
        typeBlur: _getSliderValue(fx, "Type Blur", 0),
        showCursor: _getCheckboxValue(fx, "Show Cursor", d["Show Cursor"]),
        cursorBefore: _getCheckboxValue(fx, "Cursor Before Text", d["Cursor Before Text"]),
        cursorType: _getSliderValue(fx, "Cursor Type", 0),
        customCursor: customCursor,
        cursorColor: _getColorValue(fx, "Cursor Color", d["Cursor Color"]),
        cursorSpacing: _getSliderValue(fx, "Cursor Spacing", d["Cursor Spacing"]),
        blinkSpeed: _getSliderValue(fx, "Blink Speed", d["Blink Speed"]),
        blinkInHold: _getCheckboxValue(fx, "Blink In Hold", d["Blink In Hold"]),
        boxRTL: _getCheckboxValue(fx, "Box RTL", d["Box RTL"]),
        liveText: _getCheckboxValue(fx, "Live Text", d["Live Text"] !== false),
        applyTextColor: findEffectControl(fx, "Text Color") !== null,
        textColor: (function() {
            var tc = findEffectControl(fx, "Text Color");
            if (tc) {
                try {
                    var col = tc(1).value;
                    return [col[0], col[1], col[2]];
                } catch(e) {}
            }
            try {
                var lytxt = fx.propertyGroup(1);
                if (lytxt && lytxt instanceof TextLayer) {
                    var doc = lytxt.property("ADBE Text Properties").property("ADBE Text Document").value;
                    if (doc && doc.fillColor) return [doc.fillColor[0], doc.fillColor[1], doc.fillColor[2]];
                }
            } catch(e2) {}
            return d["Text Color"] || [1, 1, 1];
        })(),
        easingType: _getSliderValue(fx, "Easing Type", d["Easing Type"]),
        easingStrength: _getSliderValue(fx, "Easing Strength", d["Easing Strength"]),
        timing: timing
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
        easingStrength: _getSliderValueFast(map, "Motion Easing Strength", d["Motion Easing Strength"]),
        // Physics
        springStiffness: _getSliderValueFast(map, "Spring Stiffness", d["Spring Stiffness"]),
        springDamping: _getSliderValueFast(map, "Spring Damping", d["Spring Damping"]),
        springMass: _getSliderValueFast(map, "Spring Mass", d["Spring Mass"]),
        springVelocityBoost: _getSliderValueFast(map, "Spring Velocity Boost", d["Spring Velocity Boost"])
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
        if (!comp) return error("Open a composition first");
        
        var layer = getSelectedTextLayer(comp);
        if (!layer) return error("Select a text layer");
        
        var fx = layer.property("ADBE Effect Parade");
        
        app.beginUndoGroup("TEXTORO - Inspector Update");
        undoStarted = true;
        
        if (opts.typewriter) _writeTypewriterValues(fx, opts.typewriter);
        if (opts.box) _writeBoxValues(fx, opts.box);
        if (opts.motion) {
            $.writeln("[TEXTORO Inspector] setLayerEffectValues - Motion update started");
            _writeMotionValues(fx, opts.motion);
        }
        
        app.endUndoGroup();
        undoStarted = false;
        return success("Properties updated successfully");
        
    } catch(e) {
        if (undoStarted) {
            try { app.endUndoGroup(); } catch(_e) {}
        }
        return error(e.toString());
    }
}

function _updateTypewriterTimingMarkers(layer, tw) {
    if (!layer || !(layer instanceof TextLayer)) return;
    var markers = layer.property("Marker");
    if (!markers) return;
    var inPoint = layer.inPoint;
    var markerTypes = {
        "IN_START": tw.inStart !== undefined ? (inPoint + tw.inStart) : null,
        "IN_END": tw.inEnd !== undefined ? (inPoint + tw.inEnd) : null,
        "OUT_START": (tw.noOut ? null : (tw.outStart !== undefined && tw.outStart >= 0 ? inPoint + tw.outStart : null)),
        "OUT_END": (tw.noOut ? null : (tw.outEnd !== undefined && tw.outEnd >= 0 ? inPoint + tw.outEnd : null)),
        "BLINK_START": tw.blinkStart !== undefined && tw.blinkStart >= 0 ? (inPoint + tw.blinkStart) : null,
        "BLINK_END": tw.blinkEnd !== undefined && tw.blinkEnd >= 0 ? (inPoint + tw.blinkEnd) : null
    };
    var MARKER_LABELS = { "IN_START": 3, "IN_END": 3, "OUT_START": 1, "OUT_END": 1, "BLINK_START": 9, "BLINK_END": 9 };
    for (var mType in markerTypes) {
        var targetTime = markerTypes[mType];
        for (var mi = markers.numKeys; mi >= 1; mi--) {
            if (markers.keyValue(mi).comment === mType) {
                markers.removeKey(mi);
            }
        }
        if (targetTime !== null && targetTime >= 0) {
            var mVal = new MarkerValue(mType);
            mVal.label = MARKER_LABELS[mType] || 0;
            markers.setValueAtTime(targetTime, mVal);
        }
    }
}

function _writeTypewriterValues(fx, tw) {
    if (tw.twProgress !== undefined) _setSliderValue(fx, "TW Progress", tw.twProgress);
    if (tw.twAuto !== undefined) _setCheckboxValue(fx, "TW Auto", tw.twAuto);
    var _rev = tw.twReverse !== undefined ? tw.twReverse : tw.reverse;
    if (_rev !== undefined) _setCheckboxValue(fx, "TW Reverse", _rev);
    var _wm = tw.wordMode !== undefined ? tw.wordMode : tw.twWordByWord;
    if (_wm !== undefined) _setCheckboxValue(fx, "Word Mode", _wm);
    if (tw.randomSpeed !== undefined) _setSliderValue(fx, "Random Speed", tw.randomSpeed);
    if (tw.typeBlur !== undefined) {
        var blurCtrl = findEffectControl(fx, "Type Blur");
        if (blurCtrl) {
            _setSliderValue(fx, "Type Blur", tw.typeBlur);
        } else {
            addSlider(fx, "Type Blur", tw.typeBlur);
        }
        try {
            var lytw = fx.propertyGroup(1);
            if (lytw && lytw instanceof TextLayer) {
                var animsTW = lytw.property("ADBE Text Properties").property("ADBE Text Animators");
                if (animsTW) {
                    if (tw.typeBlur > 0) {
                        _setCheckboxValue(fx, "Show Cursor", false);
                        removeAnimatorsByName(animsTW, ["Cursor Blink"]);
                        var existingBlur = animsTW.property("Type Blur");
                        if (!existingBlur && typeof _createTypeBlurAnimator === "function") {
                            _createTypeBlurAnimator(animsTW, tw.typeBlur);
                        } else if (existingBlur) {
                            try {
                                var bSel = existingBlur.property("ADBE Text Selectors").property(1);
                                if (bSel) {
                                    if (typeof buildBlurRangeExpr === "function") bSel.property("ADBE Text Percent Start").expression = buildBlurRangeExpr();
                                    if (typeof buildBlurRangeEndExpr === "function") bSel.property("ADBE Text Percent End").expression = buildBlurRangeEndExpr();
                                    var bAdv = bSel.property("ADBE Text Range Advanced");
                                    if (bAdv && bAdv.property("ADBE Text Range Amount")) {
                                        if (typeof buildBlurRangeAmountExpr === "function") {
                                            bAdv.property("ADBE Text Range Amount").expression = buildBlurRangeAmountExpr();
                                        }
                                    }
                                }
                                var bProps = existingBlur.property("ADBE Text Animator Properties");
                                var bProp = bProps ? bProps.property("ADBE Text Blur") : null;
                                if (bProp && typeof buildBlurAmountExpr === "function") {
                                    bProp.expression = buildBlurAmountExpr();
                                }
                            } catch(_eUpB) {}
                        }
                    } else {
                        removeAnimatorsByName(animsTW, ["Type Blur"]);
                    }
                }
            }
        } catch(eTB) {}
    }
    if (tw.showCursor !== undefined) {
        var curTb = _getSliderValue(fx, "Type Blur", 0);
        if (tw.showCursor && curTb > 0) {
            _setSliderValue(fx, "Type Blur", 0);
            try {
                var lyCur = fx.propertyGroup(1);
                if (lyCur && lyCur instanceof TextLayer) {
                    var aCur = lyCur.property("ADBE Text Properties").property("ADBE Text Animators");
                    if (aCur) removeAnimatorsByName(aCur, ["Type Blur"]);
                }
            } catch(_eRmT) {}
            _setCheckboxValue(fx, "Show Cursor", true);
        } else {
            _setCheckboxValue(fx, "Show Cursor", curTb > 0 ? false : tw.showCursor);
        }
    }
    if (tw.cursorBefore !== undefined) _setCheckboxValue(fx, "Cursor Before Text", tw.cursorBefore);
    if (tw.cursorType !== undefined) _setSliderValue(fx, "Cursor Type", tw.cursorType);
    if (tw.cursorColor !== undefined) _setColorValue(fx, "Cursor Color", tw.cursorColor);
    if (tw.cursorSpacing !== undefined) _setSliderValue(fx, "Cursor Spacing", tw.cursorSpacing);
    if (tw.blinkSpeed !== undefined) _setSliderValue(fx, "Blink Speed", tw.blinkSpeed);
    if (tw.blinkInHold !== undefined) _setCheckboxValue(fx, "Blink In Hold", tw.blinkInHold);
    if (tw.boxRTL !== undefined) _setCheckboxValue(fx, "Box RTL", tw.boxRTL);
    if (tw.liveText !== undefined) _setCheckboxValue(fx, "Live Text", tw.liveText);
    
    // Text Color
    if (tw.applyTextColor === false) {
        try {
            var lyRmTC = fx.propertyGroup(1);
            if (lyRmTC && lyRmTC instanceof TextLayer) {
                var aRmTC = lyRmTC.property("ADBE Text Properties").property("ADBE Text Animators");
                if (aRmTC) removeAnimatorsByName(aRmTC, ["Color Control"]);
            }
            if (typeof removeEffectControls === "function") removeEffectControls(fx, ["Text Color"]);
        } catch(_eRmTC) {}
    } else if (tw.textColor !== undefined) {
        var textColorCtrl = findEffectControl(fx, "Text Color");
        if (textColorCtrl) {
            _setColorValue(fx, "Text Color", tw.textColor);
        } else if (tw.applyTextColor === true) {
            try {
                var lytc = fx.propertyGroup(1);
                if (lytc && lytc instanceof TextLayer) {
                    var anims = lytc.property("ADBE Text Properties").property("ADBE Text Animators");
                    _ensureTextColorAnimator(lytc, anims, fx, tw.textColor);
                }
            } catch(eTC) {
                $.writeln("[TEXTORO] _writeTypewriterValues: Could not create Text Color animator: " + eTC.toString());
            }
        } else {
            try {
                var lyOrphan = fx.propertyGroup(1);
                if (lyOrphan && lyOrphan instanceof TextLayer) {
                    var aOrphan = lyOrphan.property("ADBE Text Properties").property("ADBE Text Animators");
                    if (aOrphan) removeAnimatorsByName(aOrphan, ["Color Control"]);
                }
            } catch(_eOrph) {}
        }
    }
    
    if (tw.easingType !== undefined) _setSliderValue(fx, "Easing Type", tw.easingType);
    if (tw.easingStrength !== undefined) _setSliderValue(fx, "Easing Strength", tw.easingStrength);

    // Custom cursor char & Text & Timing Markers
    try {
        var layer = fx.propertyGroup(1);
        if (layer && layer instanceof TextLayer) {
            if (tw.cursorType === -1 && tw.customCursor !== undefined) {
                var curMarkers = layer.property("Marker");
                if (curMarkers) {
                    var curFound = false;
                    for (var ci = 1; ci <= curMarkers.numKeys; ci++) {
                        var cmv = curMarkers.keyValue(ci);
                        if (cmv.comment && cmv.comment.indexOf("CURSOR_CHAR:") === 0) {
                            cmv.comment = "CURSOR_CHAR:" + tw.customCursor;
                            curMarkers.setValueAtKey(ci, cmv);
                            curFound = true;
                            break;
                        }
                    }
                    if (!curFound && tw.customCursor !== "") {
                        var ncm = new MarkerValue("CURSOR_CHAR:" + tw.customCursor);
                        ncm.label = 9;
                        curMarkers.setValueAtTime(0.001, ncm);
                    }
                }
            }
            if (tw.customText !== undefined && tw.customText !== null) {
                var textProp = layer.property("ADBE Text Properties").property("ADBE Text Document");
                var curDoc = textProp.value;
                if (curDoc.text !== tw.customText) {
                    curDoc.text = tw.customText;
                    textProp.setValue(curDoc);
                    _updateTextMarker(layer.property("Marker"), tw.customText);
                }
            }
            if (tw.inStart !== undefined && tw.inEnd !== undefined) {
                _updateTypewriterTimingMarkers(layer, tw);
            }
        }
    } catch(_eTwEx) {}
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
        if (bx.cornerRadius !== undefined && bx.cornerRadius !== null) {
        _setSliderValue(fx, "Corner Radius", bx.cornerRadius);
        _setSliderValue(fx, "Corner TL", bx.cornerRadius);
        _setSliderValue(fx, "Corner TR", bx.cornerRadius);
        _setSliderValue(fx, "Corner BR", bx.cornerRadius);
        _setSliderValue(fx, "Corner BL", bx.cornerRadius);
    }
    }
    
    if (bx.strokeWidth !== undefined) _setSliderValue(fx, "Stroke Width", bx.strokeWidth);
    if (bx.strokeOpacity !== undefined) _setSliderValue(fx, "Stroke Opacity", bx.strokeOpacity);
    if (bx.strokeColor !== undefined) _setColorValue(fx, "Stroke Color", bx.strokeColor);
    if (bx.strokeDash !== undefined) _setSliderValue(fx, "Stroke Dash", bx.strokeDash);
    if (bx.strokeGap !== undefined) _setSliderValue(fx, "Stroke Gap", bx.strokeGap);
    if (bx.fillOpacity !== undefined) _setSliderValue(fx, "Fill Opacity", bx.fillOpacity);
    if (bx.fillColor !== undefined) _setColorValue(fx, "Fill Color", bx.fillColor);
    if (bx.trimStart !== undefined) _setSliderValue(fx, "Trim Start", bx.trimStart);
    if (bx.trimEnd !== undefined) _setSliderValue(fx, "Trim End", bx.trimEnd);
    if (bx.trimOffset !== undefined) _setSliderValue(fx, "Trim Offset", bx.trimOffset);
    if (bx.pathOffset !== undefined) _setSliderValue(fx, "Path Offset", bx.pathOffset);
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
    // Physics Dynamics
    _ensureMotionControl(fx, "Spring Stiffness", mt.springStiffness, 180, "slider");
    _ensureMotionControl(fx, "Spring Damping", mt.springDamping, 18, "slider");
    _ensureMotionControl(fx, "Spring Mass", mt.springMass, 1.0, "slider");
    _ensureMotionControl(fx, "Spring Velocity Boost", mt.springVelocityBoost, 0, "slider");
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
        if (!comp) return error("Open a composition first");
        
        var layers = getSelectedTextLayers(comp);
        if (layers.length === 0) return error("Select text layers");
        
        app.beginUndoGroup("TEXTORO - Inspector Multi Update");
        undoStarted = true;
        
        var updatedCount = 0;
        
        for (var i = 0; i < layers.length; i++) {
            var layer = layers[i];
            var fx = layer.property("ADBE Effect Parade");
            var hasTW = hasTypewriter(layer);
            var hasBX = hasBox(layer, comp);
            var layerUpdated = false;
            
            // تحديث قيم Typewriter إذا كان موجوداً
            if (hasTW && opts.typewriter) {
                _writeTypewriterValues(fx, opts.typewriter);
                layerUpdated = true;
            }
            
            // تحديث قيم Box إذا كان موجوداً
            if (hasBX && opts.box) {
                _writeBoxValues(fx, opts.box);
                layerUpdated = true;
            }
            
            // تحديث قيم Motion إذا كان موجوداً
            var hasMT = typeof hasMotion === "function" ? hasMotion(layer) : false;
            if (CONFIG && CONFIG.DEBUG) $.writeln("[TEXTORO Inspector] hasMotion: " + hasMT + ", opts.motion: " + (opts.motion ? "yes" : "no"));
            if (hasMT && opts.motion) {
                $.writeln("[TEXTORO Inspector] Motion OUT values: posLinkMode=" + opts.motion.posLinkMode);
                _writeMotionValues(fx, opts.motion);
                layerUpdated = true;
            }

            if (layerUpdated) updatedCount++;
        }
        
        app.endUndoGroup();
        undoStarted = false;
        return success("Updated " + updatedCount + " layers");
        
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
                if (CONFIG && CONFIG.DEBUG) $.writeln("[TEXTORO] _setColorValue: Unknown value type for " + name);
                return;
            }
            
            // التأكد من أن القيم بين 0 و 1
            if (rgbValue[0] > 1 || rgbValue[1] > 1 || rgbValue[2] > 1) {
                rgbValue = [rgbValue[0] / 255, rgbValue[1] / 255, rgbValue[2] / 255];
            }
            
            addColor(fx, name, rgbValue);
            if (CONFIG && CONFIG.DEBUG) $.writeln("[TEXTORO] _setColorValue: Created missing control: " + name + " = [" + rgbValue.join(", ") + "]");
            return;
        } catch(e) {
            if (CONFIG && CONFIG.DEBUG) $.writeln("[TEXTORO] _setColorValue: Control not found and cannot create: " + name + " - " + e.toString());
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
            if (CONFIG && CONFIG.DEBUG) $.writeln("[TEXTORO] _setColorValue: Unknown value type for " + name);
            return;
        }
        
        // التأكد من أن القيم بين 0 و 1
        if (rgbValue[0] > 1 || rgbValue[1] > 1 || rgbValue[2] > 1) {
            // القيم بين 0-255، نحولها إلى 0-1
            rgbValue = [rgbValue[0] / 255, rgbValue[1] / 255, rgbValue[2] / 255];
        }
        
        ctrl.property(1).setValue(rgbValue);
        if (CONFIG && CONFIG.DEBUG) $.writeln("[TEXTORO] _setColorValue: Set " + name + " = [" + rgbValue.join(", ") + "]");
    } catch(e) {
        if (CONFIG && CONFIG.DEBUG) $.writeln("[TEXTORO] _setColorValue ERROR: " + name + " - " + e.toString());
    }
}

function _ensureMotionControl(fx, name, value, defaultVal, type) {
    if (value === undefined || value === null) return;
    var finalValue = value;
    var ctrl = findEffectControl(fx, name);
    
    if (!ctrl) {
        try {
            if (type === "checkbox") addCheckbox(fx, name, finalValue);
            else addSlider(fx, name, finalValue);
        if (CONFIG && CONFIG.DEBUG) $.writeln("[TEXTORO] _ensureMotionControl: Created " + name + " = " + finalValue);
        } catch(e) {
            if (CONFIG && CONFIG.DEBUG) $.writeln("[TEXTORO] _ensureMotionControl ERROR creating " + name + ": " + e.toString());
        }
    } else {
        try {
            if (type === "checkbox") ctrl.property(1).setValue(finalValue ? 1 : 0);
            else ctrl.property(1).setValue(finalValue);
        if (CONFIG && CONFIG.DEBUG) $.writeln("[TEXTORO] _ensureMotionControl: Updated " + name + " = " + finalValue);
        } catch(e) {
            if (CONFIG && CONFIG.DEBUG) $.writeln("[TEXTORO] _ensureMotionControl ERROR updating " + name + ": " + e.toString());
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
        
        // استثناء المؤشر فقط عندما يكون المؤشر مفعلاً
        colorSelector.property("ADBE Text Percent End").expression = 
            'var show = 1; try { show = effect("Show Cursor")(1).value; } catch(e) { show = 1; }; ' +
            'var before = 0; try { before = effect("Cursor Before Text")(1).value; } catch(e) { before = 0; }; ' +
            'var txt = text.sourceText + ""; var len = txt.length; ' +
            '(show == 1 && before == 0 && len > 0) ? ((len - 1) / len) * 100 : 100;';
        
        var colorProp = colorAnimator.property("ADBE Text Animator Properties").addProperty("ADBE Text Fill Color");
        colorProp.expression = 'effect("Text Color")(1);';
        
        $.writeln("[TEXTORO] _ensureTextColorAnimator: Created Color Control animator");
    }
}

$.writeln("[TEXTORO] InspectorManager module loaded!");




// Backward compatibility aliases
var InspectorManager = this;
var SogaManager = InspectorManager;
