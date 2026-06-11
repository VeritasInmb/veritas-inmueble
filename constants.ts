
import { ScoreInfo } from './types';

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