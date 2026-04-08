import fs from 'node:fs/promises';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const DIST_DIR = path.resolve(process.cwd(), 'dist/assets');
const FEED_CACHE_PATH = path.resolve(process.cwd(), 'public/data/medium-feed.json');

const JS_GZIP_BUDGET_BYTES = 80 * 1024;
const LCP_MOBILE_BUDGET_BYTES = 180 * 1024;

function bytesToKB(bytes) {
  return `${(bytes / 1024).toFixed(1)}kB`;
}

async function getInitialJsGzipSize() {
  const files = await fs.readdir(DIST_DIR);
  const entryFiles = files.filter(file => /^index-.*\.js$/.test(file));

  if (entryFiles.length === 0) {
    throw new Error('Could not find initial index JS bundle in dist/assets');
  }

  let total = 0;
  for (const file of entryFiles) {
    const filePath = path.join(DIST_DIR, file);
    const content = await fs.readFile(filePath);
    total += gzipSync(content).length;
  }

  return total;
}

function toMobileMediumImage(url) {
  return url.replace(/\/v2\/resize:[^/]+\//, '/v2/resize:fit:768/');
}

async function resolveLcpImageUrl() {
  const raw = await fs.readFile(FEED_CACHE_PATH, 'utf-8');
  const payload = JSON.parse(raw);
  const candidate = payload?.stories?.[0]?.imageUrl;

  if (!candidate) {
    throw new Error('No hero story image found in public/data/medium-feed.json');
  }

  return toMobileMediumImage(candidate);
}

async function fetchWithRetry(url, attempts = 3) {
  let lastError;

  for (let i = 0; i < attempts; i += 1) {
    try {
      const res = await fetch(url, {
        method: 'HEAD',
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const length = res.headers.get('content-length');
      if (length) {
        return Number(length);
      }

      // Fallback when content-length is absent.
      const getRes = await fetch(url, {
        method: 'GET',
        headers: { Range: 'bytes=0-0' },
        signal: AbortSignal.timeout(10000),
      });

      if (!getRes.ok) {
        throw new Error(`GET fallback failed with HTTP ${getRes.status}`);
      }

      const range = getRes.headers.get('content-range');
      if (range?.includes('/')) {
        const total = Number(range.split('/')[1]);
        if (Number.isFinite(total) && total > 0) {
          return total;
        }
      }

      throw new Error('Unable to determine image size from response headers');
    } catch (error) {
      lastError = error;
      await new Promise(resolve => setTimeout(resolve, 600 * (i + 1)));
    }
  }

  throw lastError;
}

async function run() {
  const checks = [];

  const jsGzipSize = await getInitialJsGzipSize();
  checks.push({
    name: 'Initial JS (gzip)',
    size: jsGzipSize,
    budget: JS_GZIP_BUDGET_BYTES,
    pass: jsGzipSize < JS_GZIP_BUDGET_BYTES,
  });

  const lcpImageUrl = await resolveLcpImageUrl();
  const lcpImageBytes = await fetchWithRetry(lcpImageUrl);
  checks.push({
    name: 'LCP image mobile candidate',
    size: lcpImageBytes,
    budget: LCP_MOBILE_BUDGET_BYTES,
    pass: lcpImageBytes < LCP_MOBILE_BUDGET_BYTES,
    url: lcpImageUrl,
  });

  let hasFailure = false;
  console.log('\nPerformance budget report');
  console.log('-------------------------');

  for (const check of checks) {
    const status = check.pass ? 'PASS' : 'FAIL';
    const urlSuffix = check.url ? `\n   URL: ${check.url}` : '';
    console.log(
      `${status} | ${check.name}: ${bytesToKB(check.size)} / budget ${bytesToKB(check.budget)}${urlSuffix}`,
    );

    if (!check.pass) {
      hasFailure = true;
    }
  }

  if (hasFailure) {
    process.exitCode = 1;
    throw new Error('Performance budget regression detected.');
  }
}

run().catch(error => {
  console.error('\nBudget check failed:', error.message);
  process.exitCode = 1;
});
