export interface Session {
  id: number;
  title?: string | null;
  text: string;
  created_at: string;
  updated_at?: string;
  word_count: number;
  char_count: number;
  letter_count: number;
  status?: 'draft' | 'in_progress' | 'revised' | 'final';
  tags?: string[];
  document_id?: number | null;
  parent_id?: number | null;
}

export interface SessionPagination {
  limit: number;
  offset: number;
  total: number;
}

export interface SearchPagination {
  limit: number;
  cursor?: string | null;
  next_cursor?: string | null;
  total?: number;
}
