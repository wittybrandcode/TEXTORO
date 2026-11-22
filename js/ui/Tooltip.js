/**
 * TEXTORO - Smart Tooltip System
 * Single DOM element, delay, smart positioning, ES5 & XSS safe
 * @version 1.1.0
 */
var Tooltip = (function() {
    'use strict';
    
    var el = null;
    var showTimer = null;
    var currentTarget = null;
    var DELAY = 350; // ms before showing
    
    /**
     * Initialize tooltip system
     */
    function init() {
        el = document.getElementById('tooltip');
        if (!el) {
            el = document.createElement('div');
            el.id = 'tooltip';
            el.className = 'tt';
            el.setAttribute('role', 'tooltip');
            document.body.appendChild(el);
        }
        
        // Event delegation - listeners with aggressive cleanup
        document.addEventListener('mouseover', handleMouseOver);
        document.addEventListener('mouseout', handleMouseOut);
        document.addEventListener('scroll', hide, true);
        document.addEventListener('click', hide);
        document.addEventListener('mousedown', hide);
        document.addEventListener('mouseleave', hide);
        window.addEventListener('blur', hide);
        
        if (typeof TEXTORO !== 'undefined' && TEXTORO.log) {
            TEXTORO.log('[Tooltip] Initialized');
        }
    }
    
    /**
     * Handle mouse over - start delay timer
     */
    function handleMouseOver(e) {
        var target = e.target ? e.target.closest('[data-tip], [title]') : null;
        if (!target) {
            hide();
            return;
        }
        
        // Never show tooltips on active tab buttons
        if (target.classList.contains('tab') && target.classList.contains('active')) {
            hide();
            return;
        }

        // Never show tooltips on motion preset buttons (kinematic disc preview suffices)
        if (target.classList.contains('motion-preset-btn') || (target.closest && target.closest('.motion-preset-btn'))) {
            hide();
            return;
        }
        
        if (target === currentTarget) return;
        
        // Migrate native title to data-tip so the OS tooltip doesn't clash
        if (target.hasAttribute('title')) {
            var nativeTitle = target.getAttribute('title');
            if (nativeTitle) {
                target.setAttribute('data-tip', nativeTitle);
            }
            target.removeAttribute('title');
        }
        
        currentTarget = target;
        clearTimeout(showTimer);
        
        showTimer = setTimeout(function() {
            show(target);
        }, DELAY);
    }
    
    /**
     * Handle mouse out - cancel timer and hide immediately
     */
    function handleMouseOut(e) {
        var target = e.target ? e.target.closest('[data-tip]') : null;
        if (!target) {
            hide();
            return;
        }
        
        // If the mouse moved into a child element inside the SAME target, do not hide
        if (e.relatedTarget && target.contains(e.relatedTarget)) {
            return;
        }
        
        hide();
    }
    
    /**
     * Show tooltip for target element
     */
    function show(target) {
        // Guard against stale triggers or disconnected elements
        if (!target || target !== currentTarget || !target.isConnected) return;
        
        // Guard against active tab
        if (target.classList.contains('tab') && target.classList.contains('active')) return;
        
        var text = target.getAttribute('data-tip');
        var key = target.getAttribute('data-key');
        
        if (!text) return;
        
        // Build content securely without innerHTML
        while (el.firstChild) {
            el.removeChild(el.firstChild);
        }
        el.appendChild(document.createTextNode(text));
        
        if (key) {
            var keySpan = document.createElement('span');
            keySpan.className = 'tt-key';
            keySpan.textContent = key;
            el.appendChild(keySpan);
        }
        
        // Make visible to measure
        el.style.visibility = 'hidden';
        el.style.display = 'block';
        el.classList.remove('show', 'pos-top', 'pos-bottom');
        
        // Get dimensions
        var rect = target.getBoundingClientRect();
        var ttRect = el.getBoundingClientRect();
        
        // Calculate position
        var top = rect.top - ttRect.height - 8;
        var left = rect.left + (rect.width / 2) - (ttRect.width / 2);
        
        // Flip if too high
        if (top < 8) {
            top = rect.bottom + 8;
            el.classList.add('pos-bottom');
        } else {
            el.classList.add('pos-top');
        }
        
        // Keep in viewport horizontally
        left = Math.max(8, Math.min(left, window.innerWidth - ttRect.width - 8));
        
        // Apply position
        el.style.top = top + 'px';
        el.style.left = left + 'px';
        el.style.visibility = 'visible';
        
        // Show with animation
        if (typeof requestAnimationFrame === 'function') {
            requestAnimationFrame(function() {
                el.classList.add('show');
            });
        } else {
            el.classList.add('show');
        }
    }
    
    /**
     * Hide tooltip and cancel any pending timers
     */
    function hide() {
        clearTimeout(showTimer);
        showTimer = null;
        currentTarget = null;
        if (el) {
            el.classList.remove('show');
            el.style.display = 'none';
        }
    }
    
    /**
     * Manually show tooltip for element
     */
    function showFor(element, text, key) {
        if (!element) return;
        element.setAttribute('data-tip', text);
        if (key) element.setAttribute('data-key', key);
        show(element);
    }
    
    return {
        init: init,
        show: show,
        hide: hide,
        showFor: showFor
    };
})();

// Attach to TEXTORO namespace if available
if (typeof TEXTORO !== 'undefined') {
    TEXTORO.UI = TEXTORO.UI || {};
    TEXTORO.UI.Tooltip = Tooltip;
}

// Auto-init when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', Tooltip.init);
} else {
    Tooltip.init();
}
