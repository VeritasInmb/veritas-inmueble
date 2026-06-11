import type { Metadata } from 'next';
import ClientPage from './ClientPage';

export const metadata: Metadata = {
  title: 'Blog de Bienes Raíces | Veritas Inmueble',
  description: 'Consejos, guías y noticias sobre el mercado inmobiliario en México para proteger tu inversión.',
};

export default function Page() {
  return <ClientPage />;
}
