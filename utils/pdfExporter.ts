/**
 * PDF Export - Generate clean, editable PDF
 * Uses pdf-lib for professional output
 */

import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';

export interface ExportLine {
    text: string;
    x: number;
    y: number;
    fontSize: number;
    fontWeight?: string;
    fontFamily?: string;
    fontStyle?: string;
    color?: string;
}

export interface ExportShape {
    x: number;
    y: number;
    width: number;
    height: number;
    backgroundColor?: string;
    opacity?: number;
}

export interface ExportImage {
    x: number;
    y: number;
    width: number;
    height: number;
    src: string; // Data URL
    opacity?: number;
    rotation?: number;
}

export interface ExportPage {
    lines: ExportLine[];
    shapes?: ExportShape[];
    images?: ExportImage[];
    backgroundImage?: string; // Data URL
    drawingData?: string; // Data URL for drawing layer
    width?: number;
    height?: number;
}

/**
 * Sanitize text to remove unsupported characters (like emojis)
 * Standard PDF fonts only support WinAnsi encoding
 */
function sanitizeText(text: string): string {
    return text.replace(/[^\x00-\x7F\xA0-\xFF]/g, ' ').trim();
}

export async function exportToPDF(pages: ExportPage[]): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();

    // 1. Embed ALL Standard Fonts for full design support
    const fonts: Record<string, any> = {};
    try {
        // Helvetica (Sans-Serif)
        fonts['helvetica'] = await pdfDoc.embedFont(StandardFonts.Helvetica);
        fonts['helvetica-bold'] = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        fonts['helvetica-italic'] = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
        fonts['helvetica-bolditalic'] = await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique);

        // Times Roman (Serif)
        fonts['times'] = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        fonts['times-bold'] = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
        fonts['times-italic'] = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
        fonts['times-bolditalic'] = await pdfDoc.embedFont(StandardFonts.TimesRomanBoldItalic);

        // Courier (Monospace)
        fonts['courier'] = await pdfDoc.embedFont(StandardFonts.Courier);
        fonts['courier-bold'] = await pdfDoc.embedFont(StandardFonts.CourierBold);
        fonts['courier-italic'] = await pdfDoc.embedFont(StandardFonts.CourierOblique);
    } catch (e) {
        console.error('Font embedding failed:', e);
    }

    for (const pageData of pages) {
        let page;
        try {
            page = pdfDoc.addPage([pageData.width || 595, pageData.height || 842]);
        } catch (pageErr) {
            console.error('Error adding page:', pageErr);
            continue;
        }

        const { width, height } = page.getSize();

        // (Background and Drawing layer logic remains same)
        if (pageData.backgroundImage) {
            try {
                const imageBytes = await fetch(pageData.backgroundImage).then(res => res.arrayBuffer());
                const isPng = pageData.backgroundImage.includes('image/png');
                const image = isPng ? await pdfDoc.embedPng(imageBytes) : await pdfDoc.embedJpg(imageBytes);
                const imgWidth = image.width;
                const imgHeight = image.height;
                const scale = Math.min(width / imgWidth, height / imgHeight);
                const drawnWidth = imgWidth * scale;
                const drawnHeight = imgHeight * scale;
                page.drawImage(image, {
                    x: (width - drawnWidth) / 2,
                    y: (height - drawnHeight) / 2,
                    width: drawnWidth,
                    height: drawnHeight
                });
            } catch (error) { console.error('BG Error', error); }
        }

        if (pageData.drawingData) {
            try {
                const imageBytes = await fetch(pageData.drawingData).then(res => res.arrayBuffer());
                const image = await pdfDoc.embedPng(imageBytes);
                page.drawImage(image, { x: 0, y: 0, width, height });
            } catch (error) { console.error('Drawing Error', error); }
        }

        // Draw user images
        if (pageData.images) {
            for (const imgData of pageData.images) {
                try {
                    const imageBytes = await fetch(imgData.src).then(res => res.arrayBuffer());
                    const image = imgData.src.includes('image/png') ? await pdfDoc.embedPng(imageBytes) : await pdfDoc.embedJpg(imageBytes);
                    page.drawImage(image, {
                        x: imgData.x,
                        y: height - imgData.y - imgData.height,
                        width: imgData.width,
                        height: imgData.height,
                        opacity: imgData.opacity ?? 1,
                        rotate: imgData.rotation ? degrees(-imgData.rotation) : undefined
                    });
                } catch (error) { console.error('Img Error', error); }
            }
        }

        for (const line of pageData.lines) {
            // FONT SELECTION ENGINE
            let fontKey = 'helvetica';
            const fam = (line.fontFamily || '').toLowerCase();
            const weight = (line.fontWeight || '').toLowerCase();
            const style = (line.fontStyle || '').toLowerCase();

            // 1. Choose Base Family
            if (fam.includes('times') || fam.includes('serif') || fam.includes('georgia') || fam.includes('cambria')) {
                fontKey = 'times';
            } else if (fam.includes('courier') || fam.includes('mono')) {
                fontKey = 'courier';
            }

            // 2. Add Weight/Style Modifiers
            const isBold = weight === 'bold' || weight === '700' || weight === '800';
            const isItalic = style === 'italic' || style === 'oblique';

            if (isBold && isItalic && fonts[`${fontKey}-bolditalic`]) {
                fontKey = `${fontKey}-bolditalic`;
            } else if (isBold && fonts[`${fontKey}-bold`]) {
                fontKey = `${fontKey}-bold`;
            } else if (isItalic && fonts[`${fontKey}-italic`]) {
                fontKey = `${fontKey}-italic`;
            }

            const font = fonts[fontKey] || fonts['helvetica'];

            // COLOR ENGINE
            let color = rgb(0, 0, 0);
            if (line.color && line.color.startsWith('#')) {
                try {
                    const hex = line.color.replace('#', '');
                    const r = parseInt(hex.substr(0, 2), 16) / 255;
                    const g = parseInt(hex.substr(2, 2), 16) / 255;
                    const b = parseInt(hex.substr(4, 2), 16) / 255;
                    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) color = rgb(r, g, b);
                } catch (e) { console.warn('Color parse fail', line.color); }
            }

            const safeText = sanitizeText(line.text);
            if (!safeText) continue;

            page.drawText(safeText, {
                x: line.x,
                y: height - line.y - (line.fontSize * 0.8), // Better baseline alignment
                size: line.fontSize,
                font,
                color
            });
        }

        // Draw shapes (whiteouts)
        if (pageData.shapes) {
            for (const shape of pageData.shapes) {
                let color = rgb(1, 1, 1); // Default white
                if (shape.backgroundColor && shape.backgroundColor !== '#FFFFFF') {
                    const hex = shape.backgroundColor.replace('#', '');
                    const r = parseInt(hex.substr(0, 2), 16) / 255;
                    const g = parseInt(hex.substr(2, 2), 16) / 255;
                    const b = parseInt(hex.substr(4, 2), 16) / 255;
                    color = rgb(r, g, b);
                }

                page.drawRectangle({
                    x: shape.x,
                    y: height - shape.y - shape.height,
                    width: shape.width,
                    height: shape.height,
                    color,
                    opacity: shape.opacity ?? 1
                });
            }
        }
    }

    return await pdfDoc.save();
}

/**
 * Download the PDF
 */
export function downloadPDF(pdfBytes: Uint8Array, filename: string = 'document.pdf'): void {
    // Convert Uint8Array to ArrayBuffer for Blob compatibility
    const blob = new Blob([pdfBytes.slice()], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link); // Required for Firefox
    link.click();

    // Clean up
    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 100);
}

export default exportToPDF;
