// Generate assets/ico/fav.ico — simple placeholder favicon (dark rounded square + white underscore).
// Run: node src/generate-favicon.js
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

const SIZE = 32;
const R = 6;            // corner radius
const BG = [13, 13, 13]; // #0d0d0d

// Raw RGBA pixels
const raw = Buffer.alloc(SIZE * SIZE * 4);
for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
        const i = (y * SIZE + x) * 4;
        // Rounded corners → transparent outside the radius
        const dx = x < R ? R - x : x >= SIZE - R ? x - (SIZE - 1 - R) : 0;
        const dy = y < R ? R - y : y >= SIZE - R ? y - (SIZE - 1 - R) : 0;
        if (dx > 0 && dy > 0 && dx * dx + dy * dy > R * R) {
            raw[i + 3] = 0;
            continue;
        }
        raw[i] = BG[0]; raw[i + 1] = BG[1]; raw[i + 2] = BG[2]; raw[i + 3] = 255;

        // White underscore bar (the "Rullzsy_" motif)
        if (x >= 6 && x <= 25 && y >= 20 && y <= 23) {
            raw[i] = 240; raw[i + 1] = 240; raw[i + 2] = 240;
        }
        // Small white dot on the left of the underscore
        if (x >= 10 && x <= 13 && y >= 12 && y <= 15) {
            raw[i] = 240; raw[i + 1] = 240; raw[i + 2] = 240;
        }
    }
}

// PNG helpers
const crc32 = (buf) => zlib.crc32(buf);
function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])) >>> 0, 0);
    return Buffer.concat([len, typeBuf, data, crc]);
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(SIZE, 0);
ihdr.writeUInt32BE(SIZE, 4);
ihdr[8] = 8;   // bit depth
ihdr[9] = 6;   // color type RGBA
ihdr[10] = 0;  // compression
ihdr[11] = 0;  // filter
ihdr[12] = 0;  // interlace

// Scanlines with filter byte 0
const scan = Buffer.alloc(SIZE * (SIZE * 4 + 1));
for (let y = 0; y < SIZE; y++) {
    scan[y * (SIZE * 4 + 1)] = 0;
    raw.copy(scan, y * (SIZE * 4 + 1) + 1, y * SIZE * 4, (y + 1) * SIZE * 4);
}

const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(scan, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
]);

// ICO container (single image, 32x32, 32-bit PNG)
const header = Buffer.alloc(6);
header[2] = 1; // type: icon
header[4] = 1; // count
const entry = Buffer.alloc(16);
entry[0] = SIZE;       // width
entry[1] = SIZE;       // height
entry[2] = 0;          // palette
entry[3] = 0;          // reserved
entry.writeUInt16LE(1, 4);   // planes
entry.writeUInt16LE(32, 6);  // bit count
entry.writeUInt32LE(png.length, 8); // data size
entry.writeUInt32LE(22, 12);        // data offset

const out = path.join(__dirname, '..', 'assets', 'ico', 'fav.ico');
fs.writeFileSync(out, Buffer.concat([header, entry, png]));
console.log('Generated', out, `(${png.length + 22} bytes)`);
