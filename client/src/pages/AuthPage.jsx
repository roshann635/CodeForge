import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Terminal, Mail, Lock, LogIn, UserPlus } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      navigate('/profile'); // User lands on profile to review their identity metrics first
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      {/* Background Blobs */}
      <div className="absolute top-[-100px] right-[-100px] w-96 h-96 bg-neon-cyan/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-100px] left-[-100px] w-96 h-96 bg-neon-purple/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="glass-panel w-full max-w-md p-8 relative z-10 border border-dark-700/50 shadow-[0_0_40px_rgba(0,243,255,0.1)]">

        <div className="flex flex-col items-center mb-8">
          <div className="bg-dark-800 p-4 rounded-2xl border border-dark-600 mb-4 shadow-[0_0_15px_#00f3ff44]">
            <Terminal className="text-neon-cyan w-10 h-10" />
          </div>
          <h1 className="text-2xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple text-glow-cyan text-center">
            {isLogin ? "System Link Established" : "Initialize New Hacker Protocol"}
          </h1>
          <p className="text-gray-400 text-sm mt-2 font-mono">
            {isLogin ? "Enter credentials to access the grid." : "Register signature to join the collective."}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-sm text-center font-mono">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase tracking-wider">Full Name (Signature)</label>
              <div className="relative">
                <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                  className="w-full bg-dark-900 border border-dark-600 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-neon-cyan/80 focus:ring-1 focus:ring-neon-cyan/50 transition-all font-mono text-sm"
                  placeholder="Roshan"
                />
              </div>
            </div>
          )}
          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase tracking-wider">Secure Email Link</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-dark-900 border border-dark-600 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-neon-cyan/80 focus:ring-1 focus:ring-neon-cyan/50 transition-all font-mono text-sm"
                placeholder="agent@codeforge.net"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase tracking-wider">Encryption Key (Password)</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-dark-900 border border-dark-600 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-neon-purple/80 focus:ring-1 focus:ring-neon-purple/50 transition-all font-mono text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-neon-cyan to-neon-purple hover:opacity-90 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(0,243,255,0.4)] disabled:opacity-50"
          >
            {loading ? (
              <span className="font-mono uppercase tracking-wider">Authenticating...</span>
            ) : (
              <>
                {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
                <span className="font-mono uppercase tracking-wider">{isLogin ? "Inject Protocol" : "Forge Identity"}</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-dark-700/50 text-center">
          <p className="text-gray-400 text-sm">
            {isLogin ? "Don't have an access key? " : "Already established link? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-neon-cyan hover:text-white font-bold transition-colors underline decoration-neon-cyan/30 underline-offset-4"
            >
              {isLogin ? "Forge one here" : "Login instead"}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}
