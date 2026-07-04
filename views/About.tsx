
import React from 'react';
import { MagnifyingGlassIcon, ShieldCheckIcon, UserIcon } from '../components/Icons';
import { FraudContextSection } from '../components/SharedComponents';

interface AboutProps {
    onGoHome: () => void;
}

export const About: React.FC<AboutProps> = ({ onGoHome }) => {
    return (
        <main className="w-[92%] max-w-[1500px] mx-auto pt-24 pb-8">
            <section className="w-full px-6 text-center mb-16">
                <h1 className="text-5xl sm:text-7xl font-black text-slate-900 mb-6 tracking-tighter">Nuestra Misión es <span className="text-red-600">Protegerte</span></h1>
                <p className="text-xl md:text-2xl text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto">Nacimos del hartazgo. De ver familias perder sus ahorros por falta de información. Decidimos que la verdad debe ser gratuita, accesible e instantánea.</p>
            </section>
            <section className="w-full px-6 mb-24">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 hover:-translate-y-2 transition-transform duration-300">
                        <div className="w-16 h-16 bg-red-50 rounded-3xl flex items-center justify-center mb-6"><MagnifyingGlassIcon className="w-8 h-8 text-red-600" /></div>
                        <h3 className="text-2xl font-black text-slate-900 mb-3">Transparencia Radical</h3>
                        <p className="text-slate-600 font-medium leading-relaxed">No ocultamos nada. Usamos datos públicos y algoritmos imparciales para mostrarte la realidad tal cual es.</p>
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 hover:-translate-y-2 transition-transform duration-300">
                        <div className="w-16 h-16 bg-teal-50 rounded-3xl flex items-center justify-center mb-6"><ShieldCheckIcon className="w-8 h-8 text-teal-600" /></div>
                        <h3 className="text-2xl font-black text-slate-900 mb-3">Seguridad Primero</h3>
                        <p className="text-slate-600 font-medium leading-relaxed">Tu patrimonio está en juego. Diseñamos cada herramienta pensando en reducir tu exposición al riesgo.</p>
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 hover:-translate-y-2 transition-transform duration-300">
                        <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mb-6"><UserIcon className="w-8 h-8 text-slate-900" /></div>
                        <h3 className="text-2xl font-black text-slate-900 mb-3">Poder para Ti</h3>
                        <p className="text-slate-600 font-medium leading-relaxed">Democratizamos la información que antes solo tenían los expertos. Tú tomas el control.</p>
                    </div>
                </div>
            </section>
            <section className="w-full px-6 mb-24"><FraudContextSection /></section>
            <section className="bg-slate-900 py-24 rounded-[3rem] w-full px-6 text-center relative overflow-hidden shadow-2xl shadow-slate-900/30 mx-4 md:mx-0">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-800 to-slate-900"></div>
                <div className="relative z-10 max-w-3xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">No te la juegues.<br/>Verifica antes de firmar.</h2>
                    <p className="text-lg text-slate-400 mb-10">Toma segundos, te ahorra años de problemas.</p>
                    <button onClick={onGoHome} className="bg-red-600 text-white font-bold py-4 px-10 rounded-full text-lg hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/40 transition duration-300">Analizar Inmobiliaria Ahora</button>
                </div>
            </section>
        </main>
    );
};
