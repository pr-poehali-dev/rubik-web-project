import { useState, useEffect, useRef, useMemo } from 'react';
import Cube3D from '@/components/Cube3D';
import {
  CubeState,
  Face,
  FACE_COLORS,
  FACE_NAMES,
  createSolved,
  isSolved,
  turn,
  scramble,
  formatTime,
  MOVES,
} from '@/lib/cube';

type Screen = 'menu' | 'game' | 'records' | 'tutorial' | 'settings' | 'about';

const SIZES = [2, 3, 4, 5];

interface Record {
  size: number;
  ms: number;
  date: string;
}

const NEON = {
  pink: 'hsl(320 95% 60%)',
  cyan: 'hsl(175 90% 50%)',
  yellow: 'hsl(50 100% 55%)',
  green: 'hsl(140 90% 55%)',
  purple: 'hsl(270 90% 65%)',
  orange: 'hsl(25 100% 58%)',
};

function loadRecords(): Record[] {
  try {
    return JSON.parse(localStorage.getItem('cubequest_records') || '[]');
  } catch {
    return [];
  }
}

const Index = () => {
  const [screen, setScreen] = useState<Screen>('menu');
  const [size, setSize] = useState(3);
  const [records, setRecords] = useState<Record[]>(loadRecords());
  const [soundOn, setSoundOn] = useState(true);

  return (
    <div className="min-h-screen grid-bg scanlines relative overflow-x-hidden font-body">
      <Header screen={screen} onHome={() => setScreen('menu')} />
      <main className="max-w-5xl mx-auto px-4 pb-20">
        {screen === 'menu' && (
          <Menu
            size={size}
            setSize={setSize}
            onPlay={() => setScreen('game')}
            onNav={setScreen}
          />
        )}
        {screen === 'game' && (
          <Game
            size={size}
            soundOn={soundOn}
            records={records}
            onNewRecord={(r) => {
              const next = [...records, r];
              setRecords(next);
              localStorage.setItem('cubequest_records', JSON.stringify(next));
            }}
          />
        )}
        {screen === 'records' && <Records records={records} />}
        {screen === 'tutorial' && <Tutorial />}
        {screen === 'settings' && (
          <Settings soundOn={soundOn} setSoundOn={setSoundOn} size={size} setSize={setSize} />
        )}
        {screen === 'about' && <About />}
      </main>
    </div>
  );
};

function Header({ screen, onHome }: { screen: Screen; onHome: () => void }) {
  return (
    <header className="flex items-center justify-between px-4 py-5 max-w-5xl mx-auto">
      <button onClick={onHome} className="flex items-center gap-3 group">
        <div className="grid grid-cols-2 gap-0.5 animate-float">
          {[NEON.pink, NEON.cyan, NEON.yellow, NEON.green].map((c, i) => (
            <div key={i} className="w-3 h-3 rounded-[2px]" style={{ background: c, boxShadow: `0 0 6px ${c}` }} />
          ))}
        </div>
        <h1 className="font-pixel text-sm sm:text-base text-shadow-pixel" style={{ color: NEON.yellow }}>
          CUBE<span style={{ color: NEON.pink }}>QUEST</span>
        </h1>
      </button>
      {screen !== 'menu' && (
        <button
          onClick={onHome}
          className="font-pixel text-[9px] px-3 py-2 rounded border-2 hover:scale-105 transition-transform"
          style={{ borderColor: NEON.cyan, color: NEON.cyan }}
        >
          ◄ МЕНЮ
        </button>
      )}
    </header>
  );
}

function NeonButton({
  children,
  onClick,
  color,
  className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  color: string;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`font-pixel text-xs sm:text-sm px-5 py-4 rounded-lg border-2 bg-card/60 backdrop-blur transition-all hover:scale-105 active:scale-95 ${className}`}
      style={{ borderColor: color, color, boxShadow: `0 0 0 2px hsl(258 60% 8%), 0 6px 0 0 ${color}66, 0 0 16px ${color}55` }}
    >
      {children}
    </button>
  );
}

function Menu({
  size,
  setSize,
  onPlay,
  onNav,
}: {
  size: number;
  setSize: (n: number) => void;
  onPlay: () => void;
  onNav: (s: Screen) => void;
}) {
  return (
    <div className="flex flex-col items-center text-center pt-6 animate-fade-in">
      <p className="font-pixel text-[10px] mb-2 animate-blink" style={{ color: NEON.cyan }}>
        ★ PRESS START ★
      </p>
      <h2
        className="font-pixel text-3xl sm:text-5xl leading-tight mb-3 animate-glow-pulse text-shadow-pixel"
        style={{ color: NEON.pink }}
      >
        CUBE<br />QUEST
      </h2>
      <p className="text-muted-foreground max-w-md mb-8">
        Собери кубик любого размера на скорость! Перемешай, крути грани и побей свой рекорд.
      </p>

      <div className="mb-8 w-full max-w-md">
        <p className="font-pixel text-[10px] mb-4" style={{ color: NEON.yellow }}>
          ВЫБЕРИ РАЗМЕР
        </p>
        <div className="grid grid-cols-4 gap-3">
          {SIZES.map((n) => (
            <button
              key={n}
              onClick={() => setSize(n)}
              className="font-pixel text-sm py-5 rounded-lg border-2 transition-all hover:scale-105 active:scale-95"
              style={{
                borderColor: size === n ? NEON.green : 'hsl(258 40% 30%)',
                color: size === n ? NEON.green : 'hsl(270 25% 70%)',
                background: size === n ? 'hsl(140 90% 55% / 0.12)' : 'transparent',
                boxShadow: size === n ? `0 0 16px ${NEON.green}66` : 'none',
              }}
            >
              {n}×{n}
            </button>
          ))}
        </div>
      </div>

      <NeonButton onClick={onPlay} color={NEON.green} className="text-base sm:text-lg px-10 py-5 mb-10 animate-float">
        ▶ ИГРАТЬ
      </NeonButton>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-xl">
        <NeonButton onClick={() => onNav('records')} color={NEON.yellow}>🏆 РЕКОРДЫ</NeonButton>
        <NeonButton onClick={() => onNav('tutorial')} color={NEON.cyan}>📖 УЧЁБА</NeonButton>
        <NeonButton onClick={() => onNav('settings')} color={NEON.purple}>⚙ НАСТРОЙКИ</NeonButton>
        <NeonButton onClick={() => onNav('about')} color={NEON.orange}>ℹ ОБ ИГРЕ</NeonButton>
      </div>
    </div>
  );
}

function FaceGrid({ face, grid, n, label }: { face: Face; grid: Face[]; n: number; label?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="grid gap-[3px] p-[3px] rounded bg-[hsl(258_60%_4%)]"
        style={{ gridTemplateColumns: `repeat(${n}, 1fr)`, width: `${n * 26 + (n + 1) * 3}px` }}
      >
        {grid.map((c, i) => (
          <div
            key={i}
            className="rounded-[3px] transition-colors duration-150"
            style={{ width: 26, height: 26, background: FACE_COLORS[c], boxShadow: `inset 0 0 4px hsl(0 0% 0% / 0.4)` }}
          />
        ))}
      </div>
      {label && <span className="font-pixel text-[7px] text-muted-foreground">{FACE_NAMES[face]}</span>}
    </div>
  );
}

function Game({
  size,
  soundOn,
  records,
  onNewRecord,
}: {
  size: number;
  soundOn: boolean;
  records: Record[];
  onNewRecord: (r: Record) => void;
}) {
  const [state, setState] = useState<CubeState>(() => createSolved(size));
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [won, setWon] = useState(false);
  const [view, setView] = useState<'3d' | '2d'>('3d');
  const startTime = useRef(0);
  const raf = useRef(0);

  useEffect(() => {
    setState(createSolved(size));
    setRunning(false);
    setStarted(false);
    setElapsed(0);
    setWon(false);
  }, [size]);

  useEffect(() => {
    if (!running) return;
    const tick = () => {
      setElapsed(Date.now() - startTime.current);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [running]);

  const beep = (freq: number) => {
    if (!soundOn) return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.value = 0.05;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.stop(ctx.currentTime + 0.12);
    } catch {
      /* ignore */
    }
  };

  const doScramble = () => {
    const { state: s } = scramble(createSolved(size), size, 12 + size * 6);
    setState(s);
    setWon(false);
    setElapsed(0);
    setStarted(false);
    setRunning(false);
    beep(440);
  };

  const doMove = (m: Face, cw: boolean) => {
    if (won) return;
    if (!started) {
      setStarted(true);
      setRunning(true);
      startTime.current = Date.now();
    }
    const next = turn(state, size, m, cw);
    setState(next);
    beep(cw ? 520 : 380);
    if (started && isSolved(next)) {
      setRunning(false);
      setWon(true);
      beep(660);
      setTimeout(() => beep(880), 120);
      setTimeout(() => beep(1040), 240);
      onNewRecord({ size, ms: Date.now() - startTime.current, date: new Date().toLocaleDateString('ru-RU') });
    }
  };

  const best = useMemo(() => {
    const f = records.filter((r) => r.size === size).map((r) => r.ms);
    return f.length ? Math.min(...f) : null;
  }, [records, size]);

  const grids = useMemo(() => {
    const g: { face: Face; pos: [number, number] }[] = [
      { face: 'U', pos: [0, 1] },
      { face: 'L', pos: [1, 0] },
      { face: 'F', pos: [1, 1] },
      { face: 'R', pos: [1, 2] },
      { face: 'B', pos: [1, 3] },
      { face: 'D', pos: [2, 1] },
    ];
    return g;
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
        <div
          className="font-pixel text-2xl sm:text-3xl px-6 py-3 rounded-lg border-2"
          style={{ borderColor: NEON.cyan, color: NEON.cyan, boxShadow: `0 0 16px ${NEON.cyan}55` }}
        >
          {formatTime(elapsed)}
        </div>
        <div className="font-pixel text-[9px] text-muted-foreground">
          <div style={{ color: NEON.yellow }}>{size}×{size}</div>
          <div className="mt-1">РЕКОРД: {best != null ? formatTime(best) : '--:--.--'}</div>
        </div>
      </div>

      {won && (
        <div className="text-center mb-5 animate-scale-in">
          <p className="font-pixel text-xl animate-glow-pulse" style={{ color: NEON.green }}>🎉 СОБРАНО! 🎉</p>
          <p className="font-pixel text-xs mt-2" style={{ color: NEON.yellow }}>{formatTime(elapsed)}</p>
        </div>
      )}

      <div className="flex justify-center gap-2 mb-5">
        {(['3d', '2d'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className="font-pixel text-[9px] px-4 py-2 rounded border-2 transition-transform hover:scale-105"
            style={{
              borderColor: view === v ? NEON.green : 'hsl(258 40% 30%)',
              color: view === v ? NEON.green : 'hsl(270 25% 70%)',
              background: view === v ? 'hsl(140 90% 55% / 0.12)' : 'transparent',
            }}
          >
            {v === '3d' ? '🧊 3D' : '🗺 РАЗВЁРТКА'}
          </button>
        ))}
      </div>

      {view === '3d' ? (
        <div className="py-2">
          <Cube3D state={state} n={size} onMove={doMove} />
        </div>
      ) : (
        <div className="overflow-x-auto pb-2">
          <div
            className="grid gap-2 mx-auto w-fit"
            style={{ gridTemplateColumns: 'repeat(4, max-content)', gridTemplateRows: 'repeat(3, max-content)' }}
          >
            {grids.map(({ face, pos }) => (
              <div key={face} style={{ gridColumn: pos[1] + 1, gridRow: pos[0] + 1 }}>
                <FaceGrid face={face} grid={state[face]} n={size} label />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-3 mt-8">
        <NeonButton onClick={doScramble} color={NEON.pink}>🔀 ПЕРЕМЕШАТЬ</NeonButton>
        <NeonButton
          onClick={() => {
            setState(createSolved(size));
            setWon(false);
            setRunning(false);
            setStarted(false);
            setElapsed(0);
          }}
          color={NEON.purple}
        >
          ↺ СБРОС
        </NeonButton>
      </div>

      <div className="mt-8 max-w-md mx-auto">
        <p className="font-pixel text-[9px] text-center mb-3" style={{ color: NEON.yellow }}>
          ПОВОРОТЫ ГРАНЕЙ
        </p>
        <div className="grid grid-cols-3 gap-2">
          {MOVES.map((m) => (
            <div key={m} className="flex flex-col gap-1">
              <span className="font-pixel text-[8px] text-center text-muted-foreground">{FACE_NAMES[m]}</span>
              <div className="flex gap-1">
                <button
                  onClick={() => doMove(m, true)}
                  className="flex-1 font-pixel text-[10px] py-3 rounded border-2 hover:scale-105 active:scale-95 transition-transform"
                  style={{ borderColor: FACE_COLORS[m], color: FACE_COLORS[m] }}
                >
                  {m} ↻
                </button>
                <button
                  onClick={() => doMove(m, false)}
                  className="flex-1 font-pixel text-[10px] py-3 rounded border-2 hover:scale-105 active:scale-95 transition-transform opacity-80"
                  style={{ borderColor: FACE_COLORS[m], color: FACE_COLORS[m] }}
                >
                  {m}' ↺
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Records({ records }: { records: Record[] }) {
  const byBest = useMemo(() => {
    const map: globalThis.Record<number, Record[]> = {};
    records.forEach((r) => {
      (map[r.size] ||= []).push(r);
    });
    return SIZES.map((s) => ({
      size: s,
      list: (map[s] || []).sort((a, b) => a.ms - b.ms).slice(0, 5),
    }));
  }, [records]);

  return (
    <div className="animate-fade-in">
      <h2 className="font-pixel text-xl text-center mb-8" style={{ color: NEON.yellow }}>🏆 ЛУЧШИЕ ВРЕМЕНА</h2>
      <div className="grid sm:grid-cols-2 gap-5">
        {byBest.map(({ size, list }) => (
          <div
            key={size}
            className="rounded-lg border-2 p-4 bg-card/50 backdrop-blur"
            style={{ borderColor: NEON.cyan }}
          >
            <p className="font-pixel text-sm mb-4" style={{ color: NEON.cyan }}>{size}×{size}</p>
            {list.length === 0 ? (
              <p className="text-muted-foreground text-sm">Пока нет рекордов. Собери кубик!</p>
            ) : (
              <ol className="space-y-2">
                {list.map((r, i) => (
                  <li key={i} className="flex items-center justify-between">
                    <span className="font-pixel text-[10px]" style={{ color: i === 0 ? NEON.yellow : 'inherit' }}>
                      {i === 0 ? '👑' : `#${i + 1}`}
                    </span>
                    <span className="font-pixel text-[11px]" style={{ color: NEON.green }}>{formatTime(r.ms)}</span>
                    <span className="text-xs text-muted-foreground">{r.date}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Tutorial() {
  const steps = [
    { icon: '🎯', t: 'Цель', d: 'Сделай так, чтобы каждая из 6 граней была одного цвета.' },
    { icon: '🔀', t: 'Перемешать', d: 'Нажми «Перемешать», чтобы запутать кубик и начать вызов.' },
    { icon: '↻', t: 'Поворот по часовой', d: 'Кнопка вида «R ↻» крутит грань по часовой стрелке.' },
    { icon: '↺', t: 'Поворот против', d: 'Кнопка «R\' ↺» крутит ту же грань в обратную сторону.' },
    { icon: '⏱', t: 'Таймер', d: 'Время запускается с первого хода и останавливается, когда кубик собран.' },
    { icon: '🏆', t: 'Рекорды', d: 'Лучшее время сохраняется автоматически для каждого размера.' },
  ];
  return (
    <div className="animate-fade-in">
      <h2 className="font-pixel text-xl text-center mb-8" style={{ color: NEON.cyan }}>📖 КАК ИГРАТЬ</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {steps.map((s, i) => (
          <div
            key={i}
            className="rounded-lg border-2 p-4 bg-card/50 backdrop-blur flex gap-4 items-start"
            style={{ borderColor: NEON.purple, animationDelay: `${i * 80}ms` }}
          >
            <span className="text-3xl">{s.icon}</span>
            <div>
              <p className="font-pixel text-[11px] mb-2" style={{ color: NEON.yellow }}>{s.t}</p>
              <p className="text-sm text-muted-foreground">{s.d}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 text-center">
        <p className="font-pixel text-[9px] mb-3" style={{ color: NEON.green }}>ОБОЗНАЧЕНИЯ ГРАНЕЙ</p>
        <div className="flex flex-wrap justify-center gap-3">
          {(Object.keys(FACE_NAMES) as Face[]).map((f) => (
            <div key={f} className="flex items-center gap-2">
              <div className="w-5 h-5 rounded" style={{ background: FACE_COLORS[f] }} />
              <span className="text-xs text-muted-foreground">{f} — {FACE_NAMES[f]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Settings({
  soundOn,
  setSoundOn,
  size,
  setSize,
}: {
  soundOn: boolean;
  setSoundOn: (b: boolean) => void;
  size: number;
  setSize: (n: number) => void;
}) {
  return (
    <div className="animate-fade-in max-w-md mx-auto">
      <h2 className="font-pixel text-xl text-center mb-8" style={{ color: NEON.purple }}>⚙ НАСТРОЙКИ</h2>

      <div className="rounded-lg border-2 p-5 bg-card/50 backdrop-blur mb-5" style={{ borderColor: NEON.cyan }}>
        <div className="flex items-center justify-between">
          <span className="font-pixel text-[11px]" style={{ color: NEON.cyan }}>🔊 ЗВУК</span>
          <button
            onClick={() => setSoundOn(!soundOn)}
            className="font-pixel text-[10px] px-4 py-2 rounded border-2 transition-transform hover:scale-105"
            style={{
              borderColor: soundOn ? NEON.green : 'hsl(0 90% 60%)',
              color: soundOn ? NEON.green : 'hsl(0 90% 60%)',
            }}
          >
            {soundOn ? 'ВКЛ' : 'ВЫКЛ'}
          </button>
        </div>
      </div>

      <div className="rounded-lg border-2 p-5 bg-card/50 backdrop-blur" style={{ borderColor: NEON.yellow }}>
        <p className="font-pixel text-[11px] mb-4" style={{ color: NEON.yellow }}>🎲 РАЗМЕР ПО УМОЛЧАНИЮ</p>
        <div className="grid grid-cols-4 gap-2">
          {SIZES.map((n) => (
            <button
              key={n}
              onClick={() => setSize(n)}
              className="font-pixel text-xs py-3 rounded border-2 transition-transform hover:scale-105"
              style={{
                borderColor: size === n ? NEON.green : 'hsl(258 40% 30%)',
                color: size === n ? NEON.green : 'hsl(270 25% 70%)',
              }}
            >
              {n}×{n}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function About() {
  return (
    <div className="animate-fade-in max-w-lg mx-auto text-center">
      <h2 className="font-pixel text-xl mb-6" style={{ color: NEON.orange }}>ℹ ОБ ИГРЕ</h2>
      <div className="rounded-lg border-2 p-6 bg-card/50 backdrop-blur space-y-4" style={{ borderColor: NEON.orange }}>
        <div className="flex justify-center gap-1 mb-2">
          {[NEON.pink, NEON.cyan, NEON.yellow, NEON.green, NEON.purple].map((c, i) => (
            <div key={i} className="w-6 h-6 rounded animate-float" style={{ background: c, animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
        <p className="font-pixel text-sm" style={{ color: NEON.yellow }}>CUBE QUEST v1.0</p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Аркадная головоломка-кубик Рубика с поддержкой размеров от 2×2 до 5×5,
          встроенным таймером и таблицей рекордов. Вдохновлено классическими
          ретро-играми 80-х.
        </p>
        <div className="pt-2 border-t" style={{ borderColor: 'hsl(258 40% 30%)' }}>
          <p className="font-pixel text-[9px] text-muted-foreground">РАЗРАБОТКА</p>
          <p className="text-sm mt-1" style={{ color: NEON.cyan }}>Сделано с любовью на poehali.dev 🚀</p>
        </div>
      </div>
    </div>
  );
}

export default Index;