import { getStartPageContent, getSympathyTestContent } from '@/src/content/loader';
import StartClient from './StartClient';

export default async function Home() {
  const [startContent, sympathyContent] = await Promise.all([
    getStartPageContent('de'),
    getSympathyTestContent('de'),
  ]);

  return <StartClient startContent={startContent} sympathyContent={sympathyContent} />;
}
