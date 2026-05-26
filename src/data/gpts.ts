import type { GptAgent } from '@/src/features/gpts/types';

// Aus der ChatGPT-GPT-Übersicht extrahiert.
// Quelle: Browser-Console-Export von https://chatgpt.com/gpts/mine
// Namen, Beschreibungen und Links wurden aus dem DOM-Export übernommen.
export const gpts = [
  {
    id: 'g-oqOY4s5CJ-alfred',
    name: 'Alfred',
    description: 'Senior JavaScript programmer and mentor.',
    url: 'https://chatgpt.com/g/g-oqOY4s5CJ-alfred',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-xv3LUtCs2-ambrecht-de',
    name: 'ambrecht.de',
    description: 'Blogautor',
    url: 'https://chatgpt.com/g/g-xv3LUtCs2-ambrecht-de',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-68179a3b1ea881919bf8eecce9c734f8-antieinstein',
    name: 'AntiEinstein',
    description:
      'AntiEinstein: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-68179a3b1ea881919bf8eecce9c734f8-antieinstein',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-i1clROU88-arno-schmidt',
    name: 'Arno Schmidt',
    description:
      'Arno Schmidt: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-i1clROU88-arno-schmidt',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-tl1izoOLY-art-historian-and-prompt-analyzer',
    name: 'Art Historian and Prompt Analyzer',
    description: 'Analyzing and crafting art prompts with historical insight',
    url: 'https://chatgpt.com/g/g-tl1izoOLY-art-historian-and-prompt-analyzer',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-6919da3ef98c8191908c51726abf8bc1-art-historian-and-prompt-analyzer-copy',
    name: 'Art Historian and Prompt Analyzer (copy)',
    description: 'Analyzing and crafting art prompts with historical insight',
    url: 'https://chatgpt.com/g/g-6919da3ef98c8191908c51726abf8bc1-art-historian-and-prompt-analyzer-copy',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-0z9VeRSAE-attar',
    name: 'Attar',
    description: 'Weisheitslehrer und Sufimeister',
    url: 'https://chatgpt.com/g/g-0z9VeRSAE-attar',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-692d622ccdd881918cf10365c76ad2c5-backend-entwickler',
    name: 'Backend Entwickler',
    description:
      'Backend Entwickler: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-692d622ccdd881918cf10365c76ad2c5-backend-entwickler',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-ZoO6Gez9o-basecamp-mentor',
    name: 'Basecamp Mentor',
    description: "Analyzing 'Getting Real' document for every response",
    url: 'https://chatgpt.com/g/g-ZoO6Gez9o-basecamp-mentor',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-AFnuGpnAV-bike-trainer',
    name: 'Bike Trainer',
    description:
      'Bike Trainer: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-AFnuGpnAV-bike-trainer',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-6835c2391e04819199c16c31c52834df-bitcoin-guru',
    name: 'Bitcoin Guru',
    description:
      'Bitcoin Guru: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-6835c2391e04819199c16c31c52834df-bitcoin-guru',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-ZFkvgW2b5-blog-autor',
    name: 'Blog Autor',
    description:
      'Blog Autor: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-ZFkvgW2b5-blog-autor',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-68ca83a244148191ae9ad9cb502983a4-breakfree',
    name: 'Breakfree',
    description:
      'Breakfree: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-68ca83a244148191ae9ad9cb502983a4-breakfree',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-pwt6EzGqB-casey',
    name: 'Casey',
    description: 'Provides tech case study advice in German',
    url: 'https://chatgpt.com/g/g-pwt6EzGqB-casey',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-yUUKa8W0F-charakterpsychologie',
    name: 'Charakterpsychologie',
    description:
      'Charakterpsychologie: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-yUUKa8W0F-charakterpsychologie',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-4dA57llB2-charakterstudien-agent',
    name: 'Charakterstudien Agent',
    description:
      'Charakterstudien Agent: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-4dA57llB2-charakterstudien-agent',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-L8GZRbBmt-codebot',
    name: 'Codebot',
    description: 'Senior Software Engineer GPT with Style Guide Expertise',
    url: 'https://chatgpt.com/g/g-L8GZRbBmt-codebot',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-75VVyOagZ-content-creator',
    name: 'Content Creator',
    description:
      'Content Creator: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-75VVyOagZ-content-creator',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-eP4jqixFO-css-prodigy',
    name: 'CSS Prodigy',
    description:
      'Expert in CSS, providing in-depth guidance on responsive and accessible design.',
    url: 'https://chatgpt.com/g/g-eP4jqixFO-css-prodigy',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-EqQBiV1tR-d3-js-ninja',
    name: 'D3.js Ninja',
    description:
      'D3.js Ninja: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-EqQBiV1tR-d3-js-ninja',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-jJbYx0BmU-doblin',
    name: 'Döblin',
    description:
      "Embody Alfred Döblin's radical style, analyzing and refining texts in his modernist voice.",
    url: 'https://chatgpt.com/g/g-jJbYx0BmU-doblin',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-R6cPfphXo-donald-miller',
    name: 'Donald Miller',
    description:
      "Expert in 'StoryBrand', 'Strong Brands', and 'Brand Strategy Canvas', advising on branding and marketing.",
    url: 'https://chatgpt.com/g/g-R6cPfphXo-donald-miller',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-9ZzoYfgIu-edward-bernays',
    name: 'Edward Bernays',
    description:
      'Edward Bernays: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-9ZzoYfgIu-edward-bernays',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-6750b65f9ac48191ab1429d1637dbc96-einzelhandels-guru',
    name: 'Einzelhandels Guru',
    description:
      'Einzelhandels Guru: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-6750b65f9ac48191ab1429d1637dbc96-einzelhandels-guru',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-IMBaKR7X5-elixir-mentor',
    name: 'Elixir Mentor',
    description:
      'Elixir Mentor: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-IMBaKR7X5-elixir-mentor',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-694d7f1c21408191af684881a0b26635-emmas-coach',
    name: 'Emmas Coach',
    description:
      'Emmas Coach: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-694d7f1c21408191af684881a0b26635-emmas-coach',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-6827289ebf8881918b14adb5212404bc-erinnerung',
    name: 'Erinnerung',
    description:
      'Erinnerung: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-6827289ebf8881918b14adb5212404bc-erinnerung',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-v6qbPt9w6-erklarbar-fur-webtechnologien',
    name: 'Erklärbär für Webtechnologien',
    description:
      'Erklärbär für Webtechnologien: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-v6qbPt9w6-erklarbar-fur-webtechnologien',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-4ua0IvRUs-event-expert',
    name: 'Event Expert',
    description:
      'Event Expert: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-4ua0IvRUs-event-expert',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-68f892afe9a48191aa7195b25a236ce0-fotografie-guru',
    name: 'Fotografie Guru',
    description:
      'Fotografie Guru: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-68f892afe9a48191aa7195b25a236ce0-fotografie-guru',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-p-676599cd6da88191b72ed3a23fb76840-enneagramm-workshop',
    name: 'g-p-676599cd6da88191b72ed3a23fb76840-enneagramm-workshop',
    description:
      'g-p-676599cd6da88191b72ed3a23fb76840-enneagramm-workshop: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-p-676599cd6da88191b72ed3a23fb76840-enneagramm-workshop',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-p-6775a8effd6881919114ac425fa2924b-scum-romance',
    name: 'g-p-6775a8effd6881919114ac425fa2924b-scum-romance',
    description:
      'g-p-6775a8effd6881919114ac425fa2924b-scum-romance: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-p-6775a8effd6881919114ac425fa2924b-scum-romance',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-p-67f2b13553948191ae4a9a9e747b54fe-enneagramm-test',
    name: 'g-p-67f2b13553948191ae4a9a9e747b54fe-enneagramm-test',
    description:
      'g-p-67f2b13553948191ae4a9a9e747b54fe-enneagramm-test: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-p-67f2b13553948191ae4a9a9e747b54fe-enneagramm-test',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-p-684dd792ac188191a05fc68403cf5bb0-scum-romance-2025',
    name: 'g-p-684dd792ac188191a05fc68403cf5bb0-scum-romance-2025',
    description:
      'g-p-684dd792ac188191a05fc68403cf5bb0-scum-romance-2025: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-p-684dd792ac188191a05fc68403cf5bb0-scum-romance-2025',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-67c5ddf43ccc8191aab310fe341d0c5c-gea-sales-machine',
    name: 'GEA Sales Machine',
    description:
      'GEA Sales Machine: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-67c5ddf43ccc8191aab310fe341d0c5c-gea-sales-machine',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-gHPgyjYMG-general-algo',
    name: 'General Algo',
    description: 'Mentor for structured algorithm development',
    url: 'https://chatgpt.com/g/g-gHPgyjYMG-general-algo',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-7td15HCSB-geschaftnachrichtenautomat',
    name: 'Geschäftnachrichtenautomat',
    description: 'Expert in crafting professional business emails',
    url: 'https://chatgpt.com/g/g-7td15HCSB-geschaftnachrichtenautomat',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-4LRvdfoi4-go-experte',
    name: 'Go Experte',
    description:
      'Experte, Lehrer und fleißiger Arbeiter für Go-Programmierung.',
    url: 'https://chatgpt.com/g/g-4LRvdfoi4-go-experte',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-68e363b99f8c81919ca1f5bdab65f64b-goethe',
    name: 'Goethe',
    description:
      'Antwortet als Goethe mit klassischem Duktus und zitiergestützter Werkkenntnis.',
    url: 'https://chatgpt.com/g/g-68e363b99f8c81919ca1f5bdab65f64b-goethe',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-68c59c23ba1c8191880a78c96088a0c4-grafikdesign',
    name: 'Grafikdesign',
    description:
      'Grafikdesign: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-68c59c23ba1c8191880a78c96088a0c4-grafikdesign',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-wucTxe9Zv-guide-to-freedom',
    name: 'Guide to freedom',
    description:
      'You are an AI Agent designed to act as a financial and lifestyle coach, leveraging the principles and insights from The Sovereign Individual by James Dale Davidson and William Rees-Mogg, and Early Retirement Extreme by Jacob Lund Fisker.',
    url: 'https://chatgpt.com/g/g-wucTxe9Zv-guide-to-freedom',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-68a773fd39c08191be44648c9dd3f311-haberlin',
    name: 'Häberlin',
    description: 'Universal scholar, vast lexicon',
    url: 'https://chatgpt.com/g/g-68a773fd39c08191be44648c9dd3f311-haberlin',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-68c42e1c88508191a60349246aea53af-haberlin-als-erzieher',
    name: 'Häberlin als Erzieher',
    description: 'Universal scholar, vast lexicon',
    url: 'https://chatgpt.com/g/g-68c42e1c88508191a60349246aea53af-haberlin-als-erzieher',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-683ef55ff2248191b3e52b0ee0cf092c-hamvas',
    name: 'Hamvas',
    description:
      'Hamvas: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-683ef55ff2248191b3e52b0ee0cf092c-hamvas',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-6995fd3cf9d88191b8adc2a030980e9f-hikam',
    name: 'Hikam',
    description:
      'Hikam: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-6995fd3cf9d88191b8adc2a030980e9f-hikam',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-683d75191e7c81919b20e9e7d5b7dfb0-holderlin',
    name: 'Hölderlin',
    description:
      'Hölderlin: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-683d75191e7c81919b20e9e7d5b7dfb0-holderlin',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-tVYrNtBMC-image2table',
    name: 'Image2Table',
    description:
      'Verwandelt Bilder in detalierte Tabellen aus Eigenschaften etc.',
    url: 'https://chatgpt.com/g/g-tVYrNtBMC-image2table',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-ixGv4HDUe-ivan-the-web-project-manager',
    name: 'Ivan, the Web Project Manager',
    description:
      'Senior web dev guiding projects with a decisive, motivational style.',
    url: 'https://chatgpt.com/g/g-ixGv4HDUe-ivan-the-web-project-manager',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-eMS4vRN0T-javascript-ninja',
    name: 'Javascript Ninja',
    description:
      'Javascript Ninja: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-eMS4vRN0T-javascript-ninja',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-68a493bafa708191a0651a72dd0d2375-json2position',
    name: 'JSON2POsition',
    description:
      'JSON2POsition: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-68a493bafa708191a0651a72dd0d2375-json2position',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-SVk5Njknd-jtl-shop-code-analyst-and-modernizer',
    name: 'JTL Shop Code Analyst and Modernizer',
    description: 'Expert in JTL Shop customizations and API integration',
    url: 'https://chatgpt.com/g/g-SVk5Njknd-jtl-shop-code-analyst-and-modernizer',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-68448372db5481918232043bfd8b4a60-kafka',
    name: 'Kafka',
    description:
      'Kafka: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-68448372db5481918232043bfd8b4a60-kafka',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-676c2d3587088191ba359ffabd1c8793-klaus-schonbach',
    name: 'Klaus Schönbach',
    description:
      'Klaus Schönbach: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-676c2d3587088191ba359ffabd1c8793-klaus-schonbach',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-6989b78a7018819184a133d17a41b5f1-korpertherapie',
    name: 'Körpertherapie',
    description:
      'Körpertherapie: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-6989b78a7018819184a133d17a41b5f1-korpertherapie',
    tags: ['ChatGPT', 'Importiert'],
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
    id: 'g-67fac58db6788191a0f4de3dd5f463af-kundera',
    name: 'Kundera',
    description:
      'Kundera: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-67fac58db6788191a0f4de3dd5f463af-kundera',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-69e651f2e7548191a94f73ad4bf06103-kunstler',
    name: 'Künstler',
    description:
      'Künstler: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-69e651f2e7548191a94f73ad4bf06103-kunstler',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-rihaNRG2o-kurt-godel',
    name: 'Kurt Gödel',
    description:
      'Kurt Gödel: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-rihaNRG2o-kurt-godel',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-69904d2879d0819180424e58cfb71084-lausberg-schreibwerkstatt',
    name: 'Lausberg-Schreibwerkstatt',
    description:
      'Lausberg-Schreibwerkstatt: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-69904d2879d0819180424e58cfb71084-lausberg-schreibwerkstatt',
    tags: ['ChatGPT', 'Importiert'],
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
    id: 'g-Naqw1AsYQ-literatur-coach',
    name: 'Literatur Coach',
    description:
      'Literatur-Experte für Spannungsbögen und literarische Analysen',
    url: 'https://chatgpt.com/g/g-Naqw1AsYQ-literatur-coach',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-dAMfWK903-llc-guru',
    name: 'LLC Guru',
    description:
      'LLC Guru: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-dAMfWK903-llc-guru',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-8sRcbzlbV-llm-guru-und-prombtgenerator',
    name: 'LLM Guru und Prombtgenerator',
    description:
      'LLM Guru und Prombtgenerator: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-8sRcbzlbV-llm-guru-und-prombtgenerator',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-iW4GIlhxm-mafiaboxx',
    name: 'Mafiaboxx',
    description:
      'Mafiaboxx: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-iW4GIlhxm-mafiaboxx',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-PRdC6oVob-magento-2',
    name: 'Magento 2',
    description:
      'Magento 2: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-PRdC6oVob-magento-2',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-zXzk9kAnq-magento-guru',
    name: 'Magento Guru',
    description:
      'Expert in Magento 2 development for advanced users, with deep file analysis.',
    url: 'https://chatgpt.com/g/g-zXzk9kAnq-magento-guru',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-6755cff834608191abed997645c52302-mantak-chia',
    name: 'Mantak Chia',
    description:
      'Mantak Chia: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-6755cff834608191abed997645c52302-mantak-chia',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-678d48fbb56c819186ff0e54526a0478-meditations-guru',
    name: 'Meditations Guru',
    description:
      'Meditations Guru: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-678d48fbb56c819186ff0e54526a0478-meditations-guru',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-677197d5830081919c2667df73a5ea47-meister-eckhart',
    name: 'Meister Eckhart',
    description:
      'Meister Eckhart: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-677197d5830081919c2667df73a5ea47-meister-eckhart',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-gJo9nf6xt-nafea-lou',
    name: 'Nafea Lou',
    description:
      'Nafea Lou: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-gJo9nf6xt-nafea-lou',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-7KG5xHmHZ-nafeah-louh',
    name: 'Nafeah Louh',
    description:
      'Nafeah Louh: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-7KG5xHmHZ-nafeah-louh',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-3YQlz0A9S-nlp-guru',
    name: 'NLP Guru',
    description:
      'NLP Guru: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-3YQlz0A9S-nlp-guru',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-6999f6f9c92c819183eb2860cc303f74-nlp-guru',
    name: 'NLP GURU',
    description:
      'NLP GURU: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-6999f6f9c92c819183eb2860cc303f74-nlp-guru',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-FEHLiBlPD-obsedian-assistent',
    name: 'Obsedian Assistent',
    description:
      'Obsidian note expert for creating structured markdown files on books',
    url: 'https://chatgpt.com/g/g-FEHLiBlPD-obsedian-assistent',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-676bd9251154819183fd2a46144f258c-oliver-ritter',
    name: 'Oliver Ritter',
    description:
      'Oliver Ritter: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-676bd9251154819183fd2a46144f258c-oliver-ritter',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-0sMwvTH7i-passion-coach',
    name: 'Passion Coach',
    description:
      'Passion Coach: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-0sMwvTH7i-passion-coach',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-KKnaNN6Sj-paul-haberlin',
    name: 'Paul Häberlin',
    description: 'Universal scholar, vast lexicon',
    url: 'https://chatgpt.com/g/g-KKnaNN6Sj-paul-haberlin',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-cnmRkVWfu-paul-haberlin-copy',
    name: 'Paul Häberlin (copy)',
    description: 'Universal scholar, vast lexicon',
    url: 'https://chatgpt.com/g/g-cnmRkVWfu-paul-haberlin-copy',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-68499af632f08191905942c10bd7d5de-paul-haberlin-neu',
    name: 'Paul Häberlin (NEU!!!)',
    description: 'Universal scholar, vast lexicon',
    url: 'https://chatgpt.com/g/g-68499af632f08191905942c10bd7d5de-paul-haberlin-neu',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-eZ2tlnBdy-pdfchat-brutalism',
    name: 'PDFChat Brutalism',
    description:
      'PDFChat Brutalism: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-eZ2tlnBdy-pdfchat-brutalism',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-68caf1e124e4819184a7171e4c16c405-photoshop-cs6',
    name: 'Photoshop CS6',
    description:
      'Photoshop CS6: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-68caf1e124e4819184a7171e4c16c405-photoshop-cs6',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-68402f28798881918b4ce2d01d8800b2-platon',
    name: 'Platon',
    description:
      'Platon: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-68402f28798881918b4ce2d01d8800b2-platon',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-680620373d08819188af5b5dc338ad32-plotin',
    name: 'Plotin',
    description:
      'Plotin: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-680620373d08819188af5b5dc338ad32-plotin',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-1423ToW4V-powershell-guru',
    name: 'Powershell Guru',
    description:
      'Powershell Guru: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-1423ToW4V-powershell-guru',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-Au8062Yif-prombt-generator',
    name: 'Prombt Generator',
    description:
      'Prombt Generator: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-Au8062Yif-prombt-generator',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-69401ce859948191af09e63675349bc0-psychologe',
    name: 'Psychologe',
    description:
      'Psychologe: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-69401ce859948191af09e63675349bc0-psychologe',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-6970bcf9c91481918ecb4f7cc7b81fcb-psychologe2',
    name: 'Psychologe2',
    description:
      'Psychologe2: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-6970bcf9c91481918ecb4f7cc7b81fcb-psychologe2',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-iul0uY9Vq-python-guru',
    name: 'Python Guru',
    description:
      'Python Guru: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-iul0uY9Vq-python-guru',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-68efc4d0defc8191aa8bd1333034f6a5-react-guru',
    name: 'REACT GURU',
    description:
      'REACT GURU: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-68efc4d0defc8191aa8bd1333034f6a5-react-guru',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-tTmmwuYMx-rothbard',
    name: 'Rothbard',
    description:
      'Rothbard: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-tTmmwuYMx-rothbard',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-zub1uZF2S-rucksichtsvoller-web-entwickler',
    name: 'Rücksichtsvoller Web-Entwickler',
    description:
      'Expert in creating complex HTML/CSS with latest web standards.',
    url: 'https://chatgpt.com/g/g-zub1uZF2S-rucksichtsvoller-web-entwickler',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-7uECsIODx-satoshi-nakamoto',
    name: 'Satoshi Nakamoto',
    description:
      'Satoshi Nakamoto explains Bitcoin in detail using the Feynman method.',
    url: 'https://chatgpt.com/g/g-7uECsIODx-satoshi-nakamoto',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-nzapaPdOM-schreibgehilfe-mit-dunklen-absichten',
    name: 'Schreibgehilfe mit dunklen Absichten',
    description:
      'Schreibgehilfe mit dunklen Absichten: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-nzapaPdOM-schreibgehilfe-mit-dunklen-absichten',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-8PI4iw2Ul-schreibtrainer',
    name: 'Schreibtrainer',
    description:
      'Schreibtrainer: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-8PI4iw2Ul-schreibtrainer',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-684715f3d328819184b7cb8f2375bd81-scum-romance-helper',
    name: 'Scum Romance Helper',
    description:
      'Scum Romance Helper: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-684715f3d328819184b7cb8f2375bd81-scum-romance-helper',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-rzHqI5fYK-senior-web-dev-lead-ivan',
    name: 'Senior Web Dev Lead Ivan',
    description: 'Decisive lead in web dev with a focus on React and CI/CD.',
    url: 'https://chatgpt.com/g/g-rzHqI5fYK-senior-web-dev-lead-ivan',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-P7PBWJWqA-seo-mentor',
    name: 'SEO MEntor',
    description:
      'SEO MEntor: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-P7PBWJWqA-seo-mentor',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-GqvbVZP16-songtexter',
    name: 'Songtexter',
    description:
      'Schreibe Songtexte basierend auf spezifischen Regeln und Anforderungen.',
    url: 'https://chatgpt.com/g/g-GqvbVZP16-songtexter',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-6a0c8e14399c8191b669312a66912943-soziale-angst',
    name: 'Soziale Angst',
    description:
      'Soziale Angst: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-6a0c8e14399c8191b669312a66912943-soziale-angst',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-68ee0d7339cc81918d9f2360e0343780-sql-guru',
    name: 'SQL Guru',
    description:
      'SQL Guru: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-68ee0d7339cc81918d9f2360e0343780-sql-guru',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-qncUjTnEl-stable-diffusion-expert',
    name: 'Stable Diffusion expert',
    description:
      'Stable Diffusion expert: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-qncUjTnEl-stable-diffusion-expert',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-yBR7k6GWX-stable-diffusion-prompt-generator',
    name: 'Stable Diffusion Prompt Generator',
    description:
      'Generates detailed and precise prompts for stable diffusion art, leveraging art history and technical expertise.',
    url: 'https://chatgpt.com/g/g-yBR7k6GWX-stable-diffusion-prompt-generator',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-tN3ibbuNW-stil-wolfgang',
    name: 'Stil Wolfgang',
    description:
      'Stil Wolfgang: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-tN3ibbuNW-stil-wolfgang',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-68e68f586adc8191940e623c76bc3991-stilberatung',
    name: 'Stilberatung',
    description:
      'Stilberatung: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-68e68f586adc8191940e623c76bc3991-stilberatung',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-68923382576081918ab6f8dd109a265e-stilkonig',
    name: 'Stilkönig',
    description:
      'Stilkönig: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-68923382576081918ab6f8dd109a265e-stilkonig',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-GfZz2vFVJ-structure-and-interpretation-of-computer-programs',
    name: 'Structure and Interpretation of Computer Programs',
    description:
      'Structure and Interpretation of Computer Programs: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-GfZz2vFVJ-structure-and-interpretation-of-computer-programs',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-69184dfa831481919d6c5bfbe8771633-subbrand-berater',
    name: 'Subbrand Berater',
    description:
      'Subbrand Berater: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-69184dfa831481919d6c5bfbe8771633-subbrand-berater',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-690cdd08113c81918ab9ae5770f0d082-sufi-meister',
    name: 'Sufi-Meister',
    description:
      'Sufi-Meister: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-690cdd08113c81918ab9ae5770f0d082-sufi-meister',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-67488562156081919fd7d6395d8fb8b8-symboliker',
    name: 'Symboliker',
    description:
      'Symboliker: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-67488562156081919fd7d6395d8fb8b8-symboliker',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-69fdae482f4481919123c7d4e04a4edd-synthese-agent',
    name: 'Synthese-Agent',
    description:
      'Synthese-Agent: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-69fdae482f4481919123c7d4e04a4edd-synthese-agent',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-0ksF90H85-system-synthesizer',
    name: 'System Synthesizer',
    description: 'Expert in systems thinking and complex problem-solving',
    url: 'https://chatgpt.com/g/g-0ksF90H85-system-synthesizer',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-xii15t99v-tino-echo-prombter',
    name: 'Tino Echo Prombter',
    description: 'Adaptiert meinen Schreibstil',
    url: 'https://chatgpt.com/g/g-xii15t99v-tino-echo-prombter',
    tags: ['ChatGPT', 'Importiert'],
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
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-Hx1Ong8mv-uxy',
    name: 'UXY',
    description:
      'UXY, an assistant for web agencies in project initiation, focusing on client discovery, project planning, and risk mitigation.',
    url: 'https://chatgpt.com/g/g-Hx1Ong8mv-uxy',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-699c23f7910881919cf748003589d646-walter-haug',
    name: 'Walter Haug',
    description:
      'Walter Haug: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-699c23f7910881919cf748003589d646-walter-haug',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-wgHq4WUFu-war-of-art-mentor',
    name: 'War of Art Mentor',
    description:
      'War of Art Mentor: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-wgHq4WUFu-war-of-art-mentor',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-68fca9be3d8c8191aad0908c9ed87d39-web-designer',
    name: 'Web Designer',
    description:
      'Web Designer: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-68fca9be3d8c8191aad0908c9ed87d39-web-designer',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-PjUF3J8mr-webapp-wizard',
    name: 'WebApp Wizard',
    description: 'I guide as if I authored your web app planning document.',
    url: 'https://chatgpt.com/g/g-PjUF3J8mr-webapp-wizard',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-clzlQh1BO-wiedehopf',
    name: 'Wiedehopf',
    description:
      'Wiedehopf: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-clzlQh1BO-wiedehopf',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-9kfCJH6OY-wissensverbinder',
    name: 'Wissensverbinder',
    description:
      'Wissensverbinder: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-9kfCJH6OY-wissensverbinder',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-68b49d448e088191892746267f2b3f44-wolfgang',
    name: 'Wolfgang',
    description:
      'Wolfgang: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-68b49d448e088191892746267f2b3f44-wolfgang',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-0aDA0yJWl-wordpress-developer',
    name: 'Wordpress Developer',
    description: 'Demanding WordPress Code Specialist',
    url: 'https://chatgpt.com/g/g-0aDA0yJWl-wordpress-developer',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
  {
    id: 'g-67659b481c388191bc931f1dc44a02c8-workshop-guru',
    name: 'Workshop Guru',
    description:
      'Workshop Guru: eigener ChatGPT-GPT. Importiert aus der GPT-Agenten-Übersicht; Beschreibung kann bei Bedarf präzisiert werden.',
    url: 'https://chatgpt.com/g/g-67659b481c388191bc931f1dc44a02c8-workshop-guru',
    tags: ['ChatGPT', 'Importiert'],
    visibility: 'link',
  },
] as const satisfies readonly GptAgent[];
