'use client';

import { useMemo, useState } from 'react';
import { ExternalLink, Search, Star } from 'lucide-react';
import type { GptAgent } from './types';
import { filterGpts, getAllTags } from './search';

type GptDirectoryProps = {
  gpts: readonly GptAgent[];
};

const visibilityLabel: Record<GptAgent['visibility'], string> = {
  private: 'Privat',
  link: 'Link',
  public: 'Public',
};

export function GptDirectory({ gpts }: GptDirectoryProps) {
  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = useMemo(() => getAllTags(gpts), [gpts]);
  const visibleGpts = useMemo(
    () => filterGpts(gpts, query, activeTag),
    [activeTag, gpts, query],
  );

  return (
    <section className="mx-auto min-h-screen w-full max-w-7xl py-12 text-zinc-950 dark:text-zinc-50 sm:py-16">
      <div className="mb-10 max-w-3xl">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
          GPT-Agenten
        </p>
        <h1 className="text-4xl font-semibold leading-tight text-zinc-950 dark:text-white sm:text-6xl">
          Deine Custom GPTs, schnell gefunden.
        </h1>
        <p className="mt-5 text-lg leading-8 text-zinc-600 dark:text-zinc-300">
          Eine statische, manuell gepflegte Übersicht für deine wichtigsten
          ChatGPT-Agenten.
        </p>
      </div>

      <div className="mb-8 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm shadow-zinc-200/60 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-black/20 sm:p-5">
        <div className="relative">
          <label htmlFor="gpt-search" className="sr-only">
            GPT-Agenten durchsuchen
          </label>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400"
          />
          <input
            id="gpt-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nach Name, Beschreibung, Tag oder Sichtbarkeit suchen"
            className="w-full rounded-md border border-zinc-200 bg-zinc-50 py-3 pl-12 pr-4 text-base text-zinc-950 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/15 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-emerald-400 dark:focus:bg-zinc-950"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2" aria-label="Tag-Filter">
          <button
            type="button"
            aria-pressed={activeTag === null}
            onClick={() => setActiveTag(null)}
            className="rounded-full border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-50 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 aria-pressed:border-emerald-600 aria-pressed:bg-emerald-50 aria-pressed:text-emerald-800 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-900 dark:aria-pressed:border-emerald-400 dark:aria-pressed:bg-emerald-400/10 dark:aria-pressed:text-emerald-200"
          >
            Alle
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              aria-pressed={activeTag === tag}
              onClick={() => setActiveTag((currentTag) => (currentTag === tag ? null : tag))}
              className="rounded-full border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-50 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 aria-pressed:border-emerald-600 aria-pressed:bg-emerald-50 aria-pressed:text-emerald-800 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-900 dark:aria-pressed:border-emerald-400 dark:aria-pressed:bg-emerald-400/10 dark:aria-pressed:text-emerald-200"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <p className="mb-5 text-sm text-zinc-600 dark:text-zinc-400" aria-live="polite">
        {visibleGpts.length} von {gpts.length} GPTs gefunden
      </p>

      {visibleGpts.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visibleGpts.map((gpt) => (
            <li key={gpt.id} className="min-w-0">
              <a
                href={gpt.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full min-h-[17rem] flex-col rounded-lg border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-200/60 transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-900/10 focus:outline-none focus:ring-4 focus:ring-emerald-500/25 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-black/20 dark:hover:border-emerald-500/60"
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-semibold leading-snug text-zinc-950 dark:text-white">
                        {gpt.name}
                      </h2>
                      {gpt.favorite ? (
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-300/15 dark:text-amber-200">
                          <span className="sr-only">Favorit</span>
                          <Star aria-hidden="true" className="h-4 w-4 fill-current" />
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                      {visibilityLabel[gpt.visibility]}
                    </p>
                  </div>
                  <ExternalLink
                    aria-hidden="true"
                    className="mt-1 h-5 w-5 shrink-0 text-zinc-400 transition group-hover:text-emerald-600 dark:group-hover:text-emerald-300"
                  />
                </div>

                <p className="flex-1 text-base leading-7 text-zinc-600 dark:text-zinc-300">
                  {gpt.description}
                </p>

                <div className="mt-5 flex flex-wrap gap-2" aria-label={`Tags für ${gpt.name}`}>
                  {gpt.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-6 py-12 text-center dark:border-zinc-700 dark:bg-zinc-900/60">
          <h2 className="text-xl font-semibold text-zinc-950 dark:text-white">
            Keine GPTs gefunden
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-zinc-600 dark:text-zinc-400">
            Passe die Suche oder den aktiven Tag-Filter an, um wieder Treffer zu sehen.
          </p>
        </div>
      )}
    </section>
  );
}
