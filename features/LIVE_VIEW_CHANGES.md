# Live View Redesign

Geändert: `live/components/reading-live-reader.tsx`

## UX-Richtung
- fester Lesehorizont bei 72 % der nutzbaren Textbühne
- typografische Lesebreite begrenzt (`min(72vw, 27ch)`)
- Vergangenheit stufenweise leiser, Gegenwart dominant
- Zeitmarken nur bei Minutenwechsel innerhalb des sichtbaren Fensters
- Reaktionen als leise Spur; Zähler erst bei Hover/Fokus
- Navigation-Rail im Lesemodus praktisch unsichtbar
- kompakter Live-Status und deutlich ruhigere Utility-Chrome
- `Zurück zu Live` direkt am Horizont
- Arrow Up/Down + Page Up/Down + End
- sichtbare Zeilenzahl wird aus der tatsächlichen Horizon-Geometrie berechnet

## Validierung
Die geänderte TSX-Datei wurde mit TypeScript `transpileModule` auf Syntax/JSX validiert.
Ein vollständiger Projekt-Build war mit dem isolierten `live.zip` nicht möglich, da package.json,
React-/Next-/Tailwind-Konfiguration und externe Dependencies nicht Teil des Uploads sind.
