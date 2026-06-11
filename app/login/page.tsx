import type { Metadata } from 'next';
import ClientPage from './ClientPage';

export const metadata: Metadata = {
  title: 'Iniciar Sesión | Veritas Inmueble',
  description: 'Inicia sesión en tu cuenta de Veritas Inmueble para dejar reseñas y participar en el foro.',
};

export default function Page() {
  return <ClientPage />;
}
