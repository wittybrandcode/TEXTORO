/**
 * TEXTORO - Number Spinners Module
 * أزرار وتدرجات الأرقام (Studio Precision Steppers)
 * @version 3.6.0
 */

TEXTORO.UI = TEXTORO.UI || {};

TEXTORO.UI.NumberSpinners = (function() {
    'use strict';
    
    /**
     * تهيئة جميع الـ spinners
     */
    function init() {
        var selector = '.precision-input-box, .nw';
        document.querySelectorAll(selector).forEach(function(wrapper) {
            var input = wrapper.querySelector('input[type="number"]');
            if (!input) return;
            
            // Check if already bound
            if (wrapper.dataset.spinnerInit === 'true') return;
            
            // Clean up any legacy horizontal buttons (.spin-down, .spin-up outside stepper-actions)
            wrapper.querySelectorAll('button.spin:not(.step-arrow)').forEach(function(btn) {
                btn.remove();
            });
            
            var actions = wrapper.querySelector('.stepper-actions');
            if (!actions) {
                actions = document.createElement('div');
                actions.className = 'stepper-actions';
                
                var stepUp = document.createElement('button');
                stepUp.type = 'button';
                stepUp.className = 'step-arrow step-up';
                stepUp.setAttribute('tabindex', '-1');
                stepUp.title = 'Increase';
                stepUp.innerHTML = '▲';
                
                var stepDown = document.createElement('button');
                stepDown.type = 'button';
                stepDown.className = 'step-arrow step-down';
                stepDown.setAttribute('tabindex', '-1');
                stepDown.title = 'Decrease';
                stepDown.innerHTML = '▼';
                
                actions.appendChild(stepUp);
                actions.appendChild(stepDown);
                wrapper.appendChild(actions);
            }
            
            wrapper.dataset.spinnerInit = 'true';
            
            var step = parseFloat(input.getAttribute('step')) || 1;
            var min = parseFloat(input.getAttribute('min'));
            var max = parseFloat(input.getAttribute('max'));
            
            var btnUp = actions.querySelector('.step-up');
            var btnDown = actions.querySelector('.step-down');
            
            if (btnUp) {
                setupHold(btnUp, function(isShift) {
                    var mult = isShift ? 10 : 1;
                    increment(input, step * mult, max);
                });
            }
            
            if (btnDown) {
                setupHold(btnDown, function(isShift) {
                    var mult = isShift ? 10 : 1;
                    decrement(input, step * mult, min);
                });
            }
            
            
            // Label Scrubbing (Click & Drag horizontally on label to adjust value like After Effects)
            var label = wrapper.querySelector('.p-label');
            if (label && !label.dataset.scrubInit) {
                label.dataset.scrubInit = 'true';
                label.style.cursor = 'ew-resize';
                
                label.addEventListener('mousedown', function(e) {
                    if (e.button !== 0) return;
                    e.preventDefault();
                    
                    var startX = e.clientX;
                    var startVal = parseFloat(input.value) || 0;
                    var inputStep = parseFloat(input.getAttribute('step')) || 1;
                    var inputMin = parseFloat(input.getAttribute('min'));
                    var inputMax = parseFloat(input.getAttribute('max'));
                    
                    function onMouseMove(moveEvent) {
                        moveEvent.preventDefault();
                        var diff = moveEvent.clientX - startX;
                        var isShift = moveEvent.shiftKey;
                        var mult = isShift ? 10 : 1;
                        var stepsDelta = Math.round(diff / 4) * inputStep * mult;
                        var newVal = startVal + stepsDelta;
                        
                        if (!isNaN(inputMin) && newVal < inputMin) newVal = inputMin;
                        if (!isNaN(inputMax) && newVal > inputMax) newVal = inputMax;
                        
                        input.value = formatValue(newVal, inputStep);
                        triggerChange(input);
                    }
                    
                    function onMouseUp() {
                        document.removeEventListener('mousemove', onMouseMove);
                        document.removeEventListener('mouseup', onMouseUp);
                        document.body.style.cursor = '';
                    }
                    
                    document.body.style.cursor = 'ew-resize';
                    document.addEventListener('mousemove', onMouseMove);
                    document.addEventListener('mouseup', onMouseUp);
                });
            }

            // Keyboard & Mouse wheel support
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
                
                input.addEventListener('wheel', function(e) {
                    if (document.activeElement === input) {
                        e.preventDefault();
                        if (e.deltaY < 0) {
                            increment(input, e.shiftKey ? step * 10 : step, max);
                        } else {
                            decrement(input, e.shiftKey ? step * 10 : step, min);
                        }
                    }
                }, { passive: false });
            }
        });
        
        TEXTORO.log('NumberSpinners initialized (Studio Precision Steppers)');
    }
    
    /**
     * إعداد الضغط المستمر (Hold to ramp up/down)
     */
    function setupHold(btn, action) {
        var timer = null;
        var interval = null;
        
        function start(e) {
            if (e.button !== 0) return; // Only left click
            e.preventDefault();
            var isShift = e.shiftKey;
            action(isShift);
            
            timer = setTimeout(function() {
                interval = setInterval(function() {
                    action(isShift);
                }, 60);
            }, 300);
        }
        
        function stop() {
            if (timer) { clearTimeout(timer); timer = null; }
            if (interval) { clearInterval(interval); interval = null; }
        }
        
        btn.addEventListener('mousedown', start);
        btn.addEventListener('mouseup', stop);
        btn.addEventListener('mouseleave', stop);
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
     * إطلاق حدث change و input
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
