
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
  onAddSignature,
  onAddPage,
  penSize = 2,
  onUpdatePenSize
}) => {
  const t = translations[language];

  const tools = [
    { id: 'select', icon: <MousePointer2 size={20} />, label: t.select, action: () => { }, active: true },
    { id: 'layout', icon: <Layout size={20} />, label: t.resumeTemplates, action: () => onOpenTemplates && onOpenTemplates(), highlight: true },
    { separator: true },
    { id: 'text', icon: <Type size={20} />, label: t.addText, action: () => onAddElement('text') },
    { id: 'pen', icon: <Eraser size={20} />, label: t.eraser, action: () => onTogglePen && onTogglePen(), highlight: penActive, description: t.eraserDesc },
    // Eraser removed
    { separator: true },
    { id: 'image', icon: <ImageIcon size={20} />, label: t.insertImage, action: () => onAddImage ? onAddImage() : onAddElement('image') },
    { id: 'pdf', icon: <FileText size={20} />, label: t.insertPdf, action: () => onAddPdf ? onAddPdf() : {} },
    { id: 'camera', icon: <Camera size={20} />, label: t.cameraPhotoTool, action: () => onAddCamera ? onAddCamera() : {} },
    { id: 'signature', icon: <PenTool size={20} />, label: t.signature, action: () => onAddSignature && onAddSignature() },
    { separator: true },
    { id: 'shape', icon: <Square size={20} />, label: t.shapes, action: () => onToggleShapes && onToggleShapes(), highlight: shapesActive, description: t.shapesDesc },
    { id: 'table', icon: <Table size={20} />, label: t.table, action: () => onToggleTable && onToggleTable(), highlight: tableActive, description: t.tableDesc },
    { id: 'link', icon: <LinkIcon size={20} />, label: t.link, action: () => onAddElement('link') },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-40 shadow-2xl">
      <div className="p-4 border-b border-slate-800 bg-slate-900">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.toolsTitle}</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
        {tools.map((tool, idx) => {
          if (tool.separator) {
            return <div key={`sep-${idx}`} className="h-px bg-slate-800 my-2" />;
          }

          return (
            <div key={tool.id || idx}>
              <button
                onClick={tool.action}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all border ${tool.highlight
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 border-transparent text-white shadow-lg shadow-indigo-500/20'
                  : 'bg-transparent border-transparent hover:bg-slate-800 text-slate-300 hover:text-white'
                  }`}
              >
                <div className={`p-2 rounded-md transition-colors ${tool.highlight ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400 group-hover:text-white'}`}>
                  {tool.icon}
                </div>
                <div className="text-left flex-1">
                  <span className="block text-sm font-semibold tracking-wide">{tool.label}</span>
                  {tool.description && <span className="block text-xs text-slate-500 mt-0.5">{tool.description}</span>}
                </div>
              </button>

              {/* Pen Size Options - Only show when pen is active and it is the pen tool */}
              {tool.id === 'pen' && penActive && (
                <div className="mx-4 mt-2 p-2 bg-slate-800 rounded-lg border border-slate-700 flex justify-between items-center animate-in fade-in slide-in-from-top-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdatePenSize?.(2);
                    }}
                    className={`p-2 rounded hover:bg-slate-700 transition-colors ${penSize === 2 ? 'bg-indigo-600 ring-2 ring-indigo-400' : ''}`}
                    title={language === 'pt' ? 'Fino' : 'Small'}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdatePenSize?.(6);
                    }}
                    className={`p-2 rounded hover:bg-slate-700 transition-colors ${penSize === 6 ? 'bg-indigo-600 ring-2 ring-indigo-400' : ''}`}
                    title={language === 'pt' ? 'Médio' : 'Medium'}
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdatePenSize?.(12);
                    }}
                    className={`p-2 rounded hover:bg-slate-700 transition-colors ${penSize === 12 ? 'bg-indigo-600 ring-2 ring-indigo-400' : ''}`}
                    title={language === 'pt' ? 'Grosso' : 'Large'}
                  >
                    <div className="w-4 h-4 rounded-full bg-white" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="text-xs text-slate-500 text-center font-medium">
          {t.dragNote}
        </div>
      </div>
    </aside>
  );
};

export default Toolbar;
