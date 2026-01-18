import { useState, useMemo } from "react";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LuMail, LuLock, LuShieldCheck, LuLoader, LuArrowRight, LuTriangle, LuEye, LuEyeOff } from "react-icons/lu";

// --- GRAPHQL ---
const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      accessToken
      user {
        id
        name
      }
    }
  }
`;

type RegisterPayload = {
  register: {
    accessToken: string;
    user: { id: number; name: string };
  };
};

type RegisterVars = {
  input: { name: string; password: string };
};

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const [doRegister, { loading, error }] = useMutation<RegisterPayload, RegisterVars>(REGISTER);

  // --- LOGIQUE FORCE DU MOT DE PASSE ---
  const strength = useMemo(() => {
    if (!password) return 0;
    let s = 0;
    if (password.length > 6) s += 1;
    if (password.length > 10) s += 1;
    if (/[A-Z]/.test(password)) s += 1;
    if (/[0-9]/.test(password)) s += 1;
    if (/[^A-Za-z0-9]/.test(password)) s += 1;
    return s; // Max 5
  }, [password]);

  const strengthColor = ["bg-zinc-800", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-emerald-500", "bg-cyan-500"][strength];
  const strengthText = ["Empty", "Weak", "Fair", "Good", "Strong", "Unbreakable"][strength];

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocalError(null);
    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setLocalError("Passwords do not match.");
      return;
    }

    try {
      const res = await doRegister({ variables: { input: { name, password } } });
      const payload = res.data?.register;
      if (payload?.accessToken) {
        localStorage.setItem("token", payload.accessToken);
        localStorage.setItem("username", payload.user.name);
        const from = (location.state as any)?.from ?? "/";
        navigate(from, { replace: true });
      }
    } catch (err) {}
  }

  const displayedError = localError ?? error?.message ?? null;

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#09090b] overflow-hidden font-sans">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-purple-900/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-blue-900/20 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md p-6">
        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 backdrop-blur-xl shadow-2xl p-8">
          
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Create Account</h1>
            <p className="text-zinc-400 text-sm">Join the game and start your journey.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 ml-1">Username / Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none z-10">
                  <LuMail className="text-lg" />
                </div>
                <input
                  className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-indigo-500/50 focus:bg-indigo-500/5 focus:ring-1 focus:ring-indigo-500/50"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your identifier"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none z-10">
                  <LuLock className="text-lg" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-11 pr-12 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-indigo-500/50 focus:bg-indigo-500/5 focus:ring-1 focus:ring-indigo-500/50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 !bg-transparent !border-none !shadow-none !outline-none !p-1 text-zinc-500 hover:text-white transition-colors cursor-pointer z-20"
                  style={{ background: 'transparent' }}
                >
                  {showPassword ? <LuEyeOff className="text-lg" /> : <LuEye className="text-lg" />}
                </button>
              </div>
              
              {/* STRENGTH BAR */}
              <div className="px-1 pt-1">
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex gap-1 h-1 w-full max-w-[120px]">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div 
                        key={level} 
                        className={`h-full w-full rounded-full transition-all duration-500 ${level <= strength ? strengthColor : "bg-zinc-800"}`} 
                      />
                    ))}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-tight ${password ? 'opacity-100' : 'opacity-0'} transition-opacity`} style={{ color: strength > 0 ? 'inherit' : '#52525b' }}>
                    {strengthText}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 ml-1">Confirm Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none z-10">
                  <LuShieldCheck className="text-lg" />
                </div>
                <input
                  type={showConfirm ? "text" : "password"}
                  className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-11 pr-12 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-indigo-500/50 focus:bg-indigo-500/5 focus:ring-1 focus:ring-indigo-500/50"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 !bg-transparent !border-none !shadow-none !outline-none !p-1 text-zinc-500 hover:text-white transition-colors cursor-pointer z-20"
                  style={{ background: 'transparent' }}
                >
                  {showConfirm ? <LuEyeOff className="text-lg" /> : <LuEye className="text-lg" />}
                </button>
              </div>
            </div>

            {displayedError && (
              <div className="flex items-center gap-3 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-red-400 text-sm animate-in slide-in-from-top-1">
                <LuTriangle className="shrink-0" />
                <span>{displayedError}</span>
              </div>
            )}

            <button
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
            >
              {loading ? <LuLoader className="animate-spin text-lg" /> : <><span>Get Started</span><LuArrowRight /></>}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-zinc-500">
            Already have an account? <Link className="font-medium text-white hover:text-indigo-400 transition-colors" to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}