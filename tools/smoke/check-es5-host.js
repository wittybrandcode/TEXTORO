#!/usr/bin/env node
/**
 * TEXTORO Smoke - Host ES5/ES3 Compliance Checker (T-03)
 *
 * ExtendScript = ECMAScript 3. Any ES5+ syntax or runtime API breaks the host.
 * Two rule sets:
 *   STRICT - host/index.jsx + host/modules/(star).jsx  : syntax + runtime APIs
 *   SYNTAX - host/expressions tree (.js)               : syntax only, because
 *            expressions may run on the modern V8 engine
 * Exit code 1 on any violation.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');

const RUNTIME_API = [
    '\\.\\s*(forEach|map|filter|reduce|reduceRight|some|every|find|findIndex|includes)',
    '\\.\\s*(startsWith|endsWith|trim|trimStart|trimEnd|repeat|padStart|padEnd|at|replaceAll)\\s*\\(',
    'Object\\.\\s*(keys|assign|entries|values|fromEntries|getOwnPropertyNames|freeze|setPrototypeOf)\\s*\\(',
    'Array\\.\\s*(isArray|from|of)\\s*\\(',
    'Number\\.\\s*(isNaN|isFinite|parseInt|parseFloat|EPSILON|MAX_SAFE_INTEGER)',
    'Math\\.\\s*(sign|trunc|log2|log10|hypot|cbrt|clz32|fround)\\b',
    'Date\\.now\\s*\\('
].join('|');

const SYNTAX_RULES = [
    { re: /\blet\s+[A-Za-z_$]/, name: 'let' },
    { re: /\bconst\s+[A-Za-z_$]/, name: 'const' },
    { re: /=>/, name: 'arrow function' },
    { re: /`/, name: 'template literal' },
    { re: /\bclass\s+[A-Za-z_$]/, name: 'class' },
    { re: /\bfor\s*\(\s*(?:var\s+)?[A-Za-z_$][\w$]*\s+of\s+/, name: 'for..of' }
];

function listFiles(dir, exts, out) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, entry.name);
        if (entry.isDirectory()) listFiles(p, exts, out);
        else if (exts.includes(path.extname(entry.name))) out.push(p);
    }
    return out;
}

/** Strip comments (naive; strings containing "//" may over-strip - acceptable for smoke). */
function stripComments(src) {
    return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1');
}

function checkFile(file, rules, label, violations) {
    const src = stripComments(fs.readFileSync(file, 'utf8'));
    src.split('\n').forEach((line, i) => {
        for (const rule of rules) {
            if (rule.re.test(line)) {
                violations.push({ file, line: i + 1, name: rule.name || rule.re.source.slice(0, 40), label });
            }
        }
    });
}

function rel(p) { return path.relative(ROOT, p); }

// --- Collect targets ---
const strictFiles = [path.join(ROOT, 'host', 'index.jsx')]
    .concat(listFiles(path.join(ROOT, 'host', 'modules'), ['.jsx'], []));
const exprFiles = listFiles(path.join(ROOT, 'host', 'expressions'), ['.js'], []);

const violations = [];

for (const f of strictFiles) {
    const rules = SYNTAX_RULES.concat([{ re: new RegExp(RUNTIME_API, 'g'), name: null }]);
    // Runtime API needs per-match names -> handle separately below.
}
// Simpler explicit pass:
for (const f of strictFiles) {
    const src = stripComments(fs.readFileSync(f, 'utf8'));
    src.split('\n').forEach((line, i) => {
        for (const r of SYNTAX_RULES) {
            if (r.re.test(line)) violations.push({ file: f, line: i + 1, name: r.name, label: 'STRICT' });
        }
        let m;
        const apiRe = new RegExp(RUNTIME_API, 'g');
        while ((m = apiRe.exec(line)) !== null) {
            violations.push({ file: f, line: i + 1, name: ('runtime API: ' + m[0]).trim(), label: 'STRICT' });
            apiRe.lastIndex = m.index + 1;
        }
    });
}

for (const f of exprFiles) {
    checkFile(f, SYNTAX_RULES, 'SYNTAX', violations);
}

if (violations.length) {
    console.error(`[SMOKE][es5-host] FAIL - ${violations.length} violation(s):`);
    for (const v of violations) {
        console.error(`  ${v.label}  ${rel(v.file)}:${v.line}  ${v.name}`);
    }
    process.exit(1);
}
console.log(`[SMOKE][es5-host] PASS - checked ${strictFiles.length} host file(s), ${exprFiles.length} expression file(s).`);
