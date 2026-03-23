
const getApiUrl = () => {
    let url = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    return url;
};

const API_BASE_URL = getApiUrl();

/**
 * Robust fetch with automatic retries for network failures
 */
export const fetchWithRetry = async (url: string, options: RequestInit = {}, retries: number = 3, backoff: number = 1000): Promise<Response> => {
    try {
        const response = await fetch(url, options);
        // Retry on 502/503/504 which are common when Render is starting up
        if (!response.ok && [502, 503, 504].includes(response.status) && retries > 0) {
            console.warn(`Server starting up (${response.status}). Retrying in ${backoff}ms...`);
            await new Promise(resolve => setTimeout(resolve, backoff));
            return fetchWithRetry(url, options, retries - 1, backoff * 1.5);
        }
        return response;
    } catch (err) {
        if (retries > 0) {
            console.warn(`Network error. Retrying in ${backoff}ms...`, err);
            await new Promise(resolve => setTimeout(resolve, backoff));
            return fetchWithRetry(url, options, retries - 1, backoff * 1.5);
        }
        throw err;
    }
};

/**
 * Silent ping to wake up the backend
 */
export const pingBackend = async (): Promise<void> => {
    try {
        console.log('Sending silent wake-up ping to backend...');
        await fetch(API_BASE_URL, { mode: 'no-cors' });
    } catch (e) {
        // Ignore errors for silent ping
    }
};

export interface BackendTextBlock {
    text: string;
    bbox: [number, number, number, number];
    font: string;
    font_id: number | null;
    size: number;
    color: number;
    origin: [number, number];
    is_subset: boolean;
    flags: number;
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
    fonts?: Record<string, {
        object_id: number;
        is_subset: boolean;
        type: string;
    }>;
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

/**
 * Convert a website URL to PDF via backend
 */
export const convertUrlToPdf = async (url: string): Promise<UploadResponse> => {
    const response = await fetch(`${API_BASE_URL}/convert/url-to-pdf`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao converter URL para PDF');
    }

    return response.json();
};

/**
 * Convert an uploaded HTML file to PDF via backend
 */
export const convertHtmlToPdf = async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/convert/html-to-pdf`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao converter HTML para PDF');
    }

    return response.json();
};

/**
 * Precisely edit text at a given rectangle in the PDF
 */
export const editTextAtRect = async (
    sessionId: string, 
    pageNumber: number, 
    rect: [number, number, number, number], 
    newText: string,
    fontName?: string,
    fontSize?: number,
    color?: number,
    origin?: [number, number]
): Promise<{ success: boolean }> => {
    const response = await fetch(`${API_BASE_URL}/edit/rect`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            sessionId, 
            pageNumber, 
            rect, 
            newText,
            fontName,
            fontSize,
            color,
            origin
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao editar texto no PDF');
    }

    return response.json();
};
