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

type JsonObject = Record<string, unknown>;

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

const asObject = (value: unknown, context: string): JsonObject => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${context}: ungueltiges Antwortformat.`);
  }
  return value as JsonObject;
};

const toRequiredNumber = (payload: JsonObject, field: string, context: string) => {
  const value = payload[field];
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  throw new Error(`${context}: Feld "${field}" fehlt oder ist ungueltig.`);
};

const unwrapPayload = (parsed: JsonObject, context: string): JsonObject => {
  const success = parsed.success;
  if (typeof success === 'boolean') {
    if (!success) {
      throw new Error(extractErrorMessage(parsed, `${context}: API-Fehler.`));
    }
    return asObject(parsed.data, context);
  }
  return parsed;
};

const assertId = (value: number, label: string) => {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label}: ungueltige ID.`);
  }
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
  const parsed = parseJsonSafe<JsonObject>(rawText);
  if (!response.ok) {
    throw new Error(
      extractErrorMessage(parsed, 'NLP-API Antwort ungueltig.', response.status, rawText),
    );
  }

  if (!parsed) {
    throw new Error('NLP-API lieferte keine JSON-Antwort.');
  }

  const payload = unwrapPayload(parsed, 'NLP-API');
  return payload as T;
}

export async function createNlpDocument(text: string, lang?: string | null) {
  const payload = await request<JsonObject>('/documents', {
    method: 'POST',
    body: JSON.stringify({ text, lang: lang ?? undefined }),
  });
  return {
    document_id: toRequiredNumber(payload, 'document_id', 'Dokument erstellen'),
    version_id: toRequiredNumber(payload, 'version_id', 'Dokument erstellen'),
  } satisfies NlpDocumentCreateResponse;
}

export async function createNlpDocumentVersion(documentId: number, text: string) {
  assertId(documentId, 'Dokument-Version erstellen');
  const payload = await request<JsonObject>(`/documents/${documentId}/versions`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
  return {
    version_id: toRequiredNumber(payload, 'version_id', 'Dokument-Version erstellen'),
  } satisfies NlpDocumentVersionCreateResponse;
}

export async function getNlpVersion(versionId: number) {
  assertId(versionId, 'Version lesen');
  return request<NlpVersionReadResponse>(`/versions/${versionId}`, {
    method: 'GET',
  });
}

export async function analyzeNlpVersion(versionId: number) {
  assertId(versionId, 'Analyse starten');
  const payload = await request<JsonObject>(`/versions/${versionId}/analyze`, {
    method: 'POST',
  });
  return {
    analysis_id: toRequiredNumber(payload, 'analysis_id', 'Analyse starten'),
  } satisfies NlpAnalyzeVersionResponse;
}

export async function getNlpAdverbTool(analysisId: number) {
  assertId(analysisId, 'Adverb-Tool');
  return request<NlpAdverbToolResponse>(`/analyses/${analysisId}/tools/adverbs`, {
    method: 'GET',
  });
}

export async function getNlpDescriptionTool(analysisId: number) {
  assertId(analysisId, 'Description-Tool');
  return request<NlpDescriptionToolResponse>(
    `/analyses/${analysisId}/tools/descriptions`,
    {
      method: 'GET',
    },
  );
}

export async function getNlpTensePovTool(analysisId: number) {
  assertId(analysisId, 'Tense/POV-Tool');
  return request<NlpTensePovDistanceResponse>(
    `/analyses/${analysisId}/tools/tense_pov_distance`,
    {
      method: 'GET',
    },
  );
}

export async function getNlpKwic(analysisId: number, term: string) {
  assertId(analysisId, 'KWIC-Tool');
  return request<NlpKwicResponse>(`/analyses/${analysisId}/tools/kwic`, {
    method: 'GET',
    query: { term },
  });
}

export async function runRemoveAdverbsAction(
  versionId: number,
  constraints?: NlpActionConstraints,
) {
  assertId(versionId, 'Action remove_adverbs');
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
