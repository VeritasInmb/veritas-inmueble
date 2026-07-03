
export interface Fuente {
  title: string;
  uri: string;
}

export interface FichaTecnica {
  telefono?: string;
  email?: string;
  direccion?: string;
  tieneAvisoPrivacidad?: boolean;
  rfc?: string;
  sitioWeb?: string;
  redesSociales?: string[];
  antiguedadDominio?: string;
  antiguedadReclamada?: string;
  alertaAntiguedad?: string;
  websiteScreenshot?: string;
  analisisVisual?: string;
  equipoDirectivoOculto?: boolean;
}

export interface Inmobiliaria {
  id: string; // Firestore document ID
  nombre: string;
  score: number; // Veritas Score calculated at write time
  quejas?: number;
  googleRating?: number;
  antiguedad?: number;
  controversias?: string;
  fuentes?: Fuente[];
  indiceConfianza?: number; // Social rating calculated at write time
  ratingAvg?: number; // Cached rating average
  ratingCount?: number; // Cached rating count
  contrato: boolean;
  miembroAMPI: boolean;
  rfcStatus: 'activo' | 'inactivo' | 'desconocido' | string;
  domicilio: boolean; // Changed from string to boolean
  estado: string; // New field for state filtering
  imageUrl?: string; // New field for agency image URL
  imageUrls?: string[]; // Transient field for base64 web screenshots
  googleStatus?: 'verificado' | 'no_existe' | 'confuso';
  websiteScreenshotsUrls?: string[];
  driveFolderId?: string;
  evidenciasProfeco?: Array<{ driveFileId?: string, fileUrl?: string, extracto: string }>;
  dictamenProfeco?: {
    anosDetectados: string;
    totalQuejas: number;
    tasaResolucion: string;
    motivosPrincipales: string[];
    veredictoEnganche: string;
  };
  reporteBanderasRojas?: string;
  urlProfeco?: string;
  evidenciasGoogle?: Array<{ driveFileId?: string, fileUrl?: string, extracto: string, tipo: 'rating' | 'comentario' }>;
  controversiasWebUrls?: string[];
  fichaTecnica?: FichaTecnica;
  evidenciasSociales?: Array<{ 
    redSocial: string, 
    fileUrl: string, 
    esPostPrincipal: boolean, 
    resenaGenerada: Partial<Resena>,
    replies?: Array<{
        redSocial: string,
        fileUrl: string,
        resenaGenerada: Partial<Resena>
    }>
  }>;
  mencionesWeb?: Array<{
    id: string;
    url: string;
    titular: string;
    resumen: string;
    tono: 'Positivo' | 'Negativo' | 'Neutral';
    severidad: number;
    tituloOriginal?: string;
  }>;
}

export interface CandidateLink {
  title: string;
  snippet: string;
  url: string;
}

export interface Usuario {
  id: string; // Firebase Auth UID and Firestore document ID
  nombre: string;
  email: string;
  rol: 'admin' | 'usuario';
  avatarUrl?: string; // Optional avatar URL
  profileColor?: string; // Persistent profile color
  bio?: string; // New: user biography
  createdAt?: any; // Firestore Timestamp
  verificado?: boolean; // Custom verification status
  verificationCode?: string; // Temporary code for OTP flow
}

export interface Reply {
  id: string;
  usuarioId: string;
  usuarioNombre: string;
  usuarioAvatar?: string;
  usuarioColor?: string;
  comentario: string;
  fecha: any; // Firestore Timestamp
}

export interface Resena {
  id: string; // Firestore document ID
  inmobiliariaId: string;
  usuarioId: string;
  usuarioNombre: string;
  usuarioAvatar?: string;
  usuarioColor?: string;
  usuarioRol?: 'admin' | 'usuario';
  calificacion: number; // 1-5 (Overall average)
  calificacionesDetalladas?: {
    comunicacion: number;
    contrato: number;
    propiedad: number;
    solucion: number;
  };
  comentario: string;
  fecha: any; // Firestore Timestamp
  tieneEvidencia: boolean; // Indicates if user uploaded a file
  verificada: boolean; // Indicates if an admin has verified the evidence
  inmobiliariaNombre?: string;
  autorSimulado?: string;
  textoExtracto?: string;
  likedBy?: string[]; // Array of user IDs who liked the review
  dislikedBy?: string[]; // Array of user IDs who disliked the review
  replies?: Reply[]; // Array of replies
  estado?: 'pendiente' | 'publicada';
  redSocialOrigen?: string; // If this review was extracted from social media (e.g. Facebook)
}

export interface BlogPost {
  id: string; // Changed from number to string for Firestore compatibility
  title: string;
  author: string;
  date: string;
  summary: string;
  content: string;
  imageUrl: string;
}

export interface ScoreInfo {
  color: string;
  textColor: string;
  veredicto: string;
}

// Extends Usuario to include properties only available in the context
export type CurrentUser = Usuario & {
    emailVerified: boolean; // Keeps compatibility with Auth check, but we prioritize 'verificado'
};

export interface SolicitudRevision {
  id: string;
  nombreInmobiliaria: string;
  url: string;
  fecha: any; // Firestore Timestamp
  usuarioId: string;
  estado: 'pendiente' | 'analizada';
  usuarioEmail?: string; // To display in the admin panel
}

// --- Forum Interfaces ---
export interface ForumCategory {
  id: string;
  name: string;
  iconName: string; // Name of the lucide icon
  description?: string;
}

export interface ForumTopic {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  userId: string;
  authorName: string;
  authorAvatar?: string;
  authorColor?: string;
  createdAt: any; // Firestore Timestamp
  likes: string[]; // User IDs who liked
  replyCount: number;
  views: number;
  tags: string[];
}

export interface ForumReply {
  id: string;
  topicId: string;
  userId: string;
  authorName: string;
  authorAvatar?: string;
  authorColor?: string;
  content: string;
  createdAt: any; // Firestore Timestamp
  likes: string[]; // User IDs who liked
}

// --- Notification Interface ---
export interface Notification {
  id: string;
  userId: string; // Receiver
  type: 'like_review' | 'reply_review' | 'reply_forum' | 'like_forum';
  content: string;
  createdAt: any;
  read: boolean;
  fromUserName: string;
  fromUserId: string;
  linkId: string; // ID to navigate to (review ID, topic ID)
}

// View Type for Navigation
export type ViewType = 'home' | 'profile' | 'admin' | 'about' | 'blog' | 'blogPost' | 'directory' | 'forum' | 'userProfile' | 'login';
