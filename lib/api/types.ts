export type SessionStatus = 'draft' | 'in_progress' | 'revised' | 'final';
export type FindingStatus = 'open' | 'ignored' | 'resolved' | 'accepted';

export interface EditorBlockSnapshot {
  id: string;
  order: number;
  type: string;
  text: string;
  labels: string[];
  paragraph_id?: string | null;
  stats?: {
    words?: number;
    chars?: number;
  };
  metadata?: Record<string, unknown>;
}

export interface Session {
  id: number;
  title?: string | null;
  text: string;
  status?: SessionStatus;
  tags?: string[];
  created_at: string;
  updated_at?: string;
  word_count: number;
  char_count: number;
  letter_count: number;
  document_id?: number | null;
  parent_id?: number | null;
  blocks?: EditorBlockSnapshot[];
  parked_block_ids?: string[];
}

export interface Document {
  id: number;
  root_session_id?: number | null;
  created_at: string;
}

export interface AnalysisRun {
  id: number;
  session_id: number;
  engine_version: string;
  config: Record<string, unknown>;
  config_hash: string;
  created_at: string;
  completed_at?: string | null;
}

export interface Finding {
  id: number;
  analysis_run_id: number;
  session_id: number;
  finding_type: string;
  severity: 'info' | 'warn';
  start_offset: number;
  end_offset: number;
  explanation?: string | null;
  metrics?: Record<string, unknown> | null;
  status?: FindingStatus;
  source?: string;
  source_finding_id?: string;
}

export interface WorkshopRun {
  id: number;
  run_id: number;
  session_id: number;
  version_id: number;
  analysis_id: number;
  preset: string;
  engine_version: string;
  config?: Record<string, unknown>;
  config_hash: string;
  text_hash: string;
  scanned_at: string;
  created_at?: string;
  completed_at?: string | null;
  findings: Finding[];
}

export interface WritingOverviewDay {
  date: string;
  versions: number;
  inserted_words: number;
  deleted_words: number;
  net_words: number;
  sessions: number;
  estimated_minutes: number;
}

export interface WritingOverview {
  document_id: number;
  range?: {
    from?: string | null;
    to?: string | null;
  };
  totals: {
    active_words: number;
    inserted_words: number;
    deleted_words: number;
    writing_days: number;
    estimated_minutes: number;
  };
  days: WritingOverviewDay[];
}

export interface BlameSpan {
  block_id: string;
  start_offset: number;
  end_offset: number;
  authored_at: string;
  last_touched_at: string;
  origin_version_id: number;
  preview?: string;
}

export interface BlameResponse {
  document_id: number;
  version_id: number;
  mode: 'block' | 'paragraph' | 'line' | string;
  spans: BlameSpan[];
}

export interface LineDiffLine {
  type: 'equal' | 'insert' | 'delete';
  text: string;
}

export interface LineDiffResponse {
  too_large: boolean;
  lines: LineDiffLine[];
}

export interface BlockMove {
  block_id?: string;
  hash?: string;
  from: number;
  to: number;
  preview?: string;
}

export interface BlockDiffResponse {
  moved_blocks: BlockMove[];
}

export interface RemoveAdverbsSessionAction {
  action_id: number;
  nlp_new_version_id: number | null;
  diff: LineDiffResponse | string;
  after_text: string;
  created_session?: Pick<Session, 'id' | 'parent_id' | 'document_id'> | Session | null;
}

export interface Note {
  id: number;
  session_id: number;
  start_offset: number;
  end_offset: number;
  note: string;
}

export interface Pagination {
  limit: number;
  offset: number;
  total: number;
}

export interface CursorPagination {
  limit: number;
  cursor?: string | null;
  next_cursor?: string | null;
  total?: number;
}

export type ApiSuccess<T> = {
  success: true;
  data: T;
  pagination?: Pagination | CursorPagination;
  meta?: Record<string, unknown>;
};

export type ApiError = {
  success: false;
  error: string;
  message: string;
  details?: Record<string, unknown> | null;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
