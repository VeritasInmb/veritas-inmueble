
import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from 'recharts';
import { ExternalLinkIcon, StarIcon, CloseIcon, CheckCircleIcon, SpinnerIcon, BuildingOfficeIcon, UserIcon } from './Icons';
import { Inmobiliaria, Usuario } from '../types';

export const MetricCard: React.FC<{ title: string; value: string | number; source?: { title: string; uri: string; }; icon?: React.ReactNode; color?: string; }> = ({ title, value, source, icon, color = "text-slate-900" }) => (
    <div className="bg-white rounded-3xl p-5 relative overflow-hidden group transition-all duration-300 border-2 border-red-600/50 shadow-[0_0_15px_rgba(220,38,38,0.15)] hover:border-red-600 hover:shadow-[0_0_25px_rgba(220,38,38,0.25)] hover:-translate-y-1">
        <div className="flex justify-between items-start mb-2 relative z-10">
            <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">{title}</h4>
            {icon}
        </div>
        <p className={`text-3xl font-black ${color} relative z-10 truncate`}>{value}</p>
        {source && <a href={source.uri} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-full relative z-10 group-hover:bg-red-600 group-hover:text-white transition-colors gap-1"><ExternalLinkIcon className="w-3 h-3" />Ver fuente</a>}
    </div>
);

export const ScoreDonutChart: React.FC<{ score: number; color: string; size?: 'sm' | 'lg'; }> = ({ score, color, size = 'lg' }) => {
    const data = [{ name: 'Score', value: score, color: color }, { name: 'Remaining', value: 100 - score, color: '#f1f5f9' }];
    const isSmall = size === 'sm';
    return (
        <div className="w-full h-full relative mx-auto">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie data={data} cx="50%" cy="50%" innerRadius={isSmall ? "75%" : "80%"} outerRadius="100%" paddingAngle={0} dataKey="value" stroke="none" cornerRadius={isSmall ? 20 : 40} startAngle={90} endAngle={-270}>
                        {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className={`${isSmall ? 'text-3xl md:text-4xl' : 'text-7xl'} font-black tracking-tighter leading-none`} style={{color: color}}>{score}</p>
                <span className={`${isSmall ? 'text-[8px] md:text-[10px] mt-1' : 'text-sm mt-2'} font-bold text-slate-400 uppercase tracking-wider text-center px-2 leading-tight`}>Score de Confianza</span>
            </div>
        </div>
    );
};

export const StarRatingInput: React.FC<{ rating: number, setRating: (r: number) => void }> = ({ rating, setRating }) => {
    const [hoverRating, setHoverRating] = useState(0);
    return (
        <div className="flex items-center gap-1 w-max">
            {[...Array(5)].map((_, index) => {
                const starValue = index + 1;
                return (
                    <button type="button" key={starValue} className="transition-transform hover:scale-110 px-0.5" onClick={() => setRating(starValue)} onMouseEnter={() => setHoverRating(starValue)} onMouseLeave={() => setHoverRating(0)} aria-label={`Calificar con ${starValue} estrellas`}>
                        <StarIcon className="w-4 h-4 md:w-5 md:h-5 transition-colors" filled={(hoverRating || rating) >= starValue} />
                    </button>
                );
            })}
        </div>
    );
};

export const FraudContextSection = () => {
    return (
        <div className="mb-12">
            <div className="text-center mb-10">
                <h3 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">La Realidad Inmobiliaria Hoy</h3>
                <p className="text-slate-600 text-lg max-w-2xl mx-auto font-medium">El sector ha evolucionado, y los riesgos también. Conocer el panorama actual con datos reales es el primer paso para proteger tu inversión de manera inteligente.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300">
                    <span className="text-6xl font-black text-slate-900 mb-4 tracking-tighter">40<span className="text-4xl text-slate-400">%</span></span>
                    <h4 className="text-xl font-bold text-slate-900 mb-3">La Amenaza Digital</h4>
                    <p className="text-slate-600 font-medium leading-relaxed">Cerca del 40% de las estafas digitales ya utilizan tecnología avanzada (IA) para falsificar identidades, documentos y propiedades.</p>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300">
                    <span className="text-6xl font-black text-slate-900 mb-4 tracking-tighter"><span className="text-4xl text-slate-400">&gt;</span>90<span className="text-4xl text-slate-400">%</span></span>
                    <h4 className="text-xl font-bold text-slate-900 mb-3">El Costo de la Informalidad</h4>
                    <p className="text-slate-600 font-medium leading-relaxed">Se estima que más del 90% de quienes ofrecen inmuebles operan sin certificación. Realizar tratos sin verificar eleva el riesgo exponencialmente.</p>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300">
                    <span className="text-6xl font-black text-red-600 mb-4 tracking-tighter">97.2<span className="text-4xl text-red-400">%</span></span>
                    <h4 className="text-xl font-bold text-slate-900 mb-3">Impunidad Estadística</h4>
                    <p className="text-slate-600 font-medium leading-relaxed">Una vez entregado un anticipo fraudulento, la prevención es la única garantía real. El 97.2% de los fraudes en México quedan impunes.</p>
                </div>
            </div>
        </div>
    );
};

// --- AUTH WALL MODAL ---
export const AuthModal: React.FC<{ isOpen: boolean; onClose: () => void; onLogin: () => void; }> = ({ isOpen, onClose, onLogin }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[110]" onClick={onClose}>
            <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 w-full max-w-sm text-center relative overflow-hidden" onClick={e => e.stopPropagation()}>
                 <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-orange-500"></div>
                 <button onClick={onClose} className="absolute top-4 right-4 bg-slate-50 p-2 rounded-full hover:bg-slate-100 transition"><CloseIcon className="w-5 h-5 text-slate-400"/></button>
                 
                 <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                     <UserIcon className="w-8 h-8 text-red-600" />
                 </div>
                 
                 <h3 className="text-2xl font-black text-slate-900 mb-3">Únete a la Comunidad</h3>
                 <p className="text-slate-500 font-medium mb-8 leading-relaxed">Para realizar esta acción, necesitamos verificar que eres una persona real. Es gratis y rápido.</p>
                 
                 <div className="space-y-3">
                     <button onClick={onLogin} className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-900/20">
                         Iniciar Sesión
                     </button>
                     <button onClick={onLogin} className="w-full py-3.5 bg-white text-slate-900 border-2 border-slate-100 rounded-xl font-bold hover:bg-slate-50 transition">
                         Registrarse
                     </button>
                 </div>
                 <p className="mt-6 text-xs text-slate-400 font-bold uppercase tracking-widest">Veritas Inmueble</p>
            </div>
        </div>
    );
};

export const ReviewModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (data: { nombre: string; url: string; }) => Promise<void>; currentUser: Usuario | null; onRequireAuth: () => void; }> = ({ isOpen, onClose, onSave, currentUser, onRequireAuth }) => {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ nombre: '', url: '' });
    
    const handleClose = () => { onClose(); setTimeout(() => { setIsSubmitted(false); setFormData({ nombre: '', url: '' }); }, 300); };
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };
    
    const handleSubmit = async (e: React.FormEvent) => { 
        e.preventDefault(); 
        if (!formData.nombre || !formData.url) return; 
        
        // CHECK AUTH ON SUBMIT
        if (!currentUser) {
            onRequireAuth();
            return;
        }

        setIsSubmitting(true); 
        try { 
            await onSave(formData); 
            setIsSubmitted(true); 
        } catch (error) { 
            console.error("Failed:", error); 
        } finally { 
            setIsSubmitting(false); 
            setTimeout(() => { handleClose(); }, 2500); 
        } 
    };

    if (!isOpen) return null;
    return <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]" onClick={handleClose}><div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg relative scale-100 transition-all" onClick={e => e.stopPropagation()}><button onClick={handleClose} className="absolute top-5 right-5 bg-gray-100 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-all"><CloseIcon className="w-5 h-5" /></button>{!isSubmitted ? (<div><h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Solicitar <span className="text-red-600">Análisis</span></h3><p className="text-slate-600 mb-8 leading-relaxed">¿Dudas de una inmobiliaria? Déjanos sus datos. Nuestro algoritmo y equipo de expertos la investigarán a fondo.</p><form className="space-y-5" onSubmit={handleSubmit}><div><label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Nombre de la Inmobiliaria</label><input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-red-500 focus:bg-white transition-all" placeholder="Ej. Inmobiliaria Ejemplo" /></div><div><label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Sitio Web o Dirección</label><input type="text" name="url" value={formData.url} onChange={handleChange} required className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-red-500 focus:bg-white transition-all" placeholder="ejemplo.com o dirección completa" /></div><button type="submit" disabled={isSubmitting} className="w-full py-4 bg-red-600 text-white rounded-2xl font-bold text-lg hover:bg-red-700 transition duration-150 disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg shadow-red-600/30 mt-4">{isSubmitting && <SpinnerIcon className="w-6 h-6" />} {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}</button></form></div>) : (<div className="text-center py-12"><div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircleIcon className="w-10 h-10 text-green-600" /></div><h3 className="text-2xl font-black text-slate-900 mb-3">¡Solicitud Recibida!</h3><p className="text-slate-600">La hemos añadido a nuestra cola de análisis prioritario.</p></div>)}</div></div>;
};

export const ComparisonModal: React.FC<{ isOpen: boolean; onClose: () => void; agencies: Inmobiliaria[]; }> = ({ isOpen, onClose, agencies }) => { if (!isOpen) return null; return <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[100]" onClick={onClose}><div className="bg-white rounded-[2.5rem] shadow-2xl p-8 w-full max-w-6xl relative max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}><div className="flex justify-between items-center mb-8"><h3 className="text-3xl font-black text-slate-900">Comparativa</h3><button onClick={onClose} className="bg-slate-100 p-2 rounded-full text-slate-500 hover:bg-slate-200 transition"><CloseIcon className="w-6 h-6" /></button></div><div className="overflow-x-auto"><table className="w-full border-separate border-spacing-x-4"><thead><tr><th className="text-left pb-6 font-bold text-slate-400 uppercase tracking-wider text-sm w-1/4">Métrica</th>{agencies.map(agency => <th key={agency.id} className="text-center pb-6"><div className="flex flex-col items-center justify-center gap-3 bg-slate-50 p-4 rounded-3xl"><div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm p-1">{agency.imageUrl ? (<img src={agency.imageUrl} alt={agency.nombre} className="w-full h-full object-cover rounded-xl" />) : (<BuildingOfficeIcon className="w-8 h-8 text-slate-300" />)}</div><span className="font-bold text-slate-900">{agency.nombre}</span></div></th>)}</tr></thead><tbody>{[{ key: 'score', label: 'Score de Confianza' }, { key: 'quejas', label: 'Quejas PROFECO' }, { key: 'contrato', label: 'Contrato Adhesión' }, { key: 'googleRating', label: 'Google Rating' }, { key: 'miembroAMPI', label: 'Miembro AMPI' }, { key: 'antiguedad', label: 'Antigüedad (años)' }, { key: 'rfcStatus', label: 'Estatus RFC' }, { key: 'domicilio', label: 'Domicilio Físico' }, { key: 'controversias', label: 'Controversias' }].map(metric => <tr key={metric.key as string}><td className="py-4 px-4 font-bold text-slate-700 bg-slate-50/50 rounded-2xl mb-2">{metric.label}</td>{agencies.map(agency => <td key={agency.id} className="py-4 px-4 text-center text-slate-900 font-medium bg-white border-2 border-slate-100 rounded-2xl mb-2 transition-colors hover:border-red-100">{(agency as any)[metric.key] === true ? <CheckCircleIcon className="w-6 h-6 text-green-500 mx-auto" /> : (agency as any)[metric.key] === false ? <CloseIcon className="w-6 h-6 text-red-500 mx-auto" /> : (agency as any)[metric.key]}</td>)}</tr>)}</tbody></table></div></div></div>; };

export const ConfirmationModal: React.FC<{isOpen: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string;}> = ({ isOpen, onClose, onConfirm, title, message }) => { if (!isOpen) return null; return <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 z-[101]" onClick={onClose}><div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md" onClick={e => e.stopPropagation()}><h3 className="text-2xl font-black text-slate-900 mb-4">{title}</h3><p className="text-slate-600 mb-8 leading-relaxed">{message}</p><div className="flex justify-end space-x-3"><button onClick={onClose} className="px-5 py-3 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition">Cancelar</button><button onClick={onConfirm} className="px-5 py-3 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 transition shadow-lg shadow-red-600/20">Sí, continuar</button></div></div></div>; };

export const ComparisonBar: React.FC<{ agencies: Inmobiliaria[]; onCompare: () => void; onClear: () => void; }> = ({ agencies, onCompare, onClear }) => { const canCompare = agencies.length >= 2; return <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-2xl bg-slate-900/95 backdrop-blur-md shadow-2xl rounded-full p-3 z-[90] flex items-center justify-between pr-4 border border-slate-800/50"><div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-2 flex-1">{agencies.map(agency => <div key={agency.id} className="bg-slate-800 text-slate-200 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-2"><span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>{agency.nombre}</div>)}</div><div className="flex items-center gap-4 pl-4 border-l border-slate-800"><button onClick={onClear} className="text-slate-400 hover:text-white font-medium text-sm transition-colors">Borrar</button><button onClick={onCompare} disabled={!canCompare} className={`bg-red-600 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all ${canCompare ? 'hover:bg-red-50 shadow-lg shadow-red-600/20' : 'opacity-50 cursor-not-allowed'}`}>Comparar ({agencies.length})</button></div></div>; };
