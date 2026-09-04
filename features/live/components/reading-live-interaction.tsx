'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  LiveInteractionVoteError,
  setLiveInteractionVote,
} from '../api/set-live-interaction-vote';
import type { LiveInteraction } from '../lib/contract';

import styles from './live-book-reader.module.css';

type ReadingLiveInteractionProps = {
  interaction: LiveInteraction;
  broadcastId: string;
  ensureParticipantId: () => string | null;
};

type StoredVotes = Record<string, string>;

const interactionVotesStoragePrefix = 'ambrecht-live-interaction-votes:';

const getInteractionVotesStorageKey = (broadcastId: string) =>
  `${interactionVotesStoragePrefix}${broadcastId}`;

function readStoredInteractionVotes(broadcastId: string): StoredVotes {
  try {
    const raw = window.localStorage.getItem(
      getInteractionVotesStorageKey(broadcastId),
    );
    const parsed = raw ? (JSON.parse(raw) as unknown) : {};

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsed).filter(
        (entry): entry is [string, string] =>
          typeof entry[0] === 'string' && typeof entry[1] === 'string',
      ),
    );
  } catch {
    return {};
  }
}

function writeStoredInteractionVote({
  broadcastId,
  interactionId,
  optionId,
}: {
  broadcastId: string;
  interactionId: string;
  optionId: string;
}) {
  try {
    const votes = readStoredInteractionVotes(broadcastId);
    votes[interactionId] = optionId;
    window.localStorage.setItem(
      getInteractionVotesStorageKey(broadcastId),
      JSON.stringify(votes),
    );
  } catch {
    // The visible selection still works for this page session.
  }
}

export function removeStoredInteractionVotes(broadcastId: string) {
  try {
    window.localStorage.removeItem(getInteractionVotesStorageKey(broadcastId));
  } catch {
    // Cleanup is best-effort.
  }
}

function getVoteErrorMessage(error: unknown) {
  if (error instanceof LiveInteractionVoteError) {
    if (error.status === 409 || error.code === 'interaction_closed') {
      return 'Die Frage ist bereits geschlossen.';
    }

    if (error.status === 400 || error.code === 'invalid_option') {
      return 'Diese Antwort passt nicht mehr zu dieser Frage.';
    }

    if (error.status === 429) {
      return 'Bitte versuch es gleich noch einmal.';
    }
  }

  return 'Dein Zeichen konnte gerade nicht gesendet werden.';
}

function getResultCount(interaction: LiveInteraction, optionId: string) {
  return (
    interaction.finalResults?.find((result) => result.optionId === optionId)
      ?.count ?? 0
  );
}

function getResultTotal(interaction: LiveInteraction) {
  return (
    interaction.finalResults?.reduce((total, result) => total + result.count, 0) ??
    0
  );
}

export function ReadingLiveInteraction({
  interaction,
  broadcastId,
  ensureParticipantId,
}: ReadingLiveInteractionProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState('');
  const latestSelectionRef = useRef<string | null>(null);

  useEffect(() => {
    const storedVotes = readStoredInteractionVotes(broadcastId);
    const storedSelection = storedVotes[interaction.id] ?? null;
    setSelectedOptionId(storedSelection);
    latestSelectionRef.current = storedSelection;
    setPending(false);
    setFeedback('');
  }, [broadcastId, interaction.id]);

  const handleChange = useCallback(
    async (optionId: string) => {
      if (interaction.status !== 'open' || pending) return;
      if (optionId === latestSelectionRef.current) return;

      const participantId = ensureParticipantId();
      if (!participantId) {
        setFeedback('Dein Zeichen konnte hier nicht gemerkt werden.');
        return;
      }

      const previousSelection = latestSelectionRef.current;
      latestSelectionRef.current = optionId;
      setSelectedOptionId(optionId);
      setPending(true);
      setFeedback('');

      try {
        const result = await setLiveInteractionVote({
          interactionId: interaction.id,
          participantId,
          optionId,
        });

        if (
          result.interactionId !== interaction.id ||
          result.optionId !== optionId ||
          !result.accepted
        ) {
          throw new Error('Vote response does not match the current interaction.');
        }

        writeStoredInteractionVote({
          broadcastId,
          interactionId: interaction.id,
          optionId,
        });
        setFeedback('dein Zeichen ist angekommen');
      } catch (error) {
        latestSelectionRef.current = previousSelection;
        setSelectedOptionId(previousSelection);
        setFeedback(getVoteErrorMessage(error));
      } finally {
        setPending(false);
      }
    },
    [broadcastId, ensureParticipantId, interaction.id, interaction.status, pending],
  );

  const isClosed = interaction.status === 'closed';
  const total = getResultTotal(interaction);

  return (
    <aside className={styles.readerInteraction} data-live-interaction={interaction.id}>
      <fieldset
        className={styles.readerInteractionFieldset}
        disabled={isClosed}
      >
        <legend className={styles.readerInteractionLegend}>
          {isClosed ? 'der autor fragte' : 'der autor fragt'}
        </legend>
        <p className={styles.readerInteractionQuestion}>{interaction.question}</p>

        {isClosed ? (
          <div className={styles.readerInteractionResults}>
            {total === 0 ? (
              <p>keine Stimmen</p>
            ) : (
              interaction.options.map((option) => {
                const count = getResultCount(interaction, option.id);
                const percentage = Math.round((count / total) * 100);

                return (
                  <p key={option.id}>
                    {percentage} % wollten {option.label}.
                  </p>
                );
              })
            )}
          </div>
        ) : (
          <div className={styles.readerInteractionOptions}>
            {interaction.options.map((option) => (
              <label key={option.id} className={styles.readerInteractionOption}>
                <input
                  type="radio"
                  name={`live-interaction-${interaction.id}`}
                  value={option.id}
                  checked={selectedOptionId === option.id}
                  disabled={pending}
                  onChange={() => void handleChange(option.id)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        )}
      </fieldset>

      {!isClosed ? (
        <p
          className={styles.readerInteractionFeedback}
          role="status"
          aria-live="polite"
        >
          {pending ? 'sendet ...' : feedback}
        </p>
      ) : null}
    </aside>
  );
}
