import type { Metadata } from 'next';
import ClientPage from './ClientPage';

export const metadata: Metadata = {
  title: 'Mi Perfil | Veritas Inmueble',
};

export default function Page() {
  return <ClientPage />;
}
