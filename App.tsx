
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate, useParams } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { db, auth, firebase } from './services/firebase';
import { Inmobiliaria, BlogPost, ViewType, Reply } from './types';
import { Login } from './components/Login';
import { SpinnerIcon, WarningIcon } from './components/Icons';

// Modular Imports
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { useVeritasData } from './hooks/useVeritasData';
import { ReviewModal, ComparisonModal, ConfirmationModal, ComparisonBar, AuthModal } from './components/SharedComponents';

// Pages
import { Home } from './pages/Home';
import { Directory } from './pages/Directory';
import { About } from './pages/About';
import { BlogList, BlogPostView } from './pages/Blog';
import { Forum } from './pages/Forum';
import { AdminPanel } from './pages/AdminPanel';
import { AgencyProfile } from './pages/AgencyProfile';
import { UserProfile } from './pages/UserProfile';
import { Terms } from './pages/Terms';
import { Privacy } from './pages/Privacy';

// --- ROUTE WRAPPERS ---

const Layout: React.FC<{ children: React.ReactNode; currentUser: any; notificationsCount: number; onLogout: () => void; onReviewClick: () => void; }> = ({ children, currentUser, notificationsCount, onLogout, onReviewClick }) => {
    const location = useLocation();
    const isForum = location.pathname.startsWith('/foro');

    return (
        <div className="flex flex-col min-h-screen bg-slate-100">
            <Header 
                isLoggedIn={!!currentUser} 
                onReviewClick={onReviewClick} 
                onLogout={onLogout} 
                notificationsCount={notificationsCount} 
                userAvatar={currentUser?.avatarUrl} 
                userName={currentUser?.nombre} 
                userColor={currentUser?.profileColor}
                userId={currentUser?.id}
                emailVerified={currentUser?.emailVerified}
            />
            <div className="flex-grow">
                {children}
            </div>
            <Footer showAdminLink={currentUser?.rol === 'admin'} className={isForum ? 'mt-0' : undefined} />
        </div>
    );
};

const AgencyProfileRoute = ({ agencies, currentUser, onVoteReview, voteError, onDeleteReview, onDeleteReply, createNotification, onRequireAuth }: any) => {
    const { id } = useParams();
    const [agency, setAgency] = useState<Inmobiliaria | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (agencies.length > 0) {
            const found = agencies.find((a: Inmobiliaria) => a.id === id);
            if (found) {
                setAgency(found);
                setLoading(false);
            } else {
                // Fallback fetch if direct link and agencies not populated yet
                db.collection('inmobiliarias').doc(id).get().then(doc => {
                    if (doc.exists) {
                        setAgency({ id: doc.id, ...doc.data() } as Inmobiliaria);
                    }
                    setLoading(false);
                });
            }
        } else {
             // Initial load fetch
             db.collection('inmobiliarias').doc(id).get().then(doc => {
                if (doc.exists) {
                    setAgency({ id: doc.id, ...doc.data() } as Inmobiliaria);
                }
                setLoading(false);
            });
        }
    }, [id, agencies]);

    if (loading) return <div className="min-h-screen pt-24 flex justify-center"><SpinnerIcon className="w-10 h-10 text-red-600 animate-spin"/></div>;
    if (!agency) return <div className="min-h-screen pt-24 text-center"><h2 className="text-2xl font-bold">Inmobiliaria no encontrada</h2></div>;

    return (
        <AgencyProfile 
            agency={agency} 
            currentUser={currentUser} 
            onVoteReview={onVoteReview} 
            voteError={voteError} 
            onDeleteReview={onDeleteReview} 
            onDeleteReply={onDeleteReply} 
            createNotification={createNotification} 
            onRequireAuth={onRequireAuth} 
        />
    );
};

const BlogPostRoute = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const doc = await db.collection('blogs').doc(id).get();
                if (doc.exists) {
                    setPost({ id: doc.id, ...doc.data() } as BlogPost);
                }
            } catch (error) {
                console.error("Error fetching blog post:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [id]);
    
    if (loading) return <div className="min-h-screen pt-24 flex justify-center"><SpinnerIcon className="w-10 h-10 text-red-600 animate-spin"/></div>;
    if (!post) return <div className="min-h-screen pt-24 text-center"><h2 className="text-2xl font-bold">Artículo no encontrado</h2></div>;
    return <BlogPostView post={post} onBack={() => navigate('/blog')} />;
};

// FIX: Made children optional to prevent TS error about missing property even when children are provided via JSX nesting
const ProtectedRoute = ({ children, user, redirectPath = '/login' }: { children?: React.ReactNode, user: any, redirectPath?: string }) => {
    if (!user) return <Navigate to={redirectPath} replace />;
    return <>{children}</>;
};

// FIX: Made children optional to prevent TS error about missing property even when children are provided via JSX nesting
const AdminRoute = ({ children, user }: { children?: React.ReactNode, user: any }) => {
    if (!user || user.rol !== 'admin') return <Navigate to="/" replace />;
    return <>{children}</>;
};

export default function App() {
    const { currentUser, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Data Fetching Logic optimized for Routes
    const viewForHook: ViewType = 
        location.pathname.startsWith('/foro') ? 'forum' : 
        location.pathname.startsWith('/perfil') ? 'userProfile' : 'home';

    const { notifications, stats, isLoading, error } = useVeritasData(currentUser, viewForHook);

    // UI State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false); 
    const [comparisonList, setComparisonList] = useState<Inmobiliaria[]>([]);
    const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
    
    // Deletion State
    const [deleteConfirmationState, setDeleteConfirmationState] = useState<{ 
        isOpen: boolean; 
        type: 'review' | 'reply' | 'forum_topic' | 'forum_reply'; 
        itemId: string; 
        parentId?: string;
        itemData?: any;
    } | null>(null);

    // Forum & Profile State
    const [activeCategory, setActiveCategory] = useState('cat_gral');
    const [selectedTopic, setSelectedTopic] = useState<any>(null);
    const [userProfileTab, setUserProfileTab] = useState('activity');
    const [userActivity, setUserActivity] = useState<{ reviews: any[]; topics: any[] }>({ reviews: [], topics: [] });
    const [isLoadingActivity, setIsLoadingActivity] = useState(false);
    const [voteError, setVoteError] = useState<{ reviewId: string; message: string } | null>(null);

    // Effects
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    // Handle deep link for User Profile Inbox
    useEffect(() => {
        if (location.pathname === '/perfil' && location.state?.tab) {
            setUserProfileTab(location.state.tab);
        }
    }, [location]);

    // Fetch User Activity
    useEffect(() => {
        if (location.pathname === '/perfil' && currentUser) {
            setIsLoadingActivity(true);
            const unsubscribeReviews = db.collection('resenas').where('usuarioId', '==', currentUser.id).orderBy('fecha', 'desc').onSnapshot(snap => {
                const reviews = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setUserActivity(prev => ({ ...prev, reviews }));
                setIsLoadingActivity(false); // Can be set false here or after both return
            }, (err) => console.log('User activity reviews error', err));
            
            const unsubscribeTopics = db.collection('forum_topics').where('userId', '==', currentUser.id).orderBy('createdAt', 'desc').onSnapshot(snap => {
                const topics = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setUserActivity(prev => ({ ...prev, topics }));
                setIsLoadingActivity(false);
            }, (err) => console.log('User activity topics error', err));
            
            return () => { unsubscribeReviews(); unsubscribeTopics(); };
        }
    }, [location.pathname, currentUser]);

    // Handlers
    const handleLogout = async () => { await auth.signOut(); navigate('/'); };
    const handleRequireAuth = () => setIsAuthModalOpen(true);
    const handleToggleCompare = (agency: Inmobiliaria) => setComparisonList(p => p.some(i => i.id === agency.id) ? p.filter(i => i.id !== agency.id) : p.length < 4 ? [...p, agency] : p);
    const handleClearComparison = () => setComparisonList([]);

    const createNotification = async (toUserId: string, type: any, content: string, linkId: string) => {
        if (!currentUser || toUserId === currentUser.id) return;
        try {
            await db.collection('usuarios').doc(toUserId).collection('notificaciones').add({
                userId: toUserId, type, content, createdAt: firebase.firestore.FieldValue.serverTimestamp(), read: false, fromUserId: currentUser.id, fromUserName: currentUser.nombre, linkId
            });
        } catch (error) { console.error("Error creating notification:", error); }
    };

    const handleAdminReviewSubmit = async (data: { nombre: string; url: string }) => { 
        if (!currentUser) { handleRequireAuth(); return; } 
        await db.collection("solicitudesRevision").add({ nombreInmobiliaria: data.nombre, url: data.url, fecha: firebase.firestore.FieldValue.serverTimestamp(), usuarioId: currentUser.id, estado: 'pendiente' }); 
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
            else if (type === 'forum_topic') { await db.collection('forum_topics').doc(itemId).delete(); if (selectedTopic?.id === itemId) setSelectedTopic(null); await deleteAssociatedNotifications(itemId); } 
            else if (type === 'forum_reply' && parentId) { await db.collection('forum_replies').doc(itemId).delete(); await db.collection('forum_topics').doc(parentId).update({ replyCount: firebase.firestore.FieldValue.increment(1) }); }
        } catch (error) { console.error("Error deleting:", error); alert("Error al eliminar."); } finally { setDeleteConfirmationState(null); }
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

    const handleNotificationClick = async (notification: any) => {
        if (!currentUser) return;
        await db.collection('usuarios').doc(currentUser.id).collection('notificaciones').doc(notification.id).update({ read: true });
        if (notification.type.includes('review')) {
            const reviewDoc = await db.collection('resenas').doc(notification.linkId).get();
            if (reviewDoc.exists) {
                const reviewData = reviewDoc.data() as any;
                // Redirect to agency profile
                navigate(`/inmobiliaria/${reviewData.inmobiliariaId}`);
            }
        } else if (notification.type.includes('forum')) {
            // Logic handled within Forum component usually, but if we are outside:
            setSelectedTopic({ id: notification.linkId } as any);
            navigate('/foro');
        }
    };

    // If initial loading
    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="text-center"><SpinnerIcon className="w-12 h-12 text-red-600 mx-auto" /><p className="mt-4 text-slate-500 font-bold animate-pulse">Cargando Veritas...</p></div>
            </div>
        );
    }

    return (
        <Layout 
            currentUser={currentUser} 
            notificationsCount={notifications.filter(n => !n.read).length} 
            onLogout={handleLogout} 
            onReviewClick={() => setIsModalOpen(true)}
        >
            <div className={`transition-opacity duration-300 opacity-100 ${comparisonList.length > 0 && location.pathname === '/directorio' ? 'pb-28' : ''}`}>
                <Routes>
                    <Route path="/login" element={currentUser ? <Navigate to="/" /> : <Login onSkip={() => navigate('/')} />} />
                    
                    <Route path="/" element={
                        <Home 
                            stats={stats} 
                            onNavigate={(view, agency) => {
                                if (view === 'profile' && agency) navigate(`/inmobiliaria/${agency.id}`);
                                else if (view === 'directory') navigate('/directorio');
                            }} 
                        />
                    } />
                    
                    <Route path="/directorio" element={
                        <Directory 
                            onNavigate={(view, agency) => navigate(`/inmobiliaria/${agency.id}`)}
                            onToggleCompare={handleToggleCompare}
                            comparisonList={comparisonList}
                        />
                    } />
                    
                    <Route path="/nosotros" element={<About onGoHome={() => navigate('/')} />} />
                    
                    <Route path="/blog" element={<BlogList onNavigate={(view, post) => navigate(`/blog/${post.id}`)} />} />
                    <Route path="/blog/:id" element={<BlogPostRoute />} />
                    
                    <Route path="/foro" element={
                        <Forum 
                            currentUser={currentUser} 
                            createNotification={createNotification} 
                            selectedTopic={selectedTopic} 
                            setSelectedTopic={setSelectedTopic} 
                            activeCategory={activeCategory} 
                            setActiveCategory={setActiveCategory} 
                            onRequireAuth={handleRequireAuth} 
                        />
                    } />
                    
                    <Route path="/inmobiliaria/:id" element={
                        <AgencyProfileRoute 
                            agencies={[]} // App.tsx no longer passes agencies, AgencyProfileRoute fetches by id

                            currentUser={currentUser}
                            onVoteReview={handleVoteOnReview}
                            voteError={voteError}
                            onDeleteReview={(rid: string) => setDeleteConfirmationState({ isOpen: true, type: 'review', itemId: rid })}
                            onDeleteReply={(rid: string, r: Reply) => setDeleteConfirmationState({ isOpen: true, type: 'reply', itemId: r.id, parentId: rid, itemData: r })}
                            createNotification={createNotification}
                            onRequireAuth={handleRequireAuth}
                        />
                    } />
                    
                    <Route path="/perfil" element={
                        <ProtectedRoute user={currentUser}>
                            <UserProfile 
                                user={currentUser!} 
                                currentTab={userProfileTab} 
                                setCurrentTab={setUserProfileTab} 
                                notifications={notifications} 
                                onNotificationClick={handleNotificationClick} 
                                userActivity={userActivity} 
                                isLoadingActivity={isLoadingActivity} 
                                onReviewClick={(r) => navigate(`/inmobiliaria/${r.inmobiliariaId}`)} 
                                onTopicClick={(t) => { setSelectedTopic(t); navigate('/foro'); }} 
                            />
                        </ProtectedRoute>
                    } />
                    
                    <Route path="/admin" element={
                        <AdminRoute user={currentUser}>
                            <AdminPanel />
                        </AdminRoute>
                    } />

                    <Route path="/terminos" element={<Terms />} />
                    <Route path="/privacidad" element={<Privacy />} />
                    
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>

            {comparisonList.length > 0 && location.pathname === '/directorio' && (<ComparisonBar agencies={comparisonList} onCompare={() => setIsComparisonModalOpen(true)} onClear={handleClearComparison}/>)}
            
            <ReviewModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleAdminReviewSubmit} currentUser={currentUser} onRequireAuth={handleRequireAuth} />
            <ComparisonModal isOpen={isComparisonModalOpen} onClose={() => setIsComparisonModalOpen(false)} agencies={comparisonList} />
            <ConfirmationModal isOpen={!!deleteConfirmationState} onClose={() => setDeleteConfirmationState(null)} onConfirm={confirmDeleteAction} title="Eliminar" message="¿Estás seguro? Esta acción no se puede deshacer." />
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onLogin={() => { setIsAuthModalOpen(false); navigate('/login'); }} />
        </Layout>
    );
}
