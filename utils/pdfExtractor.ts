/**
 * PDF Import - Professional Architecture
 * 1. Extract text with coordinates (PDF.js)
 * 2. Reconstruct logical lines 
 * 3. Return clean editable structure
 */

import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Configure worker using local import for version compatibility
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export interface PDFTextItem {
    text: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fontSize: number;
    fontFamily: string;
    fontWeight: string;
    fontStyle: string;
}

export interface PDFLine {
    y: number;
    x: number;
    text: string;
    fontSize: number;
    fontFamily: string;
    fontWeight: string;
    width: number;
    height: number;
}

export interface PDFPageData {
    pageNumber: number;
    width: number;
    height: number;
    lines: PDFLine[];
}

/**
 * Build logical lines from fragmented text items
 * This is the KEY function that fixes 80% of broken PDFs
 */
function buildLines(items: PDFTextItem[], tolerance: number = 8): PDFLine[] {
    const lineGroups: { y: number; items: PDFTextItem[] }[] = [];

    // Group items by Y position (same line)
    items.forEach(item => {
        let group = lineGroups.find(g => Math.abs(g.y - item.y) < tolerance);
        if (!group) {
            group = { y: item.y, items: [] };
            lineGroups.push(group);
        }
        group.items.push(item);
    });

    // Sort lines top to bottom, items left to right
    lineGroups.sort((a, b) => a.y - b.y);

    return lineGroups.map(group => {
        const sortedItems = group.items.sort((a, b) => a.x - b.x);
        const first = sortedItems[0];
        const last = sortedItems[sortedItems.length - 1];

        // Merge text with proper spacing
        const text = sortedItems.map(i => i.text).join(' ');

        return {
            y: group.y,
            x: first.x,
            text: text,
            fontSize: first.fontSize,
            fontFamily: first.fontFamily,
            fontWeight: first.fontWeight,
            width: (last.x + last.width) - first.x,
            height: Math.max(...sortedItems.map(i => i.height))
        };
    });
}

/**
 * Extract PDF and return clean structured data
 */
export async function extractPDF(file: File): Promise<PDFPageData[]> {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const pages: PDFPageData[] = [];

        for (let p = 1; p <= pdf.numPages; p++) {
            const page = await pdf.getPage(p);
            const scale = 1.5;
            const viewport = page.getViewport({ scale });
            const content = await page.getTextContent();

            const items: PDFTextItem[] = [];

            for (const item of content.items) {
                const tx = item as any;
                if (tx.str && tx.str.trim().length > 0) {
                    const transform = pdfjsLib.Util.transform(viewport.transform, tx.transform);

                    // Font detection
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
                    }

                    items.push({
                        text: tx.str,
                        x: transform[4],
                        y: transform[5],
                        width: tx.width * scale,
                        height: tx.height * scale,
                        fontSize: (tx.height || 12) * scale,
                        fontFamily,
                        fontWeight,
                        fontStyle
                    });
                }
            }

            // Build logical lines from fragments
            const lines = buildLines(items);

            pages.push({
                pageNumber: p,
                width: viewport.width,
                height: viewport.height,
                lines
            });
        }

        return pages;
    } catch (error) {
        console.error('PDF extraction error:', error);
        throw error;
    }
}

export default extractPDF;
