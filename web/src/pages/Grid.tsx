// src/pages/Grid.tsx
import { useEffect, useRef, useState } from "react";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import Cell from "../components/Cell";
import type { CellType } from "../components/Cell";

// --- GraphQL ---
const CREATE_GAME = gql`
  mutation CreateGame($input: CreateGameInput!) {
    createGame(input: $input) {
      id
      result
      score
      playedAt
    }
  }
`;

type Result = "win" | "draw" | "lose";

type CreateGamePayload = {
  createGame: { id: number; result: Result; score: number; playedAt: string };
};

type CreateGameVars = {
  input: { result: Result; score: number };
};

// --- Grid data ---
const DEFAULT_GRID: CellType[][] = [
  ["car", "-", "-", "drone", "-", "-", "-", "-"],
  ["-", "tree", "-", "-", "tree", "trap", "-", "-"],
  ["-", "-", "drone", "trap", "-", "-", "drone", "-"],
  ["car", "-", "-", "-", "car", "-", "-", "-"],
  ["-", "-", "trap", "-", "-", "-", "tree", "-"],
  ["tree", "car", "-", "tree", "-", "trap", "-", "-"],
  ["-", "-", "-", "trap", "-", "-", "-", "-"],
  ["-", "-", "-", "-", "-", "-", "player", "tree"],
];

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

function findPlayer(grid: CellType[][]) {
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c] === "player") return { r, c };
    }
  }
  return { r: 0, c: 0 };
}

function findEnemies(grid: CellType[][]) {
  const enemies: Array<{ type: "drone" | "car"; r: number; c: number }> = [];
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      const t = grid[r][c];
      if (t === "drone" || t === "car") enemies.push({ type: t, r, c });
    }
  }
  return enemies;
}

function isBlocked(t: CellType) {
  return t === "tree" || t === "drone" || t === "car";
}

function inBounds(grid: CellType[][], r: number, c: number) {
  return r >= 0 && c >= 0 && r < grid.length && c < grid[0].length;
}

type GridProps = { demo?: boolean };

export default function Grid({ demo = false }: GridProps) {
  // Persist local state (OK for demo too)
  const [grid, setGrid] = useState<CellType[][]>(() => load("grid", DEFAULT_GRID));
  const [moving, setMoving] = useState<boolean>(() => load("moving", false));
  const [message, setMessage] = useState<string>(() => load("message", "Ready for play"));
  const [score, setScore] = useState<number>(() => load("score", 0));
  const [endGame, setEndGame] = useState<boolean>(() => load("endGame", false));
  const [modalOpen, setModalOpen] = useState<boolean>(() => load("modalOpen", false));

  const endRef = useRef(endGame);
  const scoreRef = useRef(score);

  useEffect(() => void (endRef.current = endGame), [endGame]);
  useEffect(() => void (scoreRef.current = score), [score]);

  // persist
  useEffect(() => save("grid", grid), [grid]);
  useEffect(() => save("score", score), [score]);
  useEffect(() => save("endGame", endGame), [endGame]);
  useEffect(() => save("message", message), [message]);
  useEffect(() => save("moving", moving), [moving]);
  useEffect(() => save("modalOpen", modalOpen), [modalOpen]);

  const [createGame] = useMutation<CreateGamePayload, CreateGameVars>(CREATE_GAME);

  // avoid double save in StrictMode
  const savedOnceRef = useRef(false);
  const resultRef = useRef<Result | null>(null);

  function openModal() {
    setModalOpen(true);
  }

  function finish(result: Result, text: string) {
    resultRef.current = result;
    setMessage(text);
    setEndGame(true);
    openModal();
  }

  async function saveResultOnce() {
    if (demo) return; // ✅ DEMO: no DB / no auth required
    if (savedOnceRef.current) return;
    savedOnceRef.current = true;

    const result: Result = resultRef.current ?? (message === "Game Over" ? "lose" : "win");

    try {
      await createGame({ variables: { input: { result, score: scoreRef.current } } });
    } catch (e) {
      console.error("createGame failed:", e);
    }
  }

  useEffect(() => {
    if (endGame) void saveResultOnce();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endGame]);

  function resetGame() {
    setGrid(DEFAULT_GRID);
    setMoving(false);
    setMessage("Ready for play");
    setScore(0);
    setEndGame(false);
    setModalOpen(false);
    savedOnceRef.current = false;
    resultRef.current = null;

    localStorage.removeItem("grid");
    localStorage.removeItem("score");
    localStorage.removeItem("endGame");
    localStorage.removeItem("message");
    localStorage.removeItem("moving");
    localStorage.removeItem("modalOpen");
  }

  function moveEnemiesTowardPlayer(current: CellType[][]) {
    const { r: pr, c: pc } = findPlayer(current);
    const enemies = findEnemies(current);
    let next = current.map((row) => [...row]) as CellType[][];

    setMoving(true);
    setMessage("Moving elements...");

    for (const e of enemies) {
      if (endRef.current) break;

      // re-find current position of this enemy in "next"
      let er = e.r;
      let ec = e.c;
      let found = false;
      for (let r = 0; r < next.length && !found; r++) {
        for (let c = 0; c < next[r].length && !found; c++) {
          if (next[r][c] === e.type) {
            er = r;
            ec = c;
            found = true;
          }
        }
      }

      const dr = pr === er ? 0 : pr > er ? 1 : -1;
      const dc = pc === ec ? 0 : pc > ec ? 1 : -1;

      const candidates: Array<[number, number]> =
        dc !== 0 ? [[er, ec + dc], [er + dr, ec]] : [[er + dr, ec], [er, ec + dc]];

      for (const [nr, nc] of candidates) {
        if (!inBounds(next, nr, nc)) continue;
        const target = next[nr][nc];
        if (isBlocked(target)) continue;

        if (target === "-") {
          next[nr][nc] = e.type;
          next[er][ec] = "-";
          break;
        }

        if (target === "player") {
          next[nr][nc] = e.type;
          next[er][ec] = "-";
          finish("lose", "Game Over");
          break;
        }

        if (target === "trap") {
          next[er][ec] = "-";
          setScore((s) => s + 1);
          break;
        }
      }
    }

    setGrid(next);

    setTimeout(() => {
      setMoving(false);
      if (!endRef.current) setMessage("Ready for play");

      if (!endRef.current && scoreRef.current >= 7) {
        finish("win", "You win");
      }
    }, 250);
  }

  function movePlayer(deltaR: number, deltaC: number) {
    if (moving || endGame) return;

    const { r, c } = findPlayer(grid);
    const nr = r + deltaR;
    const nc = c + deltaC;
    if (!inBounds(grid, nr, nc)) return;

    const next = grid.map((row) => [...row]) as CellType[][];
    if (next[nr][nc] !== "-") return;

    next[nr][nc] = "player";
    next[r][c] = "-";
    setGrid(next);

    moveEnemiesTowardPlayer(next);
  }

  // --- UI ---
  return (
    <div className="relative min-h-screen w-full bg-[#09090b] text-slate-200 overflow-hidden font-sans selection:bg-purple-500/30">
      {/* Background */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_0%,#2e1065_0%,transparent_50%)] opacity-40" />
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 md:py-12">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs text-white/60">Capture 7 thieves. Avoid getting caught.</p>
          </div>

          {demo && (
            <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-200">
              DEMO MODE (no save)
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* GAME */}
          <div className="lg:col-span-8 order-2 lg:order-1">
            <div className="relative rounded-3xl border border-white/10 bg-black/40 p-6 md:p-10 shadow-2xl backdrop-blur-xl">
              <div className="absolute top-0 left-0 h-8 w-8 border-t-2 border-l-2 border-purple-500/50 rounded-tl-2xl" />
              <div className="absolute top-0 right-0 h-8 w-8 border-t-2 border-r-2 border-purple-500/50 rounded-tr-2xl" />
              <div className="absolute bottom-0 left-0 h-8 w-8 border-b-2 border-l-2 border-purple-500/50 rounded-bl-2xl" />
              <div className="absolute bottom-0 right-0 h-8 w-8 border-b-2 border-r-2 border-purple-500/50 rounded-br-2xl" />

              <div className="flex justify-center overflow-x-auto">
                <div className="grid gap-2 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  {grid.map((row, r) => (
                    <div key={r} className="flex gap-2">
                      {row.map((cell, c) => (
                        <div key={`${r}-${c}`} className="relative">
                          <Cell type={cell} />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="lg:col-span-4 order-1 lg:order-2 flex flex-col gap-6">
            {/* SCORE */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-black p-6 border border-white/10 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  Target Acquisition
                </span>
                <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="flex items-end gap-3">
                <span className="text-6xl font-black text-white leading-none tracking-tight">{score}</span>
                <span className="mb-2 text-sm font-bold text-slate-500">/ 7 CAPTURED</span>
              </div>
              <div className="mt-4 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-out"
                  style={{ width: `${Math.min(100, (score / 7) * 100)}%` }}
                />
              </div>
            </div>

            {/* STATUS */}
            <div className="rounded-2xl bg-white/5 pb-6 pt-5 px-6 border border-white/10 backdrop-blur-sm">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">System Log</span>
              <div className="mt-2 flex items-center gap-3">
                <div className={`h-2 w-2 rounded-full ${moving ? "bg-orange-500 animate-ping" : "bg-blue-500"}`} />
                <span className={`font-mono text-sm font-bold ${moving ? "text-orange-400" : "text-blue-200"}`}>
                  {message.toUpperCase()}
                </span>
              </div>
            </div>

            {/* CONTROLS */}
            <div className="rounded-2xl bg-[#111] p-6 border border-white/5 shadow-inner">
              <div className="grid grid-cols-3 gap-3 max-w-[200px] mx-auto">
                <div />
                <button
                  onClick={() => movePlayer(-1, 0)}
                  disabled={moving || endGame}
                  className="aspect-square flex items-center justify-center rounded-xl bg-slate-800 border-b-4 border-slate-950 text-slate-300 hover:bg-purple-600 hover:text-white hover:border-purple-800 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ▲
                </button>
                <div />

                <button
                  onClick={() => movePlayer(0, -1)}
                  disabled={moving || endGame}
                  className="aspect-square flex items-center justify-center rounded-xl bg-slate-800 border-b-4 border-slate-950 text-slate-300 hover:bg-purple-600 hover:text-white hover:border-purple-800 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ◄
                </button>

                <div className="flex items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-slate-700" />
                </div>

                <button
                  onClick={() => movePlayer(0, 1)}
                  disabled={moving || endGame}
                  className="aspect-square flex items-center justify-center rounded-xl bg-slate-800 border-b-4 border-slate-950 text-slate-300 hover:bg-purple-600 hover:text-white hover:border-purple-800 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ►
                </button>

                <div />
                <button
                  onClick={() => movePlayer(1, 0)}
                  disabled={moving || endGame}
                  className="aspect-square flex items-center justify-center rounded-xl bg-slate-800 border-b-4 border-slate-950 text-slate-300 hover:bg-purple-600 hover:text-white hover:border-purple-800 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ▼
                </button>
                <div />
              </div>

              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  onClick={resetGame}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white hover:bg-white/10"
                >
                  RESET
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-[#0f0f15] shadow-2xl animate-in zoom-in-95 duration-300">
            <div className={`p-6 text-center ${message === "Game Over" ? "bg-red-500/10" : "bg-emerald-500/10"}`}>
              <div
                className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 ${
                  message === "Game Over" ? "border-red-500 text-red-500" : "border-emerald-500 text-emerald-500"
                }`}
              >
                {message === "Game Over" ? "✕" : "✓"}
              </div>
              <h2 className="text-2xl font-black uppercase text-white tracking-tight">
                {message === "Game Over" ? "Mission Failed" : "Mission Complete"}
              </h2>
            </div>

            <div className="p-6 space-y-6">
              <div className="rounded-xl bg-white/5 p-4 text-center border border-white/5">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Total Score</p>
                <p className="text-4xl font-black text-white mt-1">{score}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={resetGame}
                  className="rounded-xl bg-purple-600 py-3 text-sm font-bold text-black hover:bg-purple-500 transition-colors"
                >
                  RETRY
                </button>
                <button
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-white/10 bg-transparent py-3 text-sm font-bold text-white hover:bg-white/5 transition-colors"
                >
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

