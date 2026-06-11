"use client";

import React from 'react';
import { About } from '../../views/About';
import { useRouter } from 'next/navigation';

export default function AboutPage() {
    const router = useRouter();
    return <About onGoHome={() => router.push('/')} />;
}
