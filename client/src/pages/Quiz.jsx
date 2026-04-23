import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CheckCircle, XCircle, Clock, ArrowRight, Trophy, RotateCcw, Filter, RefreshCw } from "lucide-react";
import QUIZ_DATA from "../data/quizData";

export default function Quiz() {
  const { topic } = useParams();
  const { token } = useContext(AuthContext);
  const topicKey = topic || "arrays";
  const allQuestions = QUIZ_DATA[topicKey] || QUIZ_DATA.arrays;

  const [difficulty, setDifficulty] = useState("all");
  const [retryWrong, setRetryWrong] = useState(false);
  const [wrongOnly, setWrongOnly] = useState([]);

  const filtered = retryWrong && wrongOnly.length > 0
    ? wrongOnly
    : difficulty === "all"
      ? allQuestions
      : allQuestions.filter(q => q.difficulty === difficulty);

  const questions = filtered.length > 0 ? filtered : allQuestions;

  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    setCurrentQ(0); setAnswers([]); setShowResult(false);
    setSelectedAnswer(null); setIsAnswered(false); setTimeLeft(30);
    setRetryWrong(false); setWrongOnly([]);
  }, [topicKey, difficulty]);

  useEffect(() => {
    if (showResult || isAnswered) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { handleTimeout(); return 30; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [currentQ, showResult, isAnswered]);

  const handleTimeout = () => {
    if (!isAnswered) {
      setAnswers(prev => [...prev, { question: currentQ, selected: null, correct: questions[currentQ].answer, isCorrect: false }]);
      setIsAnswered(true);
      setShowExplanation(true);
      setTimeout(() => { setShowExplanation(false); nextQuestion(); }, 2500);
    }
  };

  const handleAnswer = (option) => {
    if (isAnswered) return;
    setSelectedAnswer(option);
    setIsAnswered(true);
    setShowExplanation(true);
    const isCorrect = option === questions[currentQ].answer;
    setAnswers(prev => [...prev, { question: currentQ, selected: option, correct: questions[currentQ].answer, isCorrect }]);
    setTimeout(() => { setShowExplanation(false); nextQuestion(); }, 2500);
  };

  const nextQuestion = () => {
    if (currentQ + 1 >= questions.length) setShowResult(true);
    else { setCurrentQ(prev => prev + 1); setSelectedAnswer(null); setIsAnswered(false); setTimeLeft(30); }
  };

  const restart = () => {
    setCurrentQ(0); setSelectedAnswer(null); setAnswers([]);
    setShowResult(false); setTimeLeft(30); setIsAnswered(false);
    setRetryWrong(false); setWrongOnly([]);
  };

  const retryWrongAnswers = () => {
    const wrong = answers.filter(a => !a.isCorrect).map(a => questions[a.question]);
    if (wrong.length === 0) return;
    setWrongOnly(wrong);
    setRetryWrong(true);
    setCurrentQ(0); setSelectedAnswer(null); setAnswers([]);
    setShowResult(false); setTimeLeft(30); setIsAnswered(false);
  };

  const score = answers.filter(a => a.isCorrect).length;
  const percentage = Math.round((score / questions.length) * 100);

  useEffect(() => {
    if (showResult && token) {
      fetch("http://localhost:5000/api/progress/update", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ type: "quiz", data: { topic: topicKey, score: percentage } }),
      }).catch(() => {});
    }
  }, [showResult]);

  if (showResult) {
    const wrongCount = answers.filter(a => !a.isCorrect).length;
    return (
      <div className="max-w-2xl mx-auto text-white space-y-8 animate-fade-in">
        <div className="text-center space-y-4">
          <Trophy className={`mx-auto ${percentage >= 80 ? "text-neon-yellow" : percentage >= 50 ? "text-neon-cyan" : "text-gray-400"}`} size={64} />
          <h2 className="text-4xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple">Quiz Complete!</h2>
          <div className="text-6xl font-bold font-orbitron">
            <span className={percentage >= 80 ? "text-neon-green" : percentage >= 50 ? "text-neon-yellow" : "text-red-400"}>{percentage}%</span>
          </div>
          <p className="text-gray-400">{score}/{questions.length} correct • {retryWrong ? "Retry Mode" : `${difficulty === "all" ? "All" : difficulty} difficulty`}</p>
        </div>

        <div className="glass-panel p-6 space-y-3 max-h-[350px] overflow-y-auto">
          {answers.map((ans, idx) => (
            <div key={idx} className={`flex items-start gap-3 p-3 rounded-lg border ${ans.isCorrect ? "border-neon-green/30 bg-neon-green/5" : "border-red-500/30 bg-red-500/5"}`}>
              {ans.isCorrect ? <CheckCircle size={18} className="text-neon-green flex-shrink-0 mt-0.5" /> : <XCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-300">{questions[idx]?.question}</p>
                {!ans.isCorrect && <p className="text-xs text-neon-green mt-0.5">Correct: {ans.correct}</p>}
                {questions[idx]?.explanation && <p className="text-xs text-gray-500 mt-1 italic">{questions[idx].explanation}</p>}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-3 flex-wrap">
          <button onClick={restart} className="flex items-center gap-2 px-5 py-2.5 bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50 rounded-xl font-medium hover:bg-neon-cyan/30 transition-all text-sm">
            <RotateCcw size={16} /> Restart
          </button>
          {wrongCount > 0 && (
            <button onClick={retryWrongAnswers} className="flex items-center gap-2 px-5 py-2.5 bg-neon-yellow/20 text-neon-yellow border border-neon-yellow/50 rounded-xl font-medium hover:bg-neon-yellow/30 transition-all text-sm">
              <RefreshCw size={16} /> Retry Wrong ({wrongCount})
            </button>
          )}
          <Link to="/learn" className="flex items-center gap-2 px-5 py-2.5 bg-dark-700 text-gray-300 border border-dark-600 rounded-xl font-medium hover:bg-dark-600 transition-all text-sm">
            Back to Learn <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  const q = questions[currentQ];
  const diffBadge = { easy: "text-neon-green bg-neon-green/10", medium: "text-neon-yellow bg-neon-yellow/10", hard: "text-neon-magenta bg-neon-magenta/10" };

  return (
    <div className="max-w-2xl mx-auto text-white space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple">
          Quiz: {topicKey.charAt(0).toUpperCase() + topicKey.slice(1)}
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Filter size={14} className="text-gray-500" />
            <select value={difficulty} onChange={e => setDifficulty(e.target.value)}
              className="bg-dark-800 border border-dark-600 text-white px-2 py-1 rounded text-xs font-mono focus:border-neon-cyan outline-none">
              <option value="all">All ({allQuestions.length})</option>
              <option value="easy">Easy ({allQuestions.filter(q=>q.difficulty==="easy").length})</option>
              <option value="medium">Medium ({allQuestions.filter(q=>q.difficulty==="medium").length})</option>
              <option value="hard">Hard ({allQuestions.filter(q=>q.difficulty==="hard").length})</option>
            </select>
          </div>
          <div className={`flex items-center gap-2 text-sm font-mono ${timeLeft <= 10 ? "text-red-400 animate-pulse" : "text-gray-400"}`}>
            <Clock size={16} /> {timeLeft}s
          </div>
          <span className="text-sm text-gray-500">{currentQ + 1}/{questions.length}</span>
        </div>
      </div>

      <div className="w-full bg-dark-800 rounded-full h-1.5 overflow-hidden">
        <div className="bg-gradient-to-r from-neon-purple to-neon-magenta h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${(currentQ / questions.length) * 100}%` }} />
      </div>

      <div className="glass-panel p-8 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${diffBadge[q.difficulty] || ""}`}>{q.difficulty}</span>
          <span className="text-[10px] px-2 py-0.5 bg-dark-700 text-gray-400 rounded-full">{q.type}</span>
        </div>
        <h3 className="text-xl font-medium text-gray-100 leading-relaxed">{q.question}</h3>

        <div className="grid gap-3">
          {q.options.map((option, idx) => {
            let btnClass = "bg-dark-700/80 border-dark-500 text-gray-300 hover:bg-dark-600 hover:border-neon-cyan/30";
            if (isAnswered) {
              if (option === q.answer) btnClass = "bg-neon-green/20 border-neon-green text-neon-green shadow-[0_0_15px_#39ff1433]";
              else if (option === selectedAnswer && option !== q.answer) btnClass = "bg-red-500/20 border-red-500 text-red-400";
              else btnClass = "bg-dark-800 border-dark-600 text-gray-600";
            }
            return (
              <button key={idx} onClick={() => handleAnswer(option)} disabled={isAnswered}
                className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-300 font-medium ${btnClass} disabled:cursor-default`}>
                <span className="text-xs text-gray-500 mr-3 font-mono">{String.fromCharCode(65 + idx)}.</span>
                {option}
              </button>
            );
          })}
        </div>

        {showExplanation && q.explanation && (
          <div className="p-3 bg-neon-cyan/5 border border-neon-cyan/30 rounded-lg text-sm text-gray-300 animate-fade-in">
            <strong className="text-neon-cyan">💡 </strong>{q.explanation}
          </div>
        )}
      </div>
    </div>
  );
}
