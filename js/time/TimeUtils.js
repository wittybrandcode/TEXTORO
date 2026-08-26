/**
 * TEXTORO - Time Utilities Module
 * نظام الوقت الموحد (s:f format)
 * @version 3.3.0
 */

TEXTORO.Time = (function() {
    'use strict';
    
    /** معدل الإطارات الحالي */
    var fps = 25;
    
    /**
     * تعيين FPS
     * @param {number} newFPS
     */
    function setFPS(newFPS) {
        fps = (newFPS > 0) ? Math.round(newFPS) : 25;
        TEXTORO.log('FPS set to ' + fps);
    }
    
    /**
     * الحصول على FPS
     * @returns {number}
     */
    function getFPS() {
        return fps;
    }
    
    /**
     * تحويل من صيغة s:f إلى ثواني
     * @param {string} timeStr - مثال: "2:15"
     * @returns {number} - ثواني حقيقية
     */
    function toSeconds(timeStr) {
        if (!timeStr) return 0;
        
        // إذا كان رقم مباشرة
        if (typeof timeStr === 'number') return Math.max(0, timeStr);
        
        var str = String(timeStr).trim();
        var parts = str.split(':');
        
        if (parts.length === 1) {
            // رقم فقط - نعتبره ثواني
            return Math.max(0, parseFloat(parts[0]) || 0);
        } else if (parts.length === 2) {
            // s:f
            var s = parseInt(parts[0], 10) || 0;
            var f = parseInt(parts[1], 10) || 0;
            
            // تصحيح الفريمات الزائدة
            if (f >= fps) {
                s += Math.floor(f / fps);
                f = f % fps;
            }
            
            return Math.max(0, s + (f / fps));
        } else if (parts.length === 3) {
            // m:s:f
            var m = parseInt(parts[0], 10) || 0;
            var s = parseInt(parts[1], 10) || 0;
            var f = parseInt(parts[2], 10) || 0;
            
            return Math.max(0, (m * 60) + s + (f / fps));
        }
        
        return 0;
    }
    
    /**
     * تحويل من ثواني إلى صيغة s:ff
     * @param {number} seconds
     * @returns {string} - مثال: "2:15"
     */
    function fromSeconds(seconds) {
        seconds = Math.max(0, seconds || 0);
        
        var totalFrames = Math.round(seconds * fps);
        var s = Math.floor(totalFrames / fps);
        var f = totalFrames % fps;
        
        // تنسيق: الفريمات برقمين دائماً
        return s + ':' + (f < 10 ? '0' : '') + f;
    }
    
    /**
     * زيادة فريمات
     * @param {string} timeStr
     * @param {number} count - عدد الفريمات (افتراضي: 1)
     * @returns {string}
     */
    function addFrame(timeStr, count) {
        count = count || 1;
        var seconds = toSeconds(timeStr);
        return fromSeconds(seconds + (count / fps));
    }
    
    /**
     * زيادة ثواني
     * @param {string} timeStr
     * @param {number} count - عدد الثواني (افتراضي: 1)
     * @returns {string}
     */
    function addSecond(timeStr, count) {
        count = count || 1;
        var seconds = toSeconds(timeStr);
        return fromSeconds(seconds + count);
    }
    
    /**
     * تنسيق وتصحيح قيمة الوقت
     * @param {string} timeStr
     * @returns {string}
     */
    function normalize(timeStr) {
        return fromSeconds(toSeconds(timeStr));
    }
    
    /**
     * تهيئة خانة إدخال وقت
     * @param {HTMLInputElement|string} input - العنصر أو معرفه
     */
    function initInput(input) {
        if (typeof input === 'string') {
            input = document.getElementById(input);
        }
        if (!input) return;
        
        // تنسيق عند فقدان التركيز
        input.addEventListener('blur', function() {
            this.value = normalize(this.value);
        });
        
        // دعم الأسهم
        input.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.value = addFrame(this.value, 1);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.value = addFrame(this.value, -1);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                this.value = normalize(this.value);
                this.blur();
            }
        });
        
        // تحديث tooltip
        var title = input.getAttribute('title') || '';
        if (title.indexOf('fps') === -1) {
            input.setAttribute('title', title + ' [' + fps + 'fps]');
        }
    }
    
    /**
     * الحصول على قيمة الوقت بالثواني من خانة إدخال
     * @param {string} inputId
     * @returns {number}
     */
    function getInputSeconds(inputId) {
        var input = document.getElementById(inputId);
        if (!input) return 0;
        return toSeconds(input.value);
    }
    
    /**
     * تعيين قيمة خانة إدخال بالثواني
     * @param {string} inputId
     * @param {number} seconds
     */
    function setInputSeconds(inputId, seconds) {
        var input = document.getElementById(inputId);
        if (input) {
            input.value = fromSeconds(seconds);
        }
    }
    
    // Public API
    return {
        setFPS: setFPS,
        getFPS: getFPS,
        toSeconds: toSeconds,
        fromSeconds: fromSeconds,
        addFrame: addFrame,
        addSecond: addSecond,
        normalize: normalize,
        initInput: initInput,
        getInputSeconds: getInputSeconds,
        setInputSeconds: setInputSeconds,
        // Aliases
        format: fromSeconds,
        parse: toSeconds
    };
})();

// Aliases للتوافق مع الكود القديم
var currentCompFPS = 25;

function timeToSeconds(str) { return TEXTORO.Time.toSeconds(str); }
function secondsToTime(sec) { return TEXTORO.Time.fromSeconds(sec); }
function normalizeTimeInput(val) { return TEXTORO.Time.normalize(val); }
function adjustTimeValue(val, delta) { return TEXTORO.Time.addFrame(val, delta); }
function adjustTimeValueSeconds(val, delta) { return TEXTORO.Time.addSecond(val, delta); }
function getTimeInputSeconds(id) { return TEXTORO.Time.getInputSeconds(id); }

// تحديث FPS عند تغيير الكومبوزيشن
function updateTimeInputSteps() {
    TEXTORO.HostBridge.run('getCompInfo', null, function(res) {
        if (res.success && res.data) {
            var newFPS = Math.round(res.data.fps) || 25;
            TEXTORO.Time.setFPS(newFPS);
            currentCompFPS = newFPS;
        }
    });
}
