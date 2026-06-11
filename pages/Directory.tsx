import React, { useState, useMemo } from 'react';
import { Inmobiliaria } from '../types';
import { AgencyCard } from '../components/agency/AgencyCard';
import { MagnifyingGlassIcon } from '../components/Icons';

interface DirectoryProps {
    agencies: Inmobiliaria[];
    onNavigate: (view: 'profile', agency: Inmobiliaria) => void;
    onToggleCompare: (agency: Inmobiliaria) => void;
    comparisonList: Inmobiliaria[];
}

export const Directory: React.FC<DirectoryProps> = ({ agencies, onNavigate, onToggleCompare, comparisonList }) => {
    const [directorySearchTerm, setDirectorySearchTerm] = useState('');
    const [directoryFilters, setDirectoryFilters] = useState({ state: 'all', sortBy: 'score', order: 'desc' });

    const uniqueStates = useMemo(() => ['all', ...Array.from(new Set(agencies.map(a => a.estado).filter(Boolean))).sort()], [agencies]);

    const filteredAndSortedDirectoryAgencies = useMemo(() => { 
        let r = directorySearchTerm.trim() ? agencies.filter(a => a.nombre.toLowerCase().includes(directorySearchTerm.toLowerCase())) : [...agencies]; 
        if (directoryFilters.state !== 'all') r = r.filter(a => a.estado === directoryFilters.state); 
        r.sort((a, b) => directoryFilters.sortBy === 'score' ? Number(b.score ?? 0) - Number(a.score ?? 0) : (a.estado || '').localeCompare(b.estado || '')); 
        return directoryFilters.order === 'asc' ? r : r.reverse(); 
    }, [agencies, directoryFilters, directorySearchTerm]);

    return (
        <main className="container mx-auto px-4 pt-24 pb-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
                <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 tracking-tight">Directorio <span className="text-red-600">Oficial</span></h1>
                <p className="text-xl text-slate-600 font-medium leading-relaxed">Navega por la lista definitiva de inmobiliarias analizadas. Filtra, compara y decide con datos.</p>
            </div>
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-4 mb-8 flex flex-col sm:flex-row items-center gap-4 sticky top-24 z-30">
                <div className="relative flex-1 w-full">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"/>
                    <input type="text" value={directorySearchTerm} onChange={(e) => setDirectorySearchTerm(e.target.value)} placeholder="Busca por nombre..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-full focus:outline-none focus:border-red-500 focus:bg-white transition-all font-medium"/>
                </div>
                <div className="flex gap-3 w-full sm:w-auto overflow-x-auto no-scrollbar">
                    <select value={directoryFilters.state} onChange={(e) => setDirectoryFilters(f => ({ ...f, state: e.target.value }))} className="bg-slate-50 border-2 border-slate-100 rounded-full px-4 py-3 font-bold text-slate-700 focus:outline-none focus:border-red-500 appearance-none cursor-pointer transition-colors">
                        {uniqueStates.map(state => <option key={state} value={state}>{state === 'all' ? 'Todos los Estados' : state}</option>)}
                    </select>
                    <button onClick={() => setDirectoryFilters(f => ({ ...f, sortBy: 'score' }))} className={`px-5 py-3 rounded-full font-bold transition-all flex-shrink-0 ${directoryFilters.sortBy === 'score' ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Score</button>
                    <button onClick={() => setDirectoryFilters(f => ({ ...f, sortBy: 'estado' }))} className={`px-5 py-3 rounded-full font-bold transition-all flex-shrink-0 ${directoryFilters.sortBy === 'estado' ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Estado</button>
                    <button onClick={() => setDirectoryFilters(f => ({ ...f, order: f.order === 'asc' ? 'desc' : 'asc' }))} className="w-12 h-12 rounded-full flex items-center justify-center font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all flex-shrink-0 text-lg">
                        {directoryFilters.order === 'asc' ? '↑' : '↓'}
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAndSortedDirectoryAgencies.map((agency) => <AgencyCard key={agency.id} agency={agency} onSelect={(agency) => onNavigate('profile', agency)} isSelected={comparisonList.some(item => item.id === agency.id)} onToggleCompare={onToggleCompare} showCompare={true} />)}
            </div>
            {filteredAndSortedDirectoryAgencies.length === 0 && <div className="text-center py-24"><p className="text-2xl font-black text-slate-400">No encontramos nada...</p><p className="text-slate-500 mt-2">Intenta ajustar tus filtros.</p></div>}
        </main>
    );
};