import type { GptAgent } from '@/src/features/gpts/types';

// Aus der ChatGPT-GPT-Übersicht extrahiert.
// Quelle: Browser-Console-Export von https://chatgpt.com/gpts/mine
// Namen und Links wurden übernommen; Beschreibungen und Tags sind nachpflegbar.
export const gpts = [
  {
    id: 'g-jJbYx0BmU-doblin',
    name: 'Archivierte Fragmente',
    description:
      'Archivierte Fragmente: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-jJbYx0BmU-doblin',
    tags: ['ChatGPT', 'Roman'],
    visibility: 'link',
  },
  {
    id: 'g-6919da3ef98c8191908c51726abf8bc1-art-historian-and-prompt-analyzer-copy',
    name: 'Art Historian and Prompt Analyzer (copy)',
    description:
      'Art Historian and Prompt Analyzer (copy): eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-6919da3ef98c8191908c51726abf8bc1-art-historian-and-prompt-analyzer-copy',
    tags: ['ChatGPT', 'Design', 'Kunst'],
    visibility: 'link',
  },
  {
    id: 'g-tl1izoOLY-art-historian-and-prompt-analyzer',
    name: 'Ästhetische Affizierung in Kunst',
    description:
      'Ästhetische Affizierung in Kunst: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-tl1izoOLY-art-historian-and-prompt-analyzer',
    tags: ['ChatGPT', 'Design', 'Kunst'],
    visibility: 'link',
  },
  {
    id: 'g-692d622ccdd881918cf10365c76ad2c5-backend-entwickler',
    name: 'Backend Entwickler',
    description:
      'Backend Entwickler: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-692d622ccdd881918cf10365c76ad2c5-backend-entwickler',
    tags: ['ChatGPT', 'Entwicklung', 'Technik'],
    visibility: 'link',
  },
  {
    id: 'g-ZFkvgW2b5-blog-autor',
    name: 'Blog Autor',
    description:
      'Blog Autor: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-ZFkvgW2b5-blog-autor',
    tags: ['ChatGPT', 'Schreiben'],
    visibility: 'link',
  },
  {
    id: 'g-68ca83a244148191ae9ad9cb502983a4-breakfree',
    name: 'Breakfree',
    description:
      'Breakfree: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-68ca83a244148191ae9ad9cb502983a4-breakfree',
    tags: ['ChatGPT', 'Psychologie', 'Coaching'],
    visibility: 'link',
  },
  {
    id: 'g-4dA57llB2-charakterstudien-agent',
    name: 'Charakterstudien Agent',
    description:
      'Charakterstudien Agent: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-4dA57llB2-charakterstudien-agent',
    tags: ['ChatGPT', 'Roman'],
    visibility: 'link',
  },
  {
    id: 'g-683ef55ff2248191b3e52b0ee0cf092c-hamvas',
    name: 'Einsamkeit und Ent-Ichung',
    description:
      'Einsamkeit und Ent-Ichung: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-683ef55ff2248191b3e52b0ee0cf092c-hamvas',
    tags: ['ChatGPT', 'Philosophie'],
    visibility: 'link',
  },
  {
    id: 'g-IMBaKR7X5-elixir-mentor',
    name: 'Elixir Mentor',
    description:
      'Elixir Mentor: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-IMBaKR7X5-elixir-mentor',
    tags: ['ChatGPT', 'Coaching', 'Entwicklung', 'Technik'],
    visibility: 'link',
  },
  {
    id: 'g-694d7f1c21408191af684881a0b26635-emmas-coach',
    name: 'Emmas Coach',
    description:
      'Emmas Coach: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-694d7f1c21408191af684881a0b26635-emmas-coach',
    tags: ['ChatGPT', 'Psychologie', 'Coaching'],
    visibility: 'link',
  },
  {
    id: 'g-p-67f2b13553948191ae4a9a9e747b54fe-enneagramm-test',
    name: 'Enneagramm Test',
    description:
      'Enneagramm Test: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-p-67f2b13553948191ae4a9a9e747b54fe-enneagramm-test',
    tags: ['ChatGPT', 'Psychologie'],
    visibility: 'link',
  },
  {
    id: 'g-p-676599cd6da88191b72ed3a23fb76840-enneagramm-workshop',
    name: 'Enneagramm Workshop',
    description:
      'Enneagramm Workshop: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-p-676599cd6da88191b72ed3a23fb76840-enneagramm-workshop',
    tags: ['ChatGPT', 'Psychologie', 'Coaching'],
    visibility: 'link',
  },
  {
    id: 'g-68f892afe9a48191aa7195b25a236ce0-fotografie-guru',
    name: 'Fotografie Guru',
    description:
      'Fotografie Guru: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-68f892afe9a48191aa7195b25a236ce0-fotografie-guru',
    tags: ['ChatGPT', 'Design', 'Bild'],
    visibility: 'link',
  },
  {
    id: 'g-tVYrNtBMC-image2table',
    name: 'Fotografischer Stil Analyse',
    description:
      'Fotografischer Stil Analyse: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-tVYrNtBMC-image2table',
    tags: ['ChatGPT', 'Schreiben', 'Design', 'Bild'],
    visibility: 'link',
  },
  {
    id: 'g-68e363b99f8c81919ca1f5bdab65f64b-goethe',
    name: 'Goethe',
    description:
      'Goethe: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-68e363b99f8c81919ca1f5bdab65f64b-goethe',
    tags: ['ChatGPT', 'Schreiben'],
    visibility: 'link',
  },
  {
    id: 'g-68c59c23ba1c8191880a78c96088a0c4-grafikdesign',
    name: 'Grafikdesign',
    description:
      'Grafikdesign: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-68c59c23ba1c8191880a78c96088a0c4-grafikdesign',
    tags: ['ChatGPT', 'Design'],
    visibility: 'link',
  },
  {
    id: 'g-68a773fd39c08191be44648c9dd3f311-haberlin',
    name: 'Häberlin',
    description:
      'Häberlin: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-68a773fd39c08191be44648c9dd3f311-haberlin',
    tags: ['ChatGPT', 'Philosophie'],
    visibility: 'link',
  },
  {
    id: 'g-68c42e1c88508191a60349246aea53af-haberlin-als-erzieher',
    name: 'Häberlin als Erzieher',
    description:
      'Häberlin als Erzieher: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-68c42e1c88508191a60349246aea53af-haberlin-als-erzieher',
    tags: ['ChatGPT', 'Philosophie'],
    visibility: 'link',
  },
  {
    id: 'g-6995fd3cf9d88191b8adc2a030980e9f-hikam',
    name: 'Hikam',
    description:
      'Hikam: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-6995fd3cf9d88191b8adc2a030980e9f-hikam',
    tags: ['ChatGPT', 'Philosophie', 'Spiritualität'],
    visibility: 'link',
  },
  {
    id: 'g-68a493bafa708191a0651a72dd0d2375-json2position',
    name: 'JSON2POsition',
    description:
      'JSON2POsition: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-68a493bafa708191a0651a72dd0d2375-json2position',
    tags: ['ChatGPT', 'Entwicklung', 'Technik'],
    visibility: 'link',
  },
  {
    id: 'g-6989b78a7018819184a133d17a41b5f1-korpertherapie',
    name: 'Körpertherapie',
    description:
      'Körpertherapie: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-6989b78a7018819184a133d17a41b5f1-korpertherapie',
    tags: ['ChatGPT', 'Psychologie'],
    visibility: 'link',
  },
  {
    id: 'g-68d25e91da208191a6cb411697bc5358-kreativitats-guru',
    name: 'Kreativitäts Guru',
    description:
      'Kreativitäts Guru: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-68d25e91da208191a6cb411697bc5358-kreativitats-guru',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-69e651f2e7548191a94f73ad4bf06103-kunstler',
    name: 'Künstler',
    description:
      'Künstler: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-69e651f2e7548191a94f73ad4bf06103-kunstler',
    tags: ['ChatGPT', 'Design', 'Kunst'],
    visibility: 'link',
  },
  {
    id: 'g-69904d2879d0819180424e58cfb71084-lausberg-schreibwerkstatt',
    name: 'Lausberg-Schreibwerkstatt',
    description:
      'Lausberg-Schreibwerkstatt: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-69904d2879d0819180424e58cfb71084-lausberg-schreibwerkstatt',
    tags: ['ChatGPT', 'Schreiben'],
    visibility: 'link',
  },
  {
    id: 'g-68d98859f08481918e565fd97a157256-lia',
    name: 'Lia',
    description:
      'Lia: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-68d98859f08481918e565fd97a157256-lia',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-3YQlz0A9S-nlp-guru',
    name: 'NLP Guru',
    description:
      'NLP Guru: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-3YQlz0A9S-nlp-guru',
    tags: ['ChatGPT', 'Psychologie'],
    visibility: 'link',
  },
  {
    id: 'g-6999f6f9c92c819183eb2860cc303f74-nlp-guru',
    name: 'NLP GURU',
    description:
      'NLP GURU: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-6999f6f9c92c819183eb2860cc303f74-nlp-guru',
    tags: ['ChatGPT', 'Psychologie'],
    visibility: 'link',
  },
  {
    id: 'g-68499af632f08191905942c10bd7d5de-paul-haberlin-neu',
    name: 'Paul Häberlin (NEU!!!)',
    description:
      'Paul Häberlin (NEU!!!): eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-68499af632f08191905942c10bd7d5de-paul-haberlin-neu',
    tags: ['ChatGPT', 'Philosophie'],
    visibility: 'link',
  },
  {
    id: 'g-eZ2tlnBdy-pdfchat-brutalism',
    name: 'PDFChat Brutalism',
    description:
      'PDFChat Brutalism: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-eZ2tlnBdy-pdfchat-brutalism',
    tags: ['ChatGPT', 'Design', 'PDF'],
    visibility: 'link',
  },
  {
    id: 'g-68caf1e124e4819184a7171e4c16c405-photoshop-cs6',
    name: 'Photoshop CS6',
    description:
      'Photoshop CS6: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-68caf1e124e4819184a7171e4c16c405-photoshop-cs6',
    tags: ['ChatGPT', 'Design', 'Bild'],
    visibility: 'link',
  },
  {
    id: 'g-tTmmwuYMx-rothbard',
    name: 'Politische Probleme und Lösungen',
    description:
      'Politische Probleme und Lösungen: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-tTmmwuYMx-rothbard',
    tags: ['ChatGPT', 'Philosophie', 'Politik'],
    visibility: 'link',
  },
  {
    id: 'g-69401ce859948191af09e63675349bc0-psychologe',
    name: 'Psychologe',
    description:
      'Psychologe: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-69401ce859948191af09e63675349bc0-psychologe',
    tags: ['ChatGPT', 'Psychologie'],
    visibility: 'link',
  },
  {
    id: 'g-6970bcf9c91481918ecb4f7cc7b81fcb-psychologe2',
    name: 'Psychologe2',
    description:
      'Psychologe2: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-6970bcf9c91481918ecb4f7cc7b81fcb-psychologe2',
    tags: ['ChatGPT', 'Psychologie'],
    visibility: 'link',
  },
  {
    id: 'g-68efc4d0defc8191aa8bd1333034f6a5-react-guru',
    name: 'REACT GURU',
    description:
      'REACT GURU: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-68efc4d0defc8191aa8bd1333034f6a5-react-guru',
    tags: ['ChatGPT', 'Entwicklung', 'React'],
    visibility: 'link',
  },
  {
    id: 'g-nzapaPdOM-schreibgehilfe-mit-dunklen-absichten',
    name: 'Schreibgehilfe mit dunklen Absichten',
    description:
      'Schreibgehilfe mit dunklen Absichten: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-nzapaPdOM-schreibgehilfe-mit-dunklen-absichten',
    tags: ['ChatGPT', 'Schreiben'],
    visibility: 'link',
  },
  {
    id: 'g-p-6775a8effd6881919114ac425fa2924b-scum-romance',
    name: 'Scum Romance',
    description:
      'Scum Romance: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-p-6775a8effd6881919114ac425fa2924b-scum-romance',
    tags: ['ChatGPT', 'Roman'],
    visibility: 'link',
  },
  {
    id: 'g-p-684dd792ac188191a05fc68403cf5bb0-scum-romance-2025',
    name: 'Scum Romance 2025',
    description:
      'Scum Romance 2025: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-p-684dd792ac188191a05fc68403cf5bb0-scum-romance-2025',
    tags: ['ChatGPT', 'Roman'],
    visibility: 'link',
  },
  {
    id: 'g-684715f3d328819184b7cb8f2375bd81-scum-romance-helper',
    name: 'Scum Romance Helper',
    description:
      'Scum Romance Helper: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-684715f3d328819184b7cb8f2375bd81-scum-romance-helper',
    tags: ['ChatGPT', 'Roman'],
    visibility: 'link',
  },
  {
    id: 'g-6a0c8e14399c8191b669312a66912943-soziale-angst',
    name: 'Soziale Angst',
    description:
      'Soziale Angst: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-6a0c8e14399c8191b669312a66912943-soziale-angst',
    tags: ['ChatGPT', 'Psychologie'],
    visibility: 'link',
  },
  {
    id: 'g-68ee0d7339cc81918d9f2360e0343780-sql-guru',
    name: 'SQL Guru',
    description:
      'SQL Guru: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-68ee0d7339cc81918d9f2360e0343780-sql-guru',
    tags: ['ChatGPT', 'Entwicklung', 'Technik'],
    visibility: 'link',
  },
  {
    id: 'g-tN3ibbuNW-stil-wolfgang',
    name: 'Stil Wolfgang',
    description:
      'Stil Wolfgang: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-tN3ibbuNW-stil-wolfgang',
    tags: ['ChatGPT', 'Schreiben'],
    visibility: 'link',
  },
  {
    id: 'g-68e68f586adc8191940e623c76bc3991-stilberatung',
    name: 'Stilberatung',
    description:
      'Stilberatung: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-68e68f586adc8191940e623c76bc3991-stilberatung',
    tags: ['ChatGPT', 'Schreiben', 'Coaching'],
    visibility: 'link',
  },
  {
    id: 'g-68923382576081918ab6f8dd109a265e-stilkonig',
    name: 'Stilkönig',
    description:
      'Stilkönig: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-68923382576081918ab6f8dd109a265e-stilkonig',
    tags: ['ChatGPT', 'Schreiben'],
    visibility: 'link',
  },
  {
    id: 'g-69184dfa831481919d6c5bfbe8771633-subbrand-berater',
    name: 'Subbrand Berater',
    description:
      'Subbrand Berater: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-69184dfa831481919d6c5bfbe8771633-subbrand-berater',
    tags: ['ChatGPT', 'Coaching', 'Design'],
    visibility: 'link',
  },
  {
    id: 'g-690cdd08113c81918ab9ae5770f0d082-sufi-meister',
    name: 'Sufi-Meister',
    description:
      'Sufi-Meister: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-690cdd08113c81918ab9ae5770f0d082-sufi-meister',
    tags: ['ChatGPT', 'Philosophie', 'Spiritualität'],
    visibility: 'link',
  },
  {
    id: 'g-69fdae482f4481919123c7d4e04a4edd-synthese-agent',
    name: 'Synthese-Agent',
    description:
      'Synthese-Agent: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-69fdae482f4481919123c7d4e04a4edd-synthese-agent',
    tags: ['ChatGPT', 'Philosophie'],
    visibility: 'link',
  },
  {
    id: 'g-68616710a4388191923bf6eb97e0e84e-udo',
    name: 'UDO',
    description:
      'UDO: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-68616710a4388191923bf6eb97e0e84e-udo',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-689850c1672c8191bc3fe9587dc64037-ux-berater',
    name: 'UX Berater',
    description:
      'UX Berater: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-689850c1672c8191bc3fe9587dc64037-ux-berater',
    tags: ['ChatGPT', 'Coaching', 'Entwicklung', 'Design'],
    visibility: 'link',
  },
  {
    id: 'g-699c23f7910881919cf748003589d646-walter-haug',
    name: 'Walter Haug',
    description:
      'Walter Haug: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-699c23f7910881919cf748003589d646-walter-haug',
    tags: ['ChatGPT', 'Philosophie'],
    visibility: 'link',
  },
  {
    id: 'g-wgHq4WUFu-war-of-art-mentor',
    name: 'War of Art Mentor',
    description:
      'War of Art Mentor: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-wgHq4WUFu-war-of-art-mentor',
    tags: ['ChatGPT', 'Schreiben', 'Psychologie', 'Coaching'],
    visibility: 'link',
  },
  {
    id: 'g-68fca9be3d8c8191aad0908c9ed87d39-web-designer',
    name: 'Web Designer',
    description:
      'Web Designer: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-68fca9be3d8c8191aad0908c9ed87d39-web-designer',
    tags: ['ChatGPT', 'Entwicklung', 'Design'],
    visibility: 'link',
  },
  {
    id: 'g-68b49d448e088191892746267f2b3f44-wolfgang',
    name: 'Wolfgang',
    description:
      'Wolfgang: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-68b49d448e088191892746267f2b3f44-wolfgang',
    tags: ['ChatGPT', 'Schreiben'],
    visibility: 'link',
  },
] as const satisfies readonly GptAgent[];
