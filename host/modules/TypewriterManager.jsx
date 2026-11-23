/**
 * TEXTORO - Typewriter Manager Module
 * إدارة تأثير الآلة الكاتبة
 * v1.4.0 - ControllerManager Integration with Smart Fallback
 * 
 * Dependencies: Config.jsx, Utilities.jsx, ControllerManager.jsx, ExpressionLoader.jsx
 * 
 * Changes in v1.4.0:
 * - Smart integration with ControllerManager
 * - Checks if createControllersFromRegistry succeeds, falls back to direct creation if not
 * - Better error logging for debugging
 * 
 * ملاحظة: الدوال المشتركة مثل getOriginalText, setOriginalText, clearOriginalText
 * موجودة في Utilities.jsx (قسم ID System)
 */

// Module load flag for verification
var TYPEWRITERMANAGER_MODULE_LOADED = true;

$.writeln("[TEXTORO] Loading TypewriterManager module...");

var CONFIG = (typeof $.global !== "undefined" && $.global.CONFIG) ? $.global.CONFIG : (typeof CONFIG !== "undefined" ? CONFIG : { DEBUG: false, TEXT: { RTL: "", LTR: "" } });
var BOX_CONFIG = (typeof $.global !== "undefined" && $.global.BOX_CONFIG) ? $.global.BOX_CONFIG : (typeof BOX_CONFIG !== "undefined" ? BOX_CONFIG : {});


// ═══════════════════════════════════════════════════════════════════
// TYPEWRITER PUBLIC API - الواجهة العامة
// ═══════════════════════════════════════════════════════════════════

/**
 * تطبيق تأثير Typewriter على طبقة نصية
 * @param {string} optsJSON - JSON string containing options
 * @returns {string} JSON result
 */
function applyTypewriter(optsJSON) {
    var undoStarted = false;
    try {
        var opts = safeJSONParse(optsJSON, null);
        if (!opts) return error("Invalid options JSON");
        
        var comp = getActiveComp();
        if (!comp) return error("Open a composition first");
        
        var textLayer = getSelectedTextLayer(comp);
        
        if (!textLayer) {
            // إنشاء طبقة نص جديدة
            app.beginUndoGroup("TEXTORO - Create");
            undoStarted = true;
            var txt = _getDefaultText(opts);
            textLayer = comp.layers.addText(txt);
            textLayer.name = "TEXTORO";
            textLayer.property("Position").setValue([comp.width/2, comp.height/2]);
        } else {
            app.beginUndoGroup("TEXTORO - Typewriter");
            undoStarted = true;
            // إذا أدخل المستخدم نص مخصص، استخدمه
            if (_hasCustomText(opts)) {
                var textProp = textLayer.property("ADBE Text Properties").property("ADBE Text Document");
                var doc = textProp.value;
                doc.text = String(opts.customText);
                textProp.setValue(doc);
            }
        }
        
        // إزالة التأثير القديم إن وجد
        _removeTypewriter(textLayer);
        
        // تطبيق التأثير الجديد
        _applyTypewriter(textLayer, opts);
        
        app.endUndoGroup();
        undoStarted = false;
        return success("Done!");
        
    } catch(e) {
        if (undoStarted) {
            try { app.endUndoGroup(); } catch(_e) {}
        }
        return error(e.toString());
    }
}

/**
 * إزالة تأثير Typewriter
 * @returns {string} JSON result
 */
function removeTypewriter() {
    var undoStarted = false;
    try {
        var comp = getActiveComp();
        if (!comp) return error("Open a composition first");
        
        var textLayer = getSelectedTextLayer(comp);
        if (!textLayer) return error("Select a text layer");
        
        app.beginUndoGroup("TEXTORO - Remove");
        undoStarted = true;
        _removeTypewriter(textLayer);
        app.endUndoGroup();
        undoStarted = false;
        
        return success("Removed successfully");
        
    } catch(e) {
        if (undoStarted) {
            try { app.endUndoGroup(); } catch(_e) {}
        }
        return error(e.toString());
    }
}

/**
 * جلب النص من الطبقة المحددة
 * @returns {string} JSON result with text
 */
function getLayerText() {
    try {
        var comp = getActiveComp();
        if (!comp) return error("Open a composition first");
        
        var textLayer = getSelectedTextLayer(comp);
        if (!textLayer) return error("Select a text layer");
        
        // 1. الأولوية الأولى: جلب النص الأصلي من Layer Comment
        var textFromComment = (typeof getOriginalText === "function") ? getOriginalText(textLayer) : null;
        var cleanComment = (typeof txStripCursor === "function") ? txStripCursor(textFromComment) : textFromComment;
        if (cleanComment && cleanComment.length > 0) {
            return success("Success", cleanComment);
        }
        
        // 2. الأولوية الثانية: جلب النص الأصلي من Marker القديم (TW_TEXT:)
        var markers = textLayer.property("Marker");
        var textFromMarker = (typeof getTextFromMarker === "function") ? getTextFromMarker(markers) : null;
        var cleanMarker = (typeof txStripCursor === "function") ? txStripCursor(textFromMarker) : textFromMarker;
        if (cleanMarker && cleanMarker.length > 0) {
            return success("Success", cleanMarker);
        }
        
        // 3. Fallback: جلب النص من Text Document مباشرة مع تجريد رموز المؤشر
        var textProp = textLayer.property("ADBE Text Properties").property("ADBE Text Document");
        var currentText = (textProp && textProp.value) ? (textProp.value.text || "") : "";
        var cleanText = (typeof txStripCursor === "function") ? txStripCursor(currentText) : currentText;
        return success("Success", cleanText);
        
    } catch(e) {
        return error(e.toString());
    }
}

/**
 * تحديث النص في الطبقة المحددة
 * @param {string} optsJSON - {text: string}
 * @returns {string} JSON result
 */
function updateLayerText(optsJSON) {
    var undoStarted = false;
    try {
        var opts = safeJSONParse(optsJSON, null);
        if (!opts) return error("Invalid options JSON");
        if (opts.text === undefined || opts.text === null) return error("Missing text parameter");
        
        var comp = getActiveComp();
        if (!comp) return error("Open a composition first");
        
        var textLayer = getSelectedTextLayer(comp);
        if (!textLayer) return error("Select a text layer");
        
        app.beginUndoGroup("TEXTORO - Update Text");
        undoStarted = true;
        
        var hasTW = hasTypewriter(textLayer);
        
        if (hasTW) {
            // تحديث Layer Comment (للتخزين)
            setOriginalText(textLayer, opts.text);

            // تحديث Marker (للـ Expression)
            _updateTextMarker(textLayer.property("Marker"), opts.text);

            // N-04: وضع Live Text - نحدّث نص الطبقة نفسه لتنعكس التعديلات فوراً
            try {
                var fxForLive = textLayer.property("ADBE Effect Parade");
                var liveCtl = (typeof findEffectControl === "function")
                    ? findEffectControl(fxForLive, "Live Text") : null;
                if (liveCtl && liveCtl.property(1).value === 1) {
                    var tpDoc = textLayer.property("ADBE Text Properties").property("ADBE Text Document");
                    var docVal = tpDoc.value;
                    docVal.text = String(opts.text);
                    tpDoc.setValue(docVal);
                }
            } catch (_liveErr) {
                $.writeln("[TEXTORO] updateLayerText live-sync skipped: " + _liveErr.toString());
            }
        } else {
            // تحديث النص مباشرة
            var textProp = textLayer.property("ADBE Text Properties").property("ADBE Text Document");
            var doc = textProp.value;
            doc.text = opts.text;
            textProp.setValue(doc);
        }
        
        // تحديث قيم Lock للصندوق (إن وجد)
        _updateBoxLockValues(textLayer);
        
        app.endUndoGroup();
        undoStarted = false;
        return success("Text updated successfully");
        
    } catch(e) {
        if (undoStarted) {
            try { app.endUndoGroup(); } catch(_e) {}
        }
        return error(e.toString());
    }
}

/**
 * التحقق من وجود Typewriter على الطبقة
 * @param {Layer} layer - الطبقة
 * @returns {boolean}
 */
/**
 * تحديث خصائص المؤشر مباشرة في الطبقة المحددة دون إعادة إنشاء التأثير بالكامل
 * @param {string} optsJSON - خيارات المؤشر
 * @returns {string} JSON result
 */
function updateTypewriterCursor(optsJSON) {
    var undoStarted = false;
    try {
        var comp = getActiveComp();
        if (!comp) return error("Open a composition first");
        
        var textLayer = getSelectedTextLayer(comp);
        if (!textLayer) return error("Select a text layer");
        if (!hasTypewriter(textLayer)) return error("Layer does not contain Typewriter");
        
        var opts = safeJSONParse(optsJSON, null);
        if (!opts) return error("Invalid options JSON");
        
        var fx = textLayer.property("ADBE Effect Parade");
        if (!fx) return error("No effect parade");
        
        app.beginUndoGroup("TEXTORO - Update Cursor");
        undoStarted = true;
        
        // تحديث سلايدر نوع المؤشر
        var cursorTypeSlider = fx.property("Cursor Type");
        if (cursorTypeSlider && opts.type !== undefined) {
            var parsedType = parseInt(opts.type, 10);
            if (isNaN(parsedType)) parsedType = 0;
            cursorTypeSlider.property(1).setValue(parsedType);
        }
        
        // تحديث لون المؤشر
        var cursorColorProp = fx.property("Cursor Color");
        if (cursorColorProp && opts.color) {
            try {
                if (typeof hexToRgb === "function") {
                    cursorColorProp.property(1).setValue(hexToRgb(opts.color));
                }
            } catch(_eColor) {}
        }
        
        // تحديث رمز المؤشر المخصص في الـ Markers
        if ((opts.type === -1 || parseInt(opts.type, 10) === -1) && opts.custom !== undefined) {
            var markers = textLayer.property("Marker");
            if (markers) {
                var found = false;
                for (var i = 1; i <= markers.numKeys; i++) {
                    var mVal = markers.keyValue(i);
                    if (mVal.comment && mVal.comment.indexOf("CURSOR_CHAR:") === 0) {
                        mVal.comment = "CURSOR_CHAR:" + opts.custom;
                        markers.setValueAtKey(i, mVal);
                        found = true;
                        break;
                    }
                }
                if (!found && opts.custom !== "") {
                    var newMarker = new MarkerValue("CURSOR_CHAR:" + opts.custom);
                    newMarker.label = 9;
                    markers.setValueAtTime(0.001, newMarker);
                }
            }
        }
        
        app.endUndoGroup();
        undoStarted = false;
        return success("Cursor updated successfully");
        
    } catch(e) {
        if (undoStarted) {
            try { app.endUndoGroup(); } catch(_e) {}
        }
        return error(e.toString());
    }
}

function hasTypewriter(layer) {
    if (!layer) return false;
    
    // النظام الجديد: التحقق من اسم الطبقة
    var status = getLayerStatus(layer);
    if (status.hasTypewriter) return true;
    
    // التوافق مع الطبقات القديمة: التحقق من Marker
    var markers = layer.property("Marker");
    return getTextFromMarker(markers) !== null;
}

// ═══════════════════════════════════════════════════════════════════
// TYPEWRITER INTERNAL - الدوال الداخلية
// ═══════════════════════════════════════════════════════════════════

/**
 * تطبيق Typewriter داخلياً
 */
function _applyTypewriter(textLayer, opts) {
    if (CONFIG && CONFIG.DEBUG) $.writeln("[TEXTORO] _applyTypewriter called");
    
    var fx = textLayer.property("ADBE Effect Parade");
    var textProp = textLayer.property("ADBE Text Properties").property("ADBE Text Document");
    var markers = textLayer.property("Marker");
    var animators = textLayer.property("ADBE Text Properties").property("ADBE Text Animators");
    
    // الحصول على النص الأصلي
    var originalText = textProp.value.text;
    
    // تخزين النص في Layer Comment
    setOriginalText(textLayer, originalText);
    
    // تحديث اسم الطبقة مع flag T
    updateLayerFlags(textLayer, true, false);
    
    // استخراج الخيارات
    var timing = _extractTiming(opts);
    var cursorOpts = _extractCursorOptions(opts);
    var isRTL = (opts.direction == "rtl");
    
    // ─────────────────────────────────────────────────────────────
    // Effect Controls - استخدام ControllerManager مع Fallback ذكي
    // ─────────────────────────────────────────────────────────────
    if (CONFIG && CONFIG.DEBUG) $.writeln("[TEXTORO] Creating typewriter controllers...");
    
    // تحضير القيم للـ Controllers
    var typeBlur = _numOrDefault(opts.typeBlur, 0);
    if (typeBlur > 0) {
        cursorOpts.show = false; // تعطيل المؤشر تماماً عند تفعيل الـ Blur لعدم التوافق البصري
    }
    var controllerValues = {
        "TW Progress": 0,
        "TW Auto": true,
        "TW Reverse": opts.reverse || false,
        "Word Mode": opts.wordMode || false,
        "Random Speed": _numOrDefault(opts.randomSpeed, 0),
        "Type Blur": typeBlur,
        "Show Cursor": (typeBlur > 0) ? false : cursorOpts.show,
        "Cursor Before Text": cursorOpts.before,
        "Cursor Type": cursorOpts.type,
        "Cursor Color": cursorOpts.color,
        "Cursor Spacing": cursorOpts.spacing,
        "Blink Speed": cursorOpts.blinkSpeed,
        "Blink In Hold": cursorOpts.blinkInHold,
        "Box RTL": isRTL,
        "Live Text": (opts.liveText !== false), // N-04: مفعل افتراضياً
        "Easing Type": _numOrDefault(opts.easingType, 1),
        "Easing Strength": _numOrDefault(opts.easingStrength, 100)
    };
    
    // محاولة استخدام ControllerManager
    var useControllerManager = false;
    if (typeof createControllersFromRegistry === "function") {
        if (CONFIG && CONFIG.DEBUG) $.writeln("[TEXTORO] Attempting ControllerManager for typewriter...");
        useControllerManager = createControllersFromRegistry(textLayer, "typewriter", controllerValues);
        if (CONFIG && CONFIG.DEBUG) $.writeln("[TEXTORO] ControllerManager result: " + useControllerManager);
    }
    
    // Fallback إذا فشل ControllerManager
    if (!useControllerManager) {
        if (CONFIG && CONFIG.DEBUG) $.writeln("[TEXTORO] Using direct controller creation (fallback)");
        addSlider(fx, "TW Progress", 0);
        addCheckbox(fx, "TW Auto", true);
        addCheckbox(fx, "TW Reverse", opts.reverse || false);
        addCheckbox(fx, "Word Mode", opts.wordMode || false);
        addSlider(fx, "Random Speed", _numOrDefault(opts.randomSpeed, 0));
        addSlider(fx, "Type Blur", typeBlur);
        addCheckbox(fx, "Show Cursor", (typeBlur > 0) ? false : cursorOpts.show);
        addCheckbox(fx, "Cursor Before Text", cursorOpts.before);
        addSlider(fx, "Cursor Type", cursorOpts.type);
        addColor(fx, "Cursor Color", cursorOpts.color);
        addSlider(fx, "Cursor Spacing", cursorOpts.spacing);
        addSlider(fx, "Blink Speed", cursorOpts.blinkSpeed);
        addCheckbox(fx, "Blink In Hold", cursorOpts.blinkInHold);
        addCheckbox(fx, "Box RTL", isRTL);
        addCheckbox(fx, "Live Text", opts.liveText !== false); // N-04
        addSlider(fx, "Easing Type", _numOrDefault(opts.easingType, 1));
        addSlider(fx, "Easing Strength", _numOrDefault(opts.easingStrength, 100));
    }
    
    if (CONFIG && CONFIG.DEBUG) $.writeln("[TEXTORO] Typewriter controllers created successfully");
    
    // ─────────────────────────────────────────────────────────────
    // Markers
    // ─────────────────────────────────────────────────────────────
    _createTypewriterMarkers(textLayer, markers, originalText, timing, cursorOpts);
    
    // ─────────────────────────────────────────────────────────────
    // sourceText Expression
    // ─────────────────────────────────────────────────────────────
    textProp.expression = buildSourceTextExpr();
    
    // ─────────────────────────────────────────────────────────────
    // Animators (Cursor Blink & Type Blur)
    // ─────────────────────────────────────────────────────────────
    removeAnimatorsByName(animators, ["Cursor Blink", "Type Blur"]);
    if (typeBlur <= 0 && cursorOpts.show) {
        _createCursorAnimator(animators);
    }
    if (typeBlur > 0 || (opts.enableBlur === true)) {
        _createTypeBlurAnimator(animators, typeBlur);
    }
    
    // ─────────────────────────────────────────────────────────────
    // Text Color (إذا كان مفعلاً)
    // ─────────────────────────────────────────────────────────────
    if (opts.applyTextColor) {
        _applyTextColorAnimator(textLayer, animators, fx, opts.textColor);
    }
}

/**
 * إزالة Typewriter داخلياً
 */
function _removeTypewriter(textLayer) {
    var textProp = textLayer.property("ADBE Text Properties").property("ADBE Text Document");
    var fx = textLayer.property("ADBE Effect Parade");
    var animators = textLayer.property("ADBE Text Properties").property("ADBE Text Animators");
    var markers = textLayer.property("Marker");
    
    // استرجاع النص الأصلي
    var originalText = getOriginalText(textLayer);
    if (!originalText) {
        originalText = getTextFromMarker(markers);
    }
    
    // إزالة Expression
    if (textProp.expressionEnabled) {
        textProp.expression = "";
        textProp.expressionEnabled = false;
    }
    
    // استعادة النص الأصلي
    if (originalText) {
        var doc = textProp.value;
        doc.text = originalText;
        textProp.setValue(doc);
    }
    
    // ═══════════════════════════════════════════════════════════════
    // إزالة Controllers - استخدام ControllerManager مع Fallback
    // ═══════════════════════════════════════════════════════════════
    var removed = false;
    if (typeof removeControllersFromRegistry === "function") {
        if (CONFIG && CONFIG.DEBUG) $.writeln("[TEXTORO] Attempting ControllerManager to remove typewriter controllers...");
        removed = removeControllersFromRegistry(textLayer, "typewriter");
    }
    
    // Fallback: إزالة مباشرة
    if (!removed) {
        if (CONFIG && CONFIG.DEBUG) $.writeln("[TEXTORO] Using direct controller removal (fallback)");
        var controls = [
            "TW Progress", "TW Auto", "TW Reverse", "Random Speed",
            "Show Cursor", "Cursor Before Text", "Cursor Type", "Cursor Color", "Cursor Spacing",
            "Blink Speed", "Blink In Hold", "Box RTL", "Text Color",
            "Easing Type", "Easing Strength", "Word Mode", "Live Text", "Type Blur"
        ];
        removeEffectControls(fx, controls);
    }
    
    // إزالة Animators
    removeAnimatorsByName(animators, ["Cursor Blink", "Color Control", "Type Blur"]);
    
    // إزالة Markers
    removeMarkers(markers, ["IN_START", "IN_END", "OUT_START", "OUT_END", "BLINK_START", "BLINK_END", "TW_TEXT:", "CURSOR_CHAR:"]);
    
    // مسح النص من Layer Comment
    clearOriginalText(textLayer);
    
    // إزالة flag T من اسم الطبقة
    removeLayerFlag(textLayer, "T");
}

// ═══════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS - دوال مساعدة
// ═══════════════════════════════════════════════════════════════════

function _hasCustomText(opts) {
    return (opts.customText != null && opts.customText != undefined && String(opts.customText).length > 0);
}

function _getDefaultText(opts) {
    if (_hasCustomText(opts)) {
        return String(opts.customText);
    }
    var cfg = (typeof $.global !== "undefined" && $.global.CONFIG) ? $.global.CONFIG : ((typeof CONFIG !== "undefined" && CONFIG) ? CONFIG : null);
    var rtlDefault = (cfg && cfg.TEXT && cfg.TEXT.RTL) ? cfg.TEXT.RTL : "\u0623\u0637\u0644\u0642 \u0627\u0644\u0646\u0635 \u0623\u0637\u0644\u0642 \u0627\u0644\u062B\u0648\u0631";
    var ltrDefault = (cfg && cfg.TEXT && cfg.TEXT.LTR) ? cfg.TEXT.LTR : "Unleash the Text";
    return (opts.direction == "rtl") ? rtlDefault : ltrDefault;
}

function _extractTiming(opts) {
    var inStart = _toNumberOrDefault(opts.inStart, 2);
    var inEnd = _toNumberOrDefault(opts.inEnd, 3);
    var outStart = _toNumberOrDefault(opts.outStart, -1);
    var outEnd = _toNumberOrDefault(opts.outEnd, -1);
    var blinkStart = _toNumberOrDefault(opts.blinkStart, 1);
    var blinkEnd = _toNumberOrDefault(opts.blinkEnd, 10);
    var noOut = (opts.noOut === true);

    // F-M1 (علّة اختفاء markers): setValueAtTime في AE يستبدل أي مفتاح بنفس الزمن.
    // التسلسل القديم كان ينتج BLINK_START و IN_START عند نفس اللحظة (مثال: 1.005)
    // فيبتلع أحدهما الآخر. الآن نفرض فجوة دنيا بين كل مفتاحين متتاليين مع الحفاظ
    // على نوايا المستخدم إن كانت أكبر.
    var GAP = 0.02; // نصف فريم على 25fps

    blinkStart = Math.max(blinkStart, 0);
    inStart   = Math.max(inStart,   blinkStart + GAP);
    inEnd     = Math.max(inEnd,     inStart   + GAP);

    if (!noOut && outStart >= 0) {
        outStart  = Math.max(outStart, inEnd   + GAP);
        outEnd    = Math.max(outEnd,   outStart + GAP);
        blinkEnd  = Math.max(blinkEnd, outEnd  + GAP);
    } else {
        blinkEnd  = Math.max(blinkEnd, inEnd   + GAP);
    }

    return {
        inStart: inStart,
        inEnd: inEnd,
        outStart: outStart,
        outEnd: outEnd,
        blinkStart: blinkStart,
        blinkEnd: blinkEnd,
        noOut: noOut
    };
}

function _numOrDefault(val, fallback) {
    if (val === "" || val === null || val === undefined || typeof val === "boolean") {
        return fallback;
    }
    var n = Number(val);
    return isNaN(n) ? fallback : n;
}

function _toNumberOrDefault(value, defaultValue) {
    if (value === null || value === undefined || value === "") return defaultValue;
    var n = parseFloat(value);
    return isNaN(n) ? defaultValue : n;
}

function _extractCursorOptions(opts) {
    return {
        show: (opts.showCursor !== false),
        before: (opts.cursorBefore === true),
        type: parseInt(opts.cursorType, 10) || 0,
        custom: (opts.customCursor || ""),
        color: (opts.cursorColor || "#ffffff"),
        spacing: _toNumberOrDefault(opts.cursorSpacing, 0),
        blinkSpeed: _toNumberOrDefault(opts.blinkSpeed, 2),
        blinkInHold: (opts.blinkInHold !== false)
    };
}

function _createTypewriterMarkers(textLayer, markers, originalText, timing, cursorOpts) {
    var MARKER_COLORS = { TEXT: 16, CURSOR: 9, IN: 3, OUT: 1, BLINK: 9 };
    var inPoint = (textLayer && textLayer.inPoint !== undefined) ? textLayer.inPoint : 0;
    
    // TW_TEXT marker
    var twTextMarker = new MarkerValue("TW_TEXT:" + originalText);
    twTextMarker.label = MARKER_COLORS.TEXT;
    markers.setValueAtTime(0, twTextMarker);
    
    // Custom cursor marker
    if (cursorOpts.type === -1 && cursorOpts.custom !== "") {
        var cursorMarker = new MarkerValue("CURSOR_CHAR:" + cursorOpts.custom);
        cursorMarker.label = MARKER_COLORS.CURSOR;
        markers.setValueAtTime(0.001, cursorMarker);
    }
    
    // Blink start
    var blinkStartMarker = new MarkerValue("BLINK_START");
    blinkStartMarker.label = MARKER_COLORS.BLINK;
    markers.setValueAtTime(inPoint + timing.blinkStart, blinkStartMarker);
    
    // IN markers
    var inStartMarker = new MarkerValue("IN_START");
    inStartMarker.label = MARKER_COLORS.IN;
    markers.setValueAtTime(inPoint + timing.inStart, inStartMarker);
    
    var inEndMarker = new MarkerValue("IN_END");
    inEndMarker.label = MARKER_COLORS.IN;
    markers.setValueAtTime(inPoint + timing.inEnd, inEndMarker);
    
    // OUT markers
    if (!timing.noOut && timing.outStart >= 0 && timing.outEnd >= 0) {
        var outStartMarker = new MarkerValue("OUT_START");
        outStartMarker.label = MARKER_COLORS.OUT;
        markers.setValueAtTime(inPoint + timing.outStart, outStartMarker);
        
        var outEndMarker = new MarkerValue("OUT_END");
        outEndMarker.label = MARKER_COLORS.OUT;
        markers.setValueAtTime(inPoint + timing.outEnd, outEndMarker);
    }
    
    // Blink end
    var blinkEndMarker = new MarkerValue("BLINK_END");
    blinkEndMarker.label = MARKER_COLORS.BLINK;
    markers.setValueAtTime(inPoint + timing.blinkEnd, blinkEndMarker);
}

function _createCursorAnimator(animators) {
    var cursorAnim = animators.addProperty("ADBE Text Animator");
    cursorAnim.name = "Cursor Blink";
    
    var cursorSel = cursorAnim.property("ADBE Text Selectors").addProperty("ADBE Text Selector");
    cursorSel.property("ADBE Text Percent Start").expression = buildCursorRangeExpr();
    cursorSel.property("ADBE Text Percent End").expression = buildCursorRangeEndExpr();
    
    var animProps = cursorAnim.property("ADBE Text Animator Properties");
    
    // Opacity - الوميض
    var cursorOpacity = animProps.addProperty("ADBE Text Opacity");
    cursorOpacity.expression = buildCursorBlinkExpr();
    
    // Fill Color - لون المؤشر
    var cursorFillColor = animProps.addProperty("ADBE Text Fill Color");
    cursorFillColor.expression = 'effect("Cursor Color")(1)';
}

function _createTypeBlurAnimator(animators, blurAmount) {
    var blurAnim = animators.addProperty("ADBE Text Animator");
    blurAnim.name = "Type Blur";
    
    var blurSel = blurAnim.property("ADBE Text Selectors").addProperty("ADBE Text Selector");
    if (typeof buildBlurRangeExpr === "function") {
        blurSel.property("ADBE Text Percent Start").expression = buildBlurRangeExpr();
    }
    if (typeof buildBlurRangeEndExpr === "function") {
        blurSel.property("ADBE Text Percent End").expression = buildBlurRangeEndExpr();
    }
    
    try {
        var advanced = blurSel.property("ADBE Text Range Advanced");
        if (advanced && advanced.property("ADBE Text Range Shape")) {
            advanced.property("ADBE Text Range Shape").setValue(2); // Ramp Down for natural optical decay
        }
    } catch (_advErr) {}
    
    var animProps = blurAnim.property("ADBE Text Animator Properties");
    var blurProp = animProps.addProperty("ADBE Text Blur");
    if (typeof buildBlurAmountExpr === "function") {
        blurProp.expression = buildBlurAmountExpr();
    } else {
        blurProp.expression = 'var b = 0; try { b = effect("Type Blur")(1).value; } catch(e) { b = 0; }; [b, b];';
    }
}

function _applyTextColorAnimator(textLayer, animators, fx, textColor) {
    var textProp = textLayer.property("ADBE Text Properties").property("ADBE Text Document");
    var currentTextColor = textProp.value.fillColor;
    addColor(fx, "Text Color", textColor || currentTextColor);
    
    var colorAnimator = animators.addProperty("ADBE Text Animator");
    colorAnimator.name = "Color Control";
    var colorSelector = colorAnimator.property("ADBE Text Selectors").addProperty("ADBE Text Selector");
    colorSelector.property("ADBE Text Percent Start").expression = 
        'var show = 1; try { show = effect("Show Cursor")(1).value; } catch(e) { show = 1; } ' +
        'var before = 0; try { before = effect("Cursor Before Text")(1).value; } catch(e) { before = 0; } ' +
        'var txt = text.sourceText + ""; var len = txt.length; ' +
        '(show == 1 && before == 1 && len > 0) ? (1 / len) * 100 : 0;';
    
    // استثناء المؤشر من Text Color
    colorSelector.property("ADBE Text Percent End").expression = 
        'var show = 1; try { show = effect("Show Cursor")(1).value; } catch(e) { show = 1; } ' +
        'var before = 0; try { before = effect("Cursor Before Text")(1).value; } catch(e) { before = 0; } ' +
        'var txt = text.sourceText + ""; var len = txt.length; ' +
        '(show == 1 && before == 0 && len > 1) ? ((len - 1) / len) * 100 : 100;';
    
    var colorProp = colorAnimator.property("ADBE Text Animator Properties").addProperty("ADBE Text Fill Color");
    colorProp.expression = 'effect("Text Color")(1);';
}

function _updateTextMarker(markers, newText) {
    // إزالة الـ marker القديم
    for (var m = markers.numKeys; m >= 1; m--) {
        var comment = markers.keyValue(m).comment;
        if (comment.indexOf("TW_TEXT:") === 0) {
            markers.removeKey(m);
            break;
        }
    }
    // إضافة الـ marker الجديد
    markers.setValueAtTime(0, new MarkerValue("TW_TEXT:" + newText));
}

function _updateBoxLockValues(textLayer) {
    var fx = textLayer.property("ADBE Effect Parade");
    
    var lockedRight = findEffectControl(fx, "Locked Right");
    if (!lockedRight) return;
    
    var textRect = textLayer.sourceRectAtTime(0, false);
    
    var lockedLeft = findEffectControl(fx, "Locked Left");
    var lockedWidth = findEffectControl(fx, "Locked Width");
    var lockedHeight = findEffectControl(fx, "Locked Height");
    var lockedTop = findEffectControl(fx, "Locked Top");
    
    if (lockedLeft) lockedLeft.property(1).setValue(textRect.left);
    if (lockedRight) lockedRight.property(1).setValue(textRect.left + textRect.width);
    if (lockedWidth) lockedWidth.property(1).setValue(textRect.width);
    if (lockedHeight) lockedHeight.property(1).setValue(textRect.height);
    if (lockedTop) lockedTop.property(1).setValue(textRect.top);
}

// ═══════════════════════════════════════════════════════════════════
// NOTE: Layer Text Storage functions (getOriginalText, setOriginalText, clearOriginalText)
// are defined in index.jsx (ID System section) as they are shared with BoxManager
// ═══════════════════════════════════════════════════════════════════

$.writeln("[TEXTORO] TypewriterManager module loaded!");
