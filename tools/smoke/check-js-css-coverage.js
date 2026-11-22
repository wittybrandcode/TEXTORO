const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const compiledCss = fs.readFileSync(path.join(root, 'css', 'style.css'), 'utf8');

const jsClasses = new Set();

function scanDir(dir) {
    fs.readdirSync(dir).forEach(f => {
        const full = path.join(dir, f);
        if (fs.statSync(full).isDirectory()) {
            scanDir(full);
        } else if (f.endsWith('.js')) {
            const content = fs.readFileSync(full, 'utf8');
            const cnMatches = content.matchAll(/className\s*=\s*['"`]([^'"`]+)['"`]/g);
            for (const m of cnMatches) {
                m[1].split(/\s+/).forEach(c => {
                    const clean = c.replace(/[^a-zA-Z0-9_-]/g, '');
                    if (clean && !clean.startsWith('ph') && !clean.startsWith('fa')) jsClasses.add(clean);
                });
            }
            const clMatches = content.matchAll(/classList\.add\(\s*['"`]([^'"`]+)['"`]/g);
            for (const m of clMatches) {
                const clean = m[1].replace(/[^a-zA-Z0-9_-]/g, '');
                if (clean && !clean.startsWith('ph') && !clean.startsWith('fa')) jsClasses.add(clean);
            }
        }
    });
}

scanDir(path.join(root, 'js'));

const missingInCss = [];
jsClasses.forEach(c => {
    if (!compiledCss.includes('.' + c)) {
        missingInCss.push(c);
    }
});

if (missingInCss.length > 0) {
    console.error(`[SMOKE][js-css-coverage] FAIL - Missing dynamically generated classes in CSS: ${missingInCss.join(', ')}`);
    process.exit(1);
} else {
    console.log(`[SMOKE][js-css-coverage] PASS - 100% dynamic JS class CSS coverage (${jsClasses.size} classes checked).`);
}
