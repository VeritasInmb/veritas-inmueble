import React, { useState, useEffect } from 'react';
import { Inmobiliaria } from '../../../types';
import { SpinnerIcon, SearchIcon, UploadIcon, CheckCircleIcon, ShieldCheckIcon, GlobeIcon, MapPinIcon, DocumentIcon } from '../../../components/Icons';
import { storage } from '../../../services/firebase';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface InvestigationEngineProps {
    onComplete: (agency: Partial<Inmobiliaria>) => void;
    onCancel: () => void;
    initialData?: Partial<Inmobiliaria>;
}

export const InvestigationEngine: React.FC<InvestigationEngineProps> = ({ onComplete, onCancel, initialData }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [agencyData, setAgencyData] = useState<Partial<Inmobiliaria>>(initialData || {});
    const [scrapeUrl, setScrapeUrl] = useState('');
    
    // UI states
    const [isLoading, setIsLoading] = useState(false);
    
    // News Scraping States
    const [manualNewsUrl, setManualNewsUrl] = useState('');
    const [manualNewsText, setManualNewsText] = useState('');
    const [isScrapingNews, setIsScrapingNews] = useState(false);
    
    // Social Media States
    const [socialNetwork, setSocialNetwork] = useState('Facebook');
    const [socialCandidates, setSocialCandidates] = useState<any[]>([]);
    const [selectedSocialIds, setSelectedSocialIds] = useState<string[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<any>({});
    const [socialPreviews, setSocialPreviews] = useState<{file: File, url: string}[]>([]);
    const [draggingId, setDraggingId] = useState<string | null>(null);

    // News Scraping States
    
    // Profeco States
    const [profecoPreviews, setProfecoPreviews] = useState<{data: string, mimeType: string, url: string}[]>([]);
    const [searchCandidates, setSearchCandidates] = useState<any[]>([]);
    const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
    
    // Handlers for steps
    const handleNextStep = () => setCurrentStep(prev => prev + 1);
    
    const handleScrapeUrl = async () => {
        if (!scrapeUrl) return alert("Ingresa la URL de la página web.");
        setIsLoading(true);
        try {
            const res = await fetch('/api/motor-ia/scrape', {
                method: 'POST',
                body: JSON.stringify({ url: scrapeUrl })
            });
            const data = await res.json();
            
            setAgencyData(prev => {
                let inferredYears = prev.antiguedad || 0;
                if (!inferredYears && data.fichaTecnica?.antiguedadDominio) {
                    const domainAge = data.fichaTecnica.antiguedadDominio.toLowerCase();
                    const matchYears = domainAge.match(/(\d+)\s*(año|year)/i);
                    if (matchYears) {
                        inferredYears = parseInt(matchYears[1]);
                    } else if (domainAge.includes('mes') || domainAge.includes('month') || domainAge.includes('día') || domainAge.includes('day')) {
                        inferredYears = 1;
                    } else if (!isNaN(Date.parse(domainAge))) {
                        const creationDate = new Date(domainAge);
                        const ageDifMs = Date.now() - creationDate.getTime();
                        const ageDate = new Date(ageDifMs);
                        const years = Math.abs(ageDate.getUTCFullYear() - 1970);
                        inferredYears = years > 0 ? years : 1;
                    }
                }

                return {
                    ...prev,
                    nombre: data.nombre || prev.nombre,
                    imageUrl: data.imageUrl || prev.imageUrl,
                    imageUrls: data.imageUrls || [],
                    reporteBanderasRojas: data.reporteBanderasRojas || '',
                    fichaTecnica: data.fichaTecnica || prev.fichaTecnica,
                    antiguedad: inferredYears
                };
            });
        } catch (error) {
            console.error(error);
            alert("Error al extraer datos. Verifica que la URL sea válida.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleScrapeNews = async (urlToScrape: string, fallbackText: string = '') => {
        if (!urlToScrape && !fallbackText) return alert("Ingresa un enlace o pega el texto directamente.");
        setIsScrapingNews(true);
        try {
            const res = await fetch('/api/motor-ia/scrape-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    url: urlToScrape, 
                    textoManual: fallbackText,
                    agencyName: agencyData.nombre 
                })
            });
            const data = await res.json();
            
            if (!res.ok) {
                alert(`Error: ${data.error || 'Ocurrió un problema al extraer la noticia.'}`);
                return;
            }

            if (data.warning) {
                alert(`Aviso de IA: ${data.warning}`);
                return;
            }

            const newMention = {
                id: Math.random().toString(36).substring(7),
                url: data.url,
                tituloOriginal: data.tituloOriginal,
                titular: data.titular,
                resumen: data.resumen,
                tono: data.tono,
                severidad: data.severidad
            };

            setAgencyData(prev => ({
                ...prev,
                mencionesWeb: [newMention, ...(prev.mencionesWeb || [])]
            }));

            setManualNewsUrl('');
            setManualNewsText('');
            alert("Noticia procesada y añadida al expediente.");

        } catch (e: any) {
            console.error(e);
            alert("Error de conexión al procesar la noticia.");
        } finally {
            setIsScrapingNews(false);
        }
    };

    const handleDeleteMention = (id: string) => {
        setAgencyData(prev => ({
            ...prev,
            mencionesWeb: prev.mencionesWeb?.filter(m => m.id !== id) || []
        }));
    };

    const handleSaveManualEvidence = () => {
        if (selectedUrls.length === 0) return alert("Selecciona al menos un link como evidencia.");
        
        // Build a Markdown summary of the selected links
        const selectedCandidates = searchCandidates.filter((c: any) => selectedUrls.includes(c.url));
        let manualReport = "**Evidencia Seleccionada Manualmente:**\n\n";
        selectedCandidates.forEach((c: any) => {
            manualReport += `- **[${c.title}](${c.url})**\n  > ${c.snippet}\n\n`;
        });

        setAgencyData(prev => ({ 
            ...prev, 
            controversias: manualReport, 
            controversiasWebUrls: selectedUrls 
        }));
        setSearchCandidates([]);
        handleNextStep();
    };

    const handleAddProfecoImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        handleAddProfecoFiles(files);
    };

    const handleAddProfecoFiles = async (files: File[]) => {
        if (files.length === 0) return;

        for (const file of files) {
            const reader = new FileReader();
            const base64Promise = new Promise<string>((resolve) => {
                reader.onload = (ev) => resolve(ev.target?.result as string);
            });
            reader.readAsDataURL(file);
            const base64 = await base64Promise;
            
            setProfecoPreviews(prev => [...prev, {
                data: base64.split(',')[1],
                mimeType: file.type,
                url: base64
            }]);
        }
    };

    const handleDeleteProfecoPreview = (index: number) => {
        setProfecoPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleProcessProfecoHistory = async () => {
        if (profecoPreviews.length === 0) return alert("Sube al menos una captura de Profeco.");
        setIsLoading(true);
        try {
            const res = await fetch('/api/motor-ia/analyze-profeco', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ images: profecoPreviews.map(p => ({ data: p.data, mimeType: p.mimeType })) })
            });
            const { data, error } = await res.json();
            
            if (error) {
                alert(`Error IA: ${error}`);
                return;
            }

            const savedUrls: string[] = [];
            for (let i = 0; i < profecoPreviews.length; i++) {
                const filename = `profeco_${Date.now()}_${i}`;
                const agencyFolder = agencyData.nombre ? agencyData.nombre.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'desconocida';
                const storageRef = storage.ref(`evidencias/${agencyFolder}/${filename}`);
                await storageRef.putString(profecoPreviews[i].url, 'data_url');
                savedUrls.push(await storageRef.getDownloadURL());
            }

            setAgencyData(prev => ({
                ...prev,
                evidenciasProfeco: savedUrls.map(url => ({ fileUrl: url, extracto: 'Procesado en lote' })),
                dictamenProfeco: data
            }));

        } catch (error) {
            console.error(error);
            alert("Error al procesar el historial de Profeco.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageAnalyze = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setIsLoading(true);
        try {
            for (const file of files) {
                const reader = new FileReader();
                const base64Promise = new Promise<string>((resolve) => {
                    reader.onload = (ev) => resolve(ev.target?.result as string);
                });
                reader.readAsDataURL(file);
                const base64 = await base64Promise;

                // 1. Upload to Firebase Storage
                const filename = `${type}_${Date.now()}`;
                const agencyFolder = agencyData.nombre ? agencyData.nombre.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'desconocida';
                const storageRef = storage.ref(`evidencias/${agencyFolder}/${filename}`);
                await storageRef.putString(base64, 'data_url');
                const downloadUrl = await storageRef.getDownloadURL();

                // 2. Analyze with Gemini
                const res = await fetch('/api/motor-ia/analyze', {
                    method: 'POST',
                    body: JSON.stringify({ imageBase64: base64, type })
                });
                const data = await res.json();
                
                if (type === 'profeco') {
                    setAgencyData(prev => ({
                        ...prev,
                        evidenciasProfeco: [...(prev.evidenciasProfeco || []), { fileUrl: downloadUrl, extracto: data.extracto }]
                    }));
                } else if (type === 'google_rating' || type === 'google_comment') {
                    setAgencyData(prev => ({
                        ...prev,
                        evidenciasGoogle: [...(prev.evidenciasGoogle || []), { fileUrl: downloadUrl, extracto: data.extracto, tipo: type as 'rating' | 'comentario' }]
                    }));
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialMediaAnalyze = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        processSocialMediaFiles(files);
    };

    const processSocialMediaFiles = async (files: File[]) => {
        if (files.length === 0) return;
        const newPreviews: {file: File, url: string}[] = [];
        for (const file of files) {
            const reader = new FileReader();
            const url = await new Promise<string>((resolve) => {
                reader.onload = (ev) => resolve(ev.target?.result as string);
                reader.readAsDataURL(file);
            });
            newPreviews.push({ file, url });
        }
        setSocialPreviews(prev => [...prev, ...newPreviews]);
    };

    const handleDeleteSocialPreview = (index: number) => {
        setSocialPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleAnalyzeSocialPreviews = async () => {
        if (socialPreviews.length === 0) return;
        setIsLoading(true);
        try {
            for (const preview of socialPreviews) {
                const base64 = preview.url;
                
                const filename = `social_${Date.now()}`;
                const agencyFolder = agencyData.nombre ? agencyData.nombre.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'desconocida';
                const storageRef = storage.ref(`evidencias/${agencyFolder}/${filename}`);
                await storageRef.putString(base64, 'data_url');
                const downloadUrl = await storageRef.getDownloadURL();

                const res = await fetch('/api/motor-ia/analyze', {
                    method: 'POST',
                    body: JSON.stringify({ imageBase64: base64, type: 'redes_sociales' })
                });
                const result = await res.json();
                
                if (result.data) {
                    let newCandidates: any[] = [];
                    if (Array.isArray(result.data)) {
                        newCandidates = result.data.map((item: any) => ({
                            id: Math.random().toString(36).substring(7),
                            redSocial: socialNetwork,
                            fileUrl: downloadUrl,
                            esPostPrincipal: item.tipo === 'post',
                            fechaStr: item.fechaStr || 'SIN FECHA',
                            resenaGenerada: {
                                autorSimulado: item.autorSimulado,
                                textoExtracto: item.textoExtracto,
                                calificacion: item.calificacion,
                                rol: item.rol || 'Usuario Anonimizado'
                            },
                            replies: item.respuestas ? item.respuestas.map((r: any) => ({
                                id: Math.random().toString(36).substring(7),
                                redSocial: socialNetwork,
                                fileUrl: downloadUrl,
                                esPostPrincipal: r.tipo === 'post',
                                fechaStr: r.fechaStr || 'SIN FECHA',
                                resenaGenerada: {
                                    autorSimulado: r.autorSimulado,
                                    textoExtracto: r.textoExtracto,
                                    calificacion: r.calificacion,
                                    rol: r.rol || 'Usuario Anonimizado'
                                },
                                replies: []
                            })) : []
                        }));
                    } else {
                        newCandidates = [{
                            id: Math.random().toString(36).substring(7),
                            redSocial: socialNetwork,
                            fileUrl: downloadUrl,
                            esPostPrincipal: result.data.tipo === 'post',
                            fechaStr: result.data.fechaStr || 'SIN FECHA',
                            resenaGenerada: { ...result.data, rol: result.data.rol || 'Usuario Anonimizado' },
                            replies: []
                        }];
                    }
                    
                    setSocialCandidates(prev => [...prev, ...newCandidates]);
                    setSelectedSocialIds(prev => [...prev, ...newCandidates.map(c => c.id)]);
                }
            }
            setSocialPreviews([]); // Clean up after processing
        } catch (error) {
            console.error(error);
            alert("Error al extraer información de la red social.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleFinalSave = async () => {
        setIsLoading(true);
        try {
            const finalData = { ...agencyData };
            const uploadedScreenshotUrls: string[] = [];

            // 1. Process Base64 Website Screenshots
            if (finalData.imageUrls && finalData.imageUrls.length > 0) {
                const agencyFolder = finalData.nombre ? finalData.nombre.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'desconocida';
                for (let i = 0; i < finalData.imageUrls.length; i++) {
                    let base64 = finalData.imageUrls[i];
                    if (!base64.startsWith('data:image')) {
                        base64 = `data:image/png;base64,${base64}`;
                    }
                    const filename = `website_screenshot_${Date.now()}_${i}`;
                    const storageRef = storage.ref(`evidencias/${agencyFolder}/${filename}`);
                    await storageRef.putString(base64, 'data_url');
                    const url = await storageRef.getDownloadURL();
                    uploadedScreenshotUrls.push(url);
                }
                finalData.websiteScreenshotsUrls = uploadedScreenshotUrls;
                delete finalData.imageUrls; // Clean up heavy data
            }
            
            // 2. Clean up old Google evidence if any was cached
            if ((finalData as any).evidenciasGoogle) {
                delete (finalData as any).evidenciasGoogle;
            }

            onComplete(finalData);
        } catch (error) {
            console.error("Error guardando datos finales:", error);
            alert("Hubo un error guardando las imágenes web finales.");
            setIsLoading(false);
        }
    };

    const onDragEnd = (result: DropResult) => {
        setDraggingId(null);
        const { source, destination } = result;
        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        let newList = [...socialCandidates];
        let draggedItem: any;

        const sourceDroppableId = source.droppableId;
        const destDroppableId = destination.droppableId;
        
        // 1. Encontrar y remover el item de la fuente
        if (sourceDroppableId === 'ROOT') {
            draggedItem = newList[source.index];
            newList.splice(source.index, 1);
        } else {
            const parentId = sourceDroppableId.replace('reply-dropzone-', '');
            const parentIdx = newList.findIndex(c => c.id === parentId);
            if (parentIdx !== -1 && newList[parentIdx].replies) {
                draggedItem = newList[parentIdx].replies[source.index];
                newList[parentIdx] = { ...newList[parentIdx], replies: [...newList[parentIdx].replies] };
                newList[parentIdx].replies.splice(source.index, 1);
            }
        }

        if (!draggedItem) return;

        // 2. Insertar en el destino (comportamiento normal)
        if (destDroppableId === 'ROOT') {
            draggedItem.esPostPrincipal = true;
            newList.splice(destination.index, 0, draggedItem);
        } else {
            const parentId = destDroppableId.replace('reply-dropzone-', '');
            const parentIdx = newList.findIndex(c => c.id === parentId);
            if (parentIdx !== -1) {
                // APLANAMIENTO (FLATTENING)
                let flattenedReplies: any[] = [];
                if (draggedItem.replies && draggedItem.replies.length > 0) {
                    flattenedReplies = draggedItem.replies;
                    draggedItem.replies = [];
                }
                draggedItem.esPostPrincipal = false;

                newList[parentIdx] = { ...newList[parentIdx], replies: [...(newList[parentIdx].replies || [])] };
                // Insertar el item principal en la posicion de drop
                newList[parentIdx].replies.splice(destination.index, 0, draggedItem);
                
                // Insertar los comentarios aplanados inmediatamente despues
                if (flattenedReplies.length > 0) {
                    const formattedFlattened = flattenedReplies.map((r: any) => ({...r, esPostPrincipal: false}));
                    newList[parentIdx].replies.splice(destination.index + 1, 0, ...formattedFlattened);
                }
            } else {
                newList.push(draggedItem);
            }
        }

        setSocialCandidates(newList);
    };

    const handleDeleteSocial = (id: string) => {
        setSocialCandidates(prev => {
            let newList = [...prev];
            const rootIdx = newList.findIndex(c => c.id === id);
            if (rootIdx !== -1) {
                const item = newList[rootIdx];
                newList.splice(rootIdx, 1);
                if (item.replies && item.replies.length > 0) {
                    newList.push(...item.replies);
                }
                return newList;
            }
            return newList.map(c => {
                if (c.replies) {
                    return { ...c, replies: c.replies.filter((r: any) => r.id !== id) };
                }
                return c;
            });
        });
        setSelectedSocialIds(prev => prev.filter(selId => selId !== id));
    };

    const startEditing = (item: any) => {
        setEditingId(item.id);
        setEditForm({
            autorSimulado: item.resenaGenerada.autorSimulado,
            textoExtracto: item.resenaGenerada.textoExtracto,
            calificacion: item.resenaGenerada.calificacion,
            rol: item.resenaGenerada.rol || 'Usuario Anonimizado'
        });
    };

    const saveEditing = (id: string) => {
        setSocialCandidates(prev => prev.map(c => {
            if (c.id === id) {
                return { ...c, resenaGenerada: { ...c.resenaGenerada, ...editForm } };
            }
            if (c.replies) {
                return {
                    ...c,
                    replies: c.replies.map((r: any) => r.id === id ? { ...r, resenaGenerada: { ...r.resenaGenerada, ...editForm } } : r)
                };
            }
            return c;
        }));
        setEditingId(null);
    };

    useEffect(() => {
        const handleGlobalPaste = (e: ClipboardEvent) => {
            if (currentStep !== 2 && currentStep !== 3) return; // Sólo en Profeco o Redes Sociales
            if (isLoading) return; // Prevenir múltiples llamadas si ya está cargando
            
            const files = Array.from(e.clipboardData?.files || []).filter(f => f.type.startsWith('image/'));
            if (files.length > 0) {
                e.preventDefault();
                if (currentStep === 2) {
                    handleAddProfecoFiles(files);
                } else if (currentStep === 3) {
                    processSocialMediaFiles(files);
                }
            }
        };

        window.addEventListener('paste', handleGlobalPaste);
        return () => window.removeEventListener('paste', handleGlobalPaste);
    }, [currentStep, agencyData, socialNetwork, isLoading]);

    const handleSaveSocialEvidence = () => {
        if (selectedSocialIds.length === 0) return alert("Selecciona al menos un elemento.");
        const selected = socialCandidates.filter(c => selectedSocialIds.includes(c.id));
        
        // Transform orphans into main posts
        const processedSelected = selected.map(c => {
            if (!c.esPostPrincipal) {
                c.esPostPrincipal = true;
            }
            return c;
        });
        
        setAgencyData(prev => ({
            ...prev,
            evidenciasSociales: [...(prev.evidenciasSociales || []), ...processedSelected]
        }));
        
        setSocialCandidates([]);
        setSelectedSocialIds([]);
    };

    return (
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 max-w-4xl mx-auto my-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-slate-900">Motor de Investigación IA</h2>
                <div className="text-sm font-bold text-slate-400">Paso {currentStep + 1} de 6</div>
            </div>

            {/* PROGRESS BAR */}
            <div className="w-full bg-slate-100 h-2 rounded-full mb-8">
                <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: (((currentStep + 1) / 6) * 100) + '%' }}></div>
            </div>

            {/* STEP 0: Extractor */}
            {currentStep === 0 && (
                <div className="space-y-6 animate-fade-in">
                    <h3 className="text-xl font-bold flex items-center gap-2"><GlobeIcon className="w-6 h-6 text-blue-500"/> Extractor Mágico (Scraping)</h3>
                    <p className="text-slate-500">Pega el link de la página oficial o Facebook para pre-llenar los datos.</p>
                    <div className="flex gap-2">
                        <input type="text" value={scrapeUrl} onChange={e => setScrapeUrl(e.target.value)} placeholder="https://..." className="flex-1 p-3 border rounded-xl" />
                        <button onClick={handleScrapeUrl} className="bg-slate-900 text-white px-6 rounded-xl font-bold hover:bg-slate-800 transition">
                            {isLoading ? <SpinnerIcon className="w-5 h-5 animate-spin"/> : 'Extraer'}
                        </button>
                    </div>
                    
                    {agencyData.fichaTecnica && (
                        <div className="mt-6 bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 animate-fade-in">
                            <h4 className="font-black text-slate-800 text-lg flex items-center gap-2">
                                <DocumentIcon className="w-5 h-5 text-blue-500" />
                                Ficha Técnica & Análisis Visual
                            </h4>
                            
                            {agencyData.fichaTecnica.alertaAntiguedad && (
                                <div className="bg-red-100 border border-red-300 text-red-800 p-4 rounded-xl flex items-start gap-3">
                                    <ShieldCheckIcon className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-red-900">¡ALERTA DE CONTRADICCIÓN!</p>
                                        <p className="text-sm">{agencyData.fichaTecnica.alertaAntiguedad}</p>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Columna Izquierda: Captura Visual */}
                                <div className="lg:col-span-1 flex flex-col space-y-3">
                                    {agencyData.imageUrls && agencyData.imageUrls.length > 0 ? (
                                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                            {agencyData.imageUrls.map((url: string, idx: number) => (
                                                <div key={idx} className="rounded-xl overflow-hidden border border-slate-300 shadow-sm relative group">
                                                    <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wider backdrop-blur-sm z-10">Captura {idx + 1}</div>
                                                    <img src={url} alt={`Screenshot ${idx+1}`} className="w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                                </div>
                                            ))}
                                        </div>
                                    ) : agencyData.fichaTecnica.websiteScreenshot ? (
                                        <div className="rounded-xl overflow-hidden border border-slate-300 shadow-sm relative group">
                                            <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wider backdrop-blur-sm z-10">Captura en Vivo</div>
                                            <img src={agencyData.fichaTecnica.websiteScreenshot} alt="Screenshot" className="w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                        </div>
                                    ) : (
                                        <div className="h-40 bg-slate-200 rounded-xl flex items-center justify-center border border-slate-300">
                                            <span className="text-slate-400 font-bold text-sm">Sin captura disponible</span>
                                        </div>
                                    )}
                                    
                                    {agencyData.fichaTecnica.analisisVisual && (
                                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                                            <h5 className="font-bold text-blue-900 text-xs uppercase tracking-wider mb-1">Veredicto Visual (IA)</h5>
                                            <p className="text-sm text-blue-800">{agencyData.fichaTecnica.analisisVisual}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Columna Derecha: Datos Estructurados */}
                                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm content-start">
                                    <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm"><span className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Teléfono</span> <span className="font-medium text-slate-800 break-all">{agencyData.fichaTecnica.telefono || 'No encontrado'}</span></div>
                                    <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm"><span className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Email</span> <span className="font-medium text-slate-800 break-all">{agencyData.fichaTecnica.email || 'No encontrado'}</span></div>
                                    <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm md:col-span-2"><span className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Dirección</span> <span className="font-medium text-slate-800">{agencyData.fichaTecnica.direccion || 'No encontrada'}</span></div>
                                    <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm"><span className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">RFC/Razón Social</span> <span className="font-medium text-slate-800">{agencyData.fichaTecnica.rfc || 'No encontrado'}</span></div>
                                    <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm"><span className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Aviso Privacidad</span> <span className="font-medium text-slate-800">{agencyData.fichaTecnica.tieneAvisoPrivacidad ? '✔️ Sí tiene' : '❌ No encontrado'}</span></div>
                                    <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm"><span className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Edad del Dominio</span> <span className="font-medium text-slate-800">{agencyData.fichaTecnica.antiguedadDominio || 'Desconocida'}</span></div>
                                    <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm"><span className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Edad Reclamada</span> <span className="font-medium text-slate-800">{agencyData.fichaTecnica.antiguedadReclamada || 'No especifican'}</span></div>
                                </div>
                            </div>

                            {agencyData.reporteBanderasRojas && (
                                <div className="mt-6 bg-red-50 p-5 rounded-xl border border-red-200">
                                    <h4 className="font-black text-red-800 text-lg flex items-center gap-2 mb-3">
                                        <ShieldCheckIcon className="w-5 h-5 text-red-600" />
                                        Auditoría Forense de Banderas Rojas (Páginas Internas)
                                    </h4>
                                    <div className="text-sm text-red-900 leading-relaxed whitespace-pre-wrap prose prose-sm max-w-none prose-p:text-red-900 prose-li:text-red-900 prose-strong:text-red-950">
                                        {agencyData.reporteBanderasRojas}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    
                    <div className="bg-slate-50 p-4 rounded-xl space-y-4">
                        <div><label className="text-xs font-bold text-slate-500">Nombre Oficial</label><input type="text" value={agencyData.nombre || ''} onChange={e => setAgencyData({...agencyData, nombre: e.target.value})} className="w-full p-2 border rounded-lg mt-1"/></div>
                        <div><label className="text-xs font-bold text-slate-500">Años de Antigüedad (Manual)</label><input type="number" min="0" value={agencyData.antiguedad || ''} onChange={e => setAgencyData({...agencyData, antiguedad: parseInt(e.target.value) || 0})} placeholder="Ej. 5 (Deja vacío para auto-calcular)" className="w-full p-2 border rounded-lg mt-1"/></div>
                        <div><label className="text-xs font-bold text-slate-500">Logo URL</label><input type="text" value={agencyData.imageUrl || ''} onChange={e => setAgencyData({...agencyData, imageUrl: e.target.value})} className="w-full p-2 border rounded-lg mt-1"/></div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 border-t pt-4">
                            <label className="flex items-center gap-3 p-3 bg-white border rounded-lg cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={agencyData.contrato || false} 
                                    onChange={e => setAgencyData({...agencyData, contrato: e.target.checked})} 
                                    className="w-5 h-5 text-blue-600 rounded"
                                />
                                <div className="flex flex-col">
                                    <span className="font-bold text-sm text-slate-800">Contrato de Adhesión (PROFECO)</span>
                                    <span className="text-[10px] text-slate-500">Marcar si tiene contrato registrado</span>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 p-3 bg-white border rounded-lg cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={!agencyData.fichaTecnica?.equipoDirectivoOculto} 
                                    onChange={e => setAgencyData({
                                        ...agencyData, 
                                        fichaTecnica: {
                                            ...(agencyData.fichaTecnica || {} as any), 
                                            equipoDirectivoOculto: !e.target.checked
                                        }
                                    })} 
                                    className="w-5 h-5 text-blue-600 rounded"
                                />
                                <div className="flex flex-col">
                                    <span className="font-bold text-sm text-slate-800">Equipo Directivo Público</span>
                                    <span className="text-[10px] text-slate-500">Marcar si son visibles en la web</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="border-t pt-4 flex justify-end gap-2">
                        <button onClick={onCancel} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-lg">Cancelar</button>
                        <button onClick={handleNextStep} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg flex items-center gap-2"><CheckCircleIcon className="w-5 h-5"/> Aprobar y Continuar</button>
                    </div>
                </div>
            )}

            {/* STEP 1: SAT */}
            {currentStep === 1 && (
                <div className="space-y-6 animate-fade-in">
                    <h3 className="text-xl font-bold flex items-center gap-2"><ShieldCheckIcon className="w-6 h-6 text-green-500"/> Estatus Fiscal (SAT)</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-bold text-slate-700 block mb-2">Estado en el SAT</label>
                            <select value={agencyData.rfcStatus || 'desconocido'} onChange={e => setAgencyData({...agencyData, rfcStatus: e.target.value})} className="w-full p-3 border rounded-xl bg-slate-50">
                                <option value="activo">Activo (+ Score)</option>
                                <option value="inactivo">Inactivo (- Score)</option>
                                <option value="desconocido">Desconocido (Neutral)</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="border-t pt-4 flex justify-between">
                        <button onClick={() => setCurrentStep(0)} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-lg">Atrás</button>
                        <button onClick={handleNextStep} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg flex items-center gap-2"><CheckCircleIcon className="w-5 h-5"/> Aprobar y Continuar</button>
                    </div>
                </div>
            )}

            {/* STEP 2: Profeco */}
            {currentStep === 2 && (
                <div className="space-y-6 animate-fade-in">
                    <h3 className="text-xl font-bold flex items-center gap-2"><ShieldCheckIcon className="w-6 h-6 text-slate-700"/> Evidencia Profeco</h3>
                    <p className="text-slate-500 text-sm">Ingresa el enlace directo al perfil de Profeco y sube capturas del Buró Comercial. La IA analizará todo para generar un reporte consolidado.</p>
                    
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">Enlace Directo a Profeco</label>
                        <input 
                            type="url" 
                            placeholder="https://burocomercial.profeco.gob.mx/..." 
                            value={agencyData.urlProfeco || ''} 
                            onChange={e => setAgencyData({...agencyData, urlProfeco: e.target.value})} 
                            className="w-full p-3 border rounded-xl bg-white shadow-sm"
                        />
                    </div>

                    {!agencyData.dictamenProfeco && (
                        <>
                            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:bg-slate-100 transition bg-white">
                                <input type="file" id="profeco-upload" multiple className="hidden" onChange={handleAddProfecoImages} accept="image/*" />
                                <label htmlFor="profeco-upload" className="cursor-pointer flex flex-col items-center">
                                    <UploadIcon className="w-10 h-10 text-slate-400 mb-4"/>
                                    <span className="font-bold text-slate-700">Subir capturas de Profeco</span>
                                    <span className="text-xs text-slate-500 mt-2">Puedes subir imágenes de varios años juntas.</span>
                                </label>
                            </div>
                        </>
                    )}

                    {profecoPreviews.length > 0 && (
                        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                            <h4 className="font-bold text-slate-800 text-sm mb-3 flex justify-between items-center">
                                <span>Imágenes Listas para Analizar ({profecoPreviews.length}):</span>
                                <button onClick={() => setProfecoPreviews([])} className="text-xs text-red-500 hover:text-red-700">Limpiar Todo</button>
                            </h4>
                            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                                {profecoPreviews.map((p, i) => (
                                    <div key={i} className="relative group flex-shrink-0">
                                        <img src={p.url} alt={`Preview ${i}`} className="w-24 h-24 object-cover rounded-lg border border-slate-300 shadow-sm" />
                                        <button onClick={() => handleDeleteProfecoPreview(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs shadow-md opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                                    </div>
                                ))}
                            </div>
                            <button 
                                onClick={handleProcessProfecoHistory} 
                                disabled={isLoading}
                                className="w-full py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition flex justify-center items-center gap-2 mt-2"
                            >
                                {isLoading ? <SpinnerIcon className="w-5 h-5 animate-spin"/> : <ShieldCheckIcon className="w-5 h-5"/>}
                                Generar Reporte Profeco (IA)
                            </button>
                        </div>
                    )}

                    {agencyData.dictamenProfeco && (
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                            <div className="flex justify-between items-start mb-4 border-b pb-4">
                                <div>
                                    <h4 className="font-black text-slate-800 text-lg flex items-center gap-2 mb-1">
                                        Reporte Profeco Consolidado
                                    </h4>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Período analizado: {agencyData.dictamenProfeco.anosDetectados}</p>
                                </div>
                                <button onClick={() => setAgencyData({...agencyData, dictamenProfeco: undefined})} className="text-xs font-bold text-blue-600 hover:text-blue-800">Rehacer Análisis</button>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center justify-center">
                                    <div className="text-3xl font-black text-slate-800">{agencyData.dictamenProfeco.totalQuejas}</div>
                                    <div className="text-xs font-bold text-slate-500 text-center mt-1">QUEJAS TOTALES</div>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center justify-center">
                                    <div className="text-3xl font-black text-slate-800">{agencyData.dictamenProfeco.tasaResolucion}</div>
                                    <div className="text-xs font-bold text-slate-500 text-center mt-1">TASA RESOLUCIÓN</div>
                                </div>
                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex flex-col justify-center">
                                    <div className="text-[10px] font-bold text-blue-800 uppercase tracking-wider mb-1">Dictamen Forense</div>
                                    <div className="text-xs font-medium text-blue-900 leading-tight">
                                        "{agencyData.dictamenProfeco.veredictoEnganche}"
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h5 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                                    <div className="w-1.5 h-4 bg-indigo-500 rounded-full"></div>
                                    Motivos de Reclamación Detectados
                                </h5>
                                <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
                                    <ul className="space-y-2">
                                        {agencyData.dictamenProfeco.motivosPrincipales.map((m, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                                <span className="text-slate-400 mt-0.5">•</span>
                                                {m}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="border-t pt-4 flex justify-between">
                        <button onClick={() => setCurrentStep(1)} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-lg">Atrás</button>
                        <button onClick={handleNextStep} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg flex items-center gap-2"><CheckCircleIcon className="w-5 h-5"/> Aprobar Análisis</button>
                    </div>
                </div>
            )}

            {/* STEP 3: Redes Sociales (Radar Social) */}
            {currentStep === 3 && (
                <div className="space-y-6 animate-fade-in">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-pink-600">
                        <GlobeIcon className="w-6 h-6 text-pink-500"/> Evidencia de Redes Sociales
                    </h3>
                    <p className="text-slate-500 text-sm">Sube capturas de quejas en Facebook, X, etc. La IA las transcribirá y las inyectará al foro como reseñas.</p>
                    
                    {socialCandidates.length === 0 && (
                        <div className="flex flex-col sm:flex-row gap-4 bg-pink-50 p-4 rounded-2xl border border-pink-100">
                            <div className="flex-1">
                                <label className="text-xs font-bold text-pink-800 uppercase tracking-wider mb-2 block">Red Social Origen</label>
                                <select value={socialNetwork} onChange={e => setSocialNetwork(e.target.value)} className="w-full p-3 border border-pink-200 rounded-xl bg-white shadow-sm">
                                    <option value="Facebook">Facebook</option>
                                    <option value="X (Twitter)">X (Twitter)</option>
                                    <option value="Instagram">Instagram</option>
                                    <option value="TikTok">TikTok</option>
                                    <option value="LinkedIn">LinkedIn</option>
                                    <option value="Google Maps">Google Maps</option>
                                    <option value="Otro">Otro Foro/Red</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {socialCandidates.length === 0 && (
                        <div className="border-2 border-dashed border-pink-300 bg-white rounded-2xl p-8 text-center hover:bg-pink-50 transition">
                            <input type="file" id="social-upload" multiple className="hidden" onChange={handleSocialMediaAnalyze} accept="image/*" />
                            <label htmlFor="social-upload" className="cursor-pointer flex flex-col items-center">
                                <UploadIcon className="w-10 h-10 text-pink-400 mb-4"/>
                                <span className="font-bold text-pink-700">Seleccionar capturas de {socialNetwork}</span>
                                <span className="text-xs text-slate-500 mt-2">También puedes pegar imágenes directamente con Ctrl+V</span>
                            </label>
                        </div>
                    )}

                    {socialPreviews.length > 0 && (
                        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                            <h4 className="font-bold text-slate-800 text-sm mb-3 flex justify-between items-center">
                                <span>Capturas Listas para Extraer ({socialPreviews.length}):</span>
                                <button onClick={() => setSocialPreviews([])} className="text-xs text-red-500 hover:text-red-700">Limpiar Todo</button>
                            </h4>
                            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                                {socialPreviews.map((p, i) => (
                                    <div key={i} className="relative group flex-shrink-0">
                                        <img src={p.url} alt={`Preview ${i}`} className="w-24 h-24 object-cover rounded-lg border border-slate-300 shadow-sm" />
                                        <button onClick={() => handleDeleteSocialPreview(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs shadow-md opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                                    </div>
                                ))}
                            </div>
                            <button 
                                onClick={handleAnalyzeSocialPreviews} 
                                disabled={isLoading}
                                className="w-full py-3 bg-pink-600 text-white font-bold rounded-xl hover:bg-pink-700 transition flex justify-center items-center gap-2 mt-2"
                            >
                                {isLoading ? <SpinnerIcon className="w-5 h-5 animate-spin"/> : <SearchIcon className="w-5 h-5"/>}
                                Analizar y Extraer Posts (IA)
                            </button>
                        </div>
                    )}

                    {socialCandidates.length > 0 && (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 animate-fade-in space-y-4">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-3">
                                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                    <CheckCircleIcon className="w-5 h-5 text-pink-500" /> Constructor de Hilos
                                </h4>
                                <div className="flex items-center gap-2 bg-pink-100 p-1.5 rounded-xl border border-pink-200">
                                    <select value={socialNetwork} onChange={e => setSocialNetwork(e.target.value)} className="p-1.5 rounded-lg border-none text-xs font-bold text-pink-800 bg-transparent outline-none cursor-pointer">
                                        <option value="Facebook">Facebook</option>
                                        <option value="X (Twitter)">X</option>
                                        <option value="Instagram">Instagram</option>
                                        <option value="TikTok">TikTok</option>
                                        <option value="LinkedIn">LinkedIn</option>
                                        <option value="Google Maps">Google Maps</option>
                                        <option value="Otro">Otro Foro</option>
                                    </select>
                                    <label htmlFor="social-upload-more" style={{ backgroundColor: '#db2777', color: 'white' }} className="cursor-pointer text-xs font-bold shadow-md hover:bg-pink-700 hover:shadow-lg px-4 py-2 rounded-lg transition-all flex items-center gap-2 uppercase tracking-wide">
                                        <UploadIcon className="w-5 h-5 text-white" /> SUBIR MÁS
                                        <input type="file" id="social-upload-more" multiple className="hidden" onChange={handleSocialMediaAnalyze} accept="image/*" />
                                    </label>
                                </div>
                            </div>
                            
                            <DragDropContext 
                                onDragStart={(start) => setDraggingId(start.draggableId)}
                                onDragEnd={onDragEnd}
                            >
                                <Droppable droppableId="ROOT" type="POST">
                                    {(provided, snapshot) => (
                                        <div 
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className={`space-y-4 min-h-[100px] max-h-[600px] overflow-y-auto pr-2 custom-scrollbar p-2 rounded-xl transition-colors ${snapshot.isDraggingOver ? 'bg-pink-50 border-2 border-dashed border-pink-300' : ''}`}
                                        >
                                            {snapshot.isDraggingOver && socialCandidates.length > 0 && (
                                                <div className="text-center text-sm font-bold text-pink-500 py-3 border-2 border-dashed border-pink-300 rounded-xl bg-white mb-4">
                                                    ¡Suelta aquí para desanidar a la raíz!
                                                </div>
                                            )}
                                            
                                            {socialCandidates.map((c, i) => (
                                                <Draggable key={c.id} draggableId={c.id} index={i}>
                                                    {(provided, snapshot) => (
                                                        <div 
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            className={`bg-white rounded-xl border-2 transition-all shadow-sm overflow-hidden ${snapshot.isDragging ? 'border-pink-500 shadow-xl z-50 scale-105' : 'border-slate-200'}`}
                                                            style={provided.draggableProps.style}
                                                        >
                                                            <div className="flex items-start gap-4 p-4 hover:bg-slate-50 transition relative bg-white">
                                                                <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing pt-1 text-slate-300 hover:text-pink-500 flex items-center justify-center h-full px-1" title="Arrastrar">⋮⋮</div>
                                                                <input 
                                                                    type="checkbox" 
                                                                    className="mt-1 w-5 h-5 text-pink-600 rounded border-slate-300 focus:ring-pink-500 cursor-pointer"
                                                                    checked={selectedSocialIds.includes(c.id)}
                                                                    onChange={(e) => {
                                                                        if (e.target.checked) setSelectedSocialIds(prev => [...prev, c.id]);
                                                                        else setSelectedSocialIds(prev => prev.filter(id => id !== c.id));
                                                                    }}
                                                                />
                                                                <div className="flex-1">
                                                                    <div className="flex justify-between items-start mb-1">
                                                                        <span className="font-bold text-slate-800 flex items-center gap-2">
                                                                            {editingId === c.id ? (
                                                                                <div className="flex gap-2">
                                                                                    <input type="text" className="border rounded px-2 py-1 text-sm font-bold w-24" value={editForm.autorSimulado} onChange={e => setEditForm({...editForm, autorSimulado: e.target.value})} />
                                                                                    <select className="border rounded px-1 text-sm font-normal bg-white" value={editForm.rol || 'Usuario Anonimizado'} onChange={e => setEditForm({...editForm, rol: e.target.value})}>
                                                                                        <option value="Usuario Anonimizado">Usuario Anonimizado</option>
                                                                                        <option value="Inmobiliaria">Inmobiliaria</option>
                                                                                    </select>
                                                                                </div>
                                                                            ) : (
                                                                                <>
                                                                                    {c.resenaGenerada.autorSimulado}
                                                                                    <span className={`text-[10px] font-bold text-white px-2 py-0.5 rounded-md uppercase tracking-wider ${c.resenaGenerada.rol === 'Inmobiliaria' ? 'bg-blue-600' : 'bg-slate-400'}`}>
                                                                                        {c.resenaGenerada.rol || 'Usuario Anonimizado'}
                                                                                    </span>
                                                                                </>
                                                                            )}
                                                                            <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Vía {c.redSocial}</span>
                                                                        </span>
                                                                        <div className="flex items-center gap-3">
                                                                            {editingId === c.id ? (
                                                                                <select className="border rounded px-1 text-sm bg-white" value={editForm.calificacion} onChange={e => setEditForm({...editForm, calificacion: parseInt(e.target.value)})}>
                                                                                    <option value={0}>Neutro</option>
                                                                                    <option value={1}>1 Estrella</option>
                                                                                    <option value={2}>2 Estrellas</option>
                                                                                    <option value={3}>3 Estrellas</option>
                                                                                    <option value={4}>4 Estrellas</option>
                                                                                    <option value={5}>5 Estrellas</option>
                                                                                </select>
                                                                            ) : (
                                                                                c.resenaGenerada.calificacion === 0 
                                                                                    ? <span className="text-slate-400 font-bold text-xs uppercase bg-slate-100 px-2 py-0.5 rounded-full">Neutro</span> 
                                                                                    : <span className="text-yellow-500 font-bold">★ {c.resenaGenerada.calificacion}</span>
                                                                            )}
                                                                            
                                                                            <div className="flex gap-1 ml-2 opacity-30 hover:opacity-100 transition">
                                                                                {editingId === c.id ? (
                                                                                    <button onClick={() => saveEditing(c.id)} className="text-green-600 font-bold text-xs">Guardar</button>
                                                                                ) : (
                                                                                    <>
                                                                                        <button onClick={() => startEditing(c)} className="text-blue-500" title="Editar">✎</button>
                                                                                        <button onClick={() => handleDeleteSocial(c.id)} className="text-red-500" title="Eliminar">🗑</button>
                                                                                    </>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    {editingId === c.id ? (
                                                                        <textarea className="w-full border rounded p-2 text-sm mt-2" rows={2} value={editForm.textoExtracto} onChange={e => setEditForm({...editForm, textoExtracto: e.target.value})} />
                                                                    ) : <p className="text-sm text-slate-600 italic mt-2">"{c.resenaGenerada.textoExtracto}"</p>}
                                                                    
                                                                    {/* Quick Action para anidar si falla D&D */}
                                                                    {i > 0 && !snapshot.isDragging && (
                                                                        <button 
                                                                            onClick={() => {
                                                                                const prevPost = socialCandidates[i-1];
                                                                                const newList = [...socialCandidates];
                                                                                const item = newList.splice(i, 1)[0];
                                                                                item.esPostPrincipal = false;
                                                                                newList[i-1] = { ...newList[i-1], replies: [...(newList[i-1].replies || []), item] };
                                                                                setSocialCandidates(newList);
                                                                            }}
                                                                            className="text-xs text-pink-500 hover:text-pink-700 font-bold flex items-center gap-1 mt-2 opacity-0 hover:opacity-100 transition-opacity absolute bottom-2 right-2"
                                                                            title="Anidar debajo del post anterior"
                                                                        >
                                                                            ↳ Anidar
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Nested Replies */}
                                                            <Droppable droppableId={`reply-dropzone-${c.id}`} type="POST" isDropDisabled={draggingId === c.id}>
                                                                {(provided, snapshot) => (
                                                                    <div 
                                                                        {...provided.droppableProps}
                                                                        ref={provided.innerRef}
                                                                        className="ml-4 pl-3 border-l-2 border-pink-100 space-y-2 mt-2 min-h-[50px]"
                                                                    >
                                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hilos Detectados</span>
                                                                        {c.replies && c.replies.map((reply: any, rIdx: number) => (
                                                                            <Draggable key={reply.id} draggableId={reply.id} index={rIdx}>
                                                                                {(provided, snapshot) => (
                                                                                    <div 
                                                                                        ref={provided.innerRef}
                                                                                        {...provided.draggableProps}
                                                                                        style={provided.draggableProps.style}
                                                                                        className={`relative bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3 hover:border-pink-300 transition ${snapshot.isDragging ? 'shadow-xl border-pink-500 z-50 scale-105' : ''}`}
                                                                                    >
                                                                                        <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-pink-500 pt-1 px-1" title="Arrastrar para desanidar">⋮⋮</div>
                                                                                        <div className="flex-1">
                                                                                            <div className="flex justify-between items-start mb-1">
                                                                                                <span className="font-bold text-slate-700 text-sm flex items-center gap-2">
                                                                                                    {editingId === reply.id ? (
                                                                                                        <div className="flex gap-2">
                                                                                                            <input type="text" className="border rounded px-2 py-1 text-sm font-bold w-24" value={editForm.autorSimulado} onChange={e => setEditForm({...editForm, autorSimulado: e.target.value})} />
                                                                                                            <select className="border rounded px-1 text-xs font-normal bg-white" value={editForm.rol || 'Usuario Anonimizado'} onChange={e => setEditForm({...editForm, rol: e.target.value})}>
                                                                                                                <option value="Usuario Anonimizado">Usuario Anonimizado</option>
                                                                                                                <option value="Inmobiliaria">Inmobiliaria</option>
                                                                                                            </select>
                                                                                                        </div>
                                                                                                    ) : (
                                                                                                        <>
                                                                                                            {reply.resenaGenerada.autorSimulado}
                                                                                                            <span className={`text-[9px] font-bold text-white px-1.5 py-0.5 rounded-md uppercase tracking-wider ${reply.resenaGenerada.rol === 'Inmobiliaria' ? 'bg-blue-600' : 'bg-slate-400'}`}>
                                                                                                                {reply.resenaGenerada.rol || 'Usuario Anonimizado'}
                                                                                                            </span>
                                                                                                        </>
                                                                                                    )}
                                                                                                </span>
                                                                                                <div className="flex items-center gap-2">
                                                                                                    {editingId === reply.id ? (
                                                                                                        <select className="border rounded px-1 text-xs bg-white" value={editForm.calificacion} onChange={e => setEditForm({...editForm, calificacion: parseInt(e.target.value)})}>
                                                                                                            <option value={0}>Neutro</option>
                                                                                                            <option value={1}>1 Estrella</option>
                                                                                                            <option value={2}>2 Estrellas</option>
                                                                                                            <option value={3}>3 Estrellas</option>
                                                                                                            <option value={4}>4 Estrellas</option>
                                                                                                            <option value={5}>5 Estrellas</option>
                                                                                                        </select>
                                                                                                    ) : (
                                                                                                        reply.resenaGenerada.calificacion === 0 
                                                                                                            ? <span className="text-slate-400 font-bold text-[10px] uppercase bg-slate-100 px-2 py-0.5 rounded-full">Neutro</span> 
                                                                                                            : <span className="text-yellow-500 font-bold text-xs">★ {reply.resenaGenerada.calificacion}</span>
                                                                                                    )}
                                                                                                    <div className="flex gap-1 ml-2 opacity-30 hover:opacity-100 transition">
                                                                                                        {editingId === reply.id ? (
                                                                                                            <button onClick={() => saveEditing(reply.id)} className="text-green-600 font-bold text-xs">OK</button>
                                                                                                        ) : (
                                                                                                            <>
                                                                                                                <button onClick={() => startEditing(reply)} className="text-blue-500 text-xs" title="Editar">✎</button>
                                                                                                                <button onClick={() => handleDeleteSocial(reply.id)} className="text-red-500 text-xs" title="Eliminar">🗑</button>
                                                                                                            </>
                                                                                                        )}
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                            {editingId === reply.id ? (
                                                                                                <textarea className="w-full border rounded p-1 text-xs mt-1" rows={2} value={editForm.textoExtracto} onChange={e => setEditForm({...editForm, textoExtracto: e.target.value})} />
                                                                                            ) : <p className="text-xs text-slate-600 italic mt-1">"{reply.resenaGenerada.textoExtracto}"</p>}
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                            </Draggable>
                                                                        ))}
                                                                        {provided.placeholder}
                                                                    </div>
                                                                )}
                                                            </Droppable>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </DragDropContext>
                            <button onClick={handleSaveSocialEvidence} disabled={selectedSocialIds.length === 0} className="w-full mt-4 py-3 bg-pink-600 text-white font-bold rounded-xl hover:bg-pink-700 transition flex justify-center items-center gap-2">
                                <DocumentIcon className="w-5 h-5"/> Guardar Hilos Seleccionados
                            </button>
                        </div>
                    )}

                    {agencyData.evidenciasSociales && agencyData.evidenciasSociales.length > 0 && socialCandidates.length === 0 && (
                        <div className="space-y-4">
                            <h4 className="font-bold text-slate-800 text-sm">Hilos de Conversación Generados:</h4>
                            {agencyData.evidenciasSociales.map((ev, i) => (
                                <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex gap-4">
                                    <img src={ev.fileUrl} alt="Social Evidence" className="w-16 h-16 object-cover rounded-lg border border-slate-300" />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-bold text-slate-800">
                                                {ev.resenaGenerada.autorSimulado} 
                                                <span className={`text-[10px] font-bold text-white px-2 py-0.5 rounded-md ml-2 uppercase tracking-wider ${ev.resenaGenerada.rol === 'Inmobiliaria' ? 'bg-blue-600' : 'bg-slate-400'}`}>
                                                    {ev.resenaGenerada.rol || 'Usuario Anonimizado'}
                                                </span>
                                                <span className={`text-[10px] font-bold text-white px-2 py-0.5 rounded-md ml-2 uppercase tracking-wider ${ev.esPostPrincipal ? 'bg-indigo-600' : 'bg-slate-500'}`}>
                                                    {ev.esPostPrincipal ? 'POST' : 'COMENTARIO'}
                                                </span>
                                                <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full ml-1">Vía {ev.redSocial}</span>
                                            </span>
                                            {ev.resenaGenerada.calificacion === 0 
                                                ? <span className="text-slate-400 font-bold text-xs uppercase bg-slate-100 px-2 py-0.5 rounded-full">Neutro</span> 
                                                : <span className="text-yellow-500 font-bold">★ {ev.resenaGenerada.calificacion}</span>}
                                        </div>
                                        <p className="text-sm text-slate-600 italic">"{ev.resenaGenerada.textoExtracto}"</p>
                                        
                                        {/* Render nested replies in the final preview too */}
                                        {ev.replies && ev.replies.length > 0 && (
                                            <div className="mt-3 pl-4 border-l-2 border-slate-200 space-y-2">
                                                {ev.replies.map((reply: any, rIdx: number) => (
                                                    <div key={rIdx} className="bg-slate-50 p-2 rounded-lg text-sm flex gap-2">
                                                        <span className="text-slate-400">↳</span>
                                                        <div>
                                                            <span className="font-bold text-slate-700">
                                                                {reply.resenaGenerada.autorSimulado} 
                                                                <span className={`text-[9px] font-bold text-white px-1.5 py-0.5 rounded-md ml-1 uppercase tracking-wider ${reply.resenaGenerada.rol === 'Inmobiliaria' ? 'bg-blue-600' : 'bg-slate-400'}`}>
                                                                    {reply.resenaGenerada.rol || 'Usuario Anonimizado'}
                                                                </span>: 
                                                            </span>
                                                            <span className="text-slate-600 italic">"{reply.resenaGenerada.textoExtracto}"</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="border-t pt-4 flex justify-between">
                        <button onClick={() => setCurrentStep(2)} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-lg">Atrás</button>
                        <button onClick={handleNextStep} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg flex items-center gap-2"><CheckCircleIcon className="w-5 h-5"/> Aprobar Capturas</button>
                    </div>
                </div>
            )}

            {/* STEP 4: Web Search */}
            {currentStep === 4 && (
                <div className="space-y-6 animate-fade-in">
                    <h3 className="text-xl font-bold flex items-center gap-2"><SearchIcon className="w-6 h-6 text-indigo-500"/> Controversias Web</h3>
                    <p className="text-slate-500 text-sm">Procesa enlaces de noticias o pega textos completos directamente para extraer información.</p>
                    
                    {/* Manual Input Section */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                            <DocumentIcon className="w-5 h-5 text-indigo-500" /> Extracción por Enlace o Texto
                        </h4>
                        <input 
                            type="text" 
                            placeholder="Pegar URL de la Noticia / Blog" 
                            value={manualNewsUrl}
                            onChange={e => setManualNewsUrl(e.target.value)}
                            className="w-full p-3 border rounded-lg bg-slate-50 text-sm"
                        />
                        <div className="text-xs text-center text-slate-400 font-bold">O SI FALLA LA URL:</div>
                        <textarea 
                            placeholder="Pega el texto completo de la noticia aquí..." 
                            value={manualNewsText}
                            onChange={e => setManualNewsText(e.target.value)}
                            className="w-full p-3 border rounded-lg bg-slate-50 text-sm min-h-[100px]"
                        />
                        <div className="pt-2">
                            <button 
                                onClick={() => handleScrapeNews(manualNewsUrl, manualNewsText)}
                                disabled={isScrapingNews}
                                style={{ backgroundColor: '#4f46e5', color: 'white', display: 'flex', width: '100%', padding: '12px', justifyContent: 'center', alignItems: 'center', gap: '8px', borderRadius: '12px', fontWeight: 'bold' }}
                                className="hover:opacity-90 transition shadow-md"
                            >
                                {isScrapingNews ? <SpinnerIcon className="w-5 h-5 animate-spin"/> : <SearchIcon className="w-5 h-5"/>}
                                Extraer y Procesar Noticia con IA
                            </button>
                        </div>
                    </div>

                    {/* Menciones Render */}
                    {agencyData.mencionesWeb && agencyData.mencionesWeb.length > 0 && (
                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 animate-fade-in space-y-4">
                            <h4 className="font-bold text-indigo-900 uppercase text-xs tracking-wider">Noticias y Menciones Recopiladas</h4>
                            {agencyData.mencionesWeb.map((mencion, i) => (
                                <div key={mencion.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm relative">
                                    <button onClick={() => handleDeleteMention(mencion.id)} className="absolute top-2 right-2 text-xs font-bold text-red-500 hover:bg-red-50 px-2 py-1 rounded">X</button>
                                    <h5 className="font-bold text-slate-800 text-sm pr-6">{mencion.tituloOriginal || 'Reporte de Mención'}</h5>
                                    <p className="text-xs text-indigo-500 truncate mb-2">{mencion.url}</p>
                                    <div className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 mb-2">
                                        <p className="font-bold mb-2 text-sm text-slate-800">"{mencion.titular}"</p>
                                        <p className="font-semibold mb-1 text-xs text-slate-500">Resumen Detallado (Solo Visible al Expandir en el Foro):</p>
                                        <p className="text-xs">{mencion.resumen}</p>
                                    </div>
                                    <div className="flex gap-2 items-center text-xs font-bold">
                                        <span className={`px-2 py-1 rounded-md ${mencion.tono === 'Positivo' ? 'bg-green-100 text-green-700' : mencion.tono === 'Negativo' ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-700'}`}>
                                            {mencion.tono}
                                        </span>
                                        <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-md">
                                            Severidad: {mencion.severidad}/5
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="border-t pt-4 flex justify-between">
                        <button onClick={() => setCurrentStep(3)} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-lg">Atrás</button>
                        <button onClick={handleNextStep} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg flex items-center gap-2"><CheckCircleIcon className="w-5 h-5"/> Aprobar Resultados</button>
                    </div>
                </div>
            )}

            {/* STEP 5: Google Maps */}
            {currentStep === 5 && (
                <div className="space-y-6 animate-fade-in">
                    <h3 className="text-xl font-bold flex items-center gap-2"><MapPinIcon className="w-6 h-6 text-red-500"/> Presencia en Google Maps</h3>
                    
                    <div>
                        <label className="text-sm font-bold text-slate-700 block mb-2">Estatus en Google</label>
                        <select value={agencyData.googleStatus || 'no_existe'} onChange={e => setAgencyData({...agencyData, googleStatus: e.target.value as any})} className="w-full p-3 border rounded-xl bg-slate-50">
                            <option value="verificado">Verificado (+ Score)</option>
                            <option value="confuso">Confuso / Múltiples (- Score)</option>
                            <option value="no_existe">No existe (- Score)</option>
                        </select>
                    </div>

                    <div className="border-t pt-4 flex justify-between">
                        <button onClick={() => setCurrentStep(4)} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-lg">Atrás</button>
                        <button onClick={handleFinalSave} disabled={isLoading} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-lg disabled:opacity-50 flex items-center gap-2">
                            {isLoading ? <><SpinnerIcon className="w-5 h-5 animate-spin" /> Guardando Evidencias...</> : 'Finalizar y Guardar Inmobiliaria'}
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};
