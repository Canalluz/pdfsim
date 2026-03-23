import React, { useState, useRef } from 'react';
import { FileCode, X, Upload, ArrowRight, Loader2, AlertCircle, FileCheck } from 'lucide-react';
import { Language, translations } from '../utils/i18n';

interface HtmlToPdfModalProps {
    language: Language;
    onConvert: (file: File) => Promise<void>;
    onClose: () => void;
}

const HtmlToPdfModal: React.FC<HtmlToPdfModalProps> = ({ language, onConvert, onClose }) => {
    const t = translations[language];
    const [file, setFile] = useState<File | null>(null);
    const [isConverting, setIsConverting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.name.endsWith('.html') || selectedFile.type === 'text/html') {
                setFile(selectedFile);
                setError(null);
            } else {
                setError(t.invalidHtml);
                setFile(null);
            }
        }
    };

    const handleConvert = async () => {
        if (!file) {
            setError(t.invalidHtml);
            return;
        }

        setIsConverting(true);
        setError(null);
        try {
            await onConvert(file);
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
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl shadow-sm">
                            <FileCode size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-lg">{t.htmlToPdf}</h3>
                            <p className="text-[11px] text-slate-500 uppercase tracking-widest font-semibold">{t.htmlToPdfDesc}</p>
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
                    <div className="space-y-4">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                            {t.selectHtml}
                        </label>
                        
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className={`relative group cursor-pointer border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center gap-4 transition-all ${
                                file 
                                ? 'bg-green-50/50 border-green-200' 
                                : 'bg-slate-50 border-slate-200 hover:border-orange-300 hover:bg-orange-50/30'
                            }`}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept=".html,text/html"
                                className="hidden"
                                disabled={isConverting}
                            />
                            
                            <div className={`p-4 rounded-2xl shadow-sm transition-transform group-hover:scale-110 ${
                                file ? 'bg-green-100 text-green-600' : 'bg-white text-slate-400'
                            }`}>
                                {file ? <FileCheck size={32} /> : <Upload size={32} />}
                            </div>
                            
                            <div className="text-center">
                                <span className={`block font-bold text-sm ${file ? 'text-green-700' : 'text-slate-600'}`}>
                                    {file ? file.name : t.clickToSearch}
                                </span>
                                {!file && (
                                    <span className="text-[10px] text-slate-400 font-medium">
                                        HTML, HTM (Max 10MB)
                                    </span>
                                )}
                            </div>
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
                            disabled={isConverting || !file}
                            className={`w-full group flex items-center justify-center gap-3 py-4 rounded-2xl text-sm font-bold transition-all shadow-lg ${
                                isConverting || !file
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                                    : 'bg-orange-600 text-white hover:bg-orange-700 hover:shadow-orange-200 active:scale-[0.98]'
                            }`}
                        >
                            {isConverting ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    {t.convertingSite}
                                </>
                            ) : (
                                <>
                                    {t.convertHtml}
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>

                    <p className="text-center text-[10px] text-slate-400 leading-relaxed max-w-[240px] mx-auto">
                        O arquivo HTML será renderizado como um PDF estático para que você possa editá-lo.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default HtmlToPdfModal;
