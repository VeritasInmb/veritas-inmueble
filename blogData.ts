import { BlogPost } from './types';

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: '5 Cláusulas Abusivas que Debes Evitar en tu Contrato de Arrendamiento',
    author: 'Equipo Veritas',
    date: '15 de Julio, 2025',
    summary: 'Antes de firmar, es crucial que identifiques ciertas cláusulas que pueden poner en riesgo tus derechos como inquilino. Te enseñamos a detectarlas.',
    content: `
      <p>Firmar un contrato de arrendamiento es un paso emocionante, pero también uno de los momentos más críticos en el proceso de alquilar una vivienda. Un contrato bien redactado protege tanto al arrendador como al arrendatario, pero a menudo se incluyen cláusulas que benefician desproporcionadamente a una de las partes. Aquí te presentamos 5 cláusulas abusivas comunes que debes buscar y negociar antes de firmar:</p>
      <h3 class="text-2xl font-bold mt-6 mb-3">1. Renovación Automática con Aumento Injustificado</h3>
      <p>Algunos contratos estipulan que si no avisas con 90 días de antelación tu intención de no renovar, el contrato se renueva automáticamente por otro año con un aumento de renta del 15% o más. La ley suele regular los aumentos, y esta cláusula puede ser ilegal. Busca que el aumento esté topado a la inflación o un porcentaje razonable (no más del 10%).</p>
      <h3 class="text-2xl font-bold mt-6 mb-3">2. Penalizaciones Excesivas por Terminación Anticipada</h3>
      <p>Es normal que exista una penalización si decides terminar el contrato antes de tiempo. Sin embargo, una cláusula que te obligue a pagar la totalidad de los meses restantes es abusiva. Lo justo es una penalización de uno o dos meses de renta.</p>
      <h3 class="text-2xl font-bold mt-6 mb-3">3. Renuncia a Derechos Legales</h3>
      <p>Cuidado con frases como "El arrendatario renuncia a los derechos establecidos en el artículo XYZ del Código Civil". Nunca debes renunciar a tus derechos básicos, como el derecho a la privacidad o a que la vivienda esté en condiciones habitables.</p>
      <h3 class="text-2xl font-bold mt-6 mb-3">4. Responsabilidad Total del Mantenimiento</h3>
      <p>El arrendador es responsable del mantenimiento mayor y de las reparaciones estructurales (problemas de tuberías, eléctricos, humedades). Una cláusula que te haga responsable de todas las reparaciones, sin importar la causa, es injusta. El inquilino solo debe cubrir daños por mal uso o desgaste menor.</p>
      <h3 class="text-2xl font-bold mt-6 mb-3">5. Retención Indebida del Depósito de Garantía</h3>
      <p>El contrato debe especificar claramente las condiciones y el plazo para la devolución del depósito. Cláusulas ambiguas que permiten al arrendador retener el depósito por "desgaste normal" son una señal de alerta. El depósito solo debe cubrir daños extraordinarios o rentas impagadas.</p>
      <p class="mt-6 font-semibold">Recuerda: la mejor herramienta es la información. Lee cada línea, pregunta todo lo que no entiendas y, si es necesario, busca asesoría legal. ¡Tu tranquilidad no tiene precio!</p>
    `,
    imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1973&auto=format&fit=crop',
  },
  {
    id: '2',
    title: '¿Cómo Verificar si una Inmobiliaria está Registrada en PROFECO?',
    author: 'Ana de la Fuente',
    date: '05 de Julio, 2025',
    summary: 'El Contrato de Adhesión de PROFECO es un indicador clave de la seriedad de una inmobiliaria. Te mostramos cómo verificarlo en unos simples pasos.',
    content: `
      <p>Una de las formas más efectivas de medir la confiabilidad de una inmobiliaria en México es verificar si tiene su "Contrato de Adhesión" registrado ante la Procuraduría Federal del Consumidor (PROFECO). Este registro significa que el contrato que usarán contigo ha sido revisado por la autoridad y no contiene cláusulas abusivas. Aquí te explicamos cómo puedes hacer esta verificación tú mismo.</p>
      <h3 class="text-2xl font-bold mt-6 mb-3">¿Qué es el Contrato de Adhesión?</h3>
      <p>Es un modelo de contrato que las empresas proveedoras de servicios (como las inmobiliarias) registran voluntariamente en PROFECO. Al hacerlo, se comprometen a utilizar un formato que respeta los derechos de los consumidores. Es un sello de buenas prácticas y transparencia.</p>
      <h3 class="text-2xl font-bold mt-6 mb-3">Paso 1: Visita el Buró Comercial de PROFECO</h3>
      <p>La herramienta principal para esta búsqueda es el Buró Comercial. Puedes acceder directamente en la siguiente liga: <a href="https://burocomercial.profeco.gob.mx/" target="_blank" rel="noopener noreferrer" class="text-red-600 hover:underline">https://burocomercial.profeco.gob.mx/</a>.</p>
      <h3 class="text-2xl font-bold mt-6 mb-3">Paso 2: Realiza la Búsqueda</h3>
      <p>En el sitio del Buró Comercial, encontrarás un campo de búsqueda. Ingresa el nombre comercial o la razón social de la inmobiliaria que deseas investigar. Asegúrate de escribir el nombre correctamente.</p>
      <h3 class="text-2xl font-bold mt-6 mb-3">Paso 3: Analiza los Resultados</h3>
      <p>La plataforma te mostrará un perfil de la empresa. En este perfil, debes buscar varias secciones importantes:</p>
      <ul class="list-disc list-inside space-y-2 mt-4">
        <li><strong>Contratos de Adhesión:</strong> Aquí aparecerá si la empresa tiene uno o más contratos registrados y vigentes. Podrás ver el número de registro y la fecha.</li>
        <li><strong>Quejas:</strong> También podrás ver un resumen del número de quejas que la empresa ha recibido en los últimos años, cuántas han sido conciliadas y los principales motivos de reclamación.</li>
        <li><strong>Sanciones:</strong> Si la empresa ha sido multada por incumplimientos, también aparecerá en esta sección.</li>
      </ul>
      <p class="mt-6 font-semibold">Que una inmobiliaria no tenga un contrato registrado no significa automáticamente que sea fraudulenta, pero que sí lo tenga es una señal muy poderosa de su compromiso con la legalidad y el trato justo. ¡No te saltes este paso en tu próxima búsqueda de vivienda!</p>
    `,
    imageUrl: 'https://images.unsplash.com/photo-1583508915901-b5f84c1dcde1?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: '3',
    title: 'El Score de Confianza: ¿Cómo Analizamos los Datos?',
    author: 'Equipo Veritas',
    date: '28 de Junio, 2025',
    summary: 'Detrás de cada score hay un complejo análisis de datos. Te explicamos nuestra metodología y las fuentes que utilizamos para darte la información más fiable.',
    content: `
      <p>En VeritasInmueble, nuestra misión es aportar transparencia a un sector que a menudo carece de ella. El "Score de Confianza" es el corazón de nuestra plataforma, y creemos que es fundamental que nuestros usuarios entiendan cómo llegamos a esa calificación. No es un número arbitrario; es el resultado de un análisis riguroso asistido por inteligencia artificial.</p>
      <h3 class="text-2xl font-bold mt-6 mb-3">Nuestros Pilares de Análisis</h3>
      <p>Nuestro algoritmo pondera múltiples factores, cada uno obtenido de fuentes públicas y verificables. Estos son los principales:</p>
      <ol class="list-decimal list-inside space-y-3 mt-4">
        <li><strong>Quejas ante PROFECO:</strong> Este es uno de los factores con más peso. Un alto número de quejas, especialmente aquellas no conciliadas, reduce significativamente el score.</li>
        <li><strong>Contrato de Adhesión:</strong> Como mencionamos en otro artículo, tener un contrato registrado en PROFECO es una señal muy positiva de transparencia y buenas prácticas.</li>
        <li><strong>Google Maps Rating:</strong> Analizamos la calificación promedio y el número de reseñas en Google. No es solo el promedio; una inmobiliaria con 4.5 estrellas y 500 reseñas es más fiable que una con 5 estrellas y solo 3 reseñas.</li>
        <li><strong>Membresía en AMPI:</strong> Pertenecer a la Asociación Mexicana de Profesionales Inmobiliarios (AMPI) indica un compromiso con un código de ética y la profesionalización del sector.</li>
        <li><strong>Antigüedad y Estatus Fiscal (SAT):</strong> Una empresa con muchos años de operación y un RFC activo y localizable tiende a ser más estable y confiable.</li>
        <li><strong>Controversias Públicas:</strong> Nuestra IA busca noticias, artículos y discusiones en foros legales sobre posibles fraudes, demandas o controversias significativas asociadas con la inmobiliaria.</li>
        <li><strong>Presencia Digital y Domicilio Físico:</strong> Verificamos que la empresa tenga una presencia online coherente y un domicilio físico verificable, lo que reduce el riesgo de que sea una "empresa fantasma".</li>
      </ol>
      <p class="mt-6 font-semibold">Al combinar y ponderar estos factores, generamos un score que te ofrece una visión rápida y comprensible del nivel de riesgo y confianza de una inmobiliaria. Nuestro objetivo es darte el poder de los datos para que tomes la mejor decisión.</p>
    `,
    imageUrl: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?q=80&w=1974&auto=format&fit=crop',
  },
  {
    id: '4',
    title: '7 Errores Comunes al Comprar tu Primera Propiedad en México',
    author: 'Equipo Veritas',
    date: '22 de Julio, 2025',
    summary: 'Evita costosos tropiezos en la compra de tu primer hogar. Desde no investigar a la inmobiliaria hasta ignorar los costos ocultos, te guiamos para que tu inversión sea segura.',
    content: `
      <p>Comprar tu primera casa es un hito emocionante, pero el camino está lleno de posibles errores que pueden costar caro. Estar informado es tu mejor defensa. Aquí te presentamos los 7 errores más comunes que cometen los compradores primerizos en México y cómo puedes evitarlos.</p>
      <h3 class="text-2xl font-bold mt-6 mb-3">1. No Obtener una Pre-aprobación de Crédito</h3>
      <p>Enamorarte de una casa sin saber si puedes pagarla es una receta para la decepción. Antes de empezar a buscar, acércate a un banco o a un bróker hipotecario para obtener una pre-aprobación. Esto te dará un presupuesto realista y te hará un comprador más serio y atractivo para los vendedores.</p>
      <h3 class="text-2xl font-bold mt-6 mb-3">2. Subestimar los Costos de Cierre y Gastos Ocultos</h3>
      <p>El precio de la casa no es el costo final. Debes considerar los "gastos notariales" o "costos de cierre", que pueden ser entre un 5% y un 8% del valor del inmueble. Esto incluye impuestos (ISAI), honorarios del notario, avalúo, y gastos de registro. ¡No olvides presupuestar esto!</p>
      <h3 class="text-2xl font-bold mt-6 mb-3">3. Omitir la Inspección Profesional del Inmueble</h3>
      <p>Aunque la casa parezca perfecta, puede tener vicios ocultos (problemas estructurales, de plomería, eléctricos). Contratar a un perito o inspector profesional antes de comprar es una inversión mínima que puede salvarte de reparaciones de miles de pesos en el futuro.</p>
      <h3 class="text-2xl font-bold mt-6 mb-3">4. No Investigar a la Inmobiliaria o al Vendedor</h3>
      <p>Aquí es donde VeritasInmueble se vuelve tu mejor aliado. No verificar la reputación de la inmobiliaria, sus quejas en PROFECO o si es una empresa legítimamente constituida es un riesgo enorme. Usa nuestra plataforma para investigar a fondo antes de dar cualquier anticipo.</p>
      <h3 class="text-2xl font-bold mt-6 mb-3">5. Dejarse Llevar por las Emociones</h3>
      <p>Es fácil enamorarse de una cocina bonita o una gran vista, pero una casa es una decisión financiera. Mantén la cabeza fría y evalúa la propiedad objetivamente. ¿La ubicación es buena? ¿Satisface tus necesidades a largo plazo? ¿El precio es justo para el mercado?</p>
      <h3 class="text-2xl font-bold mt-6 mb-3">6. No Entender el Rol del Notario Público</h3>
      <p>El notario no es solo alguien que "da fe y firma". Es tu garantía de que la propiedad es legalmente vendible, que no tiene deudas y que la transacción se inscribirá correctamente en el Registro Público de la Propiedad. Asegúrate de entender su función y de que sea un profesional de confianza.</p>
      <h3 class="text-2xl font-bold mt-6 mb-3">7. Firmar Documentos sin Leerlos Detenidamente</h3>
      <p>Desde la oferta de compra hasta el contrato de compraventa y las escrituras. Lee cada palabra. Si no entiendes algo, pregunta. Si algo te parece sospechoso, busca asesoría legal. Tu firma es un compromiso legal; asegúrate de saber exactamente a qué te estás comprometiendo.</p>
    `,
    imageUrl: 'https://images.unsplash.com/photo-1516156008657-3236c5395997?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: '5',
    title: 'Banderas Rojas: Cómo Detectar un Anuncio Inmobiliario Fraudulento',
    author: 'Ana de la Fuente',
    date: '29 de Julio, 2025',
    summary: 'El mercado está lleno de oportunidades, pero también de trampas. Aprende a identificar las señales de alerta en anuncios en línea para protegerte de estafas.',
    content: `
      <p>Los portales inmobiliarios en línea han facilitado enormemente la búsqueda de vivienda, pero también han abierto la puerta a estafadores. Aprender a identificar las "banderas rojas" (red flags) en un anuncio es crucial para proteger tu dinero y tu seguridad. Presta atención a estas señales de alerta.</p>
      <h3 class="text-2xl font-bold mt-6 mb-3">1. Precio Demasiado Bueno para Ser Verdad</h3>
      <p>Si una propiedad en una zona deseable está a un precio significativamente por debajo del mercado, desconfía. Los estafadores usan precios gancho para atraer a víctimas desesperadas. Investiga el precio promedio por metro cuadrado en la zona para tener un punto de referencia.</p>
      <h3 class="text-2xl font-bold mt-6 mb-3">2. Peticiones de Depósitos por Adelantado para "Apartar" o "Visitar"</h3>
      <p>Esta es la bandera roja más grande. NUNCA deposites dinero antes de haber visitado la propiedad, conocido al supuesto dueño o agente, y firmado un contrato en un lugar seguro. Los estafadores a menudo inventan excusas como "estoy fuera del país" o "hay muchos interesados" para presionarte a depositar.</p>
      <h3 class="text-2xl font-bold mt-6 mb-3">3. Fotos de Poca Calidad, Genéricas o Robadas</h3>
      <p>Fotos borrosas, que parecen de revista (stock photos) o que no coinciden con la descripción pueden ser una señal de alerta. Puedes hacer una búsqueda inversa de imágenes en Google para ver si las fotos han sido robadas de otro anuncio legítimo o de un hotel.</p>
      <h3 class="text-2xl font-bold mt-6 mb-3">4. Mala Redacción y Descripciones Vagas</h3>
      <p>Anuncios con múltiples errores de ortografía, gramática extraña o que no proporcionan detalles específicos sobre la propiedad (metros cuadrados, dirección exacta, etc.) suelen ser fraudulentos. Un profesional serio se esfuerza por presentar un anuncio claro y completo.</p>
      <h3 class="text-2xl font-bold mt-6 mb-3">5. Negativa a Mostrar la Propiedad en Persona</h3>
      <p>Si el contacto se niega a mostrarte la propiedad o pone excusas constantes, es muy probable que no tenga acceso a ella porque el anuncio es falso. Insiste siempre en una visita física.</p>
      <h3 class="text-2xl font-bold mt-6 mb-3">6. Comunicación Exclusivamente por Medios No Oficiales</h3>
      <p>Si toda la comunicación es por WhatsApp o un correo electrónico genérico (Gmail, Hotmail) y se niegan a dar un número de oficina o a reunirse en las instalaciones de una inmobiliaria, ten mucho cuidado. Un agente legítimo tendrá canales de comunicación profesionales.</p>
      <p class="mt-6 font-semibold">Tu intuición es importante. Si algo se siente mal, probablemente lo esté. Confía en tus instintos y verifica siempre la información antes de tomar cualquier decisión.</p>
    `,
    imageUrl: 'https://images.unsplash.com/photo-1559028006-44a3a3d24167?q=80&w=1974&auto=format&fit=crop',
  },
  {
    id: '6',
    title: 'El ABC de los Créditos Hipotecarios en México',
    author: 'Equipo Veritas',
    date: '05 de Agosto, 2025',
    summary: 'INFONAVIT, FOVISSSTE, bancario... ¿Cuál te conviene? Desmitificamos el mundo de los créditos hipotecarios para que elijas la mejor opción para tu futuro.',
    content: `
      <p>Comprar una casa con un crédito hipotecario es la ruta más común para formar un patrimonio en México. Sin embargo, la variedad de opciones puede ser abrumadora. Aquí te explicamos de manera sencilla las tres principales alternativas para que entiendas cuál se ajusta mejor a tu perfil.</p>
      <h3 class="text-2xl font-bold mt-6 mb-3">1. Crédito INFONAVIT</h3>
      <p>Si eres un trabajador del sector privado y tu empleador hace aportaciones al Instituto del Fondo Nacional de la Vivienda para los Trabajadores (INFONAVIT), tienes derecho a este crédito.</p>
      <ul class="list-disc list-inside space-y-2 mt-4">
        <li><strong>¿Cómo funciona?</strong> Utiliza el saldo que tienes en tu Subcuenta de Vivienda como parte del enganche. El monto del crédito dependerá de tu edad, salario y historial de cotización.</li>
        <li><strong>Ventajas:</strong> Tasas de interés competitivas y diferenciadas por nivel salarial. No requiere un enganche inicial tan grande si tienes un buen saldo en tu subcuenta.</li>
        <li><strong>Desventajas:</strong> El monto del crédito puede ser limitado. El proceso puede ser burocrático.</li>
      </ul>
      <h3 class="text-2xl font-bold mt-6 mb-3">2. Crédito FOVISSSTE</h3>
      <p>Es el equivalente al INFONAVIT pero para los trabajadores al servicio del Estado. El Fondo de la Vivienda del Instituto de Seguridad y Servicios Sociales de los Trabajadores del Estado (FOVISSSTE) es la institución que lo otorga.</p>
      <ul class="list-disc list-inside space-y-2 mt-4">
        <li><strong>¿Cómo funciona?</strong> Tradicionalmente, se asignaba mediante un sorteo anual, aunque ahora existen más esquemas. También utiliza el saldo de tu Subcuenta de Vivienda.</li>
        <li><strong>Ventajas:</strong> Generalmente ofrece buenas condiciones y plazos.</li>
        <li><strong>Desventajas:</strong> Estar sujeto a un sorteo puede retrasar tus planes. Aplica solo para un sector específico de la población.</li>
      </ul>
      <h3 class="text-2xl font-bold mt-6 mb-3">3. Crédito Bancario</h3>
      <p>Otorgado por instituciones financieras privadas (bancos). Es la opción más flexible y accesible para quienes no cotizan en INFONAVIT o FOVISSSTE, o para quienes buscan complementar su crédito social.</p>
      <ul class="list-disc list-inside space-y-2 mt-4">
        <li><strong>¿Cómo funciona?</strong> El banco evalúa tu historial crediticio (Buró de Crédito), tus ingresos y tu capacidad de pago. Generalmente, te pedirán un enganche de entre el 10% y el 20% del valor de la propiedad.</li>
        <li><strong>Ventajas:</strong> Puedes obtener montos de crédito más altos. El proceso suele ser más rápido y competitivo. Hay una gran variedad de productos (tasas fijas, crecientes, etc.).</li>
        <li><strong>Desventajas:</strong> Requiere un excelente historial crediticio y la capacidad de comprobar ingresos. Necesitas tener ahorrado el dinero para el enganche y los gastos de cierre.</li>
      </ul>
      <p class="mt-6 font-semibold">También existen esquemas mixtos como COFINAVIT, que te permite combinar tu crédito INFONAVIT con un crédito bancario para alcanzar un monto mayor. La clave es comparar. Acércate a diferentes bancos, usa simuladores en línea y asesórate con un bróker hipotecario para encontrar el traje a tu medida.</p>
    `,
    imageUrl: 'https://images.unsplash.com/photo-1554224155-1696413565d3?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: '7',
    title: '¿Rentar o Comprar en 2025? El Análisis Definitivo',
    author: 'Carlos Mendoza, Analista Financiero',
    date: '12 de Agosto, 2025',
    summary: 'La eterna pregunta. Analizamos los números, el estilo de vida y el mercado actual en México para ayudarte a tomar la decisión financiera más importante de tu vida.',
    content: `
      <p>Decidir entre rentar y comprar una vivienda es una de las encrucijadas financieras más significativas. No hay una respuesta única, ya que depende de tu situación personal, financiera y tus planes a futuro. Analicemos los pros y contras de cada opción en el contexto mexicano actual.</p>
      <h3 class="text-2xl font-bold mt-6 mb-3">Las Ventajas de Comprar</h3>
      <ul class="list-disc list-inside space-y-2 mt-4">
        <li><strong>Construcción de Patrimonio:</strong> Cada pago de la hipoteca aumenta tu capital. En lugar de pagar la hipoteca de alguien más (tu arrendador), pagas la tuya.</li>
        <li><strong>Estabilidad y Libertad:</strong> Tienes control total sobre tu espacio. Puedes remodelar, tener mascotas sin restricciones y no te preocuparás por aumentos de renta o por tener que mudarte inesperadamente.</li>
        <li><strong>Apalancamiento Financiero:</strong> La plusvalía (aumento del valor del inmueble con el tiempo) puede generar un rendimiento significativo sobre tu inversión inicial (el enganche).</li>
        <li><strong>Beneficios Fiscales:</strong> En México, los intereses reales de tu crédito hipotecario son deducibles de impuestos, lo que puede representar un ahorro anual.</li>
      </ul>
      <h3 class="text-2xl font-bold mt-6 mb-3">Las Ventajas de Rentar</h3>
      <ul class="list-disc list-inside space-y-2 mt-4">
        <li><strong>Flexibilidad y Movilidad:</strong> Si tu trabajo requiere que te mudes o si no estás seguro de querer vivir en una ciudad a largo plazo, rentar te da la libertad de cambiar de residencia con relativa facilidad.</li>
        <li><strong>Menor Responsabilidad Financiera:</strong> Los costos de mantenimiento mayor, reparaciones y el impuesto predial son responsabilidad del propietario. Tu única obligación es pagar la renta.</li>
        <li><strong>Menor Inversión Inicial:</strong> No necesitas un gran capital para el enganche y los gastos notariales. Generalmente, solo se requiere un depósito y el primer mes de renta.</li>
        <li><strong>Acceso a Mejores Zonas:</strong> A menudo, puedes permitirte rentar en una zona que estaría fuera de tu alcance para comprar, dándote acceso a mejores ubicaciones o amenidades.</li>
      </ul>
      <h3 class="text-2xl font-bold mt-6 mb-3">¿Cómo Decidir? Hazte estas Preguntas:</h3>
      <p><strong>1. ¿Cuánto tiempo planeo vivir aquí?</strong> La mayoría de los expertos coinciden en que si no planeas quedarte en un lugar por al menos 5 años, comprar podría no ser la mejor opción debido a los altos costos de transacción.</p>
      <p class="mt-2"><strong>2. ¿Tengo mis finanzas en orden?</strong> Esto significa tener ahorros para el enganche (10-20%) y los costos de cierre (5-8%), un buen historial crediticio y un ingreso estable para cubrir la hipoteca y los gastos asociados (mantenimiento, predial, seguros).</p>
      <p class="mt-2"><strong>3. ¿Qué valoro más: estabilidad o flexibilidad?</strong> Tu estilo de vida y tus prioridades personales son tan importantes como los números. No hay una respuesta incorrecta, solo la que es correcta para ti.</p>
      <p class="mt-6 font-semibold">Usa una calculadora de rentar vs. comprar en línea para comparar los costos a largo plazo. Considera las tasas de interés actuales y la plusvalía esperada en la zona que te interesa. Tomar una decisión informada es el primer paso hacia un futuro financiero saludable.</p>
    `,
    imageUrl: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: '8',
    title: 'El Notario Público: Tu Aliado Indispensable en la Compraventa',
    author: 'Equipo Veritas',
    date: '19 de Agosto, 2025',
    summary: 'Muchos lo ven como un simple trámite, pero el notario es tu principal garantía de seguridad jurídica. Entiende su rol crucial y por qué es una pieza clave.',
    content: `
      <p>En una operación de compraventa inmobiliaria en México, la figura del Notario Público es absolutamente central e insustituible. Lejos de ser un mero "saca firmas", el notario actúa como un representante del Estado que dota de fe pública y certeza jurídica a la transacción, protegiendo los intereses tanto del comprador como del vendedor.</p>
      <h3 class="text-2xl font-bold mt-6 mb-3">¿Por qué es Obligatoria su Intervención?</h3>
      <p>La ley mexicana exige que toda transmisión de propiedad de un bien inmueble se formalice mediante una escritura pública otorgada ante un notario, la cual posteriormente debe inscribirse en el Registro Público de la Propiedad. Sin este proceso, la compraventa no tiene validez legal frente a terceros, lo que te dejaría en una posición vulnerable.</p>
      <h3 class="text-2xl font-bold mt-6 mb-3">Las Funciones Clave del Notario en tu Compra:</h3>
      <p>El trabajo del notario va mucho más allá de redactar y certificar la escritura. Sus responsabilidades cruciales incluyen:</p>
      <ul class="list-disc list-inside space-y-2 mt-4">
        <li><strong>Identificar a las Partes:</strong> Se asegura de que las personas que firman (comprador y vendedor) son quienes dicen ser y tienen la capacidad legal para celebrar el acto.</li>
        <li><strong>Revisión Legal del Inmueble:</strong> Esta es quizás su función más importante. El notario solicita el "Certificado de Libertad de Gravamen" al Registro Público para verificar que la propiedad no tenga deudas (hipotecas, embargos) y que quien vende sea el legítimo propietario.</li>
        <li><strong>Verificación Fiscal:</strong> Comprueba que el inmueble esté al corriente en el pago de impuestos como el predial y el agua.</li>
        <li><strong>Cálculo y Retención de Impuestos:</strong> El notario calcula, retiene y entera los impuestos correspondientes a la operación, como el Impuesto Sobre la Renta (ISR) por enajenación para el vendedor y el Impuesto Sobre Adquisición de Inmuebles (ISAI) para el comprador.</li>
        <li><strong>Asesoría Imparcial:</strong> Aunque es elegido y pagado por el comprador, el notario tiene la obligación de asesorar a ambas partes de manera imparcial, explicando el alcance y las consecuencias legales del contrato que están firmando.</li>
        <li><strong>Inscripción en el Registro Público:</strong> Una vez firmada la escritura, el notario se encarga de realizar los trámites para que la propiedad quede inscrita a tu nombre en el Registro Público de la Propiedad, lo que te acredita legalmente como el nuevo dueño.</li>
      </ul>
      <p class="mt-6 font-semibold">Elegir un buen notario es fundamental. Tienes derecho a elegir con qué notario trabajar. Busca recomendaciones, verifica que esté en el Colegio de Notarios de tu estado y no dudes en pedir una cita para aclarar todas tus dudas antes de iniciar el proceso. El notario no es un gasto, es una inversión en la seguridad de tu patrimonio.</p>
    `,
    imageUrl: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?q=80&w=1892&auto=format&fit=crop',
  }
];
