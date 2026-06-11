
import { ForumTopic, ForumReply } from './types';

// NOTA: Usamos Date nativo de JS para evitar problemas de importación de Firebase.
// Firestore convierte automáticamente los objetos Date a Timestamp al guardar.
const createDate = (daysAgo: number, minutesAgo: number = 0) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setMinutes(date.getMinutes() - minutesAgo);
    return date;
};

// Generamos IDs de usuarios falsos para simular likes
const fakeUserIds = Array.from({ length: 50 }, (_, i) => `fake_user_${i}`);

export const mockForumTopics: ForumTopic[] = [
    {
        id: 'mock_1',
        title: "¡ALERTA! Me pidieron 'apartado' de $5,000 antes de ver el depa en la Roma",
        content: "Encontré un anuncio increíble en Facebook Marketplace. Un loft en la Roma Norte por $12,000. El supuesto dueño me dijo que tenía mucha demanda y que debía depositar $5,000 a una cuenta OXXO para agendar la visita. Obviamente no caí, pero vi que el anuncio sigue activo. ¿Alguien más ha visto este modus operandi?",
        categoryId: 'cat_gral',
        userId: 'user_mock_1',
        authorName: 'Fernanda G.',
        authorColor: '#ef4444',
        createdAt: createDate(0, 30),
        likes: fakeUserIds.slice(0, 42),
        replyCount: 3,
        views: 342,
        tags: ['fraude', 'cdmx', 'alerta']
    },
    {
        id: 'mock_2',
        title: "¿Es legal que me obliguen a pagar los honorarios del abogado de la inmobiliaria?",
        content: "Estoy por rentar y en el desglose de pagos iniciales me cobran $3,500 por 'Gestión de Contrato' y aparte la Póliza Jurídica. Según yo, la elaboración del contrato debería correr por cuenta del arrendador. ¿Esto es un abuso o es práctica común?",
        categoryId: 'cat_legal',
        userId: 'user_mock_2',
        authorName: 'Roberto M.',
        authorColor: '#3b82f6',
        createdAt: createDate(1),
        likes: fakeUserIds.slice(0, 15),
        replyCount: 3,
        views: 120,
        tags: ['contrato', 'abuso', 'pagos']
    },
    {
        id: 'mock_3',
        title: "Experiencias comprando preventa en Mérida: ¿Burbuja o inversión?",
        content: "Me ofrecen terrenos de inversión en Yucatán desde $50,000 MXN. Prometen plusvalía del 20% anual, pero al ver el mapa, literal es selva sin calles ni servicios a 40 minutos de la ciudad. ¿Alguien ha comprado y revendido con éxito?",
        categoryId: 'cat_venta',
        userId: 'user_mock_3',
        authorName: 'Alejandro T.',
        authorColor: '#10b981',
        createdAt: createDate(1),
        likes: fakeUserIds.slice(0, 8),
        replyCount: 3,
        views: 890,
        tags: ['inversión', 'merida', 'preventa']
    },
    {
        id: 'mock_4',
        title: "El casero entra a mi departamento cuando no estoy. ¿Qué hago?",
        content: "Instalé una cámara Wyze para vigilar a mi gato y hoy revisando las grabaciones vi al dueño entrando a 'revisar una tubería' sin avisarme. En mi contrato dice que debe avisar con 24 horas. Me siento muy insegura. ¿Es causal de rescisión de contrato sin penalización?",
        categoryId: 'cat_renta',
        userId: 'user_mock_4',
        authorName: 'Carla S.',
        authorColor: '#8b5cf6',
        createdAt: createDate(2),
        likes: fakeUserIds.slice(0, 50),
        replyCount: 3,
        views: 1024,
        tags: ['seguridad', 'privacidad', 'legal']
    },
    {
        id: 'mock_5',
        title: "¿Qué opinan de Tecnocasa? Me presionan mucho para firmar",
        content: "Fui a ver un depa y el agente no me deja en paz, me llama 5 veces al día diciendo que ya hay otra oferta y que debo depositar hoy mismo. Me da desconfianza tanta insistencia. ¿Es su forma de trabajar o hay algo raro?",
        categoryId: 'cat_gral',
        userId: 'user_mock_5',
        authorName: 'Daniela R.',
        authorColor: '#f59e0b',
        createdAt: createDate(2),
        likes: fakeUserIds.slice(0, 12),
        replyCount: 2,
        views: 210,
        tags: ['opinión', 'agentes', 'presión']
    },
    {
        id: 'mock_6',
        title: "Aval con propiedad en CDMX vs Póliza Jurídica",
        content: "Soy foráneo y me piden aval con propiedad libre de gravamen en CDMX, cosa que no tengo. Ofrecí pagar póliza jurídica amplia y doble depósito, pero se niegan. ¿Saben de inmobiliarias más flexibles en la zona de Narvarte?",
        categoryId: 'cat_renta',
        userId: 'user_mock_6',
        authorName: 'Javier L.',
        authorColor: '#6366f1',
        createdAt: createDate(3),
        likes: fakeUserIds.slice(0, 20),
        replyCount: 3,
        views: 180,
        tags: ['requisitos', 'foraneos', 'renta']
    },
    {
        id: 'mock_7',
        title: "Cuidado con la cláusula de Extinción de Dominio",
        content: "Ojo arrendadores: Si no incluyen la cláusula de extinción de dominio bien redactada y sus inquilinos hacen algo ilegal en la propiedad, pueden perder la casa. Mi abogado me explicó que muchas papelerías venden contratos viejos que no protegen de esto.",
        categoryId: 'cat_legal',
        userId: 'user_mock_7',
        authorName: 'Lic. Pablo E.',
        authorColor: '#14b8a6',
        createdAt: createDate(3),
        likes: fakeUserIds.slice(0, 95),
        replyCount: 2,
        views: 560,
        tags: ['propietarios', 'leyes', 'tips']
    },
    {
        id: 'mock_8',
        title: "¿Cuánto tiempo tarda INFONAVIT en depositar al vendedor?",
        content: "Ya firmamos escrituras hace 10 días y el vendedor me está reclamando que no le ha caído el dinero. El notario dice que es normal, pero el vendedor amenaza con no entregarme las llaves. ¿Alguien sabe los tiempos reales en 2025?",
        categoryId: 'cat_venta',
        userId: 'user_mock_8',
        authorName: 'Miguel A.',
        authorColor: '#ec4899',
        createdAt: createDate(4),
        likes: fakeUserIds.slice(0, 5),
        replyCount: 2,
        views: 150,
        tags: ['infonavit', 'trámites', 'tiempos']
    },
    {
        id: 'mock_9',
        title: "Devolución de depósito: Llevo 3 meses esperando",
        content: "Entregué el departamento pintado y limpio. Firmamos hoja de entrega sin daños. La inmobiliaria me dice que 'el contador está de vacaciones' o 'falta una firma'. Ya no me contestan el teléfono. ¿Voy directo a PROFECO?",
        categoryId: 'cat_legal',
        userId: 'user_mock_9',
        authorName: 'Lucía V.',
        authorColor: '#f43f5e',
        createdAt: createDate(4),
        likes: fakeUserIds.slice(0, 33),
        replyCount: 3,
        views: 410,
        tags: ['depósito', 'queja', 'abuso']
    },
    {
        id: 'mock_10',
        title: "Me subieron la renta 20% de un año a otro. ¿Es legal?",
        content: "Llevo 3 años rentando en la Condesa. Mi contrato vence el próximo mes y me avisaron que la renta subirá de $18,000 a $22,000. La inflación fue del 5%. ¿Hay algún tope legal para el aumento de renta en CDMX?",
        categoryId: 'cat_renta',
        userId: 'user_mock_10',
        authorName: 'Eduardo B.',
        authorColor: '#84cc16',
        createdAt: createDate(5),
        likes: fakeUserIds.slice(0, 40),
        replyCount: 4,
        views: 890,
        tags: ['renta', 'aumento', 'inflación']
    },
    {
        id: 'mock_11',
        title: "¿Mejor zona para invertir con 2.5 millones en GDL?",
        content: "Tengo un presupuesto de 2.5mdp. Estoy entre un depa pequeño en Providencia (viejo) o algo nuevo por Zapopan norte. Busco rentarlo rápido. ¿Qué zona tiene mejor cap rate actualmente?",
        categoryId: 'cat_venta',
        userId: 'user_mock_11',
        authorName: 'InversionistaGDL',
        authorColor: '#06b6d4',
        createdAt: createDate(6),
        likes: fakeUserIds.slice(0, 3),
        replyCount: 2,
        views: 120,
        tags: ['gdl', 'inversión', 'consejo']
    },
    {
        id: 'mock_12',
        title: "Estafa con Airbnb y rentas a largo plazo",
        content: "Un tipo rentó un Airbnb por 3 días, y en esos días mostró el departamento a 10 personas fingiendo ser el dueño para rentarlo a largo plazo. Cobró depósitos a todos y desapareció. Tengan mucho cuidado con quien les muestra la casa.",
        categoryId: 'cat_gral',
        userId: 'user_mock_12',
        authorName: 'Mario Casas',
        authorColor: '#dc2626',
        createdAt: createDate(6),
        likes: fakeUserIds.slice(0, 88),
        replyCount: 3,
        views: 2200,
        tags: ['fraude', 'airbnb', 'seguridad']
    },
    {
        id: 'mock_13',
        title: "¿Quién paga el mantenimiento mayor: dueño o inquilino?",
        content: "Se rompió el boiler por antigüedad (tiene 10 años). El casero dice que yo lo rompí por uso y que debo pagarlo. Cuesta $4,000. ¿No se supone que el desgaste natural lo cubre el propietario?",
        categoryId: 'cat_renta',
        userId: 'user_mock_13',
        authorName: 'Sofia P.',
        authorColor: '#a855f7',
        createdAt: createDate(7),
        likes: fakeUserIds.slice(0, 10),
        replyCount: 3,
        views: 300,
        tags: ['mantenimiento', 'costos', 'duda']
    },
    {
        id: 'mock_14',
        title: "Vicios ocultos en casa recién comprada",
        content: "Compré casa hace 2 meses y ahora con las lluvias salieron goteras por todos lados y humedad en los muros. El vendedor dice que la compré 'Ad Corpus' y que ya no es su problema. ¿Tengo garantía por vicios ocultos?",
        categoryId: 'cat_legal',
        userId: 'user_mock_14',
        authorName: 'Jorge H.',
        authorColor: '#ea580c',
        createdAt: createDate(8),
        likes: fakeUserIds.slice(0, 25),
        replyCount: 2,
        views: 450,
        tags: ['viciosocultos', 'garantía', 'compra']
    },
    {
        id: 'mock_15',
        title: "Roomie se fue sin pagar servicios. ¿Cómo me protejo?",
        content: "Compartía depa, mi roomie se fue de un día para otro y dejó deuda de luz e internet de 3 meses. El contrato de servicios está a mi nombre. ¿Debí haber firmado contrato entre roomies?",
        categoryId: 'cat_gral',
        userId: 'user_mock_15',
        authorName: 'Mariana G.',
        authorColor: '#db2777',
        createdAt: createDate(9),
        likes: fakeUserIds.slice(0, 18),
        replyCount: 2,
        views: 210,
        tags: ['roomies', 'convivencia', 'dinero']
    },
    {
        id: 'mock_16',
        title: "Preventa detenida: Llevan 1 año de retraso",
        content: "Compré en preventa 'Torre Vista Real'. La fecha de entrega era Enero 2024. A la fecha solo está la cimentación. ¿En qué momento puedo demandar el reembolso de mi dinero más intereses?",
        categoryId: 'cat_legal',
        userId: 'user_mock_16',
        authorName: 'Carlos D.',
        authorColor: '#4b5563',
        createdAt: createDate(10),
        likes: fakeUserIds.slice(0, 60),
        replyCount: 3,
        views: 780,
        tags: ['preventa', 'retraso', 'demanda']
    },
    {
        id: 'mock_17',
        title: "Me piden escrituras originales para 'investigación'",
        content: "Estoy intentando rentar mi propiedad y una supuesta inmobiliaria me pide que les deje las escrituras originales 'un par de días' para validarlas en el registro público. ¡Jamás hagan esto! Es para robar identidad o la propiedad.",
        categoryId: 'cat_gral',
        userId: 'user_mock_17',
        authorName: 'PropietarioAlerta',
        authorColor: '#ca8a04',
        createdAt: createDate(11),
        likes: fakeUserIds.slice(0, 150),
        replyCount: 4,
        views: 3100,
        tags: ['alerta', 'seguridad', 'propietarios']
    },
    {
        id: 'mock_18',
        title: "¿Conviene pagar hipoteca adelantada o invertir?",
        content: "Tengo un extra de $100k. Mi hipoteca es del 10.5%. ¿Me conviene abonar a capital para bajar plazo o mejor lo meto a CETES/SOFIPOS que dan el 11%? ¿Qué harían ustedes?",
        categoryId: 'cat_venta',
        userId: 'user_mock_18',
        authorName: 'FinanzasPersonales',
        authorColor: '#059669',
        createdAt: createDate(12),
        likes: fakeUserIds.slice(0, 30),
        replyCount: 3,
        views: 900,
        tags: ['finanzas', 'hipoteca', 'estrategia']
    },
    {
        id: 'mock_19',
        title: "Discriminación por tener mascota (Gato)",
        content: "He visto 15 departamentos y en todos me dicen 'No Mascotas'. Mi gato es viejo y solo duerme. Ofrecí depósito extra de limpieza y ni así. ¿Es legal prohibir mascotas en todos los condominios?",
        categoryId: 'cat_renta',
        userId: 'user_mock_19',
        authorName: 'Karen C.',
        authorColor: '#9333ea',
        createdAt: createDate(13),
        likes: fakeUserIds.slice(0, 200),
        replyCount: 3,
        views: 1500,
        tags: ['mascotas', 'renta', 'discriminacion']
    },
    {
        id: 'mock_20',
        title: "Lista negra de asesores inmobiliarios",
        content: "Propongo crear un hilo con nombres de asesores que se han quedado con apartados o mienten sobre las características. Empiezo yo con uno de la zona Sur...",
        categoryId: 'cat_gral',
        userId: 'user_mock_20',
        authorName: 'JusticieroInm',
        authorColor: '#000000',
        createdAt: createDate(14),
        likes: fakeUserIds.slice(0, 300),
        replyCount: 3,
        views: 5000,
        tags: ['listanegra', 'comunidad', 'reporte']
    }
];

export const mockForumReplies: ForumReply[] = [
    // Mock 1: Fraude Apartado
    {
        id: 'reply_1_1',
        topicId: 'mock_1',
        userId: 'user_rep_1',
        authorName: 'David S.',
        authorColor: '#22c55e',
        content: "¡Es estafa segurísima! A mi prima le hicieron lo mismo con un depa en la Condesa. Denuncia la publicación y bloquea.",
        createdAt: createDate(0, 25),
        likes: fakeUserIds.slice(0, 10)
    },
    {
        id: 'reply_1_2',
        topicId: 'mock_1',
        userId: 'user_rep_2',
        authorName: 'Mariana L.',
        authorColor: '#eab308',
        content: "Jamás deposites sin ver. Ningún propietario serio pide dinero por adelantado solo para 'agendar'.",
        createdAt: createDate(0, 20),
        likes: fakeUserIds.slice(0, 5)
    },
    {
        id: 'reply_1_3',
        topicId: 'mock_1',
        userId: 'user_rep_3',
        authorName: 'Carlos V.',
        authorColor: '#3b82f6',
        content: "Gracias por avisar, justo vi ese anuncio ayer y se me hizo raro el precio tan bajo.",
        createdAt: createDate(0, 10),
        likes: fakeUserIds.slice(0, 2)
    },

    // Mock 2: Abogado Inmobiliaria
    {
        id: 'reply_2_1',
        topicId: 'mock_2',
        userId: 'user_rep_4',
        authorName: 'Lic. Trejo',
        authorColor: '#64748b',
        content: "No es ilegal cobrarlo, pero sí es una mala práctica. Se supone que la inmobiliaria cobra comisión al dueño, no al inquilino.",
        createdAt: createDate(1),
        likes: fakeUserIds.slice(0, 8)
    },
    {
        id: 'reply_2_2',
        topicId: 'mock_2',
        userId: 'user_rep_5',
        authorName: 'Ana P.',
        authorColor: '#ec4899',
        content: "Negócialo. Diles que tú pagas la póliza (que te protege a ti también) pero que la gestión administrativa va por su cuenta.",
        createdAt: createDate(1),
        likes: fakeUserIds.slice(0, 3)
    },
    {
        id: 'reply_2_3',
        topicId: 'mock_2',
        userId: 'user_rep_6',
        authorName: 'Roberto M.',
        authorColor: '#3b82f6',
        content: "Gracias, intentaré negociar. Se me hace mucho dinero solo por imprimir un contrato machote.",
        createdAt: createDate(1),
        likes: []
    },

    // Mock 3: Preventa Mérida
    {
        id: 'reply_3_1',
        topicId: 'mock_3',
        userId: 'user_rep_7',
        authorName: 'InversionistaYuc',
        authorColor: '#f97316',
        content: "Cuidado, hay muchísima especulación. Si no hay plan de desarrollo urbano o servicios a pie de lote, es dinero muerto por 15 años.",
        createdAt: createDate(1),
        likes: fakeUserIds.slice(0, 20)
    },
    {
        id: 'reply_3_2',
        topicId: 'mock_3',
        userId: 'user_rep_8',
        authorName: 'Luis G.',
        authorColor: '#8b5cf6',
        content: "Yo compré hace 3 años y no ha subido nada, al contrario, ahora hay mil lotes más baratos al lado.",
        createdAt: createDate(1),
        likes: fakeUserIds.slice(0, 5)
    },
    {
        id: 'reply_3_3',
        topicId: 'mock_3',
        userId: 'user_rep_9',
        authorName: 'Sara K.',
        authorColor: '#14b8a6',
        content: "Busca desarrollos que ya tengan luz y calle pavimentada. Si es 'brecha', huye.",
        createdAt: createDate(1),
        likes: fakeUserIds.slice(0, 12)
    },

    // Mock 4: Casero Entra
    {
        id: 'reply_4_1',
        topicId: 'mock_4',
        userId: 'user_rep_10',
        authorName: 'AbogadoPenalista',
        authorColor: '#000000',
        content: "Eso es allanamiento de morada. Tienes evidencia en video. Puedes denunciar penalmente y rescindir el contrato justificadamente.",
        createdAt: createDate(2),
        likes: fakeUserIds.slice(0, 40)
    },
    {
        id: 'reply_4_2',
        topicId: 'mock_4',
        userId: 'user_rep_11',
        authorName: 'Carla S.',
        authorColor: '#8b5cf6',
        content: "¿En serio puedo denunciar? Me da miedo que tome represalias porque tiene llaves.",
        createdAt: createDate(2),
        likes: fakeUserIds.slice(0, 2)
    },
    {
        id: 'reply_4_3',
        topicId: 'mock_4',
        userId: 'user_rep_12',
        authorName: 'Victor H.',
        authorColor: '#ef4444',
        content: "Cambia la chapa YA. Guarda el cilindro original y lo pones cuando te vayas. Tu seguridad es primero.",
        createdAt: createDate(2),
        likes: fakeUserIds.slice(0, 15)
    },

    // Mock 5: Tecnocasa
    {
        id: 'reply_5_1',
        topicId: 'mock_5',
        userId: 'user_rep_13',
        authorName: 'ExAgente',
        authorColor: '#6b7280',
        content: "Es su modelo de negocio, son muy agresivos en ventas. No es estafa, pero sí muy molestos.",
        createdAt: createDate(2),
        likes: fakeUserIds.slice(0, 5)
    },
    {
        id: 'reply_5_2',
        topicId: 'mock_5',
        userId: 'user_rep_14',
        authorName: 'ClienteMolesto',
        authorColor: '#dc2626',
        content: "A mí me hicieron firmar una exclusiva sin darme cuenta. Lee todo con lupa.",
        createdAt: createDate(2),
        likes: fakeUserIds.slice(0, 8)
    },

    // Mock 6: Aval CDMX
    {
        id: 'reply_6_1',
        topicId: 'mock_6',
        userId: 'user_rep_15',
        authorName: 'RoomieCDMX',
        authorColor: '#ec4899',
        content: "En Narvarte hay muchos tratos directos. Busca en grupos de Facebook 'Roomies Narvarte', a veces rentan depas completos sin tanto requisito.",
        createdAt: createDate(3),
        likes: fakeUserIds.slice(0, 6)
    },
    {
        id: 'reply_6_2',
        topicId: 'mock_6',
        userId: 'user_rep_16',
        authorName: 'Javier L.',
        authorColor: '#6366f1',
        content: "Gracias, buscaré ahí. Las inmobiliarias grandes son muy cuadradas.",
        createdAt: createDate(3),
        likes: []
    },
    {
        id: 'reply_6_3',
        topicId: 'mock_6',
        userId: 'user_rep_17',
        authorName: 'AgenteIndep',
        authorColor: '#10b981',
        content: "Yo tengo opciones con póliza jurídica sin aval en la zona. Te contacto.",
        createdAt: createDate(3),
        likes: fakeUserIds.slice(0, 2)
    },

    // Mock 7: Extinción de Dominio
    {
        id: 'reply_7_1',
        topicId: 'mock_7',
        userId: 'user_rep_18',
        authorName: 'Pedro Propietario',
        authorColor: '#f59e0b',
        content: "Muy buen tip. Yo pago una póliza jurídica que incluye esa protección legal, vale la pena cada peso.",
        createdAt: createDate(3),
        likes: fakeUserIds.slice(0, 4)
    },
    {
        id: 'reply_7_2',
        topicId: 'mock_7',
        userId: 'user_rep_19',
        authorName: 'Lic. Pablo E.',
        authorColor: '#14b8a6',
        content: "Exacto, la póliza ayuda, pero asegúrate que el contrato base también lo mencione explícitamente.",
        createdAt: createDate(3),
        likes: fakeUserIds.slice(0, 3)
    },

    // Mock 8: INFONAVIT tardanza
    {
        id: 'reply_8_1',
        topicId: 'mock_8',
        userId: 'user_rep_20',
        authorName: 'AsesorInfo',
        authorColor: '#06b6d4',
        content: "Ahorita están tardando de 7 a 15 días hábiles después de la firma. Dile a tu vendedor que se calme, es proceso del instituto.",
        createdAt: createDate(4),
        likes: fakeUserIds.slice(0, 5)
    },
    {
        id: 'reply_8_2',
        topicId: 'mock_8',
        userId: 'user_rep_21',
        authorName: 'Miguel A.',
        authorColor: '#ec4899',
        content: "Uff, gracias. Me tenía muy presionado pensando que algo salió mal.",
        createdAt: createDate(4),
        likes: []
    },

    // Mock 9: Deposito
    {
        id: 'reply_9_1',
        topicId: 'mock_9',
        userId: 'user_rep_22',
        authorName: 'JusticiaCivica',
        authorColor: '#dc2626',
        content: "Si tienes la hoja de entrega firmada sin daños, tienes las de ganar. Mándales un correo formal exigiendo el pago en 48hrs o procedes legalmente. Suelen asustarse.",
        createdAt: createDate(4),
        likes: fakeUserIds.slice(0, 10)
    },
    {
        id: 'reply_9_2',
        topicId: 'mock_9',
        userId: 'user_rep_23',
        authorName: 'Lucía V.',
        authorColor: '#f43f5e',
        content: "Lo haré hoy mismo. Ya me cansé de esperar.",
        createdAt: createDate(4),
        likes: fakeUserIds.slice(0, 2)
    },
    {
        id: 'reply_9_3',
        topicId: 'mock_9',
        userId: 'user_rep_24',
        authorName: 'Victor R.',
        authorColor: '#6b7280',
        content: "A mí me descontaron pintura cuando la entregué recién pintada. Son unos ladrones.",
        createdAt: createDate(4),
        likes: fakeUserIds.slice(0, 5)
    },

    // Mock 10: Renta Aumento
    {
        id: 'reply_10_1',
        topicId: 'mock_10',
        userId: 'user_rep_25',
        authorName: 'AbogadoCivil',
        authorColor: '#3b82f6',
        content: "El código civil de CDMX establece un tope del 10% anual si la renta no excede cierto monto. 20% es excesivo, revísalo.",
        createdAt: createDate(5),
        likes: fakeUserIds.slice(0, 15)
    },
    {
        id: 'reply_10_2',
        topicId: 'mock_10',
        userId: 'user_rep_26',
        authorName: 'Eduardo B.',
        authorColor: '#84cc16',
        content: "Gracias, buscaré el artículo exacto para enseñárselo.",
        createdAt: createDate(5),
        likes: []
    },
    {
        id: 'reply_10_3',
        topicId: 'mock_10',
        userId: 'user_rep_27',
        authorName: 'VecinaCondesa',
        authorColor: '#ec4899',
        content: "Están gentrificando horrible. A todos mis vecinos les subieron muchísimo.",
        createdAt: createDate(5),
        likes: fakeUserIds.slice(0, 8)
    },
    {
        id: 'reply_10_4',
        topicId: 'mock_10',
        userId: 'user_rep_28',
        authorName: 'Marco Polo',
        authorColor: '#f59e0b',
        content: "Si te vas, seguro lo rentan en 25k a un extranjero. Triste realidad.",
        createdAt: createDate(5),
        likes: fakeUserIds.slice(0, 5)
    },

    // Mock 11: GDL Inversion
    {
        id: 'reply_11_1',
        topicId: 'mock_11',
        userId: 'user_rep_29',
        authorName: 'TapatioReal',
        authorColor: '#ef4444',
        content: "Zapopan Norte tiene más plusvalía futura, pero Providencia se renta más rápido a estudiantes o ejecutivos. Yo iría por Providencia si quieres flujo de efectivo ya.",
        createdAt: createDate(6),
        likes: fakeUserIds.slice(0, 4)
    },
    {
        id: 'reply_11_2',
        topicId: 'mock_11',
        userId: 'user_rep_30',
        authorName: 'InversionistaGDL',
        authorColor: '#06b6d4',
        content: "Buen punto. La vacancia me preocupa.",
        createdAt: createDate(6),
        likes: []
    },

    // Mock 12: Airbnb Estafa
    {
        id: 'reply_12_1',
        topicId: 'mock_12',
        userId: 'user_rep_31',
        authorName: 'Victima123',
        authorColor: '#6b7280',
        content: "¡Me pasó exactamente eso! En la Del Valle. El tipo tenía llaves y todo parecía real.",
        createdAt: createDate(6),
        likes: fakeUserIds.slice(0, 5)
    },
    {
        id: 'reply_12_2',
        topicId: 'mock_12',
        userId: 'user_rep_32',
        authorName: 'Mario Casas',
        authorColor: '#dc2626',
        content: "Siempre pidan ver la escritura o predial a nombre de quien les renta, y su INE.",
        createdAt: createDate(6),
        likes: fakeUserIds.slice(0, 10)
    },
    {
        id: 'reply_12_3',
        topicId: 'mock_12',
        userId: 'user_rep_33',
        authorName: 'SeguridadInm',
        authorColor: '#10b981',
        content: "Excelente alerta. Es el fraude de moda.",
        createdAt: createDate(6),
        likes: fakeUserIds.slice(0, 2)
    },

    // Mock 13: Mantenimiento
    {
        id: 'reply_13_1',
        topicId: 'mock_13',
        userId: 'user_rep_34',
        authorName: 'Ing. Civil',
        authorColor: '#f59e0b',
        content: "Un boiler tiene vida útil. Si tiene 10 años, es desgaste natural y le toca al dueño cambiarlo. No pagues.",
        createdAt: createDate(7),
        likes: fakeUserIds.slice(0, 6)
    },
    {
        id: 'reply_13_2',
        topicId: 'mock_13',
        userId: 'user_rep_35',
        authorName: 'Sofia P.',
        authorColor: '#a855f7',
        content: "Gracias. Se puso agresivo pero le diré eso.",
        createdAt: createDate(7),
        likes: []
    },
    {
        id: 'reply_13_3',
        topicId: 'mock_13',
        userId: 'user_rep_36',
        authorName: 'AbogadoArrend',
        authorColor: '#3b82f6',
        content: "El código civil lo respalda. Reparaciones necesarias para el uso son cuenta del arrendador.",
        createdAt: createDate(7),
        likes: fakeUserIds.slice(0, 3)
    },

    // Mock 14: Vicios Ocultos
    {
        id: 'reply_14_1',
        topicId: 'mock_14',
        userId: 'user_rep_37',
        authorName: 'NotarioAmigo',
        authorColor: '#64748b',
        content: "Ad Corpus se refiere a la superficie/medidas, no exime de vicios ocultos. Tienes 6 meses o 1 año (según estado) para reclamar vicios ocultos.",
        createdAt: createDate(8),
        likes: fakeUserIds.slice(0, 10)
    },
    {
        id: 'reply_14_2',
        topicId: 'mock_14',
        userId: 'user_rep_38',
        authorName: 'Jorge H.',
        authorColor: '#ea580c',
        content: "¡Qué alivio! Pensé que ya había perdido mi dinero.",
        createdAt: createDate(8),
        likes: []
    },

    // Mock 15: Roomie Deuda
    {
        id: 'reply_15_1',
        topicId: 'mock_15',
        userId: 'user_rep_39',
        authorName: 'ExperienciaRoomie',
        authorColor: '#ec4899',
        content: "Lección aprendida: siempre contrato de roomies y depósito de servicios aparte. Ahora te toca pagar a ti para no manchar tu historial.",
        createdAt: createDate(9),
        likes: fakeUserIds.slice(0, 5)
    },
    {
        id: 'reply_15_2',
        topicId: 'mock_15',
        userId: 'user_rep_40',
        authorName: 'Mariana G.',
        authorColor: '#db2777',
        content: "Ni modo, tocará pagar. Gracias.",
        createdAt: createDate(9),
        likes: []
    },

    // Mock 16: Preventa Retraso
    {
        id: 'reply_16_1',
        topicId: 'mock_16',
        userId: 'user_rep_41',
        authorName: 'DemandasColectivas',
        authorColor: '#ef4444',
        content: "Revisa tu contrato, debe haber cláusula de pena convencional. Si el retraso es mucho, puedes pedir rescisión + intereses. Júntate con otros vecinos.",
        createdAt: createDate(10),
        likes: fakeUserIds.slice(0, 12)
    },
    {
        id: 'reply_16_2',
        topicId: 'mock_16',
        userId: 'user_rep_42',
        authorName: 'Carlos D.',
        authorColor: '#4b5563',
        content: "Ya somos 5 vecinos organizándonos. Gracias.",
        createdAt: createDate(10),
        likes: fakeUserIds.slice(0, 2)
    },
    {
        id: 'reply_16_3',
        topicId: 'mock_16',
        userId: 'user_rep_43',
        authorName: 'Arq. Luis',
        authorColor: '#10b981',
        content: "A veces es mejor negociar que te den acabados de lujo extra en lugar de pelear en tribunales años.",
        createdAt: createDate(10),
        likes: fakeUserIds.slice(0, 4)
    },

    // Mock 17: Escrituras Originales
    {
        id: 'reply_17_1',
        topicId: 'mock_17',
        userId: 'user_rep_44',
        authorName: 'Notaria25',
        authorColor: '#000000',
        content: "¡NUNCA! Solo se entregan copias simples. Los originales solo se llevan a la notaría el día de la firma.",
        createdAt: createDate(11),
        likes: fakeUserIds.slice(0, 25)
    },
    {
        id: 'reply_17_2',
        topicId: 'mock_17',
        userId: 'user_rep_45',
        authorName: 'PropietarioAlerta',
        authorColor: '#ca8a04',
        content: "Sí, me dio pésima espina y los corrí de mi casa.",
        createdAt: createDate(11),
        likes: []
    },
    {
        id: 'reply_17_3',
        topicId: 'mock_17',
        userId: 'user_rep_46',
        authorName: 'Carmen S.',
        authorColor: '#ec4899',
        content: "Gracias por la alerta, hay gente muy abusiva.",
        createdAt: createDate(11),
        likes: fakeUserIds.slice(0, 2)
    },
    {
        id: 'reply_17_4',
        topicId: 'mock_17',
        userId: 'user_rep_47',
        authorName: 'Ricardo M.',
        authorColor: '#3b82f6',
        content: "Es intento de fraude inmobiliario seguro.",
        createdAt: createDate(11),
        likes: fakeUserIds.slice(0, 5)
    },

    // Mock 18: Hipoteca vs Inversion
    {
        id: 'reply_18_1',
        topicId: 'mock_18',
        userId: 'user_rep_48',
        authorName: 'Eduardo Rosas',
        authorColor: '#10b981',
        content: "Matemáticamente: Si Inversión (11% - impuestos) > Hipoteca (10.5%), conviene invertir. PERO la paz mental de no deber dinero vale más para muchos. Yo pagaría deuda.",
        createdAt: createDate(12),
        likes: fakeUserIds.slice(0, 15)
    },
    {
        id: 'reply_18_2',
        topicId: 'mock_18',
        userId: 'user_rep_49',
        authorName: 'FinanzasPersonales',
        authorColor: '#059669',
        content: "Buen punto lo de los impuestos. Creo que abonaré a capital.",
        createdAt: createDate(12),
        likes: []
    },
    {
        id: 'reply_18_3',
        topicId: 'mock_18',
        userId: 'user_rep_50',
        authorName: 'TraderX',
        authorColor: '#f59e0b',
        content: "SOFIPO te da hasta 15% ahorita, yo invertiría.",
        createdAt: createDate(12),
        likes: fakeUserIds.slice(0, 2)
    },

    // Mock 19: Discriminacion Mascota
    {
        id: 'reply_19_1',
        topicId: 'mock_19',
        userId: 'user_rep_51',
        authorName: 'Karen C.',
        authorColor: '#9333ea',
        content: "Es horrible, siento que odian a los animales en CDMX.",
        createdAt: createDate(13),
        likes: []
    },
    {
        id: 'reply_19_2',
        topicId: 'mock_19',
        userId: 'user_rep_52',
        authorName: 'VecinoAmigable',
        authorColor: '#14b8a6',
        content: "Legalmente, la Procuraduría Social dice que no pueden prohibir mascotas dentro de tu propiedad privada si no molestan. Pero en rentas el dueño pone sus reglas.",
        createdAt: createDate(13),
        likes: fakeUserIds.slice(0, 8)
    },
    {
        id: 'reply_19_3',
        topicId: 'mock_19',
        userId: 'user_rep_53',
        authorName: 'CatLover',
        authorColor: '#ec4899',
        content: "Busca 'Pet Friendly' en los filtros, sí hay pero son más caros.",
        createdAt: createDate(13),
        likes: fakeUserIds.slice(0, 3)
    },

    // Mock 20: Lista Negra
    {
        id: 'reply_20_1',
        topicId: 'mock_20',
        userId: 'user_rep_54',
        authorName: 'Anonimo1',
        authorColor: '#6b7280',
        content: "Juan Pérez de InmoX, me robó el apartado.",
        createdAt: createDate(14),
        likes: fakeUserIds.slice(0, 10)
    },
    {
        id: 'reply_20_2',
        topicId: 'mock_20',
        userId: 'user_rep_55',
        authorName: 'Anonimo2',
        authorColor: '#6b7280',
        content: "La agencia 'Casas Felices' en Querétaro son unos estafadores.",
        createdAt: createDate(14),
        likes: fakeUserIds.slice(0, 12)
    },
    {
        id: 'reply_20_3',
        topicId: 'mock_20',
        userId: 'user_rep_56',
        authorName: 'JusticieroInm',
        authorColor: '#000000',
        content: "Sigan aportando, armaremos un Excel compartido.",
        createdAt: createDate(14),
        likes: fakeUserIds.slice(0, 20)
    }
];
