/**
 * TEXTORO - Box Manager Module
 * إدارة تأثير الصندوق
 * v1.5.0 - ControllerManager Integration with Smart Fallback
 * 
 * Dependencies: Config.jsx, Utilities.jsx, ControllerManager.jsx, ExpressionLoader.jsx
 * 
 * Changes in v1.5.0:
 * - Smart integration with ControllerManager
 * - Checks if createControllersFromRegistry succeeds, falls back to direct creation if not
 * - Better error logging for debugging
 * 
 * ملاحظة: BOX_CONFIG موجود في Config.jsx
 * ملاحظة: دوال Layer ID System موجودة في Utilities.jsx
 */

// Module load flag for verification
var BOXMANAGER_MODULE_LOADED = true;

$.writeln("[TEXTORO] Loading BoxManager module...");

// ═══════════════════════════════════════════════════════════════════
// LAYER ID SYSTEM - الدوال موجودة في Utilities.jsx
// generateBaseId, parseLayerName, buildLayerName, getBaseId,
// updateLayerFlags, removeLayerFlag, getLayerStatus, findBoxLayerById
// ═══════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════
// LAYER TEXT STORAGE - تخزين النص الأصلي
// Note: getOriginalText, setOriginalText, clearOriginalText are in Utilities.jsx
// ═══════════════════════════════════════════════════════════════════

/**
 * جلب جميع طبقات TEXTORO في الـ Composition
 */
function getAllTextoroLayers(comp) {
    var result = [];
    for (var i = 1; i <= comp.numLayers; i++) {
        var layer = comp.layer(i);
        if (layer instanceof TextLayer) {
            var parsed = parseLayerName(layer.name);
            if (parsed.isTextoro) {
                result.push(layer);
            }
        }
    }
    return result;
}

// ═══════════════════════════════════════════════════════════════════
// BOX PUBLIC API - الواجهة العامة
// ═══════════════════════════════════════════════════════════════════

/**
 * إنشاء Box ديناميكي حول طبقة نصية
 */
function createBox(optsJSON) {
    var undoStarted = false; // F-05: نمط موحد يمنع إغلاق مجموعة Undo لم تُفتح
    try {
        var opts = safeJSONParse(optsJSON, null);
        if (!opts) return error("Invalid options JSON");

        var comp = getActiveComp();
        if (!comp) return error("افتح Composition أولاً");

        var textLayer = getSelectedTextLayer(comp);
        if (!textLayer) return error("اختر طبقة نص");

        app.beginUndoGroup("TEXTORO - Create Box");
        undoStarted = true;

        _removeBox(textLayer, comp);
        _createBox(textLayer, comp, opts);

        app.endUndoGroup();
        undoStarted = false;
        return success("تم إنشاء الصندوق!");

    } catch(e) {
        if (undoStarted) {
            try { app.endUndoGroup(); } catch(_e) {}
        }
        return error(e.toString());
    }
}

/**
 * إزالة Box
 */
function removeBox() {
    var undoStarted = false; // F-05
    try {
        var comp = getActiveComp();
        if (!comp) return error("افتح Composition أولاً");

        var textLayer = getSelectedTextLayer(comp);
        if (!textLayer) return error("اختر طبقة نص");

        app.beginUndoGroup("TEXTORO - Remove Box");
        undoStarted = true;
        _removeBox(textLayer, comp);
        app.endUndoGroup();
        undoStarted = false;

        return success("تم إزالة الصندوق");

    } catch(e) {
        if (undoStarted) {
            try { app.endUndoGroup(); } catch(_e) {}
        }
        return error(e.toString());
    }
}

/**
 * التحقق من وجود Box
 */
function hasBox(layer, comp) {
    if (!layer || !comp) return false;

    if (CONFIG.DEBUG) $.writeln("[TEXTORO] hasBox called - layer: " + layer.name);

    // Method 1: التحقق من اسم الطبقة (الطريقة الجديدة)
    var status = getLayerStatus(layer);
    if (CONFIG.DEBUG) $.writeln("[TEXTORO] hasBox - status.hasBox: " + status.hasBox);
    if (status.hasBox) {
        var baseId = getBaseId(layer);
        var boxLayer = findBoxLayerById(comp, baseId);
        if (CONFIG.DEBUG) $.writeln("[TEXTORO] hasBox - baseId: " + baseId + ", boxLayer found: " + (boxLayer ? "yes" : "no"));
        if (baseId && boxLayer) return true;
    }
    
    // Method 2: التحقق من وجود Effect Controls للـ Box + طبقة صندوق فعلية
    var fx = layer.property("ADBE Effect Parade");
    if (fx) {
        var paddingLeft = findEffectControl(fx, "Padding Left");
        var fillOpacity = findEffectControl(fx, "Fill Opacity");
        if (paddingLeft && fillOpacity) {
            // F-09: Effect Controls وحدها لا تثبت وجود الصندوق - نبحث عن الشيب لاير فعلياً
            var guessBaseId = getBaseId(layer);
            for (var i = 1; i <= comp.numLayers; i++) {
                var l = comp.layer(i);
                if (l.parent === layer && l.name.indexOf("_Box") !== -1) {
                    return true;
                }
                if (guessBaseId && l.name.indexOf(guessBaseId + "_Box") !== -1) {
                    return true;
                }
            }
            // F-09: تحكمات بلا طبقة = صندوق شبح (حُذف الشيب لاير يدوياً)
            if (CONFIG.DEBUG) $.writeln("[TEXTORO] hasBox - ghost box detected (controls without shape layer)");
            return false;
        }
    }
    
    // Method 3: التوافق مع الطبقات القديمة
    var parsed = parseLayerName(layer.name);
    if (!parsed.isTextoro) {
        var oldBoxName = layer.name + "_Box";
        for (var j = 1; j <= comp.numLayers; j++) {
            var ol = comp.layer(j);
            if (ol.name === oldBoxName && ol.parent === layer) {
                if (CONFIG.DEBUG) $.writeln("[TEXTORO] hasBox - Found old-style box: " + ol.name);
                return true;
            }
        }
    }
    
    if (CONFIG.DEBUG) $.writeln("[TEXTORO] hasBox - No box found");
    return false;
}

// ═══════════════════════════════════════════════════════════════════
// BOX INTERNAL - CREATE
// ═══════════════════════════════════════════════════════════════════

function _createBox(textLayer, comp, opts) {
    var baseId = updateLayerFlags(textLayer, false, true);
    
    var shapeLayer = comp.layers.addShape();
    shapeLayer.name = baseId + "_Box";
    shapeLayer.label = BOX_CONFIG.LABEL_BOX;
    
    // ربط الـ Box بطبقة النص - مهم جداً للـ Expressions
    try {
        shapeLayer.parent = textLayer;
        if (CONFIG.DEBUG) $.writeln("[TEXTORO] Box parented to: " + textLayer.name);
    } catch(e) {
        $.writeln("[TEXTORO] ERROR: Could not parent box: " + e.toString());
    }
    
    var fx = textLayer.property("ADBE Effect Parade");
    var textRect = textLayer.sourceRectAtTime(0, false);
    
    // ─────────────────────────────────────────────────────────────
    // Effect Controls - استخدام ControllerManager مع Fallback ذكي
    // ─────────────────────────────────────────────────────────────
    if (CONFIG.DEBUG) $.writeln("[TEXTORO] Creating box controllers...");
    
    // تحضير القيم للـ Controllers - C-05: الافتراضيات من BOX_CONFIG.DEFAULTS
    var controllerValues = {
        // Padding
        "Padding Left": (opts.paddingLeft != null) ? opts.paddingLeft : BOX_CONFIG.DEFAULTS.PADDING_H,
        "Padding Right": (opts.paddingRight != null) ? opts.paddingRight : BOX_CONFIG.DEFAULTS.PADDING_H,
        "Padding Top": (opts.paddingTop != null) ? opts.paddingTop : BOX_CONFIG.DEFAULTS.PADDING_V,
        "Padding Bottom": (opts.paddingBottom != null) ? opts.paddingBottom : BOX_CONFIG.DEFAULTS.PADDING_V,
        // Stroke
        "Stroke Width": (opts.strokeWidth != null) ? opts.strokeWidth : BOX_CONFIG.DEFAULTS.STROKE_WIDTH,
        "Stroke Opacity": (opts.strokeOpacity != null) ? opts.strokeOpacity : BOX_CONFIG.DEFAULTS.OPACITY,
        "Stroke Color": opts.strokeColor || BOX_CONFIG.DEFAULTS.STROKE_COLOR,
        "Stroke Dash": (opts.strokeDash != null) ? opts.strokeDash : 0,
        "Stroke Gap": (opts.strokeGap != null) ? opts.strokeGap : 0,
        // Fill
        "Fill Opacity": (opts.fillOpacity != null) ? opts.fillOpacity : BOX_CONFIG.DEFAULTS.OPACITY,
        "Fill Color": opts.fillColor || BOX_CONFIG.DEFAULTS.FILL_COLOR,
        // Trim
        "Trim Start": (opts.trimStart != null) ? opts.trimStart : 0,
        "Trim End": (opts.trimEnd != null) ? opts.trimEnd : 100,
        "Trim Offset": (opts.trimOffset != null) ? opts.trimOffset : 0,
        "Path Offset": (opts.pathOffset != null) ? opts.pathOffset : 0,
        // Lock
        "Lock Box Size": opts.lockBoxSize || false,
        "Locked Width": textRect.width,
        "Locked Height": textRect.height,
        "Locked Left": textRect.left,
        "Locked Top": textRect.top,
        "Locked Right": textRect.left + textRect.width
    };
    
    // Corner - depends on use4Corners
    if (opts.use4Corners) {
        controllerValues["Corner TL"] = (opts.cornerTL !== null && opts.cornerTL !== undefined) ? opts.cornerTL : BOX_CONFIG.DEFAULTS.CORNER_RADIUS;
        controllerValues["Corner TR"] = (opts.cornerTR !== null && opts.cornerTR !== undefined) ? opts.cornerTR : BOX_CONFIG.DEFAULTS.CORNER_RADIUS;
        controllerValues["Corner BR"] = (opts.cornerBR !== null && opts.cornerBR !== undefined) ? opts.cornerBR : BOX_CONFIG.DEFAULTS.CORNER_RADIUS;
        controllerValues["Corner BL"] = (opts.cornerBL !== null && opts.cornerBL !== undefined) ? opts.cornerBL : BOX_CONFIG.DEFAULTS.CORNER_RADIUS;
    } else {
        controllerValues["Corner Radius"] = (opts.cornerRadius !== null && opts.cornerRadius !== undefined) ? opts.cornerRadius : BOX_CONFIG.DEFAULTS.CORNER_RADIUS;
    }
    
    // محاولة استخدام ControllerManager
    var useControllerManager = false;
    if (typeof createControllersFromRegistry === "function") {
        if (CONFIG.DEBUG) $.writeln("[TEXTORO] Attempting ControllerManager for box...");
        useControllerManager = createControllersFromRegistry(textLayer, "box", controllerValues);
        if (CONFIG.DEBUG) $.writeln("[TEXTORO] ControllerManager result: " + useControllerManager);
    }
    
    // Fallback إذا فشل ControllerManager
    if (!useControllerManager) {
        $.writeln("[TEXTORO] Using direct controller creation for box (fallback)");
        
        // Padding
        addSlider(fx, "Padding Left", controllerValues["Padding Left"]);
        addSlider(fx, "Padding Right", controllerValues["Padding Right"]);
        addSlider(fx, "Padding Top", controllerValues["Padding Top"]);
        addSlider(fx, "Padding Bottom", controllerValues["Padding Bottom"]);
        
        // Corner
        if (opts.use4Corners) {
            addSlider(fx, "Corner TL", controllerValues["Corner TL"]);
            addSlider(fx, "Corner TR", controllerValues["Corner TR"]);
            addSlider(fx, "Corner BR", controllerValues["Corner BR"]);
            addSlider(fx, "Corner BL", controllerValues["Corner BL"]);
        } else {
            addSlider(fx, "Corner Radius", controllerValues["Corner Radius"]);
        }
        
        // Stroke & Fill
        addSlider(fx, "Stroke Width", controllerValues["Stroke Width"]);
        addSlider(fx, "Stroke Opacity", controllerValues["Stroke Opacity"]);
        addColor(fx, "Stroke Color", controllerValues["Stroke Color"]);
        addSlider(fx, "Stroke Dash", controllerValues["Stroke Dash"]);
        addSlider(fx, "Stroke Gap", controllerValues["Stroke Gap"]);
        addSlider(fx, "Fill Opacity", controllerValues["Fill Opacity"]);
        addColor(fx, "Fill Color", controllerValues["Fill Color"]);
        
        // Trim
        addSlider(fx, "Trim Start", controllerValues["Trim Start"]);
        addSlider(fx, "Trim End", controllerValues["Trim End"]);
        addSlider(fx, "Trim Offset", controllerValues["Trim Offset"]);
        addSlider(fx, "Path Offset", controllerValues["Path Offset"]);
        
        // Lock
        addCheckbox(fx, "Lock Box Size", controllerValues["Lock Box Size"]);
        addSlider(fx, "Locked Width", controllerValues["Locked Width"]);
        addSlider(fx, "Locked Height", controllerValues["Locked Height"]);
        addSlider(fx, "Locked Left", controllerValues["Locked Left"]);
        addSlider(fx, "Locked Top", controllerValues["Locked Top"]);
        addSlider(fx, "Locked Right", controllerValues["Locked Right"]);
    }
    
    $.writeln("[TEXTORO] Box controllers created successfully");

    // ─────────────────────────────────────────────────────────────
    // Effect Controls - Text Color (اختياري - خارج ControllerManager)
    // ─────────────────────────────────────────────────────────────
    if (opts.applyTextColor) {
        var currentTextColor = textLayer.property("ADBE Text Properties").property("ADBE Text Document").value.fillColor;
        addColor(fx, "Text Color", opts.textColor || currentTextColor);
        
        var textAnimators = textLayer.property("ADBE Text Properties").property("ADBE Text Animators");
        var colorAnimator = textAnimators.addProperty("ADBE Text Animator");
        colorAnimator.name = "Color Control";
        var colorSelector = colorAnimator.property("ADBE Text Selectors").addProperty("ADBE Text Selector");
        colorSelector.property("ADBE Text Percent Start").setValue(0);
        
        // التحقق من وجود Cursor Blink Animator
        var hasCursorBlink = false;
        for (var ci = 1; ci <= textAnimators.numProperties; ci++) {
            try {
                if (textAnimators.property(ci).name === "Cursor Blink") {
                    hasCursorBlink = true;
                    break;
                }
            } catch(e) {}
        }
        
        if (hasCursorBlink) {
            // استثناء الحرف الأخير (المؤشر) من Text Color
            colorSelector.property("ADBE Text Percent End").expression = 
                'var txt = text.sourceText + ""; ' +
                'var len = txt.length; ' +
                'len > 1 ? ((len - 1) / len) * 100 : 0;';
        } else {
            colorSelector.property("ADBE Text Percent End").setValue(100);
        }
        
        var colorProp = colorAnimator.property("ADBE Text Animator Properties").addProperty("ADBE Text Fill Color");
        colorProp.expression = 'effect("Text Color")(1);';
    }
    
    // ─────────────────────────────────────────────────────────────
    // Shape Layer Contents
    // ─────────────────────────────────────────────────────────────
    var contents = shapeLayer.property("ADBE Root Vectors Group");
    var rectGroup = contents.addProperty("ADBE Vector Group");
    rectGroup.name = "Box";
    var rectContents = rectGroup.property("ADBE Vectors Group");
    
    if (opts.use4Corners) {
        _create4CornersBox(rectContents);
    } else {
        _createSimpleBox(rectContents);
    }
    
    // ─────────────────────────────────────────────────────────────
    // Trim Paths
    // ─────────────────────────────────────────────────────────────
    var trimPaths = rectContents.addProperty("ADBE Vector Filter - Trim");
    trimPaths.property("ADBE Vector Trim Start").expression = 'parent.effect("Trim Start")(1);';
    trimPaths.property("ADBE Vector Trim End").expression = 'parent.effect("Trim End")(1);';
    trimPaths.property("ADBE Vector Trim Offset").expression = 'parent.effect("Trim Offset")(1) * 360 / 100;';
    
    // ─────────────────────────────────────────────────────────────
    // Path Offset
    // ─────────────────────────────────────────────────────────────
    var offsetPaths = rectContents.addProperty("ADBE Vector Filter - Offset");
    offsetPaths.property("ADBE Vector Offset Amount").expression = 'parent.effect("Path Offset")(1);';
    offsetPaths.property("ADBE Vector Offset Line Join").setValue(2);
    
    // ─────────────────────────────────────────────────────────────
    // Finalize
    // ─────────────────────────────────────────────────────────────
    shapeLayer.transform.position.setValue([0, 0]);
    shapeLayer.moveAfter(textLayer);
    shapeLayer.locked = true;
    
    return shapeLayer;
}

// ─────────────────────────────────────────────────────────────────
// Box Shape Helpers
// ─────────────────────────────────────────────────────────────────

function _create4CornersBox(rectContents) {
    var pathGrp = rectContents.addProperty("ADBE Vector Shape - Group");
    
    var fill = rectContents.addProperty("ADBE Vector Graphic - Fill");
    fill.property("ADBE Vector Fill Color").expression = 'parent.effect("Fill Color")(1);';
    fill.property("ADBE Vector Fill Opacity").expression = _buildHideWhenEmptyExpr("Fill Opacity");
    
    var stroke = rectContents.addProperty("ADBE Vector Graphic - Stroke");
    stroke.property("ADBE Vector Stroke Color").expression = 'parent.effect("Stroke Color")(1);';
    stroke.property("ADBE Vector Stroke Width").expression = 'Math.max(0, parent.effect("Stroke Width")(1));';
    stroke.property("ADBE Vector Stroke Opacity").expression = _buildHideWhenEmptyExpr("Stroke Opacity");
    
    _addStrokeDashes(stroke);
    
    // Expression بسيط يقرأ من parent مباشرة
    var pathExpr = 
'var rect = parent.sourceRectAtTime(time, false);\n' +
'var pL = parent.effect("Padding Left")(1);\n' +
'var pR = parent.effect("Padding Right")(1);\n' +
'var pT = parent.effect("Padding Top")(1);\n' +
'var pB = parent.effect("Padding Bottom")(1);\n' +
'var w = rect.width + pL + pR;\n' +
'var h = rect.height + pT + pB;\n' +
'var cx = rect.left - pL + w/2;\n' +
'var cy = rect.top + rect.height/2 + (pB - pT)/2;\n' +
'var rTL = parent.effect("Corner TL")(1);\n' +
'var rTR = parent.effect("Corner TR")(1);\n' +
'var rBR = parent.effect("Corner BR")(1);\n' +
'var rBL = parent.effect("Corner BL")(1);\n' +
'var left = cx - w/2;\n' +
'var right = cx + w/2;\n' +
'var top = cy - h/2;\n' +
'var bottom = cy + h/2;\n' +
'var k = 0.5523;\n' +
'var pts = [\n' +
'    [left + rTL, top], [right - rTR, top], [right, top + rTR], [right, bottom - rBR],\n' +
'    [right - rBR, bottom], [left + rBL, bottom], [left, bottom - rBL], [left, top + rTL]\n' +
'];\n' +
'var inT = [[-rTL*k, 0], [0, 0], [0, -rTR*k], [0, 0], [rBR*k, 0], [0, 0], [0, rBL*k], [0, 0]];\n' +
'var outT = [[0, 0], [rTR*k, 0], [0, 0], [0, rBR*k], [0, 0], [-rBL*k, 0], [0, 0], [0, -rTL*k]];\n' +
'createPath(pts, inT, outT, true);';
    
    rectContents.property(1).property("Path").expression = pathExpr;
}

function _createSimpleBox(rectContents) {
    var rectPath = rectContents.addProperty("ADBE Vector Shape - Rect");
    rectPath.name = "Path";
    
    var fill = rectContents.addProperty("ADBE Vector Graphic - Fill");
    fill.property("ADBE Vector Fill Color").expression = 'parent.effect("Fill Color")(1);';
    fill.property("ADBE Vector Fill Opacity").expression = _buildHideWhenEmptyExpr("Fill Opacity");
    
    var stroke = rectContents.addProperty("ADBE Vector Graphic - Stroke");
    stroke.property("ADBE Vector Stroke Color").expression = 'parent.effect("Stroke Color")(1);';
    stroke.property("ADBE Vector Stroke Width").expression = 'Math.max(0, parent.effect("Stroke Width")(1));';
    stroke.property("ADBE Vector Stroke Opacity").expression = _buildHideWhenEmptyExpr("Stroke Opacity");
    
    _addStrokeDashes(stroke);
    
    var pathProp = rectContents.property(1);
    pathProp.property("ADBE Vector Rect Roundness").expression = 'Math.max(0, parent.effect("Corner Radius")(1));';
    pathProp.property("ADBE Vector Rect Size").expression = _buildRectSizeExpr();
    pathProp.property("ADBE Vector Rect Position").expression = _buildRectPositionExpr();
}

function _addStrokeDashes(stroke) {
    var dashes = stroke.property("ADBE Vector Stroke Dashes");
    var dash1 = dashes.addProperty("ADBE Vector Stroke Dash 1");
    dash1.expression = 'parent.effect("Stroke Dash")(1)';
    var gap1 = dashes.addProperty("ADBE Vector Stroke Gap 1");
    gap1.expression = 'var g = parent.effect("Stroke Gap")(1); g > 0 ? g : parent.effect("Stroke Dash")(1)';
}

// ═══════════════════════════════════════════════════════════════════
// BOX INTERNAL - REMOVE
// ═══════════════════════════════════════════════════════════════════

function _removeBox(textLayer, comp) {
    var baseId = getBaseId(textLayer);
    var boxLayer = null;
    
    if (baseId) {
        boxLayer = findBoxLayerById(comp, baseId);
    }
    
    // Fallback للتوافق
    if (!boxLayer) {
        var parsed = parseLayerName(textLayer.name);
        if (!parsed.isTextoro) {
            var oldBoxName = textLayer.name + "_Box";
            for (var i = comp.numLayers; i >= 1; i--) {
                var layer = comp.layer(i);
                if (layer.name === oldBoxName && layer.parent === textLayer) {
                    boxLayer = layer;
                    break;
                }
            }
        }
    }
    
    if (boxLayer) {
        boxLayer.locked = false;
        boxLayer.remove();
    }
    
    // ═══════════════════════════════════════════════════════════════
    // إزالة Controllers - استخدام ControllerManager مع Fallback
    // ═══════════════════════════════════════════════════════════════
    var removed = false;
    if (typeof removeControllersFromRegistry === "function") {
        if (CONFIG.DEBUG) $.writeln("[TEXTORO] Attempting ControllerManager to remove box controllers...");
        removed = removeControllersFromRegistry(textLayer, "box");
    }
    
    // Fallback: إزالة مباشرة
    if (!removed) {
        $.writeln("[TEXTORO] Using direct controller removal for box (fallback)");
        var fx = textLayer.property("ADBE Effect Parade");
        var boxControls = [
            "Padding Left", "Padding Right", "Padding Top", "Padding Bottom",
            "Corner Radius", "Corner TL", "Corner TR", "Corner BR", "Corner BL",
            "Stroke Width", "Stroke Opacity", "Stroke Color", "Stroke Dash", "Stroke Gap",
            "Fill Opacity", "Fill Color", "Text Color",
            "Trim Start", "Trim End", "Trim Offset", "Path Offset",
            "Lock Box Size", "Locked Width", "Locked Height",
            "Locked Left", "Locked Top", "Locked Right"
        ];
        removeEffectControls(fx, boxControls);
    }
    
    // إزالة Color Control Animator
    var animators = textLayer.property("ADBE Text Properties").property("ADBE Text Animators");
    removeAnimatorsByName(animators, ["Color Control"]);
    
    removeLayerFlag(textLayer, "B");
}

$.writeln("[TEXTORO] BoxManager module loaded!");
