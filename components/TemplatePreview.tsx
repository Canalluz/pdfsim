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
            zIndex: el.type === 'image' || el.type === 'shape' || (el.type === 'smart-element' && el.content === 'ProfessionalPhoto') ? 0 : 10,
            overflow: 'hidden',
            // Simple flex centering if needed, but text usually isn't flexed in this editor model
            display: el.type === 'shape' || (el.type === 'smart-element' && el.content === 'ProfessionalPhoto') ? 'block' : 'flex',
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

        if (el.type === 'smart-element') {
            if (el.content === 'ProfessionalPhoto') {
                return (
                    <div key={el.id} style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e2e8f0', border: '2px dashed #cbd5e1' }}>
                        <div style={{ width: '40%', height: '40%', borderRadius: '50%', backgroundColor: '#cbd5e1' }} />
                    </div>
                );
            }
            if (el.content === 'ResumeSection') {
                // Mock content for resume section
                return (
                    <div key={el.id} style={{ ...style, display: 'block', alignItems: 'flex-start' }}>
                        {/* Mock Title */}
                        {el.componentData?.section?.title && (
                            <div style={{
                                fontWeight: 'bold',
                                marginBottom: '4px',
                                borderBottom: '1px solid currentColor',
                                paddingBottom: '2px',
                                fontSize: '1.1em'
                            }}>
                                {el.componentData.section.title}
                            </div>
                        )}
                        {/* Mock Lines */}
                        <div style={{ opacity: 0.7, fontSize: '0.9em' }}>
                            <div style={{ width: '100%', height: '6px', backgroundColor: 'currentColor', opacity: 0.3, marginBottom: '4px', borderRadius: '2px' }} />
                            <div style={{ width: '80%', height: '6px', backgroundColor: 'currentColor', opacity: 0.3, marginBottom: '4px', borderRadius: '2px' }} />
                            <div style={{ width: '90%', height: '6px', backgroundColor: 'currentColor', opacity: 0.3, borderRadius: '2px' }} />
                        </div>
                    </div>
                );
            }
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
