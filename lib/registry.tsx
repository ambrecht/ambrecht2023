'use client';
// Import der benötigten Module und Komponenten
import { useServerInsertedHTML } from 'next/navigation';
import React, { useState } from 'react';
import {
  ServerStyleSheet,
  StyleSheetManager,
  ThemeProvider,
} from 'styled-components';
import { GlobalStyle, theme } from '@/styles';

// Hauptkomponente: StyledComponentsRegistry
export default function StyledComponentsRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  // Erstelle ein ServerStyleSheet nur einmal mit einem Lazy Initial State.
  // Lazy Initial State sorgt dafür, dass die Funktion zur Initialisierung nur einmal aufgerufen wird.
  const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet());

  // Nutze den useServerInsertedHTML-Hook, um serverseitig eingefügte HTML-Styles zu handhaben.
  // Das ist spezifisch für Next.js und styled-components.
  useServerInsertedHTML(() => {
    const styles = styledComponentsStyleSheet.getStyleElement();
    styledComponentsStyleSheet.instance.clearTag();
    return styles;
  });

  // Funktion zum Rendern der Kindkomponenten, eingehüllt in ThemeProvider und GlobalStyle.
  // Diese Funktion stellt sicher, dass das Theme und die globalen Stile immer angewendet werden,
  // unabhängig davon, ob die Komponenten serverseitig oder clientseitig gerendert werden.
  const renderChildren = () => (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      {children}
    </ThemeProvider>
  );

  // Überprüfe, ob die Komponente clientseitig oder serverseitig gerendert wird.
  // Wenn clientseitig, dann rufe renderChildren direkt auf.
  if (typeof window !== 'undefined') {
    return renderChildren();
  }

  // Wenn serverseitig, dann nutze StyleSheetManager zum Rendern der Kindkomponenten.
  return (
    <StyleSheetManager sheet={styledComponentsStyleSheet.instance}>
      {renderChildren()}
    </StyleSheetManager>
  );
}
