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
                // Header background — taller to avoid overlap
                {
                    id: 'header-bg', type: 'shape', x: 0, y: 0, width: 595, height: 200, content: '',
                    isBackground: true, locked: true,
                    style: { backgroundColor: '#6a11cb', borderWidth: 0, opacity: 1, background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)' }
                },

                // Professional Photo
                {
                    id: 'photo-section',
                    type: 'smart-element',
                    x: 40, y: 25,
                    width: 130, height: 130,
                    locked: true,
                    content: 'ProfessionalPhoto',
                    componentData: {
                        templateId: 'champion-creative-modern',
                        userImage: '',
                        photoConfig: { size: 'cover' }
                    },
                    style: { opacity: 1, background: 'transparent' }
                },

                // Header text — properly spaced
                createText('name', lang === 'pt' ? '[SEU NOME COMPLETO]' : lang === 'es' ? '[SU NOMBRE COMPLETO]' : '[YOUR FULL NAME]', 200, 35, 28, 'bold', '#ffffff', 360, 'left', true),
                createText('role', lang === 'pt' ? '[Cargo / Especialidade]' : lang === 'es' ? '[Cargo / Especialidad]' : '[Role / Specialty]', 200, 100, 13, 'normal', '#e0e1dd', 360, 'left', true),
                createText('tagline', lang === 'pt' ? '"Descreva seu diferencial em uma frase"' : lang === 'es' ? '"Describa su diferencial en una frase"' : '"Describe your unique value in one sentence"', 200, 130, 11, 'italic', '#c4c7ff', 360, 'left', true),

                // Contact Strip
                createShape('contact-bg', 0, 200, 595, 38, '#f3f4f6'),
                createText('contact', lang === 'pt' ? '📍 Sua Cidade  •  📞 (00) 00000-0000  •  ✉️ seu@email.com  •  🔗 linkedin.com/in/perfil' : lang === 'es' ? '📍 Su Ciudad  •  📞 +00 000 000 000  •  ✉️ su@email.com  •  🔗 linkedin.com/in/perfil' : '📍 Your City  •  📞 +1 (555) 000-0000  •  ✉️ your@email.com  •  🔗 linkedin.com/in/profile', 0, 210, 9, 'bold', '#2575fc', 595, 'center'),

                // About Me
                createText('about-h', lang === 'pt' ? 'SOBRE MIM' : lang === 'es' ? 'SOBRE MÍ' : 'ABOUT ME', 40, 260, 14, 'bold', '#6a11cb', 515),
                createShape('about-line', 40, 280, 50, 3, '#ff7e5f'),
                createText('summary', lang === 'pt' ? '[Escreva um resumo profissional de 3-4 linhas. Destaque anos de experiência, principal área de atuação, competências-chave e o que busca na próxima oportunidade.]' : lang === 'es' ? '[Escriba un resumen profesional de 3-4 líneas. Destaque años de experiencia, área principal, competencias clave y lo que busca en la próxima oportunidad.]' : '[Write a 3-4 line professional summary. Highlight years of experience, main area, key skills, and what you seek in your next opportunity.]', 40, 295, 10, 'normal', '#333333', 515),

                // Experience
                createText('exp-h', lang === 'pt' ? 'EXPERIÊNCIA PROFISSIONAL' : lang === 'es' ? 'EXPERIENCIA PROFESIONAL' : 'PROFESSIONAL EXPERIENCE', 40, 370, 14, 'bold', '#6a11cb', 515),
                createShape('exp-line', 40, 390, 50, 3, '#ff7e5f'),

                // Job 1
                createText('job1-role', lang === 'pt' ? '[Cargo / Função]' : lang === 'es' ? '[Cargo / Función]' : '[Job Title]', 40, 405, 12, 'bold', '#333333', 400),
                createText('job1-date', lang === 'pt' ? '2020 - Presente' : lang === 'es' ? '2020 - Presente' : '2020 - Present', 460, 405, 9, 'bold', '#888888', 100, 'right'),
                createText('job1-comp', lang === 'pt' ? '[Nome da Empresa]' : lang === 'es' ? '[Nombre de la Empresa]' : '[Company Name]', 40, 423, 10, 'italic', '#666666', 515),
                createText('job1-desc', lang === 'pt' ? '• Descreva suas principais realizações com números\n• Ex: Aumentei vendas em 30% em 6 meses\n• Foque em resultados mensuráveis' : lang === 'es' ? '• Describa sus principales logros con números\n• Ej: Aumenté ventas un 30% en 6 meses\n• Enfóquese en resultados medibles' : '• Describe key achievements with numbers\n• E.g.: Increased sales by 30% in 6 months\n• Focus on measurable results', 40, 440, 10, 'normal', '#444444', 515),

                // Job 2
                createText('job2-role', lang === 'pt' ? '[Cargo Anterior]' : lang === 'es' ? '[Cargo Anterior]' : '[Previous Role]', 40, 515, 12, 'bold', '#333333', 400),
                createText('job2-date', '2017 - 2020', 460, 515, 9, 'bold', '#888888', 100, 'right'),
                createText('job2-comp', lang === 'pt' ? '[Empresa Anterior]' : lang === 'es' ? '[Empresa Anterior]' : '[Previous Company]', 40, 533, 10, 'italic', '#666666', 515),
                createText('job2-desc', lang === 'pt' ? '• Principais responsabilidades e conquistas\n• Projetos relevantes e impacto gerado' : lang === 'es' ? '• Principales responsabilidades y logros\n• Proyectos relevantes e impacto generado' : '• Key responsibilities and achievements\n• Relevant projects and impact generated', 40, 550, 10, 'normal', '#444444', 515),

                // Education
                createText('edu-h', lang === 'pt' ? 'FORMAÇÃO ACADÊMICA' : lang === 'es' ? 'FORMACIÓN ACADÉMICA' : 'EDUCATION', 40, 620, 14, 'bold', '#6a11cb', 515),
                createShape('edu-line', 40, 640, 50, 3, '#ff7e5f'),
                createText('edu1-title', lang === 'pt' ? '[Grau / Curso]' : lang === 'es' ? '[Grado / Curso]' : '[Degree / Course]', 40, 655, 11, 'bold', '#333333', 515),
                createText('edu1-school', lang === 'pt' ? '[Universidade] | [Ano]' : lang === 'es' ? '[Universidad] | [Año]' : '[University] | [Year]', 40, 672, 10, 'normal', '#555555', 515),

                // Skills
                createText('skills-h', lang === 'pt' ? 'COMPETÊNCIAS' : lang === 'es' ? 'COMPETENCIAS' : 'SKILLS', 40, 710, 14, 'bold', '#6a11cb', 515),
                createShape('skills-line', 40, 730, 50, 3, '#ff7e5f'),

                createText('skill-col1', lang === 'pt' ? 'TÉCNICAS\n\n• [Competência 1]\n• [Competência 2]\n• [Competência 3]' : lang === 'es' ? 'TÉCNICAS\n\n• [Competencia 1]\n• [Competencia 2]\n• [Competencia 3]' : 'TECHNICAL\n\n• [Skill 1]\n• [Skill 2]\n• [Skill 3]', 40, 745, 9, 'normal', '#333333', 160),
                createText('skill-col2', lang === 'pt' ? 'FERRAMENTAS\n\n• [Ferramenta 1]\n• [Ferramenta 2]\n• [Ferramenta 3]' : lang === 'es' ? 'HERRAMIENTAS\n\n• [Herramienta 1]\n• [Herramienta 2]\n• [Herramienta 3]' : 'TOOLS\n\n• [Tool 1]\n• [Tool 2]\n• [Tool 3]', 210, 745, 9, 'normal', '#333333', 160),
                createText('skill-col3', lang === 'pt' ? 'INTERPESSOAIS\n\n• [Soft Skill 1]\n• [Soft Skill 2]\n• [Soft Skill 3]' : lang === 'es' ? 'INTERPERSONALES\n\n• [Soft Skill 1]\n• [Soft Skill 2]\n• [Soft Skill 3]' : 'INTERPERSONAL\n\n• [Soft Skill 1]\n• [Soft Skill 2]\n• [Soft Skill 3]', 380, 745, 9, 'normal', '#333333', 160),
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
                createText('contact-h', lang === 'pt' ? 'CONTATO' : lang === 'es' ? 'CONTACTO' : 'CONTACT', 20, 180, 11, 'bold', '#ffffff', 140),
                createText('contact', lang === 'pt' ? '📍 Cidade, UF\n📞 (00) 00000-0000\n✉️ seu@email.com' : '📍 City, State\n📞 (00) 00000-0000\n✉️ your@email.com', 20, 195, 9, 'normal', '#e2e8f0', 140),

                createText('stack-h', lang === 'pt' ? 'STACk TÉCNICO' : 'TECH STACK', 20, 290, 11, 'bold', '#ffffff', 140),
                createText('stack', 'LANGUAGES\n• TypeScript, Python, Go\n\nFRAMEWORKS\n• React, Node.js, FastAPI\n\nCLOUD / OPS\n• AWS, Docker, K8s\n\nDATABASES\n• Postgres, Mongo, Redis', 20, 360, 9, 'normal', '#e2e8f0', 140),

                createText('lang-h', t.languagesHeader, 20, 600, 12, 'bold', '#ffffff', 140),
                createText('lang', lang === 'pt' ? '• Português (Nativo)\n• Inglês (Fluente)' : lang === 'es' ? '• Portugués (Nativo)\n• Inglés (Fluente)' : '• Portuguese (Native)\n• English (Fluent)', 20, 620, 9, 'normal', '#e2e8f0', 140),

                // Main Content
                createText('name', lang === 'pt' ? '[SEU NOME COMPLETO]' : lang === 'es' ? '[SU NOMBRE COMPLETO]' : '[YOUR FULL NAME]', 210, 40, 26, 'bold', '#0d1b2a', 350, 'left', true),
                createText('role', lang === 'pt' ? '[Sua Especialidade / Cargo]' : lang === 'es' ? '[Su Especialidad / Cargo]' : '[Your Specialty / Role]', 210, 75, 12, 'bold', '#415a77', 350, 'left', true),
                createText('tagline', lang === 'pt' ? '> [Descreva sua missão profissional em uma frase curta]' : '> [Describe your professional mission in one short sentence]', 210, 95, 10, 'italic', '#778da9', 350, 'left', true),

                createShape('sep-1', 210, 115, 350, 1, '#e0e1dd'),

                createText('summary', lang === 'pt' ? '[Escreva um resumo focado em seus principais diferenciais técnicos e conquistas recentes. Mencione o impacto que você gerou em projetos anteriores.]' : '[Write a summary focused on your key technical differentiators and recent achievements. Mention the impact you generated in previous projects.]', 210, 130, 10, 'normal', '#333333', 350),

                createText('exp-h', lang === 'pt' ? 'EXPERIÊNCIA PROFISSIONAL' : lang === 'es' ? 'EXPERIENCIA PROFESIONAL' : 'PROFESSIONAL EXPERIENCE', 210, 200, 14, 'bold', '#0d1b2a', 350),
                createShape('exp-sep', 210, 220, 50, 3, '#415a77'),

                // Job 1
                createText('job1-role', lang === 'pt' ? '[Cargo Atual]' : '[Current Role]', 210, 240, 11, 'bold', '#0d1b2a', 250),
                createText('job1-date', lang === 'pt' ? '2021 - Presente' : '2021 - Present', 460, 240, 9, 'bold', '#415a77', 100, 'right'),
                createText('job1-comp', lang === 'pt' ? '[Nome da Empresa]' : '[Company Name]', 210, 255, 10, 'italic', '#555555', 350),
                createText('job1-desc', lang === 'pt' ? '• Liderou o desenvolvimento de [Projeto X]\n• Implementou [Tecnologia Y] resultando em melhoria de [Z%]\n• Mentorou equipe desenvolvedores juniores' : '• Led the development of [Project X]\n• Implemented [Technology Y] resulting in [Z%] improvement\n• Mentored junior developers team', 210, 275, 10, 'normal', '#333333', 350),

                // Job 2
                createText('job2-role', lang === 'pt' ? '[Cargo Anterior]' : '[Previous Role]', 210, 360, 11, 'bold', '#0d1b2a', 250),
                createText('job2-date', '2018 - 2021', 460, 360, 9, 'bold', '#415a77', 100, 'right'),
                createText('job2-comp', lang === 'pt' ? '[Empresa Anterior]' : '[Previous Company]', 210, 375, 10, 'italic', '#555555', 350),
                createText('job2-desc', lang === 'pt' ? '• Desenvolveu funcionalidades principais do sistema\n• Otimizou consultas ao banco de dados em 40%\n• Colaborou em ambiente ágil com Scrum' : '• Developed core system features\n• Optimized database queries by 40%\n• Collaborated in an agile environment with Scrum', 210, 395, 10, 'normal', '#333333', 350),

                createText('proj-h', lang === 'pt' ? 'PROJETOS DE DESTAQUE' : lang === 'es' ? 'PROYECTOS DESTACADOS' : 'FEATURED PROJECTS', 210, 480, 14, 'bold', '#0d1b2a', 350),
                createShape('proj-sep', 210, 500, 50, 3, '#415a77'),
                createText('proj1', '[Nome do Projeto / Lib]', 210, 520, 11, 'bold', '#0d1b2a', 350),
                createText('proj1-desc', lang === 'pt' ? '[Breve descrição do projeto, tecnologias utilizadas e impacto ou número de usuários/estrelas.]' : '[Brief project description, technologies used, and impact or number of users/stars.]', 210, 535, 10, 'normal', '#333333', 350),

                // Education
                createText('edu-h', lang === 'pt' ? 'FORMAÇÃO ACADÊMICA' : lang === 'es' ? 'FORMACIÓN ACADÉMICA' : 'EDUCATION', 210, 600, 14, 'bold', '#0d1b2a', 350),
                createShape('edu-sep', 210, 620, 50, 3, '#415a77'),
                createText('edu1-title', lang === 'pt' ? '[Grau / Curso]' : '[Degree / Course]', 210, 640, 11, 'bold', '#333333', 350),
                createText('edu1-school', lang === 'pt' ? '[Universidade] | [Ano de Conclusão]' : '[University] | [Graduation Year]', 210, 655, 10, 'normal', '#555555', 350),

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
                createText('name', lang === 'pt' ? '[SEU NOME COMPLETO]' : lang === 'es' ? '[SU NOMBRE COMPLETO]' : '[YOUR FULL NAME]', 40, 45, 24, 'bold', '#1a237e', 400, 'left', true),
                createText('creds', 'PhD, MSc, MBA', 40, 80, 12, 'bold', '#283593', 400, 'left', true),
                createText('role', lang === 'pt' ? '[Sua Especialidade / Cargo]' : lang === 'es' ? '[Su Especialidad / Cargo]' : '[Your Specialty / Role]', 40, 100, 12, 'normal', '#333333', 400, 'left', true),
                createText('inst', lang === 'pt' ? '[Nome da Instituição Atual]' : lang === 'es' ? '[Nombre de la Institución Actual]' : '[Current Institution Name]', 40, 118, 11, 'italic', '#555555', 400),

                // Contact Details
                createText('contact', lang === 'pt' ? '📧 seu@email.edu | 📍 Sua Cidade, UF | 🔗 lattes.cnpq.br/perfil' : '📧 your@email.edu | 📍 Your City, State | 🔗 linkedin.com/in/profile', 40, 145, 10, 'normal', '#333333', 515),

                createShape('sep-1', 40, 200, 515, 1, '#1a237e'),

                // Quote
                createText('quote', lang === 'pt' ? '[Frase inspiradora ou breve declaração de propósito acadêmico]' : '[Inspiring quote or brief academic purpose statement]', 40, 215, 11, 'italic', '#283593', 515, 'center'),

                // Research Focus
                createText('res-h', t.researchFocusHeader, 40, 260, 13, 'bold', '#1a237e', 515),
                createText('res-list', lang === 'pt' ? '• [Área de Pesquisa 1]\n• [Área de Pesquisa 2]\n• [Área de Pesquisa 3]' : '• [Research Area 1]\n• [Research Area 2]\n• [Research Area 3]', 40, 280, 10, 'normal', '#333333', 515),

                // Education
                createText('edu-h', t.educationHeader, 40, 340, 13, 'bold', '#1a237e', 515),
                createText('edu1-title', lang === 'pt' ? '[Ano] - PhD em [Sua Área]' : '[Year] - PhD in [Your Area]', 40, 360, 11, 'bold', '#000000', 515),
                createText('edu1-school', '[Nome da Universidade]', 40, 378, 10, 'normal', '#333333', 515),

                createText('edu2-title', lang === 'pt' ? '[Ano] - Mestrado em [Sua Área]' : '[Year] - Masters in [Your Area]', 40, 410, 11, 'bold', '#000000', 515),
                createText('edu2-school', '[Nome da Universidade]', 40, 428, 10, 'normal', '#333333', 515),

                // Publications
                createText('pub-h', t.publicationsHeader, 40, 500, 13, 'bold', '#1a237e', 515),
                createText('pub-list', lang === 'pt' ? '• [Título do Artigo], revista, ano.\n• [Livro ou Capítulo], editora, ano.\n• [Conferência de Destaque], local, ano.' : '• [Article Title], Journal, Year.\n• [Book or Chapter], Publisher, Year.\n• [Key Conference], Location, Year.', 40, 520, 10, 'normal', '#333333', 515),

                // Grants & Awards
                createText('grant-h', t.grantsHeader, 40, 620, 13, 'bold', '#1a237e', 515),
                createText('grant-list', lang === 'pt' ? '• [Nome do Fundo / Bolsa], período.\n• [Prêmio de Reconhecimento], instituição, ano.' : '• [Grant Name / Scholarship], Period.\n• [Recognition Award], Institution, Year.', 40, 640, 10, 'normal', '#333333', 515),
            ].map(el => ({ ...el, style: { ...el.style, fontFamily: (el.style as any).fontFamily || '"Times New Roman", "Garamond", serif', lineHeight: 1.8 } } as EditorElement))
        },
        {
            id: 'champion-strategist',
            name: lang === 'pt' ? 'O Estrategista (Alta Conversão)' : lang === 'es' ? 'El Estratega (Alta Conversión)' : 'The Strategist (High Conversion)',
            category: 'champion',
            thumbnail: '',
            elements: [
                // Clean Header with White Background
                { id: 'header-bg', type: 'shape', x: 0, y: 0, width: 595, height: 125, content: '', isBackground: true, locked: true, style: { backgroundColor: '#ffffff', borderRadius: 0, opacity: 1 } },

                // Professional Photo - Top Right
                {
                    id: 'photo-section',
                    type: 'smart-element',
                    x: 455, y: 15,
                    width: 100, height: 100,
                    locked: true,
                    content: 'ProfessionalPhoto',
                    componentData: {
                        templateId: 'champion-strategist',
                        userImage: '',
                        photoConfig: { size: 'cover' }
                    },
                    style: { opacity: 1, background: '#f8fafc', borderRadius: 0 }
                },

                // Name (Black) & Role (Professional Blue)
                createText('name', lang === 'pt' ? '[SEU NOME COMPLETO]' : lang === 'es' ? '[SU NOMBRE COMPLETO]' : '[YOUR FULL NAME]', 40, 40, 26, 'bold', '#000000', 380, 'left', true),
                createText('role', lang === 'pt' ? '[SUA PROFISSÃO / CARGO]' : lang === 'es' ? '[SU PROFESIÓN / CARGO]' : '[YOUR PROFESSION / ROLE]', 40, 75, 13, 'bold', '#1e3a8a', 380, 'left', true),

                // Contact bar - ATS-friendly format
                { id: 'contact-bg', type: 'shape', x: 0, y: 125, width: 595, height: 35, content: '', isBackground: true, locked: true, style: { backgroundColor: '#f1f5f9', borderRadius: 0, opacity: 1 } },
                createText('contact-info', lang === 'pt' ? 'Cidade, UF  |  (11) 90000-0000  |  seu@email.com  |  linkedin.com/in/perfil' : 'City, State  |  (00) 00000-0000  |  your@email.com  |  linkedin.com/in/profile', 20, 135, 9, 'normal', '#334155', 555, 'center', true),

                // Main Content - Summary
                createText('summary-h', lang === 'pt' ? 'RESUMO PROFISSIONAL' : lang === 'es' ? 'RESUMEN PROFESIONAL' : 'PROFESSIONAL SUMMARY', 40, 190, 12, 'bold', '#1e3a8a', 515),
                { id: 'summary-line', type: 'shape', x: 40, y: 208, width: 40, height: 3, content: '', style: { backgroundColor: '#3b82f6', borderRadius: 0 } },
                createText('summary', lang === 'pt' ? '[Escreva aqui um resumo focado em seus resultados quantitativos. Ex: "Gestor com 10 anos de experiência e redução de 20% nos custos operacionais."]' : '[Write a summary focused on your quantitative results. Ex: "Manager with 10 years of experience and 20% reduction in operational costs."]', 40, 218, 10, 'normal', '#333333', 515),

                // Competencies
                createText('skills-h', lang === 'pt' ? 'COMPETÊNCIAS E ESPECIALIDADES' : lang === 'es' ? 'COMPETENCIAS Y ESPECIALIDADES' : 'CORE COMPETENCIES', 40, 310, 12, 'bold', '#1e3a8a', 515),
                { id: 'skills-line', type: 'shape', x: 40, y: 328, width: 40, height: 3, content: '', style: { backgroundColor: '#3b82f6', borderRadius: 0 } },
                createText('skills-list', lang === 'pt' ? '• [Competência 1] • [Competência 2] • [Competência 3]\n• [Especialidade 1] • [Especialidade 2] • [Especialidade 3]' : '• [Competency 1] • [Competency 2] • [Competency 3]\n• [Specialty 1] • [Specialty 2] • [Specialty 3]', 40, 340, 10, 'normal', '#333333', 515),

                // Experience
                createText('exp-h', lang === 'pt' ? 'HISTÓRICO PROFISSIONAL' : lang === 'es' ? 'HISTORIAL PROFESIONAL' : 'PROFESSIONAL EXPERIENCE', 40, 420, 12, 'bold', '#1e3a8a', 515),
                { id: 'exp-line', type: 'shape', x: 40, y: 438, width: 40, height: 3, content: '', style: { backgroundColor: '#3b82f6', borderRadius: 0 } },

                // Job 1
                createText('job1-role', lang === 'pt' ? '[Cargo Atual]' : '[Current Role]', 40, 455, 11, 'bold', '#1e293b', 350),
                createText('job1-period', '2020 - Presente', 465, 455, 10, 'bold', '#64748b', 90, 'right'),
                createText('job1-comp', lang === 'pt' ? '[Nome da Empresa]' : '[Company Name]', 40, 473, 10, 'italic', '#64748b', 515),
                createText('job1-desc', lang === 'pt' ? '• [Situação]: Enfrentou desafio X.\n• [Ação]: Implementou estratégia Y.\n• [Resultado]: Alcançou ROI de Z%.' : '• [Situation]: Faced challenge X.\n• [Action]: Implemented strategy Y.\n• [Result]: Achieved ROI of Z%.', 40, 490, 10, 'normal', '#333333', 515),

                // Job 2
                createText('job2-role', lang === 'pt' ? '[Cargo Anterior]' : '[Previous Role]', 40, 580, 11, 'bold', '#1e293b', 350),
                createText('job2-period', '2016 - 2020', 465, 580, 10, 'bold', '#64748b', 90, 'right'),
                createText('job2-comp', lang === 'pt' ? '[Empresa Anterior]' : '[Previous Company]', 40, 598, 10, 'italic', '#64748b', 515),
                createText('job2-desc', lang === 'pt' ? '• Responsável por gerenciar [X] colaboradores.\n• Desenvolveu novo processo que poupou [Y] horas semanais.\n• Premiado como colaborador destaque em [Ano].' : '• Responsible for managing [X] employees.\n• Developed new process that saved [Y] weekly hours.\n• Awarded as top performer in [Year].', 40, 615, 10, 'normal', '#333333', 515),

                // Education
                createText('edu-h', lang === 'pt' ? 'FORMAÇÃO ACADÊMICA' : lang === 'es' ? 'FORMACIÓN ACADÉMICA' : 'EDUCATION', 40, 720, 12, 'bold', '#1e3a8a', 515),
                { id: 'edu-line', type: 'shape', x: 40, y: 738, width: 40, height: 3, content: '', style: { backgroundColor: '#3b82f6', borderRadius: 0 } },
                createText('edu1', lang === 'pt' ? '[Seu Curso / Especialização] - [Nome da Instituição]' : '[Your Course / Specialization] - [Institution Name]', 40, 750, 10, 'normal', '#333333', 515),

            ].map(el => ({ ...el, style: { ...el.style, fontFamily: (el.style as any).fontFamily || '"Lato", "Arial", sans-serif' } } as EditorElement))
        },
        {
            id: 'champion-green-modern',
            name: lang === 'pt' ? 'Profissional Moderno (Verde)' : lang === 'es' ? 'Profesional Moderno (Verde)' : 'Modern Professional (Green)',
            category: 'champion',
            thumbnail: '',
            elements: [
                // Sidebar background
                {
                    id: 'sidebar-bg', type: 'shape', x: 0, y: 0, width: 230, height: 842, content: '',
                    isBackground: true, locked: true,
                    style: { background: 'linear-gradient(180deg, #0f9d58 0%, #0b7a44 100%)', borderRadius: 0, opacity: 1 }
                },
                { id: 'sidebar-accent', type: 'shape', x: 226, y: 0, width: 4, height: 842, content: '', isBackground: true, locked: true, style: { backgroundColor: '#ff9800', borderRadius: 0, opacity: 1 } },

                // Professional Photo
                {
                    id: 'photo-section',
                    type: 'smart-element',
                    x: 40, y: 30,
                    width: 150, height: 150,
                    locked: true,
                    content: 'ProfessionalPhoto',
                    componentData: {
                        templateId: 'champion-green-modern',
                        userImage: '',
                        photoConfig: { size: 'cover' }
                    },
                    style: { opacity: 1, background: 'rgba(255,255,255,0.15)', borderRadius: 999 }
                },

                // Sidebar: Name & Role
                createText('name', lang === 'pt' ? '[Seu Nome]' : lang === 'es' ? '[Su Nombre]' : '[Your Name]', 20, 200, 20, 'bold', '#ffffff', 190, 'center'),
                createText('role', lang === 'pt' ? '[Sua Profissão]' : lang === 'es' ? '[Su Profesión]' : '[Your Role]', 20, 235, 11, 'normal', '#d4edda', 190, 'center'),

                // Sidebar: Contact
                createText('contact-h', lang === 'pt' ? 'CONTACTO' : lang === 'es' ? 'CONTACTO' : 'CONTACT', 20, 280, 11, 'bold', '#ffffff', 190),
                { id: 'contact-line', type: 'shape', x: 20, y: 296, width: 40, height: 2, content: '', style: { backgroundColor: '#ff9800', borderRadius: 0, opacity: 1 } },
                createText('contact', lang === 'pt' ? '📍 São Paulo, SP\n📞 (11) 91234-5678\n✉️ email@exemplo.com\n🔗 linkedin.com/in/perfil' : lang === 'es' ? '📍 Madrid, España\n📞 +34 612 345 678\n✉️ email@ejemplo.com\n🔗 linkedin.com/in/perfil' : '📍 New York, NY\n📞 +1 (555) 123-4567\n✉️ email@example.com\n🔗 linkedin.com/in/profile', 20, 305, 9, 'normal', '#e8f5e9', 190),

                // Sidebar: Skills
                createText('skills-h', lang === 'pt' ? 'COMPETÊNCIAS' : lang === 'es' ? 'COMPETENCIAS' : 'SKILLS', 20, 410, 11, 'bold', '#ffffff', 190),
                { id: 'skills-line', type: 'shape', x: 20, y: 426, width: 40, height: 2, content: '', style: { backgroundColor: '#ff9800', borderRadius: 0, opacity: 1 } },
                createText('skill-list1', lang === 'pt' ? '• [Competência 1]\n• [Competência 2]\n• [Competência 3]\n• [Competência 4]\n• [Competência 5]' : '• [Skill 1]\n• [Skill 2]\n• [Skill 3]\n• [Skill 4]\n• [Skill 5]', 20, 435, 9, 'normal', '#e8f5e9', 190),

                // Sidebar: Languages
                createText('lang-h', lang === 'pt' ? 'IDIOMAS' : lang === 'es' ? 'IDIOMAS' : 'LANGUAGES', 20, 560, 11, 'bold', '#ffffff', 190),
                { id: 'lang-line', type: 'shape', x: 20, y: 576, width: 40, height: 2, content: '', style: { backgroundColor: '#ff9800', borderRadius: 0, opacity: 1 } },
                createText('lang-list', lang === 'pt' ? '• Português (Nativo)\n• Inglês (Fluente)\n• Espanhol (Intermediário)' : lang === 'es' ? '• Español (Nativo)\n• Inglés (Fluente)\n• Portugués (Intermedio)' : '• English (Native)\n• Portuguese (Fluent)\n• Spanish (Intermediate)', 20, 585, 9, 'normal', '#e8f5e9', 190),

                // Sidebar: Certifications
                createText('cert-h', lang === 'pt' ? 'CERTIFICAÇÕES' : lang === 'es' ? 'CERTIFICACIONES' : 'CERTIFICATIONS', 20, 670, 11, 'bold', '#ffffff', 190),
                { id: 'cert-line', type: 'shape', x: 20, y: 686, width: 40, height: 2, content: '', style: { backgroundColor: '#ff9800', borderRadius: 0, opacity: 1 } },
                createText('cert-list', '• PMP - PMI\n• Scrum Master\n• Six Sigma Green Belt', 20, 695, 9, 'normal', '#e8f5e9', 190),

                // ===== Right Column =====

                // Summary
                createText('summary-h', lang === 'pt' ? 'SOBRE MIM' : lang === 'es' ? 'SOBRE MÍ' : 'ABOUT ME', 260, 40, 14, 'bold', '#0b7a44', 300),
                { id: 'summary-line', type: 'shape', x: 260, y: 60, width: 50, height: 3, content: '', style: { backgroundColor: '#ff9800', borderRadius: 0, opacity: 1 } },
                createText('summary', lang === 'pt' ? '[Escreva um resumo profissional de 3-4 linhas destacando sua experiência, competências-chave e o que busca na carreira.]' : lang === 'es' ? '[Escriba un resumen profesional de 3-4 líneas destacando su experiencia, competencias clave y lo que busca en su carrera.]' : '[Write a 3-4 line professional summary highlighting your experience, key skills, and career goals.]', 260, 72, 10, 'normal', '#333333', 300),

                // Experience
                createText('exp-h', lang === 'pt' ? 'EXPERIÊNCIA PROFISSIONAL' : lang === 'es' ? 'EXPERIENCIA PROFESIONAL' : 'PROFESSIONAL EXPERIENCE', 260, 150, 14, 'bold', '#0b7a44', 300),
                { id: 'exp-line', type: 'shape', x: 260, y: 170, width: 50, height: 3, content: '', style: { backgroundColor: '#ff9800', borderRadius: 0, opacity: 1 } },

                // Job 1
                createText('job1-role', lang === 'pt' ? '[Cargo / Função]' : lang === 'es' ? '[Cargo / Función]' : '[Job Title]', 260, 185, 11, 'bold', '#1a1a1a', 220),
                createText('job1-date', lang === 'pt' ? '2020 - Presente' : lang === 'es' ? '2020 - Presente' : '2020 - Present', 480, 185, 9, 'bold', '#666666', 80, 'right'),
                createText('job1-comp', lang === 'pt' ? '[Nome da Empresa]' : lang === 'es' ? '[Nombre de la Empresa]' : '[Company Name]', 260, 202, 10, 'italic', '#555555', 300),
                createText('job1-desc', lang === 'pt' ? '• Descreva suas principais realizações\n• Use números e métricas quando possível\n• Foque em resultados, não apenas tarefas' : lang === 'es' ? '• Describa sus principales logros\n• Use números y métricas cuando sea posible\n• Enfóquese en resultados, no solo tareas' : '• Describe your key achievements\n• Use numbers and metrics when possible\n• Focus on results, not just tasks', 260, 218, 10, 'normal', '#333333', 300),

                // Job 2
                createText('job2-role', lang === 'pt' ? '[Cargo Anterior]' : lang === 'es' ? '[Cargo Anterior]' : '[Previous Role]', 260, 300, 11, 'bold', '#1a1a1a', 220),
                createText('job2-date', '2017 - 2020', 480, 300, 9, 'bold', '#666666', 80, 'right'),
                createText('job2-comp', lang === 'pt' ? '[Nome da Empresa]' : lang === 'es' ? '[Nombre de la Empresa]' : '[Company Name]', 260, 317, 10, 'italic', '#555555', 300),
                createText('job2-desc', lang === 'pt' ? '• Realizações e responsabilidades\n• Projetos relevantes\n• Impacto mensurável' : lang === 'es' ? '• Logros y responsabilidades\n• Proyectos relevantes\n• Impacto medible' : '• Achievements and responsibilities\n• Relevant projects\n• Measurable impact', 260, 333, 10, 'normal', '#333333', 300),

                // Education
                createText('edu-h', lang === 'pt' ? 'FORMAÇÃO ACADÊMICA' : lang === 'es' ? 'FORMACIÓN ACADÉMICA' : 'EDUCATION', 260, 420, 14, 'bold', '#0b7a44', 300),
                { id: 'edu-line', type: 'shape', x: 260, y: 440, width: 50, height: 3, content: '', style: { backgroundColor: '#ff9800', borderRadius: 0, opacity: 1 } },

                createText('edu1-title', lang === 'pt' ? '[Grau / Curso]' : lang === 'es' ? '[Grado / Curso]' : '[Degree / Course]', 260, 455, 11, 'bold', '#1a1a1a', 300),
                createText('edu1-school', lang === 'pt' ? '[Universidade] | [Ano de Conclusão]' : lang === 'es' ? '[Universidad] | [Año de Conclusión]' : '[University] | [Graduation Year]', 260, 472, 10, 'normal', '#555555', 300),

                createText('edu2-title', lang === 'pt' ? '[Outro Curso / Formação]' : lang === 'es' ? '[Otro Curso / Formación]' : '[Other Degree / Course]', 260, 500, 11, 'bold', '#1a1a1a', 300),
                createText('edu2-school', lang === 'pt' ? '[Instituição] | [Ano]' : lang === 'es' ? '[Institución] | [Año]' : '[Institution] | [Year]', 260, 517, 10, 'normal', '#555555', 300),

            ].map(el => ({ ...el, style: { ...el.style, fontFamily: (el.style as any).fontFamily || '"Poppins", "Roboto", sans-serif', lineHeight: 1.6 } } as EditorElement))
        },
        {
            id: 'champion-corporate-blue',
            name: lang === 'pt' ? 'Design Corporativo Pro' : lang === 'es' ? 'Diseño Corporativo Pro' : 'Corporate Pro Design',
            category: 'champion',
            thumbnail: '',
            elements: [
                // Sidebar Background
                {
                    id: 'sidebar-bg', type: 'shape', x: 0, y: 0, width: 210, height: 842, content: '',
                    isBackground: true, locked: true,
                    style: { background: '#1e3a8a', borderRadius: 0, opacity: 1 }
                },

                // Photo - Inside Sidebar
                {
                    id: 'photo-section',
                    type: 'smart-element',
                    x: 30, y: 30, width: 150, height: 150,
                    locked: true,
                    content: 'ProfessionalPhoto',
                    componentData: {
                        templateId: 'champion-corporate-blue',
                        userImage: '',
                        photoConfig: { size: 'cover' }
                    },
                    style: { opacity: 1, background: 'rgba(255,255,255,0.1)', borderRadius: 0 }
                },

                // Sidebar Info: Contact
                createText('contact-h', lang === 'pt' ? 'CONTATO' : 'CONTACT', 25, 210, 11, 'bold', '#ffffff', 160),
                { id: 'c-line', type: 'shape', x: 25, y: 226, width: 30, height: 2, content: '', style: { backgroundColor: '#3b82f6', borderRadius: 0 } },
                createText('contact', lang === 'pt' ? '📍 São Paulo, SP\n📞 (11) 90000-0000\n✉️ seu@email.com\n🔗 linkedin/in/perfil' : '📍 New York, NY\n📞 +1 (555) 000-0000\n✉️ your@email.com\n🔗 linkedin/in/profile', 25, 235, 9, 'normal', '#cbd5e1', 160),

                // Sidebar Info: Skills
                createText('skills-h', lang === 'pt' ? 'COMPETÊNCIAS' : 'SKILLS', 25, 360, 11, 'bold', '#ffffff', 160),
                { id: 's-line', type: 'shape', x: 25, y: 376, width: 30, height: 2, content: '', style: { backgroundColor: '#3b82f6', borderRadius: 0 } },
                createText('skill-list', lang === 'pt' ? '• Gestão de Projetos\n• Liderança Estratégica\n• Análise de Dados\n• Metodologias Ágeis\n• Planejamento' : '• Project Management\n• Strategic Leadership\n• Data Analysis\n• Agile Methodologies\n• Planning', 25, 385, 9, 'normal', '#cbd5e1', 160),

                // Sidebar Info: Languages
                createText('lang-h', t.languagesHeader, 25, 540, 11, 'bold', '#ffffff', 160),
                { id: 'l-line', type: 'shape', x: 25, y: 556, width: 30, height: 2, content: '', style: { backgroundColor: '#3b82f6', borderRadius: 0 } },
                createText('lang-list', lang === 'pt' ? '• Inglês (Fluente)\n• Espanhol (Avançado)' : '• English (Fluent)\n• Spanish (Advanced)', 25, 565, 9, 'normal', '#cbd5e1', 160),

                // Sidebar Info: Certifications
                createText('cert-h', t.certificationsHeader, 25, 680, 11, 'bold', '#ffffff', 160),
                { id: 'cert-line', type: 'shape', x: 25, y: 696, width: 30, height: 2, content: '', style: { backgroundColor: '#3b82f6', borderRadius: 0 } },
                createText('cert-list', '• PMP - PMI\n• Scrum Master\n• AWS Cloud', 25, 705, 9, 'normal', '#cbd5e1', 160),

                // --- Main Section (White) ---

                // Name & Role - At the Top Main area for visibility
                createText('name', lang === 'pt' ? '[SEU NOME COMPLETO]' : '[YOUR FULL NAME]', 240, 40, 26, 'bold', '#111827', 315, 'left', true),
                createText('role', lang === 'pt' ? '[SUA PROFISSÃO OU CARGO ATUAL]' : '[YOUR PROFESSION OR ROLE]', 240, 75, 12, 'bold', '#1e40af', 315, 'left', true),
                { id: 'header-divider', type: 'shape', x: 240, y: 100, width: 315, height: 1, content: '', style: { backgroundColor: '#e5e7eb', borderRadius: 0 } },

                // Summary
                createText('summary-h', lang === 'pt' ? 'PERFIL PROFISSIONAL' : 'PROFESSIONAL SUMMARY', 240, 130, 13, 'bold', '#1e3a8a', 315),
                createText('summary', lang === 'pt' ? '[Escreva um resumo de impacto destacando seus anos de experiência, principais conquistas e o valor que você entrega. Ex: Especialista em gestão de alta performance com histórico de redução de custos em 30%.]' : '[Write a high-impact summary highlighting your years of experience, key achievements, and the value you deliver. E.g., High-performance management specialist with a track record of 30% cost reduction.]', 240, 150, 10, 'normal', '#374151', 315),

                // Experience
                createText('exp-h', lang === 'pt' ? 'HISTÓRICO PROFISSIONAL' : 'WORK EXPERIENCE', 240, 270, 13, 'bold', '#1e3a8a', 315),
                { id: 'exp-divider', type: 'shape', x: 240, y: 288, width: 50, height: 3, content: '', style: { backgroundColor: '#3b82f6', borderRadius: 0 } },

                // Job 1
                createText('job1-role', lang === 'pt' ? '[Cargo / Título]' : '[Job Title]', 240, 305, 11, 'bold', '#111827', 220),
                createText('job1-period', '2020 - Presente', 465, 305, 9, 'bold', '#6b7280', 90, 'right'),
                createText('job1-comp', lang === 'pt' ? '[Nome da Empresa] | [Cidade, UF]' : '[Company Name] | [City, ST]', 240, 320, 10, 'italic', '#4b5563', 315),
                createText('job1-desc', lang === 'pt' ? '• Descrição de conquistas quantificáveis\n• Aumentou a receita em X% através de Y\n• Gerenciou equipe de Z colaboradores' : '• Quantifiable achievements description\n• Increased revenue by X% through Y\n• Managed a team of Z employees', 240, 338, 10, 'normal', '#374151', 315),

                // Job 2
                createText('job2-role', lang === 'pt' ? '[Cargo Anterior]' : '[Previous Job title]', 240, 440, 11, 'bold', '#111827', 220),
                createText('job2-period', '2016 - 2020', 465, 440, 9, 'bold', '#6b7280', 90, 'right'),
                createText('job2-comp', lang === 'pt' ? '[Empresa Anterior] | [Cidade, UF]' : '[Previous Company] | [City, ST]', 240, 455, 10, 'italic', '#4b5563', 315),
                createText('job2-desc', lang === 'pt' ? '• Responsabilidades e entregas principais\n• Otimizou processos reduzindo tempo em 20%\n• Recebeu prêmio de destaque do ano' : '• Key responsibilities and deliverables\n• Optimized processes reducing time by 20%\n• Awarded employee of the year', 240, 473, 10, 'normal', '#374151', 315),

                // Education
                createText('edu-h', lang === 'pt' ? 'FORMAÇÃO ACADÊMICA' : 'EDUCATION', 240, 580, 13, 'bold', '#1e3a8a', 315),
                { id: 'edu-divider', type: 'shape', x: 240, y: 598, width: 50, height: 3, content: '', style: { backgroundColor: '#3b82f6', borderRadius: 0 } },
                createText('edu1-title', lang === 'pt' ? '[Nome do Curso / Graduação]' : '[Degree / Major]', 240, 615, 11, 'bold', '#111827', 315),
                createText('edu1-school', lang === 'pt' ? '[Instituição] | [Ano]' : '[Institution] | [Year]', 240, 630, 10, 'normal', '#4b5563', 315),

            ].map(el => ({ ...el, style: { ...el.style, fontFamily: (el.style as any).fontFamily || '"Montserrat", "Arial", sans-serif', lineHeight: 1.5 } } as EditorElement))
        },
        {
            id: 'champion-ats-professional',
            name: lang === 'pt' ? 'O Profissional ATS (Alta Aprovação)' : lang === 'es' ? 'El Profesional ATS (Alta Aprobación)' : 'The ATS Professional (High Approval)',
            category: 'champion',
            thumbnail: '',
            elements: [
                // Clean header with light background for visibility
                { id: 'header-bg', type: 'shape', x: 0, y: 0, width: 595, height: 125, content: '', isBackground: true, locked: true, style: { backgroundColor: '#ffffff', borderRadius: 0, opacity: 1 } },

                // Professional Photo - Top right corner (Standard format)
                {
                    id: 'photo-section',
                    type: 'smart-element',
                    x: 455, y: 15,
                    width: 100, height: 100,
                    locked: true,
                    content: 'ProfessionalPhoto',
                    componentData: {
                        templateId: 'champion-ats-professional',
                        userImage: '',
                        photoConfig: { size: 'cover' }
                    },
                    style: { opacity: 1, background: '#f8fafc', borderRadius: 0 }
                },

                // Name and Title - Clear hierarchy            // Header elements with White background
                createText('name', lang === 'pt' ? '[SEU NOME COMPLETO]' : lang === 'es' ? '[SU NOMBRE COMPLETO]' : '[YOUR FULL NAME]', 40, 45, 26, 'bold', '#000000', 380, 'left', true),
                createText('role', lang === 'pt' ? '[SUA ÁREA / ESPECIALIDADE]' : lang === 'es' ? '[SU ÁREA / ESPECIALIDAD]' : '[YOUR ROLE / SPECIALTY]', 40, 80, 12, 'bold', '#1e3a8a', 380, 'left', true),

                // Contact bar - ATS-friendly format
                { id: 'contact-bg', type: 'shape', x: 0, y: 125, width: 595, height: 35, content: '', isBackground: true, locked: true, style: { backgroundColor: '#f1f5f9', borderRadius: 0, opacity: 1 } },
                createText('contact', lang === "pt" ? "📧 seu@email.com  |  📱 (00) 00000-0000  |  📍 Sua Cidade, UF  |  🔗 linkedin.com/in/perfil" : "📧 your@email.com  |  📱 (00) 00000-0000  |  📍 Your City, ST  |  🔗 linkedin.com/in/profile", 40, 135, 9, 'normal', '#1e293b', 515, 'center', true),

                // Professional Summary - ATS keyword rich
                createText('summary-h', lang === 'pt' ? 'RESUMO PROFISSIONAL' : lang === 'es' ? 'RESUMEN PROFESIONAL' : 'PROFESSIONAL SUMMARY', 40, 165, 13, 'bold', '#1e40af', 515),
                { id: 'summary-line', type: 'shape', x: 40, y: 183, width: 80, height: 3, content: '', style: { backgroundColor: '#3b82f6', borderRadius: 0 } },
                createText('summary', lang === 'pt'
                    ? 'Profissional com 8+ anos de experiência em gestão de projetos e liderança de equipes multidisciplinares. Histórico comprovado de entrega de resultados mensuráveis, incluindo aumento de 35% em eficiência operacional e redução de 28% em custos. Especialista em metodologias ágeis, análise de dados e otimização de processos. Certificado PMP e Six Sigma Black Belt.'
                    : lang === 'es'
                        ? 'Profesional con 8+ años de experiencia en gestión de proyectos y liderazgo de equipos multidisciplinarios. Historial comprobado de entrega de resultados mensurables, incluyendo aumento del 35% en eficiencia operacional y reducción del 28% en costos. Especialista en metodologías ágiles, análisis de datos y optimización de procesos. Certificado PMP y Six Sigma Black Belt.'
                        : 'Professional with 8+ years of experience in project management and leading multidisciplinary teams. Proven track record of delivering measurable results, including 35% increase in operational efficiency and 28% cost reduction. Expert in agile methodologies, data analysis, and process optimization. PMP and Six Sigma Black Belt certified.',
                    40, 195, 10, 'normal', '#334155', 515),

                // Core Competencies - Keyword section for ATS
                createText('competencies-h', lang === 'pt' ? 'COMPETÊNCIAS PRINCIPAIS' : lang === 'es' ? 'COMPETENCIAS PRINCIPALES' : 'CORE COMPETENCIES', 40, 260, 13, 'bold', '#1e40af', 515),
                { id: 'comp-line', type: 'shape', x: 40, y: 278, width: 80, height: 3, content: '', style: { backgroundColor: '#3b82f6', borderRadius: 0 } },

                // Three-column competency layout
                createText('comp-col1', lang === 'pt'
                    ? '• Gestão de Projetos\n• Liderança de Equipes\n• Planejamento Estratégico\n• Análise de KPIs\n• Gestão de Stakeholders'
                    : lang === 'es'
                        ? '• Gestión de Proyectos\n• Liderazgo de Equipos\n• Planificación Estratégica\n• Análisis de KPIs\n• Gestión de Stakeholders'
                        : '• Project Management\n• Team Leadership\n• Strategic Planning\n• KPI Analysis\n• Stakeholder Management',
                    40, 290, 10, 'normal', '#334155', 160),
                createText('comp-col2', lang === 'pt'
                    ? '• Metodologias Ágeis (Scrum)\n• Gestão de Orçamento\n• Melhoria Contínua\n• Gestão de Riscos\n• Negociação'
                    : lang === 'es'
                        ? '• Metodologías Ágiles (Scrum)\n• Gestión de Presupuesto\n• Mejora Continua\n• Gestión de Riesgos\n• Negociación'
                        : '• Agile Methodologies (Scrum)\n• Budget Management\n• Continuous Improvement\n• Risk Management\n• Negotiation',
                    215, 290, 10, 'normal', '#334155', 160),
                createText('comp-col3', lang === 'pt'
                    ? '• Power BI / Tableau\n• MS Project / Jira\n• Excel Avançado\n• SAP / ERP\n• Lean Six Sigma'
                    : lang === 'es'
                        ? '• Power BI / Tableau\n• MS Project / Jira\n• Excel Avanzado\n• SAP / ERP\n• Lean Six Sigma'
                        : '• Power BI / Tableau\n• MS Project / Jira\n• Advanced Excel\n• SAP / ERP\n• Lean Six Sigma',
                    390, 290, 10, 'normal', '#334155', 165),

                // Professional Experience - Achievement-focused
                createText('exp-h', lang === 'pt' ? 'EXPERIÊNCIA PROFISSIONAL' : lang === 'es' ? 'EXPERIENCIA PROFESIONAL' : 'PROFESSIONAL EXPERIENCE', 40, 380, 13, 'bold', '#1e40af', 515),
                { id: 'exp-line', type: 'shape', x: 40, y: 398, width: 80, height: 3, content: '', style: { backgroundColor: '#3b82f6', borderRadius: 0 } },

                // Job 1 - Quantifiable achievements
                createText('job1-title', lang === 'pt' ? 'GERENTE DE PROJETOS SÊNIOR' : lang === 'es' ? 'GERENTE DE PROYECTOS SENIOR' : 'SENIOR PROJECT MANAGER', 40, 423, 11, 'bold', '#1e293b', 350),
                createText('job1-period', '2019 - 2024', 465, 423, 10, 'bold', '#64748b', 90, 'right'),
                createText('job1-company', lang === 'pt' ? 'Empresa Tecnologia Ltda. | São Paulo, SP' : lang === 'es' ? 'Empresa Tecnología Ltda. | São Paulo, SP' : 'Technology Company Ltd. | São Paulo, SP', 40, 438, 10, 'italic', '#64748b', 515),
                createText('job1-achievements', lang === 'pt'
                    ? '• Liderou 12+ projetos estratégicos com orçamento total de R$ 15M, entregando 100% no prazo e dentro do budget\n• Implementou metodologia ágil que aumentou a produtividade da equipe em 35% e reduziu time-to-market em 40%\n• Gerenciou equipe multidisciplinar de 25 profissionais, alcançando índice de satisfação de 92% (NPS)\n• Otimizou processos operacionais resultando em economia anual de R$ 2.8M (28% de redução de custos)\n• Desenvolveu dashboard de KPIs que melhorou tomada de decisão e visibilidade executiva em 60%'
                    : lang === 'es'
                        ? '• Lideró 12+ proyectos estratégicos con presupuesto total de R$ 15M, entregando 100% a tiempo y dentro del presupuesto\n• Implementó metodología ágil que aumentó la productividad del equipo en 35% e redujo time-to-market en 40%\n• Gestionó equipo multidisciplinario de 25 profesionales, alcanzando índice de satisfacción del 92% (NPS)\n• Optimizó procesos operacionales resultando em economía anual de R$ 2.8M (28% de reducción de costos)\n• Desarrolló dashboard de KPIs que mejoró toma de decisiones y visibilidad executiva em 60%'
                        : '• Led 12+ strategic projects with total budget of R$ 15M, delivering 100% on time and within budget\n• Implemented agile methodology that increased team productivity by 35% and reduced time-to-market by 40%\n• Managed multidisciplinary team of 25 professionals, achieving 92% satisfaction index (NPS)\n• Optimized operational processes resulting in annual savings of R$ 2.8M (28% cost reduction)\n• Developed KPI dashboard that improved decision-making and executive visibility by 60%',
                    40, 453, 10, 'normal', '#334155', 515),

                // Job 2 - Consistent 30px gap from Job 1 end (ends at 531)
                createText('job2-title', lang === 'pt' ? 'COORDENADOR DE PROJETOS' : lang === 'es' ? 'COORDINADOR DE PROYECTOS' : 'PROJECT COORDINATOR', 40, 620, 11, 'bold', '#1e293b', 350),
                createText('job2-period', '2016 - 2019', 465, 620, 10, 'bold', '#64748b', 90, 'right'),
                createText('job2-company', lang === 'pt' ? 'Consultoria Estratégica S.A. | São Paulo, SP' : lang === 'es' ? 'Consultoría Estratégica S.A. | São Paulo, SP' : 'Strategic Consulting Inc. | São Paulo, SP', 40, 635, 10, 'italic', '#64748b', 515),
                createText('job2-achievements', lang === 'pt'
                    ? '• Coordenou 8 projetos simultâneos de transformação digital para clientes Fortune 500\n• Reduziu desvios de cronograma em 45% através de implementação de controles rigorosos\n• Certificou-se PMP e Six Sigma Green Belt, aplicando conhecimentos em otimização de processos\n• Treinou e mentorou 6 analistas júnior, com 100% de promoção em 18 meses'
                    : lang === 'es'
                        ? '• Coordinó 8 proyectos simultáneos de transformación digital para clientes Fortune 500\n• Redujo desvíos de cronograma en 45% a través de implementación de controles rigorosos\n• Se certificó PMP e Six Sigma Green Belt, aplicando conocimientos en optimización de procesos\n• Entrenó y mentoró 6 analistas junior, con 100% de promoción en 18 meses'
                        : '• Coordinated 8 simultaneous digital transformation projects for Fortune 500 clients\n• Reduced schedule deviations by 45% through implementation of rigorous controls\n• Obtained PMP and Six Sigma Green Belt certifications, applying knowledge in process optimization\n• Trained and mentored 6 junior analysts, with 100% promotion rate in 18 months',
                    40, 650, 10, 'normal', '#334155', 515),

                // Education - Shifted to Y=760 (Slightly higher to better fit Page 1 if possible, or clean break)
                createText('edu-h', lang === 'pt' ? 'FORMAÇÃO ACADÊMICA' : lang === 'es' ? 'FORMACIÓN ACADÉMICA' : 'EDUCATION', 40, 760, 13, 'bold', '#1e40af', 515),
                { id: 'edu-line', type: 'shape', x: 40, y: 778, width: 80, height: 3, content: '', style: { backgroundColor: '#3b82f6', borderRadius: 0 } },

                createText('edu1-degree', lang === 'pt' ? 'MBA em Gestão de Projetos' : lang === 'es' ? 'MBA en Gestión de Proyectos' : 'MBA in Project Management', 40, 790, 11, 'bold', '#1e293b', 350),
                createText('edu1-year', '2018', 465, 790, 10, 'bold', '#64748b', 90, 'right'),
                createText('edu1-school', lang === 'pt' ? 'Fundação Getulio Vargas (FGV) | São Paulo, SP' : lang === 'es' ? 'Fundación Getulio Vargas (FGV) | São Paulo, SP' : 'Getulio Vargas Foundation (FGV) | São Paulo, SP', 40, 805, 10, 'normal', '#64748b', 515),

                createText('edu2-degree', lang === 'pt' ? 'Bacharelado em Administração de Empresas' : lang === 'es' ? 'Licenciatura en Administración de Empresas' : 'Bachelor in Business Administration', 40, 825, 11, 'bold', '#1e293b', 350),
                createText('edu2-year', '2015', 465, 825, 10, 'bold', '#64748b', 90, 'right'),
                createText('edu2-school', lang === 'pt' ? 'Universidade de São Paulo (USP) | São Paulo, SP' : lang === 'es' ? 'Universidad de São Paulo (USP) | São Paulo, SP' : 'University of São Paulo (USP) | São Paulo, SP', 40, 840, 10, 'normal', '#64748b', 515),

                // Certifications & Languages - Standard Position - Shifted to 890 (30px gap)
                createText('cert-h', lang === 'pt' ? 'CERTIFICAÇÕES' : lang === 'es' ? 'CERTIFICACIONES' : 'CERTIFICATIONS', 40, 890, 11, 'bold', '#1e40af', 250),
                createText('cert-list', lang === 'pt'
                    ? '• PMP - PMI\n• Six Sigma Black Belt - ASQ\n• CSM - Scrum Alliance'
                    : lang === 'es'
                        ? '• PMP - PMI\n• Six Sigma Black Belt - ASQ\n• CSM - Scrum Alliance'
                        : '• PMP - PMI\n• Six Sigma Black Belt - ASQ\n• CSM - Scrum Alliance',
                    40, 905, 9, 'normal', '#334155', 250),

                createText('lang-h', t.languagesHeader, 310, 890, 11, 'bold', '#1e40af', 245),
                createText('lang-list', lang === 'pt'
                    ? '• Português (Nativo)\n• Inglês (Fluente)\n• Espanhol (Avançado)'
                    : lang === 'es'
                        ? '• Portugués (Nativo)\n• Inglés (Fluente)\n• Español (Avanzado)'
                        : '• Portuguese (Native)\n• English (Fluent)\n• Spanish (Advanced)',
                    310, 905, 9, 'normal', '#334155', 245),

            ].map(el => ({ ...el, style: { ...el.style, fontFamily: (el.style as any).fontFamily || '"Calibri", "Arial", sans-serif', lineHeight: 1.5 } } as EditorElement))
        },


    ];
};
