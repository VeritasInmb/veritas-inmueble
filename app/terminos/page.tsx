import type { Metadata } from 'next';
import ClientPage from './ClientPage';

export const metadata: Metadata = {
  title: 'Términos y Condiciones | Veritas Inmueble',
  description: 'Conoce los términos y condiciones de uso de la plataforma Veritas Inmueble.',
};

export default function Page() {
  return <ClientPage />;
}
