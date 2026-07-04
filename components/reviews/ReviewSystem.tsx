
import React, { useState } from 'react';
import { Resena, Usuario, Reply } from '../../types';
import { StarIcon, WarningIcon, SpinnerIcon, CheckCircleIcon, UserIcon, TrashIcon, ShieldCheckIcon } from '../Icons';
import { StarRatingInput } from '../SharedComponents';
import { firebase, db, auth } from '../../services/firebase';
import { UserAvatar } from '../ui/UserAvatar';

const { Timestamp } = firebase.firestore;

export const ReviewForm: React.FC<{ onSubmit: (data: Omit<Resena, 'id' | 'usuarioId' | 'usuarioNombre' | 'fecha' | 'inmobiliariaId'>) => Promise<void>; currentUser: Usuario | null; error: string | null; onClearError: () => void; onRequireAuth: () => void; agencyId: string }> = ({ onSubmit, currentUser, error, onClearError, onRequireAuth, agencyId }) => {
    const [ratings, setRatings] = useState({ comunicacion: 0, contrato: 0, propiedad: 0, solucion: 0 });
    const [comment, setComment] = useState('');
    const [evidenceDeclared, setEvidenceDeclared] = useState(false);
    const [legalDisclaimer, setLegalDisclaimer] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    // GUEST VIEW CTA
    if (!currentUser) {
        return (
            <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-red-600 rounded-full filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                <h4 className="text-2xl font-black text-white mb-3 relative z-10">¿Tienes experiencia con ellos?</h4>
                <p className="text-slate-400 mb-6 font-medium relative z-10">Tu historia puede prevenir un fraude o confirmar un buen servicio. Únete a la comunidad para compartir tu verdad.</p>
                <button onClick={onRequireAuth} className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full text-white font-bold border border-white/10 relative z-10 hover:bg-red-600 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-red-600/30 group">
                    <UserIcon className="w-5 h-5 group-hover:scale-110 transition-transform"/> Inicia sesión para opinar
                </button>
            </div>
        );
    }

    if (showSuccess) {
        return (<div className="bg-green-50 border border-green-100 p-5 rounded-3xl flex items-center gap-4 animate-fade-in"><div className="bg-green-100 p-2 rounded-full flex-shrink-0"><CheckCircleIcon className="w-6 h-6 text-green-600" /></div><div><p className="font-black text-slate-900">¡Tu voz cuenta!</p><p className="text-slate-600">Tu reseña ha sido publicada y ayudará a miles.</p></div></div>);
    }
    const handleRatingChange = (category: keyof typeof ratings, value: number) => { setRatings(prev => ({ ...prev, [category]: value })); onClearError(); setLocalError(null); };
    
    const handleSubmit = async (e: React.FormEvent) => { 
        e.preventDefault(); 
        setLocalError(null);

        // Validation 0: Identity Verification
        if (auth.currentUser && !auth.currentUser.emailVerified) {
            setLocalError("Debes verificar tu correo electrónico antes de publicar. Revisa tu bandeja de entrada (y spam).");
            return;
        }

        // Validation 1: All fields filled
        if (Object.values(ratings).some(r => r === 0) || !comment.trim()) { 
            setLocalError("Por favor, completa todas las calificaciones y escribe un comentario."); 
            return; 
        } 
        
        // Validation 2: Legal Disclaimer Check
        if (!legalDisclaimer) {
            setLocalError("Debes aceptar la responsabilidad legal sobre la veracidad de tu opinión.");
            return;
        }

        setIsSubmitting(true); 

        try {
            // Validation 3: Rate Limiting (Max 3 reviews per agency per user)
            const existingReviewsSnapshot = await db.collection('resenas')
                .where('inmobiliariaId', '==', agencyId)
                .where('usuarioId', '==', currentUser.id)
                .get();
            
            if (existingReviewsSnapshot.size >= 3) {
                throw new Error("Has alcanzado el límite de 3 reseñas para esta inmobiliaria. Para actualizar tu opinión, edita o elimina una anterior (próximamente).");
            }

            const ratingValues: number[] = Object.values(ratings);
            const sum = ratingValues.reduce((a: number, b: number) => a + b, 0);
            const calificacion = Math.round(sum / 4); 

            const reviewData: Omit<Resena, 'id' | 'usuarioId' | 'usuarioNombre' | 'fecha' | 'inmobiliariaId'> = { 
                calificacion, 
                comentario: comment, 
                calificacionesDetalladas: ratings, 
                tieneEvidencia: evidenceDeclared, 
                verificada: false, 
            }; 
            
            await onSubmit(reviewData); 
            
            // Reset form
            setRatings({ comunicacion: 0, contrato: 0, propiedad: 0, solucion: 0 }); 
            setComment(''); 
            setEvidenceDeclared(false); 
            setLegalDisclaimer(false);
            setShowSuccess(true); 
            setTimeout(() => setShowSuccess(false), 5000); 

        } catch (err: any) {
            console.error(err);
            setLocalError(err.message || "Error al publicar la reseña.");
        } finally {
            setIsSubmitting(false); 
        }
    };

    return (
        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
            <h4 className="text-2xl md:text-3xl font-black text-slate-900 mb-1 tracking-tighter">¿Cuál fue tu experiencia?</h4>
            <p className="text-slate-500 mb-8 font-medium">Tu opinión salva a otros.</p>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="block text-[10px] md:text-[11px] font-black uppercase text-slate-400 tracking-widest">Comunicación</label>
                        <StarRatingInput rating={ratings.comunicacion} setRating={(r) => handleRatingChange('comunicacion', r)} />
                    </div>
                    <div className="flex items-center justify-between">
                        <label className="block text-[10px] md:text-[11px] font-black uppercase text-slate-400 tracking-widest">Contrato</label>
                        <StarRatingInput rating={ratings.contrato} setRating={(r) => handleRatingChange('contrato', r)} />
                    </div>
                    <div className="flex items-center justify-between">
                        <label className="block text-[10px] md:text-[11px] font-black uppercase text-slate-400 tracking-widest">Propiedad</label>
                        <StarRatingInput rating={ratings.propiedad} setRating={(r) => handleRatingChange('propiedad', r)} />
                    </div>
                    <div className="flex items-center justify-between">
                        <label className="block text-[10px] md:text-[11px] font-black uppercase text-slate-400 tracking-widest">Resolución</label>
                        <StarRatingInput rating={ratings.solucion} setRating={(r) => handleRatingChange('solucion', r)} />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2 ml-1">Tu historia</label>
                    <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-red-500 focus:bg-white transition-all" rows={4} placeholder="Cuéntanos los detalles..." required />
                </div>
                
                {/* Evidence Declaration Checkbox */}
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={evidenceDeclared} 
                            onChange={(e) => setEvidenceDeclared(e.target.checked)} 
                            className="w-5 h-5 mt-0.5 rounded border-slate-300 text-red-600 focus:ring-red-500"
                        />
                        <div className="flex-1">
                            <span className="block text-sm font-bold text-slate-900">Tengo Evidencia (Opcional)</span>
                            <p className="text-xs text-slate-500 mt-1">
                                Cuento con documentos/chats que respaldan mi opinión y puedo presentarlos si VeritasInmueble lo requiere para verificación.
                            </p>
                        </div>
                    </label>
                </div>

                {/* CRITICAL: Legal Liability Disclaimer */}
                <div className="bg-red-50 border border-red-100 p-4 rounded-2xl">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={legalDisclaimer} 
                            onChange={(e) => setLegalDisclaimer(e.target.checked)} 
                            className="w-5 h-5 mt-0.5 rounded border-red-300 text-red-600 focus:ring-red-500"
                            required
                        />
                        <div className="flex-1">
                            <span className="flex items-center gap-1 text-sm font-bold text-red-800"><ShieldCheckIcon className="w-4 h-4"/> Declaración de Responsabilidad (Obligatorio)</span>
                            <p className="text-xs text-red-700 mt-1 font-medium">
                                Declaro bajo protesta de decir verdad que esta reseña está basada en mi experiencia real. Entiendo que la difamación es un delito y asumo total responsabilidad legal por el contenido de mi publicación, deslindando a VeritasInmueble de cualquier disputa.
                            </p>
                        </div>
                    </label>
                </div>

                {(error || localError) && (<div className="flex items-center text-sm font-medium text-red-600 bg-red-50 px-4 py-3 rounded-2xl"><WarningIcon className="w-5 h-5 mr-3 flex-shrink-0" /><span>{localError || error}</span></div>)}
                <div className="pt-2">
                    <button type="submit" disabled={isSubmitting} className="w-full bg-slate-900 text-white px-6 py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">
                        {isSubmitting && <SpinnerIcon className="w-5 h-5" />}
                        {isSubmitting ? 'Verificando y Publicando...' : 'Publicar Reseña'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export const ReviewList: React.FC<{ reviews: Resena[], isLoading: boolean, onVote: (reviewId: string, voteType: 'like' | 'dislike') => void, onReply: (reviewId: string, replyText: string) => Promise<void>, currentUser: Usuario | null, voteError: { reviewId: string; message: string } | null, onDeleteReview: (reviewId: string) => void, onDeleteReply: (reviewId: string, reply: Reply) => void }> = ({ reviews, isLoading, onVote, onReply, currentUser, voteError, onDeleteReview, onDeleteReply }) => {
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);
    if (isLoading) return <div className="text-center py-12"><SpinnerIcon className="w-8 h-8 text-red-600 mx-auto animate-spin" /></div>;
    if (reviews.length === 0) return <div className="text-center py-12 bg-white rounded-[2.5rem] border border-slate-100 shadow-lg shadow-slate-100/50"><p className="text-slate-500 font-medium mb-4">Aún no hay opiniones. Sé el primero en romper el silencio.</p></div>;
    const formatDate = (timestamp: any) => timestamp instanceof Timestamp ? timestamp.toDate().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Fecha inválida';
    const handleSubmitReply = async (reviewId: string) => { if (!replyText.trim()) return; setIsSubmittingReply(true); await onReply(reviewId, replyText); setIsSubmittingReply(false); setReplyingTo(null); setReplyText(''); };
    const canDelete = (itemUid: string) => currentUser && (currentUser.id === itemUid || currentUser.rol === 'admin');
    const RatingDetail: React.FC<{label: string, rating?: number}> = ({label, rating = 0}) => (<div className="flex justify-between items-center text-xs font-medium text-slate-600"><span className="bg-slate-100 px-2 py-1 rounded-full">{label}</span><div className="flex gap-0.5">{[...Array(5)].map((_, i) => <StarIcon key={i} className="w-3 h-3" filled={i < rating} />)}</div></div>);

    return (
        <div className="space-y-6">
            <h4 className="text-2xl font-black text-slate-900 mb-6">Opiniones de la Comunidad</h4>
            {reviews.map(review => {
                const likes = review.likedBy?.length || 0;
                const dislikes = review.dislikedBy?.length || 0;
                const hasLiked = currentUser ? review.likedBy?.includes(currentUser.id) : false;
                const hasDisliked = currentUser ? review.dislikedBy?.includes(currentUser.id) : false;
                const canDeleteReview = canDelete(review.usuarioId);
                return (
                    <div key={review.id} className="bg-white p-2.5 md:p-3 rounded-lg md:rounded-xl shadow-md shadow-slate-200/40 border-2 border-red-200 transition relative overflow-hidden hover:shadow-lg hover:border-red-400">
                        <div className="absolute top-0 left-0 right-0 bg-red-100 px-2.5 md:px-3 py-0.5 flex justify-between items-center border-b-2 border-red-200">
                            <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-red-600 text-[9px] md:text-[10px]" data-weight="fill">verified_user</span>
                                <span className="text-[7px] md:text-[8px] font-black tracking-widest text-red-600 uppercase">Reseña VeritasInmueble</span>
                            </div>
                        </div>

                        <div className="flex items-start space-x-2 pt-7 md:pt-8">
                            <div className="flex-shrink-0">
                                <UserAvatar 
                                    name={review.usuarioNombre} 
                                    avatarUrl={review.usuarioAvatar} 
                                    color={review.usuarioColor} 
                                    userId={review.usuarioId}
                                    className="w-7 h-7 md:w-8 md:h-8 text-[10px] md:text-xs shadow-sm"
                                />
                            </div>
                            
                            <div className="flex-grow">
                                <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                                    <div className="flex items-center gap-1 md:gap-1.5">
                                        <p className="font-bold text-slate-900 text-[10px] md:text-xs">{review.usuarioNombre}</p>
                                        {review.verificada && <span className="flex items-center text-[7px] md:text-[8px] font-bold text-white bg-red-600 px-1 py-0.5 rounded-full uppercase">
                                            <span className="material-symbols-outlined text-[8px] md:text-[9px] mr-0.5">check_circle</span> Verificada
                                        </span>}
                                        {review.tieneEvidencia && !review.verificada && <span className="flex items-center text-[7px] md:text-[8px] font-bold text-slate-500 bg-slate-100 px-1 py-0.5 rounded-full border border-slate-200 uppercase">
                                            Evidencia declarada
                                        </span>}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-wide">{formatDate(review.fecha)}</p>
                                        {canDeleteReview && <button onClick={() => onDeleteReview(review.id)} className="text-slate-400 hover:text-red-500 transition ml-1"><TrashIcon className="w-3 h-3 md:w-4 md:h-4" /></button>}
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-1 bg-slate-50 p-1.5 md:p-2 rounded-lg mb-1.5 md:mb-2 border border-slate-100">
                                    <div className="flex justify-between items-center text-[8px] md:text-[9px] font-bold text-slate-500 uppercase tracking-wide">
                                        <span>Comunicación</span><span className="text-yellow-400 flex flex-wrap">{[...Array(5)].map((_, index) => (<StarIcon key={index} className="w-2.5 h-2.5 md:w-3 md:h-3" filled={index < (review.calificacionesDetalladas?.comunicacion || 0)} />))}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[8px] md:text-[9px] font-bold text-slate-500 uppercase tracking-wide">
                                        <span>Contrato</span><span className="text-yellow-400 flex flex-wrap">{[...Array(5)].map((_, index) => (<StarIcon key={index} className="w-2.5 h-2.5 md:w-3 md:h-3" filled={index < (review.calificacionesDetalladas?.contrato || 0)} />))}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[8px] md:text-[9px] font-bold text-slate-500 uppercase tracking-wide">
                                        <span>Propiedad</span><span className="text-yellow-400 flex flex-wrap">{[...Array(5)].map((_, index) => (<StarIcon key={index} className="w-2.5 h-2.5 md:w-3 md:h-3" filled={index < (review.calificacionesDetalladas?.propiedad || 0)} />))}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[8px] md:text-[9px] font-bold text-slate-500 uppercase tracking-wide">
                                        <span>Resolución</span><span className="text-yellow-400 flex flex-wrap">{[...Array(5)].map((_, index) => (<StarIcon key={index} className="w-2.5 h-2.5 md:w-3 md:h-3" filled={index < (review.calificacionesDetalladas?.solucion || 0)} />))}</span>
                                    </div>
                                </div>
                                
                                <p className="text-[10px] md:text-xs text-slate-800 leading-relaxed mb-2 whitespace-pre-wrap font-medium">{review.comentario}</p>
                                
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <button onClick={() => onVote(review.id, 'like')} className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full font-bold text-[9px] md:text-[10px] ${hasLiked ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>👍 {likes}</button>
                                    <button onClick={() => onVote(review.id, 'dislike')} className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full font-bold text-[9px] md:text-[10px] ${hasDisliked ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>👎 {dislikes}</button>
                                    {currentUser && (
                                        <button onClick={() => setReplyingTo(replyingTo === review.id ? null : review.id)} className="text-[9px] md:text-[10px] font-bold text-slate-500 hover:text-red-600 px-1 ml-auto">Responder</button>
                                    )}
                                </div>

                                {replyingTo === review.id && (
                                    <div className="mt-4 flex gap-2">
                                        <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder={`Respondiendo...`} className="flex-1 px-4 py-2 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-red-600 transition text-[10px] md:text-xs" rows={1}/>
                                        <button onClick={() => handleSubmitReply(review.id)} disabled={isSubmittingReply} className="px-4 py-2 rounded-2xl text-[10px] md:text-xs font-bold bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50">{isSubmittingReply ? <SpinnerIcon className="w-4 h-4"/> : 'Enviar'}</button>
                                    </div>
                                )}

                                {review.replies && review.replies.length > 0 && (
                                    <div className="mt-2 pl-2 border-l-2 border-slate-200 space-y-1.5">
                                        {review.replies.map(reply => (
                                            <div key={reply.id} className="bg-slate-50 rounded-lg px-2.5 py-1.5 border border-slate-100 relative group">
                                                <div className="flex items-start gap-1.5">
                                                    <UserAvatar 
                                                        name={reply.usuarioNombre} 
                                                        avatarUrl={reply.usuarioAvatar} 
                                                        color={reply.usuarioColor} 
                                                        userId={reply.usuarioId}
                                                        className="w-4 h-4 md:w-5 md:h-5 text-[8px] md:text-[9px]"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-baseline mb-0.5">
                                                            <span className="font-bold text-slate-900 text-[9px] md:text-[10px]">{reply.usuarioNombre}</span>
                                                            <span className="text-[8px] md:text-[9px] text-slate-400 font-medium">{formatDate(reply.fecha)}</span>
                                                        </div>
                                                        <p className="text-slate-600 text-[9px] md:text-[10px] font-medium">{reply.comentario}</p>
                                                    </div>
                                                </div>
                                                {canDelete(reply.usuarioId) && <button onClick={() => onDeleteReply(review.id, reply)} className="absolute top-1.5 right-1.5 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"><TrashIcon className="w-3 h-3" /></button>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
