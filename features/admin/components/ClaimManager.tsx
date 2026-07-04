import React, { useState, useEffect } from 'react';
import { db, firebase } from '../../../services/firebase';
import { AdminSection } from './AdminSection';
import { TrashIcon } from '../../../components/Icons';
const { Timestamp } = firebase.firestore;

export const ClaimManager: React.FC<{ setDeletingItem: (item: any) => void }> = ({ setDeletingItem }) => {
    const [claims, setClaims] = useState<any[]>([]);

    useEffect(() => {
        const unsubscribe = db.collection('claim_requests').orderBy('createdAt', 'desc').onSnapshot(s => {
            setClaims(s.docs.map(d => ({ id: d.id, ...d.data() })));
        }, (error) => console.error("Error fetching claims:", error));
        return () => unsubscribe();
    }, []);

    const formatDate = (t: any) => t instanceof Timestamp ? t.toDate().toLocaleString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A';
    
    const handleStatus = async (id: string, s: 'approved' | 'rejected') => { 
        await db.collection('claim_requests').doc(id).update({ status: s }); 
    };

    return (
        <AdminSection title="Reclamos de Propietarios" onSearch={() => {}}>
            <div className="overflow-x-auto">
            <table className="w-full mt-4 text-left border-collapse min-w-[800px]">
                <thead><tr><th className="p-4 text-xs font-bold uppercase text-slate-500">Agencia</th><th className="p-4 text-xs font-bold uppercase text-slate-500">Representante</th><th className="p-4 text-xs font-bold uppercase text-slate-500">Contacto</th><th className="p-4 text-xs font-bold uppercase text-slate-500">Evidencia</th><th className="p-4 text-xs font-bold uppercase text-slate-500">Fecha</th><th className="p-4 text-xs font-bold uppercase text-slate-500">Estado</th><th className="p-4 text-xs font-bold uppercase text-slate-500">Borrar</th></tr></thead>
                <tbody>
                    {claims.map(c => (
                        <tr key={c.id} className={`hover:bg-slate-50 transition-colors ${c.status !== 'pending' ? 'opacity-60' : 'font-bold'}`}>
                            <td className="p-4">{c.agencyName}</td>
                            <td className="p-4 text-sm">{c.representante} ({c.puesto})</td>
                            <td className="p-4 text-sm">{c.correo}<br/>{c.telefono}</td>
                            <td className="p-4 text-sm"><a href={c.enlace} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Ver Enlace</a></td>
                            <td className="p-4 text-sm">{formatDate(c.createdAt)}</td>
                            <td className="p-4">
                                {c.status === 'pending' ? (
                                    <div className="flex gap-2">
                                        <button onClick={() => handleStatus(c.id, 'approved')} className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs hover:bg-emerald-200">Aprobar</button>
                                        <button onClick={() => handleStatus(c.id, 'rejected')} className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs hover:bg-red-200">Rechazar</button>
                                    </div>
                                ) : (
                                    <span className={`text-xs px-2 py-1 rounded ${c.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                        {c.status === 'approved' ? 'Aprobado' : 'Rechazado'}
                                    </span>
                                )}
                            </td>
                            <td className="p-4"><button onClick={() => setDeletingItem({ type: 'claim', id: c.id })}><TrashIcon className="w-5 h-5 text-slate-400 hover:text-red-600 transition"/></button></td>
                        </tr>
                    ))}
                    {claims.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-slate-500">No hay reclamos pendientes</td></tr>}
                </tbody>
            </table>
            </div>
        </AdminSection>
    );
};
