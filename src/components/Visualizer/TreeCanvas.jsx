import React from 'react';

export const TreeCanvas = ({ nodes, edges, activeNode = null, comparingNodes = [], foundNode = null }) => {
  return (
    <div className="viz-canvas animate-fade-in" style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg className="tree-svg">
        {/* Draw edges first so they are under nodes */}
        {edges && edges.map((e, idx) => (
          <line
            key={`e-${idx}`}
            x1={e.x1}
            y1={e.y1}
            x2={e.x2}
            y2={e.y2}
            className={`tree-edge ${e.highlighted ? 'highlighted' : ''}`}
            stroke={e.highlighted ? 'var(--accent-primary)' : 'var(--border-primary)'}
          />
        ))}
        
        {/* Draw nodes */}
        {nodes && nodes.map((n) => {
          let fill = 'var(--bg-tertiary)';
          let stroke = 'var(--border-primary)';
          let textFill = 'var(--text-primary)';

          if (foundNode === n.id) {
            fill = 'var(--success)';
            stroke = 'var(--success)';
            textFill = 'white';
          } else if (activeNode === n.id) {
            fill = 'var(--algo-active)';
            stroke = 'var(--algo-active)';
            textFill = 'white';
          } else if (comparingNodes.includes(n.id)) {
            fill = 'var(--algo-comparing)';
            stroke = 'var(--algo-comparing)';
            textFill = 'black';
          }

          return (
            <g key={`n-${n.id}`} className="tree-node" transform={`translate(${n.x}, ${n.y})`}>
              <circle r="18" fill={fill} stroke={stroke} />
              <text y="1" fill={textFill}>{n.value}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
