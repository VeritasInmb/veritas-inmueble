
import { GoogleGenAI } from "@google/genai";
import { Inmobiliaria, Fuente } from '../types';

// FIX: Updated GoogleGenAI initialization to align with guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeAgency = async (agencyName: string): Promise<Inmobiliaria> => {
    const prompt = `
        Act as an expert real estate market analyst in Mexico.
        Your task is to thoroughly research the real estate agency named "${agencyName}" using Google Search to find verifiable, public sources.
        Prioritize official sources like PROFECO (for complaints and 'contrato de adhesión'), SAT (for RFC status), Google Maps (for reviews), AMPI (for membership), and reputable news articles or legal forums for public controversies.
        Based on your findings, provide a comprehensive analysis and a final "score" from 0 to 100, where 100 is the highest level of trust.
        A low number of PROFECO complaints, having a registered contract, high Google rating, AMPI membership, long business history, and no controversies should result in a high score. Many complaints, no contract, and public issues should result in a very low score.

        IMPORTANT: Your response MUST contain ONLY a single JSON object enclosed in \`\`\`json ... \`\`\`. Do not add any text before or after the JSON block.
        The JSON object must conform to this structure:
        {
        "id": number,
        "nombre": string,
        "score": number,
        "quejas": number,
        "contrato": boolean,
        "googleRating": number,
        "miembroAMPI": boolean,
        "antiguedad": string,
        "rfcStatus": string,
        "domicilio": string,
        "controversias": string
        }
        For the ID, use a random number.
        Cite your sources in the response. The grounding information will be used to display links to the user.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
            },
        });
        
        // 1. Extract JSON from the response text
        const responseText = response.text;
        if (!responseText) {
            throw new Error("No se recibió respuesta de texto de la IA.");
        }

        let jsonText = responseText.trim();
        const jsonMatch = jsonText.match(/```json\n([\s\S]*)\n```/);
        if (!jsonMatch || jsonMatch.length < 2) {
            // Fallback if the AI doesn't follow the format perfectly
            try {
                JSON.parse(jsonText);
            } catch {
                throw new Error("AI response was not in the expected JSON format.");
            }
        } else {
            jsonText = jsonMatch[1];
        }
        
        const data = JSON.parse(jsonText);

        // Basic validation
        if (typeof data.score !== 'number' || !data.nombre) {
            throw new Error("Invalid data structure received from AI.");
        }
        
        // 2. Extract sources from grounding metadata
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const fuentes: Fuente[] = groundingChunks
            .filter(chunk => chunk.web?.uri) // Check if uri exists using optional chaining
            .map(chunk => ({
                title: chunk.web?.title || "Fuente",
                uri: chunk.web?.uri as string,
            }));

        // 3. Combine data and sources, and fix data types to match Inmobiliaria interface
        const result: Inmobiliaria = {
            ...data,
            // FIX: Ensure id is a string to match Inmobiliaria type
            id: String(data.id),
            // FIX: Convert string from AI to number for antiguedad
            antiguedad: parseInt(data.antiguedad, 10) || 0,
            // FIX: Convert string from AI to boolean for domicilio
            domicilio: ['true', 'si', 'sí', '1', 'verdadero', 'verificado'].includes(String(data.domicilio).toLowerCase().trim()),
            fuentes: fuentes,
            estado: data.estado || 'N/A', // ensure estado has a fallback
        };

        return result;

    } catch (error) {
        console.error("Error analyzing agency with Gemini:", error);
        if (error instanceof Error && error.message.includes("format")) {
            throw error;
        }
        throw new Error("Failed to analyze the agency. The AI model may be temporarily unavailable or returned an invalid response.");
    }
};
