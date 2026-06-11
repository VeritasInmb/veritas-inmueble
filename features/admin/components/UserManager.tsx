import React, { useState, useEffect, useMemo } from 'react';
import { Usuario } from '../../../types';
import { db } from '../../../services/firebase';
import { AdminSection } from './AdminSection';
import { PencilIcon, TrashIcon } from '../../../components/Icons';
import { UserFormModal } from '../modals/UserFormModal';

export const UserManager: React.FC<{ setDeletingItem: (item: any) => void }> = ({ setDeletingItem }) => {
    const [users, setUsers] = useState<Usuario[]>([]);
    const [adminSearchTerm, setAdminSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState<Usuario | null>(null);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);

    useEffect(() => {
        const unsubscribe = db.collection('usuarios').onSnapshot((s) => {
            setUsers(s.docs.map(d => ({ id: d.id, ...d.data() } as Usuario))); 
        }, (error) => console.error("Error fetching users:", error));
        return () => unsubscribe();
    }, []);

    const filteredUsers = useMemo(() => 
        users.filter(u => u.nombre.toLowerCase().includes(adminSearchTerm.toLowerCase()) || u.email.toLowerCase().includes(adminSearchTerm.toLowerCase())), 
        [users, adminSearchTerm]
    );

    const handleSaveUser = async (ud: Omit<Usuario, 'id'> & { id?: string }) => { 
        if (ud.id) { 
            const { id, ...data } = ud; 
            await db.collection("usuarios").doc(id).set(data, { merge: true }); 
        } 
        setIsUserModalOpen(false); 
        setEditingUser(null); 
    };

    return (
        <>
            <AdminSection title="Directorio Usuarios" buttonText="Crear (Consola)" onButtonClick={() => alert('Usar consola Firebase.')} onSearch={setAdminSearchTerm}>
                <table className="w-full mt-4 text-left border-collapse">
                    <thead><tr><th className="p-4 text-xs font-bold uppercase text-slate-500">Nombre</th><th className="p-4 text-xs font-bold uppercase text-slate-500">Email</th><th className="p-4 text-xs font-bold uppercase text-slate-500">Rol</th><th className="p-4 text-xs font-bold uppercase text-slate-500">Acciones</th></tr></thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 font-bold">{user.nombre}</td>
                                <td className="p-4 text-sm">{user.email}</td>
                                <td className="p-4"><span className={`px-3 py-1 text-xs font-bold rounded-full ${user.rol === 'admin' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>{user.rol}</span></td>
                                <td className="p-4 flex gap-2">
                                    <button onClick={() => {setEditingUser(user); setIsUserModalOpen(true);}}><PencilIcon className="w-5 h-5 text-slate-400 hover:text-blue-600 transition"/></button>
                                    <button onClick={() => setDeletingItem({type: 'user', id: user.id})}><TrashIcon className="w-5 h-5 text-slate-400 hover:text-red-600 transition"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </AdminSection>
            {isUserModalOpen && <UserFormModal isOpen={isUserModalOpen} onClose={() => {setEditingUser(null); setIsUserModalOpen(false);}} onSave={handleSaveUser} user={editingUser} />}
        </>
    );
};
