import type { GptAgent } from './types';

const normalize = (value: string) => value.trim().toLocaleLowerCase('de-DE');

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
  const normalizedActiveTag = activeTag ? normalize(activeTag) : null;

  return gpts
    .filter((gpt) => {
      const matchesTag =
        normalizedActiveTag === null ||
        gpt.tags.some((tag) => normalize(tag) === normalizedActiveTag);

      if (!matchesTag) {
        return false;
      }

      if (normalizedQuery.length === 0) {
        return true;
      }

      const searchableValues = [
        gpt.name,
        gpt.description,
        gpt.visibility,
        ...gpt.tags,
      ];

      return searchableValues.some((value) => normalize(value).includes(normalizedQuery));
    })
    .slice()
    .sort(byFavoriteThenName);
}
