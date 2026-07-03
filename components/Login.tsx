import React, { useState, useEffect, useMemo } from 'react';
import { auth, db } from '../services/firebase';
import { SpinnerIcon, WarningIcon, UserIcon, InboxIcon, SendIcon } from './Icons';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

interface LoginProps {
    onSkip?: () => void;
}

const loginSchema = z.object({
    email: z.string().min(1, "El correo es requerido").email("Correo electrónico inválido"),
    password: z.string().min(1, "La contraseña es requerida"),
});

const registerSchema = z.object({
    fullName: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    email: z.string().min(1, "El correo es requerido").email("Correo electrónico inválido"),
    password: z.string()
        .min(8, "Mínimo 8 caracteres")
        .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
        .regex(/[0-9]/, "Debe contener al menos un número"),
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
});

type FormValues = {
    email?: string;
    password?: string;
    fullName?: string;
    confirmPassword?: string;
};

export const Login: React.FC<LoginProps> = ({ onSkip }) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isRegistering, setIsRegistering] = useState(false);
    
    useEffect(() => {
        if (searchParams?.get('mode') === 'register') {
            setIsRegistering(true);
        }
    }, [searchParams]);

    const schema = isRegistering ? registerSchema : loginSchema;
    
    const { register, handleSubmit, formState: { errors }, reset, clearErrors } = useForm<FormValues>({
        resolver: zodResolver(schema) as any,
        mode: 'onChange'
    });
    
    const [globalError, setGlobalError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // Nuevo Estado: Correo enviado
    const [isVerificationSent, setIsVerificationSent] = useState(false);
    const [resending, setResending] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    // Timer para el cooldown de reenvío
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const getFriendlyErrorMessage = (errorCode: string) => {
        switch (errorCode) {
            case 'auth/email-already-in-use':
                return 'Este correo ya está registrado. Intenta iniciar sesión.';
            case 'auth/invalid-email':
                return 'El correo electrónico no es válido.';
            case 'auth/user-not-found':
                return 'No existe una cuenta con este correo.';
            case 'auth/wrong-password':
                return 'Contraseña incorrecta.';
            case 'auth/too-many-requests':
                return 'Demasiados intentos. Por seguridad, espera unos minutos e intenta de nuevo.';
            case 'auth/network-request-failed':
                return 'Error de conexión. Revisa tu internet.';
            default:
                return 'Ocurrió un error inesperado. Intenta nuevamente.';
        }
    };

    const onSubmit = async (data: FormValues) => {
        setIsLoading(true);
        setGlobalError(null);
        
        try {
            if (isRegistering) {
                // --- REGISTRO ---
                const userCredential = await auth.createUserWithEmailAndPassword(data.email!, data.password!);
                if (userCredential.user) {
                    await userCredential.user.updateProfile({ displayName: data.fullName });
                    
                    const uid = userCredential.user.uid;
                    const initialData = {
                        nombre: data.fullName,
                        email: data.email,
                        rol: 'usuario',
                        verificado: false, 
                        profileColor: '#cccccc', 
                        createdAt: new Date()
                    };
                    
                    await db.collection('usuarios').doc(uid).set(initialData, { merge: true });
                    await userCredential.user.sendEmailVerification();
                    
                    setIsVerificationSent(true);
                }

            } else {
                // --- LOGIN ---
                await auth.signInWithEmailAndPassword(data.email!, data.password!);
                router.push('/');
            }
        } catch (error: any) {
            console.error("Auth Error:", error);
            const msg = error.code ? getFriendlyErrorMessage(error.code) : error.message;
            setGlobalError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendLink = async () => {
        if (resendCooldown > 0) return;
        
        if (auth.currentUser) {
            setResending(true);
            try {
                await auth.currentUser.sendEmailVerification();
                setResendCooldown(60);
                alert("Correo reenviado. Revisa tu bandeja de entrada y Spam.");
            } catch (e: any) {
                setGlobalError(getFriendlyErrorMessage(e.code));
            } finally {
                setResending(false);
            }
        }
    };

    const handleVerificationComplete = async () => {
        if (auth.currentUser) {
            await auth.currentUser.reload();
            if (auth.currentUser.emailVerified) {
                router.push('/');
            } else {
                window.location.reload(); 
            }
        } else {
            router.push('/');
        }
    };

    const toggleMode = () => {
        setIsRegistering(!isRegistering);
        setGlobalError(null);
        clearErrors();
        reset();
        setIsVerificationSent(false);
    };

    // PANTALLA: CORREO ENVIADO (Éxito Registro)
    if (isVerificationSent) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center py-12 px-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-red-600 rounded-full filter blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                
                <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-2xl flex flex-col items-center animate-fade-in-up max-w-md w-full text-center border border-slate-100 relative z-10">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 shadow-sm">
                        <InboxIcon className="w-10 h-10 text-green-600" />
                    </div>
                    
                    <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">¡Casi listo!</h2>
                    <p className="text-slate-600 font-medium text-base mb-8 leading-relaxed">
                        Hemos enviado un enlace de confirmación a tu correo.
                    </p>
                    
                    <div className="bg-slate-50 p-4 rounded-2xl mb-8 text-sm text-slate-500 border border-slate-100">
                        <p>Haz clic en el enlace del correo para activar tu cuenta y luego presiona el botón de abajo.</p>
                        <p className="mt-2 text-xs italic text-slate-400">(Revisa la carpeta de Spam si no lo ves)</p>
                    </div>

                    <button 
                        onClick={handleVerificationComplete}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-lg hover:-translate-y-1"
                    >
                        Ya verifiqué mi correo &rarr;
                    </button>

                    <div className="mt-6">
                        <button 
                            onClick={handleResendLink}
                            disabled={resending || resendCooldown > 0}
                            className="text-sm font-bold text-slate-400 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto transition-colors"
                        >
                            {resending ? <SpinnerIcon className="w-4 h-4"/> : <SendIcon className="w-4 h-4"/>}
                            {resending ? 'Enviando...' : resendCooldown > 0 ? `Esperar ${resendCooldown}s` : 'No recibí el correo, reenviar'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-28 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md mx-auto bg-white p-6 sm:p-8 space-y-6 rounded-3xl shadow-xl relative border border-slate-100">
                <div className="text-center">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Veritas<span className="text-red-600">Inmueble</span></h1>
                    <p className="mt-2 text-slate-500 font-medium text-sm sm:text-base">
                        {isRegistering ? 'Crea tu cuenta para unirte a la comunidad.' : 'Bienvenido. Inicia sesión para continuar.'}
                    </p>
                </div>
                
                <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
                    
                    {isRegistering && (
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Nombre Completo</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <UserIcon className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    {...register("fullName")}
                                    className={`block w-full pl-10 pr-3 py-3 border-2 ${errors.fullName ? 'border-red-300 focus:border-red-500' : 'border-slate-100 focus:border-red-500'} rounded-2xl bg-slate-50 focus:outline-none focus:bg-white transition-colors`}
                                    placeholder="Ej. Juan Pérez"
                                />
                            </div>
                            {errors.fullName && <p className="mt-1 text-xs text-red-500 ml-1 font-medium">{errors.fullName.message}</p>}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Correo Electrónico</label>
                        <input
                            type="email"
                            {...register("email")}
                            className={`block w-full px-4 py-3 border-2 ${errors.email ? 'border-red-300 focus:border-red-500' : 'border-slate-100 focus:border-red-500'} rounded-2xl bg-slate-50 focus:outline-none focus:bg-white transition-colors`}
                            placeholder="tu@correo.com"
                        />
                        {errors.email && <p className="mt-1 text-xs text-red-500 ml-1 font-medium">{errors.email.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Contraseña</label>
                        <input
                            type="password"
                            {...register("password")}
                            className={`block w-full px-4 py-3 border-2 ${errors.password ? 'border-red-300 focus:border-red-500' : 'border-slate-100 focus:border-red-500'} rounded-2xl bg-slate-50 focus:outline-none focus:bg-white transition-colors`}
                            placeholder="••••••••"
                        />
                        {errors.password && <p className="mt-1 text-xs text-red-500 ml-1 font-medium">{errors.password.message}</p>}
                    </div>

                    {isRegistering && (
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Confirmar Contraseña</label>
                            <input
                                type="password"
                                {...register("confirmPassword")}
                                className={`block w-full px-4 py-3 border-2 ${errors.confirmPassword ? 'border-red-300 focus:border-red-500' : 'border-slate-100 focus:border-red-500'} rounded-2xl bg-slate-50 focus:outline-none focus:bg-white transition-colors`}
                                placeholder="••••••••"
                            />
                            {errors.confirmPassword && <p className="mt-1 text-xs text-red-500 ml-1 font-medium">{errors.confirmPassword.message}</p>}
                        </div>
                    )}

                    {globalError && (
                        <div className="flex items-center text-sm text-red-600 bg-red-50 p-3 rounded-xl animate-pulse">
                            <WarningIcon className="w-5 h-5 mr-2 flex-shrink-0"/>
                            <span className="font-medium">{globalError}</span>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-2xl text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-all shadow-lg shadow-red-600/30"
                        >
                            {isLoading ? <SpinnerIcon className="w-5 h-5"/> : (isRegistering ? 'Crear Cuenta y Enviar Link' : 'Entrar')}
                        </button>
                    </div>
                </form>
                
                <div className="space-y-4 pt-4 border-t border-slate-100">
                    <button onClick={toggleMode} className="w-full text-center text-sm text-slate-500 hover:text-slate-800 transition-colors">
                        {isRegistering ? <span>¿Ya tienes cuenta? <span className="text-red-600 font-bold">Inicia Sesión</span></span> : <span>¿No tienes cuenta? <span className="text-red-600 font-bold">Regístrate</span></span>}
                    </button>
                    {onSkip && !isRegistering && <button onClick={onSkip} className="w-full text-center text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">Continuar como Invitado &rarr;</button>}
                </div>
            </div>
        </div>
    );
};