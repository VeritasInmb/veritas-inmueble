import React from 'react';
import { MagnifyingGlassIcon, PlusIcon } from '../../../components/Icons';

export const AdminSection: React.FC<{ 
    title: string; 
    buttonText?: string; 
    onButtonClick?: () => void; 
    onSearch: (term: string) => void; 
    children: React.ReactNode; 
    extraButton?: React.ReactNode; 
}> = ({ title, buttonText, onButtonClick, onSearch, children, extraButton }) => (
    <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-100 border border-slate-50">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-2xl font-black text-slate-900">{title}</h2>
            <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-4">
                {extraButton}
                <div className="relative w-full sm:w-auto">
                    <input 
                        type="text" 
                        placeholder="Buscar..." 
                        onChange={(e) => onSearch(e.target.value)} 
                        className="pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-full focus:outline-none focus:border-red-500 focus:bg-white transition-all w-full" 
                    />
                    <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-3"/>
                </div>
                {buttonText && onButtonClick && (
                    <button 
                        onClick={onButtonClick} 
                        className="bg-red-600 text-white px-5 py-2.5 rounded-full font-semibold hover:bg-red-700 transition shadow-md w-full sm:w-auto flex items-center justify-center gap-2"
                    >
                        <PlusIcon className="w-4 h-4" />
                        {buttonText}
                    </button>
                )}
            </div>
        </div>
        <div className="overflow-x-auto">{children}</div>
    </div>
);
