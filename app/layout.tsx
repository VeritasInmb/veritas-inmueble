import type { Metadata } from 'next';
import './globals.css';
import { ClientLayout } from './ClientLayout';
import { AuthProvider } from '../contexts/AuthContext';

export const metadata: Metadata = {
  title: 'Veritas Inmueble - Transparencia Inmobiliaria',
  description: 'Encuentra y verifica agencias inmobiliarias en México. Lee reseñas, compara scores y toma decisiones informadas.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-slate-100 text-slate-900">
        <AuthProvider>
            <ClientLayout>{children}</ClientLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
