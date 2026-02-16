import type {
  NlpActionConstraints,
  NlpAdverbToolResponse,
  NlpAnalyzeVersionResponse,
  NlpDescriptionToolResponse,
  NlpDocumentCreateResponse,
  NlpDocumentVersionCreateResponse,
  NlpKwicResponse,
  NlpRemoveAdverbsActionResponse,
  NlpTensePovDistanceResponse,
  NlpVersionReadResponse,
} from './nlpTypes';

const API_BASE_URL = '/api/v1';

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

const extractErrorMessage = (
  parsed: Record<string, unknown> | null,
  fallback: string,
  status?: number,
  rawText?: string,
) => {
  const prefix = typeof status === 'number' ? `HTTP ${status}: ` : '';
  const detail =
    typeof parsed?.detail === 'string'
      ? parsed.detail
      : typeof parsed?.message === 'string'
        ? parsed.message
        : typeof parsed?.error === 'string'
          ? parsed.error
          : '';
  const snippet = rawText ? rawText.slice(0, 220) : '';
  const base = detail || fallback;
  return snippet && !base.includes(snippet)
    ? `${prefix}${base} - ${snippet}`
    : `${prefix}${base}`;
};

async function request<T>(
  path: string,
  init: RequestInit & { query?: Record<string, string | number | undefined> } = {},
) {
  const { query, ...rest } = init;
  const response = await fetch(buildApiUrl(path, query), {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(rest.headers || {}),
    },
    cache: rest.cache ?? 'no-store',
  });

  const rawText = await response.text();
  const parsed = parseJsonSafe<Record<string, unknown>>(rawText);
  if (!response.ok) {
    throw new Error(
      extractErrorMessage(parsed, 'NLP-API Antwort ungültig.', response.status, rawText),
    );
  }

  if (!parsed) {
    throw new Error('NLP-API lieferte keine JSON-Antwort.');
  }

  return parsed as T;
}

export async function createNlpDocument(text: string, lang?: string | null) {
  return request<NlpDocumentCreateResponse>('/documents', {
    method: 'POST',
    body: JSON.stringify({ text, lang: lang ?? undefined }),
  });
}

export async function createNlpDocumentVersion(documentId: number, text: string) {
  return request<NlpDocumentVersionCreateResponse>(`/documents/${documentId}/versions`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}

export async function getNlpVersion(versionId: number) {
  return request<NlpVersionReadResponse>(`/versions/${versionId}`, {
    method: 'GET',
  });
}

export async function analyzeNlpVersion(versionId: number) {
  return request<NlpAnalyzeVersionResponse>(`/versions/${versionId}/analyze`, {
    method: 'POST',
  });
}

export async function getNlpAdverbTool(analysisId: number) {
  return request<NlpAdverbToolResponse>(`/analyses/${analysisId}/tools/adverbs`, {
    method: 'GET',
  });
}

export async function getNlpDescriptionTool(analysisId: number) {
  return request<NlpDescriptionToolResponse>(
    `/analyses/${analysisId}/tools/descriptions`,
    {
      method: 'GET',
    },
  );
}

export async function getNlpTensePovTool(analysisId: number) {
  return request<NlpTensePovDistanceResponse>(
    `/analyses/${analysisId}/tools/tense_pov_distance`,
    {
      method: 'GET',
    },
  );
}

export async function getNlpKwic(analysisId: number, term: string) {
  return request<NlpKwicResponse>(`/analyses/${analysisId}/tools/kwic`, {
    method: 'GET',
    query: { term },
  });
}

export async function runRemoveAdverbsAction(
  versionId: number,
  constraints?: NlpActionConstraints,
) {
  return request<NlpRemoveAdverbsActionResponse>(
    `/versions/${versionId}/actions/remove_adverbs`,
    {
      method: 'POST',
      body: JSON.stringify({
        constraints: constraints ?? {
          voice_lock: false,
          no_new_facts: false,
        },
      }),
    },
  );
}
