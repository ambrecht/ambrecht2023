import React, { useState } from 'react';
import LikertScale from '@/components/sympathy-test/Scale';
import {
  Questions,
  likertSkalaLabels,
  initialScores,
} from '@/components/sympathy-test/surveyData';
import { useScoreUpdater } from '@/components/sympathy-test/useScoreUpdater';
import { Quote, Headline1, Headline2, Paragraph, Bild } from '@/styles/index';
import ContactButton from '@/components/ContactButton';
import styled from 'styled-components';
import Assesment from '@/components/sympathy-test/Assessment';

const Survey: React.FC = () => {
  const { scores, updateScores } = useScoreUpdater(initialScores, Questions);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSurveyCompleted, setIsSurveyCompleted] = useState(false);
  const [startSurvey, setStartSurvey] = useState(false);

  const handleValueChange = (questionId: number, selectedValue: number) => {
    updateScores(questionId, selectedValue);
    // Gehe zur nächsten Frage, wenn es noch weitere Fragen gibt
    if (currentQuestionIndex < Questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Markiere das Quiz als beendet
      setIsSurveyCompleted(true);
    }
  };

  const currentQuestion = Questions[currentQuestionIndex];
  console.log(scores);

  return (
    <Container>
      {!startSurvey && (
        <Index>
          <Paragraph>
            Sind Sie auf der Suche nach der idealen Ergänzung für Ihr Team?
            Dieser Test hilft Ihnen, schnell und effizient zu erkennen, ob eine
            Synergie zwischen uns besteht!
          </Paragraph>
          <ContactButton onClick={() => setStartSurvey(!startSurvey)}>
            TeamFit-Test starten!
          </ContactButton>
        </Index>
      )}

      {!isSurveyCompleted && startSurvey && (
        <LikertScale
          key={currentQuestion.id}
          labels={likertSkalaLabels}
          question={currentQuestion}
          onValueChange={handleValueChange}
          questionIndex={currentQuestionIndex}
          questionLenght={Questions.length}
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
