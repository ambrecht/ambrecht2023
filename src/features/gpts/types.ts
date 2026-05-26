export type GptVisibility = 'private' | 'link' | 'public';

export type GptAgent = {
  id: string;
  name: string;
  description: string;
  url:
    | `https://chatgpt.com/g/${string}`
    | `https://chat.openai.com/g/${string}`;
  tags: readonly string[];
  visibility: GptVisibility;
  favorite?: boolean;
};
