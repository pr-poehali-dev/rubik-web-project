import { useRef, useState, useEffect } from 'react';
import { CubeState, Face, FACE_COLORS } from '@/lib/cube';

interface Props {
  state: CubeState;
  n: number;
}

// Каждая грань кубика рисуется как сетка n×n плиток, повёрнутая в 3D.
function CubeFace({
  grid,
  n,
  transform,
  cubeSize,
}: {
  grid: Face[];
  n: number;
  transform: string;
  cubeSize: number;
}) {
  const half = cubeSize / 2;
  return (
    <div
      className="absolute grid"
      style={{
        width: cubeSize,
        height: cubeSize,
        gridTemplateColumns: `repeat(${n}, 1fr)`,
        gridTemplateRows: `repeat(${n}, 1fr)`,
        gap: Math.max(2, cubeSize * 0.012),
        padding: Math.max(2, cubeSize * 0.012),
        background: 'hsl(258 60% 4%)',
        borderRadius: cubeSize * 0.06,
        transform: `${transform} translateZ(${half}px)`,
        left: '50%',
        top: '50%',
        marginLeft: -half,
        marginTop: -half,
        backfaceVisibility: 'hidden',
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

export default function Cube3D({ state, n }: Props) {
  const [rot, setRot] = useState({ x: -28, y: -38 });
  const dragging = useRef(false);
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
      last.current = { x: e.clientX, y: e.clientY };
      setRot((r) => ({ x: Math.max(-89, Math.min(89, r.x - dy * 0.5)), y: r.y + dx * 0.5 }));
    };
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointermove', onMove);
    return () => {
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  const start = (e: React.PointerEvent) => {
    dragging.current = true;
    last.current = { x: e.clientX, y: e.clientY };
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={start}
      className="relative mx-auto cursor-grab active:cursor-grabbing select-none touch-none"
      style={{ width: 320, height: 320, perspective: 900 }}
    >
      <div
        className="absolute inset-0"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg)`,
          transition: dragging.current ? 'none' : 'transform 0.15s ease-out',
        }}
      >
        <CubeFace grid={state.U} n={n} cubeSize={cubeSize} transform="rotateX(90deg)" />
        <CubeFace grid={state.D} n={n} cubeSize={cubeSize} transform="rotateX(-90deg)" />
        <CubeFace grid={state.F} n={n} cubeSize={cubeSize} transform="rotateY(0deg)" />
        <CubeFace grid={state.B} n={n} cubeSize={cubeSize} transform="rotateY(180deg)" />
        <CubeFace grid={state.L} n={n} cubeSize={cubeSize} transform="rotateY(-90deg)" />
        <CubeFace grid={state.R} n={n} cubeSize={cubeSize} transform="rotateY(90deg)" />
      </div>
    </div>
  );
}
