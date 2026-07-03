"use client";

import React from 'react';
import { Directory } from '../../views/Directory';
import { useRouter } from 'next/navigation';
import { createSlug } from '../../utils/slugify';

export default function DirectoryPage() {
    const router = useRouter();

    return (
        <Directory 
            onNavigate={(view, agency) => router.push(`/inmobiliaria/${createSlug(agency.nombre, agency.id)}`)}
        />
    );
}
