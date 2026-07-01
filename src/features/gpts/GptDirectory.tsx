'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { ExternalLink, Plus, Search, Star, Trash2 } from 'lucide-react';
import type { GptAgent, GptVisibility } from './types';
import { filterGpts, getAllTags } from './search';

type GptDirectoryProps = {
  gpts: readonly GptAgent[];
};

type CustomGptForm = {
  name: string;
  url: string;
  description: string;
  tags: string;
  visibility: GptVisibility;
  iconUrl: string;
};

const visibilityLabel: Record<GptAgent['visibility'], string> = {
  private: 'Privat',
  link: 'Link',
  public: 'Public',
};

const customGptsStorageKey = 'ambrecht:gpts:custom';

const emptyForm: CustomGptForm = {
  name: '',
  url: '',
  description: '',
  tags: '',
  visibility: 'private',
  iconUrl: '',
};

const isChatGptUrl = (value: string): value is GptAgent['url'] =>
  /^https:\/\/(chatgpt\.com|chat\.openai\.com)\/g\/.+/i.test(value);

const createCustomId = () =>
  `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export function GptDirectory({ gpts }: GptDirectoryProps) {
  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [customGpts, setCustomGpts] = useState<GptAgent[]>([]);
  const [form, setForm] = useState<CustomGptForm>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedGpts = window.localStorage.getItem(customGptsStorageKey);

      if (storedGpts) {
        setCustomGpts(JSON.parse(storedGpts));
      }
    } catch {
      setCustomGpts([]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(customGptsStorageKey, JSON.stringify(customGpts));
  }, [customGpts]);

  const allGpts = useMemo(() => [...customGpts, ...gpts], [customGpts, gpts]);
  const allTags = useMemo(() => getAllTags(allGpts), [allGpts]);
  const visibleGpts = useMemo(
    () => filterGpts(allGpts, query, activeTag),
    [activeTag, allGpts, query],
  );

  const handleAddGpt = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = form.name.trim();
    const url = form.url.trim();
    const description = form.description.trim();
    const iconUrl = form.iconUrl.trim();
    const tags = form.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    if (!name || !url) {
      setFormError('Name und GPT-Link sind Pflichtfelder.');
      return;
    }

    if (!isChatGptUrl(url)) {
      setFormError('Bitte verwende einen ChatGPT-GPT-Link, der mit https://chatgpt.com/g/ beginnt.');
      return;
    }

    if (iconUrl && !/^https?:\/\//i.test(iconUrl)) {
      setFormError('Das Icon muss eine vollstaendige URL sein.');
      return;
    }

    setCustomGpts((currentGpts) => [
      {
        id: createCustomId(),
        name,
        description: description || `${name}: eigener ChatGPT-Agent.`,
        url,
        tags: tags.length > 0 ? tags : ['Eigene GPTs'],
        visibility: form.visibility,
        ...(iconUrl ? { iconUrl } : {}),
      },
      ...currentGpts,
    ]);
    setForm(emptyForm);
    setFormError(null);
  };

  const handleRemoveCustomGpt = (id: string) => {
    setCustomGpts((currentGpts) => currentGpts.filter((gpt) => gpt.id !== id));
  };

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
          Eine aktuelle Uebersicht fuer deine ChatGPT-Agenten mit Suche, Tags und eigenen Eintraegen.
        </p>
      </div>

      <form
        onSubmit={handleAddGpt}
        className="mb-8 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm shadow-zinc-200/60 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-black/20 sm:p-5"
      >
        <div className="mb-4 flex items-center gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200">
            <Plus aria-hidden="true" className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">
              GPT-Agent hinzufuegen
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Eigene Eintraege werden lokal in diesem Browser gespeichert.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Name
            </span>
            <input
              value={form.name}
              onChange={(event) =>
                setForm((currentForm) => ({ ...currentForm, name: event.target.value }))
              }
              className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-zinc-950 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/15 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              GPT-Link
            </span>
            <input
              value={form.url}
              onChange={(event) =>
                setForm((currentForm) => ({ ...currentForm, url: event.target.value }))
              }
              placeholder="https://chatgpt.com/g/..."
              className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-zinc-950 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/15 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Beschreibung
            </span>
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm((currentForm) => ({ ...currentForm, description: event.target.value }))
              }
              rows={3}
              className="w-full resize-y rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-zinc-950 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/15 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Tags
            </span>
            <input
              value={form.tags}
              onChange={(event) =>
                setForm((currentForm) => ({ ...currentForm, tags: event.target.value }))
              }
              placeholder="Schreiben, Code, Recherche"
              className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-zinc-950 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/15 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Icon-URL
            </span>
            <input
              value={form.iconUrl}
              onChange={(event) =>
                setForm((currentForm) => ({ ...currentForm, iconUrl: event.target.value }))
              }
              placeholder="https://..."
              className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-zinc-950 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/15 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2" aria-label="Sichtbarkeit">
            {(['private', 'link', 'public'] as const).map((visibility) => (
              <button
                key={visibility}
                type="button"
                aria-pressed={form.visibility === visibility}
                onClick={() => setForm((currentForm) => ({ ...currentForm, visibility }))}
                className="rounded-full border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-50 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 aria-pressed:border-emerald-600 aria-pressed:bg-emerald-50 aria-pressed:text-emerald-800 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-900 dark:aria-pressed:border-emerald-400 dark:aria-pressed:bg-emerald-400/10 dark:aria-pressed:text-emerald-200"
              >
                {visibilityLabel[visibility]}
              </button>
            ))}
          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/25 dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400"
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
            Hinzufuegen
          </button>
        </div>

        {formError ? (
          <p className="mt-3 text-sm font-medium text-red-600 dark:text-red-300">{formError}</p>
        ) : null}
      </form>

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
        {visibleGpts.length} von {allGpts.length} GPTs gefunden
      </p>

      {visibleGpts.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visibleGpts.map((gpt) => (
            <li key={`${gpt.id}:${gpt.url}`} className="min-w-0">
              <a
                href={gpt.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full min-h-[17rem] flex-col rounded-lg border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-200/60 transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-900/10 focus:outline-none focus:ring-4 focus:ring-emerald-500/25 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-black/20 dark:hover:border-emerald-500/60"
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="flex min-w-0 gap-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-zinc-100 text-base font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                      {gpt.iconUrl ? (
                        <Image
                          src={gpt.iconUrl}
                          alt=""
                          width={48}
                          height={48}
                          unoptimized
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        gpt.name.slice(0, 1)
                      )}
                    </span>

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
                  </div>

                  <ExternalLink
                    aria-hidden="true"
                    className="mt-1 h-5 w-5 shrink-0 text-zinc-400 transition group-hover:text-emerald-600 dark:group-hover:text-emerald-300"
                  />
                </div>

                <p className="flex-1 text-base leading-7 text-zinc-600 dark:text-zinc-300">
                  {gpt.description}
                </p>

                <div className="mt-5 flex flex-wrap gap-2" aria-label={`Tags fuer ${gpt.name}`}>
                  {gpt.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {gpt.id.startsWith('custom-') ? (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      handleRemoveCustomGpt(gpt.id);
                    }}
                    className="mt-4 inline-flex items-center justify-center gap-2 self-start rounded-md border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-4 focus:ring-red-500/15 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-red-500/60 dark:hover:bg-red-500/10 dark:hover:text-red-200"
                  >
                    <Trash2 aria-hidden="true" className="h-4 w-4" />
                    Entfernen
                  </button>
                ) : null}
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
