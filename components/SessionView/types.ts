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
}

export interface SessionPagination {
  limit: number;
  offset: number;
  total: number;
}

export interface SearchPagination {
  page: number;
  pageSize: number;
  total: number;
}
