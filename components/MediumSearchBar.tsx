import React, { useState, useMemo, useEffect } from 'react';
import type { MediumStory } from '../hooks/useMediumFeed';

interface MediumSearchBarProps {
  stories: MediumStory[];
  onFiltered: (filtered: MediumStory[]) => void;
}

const MediumSearchBar: React.FC<MediumSearchBarProps> = ({ stories, onFiltered }) => {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return stories;
    const q = query.toLowerCase().trim();
    return stories.filter(
      s =>
        s.title.toLowerCase().includes(q) ||
        s.excerpt.toLowerCase().includes(q) ||
        s.author.toLowerCase().includes(q) ||
        s.tags.some(t => t.toLowerCase().includes(q)),
    );
  }, [stories, query]);

  useEffect(() => {
    onFiltered(filtered);
  }, [filtered, onFiltered]);

  return (
    <div className="w-full max-w-2xl mx-auto mb-10">
      <div className="relative">
        {/* Search icon */}
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </div>

        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search stories, authors, or topics…"
          className="w-full pl-12 pr-12 py-4 text-base border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-ink-accent focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
          aria-label="Search stories"
        />

        {/* Clear button */}
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            aria-label="Clear search"
          >
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      {/* Result count */}
      {query && (
        <p className="mt-3 text-sm text-center text-slate-500 dark:text-slate-400">
          {filtered.length === 0
            ? 'No stories match your search.'
            : `${filtered.length} ${filtered.length === 1 ? 'story' : 'stories'} found`}
        </p>
      )}
    </div>
  );
};

export default MediumSearchBar;
