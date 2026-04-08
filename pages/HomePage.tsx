import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ArticleCard from '../components/ArticleCard';
import { useMediumFeed, MediumStory } from '../hooks/useMediumFeed';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { usePageMeta } from '../hooks/usePageMeta';
import {
  heroStory as staticHero,
  featuredStories as staticFeatured,
  galleryStories as staticGallery,
  topStory as staticTop,
  mediumArticles as staticArticles,
} from '../constants/mediumArticles';
import {
  CATEGORIES,
  getCategoryStats,
  groupStoriesByCategory,
  type Category,
} from '../constants/categories';
import type { Article } from '../types';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Convert a live MediumStory into the Article shape ArticleCard expects */
function toArticle(s: MediumStory, idx: number): Article {
  return {
    id: idx + 1000,
    title: s.title,
    author: s.author,
    date: s.date,
    excerpt: s.excerpt,
    imageUrl: s.imageUrl,
    featured: s.featured,
    content: '',
    tags: s.tags,
    externalUrl: s.externalUrl,
  };
}

/** Build responsive srcset candidates for Medium CDN images when possible. */
function getMediumSrcSet(url: string): string | undefined {
  if (!url.includes('cdn-images-1.medium.com')) return undefined;

  const variants = [480, 768, 1200];
  const srcSet = variants
    .map(width => {
      const candidate = url.replace(
        /\/v2\/resize:[^/]+\//,
        `/v2/resize:fit:${width}/`,
      );
      return `${candidate} ${width}w`;
    })
    .join(', ');

  return srcSet;
}

interface RevealOnScrollProps {
  children: React.ReactNode;
  delay?: number;
  threshold?: number;
  className?: string;
}

interface ReadingSnapshot {
  title: string;
  tags: string[];
  author: string;
  date: string;
  excerpt: string;
  imageUrl: string;
  externalUrl?: string;
}

function estimateReadMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function getTagAffinityScore(baseTags: string[], candidateTags: string[], featured: boolean): number {
  const overlaps = candidateTags.filter(tag =>
    baseTags.some(base => base.toLowerCase() === tag.toLowerCase())
  ).length;

  return overlaps * 4 + (featured ? 1 : 0);
}

const RevealOnScroll: React.FC<RevealOnScrollProps> = ({
  children,
  delay = 0,
  threshold = 0.2,
  className = '',
}) => {
  const [ref, isVisible] = useIntersectionObserver({ threshold, triggerOnce: true });

  return (
    <div
      ref={ref}
      className={`${className} ${isVisible ? 'opacity-100 animate-fadeInUp' : 'opacity-0'}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// ── Skeleton card ─────────────────────────────────────────────────────────────
const SkeletonCard: React.FC = () => (
  <div className="bg-white dark:bg-slate-800/50 rounded-xl overflow-hidden shadow-sm animate-pulse h-full">
    <div className="h-52 bg-slate-200 dark:bg-slate-700" />
    <div className="p-5 space-y-3">
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mt-4" />
    </div>
  </div>
);

// ── Tag pill (hero) ───────────────────────────────────────────────────────────
const Tag: React.FC<{ label: string }> = ({ label }) => (
  <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm border border-white/30">
    {label}
  </span>
);

// ── Category Card Component ───────────────────────────────────────────────────
interface CategoryCardProps {
  categoryData: Category;
  count: number;
  idx: number;
  onClick: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ categoryData, count, idx, onClick }) => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.2, triggerOnce: true });

  return (
    <div
      ref={ref}
      className={isVisible ? 'opacity-100 animate-fadeInUp' : 'opacity-0'}
      style={{ animationDelay: `${idx * 80}ms` }}
    >
      <button
        onClick={onClick}
        className={`
          group relative overflow-hidden rounded-2xl p-6 text-left w-full
          bg-gradient-to-br ${categoryData.gradient}
          transform hover:scale-[1.03] hover:-translate-y-1
          transition-all duration-500 ease-out
          shadow-lg hover:shadow-2xl
          cursor-pointer
        `}
      >
      {/* Animated background shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-out" />
      
      {/* Floating particles effect */}
      <div className="absolute top-2 right-2 w-16 h-16 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
      <div className="absolute bottom-4 left-4 w-8 h-8 bg-white/5 rounded-full blur-lg group-hover:scale-200 transition-transform duration-500" />

      <div className="relative z-10">
        <span className="text-3xl mb-3 block group-hover:scale-110 transition-transform duration-300 origin-left">
          {categoryData.emoji}
        </span>
        <h3 className="font-serif text-xl font-bold text-white mb-1 group-hover:tracking-wide transition-all duration-300">
          {categoryData.name}
        </h3>
        <p className="text-white/80 text-sm mb-3 line-clamp-2">
          {categoryData.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-white/60 text-xs font-medium">
            {count} {count === 1 ? 'story' : 'stories'}
          </span>
          <span className="flex items-center gap-1 text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
            Explore
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </span>
        </div>
      </div>
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
const HomePage: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [lastRead, setLastRead] = useState<ReadingSnapshot | null>(null);
  const navigate = useNavigate();
  useEffect(() => setMounted(true), []);

  usePageMeta({
    title: 'Home',
    description: 'Discover thoughtful essays, reflections, and human stories from The Ink Home publication.',
    pathname: '/',
  });

  // ── Live RSS feed ──────────────────────────────────────────────────────────
  const { stories: liveStories, loading, error } = useMediumFeed();

  // Always use static fallback as base, merge with live when available
  const useFallback = liveStories.length === 0;
  const stories: MediumStory[] = liveStories.length > 0 ? liveStories : [];

  // Derive sections from live feed OR static fallback
  const heroData = useFallback
    ? staticHero
    : stories[0]
    ? toArticle(stories[0], 0)
    : null;

  const featuredData: Article[] = useFallback
    ? staticFeatured
    : stories.slice(0, 3).map(toArticle);

  const galleryData: Article[] = useFallback
    ? staticGallery
    : stories.map(toArticle);

  const topData: Article | null = useFallback
    ? staticTop
    : stories.length > 0
    ? (() => {
        // "Why Being Chill…" is the story with the most responses — find it by title keyword
        const found = stories.find(s =>
          s.title.toLowerCase().includes('chill') || s.title.toLowerCase().includes('most useful')
        );
        return found ? toArticle(found, stories.indexOf(found)) : toArticle(stories[0], 0);
      })()
    : null;

  const latestData: Article[] = useFallback
    ? staticArticles.filter(a => !a.featured).slice(0, 4)
    : stories.filter(s => !s.featured).slice(0, 4).map(toArticle);

  const analyticsStories = galleryData.length > 0 ? galleryData : featuredData;

  const readingInsights = (() => {
    const totalStories = analyticsStories.length;
    if (totalStories === 0) {
      return { averageReadMins: 0, topicDensity: 0, popularityIndex: 0 };
    }

    const averageReadMins = Math.round(
      analyticsStories.reduce((sum, story) => sum + estimateReadMinutes(story.excerpt || story.content || ''), 0) / totalStories
    );

    const uniqueTags = new Set(analyticsStories.flatMap(story => story.tags || []));
    const topicDensity = Number((uniqueTags.size / totalStories).toFixed(1));

    const featuredRatio = analyticsStories.filter(story => story.featured).length / totalStories;
    const popularityIndex = Math.min(99, Math.round(58 + featuredRatio * 36 + topicDensity * 2));

    return {
      averageReadMins,
      topicDensity,
      popularityIndex,
    };
  })();

  useEffect(() => {
    const saved = window.localStorage.getItem('ink:last-read');
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as ReadingSnapshot;
      if (parsed?.title && parsed?.externalUrl) {
        setLastRead(parsed);
      }
    } catch {
      // Ignore corrupted local storage payloads.
    }
  }, []);

  const rememberReading = (article: Article) => {
    const snapshot: ReadingSnapshot = {
      title: article.title,
      tags: article.tags || [],
      author: article.author,
      date: article.date,
      excerpt: article.excerpt,
      imageUrl: article.imageUrl,
      externalUrl: article.externalUrl,
    };

    setLastRead(snapshot);
    window.localStorage.setItem('ink:last-read', JSON.stringify(snapshot));
  };

  const smartRecommendations: Article[] = (() => {
    const universe = [...galleryData, ...featuredData, ...latestData];
    const deduped = Array.from(new Map(universe.map(item => [item.externalUrl || item.title, item])).values());

    if (!lastRead) {
      return deduped.slice(0, 4);
    }

    return deduped
      .filter(item => item.externalUrl !== lastRead.externalUrl)
      .sort((a, b) => {
        const scoreA = getTagAffinityScore(lastRead.tags, a.tags || [], a.featured);
        const scoreB = getTagAffinityScore(lastRead.tags, b.tags || [], b.featured);
        return scoreB - scoreA;
      })
      .slice(0, 4);
  })();

  // ── Category Data ──────────────────────────────────────────────────────────
  const storiesForCategory = useFallback 
    ? staticArticles.map(a => ({ tags: a.tags || [] }))
    : stories.map(s => ({ tags: s.tags || [] }));

  const categoryStats = getCategoryStats(storiesForCategory);

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/medium?category=${encodeURIComponent(categoryId)}`);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className={`${mounted ? 'opacity-100 animate-fadeInUp' : 'opacity-0'}`}>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative h-[88vh] min-h-[560px] flex items-end justify-start overflow-hidden">

        {loading ? (
          /* Skeleton hero */
          <div className="absolute inset-0 bg-slate-300 dark:bg-slate-800 animate-pulse" />
        ) : heroData ? (
          <>
            <img
              src={heroData.imageUrl}
              srcSet={getMediumSrcSet(heroData.imageUrl)}
              sizes="100vw"
              alt={heroData.title}
              className="absolute inset-0 w-full h-full object-cover"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              width={1600}
              height={900}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            <div className="absolute left-0 inset-y-0 w-1 bg-ink-accent opacity-80" />
          </>
        ) : null}

        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 md:px-12 pb-16">
          {loading ? (
            /* Skeleton text */
            <div className="space-y-4 animate-pulse max-w-2xl">
              <div className="h-4 bg-white/20 rounded w-40" />
              <div className="h-10 bg-white/20 rounded w-full" />
              <div className="h-10 bg-white/20 rounded w-3/4" />
              <div className="h-5 bg-white/20 rounded w-2/3" />
              <div className="h-10 bg-white/20 rounded-full w-44 mt-4" />
            </div>
          ) : heroData ? (
            <>
              <div className="flex items-center gap-3 mb-5">
                <span className="flex items-center gap-1.5 bg-ink-accent text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Latest Story
                </span>
                <span className="text-slate-300 text-sm">From The Ink Home on Medium</span>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {heroData.tags.slice(0, 3).map(t => <Tag key={t} label={t} />)}
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-5 max-w-3xl">
                {heroData.title}
              </h1>

              <p className="text-lg text-slate-200 max-w-2xl mb-6 leading-relaxed">
                {heroData.excerpt}
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="text-slate-300 text-sm">
                  By <span className="text-white font-semibold">{heroData.author}</span>
                  <span className="mx-2 opacity-40">·</span>
                  {heroData.date}
                </div>
                <a
                  href={heroData.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="interactive-cta inline-flex items-center gap-2 bg-ink-accent hover:bg-opacity-90 active:scale-95 text-white font-semibold px-6 py-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-ink-accent/40 text-sm w-fit"
                >
                  Read on Medium
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </>
          ) : null}
        </div>

        {/* Scroll hint */}
        {!loading && (
          <div className="absolute bottom-6 right-8 flex flex-col items-center gap-1 text-white/40 text-xs animate-bounce">
            <span>scroll</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        )}
      </section>

      {/* ── ERROR BANNER ─────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-700 px-6 py-3 text-center text-sm text-amber-700 dark:text-amber-400">
          Showing cached stories — live feed temporarily unavailable.
        </div>
      )}

      {/* ── LIVE READING ANALYTICS ─────────────────────────────────────── */}
      <section className="container mx-auto px-6 pt-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="interactive-lift rounded-2xl border border-slate-200/70 dark:border-slate-700/60 bg-white/90 dark:bg-slate-900/70 px-5 py-4">
            <p className="text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Avg. Read Time</p>
            <p className="mt-1 text-2xl font-serif font-bold text-slate-800 dark:text-slate-100">{readingInsights.averageReadMins} min</p>
          </div>
          <div className="interactive-lift rounded-2xl border border-slate-200/70 dark:border-slate-700/60 bg-white/90 dark:bg-slate-900/70 px-5 py-4">
            <p className="text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Topic Density</p>
            <p className="mt-1 text-2xl font-serif font-bold text-slate-800 dark:text-slate-100">{readingInsights.topicDensity}</p>
          </div>
          <div className="interactive-lift rounded-2xl border border-slate-200/70 dark:border-slate-700/60 bg-white/90 dark:bg-slate-900/70 px-5 py-4">
            <p className="text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Popularity Index</p>
            <p className="mt-1 text-2xl font-serif font-bold text-slate-800 dark:text-slate-100">{readingInsights.popularityIndex}</p>
          </div>
        </div>
      </section>

      {/* ── EXPLORE BY CATEGORY ──────────────────────────────────────────── */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-12">
                  onClick={() => rememberReading(heroData)}
          <p className="text-ink-accent text-sm font-semibold uppercase tracking-widest mb-2">
            Browse By Topic
          </p>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-800 dark:text-slate-100 mb-3">
            Explore by Category
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Dive into our collection of stories organized by theme. From love and relationships to psychology and self-improvement.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[0, 1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-40 rounded-2xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categoryStats.map(({ category, count }, idx) => (
              <CategoryCard
                key={category.id}
                categoryData={category}
                count={count}
                idx={idx}
                onClick={() => handleCategoryClick(category.id)}
              />
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link
            to="/medium"
            className="inline-flex items-center gap-2 text-ink-accent font-semibold hover:underline"
          >
            View all stories by category
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ── MOST TALKED ABOUT ────────────────────────────────────────────── */}
      <section className="bg-amber-50 dark:bg-slate-900 border-y border-amber-200 dark:border-slate-700 py-14 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-2xl">🔥</span>
            <h2 className="text-xl font-serif font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              Most Talked About
            </h2>
            <span className="text-xs bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
              3 responses
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col md:flex-row gap-8 animate-pulse">
              <div className="flex-shrink-0 w-full md:w-72 h-52 rounded-xl bg-slate-200 dark:bg-slate-700" />
              <div className="flex-1 space-y-3 pt-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full mt-2" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
              </div>
            </div>
          ) : topData ? (
            <a
              href={topData.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => rememberReading(topData)}
              className="group flex flex-col md:flex-row gap-8 items-start"
            >
              <div className="flex-shrink-0 w-full md:w-72 h-52 rounded-xl overflow-hidden shadow-md">
                <img
                  src={topData.imageUrl}
                  alt={topData.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-3">
                  {topData.tags.map(t => (
                    <span key={t} className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-medium px-2.5 py-0.5 rounded-full">
                      {t}
                    </span>
                  ))}
                </div>
                <h3 className="font-serif text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-3 group-hover:text-ink-accent transition-colors duration-300 leading-snug">
                  {topData.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4 text-base">
                  {topData.excerpt}
                </p>
                <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                  <span>By <strong className="text-slate-700 dark:text-slate-200">{topData.author}</strong></span>
                  <span>·</span>
                  <span>{topData.date}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-ink-accent font-semibold group-hover:underline">
                    Read on Medium
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                </div>
              </div>
            </a>
          ) : null}
        </div>
      </section>

      {/* ── FEATURED STORIES ─────────────────────────────────────────────── */}
      <section className="container mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-ink-accent text-sm font-semibold uppercase tracking-widest mb-1">From The Publication</p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-800 dark:text-slate-100">
              Featured Stories
            </h2>
          </div>
          <a
            href="https://medium.com/the-ink-home"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-sm text-ink-accent font-semibold hover:underline"
          >
            View all on Medium
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {loading
            ? [0, 1, 2].map(i => (
                <div key={i} className="h-full">
                  <SkeletonCard />
                </div>
              ))
            : featuredData.map((article, idx) => (
                <RevealOnScroll
                  key={article.id}
                  delay={idx * 150}
                  threshold={0.18}
                >
                  <ArticleCard article={article} />
                </RevealOnScroll>
              ))}
        </div>
      </section>

      {/* ── INSPIRATION GALLERY MARQUEE ──────────────────────────────────── */}
      <section className="py-20 bg-slate-50 dark:bg-gray-900/60 overflow-hidden">
        <div className="mb-12 text-center px-6">
          <p className="text-ink-accent text-sm font-semibold uppercase tracking-widest mb-1">Browse The Collection</p>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-800 dark:text-slate-100">
            Inspiration Gallery
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-base">
            Hover to pause · Click to read on Medium
          </p>
        </div>

        {loading ? (
          <div className="flex gap-4 px-6 overflow-hidden">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="flex-shrink-0 w-72 h-80 rounded-2xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="relative w-full overflow-hidden group">
            <div className="flex animate-marquee group-hover:[animation-play-state:paused] will-change-transform">
              {[...galleryData, ...galleryData].map((article, index) => (
                <a
                  key={`${article.id}-${index}`}
                  href={article.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => rememberReading(article)}
                  className="relative flex-shrink-0 w-80 h-96 mx-3 rounded-2xl overflow-hidden shadow-lg group/card"
                >
                  <img
                    src={article.imageUrl}
                    srcSet={getMediumSrcSet(article.imageUrl)}
                    sizes="(max-width: 640px) 80vw, 320px"
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105"
                    loading="lazy"
                    decoding="async"
                    width={1280}
                    height={1536}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-ink-accent flex items-center justify-center text-white text-xs font-bold">
                      {article.author.charAt(0)}
                    </div>
                    <span className="text-white/80 text-xs font-medium">{article.author}</span>
                  </div>

                  <div className="absolute inset-0 p-5 flex flex-col justify-end">
                    <div className="flex flex-wrap gap-1 mb-2">
                      {article.tags.slice(0, 2).map(t => (
                        <span key={t} className="text-xs bg-white/15 text-white/90 px-2 py-0.5 rounded-full backdrop-blur-sm">
                          {t}
                        </span>
                      ))}
                    </div>
                    <h3 className="font-serif text-lg font-bold text-white leading-snug line-clamp-3">
                      {article.title}
                    </h3>
                    <p className="text-white/60 text-xs mt-2">{article.date}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── LATEST FROM THE DESK ─────────────────────────────────────────── */}
      <section className="container mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-ink-accent text-sm font-semibold uppercase tracking-widest mb-1">Fresh Ink</p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-800 dark:text-slate-100">
              Latest From the Desk
            </h2>
          </div>
          <a
            href="https://medium.com/the-ink-home/archive"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-sm text-ink-accent font-semibold hover:underline"
          >
            Full archive
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading
            ? [0, 1, 2, 3].map(i => <SkeletonCard key={i} />)
            : latestData.map((article, idx) => (
                <RevealOnScroll
                  key={article.id}
                  delay={idx * 100}
                  threshold={0.15}
                >
                  <a
                    href={article.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => rememberReading(article)}
                    className="group block"
                  >
                    <div className="overflow-hidden rounded-xl mb-4 shadow-sm aspect-video">
                      <img
                        src={article.imageUrl}
                        srcSet={getMediumSrcSet(article.imageUrl)}
                        sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 24vw"
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        decoding="async"
                        width={1200}
                        height={675}
                      />
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {article.tags.slice(0, 2).map(t => (
                        <span key={t} className="text-xs text-ink-accent font-medium bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
                          {t}
                        </span>
                      ))}
                    </div>
                    <h3 className="font-serif text-lg font-bold text-slate-800 dark:text-slate-100 leading-snug mb-1 group-hover:text-ink-accent transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      By <span className="font-medium">{article.author}</span> · {article.date}
                    </p>
                  </a>
                </RevealOnScroll>
              ))}
        </div>
      </section>

      {/* ── CONTINUE READING + SMART PICKS ─────────────────────────────── */}
      <section className="container mx-auto px-6 pb-10">
        <div className="rounded-3xl border border-slate-200/70 dark:border-slate-700/60 bg-gradient-to-br from-white to-amber-50 dark:from-slate-900 dark:to-slate-800/80 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
            <div>
              <p className="text-ink-accent text-xs font-semibold uppercase tracking-widest mb-1">Personalized</p>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-800 dark:text-slate-100">Continue Reading</h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">
                {lastRead
                  ? `Based on your recent read: “${lastRead.title}”`
                  : 'Start reading any story and we will tune recommendations by tag affinity.'}
              </p>
            </div>
            <Link to="/medium" className="interactive-cta inline-flex items-center gap-2 text-sm font-semibold text-ink-accent">
              Open full discovery feed
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {smartRecommendations.map((article) => (
              <a
                key={`${article.id}-${article.title}`}
                href={article.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => rememberReading(article)}
                className="interactive-lift group rounded-2xl bg-white/90 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-700/60 overflow-hidden"
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={article.imageUrl}
                    srcSet={getMediumSrcSet(article.imageUrl)}
                    sizes="(max-width: 640px) 92vw, (max-width: 1024px) 48vw, 23vw"
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    decoding="async"
                    width={1200}
                    height={675}
                  />
                </div>
                <div className="p-4">
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {article.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100/70 dark:bg-amber-900/20 text-ink-accent font-semibold">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="font-serif text-base font-bold text-slate-800 dark:text-slate-100 line-clamp-2 mb-1 group-hover:text-ink-accent transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{article.author} · {article.date}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="bg-ink-dark text-white py-20 px-6 text-center">
        <p className="text-ink-accent text-sm font-semibold uppercase tracking-widest mb-3">Stay Connected</p>
        <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">Read More on Medium</h2>
        <p className="text-slate-300 max-w-xl mx-auto mb-8 leading-relaxed">
          Follow <strong className="text-white">The Ink Home</strong> publication on Medium for new stories every week — honest essays, reflections, and human truths delivered straight to your feed.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="https://medium.com/the-ink-home"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              if (heroData) rememberReading(heroData);
            }}
            className="inline-flex items-center gap-2 bg-ink-accent hover:bg-opacity-90 active:scale-95 text-white font-semibold px-8 py-3.5 rounded-full transition-all duration-300 shadow-lg"
          >
            Follow on Medium
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
          <Link
            to="/publication"
            className="inline-flex items-center gap-2 border border-white/30 hover:border-white/60 text-white font-semibold px-8 py-3.5 rounded-full transition-all duration-300"
          >
            Browse Publication Site
          </Link>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
