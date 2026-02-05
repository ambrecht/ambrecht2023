# ERR_INVALID_URL (WebSocket upgrade)

Dieser Fehler kommt vom Node URL Parser. In dieser Codebase wird er im WebSocket upgrade fuer
Live-Sessions ausgeloest.

## Ort
- Source: src/modules/livesession/livesession.gateway.ts (startLiveGateway -> new URL(...))
- Runtime build output: dist/modules/livesession/livesession.gateway.js

## Trigger
- req.url ist leer oder ungueltig (z.B. '*', Leerzeichen oder kaputtes percent-encoding).
- req.headers.host fehlt oder ist ungueltig (z.B. Proxy entfernt oder verfaelscht Host header).

## Effekt
- WebSocket upgrade wird abgelehnt und die Verbindung geschlossen.
- Logs zeigen: TypeError [ERR_INVALID_URL]: Invalid URL

## Diagnose
- Eingehende Upgrade headers (Host) und URL erfassen.
- Client muss eine volle ws(s) URL mit dem erwarteten Pfad nutzen.
- Falls Proxy davor steht, pruefen dass Host header fuer WS upgrades weitergegeben wird.

## Fixes
- Proxy so konfigurieren, dass Host fuer WS upgrades durchgereicht wird (Nginx: proxy_set_header Host $host;).
- Clients muessen /api/v1/live-sessions/{id}/stream mit gueltigem Host nutzen.
- Optional: Code haerten, z.B. sichere base URL wenn Host fehlt.
