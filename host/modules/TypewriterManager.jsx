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
        if (!comp) return error("افتح Composition أولاً");
        
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
        return success("تم!");
        
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
        if (!comp) return error("افتح Composition أولاً");
        
        var textLayer = getSelectedTextLayer(comp);
        if (!textLayer) return error("اختر طبقة نص");
        
        app.beginUndoGroup("TEXTORO - Remove");
        undoStarted = true;
        _removeTypewriter(textLayer);
        app.endUndoGroup();
        undoStarted = false;
        
        return success("تم الإزالة");
        
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
        if (!comp) return error("افتح Composition أولاً");
        
        var textLayer = getSelectedTextLayer(comp);
        if (!textLayer) return error("اختر طبقة نص");
        
        // النظام الجديد: جلب من Layer Comment
        // N-04: في وضع Live Text النص الحقيقي هو قيمة الطبقة نفسها
        try {
            if (hasTypewriter(textLayer)) {
                var fxl = textLayer.property("ADBE Effect Parade");
                var lc = (typeof findEffectControl === "function")
                    ? findEffectControl(fxl, "Live Text") : null;
                if (lc && lc.property(1).value === 1) {
                    var tpd = textLayer.property("ADBE Text Properties").property("ADBE Text Document");
                    return success("تم", String(tpd.value.text));
                }
            }
        } catch (_eLive) {}

        var textFromComment = getOriginalText(textLayer);
        if (textFromComment) {
            return success("تم", textFromComment);
        }
        
        // التوافق: جلب من Marker القديم
        var markers = textLayer.property("Marker");
        var textFromMarker = getTextFromMarker(markers);
        if (textFromMarker) {
            return success("تم", textFromMarker);
        }
        
        // إذا لم يوجد، جلب النص مباشرة
        var textProp = textLayer.property("ADBE Text Properties").property("ADBE Text Document");
        var currentText = textProp.value.text;
        return success("تم", currentText);
        
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
        
        var comp = getActiveComp();
        if (!comp) return error("افتح Composition أولاً");
        
        var textLayer = getSelectedTextLayer(comp);
        if (!textLayer) return error("اختر طبقة نص");
        
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
        return success("تم تحديث النص");
        
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
    $.writeln("[TEXTORO] _applyTypewriter called");
    
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
    $.writeln("[TEXTORO] Creating typewriter controllers...");
    
    // تحضير القيم للـ Controllers
    var controllerValues = {
        "TW Progress": 0,
        "TW Auto": true,
        "TW Reverse": opts.reverse || false,
        "Word Mode": opts.wordMode || false,
        "Random Speed": opts.randomSpeed || 0,
        "Show Cursor": cursorOpts.show,
        "Cursor Before Text": cursorOpts.before,
        "Cursor Type": cursorOpts.type,
        "Cursor Color": cursorOpts.color,
        "Cursor Spacing": cursorOpts.spacing,
        "Blink Speed": cursorOpts.blinkSpeed,
        "Blink In Hold": cursorOpts.blinkInHold,
        "Box RTL": isRTL,
        "Live Text": (opts.liveText !== false), // N-04: مفعل افتراضياً
        "Easing Type": opts.easingType || 1,
        "Easing Strength": opts.easingStrength || 100
    };
    
    // محاولة استخدام ControllerManager
    var useControllerManager = false;
    if (typeof createControllersFromRegistry === "function") {
        if (CONFIG.DEBUG) $.writeln("[TEXTORO] Attempting ControllerManager for typewriter...");
        useControllerManager = createControllersFromRegistry(textLayer, "typewriter", controllerValues);
        if (CONFIG.DEBUG) $.writeln("[TEXTORO] ControllerManager result: " + useControllerManager);
    }
    
    // Fallback إذا فشل ControllerManager
    if (!useControllerManager) {
        $.writeln("[TEXTORO] Using direct controller creation (fallback)");
        addSlider(fx, "TW Progress", 0);
        addCheckbox(fx, "TW Auto", true);
        addCheckbox(fx, "TW Reverse", opts.reverse || false);
        addCheckbox(fx, "Word Mode", opts.wordMode || false);
        addSlider(fx, "Random Speed", opts.randomSpeed || 0);
        addCheckbox(fx, "Show Cursor", cursorOpts.show);
        addCheckbox(fx, "Cursor Before Text", cursorOpts.before);
        addSlider(fx, "Cursor Type", cursorOpts.type);
        addColor(fx, "Cursor Color", cursorOpts.color);
        addSlider(fx, "Cursor Spacing", cursorOpts.spacing);
        addSlider(fx, "Blink Speed", cursorOpts.blinkSpeed);
        addCheckbox(fx, "Blink In Hold", cursorOpts.blinkInHold);
        addCheckbox(fx, "Box RTL", isRTL);
        addCheckbox(fx, "Live Text", opts.liveText !== false); // N-04
        addSlider(fx, "Easing Type", opts.easingType || 1);
        addSlider(fx, "Easing Strength", opts.easingStrength || 100);
    }
    
    $.writeln("[TEXTORO] Typewriter controllers created successfully");
    
    // ─────────────────────────────────────────────────────────────
    // Markers
    // ─────────────────────────────────────────────────────────────
    _createTypewriterMarkers(textLayer, markers, originalText, timing, cursorOpts);
    
    // ─────────────────────────────────────────────────────────────
    // sourceText Expression
    // ─────────────────────────────────────────────────────────────
    textProp.expression = buildSourceTextExpr();
    
    // ─────────────────────────────────────────────────────────────
    // Cursor Blink Animator
    // ─────────────────────────────────────────────────────────────
    removeAnimatorsByName(animators, ["Cursor Blink"]);
    _createCursorAnimator(animators);
    
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
        $.writeln("[TEXTORO] Attempting ControllerManager to remove typewriter controllers...");
        removed = removeControllersFromRegistry(textLayer, "typewriter");
    }
    
    // Fallback: إزالة مباشرة
    if (!removed) {
        $.writeln("[TEXTORO] Using direct controller removal (fallback)");
        var controls = [
            "TW Progress", "TW Auto", "TW Reverse", "Random Speed",
            "Show Cursor", "Cursor Before Text", "Cursor Type", "Cursor Color", "Cursor Spacing",
            "Blink Speed", "Blink In Hold", "Box RTL", "Text Color",
            "Easing Type", "Easing Strength", "Word Mode"
        ];
        removeEffectControls(fx, controls);
    }
    
    // إزالة Animators
    removeAnimatorsByName(animators, ["Cursor Blink", "Color Control"]);
    
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
    return (opts.direction == "rtl") ? CONFIG.TEXT.RTL : CONFIG.TEXT.LTR;
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

function _toNumberOrDefault(value, defaultValue) {
    if (value === null || value === undefined || value === "") return defaultValue;
    var n = parseFloat(value);
    return isNaN(n) ? defaultValue : n;
}

function _extractCursorOptions(opts) {
    return {
        show: (opts.showCursor !== false),
        before: (opts.cursorBefore === true),
        type: parseInt(opts.cursorType) || 0,
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
    cursorSel.property("ADBE Text Percent End").setValue(100);
    
    var animProps = cursorAnim.property("ADBE Text Animator Properties");
    
    // Opacity - الوميض
    var cursorOpacity = animProps.addProperty("ADBE Text Opacity");
    cursorOpacity.expression = buildCursorBlinkExpr();
    
    // Fill Color - لون المؤشر
    var cursorFillColor = animProps.addProperty("ADBE Text Fill Color");
    cursorFillColor.expression = 'effect("Cursor Color")(1)';
}

function _applyTextColorAnimator(textLayer, animators, fx, textColor) {
    var textProp = textLayer.property("ADBE Text Properties").property("ADBE Text Document");
    var currentTextColor = textProp.value.fillColor;
    addColor(fx, "Text Color", textColor || currentTextColor);
    
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
