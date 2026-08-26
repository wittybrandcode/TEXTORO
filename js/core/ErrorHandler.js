/**
 * TEXTORO - Error Handler Module
 * معالج الأخطاء المركزي
 * @version 3.3.0
 */

TEXTORO.ErrorHandler = {
    /**
     * عرض رسالة خطأ للمستخدم
     * @param {string} message - رسالة الخطأ
     * @param {string} type - نوع الرسالة (error, warning, info, success)
     */
    show: function(message, type) {
        type = type || 'error';
        
        // استخدام StatusBar إذا كان متاحاً
        if (TEXTORO.UI && TEXTORO.UI.StatusBar && TEXTORO.UI.StatusBar.set) {
            TEXTORO.UI.StatusBar.set(message, type);
        } else if (typeof setStatus === 'function') {
            // Fallback للدالة القديمة
            setStatus(message, type);
        }
        
        // تسجيل الأخطاء في Console
        if (type === 'error') {
            TEXTORO.error(message);
        } else if (TEXTORO.Config.DEBUG) {
            TEXTORO.log(type.toUpperCase() + ': ' + message);
        }
    },
    
    /**
     * تغليف دالة بمعالج أخطاء
     * @param {Function} fn - الدالة المراد تغليفها
     * @param {string} context - سياق الخطأ للتسجيل
     * @returns {Function}
     */
    wrap: function(fn, context) {
        return function() {
            try {
                return fn.apply(this, arguments);
            } catch(e) {
                var msg = (context ? context + ': ' : '') + (e.message || e.toString());
                TEXTORO.ErrorHandler.show(msg, 'error');
                return null;
            }
        };
    },
    
    /**
     * معالجة نتيجة من ExtendScript
     * @param {Object} res - النتيجة
     * @param {string} successMsg - رسالة النجاح (اختياري)
     * @param {Function} onSuccess - دالة عند النجاح (اختياري)
     * @param {Function} onError - دالة عند الخطأ (اختياري)
     */
    handleResult: function(res, successMsg, onSuccess, onError) {
        if (res && res.success) {
            if (successMsg) {
                TEXTORO.ErrorHandler.show(successMsg, 'success');
            }
            if (onSuccess) onSuccess(res);
        } else {
            var errorMsg = (res && res.error) ? res.error : 'Unknown error';
            TEXTORO.ErrorHandler.show('Error: ' + errorMsg, 'error');
            if (onError) onError(res);
        }
    },
    
    /**
     * تسجيل خطأ بدون عرضه للمستخدم
     * @param {string} message - رسالة الخطأ
     * @param {Error} error - كائن الخطأ (اختياري)
     */
    logError: function(message, error) {
        var fullMsg = message;
        if (error) {
            fullMsg += ' | ' + (error.message || error.toString());
            if (error.stack && TEXTORO.Config.DEBUG) {
                console.error(error.stack);
            }
        }
        TEXTORO.error(fullMsg);
    }
};

// Legacy aliases moved to js/legacy/aliases.js
