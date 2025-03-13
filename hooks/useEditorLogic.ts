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

  // 1) Timer starten (einfacher Zähler, um die Tippdauer zu erfassen)
  useEffect(() => {
    const interval = setInterval(() => setTimer((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  /**
   * HILFSFUNKTION: Session-Inhalt an Server senden (wenn gültig).
   * Diese Funktion wird sowohl manuell als auch durch ein Intervall aufgerufen.
   */
  const saveSessionToServer = useCallback(() => {
    if (!validateSessionContent(state.content)) {
      return; // Ungültiger oder zu kurzer Inhalt, keine Speicherung
    }

    const payload = JSON.stringify({ content: state.content });

    // sendBeacon ist auf manchen Android-Browsern nicht zuverlässig;
    // wir versuchen es, fallen aber auf fetch zurück.
    if (navigator.sendBeacon) {
      try {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon('/api/session', blob);
      } catch (err) {
        // Fallback: fetch mit keepalive
        fetch('/api/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true,
        }).catch(() => {
          console.warn('Fehler beim Speichern via fetch (Fallback).');
        });
      }
    } else {
      // Bei Nichtverfügbarkeit von sendBeacon nutzen wir fetch
      fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {
        console.warn('Fehler beim Speichern via fetch.');
      });
    }
  }, [state.content]);

  /**
   * 2) Intervallgesteuertes Speichern im localStorage und ggf. Server.
   * Statt auf beforeunload zu warten, wird in regelmäßigen Abständen gespeichert.
   */
  useEffect(() => {
    const interval = setInterval(() => {
      // Immer lokal speichern
      localStorage.setItem('sessionContent', state.content);

      // Optional: Auch auf den Server senden
      // Dadurch verhindert man, daß ein abruptes Schließen auf Android
      // den Inhalt verliert.
      saveSessionToServer();
    }, 5000);

    return () => clearInterval(interval);
  }, [state.content, saveSessionToServer]);

  /**
   * 3) Wortzähler aktualisieren
   */
  useEffect(() => {
    const words = state.content.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(words);
  }, [state.content]);

  /**
   * 4) Vollbild-Status (um festzustellen, ob der Nutzer im Fullscreen ist)
   */
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  /**
   * 5) Textänderungs-Logik – nur Anhängen erlaubt (keine Löschungen, kein Einfügen in der Mitte)
   */
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newContent = e.target.value;

      // Löschaktionen abfangen
      if (newContent.length < state.content.length) {
        e.target.value = state.content;
        return;
      }

      // Einfügungen in der Mitte unterbinden
      if (!newContent.startsWith(state.content)) {
        e.target.value = state.content;
        return;
      }

      // Keine Zeilenumbrüche zulassen
      const sanitizedContent = newContent.replace(/\n/g, ' ');

      // Keine aufeinanderfolgenden Leerzeichen am Ende
      if (/ {2,}$/.test(sanitizedContent)) {
        e.target.value = state.content;
        return;
      }

      dispatch({ type: 'SET_CONTENT', payload: sanitizedContent });

      // Cursor immer ans Ende setzen
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

  /**
   * 6) Manuelles Session-Speichern (z. B. beim Klick auf "Session beenden")
   */
  const handleSaveSession = useCallback(() => {
    if (!validateSessionContent(state.content)) {
      console.log('Sessioninhalt zu kurz; wird nicht gespeichert.');
      return;
    }
    fetch('/api/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: state.content }),
    })
      .then(() => {
        // Custom-Event, um andere Komponenten zu informieren
        window.dispatchEvent(
          new CustomEvent('sessionSaved', {
            detail: { content: state.content },
          }),
        );
        // Inhalt zurücksetzen
        dispatch({ type: 'SET_CONTENT', payload: '' });
        if (document.fullscreenElement) {
          document.exitFullscreen().catch((err) => {
            console.error('Fehler beim Verlassen des Vollbildmodus:', err);
          });
        }
        console.log('Session erfolgreich gespeichert.');
        setTimer(0);
      })
      .catch((error) => {
        console.log('Fehler beim Speichern der Session.', error);
      });
  }, [state.content, dispatch]);

  /**
   * 7) Vollbildmodus umschalten
   */
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
