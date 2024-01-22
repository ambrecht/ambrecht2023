import styled from 'styled-components';

interface InputButtonProps {
  label: string;
  onClick: () => void;
}

const InputButton: React.FC<InputButtonProps> = ({ label, onClick }) => {
  return (
    <Button onClick={onClick}>
      <Text>{label}</Text>
    </Button>
  );
};

//STYLE
const Text = styled.span`
  background: linear-gradient(
    72.61deg,
    rgba(0, 130, 255, 1) 22.63%,
    rgba(79, 5, 245, 1) 84.67%
  );
  color: transparent;
  -webkit-background-clip: text;
  font-weight: 600;
  line-height: 1rem;
  letter-spacing: 0.1rem;
  text-transform: lowercase;
`;

const Button = styled.button`
  cursor: inherit;
  font-size: clamp(1em, 1vw, 100px);
  padding: 0.7em 1em;
  border-radius: 3em;
  border: solid 0.2em transparent;
  background-image: linear-gradient(
      rgba(255, 255, 255, 0),
      rgba(255, 255, 255, 0)
    ),
    linear-gradient(
      72.61deg,
      rgba(0, 130, 255, 1) 22.63%,
      rgba(79, 5, 245, 1) 84.67%
    );
  background-origin: border-box;
  background-clip: content-box, border-box;
  box-shadow: 2em 100em 1em white inset;
  transition-property: all;
  transition-duration: 0.5s;
  text-transform: lowercase;

  &:hover {
    box-shadow: none;
    ${Text} {
      color: white;
    }
  }
`;

export default InputButton;
