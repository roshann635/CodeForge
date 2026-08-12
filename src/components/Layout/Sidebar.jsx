import React from 'react';
import { 
  Home, 
  Activity, 
  BookOpen, 
  Code, 
  HelpCircle, 
  Bookmark, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';

export const Sidebar = ({ currentHash, collapsed, setCollapsed }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home size={20} />, hash: '#/' },
    { id: 'visualizer', label: 'Visualizer', icon: <Activity size={20} />, hash: '#/visualizer' },
    { id: 'learn', label: 'Learn', icon: <BookOpen size={20} />, hash: '#/learn' },
    { id: 'practice', label: 'Practice', icon: <Code size={20} />, hash: '#/practice' },
    { id: 'quiz', label: 'Quiz', icon: <HelpCircle size={20} />, hash: '#/quiz' }
  ];

  const handleNav = (hash) => {
    window.location.hash = hash;
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-logo" onClick={() => handleNav('#/')}>
        <div className="sidebar-logo-icon">CF</div>
        <div className="sidebar-logo-text">CodeForge</div>
      </div>
      
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Main Menu</div>
        {navItems.map(item => {
          const isActive = currentHash === item.hash || 
                           (item.hash !== '#/' && currentHash.startsWith(item.hash));
          return (
            <button
              key={item.id}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
              onClick={() => handleNav(item.hash)}
              title={collapsed ? item.label : ''}
            >
              <span className="sidebar-item-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}

        <div className="sidebar-section-label" style={{ marginTop: '32px' }}>Your Stuff</div>
        <button
          className={`sidebar-item ${currentHash.startsWith('#/bookmarks') ? 'active' : ''}`}
          onClick={() => handleNav('#/bookmarks')}
          title={collapsed ? 'Bookmarks' : ''}
        >
          <span className="sidebar-item-icon"><Bookmark size={20} /></span>
          <span>Bookmarks</span>
        </button>
      </nav>

      <button 
        className="sidebar-collapse-btn" 
        onClick={() => setCollapsed(!collapsed)}
        title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>
    </aside>
  );
};
