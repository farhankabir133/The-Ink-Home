import { useMemo } from 'react';

/**
 * Calculate estimated reading time based on word count
 * Average reading speed: 200-250 words per minute (we use 225)
 * 
 * @param text - The text content to analyze
 * @returns Estimated reading time in minutes
 */
export const useReadingTime = (text: string): number => {
  return useMemo(() => {
    if (!text || text.trim().length === 0) {
      return 1; // Minimum 1 minute for empty or very short content
    }

    // Count words (split by whitespace and filter empty strings)
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;

    // Calculate reading time (225 words per minute average)
    const WORDS_PER_MINUTE = 225;
    const readingTimeMinutes = wordCount / WORDS_PER_MINUTE;

    // Round up to nearest minute, minimum 1 minute
    return Math.max(1, Math.ceil(readingTimeMinutes));
  }, [text]);
};

/**
 * Format reading time for display
 * 
 * @param minutes - Reading time in minutes
 * @returns Formatted string like "5 min read"
 */
export const formatReadingTime = (minutes: number): string => {
  if (minutes === 1) return '1 min read';
  return `${minutes} min read`;
};
