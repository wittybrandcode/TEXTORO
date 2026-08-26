#!/usr/bin/env node
/**
 * TEXTORO Smoke - UTF-8 Encoding Checker (T-04 / F-04)
 * Scans all text source files for:
 *  - invalid UTF-8 byte sequences        -> FATAL
 *  - mojibake signatures (double-encoded)-> FATAL (since F-04 repair)
 *  - BOM at file start                    -> informational warning only
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const TEXT_EXTS = ['.js', '.jsx', '.json', '.css', '.html', '.xml', '.md'];
const SKIP_DIRS = new Set(['webfonts', 'fontawesome', 'node_modules', '.git']);

const decoder = new TextDecoder('utf-8', { fatal: true });
let files = 0;
const bad = [];
const bomFiles = [];
const mojibake = [];

/**
 * Heuristic: detect double-encoded text (UTF-8 read as CP1252 then re-saved).
 * Lead bytes span the full UTF-8 multi-byte range when misread (C2-F4):
 * covers Arabic (D8/D9), accents (C3), arrows/glyphs (E2) and emoji (F0).
 */
function mojibakeScore(text) {
    const CONT = '\\u0080-\\u00BF\\u00C0-\\u00FF\\u02C6\\u02DC\\u0192\\u0152\\u0153\\u0160\\u0161\\u017D\\u017E\\u0178\\u201A\\u2013\\u2014\\u2018-\\u201E\\u2020-\\u2022\\u2026\\u2030\\u2039\\u203A\\u20AC\\u2122';
    const re = new RegExp('[\\u00C2-\\u00F4](?:' + CONT + ')', 'g');
    return (text.match(re) || []).length;
}

function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) {
            if (!SKIP_DIRS.has(entry.name)) walk(path.join(dir, entry.name));
            continue;
        }
        if (!TEXT_EXTS.includes(path.extname(entry.name))) continue;
        const p = path.join(dir, entry.name);
        const buf = fs.readFileSync(p);
        files++;
        if (buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF) bomFiles.push(p);
        let text = null;
        try {
            text = decoder.decode(buf); // throws on invalid UTF-8
        } catch (e) {
            // find first offending offset for the report
            let off = buf.length;
            for (let i = 0; i < buf.length; i++) {
                try { decoder.decode(buf.subarray(i, Math.min(i + 4, buf.length))); }
                catch (_) { off = i; break; }
            }
            bad.push({ p, off, msg: e.message });
            continue;
        }
        const score = mojibakeScore(text);
        if (score > 0) mojibake.push({ p, score });
    }
}

walk(ROOT);

if (mojibake.length) {
    console.error(`[SMOKE][encoding] FAIL - ${mojibake.length} file(s) contain MOJIBAKE signatures (double-encoded text):`);
    mojibake
        .sort((a, b) => b.score - a.score)
        .forEach(m => console.error(`  MOJI(${String(m.score).padStart(4)})  ${path.relative(ROOT, m.p)}`));
    console.error('  Repair with: node tools/fix-mojibake.js --apply');
}
if (bomFiles.length) {
    console.warn(`[SMOKE][encoding] INFO BOM present in ${bomFiles.length} file(s) (accepted):`);
    bomFiles.forEach(f => console.warn('  BOM  ' + path.relative(ROOT, f)));
}
if (bad.length) {
    console.error(`[SMOKE][encoding] FAIL - ${bad.length} file(s) contain INVALID UTF-8:`);
    bad.forEach(b => console.error(`  BAD  ${path.relative(ROOT, b.p)} @byte ${b.off}`));
}
if (bad.length || mojibake.length) process.exit(1);
console.log(`[SMOKE][encoding] PASS - ${files} text file(s) scanned; ${mojibake.length} mojibake, ${bad.length} invalid (${bomFiles.length} BOM accepted).`);
