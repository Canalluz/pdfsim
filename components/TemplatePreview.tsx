import React from 'react';
import { Template } from '../data/templates';
import { EditorElement } from '../types';

interface TemplatePreviewProps {
    template: Template;
    scale?: number;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({ template, scale = 0.25 }) => {
    // A4 dimensions at 72 DPI (approx) -> 595 x 842 pixels
    const width = 595;
    const height = 842;

    const renderElement = (el: EditorElement) => {
        const style: React.CSSProperties = {
            position: 'absolute',
            left: `${el.x}px`,
            top: `${el.y}px`,
            width: `${el.width}px`,
            height: `${el.height}px`,
            fontSize: `${el.style.fontSize}px`,
            fontWeight: el.style.fontWeight as any,
            fontFamily: el.style.fontFamily,
            color: el.style.color,
            textAlign: el.style.textAlign as any,
            backgroundColor: el.style.backgroundColor,
            borderRadius: el.style.borderRadius,
            opacity: el.style.opacity,
            lineHeight: el.style.lineHeight || 1.2,
            boxShadow: el.style.boxShadow,
            background: el.style.background,
            whiteSpace: 'pre-wrap',
            zIndex: el.type === 'image' || el.type === 'shape' ? 0 : 10,
            overflow: 'hidden',
            // Simple flex centering if needed, but text usually isn't flexed in this editor model
            display: el.type === 'shape' ? 'block' : 'flex',
            alignItems: 'center',
            justifyContent: el.style.textAlign === 'center' ? 'center' : (el.style.textAlign === 'right' ? 'flex-end' : 'flex-start'),
        };

        if (el.type === 'image') {
            return (
                <img
                    key={el.id}
                    src={el.content}
                    alt="element"
                    style={{ ...style, objectFit: 'cover' }}
                />
            );
        }

        if (el.type === 'shape') {
            return <div key={el.id} style={style} />;
        }

        return (
            <div key={el.id} style={style}>
                {el.content}
            </div>
        );
    };

    return (
        <div
            className="relative bg-white shadow-sm overflow-hidden pointer-events-none select-none"
            style={{
                width: `${width * scale}px`,
                height: `${height * scale}px`,
            }}
        >
            <div
                style={{
                    width: `${width}px`,
                    height: `${height}px`,
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    backgroundColor: '#ffffff'
                }}
            >
                {template.elements.map(renderElement)}
            </div>
        </div>
    );
};

export default TemplatePreview;
