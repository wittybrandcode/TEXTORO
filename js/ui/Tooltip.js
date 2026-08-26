/**
 * TEXTORO - Smart Tooltip System
 * Single DOM element, 400ms delay, smart positioning
 * @version 1.0.0
 */
const Tooltip = (function() {
    'use strict';
    
    let el = null;
    let showTimer = null;
    let currentTarget = null;
    const DELAY = 400; // ms before showing
    
    /**
     * Initialize tooltip system
     */
    function init() {
        // Create or get tooltip element
        el = document.getElementById('tooltip');
        if (!el) {
            el = document.createElement('div');
            el.id = 'tooltip';
            el.className = 'tt';
            el.setAttribute('role', 'tooltip');
            document.body.appendChild(el);
        }
        
        // Event delegation - single listener for performance
        document.addEventListener('mouseover', handleMouseOver);
        document.addEventListener('mouseout', handleMouseOut);
        document.addEventListener('scroll', hide, true);
        document.addEventListener('click', hide);
        
        console.log('[Tooltip] Initialized');
    }
    
    /**
     * Handle mouse over - start delay timer
     */
    function handleMouseOver(e) {
        const target = e.target.closest('[data-tip]');
        if (!target || target === currentTarget) return;
        
        currentTarget = target;
        clearTimeout(showTimer);
        
        showTimer = setTimeout(() => {
            show(target);
        }, DELAY);
    }
    
    /**
     * Handle mouse out - cancel timer and hide
     */
    function handleMouseOut(e) {
        const target = e.target.closest('[data-tip]');
        if (!target) return;
        
        clearTimeout(showTimer);
        if (currentTarget === target) {
            hide();
            currentTarget = null;
        }
    }
    
    /**
     * Show tooltip for target element
     */
    function show(target) {
        const text = target.getAttribute('data-tip');
        const key = target.getAttribute('data-key');
        
        if (!text) return;
        
        // Build content
        el.innerHTML = text + (key ? `<span class="tt-key">${key}</span>` : '');
        
        // Make visible to measure
        el.style.visibility = 'hidden';
        el.style.display = 'block';
        el.classList.remove('show', 'pos-top', 'pos-bottom');
        
        // Get dimensions
        const rect = target.getBoundingClientRect();
        const ttRect = el.getBoundingClientRect();
        
        // Calculate position
        let top = rect.top - ttRect.height - 8;
        let left = rect.left + (rect.width / 2) - (ttRect.width / 2);
        
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
        requestAnimationFrame(() => {
            el.classList.add('show');
        });
    }
    
    /**
     * Hide tooltip
     */
    function hide() {
        if (el) {
            el.classList.remove('show');
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
    
    return { init, show, hide, showFor };
})();

// Auto-init when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', Tooltip.init);
} else {
    Tooltip.init();
}
