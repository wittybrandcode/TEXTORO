'use strict';

const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const root = path.resolve(__dirname, '..', '..');
const jsRoot = path.join(root, 'js');

function walk(dir, out) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const abs = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            walk(abs, out);
            continue;
        }
        if (!entry.isFile()) continue;
        if (!entry.name.toLowerCase().endsWith('.js')) continue;
        out.push(abs);
    }
}

function rel(p) {
    return path.relative(root, p).replace(/\\/g, '/');
}

const files = [];
walk(jsRoot, files);
files.sort();

if (files.length === 0) {
    console.error('[SMOKE][syntax] No JS files found under js/.');
    process.exit(1);
}

const failed = [];
for (const file of files) {
    const run = cp.spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
    if (run.status !== 0) {
        failed.push({ file: rel(file), stderr: (run.stderr || '').trim() });
    }
}

if (failed.length > 0) {
    console.error('[SMOKE][syntax] FAILED for ' + failed.length + ' file(s):');
    for (const f of failed) {
        console.error(' - ' + f.file);
        if (f.stderr) console.error('   ' + f.stderr.split('\n')[0]);
    }
    process.exit(1);
}

console.log('[SMOKE][syntax] PASS - checked ' + files.length + ' JS file(s).');