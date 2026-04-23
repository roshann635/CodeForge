import React, { useState, useEffect } from "react";
import { Trophy, Medal, Hexagon, Crown } from "lucide-react";
import API_BASE from "../config/api";

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/leaderboard`)
      .then((res) => res.json())
      .then((data) => {
        setLeaders(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-neon-cyan font-mono animate-pulse">
        Loading Global Rankings...
      </div>
    );
  }

  const getRankStyle = (rank) => {
    if (rank === 1)
      return "bg-gradient-to-r from-yellow-500/20 to-transparent border-yellow-500/50 text-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.2)]";
    if (rank === 2)
      return "bg-gradient-to-r from-gray-300/20 to-transparent border-gray-300/50 text-gray-300 shadow-[0_0_15px_rgba(209,213,219,0.1)]";
    if (rank === 3)
      return "bg-gradient-to-r from-amber-700/20 to-transparent border-amber-700/50 text-amber-600 shadow-[0_0_15px_rgba(180,83,9,0.2)]";
    return "bg-dark-800/50 border-dark-600 text-gray-400";
  };

  const getTierIcon = (tier) => {
    switch (tier) {
      case "CodeForge Elite":
        return <Crown size={16} className="text-neon-magenta" />;
      case "Diamond":
        return <Hexagon size={16} className="text-neon-cyan" />;
      case "Gold":
        return <Medal size={16} className="text-yellow-500" />;
      case "Silver":
        return <Medal size={16} className="text-gray-300" />;
      default:
        return <Trophy size={16} className="text-gray-600" />;
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] overflow-y-auto pr-2 text-white">
      <div className="flex flex-col items-center justify-center py-8 mb-6 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-32 bg-neon-purple/10 rounded-[100%] blur-[60px] pointer-events-none"></div>
        <Trophy
          size={48}
          className="text-neon-cyan drop-shadow-[0_0_15px_rgba(0,243,255,0.6)] mb-4"
        />
        <h2 className="text-4xl font-bold font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple">
          Global Arena
        </h2>
        <p className="text-gray-400 text-sm mt-3 font-mono">
          Top 100 Hackers All-Time (XP Based)
        </p>
      </div>

      <div className="max-w-4xl mx-auto glass-panel p-2 md:p-6 pb-2 border-dark-700 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-dark-600 text-xs font-mono uppercase tracking-wider text-gray-500">
          <div className="col-span-2 text-center">Rank</div>
          <div className="col-span-5">Operator ID</div>
          <div className="col-span-2 text-right">XP</div>
          <div className="col-span-3 text-right hidden sm:block">Tier</div>
        </div>

        {/* List */}
        <div className="space-y-3 mt-4">
          {leaders.map((leader) => (
            <div
              key={leader.id}
              className={`grid grid-cols-12 gap-4 p-4 rounded-xl items-center border transition-all hover:scale-[1.01] ${getRankStyle(leader.rank)}`}
            >
              <div className="col-span-2 text-center font-orbitron font-bold text-lg">
                #{leader.rank}
              </div>
              <div className="col-span-5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-dark-900 border border-dark-600 flex items-center justify-center shadow-inner">
                  <span className="text-[10px] font-mono">
                    {leader.identity.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-200 font-mono">
                    {leader.identity}
                  </p>
                  <p className="text-[10px] text-gray-500 hidden sm:block">
                    🔥 {leader.streak} Day Streak | 💻 {leader.problems} Solved
                  </p>
                </div>
              </div>
              <div className="col-span-2 text-right font-orbitron font-bold">
                {leader.xp.toLocaleString()}
              </div>
              <div className="col-span-3 hidden sm:flex items-center justify-end gap-2 text-sm">
                {getTierIcon(leader.tier)}
                <span className="truncate">{leader.tier}</span>
              </div>
            </div>
          ))}

          {leaders.length === 0 && (
            <div className="p-8 text-center text-gray-500 font-mono border border-dashed border-dark-600 rounded-xl">
              No signal found. Be the first to execute code.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
