
import React, { useState, useMemo, useEffect } from 'react';
import { Inmobiliaria, Usuario, SolicitudRevision, BlogPost } from '../types';
import { db, firebase, auth } from '../services/firebase';
import { BuildingOfficeIcon, UserIcon, DocumentIcon, UploadIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon, CloseIcon, SpinnerIcon, PlusIcon, ShieldCheckIcon, WarningIcon } from '../components/Icons';
import { ConfirmationModal } from '../components/SharedComponents';
import { mockForumTopics, mockForumReplies } from '../mockForumData';
import { blogPosts as seedBlogPosts } from '../blogData';
import { top20AgenciesData } from '../top20AgenciesData';
const { Timestamp } = firebase.firestore;

// --- Sub-components for Admin ---

const AdminSection: React.FC<{ title: string; buttonText?: string; onButtonClick?: () => void; onSearch: (term: string) => void; children: React.ReactNode; extraButton?: React.ReactNode; }> = ({ title, buttonText, onButtonClick, onSearch, children, extraButton }) => (
    <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-100 border border-slate-50">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-2xl font-black text-slate-900">{title}</h2>
            <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-4">
                {extraButton}
                <div className="relative w-full sm:w-auto">
                    <input type="text" placeholder="Buscar..." onChange={(e) => onSearch(e.target.value)} className="pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-full focus:outline-none focus:border-red-500 focus:bg-white transition-all w-full" />
                    <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-3"/>
                </div>
                {buttonText && onButtonClick && (
                    <button onClick={onButtonClick} className="bg-red-600 text-white px-5 py-2.5 rounded-full font-semibold hover:bg-red-700 transition shadow-md w-full sm:w-auto flex items-center justify-center gap-2">
                        <PlusIcon className="w-4 h-4" />
                        {buttonText}
                    </button>
                )}
            </div>
        </div>
        <div className="overflow-x-auto">{children}</div>
    </div>
);

const AgencyFormModal = ({ isOpen, onClose, onSave, agency }: { isOpen: boolean; onClose: () => void; onSave: (data: Omit<Inmobiliaria, 'id'> & { id?: string }) => void; agency: Inmobiliaria | null; }) => {
    const [fd, setFd] = useState<Partial<Inmobiliaria>>({}); 
    useEffect(() => { setFd(agency || { nombre: '', score: 0, quejas: 0, contrato: false, googleRating: 0, miembroAMPI: false, antiguedad: 0, rfcStatus: 'Activo', domicilio: false, controversias: '', estado: '', imageUrl: '' }); }, [agency, isOpen]);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { const { name, value, type } = e.target; const chk = type === 'checkbox'; setFd({ ...fd, [name]: chk ? (e.target as HTMLInputElement).checked : (name === 'score' || name === 'quejas' || name === 'googleRating' || name === 'antiguedad') ? Number(value) : name === 'domicilio' ? value === 'true' : value }); };
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
                    <div><label className="text-sm font-bold ml-1">Quejas</label><input type="number" name="quejas" value={fd.quejas ?? 0} onChange={handleChange} required className="w-full mt-1 p-3 bg-slate-50 border-2 border-slate-100 rounded-2xl"/></div>
                    <div><label className="text-sm font-bold ml-1">Rating</label><input type="number" step="0.1" name="googleRating" value={fd.googleRating ?? 0} onChange={handleChange} required className="w-full mt-1 p-3 bg-slate-50 border-2 border-slate-100 rounded-2xl"/></div>
                    <div><label className="text-sm font-bold ml-1">Antigüedad</label><input type="number" name="antiguedad" value={fd.antiguedad ?? 0} onChange={handleChange} required className="w-full mt-1 p-3 bg-slate-50 border-2 border-slate-100 rounded-2xl"/></div>
                    <div><label className="text-sm font-bold ml-1">RFC</label><input name="rfcStatus" value={fd.rfcStatus ?? ''} onChange={handleChange} required className="w-full mt-1 p-3 bg-slate-50 border-2 border-slate-100 rounded-2xl"/></div>
                    <div><label className="text-sm font-bold ml-1">Domicilio</label><select name="domicilio" value={String(fd.domicilio ?? false)} onChange={handleChange} required className="w-full mt-1 p-3 bg-slate-50 border-2 border-slate-100 rounded-2xl"><option value="true">Verificado</option><option value="false">No</option></select></div>
                    <div className="sm:col-span-2"><label className="text-sm font-bold ml-1">Controversias</label><input name="controversias" value={fd.controversias ?? ''} onChange={handleChange} required className="w-full mt-1 p-3 bg-slate-50 border-2 border-slate-100 rounded-2xl"/></div>
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

const UserFormModal = ({ isOpen, onClose, onSave, user }: { isOpen: boolean; onClose: () => void; onSave: (data: Usuario) => void; user: Usuario | null; }) => {
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

const BlogPostFormModal = ({ isOpen, onClose, onSave, post }: { isOpen: boolean; onClose: () => void; onSave: (data: Omit<BlogPost, 'id'> & { id?: string }) => void; post: BlogPost | null; }) => {
    const [fd, setFd] = useState<Partial<BlogPost>>({});
    
    useEffect(() => { 
        setFd(post || { 
            title: '', 
            author: 'Equipo Veritas', 
            date: new Date().toLocaleDateString('es-MX', {day: 'numeric', month: 'long', year: 'numeric'}), 
            summary: '', 
            content: '', 
            imageUrl: '' 
        }); 
    }, [post, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFd({ ...fd, [e.target.name]: e.target.value });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-[101]">
            <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <h3 className="text-2xl font-black text-slate-900 mb-6">{post ? 'Editar' : 'Crear'} Artículo</h3>
                <form onSubmit={(e) => { e.preventDefault(); onSave({ ...post, ...fd } as Omit<BlogPost, 'id'> & { id?: string }); }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2"><label className="text-sm font-bold ml-1">Título</label><input name="title" value={fd.title ?? ''} onChange={handleChange} required className="w-full mt-1 p-3 bg-slate-50 border-2 border-slate-100 rounded-2xl"/></div>
                    <div><label className="text-sm font-bold ml-1">Autor</label><input name="author" value={fd.author ?? ''} onChange={handleChange} required className="w-full mt-1 p-3 bg-slate-50 border-2 border-slate-100 rounded-2xl"/></div>
                    <div><label className="text-sm font-bold ml-1">Fecha (Texto)</label><input name="date" value={fd.date ?? ''} onChange={handleChange} required className="w-full mt-1 p-3 bg-slate-50 border-2 border-slate-100 rounded-2xl"/></div>
                    <div className="md:col-span-2"><label className="text-sm font-bold ml-1">URL Imagen</label><input name="imageUrl" value={fd.imageUrl ?? ''} onChange={handleChange} required className="w-full mt-1 p-3 bg-slate-50 border-2 border-slate-100 rounded-2xl"/></div>
                    <div className="md:col-span-2"><label className="text-sm font-bold ml-1">Resumen (Intro)</label><textarea name="summary" value={fd.summary ?? ''} onChange={handleChange} required className="w-full mt-1 p-3 bg-slate-50 border-2 border-slate-100 rounded-2xl h-24"/></div>
                    <div className="md:col-span-2">
                        <label className="text-sm font-bold ml-1">Contenido (HTML)</label>
                        <p className="text-xs text-slate-400 mb-1">Usa etiquetas &lt;p&gt;, &lt;h3&gt;, &lt;ul&gt; para dar formato.</p>
                        <textarea name="content" value={fd.content ?? ''} onChange={handleChange} required className="w-full mt-1 p-3 bg-slate-50 border-2 border-slate-100 rounded-2xl h-64 font-mono text-sm"/>
                    </div>
                    
                    <div className="md:col-span-2 flex justify-end gap-4 mt-4">
                        <button type="button" onClick={onClose} className="px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 font-bold transition">Cancelar</button>
                        <button type="submit" className="px-6 py-3 rounded-full bg-red-600 text-white hover:bg-red-700 font-bold transition shadow-md">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AgencyUploadModal: React.FC<{ isOpen: boolean; onClose: () => void; onUploadSuccess: (agencies: Omit<Inmobiliaria, 'id'>[]) => void; }> = ({ isOpen, onClose, onUploadSuccess }) => { 
    const [file, setFile] = useState<File | null>(null); 
    const [isProcessing, setIsProcessing] = useState(false); 
    const [error, setError] = useState<string | null>(null); 
    const [report, setReport] = useState<{ successCount: number; errors: string[] } | null>(null); 
    const resetState = () => { setFile(null); setIsProcessing(false); setError(null); setReport(null); }; 
    const handleClose = () => { resetState(); onClose(); }; 
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { resetState(); if (e.target.files && e.target.files.length > 0) { const selectedFile = e.target.files[0]; if (selectedFile.type !== "text/csv") { setError("Por favor, selecciona un archivo con formato .csv"); return; } setFile(selectedFile); } };
    const parseAgencyCSV = (csvText: string): { data: Omit<Inmobiliaria, 'id'>[], errors: string[] } => {
        const lines = csvText.trim().split(/\r\n|\n/); if (lines.length < 2) return { data: [], errors: ["El archivo está vacío o solo contiene la cabecera."] };
        const headers = lines[0].split(',').map(h => h.trim());
        const data: Omit<Inmobiliaria, 'id'>[] = []; const errors: string[] = [];
        const parseBoolean = (val?: string) => { const lowerVal = String(val).toLowerCase(); return lowerVal === 'true' || lowerVal === 'si' || lowerVal === 'sí' || lowerVal === '1' || lowerVal === 'verdadero' };
        lines.slice(1).forEach((line, index) => {
            if (!line.trim()) return; const values = line.split(','); const rowData: { [key: string]: string } = {};
            headers.forEach((header, headerIndex) => { rowData[header] = values[headerIndex] ? values[headerIndex].trim() : ''; });
            try {
                const score = parseInt(rowData.score, 10);
                const quejas = parseInt(rowData.quejas, 10);
                const googleRating = parseFloat(rowData.googleRating);
                const antiguedad = parseInt(rowData.antiguedad, 10);
                const newAgency: Omit<Inmobiliaria, 'id'> = { nombre: rowData.nombre || 'Sin Nombre', score: isNaN(score) ? 0 : score, quejas: isNaN(quejas) ? 0 : quejas, contrato: parseBoolean(rowData.contrato), googleRating: isNaN(googleRating) ? 0 : googleRating, miembroAMPI: parseBoolean(rowData.miembroAMPI), antiguedad: isNaN(antiguedad) ? 0 : antiguedad, rfcStatus: rowData.rfcStatus || 'N/A', domicilio: parseBoolean(rowData.domicilio), controversias: rowData.controversias || 'Ninguna', estado: rowData.estado || 'N/A', imageUrl: rowData.imageUrl || '' };
                data.push(newAgency);
            } catch (e) { errors.push(`Error fila ${index + 2}: ${e}`); }
        });
        return { data, errors };
    };
    const handleProcessFile = () => { if (!file) return; setIsProcessing(true); setError(null); setReport(null); const reader = new FileReader(); reader.onload = (event) => { try { const csvText = event.target?.result as string; const { data, errors } = parseAgencyCSV(csvText); if (data.length > 0) onUploadSuccess(data); setReport({ successCount: data.length, errors }); } catch (e) { setError(`Error inesperado: ${(e as Error).message}`); } finally { setIsProcessing(false); } }; reader.onerror = () => { setError("Error al leer archivo."); setIsProcessing(false); }; reader.readAsText(file); };
    if (!isOpen) return null; 
    return (<div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 z-[101]" onClick={handleClose}><div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl" onClick={e => e.stopPropagation()}>{!report ? (<><h3 className="text-2xl font-black mb-4">Carga Masiva</h3><input type="file" accept=".csv" onChange={handleFileChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-red-50 file:text-red-700 hover:file:bg-red-100 mb-4" />{error && <p className="text-red-600 mb-4">{error}</p>}<div className="flex justify-end gap-2"><button onClick={handleClose} className="px-4 py-2 bg-gray-100 rounded-full">Cancelar</button><button onClick={handleProcessFile} disabled={!file || isProcessing} className="px-4 py-2 bg-red-600 text-white rounded-full disabled:opacity-50">{isProcessing ? 'Procesando...' : 'Cargar'}</button></div></>) : (<div><h4 className="text-xl font-bold mb-2">Resultados</h4><p className="text-green-600">{report.successCount} éxitos.</p>{report.errors.length > 0 && <ul className="text-red-500 text-sm mt-2 max-h-40 overflow-y-auto">{report.errors.map((e, i) => <li key={i}>{e}</li>)}</ul>}<button onClick={handleClose} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-full">Cerrar</button></div>)}</div></div>);
};

export interface AdminPanelProps {}

export const AdminPanel: React.FC<AdminPanelProps> = () => {
    // Local State for Lazy Fetching
    const [agencies, setAgencies] = useState<Inmobiliaria[]>([]);
    const [users, setUsers] = useState<Usuario[]>([]);
    const [reviewRequests, setReviewRequests] = useState<SolicitudRevision[]>([]);
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    // Fetch Admin Data
    useEffect(() => {
        setIsLoadingData(true);
        let unsubscribeUsers = () => {}, unsubscribeRequests = () => {}, unsubscribeBlogs = () => {}, unsubscribeAgencies = () => {};

        // Fetch Agencies
        unsubscribeAgencies = db.collection('inmobiliarias').onSnapshot(snapshot => {
            setAgencies(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Inmobiliaria)));
        }, (error) => console.error("Error fetching agencies:", error));

        // Fetch Blogs
        unsubscribeBlogs = db.collection('blogs').onSnapshot(snapshot => {
            const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
            posts.sort((a, b) => Number(a.id) - Number(b.id));
            setBlogPosts(posts);
        }, (error) => console.error("Error fetching blogs:", error));

        // Fetch Users & Requests
        unsubscribeUsers = db.collection('usuarios').onSnapshot((s) => {
            const uData = s.docs.map(d => ({ id: d.id, ...d.data() } as Usuario)); 
            setUsers(uData);
            unsubscribeRequests = db.collection('solicitudesRevision').orderBy('fecha', 'desc').onSnapshot(rs => {
                setReviewRequests(rs.docs.map(d => { 
                    const da = d.data() as Omit<SolicitudRevision, 'id'>; 
                    return { 
                        id: d.id, 
                        ...da, 
                        usuarioEmail: uData.find(u => u.id === da.usuarioId)?.email || 'N/A' 
                    } as SolicitudRevision; 
                }));
                setIsLoadingData(false);
            }, (error) => {
                console.error("Error fetching review requests:", error);
                setIsLoadingData(false);
            });
        }, (error) => {
            console.error("Error fetching users:", error);
            setIsLoadingData(false);
        });

        return () => {
            unsubscribeUsers();
            unsubscribeRequests();
            unsubscribeBlogs();
            unsubscribeAgencies();
        };
    }, []);

    const [adminView, setAdminView] = useState<'users' | 'agencies' | 'requests' | 'blog' | 'forum'>('agencies');
    const [adminSearchTerm, setAdminSearchTerm] = useState('');
    
    // Agency Modal
    const [editingAgency, setEditingAgency] = useState<Inmobiliaria | null>(null);
    const [isAgencyModalOpen, setIsAgencyModalOpen] = useState(false);
    
    // User Modal
    const [editingUser, setEditingUser] = useState<Usuario | null>(null);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    
    // Blog Modal
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);

    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [deletingItem, setDeletingItem] = useState<{ type: 'agency' | 'user' | 'request' | 'blog'; id: string } | null>(null);
    const [isSeeding, setIsSeeding] = useState(false);
    const [seedStatus, setSeedStatus] = useState<string>('');
    const [isSeedingBlog, setIsSeedingBlog] = useState(false);
    const [isSeedingAgencies, setIsSeedingAgencies] = useState(false);

    const filteredAdminAgencies = useMemo(() => agencies.filter(a => a.nombre.toLowerCase().includes(adminSearchTerm.toLowerCase())), [agencies, adminSearchTerm]);
    const filteredUsers = useMemo(() => users.filter(u => u.nombre.toLowerCase().includes(adminSearchTerm.toLowerCase()) || u.email.toLowerCase().includes(adminSearchTerm.toLowerCase())), [users, adminSearchTerm]);
    const filteredBlogPosts = useMemo(() => blogPosts.filter(p => p.title.toLowerCase().includes(adminSearchTerm.toLowerCase())), [blogPosts, adminSearchTerm]);
    
    const formatDateForAdmin = (t: any) => t instanceof Timestamp ? t.toDate().toLocaleString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';

    const handleSaveAgency = async (ad: Omit<Inmobiliaria, 'id'> & { id?: string }) => { try { if (ad.id) { const { id, ...data } = ad; await db.collection("inmobiliarias").doc(id).set(data, { merge: true }); } else { const { id, ...data } = ad; await db.collection("inmobiliarias").add(data); } } catch (e) { console.error(e); } setIsAgencyModalOpen(false); setEditingAgency(null); };
    const handleBulkAddAgencies = async (nas: Omit<Inmobiliaria, 'id'>[]) => { const b = db.batch(); nas.forEach(a => b.set(db.collection("inmobiliarias").doc(), a)); try { await b.commit(); } catch (e) { console.error(e); } };
    const handleSaveUser = async (ud: Omit<Usuario, 'id'> & { id?: string }) => { if (ud.id) { const { id, ...data } = ud; await db.collection("usuarios").doc(id).set(data, { merge: true }); } setIsUserModalOpen(false); setEditingUser(null); };
    
    const handleSavePost = async (pd: Omit<BlogPost, 'id'> & { id?: string }) => {
        try {
            if (pd.id) {
                const { id, ...data } = pd;
                await db.collection("blogs").doc(id).update(data);
            } else {
                const { id, ...data } = pd;
                await db.collection("blogs").add(data);
            }
        } catch (e) {
            console.error("Error saving post:", e);
            alert("Error al guardar.");
        }
        setIsPostModalOpen(false);
        setEditingPost(null);
    };

    const confirmDelete = async () => { 
        if (!deletingItem) return; 
        try { 
            const collectionName = deletingItem.type === 'agency' ? 'inmobiliarias' 
                                 : deletingItem.type === 'user' ? 'usuarios' 
                                 : deletingItem.type === 'blog' ? 'blogs'
                                 : 'solicitudesRevision';
            await db.collection(collectionName).doc(deletingItem.id).delete(); 
        } catch (e) { 
            console.error(e); 
        } 
        setDeletingItem(null); 
    };
    
    const handleToggleRequestStatus = async (rid: string, s: 'pendiente' | 'analizada') => { await db.collection('solicitudesRevision').doc(rid).update({ estado: s === 'pendiente' ? 'analizada' : 'pendiente' }); };

    // Function to Seed Mock Forum Data to Firestore
    const handleSeedForumData = async () => {
        if (!auth.currentUser) {
            alert("No hay usuario autenticado.");
            return;
        }
        
        setIsSeeding(true);
        setSeedStatus('Iniciando...');
        
        try {
            console.log("Iniciando carga de datos demo...");
            const batch = db.batch();
            let count = 0;
            
            // Add Topics
            mockForumTopics.forEach((topic) => {
                const docRef = db.collection('forum_topics').doc(topic.id);
                // Firestore SDK automatically converts JS Date objects to Timestamps
                batch.set(docRef, topic);
                count++;
            });

            // Add Replies
            mockForumReplies.forEach((reply) => {
                const docRef = db.collection('forum_replies').doc(reply.id);
                batch.set(docRef, reply);
                count++;
            });

            console.log(`Preparados ${count} documentos. Enviando batch...`);
            setSeedStatus(`Enviando ${count} registros...`);
            
            await batch.commit();
            
            console.log("Batch enviado exitosamente.");
            alert(`¡Éxito! Se han creado ${count} registros en la base de datos.`);
            setSeedStatus('');
        } catch (error: any) {
            console.error("Error seeding forum:", error);
            setSeedStatus('Error.');
            
            if (error.code === 'permission-denied') {
                alert("ERROR DE PERMISOS: No tienes rol de 'admin' en la base de datos Firestore.");
            } else {
                alert(`Error desconocido al guardar: ${error.message}`);
            }
        } finally {
            setIsSeeding(false);
        }
    };

    const handleSeedBlogData = async () => {
        if (!auth.currentUser) {
            alert("No hay usuario autenticado.");
            return;
        }
        
        setIsSeedingBlog(true);
        try {
            const batch = db.batch();
            let count = 0;
            
            seedBlogPosts.forEach((post) => {
                // Force ID to be a string
                const docRef = db.collection('blogs').doc(String(post.id));
                const postData = { ...post, id: String(post.id) };
                batch.set(docRef, postData);
                count++;
            });

            await batch.commit();
            alert(`¡Éxito! Se han subido ${count} artículos del blog a Firestore.`);
        } catch (error: any) {
            console.error("Error seeding blog:", error);
            alert(`Error al guardar blog: ${error.message}`);
        } finally {
            setIsSeedingBlog(false);
        }
    };

    const handleSeedTop20Agencies = async () => {
        if (!auth.currentUser) {
            alert("No hay usuario autenticado.");
            return;
        }
        
        setIsSeedingAgencies(true);
        try {
            const batch = db.batch();
            let count = 0;
            
            top20AgenciesData.forEach((agency) => {
                const docRef = db.collection('inmobiliarias').doc();
                batch.set(docRef, agency);
                count++;
            });

            await batch.commit();
            alert(`¡Éxito! Se han subido ${count} inmobiliarias a Firestore.`);
        } catch (error: any) {
            console.error("Error seeding agencies:", error);
            alert(`Error al guardar inmobiliarias: ${error.message}`);
        } finally {
            setIsSeedingAgencies(false);
        }
    };

    return (
        <main className="container mx-auto px-4 pt-24 pb-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-4xl font-black text-slate-900">Panel de Control</h1>
                <div className="flex gap-3 flex-wrap justify-end">
                    <button 
                        onClick={handleSeedForumData} 
                        disabled={isSeeding}
                        className={`bg-teal-600 text-white px-5 py-2.5 rounded-full font-bold hover:bg-teal-700 transition shadow-md flex items-center gap-2 text-sm ${isSeeding ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isSeeding ? <SpinnerIcon className="w-4 h-4"/> : <PlusIcon className="w-4 h-4"/>}
                        {isSeeding ? seedStatus : 'Inicializar BD con Datos Demo'}
                    </button>
                    <button 
                        onClick={handleSeedBlogData} 
                        disabled={isSeedingBlog}
                        className={`bg-blue-600 text-white px-5 py-2.5 rounded-full font-bold hover:bg-blue-700 transition shadow-md flex items-center gap-2 text-sm ${isSeedingBlog ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isSeedingBlog ? <SpinnerIcon className="w-4 h-4"/> : <PlusIcon className="w-4 h-4"/>}
                        Inicializar Blog
                    </button>
                    <button 
                        onClick={handleSeedTop20Agencies} 
                        disabled={isSeedingAgencies}
                        className={`bg-indigo-600 text-white px-5 py-2.5 rounded-full font-bold hover:bg-indigo-700 transition shadow-md flex items-center gap-2 text-sm ${isSeedingAgencies ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isSeedingAgencies ? <SpinnerIcon className="w-4 h-4"/> : <PlusIcon className="w-4 h-4"/>}
                        Inicializar Top 20 Inmobiliarias
                    </button>
                </div>
            </div>
            <div className="flex flex-col md:flex-row gap-6">
                <aside className="md:w-1/4 space-y-3">
                    <nav>
                        <button onClick={() => { setAdminView('agencies'); setAdminSearchTerm(''); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold text-left transition-all ${adminView === 'agencies' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-700 hover:bg-slate-50 shadow-sm border border-slate-100'}`}>
                            <BuildingOfficeIcon className="w-5 h-5" /> <span>Inmobiliarias</span>
                        </button>
                        <button onClick={() => { setAdminView('users'); setAdminSearchTerm(''); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold text-left transition-all mt-2 ${adminView === 'users' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-700 hover:bg-slate-50 shadow-sm border border-slate-100'}`}>
                            <UserIcon className="w-5 h-5" /> <span>Usuarios</span>
                        </button>
                        <button onClick={() => { setAdminView('blog'); setAdminSearchTerm(''); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold text-left transition-all mt-2 ${adminView === 'blog' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-700 hover:bg-slate-50 shadow-sm border border-slate-100'}`}>
                            <DocumentIcon className="w-5 h-5" /> <span>Blog</span>
                        </button>
                        <button onClick={() => { setAdminView('requests'); setAdminSearchTerm(''); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold text-left transition-all mt-2 ${adminView === 'requests' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-700 hover:bg-slate-50 shadow-sm border border-slate-100'}`}>
                            <ShieldCheckIcon className="w-5 h-5" /> <span>Solicitudes</span>
                        </button>
                    </nav>
                </aside>
                <section className="md:w-3/4">
                    {adminView === 'agencies' ? (
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
                    ) : adminView === 'users' ? (
                        <AdminSection title="Directorio Usuarios" buttonText="Crear (Consola)" onButtonClick={() => alert('Usar consola Firebase.')} onSearch={setAdminSearchTerm}>
                            <table className="w-full mt-4">
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
                    ) : adminView === 'blog' ? (
                        <AdminSection title="Artículos del Blog" buttonText="Crear Artículo" onButtonClick={() => {setEditingPost(null); setIsPostModalOpen(true);}} onSearch={setAdminSearchTerm}>
                            <table className="w-full mt-4">
                                <thead><tr><th className="p-4 text-xs font-bold uppercase text-slate-500">Título</th><th className="p-4 text-xs font-bold uppercase text-slate-500">Autor</th><th className="p-4 text-xs font-bold uppercase text-slate-500">Fecha</th><th className="p-4 text-xs font-bold uppercase text-slate-500">Acciones</th></tr></thead>
                                <tbody>
                                    {filteredBlogPosts.map(post => (
                                        <tr key={post.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-4 font-bold text-slate-900 line-clamp-1">{post.title}</td>
                                            <td className="p-4 text-sm font-medium text-slate-600">{post.author}</td>
                                            <td className="p-4 text-sm text-slate-500">{post.date}</td>
                                            <td className="p-4 flex gap-2">
                                                <button onClick={() => {setEditingPost(post); setIsPostModalOpen(true);}}><PencilIcon className="w-5 h-5 text-slate-400 hover:text-blue-600 transition"/></button>
                                                <button onClick={() => setDeletingItem({type: 'blog', id: post.id})}><TrashIcon className="w-5 h-5 text-slate-400 hover:text-red-600 transition"/></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </AdminSection>
                    ) : (
                        <AdminSection title="Solicitudes" onSearch={() => {}}>
                            <table className="w-full mt-4">
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
                    )}
                </section>
            </div>
            
            {isAgencyModalOpen && <AgencyFormModal isOpen={isAgencyModalOpen} onClose={() => {setEditingAgency(null); setIsAgencyModalOpen(false);}} onSave={handleSaveAgency} agency={editingAgency} />}
            {isUserModalOpen && <UserFormModal isOpen={isUserModalOpen} onClose={() => {setEditingUser(null); setIsUserModalOpen(false);}} onSave={handleSaveUser} user={editingUser} />}
            {isPostModalOpen && <BlogPostFormModal isOpen={isPostModalOpen} onClose={() => {setEditingPost(null); setIsPostModalOpen(false);}} onSave={handleSavePost} post={editingPost} />}
            {isUploadModalOpen && <AgencyUploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} onUploadSuccess={handleBulkAddAgencies} />}
            
            <ConfirmationModal 
                isOpen={!!deletingItem} 
                onClose={() => setDeletingItem(null)} 
                onConfirm={confirmDelete} 
                title="Confirmar Eliminación" 
                message="Esta acción es irreversible." 
            />
        </main>
    );
};