import { Metadata } from 'next';
import { ClientAgencyProfile } from './ClientAgencyProfile';

type Props = {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = params.id;
  try {
    const res = await fetch(`https://firestore.googleapis.com/v1/projects/veritas-inmueble-2/databases/(default)/documents/inmobiliarias/${id}`);
    const data = await res.json();
    
    if (data.fields && data.fields.nombre) {
      const nombre = data.fields.nombre.stringValue;
      return {
        title: `${nombre} | Calificaciones y Quejas - Veritas Inmueble`,
        description: `Conoce la reputación de ${nombre}. Lee reseñas, verifica su score y descubre si tiene quejas antes de contratar sus servicios.`,
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
  return <ClientAgencyProfile id={params.id} />;
}
