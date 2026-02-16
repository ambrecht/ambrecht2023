'use client';

import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Archive,
  ArrowDown,
  ArrowUp,
  GripVertical,
  Scissors,
  Trash2,
} from 'lucide-react';

import type { Block } from '@/lib/session-editor/types';
import {
  computeBlockStats,
  mergeBlocks,
  splitBlockAt,
  updateBlockOrder,
} from '@/lib/session-editor/blocks';

const CONTAINER_ACTIVE = 'active-zone';
const CONTAINER_ARCHIVE = 'archive-zone';
const DROP_END_MARKER_ID = '__drop-end__';

const FINDING_PRIORITY: Record<string, number> = {
  adverb: 4,
  tense_pov: 3,
  description: 2,
  kwic: 1,
};

export type FindingStyleToken = {
  label: string;
  badge: string;
  dotClass: string;
  markClass: string;
  underlineClass: string;
};

const DEFAULT_FINDING_STYLE: FindingStyleToken = {
  label: 'Hinweis',
  badge: 'HINT',
  dotClass: 'bg-[#999188]',
  markClass: 'bg-[#514134]/80 text-[#fff0df]',
  underlineClass:
    'underline decoration-[#d7b38c] decoration-2 decoration-dotted underline-offset-2',
};

type DropMarkerState = {
  targetId: string | typeof DROP_END_MARKER_ID | null;
  fromArchive: boolean;
  crossParagraph: boolean;
};

const EMPTY_DROP_MARKER: DropMarkerState = {
  targetId: null,
  fromArchive: false,
  crossParagraph: false,
};

export type InlineFindingSpan = {
  findingId: number;
  findingType: string;
  severity: 'info' | 'warn';
  start: number;
  end: number;
  explanation?: string | null;
  token: string;
};

type BlockEditorProps = {
  blocks: Block[];
  parkedIds: Set<string>;
  onChange: (nextBlocks: Block[], nextParkedIds: Set<string>) => void;
  selectedIds: Set<string>;
  onSelectedIdsChange: (nextIds: Set<string>) => void;
  expandedBlockId: string | null;
  onExpandedBlockIdChange: (nextId: string | null) => void;
  activeMatchBlockId?: string | null;
  activeFindingId?: number | null;
  matchCounts?: Record<string, number>;
  findingSpansByBlock?: Record<string, InlineFindingSpan[]>;
  findingCountsByBlock?: Record<string, Record<string, number>>;
  findingStyles?: Record<string, FindingStyleToken>;
  analysisStale?: boolean;
  allowInlinePreviewAction?: boolean;
  onRequestPreview?: (findingId: number) => void;
  onIgnoreFinding?: (findingId: number) => void;
  blockRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
};

export function BlockEditor({
  blocks,
  parkedIds,
  onChange,
  selectedIds,
  onSelectedIdsChange,
  expandedBlockId,
  onExpandedBlockIdChange,
  activeMatchBlockId,
  activeFindingId,
  matchCounts,
  findingSpansByBlock,
  findingCountsByBlock,
  findingStyles,
  analysisStale = false,
  allowInlinePreviewAction = false,
  onRequestPreview,
  onIgnoreFinding,
  blockRefs,
}: BlockEditorProps) {
  const [cursorMap, setCursorMap] = useState<Record<string, number>>({});
  const [liveMessage, setLiveMessage] = useState('');
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropMarker, setDropMarker] = useState<DropMarkerState>(EMPTY_DROP_MARKER);

  useEffect(() => {
    if (!liveMessage) return;
    const timer = window.setTimeout(() => setLiveMessage(''), 900);
    return () => window.clearTimeout(timer);
  }, [liveMessage]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const activeBlocks = useMemo(
    () => blocks.filter((block) => !parkedIds.has(block.id)),
    [blocks, parkedIds],
  );
  const parkedBlocks = useMemo(
    () => blocks.filter((block) => parkedIds.has(block.id)),
    [blocks, parkedIds],
  );

  const emitChange = useCallback(
    (nextActive: Block[], nextParked: Block[]) => {
      const ordered = updateBlockOrder([...nextActive, ...nextParked]);
      const nextParkedIds = new Set(nextParked.map((block) => block.id));
      onChange(ordered, nextParkedIds);
    },
    [onChange],
  );

  const focusBlock = useCallback(
    (blockId: string | null) => {
      if (!blockId) return;
      requestAnimationFrame(() => {
        blockRefs.current[blockId]?.focus();
      });
    },
    [blockRefs],
  );

  const selectOnly = useCallback(
    (blockId: string) => {
      onSelectedIdsChange(new Set([blockId]));
      onExpandedBlockIdChange(blockId);
    },
    [onExpandedBlockIdChange, onSelectedIdsChange],
  );

  const handleBlockTextChange = useCallback(
    (blockId: string, nextText: string) => {
      const next = blocks.map((block) =>
        block.id === blockId
          ? {
              ...block,
              text: nextText,
              stats: computeBlockStats(nextText),
            }
          : block,
      );
      onChange(updateBlockOrder(next), new Set(parkedIds));
    },
    [blocks, onChange, parkedIds],
  );


  const parkBlock = useCallback(
    (blockId: string, insertIndex?: number) => {
      const activeIndex = activeBlocks.findIndex((block) => block.id === blockId);
      if (activeIndex === -1) return;

      const nextActive = [...activeBlocks];
      const [moved] = nextActive.splice(activeIndex, 1);
      if (!moved) return;
      const nextParked = [...parkedBlocks];
      const safeInsert =
        insertIndex === undefined
          ? nextParked.length
          : Math.max(0, Math.min(insertIndex, nextParked.length));
      nextParked.splice(safeInsert, 0, moved);
      emitChange(nextActive, nextParked);

      const fallback = nextActive[Math.min(activeIndex, nextActive.length - 1)]?.id ?? null;
      onExpandedBlockIdChange(fallback);
      onSelectedIdsChange(fallback ? new Set([fallback]) : new Set());
      focusBlock(fallback);
      setLiveMessage('Satz in Ablage abgelegt');
    },
    [
      activeBlocks,
      emitChange,
      focusBlock,
      onExpandedBlockIdChange,
      onSelectedIdsChange,
      parkedBlocks,
    ],
  );

  const unparkBlock = useCallback(
    (blockId: string, insertIndex?: number) => {
      const parkedIndex = parkedBlocks.findIndex((block) => block.id === blockId);
      if (parkedIndex === -1) return;

      const nextParked = [...parkedBlocks];
      const [restored] = nextParked.splice(parkedIndex, 1);
      if (!restored) return;

      const nextActive = [...activeBlocks];
      const safeInsert =
        insertIndex === undefined
          ? nextActive.length
          : Math.max(0, Math.min(insertIndex, nextActive.length));
      const targetParagraphId =
        nextActive[safeInsert]?.paragraphId ??
        nextActive[Math.max(0, safeInsert - 1)]?.paragraphId ??
        restored.paragraphId ??
        'p-1';
      const hydrated = { ...restored, paragraphId: targetParagraphId };
      nextActive.splice(safeInsert, 0, hydrated);
      emitChange(nextActive, nextParked);

      selectOnly(hydrated.id);
      focusBlock(hydrated.id);
      setLiveMessage('Satz aus Ablage eingefügt');
    },
    [activeBlocks, emitChange, focusBlock, parkedBlocks, selectOnly],
  );

  const handleTogglePark = useCallback(
    (blockId: string) => {
      if (parkedIds.has(blockId)) {
        unparkBlock(blockId);
        return;
      }
      parkBlock(blockId);
    },
    [parkBlock, parkedIds, unparkBlock],
  );

  const handleDelete = useCallback(
    (blockId: string) => {
      if (parkedIds.has(blockId)) {
        const nextParked = parkedBlocks.filter((block) => block.id !== blockId);
        emitChange(activeBlocks, nextParked);
        onSelectedIdsChange(new Set());
        return;
      }
      const activeIndex = activeBlocks.findIndex((block) => block.id === blockId);
      if (activeIndex === -1) return;
      const nextActive = activeBlocks.filter((block) => block.id !== blockId);
      emitChange(nextActive, parkedBlocks);
      const fallback = nextActive[Math.min(activeIndex, nextActive.length - 1)]?.id ?? null;
      onExpandedBlockIdChange(fallback);
      onSelectedIdsChange(fallback ? new Set([fallback]) : new Set());
      focusBlock(fallback);
    },
    [
      activeBlocks,
      emitChange,
      focusBlock,
      onExpandedBlockIdChange,
      onSelectedIdsChange,
      parkedBlocks,
      parkedIds,
    ],
  );

  const handleSplit = useCallback(
    (blockId: string) => {
      const index = activeBlocks.findIndex((block) => block.id === blockId);
      if (index === -1) return;
      const block = activeBlocks[index];
      const cursor = cursorMap[blockId] ?? Math.floor(block.text.length / 2);
      const splitBlocks = splitBlockAt(block, cursor);
      if (splitBlocks.length === 1) return;
      const nextActive = [...activeBlocks];
      nextActive.splice(index, 1, ...splitBlocks);
      emitChange(nextActive, parkedBlocks);
      selectOnly(splitBlocks[0].id);
      focusBlock(splitBlocks[0].id);
    },
    [activeBlocks, cursorMap, emitChange, focusBlock, parkedBlocks, selectOnly],
  );

  const handleMergePrev = useCallback(
    (blockId: string) => {
      const index = activeBlocks.findIndex((block) => block.id === blockId);
      if (index <= 0) return;
      const merged = mergeBlocks(activeBlocks[index - 1], activeBlocks[index]);
      merged.paragraphId = activeBlocks[index - 1].paragraphId;
      const nextActive = [...activeBlocks];
      nextActive.splice(index - 1, 2, merged);
      emitChange(nextActive, parkedBlocks);
      selectOnly(merged.id);
      focusBlock(merged.id);
    },
    [activeBlocks, emitChange, focusBlock, parkedBlocks, selectOnly],
  );

  const handleMergeNext = useCallback(
    (blockId: string) => {
      const index = activeBlocks.findIndex((block) => block.id === blockId);
      if (index === -1 || index >= activeBlocks.length - 1) return;
      const merged = mergeBlocks(activeBlocks[index], activeBlocks[index + 1]);
      merged.paragraphId = activeBlocks[index].paragraphId;
      const nextActive = [...activeBlocks];
      nextActive.splice(index, 2, merged);
      emitChange(nextActive, parkedBlocks);
      selectOnly(merged.id);
      focusBlock(merged.id);
    },
    [activeBlocks, emitChange, focusBlock, parkedBlocks, selectOnly],
  );

  const handleMoveByKey = useCallback(
    (blockId: string, direction: 'up' | 'down') => {
      const sourceIsParked = parkedIds.has(blockId);
      const bucket = sourceIsParked ? [...parkedBlocks] : [...activeBlocks];
      const index = bucket.findIndex((block) => block.id === blockId);
      if (index === -1) return;
      const nextIndex = direction === 'up' ? index - 1 : index + 1;
      if (nextIndex < 0 || nextIndex >= bucket.length) return;
      const moved = arrayMove(bucket, index, nextIndex);
      if (sourceIsParked) {
        emitChange(activeBlocks, moved);
      } else {
        const targetParagraphId = bucket[nextIndex]?.paragraphId ?? moved[nextIndex].paragraphId;
        moved[nextIndex] = { ...moved[nextIndex], paragraphId: targetParagraphId };
        emitChange(moved, parkedBlocks);
      }
      focusBlock(blockId);
      setLiveMessage(direction === 'up' ? 'Satz nach oben verschoben' : 'Satz nach unten verschoben');
    },
    [activeBlocks, emitChange, focusBlock, parkedBlocks, parkedIds],
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setDraggingId(String(event.active.id));
  }, []);

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const over = event.over;
      if (!over) {
        setDropMarker(EMPTY_DROP_MARKER);
        return;
      }

      const sourceId = String(event.active.id);
      const overId = String(over.id);
      const sourceIsParked = parkedIds.has(sourceId);

      if (overId === CONTAINER_ARCHIVE) {
        setDropMarker({
          targetId: null,
          fromArchive: sourceIsParked,
          crossParagraph: false,
        });
        return;
      }

      if (overId === CONTAINER_ACTIVE) {
        setDropMarker({
          targetId: sourceIsParked ? DROP_END_MARKER_ID : null,
          fromArchive: sourceIsParked,
          crossParagraph: false,
        });
        return;
      }

      const overIsParked = parkedIds.has(overId);
      if (sourceIsParked && !overIsParked) {
        setDropMarker({
          targetId: overId,
          fromArchive: true,
          crossParagraph: false,
        });
        return;
      }

      if (!sourceIsParked && !overIsParked) {
        const sourceBlock = blocks.find((block) => block.id === sourceId);
        const targetBlock = blocks.find((block) => block.id === overId);
        setDropMarker({
          targetId: overId,
          fromArchive: false,
          crossParagraph:
            Boolean(sourceBlock?.paragraphId) &&
            Boolean(targetBlock?.paragraphId) &&
            sourceBlock?.paragraphId !== targetBlock?.paragraphId,
        });
        return;
      }

      setDropMarker(EMPTY_DROP_MARKER);
    },
    [blocks, parkedIds],
  );

  const handleDragCancel = useCallback(() => {
    setDraggingId(null);
    setDropMarker(EMPTY_DROP_MARKER);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const sourceId = String(event.active.id);
      const overId = event.over ? String(event.over.id) : null;
      setDraggingId(null);
      setDropMarker(EMPTY_DROP_MARKER);
      if (!overId) return;

      const sourceIsParked = parkedIds.has(sourceId);
      const overIsParked = parkedIds.has(overId);

      if (!sourceIsParked) {
        if (overId === CONTAINER_ARCHIVE) {
          parkBlock(sourceId);
          return;
        }
        if (overIsParked) {
          const insertIndex = parkedBlocks.findIndex((block) => block.id === overId);
          parkBlock(sourceId, insertIndex >= 0 ? insertIndex : undefined);
          return;
        }
        if (overId === CONTAINER_ACTIVE || sourceId === overId) {
          return;
        }

        const oldIndex = activeBlocks.findIndex((block) => block.id === sourceId);
        const newIndex = activeBlocks.findIndex((block) => block.id === overId);
        if (oldIndex === -1 || newIndex === -1) return;
        const moved = arrayMove(activeBlocks, oldIndex, newIndex);
        const targetParagraphId = activeBlocks[newIndex]?.paragraphId;
        if (targetParagraphId) {
          moved[newIndex] = { ...moved[newIndex], paragraphId: targetParagraphId };
        }
        emitChange(moved, parkedBlocks);
        setLiveMessage('Satz neu eingeordnet');
        return;
      }

      if (overId === CONTAINER_ARCHIVE) return;
      if (overIsParked) {
        if (sourceId === overId) return;
        const oldIndex = parkedBlocks.findIndex((block) => block.id === sourceId);
        const newIndex = parkedBlocks.findIndex((block) => block.id === overId);
        if (oldIndex === -1 || newIndex === -1) return;
        const moved = arrayMove(parkedBlocks, oldIndex, newIndex);
        emitChange(activeBlocks, moved);
        return;
      }

      if (overId === CONTAINER_ACTIVE) {
        unparkBlock(sourceId, activeBlocks.length);
        return;
      }
      const insertIndex = activeBlocks.findIndex((block) => block.id === overId);
      unparkBlock(sourceId, insertIndex >= 0 ? insertIndex : activeBlocks.length);
    },
    [activeBlocks, emitChange, parkBlock, parkedBlocks, parkedIds, unparkBlock],
  );

  const matchCountMap = useMemo(() => matchCounts ?? {}, [matchCounts]);
  const spansByBlock = useMemo(() => findingSpansByBlock ?? {}, [findingSpansByBlock]);
  const countsByBlock = useMemo(
    () => findingCountsByBlock ?? {},
    [findingCountsByBlock],
  );
  const selectedCount = selectedIds.size;

  const { setNodeRef: setActiveDropRef, isOver: isOverActiveZone } = useDroppable({
    id: CONTAINER_ACTIVE,
  });
  const { setNodeRef: setArchiveDropRef, isOver: isOverArchiveZone } = useDroppable({
    id: CONTAINER_ARCHIVE,
  });

  if (blocks.length === 0) {
    return (
      <div className="rounded-xl border border-[#2f2822] bg-[#0f0c0a] px-4 py-6 text-sm text-[#cbbfb0]">
        Noch keine Bausteine. Wechsel in den Fliestext und zurueck, um Saetze zu
        erzeugen.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-[#2f2822] bg-[#0f0c0a] px-3 py-2.5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#cbbfb0]">
          <span>{activeBlocks.length} Saetze</span>
          {selectedCount > 0 && <span>{selectedCount} aktiv</span>}
          {analysisStale && (
            <span className="rounded-full border border-[#4f3b24] bg-[#20160d] px-2 py-0.5 text-[10px] text-[#e9c69c]">
              Markierungen veraltet
            </span>
          )}
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragCancel={handleDragCancel}
        onDragEnd={handleDragEnd}
      >
        <div
          ref={setActiveDropRef}
          className={`rounded-xl border bg-[#0f0c0a] p-2 ${
            isOverActiveZone && draggingId && parkedIds.has(draggingId)
              ? 'border-[#c9b18a]'
              : 'border-[#2f2822]'
          }`}
        >
          <SortableContext
            items={activeBlocks.map((block) => block.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-1.5">
              {activeBlocks.map((block, index) => {
                const showDropMarker = dropMarker.targetId === block.id;
                const findingSpans = spansByBlock[block.id] ?? [];
                const findingCounts = countsByBlock[block.id] ?? {};
                return (
                  <MemoBlockCard
                    key={block.id}
                    block={block}
                    index={index}
                    selected={selectedIds.has(block.id)}
                    expanded={expandedBlockId === block.id}
                    onSelectOnly={selectOnly}
                    onTextChange={handleBlockTextChange}
                    onSplit={handleSplit}
                    onMergePrev={handleMergePrev}
                    onMergeNext={handleMergeNext}
                    onDelete={handleDelete}
                    onTogglePark={handleTogglePark}
                    onMoveByKey={handleMoveByKey}
                    onCursorChange={(value) =>
                      setCursorMap((prev) => ({ ...prev, [block.id]: value }))
                    }
                    canMergePrev={index > 0}
                    canMergeNext={index < activeBlocks.length - 1}
                    matchCount={matchCountMap[block.id] ?? 0}
                    isActiveMatch={activeMatchBlockId === block.id}
                    blockRefs={blockRefs}
                    findingSpans={findingSpans}
                    findingCounts={findingCounts}
                    findingStyles={findingStyles}
                    activeFindingId={activeFindingId ?? null}
                    analysisStale={analysisStale}
                    allowInlinePreviewAction={allowInlinePreviewAction}
                    onRequestPreview={onRequestPreview}
                    onIgnoreFinding={onIgnoreFinding}
                    showDropMarker={showDropMarker}
                    dropMarkerLabel={
                      dropMarker.fromArchive
                        ? 'Einfuegen aus Ablage'
                        : dropMarker.crossParagraph
                          ? 'Einfuegen hier (Absatzgrenze)'
                          : 'Einfuegen hier'
                    }
                  />
                );
              })}
            </div>
          </SortableContext>

          {activeBlocks.length === 0 && (
            <div className="rounded-lg border border-dashed border-[#4a3d2b] bg-[#120f0c] px-3 py-6 text-center text-xs text-[#cbbfb0]">
              Alle Saetze liegen in der Ablage.
            </div>
          )}

          {dropMarker.targetId === DROP_END_MARKER_ID && (
            <div className="mt-2 rounded border border-dashed border-[#c9b18a] bg-[#23190f] px-3 py-2 text-xs text-[#f5d7ab]">
              Einfuegen am Ende der Satzliste
            </div>
          )}
        </div>

        <div
          ref={setArchiveDropRef}
          className={`rounded-xl border border-dashed bg-[#0f0c0a] px-3 py-2 ${
            isOverArchiveZone && draggingId && !parkedIds.has(draggingId)
              ? 'border-[#d8a96d] ring-1 ring-[#d8a96d]/60'
              : 'border-[#4a3d2b]'
          }`}
        >
          <div className="mb-2 flex items-center justify-between text-xs text-[#cbbfb0]">
            <span>Ablage ({parkedBlocks.length})</span>
            {isOverArchiveZone && draggingId && !parkedIds.has(draggingId) && (
              <span className="rounded-full border border-[#7f5f38] bg-[#2b1f13] px-2 py-0.5 text-[10px] text-[#f6d2a7]">
                In Ablage ablegen
              </span>
            )}
          </div>

          {parkedBlocks.length === 0 ? (
            <p className="text-[11px] text-[#cbbfb0]">
              Ziehe Saetze hierhin, um sie temporaer aus dem Text zu nehmen.
            </p>
          ) : (
            <SortableContext
              items={parkedBlocks.map((block) => block.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-1.5">
                {parkedBlocks.map((block) => (
                  <MemoParkedItem
                    key={`parked-${block.id}`}
                    block={block}
                    selected={selectedIds.has(block.id)}
                    onRestore={() => unparkBlock(block.id)}
                    onDelete={handleDelete}
                    onMoveByKey={handleMoveByKey}
                  />
                ))}
              </div>
            </SortableContext>
          )}
        </div>
      </DndContext>

      <div className="sr-only" aria-live="polite">
        {liveMessage}
      </div>
    </div>
  );
}

type BlockCardProps = {
  block: Block;
  index: number;
  selected: boolean;
  expanded: boolean;
  onSelectOnly: (blockId: string) => void;
  onTextChange: (blockId: string, text: string) => void;
  onSplit: (blockId: string) => void;
  onMergePrev: (blockId: string) => void;
  onMergeNext: (blockId: string) => void;
  onDelete: (blockId: string) => void;
  onTogglePark: (blockId: string) => void;
  onMoveByKey: (blockId: string, direction: 'up' | 'down') => void;
  onCursorChange: (cursor: number) => void;
  canMergePrev: boolean;
  canMergeNext: boolean;
  matchCount: number;
  isActiveMatch: boolean;
  blockRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  findingSpans: InlineFindingSpan[];
  findingCounts: Record<string, number>;
  findingStyles?: Record<string, FindingStyleToken>;
  activeFindingId: number | null;
  analysisStale: boolean;
  allowInlinePreviewAction: boolean;
  onRequestPreview?: (findingId: number) => void;
  onIgnoreFinding?: (findingId: number) => void;
  showDropMarker: boolean;
  dropMarkerLabel: string;
};

function BlockCard({
  block,
  index,
  selected,
  expanded,
  onSelectOnly,
  onTextChange,
  onSplit,
  onMergePrev,
  onMergeNext,
  onDelete,
  onTogglePark,
  onMoveByKey,
  onCursorChange,
  canMergePrev,
  canMergeNext,
  matchCount,
  isActiveMatch,
  blockRefs,
  findingSpans,
  findingCounts,
  findingStyles,
  activeFindingId,
  analysisStale,
  allowInlinePreviewAction,
  onRequestPreview,
  onIgnoreFinding,
  showDropMarker,
  dropMarkerLabel,
}: BlockCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id });
  const [hovered, setHovered] = useState(false);
  const stats = block.stats ?? computeBlockStats(block.text);

  const setRefs = (node: HTMLDivElement | null) => {
    setNodeRef(node);
    blockRefs.current[block.id] = node;
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const primaryBadge = useMemo(() => {
    const [topType, topCount] = Object.entries(findingCounts).sort(
      ([, leftCount], [, rightCount]) => rightCount - leftCount,
    )[0] ?? [null, null];

    if (topType && typeof topCount === 'number') {
      const styleToken = findingStyles?.[topType] ?? DEFAULT_FINDING_STYLE;
      return `${styleToken.badge} ${topCount}`;
    }

    if (matchCount > 0) {
      return `${matchCount} Treffer`;
    }

    return stats.words >= 24 ? 'lang' : null;
  }, [findingCounts, findingStyles, matchCount, stats.words]);

  const showActions = hovered || selected || expanded;

  return (
    <div
      ref={setRefs}
      style={style}
      tabIndex={0}
      onFocus={() => onSelectOnly(block.id)}
      onClick={() => onSelectOnly(block.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onKeyDown={(event) => {
        if (event.altKey && event.key === 'ArrowUp') {
          event.preventDefault();
          onMoveByKey(block.id, 'up');
          return;
        }
        if (event.altKey && event.key === 'ArrowDown') {
          event.preventDefault();
          onMoveByKey(block.id, 'down');
          return;
        }
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelectOnly(block.id);
        }
      }}
      className={`group relative rounded-lg border bg-[#0f0c0a] px-2.5 py-2 transition ${
        expanded ? 'border-[#c9b18a]' : 'border-[#2f2822]'
      } ${selected ? 'ring-1 ring-[#a88960]/70' : ''} ${
        isActiveMatch ? 'ring-1 ring-[#d1b487]' : ''
      } ${isDragging ? 'opacity-60' : ''}`}
    >
      {showDropMarker && (
        <div className="pointer-events-none absolute -top-3 left-7 rounded border border-[#c9b18a] bg-[#20160e] px-2 py-0.5 text-[10px] text-[#f7ddb7]">
          {dropMarkerLabel}
        </div>
      )}

      <div className="flex items-start gap-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          onClick={(event) => event.stopPropagation()}
          className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded border border-[#2f2822] bg-[#18130f] text-[#f7f4ed]"
          aria-label="Satz verschieben"
        >
          <GripVertical size={13} />
        </button>

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-center justify-between gap-2 text-[11px]">
            <div className="flex items-center gap-2 text-[#cbbfb0]">
              <span className="rounded-full border border-[#2f2822] px-2 py-0.5 text-[#f7f4ed]">
                #{index + 1}
              </span>
              {primaryBadge && (
                <span className="rounded-full border border-[#4a3d2b] bg-[#2b2218] px-2 py-0.5 text-[10px] text-[#f7d8b1]">
                  {primaryBadge}
                </span>
              )}
            </div>

            <div
              className={`flex items-center gap-1 transition ${
                showActions ? 'opacity-100' : 'pointer-events-none opacity-0'
              }`}
            >
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onTogglePark(block.id);
                }}
                className="inline-flex items-center gap-1 rounded border border-[#2f2822] bg-[#18130f] px-1.5 py-0.5 text-[10px] text-[#f7f4ed] hover:bg-[#211a13]"
              >
                <Archive size={11} /> Parken
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(block.id);
                }}
                className="inline-flex items-center gap-1 rounded border border-[#2f2822] bg-[#18130f] px-1.5 py-0.5 text-[10px] text-[#f7f4ed] hover:bg-[#211a13]"
              >
                <Trash2 size={11} /> Loeschen
              </button>
            </div>
          </div>

          {expanded ? (
            <div className="space-y-2">
              <textarea
                value={block.text}
                onChange={(event) => onTextChange(block.id, event.target.value)}
                onSelect={(event) => onCursorChange(event.currentTarget.selectionStart ?? 0)}
                onKeyUp={(event) => onCursorChange(event.currentTarget.selectionStart ?? 0)}
                onClick={(event) => onCursorChange(event.currentTarget.selectionStart ?? 0)}
                className="min-h-[96px] w-full resize-y rounded-md border border-[#2f2822] bg-[#120f0c] p-2.5 text-sm leading-relaxed text-[#f7f4ed] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9b18a]"
                spellCheck
              />

              <div className="flex flex-wrap items-center gap-1 text-[10px] text-[#cbbfb0]">
                <span>{stats.words} W</span>
                <span>{stats.chars} Z</span>
              </div>

              <div className="flex flex-wrap items-center gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => onSplit(block.id)}
                  className="inline-flex items-center gap-1 rounded border border-[#2f2822] bg-[#18130f] px-2 py-1 text-[#f7f4ed] hover:bg-[#211a13]"
                >
                  <Scissors size={12} /> Split
                </button>
                <button
                  type="button"
                  onClick={() => onMergePrev(block.id)}
                  disabled={!canMergePrev}
                  className="inline-flex items-center gap-1 rounded border border-[#2f2822] bg-[#18130f] px-2 py-1 text-[#f7f4ed] hover:bg-[#211a13] disabled:opacity-40"
                >
                  <ArrowUp size={12} /> Merge
                </button>
                <button
                  type="button"
                  onClick={() => onMergeNext(block.id)}
                  disabled={!canMergeNext}
                  className="inline-flex items-center gap-1 rounded border border-[#2f2822] bg-[#18130f] px-2 py-1 text-[#f7f4ed] hover:bg-[#211a13] disabled:opacity-40"
                >
                  <ArrowDown size={12} /> Merge
                </button>
              </div>

              {findingSpans.length > 0 && !analysisStale && (
                <div className="rounded-md border border-[#2f2822] bg-[#0f0c0a] p-2 text-xs text-[#f7f4ed]">
                  <InlineFindingText
                    text={block.text}
                    spans={findingSpans}
                    findingStyles={findingStyles}
                    activeFindingId={activeFindingId}
                    allowInlinePreviewAction={allowInlinePreviewAction}
                    onRequestPreview={onRequestPreview}
                    onIgnoreFinding={onIgnoreFinding}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-md border border-[#2f2822] bg-[#120f0c] px-2.5 py-2 text-sm leading-relaxed text-[#f7f4ed]">
              <div className="line-clamp-2 whitespace-pre-wrap">{block.text}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const MemoBlockCard = memo(BlockCard);

type ParkedItemProps = {
  block: Block;
  selected: boolean;
  onRestore: () => void;
  onDelete: (blockId: string) => void;
  onMoveByKey: (blockId: string, direction: 'up' | 'down') => void;
};

function ParkedItem({
  block,
  selected,
  onRestore,
  onDelete,
  onMoveByKey,
}: ParkedItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.altKey && event.key === 'ArrowUp') {
          event.preventDefault();
          onMoveByKey(block.id, 'up');
          return;
        }
        if (event.altKey && event.key === 'ArrowDown') {
          event.preventDefault();
          onMoveByKey(block.id, 'down');
        }
      }}
      className={`rounded-lg border border-[#2f2822] bg-[#120f0c] px-3 py-2 text-xs text-[#d6c9ba] ${
        selected ? 'ring-1 ring-[#a88960]/60' : ''
      } ${isDragging ? 'opacity-60' : ''}`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="inline-flex h-6 w-6 items-center justify-center rounded border border-[#2f2822] bg-[#18130f] text-[#f7f4ed]"
        >
          <GripVertical size={12} />
        </button>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onRestore}
            className="inline-flex items-center gap-1 rounded border border-[#2f2822] bg-[#18130f] px-2 py-1 text-[11px] text-[#f7f4ed] hover:bg-[#211a13]"
          >
            <ArrowUp size={11} /> Zurueck
          </button>
          <button
            type="button"
            onClick={() => onDelete(block.id)}
            className="inline-flex items-center gap-1 rounded border border-[#2f2822] bg-[#18130f] px-2 py-1 text-[11px] text-[#f7f4ed] hover:bg-[#211a13]"
          >
            <Trash2 size={11} /> Loeschen
          </button>
        </div>
      </div>
      <div className="line-clamp-2 whitespace-pre-wrap">{block.text}</div>
    </div>
  );
}

const MemoParkedItem = memo(ParkedItem);

type InlineFindingTextProps = {
  text: string;
  spans: InlineFindingSpan[];
  findingStyles?: Record<string, FindingStyleToken>;
  activeFindingId: number | null;
  allowInlinePreviewAction: boolean;
  onRequestPreview?: (findingId: number) => void;
  onIgnoreFinding?: (findingId: number) => void;
};

type FindingSegment = {
  text: string;
  span: InlineFindingSpan | null;
};

type PopoverState = {
  span: InlineFindingSpan;
  x: number;
  y: number;
  pinned: boolean;
};

const buildFindingSegments = (text: string, spans: InlineFindingSpan[]): FindingSegment[] => {
  if (!text) return [{ text: '', span: null }];
  if (spans.length === 0) return [{ text, span: null }];

  const normalized = spans
    .map((span) => ({
      ...span,
      start: Math.max(0, Math.min(text.length, span.start)),
      end: Math.max(0, Math.min(text.length, span.end)),
    }))
    .filter((span) => span.end > span.start)
    .sort((left, right) => {
      const rightPriority = FINDING_PRIORITY[right.findingType] ?? 0;
      const leftPriority = FINDING_PRIORITY[left.findingType] ?? 0;
      if (rightPriority !== leftPriority) {
        return rightPriority - leftPriority;
      }
      return right.end - right.start - (left.end - left.start);
    });

  const coverage: Array<InlineFindingSpan | null> = Array.from(
    { length: text.length },
    () => null,
  );
  normalized.forEach((span) => {
    for (let i = span.start; i < span.end; i += 1) {
      if (!coverage[i]) {
        coverage[i] = span;
      }
    }
  });

  const segments: FindingSegment[] = [];
  let cursor = 0;
  let active = coverage[0];
  for (let i = 1; i <= text.length; i += 1) {
    const atEnd = i === text.length;
    const next = atEnd ? null : coverage[i];
    if (atEnd || next !== active) {
      segments.push({
        text: text.slice(cursor, i),
        span: active,
      });
      cursor = i;
      active = next;
    }
  }
  return segments.filter((segment) => segment.text.length > 0);
};

function InlineFindingText({
  text,
  spans,
  findingStyles,
  activeFindingId,
  allowInlinePreviewAction,
  onRequestPreview,
  onIgnoreFinding,
}: InlineFindingTextProps) {
  const [popover, setPopover] = useState<PopoverState | null>(null);
  const hoverOpenTimerRef = useRef<number | null>(null);
  const hoverCloseTimerRef = useRef<number | null>(null);

  const segments = useMemo(() => buildFindingSegments(text, spans), [spans, text]);

  const clearTimers = useCallback(() => {
    if (hoverOpenTimerRef.current) {
      window.clearTimeout(hoverOpenTimerRef.current);
      hoverOpenTimerRef.current = null;
    }
    if (hoverCloseTimerRef.current) {
      window.clearTimeout(hoverCloseTimerRef.current);
      hoverCloseTimerRef.current = null;
    }
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPopover(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const openPopover = useCallback((span: InlineFindingSpan, anchor: HTMLElement, pinned: boolean) => {
    const rect = anchor.getBoundingClientRect();
    const width = 280;
    const maxX = Math.max(16, window.innerWidth - width - 16);
    const x = Math.min(maxX, Math.max(16, rect.left));
    const y = Math.min(window.innerHeight - 20, rect.bottom + 10);
    setPopover({ span, x, y, pinned });
  }, []);

  const scheduleOpen = useCallback(
    (span: InlineFindingSpan, anchor: HTMLElement, pinned: boolean) => {
      clearTimers();
      hoverOpenTimerRef.current = window.setTimeout(() => {
        openPopover(span, anchor, pinned);
      }, pinned ? 0 : 180);
    },
    [clearTimers, openPopover],
  );

  const scheduleClose = useCallback(() => {
    clearTimers();
    hoverCloseTimerRef.current = window.setTimeout(() => {
      setPopover((current) => (current?.pinned ? current : null));
    }, 160);
  }, [clearTimers]);

  return (
    <div className="relative whitespace-pre-wrap">
      {segments.map((segment, idx) => {
        if (!segment.span) {
          return <span key={`segment-${idx}`}>{segment.text}</span>;
        }

        const styleToken =
          findingStyles?.[segment.span.findingType] ?? DEFAULT_FINDING_STYLE;
        const active = activeFindingId === segment.span.findingId;
        return (
          <button
            key={`${segment.span.findingId}-${idx}`}
            type="button"
            onMouseEnter={(event) =>
              scheduleOpen(segment.span as InlineFindingSpan, event.currentTarget, false)
            }
            onMouseLeave={scheduleClose}
            onFocus={(event) =>
              scheduleOpen(segment.span as InlineFindingSpan, event.currentTarget, false)
            }
            onBlur={scheduleClose}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              scheduleOpen(segment.span as InlineFindingSpan, event.currentTarget, true);
            }}
            className={`rounded-sm px-0.5 text-left transition ${styleToken.markClass} ${styleToken.underlineClass} ${
              active ? 'ring-1 ring-[#f6d9b5]' : ''
            }`}
            aria-label={`${styleToken.label}: ${segment.span.token}`}
          >
            {segment.text}
          </button>
        );
      })}

      {popover && (
        <div
          className="fixed z-40 w-[280px] rounded-lg border border-[#3f352c] bg-[#17120d] p-3 text-[11px] text-[#e8dccf] shadow-2xl"
          style={{ left: popover.x, top: popover.y }}
          onMouseEnter={clearTimers}
          onMouseLeave={scheduleClose}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="font-semibold text-[#f7f4ed]">
              {(findingStyles?.[popover.span.findingType] ?? DEFAULT_FINDING_STYLE).label}
            </div>
            <button
              type="button"
              onClick={() => setPopover(null)}
              className="rounded border border-[#3a3026] bg-[#201911] px-1.5 py-0.5 text-[10px] text-[#f7f4ed]"
            >
              Schliessen
            </button>
          </div>
          <div className="mt-1 text-[#cbbfb0]">
            {popover.span.explanation ?? 'Prüfe, ob diese Stelle präziser formuliert werden kann.'}
          </div>
          <div className="mt-2 flex items-center gap-2">
            {allowInlinePreviewAction &&
              popover.span.findingType === 'adverb' &&
              onRequestPreview && (
                <button
                  type="button"
                  onClick={() => onRequestPreview(popover.span.findingId)}
                  className="rounded border border-[#3f352b] bg-[#2b2218] px-2 py-1 text-[10px] text-[#f7f4ed]"
                >
                  Vorschau...
                </button>
              )}
            {onIgnoreFinding && (
              <button
                type="button"
                onClick={() => {
                  onIgnoreFinding(popover.span.findingId);
                  setPopover(null);
                }}
                className="rounded border border-[#3f352b] bg-[#2b2218] px-2 py-1 text-[10px] text-[#f7f4ed]"
              >
                Ignorieren
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}




