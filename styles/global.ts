import { createGlobalStyle } from 'styled-components';
import { Poppins } from 'next/font/google';
import { Cormorant_Garamond } from 'next/font/google';

const gara = Cormorant_Garamond({
  variable: '--gara-Font',
  weight: ['300', '400', '700', '500', '600'],
  subsets: ['latin'],
  style: ['normal', 'italic'],
});

const popp = Poppins({
  variable: '--font-popp',
  subsets: ['latin'],
  weight: ['100', '400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
});

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

 

  }

  body {
    background-color: #0f0f0f;
    font-family: var(--pop-Font);
 
    
   
   
    

  
    
  }

  html:focus-within {
    scroll-behavior: smooth;
    
  }
`;

export default GlobalStyles;
