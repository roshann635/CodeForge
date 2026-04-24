import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Terminal, Mail, Lock, LogIn, UserPlus, KeyRound, ShieldAlert } from 'lucide-react';
import API_BASE from '../config/api';

export default function AuthPage() {
  const [mode, setMode] = useState('login'); // login | register | register-otp | forgot | otp | reset
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const { login, register, verifyRegistration } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        navigate('/profile');
      } else {
        const res = await register(name, email, password);
        setSuccessMsg(res.message || 'OTP sent to your secure link.');
        setMode('register-otp');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      await verifyRegistration(email, otp);
      navigate('/profile');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccessMsg('OTP sent to your secure link.');
      setMode('otp');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccessMsg('Identity verified. Provide new encryption key.');
      setMode('reset');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword: password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccessMsg('Encryption key updated successfully. System Link established.');
      setPassword('');
      setMode('login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => {
    if (mode === 'login' || mode === 'register') {
      return (
        <form onSubmit={handleAuthSubmit} className="space-y-5">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase tracking-wider">Full Name (Signature)</label>
              <div className="relative">
                <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-dark-900 border border-dark-600 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-neon-cyan/80 focus:ring-1 focus:ring-neon-cyan/50 transition-all font-mono text-sm" placeholder="Operator Name" />
              </div>
            </div>
          )}
          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase tracking-wider">Secure Email Link</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-dark-900 border border-dark-600 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-neon-cyan/80 focus:ring-1 focus:ring-neon-cyan/50 transition-all font-mono text-sm" placeholder="agent@codeforge.net" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase tracking-wider">Encryption Key (Password)</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full bg-dark-900 border border-dark-600 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-neon-purple/80 focus:ring-1 focus:ring-neon-purple/50 transition-all font-mono text-sm" placeholder="••••••••" />
            </div>
          </div>
          {mode === 'login' && (
            <div className="text-right">
               <button type="button" onClick={() => { setMode('forgot'); setError(''); setSuccessMsg(''); }} className="text-neon-cyan/70 hover:text-neon-cyan text-xs font-mono">Lost Encryption Key?</button>
            </div>
          )}
          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-neon-cyan to-neon-purple hover:opacity-90 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(0,243,255,0.4)] disabled:opacity-50">
            {loading ? <span className="font-mono uppercase tracking-wider">Authenticating...</span> : (
              <><span className="font-mono uppercase tracking-wider">{mode === 'login' ? "Inject Protocol" : "Forge Identity"}</span></>
            )}
          </button>
        </form>
      );
    }

    if (mode === 'forgot') {
      return (
        <form onSubmit={handleForgotSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase tracking-wider">Target Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-dark-900 border border-dark-600 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-neon-cyan/80 focus:ring-1 focus:ring-neon-cyan/50 transition-all font-mono text-sm" placeholder="agent@codeforge.net" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-neon-cyan/20 text-neon-cyan border border-neon-cyan hover:bg-neon-cyan hover:text-dark-900 font-bold py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(0,243,255,0.2)] disabled:opacity-50">
            {loading ? "Transmitting..." : "Send Verification Code"}
          </button>
          <button type="button" onClick={() => setMode('login')} className="w-full text-gray-400 text-xs hover:text-white font-mono mt-2">Abort & Return to Login</button>
        </form>
      );
    }

    if (mode === 'otp') {
      return (
        <form onSubmit={handleOtpSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase tracking-wider">6-Digit Access Code</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required maxLength={6} className="w-full bg-dark-900 border border-dark-600 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-neon-cyan/80 focus:ring-1 focus:ring-neon-cyan/50 transition-all font-mono text-center tracking-[0.5em] text-lg" placeholder="000000" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-neon-cyan/20 text-neon-cyan border border-neon-cyan hover:bg-neon-cyan hover:text-dark-900 font-bold py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(0,243,255,0.2)] disabled:opacity-50">
            {loading ? "Verifying..." : "Verify Code"}
          </button>
        </form>
      );
    }

    if (mode === 'register-otp') {
      return (
        <form onSubmit={handleRegisterOtpSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase tracking-wider">Registration Code</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required maxLength={6} className="w-full bg-dark-900 border border-dark-600 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-neon-cyan/80 focus:ring-1 focus:ring-neon-cyan/50 transition-all font-mono text-center tracking-[0.5em] text-lg" placeholder="000000" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-neon-cyan/20 text-neon-cyan border border-neon-cyan hover:bg-neon-cyan hover:text-dark-900 font-bold py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(0,243,255,0.2)] disabled:opacity-50">
            {loading ? "Verifying..." : "Complete Registration"}
          </button>
        </form>
      );
    }

    if (mode === 'reset') {
      return (
        <form onSubmit={handleResetSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase tracking-wider">New Encryption Key</label>
            <div className="relative">
              <ShieldAlert className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full bg-dark-900 border border-dark-600 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-neon-purple/80 focus:ring-1 focus:ring-neon-purple/50 transition-all font-mono text-sm" placeholder="New Password" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-neon-purple/20 text-neon-purple border border-neon-purple hover:bg-neon-purple hover:text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(188,19,254,0.2)] disabled:opacity-50">
            {loading ? "Updating..." : "Update Protocol"}
          </button>
        </form>
      );
    }
  };

  const titles = {
    login: "System Link Established",
    register: "Initialize New Hacker Protocol",
    'register-otp': "Verify Protocol Registration",
    forgot: "Protocol Reset Sequence",
    otp: "Verify Identity",
    reset: "Deploy New Keys"
  };

  const subtitles = {
    login: "Enter credentials to access the grid.",
    register: "Register signature to join the collective.",
    'register-otp': "Enter 6-digit signal sent to verify email.",
    forgot: "Transmit code to secure email link.",
    otp: "Enter 6-digit signal from your email.",
    reset: "Establish a new encryption password."
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
            {titles[mode]}
          </h1>
          <p className="text-gray-400 text-sm mt-2 font-mono text-center">
            {subtitles[mode]}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-sm text-center font-mono">
            ⚠️ {error}
          </div>
        )}
        
        {successMsg && (
          <div className="mb-6 p-4 bg-neon-green/10 border border-neon-green/50 rounded-xl text-neon-green text-sm text-center font-mono">
            ✅ {successMsg}
          </div>
        )}

        {renderForm()}

        {(mode === 'login' || mode === 'register') && (
          <div className="mt-8 pt-6 border-t border-dark-700/50 text-center">
            <p className="text-gray-400 text-sm">
              {mode === 'login' ? "Don't have an access key? " : "Already established link? "}
              <button
                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setSuccessMsg(''); }}
                className="text-neon-cyan hover:text-white font-bold transition-colors underline decoration-neon-cyan/30 underline-offset-4"
              >
                {mode === 'login' ? "Forge one here" : "Login instead"}
              </button>
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
