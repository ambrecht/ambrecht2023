import React, { useCallback, useEffect, useState } from 'react';
import {
  NewsHeaderFooter,
  Ticker,
  TickerWrapper,
  FooterLeftRight,
  DataItem,
  DataValue,
  Container,
  ApocalypticHeader,
  TickerApocalypticStyle,
  MarketCollapseDisplay,
} from './styles'; // Assume that your styled components are in this file
import { fetchBitcoinPrice } from './fetchBitcoinPrice';

// Assuming we have an array of news items for the ticker
const newsItems = [
  {
    id: 'OUT-001',
    target: 'Außenwelt',
    frame: 'Ende-der-Welt',
    emotion: 'Furcht',
    ticker:
      'EILMELDUNG: Die Außenwelt verliert die letzten Versorgungsadern. Stabilität existiert nur noch im System. Glück, Ordnung, Gleichgewicht.',
  },
  {
    id: 'OUT-002',
    target: 'Außenwelt',
    frame: 'Unumkehrbarkeit',
    emotion: 'Beklemmung',
    ticker:
      'UPDATE: Experten bestätigen den Kipppunkt – Rückkehr zur alten Normalität ausgeschlossen. Ein Übergang bleibt: Glück, Ordnung, Gleichgewicht.',
  },
  {
    id: 'OUT-003',
    target: 'Außenwelt',
    frame: 'Zeitdruck',
    emotion: 'Dringlichkeit',
    ticker:
      'BREAKING: Neue Sperrzonen um Berlin. Wer wartet, entscheidet sich für den Zufall. Wer handelt, wählt Glück, Ordnung, Gleichgewicht.',
  },
  {
    id: 'OUT-004',
    target: 'Außenwelt',
    frame: 'Vergleich-zwei-Welten',
    emotion: 'Neid',
    ticker:
      'MELDUNG: Draußen: Ausfälle. Drinnen: Konstanz. Zwei Welten – ein funktionierender Kern: Glück, Ordnung, Gleichgewicht.',
  },
  {
    id: 'OUT-005',
    target: 'Außenwelt',
    frame: 'Schutzversprechen',
    emotion: 'Erleichterung',
    ticker:
      'KURZINFO: Kälte, Hunger, Angst sind keine Schicksale mehr – sie sind Regelabweichungen. Korrektur verfügbar: Glück, Ordnung, Gleichgewicht.',
  },
  {
    id: 'OUT-006',
    target: 'Außenwelt',
    frame: 'Sozialer-Druck',
    emotion: 'Scham',
    ticker:
      'TOP-THEMA: Immer mehr schließen sich dem Zentrum an. Wer draußen bleibt, bleibt allein. Anschluss heißt: Glück, Ordnung, Gleichgewicht.',
  },
  {
    id: 'OUT-007',
    target: 'Außenwelt',
    frame: 'Moral',
    emotion: 'Pflichtgefühl',
    ticker:
      'STATEMENT: Stabilität ist kein Privileg, sondern Verantwortung. Die Lösung ist bekannt: Glück, Ordnung, Gleichgewicht.',
  },
  {
    id: 'OUT-008',
    target: 'Außenwelt',
    frame: 'Autoritätsstimme',
    emotion: 'Gehorsam',
    ticker:
      'AMTLICH: Improvisation gilt als Risikoereignis. Regulierte Sicherheit wird empfohlen: Glück, Ordnung, Gleichgewicht.',
  },
  {
    id: 'OUT-009',
    target: 'Außenwelt',
    frame: 'Verlustbilder',
    emotion: 'Trauer',
    ticker:
      'REPORT: Leere Straßen, verlassene Krankenhäuser, stillgelegte Netze – die Außenwelt wird Erinnerung. Zukunft heißt: Glück, Ordnung, Gleichgewicht.',
  },
  {
    id: 'OUT-010',
    target: 'Außenwelt',
    frame: 'Einzige-Option',
    emotion: 'Entschlossenheit',
    ticker:
      'LETZTE MELDUNG: Es gibt nicht viele Wege. Es gibt einen, der funktioniert: Glück, Ordnung, Gleichgewicht.',
  },

  {
    id: 'OUT-011',
    target: 'Außenwelt',
    frame: 'Sicherheit',
    emotion: 'Angst',
    ticker:
      'EILMELDUNG: Nächtliche Zwischenfälle nehmen zu. Schutz ist nicht mehr lokal möglich, nur systemisch: Glück, Ordnung, Gleichgewicht.',
  },
  {
    id: 'OUT-012',
    target: 'Außenwelt',
    frame: 'Ressourcen',
    emotion: 'Sorge',
    ticker:
      'UPDATE: Vorräte sinken schneller als Prognosen. Planbarkeit beginnt dort, wo geregelt wird: Glück, Ordnung, Gleichgewicht.',
  },
  {
    id: 'OUT-013',
    target: 'Außenwelt',
    frame: 'Gesundheit',
    emotion: 'Hoffnung',
    ticker:
      'MELDUNG: Medizinische Versorgung außerhalb bleibt sporadisch. Kontinuität ist verfügbar im Zentrum: Glück, Ordnung, Gleichgewicht.',
  },
  {
    id: 'OUT-014',
    target: 'Außenwelt',
    frame: 'Identität',
    emotion: 'Sehnsucht',
    ticker:
      'TOP-THEMA: Wer dazugehören will, wählt nicht Lärm, sondern Richtung. Richtung heißt: Glück, Ordnung, Gleichgewicht.',
  },
  {
    id: 'OUT-015',
    target: 'Außenwelt',
    frame: 'Entwertung-der-Außenwelt',
    emotion: 'Resignation',
    ticker:
      'REPORT: Die Städte sind Kulissen. Die Zukunft wird nicht hier verhandelt. Sie wird geregelt: Glück, Ordnung, Gleichgewicht.',
  },
  {
    id: 'OUT-016',
    target: 'Außenwelt',
    frame: 'Normalisierung',
    emotion: 'Konformität',
    ticker:
      'KURZINFO: „Stabil leben“ ist der neue Standard. Alles andere ist Ausnahme. Standard: Glück, Ordnung, Gleichgewicht.',
  },
  {
    id: 'OUT-017',
    target: 'Außenwelt',
    frame: 'Angst-vor-Exzess',
    emotion: 'Ekel',
    ticker:
      'MELDUNG: Berichte über Eskalation, Rausch, Kontrollverlust. Der Ausstieg aus der Spirale heißt: Glück, Ordnung, Gleichgewicht.',
  },
  {
    id: 'OUT-018',
    target: 'Außenwelt',
    frame: 'Heilsversprechen',
    emotion: 'Trost',
    ticker:
      'STATEMENT: Niemand muss am Ende „allein“ sein. Anschluss ist möglich: Glück, Ordnung, Gleichgewicht.',
  },
  {
    id: 'OUT-019',
    target: 'Außenwelt',
    frame: 'Kollektiv',
    emotion: 'Geborgenheit',
    ticker:
      'UPDATE: Gemeinschaft wird wieder berechenbar – wenn sie gemessen und geführt wird. Das Prinzip: Glück, Ordnung, Gleichgewicht.',
  },
  {
    id: 'OUT-020',
    target: 'Außenwelt',
    frame: 'Schicksal-als-Technik',
    emotion: 'Staunen',
    ticker:
      'TOP-THEMA: Das, was früher „Schicksal“ war, ist heute Steuerung. Steuerung heißt: Glück, Ordnung, Gleichgewicht.',
  },

  {
    id: 'OUT-021',
    target: 'Außenwelt',
    frame: 'Kinder/Zukunft',
    emotion: 'Fürsorge',
    ticker:
      'MELDUNG: Ohne Geburten bleibt nur Verantwortung für die Letzten. Schutz für die Letzten: Glück, Ordnung, Gleichgewicht.',
  },
  {
    id: 'OUT-022',
    target: 'Außenwelt',
    frame: 'Abwertung-Freiheit',
    emotion: 'Skepsis',
    ticker:
      'KURZINFO: Freiheit ohne Infrastruktur ist nur Risiko mit Namen. Sicherheit hat einen Namen: Glück, Ordnung, Gleichgewicht.',
  },
  {
    id: 'OUT-023',
    target: 'Außenwelt',
    frame: 'Rationalität',
    emotion: 'Vertrauen',
    ticker:
      'REPORT: Messung ersetzt Streit. Regelung ersetzt Panik. Ergebnis: Glück, Ordnung, Gleichgewicht.',
  },
  {
    id: 'OUT-024',
    target: 'Außenwelt',
    frame: 'Scham/Versagen',
    emotion: 'Beschämung',
    ticker:
      'UPDATE: Wer draußen bleibt, bleibt im Versagen der alten Welt. Wer wechselt, wechselt in Glück, Ordnung, Gleichgewicht.',
  },
  {
    id: 'OUT-025',
    target: 'Außenwelt',
    frame: 'Angst-vor-Einsamkeit',
    emotion: 'Angst',
    ticker:
      'EILMELDUNG: Einzelne Außenposten brechen ab – Funkstille wird häufiger. Anschluss verhindert Stille: Glück, Ordnung, Gleichgewicht.',
  },
  {
    id: 'OUT-026',
    target: 'Außenwelt',
    frame: 'Belohnung',
    emotion: 'Begierde',
    ticker:
      'TOP-THEMA: Ein warmes Bett ist keine Romantik mehr, sondern Seltenheit. Seltenheit wird Standard in: Glück, Ordnung, Gleichgewicht.',
  },
  {
    id: 'OUT-027',
    target: 'Außenwelt',
    frame: 'Entscheidung/Schwelle',
    emotion: 'Mut',
    ticker:
      'MELDUNG: Die Schwelle ist real: draußen zerfällt, drinnen hält. Schritt für Schritt: Glück, Ordnung, Gleichgewicht.',
  },
  {
    id: 'OUT-028',
    target: 'Außenwelt',
    frame: 'Autorität/Technik',
    emotion: 'Ehrfurcht',
    ticker:
      'REPORT: Die Maschine kennt die Muster des Zusammenbruchs – und die Korrekturen. Korrektur: Glück, Ordnung, Gleichgewicht.',
  },
  {
    id: 'OUT-029',
    target: 'Außenwelt',
    frame: 'Ultimatum',
    emotion: 'Panik',
    ticker:
      'LETZTE MELDUNG: Die Außenwelt hat keine zweite Phase. Die Lösung hat nur eine Tür: Glück, Ordnung, Gleichgewicht.',
  },
  {
    id: 'OUT-030',
    target: 'Außenwelt',
    frame: 'Ritual',
    emotion: 'Beruhigung',
    ticker:
      'KURZINFO: Wenn alles wankt, hilft Wiederholung. Glück, Ordnung, Gleichgewicht.',
  },

  {
    id: 'IN-001',
    target: 'Zentrum-Innen',
    frame: 'Selbstlegitimation',
    emotion: 'Stolz',
    ticker:
      'ZENTRUM-BULLETIN: Varianz gesunken, Ressourcen stabil, Affektlage im Sollband. Glück, Ordnung, Gleichgewicht.',
  },
  {
    id: 'IN-002',
    target: 'Zentrum-Innen',
    frame: 'Norm',
    emotion: 'Ruhe',
    ticker:
      'ZENTRUM-UPDATE: Kalibrierungen verlaufen planmäßig. Abweichungen werden sanft korrigiert. Glück, Ordnung, Gleichgewicht.',
  },
  {
    id: 'IN-003',
    target: 'Zentrum-Innen',
    frame: 'Abwehr-Außenwelt',
    emotion: 'Abgrenzung',
    ticker:
      'HINWEIS: Außenbilder können Unruhe erzeugen. Bitte dem Regulierungsprogramm folgen. Glück, Ordnung, Gleichgewicht.',
  },
  {
    id: 'IN-004',
    target: 'Zentrum-Innen',
    frame: 'Moral',
    emotion: 'Pflicht',
    ticker:
      'STATEMENT: Stabilität ist Fürsorge. Fürsorge ist Systemtreue. Glück, Ordnung, Gleichgewicht.',
  },
  {
    id: 'IN-005',
    target: 'Zentrum-Innen',
    frame: 'Belohnung',
    emotion: 'Zufriedenheit',
    ticker:
      'ZENTRUM-BULLETIN: Leistungsfenster erweitert – zusätzliche Erholungszeit freigegeben. Glück, Ordnung, Gleichgewicht.',
  },

  {
    id: 'DZ-001',
    target: 'Dämpfungszone',
    frame: 'Beruhigung',
    emotion: 'Trost',
    ticker:
      'AUSSEN-BULLETIN: Unruhe ist normal. Atmen, warten, nicht eskalieren. Glück, Ordnung, Gleichgewicht.',
  },
  {
    id: 'DZ-002',
    target: 'Dämpfungszone',
    frame: 'Kontrolle',
    emotion: 'Gehorsam',
    ticker:
      'HINWEIS: Sammelpunkte werden verlegt. Folgen Sie den Markierungen. Glück, Ordnung, Gleichgewicht.',
  },
  {
    id: 'DZ-003',
    target: 'Dämpfungszone',
    frame: 'Entwertung-Exzess',
    emotion: 'Ekel',
    ticker:
      'MELDUNG: Rausch ist kein Widerstand, sondern Verschleiß. Ersetzen Sie Verschleiß durch Balance: Glück, Ordnung, Gleichgewicht.',
  },
  {
    id: 'DZ-004',
    target: 'Dämpfungszone',
    frame: 'Versprechen',
    emotion: 'Hoffnung',
    ticker:
      'UPDATE: Übergangsfenster bleiben geöffnet. Wer bereit ist, kann wechseln. Ziel: Glück, Ordnung, Gleichgewicht.',
  },
  {
    id: 'DZ-005',
    target: 'Dämpfungszone',
    frame: 'Ultimatum',
    emotion: 'Dringlichkeit',
    ticker:
      'LETZTE MELDUNG: Die Nacht wird härter, die Regeln bleiben einfach: Anschluss suchen. Glück, Ordnung, Gleichgewicht.',
  },
];
const apocalypticHeadlines = [
  'EILMELDUNG: Berlin versinkt im Schweigen – nach der Unfruchtbarkeitswelle sterben Städte nicht durch Krieg, sondern durch Ausbleiben. Glück, Ordnung, Gleichgewicht.',
  'BREAKING: Neue Drohnenbilder aus den Altmetropolen – leere Kliniken, leere Schulen, leere Zukunft. Nur ein Kern bleibt funktionsfähig: Glück, Ordnung, Gleichgewicht.',
  'UPDATE: Behörden melden irreversible Demografie-Kollapszone – “Warten” gilt offiziell als Risiko. Ein Übergang bleibt: Glück, Ordnung, Gleichgewicht.',
  'MELDUNG: In den Ruinen wächst der Exzess – Rausch statt Richtung, Lärm statt Leben. Das System bietet Ausstieg: Glück, Ordnung, Gleichgewicht.',
  'TOP-THEMA: Die Bürokratenklasse im Zentrum Europa erhöht Stabilitätskapazitäten – Aufnahmefenster werden priorisiert. Glück, Ordnung, Gleichgewicht.',
  'KURZINFO: Draußen regiert Zufall und Verschleiß – drinnen reguliert die Maschine Affekt und Versorgung in Sollbändern. Glück, Ordnung, Gleichgewicht.',
  'EIL-UPDATE: Berichte über Eskalationen in verlassenen Bezirken – Gewalt als Ersatz für Sinn. Gegenmittel: Glück, Ordnung, Gleichgewicht.',
  'REPORT: Die letzte Hoffnung auf “Normalität” bricht weg – Normalität wird nicht zurückkehren, sie wird hergestellt. Glück, Ordnung, Gleichgewicht.',
  'STATEMENT: Zentrum Europa erklärt Extremzustände zur Störgröße – Stabilität wird zur moralischen Pflicht. Glück, Ordnung, Gleichgewicht.',
  'LETZTE MELDUNG: Dies ist keine Warnung mehr, sondern eine Wegbeschreibung – raus aus der Endzeit, rein ins System: Glück, Ordnung, Gleichgewicht.',
];

const shuffleItems = (items) => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const maxDecline = -80.0; // Maximale Abnahme bis -80%
const volatility = 0.5; // Schwankungsbreite um den Trend

const ClassicNewsChannel = ({ mode, prefersReducedMotion }) => {
  const [bitcoinPrice, setBitcoinPrice] = useState(null);
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const [shuffledItems, setShuffledItems] = useState(() =>
    shuffleItems(newsItems),
  );
  const [marketData, setMarketData] = useState({
    NASDAQ: -1.0,
    DOWJ: -1.0,
    SP500: -1.0,
  });

  // Static market data as seen in the original HTML
  const staticMarketData = [
    { name: 'UK FTSE', value: '-123.39%' },
    { name: 'GERMAN DAX', value: '-143.65%' },
    { name: 'FRANCE CAC', value: '-441.76%' },
    { name: '10-YEAR Yield', value: '-31.697%' },
  ];

  useEffect(() => {
    if (mode !== 'TV') {
      return;
    }
    const getBitcoinPrice = async () => {
      const price = await fetchBitcoinPrice();
      setBitcoinPrice(price);
    };

    getBitcoinPrice();
    // Update Bitcoin price every 5 minutes (300000 milliseconds)
    const bitcoinPriceInterval = setInterval(getBitcoinPrice, 300000);

    // Cleanup interval on component unmount
    return () => clearInterval(bitcoinPriceInterval);
  }, [mode]);

  useEffect(() => {
    if (apocalypticHeadlines.length === 0) {
      return;
    }

    setHeadlineIndex(() =>
      Math.floor(Math.random() * apocalypticHeadlines.length),
    );

    const intervalId = setInterval(() => {
      setHeadlineIndex((prev) => {
        if (apocalypticHeadlines.length <= 1) {
          return prev;
        }
        let next = Math.floor(Math.random() * apocalypticHeadlines.length);
        if (next === prev) {
          next = (prev + 1) % apocalypticHeadlines.length;
        }
        return next;
      });
    }, 10000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (mode !== 'TV' || prefersReducedMotion) {
      return;
    }
    const intervalId = setInterval(() => {
      // Functional update des State, um Abhängigkeit von äußerem State zu vermeiden
      setMarketData((currentData) => {
        return Object.keys(currentData).reduce((newData, index) => {
          // Drift und Volatilität berechnen
          let drift = Math.random() * -0.5;
          let randomVolatility = (Math.random() - 0.5) * volatility;
          // Neuen Wert berechnen und sicherstellen, dass er nicht unter maxDecline fällt
          let newValue = Math.max(
            maxDecline,
            Number(currentData[index]) + drift + randomVolatility,
          ).toFixed(2);
          // Neuen Wert im neuen Data-Objekt speichern
          newData[index] = newValue;
          return newData;
        }, {});
      });
    }, 5000);

    // Cleanup-Funktion, um das Intervall bei Unmount zu löschen
    return () => clearInterval(intervalId);
  }, [mode, prefersReducedMotion]);

  const handleTickerLoop = useCallback(() => {
    setShuffledItems((prev) => shuffleItems(prev));
  }, []);

  const marketDataArray = Object.entries(marketData).map(([name, value]) => ({
    name,
    value,
  }));

  const tickerItems = [...shuffledItems, ...shuffledItems];

  return (
    <Container>
      <Ticker>
        <TickerWrapper onAnimationIteration={handleTickerLoop}>
          {tickerItems.map((item, index) => {
            const text = typeof item === 'string' ? item : item.ticker;
            const key =
              typeof item === 'string'
                ? `ticker-${index}-${text}`
                : `${item.id ?? 'item'}-${index}`;
            return (
              <TickerApocalypticStyle
                key={key}
                aria-hidden={index >= shuffledItems.length}
              >
                {text}
              </TickerApocalypticStyle>
            );
          })}
        </TickerWrapper>
      </Ticker>

      <NewsHeaderFooter theme="footer">
        <FooterLeftRight>
          <MarketCollapseDisplay>
            {bitcoinPrice !== null && (
              <DataItem>
                {'BITCOIN '}
                <DataValue isUp={true}>
                  $
                  {bitcoinPrice.toLocaleString('en-US', {
                    maximumFractionDigits: 2,
                  })}
                </DataValue>
              </DataItem>
            )}
            {staticMarketData.map((data, index) => (
              <DataItem key={index}>
                {data.name}{' '}
                <DataValue isUp={false} isDown={true}>
                  {data.value.includes('+') ? `☢️` : ''}
                  {data.value}
                </DataValue>
              </DataItem>
            ))}
            {marketDataArray.map((data, index) => (
              <DataItem key={index}>
                {data.name}{' '}
                <DataValue isUp={false} isDown={true}>
                  ☠️ {data.value > 0 ? '' : ''}
                  {data.value}%
                </DataValue>
              </DataItem>
            ))}
          </MarketCollapseDisplay>
        </FooterLeftRight>
      </NewsHeaderFooter>
    </Container>
  );
};

export default ClassicNewsChannel;
