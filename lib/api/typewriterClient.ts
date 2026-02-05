import type {
  AnalysisRun,
  ApiResponse,
  ApiSuccess,
  Finding,
  Note,
  Pagination,
  Session,
} from './types';

const DEFAULT_API_BASE_URL = '/api';
const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL
).replace(/\/$/, '');

const API_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
};

const buildApiUrl = (
  path: string,
  query?: Record<string, string | number | undefined>,
) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const params = new URLSearchParams();
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) {
        params.set(key, String(value));
      }
    }
  }
  const queryString = params.toString();
  return `${API_BASE_URL}${normalizedPath}${queryString ? `?${queryString}` : ''}`;
};

const getErrorMessage = (json: ApiResponse<unknown> | null, fallback: string) => {
  if (!json) return fallback;
  if (json.success) return fallback;
  return json.error || json.message || fallback;
};

async function request<T>(
  path: string,
  init: RequestInit & { query?: Record<string, string | number | undefined> } = {},
) {
  const { query, ...rest } = init;
  const response = await fetch(buildApiUrl(path, query), {
    ...rest,
    headers: {
      ...API_HEADERS,
      ...(rest.headers || {}),
    },
    cache: rest.cache ?? 'no-store',
  });
  const json = (await response.json().catch(() => null)) as ApiResponse<T> | null;
  if (!response.ok || !json || !json.success) {
    throw new Error(getErrorMessage(json, 'Unerwartete API-Antwort.'));
  }
  return json as ApiSuccess<T>;
}

async function requestNoContent(
  path: string,
  init: RequestInit = {},
): Promise<void> {
  const response = await fetch(buildApiUrl(path), {
    ...init,
    headers: {
      ...API_HEADERS,
      ...(init.headers || {}),
    },
  });
  if (response.status === 204) return;
  const json = (await response.json().catch(() => null)) as ApiResponse<unknown> | null;
  if (!response.ok || !json || !json.success) {
    throw new Error(getErrorMessage(json, 'Unerwartete API-Antwort.'));
  }
}

export async function getSession(id: number) {
  const json = await request<Session>(`/sessions/${id}`);
  return json.data;
}

export async function createEdit(sessionId: number, text: string) {
  const json = await request<Session>(`/sessions/${sessionId}/edits`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
  return json.data;
}

export async function getDocumentVersions(
  documentId: number,
  limit = 50,
  offset = 0,
) {
  const json = await request<Session[]>(`/documents/${documentId}/versions`, {
    method: 'GET',
    query: { limit, offset },
  });
  return {
    data: json.data,
    pagination: json.pagination as Pagination | undefined,
  };
}

export async function getNotes(sessionId: number, start: number, end: number) {
  const json = await request<Note[]>(`/sessions/${sessionId}/notes`, {
    method: 'GET',
    query: { start, end },
  });
  return json.data;
}

export async function createNote(
  sessionId: number,
  payload: Pick<Note, 'start_offset' | 'end_offset' | 'note'>,
) {
  const json = await request<Note>(`/sessions/${sessionId}/notes`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return json.data;
}

export async function updateNote(
  noteId: number,
  payload: Partial<Pick<Note, 'start_offset' | 'end_offset' | 'note'>>,
) {
  const json = await request<Note>(`/notes/${noteId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return json.data;
}

export async function deleteNote(noteId: number) {
  await requestNoContent(`/notes/${noteId}`, { method: 'DELETE' });
}

export async function createAnalysisRun(
  sessionId: number,
  engine_version: string,
  config: Record<string, unknown>,
) {
  const json = await request<AnalysisRun>(`/sessions/${sessionId}/analysis-runs`, {
    method: 'POST',
    body: JSON.stringify({ engine_version, config }),
  });
  return json.data;
}

export async function getAnalysisRun(runId: number) {
  const json = await request<AnalysisRun>(`/analysis-runs/${runId}`, {
    method: 'GET',
  });
  return json.data;
}

export async function getFindings(
  runId: number,
  start: number,
  end: number,
  types?: string[],
) {
  const json = await request<Finding[]>(`/analysis-runs/${runId}/findings`, {
    method: 'GET',
    query: {
      start,
      end,
      types: types && types.length > 0 ? types.join(',') : undefined,
    },
  });
  return json.data;
}
