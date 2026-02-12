import React, { useRef, useState, useEffect } from 'react';
import { PenTool, Trash2, X, Check, Camera, Upload, MousePointer2 } from 'lucide-react';

import { Language, translations } from '../utils/i18n';

interface SignatureModalProps {
    language: Language;
    onSave: (data: string, width?: number, height?: number) => void;
    onClose: () => void;
}

type Mode = 'draw' | 'upload' | 'camera';

const SignatureModal: React.FC<SignatureModalProps> = ({ language, onSave, onClose }) => {
    const t = translations[language];
    const [mode, setMode] = useState<Mode>('draw');
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasContent, setHasContent] = useState(false);
    const [capturedImage, setCapturedImage] = useState<{ dataUrl: string, width: number, height: number } | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    // Initialize drawing canvas
    useEffect(() => {
        if (mode === 'draw') {
            const canvas = canvasRef.current;
            if (canvas) {
                // High-DPI Support
                const dpr = window.devicePixelRatio || 1;
                // Get the CSS size (visual size)
                const rect = canvas.getBoundingClientRect();

                // Set the internal resolution to match device pixels
                canvas.width = rect.width * dpr;
                canvas.height = rect.height * dpr;

                const ctx = canvas.getContext('2d');
                if (ctx) {
                    // Scale all drawing operations by dpr so we can use logical coordinates
                    ctx.scale(dpr, dpr);

                    ctx.strokeStyle = '#000000';
                    ctx.lineWidth = 1.5; // This will now be 1.5 logical pixels (e.g. 3 physical pixels on Retina)
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                }
            }
        }

        // Cleanup camera if mode changes
        if (mode !== 'camera' && stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    }, [mode, stream]);

    // Enhanced Signature Processing: CV2-Style Pipeline
    const processSignatureImage = (dataUrl: string): Promise<{ dataUrl: string, width: number, height: number }> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                const w = img.width;
                const h = img.height;
                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                if (!ctx) return resolve({ dataUrl, width: w, height: h });

                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, w, h);
                const data = imageData.data;

                // --- Step 1: Grayscale ---
                const gray = new Uint8Array(w * h);
                for (let i = 0; i < data.length; i += 4) {
                    gray[i / 4] = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
                }

                // --- Step 2: Gaussian Blur (5x5 kernel approx) ---
                const convolve = (src: Uint8Array, width: number, height: number, kernel: number[]) => {
                    const output = new Uint8Array(src.length);
                    const kSize = Math.sqrt(kernel.length);
                    const half = Math.floor(kSize / 2);

                    for (let y = 0; y < height; y++) {
                        for (let x = 0; x < width; x++) {
                            let sum = 0;
                            let weightSum = 0;
                            for (let ky = -half; ky <= half; ky++) {
                                for (let kx = -half; kx <= half; kx++) {
                                    const px = Math.min(width - 1, Math.max(0, x + kx));
                                    const py = Math.min(height - 1, Math.max(0, y + ky));
                                    const weight = kernel[(ky + half) * kSize + (kx + half)];
                                    sum += src[py * width + px] * weight;
                                    weightSum += weight;
                                }
                            }
                            output[y * width + x] = sum / weightSum;
                        }
                    }
                    return output;
                };

                const gaussianKernel = [
                    1, 4, 6, 4, 1,
                    4, 16, 24, 16, 4,
                    6, 24, 36, 24, 6,
                    4, 16, 24, 16, 4,
                    1, 4, 6, 4, 1
                ];
                const blurred = convolve(gray, w, h, gaussianKernel);

                // --- Step 3: Adaptive Thresholding (Integral Image approach) ---
                const binary = new Uint8Array(w * h);
                const blockSize = 21;
                const C = 10;

                const integral = new Float32Array((w + 1) * (h + 1));
                for (let y = 0; y < h; y++) {
                    let sumRow = 0;
                    for (let x = 0; x < w; x++) {
                        sumRow += blurred[y * w + x];
                        integral[(y + 1) * (w + 1) + (x + 1)] = integral[y * (w + 1) + (x + 1)] + sumRow;
                    }
                }

                const halfBlock = Math.floor(blockSize / 2);
                for (let y = 0; y < h; y++) {
                    for (let x = 0; x < w; x++) {
                        const x1 = Math.max(0, x - halfBlock);
                        const y1 = Math.max(0, y - halfBlock);
                        const x2 = Math.min(w, x + halfBlock + 1);
                        const y2 = Math.min(h, y + halfBlock + 1);

                        const count = (x2 - x1) * (y2 - y1);
                        const sum = integral[y2 * (w + 1) + x2] - integral[y1 * (w + 1) + x2] - integral[y2 * (w + 1) + x1] + integral[y1 * (w + 1) + x1];
                        const mean = sum / count;

                        if (blurred[y * w + x] < (mean - C)) {
                            binary[y * w + x] = 255; // Ink
                        } else {
                            binary[y * w + x] = 0; // Background
                        }
                    }
                }

                // --- Step 4: Morphological Logic Helpers ---
                const dilate = (src: Uint8Array, width: number, height: number, kernelSize: number) => {
                    const out = new Uint8Array(src.length);
                    const half = Math.floor(kernelSize / 2);
                    for (let y = 0; y < height; y++) {
                        for (let x = 0; x < width; x++) {
                            if (src[y * width + x] === 255) {
                                out[y * width + x] = 255;
                                continue;
                            }
                            let maxVal = 0;
                            for (let ky = -half; ky <= half; ky++) {
                                for (let kx = -half; kx <= half; kx++) {
                                    const py = Math.min(height - 1, Math.max(0, y + ky));
                                    const px = Math.min(width - 1, Math.max(0, x + kx));
                                    if (src[py * width + px] === 255) {
                                        maxVal = 255;
                                        break;
                                    }
                                }
                                if (maxVal === 255) break;
                            }
                            out[y * width + x] = maxVal;
                        }
                    }
                    return out;
                };

                // --- Step 5: Connected Component Analysis (Filter Noise) ---
                // 1. Dilate to connect nearby ink parts (letters/words)
                const dilated = dilate(binary, w, h, 5);

                // 2. Union-Find Labeling
                const labels = new Int32Array(w * h).fill(0);
                const parent = new Int32Array(w * h).fill(0);
                for (let i = 0; i < w * h; i++) parent[i] = i;

                const find = (i: number): number => {
                    let root = i;
                    while (root !== parent[root]) root = parent[root];
                    let curr = i;
                    while (curr !== root) { let next = parent[curr]; parent[curr] = root; curr = next; }
                    return root;
                }
                const union = (i: number, j: number) => {
                    const rootI = find(i);
                    const rootJ = find(j);
                    if (rootI !== rootJ) parent[rootI] = rootJ;
                }

                for (let y = 0; y < h; y++) {
                    for (let x = 0; x < w; x++) {
                        if (dilated[y * w + x] === 255) {
                            const idx = y * w + x;
                            if (x > 0 && dilated[y * w + (x - 1)] === 255) union(idx, idx - 1);
                            if (y > 0 && dilated[(y - 1) * w + x] === 255) union(idx, idx - w);
                        }
                    }
                }

                // 3. Measure Component Areas
                const areas = new Map<number, number>();
                for (let i = 0; i < w * h; i++) {
                    if (dilated[i] === 255) {
                        const root = find(i);
                        areas.set(root, (areas.get(root) || 0) + 1);
                    }
                }

                // 4. Identify Valid Components
                let maxArea = 0;
                areas.forEach((area) => { if (area > maxArea) maxArea = area; });

                const minComponentArea = Math.max(50, maxArea * 0.05); // Filter noise < 5% of max or very small
                const validRoots = new Set<number>();
                areas.forEach((area, root) => {
                    if (area >= minComponentArea) validRoots.add(root);
                });

                // --- Step 6: Apply Mask & Crop with Soft Alpha ---
                // Instead of hard binary (0 or 255), we use the ratio of pixel brightness to local mean
                // to preserve anti-aliasing edges. 
                const gain = 2.0; // Contrast booster
                let minX = w, minY = h, maxX = 0, maxY = 0;
                let foundAny = false;

                for (let i = 0; i < w * h; i++) {
                    const idx = i * 4;
                    // Check if pixel belongs to a valid component (Keep structure)
                    let keep = false;
                    if (binary[i] === 255) {
                        const root = find(i);
                        if (validRoots.has(root)) keep = true;
                    }

                    if (keep) {
                        // Re-calculate local mean for Soft Alpha
                        const y = Math.floor(i / w);
                        const x = i % w;

                        const x1 = Math.max(0, x - halfBlock);
                        const y1 = Math.max(0, y - halfBlock);
                        const x2 = Math.min(w, x + halfBlock + 1);
                        const y2 = Math.min(h, y + halfBlock + 1);
                        const count = (x2 - x1) * (y2 - y1);
                        const sum = integral[y2 * (w + 1) + x2] - integral[y1 * (w + 1) + x2] - integral[y2 * (w + 1) + x1] + integral[y1 * (w + 1) + x1];
                        const mean = sum / count;

                        // Calculate Soft Alpha
                        // Darker pixels (relative to background) get higher alpha.
                        // Ratio 1.0 = Background, Ratio 0.0 = Black
                        const val = blurred[i];
                        const ratio = val / Math.max(1, mean);
                        let alpha = (1.0 - ratio) * 255 * gain;

                        // Clamp and ensure core of lines is solid
                        if (alpha > 255) alpha = 255;
                        if (alpha < 0) alpha = 0;

                        // Force solid black for correct component pixels, but vary alpha
                        data[idx] = 0;     // R
                        data[idx + 1] = 0; // G
                        data[idx + 2] = 0; // B
                        data[idx + 3] = alpha; // A

                        // Update Bounding Box
                        if (alpha > 10) { // Only count visible pixels
                            if (x < minX) minX = x;
                            if (x > maxX) maxX = x;
                            if (y < minY) minY = y;
                            if (y > maxY) maxY = y;
                            foundAny = true;
                        }
                    } else {
                        data[idx + 3] = 0; // Transparent
                    }
                }

                if (!foundAny) {
                    resolve({ dataUrl, width: w, height: h });
                    return;
                }

                // Crop
                const padding = 20;
                const cropWidth = Math.max(1, (maxX - minX) + (padding * 2));
                const cropHeight = Math.max(1, (maxY - minY) + (padding * 2));

                const croppedCanvas = document.createElement('canvas');
                croppedCanvas.width = cropWidth;
                croppedCanvas.height = cropHeight;
                const croppedCtx = croppedCanvas.getContext('2d');
                if (!croppedCtx) return resolve({ dataUrl, width: w, height: h });

                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = w;
                tempCanvas.height = h;
                const tempCtx = tempCanvas.getContext('2d');
                if (tempCtx) {
                    tempCtx.putImageData(imageData, 0, 0);
                    croppedCtx.drawImage(
                        tempCanvas,
                        minX - padding, minY - padding, cropWidth, cropHeight,
                        0, 0, cropWidth, cropHeight
                    );
                    resolve({ dataUrl: croppedCanvas.toDataURL('image/png'), width: cropWidth, height: cropHeight });
                } else {
                    resolve({ dataUrl, width: w, height: h });
                }
            };
            img.onerror = () => resolve({ dataUrl, width: 0, height: 0 });
            img.src = dataUrl;
        });
    };

    // Drawing Logic
    const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;
        if ('touches' in e.nativeEvent) {
            clientX = e.nativeEvent.touches[0].clientX;
            clientY = e.nativeEvent.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }
        return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        const { x, y } = getCoordinates(e);
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            setIsDrawing(true);
        }
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        e.preventDefault();
        const { x, y } = getCoordinates(e);
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            ctx.lineTo(x, y);
            ctx.stroke();
            setHasContent(true);
        }
    };

    const endDrawing = () => setIsDrawing(false);
    const handleClear = () => {
        if (mode === 'draw' && canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            setHasContent(false);
        } else {
            setCapturedImage(null);
            setHasContent(false);
        }
    };

    // Upload Logic
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (event) => {
                const result = event.target?.result as string;
                const processed = await processSignatureImage(result);
                setCapturedImage(processed);
                setHasContent(true);
            };
            reader.readAsDataURL(file);
        }
    };

    // Camera Logic
    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error("Camera access error:", err);
            alert(language === 'pt' ? "Não foi possível acessar a câmera." : language === 'es' ? "No se pudo acceder a la cámara." : "Could not access camera.");
        }
    };

    const capturePhoto = async () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(videoRef.current, 0, 0);
                const photoUrl = canvas.toDataURL('image/png');
                const processed = await processSignatureImage(photoUrl);
                setCapturedImage(processed);
                setHasContent(true);
                // Stop camera
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                    setStream(null);
                }
            }
        }
    };

    const handleSave = async () => {
        if (mode === 'draw' && canvasRef.current) {
            const dataUrl = canvasRef.current.toDataURL('image/png');
            const processed = await processSignatureImage(dataUrl);
            onSave(processed.dataUrl, processed.width, processed.height);
        } else if (capturedImage) {
            onSave(capturedImage.dataUrl, capturedImage.width, capturedImage.height);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b flex items-center justify-between bg-gray-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                            <PenTool size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800">{t.signatureTitle}</h3>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">{t.signatureSubtitle}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400">
                        <X size={20} />
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="grid grid-cols-3 border-b">
                    <button
                        onClick={() => { setMode('draw'); handleClear(); }}
                        className={`py-3 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${mode === 'draw' ? 'text-indigo-600 bg-white border-b-2 border-indigo-600' : 'text-gray-400 bg-gray-50 hover:bg-white'}`}
                    >
                        <MousePointer2 size={16} /> {t.draw}
                    </button>
                    <button
                        onClick={() => { setMode('upload'); handleClear(); }}
                        className={`py-3 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${mode === 'upload' ? 'text-indigo-600 bg-white border-b-2 border-indigo-600' : 'text-gray-400 bg-gray-50 hover:bg-white'}`}
                    >
                        <Upload size={16} /> {t.uploadSignature}
                    </button>
                    <button
                        onClick={() => { setMode('camera'); handleClear(); startCamera(); }}
                        className={`py-3 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${mode === 'camera' ? 'text-indigo-600 bg-white border-b-2 border-indigo-600' : 'text-gray-400 bg-gray-50 hover:bg-white'}`}
                    >
                        <Camera size={16} /> {t.cameraSignature}
                    </button>
                </div>

                <div className="p-6">
                    <div className="relative bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl overflow-hidden min-h-[200px]">
                        {mode === 'draw' ? (
                            <canvas
                                ref={canvasRef}
                                width={450}
                                height={200}
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={endDrawing}
                                onMouseLeave={endDrawing}
                                onTouchStart={startDrawing}
                                onTouchMove={draw}
                                onTouchEnd={endDrawing}
                                className="w-full h-[200px] cursor-crosshair"
                            />
                        ) : mode === 'upload' ? (
                            <div className="w-full h-[200px] flex items-center justify-center">
                                {capturedImage ? (
                                    <img src={capturedImage.dataUrl} alt="Assinatura" style={{ width: capturedImage.width, height: capturedImage.height }} className="max-h-full p-4 object-contain" />
                                ) : (
                                    <label className="flex flex-col items-center gap-2 cursor-pointer group">
                                        <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                                            <Upload size={32} />
                                        </div>
                                        <span className="text-sm font-medium text-gray-500">{t.clickToSearch}</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                                    </label>
                                )}
                            </div>
                        ) : (
                            <div className="w-full h-[160px] flex items-center justify-center bg-black">
                                {capturedImage ? (
                                    <img src={capturedImage.dataUrl} alt="Foto Capturada" className="max-h-full object-contain" />
                                ) : (
                                    <div className="relative w-full h-full overflow-hidden">
                                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />

                                        {/* Visual Guide Overlay */}
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="w-[80%] h-[60%] border-2 border-white/50 rounded-lg box-border shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                                                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white"></div>
                                                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white"></div>
                                                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white"></div>
                                                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white"></div>
                                            </div>
                                            <div className="absolute -top-8 text-white text-xs font-bold bg-black/50 px-3 py-1 rounded-full">
                                                {t.frameSignature}
                                            </div>
                                        </div>

                                        <button
                                            onClick={capturePhoto}
                                            className="absolute bottom-4 left-1/2 -translate-x-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl active:scale-90 transition-transform pointer-events-auto z-10"
                                        >
                                            <div className="w-10 h-10 border-2 border-indigo-600 rounded-full" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {mode === 'draw' && !hasContent && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                                <span className="text-xl font-medium tracking-tight italic">{t.signHere}</span>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                        <button
                            onClick={handleClear}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 hover:text-red-600 transition-colors"
                        >
                            <Trash2 size={16} />
                            {t.clearNew}
                        </button>

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="px-6 py-2 rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                            >
                                {t.cancel}
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!hasContent}
                                className={`flex items-center gap-2 px-8 py-2 rounded-lg text-sm font-bold shadow-lg transition-all ${hasContent
                                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-indigo-200'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                <Check size={18} />
                                {t.confirm}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default SignatureModal;
