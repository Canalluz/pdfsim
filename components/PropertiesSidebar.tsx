
import React from 'react';
import {
  Settings,
  Trash2,
  Copy,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ChevronDown,
  Maximize,
  Crop,
  X,
  Italic,
  Bold
} from 'lucide-react';
import { EditorElement } from '../types';
import { Language, translations } from '../utils/i18n';
interface PropertiesSidebarProps {
  language: Language;
  element: EditorElement | undefined;
  onUpdate: (updates: Partial<EditorElement>) => void;
  onDelete: () => void;
  onBringToFront?: () => void;
  onSendToBack?: () => void;
  onStartCrop?: () => void;
  onClose?: () => void;
}

const PropertiesSidebar: React.FC<PropertiesSidebarProps> = ({
  language,
  element,
  onUpdate,
  onDelete,
  onBringToFront,
  onSendToBack,
  onStartCrop,
  onClose,
}) => {
  const t = translations[language];

  if (!element) {
    return (
      <aside className="w-72 border-l bg-white flex flex-col z-30">
        <div className="flex items-center justify-between border-b p-4 text-gray-800">
          <h2 className="text-sm font-bold uppercase tracking-tighter">{t.propertiesTitle}</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors"><X size={16} /></button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <Settings className="text-gray-200 mb-4" size={48} />
          <p className="text-sm font-medium text-gray-400">{t.selectPrompt}</p>
        </div>
      </aside >
    );
  }

  const handleStyleChange = (key: string, value: any) => {
    onUpdate({
      style: {
        ...element.style,
        [key]: value
      }
    });
  };

  const handleRotationChange = (value: number) => {
    onUpdate({ rotation: value });
  };

  return (
    <aside className="w-72 border-l bg-white flex flex-col z-30">
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-tighter">{t.propertiesTitle}</h2>
        <div className="flex gap-2">
          <button onClick={onDelete} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" title={t.delete}><Trash2 size={16} /></button>
          <button className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors" title={t.duplicate}><Copy size={16} /></button>
          <div className="w-px h-4 bg-gray-200 my-auto mx-1" />
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors" title={t.closePanel}><X size={16} /></button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Dimensions Section */}
        <section>
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">{t.posSize}</h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-[10px] text-gray-500 mb-1 block">X</label>
              <input
                type="number"
                value={Math.round(element.x)}
                onChange={(e) => onUpdate({ x: Number(e.target.value) })}
                className="w-full bg-gray-50 border rounded p-1.5 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 mb-1 block">Y</label>
              <input
                type="number"
                value={Math.round(element.y)}
                onChange={(e) => onUpdate({ y: Number(e.target.value) })}
                className="w-full bg-gray-50 border rounded p-1.5 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 mb-1 block">{t.width}</label>
              <input
                type="number"
                value={Math.round(element.width)}
                onChange={(e) => onUpdate({ width: Number(e.target.value) })}
                className="w-full bg-gray-50 border rounded p-1.5 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 mb-1 block">{t.height}</label>
              <input
                type="number"
                value={Math.round(element.height)}
                onChange={(e) => onUpdate({ height: Number(e.target.value) })}
                className="w-full bg-gray-50 border rounded p-1.5 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Rotation & Layers */}
          <div className="space-y-3 pt-3 border-t border-dashed">
            <div>
              <label className="text-[10px] text-gray-500 mb-1 block">{t.rotation} ({Math.round(element.rotation || 0)}°)</label>
              <input
                type="range"
                min="0"
                max="360"
                value={element.rotation || 0}
                onChange={(e) => handleRotationChange(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onBringToFront}
                className="py-1.5 px-2 bg-gray-50 border rounded text-[10px] hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
              >
                {t.bringFront}
              </button>
              <button
                onClick={onSendToBack}
                className="py-1.5 px-2 bg-gray-50 border rounded text-[10px] hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
              >
                {t.sendBack}
              </button>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section>
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">{t.content}</h3>
          {element.type === 'image' && (
            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 block">{t.imageUrl}</label>
              <input
                type="text"
                value={element.content}
                onChange={(e) => onUpdate({ content: e.target.value })}
                className="w-full bg-gray-50 border rounded p-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>
          )}
          {element.type === 'smart-element' && (
            <div className="space-y-3">
              <div className="p-2 bg-indigo-50 border border-indigo-100 rounded text-xs text-indigo-700">
                <strong>{element.content === 'ProfessionalPhoto' ? t.profPhoto : t.smartElement}</strong><br />
                <span className="opacity-75">{element.content}</span>
              </div>

              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">{t.compStyle}</label>
                <select
                  value={element.componentData?.templateId || 'champion-classic-elegant'}
                  onChange={(e) => onUpdate({
                    componentData: { ...element.componentData, templateId: e.target.value }
                  })}
                  className="w-full bg-gray-50 border rounded p-1.5 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                >
                  <option value="champion-classic-elegant">{language === 'pt' ? 'Clássico Elegante' : language === 'es' ? 'Clásico Elegante' : 'Classic Elegant'}</option>
                  <option value="champion-creative-modern">{language === 'pt' ? 'Criativo Moderno' : language === 'es' ? 'Creativo Moderno' : 'Creative Modern'}</option>
                  <option value="champion-minimalist-tech">{language === 'pt' ? 'Minimalista Tech' : language === 'es' ? 'Minimalista Tech' : 'Minimalist Tech'}</option>
                  <option value="champion-academic">{language === 'pt' ? 'Acadêmico / Pesquisa' : language === 'es' ? 'Académico' : 'Academic'}</option>
                  <option value="champion-strategist">{language === 'pt' ? 'O Estrategista' : language === 'es' ? 'El Estratega' : 'The Strategist'}</option>
                </select>
              </div>

              {/* --- Content Editor based on Type --- */}
              {element.componentData?.section?.type === 'keywords_list' && (
                <div className="pt-2 border-t border-dashed">
                  <label className="text-[10px] text-gray-500 mb-1 block">{t.keywordsLabel}</label>
                  <textarea
                    value={element.componentData.section.user_input?.join(', ') || ''}
                    onChange={(e) => {
                      const newKeywords = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                      onUpdate({
                        componentData: {
                          ...element.componentData,
                          section: {
                            ...element.componentData.section,
                            user_input: newKeywords
                          }
                        }
                      });
                    }}
                    className="w-full bg-gray-50 border rounded p-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none min-h-[60px]"
                    placeholder="Gestão, Liderança, SAP..."
                  />
                </div>
              )}

              {element.componentData?.section?.type === 'star_experience' && (
                <div className="pt-2 border-t border-dashed space-y-4">
                  <label className="text-[10px] text-gray-500 block font-bold">{t.editStar}</label>
                  {element.componentData.section.items?.map((item: any, idx: number) => (
                    <div key={idx} className="bg-gray-50 p-2 rounded border border-gray-200">
                      <div className="mb-2">
                        <input
                          value={item.position}
                          onChange={(e) => {
                            const newItems = [...element.componentData.section.items];
                            newItems[idx] = { ...newItems[idx], position: e.target.value };
                            onUpdate({ componentData: { ...element.componentData, section: { ...element.componentData.section, items: newItems } } });
                          }}
                          className="w-full text-xs font-bold bg-white border px-1 py-0.5 rounded mb-1"
                          placeholder={language === 'pt' ? 'Cargo' : language === 'es' ? 'Cargo' : 'Title'}
                        />
                        <input
                          value={item.company}
                          onChange={(e) => {
                            const newItems = [...element.componentData.section.items];
                            newItems[idx] = { ...newItems[idx], company: e.target.value };
                            onUpdate({ componentData: { ...element.componentData, section: { ...element.componentData.section, items: newItems } } });
                          }}
                          className="w-full text-[10px] bg-white border px-1 py-0.5 rounded"
                          placeholder={language === 'pt' ? 'Empresa' : language === 'es' ? 'Empresa' : 'Company'}
                        />
                      </div>

                      {/* Achievements Loop */}
                      <div className="space-y-2">
                        {item.achievements?.map((star: any, sIdx: number) => (
                          <div key={sIdx} className="pl-2 border-l-2 border-indigo-200">
                            <input
                              value={star.star_situation}
                              onChange={(e) => {
                                const newItems = [...element.componentData.section.items];
                                const newAchievements = [...newItems[idx].achievements];
                                newAchievements[sIdx] = { ...newAchievements[sIdx], star_situation: e.target.value };
                                newItems[idx] = { ...newItems[idx], achievements: newAchievements };
                                onUpdate({ componentData: { ...element.componentData, section: { ...element.componentData.section, items: newItems } } });
                              }}
                              className="w-full text-[10px] bg-white border px-1 py-0.5 rounded mb-0.5"
                              placeholder={language === 'pt' ? 'Situação' : language === 'es' ? 'Situación' : 'Situation'}
                            />
                            <input
                              value={star.star_action}
                              onChange={(e) => {
                                const newItems = [...element.componentData.section.items];
                                const newAchievements = [...newItems[idx].achievements];
                                newAchievements[sIdx] = { ...newAchievements[sIdx], star_action: e.target.value };
                                newItems[idx] = { ...newItems[idx], achievements: newAchievements };
                                onUpdate({ componentData: { ...element.componentData, section: { ...element.componentData.section, items: newItems } } });
                              }}
                              className="w-full text-[10px] bg-white border px-1 py-0.5 rounded mb-0.5"
                              placeholder={language === 'pt' ? 'Ação' : language === 'es' ? 'Acción' : 'Action'}
                            />
                            <input
                              value={star.star_result}
                              onChange={(e) => {
                                const newItems = [...element.componentData.section.items];
                                const newAchievements = [...newItems[idx].achievements];
                                newAchievements[sIdx] = { ...newAchievements[sIdx], star_result: e.target.value };
                                newItems[idx] = { ...newItems[idx], achievements: newAchievements };
                                onUpdate({ componentData: { ...element.componentData, section: { ...element.componentData.section, items: newItems } } });
                              }}
                              className="w-full text-[10px] bg-green-50 border border-green-200 px-1 py-0.5 rounded text-green-800 font-bold"
                              placeholder={language === 'pt' ? 'Resultado' : language === 'es' ? 'Resultado' : 'Result'}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newItems = [...(element.componentData.section.items || [])];
                      newItems.push({
                        position: language === 'pt' ? 'Novo Cargo' : language === 'es' ? 'Nuevo Cargo' : 'New Title',
                        company: language === 'pt' ? 'Empresa' : language === 'es' ? 'Empresa' : 'Company',
                        period: '2023 - Presente',
                        achievements: [{
                          star_situation: '...',
                          star_action: '...',
                          star_result: '...'
                        }]
                      });
                      onUpdate({ componentData: { ...element.componentData, section: { ...element.componentData.section, items: newItems } } });
                    }}
                    className="w-full py-1 text-xs bg-indigo-50 text-indigo-600 rounded border border-indigo-200 hover:bg-indigo-100"
                  >
                    {t.addExpItem}
                  </button>
                </div>
              )}

              <p className="text-[10px] text-gray-400">
                {t.styleHint}
              </p>
            </div>
          )}
          {(element.type === 'text' || element.type === 'shape' || element.type === 'table') && element.type !== 'smart-element' && (
            <textarea
              value={element.content}
              onChange={(e) => onUpdate({ content: e.target.value })}
              className="w-full bg-gray-50 border rounded p-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none min-h-[80px] resize-none"
            />
          )}
        </section>

        {/* Typography / Style Section */}
        <section>
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">{t.visualStyle}</h3>
          {element.type === 'text' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={() => handleStyleChange('textAlign', 'left')}
                  className={`flex-1 p-2 rounded border hover:bg-gray-50 ${element.style.textAlign === 'left' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white text-gray-400'}`}
                >
                  <AlignLeft size={14} className="mx-auto" />
                </button>
                <button
                  onClick={() => handleStyleChange('textAlign', 'center')}
                  className={`flex-1 p-2 rounded border hover:bg-gray-50 ${element.style.textAlign === 'center' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white text-gray-400'}`}
                >
                  <AlignCenter size={14} className="mx-auto" />
                </button>
                <button
                  onClick={() => handleStyleChange('textAlign', 'right')}
                  className={`flex-1 p-2 rounded border hover:bg-gray-50 ${element.style.textAlign === 'right' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white text-gray-400'}`}
                >
                  <AlignRight size={14} className="mx-auto" />
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleStyleChange('fontWeight', element.style.fontWeight === 'bold' ? 'normal' : 'bold')}
                  className={`flex-1 p-2 rounded border hover:bg-gray-50 ${element.style.fontWeight === 'bold' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white text-gray-400'}`}
                  title="Bold"
                >
                  <Bold size={14} className="mx-auto" />
                </button>
                <button
                  onClick={() => handleStyleChange('fontStyle', element.style.fontStyle === 'italic' ? 'normal' : 'italic')}
                  className={`flex-1 p-2 rounded border hover:bg-gray-50 ${element.style.fontStyle === 'italic' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white text-gray-400'}`}
                  title="Italic"
                >
                  <Italic size={14} className="mx-auto" />
                </button>
              </div>

              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">{t.fontSize}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="8"
                    max="120"
                    value={element.style.fontSize || 16}
                    onChange={(e) => handleStyleChange('fontSize', Number(e.target.value))}
                    className="flex-1 accent-indigo-600"
                  />
                  <span className="text-xs font-medium text-gray-600 w-8">{element.style.fontSize}</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">{t.textColor}</label>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded border cursor-pointer"
                    style={{ backgroundColor: element.style.color || '#000' }}
                  />
                  <input
                    type="text"
                    value={element.style.color || '#000000'}
                    onChange={(e) => handleStyleChange('color', e.target.value)}
                    className="flex-1 bg-gray-50 border rounded p-1.5 text-xs outline-none uppercase"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Common styles for Shapes/Images/Tables */}
          {(element.type === 'shape' || element.type === 'image' || element.type === 'table') && (
            <div className="space-y-4">
              {element.type === 'table' && (
                <>
                  <div>
                    <label className="text-[10px] text-gray-500 mb-1 block">{t.headerColor}</label>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded border cursor-pointer"
                        style={{ backgroundColor: element.style.headerBackgroundColor || '#f8fafc' }}
                      />
                      <input
                        type="text"
                        value={element.style.headerBackgroundColor || '#f8fafc'}
                        onChange={(e) => handleStyleChange('headerBackgroundColor', e.target.value)}
                        className="flex-1 bg-gray-50 border rounded p-1.5 text-xs outline-none uppercase"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 mb-1 block">{t.borderColor}</label>
                    <input
                      type="text"
                      value={element.style.borderColorTable || '#e2e8f0'}
                      onChange={(e) => handleStyleChange('borderColorTable', e.target.value)}
                      className="w-full bg-gray-50 border rounded p-1.5 text-xs outline-none uppercase"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 mb-1 block">{t.padding}</label>
                    <input
                      type="range"
                      min="0"
                      max="40"
                      value={element.style.cellPadding || 8}
                      onChange={(e) => handleStyleChange('cellPadding', Number(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                </>
              )}
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">{t.radius}</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={element.style.borderRadius || 0}
                  onChange={(e) => handleStyleChange('borderRadius', Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">{t.opacity}</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={element.style.opacity || 1}
                  onChange={(e) => handleStyleChange('opacity', Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>
            </div>
          )}
        </section>

        {/* Image Correction Filters */}
        {element.type === 'image' && (
          <section>
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">{t.imgFilters}</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block flex justify-between">{t.brightness} <span>{element.style.brightness ?? 100}%</span></label>
                <input
                  type="range" min="0" max="200"
                  value={element.style.brightness ?? 100}
                  onChange={(e) => handleStyleChange('brightness', Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block flex justify-between">{t.contrast} <span>{element.style.contrast ?? 100}%</span></label>
                <input
                  type="range" min="0" max="200"
                  value={element.style.contrast ?? 100}
                  onChange={(e) => handleStyleChange('contrast', Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block flex justify-between">{t.saturation} <span>{element.style.saturation ?? 100}%</span></label>
                <input
                  type="range" min="0" max="200"
                  value={element.style.saturation ?? 100}
                  onChange={(e) => handleStyleChange('saturation', Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block flex justify-between">{t.sepia} <span>{element.style.sepia ?? 0}%</span></label>
                <input
                  type="range" min="0" max="100"
                  value={element.style.sepia ?? 0}
                  onChange={(e) => handleStyleChange('sepia', Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block flex justify-between">{t.blur} <span>{element.style.blur ?? 0}px</span></label>
                <input
                  type="range" min="0" max="20"
                  value={element.style.blur ?? 0}
                  onChange={(e) => handleStyleChange('blur', Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onStartCrop}
                className="w-full py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold rounded hover:bg-indigo-100 flex items-center justify-center gap-2"
              >
                <Crop size={14} />
                {t.cropImg}
              </button>
            </div>
          </section>
        )}
      </div>

      <div className="border-t p-4 bg-gray-50">
        <button className="w-full py-2 bg-white border border-gray-200 text-gray-600 text-[10px] font-bold uppercase tracking-widest rounded hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
          <Maximize size={12} />
          {t.lockElement}
        </button>
      </div>
    </aside >
  );
};

export default PropertiesSidebar;
