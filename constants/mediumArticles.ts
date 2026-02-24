import type { Article } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// REAL stories from https://medium.com/the-ink-home
// URLs  : exact canonical URLs from the publication RSS feed
// Images: real cdn-images-1.medium.com cover images from the RSS feed
//         — the same images shown on the actual Medium stories
//
// This file is used as a STATIC FALLBACK.
// The homepage fetches live data via hooks/useMediumFeed.ts (auto-updates).
// ─────────────────────────────────────────────────────────────────────────────

export const mediumArticles: Article[] = [

  // ── Story 1 — newest (hero / latest) ────────────────────────────────────
  {
    id: 301,
    title: 'The Real Reflection of Your Soul',
    author: 'Dua Batool',
    date: 'Feb 19, 2026',
    excerpt: 'Sometimes the truest mirror is not the one on your wall, but the one held up by the people who know you best.',
    imageUrl: 'https://cdn-images-1.medium.com/v2/resize:fit:1200/1*N09RSoHEcbNCo3g2WBPoHw.jpeg',
    featured: true,
    content: '',
    tags: ['Self Reflection', 'Soul', 'Growth', 'Writing'],
    externalUrl: 'https://medium.com/the-ink-home/the-real-reflection-of-your-soul-f6936cc985ba',
  },

  // ── Story 2 ───────────────────────────────────────────────────────────────
  {
    id: 302,
    title: 'When a Blast Shakes the Capital',
    author: 'Dua Batool',
    date: 'Feb 19, 2026',
    excerpt: 'A tragedy that hit close to home — and the silence that followed the smoke.',
    imageUrl: 'https://cdn-images-1.medium.com/v2/resize:fit:1200/1*5py0u5PCTLpYj7ftXxQfmQ.jpeg',
    featured: true,
    content: '',
    tags: ['Pakistan', 'Human Rights', 'Tragedy', 'Awareness'],
    externalUrl: 'https://medium.com/the-ink-home/when-a-blast-shakes-the-capital-8ee587be58d7',
  },

  // ── Story 3 ───────────────────────────────────────────────────────────────
  {
    id: 303,
    title: 'Why You Should Stop Chasing Virality and Focus on Resonance!',
    author: 'Farhan Kabir',
    date: 'Feb 18, 2026',
    excerpt: 'You are not failing because your content is bad. You are failing because you are optimizing for the wrong signal entirely.',
    imageUrl: 'https://cdn-images-1.medium.com/v2/resize:fit:1200/1*CjMxA7HqScLCmYaU_TlY_Q.png',
    featured: true,
    content: '',
    tags: ['Content Creation', 'Writing', 'Social Media', 'Creativity'],
    externalUrl: 'https://medium.com/the-ink-home/why-you-should-stop-chasing-virality-and-focus-on-resonance-d013c88fa5ef',
  },

  // ── Story 4 ───────────────────────────────────────────────────────────────
  {
    id: 304,
    title: 'A Personal Reflection on English Literature',
    author: 'Farhan Kabir',
    date: 'Feb 16, 2026',
    excerpt: 'Here are some thoughts from my mind after reading a small amount of literature!.',
    imageUrl: 'https://cdn-images-1.medium.com/v2/resize:fit:1200/1*LEs6iICTBOIKL9GIdnh1Fw.jpeg',
    featured: false,
    content: '',
    tags: ['Life Lessons', 'Reflections', 'Shakespeare', 'English Literature'],
    externalUrl: 'https://medium.com/the-ink-home/a-personal-reflection-on-english-literature-0dcbdb887b32',
  },

  // ── Story 5 ───────────────────────────────────────────────────────────────
  {
    id: 305,
    title: 'We Forgot How to Think',
    author: 'Farhan Kabir',
    date: 'Feb 5, 2026',
    excerpt: 'Why the world has enough writers, but not enough thinkers? How to reclaim your creativity from the noise?.',
    imageUrl: 'https://cdn-images-1.medium.com/v2/resize:fit:1200/1*qY0tnvLE-aVwdsfFPZcqKg.jpeg',
    featured: false,
    content: '',
    tags: ['Thinking', 'Writing Life', 'Creativity', 'Technology'],
    externalUrl: 'https://medium.com/the-ink-home/we-forgot-how-to-think-69365b098e7c',
  },

  // ── Story 6 ───────────────────────────────────────────────────────────────
  {
    id: 306,
    title: '100 Stories, Just 5 Dollars',
    author: 'Dua Batool',
    date: 'Feb 4, 2026',
    excerpt: 'Why I Still Call It a Win.',
    imageUrl: 'https://cdn-images-1.medium.com/v2/resize:fit:1200/1*-f6JC8t4PVzuKNs37loQVw.jpeg',
    featured: false,
    content: '',
    tags: ['Progress Over Money', 'Medium', 'Student Writes', 'Writing Journey'],
    externalUrl: 'https://medium.com/the-ink-home/100-stories-just-5-dollars-b69260719a53',
  },

  // ── Story 7 ───────────────────────────────────────────────────────────────
  {
    id: 307,
    title: 'The Unconquered "I"',
    author: 'Farhan Kabir',
    date: 'Feb 1, 2026',
    excerpt: "What Nazrul's Bidrohi Taught Me About Surviving Pressure in 2026.",
    imageUrl: 'https://cdn-images-1.medium.com/v2/resize:fit:1200/1*g8fCbitvZEWTKfRcVOTGug.jpeg',
    featured: false,
    content: '',
    tags: ['Writing', 'Careers', 'Mental Health', 'Self Growth'],
    externalUrl: 'https://medium.com/the-ink-home/the-unconquered-i-ddcdc8194fb1',
  },

  // ── Story 8 ───────────────────────────────────────────────────────────────
  {
    id: 308,
    title: 'A Smile Amidst Tragedy: The Brutal Reality of Crime in Pakistan',
    author: 'Dua Batool',
    date: 'Jan 27, 2026',
    excerpt: 'Courage in His Final Moments.',
    imageUrl: 'https://cdn-images-1.medium.com/v2/resize:fit:1200/1*msDQuc4CdR6vq1IkdJuiuw.jpeg',
    featured: false,
    content: '',
    tags: ['Human Rights', 'Pakistan', 'Crime Awareness'],
    externalUrl: 'https://medium.com/the-ink-home/a-smile-amidst-tragedy-the-brutal-reality-of-crime-in-pakistan-73da78328cdb',
  },

  // ── Story 9 ───────────────────────────────────────────────────────────────
  {
    id: 309,
    title: 'Kleptomania — When Stealing Is Not a Choice',
    author: 'Dua Batool',
    date: 'Jan 26, 2026',
    excerpt: 'When Stealing Is Not a Choice.',
    imageUrl: 'https://cdn-images-1.medium.com/v2/resize:fit:1200/1*pulUUKYYxWvvbJ0xdhaU2g.jpeg',
    featured: false,
    content: '',
    tags: ['Kleptomania', 'Mental Health', 'Psychology', 'Brain Health'],
    externalUrl: 'https://medium.com/the-ink-home/kleptomania-a1bede975b50',
  },

  // ── Story 10 ──────────────────────────────────────────────────────────────
  {
    id: 310,
    title: 'Not the One Who Comes Close, But the One Who Stays Inside',
    author: 'Dua Batool',
    date: 'Jan 24, 2026',
    excerpt: 'Some people touch your life. Very few touch your inner world.',
    imageUrl: 'https://cdn-images-1.medium.com/v2/resize:fit:1200/1*e8aCQ7274aPGVEA04cvO6Q.jpeg',
    featured: false,
    content: '',
    tags: ['Human Connection', 'Emotional Depth', 'Inner World', 'Belonging'],
    externalUrl: 'https://medium.com/the-ink-home/not-the-one-who-comes-close-but-the-one-who-stays-inside-cb37ae8ec6e3',
  },

  // ── Story 11 ──────────────────────────────────────────────────────────────
  {
    id: 311,
    title: 'Love at First Sight: A Beautiful Lie?',
    author: 'Dua Batool',
    date: 'Jan 23, 2026',
    excerpt: 'We have all been there, or at least we have dreamed of it, that lightning bolt moment where you see someone across a room and suddenly…',
    imageUrl: 'https://cdn-images-1.medium.com/v2/resize:fit:1200/1*CEqy-bUblElmC1850bpkYg.jpeg',
    featured: false,
    content: '',
    tags: ['Love', 'Psychology', 'Emotional Intelligence', 'Love At First Sight'],
    externalUrl: 'https://medium.com/the-ink-home/love-at-first-sight-a-beautiful-lie-120d0b24823b',
  },

  // ── Story 12 ──────────────────────────────────────────────────────────────
  {
    id: 312,
    title: 'Gul Plaza, Karachi: When Negligence Repeats Itself',
    author: 'Dua Batool',
    date: 'Jan 22, 2026',
    excerpt: 'A Tragedy We Have Seen Before.',
    imageUrl: 'https://cdn-images-1.medium.com/v2/resize:fit:1200/1*QJ_R1FOo1YgeMPtTJG22gQ.jpeg',
    featured: false,
    content: '',
    tags: ['Accountability', 'Public Safety', 'Karachi', 'Fire Safety'],
    externalUrl: 'https://medium.com/the-ink-home/gul-plaza-karachi-when-negligence-repeats-itself-935b4fe3fc59',
  },

  // ── Story 13 (from 2025 archive) ──────────────────────────────────────────
  {
    id: 313,
    title: 'Why Being Chill Became My Most Useful Strength',
    author: 'Farhan Kabir',
    date: 'Dec 13, 2025',
    excerpt: 'A personal lesson on focus, emotional clarity and the tiny habits that reshape a noisy life.',
    imageUrl: 'https://cdn-images-1.medium.com/v2/resize:fit:1200/1*hLqjEoTUIdNmISJIBdFSMA.jpeg',
    featured: false,
    content: '',
    tags: ['Mindfulness', 'Habits', 'Focus', 'Self Improvement'],
    externalUrl: 'https://medium.com/the-ink-home/why-being-chill-became-my-most-useful-strength-6a27a0f4bd07',
  },

  // ── Story 14 ──────────────────────────────────────────────────────────────
  {
    id: 314,
    title: '10 Signs of Adult ADHD You Might Be Ignoring (And How to Actually Manage Them)',
    author: 'Farhan Kabir',
    date: 'Dec 15, 2025',
    excerpt: "Think you might have ADHD? Let's check the signs together — a surreal look at the internal noise of undiagnosed ADHD.",
    imageUrl: 'https://cdn-images-1.medium.com/v2/resize:fit:1200/1*_YRtBHEzQCxB3RNbfJpZ0w.jpeg',
    featured: false,
    content: '',
    tags: ['ADHD', 'Mental Health', 'Psychology', 'Productivity'],
    externalUrl: 'https://medium.com/the-ink-home/10-signs-of-adult-adhd-you-might-be-ignoring-and-how-to-actually-manage-them-df6c7e2e5c3a',
  },
];

// ── Derived helpers (static fallback) ────────────────────────────────────────

/** Hero: newest story at top of the list */
export const heroStory = mediumArticles[0];

/** Featured strip: first 3 */
export const featuredStories = mediumArticles.slice(0, 3);

/** Gallery marquee: all stories */
export const galleryStories = mediumArticles;

/** Top / most-responded story: "Why Being Chill…" (archived, pinned by author) */
export const topStory = mediumArticles[12]; // id 313
