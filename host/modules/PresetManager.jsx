/**
 * TEXTORO - Preset Manager Module
 * إدارة البريسات: تحميل، حفظ، حذف، تطبيق
 * v1.1.0 - ControllerManager Integration
 * 
 * التبعيات:
 * - Config.jsx
 * - Utilities.jsx
 * - ControllerManager.jsx
 * - TypewriterManager.jsx
 * - BoxManager.jsx
 * 
 * Changes in v1.1.0:
 * - Can use Controller Registry for preset validation
 * - Can use getControllerDefaults() for missing values
 */

$.writeln("[TEXTORO] Loading PresetManager module...");

// Module load flag
var PRESETMANAGER_MODULE_LOADED = true;

// ═══════════════════════════════════════════════════════════════════
// SETTINGS MANAGEMENT - إدارة الإعدادات
// ═══════════════════════════════════════════════════════════════════

// متغير لتخزين مسار الـ Presets المخصص
var _customPresetsPath = null;

/**
 * الحصول على مسار ملف الإعدادات
 * Note: _normalizePath is provided by Utilities.jsx (loaded first)
 */
function _getSettingsFilePath() {
    return _normalizePath(Folder.userData.fsName) + "/TEXTORO/settings.json";
}

/**
 * تحميل الإعدادات من الملف
 */
function _loadSettings() {
    try {
        var settingsFile = new File(_getSettingsFilePath());
        if (settingsFile.exists) {
            settingsFile.encoding = "UTF-8";
            settingsFile.open("r");
            var content = settingsFile.read();
            settingsFile.close();
            return JSON.parse(content);
        }
    } catch(e) {}
    return {};
}

/**
 * حفظ الإعدادات في الملف
 */
function _saveSettings(settings) {
    try {
        var textoroFolder = new Folder(_normalizePath(Folder.userData.fsName) + "/TEXTORO/");
        if (!textoroFolder.exists) {
            textoroFolder.create();
        }
        
        var settingsFile = new File(_getSettingsFilePath());
        settingsFile.encoding = "UTF-8";
        settingsFile.open("w");
        settingsFile.write(JSON.stringify(settings, null, 2));
        settingsFile.close();
        return true;
    } catch(e) {
        return false;
    }
}

// ═══════════════════════════════════════════════════════════════════
// PRESET CACHE SYSTEM - نظام الـ Cache للبريسات
// ═══════════════════════════════════════════════════════════════════

var _presetCache = {};

/**
 * الحصول على البريسات من الـ Cache
 */
function getCachedPresets(category) {
    return _presetCache[category] || null;
}

/**
 * حفظ البريسات في الـ Cache
 */
function setCachedPresets(category, presets) {
    _presetCache[category] = presets;
}

/**
 * مسح الـ Cache
 */
function clearPresetCache(category) {
    if (category) {
        delete _presetCache[category];
    } else {
        _presetCache = {};
    }
    return success("Cache cleared");
}

// ═══════════════════════════════════════════════════════════════════
// PRESET PATHS - مسارات البريسات
// ═══════════════════════════════════════════════════════════════════

/**
 * الحصول على مسار مجلد الـ Presets المخصصة
 */
function getPresetsPath() {
    var settings = _loadSettings();
    
    if (settings.presetsPath) {
        var normalizedPath = _normalizePath(settings.presetsPath);
        var customFolder = new Folder(normalizedPath);
        if (customFolder.exists) {
            var pathWithSlash = normalizedPath + (normalizedPath.slice(-1) === "/" ? "" : "/");
            _ensurePresetsFolders(pathWithSlash);
            return pathWithSlash;
        }
    }
    
    var defaultPath = _normalizePath(Folder.userData.fsName) + "/TEXTORO/presets/";
    var defaultFolder = new Folder(defaultPath);
    
    if (!defaultFolder.exists) {
        var textoroFolder = new Folder(_normalizePath(Folder.userData.fsName) + "/TEXTORO/");
        if (!textoroFolder.exists) {
            textoroFolder.create();
        }
        defaultFolder.create();
    }
    
    _ensurePresetsFolders(defaultPath);
    return defaultPath;
}

/**
 * التأكد من وجود المجلدات الفرعية للـ Presets
 */
function _ensurePresetsFolders(basePath) {
    var path = basePath + (basePath.slice(-1) === "/" ? "" : "/");
    
    var typeFolder = new Folder(path + "type/");
    var boxFolder = new Folder(path + "box/");
    var mixFolder = new Folder(path + "mix/");
    var motionFolder = new Folder(path + "motion/");
    var motionFullFolder = new Folder(path + "motion-full/");
    var toroFolder = new Folder(path + "toro/");
    
    if (!typeFolder.exists) typeFolder.create();
    if (!boxFolder.exists) boxFolder.create();
    if (!mixFolder.exists) mixFolder.create();
    if (!motionFolder.exists) motionFolder.create();
    if (!motionFullFolder.exists) motionFullFolder.create();
    if (!toroFolder.exists) toroFolder.create();
    
    _ensureIndexFile(path + "type/");
    _ensureIndexFile(path + "box/");
    _ensureIndexFile(path + "mix/");
    _ensureIndexFile(path + "motion/");
    _ensureIndexFile(path + "motion-full/");
    _ensureIndexFile(path + "toro/");
}

/**
 * التأكد من وجود ملف _index.json وصلاحيته
 */
function _ensureIndexFile(folderPath) {
    var indexFile = new File(folderPath + "_index.json");
    var needsCreate = false;
    
    if (!indexFile.exists) {
        needsCreate = true;
    } else {
        try {
            indexFile.encoding = "UTF-8";
            indexFile.open("r");
            var content = indexFile.read();
            indexFile.close();
            
            if (!content || content.length < 2) {
                needsCreate = true;
            } else {
                var parsed = JSON.parse(content);
                if (!parsed || !parsed.presets) {
                    needsCreate = true;
                }
            }
        } catch(e) {
            needsCreate = true;
        }
    }
    
    if (needsCreate) {
        indexFile.encoding = "UTF-8";
        indexFile.open("w");
        indexFile.write(JSON.stringify({ presets: [] }, null, 2));
        indexFile.close();
    }
}

/**
 * الحصول على مسار الـ Presets المدمجة
 * يستخدم getExtensionPath() من Utilities.jsx للكشف الديناميكي
 */
function getBuiltinPresetsPath() {
    // Method 1: Use dynamic path detection from Utilities
    var basePath = getExtensionPath();
    if (basePath) {
        var testPath = basePath + "config/presets/";
        var testFolder = new Folder(testPath);
        if (testFolder.exists) {
            return testPath;
        }
    }
    
    // Method 2: Try from script file location
    try {
        var scriptFile = new File($.fileName);
        if (scriptFile.exists && scriptFile.parent && scriptFile.parent.parent) {
            var testPath2 = _normalizePath(scriptFile.parent.parent.fsName) + "/config/presets/";
            var testFolder2 = new Folder(testPath2);
            if (testFolder2.exists) {
                return testPath2;
            }
        }
    } catch(e) {
        $.writeln("[TEXTORO] getBuiltinPresetsPath error: " + e.toString());
    }
    
    // Method 3: Platform-specific fallbacks
    var platform = $.os.indexOf("Windows") !== -1 ? "win" : "mac";
    
    if (platform === "win") {
        var winPaths = [
            "C:/Program Files (x86)/Common Files/Adobe/CEP/extensions/TEXTORO/config/presets/",
            "C:/Program Files/Common Files/Adobe/CEP/extensions/TEXTORO/config/presets/"
        ];
        for (var i = 0; i < winPaths.length; i++) {
            var folder = new Folder(winPaths[i]);
            if (folder.exists) return winPaths[i];
        }
        return winPaths[0];
    } else {
        var macPaths = [
            "~/Library/Application Support/Adobe/CEP/extensions/TEXTORO/config/presets/",
            "/Library/Application Support/Adobe/CEP/extensions/TEXTORO/config/presets/"
        ];
        for (var j = 0; j < macPaths.length; j++) {
            var folder = new Folder(macPaths[j]);
            if (folder.exists) return macPaths[j];
        }
        return macPaths[0];
    }
}

// ═══════════════════════════════════════════════════════════════════
// PRESET LOADING - تحميل البريسات
// ═══════════════════════════════════════════════════════════════════

/**
 * تحميل Preset بشكل آمن مع معالجة الأخطاء
 */
function loadPresetSafe(file) {
    try {
        file.encoding = "UTF-8";
        if (!file.open("r")) {
            throw new Error("Cannot open file");
        }
        
        var content = file.read();
        file.close();
        
        if (!content || content.length < 2) {
            throw new Error("Empty file");
        }
        
        var preset = JSON.parse(content);
        
        if (!preset.name) {
            throw new Error("Missing 'name' field");
        }
        
        return { success: true, preset: preset };
        
    } catch(e) {
        $.writeln("[TEXTORO] Preset error (" + file.name + "): " + e.message);
        return { success: false, error: e.message };
    }
}

/**
 * تحميل Preset بواسطة اسم الملف (Auto-Discovery)
 */
function _loadPresetByFileName(category, fileName) {
    if (!_isAllowedPresetCategory(category)) {
        $.writeln("[TEXTORO] _loadPresetByFileName - unsupported category: " + category);
        return null;
    }
    if (!_isSafePresetFileName(fileName)) {
        $.writeln("[TEXTORO] _loadPresetByFileName - unsafe fileName: " + fileName);
        return null;
    }
    // البحث في البريسات المدمجة أولاً
    var builtinPath = getBuiltinPresetsPath() + category + "/" + fileName;
    var builtinFile = new File(builtinPath);
    
    if (builtinFile.exists) {
        var result = loadPresetSafe(builtinFile);
        if (result.success) {
            result.preset.fileName = fileName;
            result.preset.source = "builtin";
            result.preset.builtin = true;
            return result.preset;
        }
    }
    
    // البحث في البريسات المخصصة
    var userPath = getPresetsPath() + category + "/" + fileName;
    var userFile = new File(userPath);
    
    if (userFile.exists) {
        var uResult = loadPresetSafe(userFile);
        if (uResult.success) {
            uResult.preset.fileName = fileName;
            uResult.preset.source = "user";
            uResult.preset.builtin = false;
            return uResult.preset;
        }
    }
    
    $.writeln("[TEXTORO] _loadPresetByFileName - not found: " + category + "/" + fileName);
    return null;
}

// ═══════════════════════════════════════════════════════════════════
// SEC-02: PRESET SECURITY BOUNDARIES - حدود أمان البريسات
// allowlist للفئات + حراسة أسماء الملفات والمسارات
// ═══════════════════════════════════════════════════════════════════

var PRESET_CATEGORIES_ALLOWED = {
    "toro": true,
    "type": true,
    "box": true,
    "mix": true,
    "motion": true,
    "motion-full": true
};

function _isAllowedPresetCategory(category) {
    return typeof category === "string" && PRESET_CATEGORIES_ALLOWED[category] === true;
}

function _normalizePresetCategory(category) {
    return _isAllowedPresetCategory(category) ? category : null;
}

function _isSafePresetFileName(fileName) {
    if (typeof fileName !== "string" || fileName.length === 0 || fileName.length > 200) return false;
    if (fileName.indexOf("/") !== -1) return false;
    if (fileName.indexOf("\\") !== -1) return false;
    if (fileName.indexOf(":") !== -1) return false;
    if (fileName.indexOf("..") !== -1) return false;
    if (fileName.charAt(0) === ".") return false;
    if (!/\.json$/i.test(fileName)) return false;
    return true;
}

function _getUserPresetCategoryFolder(category) {
    var norm = _normalizePresetCategory(category);
    if (!norm) return null;
    var base = getPresetsPath();
    if (!base) return null;
    return base + norm + "/";
}

function _getUserPresetFile(category, fileName) {
    var catPath = _getUserPresetCategoryFolder(category);
    if (!catPath) return null;
    if (!_isSafePresetFileName(fileName)) return null;
    return new File(catPath + fileName);
}

// DATA-02: اسم ملف فريد دائماً - لا overwrite أبداً (يلحق -2، -3...)
function _createUniquePresetFileName(category, displayName, preferredId) {
    var base = String(displayName || "").toLowerCase()
        .replace(/[^a-z0-9\u0600-\u06FF]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
    if (!base) base = String(preferredId || "preset");
    var catPath = _getUserPresetCategoryFolder(category);
    var candidate = base + ".json";
    if (!catPath) return candidate;
    var n = 2;
    while ((new File(catPath + candidate)).exists && n < 1000) {
        candidate = base + "-" + n + ".json";
        n++;
    }
    return candidate;
}

// Shared CRUD helpers - Phase 3 (§4.4 atomic policy)
function _readUserPresetIndex(category) {
    var catPath = _getUserPresetCategoryFolder(category);
    if (!catPath) return { presets: [] };
    var indexFile = new File(catPath + "_index.json");
    if (!indexFile.exists) return { presets: [] };
    try {
        indexFile.encoding = "UTF-8";
        if (!indexFile.open("r")) return { presets: [] };
        var raw = indexFile.read();
        indexFile.close();
        var parsed = JSON.parse(raw);
        if (!parsed || !parsed.presets || !(parsed.presets instanceof Array)) return { presets: [] };
        return parsed;
    } catch (e) {
        return { presets: [] };
    }
}

function _writeUserPresetIndex(category, indexObj) {
    var catPath = _getUserPresetCategoryFolder(category);
    if (!catPath) return false;
    var target = new File(catPath + "_index.json");
    var tmp = new File(catPath + "_index.json.tmp");
    try {
        var payload = JSON.stringify(indexObj, null, 2);
        JSON.parse(payload);
        tmp.encoding = "UTF-8";
        if (!tmp.open("w")) return false;
        tmp.write(payload);
        tmp.close();
        tmp.encoding = "UTF-8";
        if (!tmp.open("r")) return false;
        JSON.parse(tmp.read());
        tmp.close();
        if (target.exists) target.remove();
        tmp.rename(target.name);
        return true;
    } catch (e) {
        try { if (tmp.exists) tmp.remove(); } catch (_e2) {}
        return false;
    }
}

function _findIndexEntryById(indexObj, id) {
    if (!indexObj || !indexObj.presets) return -1;
    for (var i = 0; i < indexObj.presets.length; i++) {
        if (indexObj.presets[i].id === id) return i;
    }
    return -1;
}

function _writeUserPreset(category, presetObj) {
    var fileName = presetObj.file || _createUniquePresetFileName(category, presetObj.name, presetObj.id);
    if (!_isSafePresetFileName(fileName)) return null;
    var file = _getUserPresetFile(category, fileName);
    if (!file) return null;
    var catPath = _getUserPresetCategoryFolder(category);
    if (!catPath) return null;
    var tmp = new File(catPath + fileName + ".tmp");
    try {
        var payload = JSON.stringify(presetObj, null, 2);
        JSON.parse(payload);
        tmp.encoding = "UTF-8";
        if (!tmp.open("w")) return null;
        tmp.write(payload);
        tmp.close();
        tmp.encoding = "UTF-8";
        if (!tmp.open("r")) { try { tmp.remove(); } catch (_e) {} return null; }
        JSON.parse(tmp.read());
        tmp.close();
        var target = new File(catPath + fileName);
        if (target.exists) target.remove();
        tmp.rename(fileName);
        presetObj.file = fileName;
        return fileName;
    } catch (e) {
        try { if (tmp.exists) tmp.remove(); } catch (_e2) {}
        return null;
    }
}

function _deleteUserPreset(category, id) {
    var indexObj = _readUserPresetIndex(category);
    var idx = _findIndexEntryById(indexObj, id);
    if (idx === -1) return false;
    var entry = indexObj.presets[idx];
    if (entry.builtin) return false;
    var fileName = entry.file;
    if (!_isSafePresetFileName(fileName)) return false;
    var file = _getUserPresetFile(category, fileName);
    var existedBefore = file && file.exists;
    if (file && file.exists) file.remove();
    indexObj.presets.splice(idx, 1);
    if (!_writeUserPresetIndex(category, indexObj)) {
        return false;
    }
    clearPresetCache(category);
    return existedBefore || true;
}

/**
 * تحميل Presets حسب الفئة (Auto-Discovery)
 */
function loadPresets(optsJSON) {
    try {
        var opts = safeJSONParse(optsJSON, null);
        if (!opts) return error("Invalid options JSON");
        
        var category = opts.category;
        var forceReload = opts.forceReload || false;
        
        if (!category) {
            return error("No category provided");
        }
        if (!_isAllowedPresetCategory(category)) {
            return error("Unsupported preset category: " + category);
        }
        
        // التحقق من الـ Cache أولاً
        if (!forceReload) {
            var cached = getCachedPresets(category);
            if (cached) {
                return success("", { presets: cached, fromCache: true });
            }
        }
        
        var presets = [];
        
        // 1. قراءة البريسات المدمجة
        var builtinPath = getBuiltinPresetsPath() + category + "/";
        var builtinFolder = new Folder(builtinPath);
        
        if (builtinFolder.exists) {
            var builtinFiles = builtinFolder.getFiles("*.json");
            for (var i = 0; i < builtinFiles.length; i++) {
                var file = builtinFiles[i];
                if (file.name.charAt(0) === '_') continue;
                
                var result = loadPresetSafe(file);
                if (result.success) {
                    result.preset.fileName = file.name;
                    result.preset.filePath = file.fsName;
                    result.preset.source = "builtin";
                    if (result.preset.builtin === undefined) {
                        result.preset.builtin = true;
                    }
                    presets.push(result.preset);
                }
            }
        }
        
        // 2. قراءة البريسات المخصصة
        var userPath = getPresetsPath() + category + "/";
        var userFolder = new Folder(userPath);
        
        if (userFolder.exists) {
            var userFiles = userFolder.getFiles("*.json");
            for (var j = 0; j < userFiles.length; j++) {
                var uFile = userFiles[j];
                if (uFile.name.charAt(0) === '_') continue;
                
                var uResult = loadPresetSafe(uFile);
                if (uResult.success) {
                    uResult.preset.fileName = uFile.name;
                    uResult.preset.filePath = uFile.fsName;
                    uResult.preset.source = "user";
                    if (uResult.preset.builtin === undefined) {
                        uResult.preset.builtin = false;
                    }
                    presets.push(uResult.preset);
                }
            }
        }
        
        // 3. ترتيب البريسات
        presets.sort(function(a, b) {
            if (a.builtin && !b.builtin) return -1;
            if (!a.builtin && b.builtin) return 1;
            return (a.name || "").localeCompare(b.name || "");
        });
        
        // 4. حفظ في الـ Cache
        setCachedPresets(category, presets);
        
        return success("", { presets: presets, fromCache: false });
        
    } catch(e) {
        return error(e.toString());
    }
}

// ═══════════════════════════════════════════════════════════════════
// PRESET CRUD - إنشاء، قراءة، تحديث، حذف
// ═══════════════════════════════════════════════════════════════════

/**
 * إنشاء معرف فريد للـ Preset
 */
function generatePresetId(category) {
    return category + "_user_" + (new Date()).getTime().toString(36) + Math.random().toString(36).substring(2, 6);
}

/**
 * قراءة قائمة الـ Presets لفئة معينة
 */
function getPresetList(optsJSON) {
    try {
        var opts = safeJSONParse(optsJSON, null);
        if (!opts) return error("Invalid options JSON");
        
        var category = opts.category;
        var allPresets = [];
        
        // 1. الـ Presets المدمجة
        var builtinPath = getBuiltinPresetsPath() + category + "/_index.json";
        var builtinFile = new File(builtinPath);
        
        if (builtinFile.exists) {
            try {
                builtinFile.encoding = "UTF-8";
                builtinFile.open("r");
                var builtinContent = builtinFile.read();
                builtinFile.close();
                
                if (builtinContent && builtinContent.length > 2) {
                    var builtinIndex = JSON.parse(builtinContent);
                    if (builtinIndex.presets) {
                        for (var i = 0; i < builtinIndex.presets.length; i++) {
                            var p = builtinIndex.presets[i];
                            p.source = "builtin";
                            allPresets.push(p);
                        }
                    }
                }
            } catch(builtinErr) {}
        }
        
        // 2. الـ Presets المخصصة
        var userPath = getPresetsPath() + category + "/_index.json";
        var userFile = new File(userPath);
        
        if (userFile.exists) {
            try {
                userFile.encoding = "UTF-8";
                userFile.open("r");
                var userContent = userFile.read();
                userFile.close();
                
                if (userContent && userContent.length > 2) {
                    var userIndex = JSON.parse(userContent);
                    if (userIndex.presets) {
                        for (var j = 0; j < userIndex.presets.length; j++) {
                            var up = userIndex.presets[j];
                            up.source = "user";
                            allPresets.push(up);
                        }
                    }
                }
            } catch(userErr) {}
        }
        
        return success("", { presets: allPresets });
        
    } catch(e) {
        return error(e.toString());
    }
}

/**
 * قراءة جميع الـ Presets من كل الفئات
 */
function getAllPresets() {
    try {
        var allPresets = [];
        var categories = ["toro", "type", "box", "mix", "motion"];
        
        for (var c = 0; c < categories.length; c++) {
            var category = categories[c];
            
            // الـ Presets المدمجة
            var builtinPath = getBuiltinPresetsPath() + category + "/_index.json";
            var builtinFile = new File(builtinPath);
            
            if (builtinFile.exists) {
                try {
                    builtinFile.encoding = "UTF-8";
                    builtinFile.open("r");
                    var builtinContent = builtinFile.read();
                    builtinFile.close();
                    
                    if (builtinContent && builtinContent.length > 2) {
                        var builtinIndex = JSON.parse(builtinContent);
                        if (builtinIndex.presets) {
                            for (var i = 0; i < builtinIndex.presets.length; i++) {
                                var bp = builtinIndex.presets[i];
                                bp.category = category;
                                bp.source = "builtin";
                                allPresets.push(bp);
                            }
                        }
                    }
                } catch(builtinErr) {}
            }
            
            // الـ Presets المخصصة
            var userPath = getPresetsPath() + category + "/_index.json";
            var userFile = new File(userPath);
            
            if (userFile.exists) {
                try {
                    userFile.encoding = "UTF-8";
                    userFile.open("r");
                    var userContent = userFile.read();
                    userFile.close();
                    
                    if (userContent && userContent.length > 2) {
                        var userIndex = JSON.parse(userContent);
                        if (userIndex.presets) {
                            for (var j = 0; j < userIndex.presets.length; j++) {
                                var up = userIndex.presets[j];
                                up.category = category;
                                up.source = "user";
                                allPresets.push(up);
                            }
                        }
                    }
                } catch(userErr) {}
            }
        }
        
        return success("", { presets: allPresets });
        
    } catch(e) {
        return error(e.toString());
    }
}

/**
 * قراءة Preset كامل
 */
function getPreset(optsJSON) {
    try {
        var opts = safeJSONParse(optsJSON, null);
        if (!opts) return error("Invalid options JSON");
        
        var category = opts.category;
        if (!_isAllowedPresetCategory(category)) return error("Unsupported preset category: " + category);
        var id = opts.id;
        
        var fileName = null;
        var presetBasePath = null;
        var isBuiltin = id.indexOf("_builtin_") !== -1;
        
        if (isBuiltin) {
            var builtinIndexPath = getBuiltinPresetsPath() + category + "/_index.json";
            var builtinIndexFile = new File(builtinIndexPath);
            
            if (builtinIndexFile.exists) {
                builtinIndexFile.open("r");
                var builtinIndex = JSON.parse(builtinIndexFile.read());
                builtinIndexFile.close();
                
                for (var i = 0; i < builtinIndex.presets.length; i++) {
                    if (builtinIndex.presets[i].id === id) {
                        fileName = builtinIndex.presets[i].file;
                        presetBasePath = getBuiltinPresetsPath();
                        break;
                    }
                }
            }
        } else {
            var userIndexPath = getPresetsPath() + category + "/_index.json";
            var userIndexFile = new File(userIndexPath);
            
            if (userIndexFile.exists) {
                userIndexFile.open("r");
                var userIndex = JSON.parse(userIndexFile.read());
                userIndexFile.close();
                
                for (var j = 0; j < userIndex.presets.length; j++) {
                    if (userIndex.presets[j].id === id) {
                        fileName = userIndex.presets[j].file;
                        presetBasePath = getPresetsPath();
                        break;
                    }
                }
            }
        }
        
        if (!fileName || !presetBasePath) {
            return error("Preset not found: " + id);
        }
        
        var presetPath = presetBasePath + category + "/" + fileName;
        var presetFile = new File(presetPath);
        
        if (!presetFile.exists) {
            return error("Preset file not found: " + presetPath);
        }
        
        presetFile.open("r");
        var presetContent = presetFile.read();
        presetFile.close();
        
        var preset = JSON.parse(presetContent);
        return success("", preset);
        
    } catch(e) {
        return error(e.toString());
    }
}


/**
 * حفظ Preset جديد
 */
function savePreset(optsJSON) {
    try {
        $.writeln("[TEXTORO] savePreset called with: " + optsJSON);
        var opts = safeJSONParse(optsJSON, null);
        if (!opts) return error("Invalid options JSON");
        
        var category = opts.category;
        var name = opts.name;
        var icon = opts.icon || "📄";
        var values = opts.values;
        
        if (!values) {
            return error("No values provided for preset");
        }
        if (!category) {
            return error("No category provided");
        }
        if (!name) {
            return error("No name provided");
        }
        
        // SEC-02/DATA-02: فئة موثقة واسم ملف فريد - لا overwrite أبداً (§4.3)
        if (!_isAllowedPresetCategory(category)) {
            return error("Unsupported preset category: " + category);
        }
        var id = generatePresetId(category);
        var fileName = _createUniquePresetFileName(category, name, id);
        
        // إنشاء كائن الـ Preset
        var preset = {
            id: id,
            name: name,
            icon: icon,
            category: category,
            builtin: false,
            created: _getISODate(),
            values: values
        };
        
        // الحصول على مسار الـ Presets - عبر helper موثق
        var categoryPath = _getUserPresetCategoryFolder(category);
        if (!categoryPath) {
            return error("Unsupported preset category: " + category);
        }
        
        // التأكد من وجود مجلد الفئة
        var categoryFolder = new Folder(categoryPath);
        if (!categoryFolder.exists) {
            var created = categoryFolder.create();
            if (!created) {
                return error("Cannot create category folder: " + categoryPath);
            }
        }
        
        // حفظ ملف الـ Preset - عبر helper موثق (يضمن عدم traversal)
        var presetFile = _getUserPresetFile(category, fileName);
        if (!presetFile) {
            return error("Invalid preset file name: " + fileName);
        }

        // §4.4 atomic: كتابة الملف ثم الـ index مع rollback عند فشل الـ index
        preset.file = fileName;
        var writtenName = _writeUserPreset(category, preset);
        if (!writtenName) {
            return error("Failed to save preset file");
        }
        
        // مسح الـ Cache
        clearPresetCache(category);
        
        // تحديث الـ index عبر helper ذري
        var index = _readUserPresetIndex(category);
        if (!index.presets) index.presets = [];
        index.presets.push({ id: id, file: writtenName, name: name, icon: icon || "📄", builtin: false });
        if (!_writeUserPresetIndex(category, index)) {
            try { var _rb = _getUserPresetFile(category, writtenName); if (_rb && _rb.exists) _rb.remove(); } catch (_eRb2) {}
            return error("Failed to update preset index");
        }
        return success("Preset saved", { id: id, file: writtenName, path: _getUserPresetCategoryFolder(category) + writtenName });
        
    } catch(e) {
        return error("savePreset error: " + e.toString());
    }
}

/**
 * حذف Preset
 */
function deletePreset(optsJSON) {
    try {
        var opts = safeJSONParse(optsJSON, null);
        if (!opts) return error("Invalid options JSON");
        
        var category = opts.category;
        var id = opts.id;
        var name = opts.name;
        
        if (!category) {
            return error("Category required");
        }
        // SEC-02: فئة موثقة فقط
        if (!_isAllowedPresetCategory(category)) {
            return error("Unsupported preset category: " + category);
        }
        
        var userPresetsPath = getPresetsPath();
        
        // Phase 3 §3 - الحذف الآن بالـ id فقط (المسار القديم بالـ name أُزيل بعد ترحيل كل مستدعيات الواجهة)
        if (name && !id) {
            return error("Delete by name is no longer supported - please update the panel and use id");
        }
        
        // البحث بواسطة id
        var indexPath = userPresetsPath + category + "/_index.json";
        var indexFile = new File(indexPath);
        
        if (!indexFile.exists) return error("Index not found");
        
        indexFile.encoding = "UTF-8";
        indexFile.open("r");
        var indexContent = indexFile.read();
        indexFile.close();
        
        var index;
        try { index = JSON.parse(indexContent); } 
        catch(parseErr) { return error("Failed to parse index"); }
        
        if (!index.presets || !index.presets.length) return error("No presets in index");
        
        var fileName = null;
        var presetIndex = -1;
        
        for (var j = 0; j < index.presets.length; j++) {
            if (index.presets[j].id === id) {
                if (index.presets[j].builtin) return error("Cannot delete built-in preset");
                fileName = index.presets[j].file;
                presetIndex = j;
                break;
            }
        }
        
        if (presetIndex === -1) return error("Preset not found");

        // SEC-02: حراسة اسم الملف القادم من الـ index
        if (!_isSafePresetFileName(fileName)) {
            return error("Invalid file name in index: " + fileName);
        }
        var presetFile = _getUserPresetFile(category, fileName);
        if (!presetFile) return error("Invalid preset path");
        if (presetFile.exists) presetFile.remove();
        
        index.presets.splice(presetIndex, 1);
        
        if (!_writeUserPresetIndex(category, index)) {
            return error("Failed to update preset index");
        }
        
        clearPresetCache(category);
        return success("Preset deleted");
        
    } catch(e) {
        return error(e.toString());
    }
}

/**
 * إصلاح index فاسد أو قديم (Phase 3 §3.8 - اختياري للتركيبات الحالية)
 * يعيد بناء user index عبر مسح *.json والتحقق من كل ملف، مع نسخ احتياطي.
 */
function repairPresetIndex(optsJSON) {
    try {
        var opts = null;
        try { opts = JSON.parse(optsJSON); } catch (_e0) { opts = {}; }
        var category = opts ? opts.category : null;
        if (!category) {
            var cats = ["type", "box", "mix", "motion", "motion-full", "toro"];
            var results = {};
            for (var ci = 0; ci < cats.length; ci++) {
                var r = JSON.parse(repairPresetIndex(JSON.stringify({ category: cats[ci] })));
                results[cats[ci]] = r;
            }
            return success("Repaired all categories", results);
        }
        if (!_isAllowedPresetCategory(category)) return error("Unsupported preset category: " + category);
        var catPath = _getUserPresetCategoryFolder(category);
        if (!catPath) return error("Invalid category path");
        var indexFile = new File(catPath + "_index.json");
        if (indexFile.exists) {
            try {
                var stamp = _getISODate().replace(/[:\.]/g, "-");
                var bak = new File(catPath + "_index.json.bak-" + stamp);
                indexFile.copy(bak.fsName);
            } catch (_eBak) {}
        }
        var folder = new Folder(catPath);
        if (!folder.exists) return success("No user folder, nothing to repair", { category: category, count: 0 });
        var files = folder.getFiles("*.json");
        var newIndex = { presets: [] };
        var skipped = 0;
        for (var i = 0; i < files.length; i++) {
            var f = files[i];
            if (f.name === "_index.json" || f.name.indexOf(".bak-") !== -1) continue;
            if (f.name.indexOf(".tmp") !== -1) continue;
            try {
                f.encoding = "UTF-8";
                if (!f.open("r")) { skipped++; continue; }
                var raw = f.read();
                f.close();
                var obj = JSON.parse(raw);
                if (!obj || typeof obj.id !== "string" || typeof obj.name !== "string" || typeof obj.values !== "object" || obj.values === null) { skipped++; continue; }
                if (obj.builtin) continue;
                newIndex.presets.push({ id: obj.id, file: f.name, name: obj.name, icon: obj.icon || "📄", builtin: false });
            } catch (_eSkip) { try { f.close(); } catch (_e2) {} skipped++; }
        }
        if (!_writeUserPresetIndex(category, newIndex)) return error("Failed to write repaired index");
        clearPresetCache(category);
        return success("Repaired index", { category: category, count: newIndex.presets.length, skipped: skipped });
    } catch (e) {
        return error(e.toString());
    }
}

/**
 * إعادة تسمية Preset
 */
function renamePreset(optsJSON) {
    try {
        var opts = safeJSONParse(optsJSON, null);
        if (!opts) return error("Invalid options JSON");
        
        var category = opts.category;
        if (!_isAllowedPresetCategory(category)) return error("Unsupported preset category: " + category);
        var id = opts.id;
        var newName = opts.newName;
        
        var indexPath = getPresetsPath() + category + "/_index.json";
        var indexFile = new File(indexPath);
        
        if (!indexFile.exists) {
            return error("Index not found");
        }
        
        indexFile.open("r");
        var index = JSON.parse(indexFile.read());
        indexFile.close();
        
        var presetEntry = null;
        var presetIndex = -1;
        
        for (var i = 0; i < index.presets.length; i++) {
            if (index.presets[i].id === id) {
                if (index.presets[i].builtin) {
                    return error("Cannot rename built-in preset");
                }
                presetEntry = index.presets[i];
                presetIndex = i;
                break;
            }
        }
        
        if (presetIndex === -1) {
            return error("Preset not found");
        }
        
        var presetPath = getPresetsPath() + category + "/" + presetEntry.file;
        var presetFile = new File(presetPath);
        
        if (!presetFile.exists) {
            return error("Preset file not found");
        }
        
        presetFile.open("r");
        var preset = JSON.parse(presetFile.read());
        presetFile.close();
        
        preset.name = newName;
        
        presetFile.open("w");
        presetFile.write(JSON.stringify(preset, null, 2));
        presetFile.close();
        
        index.presets[presetIndex].name = newName;
        
        indexFile.open("w");
        indexFile.write(JSON.stringify(index, null, 2));
        indexFile.close();
        
        clearPresetCache(category);
        return success("Preset renamed");
        
    } catch(e) {
        return error(e.toString());
    }
}

// ═══════════════════════════════════════════════════════════════════
// PRESET PATH SETTINGS - إعدادات مسار البريسات
// ═══════════════════════════════════════════════════════════════════

/**
 * الحصول على إعداد مسار الـ Presets
 */
function getPresetsPathSetting() {
    try {
        var settings = _loadSettings();
        var path = settings.presetsPath ? _normalizePath(settings.presetsPath) : "";
        
        var result = {
            path: path,
            exists: false,
            writable: false
        };
        
        if (path) {
            var folder = new Folder(path);
            result.exists = folder.exists;
            
            if (folder.exists) {
                var testFile = new File(path + "/_write_test.tmp");
                result.writable = testFile.open("w");
                if (result.writable) {
                    testFile.close();
                    testFile.remove();
                }
            }
        }
        
        return success("", result);
        
    } catch(e) {
        return error(e.toString());
    }
}

/**
 * تعيين مسار الـ Presets
 */
function setPresetsPathSetting(optsJSON) {
    try {
        var opts = safeJSONParse(optsJSON, null);
        if (!opts) return error("Invalid options JSON");
        
        var path = opts.path;
        
        if (!path) {
            return error("No path provided");
        }
        
        path = _normalizePath(path);
        
        var folder = new Folder(path);
        if (!folder.exists) {
            var created = folder.create();
            if (!created) {
                return error("Cannot create folder: " + path);
            }
        }
        
        var pathWithSlash = path + (path.slice(-1) === "/" ? "" : "/");
        _ensurePresetsFolders(pathWithSlash);
        
        var settings = _loadSettings();
        settings.presetsPath = path;
        
        if (_saveSettings(settings)) {
            return success("Presets path saved", { path: path });
        } else {
            return error("Failed to save settings");
        }
        
    } catch(e) {
        return error(e.toString());
    }
}

/**
 * فتح نافذة اختيار المجلد
 */
function browseForPresetsFolder() {
    try {
        var folder = Folder.selectDialog("Select Presets Folder");
        
        if (folder) {
            var path = _normalizePath(folder.fsName);
            
            var testFile = new File(path + "/_write_test.tmp");
            var writable = testFile.open("w");
            if (writable) {
                testFile.close();
                testFile.remove();
            }
            
            return success("", { path: path, writable: writable });
        } else {
            return success("", { path: null, cancelled: true });
        }
        
    } catch(e) {
        return error(e.toString());
    }
}

/**
 * فتح مجلد الـ Presets
 */
function openPresetsFolder() {
    try {
        var presetsPath = getPresetsPath();
        var folder = new Folder(presetsPath);
        
        if (!folder.exists) {
            folder.create();
        }
        
        folder.execute();
        return success("Folder opened");
        
    } catch(e) {
        return error(e.toString());
    }
}

$.writeln("[TEXTORO] PresetManager module loaded (Part 1)");


// ═══════════════════════════════════════════════════════════════════
// PRESET APPLICATION - تطبيق البريسات
// ═══════════════════════════════════════════════════════════════════

/**
 * استخراج قيم Type من الطبقة المحددة
 */
function _extractTypeValues(layer) {
    if (!hasTypewriter(layer)) return null;
    
    var fx = layer.property("ADBE Effect Parade");
    var markers = layer.property("Marker");
    var inPoint = layer.inPoint;
    
    var values = {
        twAuto: _getCheckboxValue(fx, "TW Auto", true),
        twReverse: _getCheckboxValue(fx, "TW Reverse", false),
        wordMode: _getCheckboxValue(fx, "Word Mode", false),
        randomSpeed: _getSliderValue(fx, "Random Speed", 0),
        showCursor: _getCheckboxValue(fx, "Show Cursor", true),
        cursorBefore: _getCheckboxValue(fx, "Cursor Before Text", false),
        cursorColor: _getColorValue(fx, "Cursor Color", [1, 1, 1]),
        cursorSpacing: _getSliderValue(fx, "Cursor Spacing", 0),
        blinkSpeed: _getSliderValue(fx, "Blink Speed", 2),
        blinkInHold: _getCheckboxValue(fx, "Blink In Hold", true),
        boxRTL: _getCheckboxValue(fx, "Box RTL", false),
        liveText: _getCheckboxValue(fx, "Live Text", true), // N-04
        easingType: _getSliderValue(fx, "Easing Type", 1),
        easingStrength: _getSliderValue(fx, "Easing Strength", 100),
        inStart: null,
        inEnd: null,
        outStart: null,
        outEnd: null,
        blinkStart: null,
        blinkEnd: null
    };
    
    // قراءة Markers
    for (var i = 1; i <= markers.numKeys; i++) {
        var comment = markers.keyValue(i).comment;
        var time = markers.keyTime(i) - inPoint;
        
        if (comment === "IN_START") values.inStart = time;
        else if (comment === "IN_END") values.inEnd = time;
        else if (comment === "OUT_START") values.outStart = time;
        else if (comment === "OUT_END") values.outEnd = time;
        else if (comment === "BLINK_START") values.blinkStart = time;
        else if (comment === "BLINK_END") values.blinkEnd = time;
    }
    
    return values;
}

/**
 * استخراج قيم Box من الطبقة المحددة
 */
function _extractBoxValues(layer, comp) {
    if (!hasBox(layer, comp)) return null;
    
    var fx = layer.property("ADBE Effect Parade");
    
    var hasCornerTL = findEffectControl(fx, "Corner TL") !== null;
    var use4Corners = hasCornerTL;
    var hasTextColor = findEffectControl(fx, "Text Color") !== null;
    
    var values = {
        paddingLeft: _getSliderValue(fx, "Padding Left", 40),
        paddingRight: _getSliderValue(fx, "Padding Right", 40),
        paddingTop: _getSliderValue(fx, "Padding Top", 20),
        paddingBottom: _getSliderValue(fx, "Padding Bottom", 20),
        use4Corners: use4Corners,
        strokeWidth: _getSliderValue(fx, "Stroke Width", 2),
        strokeOpacity: _getSliderValue(fx, "Stroke Opacity", 100),
        strokeColor: _getColorValue(fx, "Stroke Color", [1, 1, 1]),
        strokeDash: _getSliderValue(fx, "Stroke Dash", 0),
        strokeGap: _getSliderValue(fx, "Stroke Gap", 0),
        fillOpacity: _getSliderValue(fx, "Fill Opacity", 100),
        fillColor: _getColorValue(fx, "Fill Color", [0.2, 0.4, 0.9]),
        trimStart: _getSliderValue(fx, "Trim Start", 0),
        trimEnd: _getSliderValue(fx, "Trim End", 100),
        trimOffset: _getSliderValue(fx, "Trim Offset", 0),
        pathOffset: _getSliderValue(fx, "Path Offset", 0),
        lockBoxSize: _getCheckboxValue(fx, "Lock Box Size", true)
    };
    
    if (use4Corners) {
        values.cornerTL = _getSliderValue(fx, "Corner TL", 15);
        values.cornerTR = _getSliderValue(fx, "Corner TR", 15);
        values.cornerBR = _getSliderValue(fx, "Corner BR", 15);
        values.cornerBL = _getSliderValue(fx, "Corner BL", 15);
    } else {
        values.cornerRadius = _getSliderValue(fx, "Corner Radius", 15);
    }
    
    if (hasTextColor) {
        values.applyTextColor = true;
        values.textColor = _getColorValue(fx, "Text Color", [1, 1, 1]);
    } else {
        values.applyTextColor = false;
    }
    
    return values;
}

/**
 * استخراج قيم الطبقة لحفظها كـ Preset
 */
function getLayerValuesForPreset(optsJSON) {
    try {
        var opts = safeJSONParse(optsJSON, null);
        if (!opts) return error("Invalid options JSON");
        
        var category = opts.category;
        
        var comp = getActiveComp();
        if (!comp) return error("افتح Composition أولاً");
        
        var layer = getSelectedTextLayer(comp);
        if (!layer) return error("اختر طبقة نص");
        
        var values = null;
        
        if (category === "type") {
            values = _extractTypeValues(layer);
            if (!values) return error("الطبقة لا تحتوي على Typewriter");
        } else if (category === "box") {
            values = _extractBoxValues(layer, comp);
            if (!values) return error("الطبقة لا تحتوي على Box");
        } else if (category === "mix") {
            var typeValues = _extractTypeValues(layer);
            var boxValues = _extractBoxValues(layer, comp);
            
            if (!typeValues && !boxValues) {
                return error("الطبقة لا تحتوي على Typewriter أو Box");
            }
            
            values = {
                type: typeValues,
                box: boxValues
            };
        }
        
        return success("", { values: values });
        
    } catch(e) {
        return error(e.toString());
    }
}

/**
 * الحصول على قيم Motion من الطبقة المحددة
 */
function getMotionValuesForPreset() {
    try {
        var comp = getActiveComp();
        if (!comp) return error("افتح Composition أولاً");
        
        var layer = getSelectedTextLayer(comp);
        if (!layer) return error("اختر طبقة نص");
        
        var fx = layer.property("ADBE Effect Parade");
        var hasMotionEffect = false;
        for (var i = 1; i <= fx.numProperties; i++) {
            if (fx.property(i).name === "Motion In Start") {
                hasMotionEffect = true;
                break;
            }
        }
        
        if (!hasMotionEffect) {
            return error("الطبقة لا تحتوي على Motion");
        }
        
        var values = {
            inStart: _getEffectValue(fx, "Motion In Start", 0),
            inEnd: _getEffectValue(fx, "Motion In End", 1),
            outEnable: _getEffectValue(fx, "Motion Out Start", -1) >= 0,
            outStart: _getEffectValue(fx, "Motion Out Start", -1),
            outEnd: _getEffectValue(fx, "Motion Out End", -1),
            syncMode: 0,
            animatePosition: _getEffectValue(fx, "Animate Position", 0) == 1,
            posFromX: _getEffectValue(fx, "Pos From X", 0),
            posFromY: _getEffectValue(fx, "Pos From Y", 0),
            posToX: _getEffectValue(fx, "Pos To X", 0),
            posToY: _getEffectValue(fx, "Pos To Y", 0),
            animateScale: _getEffectValue(fx, "Animate Scale", 0) == 1,
            scaleFrom: _getEffectValue(fx, "Scale From", 100),
            scaleTo: _getEffectValue(fx, "Scale To", 100),
            animateRotation: _getEffectValue(fx, "Animate Rotation", 0) == 1,
            rotFrom: _getEffectValue(fx, "Rot From", 0),
            rotTo: _getEffectValue(fx, "Rot To", 0),
            animateOpacity: _getEffectValue(fx, "Animate Opacity", 0) == 1,
            opacityFrom: _getEffectValue(fx, "Opacity From", 0),
            opacityTo: _getEffectValue(fx, "Opacity To", 100),
            easingType: _getEffectValue(fx, "Motion Easing Type", 1),
            easingStrength: _getEffectValue(fx, "Motion Easing Strength", 100)
        };
        
        return success("", { values: values });
        
    } catch(e) {
        return error(e.toString());
    }
}

/**
 * الحصول على قيم TORO الكاملة (Type + Box + Motion)
 */
function getToroValuesForPreset() {
    try {
        var comp = getActiveComp();
        if (!comp) return error("افتح Composition أولاً");
        
        var layer = getSelectedTextLayer(comp);
        if (!layer) return error("اختر طبقة نص");
        
        var fx = layer.property("ADBE Effect Parade");
        var values = {
            type: null,
            box: null,
            motion: null
        };
        
        // 1. استخراج قيم Type
        if (hasTypewriter(layer)) {
            values.type = {
                direction: _getEffectValue(fx, "Box RTL", 0) == 1 ? "rtl" : "ltr",
                showCursor: _getEffectValue(fx, "Show Cursor", 1) == 1,
                cursorBefore: _getEffectValue(fx, "Cursor Before Text", 0) == 1,
                cursorType: _getEffectValue(fx, "Cursor Type", 0),
                cursorSpacing: _getEffectValue(fx, "Cursor Spacing", 0),
                blinkSpeed: _getEffectValue(fx, "Blink Speed", 2),
                blinkInHold: _getEffectValue(fx, "Blink In Hold", 1) == 1,
                reverse: _getEffectValue(fx, "TW Reverse", 0) == 1,
                wordMode: _getEffectValue(fx, "Word Mode", 0) == 1,
                randomSpeed: _getEffectValue(fx, "Random Speed", 0),
                easingType: _getEffectValue(fx, "Easing Type", 1),
                easingStrength: _getEffectValue(fx, "Easing Strength", 100),
                boxRTL: _getEffectValue(fx, "Box RTL", 0) == 1
            };
            
            var markers = layer.property("Marker");
            for (var i = 1; i <= markers.numKeys; i++) {
                var comment = markers.keyValue(i).comment;
                var time = markers.keyTime(i) - layer.inPoint;
                if (comment === "IN_START") values.type.inStart = time;
                else if (comment === "IN_END") values.type.inEnd = time;
                else if (comment === "OUT_START") values.type.outStart = time;
                else if (comment === "OUT_END") values.type.outEnd = time;
                else if (comment === "BLINK_START") values.type.blinkStart = time;
                else if (comment === "BLINK_END") values.type.blinkEnd = time;
            }
            
            values.type.cursorColor = _getEffectColorValue(fx, "Cursor Color", [1, 1, 1]);
        }
        
        // 2. استخراج قيم Box
        var hasBoxEffect = false;
        for (var j = 1; j <= fx.numProperties; j++) {
            if (fx.property(j).name === "Padding Left") {
                hasBoxEffect = true;
                break;
            }
        }
        
        if (hasBoxEffect) {
            values.box = {
                paddingLeft: _getEffectValue(fx, "Padding Left", 40),
                paddingRight: _getEffectValue(fx, "Padding Right", 40),
                paddingTop: _getEffectValue(fx, "Padding Top", 20),
                paddingBottom: _getEffectValue(fx, "Padding Bottom", 20),
                cornerTL: _getEffectValue(fx, "Corner TL", 15),
                cornerTR: _getEffectValue(fx, "Corner TR", 15),
                cornerBL: _getEffectValue(fx, "Corner BL", 15),
                cornerBR: _getEffectValue(fx, "Corner BR", 15),
                strokeWidth: _getEffectValue(fx, "Stroke Width", 2),
                strokeOpacity: _getEffectValue(fx, "Stroke Opacity", 100),
                fillOpacity: _getEffectValue(fx, "Fill Opacity", 100)
            };
            
            values.box.strokeColor = _getEffectColorValue(fx, "Stroke Color", [1, 1, 1]);
            values.box.fillColor = _getEffectColorValue(fx, "Fill Color", [0.2, 0.4, 0.9]);
        }
        
        // 3. استخراج قيم Motion
        var hasMotion = false;
        for (var k = 1; k <= fx.numProperties; k++) {
            if (fx.property(k).name === "Motion In Start") {
                hasMotion = true;
                break;
            }
        }
        
        if (hasMotion) {
            values.motion = {
                inStart: _getEffectValue(fx, "Motion In Start", 0),
                inEnd: _getEffectValue(fx, "Motion In End", 1),
                outEnable: _getEffectValue(fx, "Motion Out Start", -1) >= 0,
                outStart: _getEffectValue(fx, "Motion Out Start", -1),
                outEnd: _getEffectValue(fx, "Motion Out End", -1),
                animatePosition: _getEffectValue(fx, "Animate Position", 0) == 1,
                posFromX: _getEffectValue(fx, "Pos From X", 0),
                posFromY: _getEffectValue(fx, "Pos From Y", 0),
                posToX: _getEffectValue(fx, "Pos To X", 0),
                posToY: _getEffectValue(fx, "Pos To Y", 0),
                animateScale: _getEffectValue(fx, "Animate Scale", 0) == 1,
                scaleFrom: _getEffectValue(fx, "Scale From", 100),
                scaleTo: _getEffectValue(fx, "Scale To", 100),
                animateRotation: _getEffectValue(fx, "Animate Rotation", 0) == 1,
                rotFrom: _getEffectValue(fx, "Rot From", 0),
                rotTo: _getEffectValue(fx, "Rot To", 0),
                animateOpacity: _getEffectValue(fx, "Animate Opacity", 0) == 1,
                opacityFrom: _getEffectValue(fx, "Opacity From", 0),
                opacityTo: _getEffectValue(fx, "Opacity To", 100),
                easingType: _getEffectValue(fx, "Motion Easing Type", 1),
                easingStrength: _getEffectValue(fx, "Motion Easing Strength", 100)
            };
        }
        
        if (!values.type && !values.box && !values.motion) {
            return error("الطبقة لا تحتوي على Type أو Box أو Motion");
        }
        
        return success("", { values: values });
        
    } catch(e) {
        return error(e.toString());
    }
}

/**
 * Helper: Get effect color control value
 */
function _getEffectColorValue(fx, name, defaultVal) {
    try {
        for (var i = 1; i <= fx.numProperties; i++) {
            if (fx.property(i).name === name) {
                return fx.property(i).property(1).value;
            }
        }
    } catch(e) {}
    return defaultVal;
}

/**
 * Helper: Get effect control value
 */
function _getEffectValue(fx, name, defaultVal) {
    try {
        for (var i = 1; i <= fx.numProperties; i++) {
            if (fx.property(i).name === name) {
                return fx.property(i).property(1).value;
            }
        }
    } catch(e) {}
    return defaultVal;
}

$.writeln("[TEXTORO] PresetManager module loaded (Part 2)");


// ═══════════════════════════════════════════════════════════════════
// APPLY PRESET - تطبيق البريست على الطبقة
// ═══════════════════════════════════════════════════════════════════

/**
 * تطبيق Preset على الطبقة المحددة أو إنشاء طبقة جديدة
 */
function applyPreset(optsJSON) {
    var undoStarted = false; // F-05
    try {
        var opts = safeJSONParse(optsJSON, null);
        if (!opts) return error("Invalid options JSON");
        
        var category = opts.category;
        var id = opts.id;
        var fileName = opts.fileName;
        
        $.writeln("[TEXTORO] applyPreset called - category: " + category + ", id: " + id + ", fileName: " + fileName);
        
        var comp = getActiveComp();
        if (!comp) return error("افتح Composition أولاً");
        
        var preset = null;
        
        // إذا كان لدينا fileName، نقرأ الملف مباشرة
        if (fileName) {
            preset = _loadPresetByFileName(category, fileName);
            if (!preset) {
                return error("Preset file not found: " + fileName);
            }
        } else if (id) {
            var presetResult = JSON.parse(getPreset(JSON.stringify({ category: category, id: id })));
            if (!presetResult.success) {
                return error(presetResult.error);
            }
            preset = presetResult.data;
        } else {
            return error("No preset identifier provided (id or fileName)");
        }
        
        $.writeln("[TEXTORO] applyPreset - preset loaded: " + preset.name);
        
        var layers = getSelectedTextLayers(comp);
        var createdNew = false;
        
        app.beginUndoGroup("TEXTORO - Apply Preset");
        undoStarted = true;
        // إذا لم يكن هناك نص محدد، ننشئ طبقة جديدة
        if (layers.length === 0) {
            var isRTL = false;
            if (category === "type" && preset.values.boxRTL) {
                isRTL = preset.values.boxRTL;
            } else if (category === "mix" && preset.values.type && preset.values.type.boxRTL) {
                isRTL = preset.values.type.boxRTL;
            }
            
            var defaultText = isRTL ? CONFIG.TEXT.RTL : CONFIG.TEXT.LTR;
            
            var newLayer = comp.layers.addText(defaultText);
            newLayer.name = "TEXTORO";
            newLayer.property("Position").setValue([comp.width/2, comp.height/2]);
            layers = [newLayer];
            createdNew = true;
        }
        
        // تطبيق البريست على كل الطبقات المحددة
        for (var i = 0; i < layers.length; i++) {
            var layer = layers[i];
            _applyPresetToSingleLayer(layer, comp, category, preset);
        }
        
        app.endUndoGroup();
        undoStarted = false;

        var msg = createdNew ? "تم إنشاء نص وتطبيق الـ Preset" : "تم تطبيق الـ Preset على " + layers.length + " طبقة";
        return success(msg, { createdNew: createdNew, count: layers.length });

    } catch(e) {
        if (undoStarted) {
            try { app.endUndoGroup(); } catch(_e) {}
        }
        return error(e.toString());
    }
}

/**
 * تطبيق Preset على طبقة واحدة
 */
function _applyPresetToSingleLayer(layer, comp, category, preset) {
    $.writeln("[TEXTORO] _applyPresetToSingleLayer - category: " + category);
    
    if (category === "type") {
        _applyTypePreset(layer, preset.values);
    } else if (category === "box") {
        if (!hasTypewriter(layer)) {
            var defaultTypeOpts = {
                direction: "ltr",
                showCursor: true,
                cursorBefore: false,
                cursorSpacing: 0,
                blinkSpeed: 2,
                blinkInHold: true,
                inStart: 2,
                inEnd: 3,
                outStart: 6,
                outEnd: 7,
                noOut: false,
                blinkStart: 1,
                blinkEnd: 10,
                reverse: false,
                randomSpeed: 0
            };
            _applyTypewriter(layer, defaultTypeOpts);
        }
        _applyBoxPreset(layer, comp, preset.values);
    } else if (category === "mix") {
        if (preset.values.type) {
            _applyTypePreset(layer, preset.values.type);
        }
        if (preset.values.box) {
            _applyBoxPreset(layer, comp, preset.values.box);
        }
    } else if (category === "motion") {
        // تطبيق Motion preset
        $.writeln("[TEXTORO] Applying Motion preset: " + preset.name);
        _applyMotionPreset(layer, preset.values);
    } else if (category === "toro") {
        // تطبيق TORO preset (Type + Box + Motion)
        $.writeln("[TEXTORO] Applying TORO preset: " + preset.name);
        
        // 1. تطبيق Type
        if (preset.values.type) {
            $.writeln("[TEXTORO] TORO - Applying Type");
            _applyTypePreset(layer, preset.values.type);
        }
        
        // 2. تطبيق Box
        if (preset.values.box) {
            $.writeln("[TEXTORO] TORO - Applying Box");
            _applyBoxPreset(layer, comp, preset.values.box);
        }
        
        // 3. تطبيق Motion
        if (preset.values.motion) {
            $.writeln("[TEXTORO] TORO - Applying Motion");
            _applyMotionPreset(layer, preset.values.motion);
        }
    }
}

/**
 * تطبيق قيم Motion على الطبقة
 */
function _applyMotionPreset(layer, values) {
    $.writeln("[TEXTORO] _applyMotionPreset START");
    
    // إزالة Motion القديم إن وجد
    if (typeof _removeMotion === "function") {
        _removeMotion(layer);
    }
    
    // تطبيق Motion الجديد
    if (typeof _applyMotion === "function") {
        _applyMotion(layer, values);
        _updateMotionFlag(layer, true);
    } else {
        $.writeln("[TEXTORO] WARNING: _applyMotion function not found");
    }
    
    $.writeln("[TEXTORO] _applyMotionPreset END");
}

/**
 * تحديث Markers للـ Typewriter
 */
function _updateTypewriterMarkers(layer, values) {
    var markers = layer.property("Marker");
    var inPoint = layer.inPoint;
    
    var timingMarkers = ["IN_START", "IN_END", "OUT_START", "OUT_END", "BLINK_START", "BLINK_END"];
    for (var i = markers.numKeys; i >= 1; i--) {
        var comment = markers.keyValue(i).comment;
        for (var j = 0; j < timingMarkers.length; j++) {
            if (comment === timingMarkers[j]) {
                markers.removeKey(i);
                break;
            }
        }
    }
    
    var OFFSET = 0.005;
    
    var inStartTime = (values.inStart != null && values.inStart !== "") ? parseFloat(values.inStart) : 2;
    var inEndTime = (values.inEnd != null && values.inEnd !== "") ? parseFloat(values.inEnd) : 3;
    var outStartTime = (values.outStart != null && values.outStart !== "") ? parseFloat(values.outStart) : -1;
    var outEndTime = (values.outEnd != null && values.outEnd !== "") ? parseFloat(values.outEnd) : -1;
    var blinkStartTime = (values.blinkStart != null && values.blinkStart !== "") ? parseFloat(values.blinkStart) : 1;
    var blinkEndTime = (values.blinkEnd != null && values.blinkEnd !== "") ? parseFloat(values.blinkEnd) : 10;
    
    if (isNaN(inStartTime)) inStartTime = 2;
    if (isNaN(inEndTime)) inEndTime = 3;
    if (isNaN(blinkStartTime)) blinkStartTime = 1;
    if (isNaN(blinkEndTime)) blinkEndTime = 10;
    if (isNaN(outStartTime)) outStartTime = 6;
    if (isNaN(outEndTime)) outEndTime = 7;
    
    if (blinkStartTime < OFFSET) {
        blinkStartTime = OFFSET;
    }
    
    if (inStartTime <= blinkStartTime + OFFSET) {
        inStartTime = blinkStartTime + OFFSET;
    }
    
    if (inEndTime <= inStartTime + OFFSET) {
        inEndTime = inStartTime + OFFSET;
    }
    
    var MARKER_COLORS = { IN: 3, OUT: 1, BLINK: 9 };
    
    var blinkStartM = new MarkerValue("BLINK_START");
    blinkStartM.label = MARKER_COLORS.BLINK;
    markers.setValueAtTime(inPoint + blinkStartTime, blinkStartM);
    
    var inStartM = new MarkerValue("IN_START");
    inStartM.label = MARKER_COLORS.IN;
    markers.setValueAtTime(inPoint + inStartTime, inStartM);
    
    var inEndM = new MarkerValue("IN_END");
    inEndM.label = MARKER_COLORS.IN;
    markers.setValueAtTime(inPoint + inEndTime, inEndM);
    
    if (outStartTime >= 0 && outEndTime >= 0) {
        if (outStartTime <= inEndTime + OFFSET) {
            outStartTime = inEndTime + OFFSET;
        }
        
        if (outEndTime <= outStartTime + OFFSET) {
            outEndTime = outStartTime + OFFSET;
        }
        
        var outStartM = new MarkerValue("OUT_START");
        outStartM.label = MARKER_COLORS.OUT;
        markers.setValueAtTime(inPoint + outStartTime, outStartM);
        
        var outEndM = new MarkerValue("OUT_END");
        outEndM.label = MARKER_COLORS.OUT;
        markers.setValueAtTime(inPoint + outEndTime, outEndM);
        
        if (blinkEndTime <= outEndTime + OFFSET) {
            blinkEndTime = outEndTime + OFFSET;
        }
    } else {
        if (blinkEndTime <= inEndTime + OFFSET) {
            blinkEndTime = inEndTime + OFFSET;
        }
    }
    
    var blinkEndM = new MarkerValue("BLINK_END");
    blinkEndM.label = MARKER_COLORS.BLINK;
    markers.setValueAtTime(inPoint + blinkEndTime, blinkEndM);
}

/**
 * تطبيق قيم Type على الطبقة
 */
function _applyTypePreset(layer, values) {
    $.writeln("[TEXTORO] ========== _applyTypePreset START ==========");
    $.writeln("[TEXTORO] values: " + JSON.stringify(values));
    
    var hasTW = hasTypewriter(layer);
    $.writeln("[TEXTORO] hasTypewriter: " + hasTW);
    
    // إزالة القديم وتطبيق الجديد
    _removeTypewriter(layer);
    
    var opts = {
        direction: values.boxRTL ? "rtl" : "ltr",
        showCursor: values.showCursor,
        cursorBefore: values.cursorBefore,
        cursorColor: values.cursorColor,
        cursorSpacing: values.cursorSpacing,
        blinkSpeed: values.blinkSpeed,
        blinkInHold: values.blinkInHold,
        reverse: values.twReverse,
        randomSpeed: values.randomSpeed,
        easingType: (values.easingType != null) ? values.easingType : 1,
        easingStrength: (values.easingStrength != null) ? values.easingStrength : 100,
        inStart: values.inStart,
        inEnd: values.inEnd,
        outStart: values.outStart,
        outEnd: values.outEnd,
        noOut: (values.outStart === null || values.outStart === undefined),
        blinkStart: values.blinkStart,
        blinkEnd: values.blinkEnd
    };
    
    _applyTypewriter(layer, opts);
    $.writeln("[TEXTORO] ========== _applyTypePreset END ==========");
}

/**
 * تطبيق قيم Box على الطبقة
 */
function _applyBoxPreset(layer, comp, values) {
    _removeBox(layer, comp);
    _createBox(layer, comp, values);
}

$.writeln("[TEXTORO] PresetManager module loaded (Part 3 - Apply)");
