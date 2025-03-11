// lib/validation.ts

/**
 * Validiert den Inhalt einer Schreibsession
 * @param content - Der zu validierende Inhalt
 * @returns boolean - true, wenn der Inhalt gültig ist
 */
export function validateSessionContent(content: string): boolean {
  if (!content || typeof content !== 'string') {
    return false;
  }

  // Mindestens 10 Zeichen und 3 Wörter
  const words = content.trim().split(/\s+/);
  return content.length >= 10 && words.length >= 3;
}

/**
 * Validiert eine Session-ID
 * @param sessionId - Die zu validierende ID
 * @returns boolean - true, wenn die ID gültig ist
 */
export function validateSessionId(sessionId: string): boolean {
  return /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(
    sessionId,
  );
}
