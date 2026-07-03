import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
// @ts-ignore
import { GoogleGenAI } from '@google/genai';
// @ts-ignore
import whois from 'whois-json';
// @ts-ignore
import puppeteer from 'puppeteer';

export async function POST(req: NextRequest) {
    try {
        const { url } = await req.json();
        
        if (!url) {
            return NextResponse.json({ error: 'Missing URL' }, { status: 400 });
        }

        // 1. Domain Age Lookup (WHOIS)
        let domainAgeDate = 'Desconocido';
        try {
            let hostname = new URL(url).hostname;
            if (hostname.startsWith('www.')) {
                hostname = hostname.substring(4);
            }
            const whoisData = await whois(hostname);
            domainAgeDate = whoisData.creationDate || whoisData.createdOn || whoisData.created || whoisData['Creation Date'] || 'Fecha de creación no pública';
        } catch (e) {
            console.error("Whois error:", e);
        }

        // 2. Puppeteer Screenshot (Multi-part)
        let screenshotBase64List: string[] = [];
        try {
            const browser = await puppeteer.launch({ headless: true });
            const page = await browser.newPage();
            await page.setViewport({ width: 1280, height: 800 });
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Screenshot 1: Top
            screenshotBase64List.push(await page.screenshot({ encoding: 'base64', type: 'png' }) as string);
            
            const pageHeight = await page.evaluate(() => document.body.scrollHeight);
            
            // Screenshot 2: 1/3 of the way down (if page is tall)
            if (pageHeight > 1600) {
                await page.evaluate(() => window.scrollTo(0, Math.floor(document.body.scrollHeight * 0.33)));
                await new Promise(resolve => setTimeout(resolve, 1000));
                screenshotBase64List.push(await page.screenshot({ encoding: 'base64', type: 'png' }) as string);
            }

            // Screenshot 3: 2/3 of the way down (if page is very tall)
            if (pageHeight > 2400) {
                await page.evaluate(() => window.scrollTo(0, Math.floor(document.body.scrollHeight * 0.66)));
                await new Promise(resolve => setTimeout(resolve, 1000));
                screenshotBase64List.push(await page.screenshot({ encoding: 'base64', type: 'png' }) as string);
            }
            
            // Screenshot 4: Bottom (if page is taller than the screen)
            if (pageHeight > 1000) {
                await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
                await new Promise(resolve => setTimeout(resolve, 1000));
                screenshotBase64List.push(await page.screenshot({ encoding: 'base64', type: 'png' }) as string);
            }

            await browser.close();
        } catch (e) {
            console.error("Puppeteer error:", e);
        }

        // 3. Download main page for link extraction
        const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const html = await response.text();
        const $ = cheerio.load(html);

        let iconUrl = $('meta[property="og:image"]').attr('content') || 
                      $('link[rel="icon"]').attr('href') || 
                      $('link[rel="shortcut icon"]').attr('href') || 
                      $('link[rel="apple-touch-icon"]').attr('href') || '';
        
        if (iconUrl && !iconUrl.startsWith('http')) {
            try { iconUrl = new URL(iconUrl, new URL(url).origin).href; } catch (e) { /* Ignore */ }
        }

        // 4. Deep Crawling: Find up to 15 internal subpages
        const subpagesToFetch = new Set<string>();
        $('a').each((_, element) => {
            const href = $(element).attr('href');
            if (href) {
                try {
                    const fullUrl = new URL(href, url).href;
                    // Ignore self-links, anchors, and media files
                    if (new URL(fullUrl).origin === new URL(url).origin && !fullUrl.includes('#') && !fullUrl.match(/\.(jpg|jpeg|png|pdf|mp4)$/i)) {
                        subpagesToFetch.add(fullUrl);
                    }
                } catch (e) { /* ignore */ }
            }
        });

        // Limit to 15 pages to avoid extreme timeouts
        const subpagesArray = Array.from(subpagesToFetch).slice(0, 15);
        let allText = `PÁGINA PRINCIPAL (${url}):\n${$('body').text().replace(/\s+/g, ' ')}\n\n`;

        const subpagePromises = subpagesArray.map(async (subUrl) => {
            try {
                const subRes = await fetch(subUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }});
                const subHtml = await subRes.text();
                const $sub = cheerio.load(subHtml);
                return `SUBPÁGINA (${subUrl}):\n${$sub('body').text().replace(/\s+/g, ' ')}\n`;
            } catch (e) { return ''; }
        });

        const subpageTexts = await Promise.all(subpagePromises);
        allText += subpageTexts.join('\n');

        const truncatedText = allText.substring(0, 80000); // 80k chars is well within limits

        // 5. Send to Gemini for intelligent extraction & visual analysis
        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: 'Falta GEMINI_API_KEY' }, { status: 500 });
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const prompt = `
        Eres un analista de inteligencia cibernética investigando a una agencia inmobiliaria por posibles fraudes.
        A continuación se muestra el texto extraído de TODAS sus páginas internas, y los metadatos de su dominio web.
        También se te proporcionan hasta 4 capturas de pantalla de la página web principal (Parte superior, dos partes medias y la parte inferior).
        
        METADATOS DEL DOMINIO:
        - URL: ${url}
        - Fecha de creación del dominio (WHOIS): ${domainAgeDate}
        
        INSTRUCCIONES:
        1. Extrae los datos de contacto y la información legal solicitada del texto.
        2. Analiza el texto del sitio web para ver si presumen de cierta cantidad de años de experiencia (Antigüedad Reclamada).
        3. Compara la Antigüedad Reclamada con la Fecha de creación del dominio. Si la empresa afirma tener "15 años de experiencia" pero el dominio fue creado en el año 2023 o 2024, esto es una **CONTRADICCIÓN GRAVE**. Escribe una alerta en "alertaAntiguedad".
        4. Haz un "Análisis Visual" usando la imagen proporcionada: ¿Se ve profesional? ¿Parece una plantilla genérica y vacía? ¿Tienen sellos de asociaciones (ej. AMPI) pegados como imágenes? Redacta 2-3 oraciones forenses en "analisisVisual".
        5. **Auditoría de Banderas Rojas**: Lee exhaustivamente TODO el texto de sus páginas internas. Busca engaños, promesas imposibles (ej. "retornos garantizados del 50%"), o letras pequeñas abusivas. Redacta un informe detallado, sin resumir, listando cada red flag encontrada como viñetas.
        
        Devuelve ESTRICTAMENTE un JSON válido con esta estructura:
        {
            "nombre": "El nombre oficial de la inmobiliaria",
            "resumen": "Resumen conciso de quiénes son.",
            "reporteBanderasRojas": "Tu informe forense detallado con formato Markdown sobre los engaños y promesas imposibles detectadas en el texto.",
            "fichaTecnica": {
                "telefono": "Teléfonos extraídos",
                "email": "Correos extraídos",
                "direccion": "Dirección física extraída",
                "tieneAvisoPrivacidad": true/false,
                "rfc": "RFC o razón social si se encuentra",
                "sitioWeb": "${url}",
                "redesSociales": ["urls de redes encontradas"],
                "antiguedadDominio": "La fecha WHOIS proporcionada o tu cálculo en años",
                "antiguedadReclamada": "Lo que presumen en su web (ej. 10 años, desde 2005)",
                "alertaAntiguedad": "Texto de la alerta roja si existe la contradicción, null si todo está bien",
                "analisisVisual": "Tu análisis forense del diseño y credibilidad de la captura de pantalla"
            }
        }
        
        Texto del sitio web:
        ${truncatedText}
        `;

        const contents: any[] = [ prompt ];
        for (const b64 of screenshotBase64List) {
            contents.push({
                inlineData: {
                    data: b64,
                    mimeType: 'image/png'
                }
            });
        }

        const aiResponse = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: contents,
        });

        let aiText = aiResponse.text || '';
        aiText = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
        
        let parsedData = null;
        try {
            parsedData = JSON.parse(aiText);
        } catch (e) {
            console.error("Failed to parse Gemini JSON:", aiText);
            return NextResponse.json({ error: 'AI returned invalid data' }, { status: 500 });
        }
        if (parsedData.fichaTecnica && screenshotBase64List.length > 0) {
            // Send the first one as fallback for types.ts, but also include the full array
            parsedData.fichaTecnica.websiteScreenshot = `data:image/png;base64,${screenshotBase64List[0]}`;
        }

        return NextResponse.json({
            nombre: parsedData.nombre || '',
            imageUrl: iconUrl,
            imageUrls: screenshotBase64List.map(b => `data:image/png;base64,${b}`),
            resumen: parsedData.resumen || '',
            reporteBanderasRojas: parsedData.reporteBanderasRojas || '',
            fichaTecnica: parsedData.fichaTecnica || null
        });

    } catch (error: any) {
        console.error("API Scrape Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
