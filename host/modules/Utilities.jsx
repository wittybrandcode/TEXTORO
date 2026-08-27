/**
 * TEXTORO - Utilities Module
 * الدوال المساعدة والأدوات المشتركة
 * v1.2.0
 * 
 * Dependencies: None (base module)
 * 
 * This module provides:
 * - Response helpers (success, error)
 * - Validation helpers (validateNumber, validateBoolean)
 * - Color conversion (hexToRgb, rgbToHex)
 * - Composition helpers (getActiveComp, getCompInfo)
 * - Layer helpers (getSelectedTextLayer, getSelectedTextLayers)
 * - Effect helpers (addSlider, addCheckbox, addColor, findEffectControl)
 * - Marker helpers (getTextFromMarker, removeMarkers)
 * - ID System (generateBaseId, parseLayerName, buildLayerName)
 * - Path helpers (getExtensionPath, _normalizePath)
 * - Safe JSON parsing (safeJSONParse)
 */

$.writeln("[TEXTORO] Loading Utilities module...");

// ═══════════════════════════════════════════════════════════════════
// RESPONSE HELPERS - دوال الاستجابة
// ═══════════════════════════════════════════════════════════════════

/**
 * إرجاع استجابة ناجحة
 * @param {string} msg - الرسالة
 * @param {*} data - البيانات (اختياري)
 * @returns {string} JSON response
 */
function success(msg, data) {
    var result = { success: true, message: msg };
    if (data !== undefined && data !== null) result.data = data;
    return JSON.stringify(result);
}

/**
 * إرجاع استجابة خطأ
 * @param {string} msg - رسالة الخطأ
 * @returns {string} JSON response
 */
function error(msg) {
    return JSON.stringify({ success: false, error: msg });
}

// ═══════════════════════════════════════════════════════════════════
// ES3-SAFE POLYFILLS (F-03) - بدائل آمنة لدوال ES5 غير المتوفرة في ExtendScript
// ═══════════════════════════════════════════════════════════════════

/**
 * عدّاد مفاتيح Object بديل عن Object.keys(obj).length
 * @param {Object} obj
 * @returns {number}
 */
function txKeyCount(obj) {
    var n = 0, k;
    for (k in obj) {
        if (obj.hasOwnProperty(k)) n++;
    }
    return n;
}

/**
 * فحص Array بديل عن Array.isArray(value)
 * @param {*} v
 * @returns {boolean}
 */
function txIsArray(v) {
    return !!v && (v instanceof Array ||
        (typeof v === "object" && v.constructor && v.constructor === Array));
}

/**
 * قص الفراغات بديل عن String.prototype.trim()
 * @param {string} s
 * @returns {string}
 */
function txTrim(s) {
    return String(s).replace(/^\s+|\s+$/g, "");
}

// ═══════════════════════════════════════════════════════════════════
// VALIDATION HELPERS - دوال التحقق
// ═══════════════════════════════════════════════════════════════════

/**
 * التحقق من رقم وتحديده ضمن نطاق
 * @param {*} value - القيمة
 * @param {number} min - الحد الأدنى
 * @param {number} max - الحد الأقصى
 * @param {number} defaultVal - القيمة الافتراضية
 * @returns {number}
 */
function validateNumber(value, min, max, defaultVal) {
    var num = parseFloat(value);
    if (isNaN(num)) return defaultVal;
    return Math.max(min, Math.min(max, num));
}

/**
 * التحقق من قيمة boolean
 * @param {*} value - القيمة
 * @param {boolean} defaultVal - القيمة الافتراضية
 * @returns {boolean}
 */
function validateBoolean(value, defaultVal) {
    if (typeof value === "boolean") return value;
    if (value === 1 || value === "1" || value === "true") return true;
    if (value === 0 || value === "0" || value === "false") return false;
    return defaultVal;
}

// ═══════════════════════════════════════════════════════════════════
// COLOR HELPERS - دوال الألوان
// ═══════════════════════════════════════════════════════════════════

/**
 * تحويل لون من hex إلى RGB array [0-1]
 * @param {string|Array} color - اللون (hex string أو RGB array)
 * @returns {Array} - [r, g, b] بقيم 0-1
 */
function hexToRgb(color) {
    // إذا كان array بالفعل، أرجعه
    if (color instanceof Array) {
        return color;
    }
    
    // إذا كان string
    if (typeof color === "string") {
        // إزالة # إن وجد
        var hex = color.replace("#", "");
        
        // تحويل من hex إلى RGB
        var r = parseInt(hex.substring(0, 2), 16) / 255;
        var g = parseInt(hex.substring(2, 4), 16) / 255;
        var b = parseInt(hex.substring(4, 6), 16) / 255;
        
        return [r, g, b];
    }
    
    // افتراضي: أبيض
    return [1, 1, 1];
}

/**
 * تحويل RGB array إلى hex string
 * @param {Array} rgb - [r, g, b] بقيم 0-1
 * @returns {string} hex color
 */
function rgbToHex(rgb) {
    if (!rgb || rgb.length < 3) return "#FFFFFF";
    
    var r = Math.round(rgb[0] * 255).toString(16);
    var g = Math.round(rgb[1] * 255).toString(16);
    var b = Math.round(rgb[2] * 255).toString(16);
    
    if (r.length === 1) r = "0" + r;
    if (g.length === 1) g = "0" + g;
    if (b.length === 1) b = "0" + b;
    
    return "#" + r.toUpperCase() + g.toUpperCase() + b.toUpperCase();
}

// ═══════════════════════════════════════════════════════════════════
// DATE HELPERS - دوال التاريخ
// ═══════════════════════════════════════════════════════════════════

/**
 * الحصول على التاريخ بصيغة ISO
 * ExtendScript لا يدعم toISOString
 * @returns {string} ISO date string
 */
function _getISODate() {
    var d = new Date();
    function pad(n) { return n < 10 ? '0' + n : n; }
    // DATA-03: مكونات UTC حقيقية مع لاحقة Z (كانت مكونات محلية موسومة UTC خطأً)
    return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()) +
           'T' + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds()) + 'Z';
}

// ═══════════════════════════════════════════════════════════════════
// COMPOSITION HELPERS - دوال الـ Composition
// ═══════════════════════════════════════════════════════════════════

/**
 * الحصول على الـ Composition النشط
 * @returns {CompItem|null}
 */
function getActiveComp() {
    var comp = app.project.activeItem;
    if (!comp || !(comp instanceof CompItem)) return null;
    return comp;
}

/**
 * الحصول على معلومات الـ Composition
 * @returns {string} JSON response with comp info
 */
function getCompInfo() {
    try {
        var comp = getActiveComp();
        if (!comp) return error("No active composition");
        
        return success("", {
            fps: comp.frameRate,
            frameDuration: comp.frameDuration,
            duration: comp.duration,
            width: comp.width,
            height: comp.height
        });
        
    } catch(e) {
        return error(e.toString());
    }
}

// ═══════════════════════════════════════════════════════════════════
// LAYER HELPERS - دوال الطبقات
// ═══════════════════════════════════════════════════════════════════

/**
 * الحصول على طبقة النص المحددة
 * @param {CompItem} comp - الـ Composition
 * @returns {TextLayer|null}
 */
function getSelectedTextLayer(comp) {
    var sel = comp.selectedLayers;
    if (sel.length === 0) return null;
    if (!(sel[0] instanceof TextLayer)) return null;
    return sel[0];
}

/**
 * الحصول على كل الطبقات المحددة
 * @param {CompItem} comp - الـ Composition
 * @returns {Array} array of layers
 */
function getSelectedLayers(comp) {
    return comp.selectedLayers;
}

/**
 * الحصول على طبقات النص المحددة فقط
 * @param {CompItem} comp - الـ Composition
 * @returns {Array} array of TextLayers
 */
function getSelectedTextLayers(comp) {
    var sel = comp.selectedLayers;
    var textLayers = [];
    for (var i = 0; i < sel.length; i++) {
        if (sel[i] instanceof TextLayer) {
            textLayers.push(sel[i]);
        }
    }
    return textLayers;
}

// ═══════════════════════════════════════════════════════════════════
// EFFECT HELPERS - دوال الـ Effects
// ═══════════════════════════════════════════════════════════════════

/**
 * البحث عن Effect Control بالاسم
 * @param {PropertyGroup} fx - Effect Parade
 * @param {string} name - اسم الـ Effect
 * @returns {Property|null}
 */
function findEffectControl(fx, name) {
    for (var i = 1; i <= fx.numProperties; i++) {
        if (fx.property(i).name === name) return fx.property(i);
    }
    return null;
}

function getEffectControlMap(fx) {
    var map = {};
    for (var i = 1; i <= fx.numProperties; i++) {
        var prop = fx.property(i);
        try { map[prop.name] = prop; } catch (e) {}
    }
    return map;
}

function findEffectControlFast(map, name) {
    return map[name] || null;
}

/**
 * إضافة Slider Control (مع التحقق من الموجود والتحقق من النوع)
 * @param {PropertyGroup} fx - Effect Parade
 * @param {string} name - اسم الـ Slider
 * @param {number} value - القيمة
 * @returns {Property}
 */
function addSlider(fx, name, value) {
    // Type validation
    var numValue = parseFloat(value);
    if (isNaN(numValue)) {
        $.writeln("[TEXTORO] addSlider: Invalid value for " + name + ", using 0");
        numValue = 0;
    }
    
    var existing = findEffectControl(fx, name);
    if (existing) {
        // تحديث القيمة إذا كان موجوداً
        existing.property(1).setValue(numValue);
        $.writeln("[TEXTORO addSlider] Updated existing: " + name + " = " + numValue);
        return existing;
    }
    var ctrl = fx.addProperty("ADBE Slider Control");
    ctrl.name = name;
    ctrl.property(1).setValue(numValue);
    $.writeln("[TEXTORO addSlider] Created new: " + name + " = " + numValue);
    return ctrl;
}

/**
 * إضافة Checkbox Control (مع التحقق من الموجود والتحقق من النوع)
 * @param {PropertyGroup} fx - Effect Parade
 * @param {string} name - اسم الـ Checkbox
 * @param {boolean} value - القيمة
 * @returns {Property}
 */
function addCheckbox(fx, name, value) {
    // Type validation
    var boolValue = false;
    if (typeof value === 'boolean') {
        boolValue = value;
    } else if (value === 1 || value === '1' || value === 'true') {
        boolValue = true;
    } else if (value === 0 || value === '0' || value === 'false' || value === null || value === undefined) {
        boolValue = false;
    } else {
        $.writeln("[TEXTORO] addCheckbox: Invalid value for " + name + ", using false");
    }
    
    var existing = findEffectControl(fx, name);
    if (existing) {
        // تحديث القيمة إذا كان موجوداً
        existing.property(1).setValue(boolValue ? 1 : 0);
        return existing;
    }
    var ctrl = fx.addProperty("ADBE Checkbox Control");
    ctrl.name = name;
    ctrl.property(1).setValue(boolValue ? 1 : 0);
    return ctrl;
}

/**
 * إضافة Color Control (مع التحقق من الموجود + تحويل hex + التحقق من النوع)
 * @param {PropertyGroup} fx - Effect Parade
 * @param {string} name - اسم الـ Color
 * @param {string|Array} value - اللون (hex أو RGB array)
 * @returns {Property}
 */
function addColor(fx, name, value) {
    // Type validation
    var rgb;
    if (value instanceof Array && value.length >= 3) {
        // Validate array values are numbers between 0-1
        rgb = [
            Math.max(0, Math.min(1, parseFloat(value[0]) || 0)),
            Math.max(0, Math.min(1, parseFloat(value[1]) || 0)),
            Math.max(0, Math.min(1, parseFloat(value[2]) || 0))
        ];
    } else if (typeof value === 'string') {
        rgb = hexToRgb(value);
    } else {
        $.writeln("[TEXTORO] addColor: Invalid value for " + name + ", using white");
        rgb = [1, 1, 1];
    }
    
    var existing = findEffectControl(fx, name);
    if (existing) {
        // تحديث القيمة إذا كان موجوداً
        existing.property(1).setValue(rgb);
        return existing;
    }
    var ctrl = fx.addProperty("ADBE Color Control");
    ctrl.name = name;
    ctrl.property(1).setValue(rgb);
    return ctrl;
}

/**
 * إضافة Point Control
 * @param {PropertyGroup} fx - Effect Parade
 * @param {string} name - اسم الـ Point
 * @param {Array} point - [x, y]
 * @returns {Property}
 */
function addPoint(fx, name, point) {
    var pointCtrl = fx.addProperty("ADBE Point Control");
    pointCtrl.name = name;
    pointCtrl.property("Point").setValue(point);
    return pointCtrl;
}

/**
 * الحصول على قيمة Effect Control
 * @param {Layer} layer - الطبقة
 * @param {string} name - اسم الـ Effect
 * @param {string} propName - اسم الخاصية (Slider, Checkbox, Color, Point)
 * @returns {*} القيمة أو null
 */
function getEffectValue(layer, name, propName) {
    try {
        var fx = layer.property("ADBE Effect Parade");
        var effect = fx.property(name);
        if (!effect) return null;
        return effect.property(propName).value;
    } catch(e) {
        return null;
    }
}

/**
 * تعيين قيمة Effect Control
 * @param {Layer} layer - الطبقة
 * @param {string} name - اسم الـ Effect
 * @param {string} propName - اسم الخاصية
 * @param {*} value - القيمة الجديدة
 * @returns {boolean} نجاح العملية
 */
function setEffectValue(layer, name, propName, value) {
    try {
        var fx = layer.property("ADBE Effect Parade");
        var effect = fx.property(name);
        if (!effect) return false;
        effect.property(propName).setValue(value);
        return true;
    } catch(e) {
        return false;
    }
}

/**
 * التحقق من وجود Effect
 * @param {Layer} layer - الطبقة
 * @param {string} name - اسم الـ Effect
 * @returns {boolean}
 */
function hasEffect(layer, name) {
    try {
        var fx = layer.property("ADBE Effect Parade");
        return fx.property(name) !== null;
    } catch(e) {
        return false;
    }
}

/**
 * إزالة Effect
 * @param {Layer} layer - الطبقة
 * @param {string} name - اسم الـ Effect
 * @returns {boolean}
 */
function removeEffect(layer, name) {
    try {
        var fx = layer.property("ADBE Effect Parade");
        var effect = fx.property(name);
        if (effect) {
            effect.remove();
            return true;
        }
        return false;
    } catch(e) {
        return false;
    }
}

/**
 * إزالة عدة Effect Controls بالأسماء
 * @param {PropertyGroup} fx - Effect Parade
 * @param {Array} names - مصفوفة أسماء الـ Effects
 */
function removeEffectControls(fx, names) {
    for (var i = fx.numProperties; i >= 1; i--) {
        var prop = fx.property(i);
        for (var j = 0; j < names.length; j++) {
            if (prop.name === names[j]) { prop.remove(); break; }
        }
    }
}

// ═══════════════════════════════════════════════════════════════════
// MARKER HELPERS - دوال الـ Markers
// ═══════════════════════════════════════════════════════════════════

/**
 * الحصول على النص من Marker (للتوافق مع الطبقات القديمة)
 * النظام الجديد يستخدم getOriginalText(layer)
 * @param {Property} markers - خاصية الـ Markers
 * @returns {string|null}
 */
function getTextFromMarker(markers) {
    for (var i = 1; i <= markers.numKeys; i++) {
        var c = markers.keyValue(i).comment;
        if (c.indexOf("TW_TEXT:") === 0) return c.substring(8);
    }
    return null;
}

/**
 * إزالة Markers بأنماط معينة
 * @param {Property} markers - خاصية الـ Markers
 * @param {Array} patterns - مصفوفة الأنماط للبحث عنها
 */
function removeMarkers(markers, patterns) {
    for (var i = markers.numKeys; i >= 1; i--) {
        var c = markers.keyValue(i).comment;
        for (var j = 0; j < patterns.length; j++) {
            if (c.indexOf(patterns[j]) === 0 || c === patterns[j]) {
                markers.removeKey(i);
                break;
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════════
// ANIMATOR HELPERS - دوال الـ Animators
// ═══════════════════════════════════════════════════════════════════

/**
 * إزالة Animators بالأسماء
 * @param {PropertyGroup} animators - Text Animators
 * @param {Array} names - مصفوفة أسماء الـ Animators
 */
function removeAnimatorsByName(animators, names) {
    // إزالة من الآخر للأول لتجنب مشاكل الفهرسة
    for (var i = animators.numProperties; i >= 1; i--) {
        try {
            var anim = animators.property(i);
            if (!anim) continue;
            var animName = anim.name;
            for (var j = 0; j < names.length; j++) {
                if (animName === names[j]) { 
                    anim.remove(); 
                    break; 
                }
            }
        } catch(e) {
            // تجاهل الأخطاء عند الإزالة
            $.writeln("[TEXTORO] Error removing animator: " + e.toString());
        }
    }
}

// ═══════════════════════════════════════════════════════════════════
// TEXT HELPERS - دوال النص
// ═══════════════════════════════════════════════════════════════════

/**
 * الحصول على نص الطبقة
 * API-01: أُعيدت التسمية من getLayerText - كان يتعارض مع دالة المضيف العامة
 * في TypewriterManager بعقد إرجاع مختلف، ولا يوجد مستدعون لها.
 * @param {TextLayer} layer - طبقة النص
 * @returns {string}
 */
function _getTextLayerContent(layer) {
    try {
        var textProp = layer.property("ADBE Text Properties").property("ADBE Text Document");
        return textProp.value.text;
    } catch(e) {
        return "";
    }
}

/**
 * تعيين نص الطبقة
 * @param {TextLayer} layer - طبقة النص
 * @param {string} text - النص الجديد
 * @returns {boolean}
 */
function setLayerText(layer, text) {
    try {
        var textProp = layer.property("ADBE Text Properties").property("ADBE Text Document");
        var doc = textProp.value;
        doc.text = text;
        textProp.setValue(doc);
        return true;
    } catch(e) {
        return false;
    }
}

/**
 * الحصول على خصائص النص
 * @param {TextLayer} layer - طبقة النص
 * @returns {Object} text properties
 */
function getTextProperties(layer) {
    try {
        var textProp = layer.property("ADBE Text Properties").property("ADBE Text Document");
        var doc = textProp.value;
        
        return {
            text: doc.text,
            font: doc.font,
            fontSize: doc.fontSize,
            fillColor: doc.fillColor,
            strokeColor: doc.strokeColor,
            strokeWidth: doc.strokeWidth,
            tracking: doc.tracking,
            leading: doc.leading,
            justification: doc.justification
        };
    } catch(e) {
        return null;
    }
}

// ═══════════════════════════════════════════════════════════════════
// PATH HELPERS - دوال المسارات
// ═══════════════════════════════════════════════════════════════════

/**
 * تطبيع المسار (forward slashes)
 * @param {string} path - المسار
 * @returns {string} المسار المطبّع
 */
function _normalizePath(path) {
    return path.replace(/\\/g, "/");
}

/**
 * الحصول على مسار الإضافة ديناميكياً
 * @returns {string} مسار جذر الإضافة
 */
function getExtensionPath() {
    // Method 1: From script file location ($.fileName points to index.jsx)
    try {
        var scriptFile = new File($.fileName);
        $.writeln("[TEXTORO] getExtensionPath - $.fileName: " + $.fileName);
        
        if (scriptFile.exists && scriptFile.parent) {
            // $.fileName points to index.jsx which is in host/ folder
            // So parent is host/, and parent.parent is TEXTORO/
            var hostFolder = scriptFile.parent;
            var extensionFolder = hostFolder.parent;
            
            $.writeln("[TEXTORO] getExtensionPath - hostFolder: " + hostFolder.fsName);
            $.writeln("[TEXTORO] getExtensionPath - extensionFolder: " + extensionFolder.fsName);
            
            if (extensionFolder.exists) {
                var path = _normalizePath(extensionFolder.fsName) + "/";
                $.writeln("[TEXTORO] getExtensionPath - returning: " + path);
                return path;
            }
        }
    } catch(e) {
        $.writeln("[TEXTORO] getExtensionPath Method 1 error: " + e.toString());
    }
    
    // Method 2: Try to find from #include path (index.jsx location)
    try {
        // In CEP, we can try to find the extension folder from known structure
        var scriptPath = $.fileName;
        if (scriptPath && scriptPath.indexOf("host") !== -1) {
            // Extract path up to and including TEXTORO folder
            var parts = scriptPath.replace(/\\/g, "/").split("/");
            var textoroIndex = -1;
            for (var p = 0; p < parts.length; p++) {
                if (parts[p] === "TEXTORO") {
                    textoroIndex = p;
                    break;
                }
            }
            if (textoroIndex !== -1) {
                var basePath = parts.slice(0, textoroIndex + 1).join("/") + "/";
                var testFolder = new Folder(basePath);
                if (testFolder.exists) {
                    $.writeln("[TEXTORO] getExtensionPath Method 2 - returning: " + basePath);
                    return basePath;
                }
            }
        }
    } catch(e) {
        $.writeln("[TEXTORO] getExtensionPath Method 2 error: " + e.toString());
    }
    
    // Method 3: Platform-specific fallbacks
    var platform = $.os.indexOf("Windows") !== -1 ? "win" : "mac";
    $.writeln("[TEXTORO] getExtensionPath - trying platform fallbacks for: " + platform);
    
    if (platform === "win") {
        var winPaths = [
            _normalizePath(Folder.userData.fsName) + "/Adobe/CEP/extensions/TEXTORO/",
            "C:/Program Files (x86)/Common Files/Adobe/CEP/extensions/TEXTORO/",
            "C:/Program Files/Common Files/Adobe/CEP/extensions/TEXTORO/"
        ];
        for (var i = 0; i < winPaths.length; i++) {
            $.writeln("[TEXTORO] getExtensionPath - checking: " + winPaths[i]);
            var folder = new Folder(winPaths[i]);
            if (folder.exists) {
                $.writeln("[TEXTORO] getExtensionPath - found: " + winPaths[i]);
                return winPaths[i];
            }
        }
    } else {
        var macPaths = [
            "~/Library/Application Support/Adobe/CEP/extensions/TEXTORO/",
            "/Library/Application Support/Adobe/CEP/extensions/TEXTORO/"
        ];
        for (var j = 0; j < macPaths.length; j++) {
            $.writeln("[TEXTORO] getExtensionPath - checking: " + macPaths[j]);
            var folder = new Folder(macPaths[j]);
            if (folder.exists) {
                $.writeln("[TEXTORO] getExtensionPath - found: " + macPaths[j]);
                return macPaths[j];
            }
        }
    }
    
    $.writeln("[TEXTORO] getExtensionPath - WARNING: No valid path found!");
    return "";
}

// ═══════════════════════════════════════════════════════════════════
// SAFE JSON PARSING - تحليل JSON الآمن
// ═══════════════════════════════════════════════════════════════════

/**
 * تحليل JSON بشكل آمن
 * @param {string} str - نص JSON
 * @param {*} defaultVal - القيمة الافتراضية عند الفشل
 * @returns {*} الكائن المحلل أو القيمة الافتراضية
 */
function safeJSONParse(str, defaultVal) {
    if (str === null || str === undefined) {
        return defaultVal !== undefined ? defaultVal : {};
    }
    if (typeof str !== 'string') {
        $.writeln("[TEXTORO] safeJSONParse: Expected string, got " + typeof str);
        return defaultVal !== undefined ? defaultVal : {};
    }
    if (str.replace(/\s/g, '') === '') {
        return defaultVal !== undefined ? defaultVal : {};
    }
    try {
        return JSON.parse(str);
    } catch(e) {
        $.writeln("[TEXTORO] JSON parse error: " + e.toString());
        $.writeln("[TEXTORO] Input preview: " + str.substring(0, 100));
        return defaultVal !== undefined ? defaultVal : {};
    }
}

$.writeln("[TEXTORO] Utilities module loaded!");

// علامة تثبت أن الوحدة تم تحميلها
var UTILITIES_MODULE_LOADED = true;
var UTILITIES_MODULE_VERSION = "1.2.0";

// ═══════════════════════════════════════════════════════════════════
// ID SYSTEM - نظام المعرفات الذكية
// ═══════════════════════════════════════════════════════════════════
// Layer Name: tx_abc123_T, tx_abc123_B, tx_abc123_TB
// Layer Comment: النص الأصلي (للـ Typewriter)
// Box Name: tx_abc123_Box
// ═══════════════════════════════════════════════════════════════════

/**
 * إنشاء معرف فريد أساسي
 * @returns {string} - معرف مثل "tx_m5k8j2abc"
 */
function generateBaseId() {
    return "tx_" + (new Date()).getTime().toString(36) + Math.random().toString(36).substring(2, 6);
}

/**
 * تحليل اسم الطبقة للحصول على المعرف الأساسي والـ flags
 * @param {string} layerName - اسم الطبقة مثل "tx_abc123_TB"
 * @returns {Object} - {baseId: "tx_abc123", hasT: bool, hasB: bool, isTextoro: bool}
 */
function parseLayerName(layerName) {
    if (!layerName || layerName.indexOf("tx_") !== 0) {
        return { baseId: null, hasT: false, hasB: false, isTextoro: false };
    }
    
    var hasT = false, hasB = false;
    
    if (layerName.match(/_TB$/)) {
        hasT = true;
        hasB = true;
    } else if (layerName.match(/_T$/)) {
        hasT = true;
    } else if (layerName.match(/_B$/)) {
        hasB = true;
    }
    
    var baseId = layerName.replace(/_TB$/, '').replace(/_T$/, '').replace(/_B$/, '');
    
    return { baseId: baseId, hasT: hasT, hasB: hasB, isTextoro: true };
}

/**
 * بناء اسم الطبقة من الأجزاء
 */
function buildLayerName(baseId, hasT, hasB) {
    var suffix = "";
    if (hasT && hasB) suffix = "_TB";
    else if (hasT) suffix = "_T";
    else if (hasB) suffix = "_B";
    return baseId + suffix;
}

/**
 * الحصول على المعرف الأساسي من الطبقة
 */
function getBaseId(layer) {
    var parsed = parseLayerName(layer.name);
    return parsed.baseId;
}

/**
 * الحصول على النص الأصلي من Layer Comment
 */
function getOriginalText(layer) {
    var comment = layer.comment;
    if (!comment || comment.indexOf("TEXTORO_TEXT:") !== 0) return null;
    return comment.substring(13);
}

/**
 * تخزين النص الأصلي في Layer Comment
 */
function setOriginalText(layer, text) {
    layer.comment = "TEXTORO_TEXT:" + text;
}

/**
 * مسح النص الأصلي من Layer Comment
 */
function clearOriginalText(layer) {
    if (layer.comment && layer.comment.indexOf("TEXTORO_TEXT:") === 0) {
        layer.comment = "";
    }
}

/**
 * تحديث اسم الطبقة مع الـ flags المناسبة
 */
function updateLayerFlags(layer, addT, addB) {
    var parsed = parseLayerName(layer.name);
    var baseId = parsed.isTextoro ? parsed.baseId : generateBaseId();
    var hasT = parsed.hasT || addT;
    var hasB = parsed.hasB || addB;
    layer.name = buildLayerName(baseId, hasT, hasB);
    return baseId;
}

/**
 * إزالة flag من اسم الطبقة
 */
function removeLayerFlag(layer, flagToRemove, originalName) {
    var parsed = parseLayerName(layer.name);
    if (!parsed.isTextoro) return;
    
    var hasT = flagToRemove === "T" ? false : parsed.hasT;
    var hasB = flagToRemove === "B" ? false : parsed.hasB;
    
    if (!hasT && !hasB) {
        layer.name = originalName ? originalName : parsed.baseId;
    } else {
        layer.name = buildLayerName(parsed.baseId, hasT, hasB);
    }
}

/**
 * الحصول على حالة التأثيرات من اسم الطبقة
 */
function getLayerStatus(layer) {
    var parsed = parseLayerName(layer.name);
    return { 
        hasTypewriter: parsed.hasT, 
        hasBox: parsed.hasB, 
        isFree: !parsed.hasT && !parsed.hasB,
        isTextoro: parsed.isTextoro
    };
}

/**
 * البحث عن طبقة Box بالـ ID الأساسي
 */
function findBoxLayerById(comp, baseId) {
    var boxName = baseId + "_Box";
    for (var i = 1; i <= comp.numLayers; i++) {
        if (comp.layer(i).name === boxName) return comp.layer(i);
    }
    return null;
}
