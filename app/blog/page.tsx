import { getSortedPostsData } from '@/lib/posts';
import Link from 'next/link';
import Image from 'next/image';

export default function Blog() {
  const allPostsData = getSortedPostsData(); // Blogdaten laden

  return (
    <div className="min-h-screen text-white px-6 py-12">
      {/* Blogüberschrift mit Gradient */}
      <h1 className="text-6xl font-extrabold text-center mb-12 text-white">
        Blog
      </h1>
      {/* Grid Layout für die Blog-Artikel */}
      <ul className="grid grid-cols-1 gap-16 md:grid-cols-2 md:gap-x-8 md:gap-y-32 lg:grid-cols-3 lg:gap-8 max-w-7xl mx-auto">
        {allPostsData.length > 0 ? (
          allPostsData.map(({ id, title, date, description, image }) => (
            <li key={id} className="bg-gray-800 p-6 rounded-lg shadow-md">
              <Link href={`/blog/${id}`}>
                <span className="block text-2xl font-semibold text-blue-400 hover:text-white transition-colors">
                  {title}
                </span>
              </Link>
              <p className="text-sm text-gray-400 mt-2">{date}</p>
              {/* Bild anzeigen, wenn verfügbar */}
              {image && (
                <div className="my-4">
                  <Image
                    src={image}
                    alt={`Bild für ${title}`}
                    width={500}
                    height={300}
                    className="rounded-lg"
                  />
                </div>
              )}
              <p className="text-lg text-gray-300 leading-relaxed mt-4">
                {description ? description : 'Keine Beschreibung verfügbar.'}
              </p>
            </li>
          ))
        ) : (
          <p className="text-center text-gray-500">
            Keine Blogartikel vorhanden
          </p>
        )}
      </ul>
    </div>
  );
}
