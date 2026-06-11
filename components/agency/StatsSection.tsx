
import React from 'react';
import { AnimatedNumber } from '../ui/AnimatedNumber';

export const StatsSection: React.FC<{ stats: { agencies: number; reviews: number; frauds: number; } }> = ({ stats }) => {
    return (
        <section className="relative my-16 bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-900/30">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-800 to-slate-900"></div>
            <div className="relative z-10 px-6 py-12 sm:px-12 sm:py-16 text-center">
                <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 tracking-tight">El Poder de la <span className="text-red-500">Verdad</span></h2>
                <p className="text-slate-400 text-lg mb-12 max-w-2xl mx-auto font-medium leading-relaxed">Números reales. Riesgos reales. Protegemos tu patrimonio con datos.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/10 hover:bg-white/10 transition">
                        <p className="text-5xl sm:text-6xl font-black text-white mb-2">+<AnimatedNumber value={stats.agencies} /></p>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Inmobiliarias Auditadas</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/10 hover:bg-white/10 transition">
                        <p className="text-5xl sm:text-6xl font-black text-white mb-2">+<AnimatedNumber value={stats.reviews} /></p>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Testimonios Reales</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/10 hover:bg-white/10 transition group">
                        <p className="text-5xl sm:text-6xl font-black text-red-500 group-hover:scale-110 transition-transform mb-2">+<AnimatedNumber value={stats.frauds} /></p>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Fraudes Prevenidos</p>
                    </div>
                </div>
            </div>
        </section>
    );
};
