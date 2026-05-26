import type { Metadata } from 'next';
import { gpts } from '@/src/data/gpts';
import { GptDirectory } from '@/src/features/gpts/GptDirectory';

export const metadata: Metadata = {
  title: 'GPT-Agenten | Tino Ambrecht',
  description:
    'Eine statische Übersicht persönlicher ChatGPT-Custom-GPTs mit Suche und Tag-Filtern.',
};

export const dynamic = 'force-static';

export default function GptsPage() {
  return <GptDirectory gpts={gpts} />;
}
