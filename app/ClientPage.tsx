"use client";

import React from 'react';
import { Home } from '../views/Home';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useVeritasData } from '../hooks/useVeritasData';

export default function HomePage() {
    const router = useRouter();
    const { currentUser } = useAuth();
    const { stats } = useVeritasData(currentUser, 'home');

    return (
        <Home 
            stats={stats} 
            onNavigate={(view, agency) => {
                if (view === 'profile' && agency) router.push(`/inmobiliaria/${agency.id}`);
                else if (view === 'directory') router.push('/directorio');
            }} 
        />
    );
}
