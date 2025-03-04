// Datei: app/api/channels-event/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.APP_ID as string,
  key: process.env.KEY as string,
  secret: process.env.SECRET as string,
  cluster: process.env.CLUSTER as string,
  useTLS: true,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await pusher.trigger('event-channel', 'event-name', body);
    return NextResponse.json(
      { message: 'Event sent successfully' },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Error triggering event' },
      { status: 500 },
    );
  }
}
