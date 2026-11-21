/**
 * TEXTORO Physics Visualizer & Interactive Simulation Component
 * مكون المعاينة الفيزيائية الحية ورسم منحنى الاستجابة اللحظية
 *
 * Version: 2.5.0
 * Architecture: High-DPI HTML5 Canvas (60fps) + Analytical ODE Engine
 */

var TEXTORO = window.TEXTORO || {};
TEXTORO.UI = TEXTORO.UI || {};

TEXTORO.UI.PhysicsVisualizer = (function() {
    'use strict';

    var canvas = null;
    var ctx = null;
    var animFrameId = null;
    var testSimActive = false;
    var testSimStartTime = 0;
    var testSimBoxEl = null;

    // Default Physical Parameters
    var currentParams = {
        stiffness: 180,
        damping: 18,
        mass: 1.0,
        boost: 0
    };

    // Curated Presets Definition
    var PRESETS = {
        'ios': { name: 'iOS Fluid', stiffness: 280, damping: 26, mass: 1.0, boost: 0 },
        'bouncy': { name: 'Bouncy Dynamic', stiffness: 190, damping: 11, mass: 0.9, boost: 0 },
        'heavy': { name: 'Heavy Slam', stiffness: 340, damping: 19, mass: 2.6, boost: 50 },
        'jelly': { name: 'Jelly Elastic', stiffness: 110, damping: 7, mass: 0.8, boost: 0 },
        'magnetic': { name: 'Magnetic Snap', stiffness: 480, damping: 34, mass: 1.1, boost: 0 },
        'overdamped': { name: 'Overdamped Glide', stiffness: 160, damping: 38, mass: 1.4, boost: 0 }
    };

    /**
     * Analytical Harmonic Oscillator ODE Solver
     */
    function solveSpring(t, k, c, m, v0) {
        if (t <= 0) return 0;
        var safeM = Math.max(0.001, m || 1.0);
        var safeK = Math.max(0.1, k || 180);
        var safeC = Math.max(0, c || 18);
        var v = (v0 || 0) / 100;

        var w0 = Math.sqrt(safeK / safeM);
        var zeta = safeC / (2 * Math.sqrt(safeK * safeM));
        var alpha = zeta * w0;

        if (Math.abs(zeta - 1.0) < 0.001) {
            return 1 - Math.exp(-w0 * t) * (1 + (w0 - v) * t);
        } else if (zeta < 1.0) {
            var wd = w0 * Math.sqrt(1 - zeta * zeta);
            var b = (alpha - v) / wd;
            return 1 - Math.exp(-alpha * t) * (Math.cos(wd * t) + b * Math.sin(wd * t));
        } else {
            var wh = w0 * Math.sqrt(zeta * zeta - 1);
            var r1 = -alpha + wh;
            var r2 = -alpha - wh;
            return 1 - (1 / (2 * wh)) * ((wh + alpha - v) * Math.exp(r1 * t) + (wh - alpha + v) * Math.exp(r2 * t));
        }
    }

    /**
     * Compute Settling Time at 99.9% (epsilon = 0.001)
     */
    function solveSettlingTime(k, c, m) {
        var safeM = Math.max(0.001, m || 1.0);
        var safeK = Math.max(0.1, k || 180);
        var safeC = Math.max(0.001, c || 18);
        var alpha = (safeC / (2 * Math.sqrt(safeK * safeM))) * Math.sqrt(safeK / safeM);
        if (alpha <= 0.0001) return 5.0;
        return Math.min(10.0, 6.91 / alpha);
    }

    /**
     * Initialize Canvas with device pixel ratio scaling
     */
    function initCanvas() {
        canvas = document.getElementById('physicsCurveCanvas');
        if (!canvas) return false;

        ctx = canvas.getContext('2d');
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        return true;
    }

    function resizeCanvas() {
        if (!canvas || !ctx) return;
        var rect = canvas.getBoundingClientRect();
        var dpr = window.devicePixelRatio || 1;
        var width = rect.width || canvas.parentElement.clientWidth || 260;
        var height = 80;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
        render();
    }

    /**
     * Read parameters from UI input fields
     */
    function readParamsFromUI() {
        var kEl = document.getElementById('motionSpringStiffness');
        var cEl = document.getElementById('motionSpringDamping');
        var mEl = document.getElementById('motionSpringMass');
        var vEl = document.getElementById('motionSpringVelocityBoost');

        if (kEl) currentParams.stiffness = parseFloat(kEl.value) || 180;
        if (cEl) currentParams.damping = parseFloat(cEl.value) || 18;
        if (mEl) currentParams.mass = parseFloat(mEl.value) || 1.0;
        if (vEl) currentParams.boost = parseFloat(vEl.value) || 0;

        return currentParams;
    }

    /**
     * Update telemetry badges in UI
     */
    function updateTelemetry(tSettle, maxOvershoot, freq) {
        var settleEl = document.getElementById('physicsTelemetrySettle');
        var overEl = document.getElementById('physicsTelemetryOvershoot');
        var freqEl = document.getElementById('physicsTelemetryFreq');

        if (settleEl) settleEl.textContent = tSettle.toFixed(2) + 's';
        if (overEl) {
            var overPercent = Math.max(0, (maxOvershoot - 1) * 100);
            overEl.textContent = (overPercent > 0.5 ? '+' + overPercent.toFixed(1) + '%' : '0%');
            overEl.style.color = overPercent > 0.5 ? '#10b981' : '#94a3b8';
        }
        if (freqEl) freqEl.textContent = freq.toFixed(1) + 'Hz';
    }

    /**
     * Main 60fps Curve Render Loop
     */
    function render() {
        if (!canvas || !ctx) return;

        var dpr = window.devicePixelRatio || 1;
        var w = canvas.width / dpr;
        var h = canvas.height / dpr;

        ctx.clearRect(0, 0, w, h);

        // Background
        ctx.fillStyle = '#0f1218';
        ctx.fillRect(0, 0, w, h);

        var p = currentParams;
        var tSettle = solveSettlingTime(p.stiffness, p.damping, p.mass);
        var totalTimeWindow = Math.max(0.6, tSettle * 1.15);

        var w0 = Math.sqrt(Math.max(0.1, p.stiffness) / Math.max(0.001, p.mass));
        var zeta = p.damping / (2 * Math.sqrt(Math.max(0.1, p.stiffness) * Math.max(0.001, p.mass)));
        var freq = (w0 / (2 * Math.PI));

        // Coordinate space setup
        var padLeft = 10;
        var padRight = 10;
        var padTop = 16;
        var padBottom = 16;
        var plotW = w - padLeft - padRight;
        var plotH = h - padTop - padBottom;

        // Baseline (y=0) and Target line (y=1)
        var yBaseline = padTop + plotH * 0.88;
        var yTarget = padTop + plotH * 0.28;

        // Grid Lines
        ctx.strokeStyle = '#1e2430';
        ctx.lineWidth = 1;

        // Target Horizon Line (Green dashed)
        ctx.beginPath();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
        ctx.moveTo(padLeft, yTarget);
        ctx.lineTo(w - padRight, yTarget);
        ctx.stroke();

        // Baseline (Gray solid)
        ctx.beginPath();
        ctx.setLineDash([]);
        ctx.strokeStyle = '#272f3d';
        ctx.moveTo(padLeft, yBaseline);
        ctx.lineTo(w - padRight, yBaseline);
        ctx.stroke();

        // Settling Vertical Line
        var xSettle = padLeft + (tSettle / totalTimeWindow) * plotW;
        if (xSettle <= w - padRight) {
            ctx.beginPath();
            ctx.setLineDash([2, 3]);
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
            ctx.moveTo(xSettle, padTop);
            ctx.lineTo(xSettle, h - padBottom);
            ctx.stroke();
            ctx.setLineDash([]);

            // Label for Settle
            ctx.fillStyle = '#64748b';
            ctx.font = '9px monospace';
            ctx.fillText(tSettle.toFixed(2) + 's', Math.min(w - 35, xSettle + 3), h - 4);
        }

        // Draw Impulse Curve
        var samples = 140;
        var points = [];
        var maxPeakVal = 1.0;
        var maxPeakX = 0;
        var maxPeakY = yTarget;

        ctx.beginPath();
        for (var i = 0; i <= samples; i++) {
            var tVal = (i / samples) * totalTimeWindow;
            var val = solveSpring(tVal, p.stiffness, p.damping, p.mass, p.boost);
            var x = padLeft + (i / samples) * plotW;
            var y = yBaseline - val * (yBaseline - yTarget);

            if (val > maxPeakVal) {
                maxPeakVal = val;
                maxPeakX = x;
                maxPeakY = y;
            }

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            points.push({ x: x, y: y });
        }

        // Gradient Stroke for Curve
        var grad = ctx.createLinearGradient(padLeft, 0, w - padRight, 0);
        grad.addColorStop(0, '#10b981');
        grad.addColorStop(0.7, '#34d399');
        grad.addColorStop(1, '#06b6d4');

        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Overshoot Peak Dot & Annotation
        if (maxPeakVal > 1.02 && maxPeakX > 0) {
            ctx.beginPath();
            ctx.fillStyle = '#10b981';
            ctx.arc(maxPeakX, maxPeakY, 3, 0, Math.PI * 2);
            ctx.fill();

            // Label
            ctx.fillStyle = '#a7f3d0';
            ctx.font = '9px sans-serif';
            var pctText = '+' + ((maxPeakVal - 1) * 100).toFixed(0) + '%';
            ctx.fillText(pctText, Math.max(padLeft, maxPeakX - 10), Math.max(10, maxPeakY - 5));
        }

        // Target Label (1.0)
        ctx.fillStyle = 'rgba(16, 185, 129, 0.7)';
        ctx.font = '9px monospace';
        ctx.fillText('100%', padLeft + 2, yTarget - 3);

        // Update UI Telemetry
        updateTelemetry(tSettle, maxPeakVal, freq);
    }

    /**
     * Apply a Curated Preset
     */
    function applyPreset(presetKey) {
        var preset = PRESETS[presetKey];
        if (!preset) return;

        currentParams.stiffness = preset.stiffness;
        currentParams.damping = preset.damping;
        currentParams.mass = preset.mass;
        currentParams.boost = preset.boost;

        // Update UI input fields
        var kEl = document.getElementById('motionSpringStiffness');
        var cEl = document.getElementById('motionSpringDamping');
        var mEl = document.getElementById('motionSpringMass');
        var vEl = document.getElementById('motionSpringVelocityBoost');

        if (kEl) kEl.value = preset.stiffness;
        if (cEl) cEl.value = preset.damping;
        if (mEl) mEl.value = preset.mass;
        if (vEl) vEl.value = preset.boost;

        // Highlight active preset button
        var btns = document.querySelectorAll('.physics-preset-pill');
        btns.forEach(function(b) {
            if (b.getAttribute('data-preset') === presetKey) {
                b.classList.add('active');
            } else {
                b.classList.remove('active');
            }
        });

        render();
        triggerTestSimulation();
    }

    /**
     * Interactive Kinetic Test Simulation (Live bounce in CEP)
     */
    function triggerTestSimulation() {
        if (!testSimBoxEl) {
            testSimBoxEl = document.getElementById('physicsTestBox');
        }
        if (!testSimBoxEl) return;

        testSimActive = true;
        testSimStartTime = performance.now();

        function simLoop(now) {
            if (!testSimActive) return;
            var elapsedSec = (now - testSimStartTime) / 1000;
            var tSettle = solveSettlingTime(currentParams.stiffness, currentParams.damping, currentParams.mass);

            if (elapsedSec > tSettle + 0.2) {
                testSimActive = false;
                testSimBoxEl.style.transform = 'translateX(0px) scale(1)';
                return;
            }

            var progress = solveSpring(elapsedSec, currentParams.stiffness, currentParams.damping, currentParams.mass, currentParams.boost);
            // Translate from -40px to 0px
            var currentX = -40 * (1 - progress);
            var currentScale = 0.8 + 0.2 * progress;

            testSimBoxEl.style.transform = 'translateX(' + currentX.toFixed(1) + 'px) scale(' + currentScale.toFixed(2) + ')';
            requestAnimationFrame(simLoop);
        }

        requestAnimationFrame(simLoop);
    }

    /**
     * Bind UI event listeners
     */
    function initListeners() {
        var inputIds = [
            'motionSpringStiffness',
            'motionSpringDamping',
            'motionSpringMass',
            'motionSpringVelocityBoost'
        ];

        inputIds.forEach(function(id) {
            var el = document.getElementById(id);
            if (!el) return;

            el.addEventListener('input', function() {
                readParamsFromUI();
                render();
            });

            el.addEventListener('change', function() {
                readParamsFromUI();
                render();
                triggerTestSimulation();
            });
        });

        // Preset Pills
        var pills = document.querySelectorAll('.physics-preset-pill');
        pills.forEach(function(pill) {
            pill.addEventListener('click', function(e) {
                e.preventDefault();
                var key = this.getAttribute('data-preset');
                applyPreset(key);
            });
        });

        // Test Simulation Trigger Button
        var testBtn = document.getElementById('btnPhysicsTestSim');
        if (testBtn) {
            testBtn.addEventListener('click', function(e) {
                e.preventDefault();
                triggerTestSimulation();
            });
        }
    }

    /**
     * Public Initialization Method
     */
    function init() {
        if (!initCanvas()) return;
        readParamsFromUI();
        initListeners();
        render();
    }

    return {
        init: init,
        render: render,
        applyPreset: applyPreset,
        triggerTestSimulation: triggerTestSimulation,
        getParams: function() { return currentParams; },
        solveSpring: solveSpring,
        solveSettlingTime: solveSettlingTime
    };
})();
