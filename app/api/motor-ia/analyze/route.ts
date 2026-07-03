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
            2. autorSimulado: Si ves el nombre, usa SOLO el primer nombre y la inicial del primer apellido (Ej: "Juan P."). Si no es visible, usa "Anónimo".
            3. textoExtracto: Si el elemento es puro texto, transcríbelo. PERO si incluye imágenes, NO transcribas texto sin sentido; redacta una descripción interpretando el contexto (Ej: "El usuario publicó fotos mostrando humedades...").
            4. calificacion: Evalúa el nivel de queja y asigna una calificación del 1 al 5.
            5. fechaStr: Identifica y extrae el texto que indique la fecha o antigüedad del post o comentario (Ej: "Hace 6 meses", "Hace 2 semanas", "Ayer", "23 May"). Si no es visible, usa "SIN FECHA".
            6. ANIDACIÓN: Si detectas que un "post" tiene "comentarios" respondiéndole en la misma imagen, incluye los comentarios dentro del arreglo "respuestas" de ese post. Si es solo un comentario suelto o un post suelto, ponlo en la raíz.
            
            Devuelve ESTRICTAMENTE un JSON válido que contenga un ARRAY de objetos con esta estructura (ejemplo con anidación):
            [
              {
                "tipo": "post",
                "autorSimulado": "Nombre P.",
                "textoExtracto": "La queja transcrita...",
                "calificacion": 1,
                "fechaStr": "Hace 6 meses",
                "respuestas": [
                  {
                    "tipo": "comentario",
                    "autorSimulado": "Ana G.",
                    "textoExtracto": "A mí también me estafaron...",
                    "calificacion": 1,
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
