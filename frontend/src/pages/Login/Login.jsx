import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Lock, User, Shield, AlertCircle } from "lucide-react";

/* Login-specific animations can't be done with Tailwind alone */
const loginStyles = `
  @keyframes orbFloat {
    0%,100% { transform: translate(0,0) scale(1); }
    33%      { transform: translate(30px,-40px) scale(1.05); }
    66%      { transform: translate(-20px,20px) scale(0.95); }
  }
  @keyframes cardEntrance {
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes badgePulse {
    0%,100% { opacity: 1; }
    50%      { opacity: 0.4; }
  }
  @keyframes loginShake {
    0%,100% { transform: translateX(0); }
    20%     { transform: translateX(-6px); }
    40%     { transform: translateX(6px); }
    60%     { transform: translateX(-4px); }
    80%     { transform: translateX(4px); }
  }
  @keyframes btnSpin {
    to { transform: rotate(360deg); }
  }
  .login-orb-1 {
    position:absolute; width:600px; height:600px; border-radius:50%;
    background: radial-gradient(circle, rgba(99,37,255,0.18) 0%, transparent 70%);
    top:-150px; left:-100px; pointer-events:none;
    animation: orbFloat 8s ease-in-out infinite;
  }
  .login-orb-2 {
    position:absolute; width:500px; height:500px; border-radius:50%;
    background: radial-gradient(circle, rgba(255,137,6,0.13) 0%, transparent 70%);
    bottom:-100px; right:-80px; pointer-events:none;
    animation: orbFloat 10s ease-in-out infinite reverse;
  }
  .login-card {
    animation: cardEntrance 0.6s cubic-bezier(0.16,1,0.3,1) forwards;
    opacity: 0; transform: translateY(24px);
  }
  .badge-dot { animation: badgePulse 2s ease-in-out infinite; }
  .login-error { animation: loginShake 0.4s ease; }
  .btn-spinner {
    width:16px; height:16px; border:2px solid rgba(255,255,255,0.3);
    border-top-color:#fff; border-radius:50%;
    animation: btnSpin 0.7s linear infinite; display:inline-block;
  }
`;

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8003/api/v1";
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);
      const response = await fetch(`${apiUrl}/login/access-token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });
      if (!response.ok) throw new Error("Invalid credentials");
      const data = await response.json();
      login(data.access_token);
      navigate(from, { replace: true });
    } catch {
      setError("Usuario o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-[12px] py-3 pr-4 pl-11 text-white text-[0.9rem] font-[Inter,sans-serif] outline-none transition-all duration-[0.25s] placeholder:text-[rgba(255,255,255,0.2)] hover:border-[rgba(255,255,255,0.14)] hover:bg-[rgba(255,255,255,0.07)] focus:border-[rgba(99,37,255,0.6)] focus:bg-[rgba(99,37,255,0.06)] focus:shadow-[0_0_0_3px_rgba(99,37,255,0.15)]";

  return (
    <>
      <style>{loginStyles}</style>
      <div className="min-h-screen flex items-center justify-center bg-[#060610] relative overflow-hidden font-[Inter,sans-serif]">
        <div className="login-orb-1" />
        <div className="login-orb-2" />

        {/* Grid overlay */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)", backgroundSize: "50px 50px" }}
        />

        {/* Card */}
        <div className="login-card relative z-10 w-full max-w-[420px] mx-6 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[24px] px-10 py-12 backdrop-blur-[20px] shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_32px_64px_rgba(0,0,0,0.5),0_0_80px_rgba(99,37,255,0.06)]">

          {/* Badge */}
          <div className="inline-flex items-center gap-[6px] bg-[rgba(99,37,255,0.15)] border border-[rgba(99,37,255,0.3)] rounded-full px-3 py-1 text-[0.7rem] font-semibold tracking-[0.1em] uppercase text-[#a78bfa] mb-6">
            <span className="badge-dot w-[6px] h-[6px] rounded-full bg-[#a78bfa]" />
            Admin Access
          </div>

          <h1 className="text-[2rem] font-bold text-white leading-[1.15] mb-2 tracking-[-0.03em]">
            Admin{" "}
            <span style={{ background: "linear-gradient(135deg,#a78bfa 0%,#6325ff 50%,#ff8906 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Gateway
            </span>
          </h1>
          <p className="text-[0.875rem] text-[rgba(255,255,255,0.4)] mb-10 leading-relaxed">
            Sign in to manage your portfolio content
          </p>

          <div className="h-px bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.08)] to-transparent mb-8" />

          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            {error && (
              <div className="login-error flex items-center gap-2 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.25)] rounded-[10px] px-4 py-[0.625rem] text-[0.8rem] text-[#f87171]">
                <AlertCircle size={14} />{error}
              </div>
            )}

            {/* Username */}
            <div className="flex flex-col gap-2">
              <label htmlFor="login-username" className="text-[0.75rem] font-semibold tracking-[0.06em] uppercase text-[rgba(255,255,255,0.45)]">
                Username
              </label>
              <div className="relative">
                <div className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.25)] flex items-center pointer-events-none">
                  <User size={16} />
                </div>
                <input id="login-username" type="text" required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin" autoComplete="username" className={inputClass} />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label htmlFor="login-password" className="text-[0.75rem] font-semibold tracking-[0.06em] uppercase text-[rgba(255,255,255,0.45)]">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.25)] flex items-center pointer-events-none">
                  <Lock size={16} />
                </div>
                <input id="login-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" className={inputClass} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-[0.875rem] px-6 rounded-[12px] border-none bg-gradient-to-br from-[#6325ff] to-[#8b5cf6] text-white font-[Inter,sans-serif] text-[0.9rem] font-semibold tracking-[0.02em] cursor-pointer flex items-center justify-center gap-2 shadow-[0_4px_24px_rgba(99,37,255,0.35)] transition-all duration-200 hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_8px_32px_rgba(99,37,255,0.45)] active:enabled:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><span className="btn-spinner" />Verifying...</>
              ) : (
                <><Shield size={15} />Sign in</>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-[0.72rem] text-[rgba(255,255,255,0.2)] flex items-center justify-center gap-[6px]">
            <Lock size={12} />
            Protected area — unauthorized access is prohibited
          </div>
        </div>
      </div>
    </>
  );
}
