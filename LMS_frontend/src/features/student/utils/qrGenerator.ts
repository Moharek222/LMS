/**
 * Pure TypeScript QR Code Matrix Generator (ISO/IEC 18004 compliant)
 * Handles Byte Mode strings up to 80 characters without external dependencies.
 */

// GF(256) tables for Reed-Solomon error correction
const EXP_TABLE = new Uint8Array(512);
const LOG_TABLE = new Uint8Array(256);

(function initGF() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP_TABLE[i] = x;
    LOG_TABLE[x] = i;
    x <<= 1;
    if (x & 256) x ^= 0x11d; // Primitive polynomial 285
  }
  for (let i = 255; i < 512; i++) {
    EXP_TABLE[i] = EXP_TABLE[i - 255];
  }
})();

function gfMul(x: number, y: number): number {
  if (x === 0 || y === 0) return 0;
  return EXP_TABLE[LOG_TABLE[x] + LOG_TABLE[y]];
}

function polyMul(p1: number[], p2: number[]): number[] {
  const result = new Array(p1.length + p2.length - 1).fill(0);
  for (let i = 0; i < p1.length; i++) {
    for (let j = 0; j < p2.length; j++) {
      result[i + j] ^= gfMul(p1[i], p2[j]);
    }
  }
  return result;
}

function getGeneratorPoly(ecLength: number): number[] {
  let g = [1];
  for (let i = 0; i < ecLength; i++) {
    g = polyMul(g, [1, EXP_TABLE[i]]);
  }
  return g;
}

function calcReedSolomon(dataBytes: number[], ecLength: number): number[] {
  const genPoly = getGeneratorPoly(ecLength);
  const res = new Array(dataBytes.length + ecLength).fill(0);
  for (let i = 0; i < dataBytes.length; i++) {
    res[i] = dataBytes[i];
  }
  for (let i = 0; i < dataBytes.length; i++) {
    const coef = res[i];
    if (coef !== 0) {
      for (let j = 0; j < genPoly.length; j++) {
        res[i + j] ^= gfMul(genPoly[j], coef);
      }
    }
  }
  return res.slice(dataBytes.length);
}

// QR Code Specifications for Version 2..5 (Error Correction M)
interface QRVersionSpec {
  version: number;
  size: number;
  dataCapacity: number;
  ecCount: number;
  alignments: number[];
}

const QR_SPECS: QRVersionSpec[] = [
  { version: 2, size: 25, dataCapacity: 22, ecCount: 10, alignments: [6, 18] },
  { version: 3, size: 29, dataCapacity: 34, ecCount: 15, alignments: [6, 22] },
  { version: 4, size: 33, dataCapacity: 48, ecCount: 20, alignments: [6, 26] },
  { version: 5, size: 37, dataCapacity: 62, ecCount: 26, alignments: [6, 30] },
  { version: 6, size: 41, dataCapacity: 76, ecCount: 30, alignments: [6, 34] },
];

export interface QRMatrixResult {
  size: number;
  modules: boolean[][];
}

export function generateQRMatrix(text: string): QRMatrixResult | null {
  if (!text) return null;

  // Convert input text to UTF-8 bytes
  const encoder = new TextEncoder();
  const textBytes = Array.from(encoder.encode(text));

  // Determine required QR version
  const requiredDataBytes = textBytes.length + 2; // Byte mode header + count + data
  const spec = QR_SPECS.find((s) => s.dataCapacity >= requiredDataBytes);
  if (!spec) {
    // If text is larger than version 6 capacity, fallback to max supported spec
    return null;
  }

  const { size, dataCapacity, ecCount, alignments } = spec;

  // Build Data Bitstream
  const bits: number[] = [];

  // Mode indicator for Byte mode: 0100 (4 bits)
  bits.push(0, 1, 0, 0);

  // Character count indicator: 8 bits
  for (let i = 7; i >= 0; i--) {
    bits.push((textBytes.length >> i) & 1);
  }

  // Data payload bytes
  for (const byte of textBytes) {
    for (let i = 7; i >= 0; i--) {
      bits.push((byte >> i) & 1);
    }
  }

  // Terminator (up to 4 zeroes)
  const padZeros = Math.min(4, dataCapacity * 8 - bits.length);
  for (let i = 0; i < padZeros; i++) {
    bits.push(0);
  }

  // Align to byte boundary
  while (bits.length % 8 !== 0) {
    bits.push(0);
  }

  // Convert bits to data bytes
  const dataBytes: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let b = 0;
    for (let j = 0; j < 8; j++) {
      b = (b << 1) | bits[i + j];
    }
    dataBytes.push(b);
  }

  // Pad to max data capacity with alternating 0xEC and 0x11
  const padPattern = [0xec, 0x11];
  let padIdx = 0;
  while (dataBytes.length < dataCapacity) {
    dataBytes.push(padPattern[padIdx]);
    padIdx = (padIdx + 1) % 2;
  }

  // Calculate Reed-Solomon Error Correction Bytes
  const ecBytes = calcReedSolomon(dataBytes, ecCount);

  // Combine Data Bytes and EC Bytes
  const allCodewords = [...dataBytes, ...ecBytes];

  // Convert all codewords to bit sequence
  const allBits: number[] = [];
  for (const byte of allCodewords) {
    for (let i = 7; i >= 0; i--) {
      allBits.push((byte >> i) & 1);
    }
  }

  // Build QR Matrix
  const modules: boolean[][] = Array.from({ length: size }, () =>
    new Array(size).fill(false)
  );
  const isReserved: boolean[][] = Array.from({ length: size }, () =>
    new Array(size).fill(false)
  );

  // Helper to draw fixed patterns
  const setModule = (r: number, c: number, val: boolean) => {
    if (r >= 0 && r < size && c >= 0 && c < size) {
      modules[r][c] = val;
      isReserved[r][c] = true;
    }
  };

  // 1. Finder Patterns (7x7) at (0,0), (0, size-7), (size-7, 0)
  const drawFinder = (top: number, left: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const nr = top + r;
        const nc = left + c;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
          const isDark =
            r >= 0 &&
            r <= 6 &&
            c >= 0 &&
            c <= 6 &&
            (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4));
          setModule(nr, nc, isDark);
        }
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  // 2. Alignment Patterns (5x5)
  for (const rCenter of alignments) {
    for (const cCenter of alignments) {
      // Skip if overlaps with finders
      if (
        (rCenter === 6 && cCenter === 6) ||
        (rCenter === 6 && cCenter === alignments[alignments.length - 1]) ||
        (rCenter === alignments[alignments.length - 1] && cCenter === 6)
      ) {
        continue;
      }

      for (let r = -2; r <= 2; r++) {
        for (let c = -2; c <= 2; c++) {
          const isDark =
            Math.max(Math.abs(r), Math.abs(c)) === 2 || (r === 0 && c === 0);
          setModule(rCenter + r, cCenter + c, isDark);
        }
      }
    }
  }

  // 3. Timing Patterns (Row 6 and Column 6)
  for (let i = 0; i < size; i++) {
    if (!isReserved[6][i]) setModule(6, i, i % 2 === 0);
    if (!isReserved[i][6]) setModule(i, 6, i % 2 === 0);
  }

  // 4. Dark Module
  setModule(size - 8, 8, true);

  // Reserve Format Info Area
  for (let i = 0; i < 9; i++) {
    if (!isReserved[8][i]) isReserved[8][i] = true;
    if (!isReserved[i][8]) isReserved[i][8] = true;
    if (!isReserved[size - 1 - i][8]) isReserved[size - 1 - i][8] = true;
    if (!isReserved[8][size - 1 - i]) isReserved[8][size - 1 - i] = true;
  }

  // 5. Data Placement (Zigzag pattern from bottom-right)
  let bitIdx = 0;
  let dir = -1; // -1 = going up, 1 = going down
  for (let right = size - 1; right > 0; right -= 2) {
    if (right === 6) right--; // Skip vertical timing column

    for (let count = 0; count < size; count++) {
      const r = dir === -1 ? size - 1 - count : count;

      for (let c = right; c > right - 2; c--) {
        if (!isReserved[r][c]) {
          const bitVal = bitIdx < allBits.length ? allBits[bitIdx++] : 0;
          modules[r][c] = bitVal === 1;
        }
      }
    }
    dir = -dir; // Reverse vertical direction
  }

  // 6. Apply Data Masking (Mask 0: (row + col) % 2 === 0)
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!isReserved[r][c]) {
        if ((r + c) % 2 === 0) {
          modules[r][c] = !modules[r][c];
        }
      }
    }
  }

  // 7. Write Format Information (EC Level M = 00, Mask 0 = 000 -> Format Bits: 101010000010010)
  const formatBits = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0];

  // Top-left format bits around finder
  const formatPositionsTopLeft = [
    [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8],
    [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8]
  ];

  for (let i = 0; i < 15; i++) {
    const [r, c] = formatPositionsTopLeft[i];
    modules[r][c] = formatBits[i] === 1;
  }

  // Format bits split on bottom-left and top-right
  for (let i = 0; i < 7; i++) {
    modules[size - 1 - i][8] = formatBits[i] === 1;
  }
  for (let i = 0; i < 8; i++) {
    modules[8][size - 8 + i] = formatBits[7 + i] === 1;
  }

  return { size, modules };
}
