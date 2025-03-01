'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

function Typewriter() {
  const [text, setText] = useState('');
  const [initialTime, setInitialTime] = useState(15);
  const [timeLeft, setTimeLeft] = useState(0);
  const [started, setStarted] = useState(false);

  const textRef = useRef('');
  const startTimeRef = useRef(0);
  const endTimeRef = useRef(0);
  const rafRef = useRef(null);

  const updateTimer = useCallback(() => {
    if (!started) return;

    const now = performance.now();
    const elapsed = (now - startTimeRef.current) / 1000;
    const remaining = Math.max(0, endTimeRef.current - elapsed);

    setTimeLeft(Math.ceil(remaining));

    if (remaining <= 0) {
      setStarted(false);
      const blob = new Blob([textRef.current], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'typed_text.txt';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return;
    }

    rafRef.current = requestAnimationFrame(updateTimer);
  }, [started]);

  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Backspace' || event.key === 'Delete') {
      event.preventDefault();
    }
  }, []);

  const handleInput = useCallback((event) => {
    const newText = event.nativeEvent.data;
    if (newText !== null) {
      setText((prev) => {
        const updated = prev + newText;
        textRef.current = updated;
        return updated;
      });
    }
  }, []);

  const startWriting = useCallback(() => {
    setText('');
    textRef.current = '';
    startTimeRef.current = performance.now();
    endTimeRef.current = initialTime * 60;
    setTimeLeft(initialTime * 60);
    setStarted(true);
  }, [initialTime]);

  useEffect(() => {
    if (started) {
      rafRef.current = requestAnimationFrame(updateTimer);
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [started, updateTimer]);

  return (
    <div className="flex items-center justify-center h-screen w-4/5 relative font-sans">
      {!started ? (
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-2xl font-bold">Schreibzeit festlegen</h2>
          <label className="flex flex-col items-center gap-2">
            <span>Dauer (in Minuten):</span>
            <input
              type="number"
              value={initialTime}
              onChange={(e) =>
                setInitialTime(Math.max(1, Number(e.target.value)))
              }
              className="text-lg p-2 border rounded w-24 text-center"
              min="1"
            />
          </label>
          <button
            onClick={startWriting}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Start
          </button>
        </div>
      ) : (
        <div className="w-full h-full relative">
          <textarea
            value={text}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder="Beginne zu tippen..."
            autoFocus
            readOnly={timeLeft === 0}
            className="w-full h-full resize-none border-none outline-none p-5 text-lg font-mono bg-gray-50 text-gray-800"
          />
          <div className="absolute top-4 right-4 text-xl font-mono text-gray-600 bg-white/80 px-3 py-1 rounded-full shadow">
            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
          </div>
        </div>
      )}
    </div>
  );
}

export default Typewriter;
