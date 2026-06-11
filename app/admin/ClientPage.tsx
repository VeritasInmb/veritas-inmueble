"use client";

import React from 'react';
import { AdminPanel } from '../../views/AdminPanel';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminPage() {
    const { currentUser, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && (!currentUser || currentUser.rol !== 'admin')) {
            router.replace('/');
        }
    }, [currentUser, loading, router]);

    if (loading || !currentUser || currentUser.rol !== 'admin') return null;

    return <AdminPanel />;
}
