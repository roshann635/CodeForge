import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { Dashboard } from './pages/Dashboard';
import { VisualizerPage } from './pages/VisualizerPage';
import { LearnPage } from './pages/LearnPage';
import { PracticePage } from './pages/PracticePage';
import { QuizPage } from './pages/QuizPage';
import { BookmarksPage } from './pages/BookmarksPage';
import { useTheme } from './hooks/useTheme';

function App() {
  const [currentHash, setCurrentHash] = useState(window.location.hash || '#/');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash || '#/');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const renderPage = () => {
    if (currentHash.startsWith('#/visualizer')) return <VisualizerPage />;
    if (currentHash.startsWith('#/learn')) return <LearnPage />;
    if (currentHash.startsWith('#/practice')) return <PracticePage />;
    if (currentHash.startsWith('#/quiz')) return <QuizPage />;
    if (currentHash.startsWith('#/bookmarks')) return <BookmarksPage />;
    return <Dashboard />;
  };

  return (
    <div className="app-layout">
      <Sidebar 
        currentHash={currentHash} 
        collapsed={sidebarCollapsed} 
        setCollapsed={setSidebarCollapsed} 
      />
      <div className="main-wrapper">
        <Header 
          currentHash={currentHash} 
          theme={theme} 
          toggleTheme={toggleTheme} 
        />
        <main className="main-content">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;
