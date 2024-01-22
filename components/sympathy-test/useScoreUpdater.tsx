// state/useScoreUpdater.ts
import { useCallback, useState } from 'react';
import {
  DimensionScores,
  Question,
} from '@/components/sympathy-test/interfaces';

export const useScoreUpdater = (
  initialScores: DimensionScores,
  questions: Question[],
) => {
  const [scores, setScores] = useState<DimensionScores>(initialScores);

  const updateScores = useCallback(
    (questionId: number, indexvalue: number) => {
      console.log(questionId, indexvalue);
      const question = questions.find((q) => q.id === questionId);
      if (!question) return;

      const value = indexvalue; // Für Likert-Skala
      const influences = question.influenceMapping[value];

      if (influences) {
        setScores((prevScores) => {
          let newScores = { ...prevScores };

          Object.entries(influences).forEach(([dimension, changeBy]) => {
            newScores[dimension] = (newScores[dimension] || 0) + changeBy;
          });

          return newScores;
        });
      }
    },
    [questions],
  );

  return { scores, updateScores };
};
