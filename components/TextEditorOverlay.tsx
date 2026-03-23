import React, { useState, useEffect } from 'react';
import { PDFBlock, PDFFont } from '../types';

interface TextEditorOverlayProps {
  blocks: PDFBlock[];
  fonts?: Record<string, PDFFont>;
  scale: number;
  onUpdateBlock: (index: number, newText: string) => void;
  visible?: boolean;
}

const TextEditorOverlay: React.FC<TextEditorOverlayProps> = ({
  blocks,
  fonts,
  scale,
  onUpdateBlock,
  visible = true
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempText, setTempText] = useState<string>('');

  if (!visible) return null;

  const handleStartEdit = (index: number, initialText: string) => {
    setEditingIndex(index);
    setTempText(initialText);
  };

  const handleCommit = (index: number) => {
    if (tempText !== blocks[index].text) {
        onUpdateBlock(index, tempText);
    }
    setEditingIndex(null);
  };

  // Helper to convert PyMuPDF integer color to hex
  const intToHex = (colorInt: number) => {
    if (colorInt === 0) return '#000000';
    const r = (colorInt >> 16) & 255;
    const g = (colorInt >> 8) & 255;
    const b = colorInt & 255;
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  };

  return (
    <div 
      className="absolute inset-0 pointer-events-none" 
      style={{ zIndex: 45 }}
    >
      {blocks.map((block, index) => {
        const [x0, y0, x1, y1] = block.bbox;
        const width = x1 - x0;
        const height = y1 - y0;
        const isEditing = editingIndex === index;
        
        let fontFamily = block.font;
        if (fontFamily.includes('Arial')) fontFamily = 'Arial, sans-serif';
        if (fontFamily.includes('Times')) fontFamily = '"Times New Roman", Times, serif';
        if (fontFamily.includes('Courier')) fontFamily = '"Courier New", Courier, monospace';
        if (fontFamily.includes('Helvetica')) fontFamily = 'Helvetica, Arial, sans-serif';
        
        return (
          <div
            key={`${index}-${index}`} // Use index for stability during text changes
            className={`absolute pointer-events-auto transition-all ${
              isEditing 
                ? 'bg-white shadow-lg ring-2 ring-blue-500 z-50' 
                : 'hover:ring-1 hover:ring-blue-300/50'
            }`}
            style={{
              left: `${x0}px`,
              top: `${y0}px`,
              width: `${width + 1}px`,
              height: `${height + 1}px`,
              fontSize: `${block.size}px`,
              color: isEditing ? intToHex(block.color) : 'transparent',
              fontFamily: fontFamily,
              cursor: 'text',
              overflow: 'hidden',
              whiteSpace: 'pre',
              display: 'flex',
              alignItems: 'center',
              backgroundColor: isEditing ? 'white' : 'transparent',
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleStartEdit(index, block.text);
            }}
          >
            {isEditing ? (
              <input
                autoFocus
                className="w-full h-full bg-transparent outline-none border-none p-0 m-0"
                value={tempText}
                style={{
                    fontSize: 'inherit',
                    fontFamily: 'inherit',
                    color: 'inherit',
                    lineHeight: 1
                }}
                onChange={(e) => setTempText(e.target.value)}
                onBlur={() => handleCommit(index)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCommit(index);
                  if (e.key === 'Escape') setEditingIndex(null);
                } }
              />
            ) : (
                <span className="select-none">{block.text}</span>
            )}
            
            {block.is_subset && !isEditing && (
                 <div className="absolute top-0 right-0 w-1 h-1 bg-amber-400 rounded-full opacity-30" title="Embedded Subset Font" />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TextEditorOverlay;
