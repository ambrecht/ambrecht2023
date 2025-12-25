'use client';

import styled from 'styled-components';
import { Quote, Headline1, Headline2, Paragraph, Bild } from '@/styles/index';
import type { ProcessPageContent } from '@/src/content/schemas';

interface ProcessClientProps {
  content: ProcessPageContent;
}

export default function ProcessClient({ content }: ProcessClientProps) {
  return (
    <Wrapper>
      <Quote>{content.quote}</Quote>
      <Headline1>{content.headline}</Headline1>
      {content.phases.map((phase, index) => (
        <GridContainer key={phase.title} $direction={index % 2 === 0}>
          <Bild
            src={phase.image.src}
            alt={phase.image.alt}
            width={3000}
            height={3000}
          />

          <Paragraph>
            <Headline2>{phase.title}</Headline2>
            {phase.body}
          </Paragraph>
        </GridContainer>
      ))}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  padding-top: 5rem;
`;

interface GridContainerProps {
  $direction: boolean;
}

const GridContainer = styled.div<GridContainerProps>`
  padding-bottom: 5em;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  gap: 2rem;

  width: 100%;
  height: auto;
  flex-wrap: nowrap;
  flex-direction: ${(props) => (props.$direction ? 'row' : 'row-reverse')};
  color: white;

  @media (max-width: 800px) {
    display: flex;
    flex-wrap: column;
    flex-direction: column;
  }

  @media (max-width: 500px) {
    max-width: 90%;
    margin: 0 auto;
    div {
      font-size: 1rem;
      max-width: 90%;
    }
  }
`;
