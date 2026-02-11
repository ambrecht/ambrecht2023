'use client';

import React, { useMemo, useState } from 'react';
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Copy, GripVertical, Trash2 } from 'lucide-react';

import type { Block, BlockType } from '@/lib/session-editor/types';
import {
  applyLabelToBlocks,
  computeBlockStats,
  duplicateBlock,
  mergeBlocks,
  moveBlocksBySelection,
  removeBlocksBySelection,
  splitBlockAt,
  updateBlockOrder,
} from '@/lib/session-editor/blocks';

const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  paragraph: 'Absatz',
  dialog: 'Dialog',
  heading: 'Überschrift',
  free: 'Freitext',
};

type BlockEditorProps = {
  blocks: Block[];
  onBlocksChange: (nextBlocks: Block[]) => void;
  selectedIds: Set<string>;
  onSelectedIdsChange: (nextIds: Set<string>) => void;
  activeMatchBlockId?: string | null;
  matchCounts?: Record<string, number>;
  blockRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
};

export function BlockEditor({
  blocks,
  onBlocksChange,
  selectedIds,
  onSelectedIdsChange,
  activeMatchBlockId,
  matchCounts,
  blockRefs,
}: BlockEditorProps) {
  const [labelDraft, setLabelDraft] = useState('');
  const [cursorMap, setCursorMap] = useState<Record<string, number>>({});

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const selectedCount = selectedIds.size;
  const allSelected = blocks.length > 0 && selectedCount === blocks.length;

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectedIdsChange(new Set());
      return;
    }
    onSelectedIdsChange(new Set(blocks.map((block) => block.id)));
  };

  const handleToggleSelection = (blockId: string) => {
    const next = new Set(selectedIds);
    if (next.has(blockId)) {
      next.delete(blockId);
    } else {
      next.add(blockId);
    }
    onSelectedIdsChange(next);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = blocks.findIndex((block) => block.id === active.id);
    const newIndex = blocks.findIndex((block) => block.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const next = updateBlockOrder(arrayMove(blocks, oldIndex, newIndex));
    onBlocksChange(next);
  };

  const handleBlockTextChange = (blockId: string, nextText: string) => {
    const nextBlocks = blocks.map((block) =>
      block.id === blockId
        ? {
            ...block,
            text: nextText,
            stats: computeBlockStats(nextText),
          }
        : block,
    );
    onBlocksChange(nextBlocks);
  };

  const handleBlockTypeChange = (blockId: string, nextType: BlockType) => {
    const nextBlocks = blocks.map((block) =>
      block.id === blockId
        ? {
            ...block,
            type: nextType,
          }
        : block,
    );
    onBlocksChange(nextBlocks);
  };

  const handleSplit = (blockId: string) => {
    const index = blocks.findIndex((block) => block.id === blockId);
    if (index === -1) return;
    const block = blocks[index];
    const cursor = cursorMap[blockId] ?? Math.floor(block.text.length / 2);
    const splitBlocks = splitBlockAt(block, cursor);
    if (splitBlocks.length === 1) return;
    const next = [...blocks];
    next.splice(index, 1, ...splitBlocks);
    onBlocksChange(updateBlockOrder(next));
  };

  const handleMergePrev = (blockId: string) => {
    const index = blocks.findIndex((block) => block.id === blockId);
    if (index <= 0) return;
    const merged = mergeBlocks(blocks[index - 1], blocks[index]);
    const next = [...blocks];
    next.splice(index - 1, 2, merged);
    onBlocksChange(updateBlockOrder(next));
  };

  const handleMergeNext = (blockId: string) => {
    const index = blocks.findIndex((block) => block.id === blockId);
    if (index === -1 || index >= blocks.length - 1) return;
    const merged = mergeBlocks(blocks[index], blocks[index + 1]);
    const next = [...blocks];
    next.splice(index, 2, merged);
    onBlocksChange(updateBlockOrder(next));
  };

  const handleDuplicate = (blockId: string) => {
    const index = blocks.findIndex((block) => block.id === blockId);
    if (index === -1) return;
    const next = [...blocks];
    next.splice(index + 1, 0, duplicateBlock(blocks[index]));
    onBlocksChange(updateBlockOrder(next));
  };

  const handleDelete = (blockId: string) => {
    const next = blocks.filter((block) => block.id !== blockId);
    onBlocksChange(updateBlockOrder(next));
    if (selectedIds.has(blockId)) {
      const nextSelected = new Set(selectedIds);
      nextSelected.delete(blockId);
      onSelectedIdsChange(nextSelected);
    }
  };

  const handleBatchDelete = () => {
    if (selectedIds.size === 0) return;
    const next = removeBlocksBySelection(blocks, selectedIds);
    onBlocksChange(updateBlockOrder(next));
    onSelectedIdsChange(new Set());
  };

  const handleBatchMove = (direction: 'up' | 'down') => {
    if (selectedIds.size === 0) return;
    const next = moveBlocksBySelection(blocks, selectedIds, direction);
    onBlocksChange(next);
  };

  const handleBatchLabel = () => {
    if (!labelDraft.trim() || selectedIds.size === 0) return;
    const next = applyLabelToBlocks(blocks, selectedIds, labelDraft);
    onBlocksChange(next);
    setLabelDraft('');
  };

  const matchCountMap = useMemo(() => matchCounts ?? {}, [matchCounts]);

  if (blocks.length === 0) {
    return (
      <div className="rounded-xl border border-[#2f2822] bg-[#0f0c0a] px-4 py-6 text-sm text-[#cbbfb0]">
        Noch keine Bausteine. Wechsel in den Fließtext und zurück, um Absätze zu
        erzeugen.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#2f2822] bg-[#0f0c0a] px-3 py-2 text-xs text-[#cbbfb0]">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={allSelected} onChange={handleSelectAll} />
          Alle auswählen
        </label>
        <span>{selectedCount} ausgewählt</span>
        <button
          type="button"
          onClick={handleBatchDelete}
          disabled={selectedIds.size === 0}
          className="rounded-lg border border-[#2f2822] bg-[#18130f] px-2 py-1 text-[11px] text-[#f7f4ed] hover:bg-[#211a13] disabled:opacity-40"
        >
          Auswahl löschen
        </button>
        <button
          type="button"
          onClick={() => handleBatchMove('up')}
          disabled={selectedIds.size === 0}
          className="rounded-lg border border-[#2f2822] bg-[#18130f] px-2 py-1 text-[11px] text-[#f7f4ed] hover:bg-[#211a13] disabled:opacity-40"
        >
          Auswahl hoch
        </button>
        <button
          type="button"
          onClick={() => handleBatchMove('down')}
          disabled={selectedIds.size === 0}
          className="rounded-lg border border-[#2f2822] bg-[#18130f] px-2 py-1 text-[11px] text-[#f7f4ed] hover:bg-[#211a13] disabled:opacity-40"
        >
          Auswahl runter
        </button>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <input
            value={labelDraft}
            onChange={(event) => setLabelDraft(event.target.value)}
            placeholder="Label hinzufügen"
            className="w-36 rounded-lg border border-[#2f2822] bg-[#0f0c0a] px-2 py-1 text-[11px] text-[#f7f4ed] focus:outline-none"
          />
          <button
            type="button"
            onClick={handleBatchLabel}
            disabled={!labelDraft.trim() || selectedIds.size === 0}
            className="rounded-lg border border-[#2f2822] bg-[#18130f] px-2 py-1 text-[11px] text-[#f7f4ed] hover:bg-[#211a13] disabled:opacity-40"
          >
            Label anwenden
          </button>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={blocks.map((block) => block.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {blocks.map((block, index) => (
              <BlockCard
                key={block.id}
                block={block}
                index={index}
                selected={selectedIds.has(block.id)}
                onToggleSelect={handleToggleSelection}
                onTextChange={handleBlockTextChange}
                onTypeChange={handleBlockTypeChange}
                onSplit={handleSplit}
                onMergePrev={handleMergePrev}
                onMergeNext={handleMergeNext}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
                onCursorChange={(value) =>
                  setCursorMap((prev) => ({ ...prev, [block.id]: value }))
                }
                canMergePrev={index > 0}
                canMergeNext={index < blocks.length - 1}
                matchCount={matchCountMap[block.id] ?? 0}
                isActiveMatch={activeMatchBlockId === block.id}
                blockRefs={blockRefs}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

type BlockCardProps = {
  block: Block;
  index: number;
  selected: boolean;
  onToggleSelect: (blockId: string) => void;
  onTextChange: (blockId: string, text: string) => void;
  onTypeChange: (blockId: string, type: BlockType) => void;
  onSplit: (blockId: string) => void;
  onMergePrev: (blockId: string) => void;
  onMergeNext: (blockId: string) => void;
  onDuplicate: (blockId: string) => void;
  onDelete: (blockId: string) => void;
  onCursorChange: (cursor: number) => void;
  canMergePrev: boolean;
  canMergeNext: boolean;
  matchCount: number;
  isActiveMatch: boolean;
  blockRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
};

function BlockCard({
  block,
  index,
  selected,
  onToggleSelect,
  onTextChange,
  onTypeChange,
  onSplit,
  onMergePrev,
  onMergeNext,
  onDuplicate,
  onDelete,
  onCursorChange,
  canMergePrev,
  canMergeNext,
  matchCount,
  isActiveMatch,
  blockRefs,
}: BlockCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const stats = block.stats ?? computeBlockStats(block.text);

  const setRefs = (node: HTMLDivElement | null) => {
    setNodeRef(node);
    blockRefs.current[block.id] = node;
  };

  return (
    <div
      ref={setRefs}
      style={style}
      className={`rounded-2xl border bg-[#0f0c0a] p-4 space-y-3 transition shadow-sm ${
        isActiveMatch ? 'border-[#c9b18a] ring-1 ring-[#c9b18a]' : 'border-[#2f2822]'
      } ${isDragging ? 'opacity-60' : ''}`}
    >
      <div className="flex flex-wrap items-center gap-3 text-xs text-[#cbbfb0]">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="inline-flex items-center gap-2 rounded-md border border-[#2f2822] bg-[#18130f] px-2 py-1 text-[#f7f4ed]"
        >
          <GripVertical size={14} />
        </button>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggleSelect(block.id)}
          />
          Auswahl
        </label>
        <span className="rounded-full border border-[#2f2822] px-2 py-0.5 text-[11px]">
          #{index + 1}
        </span>
        <select
          value={block.type}
          onChange={(event) => onTypeChange(block.id, event.target.value as BlockType)}
          className="rounded-lg border border-[#2f2822] bg-[#120f0c] px-2 py-1 text-[11px] text-[#f7f4ed]"
        >
          {Object.entries(BLOCK_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <span>
          {stats.words} Wörter · {stats.chars} Zeichen
        </span>
        {matchCount > 0 && (
          <span className="rounded-full border border-[#4a3d2b] bg-[#2b2218] px-2 py-0.5 text-[10px] text-[#f7f4ed]">
            {matchCount} Treffer
          </span>
        )}
      </div>

      <textarea
        value={block.text}
        onChange={(event) => onTextChange(block.id, event.target.value)}
        onSelect={(event) => onCursorChange(event.currentTarget.selectionStart ?? 0)}
        onKeyUp={(event) => onCursorChange(event.currentTarget.selectionStart ?? 0)}
        onClick={(event) => onCursorChange(event.currentTarget.selectionStart ?? 0)}
        className="w-full min-h-[120px] resize-y rounded-lg border border-[#2f2822] bg-[#120f0c] p-3 text-sm leading-relaxed text-[#f7f4ed] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9b18a]"
        spellCheck
      />

      {block.labels.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {block.labels.map((label) => (
            <span
              key={`${block.id}-${label}`}
              className="rounded-full border border-[#4a3d2b] bg-[#2b2218] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[#f7f4ed]"
            >
              {label}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#cbbfb0]">
        <button
          type="button"
          onClick={() => onSplit(block.id)}
          className="rounded-lg border border-[#2f2822] bg-[#18130f] px-2 py-1 text-[#f7f4ed] hover:bg-[#211a13]"
        >
          Split
        </button>
        <button
          type="button"
          onClick={() => onMergePrev(block.id)}
          disabled={!canMergePrev}
          className="rounded-lg border border-[#2f2822] bg-[#18130f] px-2 py-1 text-[#f7f4ed] hover:bg-[#211a13] disabled:opacity-40"
        >
          Merge ↑
        </button>
        <button
          type="button"
          onClick={() => onMergeNext(block.id)}
          disabled={!canMergeNext}
          className="rounded-lg border border-[#2f2822] bg-[#18130f] px-2 py-1 text-[#f7f4ed] hover:bg-[#211a13] disabled:opacity-40"
        >
          Merge ↓
        </button>
        <button
          type="button"
          onClick={() => onDuplicate(block.id)}
          className="inline-flex items-center gap-1 rounded-lg border border-[#2f2822] bg-[#18130f] px-2 py-1 text-[#f7f4ed] hover:bg-[#211a13]"
        >
          <Copy size={12} /> Duplizieren
        </button>
        <button
          type="button"
          onClick={() => onDelete(block.id)}
          className="inline-flex items-center gap-1 rounded-lg border border-[#2f2822] bg-[#18130f] px-2 py-1 text-[#f7f4ed] hover:bg-[#211a13]"
        >
          <Trash2 size={12} /> Löschen
        </button>
      </div>
    </div>
  );
}
