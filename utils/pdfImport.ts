/**
 * Simple PDF Import Utility
 * 
 * Since we want to avoid heavy dependencies for the MVP, we will use the browser's 
 * native capabilities or a lightweight approach.
 * 
 * However, rendering PDF to Canvas client-side reliably usually requires pdf.js.
 * Given the instructions to "add options", we will simulate the "Import PDF" 
 * by treating it as an image upload for now (if the browser supports it) or 
 * prompting the user that full PDF editing requires the backend.
 * 
 * BUT, to really impress, we can try to use a simple iframe based approach or just 
 * acknowledge that for *editing* the PDF content itself (text, vectors), we need 
 * a parsing library.
 * 
 * For this "Image Editor" context, users often want to bring a PDF page in as a background.
 * 
 * Let's implement a placeholder that acts as a secondary image uploader for now,
 * with a "Coming Soon" for multi-page parsing if we don't install pdfjs.
 */

import * as pdfjsLib from 'pdfjs-dist';

// Define the worker src
// We use unpkg to get the exact matching version
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export interface PDFTextItem {
    text: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fontSize: number;
    fontFamily: string;
    fontWeight?: string;
    fontStyle?: string;
}

export interface PDFPageData {
    width: number;
    height: number;
    dataUrl: string; // The background image
    textItems: PDFTextItem[];
}

export const importPDFAsImages = async (file: File): Promise<PDFPageData[]> => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const pages: PDFPageData[] = [];

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const scale = 1.5;
            const viewport = page.getViewport({ scale });

            // Render page to canvas to extract images
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            if (context) {
                await page.render({
                    canvasContext: context,
                    viewport: viewport,
                } as any).promise;
            }

            // Extract Text (vector elements)
            const textContent = await page.getTextContent();
            const textItems: PDFTextItem[] = [];

            for (const item of textContent.items) {
                const tx = item as any;
                if (tx.str && tx.str.trim().length > 0) {
                    const transform = pdfjsLib.Util.transform(viewport.transform, tx.transform);
                    const x = transform[4];

                    // transform[5] is baseline Y
                    // Using 0.85 multiplier works better for most fonts than full height
                    const y = transform[5] - (tx.height * scale * 0.85);

                    // Font Detection Heuristics
                    const fontName = (tx.fontName || '').toLowerCase();
                    let fontFamily = 'Arial';
                    let fontWeight = 'normal';
                    let fontStyle = 'normal';

                    if (fontName.includes('bold')) fontWeight = 'bold';
                    if (fontName.includes('italic') || fontName.includes('oblique')) fontStyle = 'italic';

                    if (fontName.includes('times') || fontName.includes('roman') || fontName.includes('serif')) {
                        fontFamily = 'Times New Roman';
                    } else if (fontName.includes('courier') || fontName.includes('mono')) {
                        fontFamily = 'Courier New';
                    } else if (fontName.includes('arial') || fontName.includes('helvetica') || fontName.includes('sans')) {
                        fontFamily = 'Arial';
                    }

                    textItems.push({
                        text: tx.str,
                        x: x,
                        y: y,
                        width: tx.width * scale,
                        height: tx.height * scale,
                        fontSize: (tx.height || 12) * scale,
                        fontFamily: fontFamily,
                        fontWeight: fontWeight,
                        fontStyle: fontStyle
                    });
                }
            }

            // Aggregate items into lines
            const lines: { [key: number]: PDFTextItem[] } = {};

            textItems.forEach(item => {
                let matchedKey = Object.keys(lines).find(key => Math.abs(parseFloat(key) - item.y) < 5);

                if (matchedKey) {
                    lines[parseFloat(matchedKey)].push(item);
                } else {
                    lines[item.y] = [item];
                }
            });

            const aggregatedItems: PDFTextItem[] = [];

            for (const key in lines) {
                const lineItems = lines[key].sort((a, b) => a.x - b.x);

                if (lineItems.length > 0) {
                    const first = lineItems[0];
                    const last = lineItems[lineItems.length - 1];
                    const fullText = lineItems.map(i => i.text).join(' ');
                    const totalWidth = (last.x + last.width) - first.x;

                    aggregatedItems.push({
                        text: fullText,
                        x: first.x,
                        y: first.y,
                        width: totalWidth,
                        height: first.height,
                        fontSize: first.fontSize,
                        fontFamily: first.fontFamily,
                        fontWeight: first.fontWeight,
                        fontStyle: first.fontStyle
                    });
                }
            }

            pages.push({
                width: viewport.width,
                height: viewport.height,
                dataUrl: canvas.toDataURL('image/png'), // Canvas for image extraction
                textItems: aggregatedItems
            });
        }

        return pages;
    } catch (e) {
        console.error("Internal PDF Import Error:", e);
        throw e;
    }
};

// Fallback for types if needed
export const importPDFAsImage = async (file: File): Promise<string> => {
    const pages = await importPDFAsImages(file);
    return pages.length > 0 ? pages[0].dataUrl : '';
};
