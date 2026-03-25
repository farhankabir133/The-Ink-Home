import React, { useState, useEffect, useMemo } from 'react';
import MediumSearchBar from '../components/MediumSearchBar';
import { useMediumFeed, MediumStory } from '../hooks/useMediumFeed';
import { mediumArticles } from '../constants/mediumArticles';
import {
  CATEGORIES,
  getCategoryStats,
  getPrimaryCategory,
  type Category,
} from '../constants/categories';

// ── Author avatar initials ────────────────────────────────────────────────────
const Avatar: React.FC<{ name: string }> = ({ name }) => (
  <div className="w-8 h-8 rounded-full bg-ink-accent flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
    {name.charAt(0)}
  </div>
);

// ── Skeleton card ─────────────────────────────────────────────────────────────
const SkeletonCard: React.FC = () => (
  <div className="bg-white dark:bg-slate-800/50 rounded-2xl overflow-hidden shadow-sm animate-pulse">
    <div className="h-52 bg-slate-200 dark:bg-slate-700" />
    <div className="p-5 space-y-3">
      <div className="flex gap-2">
        <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
        <div className="h-5 w-12 bg-slate-200 dark:bg-slate-700 rounded-full" />
      </div>
      <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-full" />
      <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-4/5" />
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mt-2" />
    </div>
  </div>
);

// ── Story card ────────────────────────────────────────────────────────────────
const StoryCard: React.FC<{ story: MediumStory; idx: number }> = ({ story, idx }) => {
  const category = getPrimaryCategory(story.tags || []);
  
  return (
    <a
      href={story.externalUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-white dark:bg-slate-800/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 opacity-0 animate-fadeInUp h-full flex flex-col"
      style={{ animationDelay: `${idx * 80}ms` }}
    >
      {/* Cover image */}
      <div className="relative overflow-hidden h-52 flex-shrink-0">
        <img
          src={story.imageUrl}
          alt={story.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={e => {
            (e.target as HTMLImageElement).src =
              'https://cdn-images-1.medium.com/proxy/1*TGH72Nnw24QL3iV9IOm4VA.png';
          }}
        />
        {/* Category badge on image */}
        <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r ${category.gradient} text-white text-xs font-semibold shadow-md`}>
          <span>{category.emoji}</span>
          <span>{category.name.split(' ')[0]}</span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        {/* Tags */}
        {story.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {story.tags.slice(0, 3).map(t => (
              <span
                key={t}
                className="text-xs bg-amber-50 dark:bg-amber-900/20 text-ink-accent font-medium px-2.5 py-0.5 rounded-full"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h3 className="font-serif text-xl font-bold text-slate-800 dark:text-slate-100 leading-snug mb-2 group-hover:text-ink-accent transition-colors duration-300 flex-grow">
          {story.title}
        </h3>

        {/* Excerpt */}
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 mb-4">
          {story.excerpt}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Avatar name={story.author} />
            <div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{story.author}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">{story.date}</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-ink-accent flex items-center gap-1 group-hover:gap-2 transition-all">
            Read
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </span>
        </div>
      </div>
    </a>
  );
};

// ── Author filter tab ─────────────────────────────────────────────────────────
const AUTHORS = ['All', 'Farhan Kabir', 'Dua Batool'] as const;
type AuthorFilter = (typeof AUTHORS)[number];

// ── Convert static fallback to MediumStory shape ──────────────────────────────
function staticToMediumStory(a: typeof mediumArticles[0], idx: number): MediumStory {
  return {
    id: String(a.id),
    title: a.title,
    author: a.author,
    date: a.date,
    excerpt: a.excerpt,
    imageUrl: a.imageUrl,
    externalUrl: a.externalUrl ?? 'https://medium.com/the-ink-home',
    tags: a.tags ?? [],
    featured: a.featured,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
const PublicationPage: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Live RSS feed
  const { stories: liveStories, loading, error } = useMediumFeed();

  // Merge live feed + older static-only stories (dedup by externalUrl)
  // Priority: live feed if available, otherwise static fallback
  const allStories: MediumStory[] = useMemo(() => {
    // Always start with static stories as base
    const staticStories = mediumArticles.map(staticToMediumStory);
    
    if (liveStories.length > 0) {
      // Live feed loaded: merge with static (live takes priority, dedup by title)
      const liveTitles = new Set(liveStories.map(s => s.title.toLowerCase()));
      const uniqueStatic = staticStories.filter(s => !liveTitles.has(s.title.toLowerCase()));
      return [...liveStories, ...uniqueStatic];
    }
    
    // No live stories (loading or error): use static fallback
    return staticStories;
  }, [liveStories]);

  // Author filter
  const [authorFilter, setAuthorFilter] = useState<AuthorFilter>('All');

  // Category filter
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Search-filtered stories (starts as full list, updated by MediumSearchBar)
  const [searchFiltered, setSearchFiltered] = useState<MediumStory[]>([]);
  useEffect(() => {
    setSearchFiltered(allStories);
  }, [allStories]);

  // Category stats for filter badges
  const categoryStats = useMemo(() => {
    const storiesWithTags = allStories.map(s => ({ tags: s.tags || [] }));
    return getCategoryStats(storiesWithTags);
  }, [allStories]);

  // Apply author + category filter on top of search
  const displayStories = useMemo(() => {
    let filtered = searchFiltered;
    
    // Apply author filter
    if (authorFilter !== 'All') {
      filtered = filtered.filter(s => s.author === authorFilter);
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(s => {
        const storyCategory = getPrimaryCategory(s.tags || []);
        return storyCategory.id === categoryFilter;
      });
    }
    
    return filtered;
  }, [searchFiltered, authorFilter, categoryFilter]);

  // Author counts for badges
  const farhanCount = allStories.filter(s => s.author === 'Farhan Kabir').length;
  const duaCount = allStories.filter(s => s.author === 'Dua Batool').length;

  return (
    <div className={`${mounted ? 'opacity-100 animate-fadeInUp' : 'opacity-0'}`}>

      {/* ── HERO HEADER ───────────────────────────────────────────────────── */}
      <div className="relative bg-ink-dark overflow-hidden py-28 px-6">
        {/* Decorative blurred blobs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-ink-accent/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-ink-accent/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative container mx-auto text-center max-w-3xl">
          {/* Publication badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
            <img
              src="https://cdn-images-1.medium.com/proxy/1*TGH72Nnw24QL3iV9IOm4VA.png"
              alt="The Ink Home"
              className="w-4 h-4 rounded-full object-cover"
            />
            The Ink Home · Medium Publication
          </div>

          <h1 className="text-5xl md:text-6xl font-serif font-bold text-white mb-5 leading-tight animate-scaleIn">
            All Stories
          </h1>
          <p
            className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed animate-fadeInUp"
            style={{ animationDelay: '150ms' }}
          >
            Every essay, reflection, and insight published on{' '}
            <a
              href="https://medium.com/the-ink-home"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-accent hover:underline font-semibold"
            >
              The Ink Home
            </a>
            {' '}— live from Medium, updated automatically.
          </p>

          {/* Live story count */}
          {!loading && (
            <div
              className="flex items-center justify-center gap-6 mt-8 animate-fadeInUp"
              style={{ animationDelay: '300ms' }}
            >
              <div className="text-center">
                <p className="text-3xl font-serif font-bold text-white">{allStories.length}+</p>
                <p className="text-xs text-slate-400 uppercase tracking-wide mt-0.5">Stories</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <p className="text-3xl font-serif font-bold text-white">2</p>
                <p className="text-xs text-slate-400 uppercase tracking-wide mt-0.5">Authors</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <p className="text-3xl font-serif font-bold text-white">2025–</p>
                <p className="text-xs text-slate-400 uppercase tracking-wide mt-0.5">Since</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── CONTROLS ──────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex flex-col sm:flex-row items-center gap-4">

          {/* Author filter tabs */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {AUTHORS.map(a => {
              const count =
                a === 'All' ? allStories.length : a === 'Farhan Kabir' ? farhanCount : duaCount;
              return (
                <button
                  key={a}
                  onClick={() => setAuthorFilter(a)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    authorFilter === a
                      ? 'bg-ink-accent text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {a === 'All' ? 'All' : a.split(' ')[0]}
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                      authorFilter === a
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Live indicator */}
          {!loading && !error && liveStories.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium sm:ml-auto flex-shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Live from Medium
            </div>
          )}
          {error && (
            <p className="text-xs text-amber-600 dark:text-amber-400 sm:ml-auto">
              Showing cached stories
            </p>
          )}
        </div>

        {/* Category filter tabs */}
        <div className="container mx-auto px-6 py-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium mr-2 flex-shrink-0">
              Category:
            </span>
            <button
              onClick={() => setCategoryFilter('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex-shrink-0 ${
                categoryFilter === 'all'
                  ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-800 shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              All Categories
            </button>
            {categoryStats.map(({ category, count }) => (
              <button
                key={category.id}
                onClick={() => setCategoryFilter(category.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex-shrink-0 ${
                  categoryFilter === category.id
                    ? `bg-gradient-to-r ${category.gradient} text-white shadow-md`
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{category.emoji}</span>
                <span>{category.name.split(' ')[0]}</span>
                <span className={`text-xs px-1 py-0.5 rounded-full ${
                  categoryFilter === category.id
                    ? 'bg-white/20'
                    : 'bg-slate-200 dark:bg-slate-700'
                }`}>
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── SEARCH + GRID ─────────────────────────────────────────────────── */}
      <div className="container mx-auto px-6 py-14">

        <MediumSearchBar stories={allStories} onFiltered={setSearchFiltered} />

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 9 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Stories grid */}
        {!loading && displayStories.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayStories.map((story, idx) => (
              <StoryCard key={story.id} story={story} idx={idx} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && displayStories.length === 0 && (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-2xl font-serif font-bold text-slate-700 dark:text-slate-200 mb-2">
              No stories found
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              Try a different search term or switch the author filter.
            </p>
          </div>
        )}
      </div>

      {/* ── CTA FOOTER ────────────────────────────────────────────────────── */}
      <div className="bg-amber-50 dark:bg-slate-900 border-t border-amber-100 dark:border-slate-800 py-16 px-6 text-center">
        <p className="text-ink-accent text-sm font-semibold uppercase tracking-widest mb-3">
          Want more?
        </p>
        <h2 className="font-serif text-3xl font-bold text-slate-800 dark:text-slate-100 mb-3">
          Follow us on Medium
        </h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto mb-6 text-base leading-relaxed">
          New stories are published every week. Follow{' '}
          <strong className="text-slate-700 dark:text-slate-200">The Ink Home</strong> on Medium to get
          them straight in your feed.
        </p>
        <a
          href="https://medium.com/the-ink-home"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-ink-accent hover:bg-opacity-90 active:scale-95 text-white font-semibold px-8 py-3.5 rounded-full transition-all duration-300 shadow-lg"
        >
          Open Publication on Medium
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>

    </div>
  );
};

export default PublicationPage;
