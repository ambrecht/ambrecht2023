This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Content

- Struktur: `content/<locale>/nav.json`, `content/<locale>/footer.json`, `content/<locale>/pages/*.json` (derzeit `vision`, `process`, `start`), `content/<locale>/sympathyTest.json`. Weitere Locale per zusätzlichem Ordner ergänzbar.
- Loader: `src/content/loader.ts` (server-only, `cache` + `zod`-Validierung). Server Components laden gezielt `getNavContent`, `getFooterContent`, `getVisionPageContent`, `getProcessPageContent` und reichen Props an Client Components weiter.
- Schemas/Typen: `src/content/schemas.ts`. Falls du neue Felder hinzufügst, Schema anpassen und JSON darauf ausrichten.
- Usage-Beispiel:
  ```ts
  const nav = await getNavContent('de');
  <Navigation content={nav} />
  ```
  (Bitte keine JSON-Imports direkt in Client Components.)
- Markdown: Blog-/MD-Inhalte bleiben als `.md` bestehen und werden serverseitig geladen (kein Client-Markdown-Parser).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
