"use client";

import React, { useState, useEffect } from 'react';
import { AgencyProfile } from '../../../views/AgencyProfile';
import { useAuth } from '../../../contexts/AuthContext';
import { db, firebase } from '../../../services/firebase';
import { Inmobiliaria, Reply } from '../../../types';
import { SpinnerIcon } from '../../../components/Icons';
import { ConfirmationModal, AuthModal } from '../../../components/SharedComponents';

export const ClientAgencyProfile = ({ id }: { id: string }) => {
    const { currentUser } = useAuth();
    const [agency, setAgency] = useState<Inmobiliaria | null>(null);
    const [loading, setLoading] = useState(true);
    const [voteError, setVoteError] = useState<{ reviewId: string; message: string } | null>(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    
    const [deleteConfirmationState, setDeleteConfirmationState] = useState<{ 
        isOpen: boolean; 
        type: 'review' | 'reply'; 
        itemId: string; 
        parentId?: string;
        itemData?: any;
    } | null>(null);

    useEffect(() => {
        db.collection('inmobiliarias').doc(id).get().then(doc => {
            if (doc.exists) setAgency({ id: doc.id, ...doc.data() } as Inmobiliaria);
            setLoading(false);
        });
    }, [id]);

    const handleRequireAuth = () => setIsAuthModalOpen(true);

    const createNotification = async (toUserId: string, type: any, content: string, linkId: string) => {
        if (!currentUser || toUserId === currentUser.id) return;
        try {
            await db.collection('usuarios').doc(toUserId).collection('notificaciones').add({
                userId: toUserId, type, content, createdAt: firebase.firestore.FieldValue.serverTimestamp(), read: false, fromUserId: currentUser.id, fromUserName: currentUser.nombre, linkId
            });
        } catch (error) { console.error("Error creating notification:", error); }
    };

    const handleVoteOnReview = async (rid: string, v: 'like' | 'dislike') => { 
        if (!currentUser) { handleRequireAuth(); return; } 
        setVoteError(null); 
        try { 
            await db.runTransaction(async (t) => { 
                const ref = db.collection('resenas').doc(rid); const doc = await t.get(ref); if (!doc.exists) throw new Error("Missing"); 
                const d = doc.data() as any; const userId = currentUser.id; let lbs = d.likedBy || [], dbs = d.dislikedBy || []; 
                if (v === 'like') { const alreadyLiked = lbs.includes(userId); lbs = alreadyLiked ? lbs.filter((id: string) => id !== userId) : [...lbs, userId]; dbs = dbs.filter((id: string) => id !== userId); if (!alreadyLiked) createNotification(d.usuarioId, 'like_review', 'le gustó tu reseña', rid); } 
                else { dbs = dbs.includes(userId) ? dbs.filter((id: string) => id !== userId) : [...dbs, userId]; lbs = lbs.filter((id: string) => id !== userId); } 
                t.update(ref, { likedBy: lbs, dislikedBy: dbs }); 
            }); 
        } catch (e: any) { setVoteError({ reviewId: rid, message: "Error al votar." }); setTimeout(() => setVoteError(null), 4000); } 
    };

    const confirmDeleteAction = async () => {
        if (!deleteConfirmationState) return;
        const { type, itemId, parentId, itemData } = deleteConfirmationState;
        try {
            const deleteAssociatedNotifications = async (linkId: string) => {
                try { const snapshot = await db.collectionGroup('notificaciones').where('linkId', '==', linkId).get(); if (!snapshot.empty) { const batch = db.batch(); snapshot.docs.forEach(doc => batch.delete(doc.ref)); await batch.commit(); } } catch (error) { console.log("Cleanup ignored."); }
            };
            if (type === 'review') { await db.collection('resenas').doc(itemId).delete(); await deleteAssociatedNotifications(itemId); } 
            else if (type === 'reply' && parentId && itemData) { await db.collection('resenas').doc(parentId).update({ replies: firebase.firestore.FieldValue.arrayRemove(itemData) }); } 
        } catch (error) { console.error("Error deleting:", error); alert("Error al eliminar."); } finally { setDeleteConfirmationState(null); }
    };

    if (loading) return <div className="min-h-screen pt-24 flex justify-center"><SpinnerIcon className="w-10 h-10 text-red-600 animate-spin"/></div>;
    if (!agency) return <div className="min-h-screen pt-24 text-center"><h2 className="text-2xl font-bold">Inmobiliaria no encontrada</h2></div>;

    return (
        <>
            <AgencyProfile 
                agency={agency} 
                currentUser={currentUser} 
                onVoteReview={handleVoteOnReview} 
                voteError={voteError} 
                onDeleteReview={(rid) => setDeleteConfirmationState({ isOpen: true, type: 'review', itemId: rid })} 
                onDeleteReply={(rid, r) => setDeleteConfirmationState({ isOpen: true, type: 'reply', itemId: r.id, parentId: rid, itemData: r })} 
                createNotification={createNotification} 
                onRequireAuth={handleRequireAuth} 
            />
            <ConfirmationModal isOpen={!!deleteConfirmationState} onClose={() => setDeleteConfirmationState(null)} onConfirm={confirmDeleteAction} title="Eliminar" message="¿Estás seguro? Esta acción no se puede deshacer." />
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onLogin={() => { setIsAuthModalOpen(false); window.location.href = '/login'; }} />
        </>
    );
};
