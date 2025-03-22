'use client';
import React, { useState } from 'react';

/**
 * Datentyp für einzelne Sessions, anpassbar je nach API.
 */
export interface ISession {
  id: number;
  text: string;
  created_at: string; // Zeitpunkt, wann die Session angelegt wurde
  letter_count: number;
  word_count: number;
}

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

interface SessionItemProps {
  session: ISession;
  onSessionChange: () => void;
}

/**
 * Einzelansicht einer Session. Ermöglicht das Bearbeiten und Löschen (nur, wenn älter als 24 Stunden).
 */
export function SessionItem({ session, onSessionChange }: SessionItemProps) {
  const { id, text, created_at, letter_count, word_count } = session;

  // Zustand für Edit-Modus
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);

  // Prüfung, ob diese Session älter als 24h ist (Erlaubnis für Bearbeiten/Löschen)
  const canEditOrDelete = (() => {
    const creationTime = new Date(created_at).getTime();
    return Date.now() - creationTime > ONE_DAY_IN_MS;
  })();

  /**
   * Löscht eine Session über die API.
   */
  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/sessions/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        console.error('Fehler beim Löschen:', response.statusText);
      }
      // Nach dem Löschen Daten neu laden
      onSessionChange();
    } catch (err) {
      console.error('Netzwerkfehler beim Löschen:', err);
    }
  };

  /**
   * Speichert Änderungen (Bearbeiten).
   * Sie benötigen eventuell einen PATCH/PUT-Endpoint in /api/session/[id].
   */
  const handleSave = async () => {
    try {
      const response = await fetch(`/api/session/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: editText }),
      });
      if (!response.ok) {
        console.error('Fehler beim Bearbeiten:', response.statusText);
      }
      setIsEditing(false);
      // Liste erneut laden, damit Änderungen sichtbar werden
      onSessionChange();
    } catch (err) {
      console.error('Netzwerkfehler beim Bearbeiten:', err);
    }
  };

  /**
   * Layout und Stil für die Darstellung, angepasst für dunklen Hintergrund.
   */
  return (
    <div className="border border-gray-600 p-4 rounded text-gray-200 bg-black">
      {/* Normaler Anzeigemodus */}
      {!isEditing && (
        <>
          <div className="text-sm text-gray-400">
            ID: {id} — Erstellt am: {new Date(created_at).toLocaleString()}
          </div>
          <p className="mt-2 whitespace-pre-wrap">{text}</p>
          <p className="text-xs text-gray-500 mt-1">
            {letter_count} Buchstaben, {word_count} Wörter
          </p>
        </>
      )}

      {/* Bearbeitungsmodus */}
      {isEditing && (
        <textarea
          className="w-full p-2 border border-gray-500 rounded bg-black text-gray-200 mt-2"
          rows={4}
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
        />
      )}

      {/* Aktionsleiste */}
      <div className="flex gap-2 mt-3">
        {canEditOrDelete ? (
          <>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded"
              >
                Bearbeiten
              </button>
            )}

            {isEditing && (
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded"
              >
                Speichern
              </button>
            )}

            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded"
            >
              Löschen
            </button>
          </>
        ) : (
          <p className="text-sm text-gray-500">
            Diese Session ist noch keine 24 Stunden alt. Sie kann nicht gelöscht
            oder bearbeitet werden.
          </p>
        )}

        {isEditing && (
          <button
            onClick={() => {
              setIsEditing(false);
              setEditText(text);
            }}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded"
          >
            Abbrechen
          </button>
        )}
      </div>
    </div>
  );
}
