/**
 * TEXTORO - Modals Module
 * النوافذ المنبثقة
 * @version 3.3.0
 */

TEXTORO.UI = TEXTORO.UI || {};

TEXTORO.UI.Modals = (function() {
    'use strict';
    
    var inputModal = null;
    var confirmModal = null;
    var currentInputCallback = null;
    var currentConfirmCallback = null;
    
    /**
     * تهيئة النوافذ المنبثقة
     */
    function init() {
        inputModal = document.getElementById('inputModal');
        confirmModal = document.getElementById('confirmModal');
        
        // Input Modal events - using IDs from HTML
        if (inputModal) {
            var okBtn = document.getElementById('btnInputOK');
            var cancelBtn = document.getElementById('btnInputCancel');
            var closeBtn = document.getElementById('btnCloseInput');
            var input = document.getElementById('inputModalValue');
            
            if (okBtn) okBtn.addEventListener('click', submitInputModal);
            if (cancelBtn) cancelBtn.addEventListener('click', closeInputModal);
            if (closeBtn) closeBtn.addEventListener('click', closeInputModal);
            if (input) {
                input.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter') submitInputModal();
                    if (e.key === 'Escape') closeInputModal();
                });
            }
        }
        
        // Confirm Modal events - using IDs from HTML
        if (confirmModal) {
            var confirmOk = document.getElementById('btnConfirmOK');
            var confirmCancel = document.getElementById('btnConfirmCancel');
            var confirmClose = document.getElementById('btnCloseConfirm');
            
            if (confirmOk) confirmOk.addEventListener('click', submitConfirmModal);
            if (confirmCancel) confirmCancel.addEventListener('click', closeConfirmModal);
            if (confirmClose) confirmClose.addEventListener('click', closeConfirmModal);
        }
        
        TEXTORO.log('Modals initialized');
    }
    
    /**
     * عرض نافذة إدخال
     * @param {Object} options
     */
    function showInput(options) {
        if (!inputModal) return;
        
        var title = document.getElementById('inputModalTitle');
        var label = document.getElementById('inputModalLabel');
        var input = document.getElementById('inputModalValue');
        var iconRow = document.getElementById('inputModalIconRow');
        var iconInput = document.getElementById('inputModalIcon');
        
        if (title) title.textContent = options.title || 'Input';
        if (label) label.textContent = options.label || 'Value:';
        if (input) {
            input.value = options.value || '';
            input.placeholder = options.placeholder || ''; // C-03: كان يُتجاهل
        }
        
        // Icon picker
        if (iconRow) {
            iconRow.style.display = options.showIcon ? 'flex' : 'none';
        }
        if (iconInput) {
            iconInput.value = options.icon || '📄';
        }
        
        currentInputCallback = options.onOK || null;
        
        inputModal.style.display = 'flex';
        if (input) input.focus();
    }
    
    /**
     * إغلاق نافذة الإدخال
     */
    function closeInputModal() {
        if (inputModal) {
            inputModal.style.display = 'none';
        }
        currentInputCallback = null;
    }
    
    /**
     * تأكيد نافذة الإدخال
     */
    function submitInputModal() {
        if (!inputModal) return;
        
        var input = document.getElementById('inputModalValue');
        var iconInput = document.getElementById('inputModalIcon');
        
        var value = input ? input.value.trim() : '';
        var icon = iconInput ? iconInput.value.trim() : '';
        
        if (currentInputCallback && value) {
            currentInputCallback(value, icon);
        }
        
        closeInputModal();
    }
    
    /**
     * عرض نافذة تأكيد
     * @param {Object} options
     */
    function showConfirm(options) {
        if (!confirmModal) return;
        
        var title = document.getElementById('confirmModalTitle');
        var message = document.getElementById('confirmModalMessage');
        
        if (title) title.textContent = options.title || 'Confirm';
        if (message) message.textContent = options.message || 'Are you sure?';
        
        currentConfirmCallback = options.onConfirm || null;
        
        confirmModal.style.display = 'flex';
    }
    
    /**
     * إغلاق نافذة التأكيد
     */
    function closeConfirmModal() {
        if (confirmModal) {
            confirmModal.style.display = 'none';
        }
        currentConfirmCallback = null;
    }
    
    /**
     * تأكيد نافذة التأكيد
     */
    function submitConfirmModal() {
        if (currentConfirmCallback) {
            currentConfirmCallback();
        }
        closeConfirmModal();
    }
    
    /**
     * إغلاق جميع النوافذ
     */
    function closeAll() {
        closeInputModal();
        closeConfirmModal();
    }
    
    // Public API
    return {
        init: init,
        showInput: showInput,
        closeInput: closeInputModal,
        showConfirm: showConfirm,
        closeConfirm: closeConfirmModal,
        closeAll: closeAll
    };
})();

// Aliases للتوافق
function initInputModal() {
    // يتم في init()
}

function initConfirmModal() {
    // يتم في init()
}

function showInputModal(options) {
    TEXTORO.UI.Modals.showInput(options);
}

function closeInputModal() {
    TEXTORO.UI.Modals.closeInput();
}

function showConfirmModal(options) {
    TEXTORO.UI.Modals.showConfirm(options);
}

function closeConfirmModal() {
    TEXTORO.UI.Modals.closeConfirm();
}
