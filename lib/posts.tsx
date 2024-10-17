// Datei: E:/ambrecht2024/25092024/ambrecht2023/lib/posts.ts

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Der Pfad zu deinem Blog-Verzeichnis
const postsDirectory = path.join(process.cwd(), 'content/blog');

// Funktion zum Laden und Sortieren der Blogposts
export function getSortedPostsData() {
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames.map((fileName) => {
    const id = fileName.replace(/\.md$/, ''); // Entferne die .md Endung
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);

    return {
      id,
      title: matterResult.data.title,
      date: matterResult.data.date,
      description: matterResult.data.description || '',
    };
  });

  return allPostsData.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime(); // Sortiere nach Datum
  });
}

// Funktion zum Laden eines spezifischen Blogposts anhand der ID
export function getPostData(id: string) {
  const fullPath = path.join(postsDirectory, `${id}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const matterResult = matter(fileContents);

  // Create or use existing excerpt
  const excerpt =
    matterResult.data.excerpt || matterResult.content.slice(0, 150) + '...';

  return {
    id,
    title: matterResult.data.title,
    date: matterResult.data.date,
    content: matterResult.content,
    excerpt,
    ogTitle: matterResult.data.og_title || matterResult.data.title, // Fallback auf Titel
    ogDescription: matterResult.data.og_description || excerpt, // Fallback auf Auszug
    ogImage: matterResult.data.og_image || '/path-to-default-image.jpg', // Fallback auf Standardbild
  };
}
