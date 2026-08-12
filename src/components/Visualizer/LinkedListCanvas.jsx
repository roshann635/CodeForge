import React from 'react';

export const LinkedListCanvas = ({ nodes, headPointer, tailPointer, activeNode, comparingNodes = [], foundNode = null }) => {
  return (
    <div className="linked-list-canvas animate-fade-in">
      {headPointer !== null && (
        <div style={{ position: 'absolute', top: '10px', left: `${headPointer * 90 + 30}px`, color: 'var(--accent-primary)', fontWeight: 'bold' }}>
          Head ↓
        </div>
      )}
      
      {nodes.map((node, idx) => {
        let isTail = idx === nodes.length - 1;
        let isComparing = comparingNodes.includes(idx);
        let isActive = activeNode === idx;
        let isFound = foundNode === idx;
        
        let nodeClasses = "ll-node-box";
        if (isFound) nodeClasses += " found";
        else if (isActive) nodeClasses += " active";
        else if (isComparing) nodeClasses += " comparing";

        return (
          <div key={node.id || idx} className="ll-node">
            <div className={nodeClasses}>
              {node.value}
            </div>
            {!isTail && (
              <div className="ll-arrow">
                {/* Visual arrow */}
              </div>
            )}
          </div>
        );
      })}

      {tailPointer !== null && (
        <div style={{ position: 'absolute', bottom: '10px', left: `${tailPointer * 90 + 30}px`, color: 'var(--accent-primary)', fontWeight: 'bold' }}>
          ↑ Tail
        </div>
      )}
    </div>
  );
};
