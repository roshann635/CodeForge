import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  Trophy,
  TrendingUp,
  Cpu,
  Activity,
  Flame,
  Medal,
  Award,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        // Fallback to empty shell if API isn't wired yet
        const res = await fetch("/api/progress", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.ok ? await res.json() : null;
        setProfileData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="p-8 text-neon-cyan font-mono animate-pulse">
        Loading Profile...
      </div>
    );
  }

  // Use real data or fallback visuals
  const stats = profileData?.progress || {
    problemsSolved: 0,
    placementReadiness: 0,
    accuracy: 100,
    weakAreas: ["No Data"],
  };

  const gamify = profileData?.gamification || {
    xp: 0,
    rankTier: "Bronze",
    streak: { current: 0 },
    badges: [],
  };

  return (
    <div className="h-[calc(100vh-4rem)] overflow-y-auto pr-2 text-white">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-cyan">
            {user?.name ? `${user.name} Profile` : "Operator Profile"}
          </h2>
          <p className="text-gray-400 text-sm mt-1 flex items-center gap-2 font-mono">
            ID: {user?.id?.substring(0, 8)}... | {user?.email}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/30 rounded-lg transition-colors font-mono text-sm"
        >
          <LogOut size={16} /> Disconnect
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="glass-panel p-5 border border-neon-cyan/30 bg-gradient-to-br from-neon-cyan/10 to-transparent relative overflow-hidden group">
          <Trophy className="absolute -right-4 -bottom-4 w-24 h-24 text-neon-cyan/10 group-hover:scale-110 transition-transform" />
          <h3 className="text-gray-400 text-xs font-mono uppercase tracking-wider mb-2">
            Global Rank
          </h3>
          <p className="text-3xl font-bold text-neon-cyan font-orbitron">
            {gamify.rankTier}
          </p>
          <p className="text-xs text-neon-cyan/70 mt-2">{gamify.xp} Total XP</p>
        </div>

        <div className="glass-panel p-5 border border-neon-purple/30 bg-gradient-to-br from-neon-purple/10 to-transparent relative overflow-hidden group">
          <Cpu className="absolute -right-4 -bottom-4 w-24 h-24 text-neon-purple/10 group-hover:scale-110 transition-transform" />
          <h3 className="text-gray-400 text-xs font-mono uppercase tracking-wider mb-2">
            Nodes Solved
          </h3>
          <p className="text-3xl font-bold text-white font-orbitron">
            {stats.problemsSolved}
          </p>
        </div>

        <div className="glass-panel p-5 border border-neon-yellow/30 bg-gradient-to-br from-neon-yellow/10 to-transparent relative overflow-hidden group">
          <Activity className="absolute -right-4 -bottom-4 w-24 h-24 text-neon-yellow/10 group-hover:scale-110 transition-transform" />
          <h3 className="text-gray-400 text-xs font-mono uppercase tracking-wider mb-2">
            Accuracy Matrix
          </h3>
          <p className="text-3xl font-bold text-neon-yellow font-orbitron">
            {stats.accuracy}%
          </p>
        </div>

        <div className="glass-panel p-5 border border-red-500/30 bg-gradient-to-br from-red-500/10 to-transparent relative overflow-hidden group">
          <Flame className="absolute -right-4 -bottom-4 w-24 h-24 text-red-500/10 group-hover:scale-110 transition-transform" />
          <h3 className="text-gray-400 text-xs font-mono uppercase tracking-wider mb-2">
            Active Streak
          </h3>
          <p className="text-3xl font-bold text-red-400 font-orbitron">
            {gamify.streak?.current || 0} Days
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Achievements / Badges */}
        <div className="glass-panel p-6 border border-dark-700">
          <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center gap-2 font-orbitron">
            <Medal className="text-neon-yellow" /> Earned Badges
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {gamify.badges.length === 0 ? (
              <p className="text-xs text-gray-500 font-mono col-span-3">
                No badges retrieved. Execute problems in Practice HQ to unlock
                criteria.
              </p>
            ) : (
              gamify.badges.map((badge, i) => (
                <div
                  key={i}
                  className="bg-dark-900 border border-dark-600 p-4 rounded-xl flex flex-col items-center justify-center text-center gap-2 transition-all cursor-crosshair"
                >
                  <div
                    className={`w-12 h-12 rounded-full bg-${badge.iconColor}/20 border border-${badge.iconColor}/50 flex items-center justify-center`}
                  >
                    <Award className={`text-${badge.iconColor} w-6 h-6`} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-300">
                      {badge.name}
                    </p>
                    <p className="text-[9px] text-gray-500">
                      {badge.description}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Dynamic Weakness Radar / Suggestions */}
        <div className="glass-panel p-6 border border-dark-700 flex flex-col">
          <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center gap-2 font-orbitron">
            <Activity className="text-neon-magenta" /> Personal Optimization AI
          </h3>
          <div className="bg-dark-900 border-l-4 border-neon-magenta p-4 rounded-r-lg mb-4">
            <p className="text-sm text-gray-300">
              Based on your recent Voice Analyzer outputs and test runs, our
              system detected algorithmic instability in the following zones:
            </p>
            <ul className="flex flex-wrap gap-2 mt-3">
              {stats.weakAreas && stats.weakAreas.length > 0 ? (
                stats.weakAreas.map((area, i) => (
                  <li
                    key={i}
                    className="text-xs bg-red-500/10 text-red-400 border border-red-500/30 px-2 py-1 rounded font-mono"
                  >
                    ⚠️ {area}
                  </li>
                ))
              ) : (
                <li className="text-xs text-neon-green">All systems optimal</li>
              )}
            </ul>
          </div>
          <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider font-bold">
            Recommended Inject Path:
          </p>
          <div className="bg-dark-800 p-3 rounded-lg border border-dark-600 flex items-center justify-between group cursor-pointer hover:border-neon-cyan transition-colors">
            <div>
              <p className="text-sm font-bold text-white group-hover:text-neon-cyan">
                Review: Graph Traversal (BFS/DFS)
              </p>
              <p className="text-xs text-gray-400">
                15 min reading + 2 code executions
              </p>
            </div>
            <button className="px-3 py-1 bg-neon-cyan/20 text-neon-cyan text-xs font-bold rounded">
              Execute
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
