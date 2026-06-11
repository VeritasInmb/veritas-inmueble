import React, { useState } from 'react';
import { db, auth } from '../services/firebase';
import { BuildingOfficeIcon, UserIcon, DocumentIcon, ShieldCheckIcon, SpinnerIcon, PlusIcon } from '../components/Icons';
import { ConfirmationModal } from '../components/SharedComponents';
import { mockForumTopics, mockForumReplies } from '../mockForumData';
import { blogPosts as seedBlogPosts } from '../blogData';
import { top20AgenciesData } from '../top20AgenciesData';

import { AgencyManager } from '../features/admin/components/AgencyManager';
import { UserManager } from '../features/admin/components/UserManager';
import { BlogManager } from '../features/admin/components/BlogManager';
import { RequestManager } from '../features/admin/components/RequestManager';

export interface AdminPanelProps {}

export const AdminPanel: React.FC<AdminPanelProps> = () => {
    const [adminView, setAdminView] = useState<'users' | 'agencies' | 'requests' | 'blog' | 'forum'>('agencies');
    
    // Global Delete State for Admin
    const [deletingItem, setDeletingItem] = useState<{ type: 'agency' | 'user' | 'request' | 'blog'; id: string } | null>(null);
    
    // Seeding States
    const [isSeeding, setIsSeeding] = useState(false);
    const [seedStatus, setSeedStatus] = useState<string>('');
    const [isSeedingBlog, setIsSeedingBlog] = useState(false);
    const [isSeedingAgencies, setIsSeedingAgencies] = useState(false);

    const confirmDelete = async () => { 
        if (!deletingItem) return; 
        try { 
            const collectionName = deletingItem.type === 'agency' ? 'inmobiliarias' 
                                 : deletingItem.type === 'user' ? 'usuarios' 
                                 : deletingItem.type === 'blog' ? 'blogs'
                                 : 'solicitudesRevision';
            await db.collection(collectionName).doc(deletingItem.id).delete(); 
        } catch (e) { 
            console.error(e); 
        } 
        setDeletingItem(null); 
    };
    
    // --- Seeding Functions ---
    const handleSeedForumData = async () => {
        if (!auth.currentUser) { alert("No hay usuario autenticado."); return; }
        setIsSeeding(true); setSeedStatus('Iniciando...');
        try {
            const batch = db.batch(); let count = 0;
            mockForumTopics.forEach((topic) => { batch.set(db.collection('forum_topics').doc(topic.id), topic); count++; });
            mockForumReplies.forEach((reply) => { batch.set(db.collection('forum_replies').doc(reply.id), reply); count++; });
            setSeedStatus(`Enviando ${count} registros...`);
            await batch.commit();
            alert(`¡Éxito! Se han creado ${count} registros en la base de datos.`);
            setSeedStatus('');
        } catch (error: any) {
            console.error("Error seeding forum:", error); setSeedStatus('Error.');
            if (error.code === 'permission-denied') alert("ERROR DE PERMISOS: No tienes rol de 'admin'.");
            else alert(`Error desconocido al guardar: ${error.message}`);
        } finally { setIsSeeding(false); }
    };

    const handleSeedBlogData = async () => {
        if (!auth.currentUser) { alert("No hay usuario autenticado."); return; }
        setIsSeedingBlog(true);
        try {
            const batch = db.batch(); let count = 0;
            seedBlogPosts.forEach((post) => { batch.set(db.collection('blogs').doc(String(post.id)), { ...post, id: String(post.id) }); count++; });
            await batch.commit();
            alert(`¡Éxito! Se han subido ${count} artículos del blog a Firestore.`);
        } catch (error: any) { console.error("Error seeding blog:", error); alert(`Error al guardar blog: ${error.message}`); } 
        finally { setIsSeedingBlog(false); }
    };

    const handleSeedTop20Agencies = async () => {
        if (!auth.currentUser) { alert("No hay usuario autenticado."); return; }
        setIsSeedingAgencies(true);
        try {
            const batch = db.batch(); let count = 0;
            top20AgenciesData.forEach((agency) => { batch.set(db.collection('inmobiliarias').doc(), agency); count++; });
            await batch.commit();
            alert(`¡Éxito! Se han subido ${count} inmobiliarias a Firestore.`);
        } catch (error: any) { console.error("Error seeding agencies:", error); alert(`Error al guardar inmobiliarias: ${error.message}`); } 
        finally { setIsSeedingAgencies(false); }
    };

    return (
        <main className="container mx-auto px-4 pt-24 pb-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-4xl font-black text-slate-900">Panel de Control</h1>
                <div className="flex gap-3 flex-wrap justify-end">
                    <button 
                        onClick={handleSeedForumData} 
                        disabled={isSeeding}
                        className={`bg-teal-600 text-white px-5 py-2.5 rounded-full font-bold hover:bg-teal-700 transition shadow-md flex items-center gap-2 text-sm ${isSeeding ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isSeeding ? <SpinnerIcon className="w-4 h-4"/> : <PlusIcon className="w-4 h-4"/>}
                        {isSeeding ? seedStatus : 'Inicializar BD con Datos Demo'}
                    </button>
                    <button 
                        onClick={handleSeedBlogData} 
                        disabled={isSeedingBlog}
                        className={`bg-blue-600 text-white px-5 py-2.5 rounded-full font-bold hover:bg-blue-700 transition shadow-md flex items-center gap-2 text-sm ${isSeedingBlog ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isSeedingBlog ? <SpinnerIcon className="w-4 h-4"/> : <PlusIcon className="w-4 h-4"/>}
                        Inicializar Blog
                    </button>
                    <button 
                        onClick={handleSeedTop20Agencies} 
                        disabled={isSeedingAgencies}
                        className={`bg-indigo-600 text-white px-5 py-2.5 rounded-full font-bold hover:bg-indigo-700 transition shadow-md flex items-center gap-2 text-sm ${isSeedingAgencies ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isSeedingAgencies ? <SpinnerIcon className="w-4 h-4"/> : <PlusIcon className="w-4 h-4"/>}
                        Inicializar Top 20 Inmobiliarias
                    </button>
                </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6">
                <aside className="md:w-1/4 space-y-3">
                    <nav>
                        <button onClick={() => setAdminView('agencies')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold text-left transition-all ${adminView === 'agencies' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-700 hover:bg-slate-50 shadow-sm border border-slate-100'}`}>
                            <BuildingOfficeIcon className="w-5 h-5" /> <span>Inmobiliarias</span>
                        </button>
                        <button onClick={() => setAdminView('users')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold text-left transition-all mt-2 ${adminView === 'users' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-700 hover:bg-slate-50 shadow-sm border border-slate-100'}`}>
                            <UserIcon className="w-5 h-5" /> <span>Usuarios</span>
                        </button>
                        <button onClick={() => setAdminView('blog')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold text-left transition-all mt-2 ${adminView === 'blog' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-700 hover:bg-slate-50 shadow-sm border border-slate-100'}`}>
                            <DocumentIcon className="w-5 h-5" /> <span>Blog</span>
                        </button>
                        <button onClick={() => setAdminView('requests')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold text-left transition-all mt-2 ${adminView === 'requests' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-700 hover:bg-slate-50 shadow-sm border border-slate-100'}`}>
                            <ShieldCheckIcon className="w-5 h-5" /> <span>Solicitudes</span>
                        </button>
                    </nav>
                </aside>
                <section className="md:w-3/4">
                    {adminView === 'agencies' && <AgencyManager setDeletingItem={setDeletingItem} />}
                    {adminView === 'users' && <UserManager setDeletingItem={setDeletingItem} />}
                    {adminView === 'blog' && <BlogManager setDeletingItem={setDeletingItem} />}
                    {adminView === 'requests' && <RequestManager setDeletingItem={setDeletingItem} />}
                </section>
            </div>
            
            <ConfirmationModal 
                isOpen={!!deletingItem} 
                onClose={() => setDeletingItem(null)} 
                onConfirm={confirmDelete} 
                title="Confirmar Eliminación" 
                message="Esta acción es irreversible." 
            />
        </main>
    );
};