#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';

async function main() {
  const src = process.argv[2];
  if (!src) {
    console.error('Usage: node scripts/copy-here-frames.mjs /absolute/path/to/source-folder');
    process.exit(2);
  }

  const absSrc = path.resolve(src);
  const target = path.resolve(process.cwd(), 'public', 'here-frames');

  try {
    const stat = await fs.stat(absSrc);
    if (!stat.isDirectory()) {
      console.error('Source is not a directory:', absSrc);
      process.exit(2);
    }
  } catch (err) {
    console.error('Source directory not found:', absSrc);
    process.exit(2);
  }

  await fs.mkdir(target, { recursive: true });

  const files = (await fs.readdir(absSrc)).filter(f => /\.(jpe?g|png)$/i.test(f));
  if (files.length === 0) {
    console.error('No image files found in source directory.');
    process.exit(2);
  }

  // Sort files naturally by name to preserve order, then copy and rename to frame-###.jpg
  files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

  for (let i = 0; i < files.length; i++) {
    const srcFile = path.join(absSrc, files[i]);
    const destName = `frame-${String(i + 1).padStart(3, '0')}${path.extname(files[i]).toLowerCase()}`;
    const destFile = path.join(target, destName);
    await fs.copyFile(srcFile, destFile);
    console.log(`Copied ${files[i]} -> ${path.relative(process.cwd(), destFile)}`);
  }

  console.log(`Installed ${files.length} frames into ${path.relative(process.cwd(), target)}`);
  console.log('You can now run `npm run dev` and the here hero will use these frames.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
