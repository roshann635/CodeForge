import React, { useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Terminal, Shield, Zap, Target } from 'lucide-react';

export default function LandingPage() {
  const { token, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already authenticated, drop them straight into their profile
    if (!loading && token) {
      navigate('/profile');
    }
  }, [token, loading, navigate]);

  if (loading) return null;

  return (
    <div className="min-h-screen w-full bg-dark-900 fixed inset-0 z-50 overflow-y-auto overflow-x-hidden pt-16 pb-24 md:pt-24 px-4 sm:px-6 md:px-12">
      {/* Background Blobs - positioned absolute to the scrolling container */}
      <div className="fixed top-[-50px] right-[-100px] w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-neon-cyan/10 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="fixed bottom-[-100px] left-[-100px] w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-neon-purple/10 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="text-center z-10 w-full max-w-[1200px] mx-auto flex flex-col items-center relative min-h-full">
        <div className="flex justify-center mb-8">
           <div className="bg-dark-800 p-6 rounded-3xl border border-dark-600 shadow-[0_0_30px_#00f3ff44]">
             <Terminal className="text-neon-cyan w-16 h-16" />
           </div>
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[6rem] leading-tight font-orbitron font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-white to-neon-purple mb-8 drop-shadow-[0_0_20px_#00f3ff55] tracking-tight">
          CODEFORGE
        </h1>
        <p className="text-base sm:text-lg md:text-2xl text-gray-300 font-mono mb-12 leading-relaxed max-w-3xl mx-auto opacity-90 px-4">
          The ultimate elite developer platform. Execute sandboxed code, battle on global leaderboards, and train your logic with real-time AI interview analytics.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-24 w-full max-w-md mx-auto px-4">
          <Link to="/login" className="w-full relative group cursor-crosshair">
            <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-xl blur opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative w-full px-8 py-5 sm:py-6 bg-dark-900/90 flex items-center justify-center rounded-xl border border-neon-cyan/50 text-white font-bold font-orbitron uppercase tracking-[0.2em] hover:bg-transparent transition-colors duration-300 shadow-[0_0_15px_rgba(0,243,255,0.4)]">
              Initialize Access
            </div>
          </Link>
        </div>

        {/* Features Section */}
        <div className="w-full max-w-[1200px] mx-auto px-4 mt-8 pb-12">
          <h2 className="text-center text-3xl md:text-4xl font-orbitron font-bold text-gray-100 mb-12 tracking-wider">
            Architecture Highlights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
             <div className="glass-panel p-8 md:p-10 border border-dark-600 bg-dark-800/60 hover:bg-dark-800/90 hover:border-neon-cyan/50 hover:shadow-[0_0_30px_#00f3ff22] transition-all duration-300 hover:-translate-y-2 group rounded-2xl">
               <div className="bg-neon-cyan/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6 border border-neon-cyan/30 group-hover:bg-neon-cyan/20 transition-colors">
                 <Shield className="text-neon-cyan w-7 h-7" />
               </div>
               <h3 className="text-white text-xl md:text-2xl font-bold mb-4 font-orbitron tracking-wide group-hover:text-neon-cyan transition-colors">Bulletproof Execution</h3>
               <p className="text-gray-400 text-sm md:text-base leading-relaxed">Powered by the Piston API, our sandboxed clusters guarantee 99.99% uptime for executing untrusted C++, Python, and JavaScript payloads with absolutely zero local system vulnerabilities or memory leaks.</p>
             </div>
             
             <div className="glass-panel p-8 md:p-10 border border-dark-600 bg-dark-800/60 hover:bg-dark-800/90 hover:border-neon-yellow/50 hover:shadow-[0_0_30px_#eab30822] transition-all duration-300 hover:-translate-y-2 group rounded-2xl">
               <div className="bg-neon-yellow/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6 border border-neon-yellow/30 group-hover:bg-neon-yellow/20 transition-colors">
                 <TrophyIcon className="text-neon-yellow w-7 h-7" />
               </div>
               <h3 className="text-white text-xl md:text-2xl font-bold mb-4 font-orbitron tracking-wide group-hover:text-neon-yellow transition-colors">Adaptive Gamification</h3>
               <p className="text-gray-400 text-sm md:text-base leading-relaxed">Our MongoDB-backed ecosystem scales dynamically to track exact XP progression, compute percentile global leaderboards, and award algorithmically verified badges seamlessly via aggressive polling.</p>
             </div>

             <div className="glass-panel p-8 md:p-10 border border-dark-600 bg-dark-800/60 hover:bg-dark-800/90 hover:border-neon-purple/50 hover:shadow-[0_0_30px_#a855f722] transition-all duration-300 hover:-translate-y-2 group rounded-2xl">
               <div className="bg-neon-purple/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6 border border-neon-purple/30 group-hover:bg-neon-purple/20 transition-colors">
                 <Zap className="text-neon-purple w-7 h-7" />
               </div>
               <h3 className="text-white text-xl md:text-2xl font-bold mb-4 font-orbitron tracking-wide group-hover:text-neon-purple transition-colors">Fail-Safe Logic Gates</h3>
               <p className="text-gray-400 text-sm md:text-base leading-relaxed">Interview audio is captured via rigorous native WebSpeech streams and piped reliably inside GPT-4o-mini. A strict fallback evaluation node protects user assessments during any external API latency.</p>
             </div>

             <div className="glass-panel p-8 md:p-10 border border-dark-600 bg-dark-800/60 hover:bg-dark-800/90 hover:border-neon-magenta/50 hover:shadow-[0_0_30px_#d946ef22] transition-all duration-300 hover:-translate-y-2 group rounded-2xl">
               <div className="bg-neon-magenta/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6 border border-neon-magenta/30 group-hover:bg-neon-magenta/20 transition-colors">
                 <Target className="text-neon-magenta w-7 h-7" />
               </div>
               <h3 className="text-white text-xl md:text-2xl font-bold mb-4 font-orbitron tracking-wide group-hover:text-neon-magenta transition-colors">Enterprise Security</h3>
               <p className="text-gray-400 text-sm md:text-base leading-relaxed">Every operator identity is scrubbed, encrypted, and structurally salted using industry-grade bcrypt routines. Pure stateless JWT authorization structures guarantee cross-session data integrity globally.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const TrophyIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
);
