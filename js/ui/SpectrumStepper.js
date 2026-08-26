/**
 * TEXTORO - Spectrum Number Stepper
 * Professional Number Input with Arrows
 * @version 1.0.0
 * 
 * Features:
 * - Click to increment/decrement
 * - Hold to repeat
 * - Keyboard arrows support
 * - Drag to scrub value
 * - Shift for larger steps
 * - Ctrl for smaller steps
 */

TEXTORO.UI = TEXTORO.UI || {};

TEXTORO.UI.SpectrumStepper = (function() {
    'use strict';
    
    // Configuration
    var CONFIG = {
        holdDelay: 400,      // ms before repeat starts
        holdInterval: 50,    // ms between repeats
        scrubSensitivity: 0.5,
        animationDuration: 300
    };
    
    // Active steppers registry
    var steppers = new Map();
    
    /**
     * Initialize all steppers in the document
     */
    function init() {
        // Find all number inputs and upgrade them
        document.querySelectorAll('.nw').forEach(function(wrapper) {
            upgradeToStepper(wrapper);
        });
        
        // Also initialize any existing sp-stepper elements
        document.querySelectorAll('.sp-stepper').forEach(function(stepper) {
            initStepper(stepper);
        });
        
        TEXTORO.log('SpectrumStepper initialized');
    }
    
    /**
     * Upgrade existing .nw wrapper to Spectrum Stepper
     * @param {HTMLElement} wrapper - The .nw wrapper element
     */
    function upgradeToStepper(wrapper) {
        var input = wrapper.querySelector('input[type="number"]');
        if (!input) return;
        
        // Check if already upgraded
        if (wrapper.classList.contains('sp-stepper')) return;
        
        // Get existing spin buttons or create new ones
        var spinDown = wrapper.querySelector('.spin-down, .spin.decrement');
        var spinUp = wrapper.querySelector('.spin-up, .spin.increment');
        
        // Add Spectrum classes
        wrapper.classList.add('sp-stepper');
        input.classList.add('sp-stepper-input');
        
        // Create buttons if they don't exist
        if (!spinDown) {
            spinDown = createButton('decrement');
            wrapper.insertBefore(spinDown, input);
        } else {
            spinDown.classList.add('sp-stepper-btn', 'decrement');
            updateButtonIcon(spinDown, 'decrement');
        }
        
        if (!spinUp) {
            spinUp = createButton('increment');
            wrapper.appendChild(spinUp);
        } else {
            spinUp.classList.add('sp-stepper-btn', 'increment');
            updateButtonIcon(spinUp, 'increment');
        }
        
        // Initialize the stepper
        initStepper(wrapper);
    }
    
    /**
     * Create a stepper button
     * @param {string} type - 'increment' or 'decrement'
     * @returns {HTMLButtonElement}
     */
    function createButton(type) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'sp-stepper-btn ' + type;
        btn.setAttribute('tabindex', '-1');
        btn.setAttribute('aria-label', type === 'increment' ? 'Increase value' : 'Decrease value');
        
        // Use SVG arrow icon
        btn.innerHTML = type === 'increment' 
            ? '<svg class="sp-stepper-icon" viewBox="0 0 10 10"><path d="M3 2L7 5L3 8" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>'
            : '<svg class="sp-stepper-icon" viewBox="0 0 10 10"><path d="M7 2L3 5L7 8" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        
        return btn;
    }
    
    /**
     * Update button icon to SVG
     * @param {HTMLElement} btn
     * @param {string} type
     */
    function updateButtonIcon(btn, type) {
        // Check if already has SVG
        if (btn.querySelector('svg')) return;
        
        // Replace content with SVG
        btn.innerHTML = type === 'increment'
            ? '<svg class="sp-stepper-icon" viewBox="0 0 10 10"><path d="M3 2L7 5L3 8" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>'
            : '<svg class="sp-stepper-icon" viewBox="0 0 10 10"><path d="M7 2L3 5L7 8" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    }
    
    /**
     * Initialize a stepper element
     * @param {HTMLElement} stepper
     */
    function initStepper(stepper) {
        var input = stepper.querySelector('input');
        var btnDecrement = stepper.querySelector('.sp-stepper-btn.decrement, .spin-down');
        var btnIncrement = stepper.querySelector('.sp-stepper-btn.increment, .spin-up');
        
        if (!input) return;
        
        // Get configuration from input attributes
        var config = {
            step: parseFloat(input.getAttribute('step')) || 1,
            min: parseFloat(input.getAttribute('min')),
            max: parseFloat(input.getAttribute('max')),
            precision: getPrecision(input.getAttribute('step') || '1')
        };
        
        // Store reference
        steppers.set(stepper, {
            input: input,
            config: config,
            holdTimer: null,
            repeatTimer: null
        });
        
        // Button events
        if (btnDecrement) {
            setupButton(btnDecrement, stepper, -1);
        }
        
        if (btnIncrement) {
            setupButton(btnIncrement, stepper, 1);
        }
        
        // Keyboard events on input
        input.addEventListener('keydown', function(e) {
            handleKeydown(e, stepper);
        });
        
        // Input validation
        input.addEventListener('change', function() {
            validateAndFormat(stepper);
        });
        
        // Scrubbing (drag to change value)
        setupScrubbing(stepper);
    }
    
    /**
     * Setup button events
     * @param {HTMLElement} btn
     * @param {HTMLElement} stepper
     * @param {number} direction - 1 or -1
     */
    function setupButton(btn, stepper, direction) {
        var data = steppers.get(stepper);
        
        // Click
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            changeValue(stepper, direction, e.shiftKey, e.ctrlKey);
        });
        
        // Hold to repeat
        btn.addEventListener('mousedown', function(e) {
            if (e.button !== 0) return;
            
            data.holdTimer = setTimeout(function() {
                data.repeatTimer = setInterval(function() {
                    changeValue(stepper, direction, e.shiftKey, e.ctrlKey);
                }, CONFIG.holdInterval);
            }, CONFIG.holdDelay);
        });
        
        btn.addEventListener('mouseup', stopRepeat.bind(null, stepper));
        btn.addEventListener('mouseleave', stopRepeat.bind(null, stepper));
        
        // Touch support
        btn.addEventListener('touchstart', function(e) {
            e.preventDefault();
            changeValue(stepper, direction, false, false);
            
            data.holdTimer = setTimeout(function() {
                data.repeatTimer = setInterval(function() {
                    changeValue(stepper, direction, false, false);
                }, CONFIG.holdInterval);
            }, CONFIG.holdDelay);
        });
        
        btn.addEventListener('touchend', stopRepeat.bind(null, stepper));
    }
    
    /**
     * Stop repeat timer
     * @param {HTMLElement} stepper
     */
    function stopRepeat(stepper) {
        var data = steppers.get(stepper);
        if (!data) return;
        
        if (data.holdTimer) {
            clearTimeout(data.holdTimer);
            data.holdTimer = null;
        }
        
        if (data.repeatTimer) {
            clearInterval(data.repeatTimer);
            data.repeatTimer = null;
        }
    }
    
    /**
     * Handle keyboard events
     * @param {KeyboardEvent} e
     * @param {HTMLElement} stepper
     */
    function handleKeydown(e, stepper) {
        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                changeValue(stepper, 1, e.shiftKey, e.ctrlKey);
                break;
            case 'ArrowDown':
                e.preventDefault();
                changeValue(stepper, -1, e.shiftKey, e.ctrlKey);
                break;
            case 'PageUp':
                e.preventDefault();
                changeValue(stepper, 10, false, false);
                break;
            case 'PageDown':
                e.preventDefault();
                changeValue(stepper, -10, false, false);
                break;
            case 'Home':
                if (e.ctrlKey) {
                    e.preventDefault();
                    setToMin(stepper);
                }
                break;
            case 'End':
                if (e.ctrlKey) {
                    e.preventDefault();
                    setToMax(stepper);
                }
                break;
        }
    }
    
    /**
     * Change the value
     * @param {HTMLElement} stepper
     * @param {number} direction - 1 or -1
     * @param {boolean} shift - Shift key pressed (10x step)
     * @param {boolean} ctrl - Ctrl key pressed (0.1x step)
     */
    function changeValue(stepper, direction, shift, ctrl) {
        var data = steppers.get(stepper);
        if (!data) return;
        
        var input = data.input;
        var config = data.config;
        
        var currentValue = parseFloat(input.value) || 0;
        var step = config.step;
        
        // Modify step based on modifiers
        if (shift) {
            step *= 10;
        } else if (ctrl) {
            step *= 0.1;
        }
        
        var newValue = currentValue + (step * direction);
        
        // Clamp to min/max
        if (!isNaN(config.min) && newValue < config.min) {
            newValue = config.min;
        }
        if (!isNaN(config.max) && newValue > config.max) {
            newValue = config.max;
        }
        
        // Format and set
        input.value = formatValue(newValue, config.precision);
        
        // Trigger events
        triggerChange(input);
        
        // Visual feedback
        animateValueChange(stepper);
    }
    
    /**
     * Set to minimum value
     * @param {HTMLElement} stepper
     */
    function setToMin(stepper) {
        var data = steppers.get(stepper);
        if (!data || isNaN(data.config.min)) return;
        
        data.input.value = formatValue(data.config.min, data.config.precision);
        triggerChange(data.input);
    }
    
    /**
     * Set to maximum value
     * @param {HTMLElement} stepper
     */
    function setToMax(stepper) {
        var data = steppers.get(stepper);
        if (!data || isNaN(data.config.max)) return;
        
        data.input.value = formatValue(data.config.max, data.config.precision);
        triggerChange(data.input);
    }
    
    /**
     * Validate and format input value
     * @param {HTMLElement} stepper
     */
    function validateAndFormat(stepper) {
        var data = steppers.get(stepper);
        if (!data) return;
        
        var input = data.input;
        var config = data.config;
        var value = parseFloat(input.value);
        
        if (isNaN(value)) {
            value = 0;
        }
        
        // Clamp
        if (!isNaN(config.min) && value < config.min) {
            value = config.min;
        }
        if (!isNaN(config.max) && value > config.max) {
            value = config.max;
        }
        
        input.value = formatValue(value, config.precision);
    }
    
    /**
     * Setup scrubbing (drag to change value)
     * @param {HTMLElement} stepper
     */
    function setupScrubbing(stepper) {
        var data = steppers.get(stepper);
        if (!data) return;
        
        var input = data.input;
        var startX, startValue;
        var isDragging = false;
        
        input.addEventListener('mousedown', function(e) {
            if (e.altKey) {
                e.preventDefault();
                isDragging = true;
                startX = e.clientX;
                startValue = parseFloat(input.value) || 0;
                stepper.classList.add('scrubbing');
                document.body.style.cursor = 'ew-resize';
                
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            }
        });
        
        function onMouseMove(e) {
            if (!isDragging) return;
            
            var delta = (e.clientX - startX) * CONFIG.scrubSensitivity;
            var step = data.config.step;
            
            if (e.shiftKey) step *= 10;
            if (e.ctrlKey) step *= 0.1;
            
            var newValue = startValue + (delta * step);
            
            // Clamp
            if (!isNaN(data.config.min) && newValue < data.config.min) {
                newValue = data.config.min;
            }
            if (!isNaN(data.config.max) && newValue > data.config.max) {
                newValue = data.config.max;
            }
            
            input.value = formatValue(newValue, data.config.precision);
            triggerChange(input);
        }
        
        function onMouseUp() {
            isDragging = false;
            stepper.classList.remove('scrubbing');
            document.body.style.cursor = '';
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }
    }
    
    /**
     * Get decimal precision from step value
     * @param {string} step
     * @returns {number}
     */
    function getPrecision(step) {
        var stepStr = String(step);
        var dotIndex = stepStr.indexOf('.');
        return dotIndex === -1 ? 0 : stepStr.length - dotIndex - 1;
    }
    
    /**
     * Format value with precision
     * @param {number} value
     * @param {number} precision
     * @returns {string}
     */
    function formatValue(value, precision) {
        return value.toFixed(precision);
    }
    
    /**
     * Trigger change and input events
     * @param {HTMLInputElement} input
     */
    function triggerChange(input) {
        input.dispatchEvent(new Event('change', { bubbles: true }));
        input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    /**
     * Animate value change
     * @param {HTMLElement} stepper
     */
    function animateValueChange(stepper) {
        stepper.classList.add('value-changed');
        setTimeout(function() {
            stepper.classList.remove('value-changed');
        }, CONFIG.animationDuration);
    }
    
    /**
     * Create a new stepper programmatically
     * @param {Object} options
     * @returns {HTMLElement}
     */
    function create(options) {
        options = options || {};
        
        var stepper = document.createElement('div');
        stepper.className = 'sp-stepper';
        if (options.size) stepper.classList.add('sp-stepper-' + options.size);
        if (options.quiet) stepper.classList.add('sp-stepper-quiet');
        
        var btnDecrement = createButton('decrement');
        var input = document.createElement('input');
        input.type = 'number';
        input.className = 'sp-stepper-input';
        input.value = options.value || 0;
        if (options.step) input.setAttribute('step', options.step);
        if (options.min !== undefined) input.setAttribute('min', options.min);
        if (options.max !== undefined) input.setAttribute('max', options.max);
        if (options.placeholder) input.placeholder = options.placeholder;
        if (options.id) input.id = options.id;
        
        var btnIncrement = createButton('increment');
        
        stepper.appendChild(btnDecrement);
        stepper.appendChild(input);
        stepper.appendChild(btnIncrement);
        
        initStepper(stepper);
        
        return stepper;
    }
    
    /**
     * Destroy a stepper
     * @param {HTMLElement} stepper
     */
    function destroy(stepper) {
        stopRepeat(stepper);
        steppers.delete(stepper);
        stepper.classList.remove('sp-stepper');
    }
    
    // Public API
    return {
        init: init,
        create: create,
        destroy: destroy,
        upgradeToStepper: upgradeToStepper,
        changeValue: changeValue
    };
})();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        TEXTORO.UI.SpectrumStepper.init();
    });
} else {
    // DOM already loaded
    setTimeout(function() {
        TEXTORO.UI.SpectrumStepper.init();
    }, 0);
}
