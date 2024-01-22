import Image from 'next/image';

import styled from 'styled-components';
import Workspace from '../../public/P1100597.jpg';
import Blase from './Blase';
import InfoButtons from './InfoButtons';
import React, { useState, useEffect } from 'react';

//MARKUP
export default function Work(props) {
  const [ID, setID] = useState(0);
  const select = (id) => {
    setID(id);
  };

  return (
    <StyledContainer>
      <Blase ID={ID}> </Blase>

      <InfoButtons onEnter={select}></InfoButtons>
    </StyledContainer>
  );
}

const StyledContainer = styled.div`
  position: relative;
  width: 100vw;
  height: 100%;
  z-index: 1;
  margin-left: -7rem;
  @media (max-width: 500px) {
    display: none;
  }
`;
