import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router";
import {
  clearStoredToken,
  getStoredToken,
  storeToken,
} from "@/features/auth/tokenStorage";

const AuthContext = createContext();

const API_BASE = import.meta.env.VITE_API_URL || "/api/v1";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  // El JWT solo lleva `sub`, que es el id numérico. El nombre para mostrar hay
  // que pedirlo aparte.
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = getStoredToken();
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken);
        // Check temporal validity
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        } else {
          setToken(storedToken);
          setUser(decoded);
        }
      } catch (err) {
        logout();
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!token) {
      setProfile(null);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const response = await fetch(`${API_BASE}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) return;
        const data = await response.json();
        if (!cancelled) setProfile(data);
      } catch {
        // Sin perfil la cabecera cae a "Admin". No merece desloguear a nadie.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = (newToken, remember = true) => {
    storeToken(newToken, remember);
    setToken(newToken);
    setUser(jwtDecode(newToken));
    // Optional: add navigation after login
  };

  const logout = () => {
    clearStoredToken();
    setToken(null);
    setUser(null);
    setProfile(null);
    navigate("/login"); 
  };

  return (
    // setProfile sale fuera para que la pantalla de foto de perfil actualice
    // la cabecera sin volver a pedir /users/me.
    <AuthContext.Provider value={{ token, user, profile, setProfile, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
