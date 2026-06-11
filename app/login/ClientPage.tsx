"use client";

import React, { useEffect } from 'react';
import { Login } from '../../components/Login';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginPage() {
    const router = useRouter();
    const { currentUser } = useAuth();

    useEffect(() => {
        if (currentUser) router.replace('/');
    }, [currentUser, router]);

    return <Login onSkip={() => router.push('/')} />;
}
