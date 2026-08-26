# 🏆 TEXTORO UI Enhancement - God Level Plan

## الرؤية
تحويل واجهة TEXTORO إلى معيار احترافي يضاهي Adobe Premiere/After Effects مع الحفاظ على الهيكل الحالي المستقر.

---

## 📋 المراحل

### Phase 1: Foundation (الأساس)
### Phase 2: Smart Tooltips (نظام التلميحات الذكي)
### Phase 3: Input Enhancement (تحسين الخانات)
### Phase 4: Visual Polish (اللمسات النهائية)

---

# Phase 1: Foundation

## 1.1 CSS Variables System
```css
/* إضافة في بداية style.css */
:root {
    /* === INPUT SYSTEM === */
    --input-h: 26px;
    --input-h-sm: 22px;
    --input-min-w: 55px;
    --input-max-w: 68px;
    --input-radius: 5px;
    
    /* === SPIN BUTTONS === */
    --spin-w: 20px;
    --spin-icon: 10px;
    
    /* === INTERACTIVE === */
    --checkbox-size: 16px;
    --color-w: 30px;
    --color-h: 24px;
    
    /* === TRANSITIONS === */
    --tr-fast: 0.12s ease;
    --tr-normal: 0.2s ease;
    
    /* === SHADOWS === */
    --shadow-sm: 0 2px 4px rgba(0,0,0,0.2);
    --shadow-md: 0 4px 12px rgba(0,0,0,0.3);
    --shadow-focus: 0 0 0 2px rgba(45,140,255,0.25);
}
```

## 1.2 Base Reset Updates
```css
/* تحسين التفاعل الأساسي */
*:focus-visible {
    outline: none;
    box-shadow: var(--shadow-focus);
}

/* Smooth scrolling */
* {
    scroll-behavior: smooth;
}
```

---

# Phase 2: Smart Tooltip System

## 2.1 المبادئ
- ✅ عنصر واحد فقط في DOM
- ✅ يظهر بعد 400ms تأخير (لا يزعج)
- ✅ يختفي فوراً عند المغادرة
- ✅ موقع ذكي (لا يخرج من الشاشة)
- ✅ بسيط وأنيق (لا مبالغة)

## 2.2 HTML Element
```html
<!-- إضافة قبل </body> في index.html -->
<div id="tooltip" class="tt" role="tooltip"></div>
```

## 2.3 CSS Styles
```css
/* ═══════════════════════════════════════════
   SMART TOOLTIP SYSTEM
   ═══════════════════════════════════════════ */
.tt {
    position: fixed;
    z-index: 9999;
    max-width: 220px;
    padding: 6px 10px;
    background: #f5f5f5;
    color: #1a1a1a;
    font-size: 10px;
    font-weight: 500;
    line-height: 1.4;
    border-radius: 6px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.25);
    pointer-events: none;
    opacity: 0;
    transform: translateY(4px);
    transition: opacity 0.15s, transform 0.15s;
    white-space: normal;
    word-wrap: break-word;
}

.tt.show {
    opacity: 1;
    transform: translateY(0);
}

/* Arrow */
.tt::before {
    content: '';
    position: absolute;
    width: 8px;
    height: 8px;
    background: #f5f5f5;
    transform: rotate(45deg);
}

/* Top position (default) */
.tt.pos-top::before {
    bottom: -4px;
    left: 50%;
    margin-left: -4px;
    box-shadow: 2px 2px 3px rgba(0,0,0,0.1);
}

/* Bottom position */
.tt.pos-bottom::before {
    top: -4px;
    left: 50%;
    margin-left: -4px;
    box-shadow: -1px -1px 2px rgba(0,0,0,0.05);
}

/* Shortcut badge */
.tt-key {
    display: inline-block;
    margin-left: 8px;
    padding: 1px 5px;
    background: rgba(0,0,0,0.1);
    border-radius: 3px;
    font-size: 9px;
    font-family: 'SF Mono', Consolas, monospace;
    color: #666;
}
```

## 2.4 JavaScript Module
```javascript
/* js/ui/Tooltip.js */
const Tooltip = (function() {
    'use strict';
    
    let el = null;
    let showTimer = null;
    let currentTarget = null;
    const DELAY = 400; // ms before showing
    
    function init() {
        el = document.getElementById('tooltip');
        if (!el) {
            el = document.createElement('div');
            el.id = 'tooltip';
            el.className = 'tt';
            el.setAttribute('role', 'tooltip');
            document.body.appendChild(el);
        }
        
        // Event delegation - single listener
        document.addEventListener('mouseover', handleMouseOver);
        document.addEventListener('mouseout', handleMouseOut);
        document.addEventListener('scroll', hide, true);
    }
    
    function handleMouseOver(e) {
        const target = e.target.closest('[data-tip]');
        if (!target || target === currentTarget) return;
        
        currentTarget = target;
        clearTimeout(showTimer);
        
        showTimer = setTimeout(() => {
            show(target);
        }, DELAY);
    }
    
    function handleMouseOut(e) {
        const target = e.target.closest('[data-tip]');
        if (!target) return;
        
        clearTimeout(showTimer);
        if (currentTarget === target) {
            hide();
            currentTarget = null;
        }
    }
    
    function show(target) {
        const text = target.getAttribute('data-tip');
        const key = target.getAttribute('data-key');
        
        if (!text) return;
        
        // Build content
        el.innerHTML = text + (key ? `<span class="tt-key">${key}</span>` : '');
        
        // Position
        const rect = target.getBoundingClientRect();
        const ttRect = el.getBoundingClientRect();
        
        let top = rect.top - ttRect.height - 8;
        let left = rect.left + (rect.width / 2) - (ttRect.width / 2);
        
        // Flip if too high
        if (top < 8) {
            top = rect.bottom + 8;
            el.className = 'tt pos-bottom';
        } else {
            el.className = 'tt pos-top';
        }
        
        // Keep in viewport
        left = Math.max(8, Math.min(left, window.innerWidth - ttRect.width - 8));
        
        el.style.top = top + 'px';
        el.style.left = left + 'px';
        
        // Show
        requestAnimationFrame(() => {
            el.classList.add('show');
        });
    }
    
    function hide() {
        el.classList.remove('show');
    }
    
    return { init, show, hide };
})();

// Auto-init
document.addEventListener('DOMContentLoaded', Tooltip.init);
```

## 2.5 Usage (data attributes)
```html
<!-- Basic -->
<button data-tip="Apply typewriter effect">Apply</button>

<!-- With shortcut -->
<button data-tip="Apply" data-key="Ctrl+Enter">Apply</button>

<!-- Longer description -->
<input data-tip="Start time in seconds - when typing animation begins">
```

---

# Phase 3: Input Enhancement

## 3.1 Number Input Upgrade
```css
/* ═══════════════════════════════════════════
   ENHANCED NUMBER INPUT
   ═══════════════════════════════════════════ */
.nw {
    display: flex;
    position: relative;
    background: var(--bg-1);
    border: 1px solid var(--border);
    border-radius: var(--input-radius);
    height: var(--input-h);
    min-width: var(--input-min-w);
    max-width: var(--input-max-w);
    overflow: hidden;
    transition: border-color var(--tr-fast), box-shadow var(--tr-fast);
}

.nw:hover {
    border-color: var(--border-h);
}

.nw:focus-within {
    border-color: var(--accent);
    box-shadow: var(--shadow-focus);
}

/* Input field */
.ni {
    flex: 1;
    min-width: 0;
    padding: 0 var(--spin-w);
    background: transparent;
    border: none;
    color: var(--t1);
    font-size: 11px;
    font-weight: 500;
    text-align: center;
    font-family: inherit;
    -moz-appearance: textfield;
}

.ni::-webkit-outer-spin-button,
.ni::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

/* Spin buttons */
.nw .spin {
    position: absolute;
    top: 0;
    width: var(--spin-w);
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-2);
    color: var(--t3);
    font-size: var(--spin-icon);
    cursor: pointer;
    user-select: none;
    transition: all var(--tr-fast);
}

.nw .spin:hover {
    background: var(--bg-4);
    color: var(--t1);
}

.nw .spin:active {
    background: var(--accent);
    color: #fff;
}

.nw .spin-down {
    left: 0;
    border-right: 1px solid var(--border);
}

.nw .spin-up {
    right: 0;
    border-left: 1px solid var(--border);
}

/* Unified sizes for all tables */
.soga-table-4 td .nw,
.soga-table-props .nw,
.soga-td-input .nw,
.markers-op-row .nw {
    min-width: var(--input-min-w);
    max-width: var(--input-max-w);
}
```

## 3.2 Checkbox Enhancement
```css
/* ═══════════════════════════════════════════
   ENHANCED CHECKBOX
   ═══════════════════════════════════════════ */
.ck {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    user-select: none;
}

.ck input { display: none; }

.cb {
    width: var(--checkbox-size);
    height: var(--checkbox-size);
    background: var(--bg-1);
    border: 1.5px solid var(--border);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: transparent;
    font-size: 9px;
    transition: all var(--tr-fast);
    flex-shrink: 0;
}

.ck:hover .cb {
    border-color: var(--accent);
    background: rgba(45,140,255,0.08);
}

.ck input:checked + .cb {
    background: var(--accent);
    border-color: var(--accent);
    color: #fff;
}

.ck input:checked + .cb i {
    animation: checkPop 0.2s ease;
}

@keyframes checkPop {
    0% { transform: scale(0); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
}

.cl {
    font-size: 10px;
    color: var(--t1);
    white-space: nowrap;
}
```

## 3.3 Color Input Enhancement
```css
/* ═══════════════════════════════════════════
   ENHANCED COLOR INPUT
   ═══════════════════════════════════════════ */
.ci {
    width: var(--color-w);
    height: var(--color-h);
    padding: 3px;
    background: var(--bg-1);
    border: 1px solid var(--border);
    border-radius: 4px;
    cursor: pointer;
    transition: all var(--tr-fast);
}

.ci:hover {
    border-color: var(--accent);
    transform: scale(1.05);
    box-shadow: var(--shadow-sm);
}

.ci::-webkit-color-swatch-wrapper {
    padding: 0;
}

.ci::-webkit-color-swatch {
    border: none;
    border-radius: 2px;
}
```

## 3.4 Select Enhancement
```css
/* ═══════════════════════════════════════════
   ENHANCED SELECT
   ═══════════════════════════════════════════ */
.sel {
    height: var(--input-h);
    padding: 0 24px 0 8px;
    background: var(--bg-1);
    border: 1px solid var(--border);
    border-radius: var(--input-radius);
    color: var(--t1);
    font-size: 10px;
    font-family: inherit;
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 6px center;
    transition: all var(--tr-fast);
}

.sel:hover {
    border-color: var(--border-h);
}

.sel:focus {
    border-color: var(--accent);
    box-shadow: var(--shadow-focus);
    outline: none;
}

.sel option {
    background: var(--bg-2);
    color: var(--t1);
    padding: 4px;
}
```

---

# Phase 4: Visual Polish

## 4.1 Action Bar Enhancement
```css
/* ═══════════════════════════════════════════
   ENHANCED ACTION BAR
   ═══════════════════════════════════════════ */
.action-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(180deg, #2a2a2a 0%, #1e1e1e 100%);
    border-top: 1px solid var(--border);
    padding: 8px 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    z-index: 100;
}

/* Action buttons */
.ab {
    width: 42px;
    height: 42px;
    background: var(--bg-3);
    border: 1px solid var(--border);
    border-radius: 10px;
    color: var(--t1);
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--tr-fast);
}

.ab:hover {
    background: var(--bg-4);
    border-color: var(--border-h);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}

.ab:active {
    transform: translateY(0);
}

.ab-p {
    background: var(--accent);
    border-color: var(--accent);
    color: #fff;
}

.ab-p:hover {
    background: var(--accent-h);
    border-color: var(--accent-h);
}
```

## 4.2 Card/Section Enhancement
```css
/* ═══════════════════════════════════════════
   ENHANCED SECTIONS
   ═══════════════════════════════════════════ */
.soga-box {
    background: var(--bg-1);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 10px;
    transition: border-color var(--tr-fast);
}

.soga-box:hover {
    border-color: var(--border-h);
}

.soga-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    font-weight: 600;
    color: var(--accent);
    margin-bottom: 10px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border);
}

.soga-title i {
    font-size: 13px;
    opacity: 0.9;
}
```

## 4.3 Collapsible Enhancement
```css
/* ═══════════════════════════════════════════
   ENHANCED COLLAPSIBLE
   ═══════════════════════════════════════════ */
.collapsible-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    background: var(--bg-2);
    border: 1px solid var(--border);
    border-radius: 8px;
    cursor: pointer;
    font-size: 11px;
    font-weight: 600;
    color: var(--accent);
    transition: all var(--tr-fast);
    user-select: none;
}

.collapsible-header:hover {
    background: var(--bg-3);
}

.collapsible-header:not(.collapsed) {
    border-radius: 8px 8px 0 0;
    margin-bottom: 0;
}

.collapsible-header i:first-child {
    font-size: 12px;
}

.collapsible-chevron {
    margin-left: auto;
    font-size: 10px;
    color: var(--t3);
    transition: transform var(--tr-normal);
}

.collapsible-header:not(.collapsed) .collapsible-chevron {
    transform: rotate(180deg);
}

.collapsible-content {
    background: var(--bg-1);
    border: 1px solid var(--border);
    border-top: none;
    border-radius: 0 0 8px 8px;
    padding: 12px;
    margin-bottom: 10px;
    animation: slideDown 0.2s ease;
}

.collapsible-content.collapsed {
    display: none;
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-8px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
```

---

# 📋 Implementation Checklist

## Phase 1: Foundation
- [x] Add CSS variables to `:root`
- [x] Update base reset styles
- [x] Test on all browsers

## Phase 2: Tooltips
- [x] Add tooltip element to HTML
- [x] Add tooltip CSS
- [x] Create Tooltip.js module
- [ ] Replace all `title` attributes with `data-tip` (gradual migration)
- [x] Test positioning edge cases

## Phase 3: Inputs
- [x] Update `.nw` styles
- [x] Update `.cb` checkbox styles
- [x] Update `.ci` color input styles
- [x] Update `.sel` select styles
- [x] Verify all tables use unified sizes

## Phase 4: Polish
- [x] Update action bar
- [x] Update section cards
- [x] Update collapsibles
- [x] Final visual review

---

# 🎯 Success Metrics

| Metric | Before | After |
|--------|--------|-------|
| Input height | 22px | 26px |
| Spin button width | 14px | 20px |
| Checkbox size | 14px | 16px |
| Tooltip delay | 0ms (native) | 400ms |
| Focus indication | None | Box shadow |
| Hover feedback | Minimal | Consistent |

---

# ⚠️ Rules

1. **لا تغيير في HTML structure** - CSS فقط
2. **لا تغيير في JavaScript logic** - إضافة Tooltip فقط
3. **Backward compatible** - لا كسر للوظائف
4. **Progressive enhancement** - يعمل بدون JS
5. **Performance first** - لا animations ثقيلة

---

# 📁 Files to Modify

```
TEXTORO/
├── index.html          # Add tooltip element
├── css/
│   └── style.css       # All CSS changes
└── js/
    └── ui/
        └── Tooltip.js  # New file
```

---

*Plan Version: 1.0 | January 2026*
