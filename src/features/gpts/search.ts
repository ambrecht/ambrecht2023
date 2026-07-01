import type { GptAgent } from './types';

const normalize = (value: string) =>
  value
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('de-DE')
    .replace(/[^a-z0-9]+/gi, ' ')
    .trim()
    .replace(/\s+/g, ' ');

const compact = (value: string) => normalize(value).replace(/\s+/g, '');

const getUrlSlug = (url: GptAgent['url']) => {
  const withoutQuery = url.split('?')[0] ?? url;
  const parts = withoutQuery.split('/').filter(Boolean);
  const gptIndex = parts.findIndex((part) => part === 'g');

  if (gptIndex < 0) {
    return parts.at(-1) ?? '';
  }

  return parts[gptIndex + 2] ?? parts[gptIndex + 1] ?? '';
};

const byFavoriteThenName = (first: GptAgent, second: GptAgent) => {
  const favoriteDelta = Number(Boolean(second.favorite)) - Number(Boolean(first.favorite));

  if (favoriteDelta !== 0) {
    return favoriteDelta;
  }

  return first.name.localeCompare(second.name, 'de-DE');
};

export function getAllTags(gpts: readonly GptAgent[]): readonly string[] {
  return Array.from(new Set(gpts.flatMap((gpt) => gpt.tags))).sort((first, second) =>
    first.localeCompare(second, 'de-DE'),
  );
}

export function filterGpts(
  gpts: readonly GptAgent[],
  query: string,
  activeTag: string | null,
): readonly GptAgent[] {
  const normalizedQuery = normalize(query);
  const compactQuery = compact(query);
  const queryTerms = normalizedQuery.split(' ').filter(Boolean);
  const normalizedActiveTag = activeTag ? normalize(activeTag) : null;

  const tagFilteredGpts = gpts
    .filter((gpt) => {
      const matchesTag =
        normalizedActiveTag === null ||
        gpt.tags.some((tag) => normalize(tag) === normalizedActiveTag);

      return matchesTag;
    });

  if (normalizedQuery.length === 0) {
    return tagFilteredGpts.slice().sort(byFavoriteThenName);
  }

  const scoredMatches = tagFilteredGpts
    .map((gpt) => {
      const primaryValues = [gpt.name, getUrlSlug(gpt.url)];
      const secondaryValues = [gpt.description, gpt.visibility, ...gpt.tags];
      const primary = primaryValues.map(normalize);
      const secondary = secondaryValues.map(normalize);
      const allValues = [...primary, ...secondary].filter(Boolean);
      const compactValues = allValues.map((value) => value.replace(/\s+/g, ''));

      const exactPrimaryMatch = primary.some((value) => value === normalizedQuery);
      const startsWithPrimaryMatch = primary.some((value) => value.startsWith(normalizedQuery));
      const containsPrimaryMatch = primary.some((value) => value.includes(normalizedQuery));
      const containsSecondaryMatch = secondary.some((value) => value.includes(normalizedQuery));
      const containsCompactMatch =
        compactQuery.length > 0 && compactValues.some((value) => value.includes(compactQuery));
      const containsEveryTerm =
        queryTerms.length > 0 &&
        queryTerms.every((term) => allValues.some((value) => value.includes(term)));

      if (
        !exactPrimaryMatch &&
        !startsWithPrimaryMatch &&
        !containsPrimaryMatch &&
        !containsSecondaryMatch &&
        !containsCompactMatch &&
        !containsEveryTerm
      ) {
        return null;
      }

      return {
        gpt,
        exactPrimaryMatch,
        score:
          Number(exactPrimaryMatch) * 100 +
          Number(startsWithPrimaryMatch) * 50 +
          Number(containsPrimaryMatch) * 25 +
          Number(containsCompactMatch) * 15 +
          Number(containsEveryTerm) * 10 +
          Number(containsSecondaryMatch) * 5,
      };
    })
    .filter((match): match is NonNullable<typeof match> => match !== null);

  const exactPrimaryMatches = scoredMatches.filter((match) => match.exactPrimaryMatch);
  const matchesToShow = exactPrimaryMatches.length > 0 ? exactPrimaryMatches : scoredMatches;

  return matchesToShow
    .slice()
    .sort((first, second) => {
      const scoreDelta = second.score - first.score;

      if (scoreDelta !== 0) {
        return scoreDelta;
      }

      return byFavoriteThenName(first.gpt, second.gpt);
    })
    .map((match) => match.gpt);
}
