//E:\ambrecht2024\25092024\ambrecht2023\lib\posts.tsx

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Define a type for the blog post data
type BlogPost = {
  id: string;
  title: string;
  date: string;
  content: string;
  excerpt: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  image?: string;
  description?: string;
};

// Path to your blog directory
const postsDirectory = path.join(process.cwd(), 'content/blog');

// Function to load and sort blog posts
// Function to load and sort blog posts
// Funktion zum Laden und Sortieren der Blogposts
export function getSortedPostsData(): BlogPost[] {
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames.map((fileName): BlogPost => {
    const id = fileName.replace(/\.md$/, '');
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);

    // Konstruktion des Blogpost-Objekts
    return {
      id,
      title: matterResult.data.title,
      date: matterResult.data.date,
      description:
        matterResult.data.description || 'Keine Beschreibung verfügbar',
      ogImage: matterResult.data.og_image || '/path-to-default-image.jpg',
      image: matterResult.data.og_image || '/path-to-default-image.jpg', // Hier das Bild setzen
      content: matterResult.content || 'Kein Inhalt verfügbar',
      excerpt:
        matterResult.data.excerpt || matterResult.content.slice(0, 150) + '...',
      ogTitle: matterResult.data.og_title || matterResult.data.title,
      ogDescription:
        matterResult.data.og_description ||
        matterResult.data.excerpt ||
        matterResult.content.slice(0, 150) + '...',
    };
  });

  return allPostsData.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

// Function to load specific blog post data by ID
export function getPostData(id: string): BlogPost {
  const fullPath = path.join(postsDirectory, `${id}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const matterResult = matter(fileContents);

  // Ensure all properties are set, using fallbacks as needed
  return {
    id,
    title: matterResult.data.title,
    date: matterResult.data.date,
    content: matterResult.content || 'No content available',
    excerpt:
      matterResult.data.excerpt || matterResult.content.slice(0, 150) + '...',
    ogTitle: matterResult.data.og_title || matterResult.data.title,
    ogDescription:
      matterResult.data.og_description ||
      matterResult.data.excerpt ||
      matterResult.content.slice(0, 150) + '...',
    ogImage: matterResult.data.og_image || '/path-to-default-image.jpg',
  };
}
