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
  pageSize?: number;
  offset?: number;
  total?: number;
  has_more?: boolean;
  hasMore?: boolean;
  next_page_token?: string | null;
  nextPageToken?: string | null;
  next_cursor?: string | null;
  cursor?: string | null;
}

export interface SearchPagination {
  limit?: number;
  page_size?: number;
  pageSize?: number;
  cursor?: string | null;
  next_cursor?: string | null;
  next_page_token?: string | null;
  nextPageToken?: string | null;
  has_more?: boolean;
  hasMore?: boolean;
  total?: number;
}

export interface SessionSearchMatch {
  session_id: number | string;
  title?: string | null;
  match_count?: number;
  matches?: Array<{
    field: 'text' | 'title' | 'tags' | string;
    start_offset: number;
    end_offset: number;
    context?: string;
  }>;
}
