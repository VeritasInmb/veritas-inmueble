
import React, { useEffect } from 'react';
import { ShieldCheckIcon, ScaleIcon } from '../components/Icons';

export const Terms: React.FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <main className="container mx-auto px-4 pt-24 pb-16">
            <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
                {/* Header Legal */}
                <div className="bg-slate-900 p-8 sm:p-12 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-600 rounded-full filter blur-[80px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4 text-red-500 font-bold uppercase tracking-widest text-xs">
                            <ScaleIcon className="w-5 h-5" />
                            <span>Marco Legal Vigente &bull; México 2025</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight">Términos y Condiciones de Uso</h1>
                        <p className="text-slate-400 text-lg max-w-2xl">
                            Este documento constituye un acuerdo legal vinculante. El uso de la plataforma VeritasInmueble implica la aceptación total de estas cláusulas.
                        </p>
                    </div>
                </div>

                {/* Contenido Legal */}
                <div className="p-8 sm:p-12 space-y-10 text-slate-700 leading-relaxed">
                    
                    {/* Cláusula 1 */}
                    <section>
                        <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-2">
                            1. Naturaleza del Servicio y Limitación de Responsabilidad
                        </h2>
                        <p className="mb-4">
                            <strong>VeritasInmueble</strong> es una plataforma tecnológica de intermediación que facilita el intercambio de información y opiniones entre usuarios sobre servicios inmobiliarios. De conformidad con lo establecido en el <strong>Código de Comercio</strong> y la legislación aplicable en materia de comercio electrónico en México:
                        </p>
                        <div className="bg-slate-50 p-6 rounded-2xl border-l-4 border-red-600 text-sm">
                            <p className="font-bold text-slate-900 mb-2">CLÁUSULA DE NO EDICIÓN (SAFE HARBOR):</p>
                            <p>
                                VeritasInmueble NO genera, edita, modifica ni valida la veracidad de las opiniones vertidas por los usuarios. Actuamos exclusivamente como un tercero alojador de datos. Por lo tanto, VeritasInmueble <strong>se deslinda de toda responsabilidad civil, penal o administrativa</strong> derivada de los comentarios, reseñas, calificaciones o material audiovisual subido por los usuarios. La responsabilidad legal recae única y exclusivamente en el autor de dicho contenido.
                            </p>
                        </div>
                    </section>

                    {/* Cláusula 2 */}
                    <section>
                        <h2 className="text-2xl font-black text-slate-900 mb-4">
                            2. Veracidad y Daño Moral
                        </h2>
                        <p className="mb-4">
                            Al publicar una reseña, el Usuario declara bajo protesta de decir verdad que dicha opinión está basada en una experiencia real y comprobable. Queda estrictamente prohibido el contenido difamatorio, calumnioso o que atente contra el honor de las empresas o personas, conforme a los artículos relativos al <strong>Daño Moral del Código Civil Federal</strong> y sus correlativos en las entidades federativas.
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4 text-slate-600">
                            <li>El Usuario acepta indemnizar y sacar en paz y a salvo a VeritasInmueble de cualquier demanda, litigio o reclamación derivada de su contenido.</li>
                            <li>Nos reservamos el derecho de eliminar, sin previo aviso, contenido que viole estas normas o ante orden de autoridad competente.</li>
                        </ul>
                    </section>

                    {/* Cláusula 3 */}
                    <section>
                        <h2 className="text-2xl font-black text-slate-900 mb-4">
                            3. Derecho de Réplica
                        </h2>
                        <p>
                            En cumplimiento con la <strong>Ley Reglamentaria del Artículo 6o.</strong>, Párrafo Primero, de la Constitución Política de los Estados Unidos Mexicanos, VeritasInmueble garantiza el derecho de réplica. Cualquier inmobiliaria o agente que considere que la información publicada es inexacta o falsa podrá solicitar su aclaración o rectificación a través de los canales oficiales de soporte de la plataforma, presentando la evidencia correspondiente.
                        </p>
                    </section>

                    {/* Cláusula 4 */}
                    <section>
                        <h2 className="text-2xl font-black text-slate-900 mb-4">
                            4. Propiedad Intelectual
                        </h2>
                        <p>
                            El Usuario conserva la autoría moral de sus reseñas, pero otorga a VeritasInmueble una licencia mundial, perpetua, irrevocable, libre de regalías y transferible para usar, reproducir, distribuir, preparar trabajos derivados y mostrar dicho contenido en relación con el servicio de la plataforma y sus sucesores.
                        </p>
                    </section>

                    {/* Cláusula 5 */}
                    <section>
                        <h2 className="text-2xl font-black text-slate-900 mb-4">
                            5. Privacidad y Datos Personales
                        </h2>
                        <p className="mb-4">
                            El tratamiento de sus datos personales se rige por lo dispuesto en la <strong>Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP)</strong>.
                        </p>
                        <div className="flex items-start gap-4 bg-blue-50 p-5 rounded-2xl">
                            <ShieldCheckIcon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                            <p className="text-sm text-blue-900">
                                No vendemos ni rentamos su información personal a terceros con fines de marketing sin su consentimiento explícito. Consulte nuestro Aviso de Privacidad Integral para más detalles sobre sus derechos ARCO.
                            </p>
                        </div>
                    </section>

                    {/* Cláusula 6 */}
                    <section>
                        <h2 className="text-2xl font-black text-slate-900 mb-4">
                            6. Jurisdicción y Competencia
                        </h2>
                        <p>
                            Para la interpretación y cumplimiento de los presentes términos, las partes se someten a la legislación aplicable en los Estados Unidos Mexicanos y a la jurisdicción de los tribunales competentes en la <strong>Ciudad de México</strong>, renunciando expresamente a cualquier otro fuero que pudiera corresponderles por razón de sus domicilios presentes o futuros.
                        </p>
                    </section>

                </div>
            </div>
        </main>
    );
};
