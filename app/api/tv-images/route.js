import { NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import path from 'path';

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif']);

async function collectImages(directory, relativePath = '') {
  const entries = await readdir(directory, { withFileTypes: true });
  const results = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.')) {
      continue;
    }

    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      const nextRelative = relativePath ? `${relativePath}/${entry.name}` : entry.name;
      const nested = await collectImages(entryPath, nextRelative);
      results.push(...nested);
      continue;
    }

    if (entry.isFile()) {
      const extension = path.extname(entry.name).toLowerCase();
      if (IMAGE_EXTENSIONS.has(extension)) {
        const filePath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
        results.push(encodeURI(`/${filePath}`));
      }
    }
  }

  return results;
}

export async function GET() {
  try {
    const tvDir = path.join(process.cwd(), 'public', 'TV');
    const images = await collectImages(tvDir, 'TV');
    images.sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }),
    );
    return NextResponse.json({ images });
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return NextResponse.json({ images: [] });
    }
    console.error('Failed to list public TV images', error);
    return NextResponse.json(
      { images: [], error: 'Could not read public images' },
      { status: 500 }
    );
  }
}
import { NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import path from 'path';
import { randomInt } from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'; // verhindert Next-Route-Caching

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif']);

async function collectImages(directory: string, relativePath = ''): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const results: string[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;

    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      const nextRelative = relativePath ? `${relativePath}/${entry.name}` : entry.name;
      results.push(...await collectImages(entryPath, nextRelative));
      continue;
    }

    if (entry.isFile()) {
      const extension = path.extname(entry.name).toLowerCase();
      if (IMAGE_EXTENSIONS.has(extension)) {
        const filePath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
        results.push(encodeURI(`/${filePath}`));
      }
    }
  }

  return results;
}

function pickRandom<T>(arr: T[]): T {
  // randomInt ist gleichverteilt und “sauberer” als Math.random() in solchen Fällen
  return arr[randomInt(arr.length)];
}

export async function GET() {
  try {
    const tvDir = path.join(process.cwd(), 'public', 'TV');
    const images = await collectImages(tvDir, 'TV');

    const headers = {
      // verhindert CDN/Browser/Proxy Caching -> jedes Mal neu würfeln
      'Cache-Control': 'no-store, max-age=0',
    };

    if (images.length === 0) {
      return NextResponse.json({ image: null }, { headers });
    }

    return NextResponse.json({ image: pickRandom(images) }, { headers });
  } catch (error: any) {
    if (error?.code === 'ENOENT') {
      return NextResponse.json({ image: null }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
    }
    console.error('Failed to list public TV images', error);
    return NextResponse.json(
      { image: null, error: 'Could not read public images' },
      { status: 500, headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  }
}
