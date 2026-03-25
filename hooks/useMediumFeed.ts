import { useState, useEffect } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// useMediumFeed
// Fetches the latest stories from The Ink Home Medium publication.
// Strategy: fetch the raw RSS feed from Medium directly, parse the XML in the
// browser.  This avoids rss2json's free-tier 10-item cap and broken `count`
// parameter, and gives us the real dc:creator author names + full content HTML
// for reliable image extraction.
//
// CORS note: medium.com/feed/* does NOT set CORS headers, so we proxy through
// a no-auth CORS proxy (allorigins.win) which just relays the raw XML.
// ─────────────────────────────────────────────────────────────────────────────

export interface MediumStory {
  id: string;
  title: string;
  author: string;
  date: string;         // "Feb 19, 2026"
  excerpt: string;
  imageUrl: string;     // cdn-images-1.medium.com, upgraded to v2/resize:fit:1200
  externalUrl: string;  // canonical medium.com URL, no ?source= params
  tags: string[];
  featured: boolean;
}

export interface UseMediumFeedResult {
  stories: MediumStory[];
  loading: boolean;
  error: string | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Upgrade a cdn-images-1.medium.com URL to a 1200-wide v2 URL (no redirect). */
function upgradeMediumImageUrl(url: string): string {
  if (!url) return url;
  try {
    const u = new URL(url);
    if (u.hostname === 'cdn-images-1.medium.com') {
      u.pathname = u.pathname.replace(
        /^\/(max\/\d+|v2\/resize:[^/]+)\//,
        '/v2/resize:fit:1200/',
      );
      return u.toString();
    }
  } catch { /* fall through */ }
  return url;
}

/** Extract the first cdn-images-1.medium.com <img> from HTML, upgraded to 1200px. */
function extractImage(html: string): string {
  const m = html.match(/<img[^>]+src="(https:\/\/cdn-images-1\.medium\.com[^"]+)"/);
  if (m?.[1]) return upgradeMediumImageUrl(m[1]);
  return 'https://cdn-images-1.medium.com/proxy/1*TGH72Nnw24QL3iV9IOm4VA.png';
}

/** Pull plain-text excerpt from the medium-feed-snippet span, or strip tags. */
function extractExcerpt(html: string): string {
  const m = html.match(/class="medium-feed-snippet"[^>]*>([^<]+)</);
  if (m?.[1]) return m[1].trim();
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 180);
}

/** Strip ?source=rss… query params Medium appends to article links. */
function cleanUrl(url: string): string {
  try { const u = new URL(url); u.search = ''; return u.toString(); }
  catch { return url; }
}

/** "Thu, 19 Feb 2026 19:17:51 GMT" → "Feb 19, 2026" */
function formatDate(pubDate: string): string {
  try {
    return new Date(pubDate).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  } catch { return pubDate; }
}

/** "writing-life" → "Writing Life" */
function formatTag(tag: string): string {
  return tag.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

/** Pull all <item> text blocks from an RSS XML string. */
function parseItems(xml: string): MediumStory[] {
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];
  return items.map((m, idx) => {
    const raw = m[1];

    const title   = raw.match(/<title><!\[CDATA\[([^\]]+)\]\]>/)?.[1]?.trim()
                 ?? raw.match(/<title>([^<]+)/)?.[1]?.trim()
                 ?? '';
    const link    = raw.match(/<link>([^<\s]+)/)?.[1]?.trim() ?? '';
    const guid    = raw.match(/<guid[^>]*>([^<]+)/)?.[1]?.trim() ?? link;
    const pubDate = raw.match(/<pubDate>([^<]+)/)?.[1]?.trim() ?? '';
    const author  = raw.match(/<dc:creator><!\[CDATA\[([^\]]+)\]\]>/)?.[1]?.trim()
                 ?? 'The Ink Home';

    // content:encoded has the full post HTML with the featured image
    const content = raw.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]>/)?.[1] ?? '';
    const desc    = raw.match(/<description><!\[CDATA\[([\s\S]*?)\]\]>/)?.[1] ?? '';
    const fullHtml = content || desc;

    const tags = [...raw.matchAll(/<category><!\[CDATA\[([^\]]+)\]\]>/g)]
      .map(c => formatTag(c[1]))
      .slice(0, 4);

    return {
      id:          guid,
      title,
      author,
      date:        formatDate(pubDate),
      excerpt:     extractExcerpt(desc || content),
      imageUrl:    extractImage(fullHtml),
      externalUrl: cleanUrl(link),
      tags,
      featured:    idx < 3,
    };
  });
}

// ── Constants ─────────────────────────────────────────────────────────────────

// Multiple CORS proxies for redundancy
const CORS_PROXIES = [
  'https://api.allorigins.win/get?url=',
  'https://corsproxy.io/?',
  'https://api.codetabs.com/v1/proxy?quest=',
];
const MEDIUM_FEED = 'https://medium.com/feed/the-ink-home';

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useMediumFeed(): UseMediumFeedResult {
  const [stories, setStories] = useState<MediumStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function tryProxy(proxyUrl: string): Promise<string> {
      const url = proxyUrl.includes('allorigins') 
        ? `${proxyUrl}${encodeURIComponent(MEDIUM_FEED)}`
        : `${proxyUrl}${encodeURIComponent(MEDIUM_FEED)}`;
      
      const res = await fetch(url, { 
        signal: AbortSignal.timeout(8000) // 8 second timeout
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      // allorigins returns { contents: "..." }
      if (proxyUrl.includes('allorigins')) {
        const wrapper = await res.json() as { contents: string };
        if (!wrapper.contents) throw new Error('Empty response');
        return wrapper.contents;
      }
      
      // Other proxies return raw content
      return await res.text();
    }

    async function fetchFeed() {
      let lastError: Error | null = null;

      // Try each CORS proxy
      for (const proxy of CORS_PROXIES) {
        try {
          const xml = await tryProxy(proxy);
          const parsed = parseItems(xml);
          if (parsed.length > 0) {
            if (!cancelled) { 
              setStories(parsed); 
              setError(null); 
              setLoading(false);
            }
            return; // Success!
          }
        } catch (err) {
          lastError = err instanceof Error ? err : new Error('Unknown error');
          // Continue to next proxy
        }
      }

      // All proxies failed, try rss2json as final fallback
      try {
        const res = await fetch(
          'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fmedium.com%2Ffeed%2Fthe-ink-home',
          { signal: AbortSignal.timeout(8000) }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json() as { status: string; items: Array<{
          title: string; author: string; pubDate: string; link: string;
          guid: string; thumbnail: string; description: string; categories: string[];
        }> };
        if (data.status === 'ok' && data.items?.length) {
          const parsed: MediumStory[] = data.items.map((item, idx) => ({
            id:          item.guid || item.link,
            title:       item.title,
            author:      item.author || 'The Ink Home',
            date:        formatDate(item.pubDate),
            excerpt:     extractExcerpt(item.description),
            imageUrl:    extractImage(item.description),
            externalUrl: cleanUrl(item.link),
            tags:        (item.categories || []).slice(0, 4).map(formatTag),
            featured:    idx < 3,
          }));

          if (!cancelled) { 
            setStories(parsed); 
            setError(null);
            setLoading(false);
          }
          return;
        }
      } catch {
        // rss2json also failed
      }

      // All feeds failed - set error state (pages will use static fallback)
      if (!cancelled) {
        setError(lastError?.message || 'Feed unavailable');
        setLoading(false);
      }
    }

    fetchFeed();
    return () => { cancelled = true; };
  }, []);

  return { stories, loading, error };
}
