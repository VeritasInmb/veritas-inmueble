"use client";

import React from 'react';
import { BlogList } from '../../views/Blog';
import { useRouter } from 'next/navigation';

import { createSlug } from '../../utils/slugify';

export default function BlogPage() {
    const router = useRouter();
    return <BlogList onNavigate={(view, post) => router.push(`/blog/${createSlug(post.title, post.id)}`)} />;
}
