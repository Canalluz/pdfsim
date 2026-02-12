
import React from 'react';
import { Square, Circle, Minus, Diamond, Star } from 'lucide-react';
import { Language, translations } from '../utils/i18n';

interface ShapeSelectorProps {
    language: Language;
    onSelect: (shapeType: string, style?: any) => void;
    onClose: () => void;
}

const ShapeSelector: React.FC<ShapeSelectorProps> = ({ language, onSelect, onClose }) => {
    const t = translations[language];

    const shapes = [
        {
            id: 'rect',
            name: t.rect,
            icon: <Square size={24} />,
            style: { borderRadius: 0 }
        },
        {
            id: 'circle',
            name: t.circle,
            icon: <Circle size={24} />,
            style: { borderRadius: 999 }
        },
        {
            id: 'diamond',
            name: t.diamond,
            icon: <Diamond size={24} />,
            style: { borderRadius: 0, clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }
        },
        {
            id: 'star',
            name: t.star,
            icon: <Star size={24} />,
            style: { borderRadius: 0, clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }
        },
        {
            id: 'line',
            name: t.line,
            icon: <Minus size={24} />,
            style: { height: 2, backgroundColor: '#000000', borderRadius: 0 }
        },
        {
            id: 'rounded-rect',
            name: t.roundedRect,
            icon: <Square size={24} className="rounded-md" />,
            style: { borderRadius: 12 }
        },
    ];

    return (
        <div className="absolute left-64 top-1/4 ml-4 w-48 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-left-2 transition-all">
            <div className="p-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t.shapesTitle}</span>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
            <div className="p-2 grid grid-cols-2 gap-2">
                {shapes.map((shape) => (
                    <button
                        key={shape.id}
                        onClick={() => onSelect('shape', shape.style)}
                        className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors group"
                    >
                        <div className="p-2 bg-gray-50 rounded-md group-hover:bg-indigo-100 transition-colors">
                            {shape.icon}
                        </div>
                        <span className="text-[10px] mt-2 font-medium text-center">{shape.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ShapeSelector;
