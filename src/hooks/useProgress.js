import { useState, useCallback } from 'react';
import { storage } from '../utils/storage';

export const useProgress = () => {
  const [progress, setProgress] = useState(() => {
    return storage.get('algolens_progress', {
      visualizersExplored: [],
      cardsRead: [],
      problemsSolved: [],
      quizScores: {}
    });
  });

  const updateProgress = useCallback((category, itemId, score = null) => {
    setProgress(prev => {
      const newProgress = { ...prev };
      
      if (category === 'quizScores') {
        newProgress.quizScores[itemId] = score;
      } else {
        if (!newProgress[category].includes(itemId)) {
          newProgress[category] = [...newProgress[category], itemId];
        }
      }
      
      storage.set('algolens_progress', newProgress);
      return newProgress;
    });
  }, []);

  return { progress, updateProgress };
};
