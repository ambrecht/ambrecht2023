// Writer-focused heuristics for German text diagnostics (fast, heuristic)
// Aims to surface signals like nominal style, dead verbs, adjective/adverb density, and long sentences.

export type WordClass = 'verb' | 'noun' | 'adverb' | 'adjective' | 'none';

export type HighlightType =
  | 'verb'
  | 'noun'
  | 'adverb'
  | 'adjective'
  | 'deadVerb'
  | 'nominalStyle'
  | 'passive'
  | 'longSentence';

export type Highlight = { index: number; token: string; type: HighlightType };

const WORD_RE = /\p{L}+(?:[\p{L}\p{M}ßäöüÄÖÜ]+)*/gu;
const TRIM_PUNCT_RE = /^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu;

export const cleanToken = (token: string) => token.replace(TRIM_PUNCT_RE, '');

const STOPWORDS = new Set([
  'der',
  'die',
  'das',
  'den',
  'dem',
  'des',
  'ein',
  'eine',
  'einer',
  'eines',
  'einem',
  'einen',
  'und',
  'oder',
  'aber',
  'doch',
  'nur',
  'auch',
  'schon',
  'noch',
  'sehr',
  'so',
  'zu',
  'im',
  'in',
  'am',
  'an',
  'auf',
  'für',
  'von',
  'mit',
  'ohne',
  'ich',
  'du',
  'er',
  'sie',
  'es',
  'wir',
  'ihr',
  'sie',
  'man',
  'nicht',
  'kein',
  'keine',
  'keinen',
  'keinem',
  'keiner',
  'dass',
  'daß',
  'weil',
  'wenn',
  'obwohl',
  'während',
  'damit',
  'ob',
]);

// "Tote" / blähende Verben: minimal list; extend as needed
const DEAD_VERBS = new Set([
  'liegen',
  'vorliegen',
  'erfolgen',
  'geschehen',
  'stattfinden',
  'durchführen',
  'bewerkstelligen',
  'aufweisen',
  'sichbefinden',
  'bestehen',
  'darstellen',
  'handeln',
]);

const NOMINAL_SUFFIX_RE = /(ung|heit|keit|tion|ismus|ität|tät|ment|anz|enz)$/i;
const ADJ_SUFFIX_RE = /(ig|isch|lich|sam|bar|los|voll|arm|haft|ern)$/i;
const ADVERB_SUFFIX_RE = /(erweise|weise)$/i;
const WERDEN_FORMS = new Set([
  'werde',
  'wirst',
  'wird',
  'werden',
  'werdet',
  'wurde',
  'wurden',
  'worden',
]);

const isSentenceBoundary = (tok: string) => /[.!?]/.test(tok);

const tokenize = (text: string) => text.split(/(\s+)/); // keep whitespace for layout

const looksLikeNoun = (token: string, isSentenceStart: boolean) => {
  const c = cleanToken(token);
  if (!c || c.length < 3) return false;
  if (STOPWORDS.has(c.toLowerCase())) return false;
  return !isSentenceStart && /^[A-ZÄÖÜ]/.test(c);
};

const looksLikeVerb = (token: string) => {
  const c = cleanToken(token);
  if (!c || c.length < 3) return false;
  const lower = c.toLowerCase();

  const verbish =
    lower.endsWith('en') ||
    lower.endsWith('ern') ||
    lower.endsWith('eln') ||
    lower.endsWith('ieren') ||
    lower.endsWith('st') ||
    lower.endsWith('t') ||
    lower.endsWith('e');

  if (NOMINAL_SUFFIX_RE.test(lower)) return false;
  return verbish && !looksLikeNoun(c, false);
};

const looksLikeAdverb = (token: string) => {
  const c = cleanToken(token);
  if (!c) return false;
  const lower = c.toLowerCase();
  return ADVERB_SUFFIX_RE.test(lower);
};

const looksLikeAdjective = (token: string) => {
  const c = cleanToken(token);
  if (!c) return false;
  const lower = c.toLowerCase();
  return ADJ_SUFFIX_RE.test(lower) || lower.endsWith('lich');
};

export const classifyWord = (token: string, isSentenceStart: boolean): WordClass => {
  const c = cleanToken(token);
  if (!c || c.length <= 2) return 'none';

  if (looksLikeNoun(c, isSentenceStart)) return 'noun';

  if (looksLikeAdverb(c)) return 'adverb';
  if (looksLikeAdjective(c)) return 'adjective';
  if (looksLikeVerb(c)) return 'verb';

  return 'none';
};

export const buildTags = (text: string) => {
  const toks = tokenize(text);
  const freq = new Map<string, number>();

  let sentenceStart = true;
  for (const t of toks) {
    const c = cleanToken(t);
    if (!c) continue;

    if (isSentenceBoundary(t)) {
      sentenceStart = true;
      continue;
    }

    const isWord = WORD_RE.test(c);
    if (isWord && looksLikeNoun(c, sentenceStart)) {
      const lower = c.toLowerCase();
      if (!STOPWORDS.has(lower) && c.length >= 4) {
        freq.set(c, (freq.get(c) ?? 0) + 1);
      }
    }

    if (isWord) {
      sentenceStart = false;
    }
  }

  const sorted = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([k]) => k);

  if (sorted.length === 0) return ['Notiz'];
  return sorted.slice(0, 3);
};

export const computeAnalysis = (text: string) => {
  const toks = tokenize(text);

  let verbs = 0;
  let nouns = 0;
  let adverbs = 0;
  let adjectives = 0;
  let deadVerbs = 0;
  let nominalStyle = 0;
  let passive = 0;

  const highlights: Highlight[] = [];

  let sentenceStart = true;
  let sentenceLen = 0;
  const longSentenceThreshold = 24;

  for (let i = 0; i < toks.length; i++) {
    const t = toks[i];
    const c = cleanToken(t);
    if (!c) continue;

    const isWord = WORD_RE.test(c);
    if (isWord) sentenceLen += 1;

    const cls = classifyWord(t, sentenceStart);
    if (cls === 'verb') verbs += 1;
    if (cls === 'noun') nouns += 1;
    if (cls === 'adverb') adverbs += 1;
    if (cls === 'adjective') adjectives += 1;

    if (cls === 'noun' && NOMINAL_SUFFIX_RE.test(c)) {
      nominalStyle += 1;
      highlights.push({ index: i, token: t, type: 'nominalStyle' });
    }

    const lower = c.toLowerCase().replace(/\s+/g, '');
    if (cls === 'verb' && DEAD_VERBS.has(lower)) {
      deadVerbs += 1;
      highlights.push({ index: i, token: t, type: 'deadVerb' });
    }

    if (WERDEN_FORMS.has(lower)) {
      const next = toks[i + 1] ?? '';
      const nc = cleanToken(next).toLowerCase();
      if (/^ge.+(t|en)$/.test(nc)) {
        passive += 1;
        highlights.push({ index: i, token: t, type: 'passive' });
        highlights.push({ index: i + 1, token: next, type: 'passive' });
      }
    }

    if (cls !== 'none') {
      highlights.push({ index: i, token: t, type: cls });
    }

    if (isSentenceBoundary(t)) {
      if (sentenceLen >= longSentenceThreshold) {
        highlights.push({ index: i, token: t, type: 'longSentence' });
      }
      sentenceLen = 0;
      sentenceStart = true;
      continue;
    }

    if (isWord) {
      sentenceStart = false;
    }
  }

  const totalWords =
    toks.filter((t) => {
      const c = cleanToken(t);
      return c && WORD_RE.test(c);
    }).length || 1;

  const per100 = (n: number) => Math.round((n / totalWords) * 100);

  return {
    counts: {
      verbs,
      nouns,
      adjectives,
      adverbs,
      deadVerbs,
      nominalStyle,
      passive,
      totalWords,
    },
    densityPer100Words: {
      verbs: per100(verbs),
      nouns: per100(nouns),
      adjectives: per100(adjectives),
      adverbs: per100(adverbs),
      deadVerbs: per100(deadVerbs),
      nominalStyle: per100(nominalStyle),
      passive: per100(passive),
    },
    highlights,
  };
};

// Preserve whitespace when splitting so "whitespace-pre-wrap" works correctly
export const splitPreservingWhitespace = (text: string) => text.split(/(\s+)/);
