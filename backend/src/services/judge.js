// Mock integration with Judge0 CE
// In production, JUDGE0_URL would be your self-hosted Docker instance URL (e.g., http://localhost:2358)

const JUDGE0_URL = process.env.JUDGE0_URL || 'https://judge0-ce.p.rapidapi.com';

const mockDb = new Map();

export const submitCode = async (sourceCode, languageId, stdin) => {
  // Return a mock token for development purposes
  const token = `sub_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  
  // Simulate asynchronous execution
  mockDb.set(token, { status: { id: 1, description: 'In Queue' } });
  
  setTimeout(() => {
    mockDb.set(token, { status: { id: 2, description: 'Processing' } });
    
    setTimeout(() => {
      // Simulate success
      mockDb.set(token, {
        status: { id: 3, description: 'Accepted' },
        time: "0.045",
        memory: 2048,
        stdout: "Test Case 1 Passed\nTest Case 2 Passed\n",
        stderr: null,
        compile_output: null
      });
    }, 1000);
  }, 500);

  return token;
};

export const getSubmissionStatus = async (token) => {
  const result = mockDb.get(token);
  if (!result) throw new Error('Submission not found');
  return result;
};
