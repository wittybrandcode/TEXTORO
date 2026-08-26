#!/usr/bin/env node
/**
 * TEXTORO - Icon Generator (T-05)
 * Generates assets/icon.png (23x23 RGBA) without external deps.
 * Usage: node tools/gen-icon.js
 */
'use strict';
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

const W = 23, H = 23;

// --- CRC32 ---
const CRC_TABLE = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
        t[n] = c >>> 0;
    }
    return t;
})();
function crc32(buf) {
    let c = 0xFFFFFFFF;
    for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
}
function chunk(type, data) {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
    const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body), 0);
    return Buffer.concat([len, body, crc]);
}

// --- Draw ---
// Palette: bg #232323, border #3D3D3D, glyph amber #FFB300, shadow row #171717
function makePixels() {
    const px = [];
    for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
            // rounded corner mask (radius 4)
            const r = 4;
            const cx = Math.min(x, W - 1 - x), cy = Math.min(y, H - 1 - y);
            const corner = (cx < r && cy < r);
            if (corner && Math.hypot(r - 1 - cx, r - 1 - cy) > r - 0.5) { px.push([0, 0, 0, 0]); continue; }
            let c = [35, 35, 35, 255];                                   // bg
            if (x === 0 || y === 0 || x === W - 1 || y === H - 1) c = [61, 61, 61, 255]; // border
            const inBar  = (y >= 4 && y <= 7 && x >= 3 && x <= 19);       // T top bar
            const inStem = (x >= 10 && x <= 12 && y >= 8 && y <= 18);     // T stem
            if (inBar || inStem) c = [255, 179, 0, 255];
            px.push(c);
        }
    }
    return px;
}

// --- Encode PNG ---
function encodePNG(px) {
    const sig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4);
    ihdr[8] = 8;   // bit depth
    ihdr[9] = 6;   // color type RGBA
    const raw = Buffer.alloc(H * (1 + W * 4));
    let o = 0;
    for (let y = 0; y < H; y++) {
        raw[o++] = 0; // filter: none
        for (let x = 0; x < W; x++) {
            const [r, g, b, a] = px[y * W + x];
            raw[o++] = r; raw[o++] = g; raw[o++] = b; raw[o++] = a;
        }
    }
    return Buffer.concat([
        sig,
        chunk('IHDR', ihdr),
        chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
        chunk('IEND', Buffer.alloc(0))
    ]);
}

const outPath = path.join(__dirname, '..', 'assets', 'icon.png');
const png = encodePNG(makePixels());
fs.writeFileSync(outPath, png);
console.log('[gen-icon] wrote', outPath, png.length, 'bytes');
if (!fs.readFileSync(outPath).slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]))) {
    console.error('[gen-icon] FAIL: invalid PNG signature'); process.exit(1);
}
console.log('[gen-icon] PASS: valid PNG signature');
