/**
 * TEXTORO - Layer Operations Module
 * عمليات على الطبقات والـ Markers
 * v3.0.0 - نظام موثوق للتعامل مع Markers
 * 
 * Dependencies: Config.jsx, Utilities.jsx
 */

$.writeln("[TEXTORO] Loading LayerOperations module...");

// Module load flag
var LAYEROPERATIONS_MODULE_LOADED = true;

// ═══════════════════════════════════════════════════════════════════
// LAYER OPERATIONS - عمليات على الطبقات
// ═══════════════════════════════════════════════════════════════════

/**
 * إزاحة الطبقات المحددة في Timeline
 */
function offsetSelectedLayers(optsJSON) {
    var undoStarted = false; // F-05
    try {
        var opts = safeJSONParse(optsJSON, null);
        if (!opts) return error("Invalid options JSON");
        
        var offset = opts.offset || 0;
        
        var comp = getActiveComp();
        if (!comp) return error("افتح Composition أولاً");
        
        var selectedLayers = comp.selectedLayers;
        if (selectedLayers.length === 0) return error("حدد طبقات أولاً");
        
        app.beginUndoGroup("TEXTORO - Offset Layers");
        undoStarted = true;

        var count = 0;
        for (var i = 0; i < selectedLayers.length; i++) {
            var layer = selectedLayers[i];
            layer.startTime = Math.max(0, layer.startTime + offset);
            count++;
        }

        app.endUndoGroup();
        undoStarted = false;
        return success("تم إزاحة " + count + " طبقات", { count: count });

    } catch(e) {
        if (undoStarted) {
            try { app.endUndoGroup(); } catch(_e) {}
        }
        return error(e.toString());
    }
}

/**
 * Stagger الطبقات المحددة
 */
function staggerSelectedLayers(optsJSON) {
    var undoStarted = false; // F-05
    try {
        var opts = safeJSONParse(optsJSON, null);
        if (!opts) return error("Invalid options JSON");
        
        var delay = opts.delay || 0.5;
        var order = opts.order || "asc";
        
        var comp = getActiveComp();
        if (!comp) return error("افتح Composition أولاً");
        
        var selectedLayers = comp.selectedLayers;
        if (selectedLayers.length === 0) return error("حدد طبقات أولاً");
        
        // نسخ الطبقات لمصفوفة
        var layers = [];
        for (var i = 0; i < selectedLayers.length; i++) {
            layers.push({
                layer: selectedLayers[i],
                index: selectedLayers[i].index,
                startTime: selectedLayers[i].startTime
            });
        }
        
        // ترتيب حسب index
        layers.sort(function(a, b) { return a.index - b.index; });
        
        // تطبيق الترتيب المطلوب
        if (order === "desc") {
            layers.reverse();
        } else if (order === "random") {
            for (var i = layers.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var temp = layers[i];
                layers[i] = layers[j];
                layers[j] = temp;
            }
        }
        
        app.beginUndoGroup("TEXTORO - Stagger Layers");
        undoStarted = true;

        var baseTime = layers[0].startTime;

        for (var i = 0; i < layers.length; i++) {
            layers[i].layer.startTime = baseTime + (delay * i);
        }

        app.endUndoGroup();
        undoStarted = false;
        return success("تم Stagger " + layers.length + " طبقات", { count: layers.length });

    } catch(e) {
        if (undoStarted) {
            try { app.endUndoGroup(); } catch(_e) {}
        }
        return error(e.toString());
    }
}

/**
 * محاذاة الطبقات المحددة لوقت معين
 */
function alignSelectedLayers(optsJSON) {
    var undoStarted = false; // F-05
    try {
        var opts = safeJSONParse(optsJSON, null);
        if (!opts) return error("Invalid options JSON");
        
        var targetTime = opts.targetTime || 0;
        
        var comp = getActiveComp();
        if (!comp) return error("افتح Composition أولاً");
        
        var selectedLayers = comp.selectedLayers;
        if (selectedLayers.length === 0) return error("حدد طبقات أولاً");
        
        app.beginUndoGroup("TEXTORO - Align Layers");
        undoStarted = true;

        var count = 0;
        for (var i = 0; i < selectedLayers.length; i++) {
            selectedLayers[i].startTime = targetTime;
            count++;
        }

        app.endUndoGroup();
        undoStarted = false;
        return success("تم محاذاة " + count + " طبقات", { count: count });

    } catch(e) {
        if (undoStarted) {
            try { app.endUndoGroup(); } catch(_e) {}
        }
        return error(e.toString());
    }
}

// ═══════════════════════════════════════════════════════════════════
// MARKERS OPERATIONS - عمليات على الـ Markers
// ═══════════════════════════════════════════════════════════════════

/**
 * جمع كل markers من كل الطبقات النصية
 * يُرجع معرف فريد لكل marker (layerIndex_markerIndex)
 */
var MARKER_TIME_TOLERANCE = 0.01;

function _toNumber(value, fallback) {
    var n = parseFloat(value);
    return isNaN(n) ? fallback : n;
}

function _parseMarkerIndex(value) {
    var idx = parseInt(value, 10);
    return isNaN(idx) ? null : idx;
}

function _sortMarkerOpsDescending(a, b) {
    var aIdx = (a.markerIndex !== null && a.markerIndex !== undefined) ? a.markerIndex : -1;
    var bIdx = (b.markerIndex !== null && b.markerIndex !== undefined) ? b.markerIndex : -1;
    
    if (aIdx !== -1 || bIdx !== -1) {
        if (aIdx !== bIdx) return bIdx - aIdx;
    }
    
    if (a.time !== b.time) return b.time - a.time;
    return 0;
}

function _findMarkerByTypeTime(markerProp, markerType, markerTime, usedKeys) {
    var candidate = -1;
    for (var k = markerProp.numKeys; k >= 1; k--) {
        if (usedKeys && usedKeys[k] === true) continue;
        
        var keyType = markerProp.keyValue(k).comment || "";
        if (keyType !== markerType) continue;

        var keyTime = markerProp.keyTime(k);
        // F-13: تطابق زمني صارم فقط - لا مرشح بديل بنوع متطابق وزمن مغاير
        if (Math.abs(keyTime - markerTime) < MARKER_TIME_TOLERANCE) {
            return k;
        }
    }
    return -1;
}

function _resolveMarkerKey(markerProp, op) {
    if (!markerProp || markerProp.numKeys === 0) return -1;

    if (op.markerIndex !== null && op.markerIndex !== undefined) {
        if (op.markerIndex >= 1 && op.markerIndex <= markerProp.numKeys) {
            var idxType = markerProp.keyValue(op.markerIndex).comment || "";
            var idxTime = markerProp.keyTime(op.markerIndex);

            // F-13: يجب تطابق النوع والزمن معاً - بعد سحب marker يدوياً نرفض
            // بدل تحريك الـ marker الخطأ من نفس النوع
            if (idxType === op.type && Math.abs(idxTime - op.time) < MARKER_TIME_TOLERANCE) {
                return op.markerIndex;
            }
        }
    }

    return _findMarkerByTypeTime(markerProp, op.type, op.time, null);
}

function collectTextoroMarkers(optsJSON) {
    try {
        var comp = getActiveComp();
        if (!comp) return error("افتح Composition أولاً");
        
        var markers = [];
        var selectedIndices = {};
        for (var s = 0; s < comp.selectedLayers.length; s++) {
            selectedIndices[comp.selectedLayers[s].index] = true;
        }
        
        var knownTypes = ["IN_START", "IN_END", "OUT_START", "OUT_END", "BLINK_START", "BLINK_END"];
        
        for (var i = 1; i <= comp.numLayers; i++) {
            var layer = comp.layer(i);
            if (!(layer instanceof TextLayer)) continue;
            
            var markerProp = layer.property("Marker");
            if (!markerProp || markerProp.numKeys === 0) continue;
            
            var isLayerSelected = selectedIndices[layer.index] === true;
            
            for (var j = 1; j <= markerProp.numKeys; j++) {
                var markerValue = markerProp.keyValue(j);
                var comment = markerValue.comment || "";
                
                var isKnown = false;
                for (var k = 0; k < knownTypes.length; k++) {
                    if (comment === knownTypes[k]) { isKnown = true; break; }
                }
                
                if (isKnown) {
                    markers.push({
                        layerIndex: layer.index,
                        layerName: layer.name,
                        markerIndex: j,
                        type: comment,
                        time: markerProp.keyTime(j),
                        isLayerSelected: isLayerSelected
                    });
                }
            }
        }
        
        markers.sort(function(a, b) { return a.time - b.time; });
        
        return success("", { markers: markers, count: markers.length });
        
    } catch(e) {
        return error(e.toString());
    }
}

/**
 * إزاحة markers المحددة
 */
function offsetTextoroMarkers(optsJSON) {
    var undoStarted = false;
    try {
        var opts = safeJSONParse(optsJSON, null);
        if (!opts) return error("Invalid options JSON");
        
        var markersInput = opts.markers || [];
        var offset = _toNumber(opts.offset, 0);
        
        if (markersInput.length === 0) return error("لم يتم تحديد markers");
        if (offset === 0) return success("لا يوجد تغيير", { count: 0, markers: [] });
        
        var comp = getActiveComp();
        if (!comp) return error("افتح Composition أولاً");
        
        var layerOps = {};
        for (var i = 0; i < markersInput.length; i++) {
            var m = markersInput[i];
            var layerIndex = parseInt(m.layerIndex, 10);
            if (isNaN(layerIndex) || layerIndex <= 0) continue;
            
            if (!layerOps[layerIndex]) layerOps[layerIndex] = [];
            
            var oldTime = _toNumber(m.time, 0);
            layerOps[layerIndex].push({
                markerIndex: _parseMarkerIndex(m.markerIndex),
                type: m.type || "",
                time: oldTime,
                newTime: Math.max(0, oldTime + offset)
            });
        }
        
        app.beginUndoGroup("TEXTORO - Offset Markers");
        undoStarted = true;
        
        var count = 0;
        var updatedMarkers = [];
        
        for (var layerIdx in layerOps) {
            var layer = comp.layer(parseInt(layerIdx, 10));
            if (!layer) continue;
            
            var markerProp = layer.property("Marker");
            if (!markerProp) continue;
            
            var ops = layerOps[layerIdx];
            ops.sort(_sortMarkerOpsDescending);
            
            var usedNewKeys = {};
            for (var j = 0; j < ops.length; j++) {
                var op = ops[j];
                var keyIndex = _resolveMarkerKey(markerProp, op);
                if (keyIndex === -1) continue;
                
                var markerValue = markerProp.keyValue(keyIndex);
                markerProp.removeKey(keyIndex);
                markerProp.setValueAtTime(op.newTime, markerValue);
                
                var newKeyIndex = _findMarkerByTypeTime(markerProp, op.type, op.newTime, usedNewKeys);
                if (newKeyIndex !== -1) {
                    usedNewKeys[newKeyIndex] = true;
                    updatedMarkers.push({
                        layerIndex: layer.index,
                        markerIndex: newKeyIndex,
                        type: op.type,
                        time: markerProp.keyTime(newKeyIndex)
                    });
                }
                
                count++;
            }
        }
        
        app.endUndoGroup();
        return success("تم إزاحة " + count + " markers", { count: count, markers: updatedMarkers });
        
    } catch(e) {
        if (undoStarted) {
            try { app.endUndoGroup(); } catch(_e) {}
        }
        return error(e.toString());
    }
}

/**
 * محاذاة markers المحددة لوقت معين
 */
function alignTextoroMarkers(optsJSON) {
    var undoStarted = false;
    try {
        var opts = safeJSONParse(optsJSON, null);
        if (!opts) return error("Invalid options JSON");
        
        var markersInput = opts.markers || [];
        var targetTime = _toNumber(opts.targetTime, 0);
        
        if (markersInput.length === 0) return error("لم يتم تحديد markers");
        
        var comp = getActiveComp();
        if (!comp) return error("افتح Composition أولاً");
        
        var layerOps = {};
        for (var i = 0; i < markersInput.length; i++) {
            var m = markersInput[i];
            var layerIndex = parseInt(m.layerIndex, 10);
            if (isNaN(layerIndex) || layerIndex <= 0) continue;
            
            if (!layerOps[layerIndex]) layerOps[layerIndex] = [];
            layerOps[layerIndex].push({
                markerIndex: _parseMarkerIndex(m.markerIndex),
                type: m.type || "",
                time: _toNumber(m.time, 0),
                newTime: targetTime
            });
        }
        
        app.beginUndoGroup("TEXTORO - Align Markers");
        undoStarted = true;
        
        var count = 0;
        var updatedMarkers = [];
        
        for (var layerIdx in layerOps) {
            var layer = comp.layer(parseInt(layerIdx, 10));
            if (!layer) continue;
            
            var markerProp = layer.property("Marker");
            if (!markerProp) continue;
            
            var ops = layerOps[layerIdx];
            ops.sort(_sortMarkerOpsDescending);
            
            var usedNewKeys = {};
            for (var j = 0; j < ops.length; j++) {
                var op = ops[j];
                var keyIndex = _resolveMarkerKey(markerProp, op);
                if (keyIndex === -1) continue;
                
                var markerValue = markerProp.keyValue(keyIndex);
                markerProp.removeKey(keyIndex);
                markerProp.setValueAtTime(op.newTime, markerValue);
                
                var newKeyIndex = _findMarkerByTypeTime(markerProp, op.type, op.newTime, usedNewKeys);
                if (newKeyIndex !== -1) {
                    usedNewKeys[newKeyIndex] = true;
                    updatedMarkers.push({
                        layerIndex: layer.index,
                        markerIndex: newKeyIndex,
                        type: op.type,
                        time: markerProp.keyTime(newKeyIndex)
                    });
                }
                
                count++;
            }
        }
        
        app.endUndoGroup();
        return success("تم محاذاة " + count + " markers", { count: count, markers: updatedMarkers });
        
    } catch(e) {
        if (undoStarted) {
            try { app.endUndoGroup(); } catch(_e) {}
        }
        return error(e.toString());
    }
}

/**
 * تطبيق Stagger على markers المحددة
 * الترتيب يعتمد على layerIndex (ترتيب الطبقات في الكومبوزيشن)
 * asc = من الطبقة الأولى (index أصغر) للأخيرة
 * desc = من الطبقة الأخيرة (index أكبر) للأولى
 * random = عشوائي
 */
function staggerTextoroMarkers(optsJSON) {
    var undoStarted = false;
    try {
        var opts = safeJSONParse(optsJSON, null);
        if (!opts) return error("Invalid options JSON");
        
        var markersInput = opts.markers || [];
        var delay = _toNumber(opts.delay, 0.5);
        var order = opts.order || 'asc';
        
        if (markersInput.length === 0) return error("لم يتم تحديد markers");
        if (markersInput.length === 1) return success("marker واحد فقط", { count: 1, markers: markersInput });
        
        var comp = getActiveComp();
        if (!comp) return error("افتح Composition أولاً");
        
        var markers = [];
        for (var i = 0; i < markersInput.length; i++) {
            var layerIndex = parseInt(markersInput[i].layerIndex, 10);
            if (isNaN(layerIndex) || layerIndex <= 0) continue;
            
            markers.push({
                layerIndex: layerIndex,
                markerIndex: _parseMarkerIndex(markersInput[i].markerIndex),
                type: markersInput[i].type || "",
                time: _toNumber(markersInput[i].time, 0)
            });
        }
        if (markers.length === 0) return error("لا توجد markers صالحة");
        
        markers.sort(function(a, b) {
            if (a.layerIndex !== b.layerIndex) return a.layerIndex - b.layerIndex;
            if (a.time !== b.time) return a.time - b.time;
            return (a.markerIndex || 0) - (b.markerIndex || 0);
        });
        
        if (order === 'desc') {
            markers.reverse();
        } else if (order === 'random') {
            for (var r = markers.length - 1; r > 0; r--) {
                var j = Math.floor(Math.random() * (r + 1));
                var temp = markers[r];
                markers[r] = markers[j];
                markers[j] = temp;
            }
        }
        
        var baseTime = markers[0].time;
        for (var k = 1; k < markers.length; k++) {
            if (markers[k].time < baseTime) {
                baseTime = markers[k].time;
            }
        }
        
        var layerOps = {};
        for (var x = 0; x < markers.length; x++) {
            var op = {
                markerIndex: markers[x].markerIndex,
                type: markers[x].type,
                time: markers[x].time,
                newTime: Math.max(0, baseTime + (x * delay))
            };
            
            if (!layerOps[markers[x].layerIndex]) layerOps[markers[x].layerIndex] = [];
            layerOps[markers[x].layerIndex].push(op);
        }
        
        app.beginUndoGroup("TEXTORO - Stagger Markers");
        undoStarted = true;
        
        var count = 0;
        var updatedMarkers = [];
        
        for (var layerIdx in layerOps) {
            var layer = comp.layer(parseInt(layerIdx, 10));
            if (!layer) continue;
            
            var markerProp = layer.property("Marker");
            if (!markerProp) continue;
            
            var ops = layerOps[layerIdx];
            ops.sort(_sortMarkerOpsDescending);
            
            var usedNewKeys = {};
            for (var z = 0; z < ops.length; z++) {
                var current = ops[z];
                var keyIndex = _resolveMarkerKey(markerProp, current);
                if (keyIndex === -1) continue;
                
                var markerValue = markerProp.keyValue(keyIndex);
                markerProp.removeKey(keyIndex);
                markerProp.setValueAtTime(current.newTime, markerValue);
                
                var newKeyIndex = _findMarkerByTypeTime(markerProp, current.type, current.newTime, usedNewKeys);
                if (newKeyIndex !== -1) {
                    usedNewKeys[newKeyIndex] = true;
                    updatedMarkers.push({
                        layerIndex: layer.index,
                        markerIndex: newKeyIndex,
                        type: current.type,
                        time: markerProp.keyTime(newKeyIndex)
                    });
                }
                
                count++;
            }
        }
        
        app.endUndoGroup();
        return success("تم تطبيق Stagger على " + count + " markers", { count: count, markers: updatedMarkers });
        
    } catch(e) {
        if (undoStarted) {
            try { app.endUndoGroup(); } catch(_e) {}
        }
        return error(e.toString());
    }
}

/**
 * حذف markers المحددة
 */
function deleteTextoroMarkers(optsJSON) {
    var undoStarted = false;
    try {
        var opts = safeJSONParse(optsJSON, null);
        if (!opts) return error("Invalid options JSON");
        
        var markersInput = opts.markers || [];
        if (markersInput.length === 0) return error("لم يتم تحديد markers");
        
        var comp = getActiveComp();
        if (!comp) return error("افتح Composition أولاً");
        
        var layerOps = {};
        for (var i = 0; i < markersInput.length; i++) {
            var m = markersInput[i];
            var layerIndex = parseInt(m.layerIndex, 10);
            if (isNaN(layerIndex) || layerIndex <= 0) continue;
            
            if (!layerOps[layerIndex]) layerOps[layerIndex] = [];
            layerOps[layerIndex].push({
                markerIndex: _parseMarkerIndex(m.markerIndex),
                type: m.type || "",
                time: _toNumber(m.time, 0)
            });
        }
        
        app.beginUndoGroup("TEXTORO - Delete Markers");
        undoStarted = true;
        
        var count = 0;
        for (var layerIdx in layerOps) {
            var layer = comp.layer(parseInt(layerIdx, 10));
            if (!layer) continue;
            
            var markerProp = layer.property("Marker");
            if (!markerProp) continue;
            
            var ops = layerOps[layerIdx];
            ops.sort(_sortMarkerOpsDescending);
            
            for (var j = 0; j < ops.length; j++) {
                var op = ops[j];
                var keyIndex = _resolveMarkerKey(markerProp, op);
                if (keyIndex === -1) continue;
                
                markerProp.removeKey(keyIndex);
                count++;
            }
        }
        
        app.endUndoGroup();
        return success("تم حذف " + count + " markers", { count: count, markers: [] });
        
    } catch(e) {
        if (undoStarted) {
            try { app.endUndoGroup(); } catch(_e) {}
        }
        return error(e.toString());
    }
}

// ═══════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * إنشاء طبقة نص جديدة
 */
function createNewTextLayer() {
    var undoStarted = false; // F-05
    try {
        var comp = getActiveComp();
        if (!comp) return error("افتح Composition أولاً");

        app.beginUndoGroup("TEXTORO - New Text Layer");
        undoStarted = true;

        var textLayer = comp.layers.addText("TEXTORO");
        textLayer.name = "TEXTORO";
        textLayer.property("Position").setValue([comp.width/2, comp.height/2]);

        app.endUndoGroup();
        undoStarted = false;
        return success("تم إنشاء طبقة نص جديدة");

    } catch(e) {
        if (undoStarted) {
            try { app.endUndoGroup(); } catch(_e) {}
        }
        return error(e.toString());
    }
}

/**
 * الحصول على معلومات التحديد
 */
function getSelectionInfo() {
    try {
        var comp = getActiveComp();
        if (!comp) return success("", { hasComp: false });
        
        var sel = comp.selectedLayers;
        var textLayers = [];
        
        for (var i = 0; i < sel.length; i++) {
            if (sel[i] instanceof TextLayer) {
                textLayers.push({
                    index: sel[i].index,
                    name: sel[i].name
                });
            }
        }
        
        return success("", {
            hasComp: true,
            compName: comp.name,
            selectedCount: sel.length,
            textLayerCount: textLayers.length,
            textLayers: textLayers
        });
        
    } catch(e) {
        return error(e.toString());
    }
}

$.writeln("[TEXTORO] LayerOperations module loaded!");
