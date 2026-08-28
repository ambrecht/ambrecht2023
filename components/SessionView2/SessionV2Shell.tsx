import Link from 'next/link';
import { MoreHorizontal } from 'lucide-react';

type SessionV2ShellProps = {
  active: 'sessions' | 'activity';
  children: React.ReactNode;
};

export function SessionV2Shell({ active, children }: SessionV2ShellProps) {
  return (
    <main className="min-h-screen bg-[#0d0c0a] text-[#f7f2e9]">
      <div className="flex min-h-screen w-full flex-col">
        <header className="border-b border-[#211c16] bg-[#0d0c0a]">
          <nav className="mx-auto flex h-12 w-full max-w-6xl items-center justify-between px-4 text-sm sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-4">
              <Link
                href="/session-v2"
                className="font-semibold tracking-tight text-[#fdfaf3] hover:text-[#e8d2aa]"
              >
                minimalType
              </Link>
              <Link
                href="/session-v2"
                className={`underline-offset-4 hover:underline ${
                  active === 'sessions' ? 'text-[#fdfaf3]' : 'text-[#aa9e8d] hover:text-[#f7f2e9]'
                }`}
              >
                Archiv
              </Link>
              <Link
                href="/session-v2/activity"
                className={`underline-offset-4 hover:underline ${
                  active === 'activity' ? 'text-[#fdfaf3]' : 'text-[#aa9e8d] hover:text-[#f7f2e9]'
                }`}
              >
                Aktivitaet
              </Link>
            </div>
            <details className="relative">
              <summary
                className="flex cursor-pointer list-none items-center rounded-md p-2 text-[#aa9e8d] hover:bg-[#17130f] hover:text-[#f7f2e9] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d8bd8b]"
                aria-label="Weitere Optionen"
              >
                <MoreHorizontal size={18} />
              </summary>
              <div className="absolute right-0 top-10 z-40 w-56 border border-[#29241d] bg-[#100d0a] p-2 text-sm shadow-xl shadow-black/30">
                <p className="px-2 py-2 text-xs uppercase tracking-[0.16em] text-[#756a5e]">
                  Session View 2
                </p>
                <Link
                  href="/session"
                  className="block rounded-md px-2 py-2 text-[#aa9e8d] hover:bg-[#17130f] hover:text-[#f7f2e9]"
                >
                  Zur alten Session View
                </Link>
              </div>
            </details>
          </nav>
        </header>
        {children}
      </div>
    </main>
  );
}
