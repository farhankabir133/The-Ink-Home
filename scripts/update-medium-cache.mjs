import fs from 'node:fs/promises';
import path from 'node:path';

const MEDIUM_FEED = 'https://medium.com/feed/the-ink-home';
const OUTPUT_PATH = path.resolve(process.cwd(), 'public/data/medium-feed.json');

function upgradeMediumImageUrl(url) {
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
  } catch {
    // no-op
  }

  return url;
}

function extractImage(html) {
  const m = html.match(/<img[^>]+src="(https:\/\/cdn-images-1\.medium\.com[^"]+)"/);
  if (m?.[1]) return upgradeMediumImageUrl(m[1]);
  return 'https://cdn-images-1.medium.com/proxy/1*TGH72Nnw24QL3iV9IOm4VA.png';
}

function extractExcerpt(html) {
  const m = html.match(/class="medium-feed-snippet"[^>]*>([^<]+)</);
  if (m?.[1]) return m[1].trim();
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 180);
}

function cleanUrl(url) {
  try {
    const u = new URL(url);
    u.search = '';
    return u.toString();
  } catch {
    return url;
  }
}

function formatDate(pubDate) {
  try {
    return new Date(pubDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return pubDate;
  }
}

function formatTag(tag) {
  return tag
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function parseItems(xml) {
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];

  return items.map((m, idx) => {
    const raw = m[1];

    const title =
      raw.match(/<title><!\[CDATA\[([^\]]+)\]\]>/)?.[1]?.trim() ??
      raw.match(/<title>([^<]+)/)?.[1]?.trim() ??
      '';
    const link = raw.match(/<link>([^<\s]+)/)?.[1]?.trim() ?? '';
    const guid = raw.match(/<guid[^>]*>([^<]+)/)?.[1]?.trim() ?? link;
    const pubDate = raw.match(/<pubDate>([^<]+)/)?.[1]?.trim() ?? '';
    const author =
      raw.match(/<dc:creator><!\[CDATA\[([^\]]+)\]\]>/)?.[1]?.trim() ||
      'The Ink Home';

    const content = raw.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]>/)?.[1] ?? '';
    const desc = raw.match(/<description><!\[CDATA\[([\s\S]*?)\]\]>/)?.[1] ?? '';
    const fullHtml = content || desc;

    const tags = [...raw.matchAll(/<category><!\[CDATA\[([^\]]+)\]\]>/g)]
      .map(c => formatTag(c[1]))
      .slice(0, 4);

    return {
      id: guid,
      title,
      author,
      date: formatDate(pubDate),
      excerpt: extractExcerpt(desc || content),
      imageUrl: extractImage(fullHtml),
      externalUrl: cleanUrl(link),
      tags,
      featured: idx < 3,
    };
  });
}

async function updateCache() {
  console.log('Fetching Medium feed...');

  const res = await fetch(MEDIUM_FEED, {
    signal: AbortSignal.timeout(15000),
    headers: {
      'User-Agent': 'the-ink-home-feed-updater/1.0',
      Accept: 'application/rss+xml, application/xml, text/xml, */*',
    },
  });

  if (!res.ok) {
    throw new Error(`Medium feed request failed: HTTP ${res.status}`);
  }

  const xml = await res.text();
  const stories = parseItems(xml).filter(s => s.title && s.externalUrl);

  if (stories.length === 0) {
    throw new Error('Parsed Medium feed but found zero stories');
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    source: MEDIUM_FEED,
    total: stories.length,
    stories,
  };

  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf-8');

  console.log(`Wrote ${stories.length} stories to ${OUTPUT_PATH}`);
}

updateCache().catch(error => {
  console.error('Failed to refresh Medium feed cache:', error);
  process.exitCode = 1;
});
