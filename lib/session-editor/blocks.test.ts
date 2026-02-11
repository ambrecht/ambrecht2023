import { describe, expect, it } from 'vitest';

import {
  findAllMatches,
  mergeBlocks,
  moveBlocksBySelection,
  parseTextToBlocks,
  replaceAllInText,
  serializeBlocksToText,
  splitBlockAt,
} from './blocks';
import type { Block } from './types';

describe('blocks utilities', () => {
  it('parses paragraphs and preserves single newlines', () => {
    const raw = 'Hallo\nWelt\n\nZweiter Absatz';
    const blocks = parseTextToBlocks(raw);
    expect(blocks).toHaveLength(2);
    expect(blocks[0].text).toBe('Hallo\nWelt');
    expect(blocks[1].text).toBe('Zweiter Absatz');
  });

  it('serializes blocks with blank line separators', () => {
    const blocks = parseTextToBlocks('A\n\nB');
    const text = serializeBlocksToText(blocks);
    expect(text).toBe('A\n\nB');
  });

  it('splits blocks at a cursor position', () => {
    const block: Block = {
      id: 'a',
      order: 0,
      type: 'paragraph',
      text: 'HelloWorld',
      labels: [],
    };
    const parts = splitBlockAt(block, 5);
    expect(parts).toHaveLength(2);
    expect(parts[0].text).toBe('Hello');
    expect(parts[1].text).toBe('World');
  });

  it('merges blocks with newline and unions labels', () => {
    const a: Block = {
      id: 'a',
      order: 0,
      type: 'paragraph',
      text: 'One',
      labels: ['alpha'],
    };
    const b: Block = {
      id: 'b',
      order: 1,
      type: 'paragraph',
      text: 'Two',
      labels: ['beta'],
    };
    const merged = mergeBlocks(a, b);
    expect(merged.text).toBe('One\nTwo');
    expect(merged.labels).toEqual(['alpha', 'beta']);
  });

  it('moves selected blocks down by one', () => {
    const blocks: Block[] = [
      { id: 'a', order: 0, type: 'paragraph', text: 'A', labels: [] },
      { id: 'b', order: 1, type: 'paragraph', text: 'B', labels: [] },
      { id: 'c', order: 2, type: 'paragraph', text: 'C', labels: [] },
    ];
    const selected = new Set(['b']);
    const moved = moveBlocksBySelection(blocks, selected, 'down');
    expect(moved.map((b) => b.id)).toEqual(['a', 'c', 'b']);
  });

  it('replaces all matches and reports count', () => {
    const result = replaceAllInText('a a a', 'a', 'b', true);
    expect(result.text).toBe('b b b');
    expect(result.count).toBe(3);
  });

  it('finds all matches with case-insensitive search', () => {
    const positions = findAllMatches('AaA', 'a', false);
    expect(positions).toEqual([0, 1, 2]);
  });
});
