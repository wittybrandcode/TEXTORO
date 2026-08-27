/**
 * TEXTORO - Expression Loader Module
 * نظام تحميل الـ Expressions من الملفات
 * v1.1.0 - Updated with complete embedded expressions
 * 
 * Dependencies: Config.jsx, Utilities.jsx
 */

// Module load flag for verification
var EXPRESSIONLOADER_MODULE_LOADED = true;

$.writeln("[TEXTORO] Loading ExpressionLoader module...");

// ═══════════════════════════════════════════════════════════════════
// EXPRESSION CACHE & CONFIG
// ═══════════════════════════════════════════════════════════════════

var _exprCache = {};
var _exprCacheKeys = [];
var _exprConfig = null;
var EXPR_CACHE_LIMIT = 50;

// ═══════════════════════════════════════════════════════════════════
// PATH HELPERS
// ═══════════════════════════════════════════════════════════════════

/**
 * الحصول على مسار مجلد الـ Expressions
 * يستخدم getExtensionPath() من Utilities.jsx للكشف الديناميكي
 * @returns {string} - المسار الكامل
 */
function getExpressionsPath() {
    // Method 1: Use dynamic path detection from Utilities
    var basePath = getExtensionPath();
    if (basePath) {
        var testPath = basePath + "host/expressions/";
        var testFolder = new Folder(testPath);
        if (testFolder.exists) {
            return testPath;
        }
    }
    
    // Method 2: Try from script file location
    try {
        var scriptFile = new File($.fileName);
        if (scriptFile.exists && scriptFile.parent) {
            // F-06: $.fileName قد يشير لـ index.jsx أو modules/*.jsx - نصعد حتى host
            var holderFolder = scriptFile.parent;
            if (holderFolder.name === "modules") holderFolder = holderFolder.parent;
            var testPath2 = holderFolder.fsName.replace(/\\/g, "/") + "/expressions/";
            var testFolder2 = new Folder(testPath2);
            if (testFolder2.exists) {
                return testPath2;
            }
        }
    } catch(e) {
        $.writeln("[TEXTORO] getExpressionsPath error: " + e.toString());
    }
    
    // Method 3: Platform-specific fallbacks
    var platform = $.os.indexOf("Windows") !== -1 ? "win" : "mac";
    
    if (platform === "win") {
        var winPaths = [
            "C:/Program Files (x86)/Common Files/Adobe/CEP/extensions/TEXTORO/host/expressions/",
            "C:/Program Files/Common Files/Adobe/CEP/extensions/TEXTORO/host/expressions/"
        ];
        for (var i = 0; i < winPaths.length; i++) {
            var folder = new Folder(winPaths[i]);
            if (folder.exists) return winPaths[i];
        }
        return winPaths[0];
    } else {
        var macPaths = [
            "~/Library/Application Support/Adobe/CEP/extensions/TEXTORO/host/expressions/",
            "/Library/Application Support/Adobe/CEP/extensions/TEXTORO/host/expressions/"
        ];
        for (var j = 0; j < macPaths.length; j++) {
            var folder = new Folder(macPaths[j]);
            if (folder.exists) return macPaths[j];
        }
        return macPaths[0];
    }
}

// ═══════════════════════════════════════════════════════════════════
// CONFIG LOADING
// ═══════════════════════════════════════════════════════════════════

/**
 * تحميل ملف الإعدادات _config.json
 * @param {boolean} forceReload - إعادة التحميل حتى لو موجود في الـ cache
 * @returns {Object|null} - كائن الإعدادات أو null
 */
function loadExprConfig(forceReload) {
    if (_exprConfig && !forceReload) return _exprConfig;
    
    try {
        var configPath = getExpressionsPath() + "_config.json";
        var configFile = new File(configPath);

        if (!configFile.exists) return null;

        configFile.encoding = "UTF-8"; // F-04: الترميز قبل الفتح
        configFile.open("r");
        var content = configFile.read();
        configFile.close();

        _exprConfig = JSON.parse(content);

        // F-06: دمج طبقة المستخدم من userData (قابلة للكتابة بدون صلاحيات admin)
        try {
            var userDirCfg = new Folder(Folder.userData.fsName + "/TEXTORO");
            var userCfgFile = new File(userDirCfg.fsName + "/expressions_config.json");
            if (userCfgFile.exists) {
                userCfgFile.encoding = "UTF-8";
                userCfgFile.open("r");
                var userContent = userCfgFile.read();
                userCfgFile.close();
                var userCfg = JSON.parse(userContent);
                if (!_exprConfig.versions) _exprConfig.versions = {};
                if (userCfg && userCfg.versions) {
                    for (var uk in userCfg.versions) {
                        if (userCfg.versions.hasOwnProperty(uk)) _exprConfig.versions[uk] = userCfg.versions[uk];
                    }
                }
            }
        } catch(_eInner) {
            $.writeln("[TEXTORO] loadExprConfig user overlay skipped: " + _eInner.toString());
        }

        return _exprConfig;

    } catch(e) {
        return null;
    }
}

// ═══════════════════════════════════════════════════════════════════
// EXPRESSION LOADING
// ═══════════════════════════════════════════════════════════════════

/**
 * تحميل Expression من ملف
 * @param {string} category - الفئة (typewriter, cursor, box)
 * @param {string} name - اسم الـ Expression
 * @param {string} version - النسخة (اختياري)
 * @returns {string} - كود الـ Expression
 */
function loadExpression(category, name, version) {
    $.writeln("[TEXTORO] loadExpression called: " + category + "/" + name);
    var _allowedCats = {typewriter:1, cursor:1, box:1};
    var _allowedNames = {sourceText:1, range:1, blink:1, path4corners:1, size:1, position:1, hideWhenEmpty:1};
    if (!_allowedCats[category] || !_allowedNames[name]) {
        $.writeln("[TEXTORO] loadExpression - unsupported category/name: " + category + "/" + name);
        return "";
    }
    if (version && !/^v\d+\.\d+$/.test(version)) {
        $.writeln("[TEXTORO] loadExpression - invalid version: " + version);
        return "";
    }
    
    var config = loadExprConfig();
    var key = category + "/" + name;
    
    // تحديد النسخة
    if (!version) {
        if (config && config.versions && config.versions[key]) {
            version = config.versions[key];
        } else if (config && config.fallback) {
            version = config.fallback;
        } else {
            version = "v1.0";
        }
    }

    // التحقق من الـ cache
    var cacheKey = key + "/" + version;
    if (_exprCache[cacheKey]) {
        _manageCacheSize(cacheKey); // تحديث ترتيب LRU
        return _exprCache[cacheKey];
    }
    
    // تحميل من الملف
    try {
        var filePath = getExpressionsPath() + category + "/" + version + "/" + name + ".js";
        var exprFile = new File(filePath);
        var loadedVersion = version; // F-06: تتبع النسخة الفعلية

        if (!exprFile.exists) {
            loadedVersion = "v1.0";
            $.writeln("[TEXTORO] WARNING: version " + version + " missing for " + key + ", downgraded to v1.0");
            filePath = getExpressionsPath() + category + "/v1.0/" + name + ".js";
            exprFile = new File(filePath);
        }

        if (exprFile.exists) {
            $.writeln("[TEXTORO] Loading from file: " + filePath);
            exprFile.encoding = "UTF-8"; // F-04: الترميز قبل الفتح
            exprFile.open("r");
            var content = exprFile.read();
            exprFile.close();

            $.writeln("[TEXTORO] File loaded, length: " + content.length);

            // F-06: تخزين الكاش تحت مفتاح النسخة الفعلية لا المطلوبة
            var actualKey = key + "/" + loadedVersion;
            _manageCacheSize(actualKey);
            _exprCache[actualKey] = content;

            return content;
        } else {
            $.writeln("[TEXTORO] File not found: " + filePath);
        }

    } catch(e) {
        $.writeln("[TEXTORO] Error loading expression: " + e.toString());
    }
    
    // Fallback to embedded
    $.writeln("[TEXTORO] Using embedded expression for: " + key);
    var embedded = _getEmbeddedExpression(category, name);
    
    // Cache embedded too
    _manageCacheSize(cacheKey);
    _exprCache[cacheKey] = embedded;
    
    return embedded;
}

/**
 * مسح الـ cache
 */
function clearExpressionCache() {
    _exprCache = {};
    _exprCacheKeys = [];
    _exprConfig = null;
    $.writeln("[TEXTORO] Expression cache cleared");
    return success("Expression cache cleared");
}

/**
 * إدارة حجم الـ Cache (LRU-style)
 */
function _manageCacheSize(newKey) {
    // إذا الـ key موجود، نقله للنهاية
    var existingIndex = -1;
    for (var i = 0; i < _exprCacheKeys.length; i++) {
        if (_exprCacheKeys[i] === newKey) {
            existingIndex = i;
            break;
        }
    }
    
    if (existingIndex !== -1) {
        _exprCacheKeys.splice(existingIndex, 1);
    }
    
    // إذا وصلنا للحد الأقصى، حذف الأقدم
    if (_exprCacheKeys.length >= EXPR_CACHE_LIMIT) {
        var oldestKey = _exprCacheKeys.shift();
        delete _exprCache[oldestKey];
        $.writeln("[TEXTORO] Cache cleanup: removed " + oldestKey);
    }
    
    _exprCacheKeys.push(newKey);
}

// ═══════════════════════════════════════════════════════════════════
// EXPRESSION BUILDERS - Public API
// ═══════════════════════════════════════════════════════════════════

function buildSourceTextExpr() {
    return loadExpression("typewriter", "sourceText");
}

function buildCursorRangeExpr() {
    return loadExpression("cursor", "range");
}

function buildCursorBlinkExpr() {
    return loadExpression("cursor", "blink");
}

function buildBoxPathExpr() {
    return loadExpression("box", "path4corners");
}

function buildBoxSizeExpr() {
    return loadExpression("box", "size");
}

function buildBoxPositionExpr() {
    return loadExpression("box", "position");
}

// ═══════════════════════════════════════════════════════════════════
// INTERNAL EXPRESSION BUILDERS - Used by BoxManager
// ═══════════════════════════════════════════════════════════════════

/**
 * بناء Expression لحجم الصندوق
 */
function _buildRectSizeExpr() {
    return loadExpression("box", "size");
}

/**
 * بناء Expression لموقع الصندوق
 */
function _buildRectPositionExpr() {
    return loadExpression("box", "position");
}

/**
 * بناء Expression لمسار الصندوق (4 زوايا)
 */
function _build4CornersPathExpr() {
    var expr = loadExpression("box", "path4corners");
    $.writeln("[TEXTORO] _build4CornersPathExpr loaded, length: " + expr.length);
    $.writeln("[TEXTORO] Expression preview: " + expr.substring(0, 100));
    return expr;
}

/**
 * بناء Expression لإخفاء الصندوق عند فراغ النص
 * @param {string} opacityControl - اسم التحكم بالشفافية
 */
function _buildHideWhenEmptyExpr(opacityControl) {
    var expr = loadExpression("box", "hideWhenEmpty");
    return expr.replace("{{OPACITY_CONTROL}}", opacityControl);
}

// ═══════════════════════════════════════════════════════════════════
// VERSION MANAGEMENT
// ═══════════════════════════════════════════════════════════════════

/**
 * الحصول على النسخ المتاحة
 */
function getAvailableVersions(category, name) {
    var versions = [];
    try {
        var categoryPath = getExpressionsPath() + category + "/";
        var categoryFolder = new Folder(categoryPath);
        
        if (!categoryFolder.exists) return ["v1.0"];
        
        var subFolders = categoryFolder.getFiles(function(f) {
            return f instanceof Folder && f.name.indexOf("v") === 0;
        });
        
        for (var i = 0; i < subFolders.length; i++) {
            var exprFile = new File(subFolders[i].fsName + "/" + name + ".js");
            if (exprFile.exists) {
                versions.push(subFolders[i].name);
            }
        }
        
        // F-06: فرز رقمي - v1.10 بعد v1.2 وليس قبلها أبجدياً
        versions.sort(function(a, b) {
            var na = parseInt(String(a).replace(/[^0-9]/g, ""), 10) || 0;
            var nb = parseInt(String(b).replace(/[^0-9]/g, ""), 10) || 0;
            return na - nb;
        });
        
    } catch(e) { $.writeln("[TEXTORO] Warning: Could not get available versions: " + e.toString()); }
    
    return versions.length > 0 ? versions : ["v1.0"];
}

/**
 * تغيير النسخة النشطة
 */
function setActiveVersion(category, name, version) {
    try {
        var config = loadExprConfig(true);
        if (!config) {
            config = { versions: {}, fallback: "v1.0" };
        }
        
        var key = category + "/" + name;
        config.versions[key] = version;

        // F-06: الكتابة في userData (قابلة للكتابة دائماً) وليس Program Files
        var userDir = new Folder(Folder.userData.fsName + "/TEXTORO");
        if (!userDir.exists) userDir.create();
        var configFile = new File(userDir.fsName + "/expressions_config.json");
        configFile.encoding = "UTF-8";
        configFile.open("w");
        configFile.write(JSON.stringify({ versions: config.versions }, null, 2));
        configFile.close();

        clearExpressionCache();
        return true;
        
    } catch(e) {
        return false;
    }
}

// ═══════════════════════════════════════════════════════════════════
// JS WRAPPERS - للاستدعاء من JavaScript
// ═══════════════════════════════════════════════════════════════════

function getAvailableVersionsJS(optsJSON) {
    try {
        var opts = JSON.parse(optsJSON);
        if (typeof opts === "string") {
            opts = { category: opts, name: "sourceText" };
        }
        if (!opts.name) {
            if (opts.category === "cursor") opts.name = "blink";
            else if (opts.category === "box") opts.name = "path4corners";
            else opts.name = "sourceText";
        }
        var versions = getAvailableVersions(opts.category, opts.name);
        
        var config = loadExprConfig();
        var key = opts.category + "/" + opts.name;
        var current = "v1.0";
        
        if (config && config.versions && config.versions[key]) {
            current = config.versions[key];
        } else if (config && config.fallback) {
            current = config.fallback;
        }
        
        return success("", { versions: versions, current: current });
        
    } catch(e) {
        return error(e.toString());
    }
}

function setActiveVersionJS(optsJSON) {
    try {
        var opts = JSON.parse(optsJSON);
        if (opts instanceof Array) {
            opts = {
                category: opts[0],
                name: opts[1],
                version: opts[2]
            };
        }
        var result = setActiveVersion(opts.category, opts.name, opts.version);
        
        if (result) {
            return success("Version changed to " + opts.version);
        } else {
            return error("Failed to change version");
        }
        
    } catch(e) {
        return error(e.toString());
    }
}

// ═══════════════════════════════════════════════════════════════════
// EMBEDDED EXPRESSIONS (FALLBACK) - النسخ الكاملة
// ═══════════════════════════════════════════════════════════════════

function _getEmbeddedExpression(category, name) {
    // ─────────────────────────────────────────────────────────────────
    // Typewriter sourceText - النسخة الكاملة مع كل الميزات
    // ─────────────────────────────────────────────────────────────────
    if (category === "typewriter" && name === "sourceText") {
        return '// TEXTORO Typewriter\n' +
'var X = "";\n' +
'var m = thisLayer.marker;\n' +
'if (m.numKeys > 0) {\n' +
'    for (var i = 1; i <= m.numKeys; i++) {\n' +
'        var c = m.key(i).comment;\n' +
'        if (c.indexOf("TW_TEXT:") == 0) { X = c.substr(8); break; }\n' +
'    }\n' +
'}\n' +
'var L = X.length;\n' +
'var liveMode = 0;\n' +
'try { liveMode = effect("Live Text")(1); } catch(e) { liveMode = 0; }\n' +
'if (liveMode == 1) { try { var __d = value; X = (typeof __d === "string") ? __d : String(__d.text); } catch(e) {} }\n' +
'L = X.length;\n' +
'var progress = effect("TW Progress")(1);\n' +
'var auto = effect("TW Auto")(1);\n' +
'var reverse = effect("TW Reverse")(1);\n' +
'var randomSpeed = effect("Random Speed")(1) / 100;\n' +
'var showCursor = effect("Show Cursor")(1);\n' +
'var beforeText = effect("Cursor Before Text")(1);\n' +
'var cursorType = Math.round(effect("Cursor Type")(1));\n' +
'var cursorChars = ["|", "_", "\\u2588", "\\u258C", "\\u258E", "\\u25CF", "\\u25C6"];\n' + // F-07: موحّد مع CONFIG.CURSOR_SHAPES
'var customCursor = "";\n' +
'if (m.numKeys > 0) { for (var j = 1; j <= m.numKeys; j++) { var cc = m.key(j).comment; if (cc.indexOf("CURSOR_CHAR:") == 0) { customCursor = cc.substr(12); break; } } }\n' +
'var spacing = Math.round(Math.max(0, effect("Cursor Spacing")(1)));\n' +
'var inStart = -1, inEnd = -1, outStart = -1, outEnd = -1;\n' +
'if (m.numKeys > 0) {\n' +
'    for (var i = 1; i <= m.numKeys; i++) {\n' +
'        var mc = m.key(i).comment;\n' +
'        var t = m.key(i).time - inPoint;\n' +
'        if (mc == "IN_START") inStart = t;\n' +
'        else if (mc == "IN_END") inEnd = t;\n' +
'        else if (mc == "OUT_START") outStart = t;\n' +
'        else if (mc == "OUT_END") outEnd = t;\n' +
'    }\n' +
'}\n' +
'var inDuration = (inEnd > inStart && inStart >= 0) ? (inEnd - inStart) : 2;\n' +
'var outDuration = (outEnd > outStart && outStart >= 0) ? (outEnd - outStart) : 2;\n' +
'var p = 0;\n' +
'var currentTime = time - inPoint;\n' +
'if (auto == 1) {\n' +
'    if (inStart < 0) inStart = 0;\n' +
'    if (currentTime < inStart) p = 0;\n' +
'    else if (currentTime < inEnd || inEnd < 0) {\n' +
'        var elapsed = currentTime - inStart;\n' +
'        p = (elapsed / Math.max(0.1, inDuration)) * 100;\n' +
'        if (randomSpeed > 0 && p < 100 && p > 0) {\n' +
'            var noise = Math.sin(time * 50) * Math.cos(time * 30);\n' +
'            p = p + (noise * randomSpeed * 20);\n' +
'        }\n' +
'        p = clamp(p, 0, 100);\n' +
'    } else if (outStart < 0 || currentTime < outStart) p = 100;\n' +
'    else if (outEnd < 0 || currentTime < outEnd) {\n' +
'        var elapsedOut = currentTime - outStart;\n' +
'        p = 100 - clamp((elapsedOut / Math.max(0.1, outDuration)) * 100, 0, 100);\n' +
'    } else p = 0;\n' +
'} else p = progress;\n' +
'p = clamp(p, 0, 100);\n' +
'var T = reverse == 1 ? Math.floor(L * (100 - p) / 100) : Math.floor(L * p / 100);\n' +
'var visibleText = X.substr(0, T);\n' +
'var cursor = "";\n' +
'if (showCursor == 1) { if (cursorType == -1 && customCursor != "") { cursor = customCursor; } else { cursor = cursorChars[clamp(cursorType, 0, 6)]; } }\n' +
'var spaces = "";\n' +
'for (var i = 0; i < spacing; i++) spaces += " ";\n' +
'beforeText == 1 ? cursor + spaces + visibleText : visibleText + spaces + cursor;';
    }

    // ─────────────────────────────────────────────────────────────────
    // Cursor range
    // ─────────────────────────────────────────────────────────────────
    if (category === "cursor" && name === "range") {
        return 'var txt = text.sourceText + ""; var len = txt.length; len > 0 ? ((len - 1) / len) * 100 : 0;';
    }
    
    // ─────────────────────────────────────────────────────────────────
    // Cursor blink - النسخة الكاملة مع blinkInHold
    // ─────────────────────────────────────────────────────────────────
    if (category === "cursor" && name === "blink") {
        return '// TEXTORO Cursor Blink\n' +
'var showCursor = effect("Show Cursor")(1);\n' +
'var blinkSpeed = effect("Blink Speed")(1);\n' +
'var blinkInHold = effect("Blink In Hold")(1);\n' +
'var inStart = -1, inEnd = -1, outStart = -1, outEnd = -1;\n' +
'var blinkStart = -1, blinkEnd = -1;\n' +
'var m = thisLayer.marker;\n' +
'if (m.numKeys > 0) {\n' +
'    for (var i = 1; i <= m.numKeys; i++) {\n' +
'        var c = m.key(i).comment;\n' +
'        var t = m.key(i).time - inPoint;\n' +
'        if (c == "IN_START") inStart = t;\n' +
'        else if (c == "IN_END") inEnd = t;\n' +
'        else if (c == "OUT_START") outStart = t;\n' +
'        else if (c == "OUT_END") outEnd = t;\n' +
'        else if (c == "BLINK_START") blinkStart = t;\n' +
'        else if (c == "BLINK_END") blinkEnd = t;\n' +
'    }\n' +
'}\n' +
'if (showCursor == 0) 100;\n' +
'else {\n' +
'    var currentTime = time - inPoint;\n' +
'    if (inStart < 0) inStart = 0;\n' +
'    var shouldBlink = false;\n' +
'    if (currentTime >= inStart && (inEnd < 0 || currentTime < inEnd)) shouldBlink = true;\n' +
'    if (outStart >= 0 && currentTime >= outStart && (outEnd < 0 || currentTime < outEnd)) shouldBlink = true;\n' +
'    if (blinkInHold == 1 && blinkStart >= 0 && blinkEnd >= 0) {\n' +
'        if (currentTime >= blinkStart && currentTime < blinkEnd) shouldBlink = true;\n' +
'    }\n' +
'    if (!shouldBlink) 0;\n' +
'    else {\n' +
'        var frameNum = Math.floor(time / thisComp.frameDuration);\n' +
'        var blinkFrames = Math.round(10 / blinkSpeed);\n' +
'        (frameNum % (blinkFrames * 2)) < blinkFrames ? 100 : 0;\n' +
'    }\n' +
'}';
    }

    // ─────────────────────────────────────────────────────────────────
    // Box path4corners - بسيط مع time
    // ─────────────────────────────────────────────────────────────────
    if (category === "box" && name === "path4corners") {
        return 'var rect = parent.sourceRectAtTime(time, false);\n' +
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
    }

    // ─────────────────────────────────────────────────────────────────
    // Box size - بسيط مع time
    // ─────────────────────────────────────────────────────────────────
    if (category === "box" && name === "size") {
        return 'var rect = parent.sourceRectAtTime(time, false);\n' +
'var pL = Math.max(0, parent.effect("Padding Left")(1));\n' +
'var pR = Math.max(0, parent.effect("Padding Right")(1));\n' +
'var pT = Math.max(0, parent.effect("Padding Top")(1));\n' +
'var pB = Math.max(0, parent.effect("Padding Bottom")(1));\n' +
'[rect.width + pL + pR, rect.height + pT + pB];';
    }
    
    // ─────────────────────────────────────────────────────────────────
    // Box position - بسيط مع time
    // ─────────────────────────────────────────────────────────────────
    if (category === "box" && name === "position") {
        return 'var rect = parent.sourceRectAtTime(time, false);\n' +
'var pL = Math.max(0, parent.effect("Padding Left")(1));\n' +
'var pR = Math.max(0, parent.effect("Padding Right")(1));\n' +
'var pT = Math.max(0, parent.effect("Padding Top")(1));\n' +
'var pB = Math.max(0, parent.effect("Padding Bottom")(1));\n' +
'var w = rect.width + pL + pR;\n' +
'var cx = rect.left - pL + w/2;\n' +
'[cx, rect.top + rect.height/2 + (pB-pT)/2];';
    }
    
    // ─────────────────────────────────────────────────────────────────
    // Box hideWhenEmpty - إخفاء الصندوق عند فراغ النص
    // ─────────────────────────────────────────────────────────────────
    if (category === "box" && name === "hideWhenEmpty") {
        return 'var txt = parent.text.sourceText.replace(/[\\| ]/g, "");\n' +
'txt.length > 0 ? clamp(parent.effect("{{OPACITY_CONTROL}}")(1), 0, 100) : 0;';
    }
    
    // Default fallback
    return '// Expression not found: ' + category + '/' + name;
}

$.writeln("[TEXTORO] ExpressionLoader module loaded!");
