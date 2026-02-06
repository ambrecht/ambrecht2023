import { NextResponse } from 'next/server';
import { proxyRequest } from '@/lib/server/apiProxy';

export const runtime = 'nodejs';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  let payload:
    | { start_offset?: unknown; end_offset?: unknown; note?: unknown }
    | null = null;
  try {
    payload = (await request.json()) as {
      start_offset?: unknown;
      end_offset?: unknown;
      note?: unknown;
    };
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: 'validation_error',
        message: 'Invalid JSON body.',
      },
      { status: 400 },
    );
  }

  return proxyRequest({
    method: 'PATCH',
    path: `/notes/${params.id}`,
    body: JSON.stringify(payload ?? {}),
    requireApiKey: true,
    context: { route: 'notes.update', note_id: params.id },
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  return proxyRequest({
    method: 'DELETE',
    path: `/notes/${params.id}`,
    requireApiKey: true,
    context: { route: 'notes.delete', note_id: params.id },
  });
}
