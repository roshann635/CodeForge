import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

export const QuizCard = ({ questionText, options, selectedIndex, correctIndex, explanation, onSelect }) => {
  const hasAnswered = selectedIndex !== undefined;

  return (
    <div className="quiz-card p-6 rounded-xl" style={{ border: '1px solid var(--border-primary)', backgroundColor: 'var(--bg-secondary)' }}>
      <h3 style={{ fontSize: '20px', marginBottom: '24px' }}>{questionText}</h3>
      
      <div className="options-grid" style={{ display: 'grid', gap: '12px' }}>
        {options.map((option, idx) => {
          let optionClass = 'quiz-option';
          let borderStyle = '1px solid var(--border-primary)';
          let icon = null;

          if (hasAnswered) {
            if (idx === correctIndex) {
              optionClass += ' correct';
              borderStyle = '2px solid var(--success)';
              icon = <CheckCircle size={18} className="text-success" />;
            } else if (idx === selectedIndex) {
              optionClass += ' wrong';
              borderStyle = '2px solid var(--error)';
              icon = <XCircle size={18} className="text-error" />;
            }
          } else if (selectedIndex === idx) {
            optionClass += ' selected';
            borderStyle = '2px solid var(--accent-primary)';
          }

          return (
            <button 
              key={idx} 
              className={optionClass}
              onClick={() => !hasAnswered && onSelect(idx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                borderRadius: '8px',
                background: 'var(--bg-tertiary)',
                border: borderStyle,
                color: 'var(--text-primary)',
                textAlign: 'left',
                cursor: hasAnswered ? 'default' : 'pointer'
              }}
            >
              <span>{option}</span>
              {icon}
            </button>
          );
        })}
      </div>

      {hasAnswered && (
        <div className="explanation-box animate-slide-up mt-6" style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: '8px', borderLeft: '4px solid var(--info)' }}>
          <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)', fontSize: '14px' }}>Explanation</h4>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>
            {explanation}
          </p>
        </div>
      )}
    </div>
  );
};
