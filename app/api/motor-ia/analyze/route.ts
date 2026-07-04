import { NextRequest, NextResponse } from 'next/server';

// @ts-ignore
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
    try {
        const { imageBase64, type } = await req.json();
        
        if (!imageBase64 || !type) {
            return NextResponse.json({ error: 'Missing imageBase64 or type' }, { status: 400 });
        }

        const base64Data = imageBase64.split(',')[1] || imageBase64;
        const mimeType = imageBase64.includes(';') ? imageBase64.split(';')[0].split(':')[1] : 'image/jpeg';
        
        if (!process.env.GEMINI_API_KEY) {
            console.warn("No GEMINI_API_KEY found. Returning mock response.");
            return NextResponse.json({ 
                extracto: `SIMULACIÓN de análisis de ${type}. (Configura GEMINI_API_KEY).`,
            });
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        let prompt = "";
        let isJson = false;
        
        if (type === 'profeco') {
            prompt = `Eres un auditor legal. Analiza esta captura de pantalla del Buró Comercial de Profeco. Extrae cuántas quejas tiene, cuáles son los principales motivos de reclamación, y dame un resumen muy profesional y objetivo.`;
        } else if (type === 'google_rating') {
            prompt = `Extrae la calificación general (estrellas) y el número total de reseñas que se ven en esta imagen de Google Maps. Responde con el formato: "Rating: [X], Reseñas: [Y]".`;
        } else if (type === 'google_comment') {
            prompt = `Extrae el texto del comentario de la reseña en esta imagen. Clasifica su tono como Positivo, Negativo o Neutral. Omite el nombre de la persona que lo escribió para proteger su privacidad.`;
        } else if (type === 'redes_sociales') {
            isJson = true;
            prompt = `Actúa como Analista de Inteligencia OSINT. Analiza esta captura de pantalla de una red social.
            Tu objetivo es desglosar la imagen y detectar TODOS los elementos (el post principal y los comentarios).
            
            Reglas de extracción para cada elemento detectado:
            1. tipo: Determina si el elemento es un "post" (la publicación principal) o un "comentario".
            2. autorSimulado: Si el autor es un usuario común, usa SOLO el primer nombre y la inicial del primer apellido (Ej: "Juan P."). Si es la cuenta oficial de la empresa/inmobiliaria respondiendo, usa el nombre de la empresa o simplemente "Inmobiliaria". Si no es visible, usa "Usuario Anonimizado".
            3. textoExtracto: Si el elemento es puro texto, transcríbelo. PERO si incluye imágenes, NO transcribas texto sin sentido; redacta una descripción interpretando el contexto (Ej: "El usuario publicó fotos mostrando humedades...").
            4. calificacion: Analiza el sentimiento del post/comentario y asígnale estrellas del 1 al 5 (1 siendo muy negativo/queja, 5 muy positivo). Si es sólo una duda, pregunta, o no indica nada en especial (neutral), asigna estrictamente un 0.
            5. fechaStr: Identifica y extrae el texto que indique la fecha o antigüedad del post o comentario (Ej: "Hace 6 meses", "Hace 2 semanas", "Ayer", "23 May"). Si no es visible, usa "SIN FECHA".
            6. rol: Determina si el autor es un "Usuario Anonimizado" (cliente o persona) o la "Inmobiliaria" (la cuenta oficial de la empresa respondiendo).
            7. ANIDACIÓN (1 NIVEL MÁXIMO): El sistema solo soporta UN nivel de anidación (Post -> Respuestas). 
            - Si la imagen muestra un POST principal con varios comentarios, pon los comentarios en "respuestas".
            - Si la imagen solo muestra un COMENTARIO de un usuario y debajo la respuesta de la Inmobiliaria a ese comentario, TRATA al comentario del usuario como si fuera el "post" principal (tipo: "post") y mete la respuesta de la inmobiliaria dentro de sus "respuestas" (tipo: "comentario").
            8. NO OMITAS NADA: Es CRÍTICO que extraigas TODAS las respuestas visibles en la captura. Presta especial atención a las respuestas que la cuenta de la Inmobiliaria hace a los comentarios de los usuarios y asegúrate de incluirlas como objetos dentro de "respuestas" bajo la regla anterior.
            
            Devuelve ESTRICTAMENTE un JSON válido que contenga un ARRAY de objetos con esta estructura (ejemplo con anidación):
            [
              {
                "tipo": "post",
                "autorSimulado": "Usuario 1",
                "textoExtracto": "La queja transcrita...",
                "calificacion": 1,
                "rol": "Usuario Anonimizado",
                "fechaStr": "Hace 6 meses",
                "respuestas": [
                  {
                    "tipo": "comentario",
                    "autorSimulado": "Inmobiliaria",
                    "textoExtracto": "Lamentamos lo sucedido...",
                    "calificacion": 0,
                    "rol": "Inmobiliaria",
                    "fechaStr": "Hace 5 meses"
                  }
                ]
              }
            ]`;
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: [
                prompt,
                {
                    inlineData: {
                        data: base64Data,
                        mimeType: mimeType
                    }
                }
            ],
        });

        if (isJson) {
            let aiText = response.text || '';
            aiText = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
            try {
                const parsed = JSON.parse(aiText);
                return NextResponse.json({ data: parsed });
            } catch (e) {
                console.error("JSON parse error:", aiText);
                return NextResponse.json({ error: 'AI returned invalid JSON' }, { status: 500 });
            }
        }

        return NextResponse.json({ 
            extracto: response.text
        });

    } catch (error: any) {
        console.error("API Analyze Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
