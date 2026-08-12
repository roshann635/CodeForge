import React from 'react';
import { Activity, BookOpen, Code, Trophy } from 'lucide-react';

export const Dashboard = () => {
  return (
    <div className="dashboard animate-fade-in">
      <div className="dashboard-hero">
        <h1>Master Data Structures & Algorithms</h1>
        <p>Interactive playground to deeply understand concepts, ace your interviews, and level up your coding skills.</p>
      </div>

      <div className="progress-rings">
        <div className="progress-ring-card">
          <div className="progress-ring-label">Beginner Track</div>
          <div className="progress-ring-sub">Arrays, Searching, Simple Sorts</div>
        </div>
        <div className="progress-ring-card">
          <div className="progress-ring-label">Intermediate Track</div>
          <div className="progress-ring-sub">Trees, Graphs, Recursion</div>
        </div>
        <div className="progress-ring-card">
          <div className="progress-ring-label">Advanced Track</div>
          <div className="progress-ring-sub">Dynamic Programming, Tries</div>
        </div>
         <div className="progress-ring-card">
          <div className="progress-ring-label">Expert Track</div>
          <div className="progress-ring-sub">Segment Trees, Max Flow</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card" onClick={() => window.location.hash = '#/visualizer'}>
          <Activity className="dashboard-card-icon" style={{ color: 'var(--accent-primary)' }} />
          <h3>Visualizer</h3>
          <p>Watch algorithms run step-by-step with synchronized pseudocode and dynamic state highlighting.</p>
        </div>
        
        <div className="dashboard-card" onClick={() => window.location.hash = '#/learn'}>
          <BookOpen className="dashboard-card-icon" style={{ color: 'var(--info)' }} />
          <h3>Learn</h3>
          <p>Read structured e-lecture cards mapped by difficulty track to build strong conceptual foundations.</p>
        </div>

        <div className="dashboard-card" onClick={() => window.location.hash = '#/practice'}>
          <Code className="dashboard-card-icon" style={{ color: 'var(--success)' }} />
          <h3>Practice</h3>
          <p>Solve curated interview-style coding challenges in your choice of Python, Java, JS, or C++.</p>
        </div>

        <div className="dashboard-card" onClick={() => window.location.hash = '#/quiz'}>
          <Trophy className="dashboard-card-icon" style={{ color: 'var(--warning)' }} />
          <h3>Quiz</h3>
          <p>Test your knowledge with multiple-choice self-assessments covering code tracing and complexities.</p>
        </div>
      </div>
    </div>
  );
};
