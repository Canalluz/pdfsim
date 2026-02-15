import { EditorElement } from '../types';
import { translations, Language } from '../utils/i18n';

export interface Template {
    id: string;
    name: string;
    category: 'classic' | 'modern' | 'creative' | 'minimalist' | 'champion';
    thumbnail: string;
    elements: EditorElement[];
}

const createText = (id: string, content: string, x: number, y: number, fontSize: number = 10, fontWeight: string = 'normal', color: string = '#333333', width: number = 200, textAlign: string = 'left', isBackground: boolean = false): EditorElement => {
    const lineCount = content.split('\n').length;
    return {
        id,
        type: 'text',
        x,
        y,
        width,
        height: (fontSize * 1.4 * lineCount) + 8,
        content,
        isBackground,
        locked: false, // Background elements should still be editable
        style: {
            fontSize,
            fontWeight: fontWeight as any,
            color,
            fontFamily: '"Inter", "Arial", sans-serif',
            textAlign: textAlign as any,
            opacity: 1,
            lineHeight: 1.4,
        }
    };
};

const createShape = (id: string, x: number, y: number, width: number, height: number, color: string): EditorElement => ({
    id, type: 'shape', x, y, width, height, content: '',
    style: { backgroundColor: color, borderWidth: 0, opacity: 1 }
});

export const getTemplates = (lang: Language = 'pt'): Template[] => {
    const t = translations[lang];

    return [
        // Campeão Templates
        {
            id: 'champion-classic-elegant',
            name: lang === 'pt' ? 'Design Clássico Elegante' : lang === 'es' ? 'Diseño Clásico Elegante' : 'Elegant Classic Design',
            category: 'champion',
            thumbnail: '',
            elements: [
                // Header Background
                { id: 'header-bg', type: 'shape', x: 0, y: 0, width: 595, height: 120, content: '', isBackground: true, locked: true, style: { backgroundColor: '#2c3e50', borderWidth: 0, opacity: 1 } },

                // Interactive Professional Photo (Replaced shapes)
                {
                    id: 'photo-section',
                    type: 'smart-element',
                    x: 450, y: 20,
                    width: 120, height: 150,
                    content: 'ProfessionalPhoto',
                    componentData: {
                        templateId: 'champion-classic-elegant',
                        userImage: '',
                        photoConfig: { size: 'cover' }
                    },
                    style: { opacity: 1, background: '#eeeeee', borderRadius: 0 }
                },

                // Name & Title
                createText('name', t.exampleName, 40, 40, 28, 'bold', '#2c3e50', 400, 'left', true),
                createText('role', t.exampleRole, 40, 80, 14, 'normal', '#2c3e50', 400, 'left', true),

                // Contact Info (Below Header)
                createText('contact', `📞 (11) 93456-7890  |  📧 ${t.email.toLowerCase()}@email.com  |  🔗 linkedin.com/in/example  |  📍 São Paulo, SP`, 40, 130, 9, 'normal', '#2c3e50', 515, 'center'),
                createShape('header-line', 40, 150, 515, 2, '#2c3e50'),

                // Summary
                createText('summary-h', t.summaryHeader, 40, 170, 12, 'bold', '#1a5276', 515), // Accent
                createText('summary', t.exampleSummary, 40, 190, 10, 'normal', '#333333', 515),

                // Columns Layout
                // Left Column (narrower) ~ 180px
                // Right Column (wider) ~ 315px
                // Gap ~ 20px

                // Left Column Content
                // Competencies
                createText('skills-h', t.skillsHeader, 40, 240, 12, 'bold', '#1a5276', 180),
                createShape('skills-line', 40, 255, 180, 1, '#7f8c8d'), // Secondary

                createText('skill-cat1', lang === 'pt' ? 'Liderança Estratégica' : lang === 'es' ? 'Liderazgo Estratégico' : 'Strategic Leadership', 40, 265, 10, 'bold', '#2c3e50', 180),
                createText('skill-list1', lang === 'pt' ? '• Governança Corporativa\n• Fusões & Aquisições\n• Relacionamento com Investidores\n• Gestão de Riscos' : lang === 'es' ? '• Gobernanza Corporativa\n• Fusiones y Adquisiciones\n• Relación con Inversores\n• Gestión de Riesgos' : '• Corporate Governance\n• Mergers & Acquisitions\n• Investor Relations\n• Risk Management', 40, 280, 9, 'normal', '#333333', 180),

                createText('skill-cat2', lang === 'pt' ? 'Tecnologia & Análise' : lang === 'es' ? 'Tecnología y Análisis' : 'Technology & Analytics', 40, 360, 10, 'bold', '#2c3e50', 180),
                createText('skill-list2', '• PHP/Laravel\n• React/Next.js\n• SQL/NoSQL\n• Docker/Cloud', 40, 375, 9, 'normal', '#333333', 180),

                // Certifications
                createText('cert-h', t.certificationsHeader, 40, 460, 12, 'bold', '#1a5276', 180),
                createShape('cert-line', 40, 475, 180, 1, '#7f8c8d'),
                createText('cert-list', '• AWS Certified Solutions Architect\n• Google Professional Cloud Architect', 40, 485, 9, 'normal', '#333333', 180),

                // Languages
                createText('lang-h', t.languagesHeader, 40, 560, 12, 'bold', '#1a5276', 180),
                createShape('lang-line', 40, 575, 180, 1, '#7f8c8d'),
                createText('lang-list', lang === 'pt' ? '• Português (Nativo)\n• Inglês (Fluente)\n• Espanhol (Avançado)' : lang === 'es' ? '• Portugués (Nativo)\n• Inglés (Fluente)\n• Español (Avanzado)' : '• Portuguese (Native)\n• English (Fluent)\n• Spanish (Advanced)', 40, 585, 9, 'normal', '#333333', 180),

                // Right Column Content
                // Experience
                createText('exp-h', t.experienceHeader, 240, 240, 12, 'bold', '#1a5276', 315),
                createShape('exp-line', 240, 255, 315, 1, '#7f8c8d'),

                // Job 1
                createText('job1-role', t.exampleRole, 240, 265, 11, 'bold', '#2c3e50', 315),
                createText('job1-comp', `${t.exampleCompany} | ${t.examplePeriod}`, 240, 280, 10, 'italic', '#555555', 315),
                createText('job1-desc', t.exampleDescription, 240, 300, 10, 'normal', '#333333', 315),

                // Job 2
                createText('job2-role', 'Gerente Financeiro Sênior', 240, 380, 11, 'bold', '#2c3e50', 315),
                createText('job2-comp', 'Multinacional Consumidor Ltda. | 2014 - 2018', 240, 395, 10, 'italic', '#555555', 315),
                createText('job2-desc', '• Gerenciou orçamento anual de R$ 300M.\n• Coordenou due diligence para aquisição de 3 empresas.\n• Liderou migração para plataforma SAP S/4HANA.', 240, 415, 10, 'normal', '#333333', 315),

                // Education
                createText('edu-h', t.educationHeader, 240, 540, 12, 'bold', '#1a5276', 315),
                createShape('edu-line', 240, 555, 315, 1, '#7f8c8d'),

                createText('edu1-title', t.exampleDegree, 240, 565, 11, 'bold', '#2c3e50', 315),
                createText('edu1-school', `${t.exampleSchool} | ${t.exampleYear}`, 240, 580, 10, 'normal', '#555555', 315),

                createText('edu2-title', 'Bacharelado em Ciências Contábeis', 240, 600, 11, 'bold', '#2c3e50', 315),
                createText('edu2-school', 'Universidade de São Paulo (USP) | 2010', 240, 615, 10, 'normal', '#555555', 315),
            ].map(el => ({ ...el, style: { ...el.style, fontFamily: (el.style as any).fontFamily || '"Calibri", "Cambria", serif' } } as EditorElement))
        },
        {
            id: 'champion-creative-modern',
            name: lang === 'pt' ? 'Design Criativo Moderno' : lang === 'es' ? 'Diseño Creativo Moderno' : 'Modern Creative Design',
            category: 'champion',
            thumbnail: '',
            elements: [
                // Modern Header with Color
                {
                    id: 'header-bg', type: 'shape', x: 0, y: 0, width: 595, height: 180, content: '',
                    isBackground: true, locked: true,
                    style: { backgroundColor: '#6a11cb', borderWidth: 0, opacity: 1, background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)' }
                },
                // Overlay gradient simulation isn't possible, using solid color

                // Circular Photo Placeholder (Simulated with shape and overlay)
                // Circular Photo Placeholder
                // Interactive Professional Photo
                {
                    id: 'photo-section',
                    type: 'smart-element',
                    x: 40, y: 20,
                    width: 140, height: 140,
                    locked: true,
                    content: 'ProfessionalPhoto',
                    componentData: {
                        templateId: 'champion-creative-modern',
                        userImage: '',
                        photoConfig: { size: 'cover' }
                    },
                    style: { opacity: 1, background: 'transparent' }
                },

                // Header Info
                createText('name', t.exampleName, 200, 50, 32, 'bold', '#ffffff', 350, 'left', true),
                createText('role', t.exampleRole, 200, 90, 14, 'normal', '#e0e1dd', 350, 'left', true),
                createText('tagline', lang === 'pt' ? '"Transformo ideias em experiências visuais memoráveis"' : lang === 'es' ? '"Transformo ideas en experiencias visuales memorables"' : '"Transforming ideas into memorable visual experiences"', 200, 115, 12, 'italic', '#ffffff', 350, 'left', true),

                // Content Main
                // About
                createText('about-h', t.aboutMeHeader, 40, 210, 14, 'bold', '#6a11cb', 515),
                createShape('about-line', 40, 230, 50, 3, '#ff7e5f'), // Accent
                createText('about', t.exampleSummary, 40, 245, 11, 'normal', '#333333', 515),

                // Contact Strip (Below header/about)
                createShape('contact-bg', 0, 300, 595, 40, '#f3f4f6'),
                createText('contact', `📱 (21) 98765-4321  •  ✉️ ${t.email.toLowerCase()}@example.com  •  🌐 portfolio.com`, 0, 312, 10, 'bold', '#2575fc', 595, 'center'),

                // Experience
                createText('exp-h', lang === 'pt' ? 'EXPERIÊNCIA DE DESTAQUE' : lang === 'es' ? 'EXPERIENCIA DESTACADA' : 'FEATURED EXPERIENCE', 40, 360, 14, 'bold', '#6a11cb', 515),
                createShape('exp-line', 40, 380, 50, 3, '#ff7e5f'),

                createText('job1-role', t.exampleRole, 40, 400, 12, 'bold', '#333333', 515),
                createText('job1-comp', `${t.exampleCompany} | ${t.examplePeriod}`, 40, 418, 11, 'italic', '#666666', 515),
                createText('job1-desc', t.exampleDescription, 40, 440, 11, 'normal', '#444444', 515),

                // Education (Added)
                createText('edu-h', t.educationHeader, 40, 520, 14, 'bold', '#6a11cb', 515),
                createShape('edu-line', 40, 540, 50, 3, '#ff7e5f'),
                createText('edu1', `${t.exampleDegree} - ${t.exampleSchool} | ${t.exampleYear}`, 40, 560, 11, 'normal', '#333333', 515),

                // Skills Grid equivalent (using text columns)
                createText('skills-h', lang === 'pt' ? 'HABILIDADES TÉCNICAS' : lang === 'es' ? 'HABILIDADES TÉCNICAS' : 'TECHNICAL SKILLS', 40, 620, 14, 'bold', '#6a11cb', 515),
                createShape('skills-line', 40, 640, 50, 3, '#ff7e5f'),

                createText('skill-col1', `DESIGN\n\n• UI/UX Design\n• Identidade Visual\n• Motion Graphics`, 40, 660, 10, 'normal', '#333333', 150),
                createText('skill-col2', `FERRAMENTAS\n\n• Figma (Expert)\n• Adobe Suite\n• Blender 3D`, 200, 660, 10, 'normal', '#333333', 150),
                createText('skill-col3', lang === 'pt' ? 'BUSINESS\n\n• Gestão de Projetos\n• Apresentação\n• Orçamentação' : lang === 'es' ? 'BUSINESS\n\n• Gestión de Proyectos\n• Presentación\n• Presupuestos' : 'BUSINESS\n\n• Project Management\n• Presentation\n• Budgeting', 360, 660, 10, 'normal', '#333333', 150),

                // Awards
                createText('awards-h', t.awardsHeader, 40, 750, 14, 'bold', '#6a11cb', 515),
                createShape('awards-line', 40, 770, 50, 3, '#ff7e5f'),
                createText('awards', '🏆 Cannes Lions 2022 - Design\n🏆 Brazil Design Award 2021 - Branding', 40, 790, 11, 'normal', '#333333', 515),
            ].map(el => ({ ...el, style: { ...el.style, fontFamily: (el.style as any).fontFamily || '"Montserrat", "Open Sans", sans-serif' } } as EditorElement))
        },
        {
            id: 'champion-minimalist-tech',
            name: lang === 'pt' ? 'Design Minimalista Tech' : lang === 'es' ? 'Diseño Minimalista Tech' : 'Tech Minimalist Design',
            category: 'champion',
            thumbnail: '',
            elements: [
                // Sidebar Layout
                { id: 'sidebar-style', type: 'shape', x: 0, y: 0, width: 180, height: 842, content: '', isBackground: true, locked: true, style: { background: '#1e3a8a', opacity: 1 } },

                // Interactive Professional Photo
                {
                    id: 'photo-section',
                    type: 'smart-element',
                    x: 20, y: 30,
                    width: 140, height: 140,
                    locked: true,
                    content: 'ProfessionalPhoto',
                    componentData: {
                        templateId: 'champion-minimalist-tech',
                        userImage: '',
                        photoConfig: { size: 'cover' }
                    },
                    style: { opacity: 1, background: 'transparent' }
                },

                // Sidebar Content
                createText('contact-h', t.contactHeader, 20, 210, 12, 'bold', '#ffffff', 140),
                createText('contact', `📧 ${t.email.toLowerCase()}@tech.com\n📱 (31) 91234-5678\n🌐 github.com/user`, 20, 230, 9, 'normal', '#e2e8f0', 140),

                createText('stack-h', t.techStackHeader, 20, 340, 12, 'bold', '#ffffff', 140),
                createText('stack', 'LANGUAGES\n• TypeScript, Python, Go\n\nFRAMEWORKS\n• React, Node.js, FastAPI\n\nCLOUD / OPS\n• AWS, Docker, K8s\n\nDATABASES\n• Postgres, Mongo, Redis', 20, 360, 9, 'normal', '#e2e8f0', 140),

                createText('lang-h', t.languagesHeader, 20, 600, 12, 'bold', '#ffffff', 140),
                createText('lang', lang === 'pt' ? '• Português (Nativo)\n• Inglês (Fluente)' : lang === 'es' ? '• Portugués (Nativo)\n• Inglés (Fluente)' : '• Portuguese (Native)\n• English (Fluent)', 20, 620, 9, 'normal', '#e2e8f0', 140),

                // Main Content
                createText('name', t.exampleName, 210, 50, 30, 'bold', '#0d1b2a', 350, 'left', true),
                createText('role', t.exampleRole, 210, 90, 12, 'bold', '#415a77', 350, 'left', true),
                createText('tagline', lang === 'pt' ? '> Arquitetando sistemas escaláveis' : lang === 'es' ? '> Arquitectando sistemas escalables' : '> Architecting scalable systems', 210, 110, 10, 'italic', '#778da9', 350, 'left', true),

                createShape('sep-1', 210, 130, 350, 1, '#e0e1dd'),

                createText('summary', t.exampleSummary, 210, 150, 10, 'normal', '#333333', 350),

                createText('exp-h', t.experienceHeader, 210, 200, 14, 'bold', '#0d1b2a', 350),
                createShape('exp-sep', 210, 220, 50, 3, '#415a77'),

                // Job 1
                createText('job1-role', t.exampleRole, 210, 240, 12, 'bold', '#0d1b2a', 250),
                createText('job1-date', t.examplePeriod, 460, 240, 10, 'bold', '#415a77', 100, 'right'),
                createText('job1-comp', t.exampleCompany, 210, 255, 11, 'italic', '#555555', 350),
                createText('job1-desc', t.exampleDescription, 210, 275, 10, 'normal', '#333333', 350),

                // Job 2
                createText('job2-role', 'Desenvolvedor Full-Stack', 210, 350, 12, 'bold', '#0d1b2a', 250),
                createText('job2-date', '2018 - 2021', 460, 350, 10, 'bold', '#415a77', 100, 'right'),
                createText('job2-comp', 'Startup Ágil', 210, 365, 11, 'italic', '#555555', 350),
                createText('job2-desc', '• Desenvolveu MVP para seed funding (R$ 5M).\n• Criou cache distribuído (custos DB -40%).\n• Mentorou 3 devs juniores.', 210, 385, 10, 'normal', '#333333', 350),

                createText('proj-h', 'PROJETOS OPEN SOURCE', 210, 450, 14, 'bold', '#0d1b2a', 350),
                createShape('proj-sep', 210, 470, 50, 3, '#415a77'),
                createText('proj1', 'Analytics Lib (1.2k stars)', 210, 490, 11, 'bold', '#0d1b2a', 350),
                createText('proj1-desc', 'Biblioteca de análise de dados open-source high-performance.', 210, 505, 10, 'normal', '#333333', 350),

                // Education (Added)
                createText('edu-h', 'FORMAÇÃO ACADÊMICA', 210, 560, 14, 'bold', '#0d1b2a', 350),
                createShape('edu-sep', 210, 580, 50, 3, '#415a77'),
                createText('edu1', 'Ciência da Computação - UFMG | 2017', 210, 600, 11, 'normal', '#333333', 350),

            ].map(el => ({ ...el, style: { ...el.style, fontFamily: (el.style as any).fontFamily || '"SF Mono", "Roboto Mono", monospace' } } as EditorElement))
        },
        {
            id: 'champion-academic',
            name: lang === 'pt' ? 'Design Academia/Pesquisa' : lang === 'es' ? 'Diseño Academia/Investigación' : 'Academic/Research Design',
            category: 'champion',
            thumbnail: '',
            elements: [
                { id: 'top-bar', type: 'shape', x: 0, y: 0, width: 595, height: 15, content: '', isBackground: true, locked: true, style: { backgroundColor: '#1a237e', borderWidth: 0, opacity: 1 } },

                // Name & Title
                createText('name', t.exampleName, 40, 50, 24, 'bold', '#1a237e', 400, 'left', true),
                createText('creds', 'PhD, MSc, MBA', 40, 80, 12, 'bold', '#283593', 400, 'left', true),
                createText('role', t.exampleRole, 40, 95, 12, 'normal', '#333333', 400, 'left', true),
                createText('inst', t.exampleSchool, 40, 110, 11, 'italic', '#555555', 400),

                // Contact Details
                createText('contact', `${t.contactHeader}\nE-mail: ${t.email.toLowerCase()}@example.edu\n📍 São Paulo, SP`, 40, 135, 10, 'normal', '#333333', 400),

                createShape('sep-1', 40, 200, 515, 1, '#1a237e'),

                // Quote
                createText('quote', lang === 'pt' ? '"A ciência avança com novas perguntas."' : lang === 'es' ? '"La ciencia avanza con nuevas preguntas."' : '"Science advances with new questions."', 40, 215, 11, 'italic', '#283593', 515, 'center'),

                // Research Focus
                createText('res-h', t.researchFocusHeader, 40, 250, 12, 'bold', '#1a237e', 515),
                createText('res-list', '• Nanocarreadores\n• Biotecnologia\n• Métodos alternativos', 40, 270, 10, 'normal', '#333333', 515),

                // Education
                createText('edu-h', t.educationHeader, 40, 330, 12, 'bold', '#1a237e', 515),
                createText('edu1', `2018 - PhD ${lang === 'pt' ? 'em Biotecnologia' : lang === 'es' ? 'en Biotecnología' : 'in Biotechnology'}`, 40, 350, 11, 'bold', '#000000', 515),
                createText('edu1-inst', t.exampleSchool, 40, 365, 10, 'normal', '#333333', 515),

                // Publications
                createText('pub-h', t.publicationsHeader, 40, 460, 12, 'bold', '#1a237e', 515),
                createText('pub1', '• Nature Nanotechnology, 2022\n• Science Advances, 2021', 40, 480, 10, 'normal', '#333333', 515),

                // Grants & Awards
                createText('grant-h', t.grantsHeader, 40, 580, 12, 'bold', '#1a237e', 515),
                createText('grant-list', '• CNPq (2020-2024)\n• FAPESP', 40, 600, 10, 'normal', '#333333', 515),
            ].map(el => ({ ...el, style: { ...el.style, fontFamily: (el.style as any).fontFamily || '"Times New Roman", "Garamond", serif', lineHeight: 1.8 } } as EditorElement))
        },
        {
            id: 'champion-strategist',
            name: lang === 'pt' ? 'O Estrategista (Alta Conversão)' : lang === 'es' ? 'El Estratega (Alta Conversión)' : 'The Strategist (High Conversion)',
            category: 'champion',
            thumbnail: '',
            elements: [
                { id: 'header-bg', type: 'shape', x: 0, y: 0, width: 595, height: 110, content: '', isBackground: true, locked: true, style: { backgroundColor: '#0B3B5C', borderRadius: 0, opacity: 1 } },
                { id: 'header-accent', type: 'shape', x: 0, y: 110, width: 595, height: 5, content: '', isBackground: true, locked: true, style: { backgroundColor: '#F4B400', borderRadius: 0, opacity: 1 } },

                createText('name', t.exampleName, 40, 35, 28, 'bold', '#ffffff', 400, 'left', true),
                createText('role', t.exampleRole, 40, 70, 14, 'bold', '#F4B400', 400, 'left', true),

                // Contact
                createText('contact-h', t.contactHeader, 40, 125, 10, 'bold', '#1E5A7A', 250),
                createText('contact', `📧 ${t.email.toLowerCase()}@example.com\n📱 (11) 99876-5432\n📍 São Paulo, SP`, 40, 150, 10, 'normal', '#333333', 250),

                // Keywords
                {
                    id: 'keywords-section',
                    type: 'smart-element',
                    x: 300, y: 120, width: 255, height: 120,
                    content: 'ResumeSection',
                    componentData: {
                        templateId: 'champion-strategist',
                        section: {
                            type: 'keywords_list',
                            title: t.keywordsHeader,
                            user_input: ['KPIs', 'SAP', 'Six Sigma', 'Leadership']
                        }
                    },
                    style: { opacity: 1, backgroundColor: 'transparent' }
                },

                // Summary
                createText('summary-h', lang === 'pt' ? 'RESUMO ESTRATÉGICO' : lang === 'es' ? 'RESUMEN ESTRATÉGICO' : 'STRATEGIC SUMMARY', 40, 250, 12, 'bold', '#0B3B5C', 515),
                { id: 'summary-line', type: 'shape', x: 40, y: 265, width: 515, height: 2, content: '', style: { backgroundColor: '#F4B400', borderRadius: 0 } },
                createText('summary', t.exampleSummary, 40, 275, 11, 'normal', '#333333', 515),

                // Experience (STAR)
                {
                    id: 'star-experience',
                    type: 'smart-element',
                    x: 40, y: 330, width: 515, height: 400,
                    content: 'ResumeSection',
                    componentData: {
                        templateId: 'champion-strategist',
                        section: {
                            type: 'star_experience',
                            title: t.starExperienceHeader,
                            items: [
                                {
                                    position: t.exampleRole,
                                    company: t.exampleCompany,
                                    period: t.examplePeriod,
                                    achievements: [
                                        { star_situation: 'Challenge: Fleet costs 25% above market.', star_action: 'Action: Renegotiated contracts.', star_result: 'Result: Saved $1.2M.' }
                                    ]
                                }
                            ]
                        }
                    },
                    style: { opacity: 1, backgroundColor: 'transparent' }
                },

                // Education
                createText('edu-h', t.educationHeader, 40, 750, 12, 'bold', '#0B3B5C', 515),
                { id: 'edu-line', type: 'shape', x: 40, y: 765, width: 515, height: 1, content: '', style: { backgroundColor: '#1E5A7A', borderRadius: 0 } },
                createText('edu', `• ${t.exampleDegree} - ${t.exampleSchool}`, 40, 775, 11, 'normal', '#333333', 515),
            ].map(el => ({ ...el, style: { ...el.style, fontFamily: (el.style as any).fontFamily || '"Lato", "Arial", sans-serif' } } as EditorElement))
        },
        {
            id: 'champion-green-modern',
            name: lang === 'pt' ? 'Profissional Moderno (Verde)' : lang === 'es' ? 'Profesional Moderno (Verde)' : 'Modern Professional (Green)',
            category: 'champion',
            thumbnail: '',
            elements: [
                {
                    id: 'sidebar-bg', type: 'shape', x: 0, y: 0, width: 280, height: 842, content: '',
                    isBackground: true, locked: true,
                    style: { background: 'linear-gradient(180deg, #0f9d58 0%, #0b7a44 100%)', borderRadius: 0, opacity: 1 }
                },
                { id: 'sidebar-accent', type: 'shape', x: 275, y: 0, width: 5, height: 842, content: '', isBackground: true, locked: true, style: { backgroundColor: '#ff9800', borderRadius: 0, opacity: 1 } },

                createText('name', t.exampleName, 30, 50, 26, 'bold', '#ffffff', 220),
                createText('role', t.exampleRole, 30, 180, 11, 'normal', '#ffffff', 220),

                // Info
                createText('info', `📍 São Paulo – SP\n📞 (11) 91234-5678\n✉️ ${t.email.toLowerCase()}@example.com`, 30, 220, 10, 'normal', '#ffffff', 220),

                // Skills
                {
                    id: 'skills-section',
                    type: 'smart-element',
                    x: 30, y: 340, width: 220, height: 200,
                    content: 'ResumeSection',
                    componentData: {
                        templateId: 'champion-green-modern',
                        section: {
                            type: 'simple_list',
                            title: t.skillsHeader,
                            content: '• Excel\n• Project Management\n• Customer Service'
                        }
                    },
                    style: { opacity: 1, color: '#ffffff', fontSize: 10 }
                },

                // Summary
                createText('summary-h', t.aboutMeHeader, 320, 50, 14, 'bold', '#333333', 240),
                createText('summary', t.exampleSummary, 320, 80, 11, 'normal', '#333333', 240),

                // Experience
                {
                    id: 'experience-section',
                    type: 'smart-element',
                    x: 320, y: 180, width: 240, height: 350,
                    content: 'ResumeSection',
                    componentData: {
                        templateId: 'champion-green-modern',
                        section: {
                            type: 'timeline_experience',
                            title: t.experienceHeader,
                            items: [
                                {
                                    position: t.exampleRole,
                                    company: t.exampleCompany,
                                    period: t.examplePeriod,
                                    description: t.exampleDescription
                                }
                            ]
                        }
                    },
                    style: { opacity: 1 },
                },

                // Education
                createText('education-h', t.educationHeader, 320, 650, 14, 'bold', '#333333', 240),
                createText('education', `${t.exampleDegree} — ${t.exampleSchool} (${t.exampleYear})`, 320, 680, 11, 'normal', '#333333', 240),
            ].map(el => ({ ...el, style: { ...el.style, fontFamily: (el.style as any).fontFamily || '"Poppins", "Roboto", sans-serif', lineHeight: 1.6 } } as EditorElement))
        },
        {
            id: 'champion-corporate-blue',
            name: lang === 'pt' ? 'Corporativo Azul' : lang === 'es' ? 'Corporativo Azul' : 'Corporate Blue',
            category: 'champion',
            thumbnail: '',
            elements: [
                {
                    id: 'sidebar-bg', type: 'shape', x: 0, y: 0, width: 200, height: 842, content: '',
                    isBackground: true, locked: true,
                    style: { background: '#2563eb', borderRadius: 0, opacity: 1 }
                },

                // Photo
                {
                    id: 'photo-section',
                    type: 'smart-element',
                    x: 0, y: 0, width: 200, height: 160,
                    content: 'ProfessionalPhoto',
                    componentData: {
                        templateId: 'champion-corporate-blue',
                        userImage: '',
                        photoConfig: { size: 'cover' }
                    },
                    style: { opacity: 1, background: '#2563eb' }
                },

                // Name
                createText('name', t.exampleName, 20, 220, 26, 'bold', '#ffffff', 160, 'left', true),
                createText('role', t.exampleRole, 20, 320, 10, 'normal', '#ffffff', 160, 'left', true),

                // Profile
                createText('profile-h', lang === 'pt' ? 'PERFIL' : lang === 'es' ? 'PERFIL' : 'PROFILE', 20, 370, 11, 'bold', '#ffffff', 160),
                createText('profile', t.exampleSummary, 20, 410, 10, 'normal', '#ffffff', 160),

                // Skills
                createText('skills-h', t.skillsHeader, 20, 520, 11, 'bold', '#ffffff', 160),
                {
                    id: 'skills-section',
                    type: 'smart-element',
                    x: 20, y: 560, width: 160, height: 160,
                    content: 'ResumeSection',
                    componentData: {
                        templateId: 'champion-corporate-blue',
                        section: {
                            type: 'simple_list',
                            content: '• Full-Stack Dev\n• React & Node.js\n• Performance Optimization'
                        }
                    },
                    style: { opacity: 1, color: '#ffffff', fontSize: 10 }
                },

                // Summary
                {
                    id: 'summary-section',
                    type: 'smart-element',
                    x: 230, y: 30, width: 330, height: 90,
                    content: 'ResumeSection',
                    componentData: {
                        templateId: 'champion-corporate-blue',
                        section: {
                            type: 'text',
                            title: t.summaryHeader,
                            content: t.exampleSummary
                        }
                    },
                    style: { opacity: 1 }
                },

                // Experience
                {
                    id: 'experience-section',
                    type: 'smart-element',
                    x: 230, y: 130, width: 330, height: 380,
                    content: 'ResumeSection',
                    componentData: {
                        templateId: 'champion-corporate-blue',
                        section: {
                            type: 'timeline_experience',
                            title: t.experienceHeader,
                            items: [
                                {
                                    position: t.exampleRole,
                                    company: t.exampleCompany,
                                    period: t.examplePeriod,
                                    description: t.exampleDescription
                                }
                            ]
                        }
                    },
                    style: { opacity: 1 }
                },

                // Education
                {
                    id: 'education-section',
                    type: 'smart-element',
                    x: 230, y: 530, width: 330, height: 180,
                    content: 'ResumeSection',
                    componentData: {
                        templateId: 'champion-corporate-blue',
                        section: {
                            type: 'education_list',
                            title: t.educationHeader,
                            items: [
                                {
                                    school: t.exampleSchool,
                                    degree: t.exampleDegree,
                                    year: t.exampleYear
                                }
                            ]
                        }
                    },
                    style: { opacity: 1 }
                },
            ].map(el => ({ ...el, style: { ...el.style, fontFamily: (el.style as any).fontFamily || '"Montserrat", "Arial", sans-serif', lineHeight: 1.5 } } as EditorElement))
        },
        {
            id: 'champion-ats-professional',
            name: lang === 'pt' ? 'O Profissional ATS (Alta Aprovação)' : lang === 'es' ? 'El Profesional ATS (Alta Aprobación)' : 'The ATS Professional (High Approval)',
            category: 'champion',
            thumbnail: '',
            elements: [
                // Clean header with professional color
                { id: 'header-bg', type: 'shape', x: 0, y: 0, width: 595, height: 100, content: '', isBackground: true, locked: true, style: { backgroundColor: '#1e40af', borderRadius: 0, opacity: 1 } },

                // Professional Photo - Top right corner
                {
                    id: 'photo-section',
                    type: 'smart-element',
                    x: 450, y: 10,
                    width: 80, height: 80,
                    content: 'ProfessionalPhoto',
                    componentData: {
                        templateId: 'champion-ats-professional',
                        userImage: '',
                        photoConfig: { size: 'cover' }
                    },
                    style: { opacity: 1, background: '#ffffff', borderRadius: 0 }
                },

                // Name and Title - Clear hierarchy for ATS (User must fill manually)
                createText('name', lang === 'pt' ? '[SEU NOME COMPLETO]' : lang === 'es' ? '[SU NOMBRE COMPLETO]' : '[YOUR FULL NAME]', 40, 30, 26, 'bold', '#ffffff', 400, 'left', false),
                createText('role', lang === 'pt' ? '[CARGO / ESPECIALIDADE]' : lang === 'es' ? '[CARGO / ESPECIALIDAD]' : '[JOB TITLE / SPECIALTY]', 40, 65, 12, 'bold', '#93c5fd', 400, 'left', false),

                // Contact bar - ATS-friendly format
                { id: 'contact-bg', type: 'shape', x: 0, y: 100, width: 595, height: 35, content: '', isBackground: true, locked: true, style: { backgroundColor: '#f1f5f9', borderRadius: 0, opacity: 1 } },
                createText('contact', `📧 ${t.email.toLowerCase()}@profissional.com  |  📱 (11) 98765-4321  |  📍 São Paulo, SP  |  💼 linkedin.com/in/profissional`, 40, 110, 9, 'normal', '#1e293b', 515, 'center'),

                // Professional Summary - ATS keyword rich
                createText('summary-h', lang === 'pt' ? 'RESUMO PROFISSIONAL' : lang === 'es' ? 'RESUMEN PROFESIONAL' : 'PROFESSIONAL SUMMARY', 40, 155, 13, 'bold', '#1e40af', 515),
                { id: 'summary-line', type: 'shape', x: 40, y: 173, width: 80, height: 3, content: '', style: { backgroundColor: '#3b82f6', borderRadius: 0 } },
                createText('summary', lang === 'pt'
                    ? 'Profissional com 8+ anos de experiência em gestão de projetos e liderança de equipes multidisciplinares. Histórico comprovado de entrega de resultados mensuráveis, incluindo aumento de 35% em eficiência operacional e redução de 28% em custos. Especialista em metodologias ágeis, análise de dados e otimização de processos. Certificado PMP e Six Sigma Black Belt.'
                    : lang === 'es'
                        ? 'Profesional con 8+ años de experiencia en gestión de proyectos y liderazgo de equipos multidisciplinarios. Historial comprobado de entrega de resultados mensurables, incluyendo aumento del 35% en eficiencia operacional y reducción del 28% en costos. Especialista en metodologías ágiles, análisis de datos y optimización de procesos. Certificado PMP y Six Sigma Black Belt.'
                        : 'Professional with 8+ years of experience in project management and leading multidisciplinary teams. Proven track record of delivering measurable results, including 35% increase in operational efficiency and 28% cost reduction. Expert in agile methodologies, data analysis, and process optimization. PMP and Six Sigma Black Belt certified.',
                    40, 185, 10, 'normal', '#334155', 515),

                // Core Competencies - Keyword section for ATS
                createText('competencies-h', lang === 'pt' ? 'COMPETÊNCIAS PRINCIPAIS' : lang === 'es' ? 'COMPETENCIAS PRINCIPALES' : 'CORE COMPETENCIES', 40, 255, 13, 'bold', '#1e40af', 515),
                { id: 'comp-line', type: 'shape', x: 40, y: 273, width: 80, height: 3, content: '', style: { backgroundColor: '#3b82f6', borderRadius: 0 } },

                // Three-column competency layout
                createText('comp-col1', lang === 'pt'
                    ? '• Gestão de Projetos\n• Liderança de Equipes\n• Planejamento Estratégico\n• Análise de KPIs\n• Gestão de Stakeholders'
                    : lang === 'es'
                        ? '• Gestión de Proyectos\n• Liderazgo de Equipos\n• Planificación Estratégica\n• Análisis de KPIs\n• Gestión de Stakeholders'
                        : '• Project Management\n• Team Leadership\n• Strategic Planning\n• KPI Analysis\n• Stakeholder Management',
                    40, 285, 10, 'normal', '#334155', 160),
                createText('comp-col2', lang === 'pt'
                    ? '• Metodologias Ágeis (Scrum)\n• Gestão de Orçamento\n• Melhoria Contínua\n• Gestão de Riscos\n• Negociação'
                    : lang === 'es'
                        ? '• Metodologías Ágiles (Scrum)\n• Gestión de Presupuesto\n• Mejora Continua\n• Gestión de Riesgos\n• Negociación'
                        : '• Agile Methodologies (Scrum)\n• Budget Management\n• Continuous Improvement\n• Risk Management\n• Negotiation',
                    215, 285, 10, 'normal', '#334155', 160),
                createText('comp-col3', lang === 'pt'
                    ? '• Power BI / Tableau\n• MS Project / Jira\n• Excel Avançado\n• SAP / ERP\n• Lean Six Sigma'
                    : lang === 'es'
                        ? '• Power BI / Tableau\n• MS Project / Jira\n• Excel Avanzado\n• SAP / ERP\n• Lean Six Sigma'
                        : '• Power BI / Tableau\n• MS Project / Jira\n• Advanced Excel\n• SAP / ERP\n• Lean Six Sigma',
                    390, 285, 10, 'normal', '#334155', 165),

                // Professional Experience - Achievement-focused
                createText('exp-h', lang === 'pt' ? 'EXPERIÊNCIA PROFISSIONAL' : lang === 'es' ? 'EXPERIENCIA PROFESIONAL' : 'PROFESSIONAL EXPERIENCE', 40, 395, 13, 'bold', '#1e40af', 515),
                { id: 'exp-line', type: 'shape', x: 40, y: 413, width: 80, height: 3, content: '', style: { backgroundColor: '#3b82f6', borderRadius: 0 } },

                // Job 1 - Quantifiable achievements
                createText('job1-title', lang === 'pt' ? 'GERENTE DE PROJETOS SÊNIOR' : lang === 'es' ? 'GERENTE DE PROYECTOS SENIOR' : 'SENIOR PROJECT MANAGER', 40, 430, 11, 'bold', '#1e293b', 350),
                createText('job1-period', '2019 - 2024', 465, 430, 10, 'bold', '#64748b', 90, 'right'),
                createText('job1-company', lang === 'pt' ? 'Empresa Tecnologia Ltda. | São Paulo, SP' : lang === 'es' ? 'Empresa Tecnología Ltda. | São Paulo, SP' : 'Technology Company Ltd. | São Paulo, SP', 40, 445, 10, 'italic', '#64748b', 515),
                createText('job1-achievements', lang === 'pt'
                    ? '• Liderou 12+ projetos estratégicos com orçamento total de R$ 15M, entregando 100% no prazo e dentro do budget\n• Implementou metodologia ágil que aumentou a produtividade da equipe em 35% e reduziu time-to-market em 40%\n• Gerenciou equipe multidisciplinar de 25 profissionais, alcançando índice de satisfação de 92% (NPS)\n• Otimizou processos operacionais resultando em economia anual de R$ 2.8M (28% de redução de custos)\n• Desenvolveu dashboard de KPIs que melhorou tomada de decisão e visibilidade executiva em 60%'
                    : lang === 'es'
                        ? '• Lideró 12+ proyectos estratégicos con presupuesto total de R$ 15M, entregando 100% a tiempo y dentro del presupuesto\n• Implementó metodología ágil que aumentó la productividad del equipo en 35% y redujo time-to-market en 40%\n• Gestionó equipo multidisciplinario de 25 profesionales, alcanzando índice de satisfacción del 92% (NPS)\n• Optimizó procesos operacionales resultando en economía anual de R$ 2.8M (28% de reducción de costos)\n• Desarrolló dashboard de KPIs que mejoró toma de decisiones y visibilidad ejecutiva en 60%'
                        : '• Led 12+ strategic projects with total budget of R$ 15M, delivering 100% on time and within budget\n• Implemented agile methodology that increased team productivity by 35% and reduced time-to-market by 40%\n• Managed multidisciplinary team of 25 professionals, achieving 92% satisfaction index (NPS)\n• Optimized operational processes resulting in annual savings of R$ 2.8M (28% cost reduction)\n• Developed KPI dashboard that improved decision-making and executive visibility by 60%',
                    40, 465, 10, 'normal', '#334155', 515),

                // Job 2
                createText('job2-title', lang === 'pt' ? 'COORDENADOR DE PROJETOS' : lang === 'es' ? 'COORDINADOR DE PROYECTOS' : 'PROJECT COORDINATOR', 40, 590, 11, 'bold', '#1e293b', 350),
                createText('job2-period', '2016 - 2019', 465, 590, 10, 'bold', '#64748b', 90, 'right'),
                createText('job2-company', lang === 'pt' ? 'Consultoria Estratégica S.A. | São Paulo, SP' : lang === 'es' ? 'Consultoría Estratégica S.A. | São Paulo, SP' : 'Strategic Consulting Inc. | São Paulo, SP', 40, 605, 10, 'italic', '#64748b', 515),
                createText('job2-achievements', lang === 'pt'
                    ? '• Coordenou 8 projetos simultâneos de transformação digital para clientes Fortune 500\n• Reduziu desvios de cronograma em 45% através de implementação de controles rigorosos\n• Certificou-se PMP e Six Sigma Green Belt, aplicando conhecimentos em otimização de processos\n• Treinou e mentorou 6 analistas júnior, com 100% de promoção em 18 meses'
                    : lang === 'es'
                        ? '• Coordinó 8 proyectos simultáneos de transformación digital para clientes Fortune 500\n• Redujo desvíos de cronograma en 45% a través de implementación de controles rigurosos\n• Se certificó PMP y Six Sigma Green Belt, aplicando conocimientos en optimización de procesos\n• Entrenó y mentoró 6 analistas junior, con 100% de promoción en 18 meses'
                        : '• Coordinated 8 simultaneous digital transformation projects for Fortune 500 clients\n• Reduced schedule deviations by 45% through implementation of rigorous controls\n• Obtained PMP and Six Sigma Green Belt certifications, applying knowledge in process optimization\n• Trained and mentored 6 junior analysts, with 100% promotion rate in 18 months',
                    40, 625, 10, 'normal', '#334155', 515),

                // Education
                createText('edu-h', lang === 'pt' ? 'FORMAÇÃO ACADÊMICA' : lang === 'es' ? 'FORMACIÓN ACADÉMICA' : 'EDUCATION', 40, 710, 13, 'bold', '#1e40af', 515),
                { id: 'edu-line', type: 'shape', x: 40, y: 728, width: 80, height: 3, content: '', style: { backgroundColor: '#3b82f6', borderRadius: 0 } },

                createText('edu1-degree', lang === 'pt' ? 'MBA em Gestão de Projetos' : lang === 'es' ? 'MBA en Gestión de Proyectos' : 'MBA in Project Management', 40, 745, 11, 'bold', '#1e293b', 350),
                createText('edu1-year', '2018', 465, 745, 10, 'bold', '#64748b', 90, 'right'),
                createText('edu1-school', lang === 'pt' ? 'Fundação Getulio Vargas (FGV) | São Paulo, SP' : lang === 'es' ? 'Fundación Getulio Vargas (FGV) | São Paulo, SP' : 'Getulio Vargas Foundation (FGV) | São Paulo, SP', 40, 760, 10, 'normal', '#64748b', 515),

                createText('edu2-degree', lang === 'pt' ? 'Bacharelado em Administração de Empresas' : lang === 'es' ? 'Licenciatura en Administración de Empresas' : 'Bachelor in Business Administration', 40, 780, 11, 'bold', '#1e293b', 350),
                createText('edu2-year', '2015', 465, 780, 10, 'bold', '#64748b', 90, 'right'),
                createText('edu2-school', lang === 'pt' ? 'Universidade de São Paulo (USP) | São Paulo, SP' : lang === 'es' ? 'Universidad de São Paulo (USP) | São Paulo, SP' : 'University of São Paulo (USP) | São Paulo, SP', 40, 795, 10, 'normal', '#64748b', 515),

                // Certifications - Important for ATS
                createText('cert-h', lang === 'pt' ? 'CERTIFICAÇÕES PROFISSIONAIS' : lang === 'es' ? 'CERTIFICACIONES PROFESIONALES' : 'PROFESSIONAL CERTIFICATIONS', 40, 810, 13, 'bold', '#1e40af', 250),
                createText('cert-list', lang === 'pt'
                    ? '• PMP (Project Management Professional) - PMI\n• Six Sigma Black Belt - ASQ\n• Certified Scrum Master (CSM) - Scrum Alliance'
                    : lang === 'es'
                        ? '• PMP (Project Management Professional) - PMI\n• Six Sigma Black Belt - ASQ\n• Certified Scrum Master (CSM) - Scrum Alliance'
                        : '• PMP (Project Management Professional) - PMI\n• Six Sigma Black Belt - ASQ\n• Certified Scrum Master (CSM) - Scrum Alliance',
                    40, 828, 9, 'normal', '#334155', 250),

                // Languages
                createText('lang-h', t.languagesHeader, 310, 810, 13, 'bold', '#1e40af', 245),
                createText('lang-list', lang === 'pt'
                    ? '• Português (Nativo)\n• Inglês (Fluente - TOEFL 110/120)\n• Espanhol (Avançado)'
                    : lang === 'es'
                        ? '• Portugués (Nativo)\n• Inglés (Fluente - TOEFL 110/120)\n• Español (Avanzado)'
                        : '• Portuguese (Native)\n• English (Fluent - TOEFL 110/120)\n• Spanish (Advanced)',
                    310, 828, 9, 'normal', '#334155', 245),

            ].map(el => ({ ...el, style: { ...el.style, fontFamily: (el.style as any).fontFamily || '"Calibri", "Arial", sans-serif', lineHeight: 1.5 } } as EditorElement))
        }

    ];
};
