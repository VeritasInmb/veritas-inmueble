import { Metadata } from 'next';
import { ClientBlogPost } from './ClientBlogPost';
import { extractIdFromSlug } from '../../../utils/slugify';

type Props = {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = params.slug;
  const id = extractIdFromSlug(slug);
  try {
    const res = await fetch(`https://firestore.googleapis.com/v1/projects/veritas-inmueble-2/databases/(default)/documents/blogs/${id}`);
    const data = await res.json();
    
    if (data.fields && data.fields.title) {
      const title = data.fields.title.stringValue;
      const summary = data.fields.summary?.stringValue || `Lee el artículo completo en Veritas Inmueble.`;
      const imageUrl = data.fields.imageUrl?.stringValue || '';
      return {
        title: `${title} | Blog Veritas`,
        description: summary,
        openGraph: {
          title: `${title} | Blog Veritas Inmueble`,
          description: summary,
          images: imageUrl ? [{ url: imageUrl }] : [],
          type: 'article',
        },
      };
    }
  } catch (error) {
    console.error("Error generating metadata for blog post:", error);
  }
  
  return {
    title: 'Artículo de Blog | Veritas Inmueble',
  };
}

export default function Page({ params }: Props) {
  const id = extractIdFromSlug(params.slug);
  return <ClientBlogPost id={id} />;
}
