import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem("admin_token");
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

  const login = (newToken) => {
    localStorage.setItem("admin_token", newToken);
    setToken(newToken);
    setUser(jwtDecode(newToken));
    // Optional: add navigation after login
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    setToken(null);
    setUser(null);
    navigate("/login"); 
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, loading }}>
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
