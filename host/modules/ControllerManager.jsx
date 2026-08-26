/**
 * TEXTORO - Controller Manager Module
 * إدارة المتحكمات المركزية
 * 
 * Version: 1.1.0
 * Dependencies: Config.jsx, Utilities.jsx
 * 
 * Features:
 *   - Load controllers from JSON registry
 *   - Create/remove controllers on layers
 *   - Build expressions with shared code
 *   - Validate controller values
 *   - Cache for performance
 */

var CONTROLLERMANAGER_MODULE_LOADED = true;

$.writeln("[TEXTORO] Loading ControllerManager module...");

// ═══════════════════════════════════════════════════════════════════
// CACHE & STATE
// ═══════════════════════════════════════════════════════════════════

var _controllerRegistry = null;
var _controllerCache = {};
var _sharedExprCache = {};
var _extensionPathCache = null;

// ═══════════════════════════════════════════════════════════════════
// PATH HELPERS
// ═══════════════════════════════════════════════════════════════════

function getControllersPath() {
    var basePath = getExtensionPath();
    var path = basePath + "config/controllers/";
    $.writeln("[TEXTORO] getControllersPath: " + path);
    return path;
}

function getSharedExpressionsPath() {
    return getExtensionPath() + "host/expressions/shared/";
}

function getMotionExpressionsPath() {
    return getExtensionPath() + "host/expressions/motion/v1.0/";
}

/**
 * اختبار صحة مسار الإضافة
 * @returns {Object} نتيجة الاختبار
 */
function testExtensionPath() {
    var result = {
        extensionPath: getExtensionPath(),
        controllersPath: getControllersPath(),
        registryExists: false,
        typewriterExists: false,
        boxExists: false,
        motionExists: false
    };
    
    try {
        var registryFile = new File(result.controllersPath + "_registry.json");
        result.registryExists = registryFile.exists;
        
        var typewriterFile = new File(result.controllersPath + "typewriter.json");
        result.typewriterExists = typewriterFile.exists;
        
        var boxFile = new File(result.controllersPath + "box.json");
        result.boxExists = boxFile.exists;
        
        var motionFile = new File(result.controllersPath + "motion.json");
        result.motionExists = motionFile.exists;
    } catch(e) {
        result.error = e.toString();
    }
    
    $.writeln("[TEXTORO] testExtensionPath result: " + JSON.stringify(result));
    return result;
}

// ═══════════════════════════════════════════════════════════════════
// REGISTRY LOADING
// ═══════════════════════════════════════════════════════════════════

/**
 * تحميل سجل المتحكمات الرئيسي
 * @param {boolean} forceReload - إعادة التحميل من الملف
 * @returns {Object} السجل
 */
function loadControllerRegistry(forceReload) {
    if (_controllerRegistry && !forceReload) return _controllerRegistry;
    
    try {
        var registryPath = getControllersPath() + "_registry.json";
        $.writeln("[TEXTORO] Loading registry from: " + registryPath);
        
        var registryFile = new File(registryPath);
        
        if (!registryFile.exists) {
            $.writeln("[TEXTORO] Controller registry not found: " + registryPath);
            return _getDefaultRegistry();
        }
        
        registryFile.open("r");
        registryFile.encoding = "UTF-8";
        var content = registryFile.read();
        registryFile.close();
        
        _controllerRegistry = JSON.parse(content);
        $.writeln("[TEXTORO] Registry loaded: " + 
            _controllerRegistry.statistics.totalControllers + " controllers");
        
        return _controllerRegistry;
        
    } catch(e) {
        $.writeln("[TEXTORO] Error loading registry: " + e.toString());
        return _getDefaultRegistry();
    }
}

/**
 * تحميل Controllers لفئة معينة
 * @param {string} category - الفئة (typewriter, box, motion)
 * @returns {Object} بيانات الفئة
 */
function loadCategoryControllers(category) {
    if (_controllerCache[category]) return _controllerCache[category];
    
    try {
        var filePath = getControllersPath() + category + ".json";
        var file = new File(filePath);
        
        if (!file.exists) {
            $.writeln("[TEXTORO] Category file not found: " + category);
            return null;
        }
        
        file.open("r");
        file.encoding = "UTF-8";
        var content = file.read();
        file.close();
        
        var data = JSON.parse(content);
        _controllerCache[category] = data;
        
        $.writeln("[TEXTORO] Loaded " + category + " (" + 
            data.controllersCount + " controllers)");
        return data;
        
    } catch(e) {
        $.writeln("[TEXTORO] Error loading " + category + ": " + e.toString());
        return null;
    }
}

// ═══════════════════════════════════════════════════════════════════
// CONTROLLER CREATION
// ═══════════════════════════════════════════════════════════════════

/**
 * إنشاء Controllers من السجل
 * @param {Layer} layer - الطبقة
 * @param {string} category - الفئة
 * @param {Object} values - القيم المخصصة (اختياري)
 * @param {Array} only - قائمة أسماء محددة فقط (اختياري)
 * @returns {boolean} نجاح العملية
 */
function createControllersFromRegistry(layer, category, values, only) {
    var categoryData = loadCategoryControllers(category);
    if (!categoryData || !categoryData.controllers) {
        $.writeln("[TEXTORO] No controllers for: " + category);
        return false;
    }
    
    var fx = layer.property("ADBE Effect Parade");
    var controllers = categoryData.controllers;
    values = values || {};
    
    var count = 0;
    for (var name in controllers) {
        if (!controllers.hasOwnProperty(name)) continue;
        
        // تخطي إذا كانت قائمة محددة ولم يكن الاسم فيها
        if (only && only.length > 0) {
            var found = false;
            for (var i = 0; i < only.length; i++) {
                if (only[i] === name) { found = true; break; }
            }
            if (!found) continue;
        }
        
        var ctrl = controllers[name];
        var value = (values[name] !== undefined) ? values[name] : ctrl.default;

        // F-14: عزل أخطاء العنصر الواحد - بريس تالف لا يجهض العملية كاملة
        try {
            // التحقق من صحة القيمة
            value = _validateValue(ctrl, value);

            switch (ctrl.type) {
                case "slider":
                    addSlider(fx, name, value);
                    break;
                case "checkbox":
                    addCheckbox(fx, name, value);
                    break;
                case "color":
                    addColor(fx, name, value);
                    break;
                case "point":
                    addPoint(fx, name, value);
                    break;
                default:
                    $.writeln("[TEXTORO] WARNING unknown controller type '" + ctrl.type + "' for " + name);
            }
            count++;
        } catch (_ctrlErr) {
            $.writeln("[TEXTORO] ERROR creating controller '" + name + "': " + _ctrlErr.toString());
        }
    }

    $.writeln("[TEXTORO] Created " + count + " " + category + " controllers");
    return true;
}

/**
 * إزالة Controllers لفئة معينة
 * @param {Layer} layer - الطبقة
 * @param {string} category - الفئة
 */
function removeControllersFromRegistry(layer, category) {
    var categoryData = loadCategoryControllers(category);
    if (!categoryData || !categoryData.controllers) return;
    
    var fx = layer.property("ADBE Effect Parade");
    var names = [];
    
    for (var name in categoryData.controllers) {
        if (categoryData.controllers.hasOwnProperty(name)) {
            names.push(name);
        }
    }
    
    // إزالة من الأخير للأول
    for (var i = fx.numProperties; i >= 1; i--) {
        var prop = fx.property(i);
        for (var j = 0; j < names.length; j++) {
            if (prop.name === names[j]) {
                prop.remove();
                break;
            }
        }
    }
    
    $.writeln("[TEXTORO] Removed " + category + " controllers");
}

// ═══════════════════════════════════════════════════════════════════
// CONTROLLER VALUES
// ═══════════════════════════════════════════════════════════════════

/**
 * الحصول على قيمة Controller
 */
function getControllerValue(layer, name) {
    try {
        var fx = layer.property("ADBE Effect Parade");
        var ctrl = findEffectControl(fx, name);
        if (!ctrl) return null;
        return ctrl.property(1).value;
    } catch(e) {
        return null;
    }
}

/**
 * تعيين قيمة Controller
 */
function setControllerValue(layer, name, value) {
    try {
        var fx = layer.property("ADBE Effect Parade");
        var ctrl = findEffectControl(fx, name);
        if (!ctrl) return false;
        ctrl.property(1).setValue(value);
        return true;
    } catch(e) {
        return false;
    }
}

/**
 * الحصول على القيم الافتراضية لفئة
 */
function getControllerDefaults(category) {
    var categoryData = loadCategoryControllers(category);
    if (!categoryData || !categoryData.controllers) return {};
    
    var defaults = {};
    for (var name in categoryData.controllers) {
        if (categoryData.controllers.hasOwnProperty(name)) {
            defaults[name] = categoryData.controllers[name].default;
        }
    }
    return defaults;
}

/**
 * التحقق من صحة القيمة
 */
function validateControllerValue(category, name, value) {
    var categoryData = loadCategoryControllers(category);
    if (!categoryData || !categoryData.controllers[name]) return value;
    return _validateValue(categoryData.controllers[name], value);
}

function _validateValue(ctrl, value) {
    if (ctrl.type === "slider") {
        if (ctrl.min !== undefined && value < ctrl.min) value = ctrl.min;
        if (ctrl.max !== undefined && value > ctrl.max) value = ctrl.max;
    }
    if (ctrl.type === "checkbox") {
        value = !!value;
    }
    return value;
}

// ═══════════════════════════════════════════════════════════════════
// EXPRESSION BUILDING
// ═══════════════════════════════════════════════════════════════════

/**
 * تحميل Shared Expression من ملف
 * @param {string} name - اسم الملف (بدون .js)
 * @returns {string} محتوى الـ Expression
 */
function loadSharedExpression(name) {
    if (_sharedExprCache[name]) return _sharedExprCache[name];
    
    try {
        var path = getSharedExpressionsPath() + name + ".js";
        var file = new File(path);
        
        if (!file.exists) {
            $.writeln("[TEXTORO] Shared expr not found: " + name);
            return "";
        }
        
        file.open("r");
        file.encoding = "UTF-8";
        var content = file.read();
        file.close();
        
        // إزالة التعليقات للتصغير
        content = _minifyExpression(content);
        
        _sharedExprCache[name] = content;
        return content;
        
    } catch(e) {
        $.writeln("[TEXTORO] Error loading shared: " + e.toString());
        return "";
    }
}

/**
 * تحميل Motion Expression من ملف
 * @param {string} name - اسم الملف (position, scale, rotation, opacity)
 * @returns {string} محتوى الـ Expression
 */
function loadMotionExpression(name) {
    try {
        var path = getMotionExpressionsPath() + name + ".js";
        var file = new File(path);
        
        if (!file.exists) {
            $.writeln("[TEXTORO] Motion expr not found: " + name);
            return "";
        }
        
        file.open("r");
        file.encoding = "UTF-8";
        var content = file.read();
        file.close();
        
        return _minifyExpression(content);
        
    } catch(e) {
        $.writeln("[TEXTORO] Error loading motion expr: " + e.toString());
        return "";
    }
}

/**
 * بناء Expression كامل مع Shared Code
 * @param {string} exprType - نوع الـ Expression (position, scale, etc.)
 * @param {Array} sharedList - قائمة Shared المطلوبة ["easing", "timing"]
 * @returns {string} Expression الكامل
 */
function buildMotionExpression(exprType, sharedList) {
    var parts = [];
    
    // إضافة Shared Expressions أولاً
    for (var i = 0; i < sharedList.length; i++) {
        var shared = loadSharedExpression(sharedList[i]);
        if (shared) parts.push(shared);
    }
    
    // إضافة Expression الرئيسي
    var mainExpr = loadMotionExpression(exprType);
    if (mainExpr) parts.push(mainExpr);
    
    return parts.join("\n");
}

/**
 * تصغير Expression (إزالة التعليقات والمسافات الزائدة)
 */
function _minifyExpression(code) {
    // إزالة تعليقات /** */ و //
    code = code.replace(/\/\*[\s\S]*?\*\//g, "");
    code = code.replace(/\/\/.*$/gm, "");
    // إزالة الأسطر الفارغة
    code = code.replace(/^\s*[\r\n]/gm, "");
    // تقليل المسافات
    code = code.replace(/\s+/g, " ");
    return txTrim(code);
}

// ═══════════════════════════════════════════════════════════════════
// INLINE EXPRESSION BUILDERS (للتوافق مع النظام الحالي)
// ═══════════════════════════════════════════════════════════════════

/**
 * الحصول على EASE_VAL_CODE المضغوط
 * للاستخدام في Expressions المضمنة
 */
function getEaseValCode() {
    return 'function easeVal(p,eT){' +
        'if(eT==0)return p;' +
        'if(eT==1)return 1-Math.pow(1-p,2);' +
        'if(eT==2)return Math.pow(p,2);' +
        'if(eT==3)return p<0.5?2*p*p:1-Math.pow(-2*p+2,2)/2;' +
        'if(eT==4){var n=7.5625,d=2.75;if(p<1/d)return n*p*p;' +
        'if(p<2/d)return n*(p-=1.5/d)*p+0.75;' +
        'if(p<2.5/d)return n*(p-=2.25/d)*p+0.9375;' +
        'return n*(p-=2.625/d)*p+0.984375;}' +
        'if(eT==5)return p==0?0:p==1?1:' +
        'Math.pow(2,-10*p)*Math.sin((p*10-0.75)*2.094)+1;' +
        'if(eT==6)return 1+2.7*Math.pow(p-1,3)+1.7*Math.pow(p-1,2);' +
        'return p;}';
}

/**
 * الحصول على TIMING_SYNC_CODE المضغوط
 */
function getTimingSyncCode() {
    return 'var inS=effect("Motion In Start")(1).value;' +
        'var inE=effect("Motion In End")(1).value;' +
        'var outS=effect("Motion Out Start")(1).value;' +
        'var outE=effect("Motion Out End")(1).value;' +
        'var syncMode=0;try{syncMode=effect("Motion Sync Mode")(1).value;}catch(e){}' +
        'if(syncMode==1&&thisLayer.marker.numKeys>0){' +
        'var m=thisLayer.marker;' +
        'for(var i=1;i<=m.numKeys;i++){' +
        'var c=m.key(i).comment,mt=m.key(i).time-inPoint;' +
        'if(c=="IN_START")inS=mt;' +
        'else if(c=="IN_END")inE=mt;' +
        'else if(c=="OUT_START")outS=mt;' +
        'else if(c=="OUT_END")outE=mt;}}' +
        'var eT=effect("Motion Easing Type")(1).value;' +
        'var t=time-inPoint;';
}

// ═══════════════════════════════════════════════════════════════════
// DEFAULT REGISTRY (FALLBACK)
// ═══════════════════════════════════════════════════════════════════

function _getDefaultRegistry() {
    return {
        version: "1.0.0",
        statistics: {
            totalControllers: 74,
            categories: {
                typewriter: 14,
                box: 26,
                motion: 34
            }
        },
        categories: {
            typewriter: { file: "typewriter.json", controllersCount: 14 },
            box: { file: "box.json", controllersCount: 26 },
            motion: { file: "motion.json", controllersCount: 34 }
        }
    };
}

// ═══════════════════════════════════════════════════════════════════
// CACHE MANAGEMENT
// ═══════════════════════════════════════════════════════════════════

/**
 * مسح الـ Cache
 */
function clearControllerCache() {
    _controllerRegistry = null;
    _controllerCache = {};
    _sharedExprCache = {};
    $.writeln("[TEXTORO] Controller cache cleared");
}

/**
 * إعادة تحميل كل شيء
 */
function reloadControllerSystem() {
    clearControllerCache();
    loadControllerRegistry(true);
    $.writeln("[TEXTORO] Controller system reloaded");
}

$.writeln("[TEXTORO] ControllerManager module loaded!");

