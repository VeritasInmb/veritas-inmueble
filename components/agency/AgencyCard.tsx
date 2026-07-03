
import React, { useState, useEffect } from 'react';
import { Inmobiliaria, Resena } from '../../types';
import { db } from '../../services/firebase';
import { getScoreInfo, calculateAgencyScore, calculateSocialVerdict } from '../../constants';
import { CheckCircleIcon, WarningIcon, DocumentIcon, StarIcon, BuildingOfficeIcon } from '../Icons';

interface AgencyCardProps { 
    agency: Inmobiliaria; 
    onSelect: (agency: Inmobiliaria) => void; 
    onToggleCompare?: (agency: Inmobiliaria) => void; 
    isSelected?: boolean; 
    showCompare?: boolean; 
}

export const AgencyCard: React.FC<AgencyCardProps> = ({ agency, onSelect, onToggleCompare, isSelected, showCompare = true }) => {
    const calculatedScore = calculateAgencyScore(agency);
    const scoreInfo = getScoreInfo(calculatedScore);
    
    const [ratingData, setRatingData] = useState<{ avg: number; count: number; loading: boolean }>({ avg: 0, count: 0, loading: true });

    useEffect(() => {
        let isMounted = true;
        const fetchRating = async () => {
            try {
                const snapshot = await db.collection('resenas').where('inmobiliariaId', '==', agency.id).get();
                if (isMounted && !snapshot.empty) {
                    const ratings = snapshot.docs.map(doc => {
                        const data = doc.data() as Resena;
                        return typeof data.calificacion === 'number' ? data.calificacion : 0;
                    });
                    const sum = ratings.reduce((acc: number, curr: number) => acc + curr, 0);
                    if (isMounted) {
                        setRatingData({ avg: sum / ratings.length, count: ratings.length, loading: false });
                    }
                } else if (isMounted) {
                    setRatingData({ avg: 0, count: 0, loading: false });
                }
            } catch (error) { 
                if (isMounted) setRatingData(prev => ({ ...prev, loading: false })); 
            }
        };
        fetchRating();
        return () => { isMounted = false; };
    }, [agency.id]);

    return (
        <div className={`rounded-[2rem] shadow-xl shadow-slate-200/50 transition-all duration-300 group cursor-pointer relative energy-card-wrapper ${isSelected ? 'active-energy' : ''}`} onClick={() => onSelect(agency)}>
            <div className="bg-white rounded-[1.9rem] p-5 h-full w-full relative z-10">
                {showCompare && <button onClick={(e) => { e.stopPropagation(); onToggleCompare && onToggleCompare(agency); }} className={`absolute top-5 left-5 z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-red-500 border-red-500 text-white' : 'bg-white border-slate-200 text-transparent hover:border-red-500 hover:text-red-500'}`}>
                    <CheckCircleIcon className="w-5 h-5" />
                </button>}
                <div className="absolute top-5 right-5 flex items-center gap-1.5 bg-slate-100/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200/50 shadow-sm">
                    <div className={`w-2 h-2 rounded-full ${scoreInfo.textColor === 'text-green-500' ? 'bg-green-500' : scoreInfo.textColor === 'text-teal-500' ? 'bg-teal-500' : scoreInfo.textColor === 'text-yellow-500' ? 'bg-yellow-500' : 'bg-red-500'} animate-pulse`}></div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">{scoreInfo.veredicto}</span>
                </div>
                
                <div className="mt-8 flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center overflow-hidden shadow-inner mb-5 border border-slate-100">
                        {agency.imageUrl ? <img src={agency.imageUrl} alt={agency.nombre} className="w-full h-full object-cover" /> : <BuildingOfficeIcon className="w-8 h-8 text-slate-300" />}
                    </div>
                    <h3 className="text-xl font-black text-slate-900 leading-tight tracking-tight mb-1">{agency.nombre}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{agency.estado}</p>
                    
                    <div className="flex items-center justify-center gap-3 my-5 w-full">
                        <div className="flex flex-col items-center px-4 py-3 bg-slate-50 rounded-[1.5rem] flex-1 border border-slate-100/50">
                            <span className={`text-4xl font-black tracking-tighter ${scoreInfo.textColor}`}>{calculatedScore}</span>
                            <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest mt-1">Score Veritas</span>
                        </div>
                         {!ratingData.loading && (
                            <div className="flex flex-col items-center px-4 py-3 bg-slate-50 rounded-[1.5rem] flex-1 border border-slate-100/50">
                                <div className="flex items-center gap-1 mb-0.5">
                                    <span className="text-2xl font-black tracking-tighter text-slate-900">{ratingData.avg.toFixed(1)}</span>
                                    <StarIcon className="w-4 h-4 text-yellow-400" filled={true} />
                                </div>
                                <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest mt-1">{ratingData.count} Opiniones</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="w-full pt-5 border-t border-slate-100 flex justify-between items-center px-2">
                         <div className="flex items-center gap-2">
                            {(agency.dictamenProfeco?.totalQuejas || 0) > 0 ? <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-red-600 bg-red-50 border border-red-100 px-2.5 py-1.5 rounded-xl"><WarningIcon className="w-3 h-3"/>{agency.dictamenProfeco?.totalQuejas}</span> : <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-1.5 rounded-xl">0 quejas</span>}
                            {agency.contrato && <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-teal-700 bg-teal-50 border border-teal-100 px-2.5 py-1.5 rounded-xl"><DocumentIcon className="w-3 h-3"/>Contrato</span>}
                         </div>
                         <span className="text-xs font-black uppercase tracking-widest text-red-600 group-hover:translate-x-1 transition-transform">Ver &rarr;</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
