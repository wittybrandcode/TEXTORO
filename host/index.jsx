/**
 * TEXTORO CEP - Host Script
 * v1.0.0 - Modular Architecture
 * 
 * هذا الملف يقوم بتحميل جميع الوحدات بالترتيب الصحيح
 * الكود الفعلي موجود في مجلد modules/
 */

// Debug flag
$.writeln("[TEXTORO] index.jsx loaded - v1.0.0 Modular");

// ═══════════════════════════════════════════════════════════════════
// MODULE LOADING - تحميل الوحدات بالترتيب
// ═══════════════════════════════════════════════════════════════════

// 1. الإعدادات والثوابت (لا تبعيات)
#include "modules/Config.jsx"

// 2. الدوال المساعدة (تعتمد على Config)
#include "modules/Utilities.jsx"

// 2.5. إدارة المتحكمات المركزية (تعتمد على Config, Utilities)
#include "modules/ControllerManager.jsx"

// 3. نظام تحميل الـ Expressions (تعتمد على Config, Utilities)
#include "modules/ExpressionLoader.jsx"

// 4. إدارة Typewriter (تعتمد على Config, Utilities, ExpressionLoader)
#include "modules/TypewriterManager.jsx"

// 5. إدارة Box و Layer ID System (تعتمد على Config, Utilities, ExpressionLoader)
#include "modules/BoxManager.jsx"

// 6. إدارة Multi-Lines (تعتمد على TypewriterManager, BoxManager)
#include "modules/MultiLinesManager.jsx"

// 7. إدارة Soga Panel - قراءة/كتابة Effect Controls
#include "modules/SogaManager.jsx"

// 8. عمليات الطبقات (تعتمد على الوحدات السابقة)
#include "modules/LayerOperations.jsx"

// 9. إدارة الـ Presets
#include "modules/PresetManager.jsx"

// 10. استيراد/تصدير
#include "modules/ImportExport.jsx"

// 11. مدير الحركة (Motion)
#include "modules/MotionManager.jsx"

// ═══════════════════════════════════════════════════════════════════
// VERIFICATION - التحقق من تحميل الوحدات
// ═══════════════════════════════════════════════════════════════════

$.writeln("[TEXTORO] Checking loaded modules...");

var _loadedModules = [];
if (typeof CONFIG_MODULE_LOADED !== "undefined") _loadedModules.push("Config");
if (typeof UTILITIES_MODULE_LOADED !== "undefined") _loadedModules.push("Utilities");
if (typeof CONTROLLERMANAGER_MODULE_LOADED !== "undefined") _loadedModules.push("ControllerManager");
if (typeof EXPRESSIONLOADER_MODULE_LOADED !== "undefined") _loadedModules.push("ExpressionLoader");
if (typeof TYPEWRITERMANAGER_MODULE_LOADED !== "undefined") _loadedModules.push("TypewriterManager");
if (typeof BOXMANAGER_MODULE_LOADED !== "undefined") _loadedModules.push("BoxManager");
if (typeof MULTILINESMANAGER_MODULE_LOADED !== "undefined") _loadedModules.push("MultiLinesManager");
if (typeof SOGAMANAGER_MODULE_LOADED !== "undefined") _loadedModules.push("SogaManager");
if (typeof LAYEROPERATIONS_MODULE_LOADED !== "undefined") _loadedModules.push("LayerOperations");
if (typeof PRESETMANAGER_MODULE_LOADED !== "undefined") _loadedModules.push("PresetManager");
if (typeof IMPORTEXPORT_MODULE_LOADED !== "undefined") _loadedModules.push("ImportExport");

$.writeln("[TEXTORO] Loaded modules: " + _loadedModules.join(", "));
$.writeln("[TEXTORO] Total: " + _loadedModules.length + "/11 modules");

// التحقق من MotionManager
if (typeof MOTIONMANAGER_MODULE_LOADED !== "undefined") {
    $.writeln("[TEXTORO] MotionManager loaded!");
}

// ═══════════════════════════════════════════════════════════════════
// DEBUG FUNCTIONS - دوال التصحيح
// ═══════════════════════════════════════════════════════════════════

/**
 * اختبار مسار الإضافة وملفات Controllers
 * يمكن استدعاؤها من Console للتصحيح
 */
function debugExtensionPath() {
    try {
        var result = {
            extensionPath: getExtensionPath(),
            controllersPath: typeof getControllersPath === "function" ? getControllersPath() : "N/A"
        };
        
        // اختبار وجود الملفات
        if (result.extensionPath) {
            var configFolder = new Folder(result.extensionPath + "config/controllers/");
            result.configFolderExists = configFolder.exists;
            
            if (configFolder.exists) {
                var registryFile = new File(result.extensionPath + "config/controllers/_registry.json");
                var typewriterFile = new File(result.extensionPath + "config/controllers/typewriter.json");
                var boxFile = new File(result.extensionPath + "config/controllers/box.json");
                var motionFile = new File(result.extensionPath + "config/controllers/motion.json");
                
                result.files = {
                    registry: registryFile.exists,
                    typewriter: typewriterFile.exists,
                    box: boxFile.exists,
                    motion: motionFile.exists
                };
            }
        }
        
        $.writeln("[TEXTORO] debugExtensionPath result: " + JSON.stringify(result));
        return success("Debug info", result);
        
    } catch(e) {
        return error("Debug error: " + e.toString());
    }
}

// ═══════════════════════════════════════════════════════════════════
// READY
// ═══════════════════════════════════════════════════════════════════

$.writeln("[TEXTORO] index.jsx ready!");
