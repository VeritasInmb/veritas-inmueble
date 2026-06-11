import type { Metadata } from 'next';
import ClientPage from './ClientPage';

export const metadata: Metadata = {
  title: 'Foro Inmobiliario | Veritas Inmueble',
  description: 'Únete a la discusión. Comparte experiencias, realiza preguntas y conecta con la comunidad inmobiliaria.',
};

export default function Page() {
  return <ClientPage />;
}
