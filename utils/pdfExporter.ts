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
 * Export pages to a clean PDF
 */
export async function exportToPDF(pages: ExportPage[]): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();

    // Embed fonts
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    for (const pageData of pages) {
        const page = pdfDoc.addPage([
            pageData.width || 595, // A4 width in points
            pageData.height || 842  // A4 height in points
        ]);

        const { width, height } = page.getSize();

        // Draw background image if provided
        if (pageData.backgroundImage) {
            try {
                const imageBytes = await fetch(pageData.backgroundImage).then(res => res.arrayBuffer());
                const isPng = pageData.backgroundImage.includes('image/png');
                const image = isPng ? await pdfDoc.embedPng(imageBytes) : await pdfDoc.embedJpg(imageBytes);

                const imgWidth = image.width;
                const imgHeight = image.height;

                // Calculate scale to fit (contain) - matching EditorCanvas object-contain
                const scale = Math.min(width / imgWidth, height / imgHeight);
                const drawnWidth = imgWidth * scale;
                const drawnHeight = imgHeight * scale;

                // Center the image
                const x = (width - drawnWidth) / 2;
                const y = (height - drawnHeight) / 2;

                page.drawImage(image, {
                    x,
                    y,
                    width: drawnWidth,
                    height: drawnHeight
                });
            } catch (error) {
                console.error('Error embedding background image:', error);
            }
        }

        // Draw drawing layer (pen/eraser) if provided
        if (pageData.drawingData) {
            try {
                const imageBytes = await fetch(pageData.drawingData).then(res => res.arrayBuffer());
                const image = await pdfDoc.embedPng(imageBytes);

                page.drawImage(image, {
                    x: 0,
                    y: 0,
                    width,
                    height
                });
            } catch (error) {
                console.error('Error embedding drawing layer:', error);
                console.error('Error embedding drawing layer:', error);
            }
        }

        // Draw user images
        if (pageData.images) {
            for (const imgData of pageData.images) {
                try {
                    const imageBytes = await fetch(imgData.src).then(res => res.arrayBuffer());
                    let image;
                    if (imgData.src.includes('image/png')) {
                        image = await pdfDoc.embedPng(imageBytes);
                    } else {
                        image = await pdfDoc.embedJpg(imageBytes);
                    }

                    page.drawImage(image, {
                        x: imgData.x,
                        y: height - imgData.y - imgData.height,
                        width: imgData.width,
                        height: imgData.height,
                        opacity: imgData.opacity ?? 1,
                        rotate: imgData.rotation ? degrees(-imgData.rotation) : undefined
                    });
                } catch (error) {
                    console.error('Error embedding user image:', error);
                }
            }
        }

        for (const line of pageData.lines) {
            const font = line.fontWeight === 'bold' ? helveticaBold : helvetica;

            // Convert color if provided
            let color = rgb(0, 0, 0); // Default black
            if (line.color && line.color !== '#000000') {
                const hex = line.color.replace('#', '');
                const r = parseInt(hex.substr(0, 2), 16) / 255;
                const g = parseInt(hex.substr(2, 2), 16) / 255;
                const b = parseInt(hex.substr(4, 2), 16) / 255;
                color = rgb(r, g, b);
            }

            page.drawText(line.text, {
                x: line.x,
                y: height - line.y - line.fontSize, // Convert from top-left to bottom-left origin
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
    link.click();
    URL.revokeObjectURL(url);
}

export default exportToPDF;
