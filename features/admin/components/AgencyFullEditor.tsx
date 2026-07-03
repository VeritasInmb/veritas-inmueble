import React, { useState, useEffect } from 'react';
import { Inmobiliaria, Resena } from '../../../types';
import { db } from '../../../services/firebase';
import { BuildingOfficeIcon, DocumentIcon, ShieldCheckIcon, WarningIcon, StarIcon, MessageSquareIcon } from '../../../components/Icons';

interface AgencyFullEditorProps {
    agency: Inmobiliaria | null;
    onSave: (data: Omit<Inmobiliaria, 'id'> & { id?: string }) => void;
    onCancel: () => void;
}

type TabType = 'general' | 'fichatecnica' | 'legal' | 'banderas' | 'profeco' | 'comentarios';

export const AgencyFullEditor: React.FC<AgencyFullEditorProps> = ({ agency, onSave, onCancel }) => {
    const [activeTab, setActiveTab] = useState<TabType>('general');
    const [fd, setFd] = useState<Partial<Inmobiliaria>>({});
    const [nativeReviews, setNativeReviews] = useState<Resena[]>([]);
    const [isLoadingReviews, setIsLoadingReviews] = useState(false);

    useEffect(() => {
        setFd(agency || { 
            nombre: '', score: 0, contrato: false, miembroAMPI: false, rfcStatus: 'Activo', 
            domicilio: false, estado: '', imageUrl: '', 
            fichaTecnica: {}, dictamenProfeco: { totalQuejas: 0, anosDetectados: '', tasaResolucion: '', motivosPrincipales: [], veredictoEnganche: '' },
            evidenciasSociales: []
        });

        if (agency?.id) {
            setIsLoadingReviews(true);
            const unsubscribe = db.collection('resenas')
                .where('inmobiliariaId', '==', agency.id)
                .onSnapshot(snapshot => {
                    setNativeReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Resena)));
                    setIsLoadingReviews(false);
                }, (error) => {
                    console.error("Error fetching reviews:", error);
                    setIsLoadingReviews(false);
                });
            return () => unsubscribe();
        }
    }, [agency]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const chk = type === 'checkbox';
        setFd(prev => ({ ...prev, [name]: chk ? (e.target as HTMLInputElement).checked : (name === 'score' ? Number(value) : (name === 'domicilio' ? value === 'true' : value)) }));
    };

    const handleNestedChange = (parent: 'fichaTecnica' | 'dictamenProfeco', name: string, value: any) => {
        setFd(prev => ({
            ...prev,
            [parent]: {
                ...(prev[parent] as any || {}),
                [name]: value
            }
        }));
    };

    const handleDeleteNativeReview = async (reviewId: string) => {
        if(window.confirm('¿Eliminar reseña nativa? Esta acción no se puede deshacer.')) {
            await db.collection('resenas').doc(reviewId).delete();
        }
    };

    const handleDeleteSocialEvidence = (index: number) => {
        if(window.confirm('¿Eliminar evidencia social? Debes Guardar los cambios para aplicar.')) {
            const nuevas = [...(fd.evidenciasSociales || [])];
            nuevas.splice(index, 1);
            setFd(prev => ({ ...prev, evidenciasSociales: nuevas }));
        }
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...agency, ...fd } as Omit<Inmobiliaria, 'id'> & { id?: string });
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col h-[calc(100vh-120px)]">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl shrink-0">
                <div>
                    <h2 className="text-2xl font-black text-slate-900">{agency ? 'Editar Inmobiliaria' : 'Nueva Inmobiliaria'}</h2>
                    <p className="text-sm font-bold text-slate-500 mt-1">{fd.nombre || 'Sin nombre'}</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="px-5 py-2.5 rounded-full font-bold bg-white border-2 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">Cancelar</button>
                    <button onClick={handleSave} className="px-6 py-2.5 rounded-full font-bold bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-600/20 transition-all flex items-center gap-2">
                        Guardar Cambios
                    </button>
                </div>
            </div>

            {/* Tabs & Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar Tabs */}
                <div className="w-64 border-r border-slate-100 bg-slate-50/50 p-4 space-y-1 overflow-y-auto shrink-0">
                    <button onClick={() => setActiveTab('general')} className={`w-full text-left px-4 py-3 rounded-2xl font-bold flex items-center gap-3 transition-colors ${activeTab === 'general' ? 'bg-white text-red-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-slate-100'}`}>
                        <BuildingOfficeIcon className="w-5 h-5" /> General
                    </button>
                    <button onClick={() => setActiveTab('fichatecnica')} className={`w-full text-left px-4 py-3 rounded-2xl font-bold flex items-center gap-3 transition-colors ${activeTab === 'fichatecnica' ? 'bg-white text-red-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-slate-100'}`}>
                        <DocumentIcon className="w-5 h-5" /> Ficha Técnica
                    </button>
                    <button onClick={() => setActiveTab('legal')} className={`w-full text-left px-4 py-3 rounded-2xl font-bold flex items-center gap-3 transition-colors ${activeTab === 'legal' ? 'bg-white text-red-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-slate-100'}`}>
                        <ShieldCheckIcon className="w-5 h-5" /> Legal & Fiscal
                    </button>
                    <button onClick={() => setActiveTab('banderas')} className={`w-full text-left px-4 py-3 rounded-2xl font-bold flex items-center gap-3 transition-colors ${activeTab === 'banderas' ? 'bg-white text-red-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-slate-100'}`}>
                        <WarningIcon className="w-5 h-5" /> Banderas Rojas
                    </button>
                    <button onClick={() => setActiveTab('profeco')} className={`w-full text-left px-4 py-3 rounded-2xl font-bold flex items-center gap-3 transition-colors ${activeTab === 'profeco' ? 'bg-white text-red-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-slate-100'}`}>
                        <StarIcon className="w-5 h-5" filled={false} /> Dictamen PROFECO
                    </button>
                    <button onClick={() => setActiveTab('comentarios')} className={`w-full text-left px-4 py-3 rounded-2xl font-bold flex items-center gap-3 transition-colors ${activeTab === 'comentarios' ? 'bg-white text-red-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-slate-100'}`}>
                        <MessageSquareIcon className="w-5 h-5" /> Testimonios
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-white">
                    <form onSubmit={handleSave} className="max-w-4xl mx-auto">
                        
                        {/* TAB: GENERAL */}
                        {activeTab === 'general' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 border-b pb-2 mb-6">Información General</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div><label className="text-sm font-bold text-slate-700 ml-1 block mb-2">Nombre Comercial</label><input name="nombre" value={fd.nombre || ''} onChange={handleChange} required className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition"/></div>
                                    <div><label className="text-sm font-bold text-slate-700 ml-1 block mb-2">Estado / Región</label><input name="estado" value={fd.estado || ''} onChange={handleChange} required className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition"/></div>
                                    <div className="md:col-span-2"><label className="text-sm font-bold text-slate-700 ml-1 block mb-2">URL del Logotipo</label><input name="imageUrl" value={fd.imageUrl || ''} onChange={handleChange} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition"/></div>
                                    <div><label className="text-sm font-bold text-slate-700 ml-1 block mb-2">ID Carpeta Google Drive</label><input name="driveFolderId" value={fd.driveFolderId || ''} onChange={handleChange} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition"/></div>
                                    <div><label className="text-sm font-bold text-slate-700 ml-1 block mb-2">Score Inicial (1-100)</label><input type="number" name="score" value={fd.score || 0} onChange={handleChange} required className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition"/></div>
                                </div>
                            </div>
                        )}

                        {/* TAB: FICHA TECNICA */}
                        {activeTab === 'fichatecnica' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 border-b pb-2 mb-6">Ficha Técnica</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div><label className="text-sm font-bold text-slate-700 ml-1 block mb-2">Teléfono</label><input value={fd.fichaTecnica?.telefono || ''} onChange={(e) => handleNestedChange('fichaTecnica', 'telefono', e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-red-500 outline-none"/></div>
                                    <div><label className="text-sm font-bold text-slate-700 ml-1 block mb-2">Email</label><input value={fd.fichaTecnica?.email || ''} onChange={(e) => handleNestedChange('fichaTecnica', 'email', e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-red-500 outline-none"/></div>
                                    <div className="md:col-span-2"><label className="text-sm font-bold text-slate-700 ml-1 block mb-2">Dirección Física</label><textarea value={fd.fichaTecnica?.direccion || ''} onChange={(e) => handleNestedChange('fichaTecnica', 'direccion', e.target.value)} rows={2} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-red-500 outline-none"/></div>
                                    <div className="md:col-span-2"><label className="text-sm font-bold text-slate-700 ml-1 block mb-2">Sitio Web Oficial</label><input value={fd.fichaTecnica?.sitioWeb || ''} onChange={(e) => handleNestedChange('fichaTecnica', 'sitioWeb', e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-red-500 outline-none"/></div>
                                    <div><label className="text-sm font-bold text-slate-700 ml-1 block mb-2">Antigüedad Dominio</label><input value={fd.fichaTecnica?.antiguedadDominio || ''} onChange={(e) => handleNestedChange('fichaTecnica', 'antiguedadDominio', e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-red-500 outline-none"/></div>
                                    <div><label className="text-sm font-bold text-slate-700 ml-1 block mb-2">Alerta Antigüedad</label><input value={fd.fichaTecnica?.alertaAntiguedad || ''} onChange={(e) => handleNestedChange('fichaTecnica', 'alertaAntiguedad', e.target.value)} placeholder="Ej. El dominio tiene menos de 1 año" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-red-500 outline-none"/></div>
                                    <div className="md:col-span-2 grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input type="checkbox" checked={fd.fichaTecnica?.equipoDirectivoOculto || false} onChange={(e) => handleNestedChange('fichaTecnica', 'equipoDirectivoOculto', e.target.checked)} className="w-5 h-5 accent-red-600 rounded" />
                                            <span className="font-bold text-sm text-slate-700">Equipo Directivo Oculto</span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input type="checkbox" checked={fd.fichaTecnica?.tieneAvisoPrivacidad || false} onChange={(e) => handleNestedChange('fichaTecnica', 'tieneAvisoPrivacidad', e.target.checked)} className="w-5 h-5 accent-red-600 rounded" />
                                            <span className="font-bold text-sm text-slate-700">Aviso de Privacidad</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB: LEGAL Y FISCAL */}
                        {activeTab === 'legal' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 border-b pb-2 mb-6">Información Legal y Fiscal</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div><label className="text-sm font-bold text-slate-700 ml-1 block mb-2">Estatus en SAT</label><select name="rfcStatus" value={fd.rfcStatus || ''} onChange={handleChange} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-red-500 outline-none"><option value="Activo">Activo</option><option value="Inactivo">Inactivo</option><option value="Irregular">Irregular</option><option value="Desconocido">Desconocido</option></select></div>
                                    <div><label className="text-sm font-bold text-slate-700 ml-1 block mb-2">RFC Registrado (Opcional)</label><input value={fd.fichaTecnica?.rfc || ''} onChange={(e) => handleNestedChange('fichaTecnica', 'rfc', e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-red-500 outline-none"/></div>
                                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input type="checkbox" name="contrato" checked={fd.contrato || false} onChange={handleChange} className="w-5 h-5 accent-red-600 rounded" />
                                            <span className="font-bold text-sm text-slate-700">Contrato Adhesión</span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input type="checkbox" name="miembroAMPI" checked={fd.miembroAMPI || false} onChange={handleChange} className="w-5 h-5 accent-red-600 rounded" />
                                            <span className="font-bold text-sm text-slate-700">Miembro AMPI</span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input type="checkbox" name="domicilio" checked={fd.domicilio || false} onChange={handleChange} className="w-5 h-5 accent-red-600 rounded" />
                                            <span className="font-bold text-sm text-slate-700">Domicilio Verificado</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB: BANDERAS ROJAS */}
                        {activeTab === 'banderas' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 border-b pb-2 mb-6">Banderas Rojas e Investigación</h3>
                                </div>
                                <div className="grid grid-cols-1 gap-6">
                                    <div><label className="text-sm font-bold text-slate-700 ml-1 block mb-2">Estatus en Google (Maps/Búsqueda)</label><select name="googleStatus" value={fd.googleStatus || 'desconocido'} onChange={handleChange} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-red-500 outline-none"><option value="verificado">Verificado</option><option value="no_existe">No Existe</option><option value="confuso">Confuso (Varios Negocios)</option><option value="desconocido">No Analizado</option></select></div>
                                    <div><label className="text-sm font-bold text-slate-700 ml-1 block mb-2">URL del Buró Comercial PROFECO</label><input name="urlProfeco" value={fd.urlProfeco || ''} onChange={handleChange} placeholder="https://burocomercial.profeco.gob.mx/..." className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-red-500 outline-none"/></div>
                                    <div>
                                        <label className="text-sm font-bold text-slate-700 ml-1 block mb-2">Reporte Detallado de Banderas Rojas</label>
                                        <textarea name="reporteBanderasRojas" value={fd.reporteBanderasRojas || ''} onChange={handleChange} rows={6} placeholder="Escribe aquí los resultados del análisis forense que serán visibles públicamente..." className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-red-500 outline-none resize-y"></textarea>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB: PROFECO */}
                        {activeTab === 'profeco' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 border-b pb-2 mb-6">Dictamen Oficial PROFECO</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div><label className="text-sm font-bold text-slate-700 ml-1 block mb-2">Total de Quejas</label><input type="number" value={fd.dictamenProfeco?.totalQuejas || 0} onChange={(e) => handleNestedChange('dictamenProfeco', 'totalQuejas', Number(e.target.value))} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-red-500 outline-none"/></div>
                                    <div><label className="text-sm font-bold text-slate-700 ml-1 block mb-2">Periodo (Años Detectados)</label><input value={fd.dictamenProfeco?.anosDetectados || ''} onChange={(e) => handleNestedChange('dictamenProfeco', 'anosDetectados', e.target.value)} placeholder="Ej. 2021-2023" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-red-500 outline-none"/></div>
                                    <div><label className="text-sm font-bold text-slate-700 ml-1 block mb-2">Tasa de Resolución (%)</label><input value={fd.dictamenProfeco?.tasaResolucion || ''} onChange={(e) => handleNestedChange('dictamenProfeco', 'tasaResolucion', e.target.value)} placeholder="Ej. 80%" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-red-500 outline-none"/></div>
                                    <div><label className="text-sm font-bold text-slate-700 ml-1 block mb-2">Veredicto Enganche</label><input value={fd.dictamenProfeco?.veredictoEnganche || ''} onChange={(e) => handleNestedChange('dictamenProfeco', 'veredictoEnganche', e.target.value)} placeholder="Ej. Alta probabilidad de enganche" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-red-500 outline-none"/></div>
                                    <div className="md:col-span-2">
                                        <label className="text-sm font-bold text-slate-700 ml-1 block mb-2">Motivos Principales (Separados por coma)</label>
                                        <input value={fd.dictamenProfeco?.motivosPrincipales?.join(', ') || ''} onChange={(e) => handleNestedChange('dictamenProfeco', 'motivosPrincipales', e.target.value.split(',').map(s=>s.trim()))} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-red-500 outline-none"/>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB: MODERACIÓN OPINIONES */}
                        {activeTab === 'comentarios' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 border-b pb-2 mb-6">Moderación: Testimonios y Evidencia Social</h3>
                                    <p className="text-sm text-slate-600 mb-6">Administra todas las opiniones relacionadas con esta inmobiliaria. Esto incluye reseñas dejadas nativamente en Veritas y comentarios extraídos de Redes Sociales (Facebook, TikTok, etc.).</p>
                                </div>

                                {/* Seccion Nativas */}
                                <div className="mb-8">
                                    <h4 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2"><span className="w-2 h-2 bg-blue-500 rounded-full"></span> Reseñas Nativas (Veritas)</h4>
                                    {isLoadingReviews ? (
                                        <p className="text-sm text-slate-500">Cargando reseñas nativas...</p>
                                    ) : nativeReviews.length === 0 ? (
                                        <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-200">No hay reseñas nativas registradas.</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {nativeReviews.map(review => (
                                                <div key={review.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <div className="font-bold text-slate-900 text-sm">{review.usuarioNombre} <span className="text-xs text-slate-500 font-normal ml-2">Score: {review.calificacion}★</span></div>
                                                            <div className="text-xs text-slate-400">{review.fecha?.toDate?.().toLocaleDateString() || 'Fecha desconocida'}</div>
                                                        </div>
                                                        <button type="button" onClick={() => handleDeleteNativeReview(review.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg transition"><WarningIcon className="w-4 h-4" /></button>
                                                    </div>
                                                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{review.comentario}</p>
                                                    {review.replies && review.replies.length > 0 && (
                                                        <div className="ml-4 pl-3 border-l-2 border-slate-100 space-y-2 mt-2">
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Respuestas ({review.replies.length})</span>
                                                            {review.replies.map(reply => (
                                                                <div key={reply.id} className="bg-slate-50 p-2.5 rounded-lg">
                                                                    <div className="text-[10px] font-bold text-slate-800 mb-1">{reply.usuarioNombre}</div>
                                                                    <p className="text-xs text-slate-600">{reply.comentario}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Seccion Sociales */}
                                <div>
                                    <h4 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2"><span className="w-2 h-2 bg-pink-500 rounded-full"></span> Evidencias Sociales (IA)</h4>
                                    {(!fd.evidenciasSociales || fd.evidenciasSociales.length === 0) ? (
                                        <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-200">No hay evidencias sociales registradas.</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {fd.evidenciasSociales.map((ev, index) => (
                                                <div key={index} className="bg-white p-4 rounded-xl border border-pink-100 shadow-sm flex flex-col gap-3 relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 bg-pink-50 text-pink-600 font-bold text-[9px] uppercase px-3 py-1 rounded-bl-xl border-b border-l border-pink-100">
                                                        {ev.redSocial}
                                                    </div>
                                                    <div className="flex justify-between items-start pt-2">
                                                        <div>
                                                            <div className="font-bold text-slate-900 text-sm">Usuario Anonimizado</div>
                                                            <a href={ev.fileUrl} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-blue-500 hover:underline">Ver Fuente Original</a>
                                                        </div>
                                                        <button type="button" onClick={() => handleDeleteSocialEvidence(index)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg transition"><WarningIcon className="w-4 h-4" /></button>
                                                    </div>
                                                    <div className="w-full">
                                                        <textarea 
                                                            value={ev.resenaGenerada?.comentario || ''} 
                                                            onChange={(e) => {
                                                                const nuevas = [...fd.evidenciasSociales!];
                                                                nuevas[index].resenaGenerada.comentario = e.target.value;
                                                                setFd(prev => ({ ...prev, evidenciasSociales: nuevas }));
                                                            }}
                                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:border-red-500 outline-none min-h-[80px]"
                                                        />
                                                    </div>
                                                    {ev.replies && ev.replies.length > 0 && (
                                                        <div className="ml-4 pl-3 border-l-2 border-pink-100 space-y-2 mt-2">
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hilos Detectados</span>
                                                            {ev.replies.map((reply, rIdx) => (
                                                                <div key={rIdx} className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                                                    <div className="text-[10px] font-bold text-slate-800 mb-1">Afectado en hilo</div>
                                                                    <textarea 
                                                                        value={reply.resenaGenerada?.comentario || ''} 
                                                                        onChange={(e) => {
                                                                            const nuevas = [...fd.evidenciasSociales!];
                                                                            nuevas[index].replies![rIdx].resenaGenerada.comentario = e.target.value;
                                                                            setFd(prev => ({ ...prev, evidenciasSociales: nuevas }));
                                                                        }}
                                                                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:border-red-500 outline-none min-h-[50px]"
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        
                    </form>
                </div>
            </div>
        </div>
    );
};
