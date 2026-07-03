
import React, { useEffect, useState } from 'react';
import { Inmobiliaria, Resena, Usuario, Reply } from '../types';
import { db, firebase } from '../services/firebase';
import { getScoreInfo, calculateSocialVerdict } from '../constants';
import { ScoreDonutChart, MetricCard } from '../components/SharedComponents';
import { ReviewForm, ReviewList } from '../components/reviews/ReviewSystem';
import { WarningIcon, DocumentIcon, StarIcon, MagnifyingGlassIcon, UserIcon, ShareIcon, CheckCircleIcon } from '../components/Icons';

const getSocialTheme = (network: string) => {
    if (!network) return { text: 'text-slate-600', bg: 'bg-slate-500/10', border: 'border-2 border-slate-500/30 hover:border-slate-500/50', shadow: 'shadow-slate-500/5', borderL: 'border-slate-500/30', badgeBg: 'bg-slate-100', badgeBorder: 'border-slate-300' };
    const net = network.toLowerCase();
    if (net.includes('facebook')) return { text: 'text-blue-600', bg: 'bg-blue-500/10', border: 'border-2 border-blue-500/50 hover:border-blue-500', shadow: 'shadow-blue-500/5', borderL: 'border-blue-500/30', badgeBg: 'bg-blue-100', badgeBorder: 'border-blue-300' };
    if (net.includes('google')) return { text: 'text-red-600', bg: 'bg-red-500/10', border: 'border-2 border-red-500/50 hover:border-red-500', shadow: 'shadow-red-500/5', borderL: 'border-red-500/30', badgeBg: 'bg-red-100', badgeBorder: 'border-red-300' };
    if (net.includes('tiktok') || net.includes('x') || net.includes('twitter')) return { text: 'text-slate-900', bg: 'bg-slate-900/5', border: 'border-2 border-slate-900/30 hover:border-slate-900/50', shadow: 'shadow-slate-900/5', borderL: 'border-slate-900/30', badgeBg: 'bg-slate-200', badgeBorder: 'border-slate-400' };
    if (net.includes('instagram')) return { text: 'text-fuchsia-600', bg: 'bg-fuchsia-500/10', border: 'border-2 border-fuchsia-500/50 hover:border-fuchsia-500', shadow: 'shadow-fuchsia-500/5', borderL: 'border-fuchsia-500/30', badgeBg: 'bg-fuchsia-100', badgeBorder: 'border-fuchsia-300' };
    return { text: 'text-slate-600', bg: 'bg-slate-500/10', border: 'border-2 border-slate-500/30 hover:border-slate-500/50', shadow: 'shadow-slate-500/5', borderL: 'border-slate-500/30', badgeBg: 'bg-slate-100', badgeBorder: 'border-slate-300' };
};

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
    const socialVerdictScore = calculateSocialVerdict(agency, reviews);

    const getSatColor = (status: string | undefined) => {
        if (!status) return 'slate-500';
        switch (status.toLowerCase()) {
            case 'activo': return 'emerald-600';
            case 'inactivo': return 'slate-500';
            case 'irregular': return 'red-600';
            default: return 'slate-500';
        }
    };

    const getSatText = (status: string | undefined) => {
        if (!status) return 'Estado fiscal sin verificar';
        switch (status.toLowerCase()) {
            case 'activo': return 'Cumple con obligaciones fiscales';
            case 'inactivo': return 'No registra actividad reciente';
            case 'irregular': return 'Posibles anomalías fiscales';
            default: return 'Estado fiscal sin verificar';
        }
    };

    return (
        <main className="flex-1 w-full max-w-[1024px] mx-auto pt-24 md:pt-32 px-4 md:px-6 py-4 md:py-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-red-50 to-transparent rounded-bl-full pointer-events-none -z-10"></div>
            <div className="absolute font-black text-4xl md:text-[64px] text-slate-900/5 top-8 md:-top-2 right-4 md:right-8 pointer-events-none select-none -z-10 tracking-tighter">FORENSE</div>

            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-3 relative z-10 auto-rows-[minmax(90px,auto)]">
                
                {/* 1. THE CORE: Header & Score */}
                <section className="col-span-1 md:col-span-12 row-span-1 bento-card rounded-[16px] md:rounded-[20px] p-4 md:p-5 flex flex-col md:flex-row justify-between md:items-center relative overflow-hidden gap-4">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-red-50 rounded-full blur-3xl -z-10"></div>
                    
                    <div className="flex flex-col justify-center relative z-10">
                        <div className="inline-flex items-center gap-1 bg-slate-900 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-widest text-[8px] md:text-[9px] w-fit mb-2">
                            <span className="w-1 h-1 rounded-full bg-red-600 animate-pulse"></span>
                            INVESTIGACIÓN ACTIVA
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 -ml-1 tracking-tighter leading-none mb-1.5 flex items-center gap-2">
                            {agency.nombre}
                            <button onClick={handleShare} className="ml-2 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-colors">
                                {isCopied ? <CheckCircleIcon className="w-4 h-4 text-green-500" /> : <ShareIcon className="w-4 h-4" />}
                            </button>
                        </h1>
                        <p className="font-medium text-[10px] md:text-xs text-slate-500 max-w-xl">
                            Análisis forense exhaustivo del historial operativo, disputas legales y huella digital. Generado en tiempo real.
                        </p>
                    </div>

                    <div className="flex items-center mx-auto md:mx-0 gap-4 shrink-0 bg-white/40 p-2 md:p-3 rounded-2xl border border-white/50 backdrop-blur-md relative z-10 shadow-sm">
                        <div className="flex flex-col items-end justify-center">
                            <h3 className="font-bold text-sm md:text-base text-slate-900 mb-1">Índice de Confianza</h3>
                            <div className={`bg-${scoreInfo.color === '#ef4444' ? 'red-100' : 'emerald-100'} px-2 py-0.5 rounded-full border border-red-200`}>
                                <span className={`font-bold ${scoreInfo.textColor} tracking-widest text-[8px] md:text-[9px] block uppercase`}>{scoreInfo.veredicto}</span>
                            </div>
                        </div>
                        <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
                            <svg className="absolute inset-0 w-full h-full transform -rotate-90 drop-shadow-[0_4px_8px_rgba(227,43,32,0.15)]" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" fill="none" r="45" stroke="#e0e3e5" strokeWidth="8"></circle>
                                <circle className="transition-all duration-1000 ease-out" cx="50" cy="50" fill="none" r="45" stroke={scoreInfo.color} strokeDasharray="283" strokeDashoffset={283 - (283 * agency.score / 100)} strokeWidth="8"></circle>
                            </svg>
                            <span className={`text-3xl md:text-4xl font-black ${scoreInfo.textColor} relative z-10 -mt-0.5`}>{agency.score}</span>
                        </div>
                    </div>
                </section>

                {/* PROFECO */}
                <section className="col-span-1 md:col-span-4 row-span-2 bento-card-alert rounded-[16px] md:rounded-[20px] p-4 flex flex-col justify-between relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-1 h-full ${agency.dictamenProfeco?.totalQuejas ? 'bg-red-600' : 'bg-emerald-500'}`}></div>
                    <div className="flex items-center justify-between mb-3">
                        <div className={`w-8 h-8 rounded-lg ${agency.dictamenProfeco?.totalQuejas ? 'bg-red-100' : 'bg-emerald-50'} flex items-center justify-center shrink-0`}>
                            <span className={`material-symbols-outlined ${agency.dictamenProfeco?.totalQuejas ? 'text-red-600' : 'text-emerald-600'} text-xl`} data-weight="fill">gavel</span>
                        </div>
                        {agency.dictamenProfeco?.totalQuejas ? (
                            <span className="font-bold uppercase tracking-widest text-red-600 bg-red-100 px-2 py-0.5 rounded-full text-[8px] md:text-[9px]">ALERTA ALTA</span>
                        ) : (
                            <span className="font-bold uppercase tracking-widest text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-[8px] md:text-[9px]">LIMPIO</span>
                        )}
                    </div>
                    <div>
                        <h4 className="font-bold text-lg md:text-xl text-slate-900 mb-0.5 tracking-tight">PROFECO {agency.dictamenProfeco?.totalQuejas ? <span className="w-1.5 h-1.5 inline-block rounded-full bg-red-600 animate-pulse ml-0.5"></span> : null}</h4>
                        <div className={`text-3xl md:text-4xl font-black ${agency.dictamenProfeco?.totalQuejas ? 'text-red-600' : 'text-emerald-600'} mb-1.5 leading-none`}>{agency.dictamenProfeco?.totalQuejas || 0}</div>
                        <p className="font-medium text-[10px] md:text-xs text-slate-500 leading-snug">
                            {agency.dictamenProfeco?.totalQuejas ? 'Quejas activas reportadas.' : 'Sin registro de quejas formales en el último periodo.'}
                        </p>
                        <div className={`mt-2 text-[8px] md:text-[9px] ${agency.dictamenProfeco?.totalQuejas ? 'text-red-600/70 border-red-100' : 'text-emerald-700/70 border-emerald-500/10'} font-bold flex items-center gap-1 border-t pt-2`}>
                            <span className="material-symbols-outlined text-[10px]">database</span> Fuente: Buró Comercial PROFECO
                        </div>
                    </div>
                </section>

                {/* SAT */}
                <section className="col-span-1 md:col-span-4 row-span-2 bento-card-alert rounded-[16px] md:rounded-[20px] p-4 flex flex-col justify-between relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-1 h-full bg-${getSatColor(agency.rfcStatus)}`}></div>
                    <div className="flex items-center justify-between mb-3">
                        <div className={`w-8 h-8 rounded-lg bg-${getSatColor(agency.rfcStatus)}/10 flex items-center justify-center shrink-0`}>
                            <span className={`material-symbols-outlined text-${getSatColor(agency.rfcStatus)} text-xl`} data-weight="fill">account_balance</span>
                        </div>
                        <span className={`font-bold uppercase tracking-widest text-${getSatColor(agency.rfcStatus)} bg-${getSatColor(agency.rfcStatus)}/10 px-2 py-0.5 rounded-full text-[8px] md:text-[9px] uppercase`}>
                            {agency.rfcStatus || 'Desconocido'}
                        </span>
                    </div>
                    <div>
                        <h4 className="font-bold text-lg md:text-xl text-slate-900 mb-1.5 tracking-tight">Estatus SAT</h4>
                        <div className={`p-2 bg-${getSatColor(agency.rfcStatus)}/10 rounded-lg border border-${getSatColor(agency.rfcStatus)}/20 mb-1.5`}>
                            <span className={`font-bold text-${getSatColor(agency.rfcStatus)} text-xs block mb-0.5 uppercase`}>{agency.rfcStatus || 'Desconocido'}</span>
                            <span className="text-[9px] text-slate-500 leading-tight block">{getSatText(agency.rfcStatus)}</span>
                        </div>
                        <p className="font-medium text-[10px] md:text-xs text-slate-500 leading-snug">Evaluación fiscal y administrativa.</p>
                        <div className={`mt-2 text-[8px] md:text-[9px] text-${getSatColor(agency.rfcStatus)}/70 font-bold flex items-center gap-1 border-t border-${getSatColor(agency.rfcStatus)}/10 pt-2`}>
                            <span className="material-symbols-outlined text-[10px]">database</span> Fuente: Listado 69-B SAT
                        </div>
                    </div>
                </section>

                {/* CONTRATO */}
                <section className="col-span-1 md:col-span-4 row-span-2 bento-card rounded-[16px] md:rounded-[20px] p-4 flex flex-col justify-between relative overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-slate-500 text-xl" data-weight="fill">contract</span>
                        </div>
                        {agency.contrato ? (
                            <span className="font-bold uppercase tracking-widest text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-[8px] md:text-[9px]">VERIFICADO</span>
                        ) : (
                            <span className="font-bold uppercase tracking-widest text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full text-[8px] md:text-[9px]">ADVERTENCIA</span>
                        )}
                    </div>
                    <div>
                        <h4 className="font-bold text-lg md:text-xl text-slate-900 mb-1.5 tracking-tight">Contrato</h4>
                        <div className="flex items-center gap-1 mb-1.5">
                            {agency.contrato ? (
                                <span className="material-symbols-outlined text-emerald-600 text-lg">check_circle</span>
                            ) : (
                                <span className="material-symbols-outlined text-red-600 text-lg">cancel</span>
                            )}
                            <span className="font-bold text-sm md:text-base text-slate-900">{agency.contrato ? 'Adhesión Registrada' : 'No Registrado'}</span>
                        </div>
                        <p className="font-medium text-[10px] md:text-xs text-slate-500 leading-snug">
                            {agency.contrato ? 'El contrato cumple con la normativa vigente.' : 'Contrato de adhesión NO registrado. Riesgo de cláusulas abusivas.'}
                        </p>
                        <div className="mt-2 text-[8px] md:text-[9px] text-slate-500/70 font-bold flex items-center gap-1 border-t border-slate-200 pt-2">
                            <span className="material-symbols-outlined text-[10px]">database</span> Fuente: Registro Público (RPC)
                        </div>
                    </div>
                </section>

                {/* RESOLUCION DISPUTAS */}
                <section className="col-span-1 md:col-span-6 row-span-2 bento-card-dark rounded-[16px] md:rounded-[20px] p-3 md:py-3 md:px-4 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 opacity-10 pointer-events-none">
                        <span className="material-symbols-outlined text-[100px]">monitoring</span>
                    </div>
                    <div className="relative z-10 flex flex-col h-full justify-between gap-1">
                        <div>
                            <div className="flex items-center gap-1.5 mb-1">
                                <span className="material-symbols-outlined text-red-400 text-base">balance</span>
                                <h2 className="font-bold uppercase tracking-widest text-[8px] md:text-[9px] text-slate-400">RESOLUCIÓN DISPUTAS</h2>
                            </div>
                            <div className="font-black text-4xl md:text-5xl leading-none mb-1 text-red-400 drop-shadow-md">{agency.dictamenProfeco?.tasaResolucion || 'N/A'}</div>
                            <p className="font-medium text-[9px] md:text-[10px] text-slate-400 max-w-[200px] leading-tight">Tasa de resolución de quejas formales (estimado).</p>
                        </div>
                        <div className="mt-2 pt-2 border-t border-white/10 flex w-full">
                            <div className="flex flex-col w-full">
                                <span className="text-[8px] md:text-[9px] text-slate-400 mb-1">Top 4 Problemas</span>
                                {agency.dictamenProfeco?.motivosPrincipales && agency.dictamenProfeco.motivosPrincipales.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 w-full pr-2">
                                        {agency.dictamenProfeco.motivosPrincipales.slice(0, 4).map((motivo, idx) => (
                                            <div key={idx} className="flex items-start gap-1">
                                                <span className="text-primary text-[10px] md:text-[11px] leading-none mt-[2px]">•</span>
                                                <span className="font-medium text-white/90 text-[9px] md:text-[10px] leading-tight flex-1">{motivo}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="font-medium text-white text-[9px] md:text-[10px]">Desconocido</span>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* INTELIGENCIA WEB */}
                <section className="col-span-1 md:col-span-6 row-span-2 bento-card rounded-[16px] md:rounded-[20px] p-3 md:py-3 md:px-4 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="font-bold text-base md:text-lg text-slate-900">Inteligencia Web</h2>
                        <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-slate-500 text-sm md:text-base">radar</span>
                        </div>
                    </div>
                    <div className="space-y-1.5 flex-1 flex flex-col justify-center">
                        <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors shadow-sm gap-2">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-red-100 flex items-center justify-center shrink-0"><span className="material-symbols-outlined text-red-600 text-xs">public</span></div>
                                <div>
                                    <span className="font-bold text-[10px] md:text-xs text-slate-900 block">Edad de Dominio</span>
                                    <span className="text-[8px] md:text-[9px] text-slate-500">{agency.fichaTecnica?.alertaAntiguedad || 'Sin datos'}</span>
                                </div>
                            </div>
                            <span className="font-bold uppercase tracking-widest text-[7px] md:text-[8px] text-red-600 bg-red-100 px-1.5 py-1 rounded-full shadow-sm w-fit uppercase">{agency.fichaTecnica?.antiguedadDominio || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors shadow-sm gap-2">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-emerald-50 flex items-center justify-center shrink-0"><span className="material-symbols-outlined text-emerald-600 text-xs">lock</span></div>
                                <div>
                                    <span className="font-bold text-[10px] md:text-xs text-slate-900 block">Certificado SSL</span>
                                    <span className="text-[8px] md:text-[9px] text-slate-500">Estándar Seguro</span>
                                </div>
                            </div>
                            <span className="font-bold uppercase tracking-widest text-[7px] md:text-[8px] text-emerald-700 bg-emerald-100 px-1.5 py-1 rounded-full shadow-sm w-fit uppercase">VÁLIDO</span>
                        </div>
                        <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors shadow-sm gap-2 mt-1">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-slate-200 flex items-center justify-center shrink-0"><span className="material-symbols-outlined text-slate-600 text-xs">groups</span></div>
                                <div>
                                    <span className="font-bold text-[10px] md:text-xs text-slate-900 block">Equipo Directivo</span>
                                    <span className="text-[8px] md:text-[9px] text-slate-500">Transparencia corporativa</span>
                                </div>
                            </div>
                            <span className={`font-bold uppercase tracking-widest text-[7px] md:text-[8px] ${agency.fichaTecnica?.equipoDirectivoOculto ? 'text-red-600 bg-red-100' : 'text-emerald-700 bg-emerald-100'} px-1.5 py-1 rounded-full shadow-sm w-fit`}>
                                {agency.fichaTecnica?.equipoDirectivoOculto ? 'OCULTO' : 'PÚBLICO'}
                            </span>
                        </div>
                    </div>
                </section>

                {/* RADAR WEB */}
                <section className="col-span-1 md:col-span-12 bento-card rounded-[16px] md:rounded-[20px] p-4 flex flex-col gap-3 relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-red-600 text-base md:text-lg">radar</span>
                        </div>
                        <h2 className="font-bold text-base md:text-lg text-slate-900">Radar Web: Noticias & Controversias</h2>
                    </div>
                    
                    {agency.mencionesWeb && agency.mencionesWeb.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {agency.mencionesWeb.slice(0, 3).map(noticia => (
                                <div key={noticia.id} className="p-2.5 md:p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between shadow-sm">
                                    <div>
                                        <div className="flex justify-between items-start mb-1.5">
                                            <span className={`font-bold uppercase tracking-widest text-[7px] md:text-[8px] ${noticia.tono === 'Negativo' ? 'text-red-600 bg-red-100' : noticia.tono === 'Positivo' ? 'text-emerald-700 bg-emerald-100' : 'text-slate-500 bg-slate-100'} px-1.5 py-0.5 rounded-full uppercase`}>{noticia.tono}</span>
                                        </div>
                                        <h4 className="font-bold text-xs md:text-sm text-slate-900 mb-0.5">{noticia.titular}</h4>
                                        <p className="text-[9px] md:text-[10px] text-slate-500 leading-relaxed">{noticia.resumen}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center py-6 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-center">
                            <div>
                                <span className="material-symbols-outlined text-slate-300 text-3xl mb-1">search_off</span>
                                <p className="text-sm font-bold text-slate-500">No hay rastro</p>
                                <p className="text-xs text-slate-400">Sin controversias reportadas recientemente</p>
                            </div>
                        </div>
                    )}
                </section>
                
            </div>

            {/* REVIEWS & UNIFIED FEED */}
            <section className="col-span-1 md:col-span-12 mt-4 md:mt-6 mb-6">
                <h2 className="text-lg md:text-xl font-black text-slate-900 flex items-center gap-1.5 mb-3 md:mb-4">
                    <span className="material-symbols-outlined text-slate-500 text-xl md:text-2xl">forum</span>
                    Testimonios y Evidencias
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                    {/* COLUMNA IZQUIERDA: Score y Formulario */}
                    <div className="md:col-span-1 space-y-3">
                        <div className="bg-slate-900 rounded-xl md:rounded-2xl p-4 text-white shadow-xl shadow-slate-900/30 relative overflow-hidden">
                            <div className="absolute bottom-0 right-0 w-32 h-32 bg-red-600 rounded-full filter blur-[60px] opacity-30"></div>
                            <h3 className="text-sm md:text-base font-black mb-3 relative z-10 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-yellow-400 text-lg" data-weight="fill">kid_star</span> Veredicto Social
                            </h3>
                            <div className="flex items-end gap-1 mb-1 relative z-10">
                                <span className="text-4xl md:text-5xl font-black">{socialVerdictScore.toFixed(1)}</span>
                                <span className="text-[10px] md:text-xs font-medium text-slate-400 mb-1">/ 5</span>
                            </div>
                            <div className="flex gap-0.5 mb-2 relative z-10 text-lg md:text-xl">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <span key={star} className={star <= Math.round(socialVerdictScore) ? "text-yellow-400" : "text-slate-700"}>★</span>
                                ))}
                            </div>
                            <p className="text-[9px] md:text-[10px] text-slate-400 font-medium relative z-10 leading-tight">Testimonios y reportes analizados en redes y plataformas.</p>
                        </div>

                        <div className="sticky top-16">
                            <ReviewForm onSubmit={handleUserReviewSubmit} currentUser={currentUser} error={reviewSubmitError} onClearError={() => setReviewSubmitError(null)} onRequireAuth={onRequireAuth} agencyId={agency.id} />
                        </div>
                    </div>

                    {/* COLUMNA DERECHA: Unified Feed */}
                    <div className="md:col-span-2 space-y-3 md:space-y-4">
                        
                        {/* NATIVE */}
                        <ReviewList reviews={reviews} isLoading={isLoadingReviews} onVote={handleVoteWithAuth} onReply={handleReplyToReview} currentUser={currentUser} voteError={voteError} onDeleteReview={onDeleteReview} onDeleteReply={onDeleteReply} />
                        
                        {/* SOCIAL */}
                        {agency.evidenciasSociales && agency.evidenciasSociales.length > 0 && (
                            <div className="space-y-3 mb-6">
                                {agency.evidenciasSociales.map((fb, index) => {
                                    const theme = getSocialTheme(fb.redSocial);
                                    return (
                                    <div key={`social-${index}`} className={`bg-white p-3 md:p-4 rounded-xl md:rounded-2xl shadow-md ${theme.shadow} border ${theme.border} relative overflow-hidden transition hover:shadow-lg`}>
                                        <div className={`absolute top-0 left-0 right-0 ${theme.bg} px-3 md:px-4 py-1 border-b ${theme.border} flex justify-between items-center`}>
                                            <div className="flex items-center gap-1">
                                                <span className={`material-symbols-outlined ${theme.text} text-[9px] md:text-[10px]`} data-weight="fill">public</span>
                                                <span className={`text-[7px] md:text-[8px] font-black tracking-widest ${theme.text} uppercase`}>Post de {fb.redSocial}</span>
                                            </div>
                                            {/* Etiqueta IA eliminada según petición */}
                                        </div>

                                        <div className="flex items-start space-x-2.5 pt-5 md:pt-6">
                                            <div className="flex-shrink-0">
                                                <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full ${theme.badgeBg} border border-dashed ${theme.badgeBorder} flex items-center justify-center ${theme.text} opacity-70`}>
                                                    <span className="material-symbols-outlined text-xs md:text-sm">person_off</span>
                                                </div>
                                            </div>
                                            <div className="flex-grow">
                                                <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                                                    <p className="font-bold text-[10px] md:text-xs text-slate-900 line-through decoration-slate-400">Usuario Anonimizado</p>
                                                </div>
                                                <p className="text-[10px] md:text-xs text-slate-800 leading-relaxed mb-2 whitespace-pre-wrap font-medium italic">"{fb.resenaGenerada?.comentario || fb.resenaGenerada?.textoExtracto || "Contenido no disponible"}"</p>
                                                
                                                {fb.replies && fb.replies.length > 0 && (
                                                <div className={`mt-2 pl-2 border-l-2 ${theme.borderL} space-y-1.5`}>
                                                    {fb.replies.map((reply, rIdx) => (
                                                        <div key={rIdx} className={`${theme.bg} rounded-lg px-2.5 py-1.5 border ${theme.border}`}>
                                                            <div className="flex justify-between items-baseline mb-0.5">
                                                                <span className="font-bold text-slate-900 text-[9px] md:text-[10px] line-through decoration-slate-400">Otro Afectado</span>
                                                            </div>
                                                            <p className="text-slate-700 text-[9px] md:text-[10px] italic font-medium">"{reply.resenaGenerada?.comentario || reply.resenaGenerada?.textoExtracto || "Contenido no disponible"}"</p>
                                                        </div>
                                                    ))}
                                                </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )})}
                            </div>
                        )}
                        
                    </div>
                </div>
            </section>
        </main>
    );
};
