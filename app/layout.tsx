import type { Metadata } from 'next';
import StyledComponentsRegistry from '@/lib/registry';
import Navigation from '@/components/Navigation';
import { Frame } from '@/components/Frame';
import { Footer } from '@/components/Footer';
import { Padding } from '@/components/Padding';

export const metadata: Metadata = {
  title:
    'Tino Ambrecht - Digitaler Produktentwickler für Technologie, Strategie und Design',
  description:
    'Tino Ambrecht: Experte für digitale Produktentwicklung. Spezialisiert auf innovative Web- und App-Entwicklung, strategische Beratung und kreatives Design. Entdecken Sie maßgeschneiderte Lösungen, die Technologie und Ästhetik vereinen, um nachhaltigen Wert und einzigartige Benutzererfahrungen zu schaffen.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <StyledComponentsRegistry>
          <Frame>
            <Padding>
              <Navigation />
              {children}
            </Padding>
            <Footer />
          </Frame>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
