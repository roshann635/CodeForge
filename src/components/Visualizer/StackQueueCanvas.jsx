import React from 'react';

export const StackQueueCanvas = ({ items, type = 'stack', pushingNode = null, poppingNode = null }) => {
  if (type === 'queue') {
    return (
      <div className="queue-visual animate-fade-in">
        <div style={{ marginRight: '20px', color: 'var(--text-tertiary)', fontWeight: 'bold' }}>Front →</div>
        
        {poppingNode && (
          <div className="queue-item" style={{ borderColor: 'var(--error)', color: 'var(--error)', transform: 'translateY(20px)', opacity: 0.5 }}>
            {poppingNode}
          </div>
        )}

        {items.map((item, idx) => (
          <div key={idx} className="queue-item">
            {item}
          </div>
        ))}

        {pushingNode && (
          <div className="queue-item" style={{ borderColor: 'var(--success)', color: 'var(--success)', transform: 'translateY(-20px)' }}>
            {pushingNode}
          </div>
        )}

        <div style={{ marginLeft: '20px', color: 'var(--text-tertiary)', fontWeight: 'bold' }}>← Rear</div>
      </div>
    );
  }

  // Stack view
  return (
    <div className="stack-visual animate-fade-in">
      <div style={{ color: 'var(--text-tertiary)', fontWeight: 'bold', marginBottom: '10px' }}>Top</div>
      
      {pushingNode && (
        <div className="stack-item" style={{ borderColor: 'var(--success)', color: 'var(--success)' }}>
          {pushingNode}
        </div>
      )}
      
      {poppingNode && (
        <div className="stack-item" style={{ borderColor: 'var(--error)', color: 'var(--error)', transform: 'translateX(40px)', opacity: 0.5 }}>
          {poppingNode}
        </div>
      )}

      {items.slice().reverse().map((item, idx) => (
        <div key={idx} className="stack-item">
          {item}
        </div>
      ))}
      
      <div style={{ width: '140px', height: '4px', background: 'var(--border-primary)', marginTop: '10px', borderRadius: '2px' }}></div>
      <div style={{ color: 'var(--text-tertiary)', fontWeight: 'bold', marginTop: '4px' }}>Bottom</div>
    </div>
  );
};
