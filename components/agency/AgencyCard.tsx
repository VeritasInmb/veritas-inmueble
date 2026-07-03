
import React, { useState, useEffect } from 'react';
import { Inmobiliaria, Resena } from '../../types';
import { db } from '../../services/firebase';
import { getScoreInfo, calculateAgencyScore, calculateSocialVerdict } from '../../constants';
import { CheckCircleIcon, WarningIcon, DocumentIcon, StarIcon, BuildingOfficeIcon } from '../Icons';

interface AgencyCardProps { 
    agency: Inmobiliaria; 
    onSelect: (agency: Inmobiliaria) => void; 
}

export const AgencyCard: React.FC<AgencyCardProps> = ({ agency, onSelect }) => {
    const [localAgency, setLocalAgency] = useState<Inmobiliaria>(agency);
    const calculatedScore = localAgency.score ?? calculateAgencyScore(localAgency);
    const scoreInfo = getScoreInfo(calculatedScore);
    
    const [ratingData, setRatingData] = useState<{ socialVerdict: number; count: number; loading: boolean }>({ socialVerdict: 0, count: 0, loading: true });

    useEffect(() => {
        let isMounted = true;
        const fetchRatingAndAgency = async () => {
            try {
                // Fetch reviews
                const snapshot = await db.collection('resenas').where('inmobiliariaId', '==', agency.id).get();
                let nativeReviews: Resena[] = [];
                if (!snapshot.empty) {
                    nativeReviews = snapshot.docs.map(doc => doc.data() as Resena);
                }

                // Fetch full agency to guarantee we have evidenciasSociales (Algolia might miss it)
                const agencyDoc = await db.collection('inmobiliarias').doc(agency.id).get();
                const fullAgency = agencyDoc.exists ? { ...agency, ...agencyDoc.data() } as Inmobiliaria : agency;
                
                if (isMounted) {
                    setLocalAgency(fullAgency);
                    const socialVerdict = calculateSocialVerdict(fullAgency, nativeReviews);
                    
                    const nativeCount = nativeReviews.length;
                    const externalCount = (fullAgency.evidenciasSociales || []).length;
                    const totalOpinions = nativeCount + externalCount;
                    
                    setRatingData({ socialVerdict, count: totalOpinions, loading: false });
                }
            } catch (error) { 
                if (isMounted) setRatingData(prev => ({ ...prev, loading: false })); 
            }
        };
        fetchRatingAndAgency();
        return () => { isMounted = false; };
    }, [agency]);

    return (
        <div className={`rounded-[2rem] shadow-xl shadow-slate-200/50 transition-all duration-300 group cursor-pointer relative energy-card-wrapper`} onClick={() => onSelect(localAgency)}>
            <div className="bg-white rounded-[1.9rem] p-5 h-full w-full relative z-10">
                <div className="absolute top-5 right-5 flex items-center gap-1.5 bg-slate-100/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200/50 shadow-sm">
                    <div className={`w-2 h-2 rounded-full ${scoreInfo.textColor === 'text-green-500' ? 'bg-green-500' : scoreInfo.textColor === 'text-teal-500' ? 'bg-teal-500' : scoreInfo.textColor === 'text-yellow-500' ? 'bg-yellow-500' : 'bg-red-500'} animate-pulse`}></div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">{scoreInfo.veredicto}</span>
                </div>
                
                <div className="mt-8 flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center overflow-hidden shadow-inner mb-5 border border-slate-100">
                        {localAgency.imageUrl ? <img src={localAgency.imageUrl} alt={localAgency.nombre} className="w-full h-full object-cover" /> : <BuildingOfficeIcon className="w-8 h-8 text-slate-300" />}
                    </div>
                    <h3 className="text-xl font-black text-slate-900 leading-tight tracking-tight mb-1">{localAgency.nombre}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{localAgency.estado}</p>
                    
                    <div className="flex items-center justify-center gap-3 my-5 w-full">
                        <div className="flex flex-col items-center px-4 py-3 bg-slate-50 rounded-[1.5rem] flex-1 border border-slate-100/50">
                            <span className={`text-4xl font-black tracking-tighter ${scoreInfo.textColor}`}>{calculatedScore}</span>
                            <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest mt-1">Score Veritas</span>
                        </div>
                         {!ratingData.loading && (
                            <div className="flex flex-col items-center px-4 py-3 bg-slate-50 rounded-[1.5rem] flex-1 border border-slate-100/50">
                                <div className="flex items-center gap-1 mb-0.5">
                                    <span className="text-2xl font-black tracking-tighter text-slate-900">{ratingData.socialVerdict.toFixed(1)}</span>
                                    <StarIcon className="w-4 h-4 text-yellow-400" filled={true} />
                                </div>
                                <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest mt-1 text-center">{ratingData.count} Opiniones</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="w-full pt-5 border-t border-slate-100 flex justify-between items-center px-2">
                         <div className="flex items-center gap-2">
                            {(localAgency.dictamenProfeco?.totalQuejas || 0) > 0 ? <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-red-600 bg-red-50 border border-red-100 px-2.5 py-1.5 rounded-xl"><WarningIcon className="w-3 h-3"/>{localAgency.dictamenProfeco?.totalQuejas}</span> : <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-1.5 rounded-xl">0 quejas</span>}
                            {localAgency.contrato && <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-teal-700 bg-teal-50 border border-teal-100 px-2.5 py-1.5 rounded-xl"><DocumentIcon className="w-3 h-3"/>Contrato</span>}
                         </div>
                         <span className="text-xs font-black uppercase tracking-widest text-red-600 group-hover:translate-x-1 transition-transform">Ver &rarr;</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
