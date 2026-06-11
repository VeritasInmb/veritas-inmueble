import React, { useState, useEffect, useMemo } from 'react';
import { BlogPost } from '../../../types';
import { db } from '../../../services/firebase';
import { AdminSection } from './AdminSection';
import { PencilIcon, TrashIcon } from '../../../components/Icons';
import { BlogPostFormModal } from '../modals/BlogPostFormModal';

export const BlogManager: React.FC<{ setDeletingItem: (item: any) => void }> = ({ setDeletingItem }) => {
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    const [adminSearchTerm, setAdminSearchTerm] = useState('');
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);

    useEffect(() => {
        const unsubscribe = db.collection('blogs').onSnapshot(snapshot => {
            const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
            posts.sort((a, b) => Number(a.id) - Number(b.id));
            setBlogPosts(posts);
        }, (error) => console.error("Error fetching blogs:", error));
        return () => unsubscribe();
    }, []);

    const filteredBlogPosts = useMemo(() => 
        blogPosts.filter(p => p.title.toLowerCase().includes(adminSearchTerm.toLowerCase())), 
        [blogPosts, adminSearchTerm]
    );

    const handleSavePost = async (pd: Omit<BlogPost, 'id'> & { id?: string }) => {
        try {
            if (pd.id) {
                const { id, ...data } = pd;
                await db.collection("blogs").doc(id).update(data);
            } else {
                const { id, ...data } = pd;
                await db.collection("blogs").add(data);
            }
        } catch (e) {
            console.error("Error saving post:", e);
            alert("Error al guardar.");
        }
        setIsPostModalOpen(false);
        setEditingPost(null);
    };

    return (
        <>
            <AdminSection title="Artículos del Blog" buttonText="Crear Artículo" onButtonClick={() => {setEditingPost(null); setIsPostModalOpen(true);}} onSearch={setAdminSearchTerm}>
                <table className="w-full mt-4 text-left border-collapse">
                    <thead><tr><th className="p-4 text-xs font-bold uppercase text-slate-500">Título</th><th className="p-4 text-xs font-bold uppercase text-slate-500">Autor</th><th className="p-4 text-xs font-bold uppercase text-slate-500">Fecha</th><th className="p-4 text-xs font-bold uppercase text-slate-500">Acciones</th></tr></thead>
                    <tbody>
                        {filteredBlogPosts.map(post => (
                            <tr key={post.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 font-bold text-slate-900 line-clamp-1">{post.title}</td>
                                <td className="p-4 text-sm font-medium text-slate-600">{post.author}</td>
                                <td className="p-4 text-sm text-slate-500">{post.date}</td>
                                <td className="p-4 flex gap-2">
                                    <button onClick={() => {setEditingPost(post); setIsPostModalOpen(true);}}><PencilIcon className="w-5 h-5 text-slate-400 hover:text-blue-600 transition"/></button>
                                    <button onClick={() => setDeletingItem({type: 'blog', id: post.id})}><TrashIcon className="w-5 h-5 text-slate-400 hover:text-red-600 transition"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </AdminSection>
            {isPostModalOpen && <BlogPostFormModal isOpen={isPostModalOpen} onClose={() => {setEditingPost(null); setIsPostModalOpen(false);}} onSave={handleSavePost} post={editingPost} />}
        </>
    );
};
