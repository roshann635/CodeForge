import React from 'react';
import { Search, Moon, Sun, Settings } from 'lucide-react';
import { THEME_MODES } from '../../utils/constants';

export const Header = ({ currentHash, theme, toggleTheme }) => {
  const getBreadcrumbs = () => {
    const route = currentHash.replace('#/', '').split('/')[0] || 'Dashboard';
    const capitalized = route.charAt(0).toUpperCase() + route.slice(1);
    return (
      <div className="header-breadcrumb">
        CodeForge <span>/</span> <span>{capitalized}</span>
      </div>
    );
  };

  return (
    <header className="header">
      {getBreadcrumbs()}
      
      <div className="header-search">
        <Search className="header-search-icon" size={16} />
        <input type="text" placeholder="Search algorithms, topics, problems..." />
      </div>

      <div className="header-actions">
        <button 
          className="header-btn" 
          onClick={toggleTheme}
          title={theme === THEME_MODES.DARK ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === THEME_MODES.DARK ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button className="header-btn" title="Settings">
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
};
