import React, { useState } from 'react';
import LikertScale from '@/components/sympathy-test/Scale';
import { useScoreUpdater } from '@/components/sympathy-test/useScoreUpdater';
import { Paragraph } from '@/styles/index';
import ContactButton from '@/components/ContactButton';
import styled from 'styled-components';
import Assesment from '@/components/sympathy-test/Assessment';
import {
  DimensionScores,
  LikertLabel,
  Question,
} from '@/components/sympathy-test/interfaces';

interface SurveyProps {
  content: {
    intro: string;
    ctaLabel: string;
    scale: { left: string; right: string };
    likertLabels: LikertLabel[];
    initialScores: DimensionScores;
    questions: Question[];
  };
}

const Survey: React.FC<SurveyProps> = ({ content }) => {
  const { scores, updateScores } = useScoreUpdater(
    content.initialScores,
    content.questions,
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSurveyCompleted, setIsSurveyCompleted] = useState(false);
  const [startSurvey, setStartSurvey] = useState(false);

  const handleValueChange = (questionId: number, selectedValue: number) => {
    updateScores(questionId, selectedValue);
    if (currentQuestionIndex < content.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setIsSurveyCompleted(true);
    }
  };

  const currentQuestion = content.questions[currentQuestionIndex];

  return (
    <Container>
      {!startSurvey && (
        <Index>
          <Paragraph>{content.intro}</Paragraph>
          <ContactButton onClick={() => setStartSurvey(!startSurvey)}>
            {content.ctaLabel}
          </ContactButton>
        </Index>
      )}

      {!isSurveyCompleted && startSurvey && (
        <LikertScale
          key={currentQuestion.id}
          labels={content.likertLabels}
          question={currentQuestion}
          onValueChange={handleValueChange}
          questionIndex={currentQuestionIndex}
          questionLenght={content.questions.length}
          scaleEdgeLabels={content.scale}
        />
      )}
      {isSurveyCompleted && <Assesment scores={scores}></Assesment>}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  max-width: 1000px;
  margin: 0 auto;
  margin-top: 6rem;
  margin-bottom: 6rem;
  flex-direction: column;
  justify-content: center;
  z-index: 4;

  &:before {
    position: absolute;

    content: '';
    width: 100vh;
    height: 100vh;
    background: rgb(0, 130, 255);
    background: linear-gradient(
      0deg,
      rgba(255, 255, 255, 0) 0%,
      #7207ff 25%,
      rgba(255, 255, 255, 0) 100%
    );
    clip-path: polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%);
    z-index: 1;
    mix-blend-mode: color;
    @media (max-width: 500px) {
      display: none;
    }
  }

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
    height: 100%;
    max-width: 100vw;
    overflow: hidden;
  }
`;

const Index = styled.div`
  text-align: center;
  margin-bottom: 20px;
  color: white;
  z-index: 4;

  &:before {
    content: '';
    width: 100px;
    height: 100px;
    background-color: yellow;
  }
`;

export default Survey;
