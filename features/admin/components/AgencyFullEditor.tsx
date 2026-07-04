import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Inmobiliaria, Resena } from '../../../types';
import { db } from '../../../services/firebase';
import { BuildingOfficeIcon, DocumentIcon, ShieldCheckIcon, WarningIcon, StarIcon, MessageSquareIcon, TrashIcon } from '../../../components/Icons';

interface AgencyFullEditorProps {
    agency: Inmobiliaria | null;
    onSave: (data: Omit<Inmobiliaria, 'id'> & { id?: string }) => void;
    onCancel: () => void;
}

type TabType = 'general' | 'fichatecnica' | 'legal' | 'banderas' | 'profeco' | 'comentarios';

export const AgencyFullEditor: React.FC<AgencyFullEditorProps> = ({ agency, onSave, onCancel }) => {
    const autoCalificar = (texto: string) => {
        const t = texto.toLowerCase();
        if (t.includes('excelente') || t.includes('increíble') || t.includes('increible') || t.includes('maravilla') || t.includes('perfecto')) return 5;
        if (t.includes('buen') || t.includes('bien') || t.includes('recomendable')) return 4;
        if (t.includes('regular') || t.includes('mas o menos') || t.includes('pasable')) return 3;
        if (t.includes('tardo') || t.includes('malo') || t.includes('deficiente') || t.includes('mejorable')) return 2;
        if (t.includes('pesimo') || t.includes('pésimo') || t.includes('mal') || t.includes('horrible') || t.includes('fraude') || t.includes('estafa') || t.includes('robo')) return 1;
        return 0; // Neutro
    };
    const [activeTab, setActiveTab] = useState<TabType>('general');
    const [fd, setFd] = useState<Partial<Inmobiliaria>>({});
    const [nativeReviews, setNativeReviews] = useState<Resena[]>([]);
    const [isLoadingReviews, setIsLoadingReviews] = useState(false);
    const [draggingId, setDraggingId] = useState<string | null>(null);

    // Auto-calcular antigüedad si está vacía
    useEffect(() => {
        if (fd.fichaTecnica?.antiguedadDominio && (!fd.antiguedad || fd.antiguedad === 0)) {
            const domainAge = fd.fichaTecnica.antiguedadDominio.toLowerCase();
            const matchYears = domainAge.match(/(\d+)\s*(año|year)/i);
            let inferred = 0;
            if (matchYears) {
                inferred = parseInt(matchYears[1]);
            } else if (domainAge.includes('mes') || domainAge.includes('month') || domainAge.includes('día') || domainAge.includes('day')) {
                inferred = 1;
            } else if (!isNaN(Date.parse(domainAge))) {
                const creationDate = new Date(domainAge);
                const ageDifMs = Date.now() - creationDate.getTime();
                const ageDate = new Date(ageDifMs);
                const years = Math.abs(ageDate.getUTCFullYear() - 1970);
                inferred = years > 0 ? years : 1;
            }
            if (inferred > 0) {
                setFd(prev => ({...prev, antiguedad: inferred}));
            }
        }
    }, [fd.fichaTecnica?.antiguedadDominio, fd.antiguedad]);

    useEffect(() => {
        const initialAgency = agency ? JSON.parse(JSON.stringify(agency)) : null;
        if (initialAgency && initialAgency.evidenciasSociales) {
            initialAgency.evidenciasSociales = initialAgency.evidenciasSociales.map((ev: any, idx: number) => ({
                ...ev,
                id: ev.id || `es-post-${idx}-${Date.now()}`,
                replies: ev.replies?.map((rep: any, ridx: number) => ({
                    ...rep,
                    id: rep.id || `es-rep-${idx}-${ridx}-${Date.now()}`
                })) || []
            }));
        }
        
        setFd(initialAgency || { 
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

    const handleDeleteNativeReply = async (reviewId: string, replyId: string) => {
        if(window.confirm('¿Eliminar respuesta nativa? Esta acción no se puede deshacer.')) {
            const review = nativeReviews.find(r => r.id === reviewId);
            if (review && review.replies) {
                const newReplies = review.replies.filter(r => r.id !== replyId);
                await db.collection('resenas').doc(reviewId).update({ replies: newReplies });
            }
        }
    };

    const handleDeleteSocialEvidenceReply = (evIndex: number, replyIndex: number) => {
        if(window.confirm('¿Eliminar respuesta de evidencia social? Debes Guardar los cambios para aplicar.')) {
            const nuevas = [...(fd.evidenciasSociales || [])];
            if (nuevas[evIndex].replies) {
                nuevas[evIndex].replies!.splice(replyIndex, 1);
                setFd(prev => ({ ...prev, evidenciasSociales: nuevas }));
            }
        }
    };

    const onDragStart = (start: any) => {
        setDraggingId(start.draggableId);
    };

    const onDragEnd = (result: DropResult) => {
        setDraggingId(null);
        const { source, destination } = result;
        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        let nuevas = [...(fd.evidenciasSociales || [])];
        let draggedItem: any;

        if (source.droppableId === 'ROOT') {
            draggedItem = nuevas[source.index];
            nuevas.splice(source.index, 1);
        } else {
            const parentIdx = nuevas.findIndex(ev => ev.id === source.droppableId);
            if (parentIdx !== -1 && nuevas[parentIdx].replies) {
                draggedItem = nuevas[parentIdx].replies![source.index];
                nuevas[parentIdx].replies!.splice(source.index, 1);
            }
        }

        if (!draggedItem) return;

        if (destination.droppableId === 'ROOT') {
            const newEv = {
                id: draggedItem.id,
                redSocial: draggedItem.redSocial || (source.droppableId !== 'ROOT' ? nuevas.find(ev => ev.id === source.droppableId)?.redSocial : ''),
                fileUrl: draggedItem.fileUrl || (source.droppableId !== 'ROOT' ? nuevas.find(ev => ev.id === source.droppableId)?.fileUrl : ''),
                esPostPrincipal: true,
                resenaGenerada: draggedItem.resenaGenerada,
                replies: draggedItem.replies || []
            };
            nuevas.splice(destination.index, 0, newEv as any);
        } else {
            const destParentIdx = nuevas.findIndex(ev => ev.id === destination.droppableId);
            if (destParentIdx !== -1) {
                if (!nuevas[destParentIdx].replies) nuevas[destParentIdx].replies = [];
                
                // FLATTENING
                let flattenedReplies: any[] = [];
                if (draggedItem.replies && draggedItem.replies.length > 0) {
                    flattenedReplies = draggedItem.replies;
                    draggedItem.replies = [];
                }

                const newReply = {
                    id: draggedItem.id,
                    redSocial: draggedItem.redSocial || nuevas[destParentIdx].redSocial,
                    fileUrl: draggedItem.fileUrl || nuevas[destParentIdx].fileUrl,
                    resenaGenerada: draggedItem.resenaGenerada
                };
                nuevas[destParentIdx].replies!.splice(destination.index, 0, newReply);

                if (flattenedReplies.length > 0) {
                    const formattedFlattened = flattenedReplies.map(r => ({
                        id: r.id,
                        redSocial: r.redSocial || nuevas[destParentIdx].redSocial,
                        fileUrl: r.fileUrl || nuevas[destParentIdx].fileUrl,
                        resenaGenerada: r.resenaGenerada
                    }));
                    nuevas[destParentIdx].replies!.splice(destination.index + 1, 0, ...formattedFlattened);
                }
            }
        }

        setFd(prev => ({ ...prev, evidenciasSociales: nuevas }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...agency, ...fd } as Omit<Inmobiliaria, 'id'> & { id?: string });
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm p-4 md:p-8 flex items-center justify-center">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col h-full w-full max-w-[1600px] overflow-hidden">
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
                                    <div><label className="text-sm font-bold text-slate-700 ml-1 block mb-2">Años de Antigüedad</label><input type="number" name="antiguedad" value={fd.antiguedad || ''} onChange={handleChange} placeholder="Ej. 5 (Vacío para auto-calcular)" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition"/></div>
                                    <div className="md:col-span-1"><label className="text-sm font-bold text-slate-700 ml-1 block mb-2">URL del Logotipo</label><input name="imageUrl" value={fd.imageUrl || ''} onChange={handleChange} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition"/></div>
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
                                                            <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                                                {review.usuarioNombre} 
                                                                <select 
                                                                    value={typeof review.calificacion === 'number' ? review.calificacion : 1}
                                                                    onChange={(e) => {
                                                                        const nuevas = [...nativeReviews];
                                                                        const idx = nuevas.findIndex(r => r.id === review.id);
                                                                        if (idx !== -1) {
                                                                            nuevas[idx].calificacion = Number(e.target.value);
                                                                            setNativeReviews(nuevas);
                                                                            if (review.id) db.collection('resenas').doc(review.id).update({ calificacion: Number(e.target.value) });
                                                                        }
                                                                    }}
                                                                    className="text-[10px] font-normal bg-slate-100 border border-slate-200 rounded px-1 outline-none focus:border-blue-400 text-slate-600 cursor-pointer"
                                                                >
                                                                    <option value={0}>Neutro (No cuenta)</option>
                                                                    <option value={1}>1 Estrella</option>
                                                                    <option value={2}>2 Estrellas</option>
                                                                    <option value={3}>3 Estrellas</option>
                                                                    <option value={4}>4 Estrellas</option>
                                                                    <option value={5}>5 Estrellas</option>
                                                                </select>
                                                                <button type="button" onClick={() => {
                                                                    const val = autoCalificar(review.comentario || '');
                                                                    const nuevas = [...nativeReviews];
                                                                    const idx = nuevas.findIndex(r => r.id === review.id);
                                                                    if (idx !== -1) {
                                                                        nuevas[idx].calificacion = val;
                                                                        setNativeReviews(nuevas);
                                                                        if (review.id) db.collection('resenas').doc(review.id).update({ calificacion: val });
                                                                    }
                                                                }} className="text-[10px] bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-2 py-0.5 rounded font-bold transition">🪄 IA</button>
                                                            </div>
                                                            <div className="text-xs text-slate-400">{review.fecha?.toDate?.().toLocaleDateString() || 'Fecha desconocida'}</div>
                                                        </div>
                                                        <button type="button" onClick={() => handleDeleteNativeReview(review.id!)} className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition text-xs font-bold flex items-center gap-1">Eliminar <TrashIcon className="w-4 h-4" /></button>
                                                    </div>
                                                    <textarea 
                                                        value={review.comentario} 
                                                        onChange={(e) => {
                                                            const nuevas = [...nativeReviews];
                                                            const idx = nuevas.findIndex(r => r.id === review.id);
                                                            if (idx !== -1) {
                                                                nuevas[idx].comentario = e.target.value;
                                                                setNativeReviews(nuevas);
                                                            }
                                                        }}
                                                        onBlur={() => {
                                                            if (review.id) db.collection('resenas').doc(review.id).update({ comentario: review.comentario });
                                                        }}
                                                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:border-red-500 outline-none min-h-[60px] resize-y"
                                                    />
                                                    {review.replies && review.replies.length > 0 && (
                                                        <div className="ml-4 pl-3 border-l-2 border-slate-100 space-y-2 mt-2">
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Respuestas ({review.replies.length})</span>
                                                            {review.replies.map(reply => (
                                                                <div key={reply.id} className="bg-slate-50 p-2.5 rounded-lg relative group">
                                                                    <div className="flex justify-between items-start">
                                                                        <div className="text-[10px] font-bold text-slate-800 mb-1 flex items-center gap-2">
                                                                            {reply.usuarioNombre}
                                                                            <select 
                                                                                value={reply.calificacion || 0} 
                                                                                onChange={(e) => {
                                                                                    const nuevas = [...nativeReviews];
                                                                                    const rIdx = nuevas.findIndex(r => r.id === review.id);
                                                                                    if (rIdx !== -1 && nuevas[rIdx].replies) {
                                                                                        const repIdx = nuevas[rIdx].replies!.findIndex(rp => rp.id === reply.id);
                                                                                        if (repIdx !== -1) {
                                                                                            nuevas[rIdx].replies![repIdx].calificacion = Number(e.target.value);
                                                                                            setNativeReviews(nuevas);
                                                                                            if (review.id) db.collection('resenas').doc(review.id).update({ replies: nuevas[rIdx].replies });
                                                                                        }
                                                                                    }
                                                                                }}
                                                                                className="text-[9px] font-normal bg-slate-200/50 border border-slate-200 rounded px-1 outline-none focus:border-red-400 text-slate-600 cursor-pointer"
                                                                            >
                                                                                <option value={0}>Neutro</option>
                                                                                <option value={1}>1 Estrella</option>
                                                                                <option value={2}>2 Estrellas</option>
                                                                                <option value={3}>3 Estrellas</option>
                                                                                <option value={4}>4 Estrellas</option>
                                                                                <option value={5}>5 Estrellas</option>
                                                                            </select>
                                                                            <button type="button" onClick={() => {
                                                                                const val = autoCalificar(reply.comentario || '');
                                                                                const nuevas = [...nativeReviews];
                                                                                const rIdx = nuevas.findIndex(r => r.id === review.id);
                                                                                if (rIdx !== -1 && nuevas[rIdx].replies) {
                                                                                    const repIdx = nuevas[rIdx].replies!.findIndex(rp => rp.id === reply.id);
                                                                                    if (repIdx !== -1) {
                                                                                        nuevas[rIdx].replies![repIdx].calificacion = val;
                                                                                        setNativeReviews(nuevas);
                                                                                        if (review.id) db.collection('resenas').doc(review.id).update({ replies: nuevas[rIdx].replies });
                                                                                    }
                                                                                }
                                                                            }} className="text-[9px] bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-1.5 py-0.5 rounded font-bold transition">🪄 IA</button>
                                                                        </div>
                                                                        <button type="button" onClick={() => handleDeleteNativeReply(review.id!, reply.id!)} className="text-red-600 hover:text-red-800 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold flex items-center gap-1"><TrashIcon className="w-3 h-3" /></button>
                                                                    </div>
                                                                    <textarea 
                                                                        value={reply.comentario} 
                                                                        onChange={(e) => {
                                                                            const nuevas = [...nativeReviews];
                                                                            const rIdx = nuevas.findIndex(r => r.id === review.id);
                                                                            if (rIdx !== -1 && nuevas[rIdx].replies) {
                                                                                const repIdx = nuevas[rIdx].replies!.findIndex(rp => rp.id === reply.id);
                                                                                if (repIdx !== -1) {
                                                                                    nuevas[rIdx].replies![repIdx].comentario = e.target.value;
                                                                                    setNativeReviews(nuevas);
                                                                                }
                                                                            }
                                                                        }}
                                                                        onBlur={() => {
                                                                            if (review.id) db.collection('resenas').doc(review.id).update({ replies: nativeReviews.find(r => r.id === review.id)?.replies });
                                                                        }}
                                                                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:border-red-500 outline-none min-h-[50px] resize-y"
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

                                {/* Seccion Sociales */}
                                <div>
                                    <h4 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2"><span className="w-2 h-2 bg-pink-500 rounded-full"></span> Evidencias Sociales (IA)</h4>
                                    {(!fd.evidenciasSociales || fd.evidenciasSociales.length === 0) ? (
                                        <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-200">No hay evidencias sociales registradas.</p>
                                    ) : (
                                        <>
                                            <datalist id="roles-publicos">
                                                <option value="Usuario Anonimizado" />
                                                <option value="Propietario" />
                                                <option value="Agente" />
                                                <option value="Inmobiliaria" />
                                            </datalist>
                                            <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
                                                <Droppable droppableId="ROOT" type="POST">
                                                {(providedRoot) => (
                                                    <div className="space-y-4" {...providedRoot.droppableProps} ref={providedRoot.innerRef}>
                                                        {fd.evidenciasSociales!.map((ev, index) => (
                                                            <Draggable key={ev.id!} draggableId={ev.id!} index={index}>
                                                                {(providedPost, snapshotPost) => (
                                                                    <div 
                                                                        ref={providedPost.innerRef} 
                                                                        {...providedPost.draggableProps} 
                                                                        style={providedPost.draggableProps.style}
                                                                        className={`bg-white p-4 rounded-xl shadow-sm flex flex-col gap-3 relative overflow-hidden border-2 transition ${snapshotPost.isDragging ? 'border-pink-400 shadow-xl z-50 scale-105' : 'border-pink-100'}`}
                                                                    >
                                                                        <div {...providedPost.dragHandleProps} className="absolute left-0 top-0 bottom-0 w-8 bg-slate-50 flex flex-col items-center justify-center cursor-grab border-r border-pink-100 hover:bg-slate-100 transition text-slate-400">
                                                                            <span className="material-symbols-outlined text-[16px]">drag_indicator</span>
                                                                        </div>
                                                                        <div className="pl-6">
                                                                            <div className="absolute top-0 right-0 bg-pink-50 text-pink-600 font-bold text-[9px] uppercase px-3 py-1 rounded-bl-xl border-b border-l border-pink-100">
                                                                                {ev.redSocial}
                                                                            </div>
                                                                            <div className="flex justify-between items-start pt-2">
                                                                                <div>
                                                                                    <div className="font-bold text-slate-900 text-sm flex flex-wrap items-center gap-2">
                                                                                        <input
                                                                                            value={ev.resenaGenerada?.usuarioNombre || ev.resenaGenerada?.autorSimulado || ''}
                                                                                            placeholder="Nombre del usuario"
                                                                                            onChange={(e) => {
                                                                                                const nuevas = [...fd.evidenciasSociales!];
                                                                                                if (!nuevas[index].resenaGenerada) nuevas[index].resenaGenerada = {};
                                                                                                nuevas[index].resenaGenerada.usuarioNombre = e.target.value;
                                                                                                setFd(prev => ({ ...prev, evidenciasSociales: nuevas }));
                                                                                            }}
                                                                                            className="bg-transparent border-b border-transparent hover:border-slate-300 focus:border-pink-400 outline-none text-slate-900 placeholder-slate-400 px-1 py-0.5 w-32 md:w-auto"
                                                                                        />
                                                                                        <input
                                                                                            list="roles-publicos"
                                                                                            value={ev.resenaGenerada?.rolPublico || ''}
                                                                                            placeholder="Rol público (ej. Anonimizado)"
                                                                                            onChange={(e) => {
                                                                                                const nuevas = [...fd.evidenciasSociales!];
                                                                                                if (!nuevas[index].resenaGenerada) nuevas[index].resenaGenerada = {};
                                                                                                nuevas[index].resenaGenerada.rolPublico = e.target.value;
                                                                                                setFd(prev => ({ ...prev, evidenciasSociales: nuevas }));
                                                                                            }}
                                                                                            className="bg-slate-100 border border-slate-200 focus:border-pink-400 outline-none text-slate-600 text-xs px-2 py-0.5 rounded w-40"
                                                                                        />
                                                                                        <select 
                                                                                            value={typeof ev.resenaGenerada?.calificacion === 'number' ? ev.resenaGenerada.calificacion : 1} 
                                                                                            onChange={(e) => {
                                                                                                const nuevas = [...fd.evidenciasSociales!];
                                                                                                if (!nuevas[index].resenaGenerada) nuevas[index].resenaGenerada = {};
                                                                                                nuevas[index].resenaGenerada.calificacion = Number(e.target.value);
                                                                                                setFd(prev => ({ ...prev, evidenciasSociales: nuevas }));
                                                                                            }}
                                                                                            className="text-xs font-normal bg-slate-100 border border-slate-200 rounded px-1 py-0.5 outline-none focus:border-pink-400 text-slate-600 cursor-pointer"
                                                                                        >
                                                                                            <option value={0}>Neutro (No cuenta)</option>
                                                                                            <option value={1}>1 Estrella</option>
                                                                                            <option value={2}>2 Estrellas</option>
                                                                                            <option value={3}>3 Estrellas</option>
                                                                                            <option value={4}>4 Estrellas</option>
                                                                                            <option value={5}>5 Estrellas</option>
                                                                                        </select>
                                                                                        <button type="button" onClick={() => {
                                                                                            const val = autoCalificar(ev.resenaGenerada?.comentario || (ev.resenaGenerada as any)?.textoExtracto || '');
                                                                                            const nuevas = [...fd.evidenciasSociales!];
                                                                                            if (!nuevas[index].resenaGenerada) nuevas[index].resenaGenerada = {};
                                                                                            nuevas[index].resenaGenerada.calificacion = val;
                                                                                            setFd(prev => ({ ...prev, evidenciasSociales: nuevas }));
                                                                                        }} className="text-[10px] bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-2 py-0.5 rounded font-bold transition">🪄 IA</button>
                                                                                    </div>
                                                                                    <a href={ev.fileUrl} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-blue-500 hover:underline">Ver Fuente Original</a>
                                                                                </div>
                                                                                <button type="button" onClick={() => handleDeleteSocialEvidence(index)} className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition text-xs font-bold flex items-center gap-1">Eliminar <TrashIcon className="w-4 h-4" /></button>
                                                                            </div>
                                                                            <div className="w-full mt-3">
                                                                                <textarea 
                                                                                    value={ev.resenaGenerada?.comentario || (ev.resenaGenerada as any)?.textoExtracto || ''} 
                                                                                    onChange={(e) => {
                                                                                        const nuevas = [...fd.evidenciasSociales!];
                                                                                        if (!nuevas[index].resenaGenerada) nuevas[index].resenaGenerada = {};
                                                                                        nuevas[index].resenaGenerada.comentario = e.target.value;
                                                                                        delete (nuevas[index].resenaGenerada as any).textoExtracto;
                                                                                        setFd(prev => ({ ...prev, evidenciasSociales: nuevas }));
                                                                                    }}
                                                                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:border-red-500 outline-none min-h-[80px]"
                                                                                />
                                                                            </div>
                                                                            <Droppable droppableId={ev.id!} type="POST" isDropDisabled={draggingId === ev.id}>
                                                                                {(providedReplies) => (
                                                                                    <div className="ml-4 pl-3 border-l-2 border-pink-100 space-y-2 mt-2 min-h-[50px]" {...providedReplies.droppableProps} ref={providedReplies.innerRef}>
                                                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hilos Detectados</span>
                                                                                        {ev.replies?.map((reply, rIdx) => (
                                                                                            <Draggable key={reply.id!} draggableId={reply.id!} index={rIdx}>
                                                                                                {(providedReply, snapshotReply) => (
                                                                                                    <div 
                                                                                                        ref={providedReply.innerRef}
                                                                                                        {...providedReply.draggableProps}
                                                                                                        style={providedReply.draggableProps.style}
                                                                                                        className={`bg-slate-50 p-2.5 rounded-lg relative group transition flex gap-2 ${snapshotReply.isDragging ? 'shadow-lg border-pink-400 z-50 scale-105' : 'border border-slate-100'}`}
                                                                                                    >
                                                                                                        <div {...providedReply.dragHandleProps} className="text-slate-400 cursor-grab hover:text-slate-600 flex-shrink-0 pt-1">
                                                                                                            <span className="material-symbols-outlined text-[14px]">drag_indicator</span>
                                                                                                        </div>
                                                                                                        <div className="flex-1">
                                                                                                            <div className="flex justify-between items-center mb-1">
                                                                                                                <div className="text-[10px] font-bold text-slate-800 flex items-center gap-2">
                                                                                                                    <input
                                                                                                                        value={reply.resenaGenerada?.usuarioNombre || ''}
                                                                                                                        placeholder="Usuario"
                                                                                                                        onChange={(e) => {
                                                                                                                            const nuevas = [...fd.evidenciasSociales!];
                                                                                                                            if (!nuevas[index].replies![rIdx].resenaGenerada) nuevas[index].replies![rIdx].resenaGenerada = {};
                                                                                                                            nuevas[index].replies![rIdx].resenaGenerada.usuarioNombre = e.target.value;
                                                                                                                            setFd(prev => ({ ...prev, evidenciasSociales: nuevas }));
                                                                                                                        }}
                                                                                                                        className="bg-transparent border-b border-transparent hover:border-slate-300 focus:border-pink-400 outline-none text-slate-800 placeholder-slate-400 px-1 py-0.5 w-24 md:w-auto"
                                                                                                                    />
                                                                                                                    <input
                                                                                                                        list="roles-publicos"
                                                                                                                        value={reply.resenaGenerada?.rolPublico || ''}
                                                                                                                        placeholder="Rol (ej. Propietario)"
                                                                                                                        onChange={(e) => {
                                                                                                                            const nuevas = [...fd.evidenciasSociales!];
                                                                                                                            if (!nuevas[index].replies![rIdx].resenaGenerada) nuevas[index].replies![rIdx].resenaGenerada = {};
                                                                                                                            nuevas[index].replies![rIdx].resenaGenerada.rolPublico = e.target.value;
                                                                                                                            setFd(prev => ({ ...prev, evidenciasSociales: nuevas }));
                                                                                                                        }}
                                                                                                                        className="bg-slate-200/50 border border-slate-200 focus:border-pink-400 outline-none text-slate-600 text-[10px] px-1.5 py-0.5 rounded w-28"
                                                                                                                    />
                                                                                                                    <select 
                                                                                                                        value={typeof reply.resenaGenerada?.calificacion === 'number' ? reply.resenaGenerada.calificacion : 0} 
                                                                                                                        onChange={(e) => {
                                                                                                                            const nuevas = [...fd.evidenciasSociales!];
                                                                                                                            if (!nuevas[index].replies![rIdx].resenaGenerada) nuevas[index].replies![rIdx].resenaGenerada = {};
                                                                                                                            nuevas[index].replies![rIdx].resenaGenerada.calificacion = Number(e.target.value);
                                                                                                                            setFd(prev => ({ ...prev, evidenciasSociales: nuevas }));
                                                                                                                        }}
                                                                                                                        className="text-[9px] font-normal bg-slate-200/50 border border-slate-200 rounded px-1 outline-none focus:border-pink-400 text-slate-600 cursor-pointer"
                                                                                                                    >
                                                                                                                        <option value={0}>Neutro</option>
                                                                                                                        <option value={1}>1 Estrella</option>
                                                                                                                        <option value={2}>2 Estrellas</option>
                                                                                                                        <option value={3}>3 Estrellas</option>
                                                                                                                        <option value={4}>4 Estrellas</option>
                                                                                                                        <option value={5}>5 Estrellas</option>
                                                                                                                    </select>
                                                                                                                    <button type="button" onClick={() => {
                                                                                                                        const val = autoCalificar(reply.resenaGenerada?.comentario || (reply.resenaGenerada as any)?.textoExtracto || '');
                                                                                                                        const nuevas = [...fd.evidenciasSociales!];
                                                                                                                        if (!nuevas[index].replies![rIdx].resenaGenerada) nuevas[index].replies![rIdx].resenaGenerada = {};
                                                                                                                        nuevas[index].replies![rIdx].resenaGenerada.calificacion = val;
                                                                                                                        setFd(prev => ({ ...prev, evidenciasSociales: nuevas }));
                                                                                                                    }} className="text-[9px] bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-1.5 py-0.5 rounded font-bold transition">🪄 IA</button>
                                                                                                                </div>
                                                                                                                <div className="flex items-center gap-2">
                                                                                                                    <button type="button" onClick={() => handleDeleteSocialEvidenceReply(index, rIdx)} className="text-red-600 hover:text-red-800 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold flex items-center gap-1"><TrashIcon className="w-3 h-3" /></button>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                            <textarea 
                                                                                                                value={reply.resenaGenerada?.comentario || (reply.resenaGenerada as any)?.textoExtracto || ''} 
                                                                                                                onChange={(e) => {
                                                                                                                    const nuevas = [...fd.evidenciasSociales!];
                                                                                                                    if (!nuevas[index].replies![rIdx].resenaGenerada) nuevas[index].replies![rIdx].resenaGenerada = {};
                                                                                                                    nuevas[index].replies![rIdx].resenaGenerada.comentario = e.target.value;
                                                                                                                    delete (nuevas[index].replies![rIdx].resenaGenerada as any).textoExtracto;
                                                                                                                    setFd(prev => ({ ...prev, evidenciasSociales: nuevas }));
                                                                                                                }}
                                                                                                                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:border-red-500 outline-none min-h-[50px]"
                                                                                                            />
                                                                                                        </div>
                                                                                                    </div>
                                                                                                )}
                                                                                            </Draggable>
                                                                                        ))}
                                                                                        {providedReplies.placeholder}
                                                                                    </div>
                                                                                )}
                                                                            </Droppable>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </Draggable>
                                                        ))}
                                                        {providedRoot.placeholder}
                                                    </div>
                                                )}
                                            </Droppable>
                                        </DragDropContext>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                        
                    </form>
                </div>
            </div>
        </div>
        </div>
    );
};
