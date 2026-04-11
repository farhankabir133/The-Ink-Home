import React, { useEffect, useMemo, useRef, useState } from 'react';
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

const FRAME_SEQUENCE_TOTAL = 152;
const HERE_FRAME_SEQUENCE_TOTAL = 240;
const FRAME_SEQUENCE_FPS = 24;

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
  const [framesReady, setFramesReady] = useState(false);
  const [hereFramesReady, setHereFramesReady] = useState(false);
  const frameHeroSectionRef = useRef<HTMLElement>(null);
  const frameCanvasRef = useRef<HTMLCanvasElement>(null);
  const preloadedFramesRef = useRef<HTMLImageElement[]>([]);
  const hereHeroSectionRef = useRef<HTMLElement>(null);
  const hereCanvasRef = useRef<HTMLCanvasElement>(null);
  const herePreloadedFramesRef = useRef<HTMLImageElement[]>([]);
  const navigate = useNavigate();
  useEffect(() => setMounted(true), []);

  const frameSequence = useMemo(
    () => {
      // Allow overriding the hero frames base path via Vite env var
      // Set VITE_HERO_FRAMES_BASE to an absolute path served by the dev server
      // (for example '/hero-frames/' after copying the files into public/hero-frames).
      const heroFramesBase = (import.meta.env as any).VITE_HERO_FRAMES_BASE ?? `${import.meta.env.BASE_URL}hero-frames/`;
      // Use VITE_HERO_FRAMES_VERSION env var to cache-bust frames. This forces browser to re-fetch when version changes.
      const frameBustVersion = (import.meta.env as any).VITE_HERO_FRAMES_VERSION ?? '';
      const cacheBuster = frameBustVersion ? `?v=${frameBustVersion}` : '';

      return Array.from({ length: FRAME_SEQUENCE_TOTAL }, (_, index) => {
        const frameNumber = String(index + 1).padStart(3, '0');
        return `${heroFramesBase}ezgif-frame-${frameNumber}.jpg${cacheBuster}`;
      });
    },
    [(import.meta.env as any).VITE_HERO_FRAMES_BASE, (import.meta.env as any).VITE_HERO_FRAMES_VERSION],
  );

  const hereFrameSequence = useMemo(
    () => {
      // Here frames sequence from public/here-frames directory
      const hereFramesBase = `${import.meta.env.BASE_URL}here-frames/`;
      const frameBustVersion = (import.meta.env as any).VITE_HERO_FRAMES_VERSION ?? '';
      const cacheBuster = frameBustVersion ? `?v=${frameBustVersion}` : '';

      return Array.from({ length: HERE_FRAME_SEQUENCE_TOTAL }, (_, index) => {
        const frameNumber = String(index + 1).padStart(3, '0');
        return `${hereFramesBase}frame-${frameNumber}.jpg${cacheBuster}`;
      });
    },
    [(import.meta.env as any).VITE_HERO_FRAMES_VERSION],
  );

  useEffect(() => {
    let cancelled = false;

    async function preloadAllFrames() {
      const preloadPromises = frameSequence.map(
        frameSrc =>
          new Promise<HTMLImageElement | null>(resolve => {
            const img = new Image();
            img.src = frameSrc;
            img.decoding = 'async';
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
          }),
      );

      const loadedFrames = await Promise.all(preloadPromises);
      preloadedFramesRef.current = loadedFrames.filter((img): img is HTMLImageElement => Boolean(img));

      if (!cancelled) {
        setFramesReady(preloadedFramesRef.current.length > 0);
      }
    }

    preloadAllFrames();

    return () => {
      cancelled = true;
    };
  }, [frameSequence.length]);

  useEffect(() => {
    let cancelled = false;

    async function preloadHereFrames() {
      const preloadPromises = hereFrameSequence.map(
        frameSrc =>
          new Promise<HTMLImageElement | null>(resolve => {
            const img = new Image();
            img.src = frameSrc;
            img.decoding = 'async';
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
          }),
      );

      const loadedFrames = await Promise.all(preloadPromises);
      herePreloadedFramesRef.current = loadedFrames.filter((img): img is HTMLImageElement => Boolean(img));

      if (!cancelled) {
        setHereFramesReady(herePreloadedFramesRef.current.length > 0);
      }
    }

    preloadHereFrames();

    return () => {
      cancelled = true;
    };
  }, [hereFrameSequence.length]);

  useEffect(() => {
    if (!framesReady) {
      return;
    }

  const canvas = frameCanvasRef.current;
  const stage = frameHeroSectionRef.current;
    const frames = preloadedFramesRef.current;
    if (!canvas || !stage || frames.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let lastTime = 0;
    let frameIndex = 0;

    const drawFrame = (img: HTMLImageElement) => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const rect = stage.getBoundingClientRect();
      const nextWidth = Math.max(1, Math.round(rect.width * dpr));
      const nextHeight = Math.max(1, Math.round(rect.height * dpr));

      if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
        canvas.width = nextWidth;
        canvas.height = nextHeight;
        canvas.style.width = `${Math.round(rect.width)}px`;
        canvas.style.height = `${Math.round(rect.height)}px`;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

  const scale = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
      const drawWidth = img.naturalWidth * scale;
      const drawHeight = img.naturalHeight * scale;
      const drawX = (canvas.width - drawWidth) / 2;
      const drawY = (canvas.height - drawHeight) / 2;

      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    };

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      drawFrame(frames[0]);
      return;
    }

    const frameDuration = 1000 / FRAME_SEQUENCE_FPS;

    const animate = (timestamp: number) => {
      if (!lastTime) lastTime = timestamp;
      const elapsed = timestamp - lastTime;

      if (elapsed >= frameDuration) {
        frameIndex = (frameIndex + 1) % frames.length;
        drawFrame(frames[frameIndex]);
        lastTime = timestamp - (elapsed % frameDuration);
      }

      rafId = window.requestAnimationFrame(animate);
    };

    const handleResize = () => {
      drawFrame(frames[frameIndex]);
    };

    drawFrame(frames[0]);
    window.addEventListener('resize', handleResize);

    rafId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
    };
  }, [framesReady]);

  useEffect(() => {
    if (!hereFramesReady) {
      return;
    }

    const canvas = hereCanvasRef.current;
    const stage = hereHeroSectionRef.current;
    const frames = herePreloadedFramesRef.current;
    if (!canvas || !stage || frames.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let lastTime = 0;
    let frameIndex = 0;

    const drawFrame = (img: HTMLImageElement) => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const rect = stage.getBoundingClientRect();
      const nextWidth = Math.max(1, Math.round(rect.width * dpr));
      const nextHeight = Math.max(1, Math.round(rect.height * dpr));

      if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
        canvas.width = nextWidth;
        canvas.height = nextHeight;
        canvas.style.width = `${Math.round(rect.width)}px`;
        canvas.style.height = `${Math.round(rect.height)}px`;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const scale = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
      const drawWidth = img.naturalWidth * scale;
      const drawHeight = img.naturalHeight * scale;
      const drawX = (canvas.width - drawWidth) / 2;
      const drawY = (canvas.height - drawHeight) / 2;

      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    };

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      drawFrame(frames[0]);
      return;
    }

    const frameDuration = 1000 / FRAME_SEQUENCE_FPS;

    const animate = (timestamp: number) => {
      if (!lastTime) lastTime = timestamp;
      const elapsed = timestamp - lastTime;

      if (elapsed >= frameDuration) {
        frameIndex = (frameIndex + 1) % frames.length;
        drawFrame(frames[frameIndex]);
        lastTime = timestamp - (elapsed % frameDuration);
      }

      rafId = window.requestAnimationFrame(animate);
    };

    const handleResize = () => {
      drawFrame(frames[frameIndex]);
    };

    drawFrame(frames[0]);
    window.addEventListener('resize', handleResize);

    rafId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
    };
  }, [hereFramesReady]);

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

      {/* ── ERROR BANNER ─────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-700 px-6 py-3 text-center text-sm text-amber-700 dark:text-amber-400">
          Showing cached stories — live feed temporarily unavailable.
        </div>
      )}

      {/* ── NEW HERE HERO SECTION ────────────────────────────────────────── */}
      <section
        ref={hereHeroSectionRef}
        className="relative h-screen min-h-screen overflow-hidden bg-slate-950 dark:bg-slate-950 group"
      >
        {/* Animated canvas background */}
        <canvas
          ref={hereCanvasRef}
          className="absolute inset-0 h-full w-full transition-opacity duration-300 group-hover:opacity-95"
          aria-hidden="true"
        />
        
        {/* Premium gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
        
        {/* Animated accent light beam */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-ink-accent/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-pulse" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-pulse" />

        {/* Content wrapper */}
        <div className="relative z-20 h-full flex flex-col justify-between p-6 md:p-10 lg:p-12">
          
          {/* Top accent bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-gradient-to-b from-ink-accent to-transparent rounded-full" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Premium Content</span>
            </div>
            <div className="hidden md:flex items-center gap-2 text-white/40 text-xs">
              <span className="w-2 h-2 rounded-full bg-ink-accent animate-pulse" />
              <span>Playing {hereFramesReady ? '240 frames' : 'loading...'}</span>
            </div>
          </div>

          {/* Main content */}
          <div className="max-w-3xl">
            {/* Label with animation */}
            <div className="mb-4 inline-block">
              <p className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-ink-accent/20 to-purple-500/20 border border-ink-accent/40 backdrop-blur-md px-4 py-2 text-[12px] font-bold uppercase tracking-widest text-ink-accent hover:from-ink-accent/30 hover:to-purple-500/30 hover:border-ink-accent/60 transition-all duration-300 cursor-default">
                <span className="w-2 h-2 rounded-full bg-ink-accent animate-pulse" />
                Visual Journey
              </p>
            </div>

            {/* Main heading with enhanced typography */}
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-white mb-4 md:mb-6 max-w-2xl">
              <span className="bg-gradient-to-r from-white via-ink-accent to-purple-200 bg-clip-text text-transparent">
                Stories in Motion
              </span>
              <span className="block text-white mt-2">Crafted with Care</span>
            </h1>

            {/* Descriptive text */}
            <p className="text-base md:text-lg text-slate-200 max-w-xl mb-6 md:mb-8 leading-relaxed">
              Experience a handcrafted visual introduction to our most compelling stories. Every frame designed to inspire, engage, and captivate your imagination.
            </p>

            {/* Loading state and CTA */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {!hereFramesReady ? (
                <div className="flex items-center gap-2 text-ink-accent">
                  <div className="w-3 h-3 rounded-full bg-ink-accent animate-pulse" />
                  <span className="text-sm font-medium uppercase tracking-wider">Loading visual experience…</span>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/medium')}
                    className="group/btn inline-flex items-center gap-2 bg-gradient-to-r from-ink-accent to-purple-600 hover:from-ink-accent/90 hover:to-purple-500 text-white font-bold px-8 py-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-ink-accent/40 active:scale-95 text-sm uppercase tracking-widest"
                  >
                    Explore Stories
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      const element = document.querySelector('[data-scroll-target="analytics"]');
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-2 border-2 border-white/30 hover:border-ink-accent text-white hover:text-ink-accent font-bold px-8 py-4 rounded-xl transition-all duration-300 text-sm uppercase tracking-widest"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                    Learn More
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Bottom scroll indicator */}
          <div className="flex justify-center animate-bounce">
            <div className="flex flex-col items-center gap-2 text-white/40 hover:text-white/60 transition-colors cursor-pointer">
              <span className="text-xs font-medium uppercase tracking-widest">Scroll to discover</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ── LIVE READING ANALYTICS ─────────────────────────────────────── */}
      <section className="container mx-auto px-6 pt-12" data-scroll-target="analytics">
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
