import { Metadata } from 'next';
import { ClientBlogPost } from './ClientBlogPost';

type Props = {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = params.id;
  try {
    const res = await fetch(`https://firestore.googleapis.com/v1/projects/veritas-inmueble-2/databases/(default)/documents/blogs/${id}`);
    const data = await res.json();
    
    if (data.fields && data.fields.title) {
      const title = data.fields.title.stringValue;
      const summary = data.fields.summary?.stringValue || `Lee el artículo completo en Veritas Inmueble.`;
      return {
        title: `${title} | Blog Veritas`,
        description: summary,
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
  return <ClientBlogPost id={params.id} />;
}
