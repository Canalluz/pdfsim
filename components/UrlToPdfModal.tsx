import React, { useState } from 'react';
import { Link as LinkIcon, X, Globe, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Language, translations } from '../utils/i18n';

interface UrlToPdfModalProps {
    language: Language;
    onConvert: (url: string) => Promise<void>;
    onClose: () => void;
}

const UrlToPdfModal: React.FC<UrlToPdfModalProps> = ({ language, onConvert, onClose }) => {
    const t = translations[language];
    const [url, setUrl] = useState('');
    const [isConverting, setIsConverting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleConvert = async () => {
        if (!url || !url.includes('.')) {
            setError(t.invalidUrl);
            return;
        }

        setIsConverting(true);
        setError(null);
        try {
            await onConvert(url);
            onClose();
        } catch (err: any) {
            setError(err.message || t.conversionError);
        } finally {
            setIsConverting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shadow-sm">
                            <Globe size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-lg">{t.urlToPdf}</h3>
                            <p className="text-[11px] text-slate-500 uppercase tracking-widest font-semibold">{t.urlToPdfDesc}</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:rotate-90 duration-300"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                            {t.enterUrl}
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <LinkIcon size={18} className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://exemplo.com"
                                className={`w-full pl-11 pr-4 py-4 bg-slate-50 border-2 rounded-2xl text-slate-900 placeholder:text-slate-400 outline-none transition-all ${
                                    error ? 'border-red-100 focus:border-red-500' : 'border-slate-100 focus:border-indigo-500 focus:bg-white shadow-sm'
                                }`}
                                onKeyDown={(e) => e.key === 'Enter' && handleConvert()}
                                disabled={isConverting}
                            />
                        </div>
                        {error && (
                            <div className="flex items-center gap-2 text-red-500 text-xs font-bold mt-2 ml-1 animate-in slide-in-from-top-1">
                                <AlertCircle size={14} />
                                {error}
                            </div>
                        )}
                    </div>

                    <div className="pt-2">
                        <button
                            onClick={handleConvert}
                            disabled={isConverting || !url}
                            className={`w-full group flex items-center justify-center gap-3 py-4 rounded-2xl text-sm font-bold transition-all shadow-lg ${
                                isConverting || !url
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200 active:scale-[0.98]'
                            }`}
                        >
                            {isConverting ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    {t.convertingSite}
                                </>
                            ) : (
                                <>
                                    {t.convert}
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>

                    <p className="text-center text-[10px] text-slate-400 leading-relaxed max-w-[240px] mx-auto">
                        Ao converter, as páginas serão geradas como fundo para que você possa adicionar anotações por cima.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UrlToPdfModal;
