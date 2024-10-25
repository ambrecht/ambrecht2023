import { getPostData } from '@/lib/posts';
import { remark } from 'remark';
import html from 'remark-html';
import Head from 'next/head';

interface Props {
  params: {
    slug: string;
  };
}

export default async function Post({ params }: Props) {
  // Daten des Blogposts abrufen
  const postData = getPostData(params.slug);

  // Verarbeite den Markdown-Inhalt und konvertiere ihn in HTML
  const processedContent = await remark().use(html).process(postData.content);
  let contentHtml = processedContent.toString();

  // Entferne das erste <h1>, wenn es vorhanden ist, um Doppeltitel zu vermeiden
  contentHtml = contentHtml.replace(/<h1>.*?<\/h1>/, '');

  // Passe das HTML an, um Überschriften und Absätze visuell hervorzuheben
  contentHtml = contentHtml
    .replace(
      /<h2>/g,
      '<h2 class="gradientText text-4xl font-bold mt-8 mb-4">', // H2 für visuelle Hervorhebung
    )
    .replace(
      /<h3>/g,
      '<h3 class="gradientText text-3xl font-semibold mt-6 mb-3">',
    ) // H3 für visuelle Hervorhebung
    .replace(
      /<h4>/g,
      '<h4 class="gradientText text-2xl font-medium mt-4 mb-2">',
    ) // H4 für visuelle Hervorhebung
    .replace(
      /<p>/g,
      '<p class="text-lg leading-relaxed text-gray-300 tracking-wide mb-6">',
    );

  return (
    <>
      {/* SEO meta tags */}
      <Head>
        <title>{postData.ogTitle} - My Blog</title>
        <meta name="description" content={postData.ogDescription} />
        <meta property="og:title" content={postData.ogTitle} />
        <meta property="og:description" content={postData.ogDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={postData.ogImage} />
        <meta
          property="og:url"
          content={`https://yourwebsite.com/blog/${params.slug}`}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={postData.ogTitle} />
        <meta name="twitter:description" content={postData.ogDescription} />
        <meta name="twitter:image" content={postData.ogImage} />
      </Head>

      {/* Seiteninhalt */}
      <article className="min-h-screen text-gray-300 px-8 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header-Bereich */}
          <header>
            <h1 className="gradientText text-6xl font-extrabold mb-12 text-center leading-tight tracking-wide">
              {postData.title}
            </h1>
            <p className="text-sm text-gray-400 mb-12 text-center">
              {postData.date}
            </p>
          </header>

          {/* Hauptinhalt */}
          <section
            className="prose prose-lg text-gray-300 leading-relaxed max-w-none space-y-6"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </div>
      </article>
    </>
  );
}
