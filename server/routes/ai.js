const express = require('express');
const router = express.Router();
const { analyzeVoice } = require('../ai/ruleEngine');

// Code analysis endpoint
router.post('/analyze', (req, res) => {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Code required' });
    
    let feedback = 'Code structure looks solid.';
    let status = 'ok';

    // Detect nested loops → O(n²)
    const nestedLoops = code.match(/for.*\{[^}]*for|while.*\{[^}]*while/gs);
    if (nestedLoops) {
        feedback = 'Detected nested loops → likely O(n²) time complexity. Consider using a hash map for O(n) optimization.';
        status = 'warning';
    }

    // Detect recursion without memoization
    if (code.includes('function') && code.match(/(\w+)\([^)]*\)[\s\S]*\1\(/)) {
        if (!code.includes('memo') && !code.includes('cache') && !code.includes('dp')) {
            feedback = 'Recursive solution detected. Consider adding memoization to avoid redundant computations.';
            status = 'warning';
        }
    }

    // Detect hash map usage
    if (code.includes('Map()') || code.includes('{}') || code.includes('dict(')) {
        if (status === 'ok') {
            feedback = 'Good use of hash map/object for efficient lookups. Time complexity looks optimal.';
        }
    }

    // Detect sorting
    if (code.includes('.sort(')) {
        feedback += ' Note: Built-in sort is O(n log n).';
    }

    // Check for edge case handling
    if (code.includes('if') && (code.includes('null') || code.includes('undefined') || code.includes('length === 0') || code.includes('!') )) {
        feedback += ' Good edge case handling detected.';
    }

    res.json({ feedback, status });
});

// Voice analysis endpoint
router.post('/voice/analyze', async (req, res) => {
    const { transcript, topic } = req.body;
    if (!transcript || !topic) return res.status(400).json({ error: 'Missing transcript or topic' });

    const result = await analyzeVoice(transcript, topic);
    res.json(result);
});

module.exports = router;
