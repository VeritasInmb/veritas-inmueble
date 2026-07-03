"use client";

import React, { useState, useEffect } from 'react';
import { BlogPostView } from '../../../views/Blog';
import { useRouter } from 'next/navigation';
import { db } from '../../../services/firebase';
import { BlogPost } from '../../../types';
import { SpinnerIcon } from '../../../components/Icons';

export const ClientBlogPost = ({ id }: { id: string }) => {
    const router = useRouter();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const doc = await db.collection('blogs').doc(id).get();
                if (doc.exists) {
                    setPost({ id: doc.id, ...doc.data() } as BlogPost);
                }
            } catch (error) {
                console.error("Error fetching blog post:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [id]);
    
    if (loading) return <div className="min-h-screen pt-24 flex justify-center"><SpinnerIcon className="w-10 h-10 text-red-600 animate-spin"/></div>;
    if (!post) return <div className="min-h-screen pt-24 text-center"><h2 className="text-2xl font-bold">Artículo no encontrado</h2></div>;
    
    return <BlogPostView post={post} onBack={() => router.push('/blog')} />;
};
