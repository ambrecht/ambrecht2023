'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, PenLine } from 'lucide-react';

import type { Session as ApiSession } from '@/lib/api/types';
import { getDocumentVersions, getSession } from '@/lib/api/typewriterClient';
import type { Session } from '@/components/SessionView/types';
import {
  formatDate,
  formatDateTime,
  getReadingMinutes,
  getSessionTitle,
  getWordCount,
  normalizeVersionList,
} from './sessionView2Utils';

type ReaderTab = 'read' | 'versions';

type SessionV2ReaderProps = {
  sessionId: number;
};

const toViewSession = (session: ApiSession): Session => ({
  ...session,
  text: session.text ?? '',
});

export function SessionV2Reader({ sessionId }: SessionV2ReaderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [versions, setVersions] = useState<Session[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null);
  const [tab, setTab] = useState<ReaderTab>('read');
  const [isLoading, setIsLoading] = useState(true);
  const [versionError, setVersionError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!Number.isFinite(sessionId)) {
        setIsLoading(false);
        setError('Ungueltige Session-ID.');
        return;
      }

      setIsLoading(true);
      setError(null);
      setVersionError(null);
      try {
        const loaded = toViewSession(await getSession(sessionId));
        if (cancelled) return;
        setSession(loaded);
        setSelectedVersionId(loaded.id);

        try {
          const related = await loadVersions(loaded);
          if (!cancelled) setVersions(normalizeVersionList(related, loaded));
        } catch (err) {
          if (!cancelled) {
            setVersions([loaded]);
            setVersionError(
              err instanceof Error
                ? err.message
                : 'Versionen konnten nicht geladen werden.',
            );
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Session konnte nicht geladen werden.');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const selectedVersion = useMemo(() => {
    if (!session) return null;
    return versions.find((version) => version.id === selectedVersionId) ?? session;
  }, [selectedVersionId, session, versions]);

  if (isLoading) {
    return (
      <ReaderFrame>
        <p className="py-16 text-[#9c8f7f]">Session wird geladen...</p>
      </ReaderFrame>
    );
  }

  if (error || !session || !selectedVersion) {
    return (
      <ReaderFrame>
        <div className="border border-red-900/60 bg-red-950/40 px-4 py-3 text-sm text-red-100">
          {error ?? 'Session wurde nicht gefunden.'}
        </div>
      </ReaderFrame>
    );
  }

  const title = getSessionTitle(session);
  const selectedTitle =
    selectedVersion.id === session.id ? title : `${title} - Version ${getVersionNumber(versions, selectedVersion.id)}`;

  return (
    <ReaderFrame>
      <header className="mb-10">
        <Link
          href="/session-v2"
          className="inline-flex items-center gap-2 text-sm text-[#aa9e8d] hover:text-[#f7f2e9]"
        >
          <ArrowLeft size={16} />
          Sessions
        </Link>
        <Link
          href="/session"
          className="ml-5 text-sm text-[#8f8374] underline-offset-4 hover:text-[#f7f2e9] hover:underline"
        >
          Zur alten Session View
        </Link>
        <div className="mt-8 flex flex-col gap-6 border-b border-[#29241d] pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#8f8374]">
              minimalType Reader
            </p>
            <h1 className="max-w-3xl text-3xl font-semibold leading-tight text-[#fdfaf3] sm:text-5xl">
              {title}
            </h1>
            <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-sm text-[#9c8f7f]">
              <time dateTime={selectedVersion.created_at}>
                {formatDateTime(selectedVersion.created_at)}
              </time>
              <span>{getWordCount(selectedVersion).toLocaleString('de-DE')} Woerter</span>
              <span>{getReadingMinutes(selectedVersion)} Min.</span>
              {selectedVersion.id !== session.id && <span>{selectedTitle}</span>}
            </div>
            {session.tags && session.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {session.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md border border-[#29241d] px-2 py-1 text-xs text-[#aa9e8d]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <Link
            href={`/session/edit?active=${session.id}`}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[#d8bd8b] px-4 text-sm font-semibold text-[#f7f2e9] hover:bg-[#211b14]"
          >
            <PenLine size={16} />
            Bearbeiten
          </Link>
        </div>

        <nav className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTab('read')}
            className={`rounded-md px-3 py-2 text-sm ${
              tab === 'read'
                ? 'bg-[#211b14] text-[#fdfaf3]'
                : 'text-[#aa9e8d] hover:bg-[#17130f] hover:text-[#f7f2e9]'
            }`}
          >
            Lesen
          </button>
          <button
            type="button"
            onClick={() => setTab('versions')}
            className={`rounded-md px-3 py-2 text-sm ${
              tab === 'versions'
                ? 'bg-[#211b14] text-[#fdfaf3]'
                : 'text-[#aa9e8d] hover:bg-[#17130f] hover:text-[#f7f2e9]'
            }`}
          >
            Versionen
          </button>
        </nav>
      </header>

      {tab === 'versions' ? (
        <VersionPanel
          currentSessionId={session.id}
          selectedVersionId={selectedVersion.id}
          versions={versions}
          versionError={versionError}
          onSelect={(id) => {
            setSelectedVersionId(id);
            setTab('read');
          }}
        />
      ) : (
        <article className="mx-auto max-w-3xl pb-20">
          <div
            className="whitespace-pre-wrap font-serif text-[20px] leading-9 text-[#f1e8dc] sm:text-[22px] sm:leading-10"
            style={{ fontFeatureSettings: '"liga","kern"' }}
          >
            {selectedVersion.text || 'Diese Version enthaelt keinen Text.'}
          </div>
        </article>
      )}
    </ReaderFrame>
  );
}

function ReaderFrame({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#0d0c0a] text-[#f7f2e9]">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
    </main>
  );
}

async function loadVersions(session: Session) {
  if (session.document_id) {
    const response = await getDocumentVersions(session.document_id, 200, 0, false);
    return response.data.map(toViewSession);
  }

  const chain: Session[] = [session];
  let cursor = session.parent_id;
  let guard = 0;
  while (cursor && guard < 50) {
    // eslint-disable-next-line no-await-in-loop
    const parent = toViewSession(await getSession(cursor));
    chain.push(parent);
    cursor = parent.parent_id ?? null;
    guard += 1;
  }
  return chain;
}

function getVersionNumber(versions: Session[], id: number) {
  const index = versions.findIndex((version) => version.id === id);
  return index >= 0 ? index + 1 : 1;
}

type VersionPanelProps = {
  currentSessionId: number;
  selectedVersionId: number;
  versions: Session[];
  versionError: string | null;
  onSelect: (id: number) => void;
};

function VersionPanel({
  currentSessionId,
  selectedVersionId,
  versions,
  versionError,
  onSelect,
}: VersionPanelProps) {
  return (
    <section className="mx-auto max-w-3xl pb-20">
      <div className="mb-7">
        <h2 className="text-2xl font-semibold text-[#fdfaf3]">Versionen</h2>
        <p className="mt-2 text-sm leading-6 text-[#aa9e8d]">
          Der Verlauf wird aus vorhandenen Dokumentversionen oder der bestehenden Parent-Kette
          gelesen. Es werden keine Originaldaten veraendert.
        </p>
      </div>

      {versionError && (
        <div className="mb-5 border border-[#5b4630] bg-[#17130f] px-4 py-3 text-sm text-[#d8cec0]">
          {versionError}
        </div>
      )}

      <div className="space-y-2">
        {versions.map((version, index) => {
          const isOriginal = index === 0;
          const isSelected = version.id === selectedVersionId;
          const isCurrent = version.id === currentSessionId;
          return (
            <button
              key={version.id}
              type="button"
              onClick={() => onSelect(version.id)}
              className={`w-full border px-4 py-4 text-left transition ${
                isSelected
                  ? 'border-[#d8bd8b] bg-[#18130f]'
                  : 'border-[#29241d] hover:border-[#5b4630] hover:bg-[#12100d]'
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-[#fdfaf3]">
                    {isOriginal ? 'Original' : `Version ${index + 1}`}
                  </h3>
                  <p className="mt-1 text-sm text-[#9c8f7f]">
                    {formatDate(version.created_at)}
                    {isCurrent ? ' - aktuelle Session' : ''}
                  </p>
                </div>
                <div className="text-sm text-[#aa9e8d]">
                  {getWordCount(version).toLocaleString('de-DE')} Woerter
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
