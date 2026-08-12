import React, { useEffect, useRef } from 'react';

export const PseudocodePanel = ({ code, highlightLines = [] }) => {
  const panelRef = useRef(null);

  // Auto-scroll to the first highlighted line
  useEffect(() => {
    if (highlightLines.length > 0 && panelRef.current) {
      const firstHighlighted = panelRef.current.querySelector('.highlighted');
      if (firstHighlighted) {
        firstHighlighted.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [highlightLines]);

  return (
    <div className="pseudocode-panel animate-slide-up">
      <div className="panel-header">
        Pseudocode
      </div>
      <div className="pseudocode-body" ref={panelRef}>
        {code.map((line, index) => {
          const isHighlighted = highlightLines.includes(index);
          return (
            <div 
              key={index} 
              className={`pseudocode-line ${isHighlighted ? 'highlighted' : ''}`}
            >
              <div className="pseudocode-line-number">{index + 1}</div>
              <div>{line}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
