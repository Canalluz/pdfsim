import React, { useState, useEffect, useRef } from 'react';
import { EditorElement } from '../types';
import { Check, X } from 'lucide-react';
import { Language, translations } from '../utils/i18n';

interface CropOverlayProps {
    language: Language;
    element: EditorElement;
    onConfirm: (crop: { x: number; y: number; width: number; height: number }) => void;
    onCancel: () => void;
}

const CropOverlay: React.FC<CropOverlayProps> = ({ language, element, onConfirm, onCancel }) => {
    const t = translations[language];
    // Initialize crop box to current element dimensions or existing crop
    const [cropBox, setCropBox] = useState({
        x: element.crop?.x ?? 0,
        y: element.crop?.y ?? 0,
        width: element.crop?.width ?? element.width,
        height: element.crop?.height ?? element.height,
    });

    // If we are starting a fresh crop, and no previous crop existed, 
    // we treat the current element dimensions as the "full" image view initially,
    // but conceptually we are cropping *into* it. 
    // For simplicity in this MVP: We assume the current visible image IS the full image 
    // if no crop exists. If we crop, we are creating a window.

    // However, a true crop usually lets you see the "hidden" parts if you re-crop.
    // To support that, we would need to store "originalWidth/Height" on the element.
    // For now, we will implement "Masking": You reduce the visible area.
    // We won't support "expanding" back to a larger size than the *element had when crop started* 
    // UNLESS we store originalReferenceSize. 

    // Let's settle on: The "Element" is the window.
    // When entering crop mode, we show the image at its current size.
    // The user can shrink the box.
    // This is a destructive crop for the *view*, but we keep the full content URL so they can re-add it? 
    // No, without "original dims", we can't easily "uncrop" to be larger.
    // We will assume "Non-Destructive" means we just change the ViewBox.

    const [dragState, setDragState] = useState<{
        isDragging: boolean;
        handle: string | null;
        startX: number;
        startY: number;
        startBox: typeof cropBox;
    }>({
        isDragging: false,
        handle: null,
        startX: 0,
        startY: 0,
        startBox: cropBox
    });

    const handleMouseDown = (e: React.MouseEvent, handle: string | null) => {
        e.stopPropagation();
        setDragState({
            isDragging: true,
            handle,
            startX: e.clientX,
            startY: e.clientY,
            startBox: { ...cropBox }
        });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!dragState.isDragging) return;

        const dx = e.clientX - dragState.startX;
        const dy = e.clientY - dragState.startY;

        const newBox = { ...dragState.startBox };

        // Constraint: Crop box cannot be larger than the original element (for this MVP version)
        // or we implement it such that the box is free, and the image is fixed?
        // Let's go with: The Box moves/resizes relative to the Element's origin (0,0).

        if (dragState.handle === 'move') {
            newBox.x += dx;
            newBox.y += dy;
        } else if (dragState.handle === 'se') {
            newBox.width = Math.max(20, dragState.startBox.width + dx);
            newBox.height = Math.max(20, dragState.startBox.height + dy);
        }
        // Add other handles as needed (nw, ne, sw) - keeping it simple with SE and Move for now

        setCropBox(newBox);
    };

    const handleMouseUp = () => {
        setDragState(prev => ({ ...prev, isDragging: false }));
    };

    return (
        <div
            className="absolute top-0 left-0 w-full h-full z-50 pointer-events-auto"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {/* Dimmed Background */}
            <div className="absolute inset-0 bg-black/50" />

            {/* The Crop Box */}
            <div
                className="absolute border-2 border-white shadow-xl bg-transparent flex"
                style={{
                    left: cropBox.x,
                    top: cropBox.y,
                    width: cropBox.width,
                    height: cropBox.height,
                    // Cursor styles
                    cursor: 'move'
                }}
                onMouseDown={(e) => handleMouseDown(e, 'move')}
            >
                {/* Grid lines for Rule of Thirds */}
                <div className="absolute left-1/3 top-0 w-px h-full bg-white/30 pointer-events-none" />
                <div className="absolute left-2/3 top-0 w-px h-full bg-white/30 pointer-events-none" />
                <div className="absolute top-1/3 left-0 w-full h-px bg-white/30 pointer-events-none" />
                <div className="absolute top-2/3 left-0 w-full h-px bg-white/30 pointer-events-none" />

                {/* Resize Handle (SE only for MVP simplicity) */}
                <div
                    className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-white border border-indigo-500 rounded-full cursor-nwse-resize z-10"
                    onMouseDown={(e) => handleMouseDown(e, 'se')}
                />

                {/* Toolbar */}
                <div className="absolute -bottom-12 right-0 flex gap-2">
                    <button
                        onClick={onCancel}
                        className="p-1 rounded-full bg-white text-red-500 hover:bg-gray-100 shadow-lg"
                        title={t.cancel}
                    >
                        <X size={20} />
                    </button>
                    <button
                        onClick={() => onConfirm(cropBox)}
                        className="p-1 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg"
                        title={t.confirm}
                    >
                        <Check size={20} />
                    </button>
                </div>
            </div>

            {/* Helper Text */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/75 text-white text-xs px-3 py-1 rounded">
                {t.cropMode}
            </div>
        </div>
    );
};

export default CropOverlay;
