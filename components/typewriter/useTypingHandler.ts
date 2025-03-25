import { useCallback } from 'react';
import { useTypewriterStore } from './store';

export function useTypingHandler() {
  const { activeLine, setActiveLine, addLineToStack, maxCharsPerLine, lines } =
    useTypewriterStore();

  const processCharacter = useCallback(
    (char: string) => {
      if (activeLine.length >= maxCharsPerLine) {
        const lastSpaceIndex = activeLine.lastIndexOf(' ');
        if (lastSpaceIndex > maxCharsPerLine * 0.7) {
          const lineToAdd = activeLine.substring(0, lastSpaceIndex);
          const remaining = activeLine.substring(lastSpaceIndex + 1);
          setActiveLine(remaining + char);
          useTypewriterStore.setState((state) => ({
            lines: [...state.lines, lineToAdd],
          }));
        } else {
          addLineToStack();
          setActiveLine(char);
        }
      } else {
        setActiveLine(activeLine + char);
      }
    },
    [activeLine, addLineToStack, maxCharsPerLine, setActiveLine, lines],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addLineToStack();
        return;
      }

      if (e.key === 'Backspace') {
        e.preventDefault();
        if (activeLine.length > 0) {
          setActiveLine(activeLine.substring(0, activeLine.length - 1));
        }
        return;
      }

      if (
        [
          'ArrowLeft',
          'ArrowRight',
          'ArrowUp',
          'ArrowDown',
          'Home',
          'End',
          'PageUp',
          'PageDown',
        ].includes(e.key)
      ) {
        e.preventDefault();
        return;
      }

      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        processCharacter(e.key);
      }
    },
    [addLineToStack, activeLine, processCharacter, setActiveLine],
  );

  return { handleKeyDown };
}
