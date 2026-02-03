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
      const ext = path.extname(entry.name).toLowerCase();
      if (IMAGE_EXTENSIONS.has(ext)) {
        const filePath = relativePath
          ? `${relativePath}/${entry.name}`
          : entry.name;
        results.push(encodeURI(`/${filePath}`));
      }
    }
  }

  return results;
}

function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export async function GET(req) {
  const headers = { 'Cache-Control': 'no-store, max-age=0' };

  try {
    const tvDir = path.join(process.cwd(), 'public', 'TV');
    const images = await collectImages(tvDir, 'TV');

    shuffleInPlace(images);

    // Optional: /api/tv-images?limit=1
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get('limit') ?? '0');

    const sliced = limit > 0 ? images.slice(0, limit) : images;

    return NextResponse.json({ images: sliced }, { headers });
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return NextResponse.json({ images: [] }, { headers });
    }
    console.error('Failed to list public TV images', error);
    return NextResponse.json(
      { images: [], error: 'Could not read public images' },
      { status: 500, headers },
    );
  }
}
