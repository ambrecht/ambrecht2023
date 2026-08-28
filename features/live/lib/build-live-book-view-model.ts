import type { LiveLine, PublicLiveState } from './contract';

export type ReaderFragment = {
  id: string;
  text: string;
  committedAt: string | null;
};

export type ReaderParagraph = {
  id: string;
  fragments: ReaderFragment[];
};

export type LiveBookViewModel = {
  title: string | null;
  authorLabel: string;
  activeReaders: number | null;
  historicalParagraphs: ReaderParagraph[];
  liveText: string;
  revisionKey: string | number | null;
};

const punctuationWithoutLeadingSpace = /^[,.;:!?)]/u;

function createFragment(line: LiveLine): ReaderFragment {
  return {
    id: line.id,
    text: line.text,
    committedAt: line.publishedAt,
  };
}

function buildParagraphs(lines: readonly LiveLine[]): ReaderParagraph[] {
  const paragraphs: ReaderParagraph[] = [];
  let currentFragments: ReaderFragment[] = [];
  let currentParagraphId: string | null = null;

  const flushParagraph = () => {
    if (currentFragments.length === 0 || currentParagraphId === null) return;

    paragraphs.push({
      id: currentParagraphId,
      fragments: currentFragments,
    });
    currentFragments = [];
    currentParagraphId = null;
  };

  for (const line of lines) {
    if (line.text.trim().length === 0) {
      flushParagraph();
      continue;
    }

    if (currentParagraphId === null) {
      currentParagraphId = `paragraph-${line.id}`;
    }

    currentFragments.push(createFragment(line));
  }

  flushParagraph();
  return paragraphs;
}

export function getFragmentSeparator(
  previousText: string | null,
  nextText: string,
) {
  if (!previousText || nextText.length === 0) return '';
  if (/\s$/u.test(previousText) || /^\s/u.test(nextText)) return '';
  if (punctuationWithoutLeadingSpace.test(nextText)) return '';
  return ' ';
}

export function buildLiveBookViewModel(
  state: PublicLiveState,
): LiveBookViewModel {
  if (state.status === 'offline') {
    return {
      title: null,
      authorLabel: 'Tino',
      activeReaders: null,
      historicalParagraphs: [],
      liveText: '',
      revisionKey: `offline:${state.nextLiveAt ?? 'none'}`,
    };
  }

  return {
    title: null,
    authorLabel: 'Tino',
    activeReaders: state.viewerCount,
    historicalParagraphs: buildParagraphs(state.lines),
    liveText: state.activeDraft,
    revisionKey: `${state.broadcastId}:${state.sequence}`,
  };
}

export function countCompleteWords(text: string) {
  const normalizedText = text.trim();
  if (normalizedText.length === 0) return 0;

  const words = normalizedText.match(/\S+/gu) ?? [];
  if (/\S$/u.test(text) && words.length > 0) {
    return words.length - 1;
  }

  return words.length;
}

export function countViewModelWords(viewModel: LiveBookViewModel) {
  const historicalText = viewModel.historicalParagraphs
    .flatMap((paragraph) => paragraph.fragments.map((fragment) => fragment.text))
    .join(' ');

  return (
    countCompleteWords(`${historicalText} `) +
    countCompleteWords(viewModel.liveText)
  );
}
