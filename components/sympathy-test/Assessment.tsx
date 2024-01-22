import React from 'react';
import styled from 'styled-components';
import { Quote, Headline1, Headline2, Paragraph, Bild } from '@/styles/index';

interface Scores {
  Innovativ: number;
  Traditionell: number;
  Projektorientiert: number;
  Prozessorientiert: number;
  Agil: number;
  Strukturiert: number;
  Bottom_up: number;
  Top_down: number;
}
interface SurveyResultsProps {
  scores: Scores;
}

const ResultContainer = styled.div`
  text-align: center;
  margin-top: 20px;
`;

const generateAssessment = ({
  Innovativ,
  Traditionell,
  Projektorientiert,
  Prozessorientiert,
  Agil,
  Strukturiert,
  Bottom_up,
  Top_down,
}: Scores) => {
  const assessments: string[] = [];

  const positiveCount = Projektorientiert + Innovativ + Agil + Bottom_up;
  const negativeCount =
    Traditionell + Strukturiert + Top_down + Prozessorientiert;
  const totalCount = positiveCount + negativeCount;

  if (totalCount <= 5) {
    return {
      positivePercentage: 0,
      negativePercentage: 0,
      assessments: [
        'Sie haben zu viele Neutral Werte gewählt, sodass eine Einschätzung nicht möglich ist.',
      ],
    };
  }

  let positivePercentage = 0;
  let negativePercentage = 0;

  if (totalCount > 0) {
    positivePercentage = (positiveCount / totalCount) * 100;
    negativePercentage = (negativeCount / totalCount) * 100;
  }

  if (positiveCount > negativeCount) {
    assessments.push('Wir sollten uns unbedingt kennen lernen!');
  }
  if (positiveCount == negativeCount) {
    assessments.push('Es gibt einige Synergien...');
  }

  if (positiveCount < negativeCount) {
    assessments.push(
      'Es gibt zwar einige Synergien, aber leiden passen unsere Werte nicht ganz zusammen.',
    );
  }

  if (Traditionell >= Innovativ) {
    assessments.push(
      'Ihr Unternehmen ist sehr traditionell und hat eine feste Struktur.',
    );
  } else {
    assessments.push(
      'Ihr Unternehmen ist innovativ und offen für neue Ideen und Veränderungen.',
    );
  }

  if (Prozessorientiert >= Projektorientiert) {
    assessments.push(
      'Sie legen großen Wert auf etablierte Prozesse und klare Verfahren.',
    );
  } else {
    assessments.push(
      'Sie bevorzugen eine projektorientierte Arbeitsweise mit Fokus auf spezifische Ziele.',
    );
  }

  if (Strukturiert >= Agil) {
    assessments.push(
      'Sie arbeiten sehr strukturiert und bevorzugen eine wohlgeordnete Umgebung.',
    );
  } else {
    assessments.push(
      'Sie sind agil und passen sich leicht an Veränderungen an.',
    );
  }

  if (Top_down >= Bottom_up) {
    assessments.push(
      'Entscheidungen werden eher top-down getroffen, was auf eine klassische Unternehmensstruktur hinweist.',
    );
  } else {
    assessments.push(
      'Sie fördern einen bottom-up Ansatz, bei dem Ideen und Feedback aus allen Unternehmensebenen erwünscht sind.',
    );
  }

  return {
    positivePercentage,
    negativePercentage,
    assessments,
  };
};

const SurveyResults: React.FC<SurveyResultsProps> = ({ scores }) => {
  const { positivePercentage, assessments } = generateAssessment(scores);

  return (
    <ResultContainer>
      <Headline1>Synergie Score</Headline1>
      <Circle>{positivePercentage.toFixed(2)}%</Circle>
      <Quote>
        {assessments.map((text, index) => (
          <p key={index}>{text}</p>
        ))}
      </Quote>
    </ResultContainer>
  );
};

export default SurveyResults;

const Circle = styled.div`
  --circle-size: clamp(100px, 15vw, 200px);
  border-radius: 50%;
  width: var(--circle-size);
  height: var(--circle-size);
  display: flex;
  justify-content: center;
  align-items: center;
  margin: auto;
  background-image: linear-gradient(72.61deg, #969696 22.63%, #ffffff 84.67%);
  transition: 0.3s; // Animate the background-image property over 1 second
`;
