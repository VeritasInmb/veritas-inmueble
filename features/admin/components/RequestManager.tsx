import React, { useState, useEffect } from 'react';
import { SolicitudRevision, Usuario } from '../../../types';
import { db, firebase } from '../../../services/firebase';
import { AdminSection } from './AdminSection';
import { TrashIcon } from '../../../components/Icons';
const { Timestamp } = firebase.firestore;

export const RequestManager: React.FC<{ setDeletingItem: (item: any) => void }> = ({ setDeletingItem }) => {
    const [reviewRequests, setReviewRequests] = useState<SolicitudRevision[]>([]);

    useEffect(() => {
        let unsubscribeRequests = () => {};
        const unsubscribeUsers = db.collection('usuarios').onSnapshot((s) => {
            const uData = s.docs.map(d => ({ id: d.id, ...d.data() } as Usuario)); 
            
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
        }, (error) => console.error("Error fetching users for requests:", error));

        return () => {
            unsubscribeUsers();
            unsubscribeRequests();
        };
    }, []);

    const formatDateForAdmin = (t: any) => t instanceof Timestamp ? t.toDate().toLocaleString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';
    
    const handleToggleRequestStatus = async (rid: string, s: 'pendiente' | 'analizada') => { 
        await db.collection('solicitudesRevision').doc(rid).update({ estado: s === 'pendiente' ? 'analizada' : 'pendiente' }); 
    };

    return (
        <AdminSection title="Solicitudes" onSearch={() => {}}>
            <table className="w-full mt-4 text-left border-collapse">
                <thead><tr><th className="p-4 text-xs font-bold uppercase text-slate-500">Estado</th><th className="p-4 text-xs font-bold uppercase text-slate-500">Inmobiliaria</th><th className="p-4 text-xs font-bold uppercase text-slate-500">URL</th><th className="p-4 text-xs font-bold uppercase text-slate-500">Fecha</th><th className="p-4 text-xs font-bold uppercase text-slate-500">Usuario</th><th className="p-4 text-xs font-bold uppercase text-slate-500">Borrar</th></tr></thead>
                <tbody>
                    {reviewRequests.map(req => (
                        <tr key={req.id} className={`hover:bg-slate-50 transition-colors ${req.estado === 'analizada' ? 'opacity-60' : 'font-bold'}`}>
                            <td className="p-4"><input type="checkbox" checked={req.estado === 'analizada'} onChange={() => handleToggleRequestStatus(req.id, req.estado)} className="h-5 w-5 rounded-md accent-red-600" /></td>
                            <td className="p-4">{req.nombreInmobiliaria}</td>
                            <td className="p-4 text-sm truncate max-w-[150px]"><a href={req.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link</a></td>
                            <td className="p-4 text-sm">{formatDateForAdmin(req.fecha)}</td>
                            <td className="p-4 text-sm">{req.usuarioEmail}</td>
                            <td className="p-4"><button onClick={() => setDeletingItem({ type: 'request', id: req.id })}><TrashIcon className="w-5 h-5 text-slate-400 hover:text-red-600 transition"/></button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </AdminSection>
    );
};
