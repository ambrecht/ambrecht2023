import { SessionV2Library } from '@/components/SessionView2/SessionV2Library';
import { SessionV2Shell } from '@/components/SessionView2/SessionV2Shell';

export const metadata = {
  title: 'minimalType Sessions - Session View 2',
  description: 'Ruhige Archivansicht fuer bestehende minimalType Sessions.',
};

export default function SessionV2Page() {
  return (
    <SessionV2Shell active="sessions">
      <SessionV2Library />
    </SessionV2Shell>
  );
}

