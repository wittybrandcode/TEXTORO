#!/usr/bin/env node
/**
 * TEXTORO - Mojibake Auto-Repair (F-04)
 *
 * Root cause chain: original UTF-8 bytes were decoded as CP1252, then re-saved
 * as UTF-8. Reversal per damaged RUN: chars -> raw bytes (CP1252 0x80-0x9F
 * specials mapped back) -> re-decode as UTF-8.
 * Each run is validated: rejected if reversal yields U+FFFD or stays scrambled.
 * Chars above U+00FF that are NOT CP1252 artifacts (emoji etc.) never join a
 * run and stay intact.
 *
 * Usage:
 *   node tools/fix-mojibake.js            dry-run report
 *   node tools/fix-mojibake.js --apply    write repairs
 */
'use strict';
const fs = require('fs');
const path = require('path');

const APPLY = process.argv.includes('--apply');
const ROOT = path.join(__dirname, '..');
const TEXT_EXTS = ['.js', '.jsx', '.json', '.css', '.html', '.xml', '.md'];
const SKIP_DIRS = new Set(['webfonts', 'fontawesome', 'node_modules', '.git']);
const MAX_PASSES = 6;

// CP1252 specials produced by the original mis-decode -> their raw byte values.
const CP1252_REV = {
    '\u20AC': 0x80, '\u201A': 0x82, '\u0192': 0x83, '\u201E': 0x84, '\u2026': 0x85,
    '\u2020': 0x86, '\u2021': 0x87, '\u02C6': 0x88, '\u2030': 0x89, '\u0160': 0x8A,
    '\u2039': 0x8B, '\u0152': 0x8C, '\u017D': 0x8E, '\u2018': 0x91, '\u2019': 0x92,
    '\u201C': 0x93, '\u201D': 0x94, '\u2022': 0x95, '\u2013': 0x96, '\u2014': 0x97,
    '\u02DC': 0x98, '\u2122': 0x99, '\u0161': 0x9A, '\u203A': 0x9B, '\u0153': 0x9C,
    '\u017E': 0x9E, '\u0178': 0x9F
};

// Continuation chars that can follow a mojibake lead char.
const CONT = '[\\u0080-\\u00BF\\u00C0-\\u00FF\\u02C6\\u02DC\\u0192\\u0152\\u0153\\u0160\\u0161\\u017D\\u017E\\u0178\\u201A\\u2013\\u2014\\u2018-\\u201E\\u2020-\\u2022\\u2026\\u2030\\u2039\\u203A\\u20AC\\u2122]';
// F-04b: نوسع الـ lead ليغطي كل بايتات بداية UTF-8 عند سوء القراءة (C2..F4)
// - يشمل E2 (أسهم/رموز هندسية) و F0-F4 (إيموجي) التي كانت تنجو سابقاً
const RUN_RE = new RegExp('[\\u00C2-\\u00F4](?:' + CONT + ')+', 'g');

// Signature counter used for scoring (lead+continuation pairs).
const SIG_RE = /[\u00C2-\u00F4][\u0080-\u00BF\u02C6\u02DC\u0192\u0152\u0153\u0160\u0161\u017D\u017E\u0178\u201A\u2013\u2014\u2018-\u201E\u2020-\u2022\u2026\u2030\u2039\u203A\u20AC\u2122]/g;

function countSigs(text) {
    return (text.match(SIG_RE) || []).length;
}

function repairRun(run) {
    const dbg = process.env.TXDEBUG === '1';
    const bytes = [];
    for (const ch of run) {
        if (CP1252_REV[ch] !== undefined) { bytes.push(CP1252_REV[ch]); continue; }
        const code = ch.codePointAt(0);
        if (code >= 0x80 && code <= 0xFF) { bytes.push(code); continue; }
        if (dbg) console.error(`    reject: unmappable U+${code.toString(16)} in ${JSON.stringify(run)}`);
        return null; // unmappable char inside run -> unsafe
    }
    const out = Buffer.from(bytes).toString('utf8');
    if (out.includes('\uFFFD')) {
        if (dbg) console.error(`    reject: FFFD in result of ${JSON.stringify(run)} -> ${JSON.stringify(out)}`);
        return null; // invalid UTF-8 -> not a clean reversal
    }
    // Accept ONLY strict progress: some regions are double-damaged, so output
    // may still contain signatures; the outer passes keep peeling layers.
    if (countSigs(out) >= countSigs(run) && out !== run) {
        if (dbg) console.error(`    reject: no progress ${JSON.stringify(run)} -> ${JSON.stringify(out)}`);
        return null;
    }
    return out;
}

function repairText(src, stats) {
    let cur = src;
    for (let pass = 0; pass < MAX_PASSES; pass++) {
        let changed = 0;
        cur = cur.replace(RUN_RE, (run) => {
            const fixed = repairRun(run);
            if (fixed === null || fixed === run) return run;
            changed++;
            return fixed;
        });
        stats.passes++;
        if (!changed) break;
    }
    return cur;
}

let scanned = 0;
const results = [];

function processFile(p) {
    const buf = fs.readFileSync(p);
    let text;
    try { text = buf.toString('utf8'); } catch (_) { return; }
    scanned++;
    if (text.includes('\uFFFD')) { results.push({ p, status: 'INVALID-UTF8' }); return; }

    const before = countSigs(text);
    if (!before) return;

    const stats = { passes: 0 };
    const fixed = repairText(text, stats);
    const after = countSigs(fixed);

    // sample for human review (from ORIGINAL damaged text)
    const m = text.match(new RegExp('.{0,20}' + SIG_RE.source + '.{0,24}'));
        results.push({
            p, status: after === 0 ? 'FIXED' : 'PARTIAL',
            before, after, passes: stats.passes,
            sample: m ? m[0].replace(/\n/g, '\\n') : '',
            orig: text,
            fixed
        });
}

function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) {
            if (!SKIP_DIRS.has(entry.name)) walk(path.join(dir, entry.name));
            continue;
        }
        if (!TEXT_EXTS.includes(path.extname(entry.name))) continue;
        if (path.resolve(dir, entry.name) === path.resolve(__filename)) continue;
        processFile(path.join(dir, entry.name));
    }
}

walk(ROOT);

let fixable = 0, partial = 0, written = 0;
for (const r of results) {
    const rel = path.relative(ROOT, r.p);
    if (r.status === 'FIXED' || r.status === 'PARTIAL') {
        r.after === 0 ? fixable++ : partial++;
        console.log(`[${r.status}] ${rel}  (${r.before} -> ${r.after} sigs, ${r.passes} passes)`);
        console.log(`   sample: ${JSON.stringify(r.sample)}`);
        if (APPLY && r.fixed !== r.orig) {
            fs.writeFileSync(r.p, r.fixed, 'utf8');
            written++;
            console.log('   => written');
        }
    } else {
        console.log(`[${r.status}] ${rel}`);
    }
}

console.log('---');
console.log(`scanned=${scanned} damaged=${results.filter(r => r.before).length} clean=${fixable} improved-but-residual=${partial} filesWritten=${written} mode=${APPLY ? 'APPLY' : 'DRY-RUN'}`);
if (!APPLY) console.log('dry-run only; re-run with --apply to write repairs.');
if (process.argv.includes('--debug')) {
    console.log('=== RESIDUAL CONTEXTS ===');
    for (const r of results) {
        if (r.status !== 'PARTIAL') continue;
        let idx = 0;
        SIG_RE.lastIndex = 0;
        let m2;
        while ((m2 = SIG_RE.exec(r.fixed)) !== null && idx < 10) {
            const s = Math.max(0, m2.index - 25);
            console.log(`${path.relative(ROOT, r.p)} @${m2.index}: ${JSON.stringify(r.fixed.slice(s, m2.index + 30))}`);
            idx++;
        }
    }
}
