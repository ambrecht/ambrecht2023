# Session View 2 Umsetzung

Stand: 2026-08-12

Session View 2 ist als paralleles UX-Experiment umgesetzt und ersetzt die bestehende Session View nicht. Die aktuelle Ausrichtung ist ein vollstaendig gerendertes literarisches Archiv: Sessions stehen als Volltexte direkt untereinander, damit native Browser-Suche ueber das Archiv moeglich bleibt.

## Einstiege

- Bestehende View: `/session`
- Neue View: `/session-v2`
- Aktivitaet in V2: `/session-v2/activity`
- Session-Anker in V2: `/session-v2#session-{sessionId}`
- Bearbeiten aus V2: `/session/edit?active={sessionId}`

## Wiederverwendete Funktionen

- Sessiondaten: bestehende lokale API-Routen unter `/api/sessions/...`
- Archivladen/Suche/Paging: `components/SessionView/useSessionData.ts`
- Aktivitaets-Heatmap: `components/SessionView/SessionActivityOverview.tsx`
- Versionen: der alte V2-Reader bleibt fuer direkte alte Links vorhanden, ist aber nicht mehr der zentrale Lesefluss
- Edit-Uebergang: bestehender Editor unter `/session/edit`
- Auth: bestehende Cookie-/Middleware-Logik, erweitert auf `/session-v2`

## Grenzen

- Es wurde kein neues Datenmodell eingefuehrt.
- Es gab keine Migrationen.
- Originalschutz wird nur sichtbar gemacht, soweit vorhandene Dokumentversionen oder Parent-Ketten das heute abbilden.
- Es gibt bewusst noch keinen komplexen Diff-Viewer.
- Das Archiv enthaelt keine Analysemarkierungen und keinen Inline-Volltexteditor.
- Vollstaendiges Rendering aller Sessions kann bei sehr grossem Archiv spaeter Performancekosten erzeugen. Diese Version priorisiert Ctrl+F und Volltext-DOM.
