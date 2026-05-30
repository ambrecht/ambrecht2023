'use client';

import { FormEvent, useState } from 'react';
import { LockKeyhole } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SessionLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') || '/session';
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/session-auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const json = (await response.json().catch(() => null)) as {
        success?: boolean;
        message?: string;
      } | null;

      if (!response.ok || !json?.success) {
        throw new Error(json?.message || 'Login fehlgeschlagen.');
      }

      router.replace(nextPath.startsWith('/') ? nextPath : '/session');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login fehlgeschlagen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b0a09] px-4 text-[#f7f4ed]">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-lg border border-[#2f2822] bg-[#100d0a] p-5 shadow-lg shadow-black/20"
      >
        <div className="mb-5 flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#2f2822] bg-[#18130f] text-[#c9b18a]">
            <LockKeyhole size={20} />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#cbbfb0]">
              Privat
            </p>
            <h1 className="text-2xl font-semibold leading-tight text-[#fdfbf7]">
              Session Login
            </h1>
          </div>
        </div>

        <label
          htmlFor="session-password"
          className="mb-2 block text-sm text-[#d6c9ba]"
        >
          Passwort
        </label>
        <input
          id="session-password"
          type="password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            if (error) setError(null);
          }}
          autoFocus
          autoComplete="current-password"
          className="mb-3 h-11 w-full rounded-lg border border-[#2f2822] bg-[#18130f] px-3 text-base text-[#fdfbf7] outline-none placeholder:text-[#6f6259] focus-visible:ring-2 focus-visible:ring-[#c9b18a]"
        />

        {error && (
          <p className="mb-3 rounded-lg border border-red-900/60 bg-red-950/60 px-3 py-2 text-sm text-red-100">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !password}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#6f5431] bg-[#c9b18a] px-4 text-sm font-semibold text-[#120f0c] hover:bg-[#dbc397] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f7f4ed] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? 'Pruefe...' : 'Einloggen'}
        </button>
      </form>
    </main>
  );
}
