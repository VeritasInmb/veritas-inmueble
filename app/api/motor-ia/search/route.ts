import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore
import { GoogleGenAI, Type } from '@google/genai';

export async function POST(req: NextRequest) {
    try {
        const { query } = await req.json();
        
        if (!query) {
            return NextResponse.json({ error: 'Missing query' }, { status: 400 });
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ 
                candidates: [
                    { title: "Simulación de Búsqueda", snippet: "Resultado simulado para " + query, url: "https://example.com" }
                ]
            });
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        const prompt = `Eres un asistente de búsqueda. 
        OBLIGATORIO: Utiliza tu herramienta de búsqueda de Google.
        Busca exactamente esto: "${query}"
        
        No necesito un resumen de texto. Solo quiero que me devuelvas una lista estricta de los 5 a 10 links (URLs) más relevantes que encontraste en la búsqueda.
        
        Debes responder EXCLUSIVAMENTE con un arreglo en formato JSON. No escribas texto antes ni después.
        Formato requerido:
        [
            {
                "title": "Título de la página",
                "snippet": "Breve resumen de 1 línea",
                "url": "https://..."
            }
        ]`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
                temperature: 0.2
            }
        });

        // Parse JSON output (strip markdown if any)
        let candidates: any[] = [];
        try {
            let rawText = response.text || "";
            rawText = rawText.trim();
            if (rawText.startsWith('\`\`\`json')) {
                rawText = rawText.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
            } else if (rawText.startsWith('\`\`\`')) {
                rawText = rawText.replace(/^\`\`\`/, '').replace(/\`\`\`$/, '').trim();
            }
            candidates = JSON.parse(rawText);
        } catch (e) {
            console.error("Error parsing JSON array from Gemini:", e);
            console.log("Raw text was:", response.text);
        }

        return NextResponse.json({ candidates });

    } catch (error: any) {
        console.error("API Search Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
