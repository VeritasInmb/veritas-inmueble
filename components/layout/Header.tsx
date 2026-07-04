
import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

import { LogoutIcon, BellIcon, MenuIcon, CloseIcon, WarningIcon, SpinnerIcon } from '../Icons';
import { UserAvatar } from '../ui/UserAvatar';
import { auth } from '../../services/firebase';

interface HeaderProps {
    isLoggedIn: boolean;
    onReviewClick: () => void;
    onLogout: () => void;
    notificationsCount: number;
    userAvatar?: string;
    userName?: string;
    userColor?: string; // Persistent profile color
    userId?: string; // For deterministic color fallback
    emailVerified?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isLoggedIn, onReviewClick, onLogout, notificationsCount, userAvatar, userName, userColor, userId, emailVerified }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [cooldown, setCooldown] = useState(0); // Cooldown state
    const pathname = usePathname();
    
    // Timer para el cooldown
    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    // Helper to close menu on nav
    const closeMenu = () => setIsMenuOpen(false);

    const isActive = (path: string) => pathname === path ? 'bg-slate-900 text-white' : 'hover:bg-gray-100 font-semibold text-slate-600';

    const handleResendVerification = async () => {
        if (!auth.currentUser) return;
        if (cooldown > 0) return; // Prevent spam

        setIsResending(true);
        try {
            await auth.currentUser.sendEmailVerification();
            setCooldown(60); // Activar espera de 60s
            alert("Correo enviado. Por favor revisa tu bandeja de entrada y la carpeta de Spam.");
        } catch (error: any) {
            console.error(error);
            let msg = "Error al enviar.";
            if (error.code === 'auth/too-many-requests') msg = "Demasiados intentos. Espera unos minutos.";
            alert(msg);
        } finally {
            setIsResending(false);
        }
    };

    const handleReload = () => {
        window.location.reload();
    };

    return (
        <>
            <header className="fixed w-full top-4 z-50 px-4">
                <nav className="w-[92%] max-w-[1500px] mx-auto bg-white/90 backdrop-blur-xl rounded-full shadow-xl border border-gray-100 py-3 px-6 flex justify-between items-center">
                    <Link href="/" className="text-xl font-black tracking-tighter text-slate-900 flex items-center gap-1">
                        Veritas<span className="text-red-600">Inmueble</span>
                    </Link>
                    
                    <div className="hidden lg:flex items-center gap-1">
                        <Link href="/" className={`${isActive('/')} px-4 py-2 rounded-full transition-all text-sm`}>Inicio</Link>
                        <Link href="/directorio" className={`${isActive('/directorio')} px-4 py-2 rounded-full transition-all text-sm`}>Directorio</Link>
                        <Link href="/foro" className={`${isActive('/foro')} px-4 py-2 rounded-full transition-all text-sm`}>Foro</Link>
                        <Link href="/nosotros" className={`${isActive('/nosotros')} px-4 py-2 rounded-full transition-all text-sm`}>Nosotros</Link>
                        <Link href="/blog" className={`${isActive('/blog')} px-4 py-2 rounded-full transition-all text-sm`}>Blog</Link>
                        
                        <button onClick={onReviewClick} className="bg-red-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-red-700 transition-all shadow-md ml-2">
                            Solicitar Revisión
                        </button>

                        {isLoggedIn ? (
                            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-slate-100">
                                <Link href="/perfil" className={`relative flex items-center gap-2 px-3 py-2 rounded-full transition-all hover:bg-gray-100 ${pathname === '/perfil' ? 'bg-gray-100' : ''}`}>
                                    <div className="relative">
                                        <UserAvatar 
                                            name={userName || 'Usuario'} 
                                            avatarUrl={userAvatar} 
                                            color={userColor} 
                                            userId={userId}
                                            className="w-8 h-8"
                                        />
                                        {notificationsCount > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full">{notificationsCount}</span>
                                        )}
                                    </div>
                                    <span className="text-sm font-semibold text-slate-700 hidden xl:inline max-w-[100px] truncate">{userName?.split(' ')[0]}</span>
                                </Link>
                                <button onClick={onLogout} title="Cerrar Sesión" className="bg-gray-100 p-2 rounded-full text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all">
                                    <LogoutIcon className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-slate-100">
                                <Link href="/login?mode=register" 
                                    className="text-slate-500 font-bold text-sm px-4 py-2 hover:bg-slate-50 hover:text-red-600 transition-colors rounded-full"
                                >
                                    Registrarse
                                </Link>
                                <Link href="/login" className="bg-red-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-red-700 transition-all shadow-md flex items-center">
                                    Iniciar Sesión
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="lg:hidden flex items-center gap-3">
                        {isLoggedIn && notificationsCount > 0 && (
                            <Link href="/perfil" className="relative bg-gray-100 p-2 rounded-full text-gray-600 transition-transform duration-200 active:scale-95">
                                <BellIcon className="w-5 h-5" />
                                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full">{notificationsCount}</span>
                            </Link>
                        )}
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="bg-gray-100 p-2 rounded-full text-gray-600 transition-transform duration-200 active:scale-95">
                            {isMenuOpen ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
                        </button>
                    </div>
                </nav>

                {isMenuOpen && (
                    <div className="lg:hidden fixed top-20 left-4 right-4 bg-white rounded-3xl border border-gray-100 shadow-2xl z-50 p-2 overflow-hidden">
                        <div className="flex flex-col gap-1">
                            {isLoggedIn && (
                                <Link href="/perfil" onClick={closeMenu} className="w-full text-left text-gray-700 hover:bg-gray-50 px-4 py-3 rounded-2xl font-semibold transition-all flex items-center gap-3 bg-slate-50">
                                    <UserAvatar 
                                        name={userName || 'Usuario'} 
                                        avatarUrl={userAvatar} 
                                        color={userColor} 
                                        userId={userId}
                                        className="w-8 h-8"
                                    />
                                    <span>Mi Perfil {notificationsCount > 0 && <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-2">{notificationsCount} new</span>}</span>
                                </Link>
                            )}
                            <Link href="/" onClick={closeMenu} className="w-full text-left text-gray-700 hover:bg-gray-50 px-4 py-3 rounded-2xl font-semibold transition-all">Inicio</Link>
                            <Link href="/directorio" onClick={closeMenu} className="w-full text-left text-gray-700 hover:bg-gray-50 px-4 py-3 rounded-2xl font-semibold transition-all">Directorio</Link>
                            <Link href="/foro" onClick={closeMenu} className="w-full text-left text-gray-700 hover:bg-gray-50 px-4 py-3 rounded-2xl font-semibold transition-all">Foro</Link>
                            <Link href="/nosotros" onClick={closeMenu} className="w-full text-left text-gray-700 hover:bg-gray-50 px-4 py-3 rounded-2xl font-semibold transition-all">Nosotros</Link>
                            <Link href="/blog" onClick={closeMenu} className="w-full text-left text-gray-700 hover:bg-gray-50 px-4 py-3 rounded-2xl font-semibold transition-all">Blog</Link>
                            
                            <button onClick={() => { closeMenu(); onReviewClick(); }} className="w-full text-center font-semibold px-4 py-3 rounded-2xl bg-red-600 text-white hover:bg-red-700 mt-2 transition-all shadow-md shadow-red-600/20">
                                Solicitar Revisión
                            </button>

                            {isLoggedIn ? (
                                <>
                                    <button onClick={() => { closeMenu(); onLogout(); }} className="w-full text-left flex items-center gap-3 text-gray-600 hover:bg-gray-50 px-4 py-3 rounded-2xl font-semibold mt-2 transition-all">
                                        <LogoutIcon className="w-5 h-5" />
                                        <span>Cerrar Sesión</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" onClick={closeMenu} className="w-full text-center font-semibold px-4 py-3 rounded-2xl bg-red-600 text-white hover:bg-red-700 mt-2 transition-all shadow-md block">
                                        Iniciar Sesión
                                    </Link>
                                    <Link href="/login?mode=register" 
                                        onClick={closeMenu} 
                                        className="w-full text-center font-semibold px-4 py-3 rounded-2xl text-slate-500 hover:bg-slate-50 hover:text-red-600 mt-1 transition-all block"
                                    >
                                        Registrarse
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
                
                {/* VERIFICATION BANNER */}
                {isLoggedIn && emailVerified === false && (
                    <div className="absolute top-24 left-0 right-0 flex justify-center px-4 pointer-events-none z-40">
                        <div className="bg-amber-100 border border-amber-200 text-amber-800 px-4 py-2 rounded-xl shadow-lg flex flex-col sm:flex-row items-center gap-2 sm:gap-4 pointer-events-auto animate-fade-in-down">
                            <div className="flex items-center gap-2">
                                <WarningIcon className="w-5 h-5 text-amber-600"/>
                                <span className="text-sm font-bold">Tu correo no está verificado. No podrás publicar.</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={handleResendVerification} 
                                    disabled={isResending || cooldown > 0}
                                    className="text-xs bg-white border border-amber-200 px-3 py-1 rounded-full font-bold hover:bg-amber-50 transition flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isResending ? <SpinnerIcon className="w-3 h-3"/> : 'Reenviar correo'}
                                    {cooldown > 0 && <span>({cooldown}s)</span>}
                                </button>
                                <button 
                                    onClick={handleReload}
                                    className="text-xs bg-amber-600 text-white px-3 py-1 rounded-full font-bold hover:bg-amber-700 transition"
                                >
                                    Ya lo verifiqué
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </header>
        </>
    );
};