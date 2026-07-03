import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';


export async function POST(req: NextRequest) {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const { images } = await req.json(); // Array of { data, mimeType }
        
        if (!images || !images.length) {
            return NextResponse.json({ error: 'No images provided' }, { status: 400 });
        }

        const prompt = `Actúa como un auditor forense experto en la Procuraduría Federal del Consumidor (Profeco) de México.
Se te proporcionarán una o más imágenes que corresponden a capturas de pantalla del Buró Comercial de Profeco de diferentes años de una misma empresa.
Debes consolidar toda la información y extraer los siguientes datos en un único JSON válido:

1. "anosDetectados": String con los años detectados en las imágenes (ej. "2022, 2023, 2024"). Si no se ven, pon "Histórico".
2. "totalQuejas": Número entero de la suma total de quejas en todos los años mostrados.
3. "tasaResolucion": String con el porcentaje estimado de resolución (ej. "100%", "80%", etc.) basado en las quejas concluidas vs recibidas.
4. "motivosPrincipales": Arreglo de strings. Consolida y agrupa los motivos de reclamación de todos los años y extrae los motivos (hasta un máximo de 5). ¡IMPORTANTE: NO inventes motivos! Si en las capturas solo aparece 1 o 2 motivos, devuelve solo esos 1 o 2. No rellenes para llegar a 5.
5. "veredictoEnganche": Un dictamen resumen de máximo 20 palabras. ¡CRÍTICO!: El tono debe ser NEUTRO, PROFESIONAL, SIN EMOCIONES Y OBJETIVO (como un reporte de buró de crédito). Indica puramente el nivel de incidencias y la tasa de resolución, sin usar signos de exclamación ni adjetivos emocionales.

Responde ÚNICAMENTE con el formato JSON:
{
  "anosDetectados": "2023, 2024",
  "totalQuejas": 15,
  "tasaResolucion": "100%",
  "motivosPrincipales": ["Negativa a devolución de depósito", "Retraso en entrega"],
  "veredictoEnganche": "El proveedor registra quejas recurrentes, pero evidencia una gestión efectiva con una tasa de conciliación del 100%."
}`;

        // Prepare contents array for Gemini
        const contents: any[] = [prompt];
        
        for (const img of images) {
            contents.push({
                inlineData: {
                    data: img.data,
                    mimeType: img.mimeType
                }
            });
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: contents,
        });

        let aiText = response.text || '';
        aiText = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
        
        try {
            const parsed = JSON.parse(aiText);
            return NextResponse.json({ data: parsed });
        } catch (e) {
            console.error("JSON parse error:", aiText);
            return NextResponse.json({ error: 'AI returned invalid JSON' }, { status: 500 });
        }

    } catch (error: any) {
        console.error("API Analyze Profeco Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
