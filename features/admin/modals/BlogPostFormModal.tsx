import React, { useState, useEffect } from 'react';
import { BlogPost } from '../../../types';

export const BlogPostFormModal = ({ isOpen, onClose, onSave, post }: { isOpen: boolean; onClose: () => void; onSave: (data: Omit<BlogPost, 'id'> & { id?: string }) => void; post: BlogPost | null; }) => {
    const [fd, setFd] = useState<Partial<BlogPost>>({});
    
    useEffect(() => { 
        setFd(post || { 
            title: '', 
            author: 'Equipo Veritas', 
            date: new Date().toLocaleDateString('es-MX', {day: 'numeric', month: 'long', year: 'numeric'}), 
            summary: '', 
            content: '', 
            imageUrl: '' 
        }); 
    }, [post, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFd({ ...fd, [e.target.name]: e.target.value });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-[101]">
            <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <h3 className="text-2xl font-black text-slate-900 mb-6">{post ? 'Editar' : 'Crear'} Artículo</h3>
                <form onSubmit={(e) => { e.preventDefault(); onSave({ ...post, ...fd } as Omit<BlogPost, 'id'> & { id?: string }); }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2"><label className="text-sm font-bold ml-1">Título</label><input name="title" value={fd.title ?? ''} onChange={handleChange} required className="w-full mt-1 p-3 bg-slate-50 border-2 border-slate-100 rounded-2xl"/></div>
                    <div><label className="text-sm font-bold ml-1">Autor</label><input name="author" value={fd.author ?? ''} onChange={handleChange} required className="w-full mt-1 p-3 bg-slate-50 border-2 border-slate-100 rounded-2xl"/></div>
                    <div><label className="text-sm font-bold ml-1">Fecha (Texto)</label><input name="date" value={fd.date ?? ''} onChange={handleChange} required className="w-full mt-1 p-3 bg-slate-50 border-2 border-slate-100 rounded-2xl"/></div>
                    <div className="md:col-span-2"><label className="text-sm font-bold ml-1">URL Imagen</label><input name="imageUrl" value={fd.imageUrl ?? ''} onChange={handleChange} required className="w-full mt-1 p-3 bg-slate-50 border-2 border-slate-100 rounded-2xl"/></div>
                    <div className="md:col-span-2"><label className="text-sm font-bold ml-1">Resumen (Intro)</label><textarea name="summary" value={fd.summary ?? ''} onChange={handleChange} required className="w-full mt-1 p-3 bg-slate-50 border-2 border-slate-100 rounded-2xl h-24"/></div>
                    <div className="md:col-span-2">
                        <label className="text-sm font-bold ml-1">Contenido (HTML)</label>
                        <p className="text-xs text-slate-400 mb-1">Usa etiquetas &lt;p&gt;, &lt;h3&gt;, &lt;ul&gt; para dar formato.</p>
                        <textarea name="content" value={fd.content ?? ''} onChange={handleChange} required className="w-full mt-1 p-3 bg-slate-50 border-2 border-slate-100 rounded-2xl h-64 font-mono text-sm"/>
                    </div>
                    
                    <div className="md:col-span-2 flex justify-end gap-4 mt-4">
                        <button type="button" onClick={onClose} className="px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 font-bold transition">Cancelar</button>
                        <button type="submit" className="px-6 py-3 rounded-full bg-red-600 text-white hover:bg-red-700 font-bold transition shadow-md">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
