/**
 * TEXTORO - Import/Export Module
 * استيراد وتصدير البريسات
 * v1.0.0
 * 
 * التبعيات:
 * - Config.jsx
 * - Utilities.jsx
 * - PresetManager.jsx
 */

$.writeln("[TEXTORO] Loading ImportExport module...");

// Module load flag
var IMPORTEXPORT_MODULE_LOADED = true;

// ═══════════════════════════════════════════════════════════════════
// EXPORT FUNCTIONS - دوال التصدير
// ═══════════════════════════════════════════════════════════════════

/**
 * تصدير بريست واحد
 * @param {string} optsJSON - {category, id}
 * @returns {string} JSON response with preset data
 */
function exportPreset(optsJSON) {
    try {
        var opts = safeJSONParse(optsJSON, null);
        if (!opts) return error("Invalid options JSON");
        
        var category = opts.category;
        var id = opts.id;
        
        var builtinPath = getBuiltinPresetsPath();
        var userPath = getPresetsPath();
        
        var preset = null;
        var paths = [userPath, builtinPath];
        
        for (var p = 0; p < paths.length; p++) {
            var indexPath = paths[p] + category + "/_index.json";
            var indexFile = new File(indexPath);
            
            if (!indexFile.exists) continue;
            
            indexFile.encoding = "UTF-8";
            indexFile.open("r");
            var indexContent = indexFile.read();
            indexFile.close();
            
            var index = JSON.parse(indexContent);
            
            for (var i = 0; i < index.presets.length; i++) {
                if (index.presets[i].id === id) {
                    var presetPath = paths[p] + category + "/" + index.presets[i].file;
                    var presetFile = new File(presetPath);
                    
                    if (presetFile.exists) {
                        presetFile.encoding = "UTF-8";
                        presetFile.open("r");
                        preset = JSON.parse(presetFile.read());
                        presetFile.close();
                    }
                    break;
                }
            }
            
            if (preset) break;
        }
        
        if (!preset) {
            return error("Preset not found: " + id);
        }
        
        // فتح نافذة حفظ الملف
        var saveFile = File.saveDialog("Export Preset", "TEXTORO Preset:*.txpreset");
        if (!saveFile) {
            return error("Export cancelled");
        }
        
        // إضافة الامتداد إذا لم يكن موجوداً
        if (saveFile.name.indexOf(".txpreset") === -1) {
            saveFile = new File(saveFile.fsName + ".txpreset");
        }
        
        // إضافة metadata للتصدير
        preset.exportedAt = _getISODate();
        preset.exportVersion = CONFIG.VERSION;
        
        saveFile.encoding = "UTF-8";
        saveFile.open("w");
        saveFile.write(JSON.stringify(preset, null, 2));
        saveFile.close();
        
        return success("Preset exported", { path: saveFile.fsName });
        
    } catch(e) {
        return error("exportPreset error: " + e.toString());
    }
}

/**
 * تصدير كل البريسات
 * @returns {string} JSON response
 */
function exportAllPresets() {
    try {
        var allPresets = {
            version: CONFIG.VERSION,
            exportedAt: _getISODate(),
            presets: {
                type: [],
                box: [],
                mix: [],
                motion: [],
                "motion-full": [],
                toro: []
            }
        };

        // E-04: كل الفئات وليس type/box/mix فقط
        var categories = ["type", "box", "mix", "motion", "motion-full", "toro"];
        var userPath = getPresetsPath();
        
        for (var c = 0; c < categories.length; c++) {
            var category = categories[c];
            var indexPath = userPath + category + "/_index.json";
            var indexFile = new File(indexPath);
            
            if (!indexFile.exists) continue;
            
            indexFile.encoding = "UTF-8";
            indexFile.open("r");
            var index = JSON.parse(indexFile.read());
            indexFile.close();
            
            for (var i = 0; i < index.presets.length; i++) {
                var entry = index.presets[i];
                if (entry.builtin) continue; // تخطي المدمجة
                
                var presetPath = userPath + category + "/" + entry.file;
                var presetFile = new File(presetPath);
                
                if (presetFile.exists) {
                    presetFile.encoding = "UTF-8";
                    presetFile.open("r");
                    var preset = JSON.parse(presetFile.read());
                    presetFile.close();
                    allPresets.presets[category].push(preset);
                }
            }
        }
        
        // فتح نافذة حفظ الملف
        var saveFile = File.saveDialog("Export All Presets", "TEXTORO Pack:*.txpack");
        if (!saveFile) {
            return error("Export cancelled");
        }
        
        // إضافة الامتداد إذا لم يكن موجوداً
        if (saveFile.name.indexOf(".txpack") === -1) {
            saveFile = new File(saveFile.fsName + ".txpack");
        }
        
        saveFile.encoding = "UTF-8";
        saveFile.open("w");
        saveFile.write(JSON.stringify(allPresets, null, 2));
        saveFile.close();
        
        // E-04: عدّ كل الفئات ديناميكياً
        var totalCount = 0;
        for (var ck in allPresets.presets) {
            if (allPresets.presets.hasOwnProperty(ck)) {
                totalCount += allPresets.presets[ck].length;
            }
        }
        return success("Exported " + totalCount + " presets", { path: saveFile.fsName, count: totalCount });
        
    } catch(e) {
        return error("exportAllPresets error: " + e.toString());
    }
}

// ═══════════════════════════════════════════════════════════════════
// IMPORT FUNCTIONS - دوال الاستيراد
// ═══════════════════════════════════════════════════════════════════

/**
 * استيراد بريست أو حزمة
 * @returns {string} JSON response
 */
function importPresets() {
    try {
        // فتح نافذة اختيار الملف
        var importFile = File.openDialog("Import Presets", "TEXTORO Files:*.txpreset;*.txpack,All Files:*.*");
        if (!importFile) {
            return error("Import cancelled");
        }
        
        importFile.encoding = "UTF-8";
        importFile.open("r");
        var content = importFile.read();
        importFile.close();
        
        var data = JSON.parse(content);
        var imported = 0;
        
        // التحقق من نوع الملف
        if (data.presets && (data.presets.type || data.presets.box || data.presets.mix ||
                             data.presets.motion || data.presets["motion-full"] || data.presets.toro)) {
            // ملف حزمة (.txpack) - E-04: كل الفئات
            var categories = ["type", "box", "mix", "motion", "motion-full", "toro"];
            
            for (var c = 0; c < categories.length; c++) {
                var category = categories[c];
                var presets = data.presets[category];
                
                if (!presets || !presets.length) continue;
                
                for (var i = 0; i < presets.length; i++) {
                    var preset = presets[i];
                    var result = _importSinglePreset(preset, category);
                    if (result) imported++;
                }
            }
        } else if (data.id && data.category && data.values) {
            // ملف بريست واحد (.txpreset) - SEC-02: فئة موثقة فقط
            if (!_isAllowedPresetCategory(data.category)) {
                return error("Unsupported preset category: " + data.category);
            }
            var result = _importSinglePreset(data, data.category);
            if (result) imported = 1;
        } else {
            return error("Invalid preset file format");
        }
        
        return success("Imported " + imported + " preset(s)", { count: imported });
        
    } catch(e) {
        return error("importPresets error: " + e.toString());
    }
}

/**
 * استيراد بريست واحد (دالة داخلية)
 * @param {Object} preset - كائن البريست
 * @param {string} category - الفئة
 * @returns {boolean} - نجاح أو فشل
 */
function _importSinglePreset(preset, category) {
    try {
        // SEC-02 + DATA-02: تحقق من شكل البريست والفئة قبل أي IO
        if (typeof preset !== "object" || preset === null) return false;
        if (typeof preset.name !== "string" || preset.name.replace(/\s/g, "") === "") return false;
        if (typeof preset.values !== "object" || preset.values === null) return false;
        if (!_isAllowedPresetCategory(category)) return false;
        if (preset.category && !_isAllowedPresetCategory(preset.category)) return false;

        // إنشاء ID جديد واسم ملف فريد (لا overwrite أبداً)
        var newId = generatePresetId(category);
        var fileName = _createUniquePresetFileName(category, preset.name, newId);
        if (!_isSafePresetFileName(fileName)) return false;
        
        // تحديث البريست
        preset.id = newId;
        preset.builtin = false;
        preset.imported = true;
        preset.importedAt = _getISODate();
        
        // الحصول على مسار الـ Presets - عبر helper موثق
        var categoryPath = _getUserPresetCategoryFolder(category);
        if (!categoryPath) return false;
        
        // التأكد من وجود المجلد
        var categoryFolder = new Folder(categoryPath);
        if (!categoryFolder.exists) {
            categoryFolder.create();
        }
        
        // §4.4 atomic: كتابة الملف والـ index مع rollback
        preset.file = fileName;
        var written = _writeUserPreset(category, preset);
        if (!written) return false;
        var index = _readUserPresetIndex(category);
        if (!index.presets) index.presets = [];
        index.presets.push({ id: newId, file: written, name: preset.name, icon: preset.icon || "📄", builtin: false });
        if (!_writeUserPresetIndex(category, index)) {
            try { var _rb2 = _getUserPresetFile(category, written); if (_rb2 && _rb2.exists) _rb2.remove(); } catch (_eRb3) {}
            return false;
        }
        clearPresetCache(category);
        return true;
        
    } catch(e) {
        $.writeln("[TEXTORO] _importSinglePreset error: " + e.toString());
        return false;
    }
}

// ═══════════════════════════════════════════════════════════════════
// EXPORT BY FILENAME - تصدير بواسطة اسم الملف
// ═══════════════════════════════════════════════════════════════════

/**
 * تصدير بريست بواسطة اسم الملف (للنظام الجديد Auto-Discovery)
 * @param {string} optsJSON - {category, fileName}
 * @returns {string} JSON response
 */
function exportPresetByFileName(optsJSON) {
    try {
        var opts = safeJSONParse(optsJSON, null);
        if (!opts) return error("Invalid options JSON");
        
        var category = opts.category;
        var fileName = opts.fileName;
        
        if (!category || !fileName) {
            return error("Category and fileName required");
        }

        // SEC-02: حراسة الفئة واسم الملف قبل أي IO
        if (!_isAllowedPresetCategory(category)) {
            return error("Unsupported preset category: " + category);
        }
        if (!_isSafePresetFileName(fileName)) {
            return error("Invalid file name: " + fileName);
        }
        
        // تحميل البريست
        var preset = _loadPresetByFileName(category, fileName);
        if (!preset) {
            return error("Preset not found: " + fileName);
        }
        
        // فتح نافذة حفظ الملف
        var defaultName = fileName.replace(".json", ".txpreset");
        // E-04: تمرير الاسم المقترح فعلياً للـ dialog (كان متجاهلاً)
        var saveFile = File.saveDialog("Export Preset", "TEXTORO Preset:*.txpreset", defaultName);
        if (!saveFile) {
            return error("Export cancelled");
        }
        
        // إضافة الامتداد إذا لم يكن موجوداً
        if (saveFile.name.indexOf(".txpreset") === -1) {
            saveFile = new File(saveFile.fsName + ".txpreset");
        }
        
        // إضافة metadata للتصدير
        preset.exportedAt = _getISODate();
        preset.exportVersion = CONFIG.VERSION;
        
        saveFile.encoding = "UTF-8";
        saveFile.open("w");
        saveFile.write(JSON.stringify(preset, null, 2));
        saveFile.close();
        
        return success("Preset exported", { path: saveFile.fsName });
        
    } catch(e) {
        return error("exportPresetByFileName error: " + e.toString());
    }
}

/**
 * استيراد بريست من مسار محدد (بدون نافذة)
 * @param {string} optsJSON - {filePath, category}
 * @returns {string} JSON response
 */
function importPresetFromPath(optsJSON) {
    try {
        var opts = safeJSONParse(optsJSON, null);
        if (!opts) return error("Invalid options JSON");
        
        var filePath = opts.filePath;
        var category = opts.category;
        
        if (!filePath) {
            return error("File path required");
        }
        
        var importFile = new File(filePath);
        if (!importFile.exists) {
            return error("File not found: " + filePath);
        }
        
        importFile.encoding = "UTF-8";
        importFile.open("r");
        var content = importFile.read();
        importFile.close();
        
        var preset = JSON.parse(content);
        
        // تحديد الفئة من البريست إذا لم تُحدد
        if (!category && preset.category) {
            category = preset.category;
        }
        
        if (!category) {
            return error("Category not specified");
        }

        // SEC-02: فئة موثقة فقط - يمنع traversal عبر payload
        if (!_isAllowedPresetCategory(category)) {
            return error("Unsupported preset category: " + category);
        }
        if (preset.category && !_isAllowedPresetCategory(preset.category)) {
            return error("Unsupported preset category in file: " + preset.category);
        }
        
        var result = _importSinglePreset(preset, category);
        if (result) {
            return success("Preset imported", { name: preset.name });
        } else {
            return error("Failed to import preset");
        }
        
    } catch(e) {
        return error("importPresetFromPath error: " + e.toString());
    }
}

$.writeln("[TEXTORO] ImportExport module loaded");
