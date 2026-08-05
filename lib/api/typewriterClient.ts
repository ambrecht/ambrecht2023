import type {
  AnalysisRun,
  ApiResponse,
  ApiSuccess,
  BlameResponse,
  BlockDiffResponse,
  EditorBlockSnapshot,
  Finding,
  FindingStatus,
  LineDiffResponse,
  Note,
  Pagination,
  RemoveAdverbsSessionAction,
  Session,
  WorkshopRun,
  WritingOverview,
} from './types';
import type { Block } from '@/lib/session-editor/types';

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

const parseJsonSafe = <T,>(rawText: string | null) => {
  if (!rawText) return null;
  try {
    return JSON.parse(rawText) as T;
  } catch {
    return null;
  }
};

const getErrorMessage = (
  json: ApiResponse<unknown> | null,
  fallback: string,
  status?: number,
  rawText?: string,
) => {
  const statusLabel = typeof status === 'number' ? `HTTP ${status}` : 'HTTP error';
  const snippet = rawText ? rawText.slice(0, 200) : '';
  if (!json) {
    return snippet ? `${statusLabel}: ${fallback} - ${snippet}` : `${statusLabel}: ${fallback}`;
  }
  if (json.success) {
    return snippet ? `${statusLabel}: ${fallback} - ${snippet}` : `${statusLabel}: ${fallback}`;
  }
  const message = json.error || json.message || fallback;
  return snippet && !message.includes(snippet)
    ? `${statusLabel}: ${message} - ${snippet}`
    : `${statusLabel}: ${message}`;
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
  const rawText = await response.text();
  const json = parseJsonSafe<ApiResponse<T>>(rawText);
  if (!response.ok || !json || !json.success) {
    throw new Error(
      getErrorMessage(json, 'Unerwartete API-Antwort.', response.status, rawText),
    );
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
  const rawText = await response.text();
  const json = parseJsonSafe<ApiResponse<unknown>>(rawText);
  if (!response.ok || !json || !json.success) {
    throw new Error(
      getErrorMessage(json, 'Unerwartete API-Antwort.', response.status, rawText),
    );
  }
}

export async function getSession(id: number) {
  const json = await request<Session>(`/sessions/${id}`);
  return json.data;
}

const toEditorBlockSnapshot = (block: Block): EditorBlockSnapshot => ({
  id: block.id,
  order: block.order,
  type: block.type,
  text: block.text,
  labels: block.labels ?? [],
  paragraph_id: block.paragraphId ?? null,
  stats: block.stats
    ? {
        words: block.stats.words,
        chars: block.stats.chars,
      }
    : undefined,
});

export type CreateEditOptions = {
  eventType?: 'edit' | 'save' | 'action' | 'live_input';
  blocks?: Block[];
  parkedBlockIds?: string[];
};

export async function createEdit(
  sessionId: number,
  text: string,
  options: CreateEditOptions = {},
) {
  const body: Record<string, unknown> = { text };
  if (options.eventType) {
    body.event_type = options.eventType;
  }
  if (options.blocks) {
    body.blocks = options.blocks.map(toEditorBlockSnapshot);
  }
  if (options.parkedBlockIds) {
    body.parked_block_ids = options.parkedBlockIds;
  }

  const json = await request<Session>(`/sessions/${sessionId}/edits`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return json.data;
}

export async function getDocumentVersions(
  documentId: number,
  limit = 50,
  offset = 0,
  includeBlocks = false,
) {
  const json = await request<Session[]>(`/documents/${documentId}/versions`, {
    method: 'GET',
    query: { limit, offset, include: includeBlocks ? 'blocks' : undefined },
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

export async function createWorkshopRun(
  sessionId: number,
  payload: {
    preset: string;
    text: string;
    lang?: string;
    options?: Record<string, unknown>;
  },
) {
  const json = await request<WorkshopRun>(`/sessions/${sessionId}/workshop-runs`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return json.data;
}

export async function getWorkshopRun(runId: number) {
  const json = await request<WorkshopRun>(`/workshop-runs/${runId}`, {
    method: 'GET',
  });
  return json.data;
}

export async function getWorkshopRunFindings(
  runId: number,
  start: number,
  end: number,
  types?: string[],
) {
  const json = await request<Finding[]>(`/workshop-runs/${runId}/findings`, {
    method: 'GET',
    query: {
      start,
      end,
      types: types && types.length > 0 ? types.join(',') : undefined,
    },
  });
  return json.data;
}

export async function updateFindingStatus(
  findingId: number,
  status: FindingStatus,
) {
  const json = await request<Finding>(`/findings/${findingId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  return json.data;
}

export async function getWritingOverview(
  documentId: number,
  range: { from?: string; to?: string } = {},
) {
  const json = await request<WritingOverview>(
    `/documents/${documentId}/writing-overview`,
    {
      method: 'GET',
      query: range,
    },
  );
  return json.data;
}

export async function getBlame(
  documentId: number,
  options: { versionId?: number; mode?: 'block' | 'paragraph' | 'line' } = {},
) {
  const json = await request<BlameResponse>(`/documents/${documentId}/blame`, {
    method: 'GET',
    query: {
      version_id: options.versionId,
      mode: options.mode ?? 'block',
    },
  });
  return json.data;
}

export async function getDocumentLineDiff(
  documentId: number,
  left: number,
  right: number,
) {
  const json = await request<LineDiffResponse>(`/documents/${documentId}/diff`, {
    method: 'GET',
    query: { left, right, mode: 'line' },
  });
  return json.data;
}

export async function getDocumentBlockDiff(
  documentId: number,
  left: number,
  right: number,
) {
  const json = await request<BlockDiffResponse>(`/documents/${documentId}/diff`, {
    method: 'GET',
    query: { left, right, mode: 'block' },
  });
  return json.data;
}

export async function runSessionRemoveAdverbsAction(
  sessionId: number,
  payload: {
    source_version_id: number;
    constraints?: Record<string, unknown>;
    save_as_session_version?: boolean;
  },
) {
  const json = await request<RemoveAdverbsSessionAction>(
    `/sessions/${sessionId}/actions/remove-adverbs`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
  return json.data;
}
