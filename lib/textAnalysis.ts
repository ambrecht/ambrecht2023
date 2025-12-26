// Utility helpers for basic text analysis and tagging
export type WordClass = 'verb' | 'noun' | 'adverb' | 'none';

const PUNCT_RE = /[.,;:!?()"„“«»]/g;

export const cleanToken = (token: string) => token.replace(PUNCT_RE, '');

export const classifyWord = (token: string): WordClass => {
  if (!token || !token.trim()) return 'none';

  const cleaned = cleanToken(token);
  if (!cleaned || cleaned.length <= 2) return 'none';

  const lower = cleaned.toLowerCase();

  const looksLikeVerb =
    lower.endsWith('en') ||
    lower.endsWith('ern') ||
    lower.endsWith('eln') ||
    lower.endsWith('ieren');

  const looksLikeAdverb = lower.endsWith('lich') || lower.endsWith('weise');
  const looksLikeNoun = /^[A-ZÄÖÜ]/.test(cleaned);

  if (looksLikeVerb) return 'verb';
  if (looksLikeAdverb) return 'adverb';
  if (looksLikeNoun) return 'noun';
  return 'none';
};

export const buildTags = (text: string) => {
  const words = text.split(/\s+/).slice(0, 50);
  const tags = new Set<string>();

  for (const w of words) {
    const cleaned = cleanToken(w);
    if (/^[A-ZÄÖÜ]/.test(cleaned) && cleaned.length > 3) {
      tags.add(cleaned);
    }
  }

  if (tags.size === 0) tags.add('Notiz');
  return Array.from(tags).slice(0, 3);
};

export const computeAnalysis = (text: string) => {
  const tokens = text.split(/\s+/);
  let verbs = 0;
  let nouns = 0;
  let adverbs = 0;

  for (const t of tokens) {
    const cls = classifyWord(t);
    if (cls === 'verb') verbs += 1;
    else if (cls === 'noun') nouns += 1;
    else if (cls === 'adverb') adverbs += 1;
  }

  return { verbs, nouns, adverbs };
};

// Preserve whitespace when splitting so "whitespace-pre-wrap" works correctly
export const splitPreservingWhitespace = (text: string) => text.split(/(\s+)/);
