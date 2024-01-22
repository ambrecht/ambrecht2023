'use client';
import styled from 'styled-components';
import React, { useEffect, useRef, useState } from 'react';
import Button from '@/components/Button';
import { Quote, Headline1, Headline2, Paragraph } from '@/styles/index';

interface OutputProps {
  size: number;
  schema: boolean;
}
//LOGIC

const Copy = async (str: string): Promise<void> => {
  if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(str);
  } else {
    return Promise.reject('The Clipboard API is not available.');
  }
};

const Deepl = (str: string): void => {
  // Änderung hier: Rückgabetyp 'void'
  const newPageUrl = `https://www.deepl.com/translator#en/de/${str}`;
  window.open(newPageUrl, '_blank');
};

const BreakRemove = (input: string): string => {
  const removeLineBreaks = input.replace(/(\r\n|\n|\r)/gm, ' ');
  const removeWhiteSpace = removeLineBreaks.replace(/^\s+|\s+$/g, ' ');
  return removeWhiteSpace.trim();
};

const WordCount = (input: string): number => {
  const regEx = input
    .replace(/(^\s*)|(\s*$)/gi, '')
    .replace(/[ ]{2,}/gi, ' ')
    .replace(/\n /, '\n');

  return regEx.split(' ').length;
};

//MARKUP
export default function MARKUP() {
  const [inputValue, setInputValue] = useState('');
  const [edited, setEdited] = useState('');
  const [count, setCount] = useState(0);
  const [schema, setSchema] = useState(true);
  const [size, setSize] = useState(12);

  useEffect(() => {
    const Remove = BreakRemove(inputValue);
    setEdited(Remove);
  }, [inputValue]);

  useEffect(() => {
    const counter = WordCount(edited);
    edited && setCount(counter);
  }, [edited]);

  return (
    <>
      <Intro>
        Hier können Sie ihre Texte von Zeilenumbrüchen entfernen und den Text
        mit Deepl übersetzen:
      </Intro>
      <WordProcessBox>
        <TextInput
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          placeholder="Geben Sie Ihren Text ein."
          required
        >
          <p>Textinput:</p>
          {inputValue}
        </TextInput>
        <CounterBox>
          <p>Wörter:</p>
          <WordCounter>{count}</WordCounter>
        </CounterBox>
      </WordProcessBox>
      <ButtonBox>
        <Button
          onClick={() => Copy(edited)} // Änderung hier
          label="Kopieren ohne Zeilenumbrüche"
        ></Button>
        <Button
          onClick={() => Deepl(edited)} // Änderung hier
          label="Deepl Translator"
        ></Button>
      </ButtonBox>

      <Intro>Der Text in Schönschrift:</Intro>
      <FontInput
        type="number"
        min="4"
        step="0.5"
        max="32"
        value={size}
        onChange={(e) => setSize(Number(e.target.value))} // Umwandlung in Number
      />
      <OutputBox>
        <Button
          onClick={() => setSchema(!schema)}
          label="Farbschema invertieren"
        ></Button>

        <Output size={size} schema={schema}>
          {edited}
        </Output>
      </OutputBox>
    </>
  );
}

const StyledQuote = styled.div<OutputProps>`
  // Stile hier
  color: var(--color-text); // Verwendung von Props
  background-color: var(--color-bg); // Verwendung von Props
`;

const FontInput = styled.input``;

const TextInput = styled.textarea`
  flex-grow: 5;
  background: rgba(0, 0, 0, 0.3);
  width: 50%;
  height: 10rem;
  padding: 1em;
  margin-bottom: 0.5rem;
  border: white;
  border-radius: 1rem;
  box-shadow: 4px 4px 60px rgba(0, 0, 0, 0.2);
  color: rgba(255, 255, 255, 0.3);
  transition: all 0.2s ease-in-out;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  font-weight: 300;

  @media (max-width: 768px) {
    width: 70vw;
  }

  &:hover {
    background-image: linear-gradient(to right, #2393ff 0%, #5f1df2 100%);
    box-shadow: 4px 4px 60px 8px rgba(0, 0, 0, 0.2);
    color: rgba(255, 255, 255, 1);
  }
`;
const Output = styled.p<OutputProps>`
  size: 7in 9.25in;
  margin: 27mm 16mm 27mm 16mm;
  flex-grow: 5;
  box-shadow: 4px 4px 60px 8px rgba(0, 0, 0, 0.2);
  color: rgba(255, 255, 255, 1);
  --color-text: ${(props) => (props.schema == true ? '#f4f4f4' : '#293133')};
  --color-bg: ${(props) => (props.schema == true ? '#293133' : '#f4f4f4')};
  font-family: 'Libre Caslon Text', serif;
  font-size: ${(props) => `${props.size}px`};
  color: var(--color-text);
  margin-block: 0 10vmin;
  font-weight: 700;
  text-indent: 2ch;
  word-break: normal;
  hyphens: auto;
  padding: 1em;

  line-height: 1.4;
  background-color: var(--color-bg);
  page-break-after: always;
  margin-top: 1rem;
  margin-bottom: 2rem;
  margin-right: auto;
  margin-left: auto;
  column-span: all;
  font-family: var(--gara-Font);
  font-style: italic;
  letter-spacing: 0.1rem;
  font-weight: 800;
  color: white;
  line-height: 1;
  padding: 5rem;

  text-align: center;
  max-width: 66vw;
  background: linear-gradient(72.61deg, #ffffff 22.63%, #ffffff 84.67%);
  -webkit-background-clip: text;
  color: transparent;
`;

const WordCounter = styled.p`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 3em;
  height: 3em;
  text-align: center;

  border-radius: 10%;
  background-image: linear-gradient(to right, #2393ff 0%, #5f1df2 100%);
  box-shadow: 4px 4px 60px 8px rgba(0, 0, 0, 0.2);
  -webkit-text-fill-color: rgba(255, 255, 255, 1);
  color: rgba(255, 255, 255, 1);
`;

const WordProcessBox = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
`;

const ButtonBox = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
`;

const OutputBox = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: baseline;
`;

const CounterBox = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  padding: 2rem;

  color: white;
  font-size: 2rem;
  font-weight: 900;
  text-align: center;

  letter-spacing: 0.01em;

  background-image: linear-gradient(to right, #2393ff 0%, #5f1df2 100%);
  -webkit-background-clip: text;
  background-size: 100%;
  -webkit-text-fill-color: transparent;
`;

const Intro = styled(Headline2)`
  width: 66vw;
  text-align: center;
  padding-top: 5rem;
  padding-bottom: 5rem;
  border-bottom: 1px solid white;
  border-top: 1px solid white;
  margin-bottom: 3rem;
  margin-top: 3rem;
  margin-left: auto;
  margin-right: auto;
`;
