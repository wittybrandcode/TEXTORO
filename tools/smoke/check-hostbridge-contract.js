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

const missing = Array.from(uiCalls).filter((fn) => !hostFns.has(fn)).sort();

console.log('[SMOKE][contract] UI literal HostBridge methods: ' + uiCalls.size);
console.log('[SMOKE][contract] Host function definitions: ' + hostFns.size);
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

if (missing.length > 0) {
    console.error('[SMOKE][contract] FAIL - missing host functions for literal calls:');
    for (const fn of missing) {
        console.error('  - ' + fn);
    }
    process.exit(1);
}

console.log('[SMOKE][contract] PASS - all literal UI calls mapped to host functions.');