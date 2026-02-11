import type { Session } from '@/lib/api/types';
import type { SessionVersion } from './types';

const STORE_PREFIX = 'session-editor-versions';

const getStorage = () => {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const safeParse = (raw: string | null) => {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Record<string, SessionVersion>;
  } catch {
    return null;
  }
};

export const getVersionStoreKey = (session: Session) =>
  `${STORE_PREFIX}:${session.document_id ?? session.id}`;

export const loadLocalVersionMap = (storeKey: string) => {
  const storage = getStorage();
  if (!storage) return {};
  const raw = storage.getItem(storeKey);
  return safeParse(raw) ?? {};
};

export const getLocalVersion = (storeKey: string, versionId: string) => {
  const map = loadLocalVersionMap(storeKey);
  return map[versionId] ?? null;
};

export const saveLocalVersion = (storeKey: string, version: SessionVersion) => {
  const storage = getStorage();
  if (!storage) return;
  const map = loadLocalVersionMap(storeKey);
  map[version.id] = version;
  storage.setItem(storeKey, JSON.stringify(map));
};
