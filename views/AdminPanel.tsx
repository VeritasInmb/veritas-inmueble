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
import { ClaimManager } from '../features/admin/components/ClaimManager';

export interface AdminPanelProps {}

export const AdminPanel: React.FC<AdminPanelProps> = () => {
    const [adminView, setAdminView] = useState<'users' | 'agencies' | 'requests' | 'claims' | 'blog' | 'forum'>('agencies');
    
    // Global Delete State for Admin
    const [deletingItem, setDeletingItem] = useState<{ type: 'agency' | 'user' | 'request' | 'claim' | 'blog'; id: string } | null>(null);

    const confirmDelete = async () => { 
        if (!deletingItem) return; 
        try { 
            const collectionName = deletingItem.type === 'agency' ? 'inmobiliarias' 
                                 : deletingItem.type === 'user' ? 'usuarios' 
                                 : deletingItem.type === 'blog' ? 'blogs'
                                 : deletingItem.type === 'claim' ? 'claim_requests'
                                 : 'solicitudesRevision';
            await db.collection(collectionName).doc(deletingItem.id).delete(); 
        } catch (e) { 
            console.error(e); 
        } 
        setDeletingItem(null); 
    };

    return (
        <main className="container mx-auto px-4 pt-24 pb-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-4xl font-black text-slate-900">Panel de Control</h1>
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
                            <ShieldCheckIcon className="w-5 h-5" /> <span>Reportes Usuarios</span>
                        </button>
                        <button onClick={() => setAdminView('claims')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold text-left transition-all mt-2 ${adminView === 'claims' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-700 hover:bg-slate-50 shadow-sm border border-slate-100'}`}>
                            <BuildingOfficeIcon className="w-5 h-5" /> <span>Dueños Inmobiliarias</span>
                        </button>
                    </nav>
                </aside>
                <section className="md:w-3/4">
                    {adminView === 'agencies' && <AgencyManager setDeletingItem={setDeletingItem} />}
                    {adminView === 'users' && <UserManager setDeletingItem={setDeletingItem} />}
                    {adminView === 'blog' && <BlogManager setDeletingItem={setDeletingItem} />}
                    {adminView === 'requests' && <RequestManager setDeletingItem={setDeletingItem} />}
                    {adminView === 'claims' && <ClaimManager setDeletingItem={setDeletingItem} />}
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