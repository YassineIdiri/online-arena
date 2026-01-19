import { useState } from "react";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LuMail, LuLock, LuEye, LuEyeOff, LuLoader, LuTriangle, LuShieldCheck } from "react-icons/lu";
import { motion } from "framer-motion";

// --- GRAPHQL ---
const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      user {
        id
        name
      }
    }
  }
`;

type LoginPayload = {
  login: {
    accessToken: string;
    user: { id: number; name: string };
  };
};

type LoginVars = {
  input: { name: string; password: string };
};

type LocationState = { from?: string };

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [doLogin, { loading, error }] = useMutation<LoginPayload, LoginVars>(LOGIN);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const res = await doLogin({ variables: { input: { name: email, password } } });
      const payload = res.data?.login;

      if (payload?.accessToken) {
        localStorage.setItem("token", payload.accessToken);
        localStorage.setItem("username", payload.user.name);

        const from = (location.state as LocationState | null)?.from ?? "/";
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#020205] overflow-hidden font-sans selection:bg-purple-500/30">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(#ffffff 0.5px, transparent 0.5px)",
            backgroundSize: "30px 30px",
          }}
        />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md p-6">
        <div className="flex flex-col items-center mb-10">

          <h2 className="text-2xl font-black tracking-tighter text-white">
            THIEVES<span className="text-purple-500">TRAIL</span>{" "}
            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded ml-1 font-mono align-middle">v1.0</span>
          </h2>
        </div>

        <div className="rounded-3xl border border-white/5 bg-[#0a0a0c]/80 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-10">
          <div className="mb-10">
            <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-zinc-500 text-sm">Enter your credentials to access the game.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 ml-1">Identifier</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-600 group-focus-within:text-purple-500 transition-colors pointer-events-none">
                  <LuMail className="text-lg" />
                </div>
                <input
                  type="text"
                  className="w-full rounded-xl border border-white/5 bg-white/[0.03] py-4 pl-12 pr-4 text-sm text-white placeholder-zinc-700 outline-none transition-all focus:border-purple-500/50 focus:bg-purple-500/[0.02] focus:ring-1 focus:ring-purple-500/50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Username or Agent ID"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Encryption Key</label>
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-600 group-focus-within:text-purple-500 transition-colors pointer-events-none">
                  <LuLock className="text-lg" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full rounded-xl border border-white/5 bg-white/[0.03] py-4 pl-12 pr-12 text-sm text-white placeholder-zinc-700 outline-none transition-all focus:border-purple-500/50 focus:bg-purple-500/[0.02] focus:ring-1 focus:ring-purple-500/50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors"
                >
                  {showPassword ? <LuEyeOff size={18} /> : <LuEye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-xs">
                <LuTriangle size={16} />
                <span className="font-medium">{error.message}</span>
              </motion.div>
            )}

            <button
              disabled={loading}
              className="group relative w-full overflow-hidden rounded-xl bg-white text-black py-4 text-sm font-black uppercase tracking-widest transition-all hover:bg-purple-500 hover:text-white disabled:opacity-50"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? <LuLoader className="animate-spin text-lg" /> : <>ACCESS ARENA <LuShieldCheck /></>}
              </span>
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-white/5 text-center">
            <p className="text-sm text-zinc-600">
              New Operator?{" "}
              <Link className="font-bold text-white hover:text-purple-400 transition-colors" to="/register">
                Register Clearance
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-8 text-center text-[10px] text-zinc-700 uppercase tracking-widest font-medium">
          End-to-end encrypted connection • ThievesTrail Secure Node
        </p>
      </motion.div>
    </div>
  );
}

