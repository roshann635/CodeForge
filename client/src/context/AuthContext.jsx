import React, { createContext, useState, useEffect } from "react";
import API_BASE from "../config/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    localStorage.getItem("codeforge_token") || null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        const savedRole = localStorage.getItem("codeforge_role") || "STUDENT";
        setUser({
          id: decoded.id,
          email: localStorage.getItem("codeforge_email") || "user@example.com",
          name: localStorage.getItem("codeforge_name") || "Operator",
          role: savedRole,
          department: localStorage.getItem("codeforge_dept") || "CSE",
        });
      } catch (e) {
        setToken(null);
        localStorage.removeItem("codeforge_token");
        localStorage.removeItem("codeforge_role");
      }
    }
    setLoading(false);
  }, [token]);

  const saveUserData = (data) => {
    setToken(data.token);
    setUser({
      id: data._id,
      email: data.email,
      name: data.name,
      role: data.role || "STUDENT",
      department: data.department || "CSE",
    });
    localStorage.setItem("codeforge_token", data.token);
    localStorage.setItem("codeforge_email", data.email);
    localStorage.setItem("codeforge_name", data.name);
    localStorage.setItem("codeforge_role", data.role || "STUDENT");
    if (data.department) localStorage.setItem("codeforge_dept", data.department);
  };

  const fetchWithTimeout = async (url, options = {}, timeoutMs = 15000) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timer);
      return res;
    } catch (err) {
      clearTimeout(timer);
      if (err.name === "AbortError") {
        throw new Error("Request timed out. Please check your network connection and try again.");
      }
      throw err;
    }
  };

  const login = async (email, password) => {
    const res = await fetchWithTimeout(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    saveUserData(data);
    return data;
  };

  const adminLogin = async (email, password, adminKey) => {
    const res = await fetchWithTimeout(`${API_BASE}/api/auth/admin-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, adminKey }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    saveUserData(data);
    return data;
  };

  const register = async (name, email, password, role = "STUDENT", department = "CSE") => {
    const res = await fetchWithTimeout(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role, department }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    return data;
  };

  const verifyRegistration = async (email, otp) => {
    const res = await fetchWithTimeout(`${API_BASE}/api/auth/verify-registration`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    saveUserData(data);
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("codeforge_token");
    localStorage.removeItem("codeforge_email");
    localStorage.removeItem("codeforge_name");
    localStorage.removeItem("codeforge_role");
    localStorage.removeItem("codeforge_dept");
  };

  const isAdmin = user?.role === "ADMIN";
  const isFaculty = user?.role === "FACULTY" || user?.role === "ADMIN";
  const isStudent = user?.role === "STUDENT" || !user?.role;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        adminLogin,
        register,
        verifyRegistration,
        logout,
        isAdmin,
        isFaculty,
        isStudent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
