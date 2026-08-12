import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '../lib/api';

export const BookmarksPage = () => {
  const queryClient = useQueryClient();

  const { data: bookmarks, isLoading, error } = useQuery({
      queryKey: ['bookmarks'],
      queryFn: () => fetchApi('/bookmarks')
  });

  const deleteMutation = useMutation({
      mutationFn: (id) => fetchApi(`/bookmarks/${id}`, { method: 'DELETE' }),
      onSuccess: () => queryClient.invalidateQueries(['bookmarks'])
  });

  if (isLoading) return <div className="p-8 text-center text-gray-400">Loading bookmarks...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Failed to load bookmarks</div>;

  return (
    <div className="bookmarks-page animate-fade-in p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">My Bookmarks</h2>

      {(!bookmarks || bookmarks.length === 0) ? (
        <div className="empty-state bg-gray-800 p-8 rounded-lg text-center">
          <p className="text-gray-400">You haven't bookmarked any visualizers or problems yet.</p>
        </div>
      ) : (
        <div className="bookmarks-grid grid gap-4">
          {bookmarks.map(b => (
             <div key={b._id} className="bookmark-card bg-gray-800 p-5 rounded-lg border border-gray-700 flex justify-between items-start">
                <div>
                   <span className="text-xs uppercase tracking-wider text-blue-400 font-semibold">{b.resource_type}</span>
                   <h3 className="text-lg mt-1 font-medium">{b.resource_id}</h3>
                   {b.note && <p className="text-sm text-gray-400 mt-3 italic">"{b.note}"</p>}
                </div>
                <button 
                  onClick={() => deleteMutation.mutate(b._id)}
                  disabled={deleteMutation.isPending}
                  className="text-gray-500 hover:text-red-400 transition-colors bg-transparent border-0 cursor-pointer"
                >
                  Remove
                </button>
             </div>
          ))}
        </div>
      )}
    </div>
  );
};
