"use client";

import React, { useState } from 'react';
import { Directory } from '../../views/Directory';
import { useRouter } from 'next/navigation';
import { Inmobiliaria } from '../../types';
import { createSlug } from '../../utils/slugify';

export default function DirectoryPage() {
    const router = useRouter();
    const [comparisonList, setComparisonList] = useState<Inmobiliaria[]>([]);
    
    // Note: Comparison global state could be handled here or lifted back to ClientLayout if needed across multiple pages.
    // For now, keeping it here is fine since comparison bar is usually only in directory.
    const handleToggleCompare = (agency: Inmobiliaria) => setComparisonList(p => p.some(i => i.id === agency.id) ? p.filter(i => i.id !== agency.id) : p.length < 4 ? [...p, agency] : p);

    return (
        <Directory 
            onNavigate={(view, agency) => router.push(`/inmobiliaria/${createSlug(agency.nombre, agency.id)}`)}
            onToggleCompare={handleToggleCompare}
            comparisonList={comparisonList}
        />
    );
}
