export interface DimensionScores {
  Innovativ: number;
  Traditionell: number;
  Projektorientiert: number;
  Prozessorientiert: number;
  Agil: number;
  Strukturiert: number;
  Bottom_up: number;
  Top_down: number;
}

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

export const initialScores: DimensionScores = {
  Innovativ: 0,
  Traditionell: 0,
  Projektorientiert: 0,
  Prozessorientiert: 0,
  Agil: 0,
  Strukturiert: 0,
  Bottom_up: 0,
  Top_down: 0,
};
export const likertSkalaLabels: LikertLabel[] = [
  { text: 'Stimme überhaupt nicht zu', value: -2 },
  { text: 'Stimme nicht zu', value: -1 },
  { text: 'Neutral', value: 0 },
  { text: 'Stimme zu', value: 1 },
  { text: 'Stimme voll und ganz zu', value: 2 },
];
export const Questions: Question[] = [
  {
    id: 1,
    title: 'Projekt oder Prozess',
    questionText:
      'Sind Sie auf der Suche nach einem Mitarbeiter, der sich hauptsächlich auf die wiederholte Durchführung spezifischer Prozesse konzentriert',
    answerType: 'Likert',
    influenceMapping: {
      '-2': { Projektorientiert: 2 },
      '-1': { Projektorientiert: 1 },
      '1': { Prozessorientiert: 1 },
      '2': { Prozessorientiert: 2 },
    },
  },
  {
    id: 2,
    title: 'Projekt oder Prozess',
    questionText:
      'Sie benötigen jemanden, der sich flexibel auf neue Projekte und unterschiedliche Wissensbereiche einstellen und diese eigenständig umsetzen kann?',
    answerType: 'Likert',
    influenceMapping: {
      '-1': { Prozessorientiert: 1 },
      '-2': { Prozessorientiert: 2 },
      '1': { Projektorientiert: 1 },
      '2': { Projektorientiert: 2 },
    },
  },
  {
    id: 3,
    title: 'Innovation',
    questionText:
      'Ihr Unternehmen fördert die Mitarbeiter dazu innovativ zu sein und sich nicht mit dem Status quo zufriedenzugeben.',
    answerType: 'Likert',
    influenceMapping: {
      '-2': { Traditionell: 2 },
      '-1': { Traditionell: 1 },
      '1': { Innovativ: 1 },
      '2': { Innovativ: 2 },
    },
  },

  {
    id: 4,
    title: 'Technologischer Fortschritt',
    questionText:
      'Die Anwendung neuester Technologien und Methoden spielt eine zentrale Rolle in der Kultur Ihres Unternehmens?',
    answerType: 'Likert',
    influenceMapping: {
      '-2': { Traditionell: 2 },
      '-1': { Traditionell: 1 },
      '1': { Innovativ: 1 },
      '2': { Innovativ: 2 },
    },
  },
  {
    id: 5,
    title: 'Lernen und Entwicklung',
    questionText:
      'Ihr Unternehmen unterstützt die individuelle Selbstentwicklung der Mitarbeiter und fördert ein Umfeld des selbstgesteuerten Lernens?',
    answerType: 'Likert',
    influenceMapping: {
      '-2': { Strukturiert: 2, Top_down: 2 },
      '-1': { Strukturiert: 1, Top_down: 1 },
      '1': { Agil: 1, Bottom_up: 1 },
      '2': { Agil: 2, Bottom_up: 2 },
    },
  },

  {
    id: 6,
    title: 'Teamstruktur',
    questionText:
      'Bei neuen Projekten verändert sich in Ihrem Unternehmen regelmäßig die Teamzusammensetzung und auch die Verantwortlichkeiten und Rollen der Teammitglieder sind ständig im Wandel.',
    answerType: 'Likert',
    influenceMapping: {
      '-2': { Strukturiert: 2, Prozessorientiert: 2 },
      '-1': { Strukturiert: 1, Prozessorientiert: 1 },
      '1': { Agil: 1, Projektorientiert: 1 },
      '2': { Agil: 2, Projektorientiert: 2 },
    },
  },
  {
    id: 7,
    title: 'Projektarbeit',
    questionText:
      'In Ihrem Unternehmen werden Projekte so organisiert, dass Mitarbeiter aus verschiedenen Fachbereichen zusammenwirken und ihre spezifischen Fachkenntnisse einbringen.',
    answerType: 'Likert',
    influenceMapping: {
      '-2': { Strukturiert: 2, Top_down: 2 },
      '-1': { Strukturiert: 1, Top_down: 1 },
      '1': { Agil: 1, Bottom_up: 1 },
      '2': { Agil: 2, Bottom_up: 2 },
    },
  },
  {
    id: 8,
    title: 'Staat oder Privat',
    questionText:
      'Ihr Unternehmen bevorzugt die Zusammenarbeit mit der Privatwirtschaft gegenüber staatlichen Institutionen.',
    answerType: 'Likert',
    influenceMapping: {
      '-2': { Traditionell: 3 }, // 'Stimme überhaupt nicht zu' führt zu +2 auf Traditionell
      '-1': { Traditionell: 2 }, // 'Stimme nicht zu' führt zu +1 auf Traditionell
      '1': { Innovativ: 2 }, // 'Stimme zu' führt zu +1 auf Innovativ
      '2': { Innovativ: 3 }, // 'Stimme voll und ganz zu' führt zu +2 auf Innovativ
    },
  },
  {
    id: 9,
    title: 'Teamdynamik und Einzelarbeit',
    questionText:
      'Ihr Unternehmen bietet eine ausgewogene Mischung aus Teamarbeit und der Möglichkeit, individuell zu arbeiten.',
    answerType: 'Likert',
    influenceMapping: {
      '-2': { Strukturiert: 2, Top_down: 2 },
      '-1': { Strukturiert: 1, Top_down: 1 },
      '1': { Agil: 1, Bottom_up: 1 },
      '2': { Agil: 2, Bottom_up: 2 },
    },
  },
  {
    id: 10,
    title: 'Idealismus',
    questionText:
      'Ihr Unternehmen arbeitet bevorzugt an Projekten, die sich auf die Verwirklichung höherer Ideale konzentrieren, wie etwa die Förderung des menschlichen Geistes, der Selbsterkenntnis und der Entwicklung von Gemeinschaften.',
    answerType: 'Likert',
    influenceMapping: {
      '-2': { Traditionell: 5 },
      '-1': { Traditionell: 3 },
      '1': { Innovativ: 3 },
      '2': { Innovativ: 5 },
    },
  },
  {
    id: 11,
    title: 'Bitcoin',
    questionText:
      'Bitcoin spielt bereits eine Rolle in einigen Ihrer Projekte und die Adaption und Implementierung von Bitcoin ist bereits Teil Ihrer langfristigen strategischen Planung.',
    answerType: 'Likert',
    influenceMapping: {
      '-2': { Traditionell: 5 },
      '-1': { Traditionell: 3 },
      '1': { Innovativ: 3 },
      '2': { Innovativ: 5 },
    },
  },
];
