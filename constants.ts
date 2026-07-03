
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
    
    // Penalizaciones por SAT
    if (agency.rfcStatus?.toLowerCase() === 'inactivo' || agency.rfcStatus?.toLowerCase() === 'irregular') {
        score -= 40;
    } else if (!agency.rfcStatus || agency.rfcStatus?.toLowerCase() === 'desconocido') {
        score -= 10;
    }

    // Penalizaciones por PROFECO
    if (agency.dictamenProfeco?.totalQuejas) {
        const numQuejas = agency.dictamenProfeco.totalQuejas;
        if (numQuejas > 10) {
            score -= 30;
        } else if (numQuejas > 5) {
            score -= 20;
        } else if (numQuejas > 0) {
            score -= 10;
        }
    }

    // Penalizaciones por Contrato
    if (!agency.contrato) {
        score -= 15;
    }

    return Math.max(0, score);
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
        const sum = reviews.reduce((acc, r) => acc + (r.calificacion || 0), 0);
        veritasScore = sum / reviews.length;
        veritasWeight = 0.50;
    }

    // 2. Externas (Redes Sociales)
    const evidencias = agency.evidenciasSociales || [];
    if (evidencias.length > 0) {
        let sum = 0;
        evidencias.forEach(ev => {
            if (ev.resenaGenerada && ev.resenaGenerada.calificacion) {
                sum += ev.resenaGenerada.calificacion;
            } else {
                // Default a 1 si no hay calificación explícita (asumiendo queja por defecto si se reportó)
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