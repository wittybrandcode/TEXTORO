/**
 * TEXTORO - Multi-Lines Manager Module
 * إدارة تقسيم الأسطر المتعددة
 * v1.0.0
 * 
 * Dependencies: Config.jsx, Utilities.jsx, TypewriterManager.jsx, BoxManager.jsx
 */

$.writeln("[TEXTORO] Loading MultiLinesManager module...");

// Module load flag
var MULTILINESMANAGER_MODULE_LOADED = true;

// ═══════════════════════════════════════════════════════════════════
// MULTI-SELECTION HELPERS
// ═══════════════════════════════════════════════════════════════════

// NOTE: getSelectedTextLayers() is defined in Utilities.jsx (Single Source of Truth)
// All modules should use the shared function from Utilities.jsx

/**
 * التحقق من عدد طبقات النص المحددة
 */
function getMultiSelectionInfo() {
    try {
        var comp = getActiveComp();
        if (!comp) return success("", { count: 0 });
        
        var layers = getSelectedTextLayers(comp);
        return success("", { count: layers.length });
        
    } catch(e) {
        return success("", { count: 0 });
    }
}

// ═══════════════════════════════════════════════════════════════════
// SPLIT TEXT TO LAYERS
// ═══════════════════════════════════════════════════════════════════

/**
 * تقسيم النص المتعدد الأسطر إلى طبقات منفصلة
 */
function splitTextToLayers(optsJSON) {
    var manageUndo = false;
    try {
        var opts = safeJSONParse(optsJSON, null);
        if (!opts) return error("Invalid options JSON");
        
        var comp = getActiveComp();
        if (!comp) return error("افتح Composition أولاً");
        
        var sourceLayer = getSelectedTextLayer(comp);
        if (!sourceLayer) return error("اختر طبقة نص");
        
        var textProp = sourceLayer.property("ADBE Text Properties").property("ADBE Text Document");
        var textDoc = textProp.value;
        var fullText = textDoc.text;
        
        var lines = fullText.split(/\r\n|\r|\n/);
        var validLines = [];
        for (var i = 0; i < lines.length; i++) {
            if (lines[i].length > 0) validLines.push(lines[i]);
        }
        
        if (validLines.length < 2) {
            return error("النص لا يحتوي على أسطر متعددة");
        }
        
        manageUndo = !opts._skipUndo;
        if (manageUndo) app.beginUndoGroup("TEXTORO - Split Lines");
        
        var lineSpacing = opts.lineSpacing || 10;
        var alignment = opts.alignment || "center";
        var deleteOriginal = opts.deleteOriginal === true;
        
        var sourcePos = sourceLayer.property("Position").value;
        var sourceRect = sourceLayer.sourceRectAtTime(0, false);
        var totalHeight = sourceRect.height;
        
        var createdLayerRefs = [];
        var layerPositions = [];
        var currentY = sourcePos[1] - totalHeight / 2;
        
        // حساب المواضع
        for (var i = 0; i < validLines.length; i++) {
            var tempLayer = comp.layers.addText(validLines[i]);
            var lineRect = tempLayer.sourceRectAtTime(0, false);
            var lineHeight = lineRect.height;
            
            var xPos;
            if (alignment === "left") {
                xPos = sourcePos[0] - sourceRect.width / 2 + lineRect.width / 2;
            } else if (alignment === "right") {
                xPos = sourcePos[0] + sourceRect.width / 2 - lineRect.width / 2;
            } else {
                xPos = sourcePos[0];
            }
            
            var yPos = currentY + lineHeight / 2;
            currentY += lineHeight + lineSpacing;
            
            layerPositions.push({ x: xPos, y: yPos });
            tempLayer.remove();
        }
        
        // إنشاء الطبقات
        for (var i = validLines.length - 1; i >= 0; i--) {
            var newLayer = comp.layers.addText(validLines[i]);
            newLayer.name = sourceLayer.name + "_L" + (i + 1);
            
            var newTextProp = newLayer.property("ADBE Text Properties").property("ADBE Text Document");
            var newDoc = newTextProp.value;
            newDoc.font = textDoc.font;
            newDoc.fontSize = textDoc.fontSize;
            newDoc.fillColor = textDoc.fillColor;
            try {
                if (textDoc.strokeWidth > 0) {
                    newDoc.strokeColor = textDoc.strokeColor;
                    newDoc.strokeWidth = textDoc.strokeWidth;
                }
            } catch(e) { /* Stroke properties may not exist */ }
            newDoc.tracking = textDoc.tracking;
            newDoc.leading = textDoc.leading;
            newDoc.justification = textDoc.justification;
            newTextProp.setValue(newDoc);
            
            newLayer.property("Position").setValue([layerPositions[i].x, layerPositions[i].y]);
            createdLayerRefs.unshift(newLayer);
        }
        
        var createdLayers = [];
        for (var i = 0; i < createdLayerRefs.length; i++) {
            createdLayers.push(createdLayerRefs[i].index);
        }
        
        if (deleteOriginal) {
            sourceLayer.remove();
        } else {
            sourceLayer.enabled = false;
            sourceLayer.name = sourceLayer.name + "_Original";
        }
        
        if (manageUndo) {
            app.endUndoGroup();
            manageUndo = false;
        }
        
        return success("تم تقسيم " + validLines.length + " أسطر", {
            layers: createdLayers,
            count: validLines.length
        });
        
    } catch(e) {
        if (manageUndo) {
            try { app.endUndoGroup(); } catch(_e) {}
        }
        return error(e.toString());
    }
}

// ═══════════════════════════════════════════════════════════════════
// APPLY TO MULTIPLE LAYERS
// ═══════════════════════════════════════════════════════════════════

/**
 * تطبيق Typewriter على عدة طبقات مع Stagger
 */
function applyTypewriterMulti(optsJSON) {
    var manageUndo = false;
    try {
        var opts = safeJSONParse(optsJSON, null);
        if (!opts) return error("Invalid options JSON");
        
        var comp = getActiveComp();
        if (!comp) return error("افتح Composition أولاً");
        
        var layers = [];
        if (opts.layerIndices && opts.layerIndices.length > 0) {
            for (var i = 0; i < opts.layerIndices.length; i++) {
                var layer = comp.layer(opts.layerIndices[i]);
                if (layer && layer instanceof TextLayer) layers.push(layer);
            }
        } else {
            layers = getSelectedTextLayers(comp);
        }
        
        if (layers.length === 0) return error("لا توجد طبقات نص للتطبيق");
        
        manageUndo = !opts._skipUndo;
        if (manageUndo) app.beginUndoGroup("TEXTORO - Typewriter Multi");
        
        var stagger = opts.stagger || 0.5;
        var baseInStart = opts.inStart || 0;
        var inDuration = (opts.inEnd || 2) - baseInStart;
        
        for (var i = 0; i < layers.length; i++) {
            var layer = layers[i];
            var layerOpts = {};
            for (var key in opts) {
                if (opts.hasOwnProperty(key)) layerOpts[key] = opts[key];
            }
            
            layerOpts.inStart = baseInStart + (i * stagger);
            layerOpts.inEnd = layerOpts.inStart + inDuration;
            
            if (!opts.noOut && opts.outStart != null && opts.outEnd != null) {
                var outDuration = opts.outEnd - opts.outStart;
                layerOpts.outStart = opts.outStart + (i * stagger);
                layerOpts.outEnd = layerOpts.outStart + outDuration;
            }
            
            if (opts.blinkStart != null) layerOpts.blinkStart = opts.blinkStart + (i * stagger);
            if (opts.blinkEnd != null) layerOpts.blinkEnd = opts.blinkEnd + (i * stagger);
            
            _removeTypewriter(layer);
            _applyTypewriter(layer, layerOpts);
        }
        
        if (manageUndo) {
            app.endUndoGroup();
            manageUndo = false;
        }
        return success("تم تطبيق Typewriter على " + layers.length + " طبقات");
        
    } catch(e) {
        if (manageUndo) {
            try { app.endUndoGroup(); } catch(_e) {}
        }
        return error(e.toString());
    }
}

/**
 * إنشاء Box لعدة طبقات
 */
function createBoxMulti(optsJSON) {
    var manageUndo = false;
    try {
        var opts = safeJSONParse(optsJSON, null);
        if (!opts) return error("Invalid options JSON");
        
        var comp = getActiveComp();
        if (!comp) return error("افتح Composition أولاً");
        
        var layers = [];
        if (opts.layerIndices && opts.layerIndices.length > 0) {
            for (var i = 0; i < opts.layerIndices.length; i++) {
                var layer = comp.layer(opts.layerIndices[i]);
                if (layer && layer instanceof TextLayer) layers.push(layer);
            }
        } else {
            layers = getSelectedTextLayers(comp);
        }
        
        if (layers.length === 0) return error("لا توجد طبقات نص للتطبيق");
        
        manageUndo = !opts._skipUndo;
        if (manageUndo) app.beginUndoGroup("TEXTORO - Box Multi");
        
        for (var i = 0; i < layers.length; i++) {
            var layer = layers[i];
            var markers = layer.property("Marker");
            var hasTW = getTextFromMarker(markers) !== null;
            
            var layerOpts = {};
            for (var key in opts) {
                if (opts.hasOwnProperty(key)) layerOpts[key] = opts[key];
            }
            
            if (hasTW) layerOpts.lockBoxSize = true;
            
            _removeBox(layer, comp);
            _createBox(layer, comp, layerOpts);
        }
        
        if (manageUndo) {
            app.endUndoGroup();
            manageUndo = false;
        }
        return success("تم إنشاء Box لـ " + layers.length + " طبقات");
        
    } catch(e) {
        if (manageUndo) {
            try { app.endUndoGroup(); } catch(_e) {}
        }
        return error(e.toString());
    }
}

// ═══════════════════════════════════════════════════════════════════
// SPLIT AND APPLY COMBINED
// ═══════════════════════════════════════════════════════════════════

/**
 * تقسيم النص وتطبيق التأثيرات في عملية واحدة
 */
function splitAndApply(optsJSON) {
    var undoStarted = false;
    try {
        var opts = safeJSONParse(optsJSON, null);
        if (!opts) return error("Invalid options JSON");
        
        var comp = getActiveComp();
        if (!comp) return error("افتح Composition أولاً");
        
        var sourceLayer = getSelectedTextLayer(comp);
        if (!sourceLayer) return error("اختر طبقة نص");
        
        app.beginUndoGroup("TEXTORO - Split & Apply");
        undoStarted = true;
        
        // تقسيم النص
        var splitOpts = {
            lineSpacing: opts.lineSpacing,
            alignment: opts.alignment,
            deleteOriginal: opts.deleteOriginal,
            _skipUndo: true
        };
        
        var splitResultJSON = splitTextToLayers(JSON.stringify(splitOpts));
        var splitResult = safeJSONParse(splitResultJSON, null);
        
        if (!splitResult || !splitResult.success) {
            app.endUndoGroup();
            undoStarted = false;
            return splitResultJSON;
        }
        
        var layerIndices = splitResult.data.layers;
        
        // تطبيق Typewriter
        if (opts.applyType) {
            var typeOpts = {
                layerIndices: layerIndices,
                stagger: opts.stagger,
                direction: opts.direction,
                inStart: opts.inStart,
                inEnd: opts.inEnd,
                outStart: opts.outStart,
                outEnd: opts.outEnd,
                noOut: opts.noOut,
                showCursor: opts.showCursor,
                cursorBefore: opts.cursorBefore,
                cursorSpacing: opts.cursorSpacing,
                blinkSpeed: opts.blinkSpeed,
                blinkStart: opts.blinkStart,
                blinkEnd: opts.blinkEnd,
                blinkInHold: opts.blinkInHold,
                reverse: opts.reverse,
                randomSpeed: opts.randomSpeed,
                _skipUndo: true
            };
            
            var typeResultJSON = applyTypewriterMulti(JSON.stringify(typeOpts));
            var typeResult = safeJSONParse(typeResultJSON, null);
            
            if (!typeResult || !typeResult.success) {
                app.endUndoGroup();
                undoStarted = false;
                return error("فشل تطبيق Typewriter: " + typeResult.error);
            }
        }
        
        // تطبيق Box
        if (opts.applyBox) {
            var boxOpts = {
                layerIndices: layerIndices,
                paddingLeft: opts.paddingLeft,
                paddingRight: opts.paddingRight,
                paddingTop: opts.paddingTop,
                paddingBottom: opts.paddingBottom,
                use4Corners: opts.use4Corners,
                cornerRadius: opts.cornerRadius,
                cornerTL: opts.cornerTL,
                cornerTR: opts.cornerTR,
                cornerBL: opts.cornerBL,
                cornerBR: opts.cornerBR,
                strokeWidth: opts.strokeWidth,
                strokeOpacity: opts.strokeOpacity,
                strokeColor: opts.strokeColor,
                fillOpacity: opts.fillOpacity,
                fillColor: opts.fillColor,
                lockBoxSize: true,
                _skipUndo: true
            };
            
            var boxResultJSON = createBoxMulti(JSON.stringify(boxOpts));
            var boxResult = safeJSONParse(boxResultJSON, null);
            
            if (!boxResult || !boxResult.success) {
                app.endUndoGroup();
                undoStarted = false;
                return error("فشل إنشاء Box: " + boxResult.error);
            }
        }
        
        app.endUndoGroup();
        undoStarted = false;
        
        var msg = "تم تقسيم " + splitResult.data.count + " أسطر";
        if (opts.applyType) msg += " + Typewriter";
        if (opts.applyBox) msg += " + Box";
        
        return success(msg, { layersCreated: splitResult.data.count });
        
    } catch(e) {
        if (undoStarted) {
            try { app.endUndoGroup(); } catch(_e) {}
        }
        return error(e.toString());
    }
}

$.writeln("[TEXTORO] MultiLinesManager module loaded!");
