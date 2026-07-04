
import { ScoreInfo, Inmobiliaria, Resena } from './types';

// Mock data is no longer used; data will be fetched from Firebase.
// This file is kept for utility functions like getScoreInfo.

export function getScoreInfo(score: number): ScoreInfo {
    if (score >= 90) {
        return {
            color: '#22c55e', // green-500
            textColor: 'text-green-500',
            veredicto: 'CONFIANZA TOTAL'
        };
    }
    if (score >= 80) {
        return {
            color: '#14b8a6', // teal-500
            textColor: 'text-teal-500',
            veredicto: 'CONFIABLE'
        };
    }
    if (score >= 50) {
        return {
            color: '#eab308', // yellow-500
            textColor: 'text-yellow-500',
            veredicto: 'PRECAUCIÓN'
        };
    }
    return {
        color: '#ef4444', // red-500
        textColor: 'text-red-500',
        veredicto: 'ALTO RIESGO'
    };
}

export function calculateAgencyScore(agency: Inmobiliaria): number {
    if (!agency) return 0;
    let score = 100;
    
    // 1. Penalizaciones por SAT (Estatus Fiscal)
    if (agency.rfcStatus?.toLowerCase() === 'inactivo' || agency.rfcStatus?.toLowerCase() === 'irregular' || agency.rfcStatus?.toLowerCase() === 'no localizable') {
        score -= 45;
    } else if (!agency.rfcStatus || agency.rfcStatus?.toLowerCase() === 'desconocido') {
        score -= 15;
    }

    // 2. Penalizaciones por PROFECO (Quejas por Año & Resolución)
    if (agency.dictamenProfeco) {
        // Ratio: Quejas por Año
        if (agency.dictamenProfeco.totalQuejas) {
            let antiguedad = agency.antiguedad && agency.antiguedad > 0 ? agency.antiguedad : 1; // Prevenir división por cero
            
            // Si no hay antigüedad explícita, intentamos inferirla de la edad del dominio
            if (!agency.antiguedad && agency.fichaTecnica?.antiguedadDominio) {
                const domainAge = agency.fichaTecnica.antiguedadDominio.toLowerCase();
                const matchYears = domainAge.match(/(\d+)\s*(año|year)/i);
                if (matchYears) {
                    antiguedad = parseInt(matchYears[1]);
                } else if (domainAge.includes('mes') || domainAge.includes('month') || domainAge.includes('día') || domainAge.includes('day')) {
                    antiguedad = 1; // Si son meses o días, asumimos mínimo 1 año para el cálculo matemático
                } else if (!isNaN(Date.parse(domainAge))) {
                    const creationDate = new Date(domainAge);
                    const ageDifMs = Date.now() - creationDate.getTime();
                    const ageDate = new Date(ageDifMs);
                    const years = Math.abs(ageDate.getUTCFullYear() - 1970);
                    antiguedad = years > 0 ? years : 1;
                }
            }

            const quejasPorAno = agency.dictamenProfeco.totalQuejas / antiguedad;
            
            if (quejasPorAno > 10) {
                score -= 30; // Riesgo altísimo (típico de estafas rápidas)
            } else if (quejasPorAno > 5) {
                score -= 15;
            }
            // Menos de 5 por año no penaliza (margen normal para grandes empresas)
        }
        
        // Tasa de Resolución (Conciliación)
        if (agency.dictamenProfeco.tasaResolucion) {
            const resolucion = agency.dictamenProfeco.tasaResolucion.toLowerCase();
            const matchPorcentaje = resolucion.match(/(\d+)%/);
            let tasaBuena = false;
            let tasaMala = false;
            
            if (matchPorcentaje) {
                const pct = parseInt(matchPorcentaje[1]);
                if (pct >= 80) tasaBuena = true;
                if (pct <= 40) tasaMala = true;
            } else {
                if (resolucion.includes('buena') || resolucion.includes('alta') || resolucion.includes('responde') || resolucion.includes('concilia')) {
                    tasaBuena = true;
                } else if (resolucion.includes('mala') || resolucion.includes('baja') || resolucion.includes('no responde') || resolucion.includes('abandono') || resolucion.includes('negligencia')) {
                    tasaMala = true;
                }
            }
            
            if (tasaBuena) score += 10;
            if (tasaMala) score -= 15;
        }
    }

    // 3. Penalizaciones por Contrato de Adhesión
    if (!agency.contrato) {
        score -= 20; // Requisito legal muy fuerte
    }
    
    // 4. Modificador de Impacto Social (Radar de Confianza 1-5 estrellas)
    if (agency.indiceConfianza !== undefined && agency.indiceConfianza > 0) {
        if (agency.indiceConfianza <= 2.5) {
            score -= 15; // Alerta roja en redes
        } else if (agency.indiceConfianza >= 4.0) {
            score += 5; // Aprobación fuerte en redes
        }
    }

    // Asegurar que el score se mantenga en un rango válido de 0 a 100
    return Math.min(100, Math.max(0, score));
}

export function calculateSocialVerdict(agency: Inmobiliaria, reviews: Resena[]): number {
    let veritasScore = 0;
    let externalScore = 0;
    let newsScore = 0;
    
    let veritasWeight = 0;
    let externalWeight = 0;
    let newsWeight = 0;

    // 1. Nativas (Veritas)
    if (reviews && reviews.length > 0) {
        let sum = 0;
        let count = 0;
        reviews.forEach(r => {
            if (typeof r.calificacion === 'number' && r.calificacion > 0) {
                sum += r.calificacion;
                count++;
            }
            if (r.replies && r.replies.length > 0) {
                r.replies.forEach(reply => {
                    if (typeof reply.calificacion === 'number' && reply.calificacion > 0) {
                        sum += reply.calificacion;
                        count++;
                    }
                });
            }
        });
        if (count > 0) {
            veritasScore = sum / count;
            veritasWeight = 0.50;
        }
    }

    // 2. Externas (Redes Sociales)
    const evidencias = agency.evidenciasSociales || [];
    if (evidencias.length > 0) {
        let sum = 0;
        let count = 0;
        evidencias.forEach(ev => {
            if (ev.resenaGenerada && typeof ev.resenaGenerada.calificacion === 'number') {
                if (ev.resenaGenerada.calificacion > 0) {
                    sum += ev.resenaGenerada.calificacion;
                    count++;
                }
            } else {
                // Default a 1 si no hay calificación explícita
                sum += 1;
                count++;
            }
            
            if (ev.replies && ev.replies.length > 0) {
                ev.replies.forEach(reply => {
                    if (reply.resenaGenerada && typeof reply.resenaGenerada.calificacion === 'number' && reply.resenaGenerada.calificacion > 0) {
                        sum += reply.resenaGenerada.calificacion;
                        count++;
                    }
                });
            }
        });
        if (count > 0) {
            externalScore = sum / count;
            externalWeight = 0.30;
        }
    }

    // 3. Noticias (Menciones Web)
    const menciones = agency.mencionesWeb || [];
    if (menciones.length > 0) {
        let sum = 0;
        menciones.forEach(m => {
            if (m.tono === 'Positivo') sum += 5;
            else if (m.tono === 'Neutral') sum += 3;
            else sum += 1; // Negativo
        });
        newsScore = sum / menciones.length;
        newsWeight = 0.20;
    }

    // Si no hay datos en absoluto
    const totalWeight = veritasWeight + externalWeight + newsWeight;
    if (totalWeight === 0) return 0; // 0 significa 'Sin datos suficientes'

    // Redistribuir pesos si falta alguna fuente
    const finalScore = (
        (veritasScore * veritasWeight) + 
        (externalScore * externalWeight) + 
        (newsScore * newsWeight)
    ) / totalWeight;

    // Redondear a 1 decimal
    return Math.round(finalScore * 10) / 10;
}