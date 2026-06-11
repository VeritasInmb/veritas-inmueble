
import React from 'react';
import { Link } from 'react-router-dom';

interface FooterProps {
    showAdminLink: boolean;
    className?: string;
}

export const Footer: React.FC<FooterProps> = ({ showAdminLink, className }) => (
    <footer className={`bg-slate-900 text-slate-400 py-10 ${className ?? 'mt-12'}`}>
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center space-x-2">
                 <span className="text-2xl font-black text-white">Veritas<span className="text-red-500">.</span></span>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-sm font-medium">
                 <Link to="/terminos" className="hover:text-white transition-colors">Términos</Link>
                 <Link to="/privacidad" className="hover:text-white transition-colors">Privacidad</Link>
                 {showAdminLink && <Link to="/admin" className="hover:text-white transition-colors">Admin</Link>}
            </div>
            <p className="text-sm font-medium opacity-50">&copy; 2025 Veritas Inmueble</p>
        </div>
    </footer>
);
