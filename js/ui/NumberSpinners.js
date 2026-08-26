/**
 * TEXTORO - Number Spinners Module
 * أزرار الأرقام (+/-) - Spectrum Style
 * @version 3.5.0
 */

TEXTORO.UI = TEXTORO.UI || {};

TEXTORO.UI.NumberSpinners = (function() {
    'use strict';
    
    // SVG Arrow Icons
    var SVG_LEFT = '<svg viewBox="0 0 10 10" width="10" height="10"><path d="M7 2L3 5L7 8" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    var SVG_RIGHT = '<svg viewBox="0 0 10 10" width="10" height="10"><path d="M3 2L7 5L3 8" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    
    /**
     * تهيئة جميع الـ spinners
     */
    function init() {
        // البحث عن كل الـ number wrappers
        document.querySelectorAll('.nw').forEach(function(wrapper) {
            var input = wrapper.querySelector('input[type="number"]');
            if (!input) return;
            
            // Check if already initialized - IMPORTANT to prevent duplicates
            if (wrapper.dataset.spinnerInit === 'true') return;
            
            // Count existing buttons to detect duplicates
            var existingButtons = wrapper.querySelectorAll('button.spin, .spin-down, .spin-up');
            if (existingButtons.length >= 2) {
                wrapper.dataset.spinnerInit = 'true';
                return; // Already has buttons
            }
            
            // Remove any partial/duplicate buttons first
            existingButtons.forEach(function(btn) { btn.remove(); });
            
            wrapper.dataset.spinnerInit = 'true';
            
            var step = parseFloat(input.getAttribute('step')) || 1;
            var min = parseFloat(input.getAttribute('min'));
            var max = parseFloat(input.getAttribute('max'));
            
            // Create spin buttons
            var spinDown = document.createElement('button');
            spinDown.type = 'button';
            spinDown.className = 'spin spin-down';
            spinDown.setAttribute('tabindex', '-1');
            spinDown.innerHTML = SVG_LEFT;
            wrapper.insertBefore(spinDown, input);
            
            var spinUp = document.createElement('button');
            spinUp.type = 'button';
            spinUp.className = 'spin spin-up';
            spinUp.setAttribute('tabindex', '-1');
            spinUp.innerHTML = SVG_RIGHT;
            wrapper.appendChild(spinUp);
            
            // Add event listeners
            spinUp.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                increment(input, step, max);
            });
            
            spinDown.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                decrement(input, step, min);
            });
            
            // Keyboard support (only add once)
            if (!input.dataset.keyboardInit) {
                input.dataset.keyboardInit = 'true';
                input.addEventListener('keydown', function(e) {
                    if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        increment(input, e.shiftKey ? step * 10 : step, max);
                    } else if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        decrement(input, e.shiftKey ? step * 10 : step, min);
                    }
                });
            }
        });
        
        TEXTORO.log('NumberSpinners initialized (Spectrum Style)');
    }
    
    /**
     * زيادة القيمة
     */
    function increment(input, step, max) {
        var val = parseFloat(input.value) || 0;
        var newVal = val + step;
        
        if (!isNaN(max) && newVal > max) {
            newVal = max;
        }
        
        input.value = formatValue(newVal, step);
        triggerChange(input);
    }
    
    /**
     * إنقاص القيمة
     */
    function decrement(input, step, min) {
        var val = parseFloat(input.value) || 0;
        var newVal = val - step;
        
        if (!isNaN(min) && newVal < min) {
            newVal = min;
        }
        
        input.value = formatValue(newVal, step);
        triggerChange(input);
    }
    
    /**
     * تنسيق القيمة
     */
    function formatValue(val, step) {
        var decimals = 0;
        if (step < 1) {
            var stepStr = step.toString();
            var dotIndex = stepStr.indexOf('.');
            if (dotIndex > -1) {
                decimals = stepStr.length - dotIndex - 1;
            }
        }
        return val.toFixed(decimals);
    }
    
    /**
     * إطلاق حدث change
     */
    function triggerChange(input) {
        input.dispatchEvent(new Event('change', { bubbles: true }));
        input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    // Public API
    return {
        init: init,
        increment: increment,
        decrement: decrement
    };
})();

// Alias للتوافق
function initNumberSpinners() {
    TEXTORO.UI.NumberSpinners.init();
}
