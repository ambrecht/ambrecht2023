import { getProcessPageContent } from '@/src/content/loader';
import ProcessClient from './ProcessClient';

export default async function ProcessPage() {
  const content = await getProcessPageContent('de');

  return <ProcessClient content={content} />;
}
