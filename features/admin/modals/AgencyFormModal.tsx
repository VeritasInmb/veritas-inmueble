import React, { useState, useEffect } from 'react';
import { Inmobiliaria } from '../../../types';

export const AgencyFormModal = ({ isOpen, onClose, onSave, agency }: { isOpen: boolean; onClose: () => void; onSave: (data: Omit<Inmobiliaria, 'id'> & { id?: string }) => void; agency: Inmobiliaria | null; }) => {
    const [fd, setFd] = useState<Partial<Inmobiliaria>>({}); 
    useEffect(() => { setFd(agency || { nombre: '', score: 0, contrato: false, miembroAMPI: false, rfcStatus: 'Activo', domicilio: false, estado: '', imageUrl: '' }); }, [agency, isOpen]);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { 
        const { name, value, type } = e.target; 
        const chk = type === 'checkbox'; 
        setFd({ ...fd, [name]: chk ? (e.target as HTMLInputElement).checked : (name === 'score') ? Number(value) : name === 'domicilio' ? value === 'true' : value }); 
    };
    if(!isOpen) return null; 
    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-[101]">
            <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h3 className="text-2xl font-black text-slate-900 mb-6">{agency ? 'Editar' : 'Crear'} Inmobiliaria</h3>
                <form onSubmit={(e) => { e.preventDefault(); onSave({ ...agency, ...fd } as Omit<Inmobiliaria, 'id'> & { id?: string }); }} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className="text-sm font-bold ml-1">Nombre</label><input name="nombre" value={fd.nombre ?? ''} onChange={handleChange} required className="w-full mt-1 p-3 bg-slate-50 border-2 border-slate-100 rounded-2xl"/></div>
                    <div><label className="text-sm font-bold ml-1">Estado</label><input name="estado" value={fd.estado ?? ''} onChange={handleChange} required className="w-full mt-1 p-3 bg-slate-50 border-2 border-slate-100 rounded-2xl"/></div>
                    <div className="sm:col-span-2"><label className="text-sm font-bold ml-1">Imagen URL</label><input name="imageUrl" value={fd.imageUrl ?? ''} onChange={handleChange} className="w-full mt-1 p-3 bg-slate-50 border-2 border-slate-100 rounded-2xl"/></div>
                    <div><label className="text-sm font-bold ml-1">Score</label><input type="number" name="score" value={fd.score ?? 0} onChange={handleChange} required className="w-full mt-1 p-3 bg-slate-50 border-2 border-slate-100 rounded-2xl"/></div>
                    <div><label className="text-sm font-bold ml-1">RFC</label><input name="rfcStatus" value={fd.rfcStatus ?? ''} onChange={handleChange} required className="w-full mt-1 p-3 bg-slate-50 border-2 border-slate-100 rounded-2xl"/></div>
                    <div><label className="text-sm font-bold ml-1">Domicilio</label><select name="domicilio" value={String(fd.domicilio ?? false)} onChange={handleChange} required className="w-full mt-1 p-3 bg-slate-50 border-2 border-slate-100 rounded-2xl"><option value="true">Verificado</option><option value="false">No</option></select></div>
                    <div className="flex gap-4 mt-2">
                        <label className="flex items-center gap-2 font-bold bg-slate-50 px-4 py-2 rounded-full"><input type="checkbox" name="contrato" checked={fd.contrato ?? false} onChange={handleChange} className="h-5 w-5 accent-red-600"/>Contrato</label>
                        <label className="flex items-center gap-2 font-bold bg-slate-50 px-4 py-2 rounded-full"><input type="checkbox" name="miembroAMPI" checked={fd.miembroAMPI ?? false} onChange={handleChange} className="h-5 w-5 accent-red-600"/>AMPI</label>
                    </div>
                    <div className="sm:col-span-2 flex justify-end gap-4 mt-4">
                        <button type="button" onClick={onClose} className="px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 font-bold transition">Cancelar</button>
                        <button type="submit" className="px-6 py-3 rounded-full bg-red-600 text-white hover:bg-red-700 font-bold transition shadow-md">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
