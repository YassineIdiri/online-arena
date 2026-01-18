import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { LuRefreshCw, LuTrophy, LuCircle, LuMinus, LuHistory } from "react-icons/lu";

// --- LOGIQUE TECHNIQUE INCHANGÉE ---

const ME = gql`
  query Me {
    myStats {
      wins
      draws
      losses
    }
    myHistory {
      id
      result
      score
      playedAt
    }
  }
`;

type Result = "win" | "draw" | "lose";

type MeQueryData = {
  myStats: {
    wins: number;
    draws: number;
    losses: number;
  };
  myHistory: Array<{
    id: number;
    result: Result;
    score: number;
    playedAt: string;
  }>;
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Mise à jour des styles des badges pour le Dark Mode
function badge(result: Result) {
  if (result === "win")
    return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]";
  if (result === "draw")
    return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
  return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
}

// --- COMPOSANT UI ---

export default function ProfilePage() {
  const username = localStorage.getItem("username") ?? "Player";
  const avatar = (username[0] ?? "P").toUpperCase();

  const { data, loading, error, refetch } = useQuery<MeQueryData>(ME, {
    fetchPolicy: "cache-and-network",
  });

  // LOADING STATE
  if (loading && !data) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#09090b] text-slate-200">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-500/30 border-t-purple-500" />
          <p className="animate-pulse font-mono text-xs uppercase tracking-widest text-purple-400">
            Accessing Archives...
          </p>
        </div>
      </div>
    );
  }

  // ERROR STATE
  if (error) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#09090b] p-6">
        <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-red-950/10 p-8 backdrop-blur-md">
          <div className="flex items-center gap-3 text-red-500">
            <LuCircle className="text-3xl" />
            <h1 className="text-xl font-black uppercase tracking-wider">System Failure</h1>
          </div>
          <p className="mt-4 font-mono text-sm text-red-300/80">{error.message}</p>
          <button
            className="mt-6 w-full rounded-lg bg-red-500/10 border border-red-500/50 px-4 py-3 text-sm font-bold text-red-400 hover:bg-red-500 hover:text-white transition-all"
            onClick={() => refetch()}
          >
            RETRY CONNECTION
          </button>
        </div>
      </div>
    );
  }

  const stats = data?.myStats;
  const history = data?.myHistory ?? [];

  return (
    <div className="min-h-screen bg-[#09090b] text-slate-200 font-sans pt-20 pb-10 relative overflow-hidden">
      
      {/* Background Ambiances */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#2e1065_0%,transparent_40%)] opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 md:px-6">
        
        {/* HEADER SECTION */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl md:p-8">
          <div className="flex flex-col items-center text-center md:flex-row md:items-center md:text-left gap-6">
            
            {/* Avatar */}
            <div className="relative group">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 opacity-75 blur transition duration-500 group-hover:opacity-100" />
              <div className="relative grid h-20 w-20 place-items-center rounded-full bg-[#111] text-3xl font-black text-white ring-4 ring-[#09090b]">
                {avatar}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 flex flex-col items-center md:items-start">
               <div className="flex items-center justify-center md:justify-start gap-3">
                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
                  {username}
                </h1>
                
              </div>
              <p className="mt-1 font-mono text-sm text-slate-500">
               <span className="rounded-full bg-purple-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-purple-400 border border-purple-500/20">
                  Operative
                </span>
              </p>
            </div>
          </div>

          {/* STATS GRID */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard 
              label="Victories" 
              value={stats?.wins ?? 0} 
              icon={<LuTrophy />} 
              color="emerald" 
            />
            <StatCard 
              label="Draws" 
              value={stats?.draws ?? 0} 
              icon={<LuMinus />} 
              color="amber" 
            />
            <StatCard 
              label="Defeats" 
              value={stats?.losses ?? 0} 
              icon={<LuCircle />} 
              color="rose" 
            />
          </div>
        </div>

        {/* HISTORY SECTION */}
        <div className="mt-8">
          <div className="flex items-center gap-3 mb-4 px-2">
            <LuHistory className="text-purple-500 text-xl" />
            <h2 className="text-lg font-bold uppercase tracking-widest text-slate-300">Mission Log</h2>
            <div className="h-px flex-1 bg-white/10" />
            <span className="font-mono text-xs text-slate-500">{history.length} ENTRIES</span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f12]/80 backdrop-blur-md shadow-xl">
            {/* Table Header */}
            <div className="grid grid-cols-3 border-b border-white/5 bg-white/[0.02] px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
              <div>Outcome</div>
              <div className="text-center">Threats Neutralized</div>
              <div className="text-right">Timestamp</div>
            </div>

            {/* Table Body */}
            <div className="max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-600 gap-2">
                  <LuHistory className="text-3xl opacity-20" />
                  <p className="text-sm font-mono">No mission data recorded.</p>
                </div>
              ) : (
                history.map((g) => (
                  <div
                    key={g.id}
                    className="group grid grid-cols-3 items-center border-b border-white/5 px-6 py-4 transition-colors hover:bg-white/[0.03]"
                  >
                    <div>
                      <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${badge(g.result)}`}>
                        {g.result === "win" && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                        {g.result}
                      </span>
                    </div>
                    
                    <div className="text-center">
                      <span className="font-mono text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
                        {g.score}
                      </span>
                    </div>
                    
                    <div className="text-right">
                      <span className="font-mono text-xs text-slate-500 group-hover:text-slate-400">
                        {formatDate(g.playedAt)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Petit composant interne pour les cartes de stats pour éviter la répétition
function StatCard({ label, value, icon, color }: { label: string, value: number, icon: React.ReactNode, color: "emerald" | "amber" | "rose" }) {
  const colors = {
    emerald: "from-emerald-500/20 to-emerald-900/10 border-emerald-500/20 text-emerald-400 shadow-emerald-500/10",
    amber: "from-amber-500/20 to-amber-900/10 border-amber-500/20 text-amber-400 shadow-amber-500/10",
    rose: "from-rose-500/20 to-rose-900/10 border-rose-500/20 text-rose-400 shadow-rose-500/10",
  };

  return (
    <div className={`relative overflow-hidden rounded-xl border bg-gradient-to-br p-4 shadow-lg transition-all hover:scale-[1.02] ${colors[color]}`}>
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">{label}</p>
          <p className="mt-1 text-4xl font-black tracking-tighter text-white">{value}</p>
        </div>
        <div className={`rounded-lg bg-white/5 p-3 text-2xl backdrop-blur-sm ${colors[color].split(" ")[2]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}