import React from 'react';

export const ArrayCellRow = ({ array, comparing = [], swapping = [], sorted = [], pivot = -1, active = -1, pointers = {} }) => {
  return (
    <div className="viz-array-row">
      {array.map((val, idx) => {
        let stateClass = 'default';
        if (sorted.includes(idx)) stateClass = 'sorted';
        else if (swapping.includes(idx)) stateClass = 'swapping';
        else if (comparing.includes(idx)) stateClass = 'comparing';
        else if (idx === pivot) stateClass = 'pivot';
        else if (idx === active) stateClass = 'active';

        // Check if any pointers point to this index
        const pointerNames = Object.entries(pointers)
          .filter(([_, ptrIdx]) => ptrIdx === idx)
          .map(([name]) => name);

        return (
          <div key={`cell-${idx}`} className="array-cell">
            <div className={`array-cell-box ${stateClass}`}>
              {val}
            </div>
            <div className="array-cell-index">{idx}</div>
            {pointerNames.length > 0 && (
              <div style={{ fontSize: '10px', color: 'var(--accent-primary)', fontWeight: 'bold' }}>
                {pointerNames.join(', ')}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
