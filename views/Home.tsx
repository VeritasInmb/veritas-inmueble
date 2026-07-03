
import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Inmobiliaria, ForumTopic } from '../types';
import { getScoreInfo } from '../constants';
import { AgencyCard } from '../components/agency/AgencyCard';
import { StatsSection } from '../components/agency/StatsSection';
import { MagnifyingGlassIcon, WarningIcon, CheckCircleIcon, UserIcon, MessageSquareIcon, SendIcon, HeartIcon } from '../components/Icons';
import { UserAvatar } from '../components/ui/UserAvatar';
import { firebase } from '../services/firebase';
import { EnergyFlow } from '../components/ui/EnergyFlow';

interface HomeProps {
    stats: { agencies: number; reviews: number; frauds: number; };
    onNavigate: (view: 'profile' | 'directory', agency?: Inmobiliaria) => void;
    onTopicClick?: (topic: ForumTopic) => void;
}

// Datos de respaldo para el Carrusel (si no hay datos reales aún)
const fallbackTopics = [
    {
        id: 'default1',
        title: "¿Es legal que me pidan aval con propiedad en CDMX?",
        content: "Me están pidiendo escrituras originales para rentar un departamento en la Roma. ¿Esto es normal o es una red flag?",
        authorName: "Carlos R.",
        userId: "demo1",
        replyCount: 12,
        createdAt: "Hace unos momentos"
    },
    {
        id: 'default2',
        title: "¿Detecté cláusulas raras en mi contrato de preventa?",
        content: "La penalización por retraso de entrega es del 0% para ellos, pero del 10% si yo me atraso un día en el pago.",
        authorName: "Ana Sofía",
        userId: "demo2",
        replyCount: 8,
        createdAt: "Hace 5 minutos"
    },
    {
        id: 'default3',
        title: "¿Alguien conoce a 'Inmobiliaria Futuro Seguro'?",
        content: "Tienen precios muy bajos en Polanco pero no encuentro sus oficinas físicas en Google Maps.",
        authorName: "Roberto G.",
        userId: "demo3",
        replyCount: 24,
        createdAt: "Hace 12 minutos"
    }
];

// Datos estáticos para "Historias de Terror"
const horrorStories = [
    {
        id: 1,
        title: "El anticipo fantasma",
        content: "Encontré un depa en la Roma a mitad de precio. Me pidieron 20 mil para 'apartarlo' antes de verlo. Al día siguiente, el número no existía y la oficina era un lote baldío.",
        loss: "$20,000 MXN",
        tag: "Fraude Digital"
    },
    {
        id: 2,
        title: "Letras chiquitas, problemas grandes",
        content: "Firmé sin leer que la penalización por salirme antes era pagar TODO el año restante. Perdí mi depósito y 3 meses de renta por una humedad que ellos nunca arreglaron.",
        loss: "$45,000 MXN",
        tag: "Contrato Abusivo"
    },
    {
        id: 3,
        title: "La casa que no era suya",
        content: "Le renté a un supuesto dueño. A los dos meses llegó el verdadero propietario con la policía. Resulta que quien me rentó había invadido la propiedad. Me desalojaron.",
        loss: "Desalojo Inmediato",
        tag: "Suplantación"
    }
];

export const Home: React.FC<HomeProps> = ({ stats, onNavigate, onTopicClick }) => {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchDropdownVisible, setIsSearchDropdownVisible] = useState(false);
    
    // Local State for Lazy Fetching
    const [agencies, setAgencies] = useState<Inmobiliaria[]>([]);
    const [forumTopics, setForumTopics] = useState<ForumTopic[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch local data
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch top 20 agencies to avoid full DB download
                const agenciesSnapshot = await firebase.firestore().collection('inmobiliarias').limit(20).get();
                const agenciesData = agenciesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Inmobiliaria));
                setAgencies(agenciesData);

                // Fetch recent 3 forum topics
                const forumSnapshot = await firebase.firestore().collection('forum_topics').orderBy('createdAt', 'desc').limit(3).get();
                const forumData = forumSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ForumTopic));
                setForumTopics(forumData);
            } catch (error) {
                console.error("Error fetching home data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // Carousel State
    const [activeTopicIndex, setActiveTopicIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    // Data Processing for Carousel
    const topicsToDisplay = forumTopics.length > 0 ? forumTopics : fallbackTopics;
    const currentTopic = topicsToDisplay[activeTopicIndex];

    // Carousel Logic
    useEffect(() => {
        const interval = setInterval(() => {
            setIsAnimating(true);
            setTimeout(() => {
                setActiveTopicIndex((prev) => (prev + 1) % topicsToDisplay.length);
                setIsAnimating(false);
            }, 500); // Duration matches fade out
        }, 8000); // 8 seconds per slide
        return () => clearInterval(interval);
    }, [topicsToDisplay.length]);

    const [searchDropdownResults, setSearchDropdownResults] = useState<Inmobiliaria[]>([]);

    useEffect(() => {
        const performSearch = async () => {
            if (!searchTerm.trim()) {
                setSearchDropdownResults([]);
                return;
            }
            try {
                // Dynamic import to avoid SSR issues if any, or just use the lib
                const { algoliaClient, INDEX_NAME } = await import('../lib/algolia');
                const { results } = await algoliaClient.search({
                    requests: [
                        {
                            indexName: INDEX_NAME,
                            query: searchTerm,
                            hitsPerPage: 5,
                        },
                    ],
                });
                const hits = (results[0] as any).hits as any[];
                // Map Algolia objectID to id for compatibility
                const mappedHits = hits.map(hit => ({ ...hit, id: hit.objectID || hit.id } as Inmobiliaria));
                setSearchDropdownResults(mappedHits);
            } catch (error) {
                console.error("Algolia search error:", error);
                // Fallback a filtrado local si falla (ej. si aún no ponen la API Key)
                setSearchDropdownResults(agencies.filter(a => a.nombre.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 5));
            }
        };

        const timeoutId = setTimeout(() => {
            performSearch();
        }, 300); // Debounce 300ms
        return () => clearTimeout(timeoutId);
    }, [searchTerm, agencies]);

    const topHomeAgencies = useMemo(() => 
        [...agencies].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)), 
    [agencies]);

    const riskyAgencies = useMemo(() => 
        [...agencies]
            .filter(a => (a.score ?? 0) < 60)
            .sort((a, b) => (a.score ?? 0) - (b.score ?? 0))
            .slice(0, 4), 
    [agencies]);

    const carouselStories = [...horrorStories, ...horrorStories, ...horrorStories, ...horrorStories];

    // Helper to render red question marks
    const renderDynamicTitle = (title: string) => {
        return title.split('').map((char, i) => 
            ['¿', '?'].includes(char) 
                ? <span key={i} className="text-red-600">{char}</span> 
                : char
        );
    };

    const handleInternalTopicClick = () => {
        if (onTopicClick) {
            onTopicClick(currentTopic as ForumTopic);
        } else {
            router.push('/foro?topicId=' + currentTopic.id);
        }
    };

    // Fix: Handle Firestore Timestamp properly to avoid React Error #31
    const formatTime = (time: any) => {
        if (!time) return '';
        if (typeof time === 'string') return time;
        if (time?.toDate) {
            return time.toDate().toLocaleDateString('es-MX', {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });
        }
        return 'Reciente';
    };

    return (
        <main className="container mx-auto px-4 pt-24 pb-8">
            
            {/* HERO SECTION */}
            <section className="relative bg-white rounded-[3rem] shadow-2xl shadow-slate-200/60 p-6 sm:p-12 lg:p-16 mb-16 overflow-visible border border-slate-100 flex flex-col lg:flex-row items-center gap-6 lg:gap-12 bg-grid-pattern min-h-[650px]">
                
                {/* COLUMNA IZQUIERDA: BUSCADOR Y BRANDING */}
                <div className="relative z-20 w-full lg:w-1/2 flex flex-col justify-center pointer-events-none sm:pointer-events-auto">
                    
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-900 text-white rounded-full font-bold text-xs mb-8 w-fit shadow-lg shadow-slate-900/20">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        EN VIVO: 24 personas analizando ahora
                    </div>

                    {/* Título Principal */}
                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 mb-6 leading-none tracking-tighter">
                        Dale <span className="text-red-600">Poder</span> a tu <br className="hidden sm:block"/>Inversión.
                    </h1>

                    {/* Subtítulo */}
                    <p className="text-lg sm:text-xl text-slate-500 font-medium mb-10 leading-relaxed max-w-lg">
                        ¿Estás a punto de firmar? Detente. Analiza 45+ puntos de riesgo en segundos antes de cometer un error costoso.
                    </p>
                    
                    {/* BARRA DE BÚSQUEDA GRANDE */}
                    <div className="relative w-full max-w-xl mb-6 pointer-events-auto">
                        <div className="bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 focus-within:border-red-600 focus-within:ring-1 focus-within:ring-red-600 p-2 pl-6 flex items-center transition-all transform hover:-translate-y-1 duration-300">
                            <MagnifyingGlassIcon className="w-6 h-6 text-slate-400 flex-shrink-0"/>
                            <input 
                                type="text" 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                                onFocus={() => setIsSearchDropdownVisible(true)} 
                                onBlur={() => setTimeout(() => setIsSearchDropdownVisible(false), 200)} 
                                placeholder="Busca una inmobiliaria..." 
                                className="w-full px-4 py-3 bg-transparent focus:outline-none font-bold text-slate-700 text-lg placeholder:font-medium placeholder:text-slate-300" 
                            />
                            <button 
                                onClick={() => { if(searchTerm) router.push('/directorio'); }}
                                className="bg-red-600 text-white px-8 py-3 rounded-full hover:bg-red-700 transition-all flex items-center gap-2 font-bold shadow-md text-lg"
                            >
                                <MagnifyingGlassIcon className="w-5 h-5"/> Analizar
                            </button>
                        </div>
                        
                        {/* Dropdown de Resultados */}
                        {isSearchDropdownVisible && searchDropdownResults.length > 0 && (
                            <ul className="absolute top-full left-0 right-0 bg-white border border-slate-100 rounded-3xl shadow-2xl z-30 max-h-80 overflow-y-auto text-left mt-4 p-2 animate-fade-in-up">
                                {searchDropdownResults.map(agency => (
                                    <li key={agency.id} className="px-5 py-4 hover:bg-slate-50 cursor-pointer rounded-2xl transition-colors flex justify-between items-center" onMouseDown={() => { onNavigate('profile', agency); setSearchTerm(''); }}>
                                        <div><p className="font-bold text-slate-900">{agency.nombre}</p><p className="text-sm font-medium text-slate-500">{agency.estado}</p></div>
                                        <span className={`font-black ${getScoreInfo(agency.score).textColor}`}>{agency.score}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    
                    {/* Tendencias */}
                    <div className="flex items-center gap-4 text-sm font-medium text-slate-400 pointer-events-auto">
                        <span className="font-bold text-slate-300 uppercase tracking-wider text-xs">Tendencia:</span>
                        <div className="flex gap-2">
                            <span className="hover:text-red-600 cursor-pointer transition-colors">Tecnocasa</span>
                            <span className="hover:text-red-600 cursor-pointer transition-colors">Remax</span>
                            <span className="hover:text-red-600 cursor-pointer transition-colors">Alto Riesgo</span>
                            <span className="hover:text-red-600 cursor-pointer transition-colors">CDMX</span>
                        </div>
                    </div>
                </div>

                {/* COLUMNA DERECHA: ESCENA ZIG-ZAG */}
                <div className="w-full lg:w-1/2 relative h-[550px] sm:h-[650px] overflow-visible">
                    
                    {/* LAYER 0: SVG Energy Path */}
                    <EnergyFlow />

                    {/* LAYER 1: CARD TOP LEFT (BAD) */}
                    <div className="absolute top-8 left-4 sm:left-12 z-10 animate-float">
                        <div className="bg-white/95 p-4 rounded-[1.2rem] shadow-[0_8px_30px_rgba(239,68,68,0.15)] border border-red-50 max-w-[200px] backdrop-blur-sm transform -rotate-6 hover:rotate-0 transition-transform duration-500">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center shrink-0">
                                    <WarningIcon className="w-4 h-4 text-red-500" />
                                </div>
                                <div>
                                    <p className="font-black text-slate-900 text-xs leading-tight">Inmobiliaria X</p>
                                    <p className="text-[10px] font-bold text-red-600">Score: 35</p>
                                </div>
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium leading-tight">
                                3 Quejas PROFECO. Sin contrato registrado.
                            </div>
                        </div>
                    </div>

                    {/* LAYER 2: CARD CENTER (FORUM - HERO) */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-[420px] z-20">
                        <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-[0_25px_60px_-12px_rgba(0,0,0,0.15)] border border-white/60 ring-1 ring-slate-100 transition-all duration-500 hover:scale-[1.02] group">
                            
                            {/* Decorative Elements */}
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-1 bg-red-500/20 rounded-full"></div>
                            
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-2 bg-gradient-to-r from-slate-50 to-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Discusión Activa</span>
                                </div>
                                <div className="bg-red-50 p-2 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MessageSquareIcon className="w-4 h-4"/>
                                </div>
                            </div>

                            {/* Contenido Dinámico del Foro */}
                            <div className={`transition-all duration-500 ease-in-out transform flex flex-col ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                                <h2 
                                    className="text-2xl sm:text-3xl font-black text-slate-900 mb-4 leading-tight cursor-pointer hover:text-red-600 transition-colors"
                                    onClick={handleInternalTopicClick}
                                >
                                    {renderDynamicTitle(currentTopic.title)}
                                </h2>
                                
                                <div className="relative pl-4 border-l-2 border-slate-200 mb-6">
                                    <p className="text-sm text-slate-600 font-medium leading-relaxed italic line-clamp-3">
                                        "{currentTopic.content}"
                                    </p>
                                </div>
                            
                                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <UserAvatar 
                                                name={currentTopic.authorName} 
                                                userId={(currentTopic as any).userId} 
                                                className="w-10 h-10 ring-4 ring-white shadow-md"
                                            />
                                            <div className="absolute -bottom-1 -right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-white"></div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-900">{currentTopic.authorName}</p>
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                                <span>{formatTime((currentTopic as any).createdAt)}</span>
                                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                <span>{currentTopic.replyCount} respuestas</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={handleInternalTopicClick}
                                        className="group-hover:bg-red-600 group-hover:text-white text-slate-900 bg-slate-100 p-3 rounded-2xl transition-all shadow-sm group-hover:shadow-red-600/30 group-hover:-rotate-12"
                                    >
                                        <SendIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* LAYER 3: CARD BOTTOM RIGHT (GOOD) */}
                    <div className="absolute bottom-8 right-4 sm:right-12 z-10 animate-float-delayed">
                        <div className="bg-white/95 p-4 rounded-[1.2rem] shadow-[0_8px_30px_rgba(16,185,129,0.15)] border border-teal-50 max-w-[200px] backdrop-blur-sm transform rotate-6 hover:rotate-0 transition-transform duration-500">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 bg-teal-50 rounded-full flex items-center justify-center shrink-0">
                                    <CheckCircleIcon className="w-4 h-4 text-teal-500" />
                                </div>
                                <div>
                                    <p className="font-black text-slate-900 text-xs leading-tight">Inmobiliaria Y</p>
                                    <p className="text-[10px] font-bold text-teal-600">Score: 92</p>
                                </div>
                            </div>
                             <div className="text-[10px] text-slate-400 font-medium leading-tight">
                                Verificada. Contrato registrado.
                            </div>
                        </div>
                    </div>

                </div>
            </section>
            
            <StatsSection stats={stats} />
            
            <section className="mb-16">
                <div className="flex justify-between items-center mb-8"><h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Las Más Seguras <span className="text-green-500">Hoy</span></h2><button onClick={() => onNavigate('directory')} className="text-slate-900 font-bold hover:text-red-600 transition">Ver todas &rarr;</button></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">{topHomeAgencies.slice(0, 4).map((agency) => <AgencyCard key={agency.id} agency={agency} onSelect={(agency) => onNavigate('profile', agency)} />)}</div>
            </section>

            {/* SECCIÓN 1: EL MURO DE LA VERGÜENZA */}
            {riskyAgencies.length > 0 && (
                <section className="mb-24 bg-red-50 rounded-[3rem] p-8 sm:p-12 relative overflow-hidden border border-red-100">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-200 rounded-full filter blur-[100px] opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full font-bold text-xs mb-3 border border-red-200">
                                    <WarningIcon className="w-4 h-4"/> ALERTA DE RIESGO
                                </div>
                                <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">El Muro de la <span className="text-red-600">Vergüenza</span></h2>
                                <p className="text-slate-600 mt-4 text-lg font-medium max-w-2xl">Detectamos actividad inusual, reportes de fraude o falta de contratos. Estas son las agencias con <strong>mayor riesgo</strong> esta semana.</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {riskyAgencies.map(agency => (
                                <AgencyCard 
                                    key={agency.id} 
                                    agency={agency} 
                                    onSelect={(agency) => onNavigate('profile', agency)} 
                                />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* SECCIÓN 2: HISTORIAS DE TERROR (CAROUSEL) */}
            <section className="mb-12 bg-slate-900 rounded-[3rem] py-16 sm:py-20 relative overflow-hidden shadow-2xl shadow-slate-900/40">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-slate-800 to-slate-900"></div>
                {/* Decorative floating elements */}
                <div className="absolute top-10 left-10 w-20 h-1 bg-red-500 rounded-full opacity-20"></div>
                <div className="absolute bottom-10 right-10 w-20 h-1 bg-slate-500 rounded-full opacity-20"></div>
                
                <div className="relative z-10 text-center max-w-4xl mx-auto mb-12 px-6">
                    <span className="text-red-500 font-black tracking-[0.2em] text-sm uppercase mb-2 block">Casos Reales</span>
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tighter mb-6">Historias de <span className="text-red-600 bg-white/5 px-2 rounded-lg">Terror</span> Inmobiliario</h2>
                    <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed">
                        Lo que las fotos bonitas no te dicen. Lecciones aprendidas a la mala por usuarios reales para que tú no tengas que vivirlas.
                    </p>
                </div>

                <div className="relative w-full overflow-hidden">
                    {/* Gradient masks to create fade effect on edges */}
                    <div className="absolute top-0 left-0 w-16 md:w-32 h-full bg-gradient-to-r from-slate-900 to-transparent z-20 pointer-events-none"></div>
                    <div className="absolute top-0 right-0 w-16 md:w-32 h-full bg-gradient-to-l from-slate-900 to-transparent z-20 pointer-events-none"></div>

                    {/* Carousel Track */}
                    <div className="flex gap-6 animate-infinite-scroll w-max px-6 hover:[animation-play-state:paused] cursor-grab active:cursor-grabbing">
                        {carouselStories.map((story, index) => (
                            <div key={`${story.id}-${index}`} className="w-[300px] md:w-[400px] flex-shrink-0 bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition duration-300 group/card">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="bg-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-red-500/20">{story.tag}</span>
                                    <div className="text-slate-500 group-hover/card:text-white transition-colors">
                                        <WarningIcon className="w-6 h-6"/>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-4 leading-tight">"{story.title}"</h3>
                                <p className="text-slate-400 text-sm leading-relaxed mb-6 font-medium">
                                    {story.content}
                                </p>
                                <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Pérdida Estimada</p>
                                        <p className="text-red-500 font-black text-lg">{story.loss}</p>
                                    </div>
                                    <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center">
                                        <UserIcon className="w-5 h-5 text-slate-500"/>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="mt-12 text-center relative z-10 px-6">
                    <button onClick={() => onNavigate('directory')} className="inline-flex items-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-full font-black text-lg hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                        Evita ser el próximo <span className="text-red-600">&rarr;</span>
                    </button>
                </div>

                <style>{`
                    @keyframes scroll {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-25%); }
                    }
                    .animate-infinite-scroll {
                        animation: scroll 60s linear infinite;
                    }
                `}</style>
            </section>
        </main>
    );
};
