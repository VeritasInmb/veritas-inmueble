"use client";

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { db, auth, firebase } from '../services/firebase';
import { Inmobiliaria, ViewType, Reply } from '../types';
import { SpinnerIcon } from '../components/Icons';

// Modular Imports
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { useVeritasData } from '../hooks/useVeritasData';
import { ReviewModal, ComparisonModal, ConfirmationModal, ComparisonBar, AuthModal } from '../components/SharedComponents';

export const ClientLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentUser, loading: authLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname() || '';

    // Data Fetching Logic optimized for Routes
    const viewForHook: ViewType = 
        pathname.startsWith('/foro') ? 'forum' : 
        pathname.startsWith('/perfil') ? 'userProfile' : 'home';

    const { notifications, stats, isLoading, error } = useVeritasData(currentUser, viewForHook);

    // UI State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false); 
    const [comparisonList, setComparisonList] = useState<Inmobiliaria[]>([]);
    const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
    
    // Handlers
    const handleLogout = async () => { await auth.signOut(); router.push('/'); };
    const handleRequireAuth = () => setIsAuthModalOpen(true);
    const handleToggleCompare = (agency: Inmobiliaria) => setComparisonList(p => p.some(i => i.id === agency.id) ? p.filter(i => i.id !== agency.id) : p.length < 4 ? [...p, agency] : p);
    const handleClearComparison = () => setComparisonList([]);

    const handleAdminReviewSubmit = async (data: { nombre: string; url: string }) => { 
        if (!currentUser) { handleRequireAuth(); return; } 
        await db.collection("solicitudesRevision").add({ nombreInmobiliaria: data.nombre, url: data.url, fecha: firebase.firestore.FieldValue.serverTimestamp(), usuarioId: currentUser.id, estado: 'pendiente' }); 
    };

    // If initial loading
    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="text-center"><SpinnerIcon className="w-12 h-12 text-red-600 mx-auto" /><p className="mt-4 text-slate-500 font-bold animate-pulse">Cargando Veritas...</p></div>
            </div>
        );
    }

    const isForum = pathname.startsWith('/foro');

    return (
        <div className="flex flex-col min-h-screen bg-slate-100">
            <Header 
                isLoggedIn={!!currentUser} 
                onReviewClick={() => setIsModalOpen(true)} 
                onLogout={handleLogout} 
                notificationsCount={notifications.filter(n => !n.read).length} 
                userAvatar={currentUser?.avatarUrl} 
                userName={currentUser?.nombre} 
                userColor={currentUser?.profileColor}
                userId={currentUser?.id}
                emailVerified={currentUser?.emailVerified}
            />
            <div className={`flex-grow transition-opacity duration-300 opacity-100 ${comparisonList.length > 0 && pathname === '/directorio' ? 'pb-28' : ''}`}>
                {children}
            </div>
            <Footer showAdminLink={currentUser?.rol === 'admin'} className={isForum ? 'mt-0' : undefined} />
            
            {comparisonList.length > 0 && pathname === '/directorio' && (<ComparisonBar agencies={comparisonList} onCompare={() => setIsComparisonModalOpen(true)} onClear={handleClearComparison}/>)}
            
            <ReviewModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleAdminReviewSubmit} currentUser={currentUser} onRequireAuth={handleRequireAuth} />
            <ComparisonModal isOpen={isComparisonModalOpen} onClose={() => setIsComparisonModalOpen(false)} agencies={comparisonList} />
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onLogin={() => { setIsAuthModalOpen(false); router.push('/login'); }} />
        </div>
    );
};
