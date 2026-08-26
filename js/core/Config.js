/**
 * TEXTORO - Configuration Module
 * إعدادات التطبيق المركزية
 * @version 1.0.0
 */

var TEXTORO = TEXTORO || {};

TEXTORO.Config = {
    /** إصدار التطبيق */
    VERSION: '1.0.0',
    
    /** تفعيل وضع التصحيح */
    DEBUG: false,
    
    /** إعدادات التوقيت */
    TIMING: {
        /** مدة عرض رسالة الحالة (ms) */
        STATUS_CLEAR_DELAY: 3000,
        
        /** فترة فحص التحديد (ms) */
        SELECTION_CHECK_INTERVAL: 300,
        
        /** تأخير Soga Live Edit (ms) */
        SOGA_DEBOUNCE_DELAY: 200,
        
        /** تأخير البحث (ms) */
        SEARCH_DEBOUNCE_DELAY: 200
    },
    
    /** أنواع الـ Markers المعروفة */
    MARKER_TYPES: ['IN_START', 'IN_END', 'OUT_START', 'OUT_END', 'BLINK_START', 'BLINK_END'],
    
    /** فئات البريسات */
    PRESET_CATEGORIES: ['toro', 'type', 'box', 'mix', 'motion-full'],
    
    /** فئات البريسات للعرض في Presets Hub (motion-full بدلاً من motion) */
    PRESET_HUB_CATEGORIES: ['toro', 'type', 'box', 'mix', 'motion-full'],
    
    /** فئة بريسات Motion البسيطة (للاستخدام في تبويب Motion فقط) */
    MOTION_SIMPLE_CATEGORY: 'motion'
};

/**
 * طباعة رسالة تصحيح (فقط عند تفعيل DEBUG)
 * @param {string} msg - الرسالة
 */
TEXTORO.log = function(msg) {
    if (TEXTORO.Config.DEBUG) {
        console.log('[TEXTORO] ' + msg);
    }
};

/**
 * طباعة رسالة خطأ
 * @param {string} msg - الرسالة
 */
TEXTORO.error = function(msg) {
    console.error('[TEXTORO] ' + msg);
};

// Alias للتوافق - see js/legacy/aliases.js for all legacy aliases
var DEBUG = TEXTORO.Config.DEBUG;
var TIMING = TEXTORO.Config.TIMING;

