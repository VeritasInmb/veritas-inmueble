"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { firebase } from '../services/firebase';
import { ShieldCheckIcon, WarningIcon } from '../components/Icons';

export const ClaimAgency: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const agencyId = searchParams?.get('id');
    const agencyName = searchParams?.get('name');

    const [formData, setFormData] = useState({
        representante: '',
        puesto: '',
        correo: '',
        telefono: '',
        enlace: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        if (!agencyId) {
            setError("No se especificó la agencia a reclamar.");
        }
    }, [agencyId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        
        // Basic validation
        if (!formData.correo.includes('@') || formData.correo.endsWith('@gmail.com') || formData.correo.endsWith('@hotmail.com')) {
            setError("Por favor, utiliza un correo corporativo de la agencia.");
            return;
        }

        setIsLoading(true);
        try {
            await firebase.firestore().collection('claim_requests').add({
                agencyId,
                agencyName: agencyName || 'Desconocida',
                representante: formData.representante,
                puesto: formData.puesto,
                correo: formData.correo,
                telefono: formData.telefono,
                enlace: formData.enlace,
                status: 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            setIsSuccess(true);
        } catch (err: any) {
            console.error("Error al enviar solicitud:", err);
            setError("Ocurrió un error al enviar tu solicitud. Intenta nuevamente.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <main className="container mx-auto px-4 pt-32 pb-16 min-h-[70vh] flex items-center justify-center">
                <div className="max-w-xl w-full bg-white rounded-3xl p-10 text-center shadow-xl border border-slate-100">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldCheckIcon className="w-10 h-10 text-emerald-600" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 mb-4">Solicitud Recibida</h1>
                    <p className="text-slate-600 text-lg mb-8">
                        Hemos recibido tu solicitud para reclamar el perfil de <strong>{agencyName}</strong>. 
                        Nuestro equipo de validación revisará la información y te contactará al correo corporativo proporcionado en las próximas 48 horas.
                    </p>
                    <button 
                        onClick={() => router.push('/')}
                        className="bg-slate-900 text-white font-bold py-4 px-8 rounded-full hover:bg-slate-800 transition"
                    >
                        Volver al Inicio
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="container mx-auto px-4 pt-24 pb-16 min-h-[80vh]">
            <div className="max-w-2xl mx-auto bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
                <div className="bg-slate-900 p-8 sm:p-10 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full filter blur-[80px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3 text-blue-400 font-bold uppercase tracking-widest text-xs">
                            <ShieldCheckIcon className="w-4 h-4" />
                            <span>Validación de Identidad</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-black mb-2 leading-tight">Reclamar Perfil</h1>
                        <p className="text-slate-400 text-base">
                            Estás solicitando el control administrativo del perfil de <strong>{agencyName || 'la Inmobiliaria'}</strong>.
                        </p>
                    </div>
                </div>

                <div className="p-8 sm:p-10">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium flex items-start gap-2 border border-red-100">
                            <WarningIcon className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Nombre del Representante Legal</label>
                                <input 
                                    type="text" 
                                    name="representante"
                                    required
                                    value={formData.representante}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
                                    placeholder="Ej. Juan Pérez"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Puesto en la Empresa</label>
                                <input 
                                    type="text" 
                                    name="puesto"
                                    required
                                    value={formData.puesto}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
                                    placeholder="Ej. Director General"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Correo Corporativo</label>
                            <input 
                                type="email" 
                                name="correo"
                                required
                                value={formData.correo}
                                onChange={handleChange}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
                                placeholder="tu-nombre@tu-inmobiliaria.com"
                            />
                            <p className="text-xs text-slate-500 mt-1.5 font-medium">No aceptamos correos genéricos (Gmail, Hotmail, etc.) por motivos de seguridad.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Teléfono Directo / Celular</label>
                            <input 
                                type="tel" 
                                name="telefono"
                                required
                                value={formData.telefono}
                                onChange={handleChange}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
                                placeholder="10 dígitos"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Enlace Corporativo o LinkedIn</label>
                            <input 
                                type="url" 
                                name="enlace"
                                required
                                value={formData.enlace}
                                onChange={handleChange}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
                                placeholder="https://..."
                            />
                            <p className="text-xs text-slate-500 mt-1.5 font-medium">Proporciona el enlace a tu sitio web o al LinkedIn oficial de la empresa para validar tu identidad.</p>
                        </div>

                        <div className="pt-4">
                            <button 
                                type="submit" 
                                disabled={isLoading || !agencyId}
                                className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-slate-900/20"
                            >
                                {isLoading ? 'Procesando...' : 'Enviar Solicitud de Validación'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
};
