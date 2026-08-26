#!/usr/bin/env node
/**
 * Smoke: preset UI safety (SEC-01)
 * Ensures no untrusted preset fields are concatenated into innerHTML.
 * All preset-derived content must use DOM APIs (textContent) or validated templates.
 */
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..", "..");
const JS_ROOT = path.join(ROOT, "js");

let fails = 0;

function scanFile(filePath, rel) {
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split("\n");
    lines.forEach((line, idx) => {
        // Check for innerHTML assignments containing preset fields
        if (/innerHTML\s*[+]?=\s*/.test(line) && /preset\.(name|icon|faIcon|description)/.test(line)) {
            console.error(`  FAIL: ${rel}:${idx + 1} innerHTML with preset field -> ${line.trim().slice(0, 120)}`);
            fails++;
        }
        // Also check for innerHTML with searchQuery unsanitized (allow safeQuery)
        if (/innerHTML/.test(line) && /searchQuery/.test(line) && !/safeQuery/.test(line)) {
            console.error(`  FAIL: ${rel}:${idx + 1} innerHTML with raw searchQuery -> ${line.trim().slice(0, 120)}`);
            fails++;
        }
    });
}

function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) walk(full);
        else if (e.isFile() && e.name.endsWith(".js")) {
            const rel = path.relative(ROOT, full);
            // Skip legacy aliases which contain only function references, not preset rendering
            scanFile(full, rel);
        }
    }
}

console.log("[SMOKE][preset-ui-safety] Scanning js/ for innerHTML with preset fields...");
walk(JS_ROOT);

// Also verify MotionPanel uses safe DOM construction (FA validation + textContent)
const motionPath = path.join(ROOT, "js", "panels", "MotionPanel.js");
const motionContent = fs.readFileSync(motionPath, "utf8");
if (!motionContent.includes("FA_ICON_RE") || !motionContent.includes("textContent")) {
    console.error("  FAIL: MotionPanel.js missing expected safe DOM pattern (FA_ICON_RE + textContent)");
    fails++;
} else {
    console.log("  PASS: MotionPanel uses FA_ICON_RE validation and textContent");
}

if (fails) {
    console.error(`[SMOKE][preset-ui-safety] FAIL - ${fails} violation(s)`);
    process.exit(1);
}
console.log("[SMOKE][preset-ui-safety] PASS");
