'use client';
// lib/context/SessionContext.tsx
import React, { createContext, useReducer, useContext, ReactNode } from 'react';

// Typdefinitionen
interface SessionState {
  content: string;
  isLocked: boolean;
  wordCount: number;
  lastSavedAt: Date | null;
}

type SessionAction =
  | { type: 'APPEND_CONTENT'; payload: string }
  | { type: 'SET_CONTENT'; payload: string }
  | { type: 'LOCK_SESSION' }
  | { type: 'UNLOCK_SESSION' }
  | { type: 'UPDATE_WORD_COUNT'; payload: number }
  | { type: 'UPDATE_LAST_SAVED'; payload: Date };

interface SessionContextType {
  state: SessionState;
  dispatch: React.Dispatch<SessionAction>;
}

// Initialer Zustand
const initialState: SessionState = {
  content: '',
  isLocked: false,
  wordCount: 0,
  lastSavedAt: null,
};

// Reducer-Funktion
const sessionReducer = (
  state: SessionState,
  action: SessionAction,
): SessionState => {
  switch (action.type) {
    case 'APPEND_CONTENT':
      return {
        ...state,
        content: state.content + action.payload,
      };
    case 'SET_CONTENT':
      return {
        ...state,
        content: action.payload,
      };
    case 'LOCK_SESSION':
      return {
        ...state,
        isLocked: true,
      };
    case 'UNLOCK_SESSION':
      return {
        ...state,
        isLocked: false,
      };
    case 'UPDATE_WORD_COUNT':
      return {
        ...state,
        wordCount: action.payload,
      };
    case 'UPDATE_LAST_SAVED':
      return {
        ...state,
        lastSavedAt: action.payload,
      };
    default:
      return state;
  }
};

// Context erstellen
const SessionContext = createContext<SessionContextType | undefined>(undefined);

// Provider-Komponente
export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(sessionReducer, initialState);

  // Beim Mounten wird der localStorage ausgelesen, um gespeicherten Inhalt wiederherzustellen
  React.useEffect(() => {
    const savedContent = localStorage.getItem('sessionContent');
    if (savedContent) {
      dispatch({ type: 'SET_CONTENT', payload: savedContent });
    }
  }, []);

  return (
    <SessionContext.Provider value={{ state, dispatch }}>
      {children}
    </SessionContext.Provider>
  );
};

// Hook für einfachen Zugriff auf den Context
export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error(
      'useSession muss innerhalb eines SessionProviders verwendet werden',
    );
  }
  return context;
};
