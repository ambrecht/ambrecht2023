export interface Session {
  id: number;
  document_id?: number | null;
  title?: string | null;
  text?: string;
  preview?: string;
  text_preview?: string;
  created_at: string;
  updated_at?: string;
  word_count?: number;
  char_count?: number;
  letter_count?: number;
  status?: 'draft' | 'in_progress' | 'revised' | 'final';
  tags?: string[];
  current_version_id?: number | null;
  version_count?: number;
  parent_id?: number | null;
}

export interface SessionPagination {
  limit?: number;
  page_size?: number;
  offset?: number;
  total?: number;
  has_more?: boolean;
  next_page_token?: string | null;
}

export interface SearchPagination {
  limit?: number;
  page_size?: number;
  cursor?: string | null;
  next_cursor?: string | null;
  next_page_token?: string | null;
  has_more?: boolean;
  total?: number;
}
