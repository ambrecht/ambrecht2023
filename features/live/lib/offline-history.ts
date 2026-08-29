import { buildTypewriterApiUrl } from '@/lib/live/api';

export type OfflineHistoryItem = {
  id: number;
  title: string | null;
  excerpt: string;
  createdAt: string;
};

export type OfflineHistorySessionText = {
  id: number;
  text: string;
};

type SessionPayload = {
  id?: number | string;
  session_id?: number | string;
  title?: string | null;
  preview?: string | null;
  text_preview?: string | null;
  text?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  document_id?: number | string | null;
  tags?: string[];
};

type SessionResponse = {
  success?: boolean;
  data?: SessionPayload;
};

type SessionListResponse = {
  success?: boolean;
  data?: SessionPayload[];
  pagination?: {
    next_page_token?: string | null;
    nextPageToken?: string | null;
    next_cursor?: string | null;
    cursor?: string | null;
    has_more?: boolean;
    hasMore?: boolean;
  };
};

const offlineHistoryTag = '#notlivepage';
const historyLimit = 3;
const searchPageSize = 24;
const maxPages = 4;
const excerptMinimumLength = 600;
const excerptSoftLength = 900;
const excerptMaxLength = 1000;

const TYPEWRITER_API_KEY =
  process.env.TYPEWRITER_API_KEY || process.env.API_KEY || '';

function getNextPageToken(response: SessionListResponse) {
  return (
    response.pagination?.next_page_token ??
    response.pagination?.nextPageToken ??
    response.pagination?.next_cursor ??
    response.pagination?.cursor ??
    null
  );
}

function hasMore(response: SessionListResponse) {
  return Boolean(
    response.pagination?.has_more ??
      response.pagination?.hasMore ??
      getNextPageToken(response),
  );
}

function getSessionId(payload: SessionPayload) {
  const raw = payload.id ?? payload.session_id;
  const id = typeof raw === 'string' ? Number(raw) : raw;
  return typeof id === 'number' && Number.isFinite(id) ? id : null;
}

function getDocumentKey(payload: SessionPayload, id: number) {
  if (payload.document_id === null || payload.document_id === undefined) {
    return `session:${id}`;
  }

  return `document:${String(payload.document_id)}`;
}

function hasOfflineHistoryTag(payload: SessionPayload) {
  return (payload.tags ?? []).some((tag) => tag.trim() === offlineHistoryTag);
}

function compactText(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function buildExcerpt(text: string | null | undefined) {
  const cleanText = compactText(text ?? '');
  if (cleanText.length <= excerptSoftLength) return cleanText;

  const softWindow = cleanText.slice(0, excerptSoftLength);
  const hardWindow = cleanText.slice(0, excerptMaxLength);
  const sentencePattern = /[.!?]["')\]]?(?=\s|$)/g;

  const findLastNaturalEnd = (value: string) => {
    let end = -1;
    let match: RegExpExecArray | null;

    while ((match = sentencePattern.exec(value)) !== null) {
      const candidateEnd = match.index + match[0].length;

      if (candidateEnd >= excerptMinimumLength) {
        end = candidateEnd;
      }
    }

    sentencePattern.lastIndex = 0;
    return end;
  };

  const naturalEnd = findLastNaturalEnd(softWindow);
  const hardNaturalEnd = findLastNaturalEnd(hardWindow);
  const wordBoundary = cleanText.lastIndexOf(' ', excerptSoftLength);
  const fallbackBoundary = cleanText.lastIndexOf(' ', excerptMaxLength);
  const end =
    naturalEnd >= excerptMinimumLength
      ? naturalEnd
      : hardNaturalEnd >= excerptMinimumLength
        ? hardNaturalEnd
        : wordBoundary >= excerptMinimumLength
          ? wordBoundary
          : fallbackBoundary > 0
            ? fallbackBoundary
            : excerptMaxLength;

  return `${cleanText.slice(0, end).trimEnd()}…`;
}

function toHistoryItem(payload: SessionPayload): OfflineHistoryItem | null {
  const id = getSessionId(payload);
  const createdAt = payload.created_at;
  if (id === null || !createdAt || payload.deleted_at) return null;
  if (!hasOfflineHistoryTag(payload)) return null;

  return {
    id,
    title: payload.title?.trim() || null,
    excerpt: buildExcerpt(payload.text),
    createdAt,
  };
}

async function requestTypewriter<T>(path: string, query?: URLSearchParams) {
  if (!TYPEWRITER_API_KEY) {
    throw new Error('TYPEWRITER_API_KEY fehlt.');
  }

  const response = await fetch(buildTypewriterApiUrl(path, query), {
    cache: 'no-store',
    headers: {
      accept: 'application/json',
      'x-api-key': TYPEWRITER_API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`Typewriter API antwortete mit ${response.status}.`);
  }

  return (await response.json()) as T;
}

async function loadSessionById(id: number) {
  const response = await requestTypewriter<SessionResponse>(`/sessions/${id}`);
  return response.success === false ? null : response.data ?? null;
}

async function hydrateSession(payload: SessionPayload) {
  if (payload.tags && payload.created_at && typeof payload.text === 'string') {
    return payload;
  }

  const id = getSessionId(payload);
  if (id === null) return payload;

  const detail = await loadSessionById(id).catch(() => null);
  return detail ? { ...payload, ...detail } : payload;
}

export async function loadOfflineHistory(): Promise<OfflineHistoryItem[]> {
  const byDocument = new Map<string, SessionPayload>();
  let pageToken: string | null = null;

  for (let page = 0; page < maxPages && byDocument.size < historyLimit; page += 1) {
    const query = new URLSearchParams({
      q: 'notlivepage',
      fields: 'tags',
      page_size: String(searchPageSize),
    });
    if (pageToken) query.set('page_token', pageToken);

    const response = await requestTypewriter<SessionListResponse>(
      '/sessions/search',
      query,
    );
    const payloads = response.success === false ? [] : response.data ?? [];
    const hydrated = await Promise.all(payloads.map(hydrateSession));

    for (const payload of hydrated) {
      const id = getSessionId(payload);
      if (id === null || payload.deleted_at || !hasOfflineHistoryTag(payload)) {
        continue;
      }

      const key = getDocumentKey(payload, id);
      const existing = byDocument.get(key);
      if (
        !existing ||
        new Date(payload.created_at ?? 0).getTime() >
          new Date(existing.created_at ?? 0).getTime()
      ) {
        byDocument.set(key, payload);
      }
    }

    pageToken = getNextPageToken(response);
    if (!pageToken || !hasMore(response)) break;
  }

  return Array.from(byDocument.values())
    .sort(
      (a, b) =>
        new Date(b.created_at ?? 0).getTime() -
        new Date(a.created_at ?? 0).getTime(),
    )
    .map(toHistoryItem)
    .filter((item): item is OfflineHistoryItem => item !== null)
    .slice(0, historyLimit);
}

export async function loadOfflineHistorySessionText(
  id: number,
): Promise<OfflineHistorySessionText | null> {
  if (!Number.isFinite(id)) return null;

  const session = await loadSessionById(id);
  if (!session || session.deleted_at || !hasOfflineHistoryTag(session)) {
    return null;
  }

  const sessionId = getSessionId(session);
  if (sessionId === null) return null;

  return {
    id: sessionId,
    text: session.text ?? '',
  };
}
