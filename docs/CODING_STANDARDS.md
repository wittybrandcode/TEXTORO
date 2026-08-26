# 📝 TEXTORO Coding Standards

> **Version**: 1.0.0 | **Last Updated**: December 24, 2024

---

## 1. Naming Conventions

### 1.1 Functions

| Type | Convention | Example |
|------|------------|---------|
| Public API | camelCase | `applyTypewriter()`, `createBox()` |
| Private/Internal | _prefixCamelCase | `_applyMotion()`, `_removeTypewriter()` |
| Builders | buildXxxExpr | `buildSourceTextExpr()`, `buildBoxPathExpr()` |
| Getters | getXxx | `getActiveComp()`, `getSelectedTextLayer()` |
| Setters | setXxx | `setLayerText()`, `setOriginalText()` |
| Validators | validateXxx | `validateNumber()`, `validateBoolean()` |
| Checkers | hasXxx / isXxx | `hasTypewriter()`, `hasMotion()` |

### 1.2 Variables

| Type | Convention | Example |
|------|------------|---------|
| Local variables | camelCase | `textLayer`, `compInfo` |
| Constants | UPPER_SNAKE_CASE | `MOTION_EASING_TYPES`, `BOX_CONFIG` |
| Module flags | MODULE_NAME_LOADED | `UTILITIES_MODULE_LOADED` |
| Private/Cache | _prefixCamelCase | `_exprCache`, `_presetCache` |

### 1.3 Files

| Type | Convention | Example |
|------|------------|---------|
| Modules | PascalCase.jsx | `TypewriterManager.jsx`, `BoxManager.jsx` |
| Expressions | lowercase.js | `sourceText.js`, `position.js` |
| Config | lowercase.json | `defaults.json`, `_config.json` |
| Documentation | UPPER_CASE.md | `README.md`, `CHANGELOG.md` |

---

## 2. Module Structure

### 2.1 Standard Module Template

```javascript
/**
 * TEXTORO - Module Name
 * وصف الوحدة بالعربية
 * vX.X.X
 * 
 * Dependencies: Config.jsx, Utilities.jsx, ...
 */

// Module load flag for verification
var MODULENAME_MODULE_LOADED = true;

$.writeln("[TEXTORO] Loading ModuleName module...");

// ═══════════════════════════════════════════════════════════════════
// SECTION NAME - وصف القسم
// ═══════════════════════════════════════════════════════════════════

// ... code ...

$.writeln("[TEXTORO] ModuleName module loaded!");
```

### 2.2 Section Separators

```javascript
// ═══════════════════════════════════════════════════════════════════
// SECTION TITLE - العنوان بالعربية
// ═══════════════════════════════════════════════════════════════════
```

---

## 3. Function Documentation (JSDoc)

### 3.1 Public Functions

```javascript
/**
 * وصف الدالة بالعربية
 * @param {string} optsJSON - JSON string containing options
 * @returns {string} JSON result with success/error
 */
function publicFunction(optsJSON) {
    // ...
}
```

### 3.2 Private Functions

```javascript
/**
 * وصف الدالة الداخلية
 * @param {Layer} layer - الطبقة
 * @param {Object} opts - الخيارات
 */
function _privateFunction(layer, opts) {
    // ...
}
```

---

## 4. Error Handling

### 4.1 Standard Pattern

```javascript
function myFunction(optsJSON) {
    try {
        var opts = safeJSONParse(optsJSON, null);
        if (!opts) return error("Invalid options JSON");
        
        var comp = getActiveComp();
        if (!comp) return error("افتح Composition أولاً");
        
        // ... main logic ...
        
        return success("تم!", { data: result });
        
    } catch(e) {
        return error(e.toString());
    }
}
```

### 4.2 Response Format

```javascript
// Success response
{ success: true, message: "...", data: {...} }

// Error response
{ success: false, error: "..." }
```

### 4.3 Catch Block Logging

```javascript
// Critical errors - must log
try {
    // risky operation
} catch(e) {
    $.writeln("[TEXTORO] Error: " + e.toString());
    return error(e.toString());
}

// Non-critical - log as warning
try {
    // optional operation
} catch(e) {
    $.writeln("[TEXTORO] Warning: " + e.toString());
    // continue execution
}
```

---

## 5. Type Validation

### 5.1 Numbers

```javascript
var numValue = parseFloat(value);
if (isNaN(numValue)) {
    $.writeln("[TEXTORO] Invalid number, using default");
    numValue = defaultValue;
}
```

### 5.2 Booleans

```javascript
var boolValue = false;
if (typeof value === 'boolean') {
    boolValue = value;
} else if (value === 1 || value === '1' || value === 'true') {
    boolValue = true;
}
```

### 5.3 JSON Parsing

```javascript
// Always use safeJSONParse instead of JSON.parse
var opts = safeJSONParse(optsJSON, null);
if (!opts) return error("Invalid JSON");
```

---

## 6. Path Handling

### 6.1 Always Normalize Paths

```javascript
function _normalizePath(path) {
    return path.replace(/\\/g, "/");
}
```

### 6.2 Use Dynamic Detection

```javascript
var basePath = getExtensionPath();
if (basePath) {
    // Use dynamic path
} else {
    // Fallback to platform-specific defaults
}
```

---

## 7. Logging

### 7.1 Log Levels

```javascript
// Info - module loading
$.writeln("[TEXTORO] Loading ModuleName module...");

// Debug - detailed info (only when needed)
$.writeln("[TEXTORO addSlider] Created: " + name + " = " + value);

// Warning - non-critical issues
$.writeln("[TEXTORO] Warning: Could not clear expression");

// Error - critical issues
$.writeln("[TEXTORO] Error: " + e.toString());
```

---

## 8. Deprecated APIs

### 8.1 Avoid

| Deprecated | Use Instead |
|------------|-------------|
| `substr(start, length)` | `substring(start, end)` |
| `JSON.parse()` directly | `safeJSONParse()` |
| Hardcoded paths | `getExtensionPath()` |
| Empty `catch(e) {}` | Log the error |

---

## 9. Code Style

### 9.1 Indentation
- Use 4 spaces (not tabs)

### 9.2 Line Length
- Maximum 120 characters

### 9.3 Braces
- Same line for opening brace
- New line for closing brace

```javascript
if (condition) {
    // code
} else {
    // code
}
```

### 9.4 Comments
- Arabic for user-facing messages
- English for technical comments
- JSDoc for function documentation

---

## 10. Version Numbering

### 10.1 Semantic Versioning

```
MAJOR.MINOR.PATCH

MAJOR - Breaking changes
MINOR - New features (backward compatible)
PATCH - Bug fixes
```

### 10.2 Module Versions

```javascript
var MODULENAME_MODULE_LOADED = true;
var MODULENAME_MODULE_VERSION = "1.2.0";
```

---

<div align="center">

**TEXTORO Coding Standards** | **v1.0.0**

</div>
