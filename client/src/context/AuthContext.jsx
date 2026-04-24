import React, { createContext, useState, useEffect } from "react";
import API_BASE from "../config/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    localStorage.getItem("codeforge_token") || null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // Decode user from token or just fetch profile if API exists
      try {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        setUser({
          id: decoded.id,
          email: localStorage.getItem("codeforge_email") || "user@example.com",
          name: localStorage.getItem("codeforge_name") || "Operator",
        });
      } catch (e) {
        setToken(null);
        localStorage.removeItem("codeforge_token");
      }
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    setToken(data.token);
    setUser({ id: data._id, email: data.email, name: data.name });
    localStorage.setItem("codeforge_token", data.token);
    localStorage.setItem("codeforge_email", data.email);
    localStorage.setItem("codeforge_name", data.name);
    return data;
  };

  const register = async (name, email, password) => {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    return data;
  };

  const verifyRegistration = async (email, otp) => {
    const res = await fetch(`${API_BASE}/api/auth/verify-registration`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    setToken(data.token);
    setUser({ id: data._id, email: data.email, name: data.name });
    localStorage.setItem("codeforge_token", data.token);
    localStorage.setItem("codeforge_email", data.email);
    localStorage.setItem("codeforge_name", data.name);
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("codeforge_token");
    localStorage.removeItem("codeforge_email");
    localStorage.removeItem("codeforge_name");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, verifyRegistration, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
