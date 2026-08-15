# Session View: technische Dokumentation

Stand: 2026-08-12

Diese Doku beschreibt die aktuelle Session View im Frontend: welche Dateien beteiligt sind, wie die View laedt, sucht, sortiert, erstellt, aktualisiert und loescht, und welche Backend-Proxies sie nutzt.

## Kurzueberblick

Die Session View ist die private Archivansicht unter `/session`. Sie rendert alle Sessions als lesbare Karten, bietet Suche, Sortierung, Schreibaktivitaets-Heatmap, Create-Form, Inline-Metadatenbearbeitung, Kopieren, Loeschen und den Sprung in den Editor.

Der Einstieg ist:

```txt
app/session/page.tsx
  -> components/SessionView/SessionView.tsx
      -> components/SessionView/useSessionData.ts
      -> components/SessionView/SessionActivityOverview.tsx
      -> components/SessionView/SessionItem.tsx
```

Die View selbst spricht nicht direkt mit dem externen Typewriter-Backend. Sie ruft lokale Next.js-API-Routen unter `/api/...` auf. Diese Routen leiten ueber `lib/server/apiProxy.ts` an das externe Backend weiter und fuegen serverseitig den API-Key an.

## Beteiligte Frontend-Dateien

### `app/session/page.tsx`

Next.js-App-Router-Page fuer `/session`.

Aufgaben:

- importiert `SessionView`
- setzt Metadata (`title`, `description`)
- rendert die Session View als Seiteninhalt

Hinweis: Der Kommentar nennt noch `app/typewriter/page.tsx`, die Datei liegt aber tatsaechlich unter `app/session/page.tsx`.

### `components/SessionView/SessionView.tsx`

Hauptkomponente der Archivansicht.

Aufgaben:

- verwaltet UI-State fuer Suche, Sortierung und Create-Form
- ruft `useSessionData` mit `pageSize: 40` auf
- aktiviert Auto-Prefetch nur, wenn keine Suche aktiv ist
- rendert Header, Suchfeld, Sortierung, Heatmap, Create-Form, Refresh-Button, Session-Liste und Footer-Pagination
- sortiert die bereits geladenen Sessions clientseitig
- refresht die Heatmap nach Create/Delete ueber `activityRefreshKey`

Wichtige States:

```ts
search
deferredSearch
sortBy // newest | oldest | words | letters | random
randomSeed
newTitle
newText
newTags
createError
activityRefreshKey
```

Sortierung:

- `newest`: neueste `created_at` zuerst
- `oldest`: aelteste `created_at` zuerst
- `words`: absteigend nach `word_count`
- `letters`: absteigend nach `letter_count`
- `random`: stabile Zufallssortierung pro Seed; `Neu mischen` setzt neuen Seed

Create-Form:

- `text` ist Pflicht
- `title` ist optional
- `tags` werden per Komma getrennt, getrimmt und leere Werte werden entfernt
- neue Sessions werden mit `status: "draft"` erstellt
- nach erfolgreichem Erstellen wird das Formular geleert und die Heatmap neu geladen
- falls gerade gesucht wird, wird die Suche geleert

### `components/SessionView/useSessionData.ts`

Client-Hook fuer Datenzugriff, Caching, Paging, Suche, Create/Update/Delete und Loading-State.

Aufgaben:

- baut API-URLs relativ zu `NEXT_PUBLIC_API_BASE_URL` oder `/api`
- laedt Listen-Seiten ueber `GET /sessions/full`
- sucht ueber `GET /sessions/search`
- hydriert fehlenden Volltext per `GET /sessions/{id}`
- erstellt Sessions per `POST /sessions`
- aktualisiert Metadaten per `PATCH /sessions/{id}`
- loescht Sessions per `DELETE /sessions/{id}`
- verwaltet Cursor-/Token-Pagination
- bricht laufende Requests mit `AbortController` ab
- merged Sessions in einer `Map<number, Session>` nach ID
- merkt Volltext-Sessions separat in `fullSessionsRef`
- nutzt `useTransition`, damit grosse Listen weniger hart rendern
- kann im Listenmodus automatisch weitere Seiten vorladen

Optionen:

```ts
type UseSessionDataOptions = {
  pageSize?: number;
  prefetchDelayMs?: number;
  autoPrefetch?: boolean;
  searchQuery?: string;
};
```

Aktuelle Nutzung in `SessionView`:

```ts
useSessionData({
  pageSize: 40,
  prefetchDelayMs: 0,
  autoPrefetch: !isSearching,
  searchQuery: deferredSearch,
});
```

Das bedeutet: Im normalen Listenmodus werden weitere Seiten praktisch sofort im Hintergrund nachgeladen. Im Suchmodus ist Auto-Prefetch deaktiviert; weitere Treffer kommen ueber den Button `Weitere Sessions laden`.

### `components/SessionView/SessionItem.tsx`

Karte fuer eine einzelne Session.

Aufgaben:

- zeigt Titel, Status, Tags, Datum, Wort-/Zeichen-/Buchstabenzaehlen und Lesezeit
- erlaubt Inline-Titelbearbeitung
- erlaubt Statuswechsel
- erlaubt Tags hinzufuegen/entfernen
- kopiert den Volltext in die Zwischenablage
- navigiert mit `router.push('/session/edit?active={id}')` in den Editor
- loescht Sessions mit zweistufiger Bestaetigung
- berechnet optionale Textanalyse und Markierungen

Analyse:

- Analyse ist initial ausgeschaltet
- bei aktivierter Analyse wird `computeAnalysis(displayText)` ausgefuehrt
- Tokenisierung erfolgt ueber `splitPreservingWhitespace`
- Wortklassifikation erfolgt ueber `classifyWord`
- Klassen fuer Highlights:
  - `analysis-verb`
  - `analysis-noun`
  - `analysis-adverb`
  - `analysis-nominal`
  - `analysis-deadverb`
  - `analysis-passive`
  - `analysis-long-sentence`

Wenn kein Volltext vorhanden ist, zeigt die Karte `Volltext wird geladen...` und deaktiviert die Markierungsfunktion.

### `components/SessionView/SessionActivityOverview.tsx`

GitHub-aehnliche Heatmap fuer Schreibaktivitaet.

Aufgaben:

- laedt `GET /api/v1/writing-activity?days=365`
- zeigt aggregierte Werte fuer Woerter, aktive Tage, Serie und Sessions
- rendert eine 7-Zeilen-Wochenmatrix mit Monatslabels
- bildet `days[].level` auf Farbintensitaeten von 0 bis 4 ab
- baut Tooltips mit Woertern, Sessionzahl, Quelle, manuellen Inserts/Deletes, Actions und Saves
- bricht Requests nach 10 Sekunden ab

Props:

```ts
type SessionActivityOverviewProps = {
  days?: number;       // Default 365
  refreshKey?: number; // erzwingt Reload bei Aenderung
};
```

### `components/SessionView/types.ts`

Lokale Typen fuer die Session View.

Wichtig:

- `Session` ist bewusst tolerant und erlaubt optionale Felder wie `preview`, `text_preview`, `document_id`, `current_version_id`, `version_count`, `parent_id`
- Pagination-Typen akzeptieren mehrere Backend-Varianten (`next_page_token`, `nextPageToken`, `next_cursor`, `cursor`, `has_more`, `hasMore`)
- `SessionSearchMatch` beschreibt Trefferobjekte aus der Suche, falls der Search-Endpoint keine vollen Session-Payloads liefert

### `components/SessionView/SessionList.tsx`

Aktuell vorhandene, aber in `SessionView.tsx` nicht verwendete Listenkomponente.

Sie rendert eine kompaktere Button-Liste mit Auswahlzustand und Teaser. Sie scheint ein aelterer oder alternativer Baustein zu sein.

### `components/SessionView/codebase.export.jsonl`

Export/Snapshot einer frueheren SessionView-Codebasis. Wird von der laufenden App nicht importiert.

### `components/SessionView.zip`

Zip-Artefakt der SessionView. Wird von der laufenden App nicht importiert.

## Beteiligte API-/Server-Dateien

### `middleware.ts`

Schuetzt die private Session View und zugehoerige APIs.

Matcher:

```ts
'/session/:path*'
'/api/sessions/:path*'
'/api/documents/:path*'
'/api/notes/:path*'
'/api/analysis-runs/:path*'
'/api/v1/:path*'
```

Login-Ausnahmen:

- `/session/login`
- `/api/session-auth/*`

Auth-Mechanik:

- Cookie: `session_view_auth`
- Token: `base64url(payload).hmacSignature`
- Signatur: HMAC-SHA-256
- Ablauf: wird im Payload als `exp` gespeichert
- Secret: `SESSION_AUTH_SECRET` oder Fallback `SESSION_AUTH_PASSWORD`

Wenn kein Secret/Passwort konfiguriert ist:

- Seitenantwort: `503 SESSION_AUTH_PASSWORD fehlt.`
- API-Antwort: JSON mit `missing_session_auth_password`

### `app/session/login/page.tsx`

Client-Loginseite fuer die Session View.

Aufgaben:

- liest optional `next` aus Query-Parametern
- sendet Passwort an `POST /api/session-auth/login`
- navigiert nach Erfolg zu `next` oder `/session`

### `app/api/session-auth/login/route.ts`

Setzt das private Auth-Cookie.

Details:

- erwartet JSON `{ "password": "..." }`
- prueft gegen `SESSION_AUTH_PASSWORD`
- erzeugt ein signiertes Cookie fuer 7 Tage
- Cookie ist `httpOnly`, `sameSite: "lax"`, `path: "/"`
- `secure` ist nur in Production aktiv

### `app/api/session-auth/logout/route.ts`

Loescht das Auth-Cookie durch `maxAge: 0`.

### `lib/server/apiProxy.ts`

Zentraler Proxy fuer lokale API-Routen.

Aufgaben:

- waehlt ein Upstream-Ziel (`typewriter` oder `writer`)
- baut die Upstream-URL mit Prefix
- fuegt den passenden `x-api-key` Header ein
- entfernt problematische Response-Header wie `set-cookie`, `content-encoding`, `content-length`, `transfer-encoding`
- unterstuetzt optionales Timeout per `AbortController`
- gibt Upstream-Status und Body transparent weiter

Typewriter-Konfiguration:

```txt
Base URL:
EXTERNAL_API_BASE_URL
TYPEWRITER_API_BASE_URL
NEXT_PUBLIC_API_BASE_URL
Fallback: https://api.ambrecht.de

API-Key:
TYPEWRITER_API_KEY
API_KEY
NEXT_PUBLIC_API_KEY

Path Prefix: /api/v1
```

Writer-Konfiguration:

```txt
Base URL:
WRITER_MVP_API_BASE_URL
WRITER_API_BASE_URL
NEXT_PUBLIC_WRITER_API_BASE_URL
Fallback: http://writer.ambrecht.de

API-Key:
WRITER_MVP_API_KEY
WRITER_API_KEY
NLP_API_KEY
Fallback: Typewriter API-Key

Path Prefix: /v1
```

### `app/api/sessions/route.ts`

Lokaler Proxy fuer:

- `GET /api/sessions` -> Upstream `GET /api/v1/sessions`
- `POST /api/sessions` -> Upstream `POST /api/v1/sessions`

Die aktuelle Session View nutzt `POST /api/sessions` fuer das Erstellen neuer Sessions. Die normale Listenansicht nutzt inzwischen `GET /api/sessions/full`, nicht `GET /api/sessions`.

### `app/api/sessions/full/route.ts`

Lokaler Proxy fuer:

```http
GET /api/sessions/full
```

Upstream:

```http
GET /api/v1/sessions/full
```

Die Session View nutzt diesen Endpoint fuer den normalen Listenmodus, weil er vollstaendige Sessiontexte in stabilen Batches liefern soll.

### `app/api/sessions/search/route.ts`

Lokaler Proxy fuer:

```http
GET /api/sessions/search
```

Upstream:

```http
GET /api/v1/sessions/search
```

Die Session View sendet:

```txt
q=<Suchstring>
page_size=40
page_token=<optional>
fields=text,title,tags
```

Der Hook kann sowohl volle Session-Payloads als auch reine Trefferobjekte verarbeiten. Bei Trefferobjekten wird der Volltext ueber `GET /api/sessions/{id}` nachgeladen.

### `app/api/sessions/[id]/route.ts`

Lokaler Proxy fuer:

- `GET /api/sessions/{id}`
- `PATCH /api/sessions/{id}`
- `DELETE /api/sessions/{id}`

Nutzung in der Session View:

- `GET`: Fallback-Hydrierung, falls Listen-/Suchpayload keinen Volltext enthaelt
- `PATCH`: Titel, Status und Tags aktualisieren
- `DELETE`: Session in den Papierkorb verschieben bzw. upstream loeschen, abhaengig von Backend-Semantik

### `app/api/v1/writing-activity/route.ts`

Lokaler Proxy fuer die Heatmap:

```http
GET /api/v1/writing-activity?days=365
```

Wichtig: Diese Route setzt `target: "typewriter"` und `timeoutMs: 8000`. Die Client-Komponente hat zusaetzlich einen eigenen 10-Sekunden-Abbruch.

## Datenfluss: initiales Laden

1. Benutzer oeffnet `/session`.
2. `middleware.ts` prueft `session_view_auth`.
3. Ohne gueltiges Cookie erfolgt Redirect nach `/session/login?next=/session`.
4. Nach Login rendert `app/session/page.tsx` die `SessionView`.
5. `SessionView` initialisiert `useSessionData` mit `pageSize: 40`.
6. `useSessionData` ruft beim Mount `refreshSessions()` auf.
7. Ohne Suchquery wird `modeRef.current = "list"` gesetzt.
8. Der Hook ruft `fetchListPage(null, false)` auf.
9. Request geht an `/api/sessions/full?page_size=40`.
10. Lokale Route proxyt nach `/api/v1/sessions/full`.
11. Payloads werden ueber `normalizeSession` vereinheitlicht.
12. Falls `text` fehlt, wird pro Session `GET /api/sessions/{id}` nachgezogen.
13. Sessions werden in `byIdRef` gemerged und in React-State uebernommen.
14. Pagination wird normalisiert.
15. Wenn `has_more`/`next_page_token`/`total` weitere Daten signalisieren und Auto-Prefetch aktiv ist, laedt der Hook weitere Seiten nach.

## Datenfluss: Suche

1. Der Suchinput schreibt in `search`.
2. `useDeferredValue(search)` liefert `deferredSearch`.
3. Sobald `deferredSearch.trim()` nicht leer ist, wird `autoPrefetch` deaktiviert.
4. `useSessionData` erkennt die geaenderte Query und ruft `refreshSessions()` auf.
5. Der Hook setzt `modeRef.current = "search"`.
6. Request geht an `/api/sessions/search?q=...&page_size=40&fields=text,title,tags`.
7. Falls der Search-Endpoint volle Sessions liefert, werden diese direkt normalisiert.
8. Falls er Trefferobjekte mit `session_id` liefert, wird pro Treffer `GET /api/sessions/{id}` nachgeladen.
9. Weitere Suchseiten werden nur ueber `loadMore()` geladen.

## Datenfluss: Session erstellen

1. Benutzer schreibt Text in das Create-Form.
2. `handleCreateSession` validiert, dass `newText.trim()` nicht leer ist.
3. Tags werden aus dem Kommafeld gebaut.
4. `createSession` sendet `POST /api/sessions`.
5. Body enthaelt mindestens `{ text }`, optional `title`, `status`, `tags`.
6. Antwort wird normalisiert und in `byIdRef` eingefuegt.
7. React-State wird aktualisiert.
8. Pagination-`total` wird erhoeht, falls vorhanden.
9. Formular wird geleert, Heatmap-Refresh-Key erhoeht.

## Datenfluss: Session aktualisieren

Aktualisiert werden aktuell nur Metadaten:

- `title`
- `status`
- `tags`

Ablauf:

1. `SessionItem` ruft `onUpdate(id, payload)` auf.
2. `useSessionData.updateSession` filtert undefinierte Felder heraus.
3. `PATCH /api/sessions/{id}` wird gesendet.
4. Antwort wird normalisiert.
5. Bestehende Sessiondaten werden mit der Antwort gemerged.
6. Session-State wird neu gesetzt.

Der Volltext wird in dieser View nicht inline editiert. Dafuer navigiert der Button `Bearbeiten` zu `/session/edit?active={id}`.

## Datenfluss: Session loeschen

1. Erster Klick auf den Papierkorb setzt `confirmDelete = true`.
2. Der Button zeigt `Bestaetigen`.
3. Zweiter Klick ruft `onDelete(id)` auf.
4. `useSessionData.deleteSession` sendet `DELETE /api/sessions/{id}`.
5. Erfolgreich ist entweder HTTP 204 oder ein JSON-Body mit `success: true`.
6. Die Session-ID wird aus `byIdRef` entfernt.
7. `sessions`, `pagination.total` und `searchPage.total` werden lokal reduziert.
8. `activityRefreshKey` wird erhoeht, damit die Heatmap neu laedt.

## Datenmodell der View

```ts
interface Session {
  id: number;
  document_id?: number | null;
  title?: string | null;
  text?: string;
  preview?: string;
  text_preview?: string;
  created_at: string;
  updated_at?: string;
  word_count?: number;
  char_count?: number;
  letter_count?: number;
  status?: 'draft' | 'in_progress' | 'revised' | 'final';
  tags?: string[];
  current_version_id?: number | null;
  version_count?: number;
  parent_id?: number | null;
}
```

Normalisierung:

- `id` wird zu `Number(entry.id)`
- `preview` wird aus `entry.preview ?? entry.text_preview` gebildet
- `text_preview` faellt auf `preview` zurueck
- `tags` faellt auf `[]` zurueck
- `status` faellt auf `"draft"` zurueck

Wichtig: Die Karten rendern `session.text` als kanonischen Volltext. `preview` und `text_preview` sind nur Fallback-/Kompatibilitaetsfelder und werden nicht als sichtbarer Haupttext benutzt.

## Pagination und Prefetch

Die View unterstuetzt verschiedene Backend-Pagination-Formate:

- `next_page_token`
- `nextPageToken`
- `next_cursor`
- `cursor`
- `has_more`
- `hasMore`
- `total`

Listenmodus:

- Endpoint: `/api/sessions/full`
- Query: `page_size`, optional `page_token`, optional `offset` als Fallback
- Auto-Prefetch ist aktiv, solange keine Suche laeuft
- bei unsichtbarem Dokument (`document.visibilityState === "hidden"`) wird Prefetch verschoben

Suchmodus:

- Endpoint: `/api/sessions/search`
- Query: `q`, `page_size`, optional `page_token`, `fields`
- Auto-Prefetch ist aus
- weitere Seiten nur per Button

## UI-Zustaende

Der Hook liefert:

```ts
sessions
pagination
searchPage
hasMore
isLoading
isLoadingMore
isCreating
isUpdating
deletingSessionIds
isPending
error
refreshSessions
loadMore
createSession
updateSession
deleteSession
```

Die View zeigt:

- `Lade Sessions...`, wenn initial geladen wird und noch keine Sessions da sind
- `Keine Sessions gefunden.`, wenn nach Laden/Filtern keine Eintraege da sind
- Fehlerbanner bei `error`
- Treffer-/Eintragszaehler unten
- `Weitere Sessions laden`, wenn `hasMore` true ist

## Beziehung zum Editor

Die Archivkarten haben einen `Bearbeiten`-Button. Dieser navigiert zu:

```txt
/session/edit?active=<session-id>
```

Die Editor-Datei ist:

```txt
app/session/edit/page.tsx
```

Der Editor ist eine eigene Client-Page und nicht Teil der SessionView-Komponenten. Er nutzt `lib/api/typewriterClient.ts`, insbesondere:

- `getSession`
- `getDocumentVersions`
- `createEdit`

Die Session View selbst bearbeitet keinen Volltext; sie erstellt nur neue Sessions und pflegt Metadaten bestehender Sessions.

## CSS-/Styling-Abhaengigkeiten

Die Komponenten nutzen Tailwind-Klassen direkt im JSX. Fuer Analysemarkierungen werden CSS-Klassen wie `analysis-verb`, `analysis-noun`, `analysis-adverb`, `analysis-nominal`, `analysis-deadverb`, `analysis-passive` und `analysis-long-sentence` erwartet. Diese Klassen muessen global definiert sein, damit Markierungen sichtbar werden.

Icons kommen aus `lucide-react`, unter anderem:

- `Search`
- `Filter`
- `FilePlus2`
- `X`
- `MoreHorizontal`
- `Edit3`
- `Copy`
- `Sparkles`
- `Trash2`
- `LockKeyhole`

## Bekannte Auffaelligkeiten

- In mehreren sichtbaren Strings sind Encoding-Artefakte enthalten, z.B. falsch decodierte Varianten von `Aelteste`, `Woerter`, `Ueberarbeitet` oder `Pruefe`. Das betrifft Anzeige-Texte, nicht die Datenlogik.
- `SessionList.tsx` ist vorhanden, wird aber aktuell nicht in der Haupt-SessionView verwendet.
- `components/SessionView/codebase.export.jsonl` und `components/SessionView.zip` sind Artefakte und keine Runtime-Abhaengigkeiten.
- Der Button `Mehr` am Listenende hat aktuell keine weitere Funktion ausser Darstellung.
- `disableActions={isUpdating}` blockiert waehrend irgendeines Updates die Aktionen aller Karten, nicht nur der betroffenen Session.
- Suche hydriert Trefferobjekte einzeln per `GET /sessions/{id}`, falls der Search-Endpoint keine Volltexte liefert. Bei vielen Treffern kann das viele Requests erzeugen.
- `prefetchDelayMs: 0` bedeutet sehr aggressives Nachladen im normalen Listenmodus.
- `createSession` fuegt neue Sessions lokal in die Map ein; die sichtbare Position ergibt sich danach durch die aktuelle clientseitige Sortierung.

## Schnelle Dateiuebersicht

```txt
app/session/page.tsx
app/session/login/page.tsx
app/session/edit/page.tsx
app/api/session-auth/login/route.ts
app/api/session-auth/logout/route.ts
app/api/sessions/route.ts
app/api/sessions/full/route.ts
app/api/sessions/search/route.ts
app/api/sessions/[id]/route.ts
app/api/v1/writing-activity/route.ts
components/SessionView/SessionView.tsx
components/SessionView/useSessionData.ts
components/SessionView/SessionItem.tsx
components/SessionView/SessionActivityOverview.tsx
components/SessionView/SessionList.tsx
components/SessionView/types.ts
lib/server/apiProxy.ts
lib/textAnalysis.ts
hooks/useCopyToClipboard.ts
middleware.ts
```
