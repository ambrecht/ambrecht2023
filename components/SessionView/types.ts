export interface Session {
  id: number;
  text: string;
  created_at: string;
  word_count: number;
  char_count: number;
  letter_count: number;
}

export interface SessionPagination {
  limit: number;
  offset: number;
  total: number;
}
