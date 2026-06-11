
import React, { useEffect, useState } from 'react';
import { Inmobiliaria, Resena, Usuario, Reply } from '../types';
import { db, firebase } from '../services/firebase';
import { getScoreInfo } from '../constants';
import { ScoreDonutChart, MetricCard } from '../components/SharedComponents';
import { ReviewForm, ReviewList } from '../components/reviews/ReviewSystem';
import { WarningIcon, DocumentIcon, StarIcon, MagnifyingGlassIcon, UserIcon, ShareIcon, CheckCircleIcon } from '../components/Icons';

interface AgencyProfileProps {
    agency: Inmobiliaria;
    currentUser: Usuario | null;
    onVoteReview: (rid: string, v: 'like' | 'dislike') => void;
    voteError: { reviewId: string; message: string } | null;
    onDeleteReview: (rid: string) => void;
    onDeleteReply: (rid: string, r: Reply) => void;
    createNotification: (toUserId: string, type: any, content: string, linkId: string) => Promise<void>;
    onRequireAuth: () => void;
}

export const AgencyProfile: React.FC<AgencyProfileProps> = ({ agency, currentUser, onVoteReview, voteError, onDeleteReview, onDeleteReply, createNotification, onRequireAuth }) => {
    const [reviews, setReviews] = useState<Resena[]>([]);
    const [isLoadingReviews, setIsLoadingReviews] = useState(false);
    const [reviewSubmitError, setReviewSubmitError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        setIsLoadingReviews(true);
        const unsubscribe = db.collection('resenas').where('inmobiliariaId', '==', agency.id).onSnapshot(async (snapshot) => {
            const reviewsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Resena));
            reviewsData.sort((a, b) => {
                const scoreA = Number(a.likedBy?.length ?? 0) - Number(a.dislikedBy?.length ?? 0);
                const scoreB = Number(b.likedBy?.length ?? 0) - Number(b.dislikedBy?.length ?? 0);
                const diffScore = scoreB - scoreA;
                if (diffScore !== 0) return diffScore;
                const timeB = typeof b.fecha?.toDate === 'function' ? Number(b.fecha.toDate().getTime()) : 0;
                const timeA = typeof a.fecha?.toDate === 'function' ? Number(a.fecha.toDate().getTime()) : 0;
                return timeB - timeA;
            });
            setReviews(reviewsData); 
            setIsLoadingReviews(false);
        }, (err) => {
            console.error("Error fetching reviews:", err);
            setIsLoadingReviews(false);
        });
        return () => unsubscribe();
    }, [agency.id]);

    const handleUserReviewSubmit = async (rd: Omit<Resena, 'id' | 'usuarioId' | 'usuarioNombre' | 'fecha' | 'inmobiliariaId'>) => { 
        if (!currentUser) return; 
        setReviewSubmitError(null); 
        try { 
            // Persist user visual identity at the time of posting
            await db.collection("resenas").add({ 
                ...rd, 
                inmobiliariaId: agency.id, 
                usuarioId: currentUser.id, 
                usuarioNombre: currentUser.nombre, 
                usuarioAvatar: currentUser.avatarUrl || '',
                usuarioColor: currentUser.profileColor || '',
                usuarioRol: currentUser.rol, 
                fecha: firebase.firestore.FieldValue.serverTimestamp(), 
                estado: 'pendiente' 
            }); 
        } catch (e) { 
            console.error(e); 
            setReviewSubmitError("Error al enviar."); 
        } 
    };

    const handleReplyToReview = async (rid: string, text: string) => { 
        if (!currentUser) return; 
        const newReply: Reply = { 
            id: Math.random().toString(36).substring(2, 11), 
            usuarioId: currentUser.id, 
            usuarioNombre: currentUser.nombre,
            usuarioAvatar: currentUser.avatarUrl || '',
            usuarioColor: currentUser.profileColor || '',
            comentario: text, 
            fecha: new Date(), 
        }; 
        await db.collection('resenas').doc(rid).update({ replies: firebase.firestore.FieldValue.arrayUnion(newReply) });
        // Find review owner and notify
        const rDoc = await db.collection('resenas').doc(rid).get();
        if (rDoc.exists) {
             const rData = rDoc.data() as Resena;
             createNotification(rData.usuarioId, 'reply_review', 'respondió a tu reseña', rid);
        }
    };

    const handleVoteWithAuth = (rid: string, v: 'like' | 'dislike') => {
        if (!currentUser) {
            onRequireAuth();
            return;
        }
        onVoteReview(rid, v);
    }

    const handleShare = async () => {
        const shareData = {
            title: `VeritasInmueble: Análisis de ${agency.nombre}`,
            text: `Mira el score de confianza y reseñas de ${agency.nombre} en VeritasInmueble.`,
            url: window.location.href
        };

        // Attempt native share first
        if (navigator.share) {
            try {
                await navigator.share(shareData);
                return;
            } catch (err: any) {
                if (err.name !== 'AbortError') {
                    console.warn('Share failed, attempting fallback', err);
                } else {
                    return;
                }
            }
        }

        // Fallback to Clipboard
        const copyToClipboard = async (text: string) => {
            try {
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(text);
                    return true;
                } else {
                    throw new Error('Clipboard API unavailable');
                }
            } catch (err) {
                // Legacy fallback
                try {
                    const textArea = document.createElement("textarea");
                    textArea.value = text;
                    textArea.style.position = "fixed";
                    textArea.style.left = "-9999px";
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    const successful = document.execCommand('copy');
                    document.body.removeChild(textArea);
                    return successful;
                } catch (e) {
                    console.error('Legacy copy failed', e);
                    return false;
                }
            }
        };

        const success = await copyToClipboard(window.location.href);
        if (success) {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } else {
            alert('No se pudo copiar el enlace automáticamente.');
        }
    };

    const scoreInfo = getScoreInfo(agency.score); 
    const findSource = (keywords: string[], sources: Inmobiliaria['fuentes'] = []) => sources.find(source => keywords.some(keyword => (source.title?.toLowerCase() || '').includes(keyword) || (source.uri?.toLowerCase() || '').includes(keyword)));
    const averageRating = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.calificacion, 0) / reviews.length) : 0;

    return (
        <main className="container mx-auto px-4 pt-24 pb-8">
            <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 p-6 sm:p-8 md:p-12 relative overflow-hidden mb-8 border border-slate-50">
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
                <div className="flex flex-col md:flex-row justify-between items-start gap-8 relative z-10">
                    <div>
                        <span className="bg-slate-100 text-slate-500 text-sm font-bold px-4 py-2 rounded-full mb-4 inline-block">{agency.estado || 'N/A'}</span>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4 leading-none">{agency.nombre}</h2>
                        <div className="flex gap-3 flex-wrap items-center">
                            <span className={`px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 ${agency.contrato ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-500'}`}><DocumentIcon className="w-4 h-4"/>{agency.contrato ? 'Contrato Verificado' : 'Sin Contrato'}</span>
                            <span className="px-4 py-1.5 rounded-full text-sm font-bold bg-slate-100 text-slate-600 flex items-center gap-2"><UserIcon className="w-4 h-4"/>{agency.antiguedad} años exp.</span>
                            
                            <button 
                                onClick={handleShare}
                                className={`px-6 py-3 rounded-full text-sm font-black flex items-center gap-2 transition-all duration-300 cursor-pointer shadow-lg transform active:scale-95 ${
                                    isCopied 
                                    ? 'bg-green-500 text-white scale-105 ring-4 ring-green-500/20' 
                                    : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-red-600/30'
                                }`}
                            >
                                {isCopied ? (
                                    <>
                                        <CheckCircleIcon className="w-5 h-5 animate-bounce"/>
                                        <span>¡Copiado!</span>
                                    </>
                                ) : (
                                    <>
                                        <ShareIcon className="w-5 h-5"/>
                                        <span>Compartir</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="bg-white rounded-[2rem] p-5 shadow-xl flex items-center gap-6 border border-slate-100">
                        <div className="w-24 h-24 md:w-32 md:h-32"><ScoreDonutChart score={agency.score} color={scoreInfo.color} size="sm" /></div>
                        <div><p className={`text-xl font-black ${scoreInfo.textColor} mb-1`}>{scoreInfo.veredicto}</p><p className="text-sm font-medium text-slate-500">Basado en 8 factores de riesgo.</p></div>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
                    <MetricCard title="Quejas PROFECO" value={agency.quejas} icon={<WarningIcon className="w-5 h-5 text-red-500"/>} source={findSource(['quejas', 'profeco'], agency.fuentes)} color={agency.quejas > 0 ? 'text-red-500' : 'text-slate-900'} />
                    <MetricCard title="Google Rating" value={`${agency.googleRating?.toFixed(1) || '-'}`} icon={<StarIcon className="w-5 h-5 text-yellow-500" filled={true}/>} source={findSource(['google', 'maps'], agency.fuentes)} />
                    <MetricCard title="Estatus SAT" value={agency.rfcStatus} icon={<DocumentIcon className="w-5 h-5 text-slate-400"/>} />
                    <MetricCard title="Controversias" value={agency.controversias === 'Ninguna' ? '0' : 'Detectadas'} icon={<MagnifyingGlassIcon className="w-5 h-5 text-slate-400"/>} source={findSource(['noticias', 'controversia'], agency.fuentes)} color={agency.controversias !== 'Ninguna' ? 'text-red-500' : 'text-slate-900'} />
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-900/30 relative overflow-hidden">
                        <div className="absolute bottom-0 right-0 w-40 h-40 bg-red-600 rounded-full filter blur-[80px] opacity-40"></div>
                        <h3 className="text-2xl font-black mb-6 relative z-10">Veredicto Social</h3>
                        <div className="flex items-end gap-2 mb-2 relative z-10"><span className="text-6xl font-black">{averageRating.toFixed(1)}</span><span className="text-xl font-medium text-slate-400 mb-1">/ 5</span></div>
                        <div className="flex gap-1 mb-6 relative z-10">{[1, 2, 3, 4, 5].map((star) => (<StarIcon key={star} className="w-6 h-6 text-yellow-400" filled={star <= Math.round(averageRating)} />))}</div>
                        <p className="text-slate-400 font-medium relative z-10">{reviews.length} opiniones verificadas de usuarios reales.</p>
                    </div>
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-50">
                        <h3 className="text-lg font-black text-slate-900 mb-4">¿Cómo interpretar el Score?</h3>
                        <div className="space-y-3 text-sm font-medium">
                            <div className="flex gap-3 items-center"><div className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0"></div><p><span className="font-bold text-slate-900">90-100:</span> Excelente. Riesgo mínimo.</p></div>
                            <div className="flex gap-3 items-center"><div className="w-3 h-3 rounded-full bg-teal-500 flex-shrink-0"></div><p><span className="font-bold text-slate-900">80-89:</span> Confiable. Muy recomendable.</p></div>
                            <div className="flex gap-3 items-center"><div className="w-3 h-3 rounded-full bg-yellow-500 flex-shrink-0"></div><p><span className="font-bold text-slate-900">50-79:</span> Precaución. Investigar más.</p></div>
                            <div className="flex gap-3 items-center"><div className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0"></div><p><span className="font-bold text-slate-900">0-49:</span> Alto Riesgo. Evitar.</p></div>
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-2 space-y-8">
                    {/* Pass agencyId to check limit */}
                    <ReviewForm onSubmit={handleUserReviewSubmit} currentUser={currentUser} error={reviewSubmitError} onClearError={() => setReviewSubmitError(null)} onRequireAuth={onRequireAuth} agencyId={agency.id} />
                    <ReviewList reviews={reviews} isLoading={isLoadingReviews} onVote={handleVoteWithAuth} onReply={handleReplyToReview} currentUser={currentUser} voteError={voteError} onDeleteReview={onDeleteReview} onDeleteReply={onDeleteReply} />
                </div>
            </div>
        </main>
    );
};
