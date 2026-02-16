export type BlockType = 'paragraph' | 'dialog' | 'heading' | 'free';

export type BlockStats = {
  words: number;
  chars: number;
};

export type Block = {
  id: string;
  order: number;
  type: BlockType;
  text: string;
  labels: string[];
  paragraphId?: string;
  stats?: BlockStats;
};

export type Hint = {
  id: string;
  blockId: string;
  kind: 'style' | 'repetition' | 'grammar' | 'custom';
  message: string;
  severity: 'info' | 'warn';
  range?: { start: number; end: number };
};

export type SessionVersion = {
  id: string;
  sessionId: string;
  createdAt: string;
  rawText: string;
  blocks: Block[];
  hints: Hint[];
  notes?: string;
};
