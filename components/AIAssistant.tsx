
import React, { useState } from 'react';
import { Sparkles, Send, BrainCircuit, RefreshCw, Wand2, CheckCircle2 } from 'lucide-react';
import { rewriteTextProfessionally, suggestLayoutImprovements } from '../services/geminiService';
import { EditorElement } from '../types';
import { Language, translations } from '../utils/i18n';

interface AIAssistantProps {
  language: Language;
  elements: EditorElement[];
  onApplyChange: (id: string, updates: Partial<EditorElement>) => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ language, elements, onApplyChange }) => {
  const t = translations[language];
  const [loading, setLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);

  const textElements = elements.filter(el => el.type === 'text');

  const handleRewrite = async () => {
    if (!selectedTextId) return;
    setLoading(true);
    const element = textElements.find(el => el.id === selectedTextId);
    if (element) {
      try {
        const rewritten = await rewriteTextProfessionally(element.content);
        if (rewritten) {
          onApplyChange(element.id, { content: rewritten });
        }
      } catch (err) {
        console.error(err);
      }
    }
    setLoading(false);
  };

  const handleAnalyzeLayout = async () => {
    setLoading(true);
    try {
      const summary = elements.map(e => e.content).join(' ').substring(0, 500);
      const suggestions = await suggestLayoutImprovements(summary);
      setAiSuggestions(suggestions);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <aside className="w-80 border-l bg-indigo-50/30 flex flex-col z-40 backdrop-blur-xl">
      <div className="flex items-center gap-2 border-b p-4 bg-indigo-600 text-white shadow-lg">
        <Sparkles size={18} />
        <h2 className="text-sm font-bold uppercase tracking-tight">{t.aiExpert}</h2>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Rewrite Section */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-indigo-100">
          <div className="flex items-center gap-2 mb-3">
            <Wand2 size={16} className="text-indigo-500" />
            <h3 className="text-xs font-bold text-gray-700">{t.professionalRewrite}</h3>
          </div>
          <select
            className="w-full bg-gray-50 border rounded p-2 text-xs mb-3 outline-none"
            value={selectedTextId || ''}
            onChange={(e) => setSelectedTextId(e.target.value)}
          >
            <option value="">{t.selectTextBlock}</option>
            {textElements.map(el => (
              <option key={el.id} value={el.id}>{el.content.substring(0, 30)}...</option>
            ))}
          </select>
          <button
            disabled={loading || !selectedTextId}
            onClick={handleRewrite}
            className="w-full py-2 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
          >
            {loading ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
            {t.optimizeText}
          </button>
        </div>

        {/* Layout Analysis Section */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-indigo-100">
          <div className="flex items-center gap-2 mb-3">
            <BrainCircuit size={16} className="text-indigo-500" />
            <h3 className="text-xs font-bold text-gray-700">{t.layoutAnalysis}</h3>
          </div>
          <p className="text-[11px] text-gray-500 mb-4">{t.layoutAnalysisDesc}</p>
          <button
            disabled={loading}
            onClick={handleAnalyzeLayout}
            className="w-full py-2 bg-white border border-indigo-600 text-indigo-600 text-xs font-medium rounded-lg hover:bg-indigo-50 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
          >
            {loading ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
            {t.analyzeDocument}
          </button>

          {aiSuggestions && (
            <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{t.designSuggestions}</h4>
                <ul className="space-y-2">
                  {aiSuggestions.suggestions.map((s: string, i: number) => (
                    <li key={i} className="text-[11px] text-gray-600 flex gap-2">
                      <span className="text-indigo-500 shrink-0">•</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{t.corporatePalette}</h4>
                <div className="flex gap-2">
                  {aiSuggestions.colorPalette.map((color: string, i: number) => (
                    <div key={i} className="group relative">
                      <div
                        className="w-6 h-6 rounded-full border border-gray-100"
                        style={{ backgroundColor: color }}
                      />
                      <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 hidden group-hover:block text-[8px] bg-gray-800 text-white p-1 rounded">
                        {color}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t.recommendedTypography}</h4>
                <p className="text-xs font-medium text-indigo-700">{aiSuggestions.fontPairing}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4">
        <div className="bg-indigo-600/10 rounded-lg p-3 text-[10px] text-indigo-700 border border-indigo-200">
          <strong>{t.expertTip}:</strong> {t.expertTipDesc}
        </div>
      </div>
    </aside>
  );
};

export default AIAssistant;
