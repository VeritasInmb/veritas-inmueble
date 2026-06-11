"use client";

import React, { useState } from 'react';
import { Forum } from '../../views/Forum';
import { useAuth } from '../../contexts/AuthContext';
import { db, firebase } from '../../services/firebase';
import { AuthModal } from '../../components/SharedComponents';

export default function ForumPage() {
    const { currentUser } = useAuth();
    const [selectedTopic, setSelectedTopic] = useState<any>(null);
    const [activeCategory, setActiveCategory] = useState('cat_gral');
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const handleRequireAuth = () => setIsAuthModalOpen(true);

    const createNotification = async (toUserId: string, type: any, content: string, linkId: string) => {
        if (!currentUser || toUserId === currentUser.id) return;
        try {
            await db.collection('usuarios').doc(toUserId).collection('notificaciones').add({
                userId: toUserId, type, content, createdAt: firebase.firestore.FieldValue.serverTimestamp(), read: false, fromUserId: currentUser.id, fromUserName: currentUser.nombre, linkId
            });
        } catch (error) { console.error("Error creating notification:", error); }
    };

    return (
        <>
            <Forum 
                currentUser={currentUser} 
                createNotification={createNotification} 
                selectedTopic={selectedTopic} 
                setSelectedTopic={setSelectedTopic} 
                activeCategory={activeCategory} 
                setActiveCategory={setActiveCategory} 
                onRequireAuth={handleRequireAuth} 
            />
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onLogin={() => { setIsAuthModalOpen(false); window.location.href = '/login'; }} />
        </>
    );
}
