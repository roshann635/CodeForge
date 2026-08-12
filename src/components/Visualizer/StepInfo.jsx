import React from 'react';

export const StepInfo = ({ stepIndex, totalSteps, description }) => {
  const percentage = totalSteps > 1 ? (stepIndex / (totalSteps - 1)) * 100 : 0;
  
  return (
    <>
      <div className="step-info">
        <div className="step-counter">
          Step {totalSteps > 0 ? stepIndex + 1 : 0} of {totalSteps}
        </div>
        <div className="step-progress">
          <div className="step-progress-fill" style={{ width: `${percentage}%` }}></div>
        </div>
      </div>
      
      <div className="description-panel mt-4 animate-fade-in">
        <div className="description-icon">💡</div>
        <div className="description-text" dangerouslySetInnerHTML={{ __html: description || "Ready." }} />
      </div>
    </>
  );
};
