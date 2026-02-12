import React, { useState } from 'react';
import { getTemplates, Template } from '../data/templates';
import { Language, translations } from '../utils/i18n';
import TemplatePreview from './TemplatePreview';
import { Layout, Check, AlertCircle, X } from 'lucide-react';

interface TemplateSelectorProps {
    language: Language;
    onSelectTemplate: (template: Template) => void;
    onClose: () => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ language, onSelectTemplate, onClose }) => {
    const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

    const t = translations[language];

    const templates = getTemplates(language);

    return (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Layout className="text-indigo-600" />
                            {language === 'pt' ? 'Galeria de Modelos' : language === 'es' ? 'Galería de Pantillas' : 'Template Gallery'}
                        </h2>
                        <p className="text-sm text-gray-500">
                            {language === 'pt' ? 'Escolha um layout para iniciar.' : language === 'es' ? 'Elige un diseño para comenzar.' : 'Choose a layout to start.'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Grid */}
                    <main className="flex-1 overflow-auto p-6 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {templates.map(template => (
                                <div
                                    key={template.id}
                                    onClick={() => setPreviewTemplate(template)}
                                    className={`group relative bg-white rounded-lg shadow-sm hover:shadow-md border-2 transition-all cursor-pointer overflow-hidden aspect-[1/1.41] ${previewTemplate?.id === template.id ? 'border-indigo-600 ring-2 ring-indigo-100' : 'border-transparent hover:border-indigo-200'
                                        }`}
                                >
                                    {/* Thumbnail Preview */}
                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center relative">
                                        <div className="scale-[0.35] origin-top-left absolute top-0 left-0 w-[595px] h-[842px]">
                                            <TemplatePreview template={template} scale={1} />
                                        </div>

                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 z-20">
                                            <span className="text-white font-bold">{template.name}</span>
                                            <span className="text-white/80 text-xs capitalize">{template.category}</span>
                                        </div>

                                        {/* Selected Indicator */}
                                        {previewTemplate?.id === template.id && (
                                            <div className="absolute top-2 right-2 bg-indigo-600 text-white p-1 rounded-full shadow-lg">
                                                <Check size={16} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </main>
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-white flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-600 text-xs bg-amber-50 px-3 py-2 rounded-lg">
                        <AlertCircle size={16} />
                        <span>{language === 'pt' ? 'Substituirá o conteúdo atual.' : 'Reemplazará el contenido actual.'}</span>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
                        >
                            {t.cancel}
                        </button>
                        <button
                            onClick={() => previewTemplate && onSelectTemplate(previewTemplate)}
                            disabled={!previewTemplate}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 flex items-center gap-2"
                        >
                            {previewTemplate ? `${t.chooseTemplate}` : t.chooseTemplate}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TemplateSelector;
