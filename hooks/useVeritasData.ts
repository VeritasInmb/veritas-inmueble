
import { useState, useEffect } from 'react';
import { db, firebase } from '../services/firebase';
import { Inmobiliaria, Usuario, SolicitudRevision, Resena, ForumTopic, ViewType, Notification, BlogPost } from '../types';

export const useVeritasData = (currentUser: Usuario | null, view: ViewType) => {
    const [agencies, setAgencies] = useState<Inmobiliaria[]>([]);
    const [users, setUsers] = useState<Usuario[]>([]);
    const [reviewRequests, setReviewRequests] = useState<SolicitudRevision[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [forumTopics, setForumTopics] = useState<ForumTopic[]>([]);
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    const [stats, setStats] = useState({ agencies: 0, reviews: 0, frauds: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch Agencies
    useEffect(() => {
        const fetchAgencies = async () => {
            setIsLoading(true);
            try {
                const snapshot = await db.collection('inmobiliarias').get();
                setAgencies(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Inmobiliaria)));
            } catch (error) { 
                console.error("Error:", error); 
                setError("Error de conexión. Intenta recargar."); 
            } finally { 
                setIsLoading(false); 
            }
        };
        fetchAgencies();
    }, []);

    // Fetch Blogs
    useEffect(() => {
        const unsubscribe = db.collection('blogs').onSnapshot(snapshot => {
            const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
            // Sort by ID if they are numeric strings, or add a date field later
            posts.sort((a, b) => Number(a.id) - Number(b.id));
            setBlogPosts(posts);
        }, (error) => {
            console.error("Error fetching blogs:", error);
        });
        return () => unsubscribe();
    }, []);

    // Stats updates
    useEffect(() => { 
        setStats(p => ({ ...p, agencies: agencies.length, frauds: 850 + Math.floor(agencies.length * 350) })); 
    }, [agencies]);

    useEffect(() => { 
        // Removed check for currentUser so guests can see the review count
        return db.collection('resenas').onSnapshot(s => setStats(p => ({ ...p, reviews: s.size })), (err) => console.log('Stats listener error', err)); 
    }, []);

    // Admin subscriptions
    useEffect(() => {
        let unsubscribeUsers = () => {}, unsubscribeRequests = () => {};

        if (currentUser?.rol === 'admin') {
            unsubscribeUsers = db.collection('usuarios').onSnapshot((s) => {
                const uData = s.docs.map(d => ({ id: d.id, ...d.data() } as Usuario)); 
                setUsers(uData);
                unsubscribeRequests = db.collection('solicitudesRevision').orderBy('fecha', 'desc').onSnapshot(rs => {
                    setReviewRequests(rs.docs.map(d => { 
                        const da = d.data() as Omit<SolicitudRevision, 'id'>; 
                        return { 
                            id: d.id, 
                            ...da, 
                            usuarioEmail: uData.find(u => u.id === da.usuarioId)?.email || 'N/A' 
                        } as SolicitudRevision; 
                    }));
                }, (error) => console.error("Error fetching review requests:", error));
            }, (error) => console.error("Error fetching users:", error));
        }
        return () => { unsubscribeUsers(); unsubscribeRequests(); };
    }, [currentUser]);

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

    // Forum Topics (Real Data Only)
    useEffect(() => {
        setIsLoading(true);
        const unsubscribe = db.collection('forum_topics').orderBy('createdAt', 'desc').onSnapshot((snapshot) => {
            const realTopics = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ForumTopic));
            setForumTopics(realTopics);
            setIsLoading(false);
        }, (error) => {
            console.error("Snapshot error:", error);
            setError("Error cargando foro.");
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [view, currentUser]);

    return {
        agencies,
        setAgencies,
        users,
        reviewRequests,
        notifications,
        forumTopics,
        blogPosts,
        stats,
        isLoading,
        setIsLoading,
        error,
        setError
    };
};
