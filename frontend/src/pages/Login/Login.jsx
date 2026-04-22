import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
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
      const apiUrl =
        import.meta.env.VITE_API_URL || "http://localhost:8003/api/v1";

      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

      const response = await fetch(`${apiUrl}/login/access-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      const data = await response.json();
      login(data.access_token);
      navigate(from, { replace: true });
    } catch (err) {
      setError("Usuario o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      {/* Grid background */}
      <div className="login-grid" />

      <div className="login-card">
        {/* Badge */}
        <div className="login-badge">
          <span className="badge-dot" />
          Admin Access
        </div>

        {/* Heading */}
        <h1 className="login-title">
          Admin <span>Gateway</span>
        </h1>
        <p className="login-subtitle">
          Sign in to manage your portfolio content
        </p>

        <div className="login-divider" />

        {/* Form */}
        <form className="login-form" onSubmit={handleSubmit}>
          {error && (
            <div className="login-error">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <div className="login-field">
            <label htmlFor="login-username">Username</label>
            <div className="login-input-wrapper">
              <div className="input-icon">
                <User size={16} />
              </div>
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

          <div className="login-field">
            <label htmlFor="login-password">Password</label>
            <div className="login-input-wrapper">
              <div className="input-icon">
                <Lock size={16} />
              </div>
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

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="btn-spinner" />
                Verifying...
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
        <div className="login-footer">
          <Lock size={12} />
          Protected area — unauthorized access is prohibited
        </div>
      </div>
    </div>
  );
}
