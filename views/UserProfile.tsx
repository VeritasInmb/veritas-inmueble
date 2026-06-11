
import React, { useState, useEffect } from 'react';
import { Usuario, Notification, Resena, ForumTopic } from '../types';
import { db, firebase, auth } from '../services/firebase';
import { PencilIcon, SpinnerIcon, ChartBarIcon, StarIcon, MessageSquareIcon, InboxIcon, BellIcon, HeartIcon, CheckCircleIcon, WarningIcon } from '../components/Icons';
import { UserAvatar } from '../components/ui/UserAvatar';

const { Timestamp } = firebase.firestore;

interface UserProfileProps {
    user: Usuario;
    currentTab: string;
    setCurrentTab: (tab: string) => void;
    notifications: Notification[];
    onNotificationClick: (notification: Notification) => Promise<void>;
    userActivity: { reviews: Resena[]; topics: ForumTopic[] };
    isLoadingActivity: boolean;
    onReviewClick: (review: Resena) => void;
    onTopicClick: (topic: ForumTopic) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, currentTab, setCurrentTab, notifications, onNotificationClick, userActivity, isLoadingActivity, onReviewClick, onTopicClick }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [bio, setBio] = useState(user.bio || '');
    const [isSaving, setIsSaving] = useState(false);
    const [loadingNotificationId, setLoadingNotificationId] = useState<string | null>(null);
    
    // Verification Logic
    const [isResending, setIsResending] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    const formatDate = (ts: any) => ts instanceof Timestamp ? ts.toDate().toLocaleDateString() : 'Reciente';
    const unreadCount = notifications.filter(n => !n.read).length;

    // Timer for cooldown
    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    const handleSave = async () => {
        setIsSaving(true);
        // Only saving bio updates now, no avatar upload
        await db.collection('usuarios').doc(user.id).update({ bio });
        setIsSaving(false);
        setIsEditing(false);
    };

    const handleNotifClick = async (notification: Notification) => {
        setLoadingNotificationId(notification.id);
        await onNotificationClick(notification);
        setLoadingNotificationId(null);
    }

    const handleResendVerification = async () => {
        if (!auth.currentUser) return;
        setIsResending(true);
        try {
            await auth.currentUser.sendEmailVerification();
            setCooldown(60);
            alert("Hemos enviado un enlace de confirmación a tu correo. Por favor revisa tu bandeja de entrada y spam.");
        } catch (error: any) {
            console.error(error);
            alert("Error al enviar el correo. Por favor intenta más tarde.");
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="container mx-auto px-4 pt-24 pb-8 flex flex-col lg:flex-row gap-6 min-h-screen">
            <aside className="w-full lg:w-72 shrink-0 space-y-6">
                <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 p-6 text-center">
                    <div className="mx-auto mb-4 flex justify-center">
                         <UserAvatar 
                            name={user.nombre} 
                            avatarUrl={user.avatarUrl} 
                            color={user.profileColor} 
                            userId={user.id}
                            className="w-24 h-24 text-4xl"
                         />
                    </div>
                    
                    <h2 className="font-black text-slate-900 text-xl leading-tight">{user.nombre}</h2>
                    
                    {/* EMAIL & VERIFICATION STATUS */}
                    <div className="mt-2 mb-4 flex flex-col items-center gap-2">
                        <p className="text-slate-500 font-medium text-sm break-all">{user.email}</p>
                        
                        {user.verificado ? (
                            <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200">
                                <CheckCircleIcon className="w-3 h-3"/> Verificado
                            </span>
                        ) : (
                            <div className="flex flex-col items-center gap-2 w-full">
                                <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-bold border border-amber-200 animate-pulse">
                                    <WarningIcon className="w-3 h-3"/> No Verificado
                                </span>
                                <button 
                                    onClick={handleResendVerification}
                                    disabled={isResending || cooldown > 0}
                                    className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline disabled:opacity-50 disabled:no-underline transition-all"
                                >
                                    {isResending ? <SpinnerIcon className="w-3 h-3 inline animate-spin"/> : cooldown > 0 ? `Reenviar en ${cooldown}s` : 'Verificar ahora'}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="w-full h-px bg-slate-100 my-4"></div>

                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Biografía</p>
                    
                    {isEditing ? (
                        <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm focus:outline-none focus:border-slate-300 transition" placeholder="Escribe algo sobre ti..." rows={3} />
                    ) : (
                        <p className="text-slate-600 text-sm leading-relaxed italic">
                            "{user.bio || 'Sin biografía aún.'}"
                        </p>
                    )}
                    
                    <p className="text-slate-300 text-xs font-bold mt-4">Miembro desde {formatDate(user.createdAt || Timestamp.now())}</p>

                    {isEditing ? (
                         <div className="flex gap-2 mt-4">
                            <button onClick={() => { setIsEditing(false); setBio(user.bio || ''); }} className="flex-1 py-2 bg-slate-100 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-200 transition">Cancelar</button>
                            <button onClick={handleSave} disabled={isSaving} className="flex-1 py-2 bg-red-600 rounded-full text-xs font-bold text-white hover:bg-red-700 transition flex items-center justify-center gap-1">
                                {isSaving ? <SpinnerIcon className="w-4 h-4"/> : 'Guardar'}
                            </button>
                         </div>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="w-full mt-4 py-2 bg-slate-50 border border-slate-100 rounded-full text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition flex items-center justify-center gap-2">
                            <PencilIcon className="w-3 h-3" /> Editar Bio
                        </button>
                    )}
                </div>
                <nav className="bg-white rounded-[2rem] shadow-xl border border-slate-100 p-2 flex flex-col gap-1">
                    <button onClick={() => setCurrentTab('activity')} className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-2xl font-semibold transition ${currentTab === 'activity' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
                        <ChartBarIcon className="w-5 h-5"/> Actividad
                    </button>
                    <button onClick={() => setCurrentTab('reviews')} className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-2xl font-semibold transition ${currentTab === 'reviews' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
                        <StarIcon className="w-5 h-5" filled={currentTab === 'reviews'}/> Mis Reseñas
                    </button>
                    <button onClick={() => setCurrentTab('topics')} className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-2xl font-semibold transition ${currentTab === 'topics' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
                        <MessageSquareIcon className="w-5 h-5"/> Mis Discusiones
                    </button>
                    <button onClick={() => setCurrentTab('inbox')} className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-2xl font-semibold transition relative ${currentTab === 'inbox' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
                        <InboxIcon className="w-5 h-5"/> Buzón 
                        {unreadCount > 0 && <span className="ml-auto bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>}
                    </button>
                </nav>
            </aside>
            <main className="flex-1 bg-white rounded-[2rem] shadow-xl border border-slate-100 p-6 sm:p-8">
                {currentTab === 'activity' && (
                    <div className="space-y-6">
                        <h3 className="text-2xl font-black text-slate-900 mb-4">Resumen de Actividad</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-slate-50 p-4 rounded-2xl flex flex-col items-center">
                                <span className="text-3xl font-black text-slate-900">{userActivity.reviews.length}</span>
                                <span className="text-sm text-slate-500 font-bold mt-1">Reseñas</span>
                            </div>
                             <div className="bg-slate-50 p-4 rounded-2xl flex flex-col items-center">
                                <span className="text-3xl font-black text-slate-900">{userActivity.topics.length}</span>
                                <span className="text-sm text-slate-500 font-bold mt-1">Discusiones</span>
                            </div>
                             <div className="bg-slate-50 p-4 rounded-2xl flex flex-col items-center">
                                <span className="text-3xl font-black text-slate-900">{userActivity.reviews.reduce((acc, r) => acc + (r.likedBy?.length || 0), 0)}</span>
                                <span className="text-sm text-slate-500 font-bold mt-1">Likes Recibidos</span>
                            </div>
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 mt-8 mb-4">Últimos Movimientos</h4>
                        {isLoadingActivity ? <SpinnerIcon className="w-8 h-8 animate-spin mx-auto"/> : userActivity.reviews.length === 0 && userActivity.topics.length === 0 ? (
                            <p className="text-slate-500 text-center py-8">Aún no tienes actividad reciente.</p>
                        ) : (
                            <div className="space-y-4">
                                {userActivity.topics.slice(0, 3).map(t => (
                                    <div key={t.id} onClick={() => onTopicClick(t)} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center cursor-pointer hover:bg-slate-100 transition">
                                        <div>
                                            <p className="font-bold text-slate-900">{t.title}</p>
                                            <p className="text-xs text-slate-500">Publicado el {formatDate(t.createdAt)}</p>
                                        </div>
                                        <MessageSquareIcon className="w-4 h-4 text-slate-400"/>
                                    </div>
                                ))}
                                {userActivity.reviews.slice(0, 3).map(r => (
                                    <div key={r.id} onClick={() => onReviewClick(r)} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center cursor-pointer hover:bg-slate-100 transition">
                                        <div className="truncate pr-4">
                                            <p className="font-bold text-slate-900 truncate">Reseña: {r.comentario.substring(0, 50)}...</p>
                                            <p className="text-xs text-slate-500">Publicada el {formatDate(r.fecha)}</p>
                                        </div>
                                        <StarIcon className="w-4 h-4 text-yellow-400 shrink-0" filled={true}/>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {currentTab === 'inbox' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                                <InboxIcon className="w-6 h-6"/> Buzón de Entrada
                            </h3>
                            {unreadCount > 0 && (
                                <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">{unreadCount} sin leer</span>
                            )}
                        </div>
                        {notifications.length === 0 ? (
                            <div className="text-center py-12 bg-slate-50 rounded-3xl border border-slate-100">
                                <BellIcon className="w-12 h-12 text-slate-300 mx-auto mb-4"/>
                                <p className="text-slate-500 font-medium">Todo tranquilo por aquí.</p>
                                <p className="text-sm text-slate-400">Te avisaremos cuando haya novedades.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {notifications.map(notification => (
                                    <div key={notification.id} onClick={() => handleNotifClick(notification)} className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 group relative ${notification.read ? 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50' : 'bg-red-50 border-red-100 text-slate-900 shadow-sm'}`}>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notification.read ? 'bg-slate-100' : 'bg-white border border-red-100'}`}>
                                            {notification.type.includes('like') ? <HeartIcon className={`w-5 h-5 ${notification.read ? 'text-slate-400' : 'text-red-500'}`}/> : <MessageSquareIcon className={`w-5 h-5 ${notification.read ? 'text-slate-400' : 'text-blue-500'}`}/>}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold">{notification.fromUserName} <span className="font-normal">{notification.content}</span></p>
                                            <p className="text-xs opacity-70 mt-1">{formatDate(notification.createdAt)}</p>
                                        </div>
                                        {!notification.read && <div className="w-3 h-3 bg-red-600 rounded-full mt-1"></div>}
                                        {loadingNotificationId === notification.id && (
                                            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                                <SpinnerIcon className="w-6 h-6 text-red-600 animate-spin"/>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {currentTab === 'reviews' && (
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2"><StarIcon className="w-6 h-6 text-yellow-400" filled/> Mis Reseñas ({userActivity.reviews.length})</h3>
                        <div className="space-y-4">
                             {userActivity.reviews.map(r => (
                                <div key={r.id} onClick={() => onReviewClick(r)} className="bg-slate-50 rounded-2xl p-5 border border-slate-100 cursor-pointer hover:bg-slate-100 transition">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex gap-1">{[1,2,3,4,5].map(s => <StarIcon key={s} className="w-4 h-4" filled={s <= r.calificacion}/>)}</div>
                                        <span className="text-xs text-slate-400 font-bold">{formatDate(r.fecha)}</span>
                                    </div>
                                    <p className="text-slate-700 text-sm leading-relaxed">{r.comentario}</p>
                                    <div className="flex items-center gap-4 mt-4 text-xs font-bold text-slate-500">
                                        <span className="flex items-center gap-1"><HeartIcon className="w-4 h-4"/> {r.likedBy?.length || 0}</span>
                                        <span className="flex items-center gap-1"><MessageSquareIcon className="w-4 h-4"/> {r.replies?.length || 0}</span>
                                    </div>
                                </div>
                             ))}
                             {userActivity.reviews.length === 0 && <p className="text-slate-500 text-center py-8">Aún no has escrito ninguna reseña.</p>}
                        </div>
                    </div>
                )}
                {currentTab === 'topics' && (
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2"><MessageSquareIcon className="w-6 h-6"/> Mis Discusiones ({userActivity.topics.length})</h3>
                        <div className="space-y-4">
                            {userActivity.topics.map(t => (
                                <div key={t.id} onClick={() => onTopicClick(t)} className="bg-slate-50 rounded-2xl p-5 border border-slate-100 cursor-pointer hover:bg-slate-100 transition">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-slate-900">{t.title}</h4>
                                        <span className="text-xs text-slate-400 font-bold whitespace-nowrap ml-4">{formatDate(t.createdAt)}</span>
                                    </div>
                                    <p className="text-slate-600 text-sm line-clamp-2">{t.content}</p>
                                    <div className="flex items-center gap-4 mt-4 text-xs font-bold text-slate-500">
                                        <span className="flex items-center gap-1"><HeartIcon className="w-4 h-4"/> {t.likes?.length || 0}</span>
                                        <span className="flex items-center gap-1"><MessageSquareIcon className="w-4 h-4"/> {t.replyCount || 0}</span>
                                    </div>
                                </div>
                            ))}
                            {userActivity.topics.length === 0 && <p className="text-slate-500 text-center py-8">Aún no has iniciado discusiones en el foro.</p>}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};