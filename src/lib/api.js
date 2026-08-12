const API_BASE_URL = 'http://localhost:4000/api';

// Helper for fetching
export const fetchApi = async (endpoint, options = {}) => {
  const token = localStorage.getItem('accessToken');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
       const errBody = await response.json();
       errorMessage = errBody.error || errorMessage;
    } catch (e) {}
    throw new Error(errorMessage);
  }

  // Handle 204 No Content or empty responses
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

// API Services
export const problemsApi = {
  getList: (filters = '') => fetchApi(`/problems${filters}`),
  getBySlug: (slug) => fetchApi(`/problems/${slug}`),
  getEditorial: (slug) => fetchApi(`/problems/${slug}/editorial`),
};

export const submissionApi = {
  run: (source_code, language_id) => fetchApi('/submissions/run', {
    method: 'POST',
    body: JSON.stringify({ source_code, language_id })
  }),
  submit: (problem_id, language, code) => fetchApi('/submissions', {
    method: 'POST',
    body: JSON.stringify({ problem_id, language, code })
  }),
  getStatus: (id) => fetchApi(`/submissions/${id}`)
};

export const aiApi = {
  getHint: (problemSlug, userCode, hintLevel) => fetchApi('/ai/hint', {
    method: 'POST',
    body: JSON.stringify({ problemSlug, userCode, hintLevel })
  }),
  explainStep: (topic, stepState, stepDescription) => fetchApi('/ai/explain-step', {
    method: 'POST',
    body: JSON.stringify({ topic, stepState, stepDescription })
  })
};

export const dashboardApi = {
  getStats: () => fetchApi('/users/me/dashboard')
};

export const quizApi = {
   getQuestions: (topic) => fetchApi(`/quiz/questions${topic ? `?topic=${topic}` : ''}`),
   submitSession: (answers) => fetchApi('/quiz/sessions', {
       method: 'POST',
       body: JSON.stringify({ answers })
   })
};

export const learnApi = {
   getTopics: () => fetchApi('/learn/topics'),
   complete: (topic) => fetchApi('/learn/complete', {
       method: 'POST',
       body: JSON.stringify({ topic })
   })
};
