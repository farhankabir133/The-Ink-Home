import { useEffect } from 'react';

interface PageMetaOptions {
  title: string;
  description: string;
  pathname?: string;
  image?: string;
}

const SITE_NAME = 'The Ink Home';
const SITE_ORIGIN = 'https://farhankabir133.github.io';
const SITE_BASE_PATH = '/The-Ink-Home';
const DEFAULT_IMAGE = `${SITE_ORIGIN}${SITE_BASE_PATH}/og-image.jpg`;

function ensureMeta(selector: string, attribute: 'name' | 'property', key: string): HTMLMetaElement {
  let tag = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }
  return tag;
}

function ensureCanonical(): HTMLLinkElement {
  let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  return link;
}

export function usePageMeta({ title, description, pathname = '/', image = DEFAULT_IMAGE }: PageMetaOptions) {
  useEffect(() => {
    const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
    const canonicalUrl = `${SITE_ORIGIN}${SITE_BASE_PATH}${normalizedPath === '/' ? '/' : normalizedPath}`;

    document.title = `${title} | ${SITE_NAME}`;

    ensureMeta('meta[name="description"]', 'name', 'description').setAttribute('content', description);
    ensureMeta('meta[property="og:title"]', 'property', 'og:title').setAttribute('content', `${title} | ${SITE_NAME}`);
    ensureMeta('meta[property="og:description"]', 'property', 'og:description').setAttribute('content', description);
    ensureMeta('meta[property="og:url"]', 'property', 'og:url').setAttribute('content', canonicalUrl);
    ensureMeta('meta[property="og:image"]', 'property', 'og:image').setAttribute('content', image);
    ensureMeta('meta[property="twitter:card"]', 'property', 'twitter:card').setAttribute('content', 'summary_large_image');
    ensureMeta('meta[property="twitter:title"]', 'property', 'twitter:title').setAttribute('content', `${title} | ${SITE_NAME}`);
    ensureMeta('meta[property="twitter:description"]', 'property', 'twitter:description').setAttribute('content', description);
    ensureMeta('meta[property="twitter:image"]', 'property', 'twitter:image').setAttribute('content', image);

    ensureCanonical().setAttribute('href', canonicalUrl);
  }, [title, description, pathname, image]);
}
