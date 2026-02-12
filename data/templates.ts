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
            name: 'Design Clássico Elegante',
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
                createText('name', 'RAFAEL ALMEIDA COSTA', 40, 40, 28, 'bold', '#2c3e50', 400, 'left', true),
                createText('role', 'DIRETOR FINANCEIRO | CFO', 40, 80, 14, 'normal', '#2c3e50', 400, 'left', true),

                // Contact Info (Below Header)
                createText('contact', '📞 (11) 93456-7890  |  📧 rafael.costa.exec@email.com  |  🔗 linkedin.com/in/rafaelfinance  |  📍 São Paulo, SP', 40, 130, 9, 'normal', '#2c3e50', 515, 'center'),
                createShape('header-line', 40, 150, 515, 2, '#2c3e50'),

                // Summary
                createText('summary-h', 'RESUMO PROFISSIONAL', 40, 170, 12, 'bold', '#1a5276', 515), // Accent
                createText('summary', 'Executivo financeiro com 15+ anos de experiência em gestão de resultados, governança corporativa e estratégia fiscal. Liderou reestruturações que aumentaram o EBITDA em 35% e reduziram custos operacionais em 20%.', 40, 190, 10, 'normal', '#333333', 515),

                // Columns Layout
                // Left Column (narrower) ~ 180px
                // Right Column (wider) ~ 315px
                // Gap ~ 20px

                // Left Column Content
                // Competencies
                createText('skills-h', 'COMPETÊNCIAS', 40, 240, 12, 'bold', '#1a5276', 180),
                createShape('skills-line', 40, 255, 180, 1, '#7f8c8d'), // Secondary

                createText('skill-cat1', 'Liderança Estratégica', 40, 265, 10, 'bold', '#2c3e50', 180),
                createText('skill-list1', '• Governança Corporativa\n• Fusões & Aquisições\n• Relacionamento com Investidores\n• Gestão de Riscos', 40, 280, 9, 'normal', '#333333', 180),

                createText('skill-cat2', 'Tecnologia & Análise', 40, 360, 10, 'bold', '#2c3e50', 180),
                createText('skill-list2', '• SAP/Oracle Financials\n• Power BI/Tableau\n• Modelagem Financeira\n• Python para Finanças', 40, 375, 9, 'normal', '#333333', 180),

                // Certifications
                createText('cert-h', 'CERTIFICAÇÕES', 40, 460, 12, 'bold', '#1a5276', 180),
                createShape('cert-line', 40, 475, 180, 1, '#7f8c8d'),
                createText('cert-list', '• CPA-20 (Anbima)\n• CFA Charterholder Nível III\n• Curso de Direito Societário (FGV)', 40, 485, 9, 'normal', '#333333', 180),

                // Languages
                createText('lang-h', 'IDIOMAS', 40, 560, 12, 'bold', '#1a5276', 180),
                createShape('lang-line', 40, 575, 180, 1, '#7f8c8d'),
                createText('lang-list', '• Português (Nativo)\n• Inglês (Fluente)\n• Espanhol (Avançado)', 40, 585, 9, 'normal', '#333333', 180),

                // Right Column Content
                // Experience
                createText('exp-h', 'EXPERIÊNCIA PROFISSIONAL', 240, 240, 12, 'bold', '#1a5276', 315),
                createShape('exp-line', 240, 255, 315, 1, '#7f8c8d'),

                // Job 1
                createText('job1-role', 'Diretor Financeiro (CFO)', 240, 265, 11, 'bold', '#2c3e50', 315),
                createText('job1-comp', 'Grupo Industrial Nacional S.A. | 2019 - Presente', 240, 280, 10, 'italic', '#555555', 315),
                createText('job1-desc', '• Liderou a captação de R$ 500M em debêntures para expansão.\n• Reestruturou o departamento financeiro (custos -15%).\n• Implementou sistema de previsão financeira (95% acurácia).', 240, 300, 10, 'normal', '#333333', 315),

                // Job 2
                createText('job2-role', 'Gerente Financeiro Sênior', 240, 380, 11, 'bold', '#2c3e50', 315),
                createText('job2-comp', 'Multinacional Consumidor Ltda. | 2014 - 2018', 240, 395, 10, 'italic', '#555555', 315),
                createText('job2-desc', '• Gerenciou orçamento anual de R$ 300M.\n• Coordenou due diligence para aquisição de 3 empresas.\n• Liderou migração para plataforma SAP S/4HANA.', 240, 415, 10, 'normal', '#333333', 315),

                // Education
                createText('edu-h', 'FORMAÇÃO ACADÊMICA', 240, 540, 12, 'bold', '#1a5276', 315),
                createShape('edu-line', 240, 555, 315, 1, '#7f8c8d'),

                createText('edu1-title', 'MBA em Finanças Internacionais', 240, 565, 11, 'bold', '#2c3e50', 315),
                createText('edu1-school', 'INSPER | 2013', 240, 580, 10, 'normal', '#555555', 315),

                createText('edu2-title', 'Bacharelado em Ciências Contábeis', 240, 600, 11, 'bold', '#2c3e50', 315),
                createText('edu2-school', 'Universidade de São Paulo (USP) | 2010', 240, 615, 10, 'normal', '#555555', 315),
            ].map(el => ({ ...el, style: { ...el.style, fontFamily: (el.style as any).fontFamily || '"Calibri", "Cambria", serif' } } as EditorElement))
        },
        {
            id: 'champion-creative-modern',
            name: 'Design Criativo Moderno',
            category: 'champion',
            thumbnail: '',
            elements: [
                // Modern Header with Color
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
                createText('name', 'JULIANA MENDES', 200, 50, 32, 'bold', '#ffffff', 350, 'left', true),
                createText('role', 'DIRETORA DE CRIAÇÃO | BRANDING', 200, 90, 14, 'normal', '#e0e1dd', 350, 'left', true),
                createText('tagline', '"Transformo ideias em experiências visuais memoráveis"', 200, 115, 12, 'italic', '#ffffff', 350, 'left', true),

                // Content Main
                // About
                createText('about-h', 'SOBRE MIM', 40, 210, 14, 'bold', '#6a11cb', 515),
                createShape('about-line', 40, 230, 50, 3, '#ff7e5f'), // Accent
                createText('about', 'Diretora de Criação com 10 anos de experiência desenvolvendo identidades visuais para marcas globais. Especialista em criar sistemas de design que unem estética, funcionalidade e propósito.', 40, 245, 11, 'normal', '#333333', 515),

                // Contact Strip (Below header/about)
                createShape('contact-bg', 0, 300, 595, 40, '#f3f4f6'),
                createText('contact', '📱 (21) 98765-4321  •  ✉️ juliana@criativa.design  •  🌐 behance.net/julianam', 0, 312, 10, 'bold', '#2575fc', 595, 'center'),

                // Experience
                createText('exp-h', 'EXPERIÊNCIA DE DESTAQUE', 40, 360, 14, 'bold', '#6a11cb', 515),
                createShape('exp-line', 40, 380, 50, 3, '#ff7e5f'),

                createText('job1-role', 'Diretora de Criação Sênior', 40, 400, 12, 'bold', '#333333', 515),
                createText('job1-comp', 'Agência Pulse Criativa | 2020 - Presente', 40, 418, 11, 'italic', '#666666', 515),
                createText('job1-desc', '• NovaTech Startup: Redesenho completo da marca (+300% reconhecimento).\n• EcoLife Produtos: Design de embalagens sustentáveis (+45% vendas).', 40, 440, 11, 'normal', '#444444', 515),

                // Education (Added)
                createText('edu-h', 'FORMAÇÃO ACADÊMICA', 40, 520, 14, 'bold', '#6a11cb', 515),
                createShape('edu-line', 40, 540, 50, 3, '#ff7e5f'),
                createText('edu1', 'Design Profissional - Universidade de Belas Artes | 2018', 40, 560, 11, 'normal', '#333333', 515),

                // Skills Grid equivalent (using text columns)
                createText('skills-h', 'HABILIDADES TÉCNICAS', 40, 620, 14, 'bold', '#6a11cb', 515),
                createShape('skills-line', 40, 640, 50, 3, '#ff7e5f'),

                createText('skill-col1', 'DESIGN\n\n• UI/UX Design\n• Identidade Visual\n• Motion Graphics', 40, 660, 10, 'normal', '#333333', 150),
                createText('skill-col2', 'FERRAMENTAS\n\n• Figma (Expert)\n• Adobe Suite\n• Blender 3D', 200, 660, 10, 'normal', '#333333', 150),
                createText('skill-col3', 'BUSINESS\n\n• Gestão de Projetos\n• Apresentação\n• Orçamentação', 360, 660, 10, 'normal', '#333333', 150),

                // Awards
                createText('awards-h', 'PRINCIPAIS PRÊMIOS', 40, 750, 14, 'bold', '#6a11cb', 515),
                createShape('awards-line', 40, 770, 50, 3, '#ff7e5f'),
                createText('awards', '🏆 Cannes Lions 2022 - Design\n🏆 Brazil Design Award 2021 - Branding', 40, 790, 11, 'normal', '#333333', 515),
            ].map(el => ({ ...el, style: { ...el.style, fontFamily: (el.style as any).fontFamily || '"Montserrat", "Open Sans", sans-serif' } } as EditorElement))
        },
        {
            id: 'champion-minimalist-tech',
            name: 'Design Minimalista Tech',
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
                createText('contact-h', 'CONTATO', 20, 210, 12, 'bold', '#ffffff', 140),
                createText('contact', '📧 daniel.dev@codetech.com\n📱 (31) 91234-5678\n🌐 danieldev.tech\n🐙 github.com/daniel-tech', 20, 230, 9, 'normal', '#e2e8f0', 140),

                createText('stack-h', 'TECH STACK', 20, 340, 12, 'bold', '#ffffff', 140),
                createText('stack', 'LANGUAGES\n• TypeScript, Python, Go\n\nFRAMEWORKS\n• React, Node.js, FastAPI\n\nCLOUD / OPS\n• AWS, Docker, K8s\n\nDATABASES\n• Postgres, Mongo, Redis', 20, 360, 9, 'normal', '#e2e8f0', 140),

                createText('lang-h', 'IDIOMAS', 20, 600, 12, 'bold', '#ffffff', 140),
                createText('lang', '• Português (Nativo)\n• Inglês (Fluente)', 20, 620, 9, 'normal', '#e2e8f0', 140),

                // Main Content
                createText('name', 'DANIEL OLIVEIRA', 210, 50, 30, 'bold', '#0d1b2a', 350, 'left', true),
                createText('role', 'TECH LEAD | FULL-STACK DEVELOPER', 210, 90, 12, 'bold', '#415a77', 350, 'left', true),
                createText('tagline', '> Arquitetando sistemas escaláveis com código limpo', 210, 110, 10, 'italic', '#778da9', 350, 'left', true),

                createShape('sep-1', 210, 130, 350, 1, '#e0e1dd'),

                createText('summary', 'Tech Lead com 8 anos de experiência desenvolvendo aplicações web e mobile de alta performance. Especialista em arquitetura de microsserviços, otimização de performance e mentoria de equipes.', 210, 150, 10, 'normal', '#333333', 350),

                createText('exp-h', 'EXPERIÊNCIA PROFISSIONAL', 210, 200, 14, 'bold', '#0d1b2a', 350),
                createShape('exp-sep', 210, 220, 50, 3, '#415a77'),

                // Job 1
                createText('job1-role', 'Tech Lead Sênior', 210, 240, 12, 'bold', '#0d1b2a', 250),
                createText('job1-date', '2021 - Presente', 460, 240, 10, 'bold', '#415a77', 100, 'right'),
                createText('job1-comp', 'FintechScale', 210, 255, 11, 'italic', '#555555', 350),
                createText('job1-desc', '• Liderou equipe de 8 devs (plataforma de pagamentos R$ 2B/ano).\n• Reduziu latência de API (450ms -> 120ms).\n• Reduziu bugs em produção em 60% via code review.', 210, 275, 10, 'normal', '#333333', 350),
                createText('job1-stack', '[ Node.js | React | AWS | K8s ]', 210, 315, 9, 'bold', '#415a77', 350),

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
            name: 'Design Academia/Pesquisa',
            category: 'champion',
            thumbnail: '',
            elements: [
                // Academic Header (Formal, Serif ideally, but stick to sans-serif variable 'fontFamily' is usually constrained, assume standard fonts)
                // Assuming standard font is Sans, but we will use styles.

                { id: 'top-bar', type: 'shape', x: 0, y: 0, width: 595, height: 15, content: '', isBackground: true, locked: true, style: { backgroundColor: '#1a237e', borderWidth: 0, opacity: 1 } },

                // Photo Top Right
                createShape('photo-border', 450, 40, 114, 144, '#1a237e'), // Double border simulation -> outer
                createShape('photo-border-in', 452, 42, 110, 140, '#ffffff'), // Spacer
                createShape('photo-bg', 454, 44, 106, 136, '#eeeeee'), // Inner
                createText('photo-text', 'FOTO', 480, 100, 10, 'normal', '#000000', 50, 'center'),

                // Header info area
                createText('name', 'DR. ANA LUÍSA FERNANDES', 40, 50, 24, 'bold', '#1a237e', 400, 'left', true),
                createText('creds', 'PhD, MSc, MBA', 40, 80, 12, 'bold', '#283593', 400, 'left', true),
                createText('role', 'Pesquisadora em Biotecnologia | Inovação Farmacêutica', 40, 95, 12, 'normal', '#333333', 400, 'left', true),
                createText('inst', 'Universidade Federal de Ciências da Saúde', 40, 110, 11, 'italic', '#555555', 400),

                // Contact Details
                createText('contact', 'Departamento de Biotecnologia Aplicada\nE-mail: a.fernandes@ufcs.edu.br\nORCID: 0000-0002-1825-0097\nLattes: lattes.cnpq.br/anafernandes', 40, 135, 10, 'normal', '#333333', 400),

                createShape('sep-1', 40, 200, 515, 1, '#1a237e'),

                // Quote
                createText('quote', '"A ciência avança não apenas com novas respostas, mas com novas perguntas."', 40, 215, 11, 'italic', '#283593', 515, 'center'),

                // Research Focus
                createText('res-h', 'FOCO DA PESQUISA', 40, 250, 12, 'bold', '#1a237e', 515),
                createText('res-list', '• Nanocarreadores para liberação controlada de fármacos\n• Biotecnologia aplicada ao câncer\n• Métodos alternativos aos testes em animais', 40, 270, 10, 'normal', '#333333', 515),

                // Education
                createText('edu-h', 'FORMAÇÃO ACADÊMICA', 40, 330, 12, 'bold', '#1a237e', 515),
                createText('edu1', '2018 - PhD em Biotecnologia', 40, 350, 11, 'bold', '#000000', 515),
                createText('edu1-inst', 'Universidade de Cambridge, UK (Tese: Nanopartículas lipídicas...)', 40, 365, 10, 'normal', '#333333', 515),
                createText('edu2', '2014 - MSc em Ciências Farmacêuticas', 40, 385, 11, 'bold', '#000000', 515),
                createText('edu2-inst', 'Universidade de São Paulo (USP)', 40, 400, 10, 'normal', '#333333', 515),

                // Publications
                createText('pub-h', 'PUBLICAÇÕES SELECIONADAS', 40, 460, 12, 'bold', '#1a237e', 515),
                createText('pub-count', '(Total: 28 artigos, 1.200+ citações)', 250, 460, 10, 'italic', '#555555', 300),
                createText('pub1', '• Lipid-based nanoparticles for targeted drug delivery (Nature Nanotechnology, 2022)', 40, 480, 10, 'normal', '#333333', 515),
                createText('pub2', '• Reducing toxicity while maintaining efficacy (Science Advances, 2021)', 40, 500, 10, 'normal', '#333333', 515),

                // Grants & Awards
                createText('grant-h', 'PRÊMIOS E FOMENTO', 40, 580, 12, 'bold', '#1a237e', 515),
                createText('grant-list', '• Bolsa Produtividade em Pesquisa - CNPq (2020-2024)\n• Prêmio Jovem Cientista - SBPC (2019)\n• Financiamento FAPESP (R$ 850k)', 40, 600, 10, 'normal', '#333333', 515),
            ].map(el => ({ ...el, style: { ...el.style, fontFamily: (el.style as any).fontFamily || '"Times New Roman", "Garamond", serif', lineHeight: 1.8 } } as EditorElement))
        },
        {
            id: 'champion-strategist',
            name: 'O Estrategista (Alta Conversão)',
            category: 'champion',
            thumbnail: '', // Placeholder
            elements: [
                // Header Background (Primary Blue)
                { id: 'header-bg', type: 'shape', x: 0, y: 0, width: 595, height: 110, content: '', isBackground: true, locked: true, style: { backgroundColor: '#0B3B5C', borderRadius: 0, opacity: 1 } },
                // Accent Line (Yellow)
                { id: 'header-accent', type: 'shape', x: 0, y: 110, width: 595, height: 5, content: '', isBackground: true, locked: true, style: { backgroundColor: '#F4B400', borderRadius: 0, opacity: 1 } },

                // Name & Title (White on Blue)
                createText('name', 'ROBERTO ALVES', 40, 35, 28, 'bold', '#ffffff', 400, 'left', true),
                createText('role', 'GERENTE DE OPERAÇÕES SÊNIOR', 40, 70, 14, 'bold', '#F4B400', 400, 'left', true),

                // 2-Column Section: Contact (Left) & Keywords (Right)
                // 2-Column Section: Contact (Left) & Keywords (Right)
                // Left Col: Contact
                createText('contact-h', 'CONTATO', 40, 125, 10, 'bold', '#1E5A7A', 250),
                createText('contact', '📧 roberto.alves@email.com\n📱 (11) 99876-5432\n🔗 linkedin.com/in/robertoalves\n📍 São Paulo, SP', 40, 150, 10, 'normal', '#333333', 250),

                // Right Col: Keywords (Smart Component)
                {
                    id: 'keywords-section',
                    type: 'smart-element',
                    x: 300,
                    y: 120,
                    width: 255,
                    height: 120, // Increased height to fit content
                    content: 'ResumeSection',
                    componentData: {
                        templateId: 'champion-strategist',
                        section: {
                            type: 'keywords_list',
                            title: 'PALAVRAS-CHAVE DA VAGA (ATS)',
                            instruction: 'Extraia 6-8 termos técnicos da vaga.',
                            user_input: ['Gestão de Projetos', 'Logística', 'KPIs', 'Liderança', 'SAP', 'Melhoria Contínua', 'Six Sigma']
                        }
                    },
                    style: { opacity: 1, backgroundColor: 'transparent' }
                },

                // Summary (Full width)
                createText('summary-h', 'RESUMO ESTRATÉGICO', 40, 250, 12, 'bold', '#0B3B5C', 515),
                { id: 'summary-line', type: 'shape', x: 40, y: 265, width: 515, height: 2, content: '', style: { backgroundColor: '#F4B400', borderRadius: 0 } },
                createText('summary', 'Gestor de processos com 12 anos de experiência na otimização da cadeia de suprimentos. Histórico comprovado de redução de custos em 15% e aumento de eficiência operacional. Especialista em liderar equipes multidisciplinares em ambientes de alta pressão.', 40, 275, 11, 'normal', '#333333', 515),

                // Experience (STAR Method - Smart Component)
                {
                    id: 'star-experience',
                    type: 'smart-element',
                    x: 40,
                    y: 330,
                    width: 515,
                    height: 400,
                    content: 'ResumeSection',
                    componentData: {
                        templateId: 'champion-strategist',
                        section: {
                            type: 'star_experience',
                            // Actually passing items directly for the STAR component renderer
                            items: [
                                {
                                    position: 'Gerente de Logística',
                                    company: 'Transportadora Nacional S.A.',
                                    period: '2018 - Presente',
                                    achievements: [
                                        { star_situation: 'Desafio: Custos de frota elevados em 25% acima do mercado.', star_action: 'Ação: Renegociei contratos e implementei telemetria avançada.', star_result: 'Resultado: Economia de R$ 1.2M no primeiro ano.' },
                                        { star_situation: 'Desafio: Baixa pontualidade nas entregas (OTIF 85%).', star_action: 'Ação: Reestruturei as rotas usando algoritmo próprio.', star_result: 'Resultado: OTIF subiu para 98% em 6 meses.' }
                                    ]
                                },
                                {
                                    position: 'Coordenador de Operações',
                                    company: 'Logística Rápida Ltda.',
                                    period: '2014 - 2018',
                                    achievements: [
                                        { star_situation: 'Desafio: Processos manuais causando erros de estoque.', star_action: 'Ação: Liderei a implantação do sistema WMS.', star_result: 'Resultado: Acuracidade de estoque atingiu 99.9%.' }
                                    ]
                                }
                            ]
                        }
                    },
                    style: { opacity: 1, backgroundColor: 'transparent' }
                },

                // Education (Text for now, keeps it simple at bottom)
                createText('edu-h', 'FORMAÇÃO ACADÊMICA', 40, 750, 12, 'bold', '#0B3B5C', 515),
                { id: 'edu-line', type: 'shape', x: 40, y: 765, width: 515, height: 1, content: '', style: { backgroundColor: '#1E5A7A', borderRadius: 0 } },
                createText('edu', '• MBA em Gestão Empresarial - FGV (2016)\n• Bacharelado em Engenharia de Produção - USP (2013)', 40, 775, 11, 'normal', '#333333', 515),

            ].map(el => ({ ...el, style: { ...el.style, fontFamily: (el.style as any).fontFamily || '"Lato", "Arial", sans-serif' } } as EditorElement))
        },
        {
            id: 'champion-green-modern',
            name: 'Profissional Moderno (Verde)',
            category: 'champion',
            thumbnail: '', // Placeholder
            elements: [
                // --- Sidebar (Left, Green Gradient) ---
                // Background
                {
                    id: 'sidebar-bg', type: 'shape', x: 0, y: 0, width: 280, height: 842, content: '',
                    isBackground: true,
                    locked: true,
                    style: { background: 'linear-gradient(180deg, #0f9d58 0%, #0b7a44 100%)', borderRadius: 0, opacity: 1 }
                },
                {
                    id: 'sidebar-accent', type: 'shape', x: 275, y: 0, width: 5, height: 842, content: '',
                    isBackground: true,
                    locked: true,
                    style: { backgroundColor: '#ff9800', borderRadius: 0, opacity: 1 } // Orange accent
                },

                // Name (Sidebar)
                createText('name', 'CARLOS\nEDUARDO\nSILVA', 30, 50, 26, 'bold', '#ffffff', 220),
                createText('role', 'ASSISTENTE ADMINISTRATIVO', 30, 180, 11, 'normal', '#ffffff', 220),

                // Info (Sidebar)
                createText('info', '📍 São Paulo – SP\n📞 (11) 91234-5678\n✉️ carlos.silva@email.com\n🔗 linkedin.com/in/carloseduardo', 30, 220, 10, 'normal', '#ffffff', 220),

                // Skills (Sidebar - Smart Component)
                // Skills (Sidebar - Smart Component)
                {
                    id: 'skills-section',
                    type: 'smart-element',
                    x: 30, y: 340, width: 220, height: 200,
                    content: 'ResumeSection',
                    componentData: {
                        templateId: 'champion-green-modern',
                        section: {
                            type: 'simple_list',
                            title: 'COMPETÊNCIAS',
                            content: '• Pacote Office Avançado\n• Gestão de Tempo\n• Organização de Arquivos\n• Atendimento ao Cliente\n• Comunicação Eficaz'
                        }
                    },
                    style: { opacity: 1, color: '#ffffff', fontSize: 10 }
                },

                // --- Main Content (Right) ---

                // --- Main Content (Right) ---
                // Summary
                createText('summary-h', 'RESUMO', 320, 50, 14, 'bold', '#333333', 240),
                createText('summary', 'Profissional organizado e proativo com 3 anos de experiência em rotinas administrativas. Focado em otimização de processos e qualidade no atendimento.', 320, 80, 11, 'normal', '#333333', 240),

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
                            title: 'EXPERIÊNCIA',
                            items: [
                                {
                                    position: 'Assistente Administrativo',
                                    company: 'Empresa Alpha LTDA',
                                    period: 'Jan/2022 – Dez/2024',
                                    description: '• Organização e controle de documentos físicos e digitais\n• Elaboração de planilhas e relatórios administrativos\n• Suporte às áreas financeira e operacional\n• Redução de retrabalho por melhoria na organização interna'
                                },
                                {
                                    position: 'Auxiliar Administrativo',
                                    company: 'Empresa Beta Serviços',
                                    period: 'Fev/2020 – Dez/2021',
                                    description: '• Apoio nas rotinas diárias\n• Arquivamento e atualização de dados\n• Atendimento interno e organização de agendas'
                                }
                            ]
                        }
                    },
                    style: { opacity: 1 },
                },

                // Education
                createText('education-h', 'FORMAÇÃO', 320, 650, 14, 'bold', '#333333', 240),
                createText('education', 'Administração — Faculdade XYZ (2023)', 320, 680, 11, 'normal', '#333333', 240),

            ].map(el => ({ ...el, style: { ...el.style, fontFamily: (el.style as any).fontFamily || '"Poppins", "Roboto", sans-serif', lineHeight: 1.6 } } as EditorElement))
        },
        {
            id: 'champion-corporate-blue',
            name: 'Corporativo Azul',
            category: 'champion',
            thumbnail: '',
            elements: [
                // --- Sidebar (Left) ---
                {
                    id: 'sidebar-bg', type: 'shape', x: 0, y: 0, width: 200, height: 842, content: '',
                    isBackground: true,
                    locked: true,
                    style: { background: '#2563eb', borderRadius: 0, opacity: 1 } // Primary Blue
                },

                // Photo (Square, Top Left)
                {
                    id: 'photo-section',
                    type: 'smart-element',
                    x: 0, y: 0,
                    width: 200, height: 160,
                    content: 'ProfessionalPhoto',
                    componentData: {
                        templateId: 'champion-corporate-blue',
                        userImage: '', // Placeholder
                        photoConfig: { size: 'cover' }
                    },
                    style: { opacity: 1, background: '#2563eb' }
                },

                // Name (Left)
                createText('name', 'MARIANA\nCOSTA', 20, 220, 26, 'bold', '#ffffff', 160, 'left', true), // White Text
                createText('role', 'DESENVOLVEDORA FULL STACK', 20, 320, 10, 'normal', '#ffffff', 160, 'left', true),

                // "Perspectiva Profissional" (Left Profile)
                createText('profile-h', 'PERSPECTIVA PROFISSIONAL', 20, 370, 11, 'bold', '#ffffff', 160),
                createText('profile', 'Sou uma engenheira de software que cria aplicações de alto desempenho com arquitetura organizada.\nTambém sou experiente em design de produtos e relações com clientes.', 20, 410, 10, 'normal', '#ffffff', 160),

                // "Competências Principais" (Left Skills)
                createText('skills-h', 'COMPETÊNCIAS PRINCIPAIS', 20, 520, 11, 'bold', '#ffffff', 160),
                // Using Smart Component for Skills List to allow easy editing
                {
                    id: 'skills-section',
                    type: 'smart-element',
                    x: 20, y: 560, width: 160, height: 160,
                    content: 'ResumeSection',
                    componentData: {
                        templateId: 'champion-corporate-blue',
                        section: {
                            type: 'simple_list',
                            content: '• Desenvolvimento e Arquitetura de Software\n• Otimização de desempenho\n• Solução de problemas e controle de qualidade\n• Processos ágeis\n• Programação Front-End e Back-End'
                        }
                    },
                    style: { opacity: 1, color: '#ffffff', fontSize: 10 }
                },

                // Contact (Left Bottom)
                createText('contact-h', 'ENTRE EM CONTACTO COMIGO:', 20, 750, 11, 'bold', '#ffffff', 160),
                createText('contact', 'Email: ola@sitemaravilha.pt\nTelefone: (+351) 212 783 860\nWebsite: www.sitemaravilha.pt\nEndereço: Rua das Flores, 23, 1600 Oeiras', 20, 780, 10, 'normal', '#ffffff', 160),


                // --- Main Content (Right) ---

                // "Resumo Profissional" (Right Top)
                {
                    id: 'summary-section',
                    type: 'smart-element',
                    x: 230, y: 30, width: 330, height: 90,
                    content: 'ResumeSection',
                    componentData: {
                        templateId: 'champion-corporate-blue',
                        section: {
                            type: 'text',
                            title: 'RESUMO PROFISSIONAL',
                            content: 'Engenheira de Software com 5 anos de experiência em desenvolvimento full-stack. Especialista em Node.js e React, focada em escalabilidade e performance.'
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
                            type: 'timeline_experience', // Standard formatting
                            title: 'EXPERIÊNCIA PROFISSIONAL',
                            items: [
                                {
                                    position: 'Engenheira de Software Sênior',
                                    company: 'Tech Solutions Inc.',
                                    period: 'Setembro 2018 - presente',
                                    description: '• Liderança técnica de equipe de 5 desenvolvedores em projetos SaaS.\n• Arquitetura de microsserviços e otimização de APIs REST.'
                                },
                                {
                                    position: 'Desenvolvedora Web',
                                    company: 'Web Studio Digital',
                                    period: 'Julho 2017 - Agosto 2018',
                                    description: '• Desenvolvimento de interfaces responsivas com React e TailwindCSS.\n• Manutenção de sites e integração com gateways de pagamento.'
                                }
                            ]
                        }
                    },
                    style: { opacity: 1 }
                },

                // Education "PERCURSO ACADÊMICO"
                {
                    id: 'education-section',
                    type: 'smart-element',
                    x: 230, y: 530, width: 330, height: 180,
                    content: 'ResumeSection',
                    componentData: {
                        templateId: 'champion-corporate-blue',
                        section: {
                            type: 'education_list',
                            title: 'PERCURSO ACADÊMICO',
                            items: [
                                {
                                    school: 'Universidade Federal de Tecnologia',
                                    degree: 'Mestrado em Engenharia de Software',
                                    year: '2015 - 2017',
                                    description: '• Pesquisa em Inteligência Artificial aplicada a testes de software.'
                                },
                                {
                                    school: 'Faculdade de Ciências da Computação',
                                    degree: 'Bacharelado em Ciência da Computação',
                                    year: '2010 - 2014',
                                    description: '• Graduação com honras. Monitora de Algoritmos e Estrutura de Dados.'
                                }
                            ]
                        }
                    },
                    style: { opacity: 1 }
                },

                // References "REFERÊNCIAS PROFISSIONAIS"
                {
                    id: 'references-section',
                    type: 'smart-element',
                    x: 230, y: 730, width: 330, height: 100,
                    content: 'ResumeSection',
                    componentData: {
                        templateId: 'champion-corporate-blue',
                        section: {
                            type: 'text',
                            title: 'REFERÊNCIAS PROFISSIONAIS',
                            content: 'Joana Alves\nCEO, Cromático, Laboratórios Tecnológicos\nEmail: ola@sitemaravilha.pt\n\nCristóvão Barros\nProfessor, Faculdade da Beira\nEmail: ola@sitemaravilha.pt'
                        }
                    },
                    style: { opacity: 1 }
                }

            ].map(el => ({ ...el, style: { ...el.style, fontFamily: (el.style as any).fontFamily || '"Montserrat", "Arial", sans-serif', lineHeight: 1.5 } } as EditorElement))
        }
    ];
};
