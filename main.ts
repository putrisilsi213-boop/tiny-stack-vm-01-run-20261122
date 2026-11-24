// Tiny stack VM for make.fun tiny-stack-vm-01: a faithful interpreter of the ISA in
// generator/subject/ISA.md, matching the reference VM (generator/subject/vm.mjs) exactly,
// including every trap code (2-11), the 1,000,000-step and 65,536-byte output limits,
// 32-bit wrapping arithmetic (Math.imul for MUL), unsigned DIVU/MODU/LTU, and the
// stack/call-depth/memory bounds the house baseline (plain-vm 1.0.0) skips.
// Node 22, stdlib only. Reads /input/<id>/{program,input}.bin, writes
// /output/<id>/{stdout.bin,exit.txt}. No network, no clock, deterministic.
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// Opcode -> imm*100 + pops*10 + pushes. Unknown byte: no entry -> trap 5.
const E = new Map([
  [0, 0], [1, 101], [2, 401], [3, 10], [4, 12], [5, 22], [6, 23], [7, 33],
  [16, 21], [17, 21], [18, 21], [19, 21], [20, 21], [21, 21], [22, 21], [23, 11],
  [24, 21], [25, 21], [26, 21], [27, 11], [28, 21], [29, 21], [30, 21],
  [32, 21], [33, 21], [34, 21], [48, 200], [49, 210], [50, 210], [51, 200],
  [52, 0], [64, 11], [65, 20], [80, 10], [81, 10], [82, 1], [83, 10],
]);

function run(p: Uint8Array, g: Uint8Array): { o: Uint8Array; c: number } {
  const n = p.length, D = new Int32Array(256), C = new Int32Array(64), M = new Int32Array(256);
  const o = new Uint8Array(65536);
  let sp = 0, cp = 0, pc = 0, s = 0, q = 0, ip = 0;
  const t = (c: number) => ({ o: o.slice(0, q), c });
  for (;;) {
    if (s === 1e6) return t(10);
    if (pc < 0 || pc >= n) return t(9);
    const b = p[pc], e = E.get(b);
    if (e === undefined) return t(5);
    const im = (e / 100) | 0, po = ((e / 10) | 0) % 10, pu = e % 10;
    if (pc + im >= n) return t(9);
    s++;
    const nx = pc + 1 + im;
    if (sp < po) return t(2);
    if (sp - po + pu > 256) return t(3);
    pc = nx;
    switch (b) {
      case 0: return t(0);
      case 1: D[sp++] = (p[nx - 1] << 24) >> 24; break;
      case 2: D[sp++] = p[nx - 4] | (p[nx - 3] << 8) | (p[nx - 2] << 16) | (p[nx - 1] << 24); break;
      case 3: sp--; break;
      case 4: D[sp] = D[sp - 1]; sp++; break;
      case 5: { const x = D[sp - 1]; D[sp - 1] = D[sp - 2]; D[sp - 2] = x; break; }
      case 6: D[sp] = D[sp - 2]; sp++; break;
      case 7: { const a = D[sp - 3]; D[sp - 3] = D[sp - 2]; D[sp - 2] = D[sp - 1]; D[sp - 1] = a; break; }
      case 23: D[sp - 1] = (-D[sp - 1]) | 0; break;
      case 27: D[sp - 1] = ~D[sp - 1]; break;
      case 48: case 49: case 50: {
        const r = ((p[nx - 2] | (p[nx - 1] << 8)) << 16) >> 16;
        let k = true;
        if (b !== 48) { const v = D[--sp]; k = b === 49 ? v === 0 : v !== 0; }
        if (k) pc = nx + r;
        break;
      }
      case 51:
        if (cp === 64) return t(7);
        C[cp++] = nx; pc = p[nx - 2] | (p[nx - 1] << 8); break;
      case 52:
        if (cp === 0) return t(8);
        pc = C[--cp]; break;
      case 64: { const a = D[sp - 1]; if (a < 0 || a >= 256) return t(6); D[sp - 1] = M[a]; break; }
      case 65: { const a = D[sp - 1], v = D[sp - 2]; if (a < 0 || a >= 256) return t(6); sp -= 2; M[a] = v; break; }
      case 80: { const d = String(D[sp - 1]); if (q + d.length > 65536) return t(11); sp--; for (let i = 0; i < d.length; i++) o[q++] = d.charCodeAt(i); break; }
      case 81: if (q + 1 > 65536) return t(11); o[q++] = D[--sp] & 255; break;
      case 82: D[sp++] = ip < g.length ? g[ip++] : -1; break;
      case 83: return t(D[--sp] & 255);
      default: {
        const y = D[sp - 1], x = D[sp - 2];
        let r = 0;
        if (b === 16) r = (x + y) | 0;
        else if (b === 17) r = (x - y) | 0;
        else if (b === 18) r = Math.imul(x, y);
        else if (b === 19) { if (y === 0) return t(4); r = x === -2147483648 && y === -1 ? x : (x / y) | 0; }
        else if (b === 20) { if (y === 0) return t(4); r = y === -1 ? 0 : (x % y) | 0; }
        else if (b === 21) { if (y === 0) return t(4); r = Math.floor((x >>> 0) / (y >>> 0)) | 0; }
        else if (b === 22) { if (y === 0) return t(4); r = ((x >>> 0) % (y >>> 0)) | 0; }
        else if (b === 24) r = x & y;
        else if (b === 25) r = x | y;
        else if (b === 26) r = x ^ y;
        else if (b === 28) r = x << (y & 31);
        else if (b === 29) r = x >> (y & 31);
        else if (b === 30) r = (x >>> (y & 31)) | 0;
        else if (b === 32) r = x === y ? 1 : 0;
        else if (b === 33) r = x < y ? 1 : 0;
        else r = (x >>> 0) < (y >>> 0) ? 1 : 0;
        sp -= 2; D[sp++] = r;
      }
    }
  }
}

const I = process.env.MAKEFUN_INPUT_DIR ?? '/input';
const O = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
for (const id of readdirSync(I).sort()) {
  const r = run(
    new Uint8Array(readFileSync(join(I, id, 'program.bin'))),
    new Uint8Array(readFileSync(join(I, id, 'input.bin'))),
  );
  mkdirSync(join(O, id), { recursive: true });
  writeFileSync(join(O, id, 'stdout.bin'), r.o);
  writeFileSync(join(O, id, 'exit.txt'), `${r.c}\n`);
}
