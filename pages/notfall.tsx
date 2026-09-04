import type { NextPage } from 'next';
import Head from 'next/head';

import { NotfallExperience } from '@/features/notfall';

const NotfallPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Notfallmodus</title>
        <meta
          name="description"
          content="Ein kurzer Notfallmodus, der vom inneren Bild zur Orientierung im wirklichen Raum führt."
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <NotfallExperience />
    </>
  );
};

export default NotfallPage;
