"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { UserProfile } from '../../views/UserProfile';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { db } from '../../services/firebase';
import { useVeritasData } from '../../hooks/useVeritasData';

function ProfileContent() {
    const { currentUser, loading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const [userProfileTab, setUserProfileTab] = useState('activity');
    const [userActivity, setUserActivity] = useState<{ reviews: any[]; topics: any[] }>({ reviews: [], topics: [] });
    const [isLoadingActivity, setIsLoadingActivity] = useState(false);

    const { notifications } = useVeritasData(currentUser, 'userProfile');

    useEffect(() => {
        if (!loading && !currentUser) {
            router.replace('/login');
        }
    }, [currentUser, loading, router]);

    useEffect(() => {
        const tab = searchParams?.get('tab');
        if (tab) {
            setUserProfileTab(tab);
        }
    }, [searchParams]);

    useEffect(() => {
        if (currentUser) {
            setIsLoadingActivity(true);
            const unsubscribeReviews = db.collection('resenas').where('usuarioId', '==', currentUser.id).onSnapshot(snap => {
                let reviews = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                reviews.sort((a: any, b: any) => (b.fecha?.seconds || 0) - (a.fecha?.seconds || 0));
                setUserActivity(prev => ({ ...prev, reviews }));
                setIsLoadingActivity(false);
            }, (err) => {
                console.log('User activity reviews error', err);
                setIsLoadingActivity(false);
            });
            
            const unsubscribeTopics = db.collection('forum_topics').where('userId', '==', currentUser.id).onSnapshot(snap => {
                let topics = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                topics.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
                setUserActivity(prev => ({ ...prev, topics }));
                setIsLoadingActivity(false);
            }, (err) => {
                console.log('User activity topics error', err);
                setIsLoadingActivity(false);
            });
            
            return () => { unsubscribeReviews(); unsubscribeTopics(); };
        }
    }, [currentUser]);

    const handleNotificationClick = async (notification: any) => {
        if (!currentUser) return;
        await db.collection('usuarios').doc(currentUser.id).collection('notificaciones').doc(notification.id).update({ read: true });
        if (notification.type.includes('review')) {
            const reviewDoc = await db.collection('resenas').doc(notification.linkId).get();
            if (reviewDoc.exists) {
                const reviewData = reviewDoc.data() as any;
                router.push(`/inmobiliaria/${reviewData.inmobiliariaId}`);
            }
        } else if (notification.type.includes('forum')) {
            router.push(`/foro/${notification.linkId}`);
        }
    };

    if (loading || !currentUser) return null;

    return (
        <UserProfile 
            user={currentUser} 
            currentTab={userProfileTab} 
            setCurrentTab={setUserProfileTab} 
            notifications={notifications} 
            onNotificationClick={handleNotificationClick} 
            userActivity={userActivity} 
            isLoadingActivity={isLoadingActivity} 
            onReviewClick={(r) => router.push(`/inmobiliaria/${r.inmobiliariaId}`)} 
            onTopicClick={(t) => router.push(`/foro/${t.id}`)} 
        />
    );
}

export default function ProfilePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ProfileContent />
        </Suspense>
    );
}
