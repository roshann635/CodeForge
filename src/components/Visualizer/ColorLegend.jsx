import React from 'react';

export const ColorLegend = () => {
  const legends = [
    { label: 'Unsorted', color: 'var(--algo-default)' },
    { label: 'Comparing', color: 'var(--algo-comparing)' },
    { label: 'Swapping', color: 'var(--algo-swapping)' },
    { label: 'Sorted', color: 'var(--algo-sorted)' },
    { label: 'Pivot/Key', color: 'var(--algo-pivot)' },
    { label: 'Active Region', color: 'var(--algo-active)' },
  ];

  return (
    <div className="color-legend mt-4 animate-fade-in">
      {legends.map(item => (
        <div key={item.label} className="legend-item">
          <div className="legend-dot" style={{ backgroundColor: item.color }}></div>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
};
