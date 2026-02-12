import React from 'react';
import { Camera, MapPin, Mail, Phone, Globe, Linkedin, Github, Upload, X } from 'lucide-react';

// --- Types ---
interface PhotoConfig {
    position?: string;
    size?: string;
    recommendation?: string;
    style?: string; // 'circle', 'rounded', 'bordered'
}

interface SectionItem {
    title?: string;
    company?: string;
    period?: string;
    description?: string;
    degree?: string;
    school?: string;
    year?: string;
    [key: string]: any;
}

interface SectionContent {
    type: 'skills_grid' | 'timeline_experience' | 'education_list' | 'text';
    title: string;
    content?: string | any;
    items?: SectionItem[];
}

interface SmartComponentProps {
    elementId: string;
    templateId: string;
    data: any; // Flexible data prop
    onUpdate?: (newData: any) => void;
    onHeightChange?: (height: number) => void;
    onTriggerImageUpload?: (elementId: string) => void;
    onTriggerCamera?: (elementId: string) => void;
}

// --- Helper Components ---

const EditableText: React.FC<{
    value: string;
    className?: string;
    onSave?: (newValue: string) => void;
    placeholder?: string;
    multiline?: boolean;
}> = ({ value, className, onSave, placeholder, multiline }) => {
    const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
        if (onSave && e.target.innerText !== value) {
            onSave(e.target.innerText);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
        if (!multiline && e.key === 'Enter') {
            e.preventDefault();
            e.currentTarget.blur();
        }
    };

    return (
        <span
            contentEditable={!!onSave}
            suppressContentEditableWarning
            className={`outline-none focus:bg-yellow-100/30 transition-colors min-w-[20px] inline-block empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 cursor-text ${className}`}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            data-placeholder={placeholder}
        >
            {value}
        </span>
    );
};

const SkillsGrid: React.FC<{ data: any; onUpdate?: (newData: any) => void }> = ({ data, onUpdate }) => {
    // Array format for Skills Grid (Tags)
    if (Array.isArray(data)) {
        return (
            <div className="flex flex-wrap gap-2">
                {data.map((skill, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md shadow-sm flex items-center gap-1 group">
                        <EditableText
                            value={skill}
                            onSave={onUpdate ? (val) => {
                                const newData = [...data];
                                newData[i] = val;
                                onUpdate(newData);
                            } : undefined}
                        />
                        {onUpdate && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation(); // prevent drag
                                    const newData = data.filter((_, idx) => idx !== i);
                                    onUpdate(newData);
                                }}
                                className="hidden group-hover:block text-red-400 hover:text-red-600 ml-1"
                            >×</button>
                        )}
                    </span>
                ))}
                {onUpdate && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onUpdate([...data, 'Nova Habilidade']);
                        }}
                        className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs rounded-md border border-indigo-200 hover:bg-indigo-100"
                    >+ Add</button>
                )}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(data).map(([category, skills]: [string, any], idx) => (
                <div key={idx}>
                    <h4 className="font-bold text-sm text-gray-800 mb-1">{category}</h4>
                    <div className="flex flex-wrap gap-1">
                        {Array.isArray(skills) && skills.map((skill, i) => (
                            <span key={i} className="text-xs text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200">
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

const Timeline: React.FC<{ data: SectionItem[]; onUpdate?: (newData: any) => void }> = ({ data, onUpdate }) => {
    if (!data) return null;
    return (
        <div className="space-y-4">
            {data.map((item, i) => (
                <div key={i} className="relative pl-4 border-l-2 border-gray-200 group">
                    <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-gray-300 border-2 border-white"></div>
                    <h4 className="font-bold text-sm text-gray-800">
                        <EditableText
                            value={item.title || item.degree || item.position || ''}
                            placeholder="Cargo / Título"
                            onSave={onUpdate ? (val) => {
                                const newData = [...data];
                                // Handle legacy field names
                                if (newData[i].title !== undefined) newData[i] = { ...newData[i], title: val };
                                else if (newData[i].degree !== undefined) newData[i] = { ...newData[i], degree: val };
                                else newData[i] = { ...newData[i], position: val };
                                onUpdate(newData);
                            } : undefined}
                        />
                    </h4>
                    <div className="text-xs text-gray-500 mb-1 flex justify-between">
                        <EditableText
                            value={item.company || item.school || ''}
                            placeholder="Empresa / Escola"
                            onSave={onUpdate ? (val) => {
                                const newData = [...data];
                                if (newData[i].company !== undefined) newData[i] = { ...newData[i], company: val };
                                else newData[i] = { ...newData[i], school: val };
                                onUpdate(newData);
                            } : undefined}
                        />
                        <EditableText
                            value={item.period || item.year || ''}
                            placeholder="Período"
                            onSave={onUpdate ? (val) => {
                                const newData = [...data];
                                if (newData[i].period !== undefined) newData[i] = { ...newData[i], period: val };
                                else newData[i] = { ...newData[i], year: val };
                                onUpdate(newData);
                            } : undefined}
                        />
                    </div>
                    {(item.description !== undefined) && (
                        <p className="text-xs text-gray-600 whitespace-pre-line leading-relaxed group-hover:min-h-[20px]">
                            <EditableText
                                value={item.description}
                                multiline
                                placeholder="Descrição das atividades..."
                                onSave={onUpdate ? (val) => {
                                    const newData = [...data];
                                    newData[i] = { ...newData[i], description: val };
                                    onUpdate(newData);
                                } : undefined}
                            />
                        </p>
                    )}
                </div>
            ))}
            {onUpdate && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onUpdate([...data, { position: 'Novo Cargo', company: 'Empresa', period: '2024', description: 'Descrição...' }]);
                    }}
                    className="w-full text-center py-2 text-xs text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded bg-white border border-dashed border-gray-300 mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >+ Adicionar Item</button>
            )}
        </div>
    );
};

const SimpleContent: React.FC<{ data: string; onUpdate?: (val: string) => void }> = ({ data, onUpdate }) => (
    <div className="whitespace-pre-wrap leading-relaxed">
        <EditableText
            value={data}
            multiline
            onSave={onUpdate}
        />
    </div>
);

// --- New Helper Components for Strategist Template ---

const KeywordsSection: React.FC<{ data: any; onUpdate?: (newData: any) => void }> = ({ data, onUpdate }) => {
    // data IS the section object here
    const keywords = data.user_input || [];

    return (
        <div className="bg-indigo-50/50 p-3 rounded-md border border-indigo-100">
            {data.instruction && <p className="text-[10px] text-indigo-400 mb-2 uppercase tracking-wide font-bold">{data.instruction}</p>}
            <div className="flex flex-wrap gap-2">
                {keywords.map((kw: string, i: number) => (
                    <span key={i} className="px-2 py-1 bg-white text-indigo-700 text-xs font-medium rounded border border-indigo-200 shadow-sm flex items-center gap-1 group">
                        <EditableText
                            value={kw}
                            onSave={onUpdate ? (val) => {
                                const newKeywords = [...keywords];
                                newKeywords[i] = val;
                                onUpdate({ ...data, user_input: newKeywords });
                            } : undefined}
                        />
                        {onUpdate && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const newKeywords = keywords.filter((_: any, idx: number) => idx !== i);
                                    onUpdate({ ...data, user_input: newKeywords });
                                }}
                                className="hidden group-hover:block text-indigo-300 hover:text-indigo-600 ml-0.5"
                            >×</button>
                        )}
                    </span>
                ))}
                {onUpdate && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onUpdate({ ...data, user_input: [...keywords, 'Nova Palavra'] });
                        }}
                        className="px-2 py-1 bg-indigo-100 text-indigo-600 text-xs rounded hover:bg-indigo-200"
                    >+ Add</button>
                )}
            </div>
        </div>
    );
};

const StarExperience: React.FC<{ data: any[]; onUpdate?: (newData: any) => void }> = ({ data, onUpdate }) => {
    if (!data) return null;

    return (
        <div className="space-y-6">
            {data.map((item, i) => (
                <div key={i} className="group mb-6">
                    <div className="flex justify-between items-baseline border-b border-gray-100 pb-1 mb-2">
                        <h4 className="font-bold text-lg text-gray-900">
                            <EditableText
                                value={item.position}
                                onSave={onUpdate ? (val) => {
                                    const newData = [...data];
                                    newData[i] = { ...newData[i], position: val };
                                    onUpdate(newData);
                                } : undefined}
                            />
                        </h4>
                        <span className="text-gray-500 text-sm">
                            <EditableText
                                value={item.period}
                                onSave={onUpdate ? (val) => {
                                    const newData = [...data];
                                    newData[i] = { ...newData[i], period: val };
                                    onUpdate(newData);
                                } : undefined}
                            />
                        </span>
                    </div>

                    <h5 className="text-sm font-semibold text-gray-700 mb-3">
                        <EditableText
                            value={item.company}
                            onSave={onUpdate ? (val) => {
                                const newData = [...data];
                                newData[i] = { ...newData[i], company: val };
                                onUpdate(newData);
                            } : undefined}
                        />
                    </h5>

                    <div className="space-y-4 pl-0">
                        {item.achievements?.map((star: any, sIdx: number) => (
                            <div key={sIdx} className="pl-3 border-l-2 border-yellow-400 bg-yellow-50/30 p-2 rounded-r relative group/star">
                                <div className="mb-1 text-sm text-gray-800">
                                    <span className="font-bold text-gray-900">Desafio: </span>
                                    <EditableText
                                        value={star.star_situation?.replace('Desafio: ', '') || star.star_situation}
                                        onSave={onUpdate ? (val) => {
                                            const newData = [...data];
                                            const newAchievements = [...newData[i].achievements];
                                            // Preserve prefix if it was there, or just save raw value? 
                                            // The render removes it, so let's just save the raw value without prefix 
                                            // and assume render handles it? 
                                            // Actually the replace is only for display. 
                                            // If I save "My Challenge", and next time render "Desafio: My Challenge", it works.
                                            // But here I'm saving what user typed. 
                                            // Let's prepend "Desafio: " if not present? 
                                            // Or better, let's stop stripping/prepending in data and just handle it in UI?
                                            // For now, I'll save "Desafio: " + val to match existing data structure.
                                            newAchievements[sIdx] = { ...newAchievements[sIdx], star_situation: val.startsWith('Desafio: ') ? val : `Desafio: ${val}` };
                                            newData[i] = { ...newData[i], achievements: newAchievements };
                                            onUpdate(newData);
                                        } : undefined}
                                    />
                                </div>
                                <div className="mb-2 text-sm text-gray-800">
                                    <span className="font-bold text-gray-900">Ação: </span>
                                    <EditableText
                                        value={star.star_action?.replace('Ação: ', '') || star.star_action}
                                        onSave={onUpdate ? (val) => {
                                            const newData = [...data];
                                            const newAchievements = [...newData[i].achievements];
                                            newAchievements[sIdx] = { ...newAchievements[sIdx], star_action: val.startsWith('Ação: ') ? val : `Ação: ${val}` };
                                            newData[i] = { ...newData[i], achievements: newAchievements };
                                            onUpdate(newData);
                                        } : undefined}
                                    />
                                </div>
                                <div className="inline-block bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded border border-green-200 shadow-sm">
                                    🚀 <EditableText
                                        value={star.star_result?.replace('Resultado: ', '') || star.star_result}
                                        onSave={onUpdate ? (val) => {
                                            const newData = [...data];
                                            const newAchievements = [...newData[i].achievements];
                                            newAchievements[sIdx] = { ...newAchievements[sIdx], star_result: val.startsWith('Resultado: ') ? val : `Resultado: ${val}` };
                                            newData[i] = { ...newData[i], achievements: newAchievements };
                                            onUpdate(newData);
                                        } : undefined}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

// --- Main Smart Components ---

export const ProfessionalPhoto: React.FC<SmartComponentProps & { userImage?: string }> = ({ elementId, templateId, data, userImage, onTriggerImageUpload, onTriggerCamera }) => {
    const { photoConfig } = data;

    // Style configurations based on templateId (Campeão logic)
    const styles: Record<string, string> = {
        'champion-classic-elegant': 'border-4 border-white shadow-md rounded-sm',
        'champion-creative-modern': 'rounded-full border-4 border-white shadow-xl bg-white/20',
        'champion-minimalist-tech': 'rounded-lg border-2 border-gray-700 transition-all',
        'champion-academic': 'border double border-indigo-900 p-1',
        'champion-strategist': 'border-2 border-yellow-500 rounded p-1',
        'champion-green-modern': 'border-2 border-white/30 rounded-full shadow-lg p-1', // Green template style
        'champion-corporate-blue': 'border-0 rounded-none shadow-none', // Simple square photo
    };

    const containerStyle = styles[templateId || 'champion-classic-elegant'] || '';

    return (
        <div className="relative group w-full h-full flex items-center justify-center p-2">
            <div className={`relative overflow-hidden w-full h-full flex items-center justify-center ${containerStyle}`}>
                {userImage ? (
                    <img src={userImage} alt="Foto Profissional" className="w-full h-full object-cover" draggable={false} />
                ) : (
                    <div className="flex flex-col items-center justify-center text-white/90 p-2 text-center w-full h-full">
                        <Camera size={24} className="mb-2" />
                        <span className="text-[10px] uppercase font-bold tracking-wider mb-3">Foto</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => onTriggerImageUpload?.(elementId)}
                                className="p-1.5 bg-white/20 hover:bg-white/40 rounded-full transition-colors"
                                title="Upload"
                            >
                                <Upload size={14} />
                            </button>
                            <button
                                onClick={() => onTriggerCamera?.(elementId)}
                                className="p-1.5 bg-white/20 hover:bg-white/40 rounded-full transition-colors"
                                title="Câmera"
                            >
                                <Camera size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Tooltip on Hover */}
            {photoConfig?.recommendation && (
                <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-xs p-2 rounded w-48 -bottom-2 translate-y-full left-1/2 -translate-x-1/2 z-50 pointer-events-none text-center">
                    {photoConfig.recommendation}
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-b-black/80"></div>
                </div>
            )}
        </div>
    );
};

export const ResumeSection: React.FC<SmartComponentProps> = ({ elementId, templateId, data, onUpdate, onHeightChange, onTriggerImageUpload, onTriggerCamera }) => {
    const { section } = data;
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (!containerRef.current || !onHeightChange) return;

        const observer = new ResizeObserver(() => {
            // Measure the actual scroll height of the container
            const height = containerRef.current?.scrollHeight || 0;
            if (height > 10) {
                onHeightChange(height);
            }
        });

        observer.observe(containerRef.current);
        // Also observe immediate children for more accuracy
        const children = containerRef.current.children;
        for (let i = 0; i < children.length; i++) {
            observer.observe(children[i] as Element);
        }

        return () => observer.disconnect();
    }, [onHeightChange]);

    if (!section) return <div className="p-2 text-red-500">Section data missing</div>;

    // Template-specific header styling
    const headerStyles: Record<string, string> = {
        'champion-classic-elegant': 'text-indigo-900 border-b-2 border-gray-300 pb-1 mb-3 uppercase tracking-wider',
        'champion-creative-modern': 'text-purple-700 font-black text-lg mb-4 relative pl-4 border-l-4 border-indigo-500',
        'champion-minimalist-tech': 'text-gray-200 bg-gray-800 px-2 py-1 mb-3 font-mono text-sm inline-block rounded',
        'champion-academic': 'text-black border-b border-black pb-0.5 mb-2 font-serif font-bold',
        'champion-strategist': 'text-blue-900 border-l-4 border-yellow-500 pl-2 mb-2 uppercase tracking-wide', // Strategist Style
        'champion-green-modern': 'text-white/90 uppercase text-xs font-bold tracking-widest mb-4 border-b border-white/20 pb-1', // Green Sidebar Header
        'champion-corporate-blue': 'bg-[#2563eb] text-white py-1 px-4 mb-4 uppercase font-bold tracking-wider rounded-sm', // Corporate Blue Block Header
    };

    const hClass = headerStyles[templateId || 'champion-classic-elegant'] || 'font-bold mb-2 border-b';

    const renderContent = () => {
        switch (section.type) {
            case 'skills_grid':
                return <SkillsGrid
                    data={section.content || section.items}
                    onUpdate={onUpdate ? (newVal) => onUpdate({ ...data, section: { ...section, [section.content ? 'content' : 'items']: newVal } }) : undefined}
                />;
            case 'keywords_list':
                return <KeywordsSection
                    data={section}
                    onUpdate={onUpdate ? (newSection) => onUpdate({ ...data, section: newSection }) : undefined}
                />;
            case 'star_experience':
                return <StarExperience
                    data={section.items || []}
                    onUpdate={onUpdate ? (newItems) => onUpdate({ ...data, section: { ...section, items: newItems } }) : undefined}
                />;
            case 'timeline_experience':
            case 'education_list':
                return <Timeline
                    data={section.items || []}
                    onUpdate={onUpdate ? (newItems) => onUpdate({ ...data, section: { ...section, items: newItems } }) : undefined}
                />;
            default:
                return <SimpleContent
                    data={section.content}
                    onUpdate={onUpdate ? (newContent) => onUpdate({ ...data, section: { ...section, content: newContent } }) : undefined}
                />;
        }
    };

    return (
        <div ref={containerRef} className="w-full h-auto overflow-visible">
            {section.title && (
                <h3 className={`font-bold text-base ${hClass}`}>
                    <EditableText
                        value={section.title}
                        onSave={onUpdate ? (val) => onUpdate({ ...data, section: { ...section, title: val } }) : undefined}
                    />
                </h3>
            )}
            <div className="template-content">
                {renderContent()}
            </div>
        </div>
    );
};
