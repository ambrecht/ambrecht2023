'use client';
import styled from 'styled-components';
import Link from 'next/link';
import type { NavContent } from '@/src/content/schemas';
import Logo from './Logo';
import ContactButton from './ContactButton';

type NavItemProps = {
  href: string;
  label: string;
};

const NavItem = ({ href, label }: NavItemProps) => (
  <StyledLi>
    <Link href={href} passHref>
      {label}
    </Link>
  </StyledLi>
);

type NavigationProps = {
  content: NavContent;
};

const Navigation = ({ content }: NavigationProps) => {
  const handleEmailClick = () => {
    window.location.href = content.contact.mailto;
  };

  return (
    <NavContainer>
      <Grid>
        <Logo />
        <NavList>
          {content.items.map((item) => (
            <NavItem key={item.href} href={item.href} label={item.label} />
          ))}
        </NavList>
        <Gridelement>
          <ContactButton onClick={handleEmailClick}>
            {content.contact.label}
          </ContactButton>
        </Gridelement>
      </Grid>
    </NavContainer>
  );
};

// Styled Components bleiben gleich
const NavContainer = styled.header`
  padding-top: 3.5rem;
  padding-bottom: 3.5em;
  opacity: 1;
  color: var(--dark);
  width: 100%;
  z-index: 999;
  top: 0;
  left: 0;
  position: relative;

  a {
    text-decoration: none;
    list-style-type: none;
    color: white;
    text-transform: lowercase;
  }

  a > span:hover {
    border-bottom: 0.2em solid white;
    transition-property: all;
    transition-duration: 0.2s;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  align-items: center; // Vertikale Ausrichtung
  @media (max-width: 500px) {
    display: flex;
    flex-direction: column;
  }
`;

const NavList = styled.ul`
  grid-column: 5 / span 4; // Zentrierte Positionierung im Grid
  display: flex;
  gap: clamp(10px, 10vw, 20vw);
  list-style: none;
  margin: 0;
  justify-content: center;
  align-items: center;
  font-size: clamp(12px, 1.5vw, 18px);
`;

const StyledLi = styled.li`
  a {
    text-decoration: none;
    transition: border-bottom 0.2s ease-in-out;
    padding: 0.2em 0; // padding to make border transition smooth

    &:hover {
      border-bottom: 2px solid currentColor;
    }
  }
`;
const Gridelement = styled.div`
  grid-column: 11 / auto;
`;

export default Navigation;
