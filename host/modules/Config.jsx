/**
 * TEXTORO - Configuration Module
 * الإعدادات والثوابت
 * v1.1.0
 */

$.writeln("[TEXTORO] Loading Config module...");

// JSON polyfill for older ExtendScript engines (AE 2020 and similar).
// Some hosts do not expose native JSON, which breaks all host/ui contracts.
if (typeof JSON === "undefined") {
    JSON = {};
}

if (typeof JSON.stringify !== "function") {
    (function() {
        function _repeat(str, count) {
            var out = "";
            for (var i = 0; i < count; i++) out += str;
            return out;
        }

        function _quote(str) {
            var s = String(str);
            s = s.replace(/\\/g, "\\\\");
            s = s.replace(/"/g, "\\\"");
            s = s.replace(/\r/g, "\\r");
            s = s.replace(/\n/g, "\\n");
            s = s.replace(/\t/g, "\\t");
            s = s.replace(/\f/g, "\\f");
            s = s.replace(/\u0008/g, "\\b");
            return "\"" + s + "\"";
        }

        function _stringifyValue(value, gap, indent) {
            if (value === null) return "null";

            var t = typeof value;
            if (t === "number") return isFinite(value) ? String(value) : "null";
            if (t === "boolean") return value ? "true" : "false";
            if (t === "string") return _quote(value);
            if (t === "undefined" || t === "function") return undefined;

            if (value instanceof Array) {
                var arrParts = [];
                for (var i = 0; i < value.length; i++) {
                    var arrItem = _stringifyValue(value[i], gap, indent + gap);
                    arrParts.push(arrItem === undefined ? "null" : arrItem);
                }
                if (!gap) return "[" + arrParts.join(",") + "]";
                return "[\n" + (indent + gap) + arrParts.join(",\n" + (indent + gap)) + "\n" + indent + "]";
            }

            var objParts = [];
            for (var k in value) {
                if (value.hasOwnProperty(k)) {
                    var v = _stringifyValue(value[k], gap, indent + gap);
                    if (v !== undefined) {
                        objParts.push(_quote(k) + (gap ? ": " : ":") + v);
                    }
                }
            }

            if (!gap) return "{" + objParts.join(",") + "}";
            if (objParts.length === 0) return "{}";
            return "{\n" + (indent + gap) + objParts.join(",\n" + (indent + gap)) + "\n" + indent + "}";
        }

        JSON.stringify = function(value, replacer, space) {
            var gap = "";
            if (typeof space === "number") gap = _repeat(" ", Math.min(10, space));
            else if (typeof space === "string") gap = space.substring(0, 10);
            return _stringifyValue(value, gap, "");
        };
    })();
}

if (typeof JSON.parse !== "function") {
    // F-14b v2: مُفسّر JSON نقي (recursive descent) بلا eval إطلاقاً.
    // الدرس المستفاد: بيئات ExtendScript بلا JSON أصلي كانت تعتمد الـ polyfill
    // القديم - استبداله برفض كسر تحميل كل البريسات. هذا المفسّر كامل الوظائف:
    // objects/arrays/strings مع كل الهروبات (\u0645 العربية مثلاً)/numbers/bools/null.
    JSON.parse = function(text) {
        var s = String(text);
        var pos = 0;

        function fail(msg) {
            throw new Error("JSON parse error at " + pos + ": " + msg);
        }

        function skipWs() {
            while (pos < s.length) {
                var c = s.charAt(pos);
                if (c === " " || c === "\t" || c === "\n" || c === "\r") pos++;
                else break;
            }
        }

        function expectWord(word) {
            if (s.substr(pos, word.length) !== word) fail("expected " + word);
            pos += word.length;
        }

        function parseValue() {
            skipWs();
            if (pos >= s.length) fail("unexpected end of input");
            var ch = s.charAt(pos);
            if (ch === "{") return parseObject();
            if (ch === "[") return parseArray();
            if (ch === "\"") return parseString();
            if (ch === "t") { expectWord("true"); return true; }
            if (ch === "f") { expectWord("false"); return false; }
            if (ch === "n") { expectWord("null"); return null; }
            return parseNumber();
        }

        function parseObject() {
            pos++; // {
            var obj = {};
            skipWs();
            if (s.charAt(pos) === "}") { pos++; return obj; }
            for (;;) {
                skipWs();
                if (s.charAt(pos) !== "\"") fail("expected string key");
                var key = parseString();
                skipWs();
                if (s.charAt(pos) !== ":") fail("expected ':'");
                pos++;
                obj[key] = parseValue();
                skipWs();
                var c = s.charAt(pos);
                if (c === ",") { pos++; continue; }
                if (c === "}") { pos++; return obj; }
                fail("expected ',' or '}'");
            }
        }

        function parseArray() {
            pos++; // [
            var arr = [];
            skipWs();
            if (s.charAt(pos) === "]") { pos++; return arr; }
            for (;;) {
                arr.push(parseValue());
                skipWs();
                var c = s.charAt(pos);
                if (c === ",") { pos++; continue; }
                if (c === "]") { pos++; return arr; }
                fail("expected ',' or ']'");
            }
        }

        function parseString() {
            pos++; // opening quote
            var out = "";
            while (pos < s.length) {
                var ch = s.charAt(pos);
                if (ch === "\"") { pos++; return out; }
                if (ch === "\\") {
                    pos++;
                    var esc = s.charAt(pos);
                    if (esc === "n") { out += "\n"; pos++; }
                    else if (esc === "t") { out += "\t"; pos++; }
                    else if (esc === "r") { out += "\r"; pos++; }
                    else if (esc === "b") { out += "\b"; pos++; }
                    else if (esc === "f") { out += "\f"; pos++; }
                    else if (esc === "/") { out += "/"; pos++; }
                    else if (esc === "\"") { out += "\""; pos++; }
                    else if (esc === "\\") { out += "\\"; pos++; }
                    else if (esc === "u") {
                        var hex = s.substr(pos + 1, 4);
                        if (!/^[0-9a-fA-F]{4}$/.test(hex)) fail("invalid \\u escape");
                        out += String.fromCharCode(parseInt(hex, 16));
                        pos += 5;
                    } else {
                        fail("invalid escape '\\" + esc + "'");
                    }
                } else {
                    out += ch;
                    pos++;
                }
            }
            fail("unterminated string");
        }

        function parseNumber() {
            var start = pos;
            if (s.charAt(pos) === "-") pos++;
            while (pos < s.length && s.charAt(pos) >= "0" && s.charAt(pos) <= "9") pos++;
            if (s.charAt(pos) === ".") {
                pos++;
                while (pos < s.length && s.charAt(pos) >= "0" && s.charAt(pos) <= "9") pos++;
            }
            if (s.charAt(pos) === "e" || s.charAt(pos) === "E") {
                pos++;
                if (s.charAt(pos) === "+" || s.charAt(pos) === "-") pos++;
                while (pos < s.length && s.charAt(pos) >= "0" && s.charAt(pos) <= "9") pos++;
            }
            var numStr = s.slice(start, pos);
            if (numStr === "" || numStr === "-") fail("invalid number");
            var n = Number(numStr);
            if (isNaN(n)) fail("invalid number");
            return n;
        }

        var result = parseValue();
        skipWs();
        if (pos !== s.length) fail("trailing characters after JSON value");
        return result;
    };
}

// ═══════════════════════════════════════════════════════════════════
// VERSION COMPATIBILITY - توافق الإصدارات
// ═══════════════════════════════════════════════════════════════════

var AE_MIN_VERSION = 17.0;  // CC 2020 - matches manifest Host 17.0
var AE_MAX_VERSION = 99.9;

/**
 * فحص توافق إصدار After Effects
 * @returns {Object} - {compatible: bool, version: number, message: string}
 */
function checkAECompatibility() {
    try {
        var versionStr = app.version;
        var version = parseFloat(versionStr);
        
        if (isNaN(version)) {
            return {
                compatible: true,
                version: 0,
                versionStr: versionStr,
                message: "Could not parse AE version"
            };
        }
        
        if (version < AE_MIN_VERSION) {
            return {
                compatible: false,
                version: version,
                versionStr: versionStr,
                message: "TEXTORO requires After Effects CC 2016 (v13.0) or later. Current version: " + versionStr
            };
        }
        
        return {
            compatible: true,
            version: version,
            versionStr: versionStr,
            message: "AE version " + versionStr + " is compatible"
        };
    } catch(e) {
        $.writeln("[TEXTORO] checkAECompatibility error: " + e.toString());
        return {
            compatible: true,
            version: 0,
            message: "Could not determine AE version: " + e.toString()
        };
    }
}

// ═══════════════════════════════════════════════════════════════════
// CONFIGURATION - الإعدادات والثوابت
// ═══════════════════════════════════════════════════════════════════

var CONFIG = {
    SCRIPT_NAME: "TEXTORO",
    VERSION: "1.0.0",
    
    LIMITS: {
        MIN_DURATION: 0.1,
        MAX_DURATION: 30
    },
    
    DEFAULTS: {
        TW_DURATION: 2,
        BLINK_SPEED: 2,
        BLINK_MODE: 1,
        CURSOR_SPACING: 0,
        HIDE_DELAY: 0.5,
        RANDOM_SPEED: 0
    },
    
    TEXT: {
        // "أطلق النص أطلق الثور" in Unicode escape
        RTL: "\u0623\u0637\u0644\u0642 \u0627\u0644\u0646\u0635 \u0623\u0637\u0644\u0642 \u0627\u0644\u062B\u0648\u0631",
        LTR: "Unleash the Text"
    },
    
    // Expression versions
    EXPRESSIONS: {
        TYPEWRITER: {
            DEFAULT: "v1.3",
            AVAILABLE: ["v1.0", "v1.1", "v1.2", "v1.3"]
        },
        CURSOR: {
            DEFAULT: "v1.0",
            AVAILABLE: ["v1.0"]
        },
        BOX: {
            DEFAULT: "v1.0",
            AVAILABLE: ["v1.0"]
        }
    },
    
    // Cursor shapes
    CURSOR_SHAPES: {
        0: "|",      // Pipe
        1: "_",      // Underscore
        2: "█",      // Block
        3: "▌",      // Half Block
        4: "▎",      // Thin Block
        5: "●",      // Circle
        6: "◆"       // Diamond
    },
    
    // Easing types
    EASING: {
        LINEAR: 0,
        EASE_OUT: 1,
        EASE_IN: 2,
        EASE_IN_OUT: 3,
        BOUNCE: 4,
        ELASTIC: 5,
        SPRING: 6
    }
};

// ═══════════════════════════════════════════════════════════════════
// BOX CONFIGURATION
// ═══════════════════════════════════════════════════════════════════

var BOX_CONFIG = {
    // ثوابت الرسم
    LABEL_BOX: 9,      // Purple label for box layers
    
    // القيم الافتراضية - C-05: المصدر الوحيد للحقيقة (كانت متضاربة في 3 أماكن)
    DEFAULTS: {
        PADDING_H: 40,
        PADDING_V: 20,
        CORNER_RADIUS: 15,
        STROKE_WIDTH: 2,
        FILL_COLOR: [0.2, 0.4, 0.9],
        STROKE_COLOR: [1, 1, 1],
        OPACITY: 100
    },
    
    // الحدود
    LIMITS: {
        MIN_PADDING: 0,
        MAX_PADDING: 200,
        MIN_CORNER: 0,
        MAX_CORNER: 100,
        MIN_STROKE: 0,
        MAX_STROKE: 50
    }
};

// علامة تثبت أن الوحدة تم تحميلها
var CONFIG_MODULE_LOADED = true;
var CONFIG_MODULE_VERSION = "1.0.0";

// فحص التوافق عند التحميل
var _aeCompatCheck = checkAECompatibility();
if (!_aeCompatCheck.compatible) {
    $.writeln("[TEXTORO] WARNING: " + _aeCompatCheck.message);
} else {
    $.writeln("[TEXTORO] AE Version: " + _aeCompatCheck.versionStr);
}

$.writeln("[TEXTORO] Config module loaded!");
