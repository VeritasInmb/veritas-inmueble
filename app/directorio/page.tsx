import type { Metadata } from 'next';
import ClientPage from './ClientPage';

export const metadata: Metadata = {
  title: 'Directorio de Inmobiliarias | Veritas Inmueble',
  description: 'Explora nuestro directorio completo de agencias inmobiliarias evaluadas y calificadas en México.',
};

export default function Page() {
  return <ClientPage />;
}
