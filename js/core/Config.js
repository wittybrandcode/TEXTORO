/**
 * TEXTORO - Configuration Module
 * إعدادات التطبيق المركزية
 * @version 1.0.0
 */

var TEXTORO = TEXTORO || {};

TEXTORO.Config = {
    /** إصدار التطبيق */
    VERSION: '1.1.0',
    
    /** تفعيل وضع التصحيح */
    DEBUG: false,
    
    /** إعدادات التوقيت */
    TIMING: {
        /** مدة عرض رسالة الحالة (ms) */
        STATUS_CLEAR_DELAY: 3000,
        
        /** فترة فحص التحديد (ms) */
        SELECTION_CHECK_INTERVAL: 300,
        
        /** تأخير Soga Live Edit (ms) */
        INSPECTOR_DEBOUNCE_DELAY: 200,
        SOGA_DEBOUNCE_DELAY: 200,
        
        /** تأخير البحث (ms) */
        SEARCH_DEBOUNCE_DELAY: 200
    },
    
    /** Technical Preset Categories */
    PRESET_CATEGORIES: ['templates', 'type', 'box', 'compound', 'motion']
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

