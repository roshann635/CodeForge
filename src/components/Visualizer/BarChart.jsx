import React from 'react';

export const BarChart = ({ array, comparing = [], swapping = [], sorted = [], pivot = -1, active = -1 }) => {
  // Find max for scaling
  const maxVal = Math.max(...array, 1);

  return (
    <div className="viz-canvas">
      {array.map((val, idx) => {
        let stateClass = 'default';
        if (sorted.includes(idx)) stateClass = 'sorted';
        else if (swapping.includes(idx)) stateClass = 'swapping';
        else if (comparing.includes(idx)) stateClass = 'comparing';
        else if (idx === pivot) stateClass = 'pivot';
        else if (idx === active) stateClass = 'active';

        const heightPercentage = (val / maxVal) * 90; // scale to 90% of container max

        return (
          <div key={`${idx}-${val}`} className="bar-container">
            <div 
              className={`bar ${stateClass}`} 
              style={{ height: `${Math.max(5, heightPercentage)}%` }} // min height 5%
            ></div>
            <div className="bar-label">{val}</div>
          </div>
        );
      })}
    </div>
  );
};
