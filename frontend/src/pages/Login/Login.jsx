import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router";
import { Lock, User, Shield, AlertCircle } from "lucide-react";
import "./Login.scss";

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

  return (
    <div className="login">
      <div className="login__orb login__orb--1" />
      <div className="login__orb login__orb--2" />
      <div className="login__grid" />

      <div className="login__card">
        {/* Badge */}
        <div className="login__badge">
          <span className="login__badge-dot" />
          Admin Access
        </div>

        {/* Headline */}
        <h1 className="login__title">
          Admin <span className="login__title-gradient">Gateway</span>
        </h1>
        <p className="login__subtitle">Sign in to manage your portfolio content</p>

        <div className="login__divider" />

        {/* Form */}
        <form className="login__form" onSubmit={handleSubmit}>
          {error && (
            <div className="login__error">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          {/* Username */}
          <div className="login__field">
            <label htmlFor="login-username">Username</label>
            <div className="login__input-wrap">
              <span className="login__input-wrap-icon">
                <User size={16} />
              </span>
              <input
                id="login-username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                autoComplete="username"
              />
            </div>
          </div>

          {/* Password */}
          <div className="login__field">
            <label htmlFor="login-password">Password</label>
            <div className="login__input-wrap">
              <span className="login__input-wrap-icon">
                <Lock size={16} />
              </span>
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
          </div>

          {/* Submit */}
          <button type="submit" className="login__btn" disabled={loading}>
            {loading ? (
              <>
                <span className="login__btn-spinner" />
                Verifying…
              </>
            ) : (
              <>
                <Shield size={15} />
                Sign in
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="login__footer">
          <Lock size={11} />
          Protected area — unauthorized access is prohibited
        </div>
      </div>
    </div>
  );
}
