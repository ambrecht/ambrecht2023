export type SessionStatus = 'draft' | 'in_progress' | 'revised' | 'final';

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
