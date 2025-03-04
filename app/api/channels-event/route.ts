// Datei: app/api/channels-event/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import Pusher from 'pusher';

const pusher = new Pusher({
  appId: '1952140',
  key: '8d01f715e0301242a4c4',
  secret: '2b1b37831277491cb953',
  cluster: 'eu',
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
