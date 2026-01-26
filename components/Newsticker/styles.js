import styled, { keyframes } from 'styled-components';
import { Fragment_Mono } from 'next/font/google';

export const Container = styled.div`
  position: fixed; /* Fixiert den Container am unteren Rand des Viewports */
  left: 0; /* Streckt den Container nach ganz links */
  right: 0; /* Streckt den Container nach ganz rechts */
  bottom: 0; /* Positioniert den Container am unteren Rand des Viewports */
  width: 100%; /* Stellt sicher, dass der Container die volle Breite einnimmt */
  margin: 0;
  padding: 0;
  font-family: var(--font-mono);
  background: #000;
  overflow: hidden; /* Sorgt dafür, dass keine Scrollbalken erscheinen */
  mix-blend-mode: hard-light;
  z-index: 10;
`;

export const NewsHeaderFooter = styled.div`
  color: white;
  font-size: 20px; /* Adjust font size to better match the image */
  padding: 0.5rem;
  background: #770000; /* Dunkles Rot für ein alarmierendes Aussehen */
  display: flex;
  align-items: center;
  justify-content: space-between; /* Align items to the sides */
`;

export const NewsHeaderContent = styled.div`
  margin-left: 1rem; /* Add margin to match the image */
  font-size: 2rem; /* Größere Schrift für mehr Dramatik */
  background-color: black;
  /* Großbuchstaben für mehr Impact */
  /* Buchstabenabstand erhöhen für eine dramatische Optik */
`;

export const Ticker = styled.div`
  background: rgba(0, 0, 0, 0.7); /* Solid color for ticker background */
  color: white;
  font-size: 18px; /* Adjust font size for ticker items */
  padding: 0.5rem;
  overflow: hidden; /* Hide overflow of ticker */
  white-space: nowrap;
  //box-shadow: inset 0 -3px 9px 0 rgba(255, 0, 0, 0.5); /* Roter Schein nach innen */
`;

const scrollTicker = keyframes`
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  } /* Move the ticker from right to left */
`;

export const TickerWrapper = styled.div`
  display: inline-flex;
  width: max-content;
  white-space: nowrap;
  animation: ${scrollTicker} 600s linear infinite; /* Scrolling animation for ticker */
  will-change: transform;
`;

export const TickerItem = styled.div`
  white-space: nowrap; /* Ensure the ticker items do not wrap */
  padding-right: 2rem; /* Space between ticker items */
`;

export const FooterLeftRight = styled.div`
  display: flex;
  align-items: center;
`;

export const MarketData = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.2rem 0.5rem;
  background-color: #262626; /* Dark background for market data */
`;

export const DataItem = styled.div`
  margin-right: 1rem; /* Add spacing between market data items */
  font-size: 16px; /* Slightly smaller font size for market data */
  color: 00ff6a;
`;

export const DataValue = styled.span`
  font-weight: ${({ isUp }) => (isUp ? 800 : 700)};
  color: ${({ isUp }) =>
    isUp ? '#00ff6a' : '#ff0000'}; /* Rote Farbe für negative Werte */
`;

export const ApocalypticHeader = styled(NewsHeaderContent)`
  background-color: darkred; // Blood-red sky
  color: white;
  font-weight: ${({ isUp }) => (isUp ? 800 : 700)};
  text-shadow: 2px 2px 4px #000000;
`;

export const TickerApocalypticStyle = styled(TickerItem)`
  background-color: #333; // Dark and ominous
  color: ${({ isUp }) =>
    isUp ? '#00ff6a' : '#ff0000'}; /* Alarmrot für die Nachrichtentexte */
  text-shadow: 0 0 8px #ff0000; /* Roter Glüheffekt für Text */
`;

export const MarketCollapseDisplay = styled(MarketData)`
  background-color: dark-grey; // The dark abyss of the market collapse
  color: #ee2222; // Red to signify danger and decline
`;

export const BitcoinPriceDisplayApocalyptic = styled.div`
  background-color: #0d0d0d; // Dunkle Hintergrundfarbe
  color: #ffd700; // Goldene Schrift für Sichtbarkeit
  padding: 10px; // Padding für den Innenabstand
  font-size: 1.5rem; // Größere Schrift für Lesbarkeit
  margin: 10px; // Margin, um etwas Abstand zu anderen Elementen zu halten
  border-radius: 5px; // Abgerundete Ecken
  display: inline-block; // Inline-Block für die Einbettung im Fluss des Dokuments
  margin-bottom: -3px; // Positionsanpassung, um mit dem Header/Footer zu verschmelzen
`;
