import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { learnApi } from '../lib/api';
import { LectureCard } from '../components/Learn/LectureCard';
import { TRACKS } from '../utils/constants';

export const LearnPage = () => {
  const [activeTrack, setActiveTrack] = useState(TRACKS.BEGINNER);

  const { data: lectures, isLoading, error } = useQuery({
      queryKey: ['learnTopics'],
      queryFn: () => learnApi.getTopics()
  });

  const filteredLectures = lectures?.filter(l => l.track === activeTrack) || [];

  return (
    <div className="learn-page animate-fade-in">
      <div className="page-header">
        <h2>Curriculum Tracks</h2>
        <p>Structured, bite-sized lessons to build your algorithmic foundation.</p>
      </div>

      <div className="track-selector">
        {Object.values(TRACKS).map(track => (
          <button 
            key={track}
            className={`track-tab ${activeTrack === track ? 'active' : ''}`}
            onClick={() => setActiveTrack(track)}
          >
            {track}
          </button>
        ))}
      </div>

      <div className="lectures-grid mt-4">
        {isLoading && <div className="text-gray-400">Loading curriculum...</div>}
        {error && <div className="text-red-500">Failed to load: {error.message}</div>}
        
        {!isLoading && !error && filteredLectures.length > 0 ? (
          filteredLectures.map(lecture => (
            <LectureCard 
              key={lecture.slug || lecture.id}
              track={lecture.track}
              title={lecture.title}
              description={lecture.description || 'Master algorithmic concepts.'}
              timeToRead={lecture.time || 15}
              isCompleted={lecture.completed || false}
              onClick={() => alert(`We will route to /learn/${lecture.slug} in the future`)}
            />
          ))
        ) : (
          !isLoading && <div className="empty-state">
            <p>More lectures coming soon to this track!</p>
          </div>
        )}
      </div>
    </div>
  );
};
