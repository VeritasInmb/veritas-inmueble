import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
// @ts-ignore
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
    try {
        const { url, textoManual, agencyName } = await req.json();
        
        if (!agencyName) {
            return NextResponse.json({ error: 'Missing agencyName' }, { status: 400 });
        }

        if (!url && !textoManual) {
            return NextResponse.json({ error: 'Missing url or textoManual' }, { status: 400 });
        }

        let rawText = '';
        let pageTitle = '';

        if (textoManual) {
            rawText = textoManual;
            pageTitle = 'Texto manual';
        } else if (url) {
            try {
                const response = await fetch(url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    }
                });
                if (!response.ok) {
                    throw new Error(`Failed to fetch url: ${response.statusText}`);
                }
                const html = await response.text();
                const $ = cheerio.load(html);
                
                // Remove scripts, styles, nav, footer, etc to get clean text
                $('script, style, nav, footer, header, aside').remove();
                
                pageTitle = $('title').text().trim() || url;
                rawText = $('body').text().replace(/\s+/g, ' ').trim();
                
            } catch (error: any) {
                console.error("Error scraping URL:", error);
                return NextResponse.json({ error: 'No se pudo acceder a la URL. Tal vez tiene protección anti-bots. Por favor, copia y pega el texto manualmente.' }, { status: 400 });
            }
        }

        // Limit the text length just in case it's massive
        if (rawText.length > 40000) {
            rawText = rawText.substring(0, 40000);
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ 
                error: 'No GEMINI_API_KEY found.'
            }, { status: 500 });
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        const prompt = `Eres un Analista de Datos de Inteligencia. Se te proporciona el contenido extraído de un artículo, blog o sitio web y el nombre de una inmobiliaria objetivo.

INMOBILIARIA OBJETIVO: "${agencyName}"

TEXTO DEL SITIO WEB:
"""
${rawText}
"""

Tu única misión es buscar si hay menciones o quejas sobre "${agencyName}" dentro del texto.
Ignora a cualquier otra empresa que se mencione. 
Si encuentras información relevante sobre la inmobiliaria objetivo, extrae la queja o contexto y redacta lo siguiente:
1. Un TITULAR de enganche (máximo 15 palabras) que resuma el núcleo del problema o situación. Será lo primero que lean los usuarios.
2. Un RESUMEN ejecutivo breve y directo de toda la situación.
Clasifica el tono de la información hacia la inmobiliaria como: Positivo, Negativo o Neutral.
Asigna una severidad del 1 al 5 (donde 1 es leve o no hay queja, y 5 es una acusación grave de fraude o demanda).

Responde ÚNICAMENTE en formato JSON válido con la siguiente estructura y sin bloques de código markdown:
{
  "relevante": boolean, // true si menciona a la inmobiliaria objetivo, false si no
  "titular": "Titular impactante y breve...",
  "resumen": "Resumen ejecutivo detallado del contexto encontrado...",
  "tono": "Negativo", // "Positivo", "Negativo" o "Neutral"
  "severidad": 3
}`;

        const geminiResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.2,
            }
        });

        let outputText = geminiResponse.text || '';
        outputText = outputText.replace(/```json/g, '').replace(/```/g, '').trim();

        let parsedData;
        try {
            parsedData = JSON.parse(outputText);
        } catch (e) {
            console.error("Failed to parse JSON from Gemini", outputText);
            return NextResponse.json({ error: 'La IA no devolvió un formato válido.' }, { status: 500 });
        }

        if (!parsedData.relevante) {
            return NextResponse.json({ warning: `No se encontraron menciones relevantes sobre "${agencyName}" en este texto.` }, { status: 200 });
        }

        return NextResponse.json({
            url: url || 'Texto manual',
            tituloOriginal: pageTitle,
            titular: parsedData.titular || 'Mención Relevante',
            resumen: parsedData.resumen,
            tono: parsedData.tono,
            severidad: parsedData.severidad
        });

    } catch (error: any) {
        console.error('Error in scrape-url API:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
