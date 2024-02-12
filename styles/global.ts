import { createGlobalStyle, css } from 'styled-components';
import { Poppins } from 'next/font/google';
import { Cormorant_Garamond } from 'next/font/google';

// Ihre vorhandene Browser-Erkennungslogik
const isChrome =
  typeof navigator !== 'undefined'
    ? /Chrome/.test(navigator.userAgent) &&
      /Google Inc/.test(navigator.vendorSub)
    : false;

// Ihre Chrome-spezifischen Stile
const ChromeStyles = css`
  --chromeXXX: 10vw;
`;

// Ihre Font-Definitionen
const gara = Cormorant_Garamond({
  weight: ['300', '400', '700', '500', '600'],
  subsets: ['latin'],
  style: ['normal', 'italic'],
});

const popp = Poppins({
  subsets: ['latin'],
  weight: ['200', '400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
});

// Ihre globalen Stile mit Chrome-Anpassungen
const GlobalStyles = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
  };
  
  :root {
    --measure: 60ch;
    --size: 1500;
    --pop-Font: ${popp.style.fontFamily};
    --gara-Font: ${gara.style.fontFamily};
    
    font-feature-settings: "kern" off;
    -webkit-text-size-adjust: none;
    font-kerning: none;
    font-size: clamp(12px, 1vw, 24px);
    text-wrap: balance;
    box-sizing: border-box;

    ${isChrome && ChromeStyles} // Chrome-spezifische Stile hier integrieren
  }

  body {
    background-color: #0f0f0f;
    font-family: var(--pop-Font);
    z-index: 1000;
  }

  html:focus-within {
    scroll-behavior: smooth;
  }
`;

export default GlobalStyles;
