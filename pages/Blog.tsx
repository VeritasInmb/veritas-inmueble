
import React from 'react';
import { BlogPost } from '../types';
import { SpinnerIcon } from '../components/Icons';
import DOMPurify from 'dompurify';

export const BlogList: React.FC<{ posts: BlogPost[]; onNavigate: (view: 'blogPost', post: BlogPost) => void }> = ({ posts, onNavigate }) => {
    if (posts.length === 0) {
        return (
            <div className="flex justify-center items-center h-screen pt-24">
                <SpinnerIcon className="w-10 h-10 text-red-600 animate-spin" />
            </div>
        );
    }

    return (
        <main className="container mx-auto px-4 pt-24 pb-8">
            <section className="text-center mb-16 max-w-4xl mx-auto">
                <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tighter">Blog <span className="text-red-600">Experto</span></h1>
                <p className="text-xl text-slate-600 font-medium leading-relaxed">Guías directas, sin rodeos. Aprende a detectar las trampas del mercado antes de que caigas en ellas.</p>
            </section>
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map(post => (
                    <div key={post.id} onClick={() => onNavigate('blogPost', post)} className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden cursor-pointer group hover:-translate-y-2 transition-all duration-300">
                        <div className="h-56 overflow-hidden"><img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover transition duration-500 group-hover:scale-110 group-hover:rotate-1" /></div>
                        <div className="p-6">
                            <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">{post.date}</p>
                            <h3 className="text-2xl font-black text-slate-900 mb-3 leading-tight group-hover:text-red-600 transition-colors">{post.title}</h3>
                            <p className="text-slate-600 font-medium line-clamp-3">{post.summary}</p>
                            <span className="text-red-600 font-bold text-sm mt-4 inline-block">Leer artículo completo &rarr;</span>
                        </div>
                    </div>
                ))}
            </section>
        </main>
    );
};

export const BlogPostView: React.FC<{ post: BlogPost; onBack: () => void }> = ({ post, onBack }) => {
    // Sanitize the content to prevent XSS attacks
    const sanitizedContent = DOMPurify.sanitize(post.content);

    return (
        <main className="container mx-auto px-4 pt-24 pb-8">
                <article className="max-w-3xl mx-auto bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
                <div className="h-80 sm:h-96 relative"><img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div><div className="absolute bottom-8 left-8 right-8"><h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3 leading-tight">{post.title}</h1><div className="flex items-center text-white/80 text-sm font-bold gap-3"><span className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-md">{post.author}</span><span>{post.date}</span></div></div></div>
                {/* Use sanitized content */}
                <div className="p-8 sm:p-12 prose prose-lg max-w-none prose-headings:font-black prose-headings:text-slate-900 prose-p:text-slate-600 prose-p:leading-relaxed prose-strong:text-slate-900 prose-a:text-red-600" dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
                <div className="px-8 pb-8 sm:px-12 sm:pb-12 pt-0"><button onClick={onBack} className="inline-flex items-center gap-2 text-slate-900 font-black hover:text-red-600 transition bg-slate-50 px-6 py-3 rounded-full">&larr; Volver al Blog</button></div>
            </article>
        </main>
    );
};
