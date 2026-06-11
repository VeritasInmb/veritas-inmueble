import type { Metadata } from 'next';
import ClientPage from './ClientPage';

export const metadata: Metadata = {
  title: 'Panel de Administración | Veritas Inmueble',
};

export default function Page() {
  return <ClientPage />;
}
