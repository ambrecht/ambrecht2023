import { v4 as uuidv4 } from 'uuid';

import type { Block, BlockType, BlockStats } from './types';

const DEFAULT_BLOCK_TYPE: BlockType = 'paragraph';

const normalizeLineBreaks = (rawText: string) =>
  rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

const buildBlockId = () => uuidv4();

export const computeBlockStats = (text: string): BlockStats => {
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
  return { words, chars: text.length };
};

export const updateBlockOrder = (blocks: Block[]) =>
  blocks.map((block, index) => ({ ...block, order: index }));

const splitIntoParagraphs = (rawText: string) => {
  const normalized = normalizeLineBreaks(rawText);
  return normalized
    .split(/\n\s*\n+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .map((text, index) => ({ id: `p-${index + 1}`, text }));
};

const splitIntoSentences = (rawText: string) => {
  const normalized = normalizeLineBreaks(rawText);
  if (!normalized.trim()) return [] as string[];

  const SegmenterCtor = (
    Intl as unknown as {
      Segmenter?: new (...args: unknown[]) => {
        segment: (input: string) => Iterable<{ segment: string }>;
      };
    }
  ).Segmenter;

  if (SegmenterCtor) {
    const segmenter = new SegmenterCtor('de', { granularity: 'sentence' });
    const items: string[] = [];
    Array.from(segmenter.segment(normalized)).forEach((entry) => {
      const sentence = entry.segment.trim();
      if (sentence) {
        items.push(sentence);
      }
    });
    if (items.length > 0) {
      return items;
    }
  }

  return normalized
    .split(/(?<=[.!?])\s+|\n+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
};

const buildReuseMap = (previousBlocks: Block[]) => {
  const reuseMap = new Map<string, Block[]>();
  previousBlocks.forEach((block) => {
    const key = block.text.trim();
    const list = reuseMap.get(key) ?? [];
    list.push(block);
    reuseMap.set(key, list);
  });
  return reuseMap;
};

const takeReusableBlock = (
  reuseMap: Map<string, Block[]>,
  text: string,
  paragraphId: string,
) => {
  const key = text.trim();
  const reuseList = reuseMap.get(key);
  if (!reuseList || reuseList.length === 0) return null;
  const exactParagraphIndex = reuseList.findIndex(
    (block) => block.paragraphId === paragraphId,
  );
  if (exactParagraphIndex >= 0) {
    const [exact] = reuseList.splice(exactParagraphIndex, 1);
    return exact ?? null;
  }
  return reuseList.shift() ?? null;
};

export const parseTextToBlocks = (
  rawText: string,
  previousBlocks: Block[] = [],
): Block[] => {
  const paragraphs = splitIntoParagraphs(rawText);
  if (paragraphs.length === 0) return [];

  const reuseMap = buildReuseMap(previousBlocks);
  const nextBlocks: Block[] = [];

  paragraphs.forEach((paragraph) => {
    const sentenceParts = splitIntoSentences(paragraph.text);
    const parts = sentenceParts.length > 0 ? sentenceParts : [paragraph.text];
    parts.forEach((part) => {
      const text = part.trim();
      if (!text) return;
      const reuse = takeReusableBlock(reuseMap, text, paragraph.id);
      const id = reuse?.id ?? buildBlockId();
      const type = reuse?.type ?? DEFAULT_BLOCK_TYPE;
      const labels = reuse?.labels ? [...reuse.labels] : [];
      nextBlocks.push({
        id,
        order: nextBlocks.length,
        type,
        text,
        labels,
        paragraphId: paragraph.id,
        stats: computeBlockStats(text),
      });
    });
  });

  return nextBlocks;
};

export type ParagraphGroup = {
  id: string;
  index: number;
  blocks: Block[];
};

export const groupBlocksByParagraph = (blocks: Block[]): ParagraphGroup[] => {
  const ordered = updateBlockOrder(blocks);
  const groups: ParagraphGroup[] = [];
  ordered.forEach((block, index) => {
    const paragraphId = block.paragraphId?.trim() || `p-${index + 1}`;
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.id === paragraphId) {
      lastGroup.blocks.push(block);
      return;
    }
    groups.push({
      id: paragraphId,
      index: groups.length,
      blocks: [block],
    });
  });
  return groups;
};

export const serializeBlocksToText = (blocks: Block[]) =>
  groupBlocksByParagraph(blocks)
    .map((group) =>
      group.blocks
        .map((block) => block.text)
        .filter((text) => text.trim().length > 0)
        .join(' '),
    )
    .filter(Boolean)
    .join('\n\n');

export const findAllMatches = (
  text: string,
  query: string,
  caseSensitive: boolean,
) => {
  if (!query) return [] as number[];
  const needle = caseSensitive ? query : query.toLowerCase();
  if (!needle) return [] as number[];
  const haystack = caseSensitive ? text : text.toLowerCase();
  const result: number[] = [];
  let idx = 0;
  while (idx <= haystack.length) {
    const hit = haystack.indexOf(needle, idx);
    if (hit === -1) break;
    result.push(hit);
    idx = hit + Math.max(needle.length, 1);
  }
  return result;
};

export const replaceAllInText = (
  text: string,
  query: string,
  replacement: string,
  caseSensitive: boolean,
) => {
  if (!query) return { text, count: 0 };
  const needle = caseSensitive ? query : query.toLowerCase();
  const source = caseSensitive ? text : text.toLowerCase();
  if (!needle || !source.includes(needle)) return { text, count: 0 };

  let next = '';
  let idx = 0;
  let count = 0;
  while (idx < source.length) {
    const hit = source.indexOf(needle, idx);
    if (hit === -1) {
      next += text.slice(idx);
      break;
    }
    next += text.slice(idx, hit) + replacement;
    idx = hit + needle.length;
    count += 1;
  }
  return { text: next, count };
};

export const splitBlockAt = (block: Block, index: number) => {
  const safeIndex = Math.max(0, Math.min(index, block.text.length));
  if (safeIndex <= 0 || safeIndex >= block.text.length) {
    return [block];
  }
  const leftText = block.text.slice(0, safeIndex);
  const rightText = block.text.slice(safeIndex);
  if (leftText.trim().length === 0 || rightText.trim().length === 0) {
    return [block];
  }
  const leftBlock: Block = {
    ...block,
    text: leftText,
    stats: computeBlockStats(leftText),
  };
  const rightBlock: Block = {
    ...block,
    id: buildBlockId(),
    text: rightText,
    stats: computeBlockStats(rightText),
  };
  return [leftBlock, rightBlock];
};

export const mergeBlocks = (primary: Block, secondary: Block) => {
  const mergedText = `${primary.text.replace(/\s+$/, '')}\n${secondary.text.replace(
    /^\s+/,
    '',
  )}`;
  const labels = Array.from(
    new Set([...(primary.labels ?? []), ...(secondary.labels ?? [])]),
  );
  return {
    ...primary,
    text: mergedText,
    labels,
    stats: computeBlockStats(mergedText),
  } satisfies Block;
};

export const duplicateBlock = (block: Block) => ({
  ...block,
  id: buildBlockId(),
  stats: computeBlockStats(block.text),
});

export const applyLabelToBlocks = (
  blocks: Block[],
  selectedIds: Set<string>,
  label: string,
) => {
  if (!label.trim()) return blocks;
  const trimmed = label.trim();
  return blocks.map((block) => {
    if (!selectedIds.has(block.id)) return block;
    if (block.labels.includes(trimmed)) return block;
    return { ...block, labels: [...block.labels, trimmed] };
  });
};

export const moveBlocksBySelection = (
  blocks: Block[],
  selectedIds: Set<string>,
  direction: 'up' | 'down',
) => {
  if (selectedIds.size === 0) return blocks;
  const next = [...blocks];
  if (direction === 'up') {
    for (let i = 1; i < next.length; i += 1) {
      if (selectedIds.has(next[i].id) && !selectedIds.has(next[i - 1].id)) {
        [next[i - 1], next[i]] = [next[i], next[i - 1]];
      }
    }
  } else {
    for (let i = next.length - 2; i >= 0; i -= 1) {
      if (selectedIds.has(next[i].id) && !selectedIds.has(next[i + 1].id)) {
        [next[i + 1], next[i]] = [next[i], next[i + 1]];
      }
    }
  }
  return updateBlockOrder(next);
};

export const removeBlocksBySelection = (
  blocks: Block[],
  selectedIds: Set<string>,
) => blocks.filter((block) => !selectedIds.has(block.id));

const hashText = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash.toString(16);
};

export const computeMovedBlocks = (left: Block[], right: Block[]) => {
  const leftHashes = left.map((block) => hashText(block.text));
  const rightHashes = right.map((block) => hashText(block.text));
  const rightIndexMap = new Map<string, number[]>();
  rightHashes.forEach((hash, index) => {
    const list = rightIndexMap.get(hash) ?? [];
    list.push(index);
    rightIndexMap.set(hash, list);
  });

  const moved = leftHashes
    .map((hash, index) => {
      const candidate = rightIndexMap.get(hash);
      if (!candidate || candidate.length === 0) return null;
      const nextIndex = candidate.shift();
      if (nextIndex === undefined || nextIndex === index) return null;
      return {
        hash,
        from: index,
        to: nextIndex,
        preview: left[index]?.text.slice(0, 120).replace(/\s+/g, ' ').trim(),
      };
    })
    .filter((item): item is { hash: string; from: number; to: number; preview: string } =>
      Boolean(item),
    );

  return moved;
};
