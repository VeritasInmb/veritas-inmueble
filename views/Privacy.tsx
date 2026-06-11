
import React, { useEffect } from 'react';
import { ShieldCheckIcon, EyeIcon, UserIcon } from '../components/Icons';

export const Privacy: React.FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <main className="container mx-auto px-4 pt-24 pb-16">
            <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
                {/* Header Legal */}
                <div className="bg-slate-900 p-8 sm:p-12 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full filter blur-[80px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4 text-blue-400 font-bold uppercase tracking-widest text-xs">
                            <ShieldCheckIcon className="w-5 h-5" />
                            <span>Cumplimiento LFPDPPP &bull; México 2025</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight">Aviso de Privacidad Integral</h1>
                        <p className="text-slate-400 text-lg max-w-2xl">
                            Su confianza es nuestro activo más valioso. Descubra cómo protegemos, usamos y gestionamos sus datos personales en VeritasInmueble.
                        </p>
                    </div>
                </div>

                {/* Contenido Legal */}
                <div className="p-8 sm:p-12 space-y-10 text-slate-700 leading-relaxed">
                    
                    {/* Cláusula 1: Identidad */}
                    <section>
                        <h2 className="text-2xl font-black text-slate-900 mb-4">
                            1. Identidad y Domicilio del Responsable
                        </h2>
                        <p className="mb-4">
                            En cumplimiento con la <strong>Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP)</strong>, VeritasInmueble (en adelante "El Responsable"), con domicilio para oír y recibir notificaciones en la Ciudad de México, hace de su conocimiento que es el responsable del uso y protección de sus datos personales.
                        </p>
                    </section>

                    {/* Cláusula 2: Datos Recabados */}
                    <section>
                        <h2 className="text-2xl font-black text-slate-900 mb-4">
                            2. Datos Personales Recabados
                        </h2>
                        <p className="mb-4">
                            Para las finalidades señaladas en el presente aviso de privacidad, podemos recabar sus datos personales de distintas formas: cuando usted nos los proporciona directamente (registro), cuando visita nuestro sitio de Internet o utiliza nuestros servicios en línea. Los datos que obtenemos pueden incluir:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4 text-slate-600 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                            <li><strong>Identificación:</strong> Nombre completo, correo electrónico, imagen de perfil (avatar).</li>
                            <li><strong>Autenticación:</strong> Credenciales de acceso (encriptadas) o tokens de autenticación de proveedores externos (Google/Firebase).</li>
                            <li><strong>Interacción:</strong> Opiniones, reseñas, comentarios en foros y calificaciones otorgadas a inmobiliarias.</li>
                            <li><strong>Datos Técnicos:</strong> Dirección IP, tipo de navegador y sistema operativo (con fines estadísticos y de seguridad).</li>
                        </ul>
                        <p className="mt-4 text-sm text-slate-500 italic">
                            * No recabamos datos personales sensibles como origen racial, creencias religiosas, afiliación política o datos de salud.
                        </p>
                    </section>

                    {/* Cláusula 3: Finalidades */}
                    <section>
                        <h2 className="text-2xl font-black text-slate-900 mb-4">
                            3. Finalidades del Tratamiento
                        </h2>
                        <p className="mb-2">Sus datos personales serán utilizados para las siguientes finalidades necesarias para el servicio:</p>
                        <ol className="list-decimal list-inside space-y-2 ml-4 text-slate-600">
                            <li>Verificar su identidad y permitir la creación de su cuenta de usuario.</li>
                            <li>Publicar sus reseñas y comentarios en la plataforma bajo el nombre de usuario que usted elija.</li>
                            <li>Detectar y prevenir fraudes, spam o conductas abusivas que violen nuestros Términos y Condiciones.</li>
                            <li>Mantener la seguridad de nuestra infraestructura tecnológica.</li>
                        </ol>
                    </section>

                    {/* Cláusula 4: Derechos ARCO */}
                    <section>
                        <h2 className="text-2xl font-black text-slate-900 mb-4">
                            4. Derechos ARCO (Acceso, Rectificación, Cancelación y Oposición)
                        </h2>
                        <p className="mb-4">
                            Usted tiene derecho a conocer qué datos personales tenemos de usted, para qué los utilizamos y las condiciones del uso que les damos (Acceso). Asimismo, es su derecho solicitar la corrección de su información personal en caso de que esté desactualizada, sea inexacta o incompleta (Rectificación); que la eliminemos de nuestros registros o bases de datos cuando considere que la misma no está siendo utilizada conforme a los principios, deberes y obligaciones previstas en la normativa (Cancelación); así como oponerse al uso de sus datos personales para fines específicos (Oposición).
                        </p>
                        <div className="bg-blue-50 p-6 rounded-2xl border-l-4 border-blue-600">
                            <p className="font-bold text-slate-900 mb-2">Ejercicio de Derechos:</p>
                            <p className="text-sm">
                                Para el ejercicio de cualquiera de los derechos ARCO, usted deberá presentar la solicitud respectiva a través del correo electrónico: <strong className="text-blue-700">privacidad@veritasinmueble.com</strong>.
                            </p>
                        </div>
                    </section>

                    {/* Cláusula 5: Transferencias */}
                    <section>
                        <h2 className="text-2xl font-black text-slate-900 mb-4">
                            5. Transferencia de Datos
                        </h2>
                        <p>
                            Le informamos que sus datos personales no serán compartidos con terceros ajenos a la operación de la plataforma (como proveedores de hosting o análisis de datos), salvo en los casos previstos por la Ley, como requerimientos de autoridades judiciales competentes para la persecución de delitos.
                        </p>
                    </section>

                    {/* Cláusula 6: Cookies */}
                    <section>
                        <h2 className="text-2xl font-black text-slate-900 mb-4">
                            6. Uso de Cookies y Tecnologías de Rastreo
                        </h2>
                        <p>
                            Le informamos que en nuestra página de Internet utilizamos cookies y otras tecnologías a través de las cuales es posible monitorear su comportamiento como usuario de Internet, brindarle un mejor servicio y experiencia de usuario al navegar en nuestra página.
                        </p>
                    </section>

                    {/* Cláusula 7: Cambios */}
                    <section>
                        <h2 className="text-2xl font-black text-slate-900 mb-4">
                            7. Cambios al Aviso de Privacidad
                        </h2>
                        <p>
                            El presente aviso de privacidad puede sufrir modificaciones, cambios o actualizaciones derivadas de nuevos requerimientos legales; de nuestras propias necesidades por los productos o servicios que ofrecemos; de nuestras prácticas de privacidad; de cambios en nuestro modelo de negocio, o por otras causas. Nos comprometemos a mantenerlo informado sobre los cambios que pueda sufrir el presente aviso de privacidad a través de este mismo sitio web.
                        </p>
                        <p className="mt-8 text-xs text-slate-400">Última actualización: Agosto 2025</p>
                    </section>

                </div>
            </div>
        </main>
    );
};
