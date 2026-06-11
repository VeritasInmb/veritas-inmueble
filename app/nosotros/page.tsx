import type { Metadata } from 'next';
import ClientPage from './ClientPage';

export const metadata: Metadata = {
  title: 'Nosotros | Veritas Inmueble',
  description: 'Conoce más sobre Veritas Inmueble, nuestra misión y por qué promovemos la transparencia en bienes raíces.',
};

export default function Page() {
  return <ClientPage />;
}
