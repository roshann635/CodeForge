import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { problemsApi, submissionApi, aiApi } from '../lib/api';
import { CodeEditor } from '../components/Practice/CodeEditor';
import { TerminalPanel } from '../components/Practice/TerminalPanel';
import { PracticeList } from '../components/Practice/PracticeList';
import { Play, Send, Lightbulb, ChevronLeft } from 'lucide-react';

export const PracticePage = ({ initialSlug }) => {
  const [slug, setSlug] = useState(initialSlug);

  // Sync hash state if changed externally
  useEffect(() => {
     if(initialSlug !== slug) {
        setSlug(initialSlug);
     }
  }, [initialSlug]);

  if (!slug) {
     return <PracticeList onSelect={(s) => {
         window.location.hash = `#/practice/${s}`;
         setSlug(s);
     }} />;
  }

  return <PracticeProblem slug={slug} onBack={() => {
      window.location.hash = `#/practice`;
      setSlug(null);
  }} />;
};

const PracticeProblem = ({ slug, onBack }) => {
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState('idle');
  const [aiHint, setAiHint] = useState('');
  const [hintLevel, setHintLevel] = useState(1);

  const { data: problem, isLoading } = useQuery({
    queryKey: ['problem', slug],
    queryFn: () => problemsApi.getBySlug(slug)
  });

  // Set initial code templates when problem loads
  useEffect(() => {
    if (problem?.templates && !code) {
      setCode(problem.templates[language] || '');
    }
  }, [problem, language]);

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    setCode(problem?.templates?.[lang] || '');
  };

  const runMutation = useMutation({
    mutationFn: () => submissionApi.run(code, language),
    onMutate: () => {
      setStatus('running');
      setOutput('Compiling and running against sample test cases...');
    },
    onSuccess: (data) => {
      setStatus('success');
      setOutput(`Processing token: ${data.token}\n\n(Mock backend instantly schedules execution)`);
    },
    onError: (err) => {
      setStatus('error');
      setOutput(`Run Failed: ${err.message}`);
    }
  });

  const submitMutation = useMutation({
    mutationFn: () => submissionApi.submit(problem._id, language, code),
    onMutate: () => {
      setStatus('running');
      setOutput('Submitting full test suite...\n');
    },
    onSuccess: (data) => {
      setStatus('success');
      setOutput(`Submission Queued: ${data.id}\nStatus: ${data.status}\n\nPolling would normally display final execution time and test passes.`);
    },
    onError: (err) => {
      setStatus('error');
      setOutput(`Submission Error: ${err.message}`);
    }
  });

  const hintMutation = useMutation({
    mutationFn: () => aiApi.getHint(slug, code, hintLevel),
    onSuccess: (data) => {
      setAiHint(data.hint);
      setHintLevel(prev => Math.min(prev + 1, 3));
    }
  });

  if (isLoading) return <div className="p-8 text-center">Loading problem...</div>;
  if (!problem) return <div className="p-8 text-center text-red-500">Problem not found</div>;

  return (
    <div className="practice-page animate-fade-in">
      <div className="practice-layout">
        
        {/* Left column: Problem description */}
        <div className="problem-panel">
          <div className="panel-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button onClick={onBack} title="Back to Problems" className="bg-transparent border-0 cursor-pointer text-gray-400 hover:text-white">
              <ChevronLeft size={20} />
            </button>
            <h3 style={{ margin: 0 }}>{problem.title}</h3>
            <span className={`difficulty-badge ${problem.difficulty.toLowerCase()}`}>
              {problem.difficulty}
            </span>
          </div>
          <div className="problem-body" dangerouslySetInnerHTML={{ __html: problem.description }}>
          </div>
          
          {aiHint && (
            <div className="ai-hint-box animate-slide-up mt-4">
              <Lightbulb size={16} className="text-warning" style={{ marginRight: '8px' }} />
              <p>{aiHint}</p>
            </div>
          )}
          
          <button className="hint-btn mt-4" onClick={() => hintMutation.mutate()} disabled={hintMutation.isPending}>
            <Lightbulb size={14} style={{ display: 'inline-block', marginRight: '4px' }} /> 
            {hintMutation.isPending ? 'Asking AI...' : `Ask AI for Hint ${hintLevel}/3`}
          </button>
        </div>

        {/* Right column: Editor & Console */}
        <div className="editor-console-panel">
          <div className="editor-header">
            <select className="language-select" value={language} onChange={handleLanguageChange}>
              <option value="javascript">JavaScript (Node.js)</option>
              <option value="python">Python 3</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
            </select>
            <div className="editor-actions">
              <button className="run-btn" onClick={() => runMutation.mutate()} disabled={runMutation.isPending || submitMutation.isPending}>
                <Play size={14} style={{ display: 'inline-block', marginRight: '4px', verticalAlign: 'text-bottom' }} /> Run
              </button>
              <button className="submit-btn" onClick={() => submitMutation.mutate()} disabled={runMutation.isPending || submitMutation.isPending}>
                <Send size={14} style={{ display: 'inline-block', marginRight: '4px', verticalAlign: 'text-bottom' }} /> Submit
              </button>
            </div>
          </div>
          
          <div className="editor-container">
             <CodeEditor code={code} language={language} onChange={setCode} />
          </div>

          <div className="console-container">
             <TerminalPanel output={output} status={status} isRunning={runMutation.isPending || submitMutation.isPending} />
          </div>
        </div>

      </div>
    </div>
  );
};
