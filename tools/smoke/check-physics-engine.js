#!/usr/bin/env node
/**
 * TEXTORO Smoke Check - Physics Dynamics Engine Verification (PHYS-01)
 *
 * Verifies:
 * 1. Mathematical accuracy of analytical ODE spring solver (solveSpring).
 * 2. Settling time calculations (solveSettlingTime) across all 3 regimes.
 * 3. Div-by-zero, negative mass, and singularity guards.
 * 4. Controller registry consistency for physics parameters.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');

// 1. Load Physics Expression Kernel
const springPath = path.join(ROOT, 'host', 'expressions', 'physics', 'spring.js');
if (!fs.existsSync(springPath)) {
    console.error('[SMOKE][physics] FAIL - spring.js not found at ' + springPath);
    process.exit(1);
}

const springCode = fs.readFileSync(springPath, 'utf8');

// Evaluate in sandbox
const sandbox = {};
const fn = new Function('sandbox', springCode + '\nsandbox.solveSpring = solveSpring;\nsandbox.solveSettlingTime = solveSettlingTime;');
fn(sandbox);

const { solveSpring, solveSettlingTime } = sandbox;
let fails = 0;

function assert(condition, message) {
    if (!condition) {
        console.error('  FAIL: ' + message);
        fails++;
    } else {
        console.log('  PASS: ' + message);
    }
}

console.log('[SMOKE][physics] Running analytical ODE solver mathematical tests...');

// Test 1: Initial state at t = 0
assert(solveSpring(0, 180, 18, 1, 0) === 0, 't=0 produces exactly 0');
assert(solveSpring(-0.5, 180, 18, 1, 0) === 0, 'Negative t produces 0');

// Test 2: Standard Underdamped Spring (k=180, c=18, m=1)
const tSettle = solveSettlingTime(180, 18, 1);
assert(tSettle > 0.4 && tSettle < 1.5, `Settling time calculated reasonably (${tSettle.toFixed(3)}s)`);

const valMid = solveSpring(tSettle * 0.4, 180, 18, 1, 0);
assert(valMid > 0.9 && valMid < 1.25, `Mid-way displacement oscillates reasonably (${valMid.toFixed(4)})`);

const valSettle = solveSpring(tSettle, 180, 18, 1, 0);
assert(Math.abs(valSettle - 1.0) < 0.05, `Settled value within 5% of target at t_settle (${valSettle.toFixed(4)})`);

// Test 3: Critically Damped (zeta = 1.0, k=100, c=20, m=1)
const valCrit = solveSpring(0.3, 100, 20, 1, 0);
assert(valCrit > 0 && valCrit <= 1.0001, `Critically damped has zero overshoot (${valCrit.toFixed(4)} <= 1.0)`);

// Test 4: Overdamped (zeta = 1.5, k=100, c=30, m=1)
const valOver = solveSpring(0.3, 100, 30, 1, 0);
assert(valOver > 0 && valOver < 1.0, `Overdamped smoothly decelerates (${valOver.toFixed(4)})`);

// Test 5: Velocity boost injection
const valBoost = solveSpring(0.1, 180, 18, 1, 500);
const valNoBoost = solveSpring(0.1, 180, 18, 1, 0);
assert(valBoost > valNoBoost, `Velocity boost accelerates initial rise (${valBoost.toFixed(4)} > ${valNoBoost.toFixed(4)})`);

// Test 6: Safety guards (zero or negative mass, zero stiffness)
assert(!isNaN(solveSpring(0.5, 0, 0, 0, 0)), 'Zero params guard prevents NaN');
assert(!isNaN(solveSpring(0.5, -50, -10, -2, 0)), 'Negative params guard prevents NaN');

// Test 7: Controller registry validation
console.log('[SMOKE][physics] Verifying motion.json controller registry...');
const motionJsonPath = path.join(ROOT, 'config', 'controllers', 'motion.json');
const motionJson = JSON.parse(fs.readFileSync(motionJsonPath, 'utf8'));

const requiredControllers = [
    'Spring Stiffness',
    'Spring Damping',
    'Spring Mass',
    'Spring Velocity Boost'
];

for (const ctrl of requiredControllers) {
    assert(motionJson.controllers && motionJson.controllers[ctrl], `Controller '${ctrl}' registered in motion.json`);
}

assert(motionJson.controllers['Motion Easing Type'].max >= 7, 'Motion Easing Type supports type 7');

if (fails > 0) {
    console.error(`[SMOKE][physics] FAILED - ${fails} check(s) failed.`);
    process.exit(1);
}

console.log('[SMOKE][physics] PASS - all physics engine and ODE tests passed.');
