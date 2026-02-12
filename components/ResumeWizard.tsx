import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles, User, Briefcase, GraduationCap, Award, CheckCircle2, Camera, Upload, Trash2 } from 'lucide-react';
import { EditorElement } from '../types';
import { Language, translations } from '../utils/i18n';

interface ResumeData {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    summary: string;
    photo?: string;
    experience: {
        id: string;
        title: string;
        company: string;
        period: string;
        description: string;
    }[];
    education: {
        id: string;
        degree: string;
        school: string;
        year: string;
    }[];
    skills: string[];
}

interface ResumeWizardProps {
    language: Language;
    onComplete: (data: ResumeData) => void;
    onClose: () => void;
}

const ResumeWizard: React.FC<ResumeWizardProps> = ({ language, onComplete, onClose }) => {
    const [step, setStep] = useState(1);
    const [data, setData] = useState<ResumeData>({
        fullName: '',
        email: '',
        phone: '',
        location: '',
        website: '',
        summary: '',
        photo: '',
        experience: [],
        education: [],
        skills: []
    });

    const t = translations[language];

    // Camera State
    const [showCamera, setShowCamera] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    // ... (keep startCamera and other functions same)

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            setStream(mediaStream);
            setShowCamera(true);
            // Wait for modal to render
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                    videoRef.current.play();
                }
            }, 100);
        } catch (err) {
            console.error("Camera access denied:", err);
            alert(language === 'pt' ? 'Não foi possível acessar a câmera. Verifique as permissões.' : language === 'es' ? 'No se pudo acceder a la cámara. Verifique los permisos.' : 'Could not access camera. Check permissions.');
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setShowCamera(false);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            if (context) {
                // Set canvas dimensions to match video
                canvasRef.current.width = videoRef.current.videoWidth;
                canvasRef.current.height = videoRef.current.videoHeight;

                // Draw video frame
                context.drawImage(videoRef.current, 0, 0);

                // Get data URL
                const photoUrl = canvasRef.current.toDataURL('image/png');
                setData(prev => ({ ...prev, photo: photoUrl }));
                stopCamera();
            }
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    setData(prev => ({ ...prev, photo: e.target.result as string }));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const [currentExp, setCurrentExp] = useState({ title: '', company: '', period: '', description: '' });
    const [currentEdu, setCurrentEdu] = useState({ degree: '', school: '', year: '' });
    const [currentSkill, setCurrentSkill] = useState('');

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);

    const addExperience = () => {
        if (currentExp.title && currentExp.company) {
            setData(prev => ({
                ...prev,
                experience: [...prev.experience, { ...currentExp, id: Date.now().toString() }]
            }));
            setCurrentExp({ title: '', company: '', period: '', description: '' });
        }
    };

    const addEducation = () => {
        if (currentEdu.degree && currentEdu.school) {
            setData(prev => ({
                ...prev,
                education: [...prev.education, { ...currentEdu, id: Date.now().toString() }]
            }));
            setCurrentEdu({ degree: '', school: '', year: '' });
        }
    };

    const addSkill = () => {
        if (currentSkill.trim()) {
            setData(prev => ({
                ...prev,
                skills: [...prev.skills, currentSkill.trim()]
            }));
            setCurrentSkill('');
        }
    };

    const steps = [
        { id: 1, title: t.stepPersonal, icon: <User size={20} /> },
        { id: 2, title: t.stepExp, icon: <Briefcase size={20} /> },
        { id: 3, title: t.stepEduSkills, icon: <GraduationCap size={20} /> },
        { id: 4, title: t.stepReview, icon: <Award size={20} /> },
    ];

    return (
        <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Sparkles className="text-yellow-300" />
                            {t.resumeGenerator}
                        </h2>
                        <p className="text-indigo-100 text-xs mt-1">
                            {language === 'pt' ? 'Sua carreira merece um design profissional.' : language === 'es' ? 'Tu carrera merece un diseño profesional.' : 'Your career deserves a professional design.'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Steps Indicator */}
                <div className="flex border-b">
                    {steps.map((s, idx) => (
                        <div
                            key={s.id}
                            className={`flex-1 p-3 flex items-center justify-center gap-2 text-sm font-medium border-b-2 transition-colors ${step === s.id
                                ? 'border-indigo-600 text-indigo-600 bg-indigo-50'
                                : step > s.id
                                    ? 'border-green-500 text-green-600'
                                    : 'border-transparent text-gray-400'
                                }`}
                        >
                            {s.icon}
                            <span className="hidden sm:inline">{s.title}</span>
                        </div>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-8 bg-gray-50">
                    {step === 1 && (
                        <div className="space-y-4 max-w-lg mx-auto animate-in slide-in-from-right-8 fade-in duration-300">
                            {/* Photo Section */}
                            <div className="flex items-center gap-4 mb-6 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                                <div className="relative shrink-0">
                                    {data.photo ? (
                                        <img src={data.photo} className="w-20 h-20 rounded-full object-cover border-2 border-indigo-500 shadow-sm" alt="Profile" />
                                    ) : (
                                        <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-400">
                                            <User size={32} />
                                        </div>
                                    )}
                                    {data.photo && (
                                        <button
                                            onClick={() => setData({ ...data, photo: '' })}
                                            className="absolute -top-1 -right-1 bg-red-500 text-white p-1 rounded-full shadow-sm hover:bg-red-600"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-bold text-gray-800 mb-1">{t.cameraPhoto}</h3>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={startCamera}
                                            className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded hover:bg-indigo-700 flex items-center gap-2"
                                        >
                                            <Camera size={14} /> {t.useCamera}
                                        </button>
                                        <label className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-bold rounded hover:bg-gray-50 flex items-center gap-2 cursor-pointer">
                                            <Upload size={14} /> {t.upload}
                                            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">{t.fullName}</label>
                                    <input
                                        value={data.fullName}
                                        onChange={e => setData({ ...data, fullName: e.target.value })}
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder={language === 'pt' ? 'Ex: João Silva' : language === 'es' ? 'Ej: Juan Pérez' : 'e.g., John Doe'}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">{t.email}</label>
                                    <input
                                        value={data.email}
                                        onChange={e => setData({ ...data, email: e.target.value })}
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="email@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">{t.phone}</label>
                                    <input
                                        value={data.phone}
                                        onChange={e => setData({ ...data, phone: e.target.value })}
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="+55 11 99999-9999"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">{t.location}</label>
                                    <input
                                        value={data.location}
                                        onChange={e => setData({ ...data, location: e.target.value })}
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder={language === 'pt' ? 'São Paulo, SP' : language === 'es' ? 'Madrid, España' : 'New York, NY'}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">{t.website}</label>
                                    <input
                                        value={data.website}
                                        onChange={e => setData({ ...data, website: e.target.value })}
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="linkedin.com/in/user"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">{t.summaryLabel}</label>
                                    <textarea
                                        value={data.summary}
                                        onChange={e => setData({ ...data, summary: e.target.value })}
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px]"
                                        placeholder={t.summaryPlaceholder}
                                    />
                                    <button className="text-xs text-indigo-600 font-bold mt-1 hover:underline flex items-center gap-1">
                                        <Sparkles size={12} /> {t.suggestAI}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 max-w-2xl mx-auto animate-in slide-in-from-right-8 fade-in duration-300">
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <h3 className="font-bold text-indigo-900 mb-4">{t.addExp}</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        value={currentExp.title}
                                        onChange={e => setCurrentExp({ ...currentExp, title: e.target.value })}
                                        className="p-2 border rounded text-sm" placeholder={t.jobTitle}
                                    />
                                    <input
                                        value={currentExp.company}
                                        onChange={e => setCurrentExp({ ...currentExp, company: e.target.value })}
                                        className="p-2 border rounded text-sm" placeholder={t.company}
                                    />
                                    <input
                                        value={currentExp.period}
                                        onChange={e => setCurrentExp({ ...currentExp, period: e.target.value })}
                                        className="p-2 border rounded text-sm" placeholder={t.period}
                                    />
                                    <div className="col-span-2">
                                        <textarea
                                            value={currentExp.description}
                                            onChange={e => setCurrentExp({ ...currentExp, description: e.target.value })}
                                            className="w-full p-2 border rounded text-sm min-h-[80px]"
                                            placeholder={t.description}
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={addExperience}
                                    disabled={!currentExp.title}
                                    className="mt-3 w-full py-2 bg-indigo-50 text-indigo-700 font-bold rounded hover:bg-indigo-100 transition-colors disabled:opacity-50"
                                >
                                    + {t.addExp}
                                </button>
                            </div>

                            <div className="space-y-3">
                                {data.experience.map((exp, idx) => (
                                    <div key={exp.id} className="bg-white p-3 rounded border border-gray-200 flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-gray-800">{exp.title}</h4>
                                            <p className="text-sm text-gray-600">{exp.company} | {exp.period}</p>
                                        </div>
                                        <button
                                            onClick={() => setData(prev => ({ ...prev, experience: prev.experience.filter(e => e.id !== exp.id) }))}
                                            className="text-red-400 hover:text-red-600"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                                {data.experience.length === 0 && (
                                    <p className="text-center text-gray-400 text-sm italic">{t.noExp}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 max-w-2xl mx-auto animate-in slide-in-from-right-8 fade-in duration-300">
                            {/* Education */}
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <h3 className="font-bold text-indigo-900 mb-4">{t.addEdu}</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    <input
                                        value={currentEdu.degree}
                                        onChange={e => setCurrentEdu({ ...currentEdu, degree: e.target.value })}
                                        className="p-2 border rounded text-sm col-span-1" placeholder={t.degree}
                                    />
                                    <input
                                        value={currentEdu.school}
                                        onChange={e => setCurrentEdu({ ...currentEdu, school: e.target.value })}
                                        className="p-2 border rounded text-sm col-span-1" placeholder={t.school}
                                    />
                                    <input
                                        value={currentEdu.year}
                                        onChange={e => setCurrentEdu({ ...currentEdu, year: e.target.value })}
                                        className="p-2 border rounded text-sm col-span-1" placeholder={t.year}
                                    />
                                </div>
                                <button
                                    onClick={addEducation}
                                    disabled={!currentEdu.degree}
                                    className="mt-3 w-full py-2 bg-indigo-50 text-indigo-700 font-bold rounded hover:bg-indigo-100 transition-colors disabled:opacity-50"
                                >
                                    + {t.addEdu}
                                </button>

                                <div className="mt-4 space-y-2">
                                    {data.education.map(edu => (
                                        <div key={edu.id} className="text-sm flex justify-between bg-gray-50 p-2 rounded">
                                            <span><strong>{edu.degree}</strong> - {edu.school}</span>
                                            <button onClick={() => setData(prev => ({ ...prev, education: prev.education.filter(e => e.id !== edu.id) }))} className="text-red-400"><X size={14} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Skills */}
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <h3 className="font-bold text-indigo-900 mb-4">{t.skillsLabel}</h3>
                                <div className="flex gap-2">
                                    <input
                                        value={currentSkill}
                                        onChange={e => setCurrentSkill(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && addSkill()}
                                        className="flex-1 p-2 border rounded text-sm"
                                        placeholder={t.skillsPlaceholder}
                                    />
                                    <button
                                        onClick={addSkill}
                                        className="px-4 bg-indigo-600 text-white rounded font-bold hover:bg-indigo-700"
                                    >
                                        +
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {data.skills.map((skill, idx) => (
                                        <span key={idx} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                            {skill}
                                            <button onClick={() => setData(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== idx) }))} className="hover:text-indigo-900"><X size={12} /></button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="text-center space-y-6 max-w-lg mx-auto animate-in slide-in-from-right-8 fade-in duration-300">
                            <div className="bg-green-50 text-green-700 p-6 rounded-xl border border-green-200">
                                <CheckCircle2 size={48} className="mx-auto mb-4 text-green-500" />
                                <h3 className="text-xl font-bold mb-2">{t.allReady}</h3>
                                <p className="text-sm">{t.successMsg}</p>
                            </div>

                            <div className="bg-white p-6 rounded-xl border border-gray-200 text-left space-y-2 text-sm shadow-sm">
                                <p><strong>{t.fullName}:</strong> {data.fullName || '(Vazio)'}</p>
                                <p><strong>{t.summaryLabel}:</strong> {data.summary ? 'Preenchido' : '(Vazio)'}</p>
                                <p><strong>{t.experience}:</strong> {data.experience.length} itens</p>
                                <p><strong>{t.education}:</strong> {data.education.length} itens</p>
                                <p><strong>{t.skillsLabel}:</strong> {data.skills.length} itens</p>
                            </div>

                            <p className="text-xs text-gray-500">Ao clicar em "{t.generateMagic}", os dados serão aplicados ao modelo selecionado.</p>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t bg-white flex justify-between">
                    {step > 1 ? (
                        <button onClick={handleBack} className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg flex items-center gap-2">
                            <ChevronLeft size={16} /> {t.back}
                        </button>
                    ) : (
                        <div />
                    )}

                    {step < 4 ? (
                        <button onClick={handleNext} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                            {t.next} <ChevronRight size={16} />
                        </button>
                    ) : (
                        <button
                            onClick={() => onComplete(data)}
                            className="px-8 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 shadow-lg shadow-green-200 flex items-center gap-2"
                        >
                            <Sparkles size={16} />
                            {t.generateMagic}
                        </button>
                    )}
                </div>
            </div>

            {/* Camera Overlay Modal */}
            {showCamera && (
                <div className="fixed inset-0 z-[80] bg-black bg-opacity-90 flex flex-col items-center justify-center">
                    <div className="relative w-full max-w-lg bg-black rounded-lg overflow-hidden border border-gray-800">
                        <video ref={videoRef} className="w-full h-auto" autoPlay playsInline muted />
                        <canvas ref={canvasRef} className="hidden" />

                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                            <button
                                onClick={stopCamera}
                                className="px-6 py-2 bg-gray-600 text-white rounded-full font-bold hover:bg-gray-700"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={capturePhoto}
                                className="px-6 py-2 bg-white text-black rounded-full font-bold hover:bg-gray-100 flex items-center gap-2"
                            >
                                <Camera size={18} />
                                Capturar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResumeWizard;
