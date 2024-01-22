// Definiert grundlegende Typen für Ihre Anwendung

export interface LikertLabel {
  text: string;
  value: number;
}

export interface Question {
  id: number;
  title: string;
  questionText: string;
  answerType: 'Likert' | 'Binary';
  influenceMapping: { [key: number]: { [dimension: string]: number } };
}

export type DimensionScores = {
  [key: string]: number;
  Innovativ: number;
  Traditionell: number;
  Projektorientiert: number;
  Prozessorientiert: number;
  Agil: number;
  Strukturiert: number;
  Bottom_up: number;
  Top_down: number;
};
