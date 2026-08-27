#!/usr/bin/env node
/**
 * TEXTORO Smoke - Version Consistency Checker (Release Gate #4)
 * Verifies the single source of truth policy:
 *   CSXS/manifest.xml ExtensionBundleVersion == js/core/Config.js VERSION
 *   == host/modules/Config.jsx VERSION == index.html cache-busters & badges
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const errors = [];
const versions = {};

function read(relPath) {
    return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

// 1. manifest.xml (source of truth)
const manifest = read(path.join('CSXS', 'manifest.xml'));
const bundle = manifest.match(/ExtensionBundleVersion="([^"]+)"/);
const extVer = manifest.match(/<Extension Id="[^"]+" Version="([^"]+)"/);
if (!bundle) errors.push('manifest.xml: ExtensionBundleVersion not found');
else versions['manifest.bundle'] = bundle[1];
if (!extVer) errors.push('manifest.xml: Extension Version not found');
else versions['manifest.extension'] = extVer[1];

// 2. js/core/Config.js
const cfgJs = read(path.join('js', 'core', 'Config.js'));
const vJs = cfgJs.match(/VERSION:\s*'([^']+)'/);
if (!vJs) errors.push('Config.js: VERSION not found');
else versions['Config.js'] = vJs[1];

// 3. host/modules/Config.jsx
const cfgJsx = read(path.join('host', 'modules', 'Config.jsx'));
const vJsx = cfgJsx.match(/VERSION:\s*"([^"]+)"/);
if (!vJsx) errors.push('Config.jsx: VERSION not found');
else versions['Config.jsx'] = vJsx[1];

// 4. index.html cache busters (only OUR js/ scripts - skip vendor assets) + visible labels
const html = read('index.html');
const busters = [...html.matchAll(/src="js\/[^"]*\?v=([\d.]+)"/g)].map(m => m[1]);
const uniqBusters = [...new Set(busters)];
if (busters.length === 0) errors.push('index.html: no cache-busters found (expected ?v= on js/ scripts)');
else if (uniqBusters.length > 1) errors.push(`index.html: mixed cache-busters [${uniqBusters.join(', ')}]`);
if (uniqBusters.length === 1) versions['cache-buster'] = uniqBusters[0];
const badge = html.match(/id="verBadge"[^>]*>v([^<]+)</);
if (badge) versions['verBadge'] = badge[1];

// 4b. CONFIG_MODULE_VERSION must equal CONFIG.VERSION (internal drift)
const cfgModuleVer = cfgJsx.match(/CONFIG_MODULE_VERSION\s*=\s*"([^"]+)"/);
if (cfgModuleVer) {
    // Track but don't compare to truth directly - check separately
    if (cfgModuleVer[1] !== versions['Config.jsx']) {
        errors.push(`Config.jsx: CONFIG_MODULE_VERSION="${cfgModuleVer[1]}" != CONFIG.VERSION="${versions['Config.jsx']}" (internal drift)`);
    }
}

// 4c. AE_MIN_VERSION vs manifest Host Version
const aeMin = cfgJsx.match(/AE_MIN_VERSION\s*=\s*([\d.]+)/);
const hostVer = manifest.match(/<Host Name="AEFT" Version="\[([\d.]+),/);
if (aeMin && hostVer) {
    if (aeMin[1] !== hostVer[1]) {
        errors.push(`AE version drift: Config.jsx AE_MIN_VERSION=${aeMin[1]} vs manifest Host ${hostVer[1]} (should match)`);
    }
}

// --- Compare against source of truth ---
const truth = versions['manifest.bundle'];
if (truth) {
    for (const [k, v] of Object.entries(versions)) {
        if (v !== truth) errors.push(`${k}="${v}" != manifest "${truth}"`);
    }
}

if (errors.length) {
    console.error('[SMOKE][versions] FAIL:');
    errors.forEach(e => console.error('  - ' + e));
    console.error('  observed:', JSON.stringify(versions));
    process.exit(1);
}
console.log(`[SMOKE][versions] PASS - all consistent at ${truth} (${Object.keys(versions).length} sources).`);
