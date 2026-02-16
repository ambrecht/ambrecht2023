export interface NlpDocumentCreateResponse {
  document_id: number;
  version_id: number;
}

export interface NlpDocumentVersionCreateResponse {
  version_id: number;
}

export interface NlpVersionReadResponse {
  version_id: number;
  document_id: number;
  parent_version_id: number | null;
  created_at: string;
  lang: string;
  text: string;
}

export interface NlpAnalyzeVersionResponse {
  analysis_id: number;
}

export interface NlpAdverbToolItem {
  token_i: number;
  text: string;
  start: number;
  end: number;
  kind: string;
  finding_id: number;
}

export interface NlpAdverbToolResponse {
  analysis_id: number;
  items: NlpAdverbToolItem[];
}

export interface NlpDescriptionToolItem {
  kind: string;
  sentence_i: number;
  start: number;
  end: number;
  text: string;
  finding_id: number;
}

export interface NlpDescriptionToolResponse {
  analysis_id: number;
  items: NlpDescriptionToolItem[];
}

export interface NlpTensePovSentenceMarker {
  sentence_i: number;
  start: number;
  end: number;
  text: string;
  sentence_tense: string;
  sentence_pov: string;
  reasons: string[];
  finding_id: number;
}

export interface NlpTensePovDistanceResponse {
  analysis_id: number;
  dominant_tense: string;
  dominant_pov: string;
  markers: NlpTensePovSentenceMarker[];
}

export interface NlpKwicMatch {
  start: number;
  end: number;
  left: string;
  match: string;
  right: string;
  sentence_i: number;
  context_window: number;
}

export interface NlpKwicResponse {
  term: string;
  matches: NlpKwicMatch[];
}

export interface NlpActionConstraints {
  voice_lock?: boolean;
  no_new_facts?: boolean;
}

export interface NlpDeleteSpanPatchOp {
  op: 'delete_span';
  start: number;
  end: number;
}

export interface NlpRemoveAdverbsActionResponse {
  action_id: number;
  type: string;
  constraints: Record<string, unknown>;
  patch: NlpDeleteSpanPatchOp[];
  diff: string;
  new_version_id: number;
}
