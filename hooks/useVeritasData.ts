
import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { Usuario, Notification, ViewType } from '../types';

export const useVeritasData = (currentUser: Usuario | null, view: ViewType) => {
    // -------------------------------------------------------------
    // ATENCIÓN: agencies, users, reviewRequests, forumTopics, blogPosts 
    // HAN SIDO MOVIDOS A LAZY FETCHING EN SUS RESPECTIVAS PÁGINAS.
    // Solo retornamos arreglos vacíos temporalmente para no romper App.tsx 
    // hasta que termine el refactor completo.
    // -------------------------------------------------------------
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [stats, setStats] = useState({ agencies: 20, reviews: 0, frauds: 850 });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Stats updates
    useEffect(() => { 
        let unsubscribeReviews = () => {};
        
        const fetchStats = async () => {
            try {
                // Firebase v9/v10 compat count query to avoid downloading all documents
                const agenciesSnapshot = await (db.collection('inmobiliarias') as any).count().get();
                const totalAgencies = agenciesSnapshot.data().count;
                
                setStats(p => ({ 
                    ...p, 
                    agencies: totalAgencies, 
                    frauds: 850 + Math.floor(totalAgencies * 350) 
                }));
            } catch (err) {
                console.error("Error fetching stats counts", err);
            }
        };

        fetchStats();

        unsubscribeReviews = db.collection('resenas').onSnapshot(s => setStats(p => ({ ...p, reviews: s.size })), (err) => console.log('Stats listener error', err)); 
        
        return () => {
            unsubscribeReviews();
        };
    }, []);

    // Notifications
    useEffect(() => {
        if (currentUser) {
            return db.collection('usuarios').doc(currentUser.id).collection('notificaciones')
                .orderBy('createdAt', 'desc')
                .limit(50)
                .onSnapshot(snapshot => {
                    const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
                    setNotifications(notifs);
                }, (error) => {
                    console.error("Error subscribing to notifications:", error);
                });
        }
    }, [currentUser]);

    return {
        agencies: [],
        setAgencies: () => {},
        users: [],
        reviewRequests: [],
        notifications,
        forumTopics: [],
        blogPosts: [],
        stats,
        isLoading,
        setIsLoading,
        error,
        setError
    };
};
