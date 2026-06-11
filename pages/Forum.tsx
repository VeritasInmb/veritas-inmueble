
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ForumTopic, ForumReply, ForumCategory, Usuario } from '../types';
import { db, firebase, auth } from '../services/firebase';
import { MessageSquareIcon, HomeIcon, BuildingOfficeIcon, ScaleIcon, BanknotesIcon, UserIcon, ChartBarIcon, LinkIcon, DocumentIcon, ExternalLinkIcon, TrashIcon, HeartIcon, EyeIcon, CloseIcon, SpinnerIcon, SendIcon, MagnifyingGlassIcon, PlusIcon } from '../components/Icons';
import { UserAvatar } from '../components/ui/UserAvatar';
import { ConfirmationModal } from '../components/SharedComponents';

const { Timestamp } = firebase.firestore;

// --- Sub-components (Locally defined for cohesion) ---

const ForumSidebar: React.FC<{ activeCategory: string; onSelectCategory: (id: string) => void; categories: ForumCategory[]; currentUser: Usuario | null; }> = ({ activeCategory, onSelectCategory, categories, currentUser }) => {
    return (
        <aside className="w-64 shrink-0 flex flex-col h-full border-r border-slate-100 bg-white py-6 px-4 overflow-y-auto">
            <div className="flex items-center gap-3 px-2 mb-8">
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                    <MessageSquareIcon className="w-6 h-6 text-white" />
                </div>
                <span className="font-black text-xl text-slate-900">ForoVeritas</span>
            </div>
            <nav className="space-y-1 flex-1">
                {categories.map(category => {
                    const Icon = {
                        'Home': HomeIcon,
                        'BuildingOffice': BuildingOfficeIcon,
                        'Scale': ScaleIcon,
                        'MessageSquare': MessageSquareIcon,
                        'Banknotes': BanknotesIcon
                    }[category.iconName] || MessageSquareIcon;
                    return (
                        <button key={category.id} onClick={() => onSelectCategory(category.id)} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-sm font-semibold ${activeCategory === category.id ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
                            <Icon className="w-5 h-5" />
                            {category.name}
                        </button>
                    );
                })}
            </nav>
            {currentUser && (
                <div className="mt-auto pt-6 border-t border-slate-100">
                    <Link to="/perfil" className="flex items-center gap-3 px-2 hover:bg-slate-50 p-2 rounded-xl transition-colors cursor-pointer group">
                        <UserAvatar 
                            name={currentUser.nombre} 
                            avatarUrl={currentUser.avatarUrl} 
                            color={currentUser.profileColor} 
                            userId={currentUser.id}
                            className="w-8 h-8"
                        />
                        <div className="flex-1">
                            <p className="text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors">Mi Perfil</p>
                            <p className="text-xs text-slate-400">Configuración</p>
                        </div>
                    </Link>
                </div>
            )}
        </aside>
    );
};

const ForumRightPanel: React.FC = () => {
    const navigate = useNavigate();
    
    return (
        <aside className="w-80 shrink-0 hidden lg:flex flex-col h-full border-l border-slate-100 bg-slate-50 py-6 px-6 gap-6 overflow-y-auto">
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <ChartBarIcon className="w-5 h-5 text-red-600" />
                    <h3 className="font-bold text-slate-900">Indicadores Financieros</h3>
                </div>
                <div className="space-y-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500 font-medium">Tasa Interés Hipotecario</span>
                        <span className="text-sm font-bold text-slate-900">10.4%</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500 font-medium">Valor UDI</span>
                        <span className="text-sm font-bold text-slate-900">8.25 MXN</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500 font-medium">Inflación Anual</span>
                        <span className="text-sm font-bold text-slate-900">4.5%</span>
                    </div>
                </div>
            </div>
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <LinkIcon className="w-5 h-5 text-slate-700" />
                    <h3 className="font-bold text-slate-900">Enlaces Rápidos</h3>
                </div>
                <div className="space-y-3">
                    <a href="https://burocomercial.profeco.gob.mx/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100 hover:border-red-200 transition group cursor-pointer shadow-sm">
                        <div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center group-hover:bg-red-100 transition"><DocumentIcon className="w-4 h-4 text-red-600"/></div>
                        <div className="flex-1"><p className="text-sm font-bold text-slate-700 group-hover:text-red-700 transition">Buró Comercial</p><p className="text-xs text-slate-400">PROFECO</p></div>
                         <ExternalLinkIcon className="w-4 h-4 text-slate-300 group-hover:text-red-500 transition"/>
                    </a>
                     <a href="https://ampi.org/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100 hover:border-red-200 transition group cursor-pointer shadow-sm">
                        <div className="w-8 h-8 bg-teal-50 rounded-full flex items-center justify-center group-hover:bg-teal-100 transition"><HomeIcon className="w-4 h-4 text-teal-600"/></div>
                        <div className="flex-1"><p className="text-sm font-bold text-slate-700 group-hover:text-teal-700 transition">Directorio AMPI</p><p className="text-xs text-slate-400">Certificación</p></div>
                        <ExternalLinkIcon className="w-4 h-4 text-slate-300 group-hover:text-teal-500 transition"/>
                    </a>
                </div>
            </div>
            <div className="mt-auto bg-slate-900 rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-red-600 rounded-full filter blur-2xl opacity-30 -translate-y-1/2 translate-x-1/2"></div>
                <h4 className="text-white font-bold relative z-10 mb-2">Aprende con Expertos</h4>
                <p className="text-slate-400 text-sm relative z-10 mb-4">Lee nuestra guía sobre cómo detectar fraudes en preventas.</p>
                <button onClick={() => navigate('/blog')} className="w-full py-2 bg-red-600 rounded-xl text-white text-sm font-bold hover:bg-red-700 transition relative z-10">Ir al Blog</button>
            </div>
        </aside>
    );
};

const TopicCard: React.FC<{ topic: ForumTopic; onClick: () => void; onDelete: (id: string) => void; currentUser: Usuario | null; onLike: (id: string) => void; }> = ({ topic, onClick, onDelete, currentUser, onLike }) => {
    const formatDate = (t: any) => t instanceof Timestamp ? t.toDate().toLocaleDateString('es-MX') : 'Reciente';
    const canDelete = currentUser && (currentUser.id === topic.userId || currentUser.rol === 'admin');
    const hasLiked = currentUser ? topic.likes?.includes(currentUser.id) : false;

    return (
        <div onClick={onClick} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 hover:shadow-card-hover transition-all cursor-pointer hover:-translate-y-1 group flex flex-col h-full relative">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <UserAvatar 
                        name={topic.authorName} 
                        avatarUrl={topic.authorAvatar} 
                        color={topic.authorColor} 
                        userId={topic.userId}
                        className="w-10 h-10"
                    />
                    <div><p className="text-sm font-bold text-slate-900">{topic.authorName}</p><p className="text-xs text-slate-400">{formatDate(topic.createdAt)}</p></div>
                </div>
                {canDelete && (
                    <button onClick={(e) => { e.stopPropagation(); onDelete(topic.id); }} className="text-slate-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition z-10">
                        <TrashIcon className="w-4 h-4" />
                    </button>
                )}
            </div>
            <h3 className="font-black text-xl text-slate-900 mb-3 leading-snug group-hover:text-red-600 transition-colors">{topic.title}</h3>
            <p className="text-slate-500 line-clamp-5 mb-6 leading-relaxed flex-1">{topic.content}</p>
            <div className="flex flex-wrap gap-2 mb-6">
                {topic.tags?.map(tag => <span key={tag} className="text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1 rounded-full">#{tag}</span>)}
            </div>
            <div className="flex items-center gap-5 pt-3 border-t border-slate-50 text-slate-400 text-sm font-medium mt-auto">
                <button onClick={(e) => { e.stopPropagation(); onLike(topic.id); }} className={`flex items-center gap-1.5 transition-colors ${hasLiked ? 'text-red-500' : 'hover:text-red-500'}`} aria-label="Me gusta">
                    <HeartIcon className="w-4 h-4" filled={hasLiked} /> {topic.likes?.length || 0}
                </button>
                <span className="flex items-center gap-1.5"><MessageSquareIcon className="w-4 h-4" /> {topic.replyCount || 0}</span>
                <span className="flex items-center gap-1.5 ml-auto"><EyeIcon className="w-4 h-4" /> {topic.views || 0}</span>
            </div>
        </div>
    );
};

const CreateTopicModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (title: string, content: string, categoryId: string, tags: string) => Promise<void>; categories: ForumCategory[]; activeCategory: string; }> = ({ isOpen, onClose, onSave, categories, activeCategory }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [categoryId, setCategoryId] = useState(activeCategory || (categories[0]?.id ?? ''));
    const [tags, setTags] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Anti-spam / Identity Verification
        if (auth.currentUser && !auth.currentUser.emailVerified) {
            alert("Tu correo electrónico no está verificado. Por favor revisa tu bandeja de entrada para poder crear temas.");
            return;
        }

        setIsSubmitting(true);
        await onSave(title, content, categoryId, tags);
        setIsSubmitting(false);
        setTitle(''); setContent(''); setTags('');
        onClose();
    };

    useEffect(() => { if (activeCategory) setCategoryId(activeCategory); }, [activeCategory]);

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-black text-slate-900">Crear Nuevo Tema</h3>
                    <button onClick={onClose} className="bg-slate-100 p-2 rounded-full hover:bg-slate-200 transition"><CloseIcon className="w-5 h-5 text-slate-500" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Título</label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-red-500 transition" placeholder="Escribe un título interesante" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Categoría</label>
                        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-red-500 transition">
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Contenido</label>
                        <textarea value={content} onChange={(e) => setContent(e.target.value)} required rows={6} className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-red-500 transition" placeholder="Comparte tus ideas, dudas o experiencias..." />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Tags (separados por comas)</label>
                        <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-red-500 transition" placeholder="renta, contrato, profeco" />
                    </div>
                    <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition disabled:opacity-50 flex items-center justify-center gap-2">
                        {isSubmitting && <SpinnerIcon className="w-5 h-5" />} {isSubmitting ? 'Publicando...' : 'Publicar Tema'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const TopicDetailModal: React.FC<{ topic: ForumTopic | null; onClose: () => void; replies: ForumReply[]; onReplySubmit: (content: string) => Promise<void>; currentUser: Usuario | null; onDeleteTopic: (id: string) => void; onDeleteReply: (id: string) => void; onLikeTopic: (id: string) => void; onRequireAuth: () => void; }> = ({ topic, onClose, replies, onReplySubmit, currentUser, onDeleteTopic, onDeleteReply, onLikeTopic, onRequireAuth }) => {
    const [newReply, setNewReply] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const repliesEndRef = useRef<HTMLDivElement>(null);

    const handleSubmit = async () => {
        if (!newReply.trim() || isSubmitting) return;
        
        // Anti-spam / Identity Verification
        if (auth.currentUser && !auth.currentUser.emailVerified) {
            alert("Tu correo electrónico no está verificado. Verifica tu cuenta para responder.");
            return;
        }

        setIsSubmitting(true);
        await onReplySubmit(newReply);
        setIsSubmitting(false);
        setNewReply('');
    };
    useEffect(() => { if (repliesEndRef.current) repliesEndRef.current.scrollIntoView({ behavior: 'smooth' }); }, [replies]);
    if (!topic) return null;
    const formatDate = (t: any) => t instanceof Timestamp ? t.toDate().toLocaleString('es-MX') : 'Reciente';
    const canDeleteTopic = currentUser && (currentUser.id === topic.userId || currentUser.rol === 'admin');
    const hasLiked = currentUser ? topic.likes?.includes(currentUser.id) : false;

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex justify-center items-center">
            <div className="bg-white w-full h-full md:max-w-4xl md:h-[95vh] md:rounded-3xl shadow-2xl flex flex-col relative overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur-xl absolute top-0 left-0 right-0 z-10">
                    <div className="flex items-center gap-3">
                        <UserAvatar 
                            name={topic.authorName} 
                            avatarUrl={topic.authorAvatar} 
                            color={topic.authorColor} 
                            userId={topic.userId}
                            className="w-10 h-10"
                        />
                        <div><p className="font-bold text-slate-900">{topic.authorName}</p><p className="text-xs text-slate-400">{formatDate(topic.createdAt)}</p></div>
                    </div>
                    <div className="flex items-center gap-2">
                        {canDeleteTopic && (
                            <button onClick={() => onDeleteTopic(topic.id)} className="bg-slate-100 p-2 rounded-full hover:bg-red-50 hover:text-red-600 transition text-slate-500">
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        )}
                        <button onClick={onClose} className="bg-slate-100 p-2 rounded-full hover:bg-slate-200 transition"><CloseIcon className="w-5 h-5 text-slate-500" /></button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto pt-20 pb-32 px-6 md:px-8">
                    <h2 className="text-3xl font-black text-slate-900 mb-4">{topic.title}</h2>
                    <div className="flex gap-2 mb-6">{topic.tags?.map(tag => <span key={tag} className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-full">#{tag}</span>)}</div>
                    <div className="flex items-center gap-6 mb-8 pb-6 border-b border-slate-100">
                        <button 
                            onClick={() => onLikeTopic(topic.id)} 
                            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-colors text-sm ${hasLiked ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                            <HeartIcon className="w-5 h-5" filled={hasLiked} /> 
                            <span>{hasLiked ? 'Te gusta' : 'Me gusta'}</span>
                        </button>
                        <span className="text-sm font-medium text-slate-500">{topic.likes?.length || 0} Me gusta</span>
                    </div>
                    <div className="prose prose-slate max-w-none prose-p:font-medium prose-p:leading-relaxed mb-8 prose-a:text-red-600 whitespace-pre-wrap">{topic.content}</div>
                    <h4 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2"><MessageSquareIcon className="w-5 h-5"/> Respuestas ({replies.length})</h4>
                    <div className="space-y-6">
                        {replies.map(reply => {
                            const canDeleteReply = currentUser && (currentUser.id === reply.userId || currentUser.rol === 'admin');
                            return (
                                <div key={reply.id} className="flex gap-4 animate-fade-in group relative">
                                    <div className="shrink-0 mt-1">
                                        <UserAvatar 
                                            name={reply.authorName} 
                                            avatarUrl={reply.authorAvatar} 
                                            color={reply.authorColor} 
                                            userId={reply.userId}
                                            className="w-8 h-8"
                                        />
                                    </div>
                                    <div className="bg-slate-50 rounded-2xl rounded-tl-none p-4 flex-1">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <span className="font-bold text-slate-900">{reply.authorName}</span>
                                            <span className="text-xs text-slate-400">{formatDate(reply.createdAt)}</span>
                                        </div>
                                        <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{reply.content}</p>
                                    </div>
                                    {canDeleteReply && (
                                        <button onClick={() => onDeleteReply(reply.id)} className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all">
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                        <div ref={repliesEndRef} />
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4">
                    <div className="flex gap-2">
                        <textarea value={newReply} onChange={(e) => setNewReply(e.target.value)} placeholder="Escribe tu respuesta..." className="flex-1 px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-red-500 transition resize-none h-24" />
                        <div className="flex flex-col gap-2">
                            {currentUser ? (
                                <button onClick={handleSubmit} disabled={isSubmitting || !newReply.trim()} className="bg-slate-900 text-white p-3 rounded-2xl hover:bg-slate-800 transition disabled:opacity-50 h-full flex items-center justify-center">
                                    {isSubmitting ? <SpinnerIcon className="w-6 h-6" /> : <SendIcon className="w-6 h-6" />}
                                </button>
                            ) : (
                                <button onClick={onRequireAuth} className="bg-slate-900 text-white p-3 rounded-2xl hover:bg-slate-800 transition h-full flex items-center justify-center">
                                    <SendIcon className="w-6 h-6" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main Forum Component ---

interface ForumProps {
    forumTopics: ForumTopic[];
    currentUser: Usuario | null;
    createNotification: (toUserId: string, type: any, content: string, linkId: string) => Promise<void>;
    selectedTopic: ForumTopic | null;
    setSelectedTopic: (topic: ForumTopic | null) => void;
    activeCategory: string;
    setActiveCategory: (cat: string) => void;
    onRequireAuth: () => void;
}

export const Forum: React.FC<ForumProps> = ({ forumTopics, currentUser, createNotification, selectedTopic, setSelectedTopic, activeCategory, setActiveCategory, onRequireAuth }) => {
    const [topicReplies, setTopicReplies] = useState<ForumReply[]>([]);
    const [isCreateTopicOpen, setIsCreateTopicOpen] = useState(false);
    const [forumSearch, setForumSearch] = useState('');
    const [isLoading, setIsLoading] = useState(false); // Local loading state for topic switch if needed
    
    // State for Confirmation Modal
    const [deleteTarget, setDeleteTarget] = useState<{ type: 'topic' | 'reply', id: string } | null>(null);

    const categories: ForumCategory[] = useMemo(() => [
        { id: 'cat_gral', name: 'General', iconName: 'MessageSquare' },
        { id: 'cat_renta', name: 'Rentas', iconName: 'Home' },
        { id: 'cat_venta', name: 'Compra / Venta', iconName: 'BuildingOffice' },
        { id: 'cat_legal', name: 'Legal & Créditos', iconName: 'Scale' },
    ], []);

    const filteredTopics = useMemo(() => {
        return forumTopics.filter(t => (activeCategory === 'cat_gral' || t.categoryId === activeCategory) && t.title.toLowerCase().includes(forumSearch.toLowerCase()));
    }, [forumTopics, activeCategory, forumSearch]);

    // Ensure current selected topic always reflects real-time data
    const currentSelectedTopic = useMemo(() => {
        return forumTopics.find(t => t.id === selectedTopic?.id) || selectedTopic;
    }, [forumTopics, selectedTopic]);

    useEffect(() => {
        if (!currentSelectedTopic) { setTopicReplies([]); return; }
        const unsubscribe = db.collection('forum_replies').where('topicId', '==', currentSelectedTopic.id).orderBy('createdAt', 'asc').onSnapshot(snapshot => {
            setTopicReplies(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ForumReply)));
        });
        return () => unsubscribe();
    }, [currentSelectedTopic]);

    const handleCreateTopicClick = () => {
        if (!currentUser) {
            onRequireAuth();
            return;
        }
        setIsCreateTopicOpen(true);
    };

    const handleCreateTopic = async (title: string, content: string, categoryId: string, tagsString: string) => {
        if (!currentUser) return;
        const tags = tagsString.split(',').map(t => t.trim()).filter(t => t);
        await db.collection('forum_topics').add({
            title, 
            content, 
            categoryId, 
            tags, 
            userId: currentUser.id, 
            authorName: currentUser.nombre, 
            authorAvatar: currentUser.avatarUrl || '',
            authorColor: currentUser.profileColor || '',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(), 
            likes: [], 
            replyCount: 0, 
            views: 0
        });
    };

    const handleCreateReply = async (content: string) => {
        if (!currentUser || !currentSelectedTopic) return;
        await db.collection('forum_replies').add({ 
            topicId: currentSelectedTopic.id, 
            content, 
            userId: currentUser.id, 
            authorName: currentUser.nombre, 
            authorAvatar: currentUser.avatarUrl || '',
            authorColor: currentUser.profileColor || '',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(), 
            likes: [] 
        });
        await db.collection('forum_topics').doc(currentSelectedTopic.id).update({ replyCount: firebase.firestore.FieldValue.increment(1) });
        createNotification(currentSelectedTopic.userId, 'reply_forum', 'respondió a tu tema', currentSelectedTopic.id);
    };

    const handleSelectTopic = async (topic: ForumTopic) => {
        setSelectedTopic(topic);
        await db.collection('forum_topics').doc(topic.id).update({ views: firebase.firestore.FieldValue.increment(1) });
    };

    const handleLikeTopic = async (topicId: string) => {
        if (!currentUser) { onRequireAuth(); return; }
        const topicRef = db.collection('forum_topics').doc(topicId);
        try {
            await db.runTransaction(async (transaction) => {
                const topicDoc = await transaction.get(topicRef);
                if (!topicDoc.exists) throw new Error("El tema no fue encontrado.");
                const topicData = topicDoc.data() as ForumTopic;
                const likes = topicData.likes || [];
                const userId = currentUser.id;
                if (likes.includes(userId)) {
                    transaction.update(topicRef, { likes: firebase.firestore.FieldValue.arrayRemove(userId) });
                } else {
                    transaction.update(topicRef, { likes: firebase.firestore.FieldValue.arrayUnion(userId) });
                    if (topicData.userId !== currentUser.id) createNotification(topicData.userId, 'like_forum', 'le gustó tu tema', topicId);
                }
            });
        } catch (error) { console.error("Error al dar me gusta:", error); }
    };

    // Replace default window.confirm with state setting
    const onDeleteTopic = (id: string) => { 
        setDeleteTarget({ type: 'topic', id });
    };

    const onDeleteReply = (id: string) => {
        setDeleteTarget({ type: 'reply', id });
    };

    // Function executed when user confirms in the modal
    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        const { type, id } = deleteTarget;
        
        try {
            if (type === 'topic') {
                await db.collection('forum_topics').doc(id).delete();
                if(selectedTopic?.id === id) setSelectedTopic(null);
            } else {
                await db.collection('forum_replies').doc(id).delete();
                if(currentSelectedTopic) await db.collection('forum_topics').doc(currentSelectedTopic.id).update({ replyCount: firebase.firestore.FieldValue.increment(-1) });
            }
        } catch (error) {
            console.error("Error eliminando:", error);
            alert("Hubo un error al eliminar.");
        } finally {
            setDeleteTarget(null);
        }
    };

    return (
        <div className="h-screen pt-[4.5rem] flex bg-white">
            <div className="hidden md:block h-full">
                <ForumSidebar activeCategory={activeCategory} onSelectCategory={setActiveCategory} categories={categories} currentUser={currentUser} />
            </div>
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <div className="py-6 shrink-0 border-b border-slate-100 px-6 flex items-center justify-between gap-4 mt-2">
                    <div className="flex-1 relative max-w-md">
                        <input type="text" placeholder="Buscar temas..." value={forumSearch} onChange={(e) => setForumSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border-none focus:ring-1 focus:ring-red-500 transition" />
                        <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
                    </div>
                    <button onClick={handleCreateTopicClick} className="bg-slate-900 text-white rounded-xl px-3 sm:px-4 py-2.5 font-bold text-sm flex items-center gap-2 hover:bg-slate-800 transition group whitespace-nowrap">
                        <PlusIcon className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" /> <span className="hidden sm:inline">Crear Tema</span>
                    </button>
                </div>
                {/* Mobile Categories Menu */}
                <div className="md:hidden w-full overflow-x-auto no-scrollbar px-6 py-3 border-b border-slate-100 flex items-center gap-2 bg-white shrink-0">
                    {categories.map(category => {
                        const Icon = {
                            'Home': HomeIcon,
                            'BuildingOffice': BuildingOfficeIcon,
                            'Scale': ScaleIcon,
                            'MessageSquare': MessageSquareIcon,
                            'Banknotes': BanknotesIcon
                        }[category.iconName] || MessageSquareIcon;
                        return (
                            <button key={category.id} onClick={() => setActiveCategory(category.id)} className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all text-sm font-bold flex-shrink-0 ${activeCategory === category.id ? 'bg-slate-900 text-white' : 'bg-white border border-slate-100 text-slate-500 hover:bg-slate-50'}`}>
                                <Icon className="w-4 h-4" />
                                {category.name}
                            </button>
                        );
                    })}
                </div>
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-max">
                        {isLoading ? (
                            <div className="col-span-full text-center py-12"><SpinnerIcon className="w-8 h-8 animate-spin mx-auto text-slate-400"/></div>
                        ) : filteredTopics.length > 0 ? (
                            filteredTopics.map(topic => <TopicCard key={topic.id} topic={topic} onClick={() => handleSelectTopic(topic)} onDelete={onDeleteTopic} currentUser={currentUser} onLike={handleLikeTopic} />)
                        ) : (
                            <div className="col-span-full text-center py-12 text-slate-500 font-medium">
                                No hay temas aquí aún. ¡Sé el primero!
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <ForumRightPanel />
            <CreateTopicModal isOpen={isCreateTopicOpen} onClose={() => setIsCreateTopicOpen(false)} onSave={handleCreateTopic} categories={categories} activeCategory={activeCategory} />
            <TopicDetailModal topic={currentSelectedTopic} onClose={() => setSelectedTopic(null)} replies={topicReplies} onReplySubmit={handleCreateReply} currentUser={currentUser} onDeleteTopic={onDeleteTopic} onDeleteReply={onDeleteReply} onLikeTopic={handleLikeTopic} onRequireAuth={onRequireAuth} />
            
            <ConfirmationModal 
                isOpen={!!deleteTarget} 
                onClose={() => setDeleteTarget(null)} 
                onConfirm={handleConfirmDelete} 
                title={deleteTarget?.type === 'topic' ? 'Eliminar Tema' : 'Eliminar Respuesta'} 
                message="¿Estás seguro de que quieres eliminar este contenido? Esta acción no se puede deshacer." 
            />
        </div>
    );
};
