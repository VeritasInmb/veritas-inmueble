import type { Metadata } from 'next';
import ClientPage from './ClientPage';

export const metadata: Metadata = {
  title: 'Veritas Inmueble | Inicio',
  description: 'Encuentra y verifica agencias inmobiliarias en México con reseñas y puntuaciones.',
};

export default function Page() {
  return <ClientPage />;
}
