import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { Shield, Lock, Mail, Key, Terminal, ArrowRight, Eye, EyeOff } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminKey, setShowAdminKey] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { adminLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await adminLogin(email, password, adminKey);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.message || "Admin authentication failed.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-dark-900 border border-dark-700 rounded-2xl p-8 relative z-10 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-neon-purple/15 border border-neon-purple/50 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_15px_#b026ff44]">
            <Shield className="text-neon-purple" size={28} />
          </div>
          <h1 className="text-2xl font-orbitron font-bold text-white mb-2">
            CodeForge <span className="text-neon-purple">Faculty Portal</span>
          </h1>
          <p className="text-xs text-gray-400">Secure Access for Educators & System Administrators</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/40 rounded-xl text-xs text-red-400 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Faculty Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="faculty@college.edu"
                className="w-full bg-dark-800 border border-dark-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-neon-purple transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-dark-800 border border-dark-700 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-neon-purple transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Admin Passkey (Optional for first setup)</label>
            <div className="relative">
              <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input
                type={showAdminKey ? "text" : "password"}
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Key (Default: codeforge_admin_2026)"
                className="w-full bg-dark-800 border border-dark-700 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-neon-purple transition-all"
              />
              <button
                type="button"
                onClick={() => setShowAdminKey(!showAdminKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1"
                aria-label={showAdminKey ? "Hide passkey" : "Show passkey"}
              >
                {showAdminKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-neon-purple hover:bg-neon-purple/80 text-white font-bold py-3 rounded-xl shadow-[0_0_15px_#b026ff66] transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Access Faculty Console"}
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-dark-800 text-center">
          <button
            onClick={() => navigate("/login")}
            className="text-xs text-gray-400 hover:text-neon-cyan transition-colors"
          >
            Student? Switch to Student Login →
          </button>
        </div>
      </div>
    </div>
  );
}
