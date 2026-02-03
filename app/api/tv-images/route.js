import { NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import path from 'path';
import { randomInt } from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const IMAGE_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.avif',
  '.gif',
]);

async function collectImages(directory, relativePath = '') {
  const entries = await readdir(directory, { withFileTypes: true });
  const results = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;

    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      const nextRelative = relativePath
        ? `${relativePath}/${entry.name}`
        : entry.name;
      results.push(...(await collectImages(entryPath, nextRelative)));
      continue;
    }

    if (entry.isFile()) {
      const extension = path.extname(entry.name).toLowerCase();
      if (IMAGE_EXTENSIONS.has(extension)) {
        const filePath = relativePath
          ? `${relativePath}/${entry.name}`
          : entry.name;
        results.push(encodeURI(`/${filePath}`));
      }
    }
  }

  return results;
}

function pickRandom(arr) {
  return arr[randomInt(arr.length)];
}

export async function GET() {
  const headers = { 'Cache-Control': 'no-store, max-age=0' };

  try {
    const tvDir = path.join(process.cwd(), 'public', 'TV');
    const images = await collectImages(tvDir, 'TV');

    if (images.length === 0) {
      return NextResponse.json({ image: null }, { headers });
    }

    return NextResponse.json({ image: pickRandom(images) }, { headers });
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return NextResponse.json({ image: null }, { headers });
    }

    console.error('Failed to list public TV images', error);
    return NextResponse.json(
      { image: null, error: 'Could not read public images' },
      { status: 500, headers },
    );
  }
}
