# Reading Time Hook - Test Cases & Validation

This document contains manual test cases for the `useReadingTime` hook to ensure it handles edge cases correctly.

## Test Setup

To manually test the reading time calculation, you can use the browser console or create a simple test page.

### Quick Test in Browser Console

```javascript
// Copy the useReadingTime logic (without React hooks)
function calculateReadingTime(text) {
  if (!text || text.trim().length === 0) {
    return 1;
  }
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;
  const WORDS_PER_MINUTE = 225;
  const readingTimeMinutes = wordCount / WORDS_PER_MINUTE;
  return Math.max(1, Math.ceil(readingTimeMinutes));
}

// Run tests
console.log('Empty string:', calculateReadingTime(''));  // Expected: 1
console.log('Short text:', calculateReadingTime('Hello world'));  // Expected: 1
console.log('225 words:', calculateReadingTime(new Array(225).fill('word').join(' ')));  // Expected: 1
console.log('450 words:', calculateReadingTime(new Array(450).fill('word').join(' ')));  // Expected: 2
console.log('1000 words:', calculateReadingTime(new Array(1000).fill('word').join(' ')));  // Expected: 5
```

## Test Cases

### 1. Empty and Whitespace Tests

| Input | Expected Output | Reason |
|-------|----------------|---------|
| `""` | 1 min | Minimum reading time for empty content |
| `"   "` | 1 min | Whitespace-only should return minimum |
| `"\n\t\r"` | 1 min | Special whitespace characters |

### 2. Very Short Content

| Input | Word Count | Expected Output |
|-------|-----------|----------------|
| `"Hello"` | 1 | 1 min |
| `"Hello world"` | 2 | 1 min |
| `"This is a test"` | 4 | 1 min |
| Short paragraph (50 words) | 50 | 1 min |

### 3. Normal Articles

| Word Count | Calculation | Expected Output |
|-----------|-------------|----------------|
| 225 | 225/225 = 1.0 | 1 min |
| 226 | 226/225 = 1.004 → ceil = 2 | 2 min |
| 450 | 450/225 = 2.0 | 2 min |
| 500 | 500/225 = 2.22 → ceil = 3 | 3 min |
| 1000 | 1000/225 = 4.44 → ceil = 5 | 5 min |

### 4. Long-Form Content

| Word Count | Expected Output | Use Case |
|-----------|----------------|----------|
| 2250 | 10 min | Medium-length essay |
| 4500 | 20 min | Long-form article |
| 6750 | 30 min | Research paper/thesis |

### 5. Edge Cases with Special Characters

```javascript
// Test with punctuation
const text1 = "Hello! How are you? I'm doing great.";
// Expected: 1 min (7 words)

// Test with multiple spaces
const text2 = "Word1    Word2     Word3";
// Expected: 1 min (3 words)

// Test with newlines
const text3 = `Line one
Line two
Line three`;
// Expected: 1 min (6 words)

// Test with mixed content
const text4 = `
  Paragraph one with some words.
  
  Paragraph two with more words.
  
  Final paragraph here.
`;
// Expected: 1 min (12 words)
```

## Integration Testing

### Test in Article Detail Page

1. Navigate to any article page
2. Open browser DevTools
3. Run this in console:

```javascript
// Get article content
const content = document.querySelector('.prose')?.innerText || '';
const words = content.trim().split(/\s+/).filter(w => w.length > 0).length;
const expectedMinutes = Math.max(1, Math.ceil(words / 225));
console.log(`Article has ${words} words`);
console.log(`Expected reading time: ${expectedMinutes} min`);
```

4. Compare with displayed reading time badge

## Validation Checklist

- [ ] Empty string returns 1 minute
- [ ] Whitespace-only returns 1 minute
- [ ] Very short text (< 225 words) returns 1 minute
- [ ] Exactly 225 words returns 1 minute
- [ ] 226 words rounds up to 2 minutes
- [ ] 450 words returns 2 minutes
- [ ] 500 words returns 3 minutes (500/225 = 2.22, rounded up)
- [ ] 1000 words returns 5 minutes (1000/225 = 4.44, rounded up)
- [ ] Multiple spaces between words handled correctly
- [ ] Newlines and tabs handled correctly
- [ ] Punctuation doesn't create extra words
- [ ] Reading time badge displays correctly on article pages

## Formula Reference

```
Words Per Minute (WPM) = 225 (industry average)
Reading Time = CEIL(Word Count / WPM)
Minimum Reading Time = 1 minute
```

## Expected Behavior

1. **Always returns at least 1 minute** - Even for empty or very short content
2. **Rounds up** - Uses `Math.ceil()` to always round up to next minute
3. **Consistent word counting** - Splits on whitespace, filters empty strings
4. **Memoized** - Uses `useMemo` to prevent unnecessary recalculations

## Real-World Examples

### Typical Blog Post (500 words)
- **Calculation**: 500 / 225 = 2.22
- **Result**: 3 min read ✓

### Medium Article (1200 words)
- **Calculation**: 1200 / 225 = 5.33
- **Result**: 6 min read ✓

### Long Essay (3000 words)
- **Calculation**: 3000 / 225 = 13.33
- **Result**: 14 min read ✓
