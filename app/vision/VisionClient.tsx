'use client';

import styled from 'styled-components';
import { Quote, Headline1, Headline2, Paragraph } from '@/styles/index';
import type { VisionPageContent } from '@/src/content/schemas';

interface VisionClientProps {
  content: VisionPageContent;
}

export default function VisionClient({ content }: VisionClientProps) {
  return (
    <Container>
      <Headline1>{content.title}</Headline1>
      {content.sections.map((section, sectionIndex) => (
        <Section key={`${section.heading ?? 'section'}-${sectionIndex}`}>
          {section.heading && <Headline2>{section.heading}</Headline2>}
          {section.paragraphs.map((paragraph, paragraphIndex) => (
            <Paragraph
              key={`${section.heading ?? 'paragraph'}-${paragraphIndex}`}
            >
              {paragraph}
            </Paragraph>
          ))}
          {section.quote && <Quote>{section.quote}</Quote>}
        </Section>
      ))}
    </Container>
  );
}

const Container = styled.div`
  max-width: 66vw;
  margin-right: auto;
  margin-left: auto;
  margin-top: 4rem;
  text-align: left;
`;

const Section = styled.section`
  margin-bottom: 2rem;
`;
