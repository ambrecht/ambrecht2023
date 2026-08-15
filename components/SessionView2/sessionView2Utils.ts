import type { Session } from '@/components/SessionView/types';

export const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('de-DE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat('de-DE', {
    dateStyle: 'medium',
  }).format(new Date(value));

export const getSessionTitle = (session: Pick<Session, 'id' | 'title'>) =>
  session.title?.trim() || `Session #${session.id}`;

export const getWordCount = (session: Pick<Session, 'word_count' | 'text'>) => {
  if (typeof session.word_count === 'number') return session.word_count;
  const matches = session.text?.trim().match(/\S+/g);
  return matches ? matches.length : 0;
};

export const getReadingMinutes = (session: Pick<Session, 'word_count' | 'text'>) =>
  Math.max(1, Math.round(getWordCount(session) / 180));

export const getSentenceCount = (session: Pick<Session, 'text'>) => {
  const text = session.text?.trim();
  if (!text) return 0;

  const segmenterCtor = (
    Intl as unknown as {
      Segmenter?: new (
        locale: string,
        options: { granularity: 'sentence' },
      ) => {
        segment: (input: string) => Iterable<{ segment: string }>;
      };
    }
  ).Segmenter;

  if (segmenterCtor) {
    const segmenter = new segmenterCtor('de', { granularity: 'sentence' });
    return Array.from(segmenter.segment(text)).filter((entry) => entry.segment.trim()).length;
  }

  const matches = text.match(/[^.!?\n]+(?:[.!?]+|$)/g);
  return matches ? matches.filter((entry) => entry.trim()).length : 0;
};

export const compactWhitespace = (value: string) => value.replace(/\s+/g, ' ').trim();

export const buildExcerpt = (session: Session, query = '') => {
  const text = session.text ?? session.preview ?? session.text_preview ?? '';
  const cleanText = compactWhitespace(text);
  if (!cleanText) return 'Kein Text vorhanden.';

  const normalizedQuery = query.trim().toLocaleLowerCase('de-DE');
  const normalizedText = cleanText.toLocaleLowerCase('de-DE');

  if (normalizedQuery) {
    const hitIndex = normalizedText.indexOf(normalizedQuery);
    if (hitIndex >= 0) {
      const start = Math.max(0, hitIndex - 80);
      const end = Math.min(cleanText.length, hitIndex + normalizedQuery.length + 120);
      return `${start > 0 ? '...' : ''}${cleanText.slice(start, end)}${
        end < cleanText.length ? '...' : ''
      }`;
    }
  }

  return cleanText.length > 220 ? `${cleanText.slice(0, 220)}...` : cleanText;
};

export const normalizeVersionList = (versions: Session[], fallback: Session) => {
  const byId = new Map<number, Session>();
  for (const version of versions) {
    byId.set(version.id, version);
  }
  byId.set(fallback.id, { ...fallback, ...(byId.get(fallback.id) ?? {}) });

  return Array.from(byId.values()).sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
};

export const normalizeTagInput = (value: string) =>
  value
    .trim()
    .toLocaleLowerCase('de-DE')
    .replace(/[\s-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');

export const getTagKey = (value: string) => normalizeTagInput(value);
