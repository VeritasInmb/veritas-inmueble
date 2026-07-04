import React, { Suspense } from 'react';
import { ClaimAgency } from '../../views/ClaimAgency';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Veritas Inmueble | Reclamar Perfil',
  description: 'Reclama y gestiona el perfil de tu agencia inmobiliaria.',
};

export default function ClaimAgencyPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center">Cargando formulario...</div>}>
      <ClaimAgency />
    </Suspense>
  );
}
