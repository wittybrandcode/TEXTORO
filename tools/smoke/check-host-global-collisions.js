#!/usr/bin/env node
/**
 * Smoke: host global collisions (API-01)
 * Reports duplicate function declarations across host/modules/*.jsx
 * PresetManager helpers (PRESET_CATEGORIES_ALLOWED etc.) are expected to be global.
 */
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..", "..");
const HOST = path.join(ROOT, "host", "modules");

const ALLOWLIST = new Set([
    // No duplicates should remain after API-01 fix; keep allowlist empty for strictness
]);

const funcRe = /^\s*function\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/gm;

const seen = new Map(); // name -> [files]
let fails = 0;

for (const file of fs.readdirSync(HOST)) {
    if (!file.endsWith(".jsx")) continue;
    const content = fs.readFileSync(path.join(HOST, file), "utf8");
    let m;
    funcRe.lastIndex = 0;
    while ((m = funcRe.exec(content)) !== null) {
        const name = m[1];
        if (!seen.has(name)) seen.set(name, []);
        seen.get(name).push(file);
    }
}

console.log("[SMOKE][host-collisions] Scanning host modules for duplicate globals...");
for (const [name, files] of seen.entries()) {
    if (files.length > 1 && !ALLOWLIST.has(name)) {
        console.error(`  FAIL: duplicate global function '${name}' in: ${files.join(", ")}`);
        fails++;
    }
}
if (fails) {
    console.error(`[SMOKE][host-collisions] FAIL - ${fails} collision(s)`);
    process.exit(1);
}
console.log(`[SMOKE][host-collisions] PASS - ${seen.size} unique globals, no collisions`);
