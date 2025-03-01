// app/api/get-audio-files/route.js
import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
  const audioDirectory = path.join(process.cwd(), 'public', 'audio');

  try {
    const files = fs.readdirSync(audioDirectory);
    const audioFiles = files.filter((file) =>
      ['.mp3', '.wav', '.ogg'].includes(path.extname(file).toLowerCase()),
    );

    return NextResponse.json(audioFiles);
  } catch (err) {
    console.error('Fehler beim Lesen des Audio-Verzeichnisses:', err);
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Audiodateien' },
      { status: 500 },
    );
  }
}
