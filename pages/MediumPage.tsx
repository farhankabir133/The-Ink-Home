import React, { useState, useEffect, useMemo } from 'react';
import MediumSearchBar from '../components/MediumSearchBar';
import { useMediumFeed, MediumStory } from '../hooks/useMediumFeed';
import { mediumArticles } from '../constants/mediumArticles';

// ── Convert static fallback to MediumStory ────────────────────────────────────
function staticToMediumStory(a: typeof mediumArticles[0], _idx: number): MediumStory {
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

// ── Extract primary category from tags ────────────────────────────────────────
function getPrimaryCategory(tags: string[]): string {
  if (!tags.length) return 'Uncategorized';
  
  const categoryKeywords: { [key: string]: string[] } = {
    Love: ['love', 'relationship', 'heartbreak', 'emotional'],
    'Self Improvement': ['self improvement', 'growth', 'habits', 'mindfulness', 'focus'],
    AI: ['ai', 'artificial intelligence', 'machine learning', 'technology'],
    Writing: ['writing', 'content creation', 'creativity', 'writing life'],
    Psychology: ['psychology', 'mental health', 'adhd', 'brain health', 'kleptomania'],
    'Human Rights': ['human rights', 'pakistan', 'accountability', 'public safety', 'fire safety', 'crime'],
    'Life Lessons': ['life lessons', 'reflection', 'shakespeare', 'english literature', 'thinking'],
  };

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (tags.some(tag => 
      keywords.some(kw => tag.toLowerCase().includes(kw.toLowerCase()))
    )) {
      return category;
    }
  }

  return tags[0] || 'Featured';
}

// ── Skeleton card ─────────────────────────────────────────────────────────────
const SkeletonCard: React.FC = () => (
  <div className="bg-white dark:bg-slate-800/50 rounded-2xl overflow-hidden">
    <div className="skeleton-shimmer h-52 w-full" />
    <div className="p-5 space-y-3">
      <div className="flex gap-2">
        <div className="skeleton-shimmer h-5 w-16 rounded-full" />
        <div className="skeleton-shimmer h-5 w-12 rounded-full" />
      </div>
      <div className="skeleton-shimmer h-5 w-full rounded" />
      <div className="skeleton-shimmer h-5 w-4/5 rounded" />
      <div className="skeleton-shimmer h-4 w-2/3 rounded" />
      <div className="skeleton-shimmer h-3 w-1/3 rounded mt-2" />
    </div>
  </div>
);

// ── Avatar ────────────────────────────────────────────────────────────────────
const Avatar: React.FC<{ name: string; size?: string }> = ({ name, size = 'w-8 h-8 text-xs' }) => (
  <div
    className={`${size} rounded-full bg-ink-accent flex items-center justify-center text-white font-bold flex-shrink-0`}
  >
    {name.charAt(0)}
  </div>
);

// ── Live dot ──────────────────────────────────────────────────────────────────
const LiveDot: React.FC = () => (
  <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold tracking-wide uppercase">
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
    </span>
    Live
  </span>
);

// ── Stat chip ─────────────────────────────────────────────────────────────────
const StatChip: React.FC<{ value: string | number; label: string; delay: number }> = ({ value, label, delay }) => (
  <div
    className="flex flex-col items-center opacity-0 animate-countUp"
    style={{ animationDelay: `${delay}ms` }}
  >
    <span className="stat-counter text-4xl md:text-5xl font-serif font-bold text-white leading-none">
      {value}
    </span>
    <span className="text-xs text-slate-400 tracking-widest uppercase mt-1">{label}</span>
  </div>
);

// ── Enhanced Story Card ───────────────────────────────────────────────────────
const StoryCard: React.FC<{ story: MediumStory; idx: number; isFeatured?: boolean }> = ({ story, idx, isFeatured = false }) => {
  const isEven = idx % 2 === 0;
  return (
    <a
      href={story.externalUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`glow-card group block bg-white dark:bg-slate-800/60 rounded-2xl overflow-hidden shadow-sm opacity-0 h-full flex flex-col transition-all duration-500 hover:shadow-2xl ${
        isEven ? 'animate-slideInLeft' : 'animate-slideInRight'
      } ${isFeatured ? 'ring-2 ring-ink-accent/50' : ''}`}
      style={{ animationDelay: `${idx * 60}ms` }}
    >
      {/* Featured badge */}
      {isFeatured && (
        <div className="absolute top-4 right-4 z-10 bg-ink-accent text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 animate-bounceIn">
          <span>⭐</span> Featured
        </div>
      )}

      {/* Cover image */}
      <div className="overflow-hidden h-52 flex-shrink-0 relative">
        <img
          src={story.imageUrl}
          alt={story.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
          onError={e => {
            (e.target as HTMLImageElement).src =
              'https://cdn-images-1.medium.com/proxy/1*TGH72Nnw24QL3iV9IOm4VA.png';
          }}
        />
        {/* Ink-accent left stripe on hover */}
        <div className="absolute inset-y-0 left-0 w-1 bg-ink-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100 dark:border-slate-700/60">
          <div className="flex items-center gap-2">
            <Avatar name={story.author} />
            <div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{story.author}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">{story.date}</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-ink-accent flex items-center gap-1 group-hover:gap-2 transition-all duration-200">
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

// ── Category Flashcard Showcase ───────────────────────────────────────────────
const CategoryShowcase: React.FC<{ 
  category: string; 
  stories: MediumStory[]; 
  idx: number;
}> = ({ category, stories, idx }) => {
  const [expanded, setExpanded] = useState(false);

  if (stories.length === 0) return null;

  const categoryEmojis: { [key: string]: string } = {
    Love: '💕',
    'Self Improvement': '🚀',
    AI: '🤖',
    Writing: '✍️',
    Psychology: '🧠',
    'Human Rights': '✊',
    'Life Lessons': '📖',
    Featured: '⭐',
    Uncategorized: '📝',
  };

  const categoryColors: { [key: string]: string } = {
    Love: 'from-rose-500 to-pink-500',
    'Self Improvement': 'from-blue-500 to-cyan-500',
    AI: 'from-purple-500 to-indigo-500',
    Writing: 'from-amber-500 to-orange-500',
    Psychology: 'from-green-500 to-emerald-500',
    'Human Rights': 'from-red-500 to-rose-500',
    'Life Lessons': 'from-yellow-500 to-amber-500',
    Featured: 'from-ink-accent to-amber-400',
    Uncategorized: 'from-slate-500 to-slate-600',
  };

  const emoji = categoryEmojis[category] || '📚';
  const gradient = categoryColors[category] || 'from-slate-500 to-slate-600';

  return (
    <div
      className={`group opacity-0 animate-fadeInUp transition-all duration-500 ${
        expanded ? 'sm:col-span-2' : ''
      }`}
      style={{ animationDelay: `${idx * 100}ms` }}
    >
      {/* Header Card */}
      <div
        onClick={() => setExpanded(!expanded)}
        className={`relative overflow-hidden rounded-2xl p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl bg-gradient-to-br ${gradient} text-white min-h-[200px] flex flex-col justify-between`}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)`
          }} />
        </div>

        <div className="relative z-10">
          <div className="text-4xl mb-3">{emoji}</div>
          <h3 className="font-serif text-3xl font-bold mb-2">{category}</h3>
          <p className="text-white/80 text-sm">
            {stories.length} {stories.length === 1 ? 'story' : 'stories'}
          </p>
        </div>

        {/* Expand indicator */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="text-sm font-semibold opacity-80">
            {expanded ? 'Collapse' : 'Explore'}
          </span>
          <svg
            className={`w-5 h-5 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Glow on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Expanded stories grid */}
      {expanded && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 animate-scaleReveal">
          {stories.slice(0, 4).map((story, storyIdx) => (
            <StoryCard
              key={story.id}
              story={story}
              idx={storyIdx}
              isFeatured={storyIdx === 0}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
const MediumPage: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Live RSS feed
  const { stories: liveStories, loading, error } = useMediumFeed();

  // Merge live feed + older static stories
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

  // Search / filter state
  const [filteredStories, setFilteredStories] = useState<MediumStory[]>([]);
  useEffect(() => {
    setFilteredStories(allStories);
  }, [allStories]);

  // Group stories by category
  const storiesByCategory = useMemo(() => {
    const grouped: { [key: string]: MediumStory[] } = {};
    
    filteredStories.forEach(story => {
      const category = getPrimaryCategory(story.tags);
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(story);
    });

    // Sort categories by story count (descending)
    return Object.entries(grouped)
      .sort(([, a], [, b]) => b.length - a.length)
      .reduce((acc, [cat, stories]) => {
        acc[cat] = stories;
        return acc;
      }, {} as { [key: string]: MediumStory[] });
  }, [filteredStories]);

  const displayedStories = filteredStories.length > 0 ? filteredStories : allStories;

  // Featured story (newest)
  const featuredStory = allStories[0];

  // Author spotlight counts
  const farhanCount = allStories.filter(s => s.author.toLowerCase().includes('farhan')).length;
  const duaCount = allStories.filter(s => s.author.toLowerCase().includes('dua')).length;

  if (!mounted) return null;

  return (
    <div>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative bg-ink-dark overflow-hidden min-h-[520px] flex flex-col justify-center">
        {/* Grain overlay */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
            backgroundSize: '256px 256px',
          }}
        />

        {/* Top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-ink-accent to-transparent opacity-70" />

        <div className="relative container mx-auto px-6 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left — headline block */}
            <div className="space-y-6">
              <div className="opacity-0 animate-slideInLeft" style={{ animationDelay: '0ms' }}>
                <LiveDot />
              </div>

              <h1
                className="font-serif font-bold text-white leading-[1.1] opacity-0 animate-slideInLeft"
                style={{ fontSize: 'clamp(2.6rem, 5vw, 4.2rem)', animationDelay: '80ms' }}
              >
                Words that{' '}
                <span
                  className="text-ink-accent inline-block opacity-0 animate-revealClip"
                  style={{ animationDelay: '400ms' }}
                >
                  move you.
                </span>
              </h1>

              <p
                className="text-slate-400 text-lg leading-relaxed max-w-md opacity-0 animate-fadeInUp"
                style={{ animationDelay: '300ms' }}
              >
                Essays, reflections, and stories from{' '}
                <span className="text-ink-accent font-semibold">The Ink Home</span> — published
                on Medium. New stories, honest ideas.
              </p>

              <div
                className="flex flex-wrap gap-4 opacity-0 animate-fadeInUp"
                style={{ animationDelay: '500ms' }}
              >
                <a
                  href="https://medium.com/the-ink-home"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-ink-accent text-white px-6 py-3 rounded-full font-semibold text-sm hover:brightness-110 active:scale-95 transition-all duration-200"
                  style={{ boxShadow: '0 8px 24px -4px rgba(163,139,119,0.45)' }}
                >
                  Open on Medium
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </a>
                <a
                  href="#categories"
                  className="inline-flex items-center gap-2 border border-slate-600 text-slate-300 hover:border-ink-accent hover:text-ink-accent px-6 py-3 rounded-full font-semibold text-sm transition-all duration-200"
                >
                  Explore categories
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Right — stat chips */}
            <div
              className="flex justify-center md:justify-end opacity-0 animate-slideInRight"
              style={{ animationDelay: '200ms' }}
            >
              <div className="ticker-bar rounded-2xl p-8 grid grid-cols-3 gap-6 divide-x divide-slate-700">
                <StatChip
                  value={loading ? '—' : allStories.length}
                  label="Stories"
                  delay={600}
                />
                <div className="pl-6">
                  <StatChip value="2" label="Authors" delay={700} />
                </div>
                <div className="pl-6">
                  <StatChip value="2025" label="Est." delay={800} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom accent bar */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ink-accent/40 to-transparent" />
      </section>

      {/* ── FEATURED STORY HERO ──────────────────────────────────────────── */}
      {featuredStory && (
        <section className="container mx-auto px-6 py-16">
          <div className="mb-6 opacity-0 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">⭐</span>
              <p className="text-xs font-bold tracking-widest uppercase text-ink-accent">
                Featured Story
              </p>
            </div>
            <h2 className="font-serif text-2xl font-bold text-slate-800 dark:text-slate-100">
              Latest Highlight
            </h2>
          </div>

          <div className="opacity-0 animate-scaleReveal" style={{ animationDelay: '150ms' }}>
            <a
              href={featuredStory.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="glow-card group flex flex-col sm:flex-row gap-6 bg-gradient-to-br from-ink-accent/10 to-amber-100/5 dark:from-ink-accent/5 dark:to-slate-800/50 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl border border-ink-accent/10 transition-all duration-500"
            >
              {/* Image */}
              <div className="sm:w-1/3 overflow-hidden rounded-2xl h-64 sm:h-auto">
                <img
                  src={featuredStory.imageUrl}
                  alt={featuredStory.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                  onError={e => {
                    (e.target as HTMLImageElement).src =
                      'https://cdn-images-1.medium.com/proxy/1*TGH72Nnw24QL3iV9IOm4VA.png';
                  }}
                />
              </div>

              {/* Content */}
              <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  {/* Tags */}
                  {featuredStory.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {featuredStory.tags.slice(0, 3).map(t => (
                        <span
                          key={t}
                          className="text-xs bg-ink-accent/20 text-ink-accent dark:bg-ink-accent/10 font-semibold px-3 py-1.5 rounded-full"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  <h3 className="font-serif text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-3 group-hover:text-ink-accent transition-colors duration-300">
                    {featuredStory.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base mb-6">
                    {featuredStory.excerpt}
                  </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <Avatar name={featuredStory.author} size="w-10 h-10 text-sm" />
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {featuredStory.author}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {featuredStory.date}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-ink-accent flex items-center gap-2 group-hover:gap-3 transition-all duration-200">
                    Read story
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                </div>
              </div>
            </a>
          </div>
        </section>
      )}

      {/* ── AUTHOR SPOTLIGHT ─────────────────────────────────────────────── */}
      <section className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800">
        <div className="container mx-auto px-6 py-10">
          <p className="text-xs font-bold tracking-widest uppercase text-ink-accent mb-6">
            The Voices Behind The Ink
          </p>
          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl">
            {[
              {
                name: 'Farhan Kabir',
                handle: '@farhankabir_',
                bio: 'Essays on life, society, and the pursuit of meaning.',
                count: farhanCount,
                delay: 0,
              },
              {
                name: 'Dua Batool',
                handle: '@dua_batool',
                bio: 'Reflections on culture, identity, and quiet truths.',
                count: duaCount,
                delay: 100,
              },
            ].map(author => (
              <a
                key={author.name}
                href={`https://medium.com/${author.handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="glow-card group flex items-start gap-4 bg-white dark:bg-slate-800/50 p-5 rounded-2xl opacity-0 animate-fadeInUp"
                style={{ animationDelay: `${author.delay}ms` }}
              >
                <Avatar name={author.name} size="w-12 h-12 text-base" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-serif font-bold text-slate-800 dark:text-slate-100 group-hover:text-ink-accent transition-colors">
                      {author.name}
                    </p>
                    {author.count > 0 && (
                      <span className="text-xs text-ink-accent font-semibold flex-shrink-0">
                        {author.count} {author.count === 1 ? 'story' : 'stories'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                    {author.bio}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORY SHOWCASES ───────────────────────────────────────────── */}
      <section id="categories" className="container mx-auto px-6 py-16">
        <div className="mb-12 opacity-0 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">📚</span>
            <p className="text-xs font-bold tracking-widest uppercase text-ink-accent">
              Stories By Category
            </p>
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 mb-4">
            Explore All Stories
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
            Click on any category card to explore stories grouped by theme. Each category showcases the best of our writers' work.
          </p>
        </div>

        {/* Search bar */}
        {!loading && allStories.length > 0 && (
          <div className="mb-10 opacity-0 animate-fadeInUp" style={{ animationDelay: '200ms' }}>
            <MediumSearchBar stories={allStories} onFiltered={setFilteredStories} />
          </div>
        )}

        {/* Error notice */}
        {error && (
          <div
            className="mb-8 flex items-start gap-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40 rounded-xl px-5 py-4 max-w-3xl opacity-0 animate-fadeInUp"
            style={{ animationDelay: '150ms' }}
          >
            <svg className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <p className="text-sm text-amber-800 dark:text-amber-300">
              <span className="font-semibold">Live feed unavailable.</span> Showing our cached story archive instead.
            </p>
          </div>
        )}

        {/* Category grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : Object.keys(storiesByCategory).length === 0 ? (
          <div className="text-center py-20 opacity-0 animate-fadeInUp">
            <p className="text-5xl mb-4">🔍</p>
            <h3 className="font-serif text-2xl font-bold text-slate-700 dark:text-slate-300 mb-2">
              No stories match
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Try a different keyword or clear the search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {Object.entries(storiesByCategory).map(([category, stories], idx) => (
              <CategoryShowcase
                key={category}
                category={category}
                stories={stories}
                idx={idx}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── BOTTOM CTA STRIP ─────────────────────────────────────────────── */}
      <section className="relative bg-ink-dark overflow-hidden">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ink-accent/60 to-transparent" />

        <div className="container mx-auto px-6 py-14 flex flex-col sm:flex-row items-center justify-between gap-8">
          <div
            className="text-center sm:text-left opacity-0 animate-slideInLeft"
            style={{ animationDelay: '0ms' }}
          >
            <p className="text-xs font-bold tracking-widest uppercase text-ink-accent mb-2">
              Stay in the loop
            </p>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-white leading-snug">
              Follow <span className="text-ink-accent">The Ink Home</span> on Medium
            </h2>
            <p className="text-sm text-slate-400 mt-2 max-w-sm">
              Hit follow to get every new essay, reflection, and story delivered straight to your
              Medium feed.
            </p>
          </div>
          <a
            href="https://medium.com/the-ink-home"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 inline-flex items-center gap-2 bg-ink-accent text-white px-8 py-4 rounded-full font-semibold text-base hover:brightness-110 active:scale-95 transition-all duration-200 animate-glowPulse opacity-0 animate-slideInRight"
            style={{
              animationDelay: '200ms',
              boxShadow: '0 8px 32px -4px rgba(163,139,119,0.5)',
            }}
          >
            Follow on Medium
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </section>
    </div>
  );
};

export default MediumPage;
