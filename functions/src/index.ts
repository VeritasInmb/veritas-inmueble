import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

// Función auxiliar para recalcular el Score Veritas basado en el historial legal de la inmobiliaria
function calculateScoreVeritas(inmobiliaria: admin.firestore.DocumentData): number {
    let score = 100;
    
    // Penalizaciones por SAT
    if (inmobiliaria.rfcStatus?.toLowerCase() === 'inactivo' || inmobiliaria.rfcStatus?.toLowerCase() === 'irregular') {
        score -= 40;
    } else if (!inmobiliaria.rfcStatus || inmobiliaria.rfcStatus?.toLowerCase() === 'desconocido') {
        score -= 10;
    }

    // Penalizaciones por PROFECO
    if (inmobiliaria.dictamenProfeco?.totalQuejas) {
        const numQuejas = inmobiliaria.dictamenProfeco.totalQuejas;
        if (numQuejas > 10) {
            score -= 30;
        } else if (numQuejas > 5) {
            score -= 20;
        } else if (numQuejas > 0) {
            score -= 10;
        }
    }

    // Penalizaciones por Contrato
    if (!inmobiliaria.contrato) {
        score -= 15;
    }

    return Math.max(0, score);
}

// Función auxiliar para recalcular el Veredicto Social
function calculateSocialVerdict(agency: any, reviews: any[]): number {
    let veritasScore = 0;
    let externalScore = 0;
    let newsScore = 0;
    
    let veritasWeight = 0;
    let externalWeight = 0;
    let newsWeight = 0;

    // 1. Nativas (Veritas)
    if (reviews && reviews.length > 0) {
        const sum = reviews.reduce((acc, r) => acc + (r.calificacion || 0), 0);
        veritasScore = sum / reviews.length;
        veritasWeight = 0.50;
    }

    // 2. Externas (Redes Sociales)
    const evidencias = agency.evidenciasSociales || [];
    if (evidencias.length > 0) {
        let sum = 0;
        evidencias.forEach((ev: any) => {
            if (ev.resenaGenerada && ev.resenaGenerada.calificacion) {
                sum += ev.resenaGenerada.calificacion;
            } else {
                sum += 1;
            }
        });
        externalScore = sum / evidencias.length;
        externalWeight = 0.30;
    }

    // 3. Noticias (Menciones Web)
    const menciones = agency.mencionesWeb || [];
    if (menciones.length > 0) {
        let sum = 0;
        menciones.forEach((m: any) => {
            if (m.tono === 'Positivo') sum += 5;
            else if (m.tono === 'Neutral') sum += 3;
            else sum += 1; // Negativo
        });
        newsScore = sum / menciones.length;
        newsWeight = 0.20;
    }

    const totalWeight = veritasWeight + externalWeight + newsWeight;
    if (totalWeight === 0) return 0;

    const finalScore = (
        (veritasScore * veritasWeight) + 
        (externalScore * externalWeight) + 
        (newsScore * newsWeight)
    ) / totalWeight;

    return Math.round(finalScore * 10) / 10;
}

// 1. Vigilante de Reseñas: Se ejecuta cuando se crea, edita o borra una reseña
export const onResenaWritten = functions.firestore
    .document('resenas/{resenaId}')
    .onWrite(async (change: any, context: any) => {
        const resena = change.after.exists ? change.after.data() : change.before.data();
        if (!resena || !resena.inmobiliariaId) return null;

        const inmobiliariaId = resena.inmobiliariaId;
        const db = admin.firestore();

        // Obtener TODAS las reseñas de esta inmobiliaria para recalcular
        const snapshot = await db.collection('resenas').where('inmobiliariaId', '==', inmobiliariaId).get();
        const resenas = snapshot.docs.map(doc => doc.data());
        
        let sum = 0;
        let count = 0;
        resenas.forEach(data => {
            if (typeof data.calificacion === 'number' && data.calificacion > 0) {
                sum += data.calificacion;
                count++;
            }
            if (data.replies && data.replies.length > 0) {
                data.replies.forEach((reply: any) => {
                    if (typeof reply.calificacion === 'number' && reply.calificacion > 0) {
                        sum += reply.calificacion;
                        count++;
                    }
                });
            }
        });

        const ratingAvg = count > 0 ? (sum / count) : 0;

        const agencyDoc = await db.collection('inmobiliarias').doc(inmobiliariaId).get();
        if (!agencyDoc.exists) return null;
        const agencyData = agencyDoc.data()!;

        const newSocialVerdict = calculateSocialVerdict(agencyData, resenas as any[]);
        
        let externalCount = 0;
        const evidencias = agencyData.evidenciasSociales || [];
        evidencias.forEach((ev: any) => {
             if (ev.resenaGenerada && ev.resenaGenerada.calificacion === 0) {
                 // Neutro, ignorar
             } else {
                 externalCount++;
             }
             if (ev.replies && ev.replies.length > 0) {
                 ev.replies.forEach((reply: any) => {
                     if (reply.resenaGenerada && typeof reply.resenaGenerada.calificacion === 'number' && reply.resenaGenerada.calificacion > 0) {
                         externalCount++;
                     }
                 });
             }
        });
        
        const totalOpinions = count + externalCount;

        // Actualizar la inmobiliaria
        await db.collection('inmobiliarias').doc(inmobiliariaId).update({
            ratingAvg: ratingAvg,
            ratingCount: count,
            socialVerdict: newSocialVerdict,
            totalOpinions: totalOpinions
        });

        console.log(`Inmobiliaria ${inmobiliariaId} actualizada por reseña`);
        return null;
    });

// 2. Vigilante de Inmobiliarias: Se ejecuta cuando cambian los datos de una inmobiliaria
export const onInmobiliariaWritten = functions.firestore
    .document('inmobiliarias/{inmobiliariaId}')
    .onWrite(async (change: any, context: any) => {
        // Si el documento fue borrado, no hacemos nada
        if (!change.after.exists) return null;

        const afterData = change.after.data()!;
        const beforeData = change.before.exists ? change.before.data() : null;

        const updates: any = {};

        // 1. Recalcular base score
        const newScore = calculateScoreVeritas(afterData);
        if (afterData.score !== newScore) {
            updates.score = newScore;
        }

        // 2. Recalcular Veredicto Social solo si evidencias o menciones cambiaron, o si falta
        const evidenciasChanged = JSON.stringify(afterData.evidenciasSociales) !== JSON.stringify(beforeData?.evidenciasSociales);
        const mencionesChanged = JSON.stringify(afterData.mencionesWeb) !== JSON.stringify(beforeData?.mencionesWeb);

        if (evidenciasChanged || mencionesChanged || afterData.socialVerdict === undefined) {
            const db = admin.firestore();
            const snapshot = await db.collection('resenas').where('inmobiliariaId', '==', context.params.inmobiliariaId).get();
            const resenas = snapshot.docs.map(doc => doc.data());
            
            const newSocialVerdict = calculateSocialVerdict(afterData, resenas);
            const externalCount = (afterData.evidenciasSociales || []).length;
            const nativeCount = resenas.length;
            const totalOpinions = nativeCount + externalCount;

            if (afterData.socialVerdict !== newSocialVerdict || afterData.totalOpinions !== totalOpinions) {
                updates.socialVerdict = newSocialVerdict;
                updates.totalOpinions = totalOpinions;
            }
        }

        // Solo actualizamos si hay cambios reales
        if (Object.keys(updates).length > 0) {
            console.log(`Actualizando inmobiliaria ${context.params.inmobiliariaId}:`, updates);
            return change.after.ref.update(updates);
        }

        return null;
    });
