// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY SYSTEM - Shared across all pages
// Categorizes stories by their tags for organized browsing
// ─────────────────────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  emoji: string;
  gradient: string;
  keywords: string[];
  description: string;
}

// ── Category Definitions ─────────────────────────────────────────────────────
export const CATEGORIES: Category[] = [
  {
    id: 'writing',
    name: 'Writing & Creativity',
    emoji: '✍️',
    gradient: 'from-amber-500 to-orange-500',
    keywords: ['writing', 'content creation', 'creativity', 'writing life', 'writing journey', 'medium', 'student writes'],
    description: 'Essays on writing craft, creativity, and the writer\'s journey',
  },
  {
    id: 'psychology',
    name: 'Psychology & Mind',
    emoji: '🧠',
    gradient: 'from-purple-500 to-indigo-500',
    keywords: ['psychology', 'mental health', 'adhd', 'brain health', 'kleptomania', 'emotional intelligence'],
    description: 'Explorations of the human mind, mental health, and psychology',
  },
  {
    id: 'human-rights',
    name: 'Human Rights & Society',
    emoji: '✊',
    gradient: 'from-red-500 to-rose-500',
    keywords: ['human rights', 'pakistan', 'accountability', 'public safety', 'fire safety', 'crime', 'tragedy', 'awareness', 'karachi'],
    description: 'Stories on justice, human rights, and social issues',
  },
  {
    id: 'self-improvement',
    name: 'Self Improvement',
    emoji: '🚀',
    gradient: 'from-blue-500 to-cyan-500',
    keywords: ['self improvement', 'growth', 'habits', 'mindfulness', 'focus', 'self growth', 'productivity', 'careers'],
    description: 'Insights on personal growth, habits, and becoming better',
  },
  {
    id: 'life-lessons',
    name: 'Life Lessons',
    emoji: '📖',
    gradient: 'from-green-500 to-emerald-500',
    keywords: ['life lessons', 'reflection', 'reflections', 'shakespeare', 'english literature', 'thinking', 'soul'],
    description: 'Reflections on life, literature, and timeless wisdom',
  },
  {
    id: 'love',
    name: 'Love & Connection',
    emoji: '💕',
    gradient: 'from-rose-500 to-pink-500',
    keywords: ['love', 'relationship', 'heartbreak', 'emotional', 'emotional depth', 'inner world', 'belonging', 'human connection', 'love at first sight'],
    description: 'Stories about love, relationships, and human connection',
  },
  {
    id: 'technology',
    name: 'Technology & AI',
    emoji: '🤖',
    gradient: 'from-slate-500 to-zinc-600',
    keywords: ['ai', 'artificial intelligence', 'machine learning', 'technology', 'social media'],
    description: 'Insights on technology, AI, and the digital world',
  },
];

// ── Get Primary Category from Tags ───────────────────────────────────────────
export function getPrimaryCategory(tags: string[]): Category {
  if (!tags || tags.length === 0) {
    return CATEGORIES[0]; // Default to Writing
  }

  const normalizedTags = tags.map(t => t.toLowerCase());

  for (const category of CATEGORIES) {
    const hasMatch = category.keywords.some(keyword =>
      normalizedTags.some(tag => tag.includes(keyword.toLowerCase()))
    );
    if (hasMatch) {
      return category;
    }
  }

  // Fallback to Writing & Creativity
  return CATEGORIES[0];
}

// ── Get All Categories for a Story ───────────────────────────────────────────
export function getAllCategories(tags: string[]): Category[] {
  if (!tags || tags.length === 0) {
    return [CATEGORIES[0]];
  }

  const normalizedTags = tags.map(t => t.toLowerCase());
  const matchedCategories: Category[] = [];

  for (const category of CATEGORIES) {
    const hasMatch = category.keywords.some(keyword =>
      normalizedTags.some(tag => tag.includes(keyword.toLowerCase()))
    );
    if (hasMatch) {
      matchedCategories.push(category);
    }
  }

  return matchedCategories.length > 0 ? matchedCategories : [CATEGORIES[0]];
}

// ── Group Stories by Category ────────────────────────────────────────────────
export interface StoryWithCategory<T> {
  story: T;
  category: Category;
}

export function groupStoriesByCategory<T extends { tags?: string[] }>(
  stories: T[]
): Map<string, T[]> {
  const grouped = new Map<string, T[]>();

  // Initialize all categories
  for (const category of CATEGORIES) {
    grouped.set(category.id, []);
  }

  // Categorize each story
  for (const story of stories) {
    const primaryCategory = getPrimaryCategory(story.tags || []);
    const existing = grouped.get(primaryCategory.id) || [];
    existing.push(story);
    grouped.set(primaryCategory.id, existing);
  }

  return grouped;
}

// ── Get Category by ID ───────────────────────────────────────────────────────
export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find(c => c.id === id);
}

// ── Get Stories for Display (distributed evenly) ─────────────────────────────
export function getDistributedStories<T extends { tags?: string[] }>(
  stories: T[],
  maxPerCategory: number = 3
): { category: Category; stories: T[] }[] {
  const grouped = groupStoriesByCategory(stories);
  const result: { category: Category; stories: T[] }[] = [];

  for (const category of CATEGORIES) {
    const categoryStories = grouped.get(category.id) || [];
    if (categoryStories.length > 0) {
      result.push({
        category,
        stories: categoryStories.slice(0, maxPerCategory),
      });
    }
  }

  return result;
}

// ── Category Stats ───────────────────────────────────────────────────────────
export function getCategoryStats<T extends { tags?: string[] }>(
  stories: T[]
): { category: Category; count: number }[] {
  const grouped = groupStoriesByCategory(stories);
  
  return CATEGORIES
    .map(category => ({
      category,
      count: (grouped.get(category.id) || []).length,
    }))
    .filter(item => item.count > 0)
    .sort((a, b) => b.count - a.count);
}
