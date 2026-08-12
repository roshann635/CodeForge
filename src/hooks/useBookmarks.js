import { useState, useCallback } from 'react';
import { storage } from '../utils/storage';

export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState(() => {
    return storage.get('algolens_bookmarks', []);
  });

  const toggleBookmark = useCallback((item) => {
    setBookmarks(prev => {
      const isBookmarked = prev.some(b => b.id === item.id);
      let newBookmarks;
      if (isBookmarked) {
        newBookmarks = prev.filter(b => b.id !== item.id);
      } else {
        newBookmarks = [...prev, { ...item, timestamp: Date.now(), note: '' }];
      }
      storage.set('algolens_bookmarks', newBookmarks);
      return newBookmarks;
    });
  }, []);

  const updateNote = useCallback((id, note) => {
    setBookmarks(prev => {
      const newBookmarks = prev.map(b => b.id === id ? { ...b, note } : b);
      storage.set('algolens_bookmarks', newBookmarks);
      return newBookmarks;
    });
  }, []);

  const isBookmarked = useCallback((id) => {
    return bookmarks.some(b => b.id === id);
  }, [bookmarks]);

  return { bookmarks, toggleBookmark, updateNote, isBookmarked };
};
