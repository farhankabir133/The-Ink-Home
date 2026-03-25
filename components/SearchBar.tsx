import React, { useState, useMemo } from 'react';
import type { Article } from '../types';

interface SearchBarProps {
  articles: Article[];
  onFilteredArticles: (filtered: Article[]) => void;
}

/**
 * Real-time search component for filtering articles
 * Searches through titles and descriptions/excerpts
 */
const SearchBar: React.FC<SearchBarProps> = ({ articles, onFilteredArticles }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter articles based on search query
  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) {
      return articles;
    }

    const query = searchQuery.toLowerCase().trim();
    
    return articles.filter(article => {
      const titleMatch = article.title.toLowerCase().includes(query);
      const excerptMatch = article.excerpt?.toLowerCase().includes(query) || false;
      const contentMatch = article.content?.toLowerCase().includes(query) || false;
      const tagsMatch = article.tags?.some(tag => tag.toLowerCase().includes(query)) || false;
      
      return titleMatch || excerptMatch || contentMatch || tagsMatch;
    });
  }, [articles, searchQuery]);

  // Update parent component whenever filtered results change
  React.useEffect(() => {
    onFilteredArticles(filteredArticles);
  }, [filteredArticles, onFilteredArticles]);

  return (
    <div className="w-full max-w-2xl mx-auto mb-12">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg 
            className="h-5 w-5 text-slate-400" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" 
              clipRule="evenodd" 
            />
          </svg>
        </div>
        <input
          id="search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search stories by title, content, or tags..."
          className="w-full pl-12 pr-4 py-3.5 text-base border-2 border-slate-200 dark:border-slate-700 rounded-lg 
                   bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 
                   placeholder-slate-400 dark:placeholder-slate-500
                   focus:outline-none focus:ring-2 focus:ring-ink-accent focus:border-transparent
                   transition-all duration-300 shadow-sm hover:shadow-md"
          aria-label="Search articles"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            aria-label="Clear search"
          >
            <svg 
              className="h-5 w-5" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                clipRule="evenodd" 
              />
            </svg>
          </button>
        )}
      </div>
      {searchQuery && (
        <div className="mt-3 text-sm text-slate-600 dark:text-slate-400 text-center">
          Found {filteredArticles.length} {filteredArticles.length === 1 ? 'story' : 'stories'}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
