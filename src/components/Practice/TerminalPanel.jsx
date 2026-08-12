import React from 'react';
import { Terminal } from 'lucide-react';

export const TerminalPanel = ({ output, status, isRunning }) => {
  return (
    <div className="terminal-panel">
      <div className="panel-header">
        <Terminal size={16} style={{ marginRight: '8px' }}/> Console
        {isRunning && <span className="status-badge processing" style={{ marginLeft: 'auto' }}>Running...</span>}
        {!isRunning && status === 'success' && <span className="status-badge success" style={{ marginLeft: 'auto' }}>Accepted</span>}
        {!isRunning && status === 'error' && <span className="status-badge error" style={{ marginLeft: 'auto' }}>Error</span>}
      </div>
      <div className="terminal-body">
        {output ? (
          <pre>{output}</pre>
        ) : (
          <div className="terminal-empty">Run your code to see output here.</div>
        )}
      </div>
    </div>
  );
};
