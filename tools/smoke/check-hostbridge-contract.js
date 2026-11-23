'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const uiRoot = path.join(root, 'js');
const hostRoot = path.join(root, 'host');

function walk(dir, ext, out) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const abs = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            walk(abs, ext, out);
            continue;
        }
        if (entry.isFile() && entry.name.toLowerCase().endsWith(ext)) {
            out.push(abs);
        }
    }
}

function rel(p) {
    return path.relative(root, p).replace(/\\/g, '/');
}

const uiFiles = [];
walk(uiRoot, '.js', uiFiles);

const hostFiles = [];
walk(hostRoot, '.jsx', hostFiles);

const literalCallRegex = /HostBridge\.run\(\s*['"]([A-Za-z0-9_]+)['"]/g;
const dynamicCallRegex = /HostBridge\.run\(\s*(?!['"])\s*([^,\)]+)/g;

const uiCalls = new Set();
const dynamicCalls = [];

for (const file of uiFiles) {
    const content = fs.readFileSync(file, 'utf8');
    let m;

    literalCallRegex.lastIndex = 0;
    while ((m = literalCallRegex.exec(content)) !== null) {
        uiCalls.add(m[1]);
    }

    dynamicCallRegex.lastIndex = 0;
    while ((m = dynamicCallRegex.exec(content)) !== null) {
        dynamicCalls.push({ file: rel(file), expr: String(m[1]).trim() });
    }
}

const hostFuncRegex = /function\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/g;
const hostFns = new Set();

for (const file of hostFiles) {
    const content = fs.readFileSync(file, 'utf8');
    let m;
    hostFuncRegex.lastIndex = 0;
    while ((m = hostFuncRegex.exec(content)) !== null) {
        hostFns.add(m[1]);
    }
}

// Read ALLOWED_HOST_FUNCS from HostBridge.js
const hbFile = fs.readFileSync(path.join(uiRoot, 'core', 'HostBridge.js'), 'utf8');
const allowlistMatch = hbFile.match(/ALLOWED_HOST_FUNCS\s*=\s*\{([^}]+)\}/);
const allowedHostFuncs = new Set();
if (allowlistMatch) {
    const matches = allowlistMatch[1].matchAll(/['"]([^'"]+)['"]/g);
    for (const m of matches) {
        allowedHostFuncs.add(m[1]);
    }
}

const missingInHost = Array.from(uiCalls).filter((fn) => !hostFns.has(fn)).sort();
const missingInAllowlist = Array.from(uiCalls).filter((fn) => !allowedHostFuncs.has(fn)).sort();
const allowlistMissingInHost = Array.from(allowedHostFuncs).filter((fn) => !hostFns.has(fn)).sort();

console.log('[SMOKE][contract] UI literal HostBridge methods: ' + uiCalls.size);
console.log('[SMOKE][contract] Host function definitions: ' + hostFns.size);
console.log('[SMOKE][contract] HostBridge allowed methods: ' + allowedHostFuncs.size);
console.log('[SMOKE][contract] Dynamic HostBridge.run calls detected: ' + dynamicCalls.length);

if (dynamicCalls.length > 0) {
    const seen = new Set();
    for (const row of dynamicCalls) {
        const key = row.file + '|' + row.expr;
        if (seen.has(key)) continue;
        seen.add(key);
        console.log('  - ' + row.file + ' :: ' + row.expr);
    }
}

let hasError = false;

// Contract: HostBridge esc() must escape \u2028 and \u2029
if (!hbFile.includes('\\u2028') || !hbFile.includes('\\u2029')) {
    hasError = true;
    console.error('[SMOKE][contract] FAIL - HostBridge.js esc() must escape \\u2028 and \\u2029');
}

if (missingInHost.length > 0) {
    hasError = true;
    console.error('[SMOKE][contract] FAIL - missing host functions for literal calls:');
    for (const fn of missingInHost) {
        console.error('  - ' + fn);
    }
}

if (missingInAllowlist.length > 0) {
    hasError = true;
    console.error('[SMOKE][contract] FAIL - UI calls blocked by HostBridge ALLOWED_HOST_FUNCS:');
    for (const fn of missingInAllowlist) {
        console.error('  - ' + fn);
    }
}

if (allowlistMissingInHost.length > 0) {
    hasError = true;
    console.error('[SMOKE][contract] FAIL - HostBridge ALLOWED_HOST_FUNCS contains undefined host functions:');
    for (const fn of allowlistMissingInHost) {
        console.error('  - ' + fn);
    }
}

if (hasError) {
    process.exit(1);
}

console.log('[SMOKE][contract] PASS - all literal UI calls permitted by allowlist and mapped to host functions.');
