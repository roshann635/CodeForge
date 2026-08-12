import React from 'react';

export const ComplexityBadge = ({ complexities }) => {
  if (!complexities) return null;

  return (
    <div className="complexity-panel animate-slide-up" style={{ animationDelay: '100ms' }}>
      <div className="panel-header">
        Complexity Analysis
      </div>
      <table className="complexity-table">
        <thead>
          <tr>
            <th>Best</th>
            <th>Average</th>
            <th>Worst</th>
            <th>Space</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{complexities.best}</td>
            <td>{complexities.average}</td>
            <td>{complexities.worst}</td>
            <td>{complexities.space}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
