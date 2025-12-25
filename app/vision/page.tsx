import { getVisionPageContent } from '@/src/content/loader';
import VisionClient from './VisionClient';

export default async function Vision() {
  const content = await getVisionPageContent('de');

  return <VisionClient content={content} />;
}
