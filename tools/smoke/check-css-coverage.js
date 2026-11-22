const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const compiledCss = fs.readFileSync(path.join(root, 'css', 'style.css'), 'utf8');

const regex = /<section[^>]*id="([^"]+)"/g;
let m;
const panels = [];
while ((m = regex.exec(html)) !== null) {
    panels.push(m[1]);
}

let totalMissing = 0;

panels.forEach(panelId => {
    const startIdx = html.indexOf('id="' + panelId + '"');
    if (startIdx === -1) return;
    const endIdx = html.indexOf('</section>', startIdx);
    const panelHtml = html.substring(startIdx, endIdx);

    const classMatches = panelHtml.matchAll(/class=["']([^"']+)["']/g);
    const classes = new Set();
    for (const cm of classMatches) {
        cm[1].split(/\s+/).forEach(c => {
            if (c) classes.add(c);
        });
    }

    const missing = [];
    for (const c of classes) {
        if (!compiledCss.includes('.' + c) && !c.startsWith('ph') && !c.startsWith('fa')) {
            missing.push(c);
        }
    }
    if (missing.length > 0) {
        console.error(`[SMOKE][css-coverage] FAIL: ${panelId} has ${missing.length} unstyled classes: ${missing.join(', ')}`);
        totalMissing += missing.length;
    }
});

if (totalMissing > 0) {
    process.exit(1);
} else {
    console.log(`[SMOKE][css-coverage] PASS - 100% CSS coverage across all ${panels.length} panels.`);
}
