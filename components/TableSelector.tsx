
import React, { useState } from 'react';
import { Table, Check } from 'lucide-react';
import { Language, translations } from '../utils/i18n';

interface TableSelectorProps {
    language: Language;
    onSelect: (rows: number, cols: number) => void;
    onClose: () => void;
}

const TableSelector: React.FC<TableSelectorProps> = ({ language, onSelect, onClose }) => {
    const t = translations[language];
    const [rows, setRows] = useState(3);
    const [cols, setCols] = useState(3);
    const [hoveredRow, setHoveredRow] = useState<number | null>(null);
    const [hoveredCol, setHoveredCol] = useState<number | null>(null);

    const maxSize = 8;

    return (
        <div className="absolute left-64 top-1/3 ml-4 w-64 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-left-2 transition-all">
            <div className="p-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-2">
                    <Table size={16} className="text-indigo-600" />
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t.newTable}</span>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>

            <div className="p-4">
                <div className="flex flex-col items-center gap-4">
                    <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${maxSize}, 1fr)` }}>
                        {Array.from({ length: maxSize }).map((_, r) => (
                            Array.from({ length: maxSize }).map((_, c) => {
                                const isSelected = r < rows && c < cols;
                                const isHovered = hoveredRow !== null && hoveredCol !== null && r <= hoveredRow && c <= hoveredCol;

                                return (
                                    <div
                                        key={`${r}-${c}`}
                                        onMouseEnter={() => {
                                            setHoveredRow(r);
                                            setHoveredCol(c);
                                        }}
                                        onMouseLeave={() => {
                                            setHoveredRow(null);
                                            setHoveredCol(null);
                                        }}
                                        onClick={() => onSelect(r + 1, c + 1)}
                                        className={`w-5 h-5 border rounded-sm cursor-pointer transition-colors ${isHovered
                                            ? 'bg-indigo-400 border-indigo-500'
                                            : isSelected
                                                ? 'bg-indigo-100 border-indigo-300'
                                                : 'bg-gray-50 border-gray-200'
                                            }`}
                                    />
                                );
                            })
                        ))}
                    </div>

                    <div className="flex items-center justify-between w-full text-xs font-semibold text-gray-500 border-t pt-3">
                        <span>{t.dimensions}:</span>
                        <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                            {hoveredRow !== null ? hoveredRow + 1 : rows} x {hoveredCol !== null ? hoveredCol + 1 : cols}
                        </span>
                    </div>

                    <button
                        onClick={() => onSelect(rows, cols)}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                        <Check size={16} />
                        {t.createTable}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TableSelector;
