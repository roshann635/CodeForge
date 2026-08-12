import React from 'react';

export const GraphCanvas = ({ nodes, edges, activeNode = null, comparingNodes = [], foundNode = null }) => {
  return (
    <div className="viz-canvas animate-fade-in" style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg className="graph-svg">
        {/* Draw edges first */}
        {edges && edges.map((e, idx) => {
          // get coords of source and target
          const sourceNode = nodes.find(n => n.id === e.source);
          const targetNode = nodes.find(n => n.id === e.target);
          if(!sourceNode || !targetNode) return null;

          return (
            <line
              key={`e-${idx}`}
              x1={sourceNode.x}
              y1={sourceNode.y}
              x2={targetNode.x}
              y2={targetNode.y}
              className={`graph-edge ${e.highlighted ? 'highlighted' : ''}`}
            />
          );
        })}
        
        {/* Draw nodes */}
        {nodes && nodes.map((n) => {
          let fill = 'var(--bg-tertiary)';
          let stroke = 'var(--border-primary)';
          let textFill = 'var(--text-primary)';

          if (foundNode === n.id || n.state === 'visited') {
            fill = 'var(--success)';
            stroke = 'var(--success)';
            textFill = 'white';
          } else if (activeNode === n.id || n.state === 'active') {
            fill = 'var(--algo-active)';
            stroke = 'var(--algo-active)';
            textFill = 'white';
          } else if (comparingNodes.includes(n.id) || n.state === 'queue') {
            fill = 'var(--algo-comparing)';
            stroke = 'var(--algo-comparing)';
            textFill = 'black';
          }

          return (
            <g key={`n-${n.id}`} className="graph-node animate-pulse" transform={`translate(${n.x}, ${n.y})`}>
              <circle r="24" fill={fill} stroke={stroke} />
              <text y="2" fill={textFill} fontFamily="var(--font-mono)" fontSize="14" fontWeight="600" textAnchor="middle" dominantBaseline="central">
                {n.value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
