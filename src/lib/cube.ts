export type Face = 'U' | 'D' | 'F' | 'B' | 'L' | 'R';
export const FACE_ORDER: Face[] = ['U', 'L', 'F', 'R', 'B', 'D'];

export const FACE_COLORS: Record<Face, string> = {
  U: 'hsl(50 100% 55%)',
  D: 'hsl(0 0% 100%)',
  F: 'hsl(140 90% 55%)',
  B: 'hsl(175 90% 50%)',
  L: 'hsl(25 100% 58%)',
  R: 'hsl(320 95% 60%)',
};

export const FACE_NAMES: Record<Face, string> = {
  U: 'Верх',
  D: 'Низ',
  F: 'Перед',
  B: 'Зад',
  L: 'Лево',
  R: 'Право',
};

export type CubeState = Record<Face, Face[]>;

export function createSolved(n: number): CubeState {
  const state = {} as CubeState;
  for (const f of FACE_ORDER) {
    state[f] = Array(n * n).fill(f);
  }
  return state;
}

export function isSolved(state: CubeState): boolean {
  return FACE_ORDER.every((f) => state[f].every((c) => c === state[f][0]));
}

function rotateFaceArray(arr: Face[], n: number, clockwise: boolean): Face[] {
  const res = arr.slice();
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (clockwise) res[c * n + (n - 1 - r)] = arr[r * n + c];
      else res[(n - 1 - c) * n + r] = arr[r * n + c];
    }
  }
  return res;
}

// Rotate one layer (slice) of the cube. axis: face being turned (U/D/F/B/L/R), layer 0..n-1 from that face.
export function turn(state: CubeState, n: number, move: Face, clockwise: boolean): CubeState {
  const s: CubeState = {} as CubeState;
  for (const f of FACE_ORDER) s[f] = state[f].slice();

  const layer = 0;
  // rotate the moved face sticker grid
  if (layer === 0) s[move] = rotateFaceArray(state[move], n, clockwise);

  const row = (f: Face, r: number) => Array.from({ length: n }, (_, c) => r * n + c);
  const col = (f: Face, c: number) => Array.from({ length: n }, (_, r) => r * n + c);

  type Strip = { face: Face; idx: number[] };
  let cycle: Strip[] = [];

  switch (move) {
    case 'U':
      cycle = [
        { face: 'F', idx: row('F', 0) },
        { face: 'R', idx: row('R', 0) },
        { face: 'B', idx: row('B', 0) },
        { face: 'L', idx: row('L', 0) },
      ];
      break;
    case 'D':
      cycle = [
        { face: 'F', idx: row('F', n - 1) },
        { face: 'L', idx: row('L', n - 1) },
        { face: 'B', idx: row('B', n - 1) },
        { face: 'R', idx: row('R', n - 1) },
      ];
      break;
    case 'F':
      cycle = [
        { face: 'U', idx: row('U', n - 1) },
        { face: 'R', idx: col('R', 0) },
        { face: 'D', idx: row('D', 0).slice().reverse() },
        { face: 'L', idx: col('L', n - 1).slice().reverse() },
      ];
      break;
    case 'B':
      cycle = [
        { face: 'U', idx: row('U', 0) },
        { face: 'L', idx: col('L', 0).slice().reverse() },
        { face: 'D', idx: row('D', n - 1).slice().reverse() },
        { face: 'R', idx: col('R', n - 1) },
      ];
      break;
    case 'L':
      cycle = [
        { face: 'U', idx: col('U', 0) },
        { face: 'F', idx: col('F', 0) },
        { face: 'D', idx: col('D', 0) },
        { face: 'B', idx: col('B', n - 1).slice().reverse() },
      ];
      break;
    case 'R':
      cycle = [
        { face: 'U', idx: col('U', n - 1) },
        { face: 'B', idx: col('B', 0).slice().reverse() },
        { face: 'D', idx: col('D', n - 1) },
        { face: 'F', idx: col('F', n - 1) },
      ];
      break;
  }

  const vals = cycle.map((st) => st.idx.map((i) => state[st.face][i]));
  for (let k = 0; k < cycle.length; k++) {
    const dest = clockwise ? (k + 1) % cycle.length : (k - 1 + cycle.length) % cycle.length;
    const st = cycle[dest];
    st.idx.forEach((i, j) => {
      s[st.face][i] = vals[k][j];
    });
  }

  return s;
}

export const MOVES: Face[] = ['U', 'D', 'F', 'B', 'L', 'R'];

export function scramble(state: CubeState, n: number, count = 25): { state: CubeState; seq: string[] } {
  let s = state;
  const seq: string[] = [];
  for (let i = 0; i < count; i++) {
    const m = MOVES[Math.floor(Math.random() * MOVES.length)];
    const cw = Math.random() > 0.5;
    s = turn(s, n, m, cw);
    seq.push(m + (cw ? '' : "'"));
  }
  return { state: s, seq };
}

export function formatTime(ms: number): string {
  const total = Math.floor(ms / 10);
  const cs = total % 100;
  const sec = Math.floor(total / 100) % 60;
  const min = Math.floor(total / 6000);
  const pad = (x: number, l = 2) => String(x).padStart(l, '0');
  return `${pad(min)}:${pad(sec)}.${pad(cs)}`;
}
