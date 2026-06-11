"use client";

import React from 'react';
import { BlogList } from '../../views/Blog';
import { useRouter } from 'next/navigation';

export default function BlogPage() {
    const router = useRouter();
    return <BlogList onNavigate={(view, post) => router.push(`/blog/${post.id}`)} />;
}
