#!/usr/bin/env node
/**
 * TEXTORO Smoke - Encoding Order Checker (Release Gate #10)
 * Verifies that for ExtendScript File objects in host/,
 * file.encoding = "UTF-8" is ALWAYS set BEFORE file.open("r") / file.open("w").
 * Setting encoding after open() is ineffective in ExtendScript (reverts to CP1252/system).
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const HOST_DIR = path.join(ROOT, 'host');

let scanned = 0;
const errors = [];

function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
        const full = path.join(dir, ent.name);
        if (ent.isDirectory()) {
            walk(full);
        } else if (ent.isFile() && (ent.name.endsWith('.jsx') || ent.name.endsWith('.js'))) {
            checkFile(full);
        }
    }
}

function checkFile(filePath) {
    scanned++;
    const rel = path.relative(ROOT, filePath).replace(/\\/g, '/');
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Strip single-line comments
        const clean = line.replace(/\/\/.*$/, '');

        // Detect file.open(...)
        const openMatch = clean.match(/([A-Za-z0-9_$]+)\.open\s*\(/);
        if (openMatch) {
            const varName = openMatch[1];
            // Look ahead the next 5 lines to see if encoding is set AFTER open
            for (let j = i + 1; j < Math.min(lines.length, i + 6); j++) {
                const nextClean = lines[j].replace(/\/\/.*$/, '');
                if (nextClean.includes(`${varName}.encoding`)) {
                    errors.push(`${rel}:${j + 1} - ${varName}.encoding set AFTER open() at line ${i + 1}`);
                }
                if (nextClean.includes(`${varName}.close()`) || nextClean.includes(`${varName}.read`)) {
                    break;
                }
            }
        }
    }
}

walk(HOST_DIR);

console.log(`[SMOKE][encoding-order] Scanned ${scanned} host file(s)...`);

if (errors.length > 0) {
    console.error('[SMOKE][encoding-order] FAIL - inverted encoding orders detected:');
    errors.forEach(err => console.error('  - ' + err));
    process.exit(1);
} else {
    console.log('[SMOKE][encoding-order] PASS - all File.encoding assignments properly precede open().');
}

