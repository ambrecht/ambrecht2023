// utils/fetchMarkdown.js
import fs from 'fs';
import path from 'path';

export async function fetchMarkdown(fileName: string) {
  const filePath = path.join(process.cwd(), '../app/mdfiles', `${fileName}.md`);
  const content = fs.readFileSync(filePath, 'utf8');
  return content;
}
