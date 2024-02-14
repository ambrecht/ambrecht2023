import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

export default function MarkdownList() {
  const mdFilesPath = path.join(process.cwd(), '/app/mdfiles');
  const fileNames = fs.readdirSync(mdFilesPath);

  const mdFiles = fileNames
    .map((name) => {
      if (name.endsWith('.md')) {
        const filePath = path.join(mdFilesPath, name);
        const content = fs.readFileSync(filePath, 'utf-8');
        return { name, content };
      }
      return null;
    })
    .filter(Boolean);

  return (
    <div className="container mx-auto px-4">
      <ul className="list-decimal list-inside">
        {mdFiles.map((file) => (
          <li key={file?.name} className="border-b border-gray-200 py-4">
            <Link
              className="text-blue-600 hover:text-blue-800 font-semibold text-lg"
              href={`/biblo/${file?.name.replace('.md', '')}`}
            >
              {file?.name.replace('.md', '')}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
