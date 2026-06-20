import { useRef, useState, useEffect } from 'react';
import { CubeState, Face, FACE_COLORS, FACE_NAMES } from '@/lib/cube';

interface Props {
  state: CubeState;
  n: number;
  onMove: (face: Face, clockwise: boolean) => void;
}

const FACE_LABEL_COLOR: Record<Face, string> = {
  U: '#000',
  D: '#000',
  F: '#000',
  B: '#000',
  L: '#000',
  R: '#fff',
};

function CubeFace({
  face,
  grid,
  n,
  transform,
  cubeSize,
  onFaceClick,
}: {
  face: Face;
  grid: Face[];
  n: number;
  transform: string;
  cubeSize: number;
  onFaceClick: (face: Face, e: React.MouseEvent) => void;
}) {
  const half = cubeSize / 2;
  const gap = Math.max(2, cubeSize * 0.012);
  return (
    <div
      className="absolute grid"
      onClick={(e) => {
        e.stopPropagation();
        onFaceClick(face, e);
      }}
      style={{
        width: cubeSize,
        height: cubeSize,
        gridTemplateColumns: `repeat(${n}, 1fr)`,
        gridTemplateRows: `repeat(${n}, 1fr)`,
        gap,
        padding: gap,
        background: 'hsl(258 60% 4%)',
        borderRadius: cubeSize * 0.06,
        transform: `${transform} translateZ(${half}px)`,
        left: '50%',
        top: '50%',
        marginLeft: -half,
        marginTop: -half,
        backfaceVisibility: 'hidden',
        cursor: 'pointer',
      }}
    >
      {grid.map((c, i) => (
        <div
          key={i}
          style={{
            background: FACE_COLORS[c],
            borderRadius: cubeSize * 0.04,
            boxShadow: 'inset 0 0 8px hsl(0 0% 0% / 0.45)',
            transition: 'background 0.18s ease',
          }}
        />
      ))}
    </div>
  );
}

interface Popup {
  face: Face;
  x: number;
  y: number;
}

export default function Cube3D({ state, n, onMove }: Props) {
  const [rot, setRot] = useState({ x: -28, y: -38 });
  const [popup, setPopup] = useState<Popup | null>(null);
  const dragging = useRef(false);
  const dragMoved = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const cubeSize = 240;

  useEffect(() => {
    const onUp = () => {
      dragging.current = false;
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - last.current.x;
      const dy = e.clientY - last.current.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragMoved.current = true;
      last.current = { x: e.clientX, y: e.clientY };
      setRot((r) => ({
        x: Math.max(-89, Math.min(89, r.x - dy * 0.5)),
        y: r.y + dx * 0.5,
      }));
    };
    const onClickOutside = () => setPopup(null);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('click', onClickOutside);
    return () => {
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('click', onClickOutside);
    };
  }, []);

  const start = (e: React.PointerEvent) => {
    dragging.current = true;
    dragMoved.current = false;
    last.current = { x: e.clientX, y: e.clientY };
    setPopup(null);
  };

  const handleFaceClick = (face: Face, e: React.MouseEvent) => {
    if (dragMoved.current) return;
    e.stopPropagation();
    const rect = containerRef.current?.getBoundingClientRect();
    const x = rect ? e.clientX - rect.left : e.clientX;
    const y = rect ? e.clientY - rect.top : e.clientY;
    setPopup({ face, x, y });
  };

  const NEON_PINK = 'hsl(320 95% 60%)';
  const NEON_CYAN = 'hsl(175 90% 50%)';

  return (
    <div
      ref={containerRef}
      onPointerDown={start}
      className="relative mx-auto select-none touch-none"
      style={{ width: 320, height: 320, perspective: 900 }}
    >
      <div
        className="absolute inset-0"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg)`,
          cursor: dragging.current ? 'grabbing' : 'grab',
        }}
      >
        <CubeFace face="U" grid={state.U} n={n} cubeSize={cubeSize} transform="rotateX(90deg)" onFaceClick={handleFaceClick} />
        <CubeFace face="D" grid={state.D} n={n} cubeSize={cubeSize} transform="rotateX(-90deg)" onFaceClick={handleFaceClick} />
        <CubeFace face="F" grid={state.F} n={n} cubeSize={cubeSize} transform="rotateY(0deg)" onFaceClick={handleFaceClick} />
        <CubeFace face="B" grid={state.B} n={n} cubeSize={cubeSize} transform="rotateY(180deg)" onFaceClick={handleFaceClick} />
        <CubeFace face="L" grid={state.L} n={n} cubeSize={cubeSize} transform="rotateY(-90deg)" onFaceClick={handleFaceClick} />
        <CubeFace face="R" grid={state.R} n={n} cubeSize={cubeSize} transform="rotateY(90deg)" onFaceClick={handleFaceClick} />
      </div>

      {popup && (
        <div
          className="absolute z-50 animate-scale-in"
          style={{
            left: Math.min(popup.x, 220),
            top: Math.max(popup.y - 80, 4),
            filter: 'drop-shadow(0 0 16px hsl(320 95% 60% / 0.6))',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="rounded-xl border-2 p-3 flex flex-col gap-2"
            style={{
              background: 'hsl(258 60% 8% / 0.97)',
              borderColor: FACE_COLORS[popup.face],
              minWidth: 140,
              boxShadow: `0 0 0 1px hsl(258 60% 4%), 0 8px 32px hsl(0 0% 0% / 0.6)`,
            }}
          >
            <div
              className="font-pixel text-[9px] text-center pb-1 border-b"
              style={{ color: FACE_COLORS[popup.face], borderColor: 'hsl(258 40% 25%)' }}
            >
              {FACE_NAMES[popup.face]} ({popup.face})
            </div>
            <button
              className="font-pixel text-[10px] py-2 px-3 rounded border-2 hover:scale-105 active:scale-95 transition-transform"
              style={{ borderColor: NEON_PINK, color: NEON_PINK }}
              onClick={() => { onMove(popup.face, true); setPopup(null); }}
            >
              ↻ По часовой
            </button>
            <button
              className="font-pixel text-[10px] py-2 px-3 rounded border-2 hover:scale-105 active:scale-95 transition-transform"
              style={{ borderColor: NEON_CYAN, color: NEON_CYAN }}
              onClick={() => { onMove(popup.face, false); setPopup(null); }}
            >
              ↺ Против
            </button>
          </div>
        </div>
      )}

      <p className="font-pixel text-[7px] text-center mt-2 absolute bottom-0 w-full" style={{ color: 'hsl(270 25% 55%)' }}>
        ↔ тяни чтобы крутить · клик по грани — ход
      </p>
    </div>
  );
}
