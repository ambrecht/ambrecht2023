'use client';

import { useState, useEffect, useCallback, RefObject } from 'react';
import { useSession } from '@/lib/context/SessionContext';
import { validateSessionContent } from '@/lib/validation';

interface UseEditorLogicParams {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  editorRef: RefObject<HTMLDivElement | null>;
}

export function useEditorLogic({
  textareaRef,
  editorRef,
}: UseEditorLogicParams) {
  const { state, dispatch } = useSession();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timer, setTimer] = useState(0);
  const [wordCount, setWordCount] = useState(0);

  // 1) Timer starten
  useEffect(() => {
    const interval = setInterval(() => setTimer((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // 2) Speichern bei Tab-Wechsel oder Schließen
  useEffect(() => {
    const handleSave = async () => {
      if (validateSessionContent(state.content)) {
        await fetch('/api/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: state.content }),
        });
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleSave();
      }
    };

    window.addEventListener('beforeunload', handleSave);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleSave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [state.content]);

  // 3) Automatische Speicherung im localStorage
  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem('sessionContent', state.content);
    }, 5000);
    return () => clearInterval(interval);
  }, [state.content]);

  // 4) Wortzähler aktualisieren
  useEffect(() => {
    const words = state.content.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(words);
  }, [state.content]);

  // 5) Vollbild-Status aktualisieren
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // 6) Textänderungen – Stack-Logik: Nur Anhängen erlaubt
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newContent = e.target.value;

      // ⛔ Verhindere jegliche Löschaktionen
      if (newContent.length < state.content.length) {
        e.target.value = state.content;
        return;
      }

      // ⛔ Verhindere Einfügungen in der Mitte
      if (!newContent.startsWith(state.content)) {
        e.target.value = state.content;
        return;
      }

      // ⛔ Keine Zeilenumbrüche
      const sanitizedContent = newContent.replace(/\n/g, ' ');

      // ⛔ Keine aufeinanderfolgenden Leerzeichen
      if (/ {2,}$/.test(sanitizedContent)) {
        e.target.value = state.content;
        return;
      }

      dispatch({ type: 'SET_CONTENT', payload: sanitizedContent });

      // 📌 Cursor immer ans Ende setzen
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.setSelectionRange(
          sanitizedContent.length,
          sanitizedContent.length,
        );
        textarea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        textarea.focus();
      }
    },
    [state.content, dispatch, textareaRef],
  );

  // 7) Session speichern & beenden
  const handleSaveSession = useCallback(async () => {
    if (!validateSessionContent(state.content)) {
      console.log('Sessioninhalt zu kurz; wird nicht gespeichert.');
      return;
    }
    try {
      await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: state.content }),
      });
      dispatch({ type: 'SET_CONTENT', payload: '' });

      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }

      console.log('Session erfolgreich gespeichert.');
      setTimer(0);
    } catch (error) {
      console.log('Fehler beim Speichern der Session.');
    }
  }, [state.content, dispatch]);

  // 8) Vollbildmodus umschalten
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement && editorRef.current) {
      editorRef.current.requestFullscreen().catch((err) => {
        console.error('Fehler beim Aktivieren des Vollbildmodus:', err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.error('Fehler beim Verlassen des Vollbildmodus:', err);
      });
    }
    textareaRef.current?.focus();
  }, [editorRef, textareaRef]);

  return {
    isFullscreen,
    timer,
    wordCount,
    handleChange,
    handleSaveSession,
    toggleFullscreen,
  };
}
