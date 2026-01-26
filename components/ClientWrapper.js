"use client"
// Wir importieren React, da wir JSX verwenden
import React from 'react';
// Wir importieren styled-components für das Styling
import styled from 'styled-components';

// MainWrapper ist eine Styled Component, die das Hauptlayout definiert
const Wrapper = styled.main`
  width: 100%;
  max-width: 800px;
  padding: 16px 24px;
  margin: 0px auto;
  border: 1px solid hsl(0deg 0% 50% / 0.3);
  border-radius: 2px;
  background: white;
`;

// Die Wrapper-Komponente, die alle Kinder umschließt
// Sie nimmt `children` als Prop und rendert sie innerhalb von MainWrapper
const ClientWrapper = ({ children }) => {
  return (
    <Wrapper>
      {children}
    </Wrapper>
  );
};

// Wir exportieren Wrapper für die weitere Verwendung
export default ClientWrapper;
