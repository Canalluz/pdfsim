
const getApiUrl = () => {
    let url = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    return url;
};

const API_BASE_URL = getApiUrl();

export interface BackendTextBlock {
    text: string;
    x: number;
    y: number;
    width: number;
    height: number;
    font: string;
    size: number;
    color: number;
}

export interface BackendPageData {
    page: number;
    width: number;
    height: number;
    blocks: BackendTextBlock[];
}

export interface UploadResponse {
    sessionId: string;
    pages: BackendPageData[];
}

export const uploadPDFToBackend = async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Backend upload failed');
    }

    return response.json();
};

/**
 * Convert PDF to Word format for editing
 */
export const convertPdfToWord = async (sessionId: string): Promise<Blob> => {
    const response = await fetch(`${API_BASE_URL}/convert/pdf-to-word`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
    });

    if (!response.ok) {
        throw new Error('Conversão PDF → Word falhou');
    }

    return response.blob();
};

/**
 * Convert Word document back to PDF
 */
export const convertWordToPdf = async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/convert/word-to-pdf`, {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        throw new Error('Conversão Word → PDF falhou');
    }

    return response.json();
};

/**
 * Render PDF page as image for background
 */
export interface PageRenderResponse {
    image: string; // Base64 data URL
    width: number;
    height: number;
    pageNumber: number;
}

export const renderPdfPage = async (sessionId: string, pageNumber: number, dpi: number = 150): Promise<PageRenderResponse> => {
    const response = await fetch(`${API_BASE_URL}/render-page`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, pageNumber, dpi })
    });

    if (!response.ok) {
        throw new Error('Falha ao renderizar página');
    }

    return response.json();
};
