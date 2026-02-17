
import React from 'react';
import { MousePointer2, Type, ImageIcon, Square, Link as LinkIcon, Table, Layout, FileText, Camera, Eraser, PenTool, Plus } from 'lucide-react';
import { ElementType } from '../types';
import { Language, translations } from '../utils/i18n';

interface ToolbarProps {
  language: Language;
  onAddElement: (type: ElementType, content?: string, style?: any, tableData?: string[][]) => void;
  onOpenTemplates?: () => void;
  onAddImage?: () => void;
  onAddPdf?: () => void;
  onAddCamera?: () => void;
  onTogglePen?: () => void;
  penActive?: boolean;
  onToggleShapes?: () => void;
  shapesActive?: boolean;
  onToggleTable?: () => void;
  tableActive?: boolean;
  templatesActive?: boolean;
  onAddSignature?: () => void;
  onAddPage?: () => void;
  penSize?: number;
  onUpdatePenSize?: (size: number) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  language,
  onAddElement,
  onOpenTemplates,
  onAddImage,
  onAddPdf,
  onAddCamera,
  onTogglePen,
  penActive = false,
  onToggleShapes,
  shapesActive = false,
  onToggleTable,
  tableActive = false,
  templatesActive = false,
  onAddSignature,
  onAddPage,
  penSize = 2,
  onUpdatePenSize
}) => {
  const t = translations[language];

  const toolGroups = [
    {
      title: language === 'pt' ? 'Estrutura' : 'Structure',
      items: [
        { id: 'layout', icon: <Layout size={18} />, label: t.resumeTemplates, action: () => onOpenTemplates && onOpenTemplates(), highlight: templatesActive },
        { id: 'addPage', icon: <Plus size={18} />, label: language === 'pt' ? 'Nova Página' : 'Add Page', action: () => onAddPage && onAddPage() },
      ]
    },
    {
      title: language === 'pt' ? 'Conteúdo' : 'Content',
      items: [
        { id: 'text', icon: <Type size={18} />, label: t.addText, action: () => onAddElement('text') },
        { id: 'image', icon: <ImageIcon size={18} />, label: t.insertImage, action: () => onAddImage ? onAddImage() : onAddElement('image') },
        { id: 'pdf', icon: <FileText size={18} />, label: t.insertPdf, action: () => onAddPdf ? onAddPdf() : {} },
        { id: 'camera', icon: <Camera size={18} />, label: t.cameraPhotoTool, action: () => onAddCamera ? onAddCamera() : {} },
      ]
    },
    {
      title: language === 'pt' ? 'Elementos & Design' : 'Elements & Design',
      items: [
        { id: 'shape', icon: <Square size={18} />, label: t.shapes, action: () => onToggleShapes && onToggleShapes(), highlight: shapesActive },
        { id: 'table', icon: <Table size={18} />, label: t.table, action: () => onToggleTable && onToggleTable(), highlight: tableActive },
        { id: 'signature', icon: <PenTool size={18} />, label: t.signature, action: () => onAddSignature && onAddSignature() },
        { id: 'link', icon: <LinkIcon size={18} />, label: t.link, action: () => onAddElement('link') },
      ]
    },
    {
      title: language === 'pt' ? 'Ferramentas' : 'Tools',
      items: [
        { id: 'pen', icon: <Eraser size={18} />, label: t.eraser, action: () => onTogglePen && onTogglePen(), highlight: penActive, description: t.eraserDesc },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800/50 flex flex-col z-40 shadow-[10px_0_30px_rgba(0,0,0,0.3)]">
      <div className="p-6 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-md">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.toolsTitle}</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar scroll-smooth">
        {toolGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-2">
            <h3 className="px-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-3 opacity-60">
              {group.title}
            </h3>
            <div className="space-y-1">
              {group.items.map((item: any, idx) => (
                <div key={item.id || idx}>
                  <button
                    onClick={item.action}
                    className={`w-full group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 border ${item.highlight
                      ? item.id === 'layout'
                        ? 'bg-gradient-to-br from-amber-500 to-orange-600 border-amber-400/30 text-white shadow-lg shadow-amber-600/30 scale-[1.05]'
                        : 'bg-gradient-to-br from-indigo-600 to-violet-700 border-indigo-400/30 text-white shadow-lg shadow-indigo-600/20 scale-[1.02]'
                      : 'bg-transparent border-transparent hover:bg-slate-900 text-slate-400 hover:text-slate-100'
                      }`}
                  >
                    <div className={`p-1.5 rounded-lg transition-all duration-200 ${item.highlight
                      ? item.id === 'layout' ? 'bg-white/20 text-white' : 'bg-white/10 text-white'
                      : 'bg-slate-900 border border-slate-800 text-slate-500 group-hover:text-white group-hover:border-slate-700'}`}>
                      {item.icon}
                    </div>
                    <div className="text-left flex-1">
                      <span className="block text-[13px] font-semibold tracking-tight">{item.label}</span>
                    </div>
                  </button>

                  {/* Pen Size Options */}
                  {item.id === 'pen' && penActive && (
                    <div className="mx-2 mt-2 p-2 bg-slate-900/50 border border-slate-800 rounded-xl flex justify-around items-center animate-in fade-in slide-in-from-top-2">
                      {[2, 6, 12].map((size) => (
                        <button
                          key={size}
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdatePenSize?.(size);
                          }}
                          className={`p-2 rounded-lg hover:bg-slate-800 transition-all ${penSize === size ? 'bg-indigo-600/20 ring-1 ring-indigo-500/50 scale-110' : ''}`}
                        >
                          <div
                            className="bg-slate-300 rounded-full"
                            style={{
                              width: size === 2 ? 4 : size === 6 ? 8 : 12,
                              height: size === 2 ? 4 : size === 6 ? 8 : 12,
                              opacity: penSize === size ? 1 : 0.5
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-slate-800/50 bg-slate-950/50 backdrop-blur-sm">
        <div className="px-3 py-2 bg-slate-900/30 rounded-lg border border-slate-800/50">
          <p className="text-[10px] text-slate-500 text-center leading-relaxed italic opacity-70">
            {t.dragNote}
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Toolbar;
