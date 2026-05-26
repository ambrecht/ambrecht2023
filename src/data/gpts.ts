import type { GptAgent } from '@/src/features/gpts/types';

export const gpts = [
  {
    id: 'react-guru',
    name: 'REACT GURU',
    description:
      'Hilft bei React-Architektur, Komponenten-Design, State-Management und sauberer Next.js-Umsetzung.',
    url: 'https://chatgpt.com/g/g-react-guru',
    tags: ['React', 'Next.js', 'TypeScript', 'Frontend'],
    visibility: 'link',
    favorite: true,
  },
  {
    id: 'prompt-architect',
    name: 'Prompt Architect',
    description:
      'Entwirft robuste Prompts, Systemanweisungen und Arbeitsabläufe für produktive KI-Workflows.',
    url: 'https://chatgpt.com/g/g-prompt-architect',
    tags: ['Prompting', 'AI', 'Strategie'],
    visibility: 'private',
    favorite: true,
  },
  {
    id: 'seo-assistant',
    name: 'SEO Assistant',
    description:
      'Unterstützt bei Keyword-Clustern, Seitentiteln, Meta-Descriptions und Content-Briefings.',
    url: 'https://chatgpt.com/g/g-seo-assistant',
    tags: ['SEO', 'Content', 'Marketing'],
    visibility: 'link',
  },
  {
    id: 'schreibcoach',
    name: 'Schreibcoach',
    description:
      'Schärft Texte, Tonalität und Argumentationslinien für Essays, Websites und Fachartikel.',
    url: 'https://chatgpt.com/g/g-schreibcoach',
    tags: ['Schreiben', 'Redaktion', 'Deutsch'],
    visibility: 'private',
  },
  {
    id: 'code-reviewer',
    name: 'Code Reviewer',
    description:
      'Prüft Pull Requests auf Bugs, Wartbarkeit, Security-Risiken und fehlende Randfälle.',
    url: 'https://chat.openai.com/g/g-code-reviewer',
    tags: ['Code', 'Review', 'Security', 'TypeScript'],
    visibility: 'public',
  },
] as const satisfies readonly GptAgent[];
