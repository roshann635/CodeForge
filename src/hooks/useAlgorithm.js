import { useState, useEffect, useCallback, useRef } from 'react';

export const useAlgorithm = (initialSteps = []) => {
  const [steps, setSteps] = useState(initialSteps);
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(5); // 1 to 10
  const timerRef = useRef(null);

  const currentStep = steps[stepIndex] || { 
    array: [], 
    comparing: [], 
    swapping: [], 
    sorted: [], 
    pivot: -1, 
    active: -1,
    description: "Ready to start",
    highlightLines: []
  };

  const isFinished = stepIndex === Math.max(0, steps.length - 1);
  const isStarted = stepIndex > 0;

  const getDelay = useCallback(() => {
    // Speed 1 -> ~2000ms, Speed 5 -> ~400ms, Speed 10 -> ~50ms
    return Math.max(50, 2000 / (speed * speed * 0.4));
  }, [speed]);

  const stepForward = useCallback(() => {
    setStepIndex(prev => Math.min(prev + 1, steps.length - 1));
  }, [steps.length]);

  const stepBack = useCallback(() => {
    setStepIndex(prev => Math.max(prev - 1, 0));
  }, []);

  const reset = useCallback(() => {
    setStepIndex(0);
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (isFinished) {
      setStepIndex(0); // Restart if playing from end
      setIsPlaying(true);
    } else {
      setIsPlaying(prev => !prev);
    }
  }, [isFinished]);

  useEffect(() => {
    if (isPlaying && !isFinished) {
      timerRef.current = setTimeout(() => {
        stepForward();
      }, getDelay());
    } else if (isFinished && isPlaying) {
      setIsPlaying(false);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, stepIndex, isFinished, stepForward, getDelay]);

  return {
    steps,
    setSteps,
    stepIndex,
    currentStep,
    isPlaying,
    isFinished,
    isStarted,
    speed,
    setSpeed,
    stepForward,
    stepBack,
    reset,
    togglePlay,
    totalSteps: steps.length
  };
};
