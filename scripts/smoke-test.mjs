import fs from 'node:fs/promises';
import path from 'node:path';

async function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(raw);
}

async function run() {
  const projectRoot = process.cwd();
  const cachePath = path.resolve(projectRoot, 'public/data/medium-feed.json');
  const appPath = path.resolve(projectRoot, 'App.tsx');

  const cache = await readJson(cachePath);
  await assert(Array.isArray(cache.stories), 'Feed cache does not include a stories array.');
  await assert(cache.stories.length > 0, 'Feed cache stories array is empty.');

  const hasBrokenStory = cache.stories.some(
    story => !story.title || !story.externalUrl || !Array.isArray(story.tags),
  );
  await assert(!hasBrokenStory, 'One or more cached stories are missing required fields.');

  const appSource = await fs.readFile(appPath, 'utf-8');
  await assert(appSource.includes('lazy(() => import('), 'Route lazy loading is not configured in App.tsx.');
  await assert(appSource.includes('Suspense'), 'Suspense fallback is missing in App.tsx.');

  console.log('Smoke tests passed.');
}

run().catch(error => {
  console.error('Smoke tests failed:', error.message);
  process.exitCode = 1;
});
