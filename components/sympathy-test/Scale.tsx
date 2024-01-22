// LikertScale.tsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { LikertLabel, Question } from '@/components/sympathy-test/interfaces';

interface LikertScaleProps {
  question: Question;
  labels: LikertLabel[];
  questionIndex: number;
  questionLenght: number;
  onValueChange: (questionId: number, value: number) => void;
}

const ScaleContainer = styled.div`
  background-image: linear-gradient(
    72.61deg,
    rgba(0, 130, 255, 1) 22.63%,
    rgba(79, 5, 245, 1) 84.67%
  );
  color: white;
  margin: 20px 0;
  border-radius: 5rem;
  padding: 1rem;
  z-index: 8;
`;

const ScaleLabel = styled.label`
  display: flex;
  justify-content: center;
  align-items: center;

  font-size: 1rem;
  font-weight: 100;
  text-align: center;
  margin: 0 10px;
  border-radius: 50%;
  cursor: pointer;
  display: block;

  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  margin: auto;
  background-image: linear-gradient(72.61deg, #969696 22.63%, #ffffff 84.67%);
  transition: 0.3s;
  order: 1; // Animate the background-image property over 1 second

  &:hover {
    transform: scale(1.1);
    background-image: linear-gradient(
      72.61deg,
      rgba(0, 130, 255, 1) 22.63%,
      rgba(79, 5, 245, 1) 84.67%
    );
  }

  @media (max-width: 500px) {
    flex-direction: column;

    width: 5rem;
    height: 5rem;
  }
`;

const ScaleInput = styled.input`
  opacity: 0;
`;

const ScaleOption = styled.div``;

const ScaleOptionsContainer = styled.div`
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  margin-top: 10px;
  flex-direction: row;
  flex-wrap: wrap;

  @media (max-width: 500px) {
    // Ändern der Anordnung in eine Spalte
    align-items: flex-start; // Ausrichtung der Elemente
  }
`;

const QuestionText = styled.p`
  font-weight: 800;
  font-size: 1.3em;
  text-align: center;

  margin-bottom: 10px;
`;

const ProgressIndicator = styled.div`
  text-align: center;
  margin-bottom: 20px;
`;

const ScaleLabels = styled.p`
  font-weight: 100;
  font-size: 1.3em;
  text-align: center;

  margin-bottom: 10px;

  @media (max-width: 500px) {
    width: 40%; // Größere Breite für Touch-Zugänglichkeit
    height: 3rem; // Größere Höhe für Touch-Zugänglichkeit
    font-size: 1.2rem; // Größere Schriftgröße
    order: 2;
    align-self: auto;
  }
`;

const LikertScale: React.FC<LikertScaleProps> = ({
  question,
  labels,
  onValueChange,
  questionIndex,
  questionLenght,
}) => {
  const [selectedValue, setSelectedValue] = useState<number | null>(null);

  const handleChange = (value: number) => {
    console.log('value', value);
    setSelectedValue(value);
    onValueChange(question.id, value);
  };

  return (
    <ScaleContainer>
      <ProgressIndicator>
        Frage {questionIndex + 1} von {questionLenght}
      </ProgressIndicator>
      <QuestionText>{question.questionText}</QuestionText>
      <ScaleOptionsContainer>
        <ScaleLabels>Stimme gar nicht zu</ScaleLabels>
        {labels.map((label, index) => (
          <ScaleOption
            className="sp-radio radio--opt-mgtrm size--70 color--green"
            key={index}
          >
            <ScaleLabel htmlFor={`likert-${question.id}-${label.value}`}>
              <ScaleInput
                type="radio"
                name={`likert-${question.id}`}
                id={`likert-${question.id}-${label.value}`}
                checked={selectedValue === label.value}
                onChange={() => handleChange(label.value)}
                value={label.value}
              />
            </ScaleLabel>
          </ScaleOption>
        ))}
        <ScaleLabels>Stimme vollkommen zu</ScaleLabels>
      </ScaleOptionsContainer>
    </ScaleContainer>
  );
};

export default LikertScale;
