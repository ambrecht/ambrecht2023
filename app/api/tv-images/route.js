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
