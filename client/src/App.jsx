import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import {
  Terminal,
  Code,
  BookOpen,
  Mic,
  LayoutDashboard,
  BarChart3,
  Search,
  X,
  Trophy,
  User,
  Shield,
} from "lucide-react";
import { AuthContext, AuthProvider } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import Visualizer from "./pages/Visualizer";
import Practice from "./pages/Practice";
import CodeLab from "./pages/CodeLab";
import Learn from "./pages/Learn";
import Quiz from "./pages/Quiz";
import InterviewPrep from "./pages/InterviewPrep";
import AuthPage from "./pages/AuthPage";
import LandingPage from "./pages/LandingPage";
import Profile from "./pages/Profile";
import Leaderboard from "./pages/Leaderboard";
import AdminLogin from "./pages/admin/AdminLogin";
import FacultyDashboard from "./pages/admin/FacultyDashboard";
import ProblemBuilder from "./pages/admin/ProblemBuilder";

function MainLayout() {
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const location = useLocation();

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "k" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const searchResults = [
    { title: "Two Sum CodeLab", type: "CodeLab", path: "/codelab/1", icon: Terminal },
    { title: "Binary Search CodeLab", type: "CodeLab", path: "/codelab/2", icon: Terminal },
    { title: "Two Sum", type: "Problem", path: "/practice", icon: Code },
    { title: "Binary Search", type: "Algorithm", path: "/visualize", icon: BarChart3 },
    { title: "Bubble Sort", type: "Algorithm", path: "/visualize", icon: BarChart3 },
    { title: "Faculty Control", type: "Portal", path: "/admin/dashboard", icon: Shield },
  ].filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const hideSidebarRoutes = ["/", "/login", "/admin/login"];
  const isCodeLabRoute = location.pathname.startsWith("/codelab");
  const shouldShowSidebar = !hideSidebarRoutes.includes(location.pathname) && !isCodeLabRoute;

  return (
    <div className="flex bg-dark-900 min-h-screen">
      {shouldShowSidebar && <Sidebar setSearchOpen={setSearchOpen} />}

      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
          <div className="w-full max-w-2xl mx-4">
            <div className="glass-panel p-4">
              <div className="flex items-center gap-3 mb-4">
                <Search className="text-neon-cyan" size={20} />
                <input
                  type="text"
                  placeholder="Search algorithms, problems, quizzes... (Ctrl+K)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none"
                  autoFocus
                />
                <button onClick={() => { setSearchOpen(false); setSearchQuery(""); }} className="text-gray-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {searchResults.map((result, i) => (
                  <Link
                    key={i}
                    to={result.path}
                    onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-dark-700/50 transition-colors"
                  >
                    <result.icon size={16} className="text-neon-cyan" />
                    <div>
                      <p className="text-white font-medium">{result.title}</p>
                      <p className="text-gray-400 text-sm">{result.type}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Pane */}
      <main className={`flex-1 relative overflow-hidden h-screen overflow-y-auto w-full ${isCodeLabRoute ? 'p-0' : 'p-6'}`}>
        {shouldShowSidebar && (
          <>
            <div className="absolute top-[-100px] right-[-100px] w-96 h-96 bg-neon-purple/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-100px] left-[-100px] w-64 h-64 bg-neon-cyan/10 rounded-full blur-[100px] pointer-events-none"></div>
          </>
        )}

        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/visualize" element={<Visualizer />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/codelab/:problemId" element={<CodeLab />} />
          <Route path="/interview" element={<InterviewPrep />} />
          <Route path="/quiz/:topic" element={<Quiz />} />
          <Route path="/quiz" element={<Quiz />} />

          {/* Faculty / Admin Portal Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<FacultyDashboard />} />
          <Route path="/admin/problems/new" element={<ProblemBuilder />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <MainLayout />
      </Router>
    </AuthProvider>
  );
}

function Sidebar({ setSearchOpen }) {
  const location = useLocation();
  const { user, isFaculty } = React.useContext(AuthContext);

  const navItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", matchExact: true },
    { to: "/profile", icon: Code, label: "My Profile" },
    { to: "/leaderboard", icon: Trophy, label: "Global Arena" },
    { to: "/learn", icon: BookOpen, label: "Learn Path" },
    { to: "/visualize", icon: BarChart3, label: "Visualizer" },
    { to: "/practice", icon: Terminal, label: "Practice HQ" },
    { to: "/codelab/1", icon: Terminal, label: "CodeLab IDE" },
    { to: "/interview", icon: Mic, label: "Interview Prep" },
  ];

  if (isFaculty) {
    navItems.push({ to: "/admin/dashboard", icon: Shield, label: "Faculty Portal" });
  }

  const handleSearchClick = () => {
    setSearchOpen(true);
  };

  return (
    <aside className="w-60 glass-panel m-3 flex flex-col items-center py-6 z-10 flex-shrink-0">
      <div className="flex items-center gap-2.5 mb-10 px-4">
        <Terminal className="text-neon-cyan w-7 h-7 drop-shadow-[0_0_8px_rgba(0,243,255,0.8)]" />
        <h1 className="text-xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple text-glow-cyan">
          CodeForge
        </h1>
      </div>

      <nav className="w-full flex-1 px-3 space-y-1">
        <button
          onClick={handleSearchClick}
          className="w-full text-left px-4 py-2.5 rounded-xl transition-all duration-200 group relative bg-transparent border border-dark-600 hover:border-neon-cyan/50 hover:bg-dark-700/50"
        >
          <div className="flex items-center gap-2.5">
            <Search
              size={16}
              className="text-gray-500 group-hover:text-neon-cyan transition-colors flex-shrink-0"
            />
            <span className="font-medium text-sm tracking-wide text-gray-400 group-hover:text-white transition-colors">
              Search (Ctrl+K)
            </span>
          </div>
        </button>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.matchExact
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to);

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group relative
                ${
                  isActive
                    ? "bg-neon-cyan/10 text-neon-cyan"
                    : "text-gray-400 hover:text-white hover:bg-dark-700/50"
                }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-neon-cyan rounded-r-full shadow-[0_0_8px_#00f3ff]"></div>
              )}
              <Icon
                size={18}
                className={`transition-colors ${isActive ? "text-neon-cyan drop-shadow-[0_0_4px_#00f3ff]" : "group-hover:text-neon-cyan"}`}
              />
              <span
                className={`font-medium text-sm tracking-wide ${isActive ? "text-white" : ""}`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-4 w-full">
        {user && (
          <div className="mb-4 flex items-center gap-3 p-3 bg-dark-800/50 border border-dark-700 rounded-xl transition-colors">
            <div className="w-8 h-8 rounded-full bg-neon-cyan/20 border border-neon-cyan flex items-center justify-center">
              <User size={14} className="text-neon-cyan" />
            </div>
            <div className="min-w-0">
               <p className="text-xs font-bold text-white truncate">{user.name || "Operator"}</p>
               <p className="text-[10px] text-gray-500 truncate">{user.role || "STUDENT"}</p>
            </div>
          </div>
        )}

        <div className="border-t border-dark-700 pt-4 mt-4 space-y-2">
          <Link
            to="/admin/login"
            className="block text-center text-xs text-neon-purple hover:underline font-orbitron"
          >
            Faculty Portal Login →
          </Link>
        </div>
      </div>
    </aside>
  );
}

export default App;
