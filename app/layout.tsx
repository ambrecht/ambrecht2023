import type { Metadata } from 'next';
import StyledComponentsRegistry from '@/lib/registry';
import Navigation from '@/components/Navigation';
import { Frame } from '@/components/Frame';
import Footer from '@/components/Footer';
import { Padding } from '@/components/Padding';
import { getFooterContent, getNavContent } from '@/src/content/loader';
import type { Locale } from '@/src/content/schemas';
import './globals.css';

export const metadata: Metadata = {
  title:
    'Tino Ambrecht - Digitaler Produktentwickler für Technologie, Strategie und Design',
  description:
    'Tino Ambrecht: Experte für digitale Produktentwicklung. Spezialisiert auf innovative Web- und App-Entwicklung, strategische Beratung und kreatives Design. Entdecken Sie maßgeschneiderte Lösungen, die Technologie und Ästhetik vereinen, um nachhaltigen Wert und einzigartige Benutzererfahrungen zu schaffen.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale: Locale = 'de';
  const [navContent, footerContent] = await Promise.all([
    getNavContent(locale),
    getFooterContent(locale),
  ]);

  return (
    <html lang="de">
      <body>
        <StyledComponentsRegistry>
          <Frame>
            <Padding>
              <Navigation content={navContent} />
              {children}
            </Padding>
            <Footer content={footerContent} />
          </Frame>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
