import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { quizApi } from '../lib/api';
import { QuizCard } from '../components/Quiz/QuizCard';

export const QuizPage = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [finalScore, setFinalScore] = useState(null);

  const { data: questions, isLoading, error } = useQuery({
      queryKey: ['quizQuestions'],
      queryFn: () => quizApi.getQuestions()
  });

  const submitMutation = useMutation({
      mutationFn: (answersPayload) => quizApi.submitSession(answersPayload),
      onSuccess: (data) => {
          setFinalScore(data.score);
          setShowResults(true);
      }
  });

  const handleAnswer = (optionIdx) => {
    setSelectedAnswers({ ...selectedAnswers, [currentIdx]: optionIdx });
  };

  const handleNext = () => {
    if (currentIdx < (questions?.length || 0) - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      // Build payload and submit
      const answersPayload = Object.entries(selectedAnswers).map(([idx, chosen_index]) => ({
          question_id: questions[idx].id,
          chosen_index
      }));
      submitMutation.mutate(answersPayload);
    }
  };

  const resetQuiz = () => {
    setCurrentIdx(0);
    setFinalScore(null);
    setShowResults(false);
    setSelectedAnswers({});
  };

  if (isLoading) return <div className="p-8 text-center text-gray-400">Loading quiz content...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Failed to load quiz: {error.message}</div>;
  if (!questions || questions.length === 0) return <div className="p-8 text-center">No questions found.</div>;

  if (showResults) {
    return (
      <div className="quiz-page animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>Quiz Complete!</h2>
        <div className="score-circle" style={{ width: '120px', height: '120px', borderRadius: '50%', border: '8px solid var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: 'bold' }}>
          {finalScore}/{questions.length}
        </div>
        <p style={{ marginTop: '24px', fontSize: '18px', color: 'var(--text-secondary)' }}>
          {finalScore === questions.length ? 'Perfect score! You are a master.' : 'Good effort. Keep reviewing the content!'}
        </p>
        <button className="reset-btn mt-6" onClick={resetQuiz} style={{ padding: '10px 24px', background: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-primary)' }}>
          Retake Quiz
        </button>
      </div>
    );
  }

  const q = questions[currentIdx];
  const hasAnswered = selectedAnswers[currentIdx] !== undefined;

  return (
    <div className="quiz-page animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '40px' }}>
      <div className="quiz-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <span className="quiz-category" style={{ background: 'var(--bg-tertiary)', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
          {q.category || q.topic || 'General'}
        </span>
        <span className="quiz-progress" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Question {currentIdx + 1} of {questions.length}
        </span>
      </div>

      <QuizCard 
        questionText={q.question || q.text} 
        options={q.options} 
        selectedIndex={selectedAnswers[currentIdx]}
        onSelect={handleAnswer} 
      />

      <div className="quiz-footer" style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <button 
          className="next-btn" 
          onClick={handleNext} 
          disabled={!hasAnswered || submitMutation.isPending}
          style={{ padding: '10px 24px', background: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '6px', cursor: hasAnswered ? 'pointer' : 'not-allowed', opacity: hasAnswered ? 1 : 0.5 }}
        >
          {submitMutation.isPending ? 'Submitting...' : currentIdx === questions.length - 1 ? 'Finish' : 'Next Question'}
        </button>
      </div>
    </div>
  );
};
