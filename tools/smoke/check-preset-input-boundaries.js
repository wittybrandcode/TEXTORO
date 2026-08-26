#!/usr/bin/env node
/**
 * Smoke: preset input boundaries (SEC-02 + DATA-02)
 * Validates category allowlist, filename safety, and preset shape.
 * Mirrors host logic in PresetManager helpers.
 */
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..", "..");
const FIXTURES = path.join(ROOT, "tools", "smoke", "fixtures", "presets");

const ALLOWED = { "toro": true, "type": true, "box": true, "mix": true, "motion": true, "motion-full": true };

function isAllowedCategory(c) { return typeof c === "string" && ALLOWED[c] === true; }
function isSafeFileName(f) {
    if (typeof f !== "string" || f.length === 0 || f.length > 200) return false;
    if (f.indexOf("/") !== -1) return false;
    if (f.indexOf("\\") !== -1) return false;
    if (f.indexOf(":") !== -1) return false;
    if (f.indexOf("..") !== -1) return false;
    if (f.charAt(0) === ".") return false;
    if (!/\.json$/i.test(f)) return false;
    return true;
}
function isValidPresetShape(p) {
    if (typeof p !== "object" || p === null) return false;
    if (typeof p.name !== "string" || p.name.replace(/\s/g, "") === "") return false;
    if (typeof p.values !== "object" || p.values === null) return false;
    if (!isAllowedCategory(p.category)) return false;
    return true;
}

let fails = 0;
function assert(cond, msg) {
    if (!cond) { console.error("  FAIL: " + msg); fails++; }
    else { console.log("  PASS: " + msg); }
}

console.log("[SMOKE][preset-boundaries] Testing fixtures and helper rules...");

// 1. Fixture expectations
const valid = JSON.parse(fs.readFileSync(path.join(FIXTURES, "valid-motion.json"), "utf8"));
assert(isValidPresetShape(valid), "valid-motion.json accepted");

const xss = JSON.parse(fs.readFileSync(path.join(FIXTURES, "xss-name.json"), "utf8"));
assert(isValidPresetShape(xss), "xss-name.json shape valid (category allowed, XSS is UI concern not boundary)");
assert(isAllowedCategory(xss.category), "xss category allowed");

const trav = JSON.parse(fs.readFileSync(path.join(FIXTURES, "traversal-category.json"), "utf8"));
assert(!isAllowedCategory(trav.category), "traversal-category.json rejected (allowlist)");
assert(!isValidPresetShape(trav), "traversal fixture rejected by shape");

const inv = JSON.parse(fs.readFileSync(path.join(FIXTURES, "invalid-schema.json"), "utf8"));
assert(!isValidPresetShape(inv), "invalid-schema.json rejected");

const dupA = JSON.parse(fs.readFileSync(path.join(FIXTURES, "duplicate-name-a.json"), "utf8"));
const dupB = JSON.parse(fs.readFileSync(path.join(FIXTURES, "duplicate-name-b.json"), "utf8"));
assert(isValidPresetShape(dupA) && isValidPresetShape(dupB), "duplicate fixtures both valid shape");
assert(dupA.name === dupB.name && dupA.id !== dupB.id, "duplicates share name but have unique ids");

// 2. Filename safety
assert(!isSafeFileName("../../outside.json"), "reject traversal filename");
assert(!isSafeFileName("type/../box/evil.json"), "reject path-like filename");
assert(!isSafeFileName("C:\\temp\\evil.json"), "reject windows path");
assert(!isSafeFileName(".hidden.json"), "reject dotfile");
assert(!isSafeFileName("evil..json"), "reject .. in name");
assert(!isSafeFileName("a/b.json"), "reject slash");
assert(isSafeFileName("valid-name.json"), "accept normal filename");
assert(isSafeFileName("duplicate-test.json"), "accept duplicate base name");
assert(isSafeFileName("duplicate-test-2.json"), "accept suffixed duplicate");

// 3. Category allowlist edge cases
assert(!isAllowedCategory(""), "reject empty category");
assert(!isAllowedCategory(null), "reject null category");
assert(!isAllowedCategory("../../outside"), "reject traversal category via helper");
assert(!isAllowedCategory("TYPE"), "reject case mismatch");
assert(!isAllowedCategory("unknown"), "reject unknown category");
assert(isAllowedCategory("motion-full"), "accept motion-full");
assert(isAllowedCategory("toro"), "accept toro");

if (fails) {
    console.error(`[SMOKE][preset-boundaries] FAIL - ${fails} failure(s)`);
    process.exit(1);
}
console.log("[SMOKE][preset-boundaries] PASS");
