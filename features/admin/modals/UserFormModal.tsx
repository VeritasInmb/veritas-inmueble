import React, { useState, useEffect } from 'react';
import { Usuario } from '../../../types';

export const UserFormModal = ({ isOpen, onClose, onSave, user }: { isOpen: boolean; onClose: () => void; onSave: (data: Usuario) => void; user: Usuario | null; }) => {
    const [fd, setFd] = useState<Partial<Usuario>>({}); 
    useEffect(() => { setFd(user || { nombre: '', email: '', rol: 'usuario' }); }, [user, isOpen]);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setFd({ ...fd, [e.target.name]: e.target.value });
    if(!isOpen) return null; 
    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-[101]">
            <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 w-full max-w-lg">
                <h3 className="text-2xl font-black text-slate-900 mb-4">{user ? 'Editar' : 'Crear'} Usuario</h3>
                <form onSubmit={(e) => { e.preventDefault(); onSave({ ...user, ...fd } as Usuario); }} className="space-y-4">
                    <div><label className="text-sm font-bold ml-1">Nombre</label><input name="nombre" value={fd.nombre} onChange={handleChange} required className="w-full mt-1 p-3 bg-slate-50 border-2 border-slate-100 rounded-2xl"/></div>
                    <div><label className="text-sm font-bold ml-1">Email</label><input type="email" name="email" value={fd.email} onChange={handleChange} required className="w-full mt-1 p-3 bg-slate-50 border-2 border-slate-100 rounded-2xl" disabled={!!user}/></div>
                    <div><label className="text-sm font-bold ml-1">Rol</label><select name="rol" value={fd.rol} onChange={handleChange} required className="w-full mt-1 p-3 bg-slate-50 border-2 border-slate-100 rounded-2xl"><option value="usuario">Usuario</option><option value="admin">Admin</option></select></div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="px-5 py-3 rounded-full bg-slate-100 font-bold transition hover:bg-slate-200">Cancelar</button>
                        <button type="submit" className="px-5 py-3 rounded-full bg-red-600 text-white font-bold transition hover:bg-red-700 shadow-md">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
