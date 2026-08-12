import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { problemsApi } from '../lib/api';

export const PracticeList = ({ onSelect }) => {
  const { data: problems, isLoading, error } = useQuery({
    queryKey: ['problems'],
    queryFn: () => problemsApi.getList()
  });

  if (isLoading) return <div className="p-8 text-center">Loading problems...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Failed to load problems: {error.message}</div>;

  return (
    <div className="practice-list p-8 animate-fade-in max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Coding Practice</h2>
      <p className="text-gray-400 mb-8">Master data structures and algorithms with hands-on coding challenges.</p>
      
      <div className="problems-grid grid gap-4">
        {problems?.map(problem => (
          <div key={problem.slug} 
               onClick={() => onSelect(problem.slug)}
               className="problem-card bg-gray-800 p-5 rounded-lg border border-gray-700 cursor-pointer hover:border-blue-500 transition-colors flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">{problem.title}</h3>
              <div className="flex gap-3 text-sm mt-2 text-gray-400">
                <span>{problem.category}</span>
                <span>•</span>
                <span>{problem.pattern}</span>
              </div>
            </div>
            <span className={`difficulty-badge ${problem.difficulty.toLowerCase()}`}>
              {problem.difficulty}
            </span>
          </div>
        ))}
        {(!problems || problems.length === 0) && (
            <div className="text-gray-500 text-center py-8 bg-gray-800 rounded">
               No problems populated in database yet. Try running the backend seed script.
            </div>
        )}
      </div>
    </div>
  );
};
