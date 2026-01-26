import { createGlobalStyle } from 'styled-components';
import { Fragment_Mono } from 'next/font/google';

const mono = Fragment_Mono({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-fragment-mono', // Definieren Sie einen CSS-Variablennamen
});

const GlobalStyles = createGlobalStyle`
  
  :root {
    --font-mono:  ${mono.style.fontFamily};
     --measure: 60ch;
     --size: 1500;
     box-sizing: border-box;
     font-feature-settings: "kern" off;
  -webkit-text-size-adjust: none;
  font-kerning: none;
  font-size: clamp(1px,12px,10*100vw/390);
  text-wrap: balance;
 

  }

  body {
     // Einheitlicher Abstand, der nicht überschrieben werden kann
    
    
  }

  html:focus-within {
    scroll-behavior: smooth;
    
  }
`;

export default GlobalStyles;
