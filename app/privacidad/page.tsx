import type { Metadata } from 'next';
import ClientPage from './ClientPage';

export const metadata: Metadata = {
  title: 'Aviso de Privacidad | Veritas Inmueble',
  description: 'Lee nuestro aviso de privacidad y cómo protegemos tus datos en Veritas Inmueble.',
};

export default function Page() {
  return <ClientPage />;
}
