import { useState } from "react";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LuMail, LuLock, LuEye, LuEyeOff, LuLoader, LuTriangle } from "react-icons/lu";

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

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [doLogin, { loading, error }] = useMutation<LoginPayload, LoginVars>(LOGIN);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await doLogin({ variables: { input: { name: email, password } } });
      const payload = res.data?.login;
      
      if (payload?.accessToken) {
        localStorage.setItem("token", payload.accessToken);
        localStorage.setItem("username", payload.user.name);
        const from = (location.state as any)?.from ?? "/";
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#09090b] overflow-hidden font-sans">
      
      {/* Background FX */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-indigo-900/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-purple-900/20 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm p-6">
        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 backdrop-blur-xl shadow-2xl p-8">
          
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
              Welcome Back
            </h1>
            <p className="text-zinc-400 text-sm">Enter your credentials to access the board.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            
            {/* Username/Email Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 ml-1">
                Username or Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none z-10">
                  <LuMail className="text-lg" />
                </div>
                <input
                  type="text"
                  className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-indigo-500/50 focus:bg-indigo-500/5 focus:ring-1 focus:ring-indigo-500/50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your identifier"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Password
                </label>
                <Link to="/forgot-password" className="text-[10px] font-bold text-zinc-500 hover:text-indigo-400 transition-colors">
                  FORGOT?
                </Link>
              </div>
              
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none z-10">
                  <LuLock className="text-lg" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-11 pr-12 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-indigo-500/50 focus:bg-indigo-500/5 focus:ring-1 focus:ring-indigo-500/50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />

                {/* --- CORRECTION ULTRA-FORCÉE ICI --- */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 !bg-transparent !border-none !shadow-none !outline-none !p-1 text-zinc-500 hover:text-white transition-colors cursor-pointer z-20 flex items-center justify-center"
                  style={{ background: 'transparent', border: 'none' }} // Double sécurité inline
                >
                  {showPassword ? (
                    <LuEyeOff className="text-lg" />
                  ) : (
                    <LuEye className="text-lg" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-red-400 text-sm animate-in slide-in-from-top-1">
                <LuTriangle className="shrink-0" />
                <span>{error.message}</span>
              </div>
            )}

            <button
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] hover:shadow-indigo-500/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <LuLoader className="animate-spin text-lg" /> : "Sign In"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-zinc-500">
            New here?{" "}
            <Link 
              className="font-medium text-white hover:text-indigo-400 transition-colors" 
              to="/register"
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}