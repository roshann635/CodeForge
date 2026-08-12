import React from 'react';
import { BookOpen, CheckCircle, Clock } from 'lucide-react';

export const LectureCard = ({ track, title, description, timeToRead, isCompleted, onClick }) => {
  return (
    <div className={`lecture-card ${isCompleted ? 'completed' : ''}`} onClick={onClick}>
      <div className="lecture-card-header">
        <span className="lecture-track-badge">{track}</span>
        {isCompleted && <CheckCircle size={18} className="text-success" />}
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      <div className="lecture-card-footer">
        <span className="lecture-time">
          <Clock size={14} /> {timeToRead} min read
        </span>
        <button className="read-btn">
          <BookOpen size={14} style={{ display: 'inline-block', marginRight: '4px', verticalAlign: 'text-bottom' }} /> 
          {isCompleted ? 'Read Again' : 'Start Reading'}
        </button>
      </div>
    </div>
  );
};
