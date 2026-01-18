import { Link, NavLink, useNavigate } from "react-router-dom";
import { IoGameControllerOutline, IoLogOutOutline } from "react-icons/io5";
import { AiOutlineProfile } from "react-icons/ai";

// Fonction utilitaire pour le style des liens de nav
function cx({ isActive }: { isActive: boolean }) {
  return [
    "group flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all duration-300",
    isActive
      ? "bg-purple-500/10 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.1)] ring-1 ring-purple-500/20"
      : "text-slate-400 hover:text-white hover:bg-white/5",
  ].join(" ");
}

export default function Header() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");

  function logout() {
    // Auth
    localStorage.removeItem("token");
    localStorage.removeItem("username");

    // Nettoyage des données de jeu
    localStorage.removeItem("grid");
    localStorage.removeItem("score");
    localStorage.removeItem("endGame");
    localStorage.removeItem("connexion");
    localStorage.removeItem("moving");
    localStorage.removeItem("message");
    localStorage.removeItem("modalOpen");

    navigate("/login", { replace: true });
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#09090b]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        
        {/* LOGO AREA */}
        <Link
          to="/"
          className="flex items-center gap-2 group"
        >
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-lg transition-transform group-hover:scale-105">
            <IoGameControllerOutline className="text-xl" />
          </div>
          <span className="hidden sm:block text-lg font-black tracking-tighter text-white uppercase italic">
            Thieves<span className="text-purple-500">Trail</span>
          </span>
        </Link>

        {/* NAVIGATION */}
        <nav className="flex items-center gap-1 sm:gap-2 bg-white/5 rounded-full p-1 border border-white/5">
          <NavLink to="/" className={(p) => cx(p)}>
            <IoGameControllerOutline className="text-lg" />
            <span className="hidden sm:block">Arena</span>
          </NavLink>

          <NavLink to="/profile" className={(p) => cx(p)}>
            <AiOutlineProfile className="text-lg" />
            <span className="hidden sm:block">Profile</span>
          </NavLink>
        </nav>

        {/* USER / AUTH ACTIONS */}
        <div className="flex items-center gap-4">
          {token ? (
            <div className="flex items-center gap-4">
              {/* User Badge */}
              <div className="hidden md:flex flex-col items-end">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Operator
                </span>
                <span className="font-mono text-sm font-bold text-white">
                  {username || "Unknown"}
                </span>
              </div>

              {/* Separator */}
              <div className="hidden md:block h-8 w-px bg-white/10" />

              {/* Logout Button */}
            <button
              onClick={logout}
              className="!p-2 leading-none group flex items-center gap-2 rounded-lg border border-white/10 bg-gradient-to-br from-purple-600 to-blue-600 text-xs font-bold uppercase tracking-wide text-slate-300 transition-all hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 active:scale-95"
            >
              <span className="hidden md:flex">Logout</span>
              <IoLogOutOutline className="text-lg leading-none transition-transform group-hover:translate-x-1" />
            </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="relative overflow-hidden rounded-full bg-white px-5 py-2 font-bold text-black transition-transform hover:scale-105 active:scale-95"
            >
              <span className="relative z-10 text-sm">Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}