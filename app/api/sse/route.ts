export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { redis } from '@/lib/redis';

export async function GET(req: NextRequest) {
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
  });

  let lastText = '';
  const intervalId = setInterval(async () => {
    try {
      const currentText = await redis.get<string>('current_text');
      if (currentText && currentText !== lastText) {
        lastText = currentText;
        const payload = `event: update\ndata: ${JSON.stringify({
          text: currentText,
        })}\n\n`;
        writer.write(new TextEncoder().encode(payload));
      }
    } catch (error) {
      console.error('Polling-Fehler:', error);
    }
  }, 1000);

  req.signal?.addEventListener('abort', () => {
    clearInterval(intervalId);
    writer.close();
  });

  return new Response(readable, { headers });
}
