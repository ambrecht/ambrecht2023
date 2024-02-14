import fs from 'fs';
import path from 'path';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default async function Page({ params }: { params: { title: string } }) {
  const mdFilePath = path.join(
    process.cwd(),
    '/app/mdfiles',
    `${params.title}.md`,
  );
  const content = fs.readFileSync(mdFilePath, 'utf-8');

  return (
    <div className="container mx-auto p-4 text-slate-100">
      <h1 className="text-3xl font-bold text-center my-6">{params.title}</h1>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-2xl font-semibold mt-8 mb-4" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-xl font-semibold mt-6 mb-3" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="text-base leading-relaxed my-2" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a
              className="text-blue-600 hover:text-blue-800 underline"
              {...props}
            />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside" {...props} />
          ),
          li: ({ node, ...props }) => <li className="my-1" {...props} />,
          // Weitere benutzerdefinierte Komponenten können hier hinzugefügt werden
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
