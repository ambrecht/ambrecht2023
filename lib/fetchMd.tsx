//E:\ambrecht2024\25092024\ambrecht2023\lib\fetchMd.tsx
import fs from 'fs';
import path from 'path';

export async function fetchMarkdown(fileName: string) {
  const filePath = path.join(process.cwd(), '../app/mdfiles', `${fileName}.md`);
  const content = await fs.promises.readFile(filePath, 'utf8'); // Verwendung von async readFile
  return content;
}
