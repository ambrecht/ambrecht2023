import type { GptAgent } from '@/src/features/gpts/types';

// Aus C:/Users/Ambrecht/Downloads/gpt_agents.txt generiert.
// Quelle: ChatGPT-GPT-Agenten-Export im Semikolon-CSV-Format.
export const gpts = [
  {
    "id": "g-6a22cb4db9888191b7a52c827176b289-agent-fur-typografie",
    "name": "Agent für Typografie",
    "description": "Agent für Typografie: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-6a22cb4db9888191b7a52c827176b289-agent-fur-typografie",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "link"
  },
  {
    "id": "g-oqOY4s5CJ-alfred",
    "name": "Alfred",
    "description": "Senior JavaScript programmer and mentor.",
    "url": "https://chatgpt.com/g/g-oqOY4s5CJ-alfred",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-cAGSOabkXPIMw89OGEM2JF9q&gizmo_id=g-oqOY4s5CJ&ts=495231&p=gpp&cid=1&sig=ec89fe4782cc1cead37deccffec77b95d10675d99f59575851f691a0146880d4&v=0"
  },
  {
    "id": "g-xv3LUtCs2-ambrecht-de",
    "name": "ambrecht.de",
    "description": "Blogautor",
    "url": "https://chatgpt.com/g/g-xv3LUtCs2-ambrecht-de",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-8buPzWJ1svqboOoQqtzs50DX&gizmo_id=g-xv3LUtCs2&ts=495231&p=gpp&cid=1&sig=74cfc5ce8adb31c8bc657614759115ebcdbfa7b6fde4db437e77f3121ea11edf&v=0"
  },
  {
    "id": "g-68179a3b1ea881919bf8eecce9c734f8-antieinstein",
    "name": "AntiEinstein",
    "description": "AntiEinstein: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-68179a3b1ea881919bf8eecce9c734f8-antieinstein",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private"
  },
  {
    "id": "g-i1clROU88-arno-schmidt",
    "name": "Arno Schmidt",
    "description": "Arno Schmidt: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-i1clROU88-arno-schmidt",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private"
  },
  {
    "id": "g-tl1izoOLY-art-historian-and-prompt-analyzer",
    "name": "Art Historian and Prompt Analyzer",
    "description": "Art Historian and Prompt Analyzer: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-tl1izoOLY-art-historian-and-prompt-analyzer",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "link",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-v13QohI20oXocNroEyFxd2C3&gizmo_id=g-tl1izoOLY&ts=495229&p=gpp&cid=1&sig=f2d79f29abc03be1d92e33eb1ebbae797e397171260a1e14697aa3a567ea39bc&v=0"
  },
  {
    "id": "g-6919da3ef98c8191908c51726abf8bc1-art-historian-and-prompt-analyzer-copy",
    "name": "Art Historian and Prompt Analyzer (copy)",
    "description": "Analyzing and crafting art prompts with historical insight",
    "url": "https://chatgpt.com/g/g-6919da3ef98c8191908c51726abf8bc1-art-historian-and-prompt-analyzer-copy",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "link",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-v13QohI20oXocNroEyFxd2C3&gizmo_id=g-6919da3ef98c8191908c51726abf8bc1&ts=495229&p=gpp&cid=1&sig=81107509b40e0bec7eaeb1c9abe36d5bcdae8082f8e190f257e033c2f4ee19ca&v=0"
  },
  {
    "id": "g-0z9VeRSAE-attar",
    "name": "Attar",
    "description": "Weisheitslehrer und Sufimeister",
    "url": "https://chatgpt.com/g/g-0z9VeRSAE-attar",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private"
  },
  {
    "id": "g-692d622ccdd881918cf10365c76ad2c5-backend-entwickler",
    "name": "Backend Entwickler",
    "description": "Backend Entwickler: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-692d622ccdd881918cf10365c76ad2c5-backend-entwickler",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-3JzAjpoX8ivUcC6MUozh2h&gizmo_id=g-692d622ccdd881918cf10365c76ad2c5&ts=495229&p=gpp&cid=1&sig=2ff4c88d90f13afbb21e7162562cb26d8ac2bd7a352a4a7f1e76e15a5a3d04be&v=0"
  },
  {
    "id": "g-ZoO6Gez9o-basecamp-mentor",
    "name": "Basecamp Mentor",
    "description": "Analyzing 'Getting Real' document for every response",
    "url": "https://chatgpt.com/g/g-ZoO6Gez9o-basecamp-mentor",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "link"
  },
  {
    "id": "g-AFnuGpnAV-bike-trainer",
    "name": "Bike Trainer",
    "description": "Bike Trainer: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-AFnuGpnAV-bike-trainer",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "link"
  },
  {
    "id": "g-68f892afe9a48191aa7195b25a236ce0-fotografie-guru",
    "name": "Bild mit DALL·E 3",
    "description": "Bild mit DALL·E 3: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-68f892afe9a48191aa7195b25a236ce0-fotografie-guru/c/6a437233-0b0c-83eb-9bf5-e7704470adec",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "link"
  },
  {
    "id": "g-68f892afe9a48191aa7195b25a236ce0-fotografie-guru",
    "name": "Bildanalyse mit DALL·E 3",
    "description": "Bildanalyse mit DALL·E 3: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-68f892afe9a48191aa7195b25a236ce0-fotografie-guru/c/6a437100-b85c-83eb-b4b4-8e73fb495215",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "link"
  },
  {
    "id": "g-68f892afe9a48191aa7195b25a236ce0-fotografie-guru",
    "name": "Bildbeschreibung für DALL·E 3",
    "description": "Bildbeschreibung für DALL·E 3: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-68f892afe9a48191aa7195b25a236ce0-fotografie-guru/c/6a439983-3238-83eb-b109-15464436439e",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "link"
  },
  {
    "id": "g-6835c2391e04819199c16c31c52834df-bitcoin-guru",
    "name": "Bitcoin Guru",
    "description": "Bitcoin Guru: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-6835c2391e04819199c16c31c52834df-bitcoin-guru",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-6SJ1PxxCE6bqTfpQLebisY&gizmo_id=g-6835c2391e04819199c16c31c52834df&ts=495231&p=gpp&cid=1&sig=ccb38bdc910ae6e6a75f305206fa239f703c7805a3416896b583e0dd8d7895d9&v=0"
  },
  {
    "id": "g-ZFkvgW2b5-blog-autor",
    "name": "Blog Autor",
    "description": "Blog Autor: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-ZFkvgW2b5-blog-autor",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "link"
  },
  {
    "id": "g-68ca83a244148191ae9ad9cb502983a4-breakfree",
    "name": "Breakfree",
    "description": "Breakfree: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-68ca83a244148191ae9ad9cb502983a4-breakfree",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-4F2Mq7FWJ7NSpB5aTc1QsA&gizmo_id=g-68ca83a244148191ae9ad9cb502983a4&ts=495229&p=gpp&cid=1&sig=df17cddebd67980491e5a6fb7e8b5da13be526a54d9241f7d6e5ca9ee911e2ec&v=0"
  },
  {
    "id": "g-68c59c23ba1c8191880a78c96088a0c4-grafikdesign",
    "name": "Brutalistische Fotografie mit Zitat",
    "description": "Brutalistische Fotografie mit Zitat: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-68c59c23ba1c8191880a78c96088a0c4-grafikdesign/c/6a43b9d7-ea40-83eb-8771-244d1ec504a4",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "link"
  },
  {
    "id": "g-pwt6EzGqB-casey",
    "name": "Casey",
    "description": "Provides tech case study advice in German",
    "url": "https://chatgpt.com/g/g-pwt6EzGqB-casey",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-kzSxkKLmtZBNQjHT826Newtm&gizmo_id=g-pwt6EzGqB&ts=495231&p=gpp&cid=1&sig=a5f2c3cd524fdc1d87b3e6910d52985c868a7ae9ad60ff42b4d05964f2fa5c4f&v=0"
  },
  {
    "id": "g-yUUKa8W0F-charakterpsychologie",
    "name": "Charakterpsychologie",
    "description": "Charakterpsychologie: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-yUUKa8W0F-charakterpsychologie",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "link"
  },
  {
    "id": "g-4dA57llB2-charakterstudien-agent",
    "name": "Charakterstudien Agent",
    "description": "Charakterstudien Agent: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-4dA57llB2-charakterstudien-agent",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "link"
  },
  {
    "id": "g-L8GZRbBmt-codebot",
    "name": "Codebot",
    "description": "Senior Software Engineer GPT with Style Guide Expertise",
    "url": "https://chatgpt.com/g/g-L8GZRbBmt-codebot",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "link",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-8YJqKUV1WRHD7PxXXPnq8Ldr&gizmo_id=g-L8GZRbBmt&ts=495231&p=gpp&cid=1&sig=bc6e55e61d1c1db09bab0bd9b1a7b108035689f7a7c0b0be1ca5973275c07a68&v=0"
  },
  {
    "id": "g-75VVyOagZ-content-creator",
    "name": "Content Creator",
    "description": "Content Creator: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-75VVyOagZ-content-creator",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private"
  },
  {
    "id": "g-eP4jqixFO-css-prodigy",
    "name": "CSS Prodigy",
    "description": "Expert in CSS, providing in-depth guidance on responsive and accessible design.",
    "url": "https://chatgpt.com/g/g-eP4jqixFO-css-prodigy",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "link",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-uLYZJYWg39IrD9S8y7szAKuS&gizmo_id=g-eP4jqixFO&ts=495231&p=gpp&cid=1&sig=f895a4496152f0d87952fd178e9ecc6f7d88278eb24e6bf5dd219dfae71d0ae6&v=0"
  },
  {
    "id": "g-EqQBiV1tR-d3-js-ninja",
    "name": "D3.js Ninja",
    "description": "D3.js Ninja: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-EqQBiV1tR-d3-js-ninja",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "link"
  },
  {
    "id": "g-jJbYx0BmU-doblin",
    "name": "Döblin",
    "description": "Embody Alfred Döblin's radical style, analyzing and refining texts in his modernist voice.",
    "url": "https://chatgpt.com/g/g-jJbYx0BmU-doblin",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "link",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-2hMh532ShGf3iQVOeMF1lecJ&gizmo_id=g-jJbYx0BmU&ts=495231&p=gpp&cid=1&sig=3226c0170641e8fcdf2eec618f9fc1a5087c0f7ca66e42dbbcbfde2d65c33ab3&v=0"
  },
  {
    "id": "g-R6cPfphXo-donald-miller",
    "name": "Donald Miller",
    "description": "Expert in 'StoryBrand', 'Strong Brands', and 'Brand Strategy Canvas', advising on branding and marketing.",
    "url": "https://chatgpt.com/g/g-R6cPfphXo-donald-miller",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-noBg3OvX1XVAd8Mw7kkKhcDq&gizmo_id=g-R6cPfphXo&ts=495231&p=gpp&cid=1&sig=fe9cc16a933a970358283d2a2b5d96b9a2a993558eee25c527da3d8afd38dce5&v=0"
  },
  {
    "id": "g-9ZzoYfgIu-edward-bernays",
    "name": "Edward Bernays",
    "description": "Edward Bernays: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-9ZzoYfgIu-edward-bernays",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-SnQh2fvoxCi3BZCeu8YopeYS&gizmo_id=g-9ZzoYfgIu&ts=495231&p=gpp&cid=1&sig=6b90795c91087124c0ecfc2e7dc568e91737d4f2c839875677240d838a1e5389&v=0"
  },
  {
    "id": "g-6750b65f9ac48191ab1429d1637dbc96-einzelhandels-guru",
    "name": "Einzelhandels Guru",
    "description": "Einzelhandels Guru: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-6750b65f9ac48191ab1429d1637dbc96-einzelhandels-guru",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private"
  },
  {
    "id": "g-IMBaKR7X5-elixir-mentor",
    "name": "Elixir Mentor",
    "description": "Elixir Mentor: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-IMBaKR7X5-elixir-mentor",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private"
  },
  {
    "id": "g-694d7f1c21408191af684881a0b26635-emmas-coach",
    "name": "Emmas Coach",
    "description": "Emmas Coach: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-694d7f1c21408191af684881a0b26635-emmas-coach",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "link"
  },
  {
    "id": "g-6827289ebf8881918b14adb5212404bc-erinnerung",
    "name": "Erinnerung",
    "description": "Erinnerung: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-6827289ebf8881918b14adb5212404bc-erinnerung",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private"
  },
  {
    "id": "g-v6qbPt9w6-erklarbar-fur-webtechnologien",
    "name": "Erklärbär für Webtechnologien",
    "description": "Erklärbär für Webtechnologien: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-v6qbPt9w6-erklarbar-fur-webtechnologien",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-854VWn4FGLPamrnGta1l5QSX&gizmo_id=g-v6qbPt9w6&ts=495231&p=gpp&cid=1&sig=347f4fb1539e65b7b7e142e563ab7a33c675c1ea762bf1a4b8a0a80173122aa0&v=0"
  },
  {
    "id": "g-4ua0IvRUs-event-expert",
    "name": "Event Expert",
    "description": "Event Expert: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-4ua0IvRUs-event-expert",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-d9xsPEstkC7KQ7zc9ZfYTJC4&gizmo_id=g-4ua0IvRUs&ts=495231&p=gpp&cid=1&sig=c6b3d9f94f2f7de4e169b803296fc0197aafa32d2293235516a83fe0a62562f5&v=0"
  },
  {
    "id": "g-6a3a5e623c388191b59d7cc254c1e5b8-fotoautomat",
    "name": "FOTOAUTOMAT",
    "description": "FOTOAUTOMAT: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-6a3a5e623c388191b59d7cc254c1e5b8-fotoautomat",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private"
  },
  {
    "id": "g-68f892afe9a48191aa7195b25a236ce0-fotografie-guru",
    "name": "Fotografie Bewertung Tipps",
    "description": "Fotografie Bewertung Tipps: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-68f892afe9a48191aa7195b25a236ce0-fotografie-guru/c/6a42cdcc-b5ac-83ed-a998-84f2ca5bf7e5",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "link"
  },
  {
    "id": "g-68f892afe9a48191aa7195b25a236ce0-fotografie-guru",
    "name": "Fotografie Guru",
    "description": "Fotografie Guru: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-68f892afe9a48191aa7195b25a236ce0-fotografie-guru",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "link",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-6D6FtUhz3apDr1ewge241F&gizmo_id=g-68f892afe9a48191aa7195b25a236ce0&ts=495229&p=gpp&cid=1&sig=a6da59b517dcba0ba90ccc4070cf59944bb1115d8984fe59b149a5387796c1a3&v=0"
  },
  {
    "id": "g-67c5ddf43ccc8191aab310fe341d0c5c-gea-sales-machine",
    "name": "GEA Sales Machine",
    "description": "GEA Sales Machine: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-67c5ddf43ccc8191aab310fe341d0c5c-gea-sales-machine",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-VJK3WmHUF2MYdfcQPdwtfc&gizmo_id=g-67c5ddf43ccc8191aab310fe341d0c5c&ts=495231&p=gpp&cid=1&sig=53ed9c12c0cf43146b061233ea2eff81da9ae4fd6f8304f1b4febb0fc2b4cb69&v=0"
  },
  {
    "id": "g-gHPgyjYMG-general-algo",
    "name": "General Algo",
    "description": "Mentor for structured algorithm development",
    "url": "https://chatgpt.com/g/g-gHPgyjYMG-general-algo",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "link",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-mnHFktcMYom38KZHERjDl9E7&gizmo_id=g-gHPgyjYMG&ts=495231&p=gpp&cid=1&sig=ae7f499047f33b6499ca84d1e0cec00de130f20996bebf166ee2cc5748ce2567&v=0"
  },
  {
    "id": "g-7td15HCSB-geschaftnachrichtenautomat",
    "name": "Geschäftnachrichtenautomat",
    "description": "Expert in crafting professional business emails",
    "url": "https://chatgpt.com/g/g-7td15HCSB-geschaftnachrichtenautomat",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-aEgAUaISV6gM5ThjR7M9HOWD&gizmo_id=g-7td15HCSB&ts=495231&p=gpp&cid=1&sig=b2ddd5169e39db0f26651643f86e897ec3d40500cc932b51fd8f63fcd89611c6&v=0"
  },
  {
    "id": "g-4LRvdfoi4-go-experte",
    "name": "Go Experte",
    "description": "Experte, Lehrer und fleißiger Arbeiter für Go-Programmierung.",
    "url": "https://chatgpt.com/g/g-4LRvdfoi4-go-experte",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private"
  },
  {
    "id": "g-68e363b99f8c81919ca1f5bdab65f64b-goethe",
    "name": "Goethe",
    "description": "Antwortet als Goethe mit klassischem Duktus und zitiergestützter Werkkenntnis.",
    "url": "https://chatgpt.com/g/g-68e363b99f8c81919ca1f5bdab65f64b-goethe",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-4bNjpzjoSp8rdnNkhR7apW&gizmo_id=g-68e363b99f8c81919ca1f5bdab65f64b&ts=495229&p=gpp&cid=1&sig=33087111b45d5a9f23fcf22850169e4532d69e8cc39133030acf8964d7fc5d8f&v=0"
  },
  {
    "id": "g-68c59c23ba1c8191880a78c96088a0c4-grafikdesign",
    "name": "Grafikdesign",
    "description": "Grafikdesign: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-68c59c23ba1c8191880a78c96088a0c4-grafikdesign",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-UrLwnCRG572J6d9p6i4WqZ&gizmo_id=g-68c59c23ba1c8191880a78c96088a0c4&ts=495229&p=gpp&cid=1&sig=0f57ee0b9db2128747c9482e0af4dd089bc3f3cc7bf8bb130ad8794707cb085e&v=0"
  },
  {
    "id": "g-wucTxe9Zv-guide-to-freedom",
    "name": "Guide to freedom",
    "description": "You are an AI Agent designed to act as a financial and lifestyle coach, leveraging the principles and insights from The Sovereign Individual by James Dale Davidson and William Rees-Mogg, and Early Retirement Extreme by Jacob Lund Fisker.",
    "url": "https://chatgpt.com/g/g-wucTxe9Zv-guide-to-freedom",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "link"
  },
  {
    "id": "g-68a773fd39c08191be44648c9dd3f311-haberlin",
    "name": "Häberlin",
    "description": "Universal scholar, vast lexicon",
    "url": "https://chatgpt.com/g/g-68a773fd39c08191be44648c9dd3f311-haberlin",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-Yx27F3HFbrnDIeYoEPZSswjj&gizmo_id=g-68a773fd39c08191be44648c9dd3f311&ts=495229&p=gpp&cid=1&sig=6fc60d70327a7f09b13c5b894f33da34bfff360028e63ba84d0afa09e4a6398f&v=0"
  },
  {
    "id": "g-68c42e1c88508191a60349246aea53af-haberlin-als-erzieher",
    "name": "Häberlin als Erzieher",
    "description": "Universal scholar, vast lexicon",
    "url": "https://chatgpt.com/g/g-68c42e1c88508191a60349246aea53af-haberlin-als-erzieher",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-Yx27F3HFbrnDIeYoEPZSswjj&gizmo_id=g-68c42e1c88508191a60349246aea53af&ts=495229&p=gpp&cid=1&sig=d463e2802cc62d04ffcabda0aac1614aea9f42d067f7efca09447dc60db66634&v=0"
  },
  {
    "id": "g-683ef55ff2248191b3e52b0ee0cf092c-hamvas",
    "name": "Hamvas",
    "description": "Hamvas: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-683ef55ff2248191b3e52b0ee0cf092c-hamvas",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "link"
  },
  {
    "id": "g-6995fd3cf9d88191b8adc2a030980e9f-hikam",
    "name": "Hikam",
    "description": "Hikam: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-6995fd3cf9d88191b8adc2a030980e9f-hikam",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "link"
  },
  {
    "id": "g-683d75191e7c81919b20e9e7d5b7dfb0-holderlin",
    "name": "Hölderlin",
    "description": "Hölderlin: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-683d75191e7c81919b20e9e7d5b7dfb0-holderlin",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "link"
  },
  {
    "id": "g-tVYrNtBMC-image2table",
    "name": "Image2Table",
    "description": "Verwandelt Bilder in detalierte Tabellen aus Eigenschaften etc.",
    "url": "https://chatgpt.com/g/g-tVYrNtBMC-image2table",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-S6V53gXOJX5Z29IIaZ8Ioy07&gizmo_id=g-tVYrNtBMC&ts=495231&p=gpp&cid=1&sig=9e5241434b8fc8786a22f7e507eff67d8f7a74ee5a0d4a52204ebc5de46b707e&v=0"
  },
  {
    "id": "g-6a16a8885fac819193729af93f8c7cf0-instagram-guru",
    "name": "Instagram Erfolg durch Positionierung",
    "description": "Instagram Erfolg durch Positionierung: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-6a16a8885fac819193729af93f8c7cf0-instagram-guru/c/6a43bbd6-d724-83eb-aae0-c0edc05f2639",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "link"
  },
  {
    "id": "g-6a16a8885fac819193729af93f8c7cf0-instagram-guru",
    "name": "Instagram Guru",
    "description": "Instagram Guru: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-6a16a8885fac819193729af93f8c7cf0-instagram-guru",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private"
  },
  {
    "id": "g-6a16a8885fac819193729af93f8c7cf0-instagram-guru",
    "name": "Instagram Hashtags und Beschreibung",
    "description": "Instagram Hashtags und Beschreibung: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-6a16a8885fac819193729af93f8c7cf0-instagram-guru/c/6a43a5e9-6b4c-83eb-9a63-3b9855c61520",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "link"
  },
  {
    "id": "g-ixGv4HDUe-ivan-the-web-project-manager",
    "name": "Ivan, the Web Project Manager",
    "description": "Senior web dev guiding projects with a decisive, motivational style.",
    "url": "https://chatgpt.com/g/g-ixGv4HDUe-ivan-the-web-project-manager",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "public",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-JjWgNoozi2IqhgMYsuCba864&gizmo_id=g-ixGv4HDUe&ts=495231&p=gpp&cid=1&sig=f3bb08e1b9b68cc5e3f38be278b64d45997915a2cadd620ace949fa4cc935169&v=0"
  },
  {
    "id": "g-eMS4vRN0T-javascript-ninja",
    "name": "Javascript Ninja",
    "description": "Javascript Ninja: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-eMS4vRN0T-javascript-ninja",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private"
  },
  {
    "id": "g-68a493bafa708191a0651a72dd0d2375-json2position",
    "name": "JSON2POsition",
    "description": "JSON2POsition: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-68a493bafa708191a0651a72dd0d2375-json2position",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "link"
  },
  {
    "id": "g-SVk5Njknd-jtl-shop-code-analyst-and-modernizer",
    "name": "JTL Shop Code Analyst and Modernizer",
    "description": "Expert in JTL Shop customizations and API integration",
    "url": "https://chatgpt.com/g/g-SVk5Njknd-jtl-shop-code-analyst-and-modernizer",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-Rn0BInYvv42EgdovsTm67XQf&gizmo_id=g-SVk5Njknd&ts=495231&p=gpp&cid=1&sig=2b79a2eb509d2e752ec9e0e123e0d137d24ee7fe1c2a9f50c187272d3feeb731&v=0"
  },
  {
    "id": "g-68448372db5481918232043bfd8b4a60-kafka",
    "name": "Kafka",
    "description": "Kafka: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-68448372db5481918232043bfd8b4a60-kafka",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "link",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-5bzrBJBy4a6zcnoKvT5iPf&gizmo_id=g-68448372db5481918232043bfd8b4a60&ts=495231&p=gpp&cid=1&sig=715052a2b11e96c3133c9aa678851b08a1bc2be0a65996c9b284880a9fca3add&v=0"
  },
  {
    "id": "g-676c2d3587088191ba359ffabd1c8793-klaus-schonbach",
    "name": "Klaus Schönbach",
    "description": "Klaus Schönbach: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-676c2d3587088191ba359ffabd1c8793-klaus-schonbach",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-37trhreEnmmAtCi55tzYrr&gizmo_id=g-676c2d3587088191ba359ffabd1c8793&ts=495231&p=gpp&cid=1&sig=a13b6c1a9a28c44f5aa4368f9c6703e0548a4c80add0f664b3024410a8529989&v=0"
  },
  {
    "id": "g-6989b78a7018819184a133d17a41b5f1-korpertherapie",
    "name": "Körpertherapie",
    "description": "Körpertherapie: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-6989b78a7018819184a133d17a41b5f1-korpertherapie",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-H2TpExFLWnFYvmy3xpZ9Tt&gizmo_id=g-6989b78a7018819184a133d17a41b5f1&ts=495229&p=gpp&cid=1&sig=77e6e8b3379fe41b270957fe212ceb1d6eb4734dee32c03d8c0e033d8f89fc3a&v=0"
  },
  {
    "id": "g-68d25e91da208191a6cb411697bc5358-kreativitats-guru",
    "name": "Kreativitäts Guru",
    "description": "Kreativitäts Guru: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-68d25e91da208191a6cb411697bc5358-kreativitats-guru",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "link",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-8T6X2TdDE5B2k6UqZWkcjM&gizmo_id=g-68d25e91da208191a6cb411697bc5358&ts=495229&p=gpp&cid=1&sig=443a1d900a82311a75deb7ec9d7cd7a8bd10174cd317f75d6599fd9111893df1&v=0"
  },
  {
    "id": "g-67fac58db6788191a0f4de3dd5f463af-kundera",
    "name": "Kundera",
    "description": "Kundera: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-67fac58db6788191a0f4de3dd5f463af-kundera",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private"
  },
  {
    "id": "g-69e651f2e7548191a94f73ad4bf06103-kunstler",
    "name": "Künstler",
    "description": "Künstler: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-69e651f2e7548191a94f73ad4bf06103-kunstler",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "link",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-XbG57LqpPiawZYJXHsNcui&gizmo_id=g-69e651f2e7548191a94f73ad4bf06103&ts=495229&p=gpp&cid=1&sig=64916413e6796481dac1ea65542ca611839ff7adca0d4d5946652375c6390883&v=0"
  },
  {
    "id": "g-rihaNRG2o-kurt-godel",
    "name": "Kurt Gödel",
    "description": "Kurt Gödel: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-rihaNRG2o-kurt-godel",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-VHPQfDTMEPinAGaKBhmWXFns&gizmo_id=g-rihaNRG2o&ts=495231&p=gpp&cid=1&sig=5dfd972de470fac916c570fc7ea69a325db7b2de38caf6f6eaeb350fe331f53c&v=0"
  },
  {
    "id": "g-69904d2879d0819180424e58cfb71084-lausberg-schreibwerkstatt",
    "name": "Lausberg-Schreibwerkstatt",
    "description": "Lausberg-Schreibwerkstatt: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-69904d2879d0819180424e58cfb71084-lausberg-schreibwerkstatt",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-4egU4HECeGmXQ1UrvkUot2&gizmo_id=g-69904d2879d0819180424e58cfb71084&ts=495229&p=gpp&cid=1&sig=627ac24f9b77ae45c2b0ade0ba8b23f38adb1383e0129ca4694b6a681607f3af&v=0"
  },
  {
    "id": "g-68d98859f08481918e565fd97a157256-lia",
    "name": "Lia",
    "description": "Lia: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-68d98859f08481918e565fd97a157256-lia",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-VnUaPbafifgoM5DCqt9dQV&gizmo_id=g-68d98859f08481918e565fd97a157256&ts=495229&p=gpp&cid=1&sig=099c22a1c4d6a5df27475a7d8bc1d6140eac1f0b7366843d0c2f3cdeb78df3e4&v=0"
  },
  {
    "id": "g-Naqw1AsYQ-literatur-coach",
    "name": "Literatur Coach",
    "description": "Literatur-Experte für Spannungsbögen und literarische Analysen",
    "url": "https://chatgpt.com/g/g-Naqw1AsYQ-literatur-coach",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-ScPoziw9JximCtb9Qo5XBf2M&gizmo_id=g-Naqw1AsYQ&ts=495231&p=gpp&cid=1&sig=758cb9caa4545b1854a57e7e6af74a487e1497d73c6b96e33a12d83da0d1916c&v=0"
  },
  {
    "id": "g-dAMfWK903-llc-guru",
    "name": "LLC Guru",
    "description": "LLC Guru: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-dAMfWK903-llc-guru",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private"
  },
  {
    "id": "g-8sRcbzlbV-llm-guru-und-prombtgenerator",
    "name": "LLM Guru und Prombtgenerator",
    "description": "LLM Guru und Prombtgenerator: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-8sRcbzlbV-llm-guru-und-prombtgenerator",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "link",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-7MNGzxYVPnP6lnluHN4B16Ne&gizmo_id=g-8sRcbzlbV&ts=495231&p=gpp&cid=1&sig=292c17adfa11c5d3daa6fa4ec8a7531eeb4213e2bb0f046b37631f4ce5273103&v=0"
  },
  {
    "id": "g-iW4GIlhxm-mafiaboxx",
    "name": "Mafiaboxx",
    "description": "Mafiaboxx: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-iW4GIlhxm-mafiaboxx",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private"
  },
  {
    "id": "g-PRdC6oVob-magento-2",
    "name": "Magento 2",
    "description": "Magento 2: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-PRdC6oVob-magento-2",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private"
  },
  {
    "id": "g-zXzk9kAnq-magento-guru",
    "name": "Magento Guru",
    "description": "Expert in Magento 2 development for advanced users, with deep file analysis.",
    "url": "https://chatgpt.com/g/g-zXzk9kAnq-magento-guru",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private"
  },
  {
    "id": "g-6a40ec288f248191af77765b05508eee-mannlichkeit",
    "name": "Männlichkeit",
    "description": "Männlichkeit: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-6a40ec288f248191af77765b05508eee-mannlichkeit",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private"
  },
  {
    "id": "g-6755cff834608191abed997645c52302-mantak-chia",
    "name": "Mantak Chia",
    "description": "Mantak Chia: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-6755cff834608191abed997645c52302-mantak-chia",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "link"
  },
  {
    "id": "g-678d48fbb56c819186ff0e54526a0478-meditations-guru",
    "name": "Meditations Guru",
    "description": "Meditations Guru: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-678d48fbb56c819186ff0e54526a0478-meditations-guru",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "link"
  },
  {
    "id": "g-677197d5830081919c2667df73a5ea47-meister-eckhart",
    "name": "Meister Eckhart",
    "description": "Meister Eckhart: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-677197d5830081919c2667df73a5ea47-meister-eckhart",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "link",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-46CAKX9eHgmT55EgqBYM7J&gizmo_id=g-677197d5830081919c2667df73a5ea47&ts=495231&p=gpp&cid=1&sig=ad8a29947387b1417851121af1fd376a243bd31502b640f5d6428f05647f4900&v=0"
  },
  {
    "id": "g-68f892afe9a48191aa7195b25a236ce0-fotografie-guru",
    "name": "Metaphysische Bedeutung des Fotos",
    "description": "Metaphysische Bedeutung des Fotos: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-68f892afe9a48191aa7195b25a236ce0-fotografie-guru/c/6a439832-a7b8-83ed-a71b-aa0c14cad109",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "link"
  },
  {
    "id": "g-gJo9nf6xt-nafea-lou",
    "name": "Nafea Lou",
    "description": "Nafea Lou: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-gJo9nf6xt-nafea-lou",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-8Obs5n7gq1exLJfgTwKlUvdz&gizmo_id=g-gJo9nf6xt&ts=495231&p=gpp&cid=1&sig=80b29d0eeada8cf0dfc812f95f46b0c264a33d5f8d749c75f7828354fe2cd570&v=0"
  },
  {
    "id": "g-7KG5xHmHZ-nafeah-louh",
    "name": "Nafeah Louh",
    "description": "Nafeah Louh: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-7KG5xHmHZ-nafeah-louh",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-59mCmGcoS5MJzQmDT25gwec7&gizmo_id=g-7KG5xHmHZ&ts=495231&p=gpp&cid=1&sig=cd88034c0989d552621c7766f6e821cd633b1eed402771cd68afb92f92aaee84&v=0"
  },
  {
    "id": "g-3YQlz0A9S-nlp-guru",
    "name": "NLP Guru",
    "description": "NLP Guru: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-3YQlz0A9S-nlp-guru",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private"
  },
  {
    "id": "g-6999f6f9c92c819183eb2860cc303f74-nlp-guru",
    "name": "NLP GURU",
    "description": "NLP GURU: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-6999f6f9c92c819183eb2860cc303f74-nlp-guru",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "link"
  },
  {
    "id": "g-FEHLiBlPD-obsedian-assistent",
    "name": "Obsedian Assistent",
    "description": "Obsidian note expert for creating structured markdown files on books",
    "url": "https://chatgpt.com/g/g-FEHLiBlPD-obsedian-assistent",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "link"
  },
  {
    "id": "g-676bd9251154819183fd2a46144f258c-oliver-ritter",
    "name": "Oliver Ritter",
    "description": "Oliver Ritter: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-676bd9251154819183fd2a46144f258c-oliver-ritter",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-DF1yQxkuc3zmAbw8gVTn7H&gizmo_id=g-676bd9251154819183fd2a46144f258c&ts=495231&p=gpp&cid=1&sig=3813b90d81b7c07ab3cea9ab5cd3df585adc34ac3d6218e03adaac1a6e4386c2&v=0"
  },
  {
    "id": "g-0sMwvTH7i-passion-coach",
    "name": "Passion Coach",
    "description": "Passion Coach: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-0sMwvTH7i-passion-coach",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "link"
  },
  {
    "id": "g-KKnaNN6Sj-paul-haberlin",
    "name": "Paul Häberlin",
    "description": "Universal scholar, vast lexicon",
    "url": "https://chatgpt.com/g/g-KKnaNN6Sj-paul-haberlin",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "public",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-Yx27F3HFbrnDIeYoEPZSswjj&gizmo_id=g-KKnaNN6Sj&ts=495231&p=gpp&cid=1&sig=be960502d0483e41427334425b856c7f7e08cfd8c5c8399224bec592bc170107&v=0"
  },
  {
    "id": "g-cnmRkVWfu-paul-haberlin-copy",
    "name": "Paul Häberlin (copy)",
    "description": "Universal scholar, vast lexicon",
    "url": "https://chatgpt.com/g/g-cnmRkVWfu-paul-haberlin-copy",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-Yx27F3HFbrnDIeYoEPZSswjj&gizmo_id=g-cnmRkVWfu&ts=495231&p=gpp&cid=1&sig=30c0a92b72b361ff28071670565f8e1b15bd198f5c1ed337efa9befca845dce9&v=0"
  },
  {
    "id": "g-68499af632f08191905942c10bd7d5de-paul-haberlin-neu",
    "name": "Paul Häberlin (NEU!!!)",
    "description": "Universal scholar, vast lexicon",
    "url": "https://chatgpt.com/g/g-68499af632f08191905942c10bd7d5de-paul-haberlin-neu",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "link",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-Yx27F3HFbrnDIeYoEPZSswjj&gizmo_id=g-68499af632f08191905942c10bd7d5de&ts=495231&p=gpp&cid=1&sig=0b48fc0744261e84e2f14a54a20f0f423a4f148485c652ecfbaf695a9dc795dc&v=0"
  },
  {
    "id": "g-eZ2tlnBdy-pdfchat-brutalism",
    "name": "PDFChat Brutalism",
    "description": "PDFChat Brutalism: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-eZ2tlnBdy-pdfchat-brutalism",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private"
  },
  {
    "id": "g-68caf1e124e4819184a7171e4c16c405-photoshop-cs6",
    "name": "Photoshop CS6",
    "description": "Photoshop CS6: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-68caf1e124e4819184a7171e4c16c405-photoshop-cs6",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-PM1devT2n3GRoknPYt62aH&gizmo_id=g-68caf1e124e4819184a7171e4c16c405&ts=495229&p=gpp&cid=1&sig=db63544e968262e1bfcf908b8adb787540b884e70de27d196cbd0a29131b97d5&v=0"
  },
  {
    "id": "g-68402f28798881918b4ce2d01d8800b2-platon",
    "name": "Platon",
    "description": "Platon: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-68402f28798881918b4ce2d01d8800b2-platon",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "link"
  },
  {
    "id": "g-680620373d08819188af5b5dc338ad32-plotin",
    "name": "Plotin",
    "description": "Plotin: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-680620373d08819188af5b5dc338ad32-plotin",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private"
  },
  {
    "id": "g-1423ToW4V-powershell-guru",
    "name": "Powershell Guru",
    "description": "Powershell Guru: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-1423ToW4V-powershell-guru",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private"
  },
  {
    "id": "g-Au8062Yif-prombt-generator",
    "name": "Prombt Generator",
    "description": "Prombt Generator: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-Au8062Yif-prombt-generator",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "link"
  },
  {
    "id": "g-69401ce859948191af09e63675349bc0-psychologe",
    "name": "Psychologe",
    "description": "Psychologe: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-69401ce859948191af09e63675349bc0-psychologe",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-VS2Zo1kUBiyVdTBmbQYdcU&gizmo_id=g-69401ce859948191af09e63675349bc0&ts=495229&p=gpp&cid=1&sig=0f1c1ff5572a61747dbf382e66ef76e29cec47d3281ca5334d1491b2d01289aa&v=0"
  },
  {
    "id": "g-6970bcf9c91481918ecb4f7cc7b81fcb-psychologe2",
    "name": "Psychologe2",
    "description": "Psychologe2: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-6970bcf9c91481918ecb4f7cc7b81fcb-psychologe2",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-VS2Zo1kUBiyVdTBmbQYdcU&gizmo_id=g-6970bcf9c91481918ecb4f7cc7b81fcb&ts=495229&p=gpp&cid=1&sig=7c09d5a7e5546f0b702e6122b6997f7dc247aeff4bff00be2f0e1abf95774a0b&v=0"
  },
  {
    "id": "g-iul0uY9Vq-python-guru",
    "name": "Python Guru",
    "description": "Python Guru: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-iul0uY9Vq-python-guru",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "link"
  },
  {
    "id": "g-68efc4d0defc8191aa8bd1333034f6a5-react-guru",
    "name": "REACT GURU",
    "description": "REACT GURU: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-68efc4d0defc8191aa8bd1333034f6a5-react-guru",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-PEwLwZdvji1cNKc2uTdY8M&gizmo_id=g-68efc4d0defc8191aa8bd1333034f6a5&ts=495229&p=gpp&cid=1&sig=ef1d692a8a5402bb2560bc1c3c28cac7788a13d230e2c6bb1b471ebcb7185816&v=0"
  },
  {
    "id": "g-tTmmwuYMx-rothbard",
    "name": "Rothbard",
    "description": "Rothbard: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-tTmmwuYMx-rothbard",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private"
  },
  {
    "id": "g-zub1uZF2S-rucksichtsvoller-web-entwickler",
    "name": "Rücksichtsvoller Web-Entwickler",
    "description": "Expert in creating complex HTML/CSS with latest web standards.",
    "url": "https://chatgpt.com/g/g-zub1uZF2S-rucksichtsvoller-web-entwickler",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "public",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-3EFrHiYEOEjIWSVbWtv1awSV&gizmo_id=g-zub1uZF2S&ts=495231&p=gpp&cid=1&sig=92665e6e10cf493db5d16500aba1569796815bbd301ca6100da3fdb5baf3371b&v=0"
  },
  {
    "id": "g-7uECsIODx-satoshi-nakamoto",
    "name": "Satoshi Nakamoto",
    "description": "Satoshi Nakamoto explains Bitcoin in detail using the Feynman method.",
    "url": "https://chatgpt.com/g/g-7uECsIODx-satoshi-nakamoto",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-qWNgIxqv3qKUfC49LHA8RJN0&gizmo_id=g-7uECsIODx&ts=495231&p=gpp&cid=1&sig=9cecb44c7735acd3918851c97e05b9b3153ae634bafb7a2f4d935c8baf874dfb&v=0"
  },
  {
    "id": "g-nzapaPdOM-schreibgehilfe-mit-dunklen-absichten",
    "name": "Schreibgehilfe mit dunklen Absichten",
    "description": "Schreibgehilfe mit dunklen Absichten: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-nzapaPdOM-schreibgehilfe-mit-dunklen-absichten",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private"
  },
  {
    "id": "g-8PI4iw2Ul-schreibtrainer",
    "name": "Schreibtrainer",
    "description": "Schreibtrainer: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-8PI4iw2Ul-schreibtrainer",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "link",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-rMPT6jQMketAn9bcm3UErKuB&gizmo_id=g-8PI4iw2Ul&ts=495231&p=gpp&cid=1&sig=1d76cbcab0cec81d2733c2500e72f8499040008e5f5a9922aa0c3bc823f9172e&v=0"
  },
  {
    "id": "g-tl1izoOLY-art-historian-and-prompt-analyzer",
    "name": "Schwarzweiß Fotografie Dazwischen",
    "description": "Schwarzweiß Fotografie Dazwischen: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-tl1izoOLY-art-historian-and-prompt-analyzer/c/6a439d2f-a3b4-83eb-ab8e-7663fd3e54dd",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "link"
  },
  {
    "id": "g-68f892afe9a48191aa7195b25a236ce0-fotografie-guru",
    "name": "Schwarzweißfotografie mit Dalle 3",
    "description": "Schwarzweißfotografie mit Dalle 3: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-68f892afe9a48191aa7195b25a236ce0-fotografie-guru/c/6a42d059-5d48-83eb-857e-14eab21c0066",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "link"
  },
  {
    "id": "g-684715f3d328819184b7cb8f2375bd81-scum-romance-helper",
    "name": "Scum Romance Helper",
    "description": "Scum Romance Helper: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-684715f3d328819184b7cb8f2375bd81-scum-romance-helper",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-CfYbvD18vWQZAHGkNSMLwM&gizmo_id=g-684715f3d328819184b7cb8f2375bd81&ts=495231&p=gpp&cid=1&sig=c7583fc71badf1db1a24de10d3e14a1e34c5b84c8887fcbe07f44df8c9725102&v=0"
  },
  {
    "id": "g-rzHqI5fYK-senior-web-dev-lead-ivan",
    "name": "Senior Web Dev Lead Ivan",
    "description": "Decisive lead in web dev with a focus on React and CI/CD.",
    "url": "https://chatgpt.com/g/g-rzHqI5fYK-senior-web-dev-lead-ivan",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "link"
  },
  {
    "id": "g-P7PBWJWqA-seo-mentor",
    "name": "SEO MEntor",
    "description": "SEO MEntor: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-P7PBWJWqA-seo-mentor",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "link"
  },
  {
    "id": "g-GqvbVZP16-songtexter",
    "name": "Songtexter",
    "description": "Schreibe Songtexte basierend auf spezifischen Regeln und Anforderungen.",
    "url": "https://chatgpt.com/g/g-GqvbVZP16-songtexter",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-DNLeHFLzF8eMJebCG2Az23iK&gizmo_id=g-GqvbVZP16&ts=495231&p=gpp&cid=1&sig=a0e98c9b4d065a3b52a036a3f8aa25939ffe60235c57d15acc8d00f084223e07&v=0"
  },
  {
    "id": "g-6a0c8e14399c8191b669312a66912943-soziale-angst",
    "name": "Soziale Angst",
    "description": "Soziale Angst: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-6a0c8e14399c8191b669312a66912943-soziale-angst",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private"
  },
  {
    "id": "g-68ee0d7339cc81918d9f2360e0343780-sql-guru",
    "name": "SQL Guru",
    "description": "SQL Guru: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-68ee0d7339cc81918d9f2360e0343780-sql-guru",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private"
  },
  {
    "id": "g-qncUjTnEl-stable-diffusion-expert",
    "name": "Stable Diffusion expert",
    "description": "Stable Diffusion expert: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-qncUjTnEl-stable-diffusion-expert",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private"
  },
  {
    "id": "g-yBR7k6GWX-stable-diffusion-prompt-generator",
    "name": "Stable Diffusion Prompt Generator",
    "description": "Generates detailed and precise prompts for stable diffusion art, leveraging art history and technical expertise.",
    "url": "https://chatgpt.com/g/g-yBR7k6GWX-stable-diffusion-prompt-generator",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-aMMWGg6M5wvRb7oWbjbcjaaH&gizmo_id=g-yBR7k6GWX&ts=495231&p=gpp&cid=1&sig=772a04fdff3328f8712d298d855a2a3a0e4521486c2444e063108e221188cead&v=0"
  },
  {
    "id": "g-tN3ibbuNW-stil-wolfgang",
    "name": "Stil Wolfgang",
    "description": "Stil Wolfgang: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-tN3ibbuNW-stil-wolfgang",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "link"
  },
  {
    "id": "g-68e68f586adc8191940e623c76bc3991-stilberatung",
    "name": "Stilberatung",
    "description": "Stilberatung: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-68e68f586adc8191940e623c76bc3991-stilberatung",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-WVHFkQi1RmjNqt4e75XU6h&gizmo_id=g-68e68f586adc8191940e623c76bc3991&ts=495229&p=gpp&cid=1&sig=569ac0139ed32cd054af11061808354623662018403cbdb5fbbc30809306ebf6&v=0"
  },
  {
    "id": "g-68923382576081918ab6f8dd109a265e-stilkonig",
    "name": "Stilkönig",
    "description": "Stilkönig: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-68923382576081918ab6f8dd109a265e-stilkonig",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private"
  },
  {
    "id": "g-GfZz2vFVJ-structure-and-interpretation-of-computer-programs",
    "name": "Structure and Interpretation of Computer Programs",
    "description": "Structure and Interpretation of Computer Programs: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-GfZz2vFVJ-structure-and-interpretation-of-computer-programs",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "link"
  },
  {
    "id": "g-69184dfa831481919d6c5bfbe8771633-subbrand-berater",
    "name": "Subbrand Berater",
    "description": "Subbrand Berater: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-69184dfa831481919d6c5bfbe8771633-subbrand-berater",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private"
  },
  {
    "id": "g-6a2ad4db16b48191a3ca122401d620ce-subkultur",
    "name": "Subkultur",
    "description": "Subkultur: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-6a2ad4db16b48191a3ca122401d620ce-subkultur",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private"
  },
  {
    "id": "g-690cdd08113c81918ab9ae5770f0d082-sufi-meister",
    "name": "Sufi-Meister",
    "description": "Sufi-Meister: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-690cdd08113c81918ab9ae5770f0d082-sufi-meister",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-GxworJazh36MEGPnmAz8Nz&gizmo_id=g-690cdd08113c81918ab9ae5770f0d082&ts=495229&p=gpp&cid=1&sig=425f729771bb255eb594df8bd9ac5ab41cab51357899ea9092cec0d9039f605f&v=0"
  },
  {
    "id": "g-67488562156081919fd7d6395d8fb8b8-symboliker",
    "name": "Symboliker",
    "description": "Symboliker: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-67488562156081919fd7d6395d8fb8b8-symboliker",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "link"
  },
  {
    "id": "g-69fdae482f4481919123c7d4e04a4edd-synthese-agent",
    "name": "Synthese-Agent",
    "description": "Synthese-Agent: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-69fdae482f4481919123c7d4e04a4edd-synthese-agent",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private"
  },
  {
    "id": "g-0ksF90H85-system-synthesizer",
    "name": "System Synthesizer",
    "description": "Expert in systems thinking and complex problem-solving",
    "url": "https://chatgpt.com/g/g-0ksF90H85-system-synthesizer",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "link",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-69S5lhdWjXWtrgzZzKwhacDQ&gizmo_id=g-0ksF90H85&ts=495231&p=gpp&cid=1&sig=17e09ca85d92fa3d76d75331b62c77381868dac2b59b3cf7d89824bcb7daf3e6&v=0"
  },
  {
    "id": "g-xii15t99v-tino-echo-prombter",
    "name": "Tino Echo Prombter",
    "description": "Adaptiert meinen Schreibstil",
    "url": "https://chatgpt.com/g/g-xii15t99v-tino-echo-prombter",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-l275SvDgVmHf6BsNXDqVo7zG&gizmo_id=g-xii15t99v&ts=495231&p=gpp&cid=1&sig=7a975dcc2a3240f65936b6f685236bf59afc6b54de582e5d18ac135e3c50055e&v=0"
  },
  {
    "id": "g-6a196e6b64848191ba4d083af9f6df24-trakl",
    "name": "Trakl",
    "description": "Trakl: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-6a196e6b64848191ba4d083af9f6df24-trakl",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private"
  },
  {
    "id": "g-68a493bafa708191a0651a72dd0d2375-json2position",
    "name": "Trakl inspirierte Antwort",
    "description": "Trakl inspirierte Antwort: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-68a493bafa708191a0651a72dd0d2375-json2position/c/6a43a74c-7a9c-83eb-af6a-6d6c69b76494",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "link"
  },
  {
    "id": "g-68616710a4388191923bf6eb97e0e84e-udo",
    "name": "UDO",
    "description": "UDO: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-68616710a4388191923bf6eb97e0e84e-udo",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "link",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-CKu2m3ehHmZjLsnCb4hV5F&gizmo_id=g-68616710a4388191923bf6eb97e0e84e&ts=495231&p=gpp&cid=1&sig=c7f3f7463e27c1aba04b72b0084981ccf007f2eeb50681c86f1c7184c01bc294&v=0"
  },
  {
    "id": "g-689850c1672c8191bc3fe9587dc64037-ux-berater",
    "name": "UX Berater",
    "description": "UX Berater: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-689850c1672c8191bc3fe9587dc64037-ux-berater",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "link"
  },
  {
    "id": "g-Hx1Ong8mv-uxy",
    "name": "UXY",
    "description": "UXY, an assistant for web agencies in project initiation, focusing on client discovery, project planning, and risk mitigation.",
    "url": "https://chatgpt.com/g/g-Hx1Ong8mv-uxy",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-J14NUqR3DL27NgoO4YrjwDp4&gizmo_id=g-Hx1Ong8mv&ts=495231&p=gpp&cid=1&sig=d88c2968a48441bd6d753a65b67b87e32da32cc20e0f8f7f6da5b26b66290fbf&v=0"
  },
  {
    "id": "g-699c23f7910881919cf748003589d646-walter-haug",
    "name": "Walter Haug",
    "description": "Walter Haug: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-699c23f7910881919cf748003589d646-walter-haug",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private"
  },
  {
    "id": "g-wgHq4WUFu-war-of-art-mentor",
    "name": "War of Art Mentor",
    "description": "War of Art Mentor: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-wgHq4WUFu-war-of-art-mentor",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "link"
  },
  {
    "id": "g-68fca9be3d8c8191aad0908c9ed87d39-web-designer",
    "name": "Web Designer",
    "description": "Web Designer: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-68fca9be3d8c8191aad0908c9ed87d39-web-designer",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "link"
  },
  {
    "id": "g-PjUF3J8mr-webapp-wizard",
    "name": "WebApp Wizard",
    "description": "I guide as if I authored your web app planning document.",
    "url": "https://chatgpt.com/g/g-PjUF3J8mr-webapp-wizard",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-geumebpGuOhEnIyRmmIvRioV&gizmo_id=g-PjUF3J8mr&ts=495231&p=gpp&cid=1&sig=663c396661e553f857c7bb30012d56063bc06b62da54cd994cd0c5da02d20848&v=0"
  },
  {
    "id": "g-clzlQh1BO-wiedehopf",
    "name": "Wiedehopf",
    "description": "Wiedehopf: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-clzlQh1BO-wiedehopf",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private"
  },
  {
    "id": "g-tl1izoOLY-art-historian-and-prompt-analyzer",
    "name": "Wissenschaftliche Bildbeschreibung Tulsa",
    "description": "Wissenschaftliche Bildbeschreibung Tulsa: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-tl1izoOLY-art-historian-and-prompt-analyzer/c/6a42cf9d-0194-83eb-805b-bb631e2865b5",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "link"
  },
  {
    "id": "g-9kfCJH6OY-wissensverbinder",
    "name": "Wissensverbinder",
    "description": "Wissensverbinder: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-9kfCJH6OY-wissensverbinder",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "link",
    "iconUrl": "https://chatgpt.com/backend-api/estuary/content?id=file-zRx8Jev2LrKbZyUOTQwh9bFT&gizmo_id=g-9kfCJH6OY&ts=495231&p=gpp&cid=1&sig=0615dac026aac4eb02a5f1e2589a824867f696e9759358d55b14e054990387c1&v=0"
  },
  {
    "id": "g-68b49d448e088191892746267f2b3f44-wolfgang",
    "name": "Wolfgang",
    "description": "Wolfgang: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-68b49d448e088191892746267f2b3f44-wolfgang",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private"
  },
  {
    "id": "g-0aDA0yJWl-wordpress-developer",
    "name": "Wordpress Developer",
    "description": "Demanding WordPress Code Specialist",
    "url": "https://chatgpt.com/g/g-0aDA0yJWl-wordpress-developer",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "private"
  },
  {
    "id": "g-67659b481c388191bc931f1dc44a02c8-workshop-guru",
    "name": "Workshop Guru",
    "description": "Workshop Guru: eigener ChatGPT-Agent. Beschreibung kann bei Bedarf ergaenzt werden.",
    "url": "https://chatgpt.com/g/g-67659b481c388191bc931f1dc44a02c8-workshop-guru",
    "tags": [
      "ChatGPT",
      "Importiert"
    ],
    "visibility": "link"
  }
] as const satisfies readonly GptAgent[];
