import { motion } from "framer-motion";
import { Play, LogIn, Zap, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

const icons = {
  player: "📍",
  car: "🚗",
  drone: "🚁",
  trap: "🌪️",
  tree: "🌳",
  empty: "",
} as const;

type CellType = keyof typeof icons;

const mockGrid: CellType[][] = [
  ["car", "empty", "empty", "drone", "empty", "empty", "empty", "empty"],
  ["empty", "tree", "empty", "empty", "tree", "trap", "empty", "empty"],
  ["empty", "empty", "drone", "trap", "empty", "empty", "drone", "empty"],
  ["car", "empty", "empty", "empty", "car", "empty", "empty", "empty"],
  ["empty", "empty", "trap", "empty", "empty", "empty", "tree", "empty"],
  ["tree", "car", "empty", "tree", "empty", "trap", "empty", "empty"],
  ["empty", "empty", "empty", "trap", "empty", "empty", "empty", "empty"],
  ["empty", "empty", "empty", "empty", "empty", "player", "empty", "tree"],
];


export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-[#020205] text-white selection:bg-purple-500/30 font-sans overflow-hidden">
      {/* Overlay Scanlines */}
      <div className="absolute inset-0 pointer-events-none z-50 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

      {/* Background Glows */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
      </div>

    {/* Hero */}
      <main className="relative z-10 max-w-7xl mx-auto px-10 pt-10 pb-32 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
            <Zap size={12} fill="currentColor" /> Season 1 Available
          </div>

          <h1 className="text-6xl lg:text-7xl font-black leading-[0.9] mb-8 tracking-tighter uppercase italic">
            Master the art of{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-purple-500/40">
              evasion.
            </span>
          </h1>

          <p className="text-zinc-400 text-lg mb-10 max-w-md leading-relaxed font-medium">
            A grid-based tactical strategy game where every move counts. Avoid traps, collect your 
            targets and escape the trail.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="group relative flex items-center justify-center gap-3 px-8 py-4 bg-white text-black rounded-xl font-black text-sm uppercase tracking-widest transition-all hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] active:scale-95"
            >
              <LogIn size={18} strokeWidth={3} />
              Join the Elite
            </button>

            <button
              type="button"
              onClick={() => navigate("/demo")}
              className="flex items-center justify-center gap-3 px-8 py-4 bg-transparent hover:bg-white/5 border border-white/20 rounded-xl font-black text-sm uppercase tracking-widest transition-all text-purple-500"
            >
              <Play size={18} fill="currentColor" />
              Quick Play
            </button>
          </div>

          <div className="mt-12 flex items-center gap-4">
            <div className="flex -space-x-3">
              {["JD", "AL", "MX"].map((initials) => (
                <div
                  key={initials}
                  className="w-9 h-9 rounded-full border-2 border-[#020205] bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400"
                >
                  {initials}
                </div>
              ))}
            </div>
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
              Join operators online
            </span>
          </div>
        </motion.div>

        {/* Grid mock */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative">
          <div className="relative rounded-[2.5rem] border border-white/5 bg-[#0a0a0c] p-6 shadow-2xl overflow-hidden group">
            <div className="grid grid-cols-8 gap-1 bg-[#050507] p-2 rounded-xl border border-white/5 aspect-square relative">
              <div
                className="absolute inset-0 opacity-[0.05]"
                style={{
                  backgroundImage:
                    "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
                  backgroundSize: "12.5% 12.5%",
                }}
              />

              {mockGrid.flat().map((cell, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-center text-xl sm:text-2xl relative z-10 transition-transform hover:scale-125 cursor-default select-none"
                >
                  {icons[cell]}
                </div>
              ))}
            </div>

            <div className="absolute top-10 left-10 z-20 flex items-center gap-3 bg-black/80 px-4 py-2 rounded-full border border-purple-500/30 backdrop-blur-md">
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              <span className="text-[10px] font-mono font-bold text-purple-400 tracking-tighter uppercase">
                LIVE_FEED: AREA_42
              </span>
            </div>

            {/* ✅ Score mis à 7 */}
            <div className="absolute bottom-10 left-10 z-20 bg-zinc-900/90 border border-white/10 p-4 rounded-2xl shadow-2xl flex items-center gap-4 backdrop-blur-xl">
              <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500">
                <Target size={20} />
              </div>
              <div>
                <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Max Score</p>
                <p className="text-lg font-black font-mono text-white">7</p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-10 flex justify-between items-center opacity-30">
          <span className="text-[10px] font-bold tracking-[0.4em] uppercase">Fast Gameplay</span>
          <div className="flex gap-8 text-[9px] font-bold uppercase tracking-widest">
            {/* ✅ Notion de classement supprimée */}
            <span>Instant Access</span>
            <span>No Install Required</span>
            <span>Web Optimized</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
