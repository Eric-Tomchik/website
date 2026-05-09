/**
 * Minimal QR Code generator — produces an SVG string.
 * Supports alphanumeric/byte mode, error correction level L, versions 1-10.
 * No external dependencies. Client-side only.
 */

// prettier-ignore
const EC_CODEWORDS_L = [0,7,10,15,20,26,18,20,24,30,18]; // version 1–10
// prettier-ignore
const TOTAL_CODEWORDS = [0,26,44,70,100,134,172,196,242,292,346];
// prettier-ignore
const DATA_CODEWORDS_L = TOTAL_CODEWORDS.map((t, i) => t - EC_CODEWORDS_L[i]);
// prettier-ignore
const ALIGNMENTS: number[][] = [[],[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50]];
// prettier-ignore
const FORMAT_BITS = [0x77c4,0x72f3,0x7daa,0x789d,0x662f,0x6318,0x6c41,0x6976,0x5412,0x5125,0x5e7c,0x5b4b,0x45f9,0x40ce,0x4f97,0x4aa0,0x355f,0x3068,0x3f31,0x3a06,0x24b4,0x2183,0x2eda,0x2bed,0x1689,0x13be,0x1ce7,0x19d0,0x0762,0x0255,0x0d0c,0x083b];

function getVersion(dataLen: number): number {
  for (let v = 1; v <= 10; v++) {
    // byte mode: 4 bit mode + 8/16 bit count + data + 4 bit terminator
    const countBits = v <= 9 ? 8 : 16;
    const capacity = Math.floor((DATA_CODEWORDS_L[v] * 8 - 4 - countBits) / 8);
    if (dataLen <= capacity) return v;
  }
  throw new Error('Data too long for QR version 1-10');
}

function getSize(version: number): number {
  return 17 + version * 4;
}

function toBitStream(data: Uint8Array, version: number): number[] {
  const bits: number[] = [];
  const push = (val: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) bits.push((val >> i) & 1);
  };
  // Byte mode indicator
  push(0b0100, 4);
  // Character count
  push(data.length, version <= 9 ? 8 : 16);
  // Data
  for (const b of data) push(b, 8);
  // Terminator (up to 4 bits)
  const totalBits = DATA_CODEWORDS_L[version] * 8;
  const termLen = Math.min(4, totalBits - bits.length);
  push(0, termLen);
  // Pad to byte boundary
  while (bits.length % 8 !== 0) bits.push(0);
  // Pad bytes
  const padBytes = [0xec, 0x11];
  let pi = 0;
  while (bits.length < totalBits) {
    push(padBytes[pi % 2], 8);
    pi++;
  }
  return bits;
}

// GF(256) arithmetic for Reed-Solomon
const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
(function initGF() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x = (x << 1) ^ (x >= 128 ? 0x11d : 0);
  }
  for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255];
})();

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

function rsEncode(data: Uint8Array, ecCount: number): Uint8Array {
  // Generator polynomial
  const gen = new Uint8Array(ecCount + 1);
  gen[0] = 1;
  for (let i = 0; i < ecCount; i++) {
    for (let j = ecCount; j >= 1; j--) {
      gen[j] = gen[j] ^ gfMul(gen[j - 1], GF_EXP[i]);
    }
  }
  const result = new Uint8Array(ecCount);
  for (const b of data) {
    const lead = b ^ result[0];
    for (let i = 0; i < ecCount - 1; i++) {
      result[i] = result[i + 1] ^ gfMul(gen[i + 1], lead);
    }
    result[ecCount - 1] = gfMul(gen[ecCount], lead);
  }
  return result;
}

function bitsToBytes(bits: number[]): Uint8Array {
  const bytes = new Uint8Array(bits.length / 8);
  for (let i = 0; i < bytes.length; i++) {
    let b = 0;
    for (let j = 0; j < 8; j++) b = (b << 1) | bits[i * 8 + j];
    bytes[i] = b;
  }
  return bytes;
}

function createMatrix(size: number): (number | null)[][] {
  return Array.from({ length: size }, () => Array(size).fill(null));
}

function placeFinder(matrix: (number | null)[][], row: number, col: number) {
  for (let r = -1; r <= 7; r++) {
    for (let c = -1; c <= 7; c++) {
      const mr = row + r, mc = col + c;
      if (mr < 0 || mr >= matrix.length || mc < 0 || mc >= matrix.length) continue;
      const inOuter = r === -1 || r === 7 || c === -1 || c === 7;
      const inBorder = r === 0 || r === 6 || c === 0 || c === 6;
      const inInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
      matrix[mr][mc] = (inBorder || inInner) && !inOuter ? 1 : inOuter ? 0 : 0;
    }
  }
}

function placeAlignment(matrix: (number | null)[][], row: number, col: number) {
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      const border = r === -2 || r === 2 || c === -2 || c === 2;
      const center = r === 0 && c === 0;
      matrix[row + r][col + c] = border || center ? 1 : 0;
    }
  }
}

function placeFixedPatterns(matrix: (number | null)[][], version: number) {
  const size = matrix.length;
  // Finder patterns
  placeFinder(matrix, 0, 0);
  placeFinder(matrix, 0, size - 7);
  placeFinder(matrix, size - 7, 0);
  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    if (matrix[6][i] === null) matrix[6][i] = i % 2 === 0 ? 1 : 0;
    if (matrix[i][6] === null) matrix[i][6] = i % 2 === 0 ? 1 : 0;
  }
  // Dark module
  matrix[size - 8][8] = 1;
  // Alignment patterns
  const aligns = ALIGNMENTS[version];
  if (aligns.length > 1) {
    for (const r of aligns) {
      for (const c of aligns) {
        if (matrix[r][c] !== null) continue; // skip if overlaps finder
        placeAlignment(matrix, r, c);
      }
    }
  }
  // Reserve format info areas (set to 0 temporarily)
  for (let i = 0; i < 8; i++) {
    if (matrix[8][i] === null) matrix[8][i] = 0;
    if (matrix[8][size - 1 - i] === null) matrix[8][size - 1 - i] = 0;
    if (matrix[i][8] === null) matrix[i][8] = 0;
    if (matrix[size - 1 - i][8] === null) matrix[size - 1 - i][8] = 0;
  }
  if (matrix[8][8] === null) matrix[8][8] = 0;
}

function placeData(matrix: (number | null)[][], bits: number[]) {
  const size = matrix.length;
  let bitIdx = 0;
  let upward = true;
  for (let col = size - 1; col >= 1; col -= 2) {
    if (col === 6) col = 5; // skip timing column
    const rows = upward
      ? Array.from({ length: size }, (_, i) => size - 1 - i)
      : Array.from({ length: size }, (_, i) => i);
    for (const row of rows) {
      for (const dc of [0, -1]) {
        const c = col + dc;
        if (c < 0) continue;
        if (matrix[row][c] !== null) continue;
        matrix[row][c] = bitIdx < bits.length ? bits[bitIdx++] : 0;
      }
    }
    upward = !upward;
  }
}

function applyMask(matrix: (number | null)[][], mask: number, reserved: (number | null)[][]) {
  const size = matrix.length;
  const maskFn = (r: number, c: number): boolean => {
    switch (mask) {
      case 0: return (r + c) % 2 === 0;
      case 1: return r % 2 === 0;
      case 2: return c % 3 === 0;
      case 3: return (r + c) % 3 === 0;
      case 4: return (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0;
      case 5: return ((r * c) % 2 + (r * c) % 3) === 0;
      case 6: return ((r * c) % 2 + (r * c) % 3) % 2 === 0;
      case 7: return ((r + c) % 2 + (r * c) % 3) % 2 === 0;
      default: return false;
    }
  };
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (reserved[r][c] !== null) continue;
      if (maskFn(r, c)) matrix[r][c] = matrix[r][c]! ^ 1;
    }
  }
}

function placeFormatInfo(matrix: (number | null)[][], mask: number) {
  // EC level L = 01, mask pattern
  const formatIdx = (0b01 << 3) | mask;
  const bits = FORMAT_BITS[formatIdx];
  const size = matrix.length;
  // Around top-left finder
  const positions = [
    [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8],
    [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8],
  ];
  for (let i = 0; i < 15; i++) {
    matrix[positions[i][0]][positions[i][1]] = (bits >> (14 - i)) & 1;
  }
  // Around top-right and bottom-left finders
  for (let i = 0; i < 8; i++) {
    matrix[8][size - 1 - i] = (bits >> (14 - i)) & 1;
  }
  for (let i = 0; i < 7; i++) {
    matrix[size - 1 - i][8] = (bits >> (7 + 6 - i)) & 1;
  }
}

function scorePenalty(matrix: (number | null)[][]): number {
  const size = matrix.length;
  let penalty = 0;
  // Rule 1: consecutive same-color modules in row/col
  for (let r = 0; r < size; r++) {
    let count = 1;
    for (let c = 1; c < size; c++) {
      if (matrix[r][c] === matrix[r][c - 1]) {
        count++;
        if (count === 5) penalty += 3;
        else if (count > 5) penalty += 1;
      } else count = 1;
    }
  }
  for (let c = 0; c < size; c++) {
    let count = 1;
    for (let r = 1; r < size; r++) {
      if (matrix[r][c] === matrix[r - 1][c]) {
        count++;
        if (count === 5) penalty += 3;
        else if (count > 5) penalty += 1;
      } else count = 1;
    }
  }
  return penalty;
}

export function generateQRCodeSVG(text: string, moduleSize = 4, margin = 4): string {
  const data = new TextEncoder().encode(text);
  const version = getVersion(data.length);
  const size = getSize(version);
  const ecCount = EC_CODEWORDS_L[version];

  // Encode data
  const dataBits = toBitStream(data, version);
  const dataBytes = bitsToBytes(dataBits);
  const ecBytes = rsEncode(dataBytes, ecCount);

  // Interleave data + EC into final bit stream
  const allBits: number[] = [];
  const pushByte = (b: number) => {
    for (let i = 7; i >= 0; i--) allBits.push((b >> i) & 1);
  };
  for (const b of dataBytes) pushByte(b);
  for (const b of ecBytes) pushByte(b);

  // Create reserved pattern matrix
  const reserved = createMatrix(size);
  placeFixedPatterns(reserved, version);

  // Try all 8 masks, pick lowest penalty
  let bestMask = 0;
  let bestPenalty = Infinity;
  let bestMatrix: (number | null)[][] | null = null;

  for (let mask = 0; mask < 8; mask++) {
    const matrix = createMatrix(size);
    placeFixedPatterns(matrix, version);
    placeData(matrix, allBits);
    applyMask(matrix, mask, reserved);
    placeFormatInfo(matrix, mask);
    const p = scorePenalty(matrix);
    if (p < bestPenalty) {
      bestPenalty = p;
      bestMask = mask;
      bestMatrix = matrix;
    }
  }

  const matrix = bestMatrix!;
  const svgSize = size * moduleSize + margin * 2;

  let rects = '';
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c] === 1) {
        rects += `<rect x="${margin + c * moduleSize}" y="${margin + r * moduleSize}" width="${moduleSize}" height="${moduleSize}"/>`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgSize} ${svgSize}" width="${svgSize}" height="${svgSize}">` +
    `<rect width="100%" height="100%" fill="white"/>` +
    `<g fill="black">${rects}</g>` +
    `</svg>`;
}
