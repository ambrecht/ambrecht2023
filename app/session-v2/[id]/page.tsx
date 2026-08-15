import { redirect } from 'next/navigation';

type SessionV2ReaderPageProps = {
  params: {
    id: string;
  };
};

export const metadata = {
  title: 'minimalType Archiv - Session View 2',
  description: 'Weiterleitung in das vollstaendige Session-Archiv.',
};

export default function SessionV2ReaderPage({ params }: SessionV2ReaderPageProps) {
  redirect(`/session-v2#session-${encodeURIComponent(params.id)}`);
}
