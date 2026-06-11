import React, { useState, useEffect, useMemo } from 'react';
import { Inmobiliaria } from '../../../types';
import { db } from '../../../services/firebase';
import { AdminSection } from './AdminSection';
import { PencilIcon, TrashIcon, UploadIcon } from '../../../components/Icons';
import { AgencyFormModal } from '../modals/AgencyFormModal';
import { AgencyUploadModal } from '../modals/AgencyUploadModal';

export const AgencyManager: React.FC<{ setDeletingItem: (item: any) => void }> = ({ setDeletingItem }) => {
    const [agencies, setAgencies] = useState<Inmobiliaria[]>([]);
    const [adminSearchTerm, setAdminSearchTerm] = useState('');
    const [editingAgency, setEditingAgency] = useState<Inmobiliaria | null>(null);
    const [isAgencyModalOpen, setIsAgencyModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    useEffect(() => {
        const unsubscribe = db.collection('inmobiliarias').onSnapshot(snapshot => {
            setAgencies(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Inmobiliaria)));
        }, (error) => console.error("Error fetching agencies:", error));
        return () => unsubscribe();
    }, []);

    const filteredAdminAgencies = useMemo(() => 
        agencies.filter(a => a.nombre.toLowerCase().includes(adminSearchTerm.toLowerCase())), 
        [agencies, adminSearchTerm]
    );

    const handleSaveAgency = async (ad: Omit<Inmobiliaria, 'id'> & { id?: string }) => { 
        try { 
            if (ad.id) { 
                const { id, ...data } = ad; 
                await db.collection("inmobiliarias").doc(id).set(data, { merge: true }); 
            } else { 
                const { id, ...data } = ad; 
                await db.collection("inmobiliarias").add(data); 
            } 
        } catch (e) { 
            console.error(e); 
        } 
        setIsAgencyModalOpen(false); 
        setEditingAgency(null); 
    };

    const handleBulkAddAgencies = async (nas: Omit<Inmobiliaria, 'id'>[]) => { 
        const b = db.batch(); 
        nas.forEach(a => b.set(db.collection("inmobiliarias").doc(), a)); 
        try { await b.commit(); } catch (e) { console.error(e); } 
    };

    return (
        <>
            <AdminSection 
                title="Inventario" 
                buttonText="Crear Nueva" 
                onButtonClick={() => {setEditingAgency(null); setIsAgencyModalOpen(true);}} 
                onSearch={setAdminSearchTerm} 
                extraButton={<button onClick={() => setIsUploadModalOpen(true)} className="bg-slate-700 text-white px-5 py-2.5 rounded-full font-bold hover:bg-slate-800 transition flex items-center gap-2 w-full sm:w-auto shadow-md"><UploadIcon className="w-4 h-4" /> CSV</button>}
            >
                <table className="w-full text-left border-collapse mt-4">
                    <thead><tr><th className="p-4 font-bold text-slate-500 uppercase text-xs tracking-wider">Nombre</th><th className="p-4 font-bold text-slate-500 uppercase text-xs tracking-wider">Score</th><th className="p-4 font-bold text-slate-500 uppercase text-xs tracking-wider">Quejas</th><th className="p-4 font-bold text-slate-500 uppercase text-xs tracking-wider">Acciones</th></tr></thead>
                    <tbody>
                        {filteredAdminAgencies.map(agency => (
                            <tr key={agency.id} className="hover:bg-slate-50 rounded-2xl transition-colors">
                                <td className="p-4 font-bold text-slate-900">{agency.nombre}</td>
                                <td className="p-4 font-medium">{agency.score}</td>
                                <td className="p-4 font-medium">{agency.quejas}</td>
                                <td className="p-4 flex space-x-3">
                                    <button onClick={() => {setEditingAgency(agency); setIsAgencyModalOpen(true);}}><PencilIcon className="w-5 h-5 text-slate-400 hover:text-blue-600 transition"/></button>
                                    <button onClick={() => setDeletingItem({type: 'agency', id: agency.id})}><TrashIcon className="w-5 h-5 text-slate-400 hover:text-red-600 transition"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </AdminSection>
            {isAgencyModalOpen && <AgencyFormModal isOpen={isAgencyModalOpen} onClose={() => {setEditingAgency(null); setIsAgencyModalOpen(false);}} onSave={handleSaveAgency} agency={editingAgency} />}
            {isUploadModalOpen && <AgencyUploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} onUploadSuccess={handleBulkAddAgencies} />}
        </>
    );
};
