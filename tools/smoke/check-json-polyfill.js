#!/usr/bin/env node
/**
 * TEXTORO Smoke - JSON Polyfill Parser Test (F-14b regression guard)
 *
 * Background: some ExtendScript engines lack native JSON. The Config.jsx
 * polyfill (pure recursive-descent parser, NO eval) is the ONLY parse path
 * there. This test extracts that exact implementation from source and runs a
 * parity+robustness suite against it - so a broken polyfill can never ship
 * again (it once broke ALL preset loading in the field).
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const src = fs.readFileSync(path.join(ROOT, 'host', 'modules', 'Config.jsx'), 'utf8');

// --- Extract the polyfill function body (string/comment-aware brace walk) ---
const startMarker = 'JSON.parse = function(text) {';
const start = src.indexOf(startMarker);
if (start === -1) {
    console.error('[SMOKE][json-polyfill] FAIL - polyfill not found in Config.jsx');
    process.exit(1);
}
let end = -1, depth = 0, inStr = false, inLine = false, inBlock = false;
for (let k = start; k < src.length; k++) {
    const c = src[k], n = src[k + 1];
    if (inLine) { if (c === '\n') inLine = false; continue; }
    if (inBlock) { if (c === '*' && n === '/') { inBlock = false; k++; } continue; }
    if (inStr) {
        if (c === '\\') { k++; continue; }
        if (c === '"') inStr = false;
        continue;
    }
    if (c === '/' && n === '/') { inLine = true; k++; continue; }
    if (c === '/' && n === '*') { inBlock = true; k++; continue; }
    if (c === '"') { inStr = true; continue; }
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) { end = k + 1; break; } }
}
if (end === -1) { console.error('[SMOKE][json-polyfill] FAIL - unbalanced extraction'); process.exit(1); }
const block = src.slice(start, end);
const impl = eval('(' + block.replace('JSON.parse = function', 'function') + ')');

// --- Suite ---
let pass = 0, failCount = 0;
function ok(name, fn) {
    try { fn(); pass++; }
    catch (e) { failCount++; console.error(`  FAIL ${name}: ${e.message}`); }
}
function eq(a, b, name) {
    ok(name, () => {
        const ja = JSON.stringify(a), jb = JSON.stringify(b);
        if (ja !== jb) throw new Error(`got ${ja} want ${jb}`);
    });
}

// Valid documents (parity with native JSON.parse)
const samples = [
    ['{"a":1,"b":true,"c":null}', {a:1,b:true,c:null}],
    ['{"x":{"y":[1,2,{"z":"w"}]}}', {x:{y:[1,2,{z:"w"}]}}],
    ['[1,2,3]', [1,2,3]],
    ['[]', []],
    ['{}', {}],
    ['"hello"', 'hello'],
    ['true', true],
    ['null', null],
    ['  {  "k" : 1 }  ', {k:1}],
    ['[-1,0.5,1e3,-2.5E-2]', [-1,0.5,1000,-0.025]],
    ['{"arabic":"\\u0645\\u0631\\u062d\\u0628\\u0627"}', {arabic:'مرحبا'}],
    ['{"esc":"line\\n\\ttab \\"q\\" \\\\ \\/"}', {esc:'line\n\ttab "q" \\ /'}],
    ['{"raw":"نص عربي مباشر","emoji":"🎬"}', {raw:'نص عربي مباشر', emoji:'🎬'}],
    ['{"nested":{"deep":{"deeper":[true,false,null,-7]}}}', {nested:{deep:{deeper:[true,false,null,-7]}}}]
];
for (const [input, expected] of samples) {
    const got = impl(input);
    eq(got, expected, `parse ${input.slice(0, 40)}`);
}

// Invalid documents must throw (not silently return garbage)
const invalids = [
    '{"a":1} trailing',
    '{"a":}',
    '{a:1}',
    '"unterminated',
    '"bad\\xescape"',
    '',
    '   ',
    '{',
    '[1,2,',
    '{"a":1,}'
];
for (const bad of invalids) {
    ok(`reject ${JSON.stringify(bad)}`, () => {
        let threw = false;
        try { impl(bad); } catch (e) { threw = true; }
        if (!threw) throw new Error('did not throw');
    });
}

// Arabic preset-shaped document end-to-end
const presetShape = '{"id":"preset_123","name":"نص متحرك","values":{"inStart":0.5,"outStart":6,"colors":[1,0.5,0]}}';
eq(impl(presetShape).name, 'نص متحرك', 'preset-shaped arabic name');
eq(impl(presetShape).values.colors, [1,0.5,0], 'preset-shaped colors');

if (failCount) {
    console.error(`[SMOKE][json-polyfill] FAIL - ${failCount} case(s), ${pass} passed`);
    process.exit(1);
}
console.log(`[SMOKE][json-polyfill] PASS - ${pass} cases (parity + strict rejection).`);
