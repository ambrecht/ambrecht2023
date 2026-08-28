import { SessionV2Activity } from '@/components/SessionView2/SessionV2Activity';
import { SessionV2Shell } from '@/components/SessionView2/SessionV2Shell';

export const metadata = {
  title: 'minimalType Aktivitaet - Session View 2',
  description: 'Schreibaktivitaet fuer bestehende minimalType Sessions.',
};

export default function SessionV2ActivityPage() {
  return (
    <SessionV2Shell active="activity">
      <SessionV2Activity />
    </SessionV2Shell>
  );
}

