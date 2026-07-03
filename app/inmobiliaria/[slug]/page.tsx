import { Metadata } from 'next';
import { ClientAgencyProfile } from './ClientAgencyProfile';
import { extractIdFromSlug } from '../../../utils/slugify';

type Props = {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = params.slug;
  const id = extractIdFromSlug(slug);
  try {
    const res = await fetch(`https://firestore.googleapis.com/v1/projects/veritas-inmueble-2/databases/(default)/documents/inmobiliarias/${id}`);
    const data = await res.json();
    
    if (data.fields && data.fields.nombre) {
      const nombre = data.fields.nombre.stringValue;
      const imageUrl = data.fields.imageUrl?.stringValue || '';
      const description = `Conoce la reputación de ${nombre}. Lee reseñas, verifica su score y descubre si tiene quejas antes de contratar sus servicios.`;
      
      return {
        title: `${nombre} | Calificaciones y Quejas - Veritas Inmueble`,
        description,
        openGraph: {
          title: `${nombre} | Veritas Inmueble`,
          description,
          images: imageUrl ? [{ url: imageUrl }] : [],
        },
      };
    }
  } catch (error) {
    console.error("Error generating metadata for agency:", error);
  }
  
  return {
    title: 'Inmobiliaria | Veritas Inmueble',
  };
}

export default function Page({ params }: Props) {
  const id = extractIdFromSlug(params.slug);
  return <ClientAgencyProfile id={id} />;
}
