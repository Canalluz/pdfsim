
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  AlignCenter,
  AlignRight,
  Trash2,
  Copy,
  Layout,
  MessageSquare,
  FileText,
  Type,
  Image as ImageIcon,
  Square,
  MousePointer2,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  Download,
  Layers,
  Zap,
  AlignLeft,
  Camera,
  X,
  FileEdit,
  Upload
} from 'lucide-react';

import { EditorElement, PDFPage, EditorState, ElementType } from './types';
import EditorCanvas from './components/EditorCanvas';
import PropertiesSidebar from './components/PropertiesSidebar';
import Toolbar from './components/Toolbar';


const INITIAL_PAGE_ID = 'page-1';
const INITIAL_STATE: EditorState = {
  currentPageId: INITIAL_PAGE_ID,
  selectedElementId: null,
  zoom: 200,
  penMode: false,
  pages: [
    {
      id: INITIAL_PAGE_ID,
      pageNumber: 1,
      elements: []
    }
  ]
};

import TemplateSelector from './components/TemplateSelector';
import { getTemplates, Template } from './data/templates';
import ResumeWizard from './components/ResumeWizard';
import ShapeSelector from './components/ShapeSelector';
import TableSelector from './components/TableSelector';
import SignatureModal from './components/SignatureModal';
import { Language, translations } from './utils/i18n';
import { saveToIndexedDB, getFromIndexedDB } from './utils/storage';
import { pingBackend, fetchWithRetry } from './utils/api';

const App: React.FC = () => {
  const [editorState, setEditorState] = useState<EditorState>(() => {
    // Initial State Restoration from localStorage
    const saved = localStorage.getItem('pdfsim_editor_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Basic validation of restored state
        if (parsed && Array.isArray(parsed.pages)) return parsed;
      } catch (e) {
        console.warn('Failed to restore editor state:', e);
      }
    }
    return INITIAL_STATE;
  });

  const [isCropping, setIsCropping] = useState(false);

  const [language, setLanguage] = useState<Language>('pt');

  const [isTemplateSelectorOpen, setIsTemplateSelectorOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isShapeSelectorOpen, setIsShapeSelectorOpen] = useState(false);
  const [isTableSelectorOpen, setIsTableSelectorOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [penSize, setPenSize] = useState(2);
  const [isExportMode, setIsExportMode] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  // Word Conversion States
  const [isConverting, setIsConverting] = useState(false);
  const [showWordReimport, setShowWordReimport] = useState(false);
  const wordInputRef = useRef<HTMLInputElement>(null);

  const currentPage = editorState.pages.find(p => p.id === editorState.currentPageId) || editorState.pages[0] || { id: 'temp-page', pageNumber: 1, elements: [] };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const activeCameraElementId = useRef<string | null>(null);

  // Auto-save editor state to localStorage (with error handling for quota)
  useEffect(() => {
    const saveState = setTimeout(() => {
      try {
        localStorage.setItem('pdfsim_editor_state', JSON.stringify(editorState));
      } catch (e: any) {
        if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
          console.warn('LocalStorage quota exceeded, relying on IndexedDB for checkout backups.');
        }
      }
    }, 1000); // 1s debounce
    return () => clearTimeout(saveState);
  }, [editorState]);

  // Silent wake-up to minimize Render "cold start" delay
  useEffect(() => {
    pingBackend();
  }, []);

  // GLOBAL EXPORT HANDLER (Effect)
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get('payment_success')) {
      localStorage.setItem('is_premium_unlocked', 'true');
      window.history.replaceState({}, document.title, window.location.pathname);

      const runExport = async () => {
        try {
          setExportStatus(language === 'pt' ? 'Pagamento confirmado! Preparando modo de impressão...' : 'Payment confirmed! Preparing print mode...');
          window.scrollTo(0, 0);

          let recoveredPages: PDFPage[] | null = null;
          const isCurrentStateEmpty = editorState.pages.length === 0 || (editorState.pages.length === 1 && editorState.pages[0].elements.length === 0);

          // Critical Fix: Always prefer the specific export backup created at checkout time.
          // The previous logic only looked at backups if the current state was empty,
          // but often the app initializes with STALE data from 'pdfsim_editor_state',
          // causing the fresh 'pdfsim_export_backup' to be ignored.
          const sessionBackup = sessionStorage.getItem('pdfsim_export_backup');
          const localBackup = localStorage.getItem('pdfsim_export_backup');
          const indexedBackup = await getFromIndexedDB<EditorState>('pdfsim_export_backup');

          const attemptParse = (raw: string | null) => {
            if (!raw) return null;
            try {
              const parsed = JSON.parse(raw);
              if (parsed?.pages?.length > 0) return parsed;
            } catch (e) { }
            return null;
          };

          const exportState = indexedBackup || attemptParse(sessionBackup) || attemptParse(localBackup);

          if (exportState) {
            console.log("Restoring explicit export backup for printing...");
            recoveredPages = exportState.pages;
            setEditorState(exportState);
          } else if (isCurrentStateEmpty) {
            // Fallback to main save if no specific export backup exists
            const mainSave = localStorage.getItem('pdfsim_editor_state');
            const recoveredState = attemptParse(mainSave);
            if (recoveredState) {
              recoveredPages = recoveredState.pages;
              setEditorState(recoveredState);
            }
          } else {
            recoveredPages = editorState.pages;
          }

          if (!recoveredPages || recoveredPages.length === 0) return;

          setIsExportMode(true);
          await new Promise(resolve => setTimeout(resolve, 3500));

          const exportContainer = document.getElementById('visible-export-container');
          if (!exportContainer) throw new Error("Container de exportação não encontrado.");

          setExportStatus(language === 'pt' ? 'Gerando PDF...' : 'Generating PDF...');
          // @ts-ignore
          const html2pdf = (await import('html2pdf.js')).default;

          const opt = {
            margin: 0,
            filename: 'curriculo_profissional.pdf',
            image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: {
              scale: 2,
              useCORS: true,
              letterRendering: true,
              backgroundColor: '#ffffff',
              scrollY: 0
            },
            jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' as const }
          };

          await html2pdf().from(exportContainer).set(opt).save();

          setExportStatus(language === 'pt' ? 'Pronto!' : 'Ready!');
          localStorage.removeItem('is_premium_unlocked');
          localStorage.removeItem('pendingExportMetadata');

          // Auto-close export mode after success
          setTimeout(() => {
            setExportStatus(null);
            setIsExportMode(false);
          }, 2000);
        } catch (err: any) {
          console.error('Auto-export failed:', err);
          setExportStatus(null);
          alert(`Erro ao gerar PDF: ${err.message || 'Erro desconhecido'}`);
          setIsExportMode(false);
        }
      };

      runExport();
    }
  }, [language]);

  const handleApplyTemplate = (template: Template) => {
    const PAGE_HEIGHT = 842;
    const MARGIN_BOTTOM = 20;
    const MARGIN_TOP = 50;
    const backgroundElements = template.elements.filter(el => el.isBackground);
    const headerElements = backgroundElements.filter(el => el.y < 250);
    const topBackgroundHeight = headerElements.reduce((max, el) => {
      const h = el.height || (el.type === 'text' ? (el.style.fontSize || 10) * 1.5 : 20);
      return Math.max(max, el.y + h);
    }, 0);
    const REFLOW_MARGIN_TOP = headerElements.length > 0 ? Math.max(MARGIN_TOP + 120, topBackgroundHeight + 20) : MARGIN_TOP;
    const contentElements = template.elements.filter(el => !el.isBackground).sort((a, b) => a.y - b.y);
    const pages: PDFPage[] = [];
    let currentElements: EditorElement[] = [...backgroundElements];
    let pageNumber = 1;
    let yOffset = 0;
    let currentPageYMax = PAGE_HEIGHT - MARGIN_BOTTOM;

    contentElements.forEach((el, index) => {
      const elementHeight = el.height || 20;
      let elementY = el.y + yOffset;
      const isHeader = el.id.endsWith('-h') || el.id.includes('header');
      let shouldBreak = elementY + elementHeight > currentPageYMax && el.type !== 'shape';
      if (isHeader && !shouldBreak) {
        let peekY = elementY + elementHeight;
        for (let i = 1; i <= 3; i++) {
          const peekEl = contentElements[index + i];
          if (peekEl) {
            const peekElHeight = (peekEl.height || 20) + 4;
            const peekElAbsoluteY = peekEl.y + yOffset;
            if (peekY + peekElHeight > currentPageYMax || peekElAbsoluteY + peekElHeight > currentPageYMax) {
              shouldBreak = true;
              break;
            }
            peekY = Math.max(peekY + peekElHeight, peekElAbsoluteY + peekElHeight);
          }
        }
      }
      if (shouldBreak) {
        pages.push({
          id: `page-${pageNumber}-${Date.now()}`,
          pageNumber: pageNumber,
          elements: currentElements.map(cel => ({ ...cel, id: `${cel.id}-${pageNumber}-${Math.random().toString(36).substr(2, 5)}` }))
        });
        pageNumber++;
        currentElements = [...backgroundElements];
        yOffset = REFLOW_MARGIN_TOP - el.y;
        elementY = REFLOW_MARGIN_TOP;
      }
      currentElements.push({ ...el, y: elementY, id: `${el.id}-${pageNumber}-${Math.random().toString(36).substr(2, 5)}` });
    });
    pages.push({ id: `page-${pageNumber}-${Date.now()}`, pageNumber: pageNumber, elements: currentElements });
    setEditorState(prev => ({ ...prev, selectedElementId: null, pages: pages, currentPageId: pages[0].id, eraserMode: false }));
    setIsTemplateSelectorOpen(false);
  };

  const handleWizardComplete = (data: any, template: any) => {
    const populatedElements = template.elements.map((element: EditorElement) => {
      const newElement = { ...element };
      if (element.type === 'text') {
        const id = element.id.toLowerCase();
        if (id.includes('name') && !id.includes('company') && !id.includes('fullname')) {
          newElement.content = data.fullName || element.content;
        } else if (id === 'role' || id === 'tagline') {
          newElement.content = element.content;
        } else if ((id.includes('contact') || id === 'info' || id === 'contact-info') && !id.includes('header') && !id.includes('-h')) {
          const contactParts = [];
          if (data.location) contactParts.push(`📍 ${data.location}`);
          if (data.phone) contactParts.push(`📞 ${data.phone}`);
          if (data.email) contactParts.push(`✉️ ${data.email}`);
          if (data.website) contactParts.push(`🔗 ${data.website}`);
          if (contactParts.length > 0) {
            if (element.content.includes('  |  ') || element.content.includes('  •  ')) {
              newElement.content = contactParts.join('  |  ');
            } else {
              newElement.content = contactParts.join('\n');
            }
          }
        } else if (id.includes('summary') && !id.includes('header') && !id.includes('-h') && !id.includes('title')) {
          if (data.summary) newElement.content = data.summary;
        } else if (id === 'about' || id === 'profile') {
          if (data.summary) newElement.content = data.summary;
        } else if (id === 'job1-role' && data.experience.length > 0) {
          newElement.content = data.experience[0].title || element.content;
        } else if ((id === 'job1-comp' || id === 'job1-company') && data.experience.length > 0) {
          const exp = data.experience[0];
          newElement.content = exp.period ? `${exp.company} | ${exp.period}` : exp.company;
        } else if ((id === 'job1-date' || id === 'job1-period') && data.experience.length > 0 && data.experience[0].period) {
          newElement.content = data.experience[0].period;
        } else if ((id === 'job1-desc' || id === 'job1-achievements') && data.experience.length > 0 && data.experience[0].description) {
          newElement.content = data.experience[0].description;
        } else if (id === 'job2-role' && data.experience.length > 1) {
          newElement.content = data.experience[1].title || element.content;
        } else if ((id === 'job2-comp' || id === 'job2-company') && data.experience.length > 1) {
          const exp = data.experience[1];
          newElement.content = exp.period ? `${exp.company} | ${exp.period}` : exp.company;
        } else if ((id === 'job2-date' || id === 'job2-period') && data.experience.length > 1 && data.experience[1].period) {
          newElement.content = data.experience[1].period;
        } else if ((id === 'job2-desc' || id === 'job2-achievements') && data.experience.length > 1 && data.experience[1].description) {
          newElement.content = data.experience[1].description;
        } else if ((id === 'edu1-title' || id === 'edu1-degree') && data.education.length > 0) {
          newElement.content = data.education[0].degree || element.content;
        } else if (id === 'edu1-school' && data.education.length > 0) {
          const edu = data.education[0];
          newElement.content = edu.year ? `${edu.school} | ${edu.year}` : edu.school;
        } else if (id === 'edu1-year' && data.education.length > 0 && data.education[0].year) {
          newElement.content = data.education[0].year;
        } else if ((id === 'edu2-title' || id === 'edu2-degree') && data.education.length > 1) {
          newElement.content = data.education[1].degree || element.content;
        } else if (id === 'edu2-school' && data.education.length > 1) {
          const edu = data.education[1];
          newElement.content = edu.year ? `${edu.school} | ${edu.year}` : edu.school;
        } else if (id === 'edu2-year' && data.education.length > 1 && data.education[1].year) {
          newElement.content = data.education[1].year;
        } else if ((id === 'edu' || id === 'edu1' || id === 'education') && !id.includes('-h') && data.education.length > 0) {
          const parts = data.education.map((edu: any) => {
            return edu.year ? `• ${edu.degree} - ${edu.school} | ${edu.year}` : `• ${edu.degree} - ${edu.school}`;
          });
          newElement.content = parts.join('\n');
        } else if (id.includes('skill') && !id.includes('header') && !id.includes('-h')) {
          if (data.skills && data.skills.length > 0) {
            newElement.content = data.skills.map((s: string) => `• ${s}`).join('\n');
          }
        } else if ((id.includes('skill-list') || id.includes('skill-col') || id.includes('comp-col')) && data.skills.length > 0) {
          const colMatch = id.match(/col(\d)/);
          if (colMatch) {
            const colIndex = parseInt(colMatch[1]) - 1;
            const chunkSize = Math.ceil(data.skills.length / 3);
            const start = colIndex * chunkSize;
            const chunk = data.skills.slice(start, start + chunkSize);
            if (chunk.length > 0) newElement.content = chunk.map((s: string) => `• ${s}`).join('\n');
          } else {
            newElement.content = data.skills.map((s: string) => `• ${s}`).join('\n');
          }
        }
      } else if (element.type === 'smart-element') {
        const content = element.content?.toLowerCase() || '';
        if (content.includes('photo')) {
          newElement.componentData = { ...element.componentData, userImage: data.photo || '' };
        } else if (content.includes('resumesection') && element.componentData?.section) {
          const section = element.componentData.section;
          if (section.type === 'timeline_experience' || section.type === 'star_experience') {
            if (data.experience.length > 0) {
              newElement.componentData = { ...element.componentData, section: { ...section, items: data.experience.map((exp: any) => ({ position: exp.title, company: exp.company, period: exp.period, description: exp.description })) } };
            }
          } else if (section.type === 'education_list') {
            if (data.education.length > 0) {
              newElement.componentData = { ...element.componentData, section: { ...section, items: data.education.map((edu: any) => ({ school: edu.school, degree: edu.degree, year: edu.year })) } };
            }
          } else if (section.type === 'skills_grid' || section.type === 'simple_list') {
            if (data.skills.length > 0) {
              newElement.componentData = { ...element.componentData, section: { ...section, content: data.skills.map((s: string) => `• ${s}`).join('\n') } };
            }
          }
        }
      }
      return newElement;
    });
    const pages: PDFPage[] = [{ id: `page-1-${Date.now()}`, pageNumber: 1, elements: populatedElements }];
    setEditorState(prev => ({ ...prev, selectedElementId: null, pages: pages, currentPageId: pages[0].id }));
    setIsWizardOpen(false);
  };

  // Automatic Pagination Logic (Refined)
  const checkPageOverflow = (pageIndex: number, currentPages: PDFPage[], currentSelectedId: string | null): { pages: PDFPage[], newSelectedId?: string, newPageId?: string } => {
    const PAGE_HEIGHT = 842;
    const MARGIN_BOTTOM = 60;
    const CONTENT_MAX_Y = PAGE_HEIGHT - MARGIN_BOTTOM;
    const TOP_MARGIN_NEXT_PAGE = 50;

    const page = currentPages[pageIndex];
    if (!page) return { pages: currentPages };

    const overflowingElements = page.elements.filter(el => {
      if (el.isBackground || el.locked) return false;
      return (Number(el.y) + Number(el.height)) > CONTENT_MAX_Y;
    });

    if (overflowingElements.length === 0) return { pages: currentPages };

    overflowingElements.sort((a, b) => a.y - b.y);

    let nextPageIndex = pageIndex + 1;
    let nextPages = [...currentPages];

    if (nextPageIndex >= nextPages.length) {
      nextPages.push({ id: `page-${Date.now()}-${Math.random()}`, pageNumber: nextPages.length + 1, elements: [] });
    }

    const elementsToKeep: EditorElement[] = [];
    const moves: { targetId?: string, element: EditorElement }[] = [];
    let newSelectedId: string | undefined;
    let newPageId: string | undefined;

    page.elements.forEach(el => {
      if (!overflowingElements.includes(el)) {
        elementsToKeep.push(el);
        return;
      }

      if (el.type === 'text' && el.y < CONTENT_MAX_Y) {
        const availableHeight = Math.max(0, CONTENT_MAX_Y - el.y);
        const fontSize = el.style.fontSize || 12;
        const lineHeight = (el.style.lineHeight || 1.4) * fontSize;
        const paddingOffset = 10;
        const maxLines = Math.floor((availableHeight - paddingOffset) / lineHeight);

        if (maxLines <= 0) {
          moves.push({ element: el });
          return;
        }

        const lines = el.content.split('\n');
        const part1 = lines.slice(0, maxLines).join('\n');
        const part2 = lines.slice(maxLines).join('\n');

        if (part2.length > 0) {
          elementsToKeep.push({
            ...el,
            content: part1,
            height: maxLines * lineHeight + paddingOffset,
            originId: el.originId || el.id
          });

          const nextPage = nextPages[nextPageIndex];
          const existingChild = nextPage.elements.find(child => child.originId === (el.originId || el.id));

          if (existingChild) {
            // Use replacement for master-slave flow consistency
            moves.push({
              targetId: existingChild.id,
              element: { ...el, id: existingChild.id, content: part2, originId: el.originId || el.id }
            });
          } else {
            const splitId = `${el.id}-split-${Date.now()}`;
            moves.push({
              element: { ...el, id: splitId, content: part2, y: 0, originId: el.originId || el.id }
            });
            if (el.id === currentSelectedId) {
              newSelectedId = splitId;
              newPageId = nextPage.id;
            }
          }
        } else {
          moves.push({ element: el });
        }
      } else {
        moves.push({ element: el });
      }
    });

    nextPages[pageIndex] = { ...page, elements: elementsToKeep };
    const nextPage = nextPages[nextPageIndex];
    let updatedNextElements = [...nextPage.elements];
    let pushShift = 0;

    // Apply moves and calculate shifting
    moves.forEach(move => {
      if (move.targetId) {
        const target = updatedNextElements.find(e => e.id === move.targetId);
        if (target) {
          const fontSize = target.style.fontSize || 12;
          const lineHeight = (target.style.lineHeight || 1.4) * fontSize;
          const newHeight = move.element.content.split('\n').length * lineHeight + 10;
          const delta = newHeight - target.height;
          pushShift += Math.max(0, delta);
          updatedNextElements = updatedNextElements.map(e => e.id === move.targetId ? { ...e, content: move.element.content, height: newHeight } : e);
        }
      } else {
        const h = move.element.height || 50;
        updatedNextElements.unshift({ ...move.element, y: TOP_MARGIN_NEXT_PAGE + pushShift });
        pushShift += h + 12;
      }
    });

    // Shift everything else on next page
    const moveIds = moves.map(m => m.targetId || m.element.id);
    updatedNextElements = updatedNextElements.map(el => {
      if (moveIds.includes(el.id)) return el;
      return { ...el, y: el.y + pushShift };
    });

    nextPages[nextPageIndex] = { ...nextPage, elements: updatedNextElements };

    const recursiveResult = checkPageOverflow(nextPageIndex, nextPages, currentSelectedId);
    return {
      pages: recursiveResult.pages,
      newSelectedId: newSelectedId || recursiveResult.newSelectedId,
      newPageId: newPageId || recursiveResult.newPageId
    };
  };

  const handleUpdateElement = useCallback((pageId: string, elementId: string, updates: Partial<EditorElement>) => {
    setEditorState(prev => {
      const pageIndex = prev.pages.findIndex(p => p.id === pageId);
      if (pageIndex === -1) return prev;

      const updatedPages = prev.pages.map((p, idx) =>
        idx === pageIndex
          ? { ...p, elements: p.elements.map(el => el.id === elementId ? { ...el, ...updates } : el) }
          : p
      );

      if (updates.height || updates.y || updates.content) {
        try {
          const result = checkPageOverflow(pageIndex, updatedPages, prev.selectedElementId);
          return {
            ...prev,
            pages: result.pages,
            selectedElementId: result.newSelectedId || prev.selectedElementId,
            currentPageId: result.newPageId || prev.currentPageId
          };
        } catch (e) {
          console.error("Pagination Error", e);
          return { ...prev, pages: updatedPages };
        }
      }

      return { ...prev, pages: updatedPages };
    });
  }, [checkPageOverflow]);

  const handleDeleteElement = useCallback(() => {
    if (!editorState.selectedElementId) return;
    setEditorState(prev => ({
      ...prev,
      selectedElementId: null,
      pages: prev.pages.map(p => ({
        ...p,
        elements: p.elements.filter(el => el.id !== prev.selectedElementId)
      }))
    }));
  }, [editorState.selectedElementId]);

  // Global Delete Key Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Check if an element is selected
      if (!editorState.selectedElementId) return;

      // 2. Check for Delete/Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const activeTag = document.activeElement?.tagName.toLowerCase();
        const isInputActive = activeTag === 'input' || activeTag === 'textarea';

        if (isInputActive) {
          // If editing text, require CTRL+DELETE to remove the element
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleDeleteElement();
          }
        } else {
          // If not in input mode (e.g. image/shape selected), delete immediately
          e.preventDefault();
          handleDeleteElement();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editorState.selectedElementId, handleDeleteElement]);

  const handleBringToFront = useCallback(() => {
    if (!editorState.selectedElementId) return;
    setEditorState(prev => {
      const page = prev.pages.find(p => p.id === prev.currentPageId);
      if (!page) return prev;
      const elementIndex = page.elements.findIndex(el => el.id === prev.selectedElementId);
      if (elementIndex === -1 || elementIndex === page.elements.length - 1) return prev;
      const newElements = [...page.elements];
      const [movedElement] = newElements.splice(elementIndex, 1);
      newElements.push(movedElement);
      return { ...prev, pages: prev.pages.map(p => p.id === prev.currentPageId ? { ...p, elements: newElements } : p) };
    });
  }, [editorState.selectedElementId, editorState.currentPageId]);

  const handleSendToBack = useCallback(() => {
    if (!editorState.selectedElementId) return;
    setEditorState(prev => {
      const page = prev.pages.find(p => p.id === prev.currentPageId);
      if (!page) return prev;
      const elementIndex = page.elements.findIndex(el => el.id === prev.selectedElementId);
      if (elementIndex === -1 || elementIndex === 0) return prev;
      const newElements = [...page.elements];
      const [movedElement] = newElements.splice(elementIndex, 1);
      newElements.unshift(movedElement);
      return { ...prev, pages: prev.pages.map(p => p.id === prev.currentPageId ? { ...p, elements: newElements } : p) };
    });
  }, [editorState.selectedElementId, editorState.currentPageId]);
  // Centralized tool reset logic
  const resetToolModes = useCallback((keepSelectedId = true) => {
    setEditorState(prev => ({
      ...prev,
      penMode: false,
      eraserMode: false,
      selectedElementId: keepSelectedId ? prev.selectedElementId : null
    }));
    setIsShapeSelectorOpen(false);
    setIsTableSelectorOpen(false);
    setIsTemplateSelectorOpen(false);
  }, []);

  const handleToggleEraser = useCallback(() => {
    setEditorState(prev => {
      const newMode = !prev.eraserMode;
      if (newMode) {
        setIsShapeSelectorOpen(false);
        setIsTableSelectorOpen(false);
        setIsTemplateSelectorOpen(false);
      }
      return { ...prev, eraserMode: newMode, penMode: false, selectedElementId: null };
    });
  }, []);

  const handleTogglePen = useCallback(() => {
    setEditorState(prev => {
      const newMode = !prev.penMode;
      if (newMode) {
        setIsShapeSelectorOpen(false);
        setIsTableSelectorOpen(false);
        setIsTemplateSelectorOpen(false);
      }
      return { ...prev, penMode: newMode, eraserMode: false, selectedElementId: null };
    });
  }, []);

  const handleAddElement = (type: ElementType, content?: string, style: any = {}, componentData?: any, w?: number, h?: number) => {
    resetToolModes();
    const newElement: EditorElement = {
      id: `el-${Date.now()}`,
      type,
      x: 100,
      y: 100,
      width: w || (type === 'text' ? 200 : 100),
      height: h || (type === 'text' ? 50 : 100),
      content: content || (type === 'text' ? 'Novo Texto' : ''),
      style: {
        fontSize: 14,
        color: '#000000',
        ...style
      },
      componentData
    };
    setEditorState(prev => ({
      ...prev,
      pages: prev.pages.map(p => p.id === prev.currentPageId ? { ...p, elements: [...p.elements, newElement] } : p),
      selectedElementId: newElement.id,
    }));
  };

  const handleAddPage = () => {
    resetToolModes();
    const newPage: PDFPage = {
      id: `page-${Date.now()}`,
      pageNumber: editorState.pages.length + 1,
      elements: []
    };
    setEditorState(prev => ({
      ...prev,
      pages: [...prev.pages, newPage],
      currentPageId: newPage.id
    }));
  };

  const handleCheckoutAndExport = async () => {
    setIsProcessingPayment(true);
    try {
      const stateStr = JSON.stringify(editorState);

      // Attempt multiple storage fallback
      try {
        sessionStorage.setItem('pdfsim_export_backup', stateStr);
        localStorage.setItem('pdfsim_export_backup', stateStr);
      } catch (storageErr) {
        console.warn('Storage quota exceeded for localStorage, using IndexedDB exclusively.');
      }

      // Always save to IndexedDB as it's the most robust for large data
      await saveToIndexedDB('pdfsim_export_backup', editorState);

      let apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
      // Remove trailing slash if present to avoid double slashes
      if (apiUrl.endsWith('/')) apiUrl = apiUrl.slice(0, -1);

      console.log('Initiating checkout with API:', apiUrl);

      let res;
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('TIMEOUT')), 15000)
        );

        res = await Promise.race([
          fetchWithRetry(`${apiUrl}/create-checkout-session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              priceId: 'price_1Qv3xMBy8vR5Pmxm0Vz12345',
              origin: window.location.origin,
              email: 'user_email_placeholder@example.com'
            })
          }),
          timeoutPromise
        ]) as Response;

      } catch (fetchErr: any) {
        console.error('Network Error:', fetchErr);
        const isTimeout = fetchErr.message === 'TIMEOUT';

        throw new Error(language === 'pt'
          ? isTimeout
            ? "O servidor está demorando um pouco para iniciar (cold start). Por favor, aguarde 15 segundos e tente novamente."
            : `Erro de Conexão: O servidor em ${apiUrl} não pôde ser alcançado. Verifique sua internet ou tente novamente.`
          : isTimeout
            ? "Server is taking a while to start (cold start). Please wait 15 seconds and try again."
            : `Connection Error: Could not reach server at ${apiUrl}. Please check your internet or try again.`);
      }

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Server Error ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else throw new Error('No checkout URL returned');

    } catch (err: any) {
      console.error('Checkout Error:', err);
      alert(language === 'pt'
        ? `Erro detalhado: ${err.message}`
        : `Detailed Error: ${err.message}`);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleImageUploadTrigger = (elementId?: string) => {
    activeCameraElementId.current = elementId || null;
    fileInputRef.current?.click();
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const dataUrl = loadEvent.target?.result as string;
        const targetId = activeCameraElementId.current;

        if (targetId) {
          setEditorState(prev => {
            let targetPageId = '';
            let isPhoto = false;

            // 1. Precise search by ID
            for (const page of prev.pages) {
              const el = page.elements.find(e => e.id === targetId);
              if (el) {
                targetPageId = page.id;
                isPhoto = el.type === 'smart-element' && (el.content === 'ProfessionalPhoto' || el.content?.toLowerCase().includes('photo'));
                break;
              }
            }

            // 2. Fallback: Search for the first ProfessionalPhoto on the current page if target not found
            if (!targetPageId) {
              const currentPage = prev.pages.find(p => p.id === prev.currentPageId);
              if (currentPage) {
                const fallbackEl = currentPage.elements.find(el => el.type === 'smart-element' && el.content?.toLowerCase().includes('photo'));
                if (fallbackEl) {
                  targetPageId = currentPage.id;
                  // @ts-ignore - we know it's a photo now
                  activeCameraElementId.current = fallbackEl.id;
                  isPhoto = true;
                }
              }
            }

            const finalTargetId = activeCameraElementId.current;

            if (targetPageId && finalTargetId) {
              return {
                ...prev,
                pages: prev.pages.map(p =>
                  p.id === targetPageId
                    ? {
                      ...p, elements: p.elements.map(el =>
                        el.id === finalTargetId
                          ? (isPhoto
                            ? { ...el, componentData: { ...el.componentData, userImage: dataUrl } }
                            : { ...el, content: dataUrl })
                          : el
                      )
                    }
                    : p
                )
              };
            }
            return prev;
          });
        } else {
          handleAddElement('image', dataUrl);
        }
      };
      reader.readAsDataURL(file);
      // Reset input to allow re-uploading the same file
      e.target.value = '';
    }
  };

  const handlePdfUploadTrigger = () => pdfInputRef.current?.click();

  const handlePdfFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      alert(language === 'pt' ? 'Importação de PDF em breve!' : 'PDF Import coming soon!');
    }
  };

  const handleConvertToWord = async () => alert('Word Conversion coming soon!');
  const handleWordReimport = () => wordInputRef.current?.click();
  const handleWordFileChange = () => { };

  const startCamera = (elementId?: string) => {
    activeCameraElementId.current = elementId || null;
    setShowCamera(true);
    navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
      if (videoRef.current) videoRef.current.srcObject = stream;
    });
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context?.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const targetId = activeCameraElementId.current;

      if (targetId) {
        setEditorState(prev => {
          let targetPageId = '';
          let isPhoto = false;

          // 1. Precise search
          for (const page of prev.pages) {
            const el = page.elements.find(e => e.id === targetId);
            if (el) {
              targetPageId = page.id;
              isPhoto = el.type === 'smart-element' && (el.content === 'ProfessionalPhoto' || el.content?.toLowerCase().includes('photo'));
              break;
            }
          }

          // 2. Fallback search
          if (!targetPageId) {
            const currentPage = prev.pages.find(p => p.id === prev.currentPageId);
            if (currentPage) {
              const fallbackEl = currentPage.elements.find(el => el.type === 'smart-element' && el.content?.toLowerCase().includes('photo'));
              if (fallbackEl) {
                targetPageId = currentPage.id;
                // @ts-ignore
                activeCameraElementId.current = fallbackEl.id;
                isPhoto = true;
              }
            }
          }

          const finalTargetId = activeCameraElementId.current;

          if (targetPageId && finalTargetId) {
            return {
              ...prev,
              pages: prev.pages.map(p =>
                p.id === targetPageId
                  ? {
                    ...p, elements: p.elements.map(el =>
                      el.id === finalTargetId
                        ? (isPhoto
                          ? { ...el, componentData: { ...el.componentData, userImage: dataUrl } }
                          : { ...el, content: dataUrl })
                        : el
                    )
                  }
                  : p
              )
            };
          }
          return prev;
        });
      } else {
        handleAddElement('image', dataUrl);
      }
      stopCamera();
    }
  };

  const handleUpdateDrawing = (pageId: string, drawing: string) => {
    setEditorState(prev => ({
      ...prev,
      pages: prev.pages.map(p => p.id === pageId ? { ...p, drawing } : p)
    }));
  };

  const handleErase = (pageId: string, x: number, y: number, w: number, h: number) => { };

  const selectedElement = currentPage?.elements?.find(el => el.id === editorState.selectedElementId);

  // Export Mode Render
  if (isExportMode) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center">
        <div className="fixed top-0 left-0 right-0 bg-white shadow-md p-4 z-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-bold text-gray-700 text-lg">
              {exportStatus || (language === 'pt' ? 'Modo de Impressão' : 'Print Mode')}
            </span>
            {isProcessingPayment && <span className="animate-spin">⏳</span>}
          </div>
          <button
            onClick={() => setIsExportMode(false)}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 font-medium"
          >
            {language === 'pt' ? 'Voltar ao Editor' : 'Back to Editor'}
          </button>
        </div>

        <div className="w-full h-full flex flex-col items-center overflow-auto bg-gray-50">
          <div className="w-full flex flex-col items-center py-10">
            {/* CONTAINER Targeted by html2pdf - Keep it clean of extraneous padding */}
            <div id="visible-export-container">
              {editorState.pages.map((page) => (
                <div key={page.id} style={{ width: '595pt', height: '842pt', position: 'relative', overflow: 'hidden', background: '#ffffff', marginBottom: '20px' }}>
                  <EditorCanvas
                    language={language}
                    page={page}
                    selectedElementId={null}
                    onSelectElement={() => { }}
                    onUpdateElement={() => { }}
                    scale={1.333} // Standard PT to PX conversion
                    isExporting={true}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // MAIN EDITOR RENDER
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50 relative font-inter">
      {/* Automatic Export Overlay */}
      {exportStatus && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-6 max-w-sm text-center border border-white/20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <FileText className="text-blue-600 animate-pulse" size={24} />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{exportStatus}</h3>
              <p className="text-sm text-gray-500 mb-4">
                {language === 'pt' ? 'Isso deve levar apenas alguns segundos.' : 'This should only take a few seconds.'}
              </p>
              {downloadUrl && (
                <a
                  href={downloadUrl}
                  download="curriculo-profissional.pdf"
                  className="inline-flex items-center justify-center px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition gap-2"
                  onClick={() => setTimeout(() => setExportStatus(null), 1000)}
                >
                  <Download size={18} />
                  {language === 'pt' ? 'Baixar PDF Manualmente' : 'Download PDF Manually'}
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Top Header - Premium Dark Glassmorphism */}
      <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950 px-6 shadow-xl z-50 relative">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20 overflow-hidden border border-white/20 p-1.5">
            <img src="/logo.png" alt="Logo" className="h-full w-full object-contain brightness-0 invert" />
          </div>
          <div className="mr-8">
            <h1 className="text-xl font-black text-white leading-tight tracking-tight">PDF Sim <span className="text-indigo-400">Pro</span></h1>
            <div className="flex items-center gap-1.5 opacity-60">
              <div className="w-1 h-1 rounded-full bg-emerald-400"></div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Premium Editor v2.0</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-900/50 px-4 py-2 rounded-2xl border border-slate-800/50 shadow-inner ml-4">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mt-0.5">{translations[language].languageName}:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLanguage('pt')}
                className={`transition-all duration-300 hover:scale-110 active:scale-95 ${language === 'pt' ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-950 scale-105' : 'grayscale opacity-30 hover:opacity-100'}`}
              >
                <img src="https://flagcdn.com/w80/br.png" alt="BR" className="w-8 h-5 object-cover rounded shadow-md" />
              </button>
              <button
                onClick={() => setLanguage('es')}
                className={`transition-all duration-300 hover:scale-110 active:scale-95 ${language === 'es' ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-950 scale-105' : 'grayscale opacity-30 hover:opacity-100'}`}
              >
                <img src="https://flagcdn.com/w80/es.png" alt="ES" className="w-8 h-5 object-cover rounded shadow-md" />
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`transition-all duration-300 hover:scale-110 active:scale-95 ${language === 'en' ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-950 scale-105' : 'grayscale opacity-30 hover:opacity-100'}`}
              >
                <img src="https://flagcdn.com/w80/gb.png" alt="EN" className="w-8 h-5 object-cover rounded shadow-md" />
              </button>
            </div>
          </div>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 hidden 2xl:flex items-center gap-3">
          <div className="h-px w-8 bg-gradient-to-r from-transparent to-slate-700"></div>
          <p className="text-xl font-bold text-slate-300 italic tracking-wide">
            "Currículo Inteligente, visão de recrutador e edição de PDF"
          </p>
          <div className="h-px w-8 bg-gradient-to-l from-transparent to-slate-700"></div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsWizardOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white px-4 py-2 text-sm font-bold transition-all border border-indigo-600/30 group"
          >
            <Zap size={16} className="text-indigo-500 group-hover:text-white transition-colors" />
            {translations[language].wizardTitle || "Assistente Smart"}
          </button>

          <div className="w-px h-6 bg-slate-800 mx-2"></div>

          <button
            onClick={handlePdfUploadTrigger}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all border border-transparent"
          >
            <Upload size={18} />
            {translations[language].insertPdf}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageFileChange} />
        <input type="file" ref={pdfInputRef} className="hidden" accept="application/pdf" onChange={handlePdfFileChange} />
        <input type="file" ref={wordInputRef} className="hidden" accept=".docx" onChange={handleWordFileChange} />

        <Toolbar
          language={language}
          onAddElement={handleAddElement}
          onOpenTemplates={() => {
            resetToolModes();
            setIsTemplateSelectorOpen(true);
          }}
          onAddImage={() => {
            resetToolModes();
            handleImageUploadTrigger();
          }}
          onAddPdf={() => {
            resetToolModes();
            handlePdfUploadTrigger();
          }}
          onAddCamera={(id) => {
            resetToolModes();
            startCamera(id);
          }}
          onTogglePen={handleTogglePen}
          penActive={editorState.penMode}
          onToggleShapes={() => {
            const next = !isShapeSelectorOpen;
            resetToolModes();
            setIsShapeSelectorOpen(next);
          }}
          shapesActive={isShapeSelectorOpen}
          onToggleTable={() => {
            const next = !isTableSelectorOpen;
            resetToolModes();
            setIsTableSelectorOpen(next);
          }}
          tableActive={isTableSelectorOpen}
          onAddSignature={() => {
            resetToolModes();
            setIsSignatureModalOpen(true);
          }}
          onAddPage={handleAddPage}
          penSize={penSize}
          onUpdatePenSize={setPenSize}
          templatesActive={isTemplateSelectorOpen}
        />

        {isShapeSelectorOpen && (
          <ShapeSelector
            language={language}
            onSelect={(type, style) => {
              handleAddElement(type as any, undefined, style);
              setIsShapeSelectorOpen(false);
            }}
            onClose={() => setIsShapeSelectorOpen(false)}
          />
        )}

        {isTableSelectorOpen && (
          <TableSelector
            language={language}
            onSelect={(rows, cols) => {
              const tableData = Array.from({ length: rows }).map(() => Array.from({ length: cols }).map(() => ''));
              handleAddElement('table', '', {}, tableData);
            }}
            onClose={() => setIsTableSelectorOpen(false)}
          />
        )}

        {isSignatureModalOpen && (
          <SignatureModal
            language={language}
            onSave={(data, w, h) => {
              const targetWidth = 150;
              const ratio = w ? (targetWidth / w) : 1;
              const targetHeight = h ? (h * ratio) : 50;
              handleAddElement('image', data, { isSignature: true }, undefined, targetWidth, targetHeight);
              setIsSignatureModalOpen(false);
            }}
            onClose={() => setIsSignatureModalOpen(false)}
          />
        )}

        <main className={`relative flex-1 overflow-auto canvas-bg p-8 ${editorState.eraserMode ? 'cursor-crosshair' : ''}`}>
          <div className="flex flex-col items-center min-w-max min-h-full">
            <div className="sticky top-0 mb-6 flex items-center gap-4 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 px-4 py-2 shadow-sm z-40">
              <span className="text-sm font-medium text-gray-600">{editorState.pages.length} {translations[language].pagesPlural}</span>
              <div className="h-4 w-px bg-gray-300" />
              <button onClick={() => setEditorState(prev => ({ ...prev, zoom: Math.max(150, prev.zoom - 10) }))} className="p-1 hover:bg-gray-100 rounded-full text-gray-600">-</button>
              <span className="text-xs font-medium text-gray-500 w-12 text-center">{editorState.zoom}%</span>
              <button onClick={() => setEditorState(prev => ({ ...prev, zoom: Math.min(200, prev.zoom + 10) }))} className="p-1 hover:bg-gray-100 rounded-full text-gray-600">+</button>
              <div className="h-4 w-px bg-gray-300 mx-2" />
              <button onClick={() => setEditorState(INITIAL_STATE)} className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-all"><X size={20} /></button>
              <div className="h-4 w-px bg-gray-300 mx-2" />
              <button
                onClick={handleCheckoutAndExport}
                disabled={isProcessingPayment}
                className={`flex items-center gap-2 rounded-full px-6 py-2 text-sm font-bold text-white shadow-md transition-all ${isProcessingPayment ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:shadow-lg'}`}
              >
                {isProcessingPayment ? 'Processing...' : translations[language].exportPdf}
              </button>
            </div>

            <div className="flex flex-col gap-10 pb-20">
              {editorState.pages.map((page) => (
                <div
                  key={page.id}
                  className={`relative transition-all duration-500 rounded-[2px] ${editorState.currentPageId === page.id ? 'shadow-[0_20px_60px_rgba(0,0,0,0.15)] ring-1 ring-indigo-500/20' : 'shadow-xl shadow-slate-200 hover:shadow-2xl'}`}
                  onClick={() => setEditorState(prev => ({ ...prev, currentPageId: page.id }))}
                >
                  <EditorCanvas
                    language={language}
                    page={page}
                    selectedElementId={editorState.selectedElementId}
                    onSelectElement={(id) => setEditorState(prev => ({ ...prev, selectedElementId: id }))}
                    onUpdateElement={(id, updates) => handleUpdateElement(page.id, id, updates)}
                    isCropping={isCropping}
                    onCropConfirm={(cropBox) => {
                      if (editorState.selectedElementId) {
                        handleUpdateElement(page.id, editorState.selectedElementId, { x: cropBox.x, y: cropBox.y, width: cropBox.width, height: cropBox.height, crop: cropBox });
                        setIsCropping(false);
                      }
                    }}
                    onCropCancel={() => setIsCropping(false)}
                    scale={editorState.zoom / 100}
                    eraserMode={editorState.eraserMode}
                    penMode={editorState.penMode}
                    onUpdateDrawing={handleUpdateDrawing}
                    onErase={(x, y, w, h) => handleErase(page.id, x, y, w, h)}
                    onTriggerElementImageUpload={handleImageUploadTrigger}
                    onTriggerCamera={startCamera}
                    penSize={penSize}
                    onFinishAction={() => {
                      if (editorState.eraserMode || editorState.penMode) {
                        setEditorState(prev => ({ ...prev, eraserMode: false, penMode: false }));
                      }
                    }}
                  />
                  <div className="flex flex-col items-center gap-2 mt-4">
                    <div className="text-xs text-gray-400 font-medium uppercase tracking-widest">{translations[language].page} {page.pageNumber}</div>
                    <button onClick={(e) => { e.stopPropagation(); handleAddPage(); }} className="px-6 py-2.5 bg-white text-indigo-600 rounded-full text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all shadow-md border border-indigo-100">
                      {translations[language].addPage}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        <div className="flex h-full">
          {(() => {
            const selectedElement = editorState.pages.flatMap(p => p.elements).find(el => el.id === editorState.selectedElementId);
            return (
              <PropertiesSidebar
                language={language}
                element={selectedElement}
                onUpdate={(updates) => {
                  const pageId = editorState.pages.find(p => p.elements.some(el => el.id === editorState.selectedElementId))?.id;
                  if (editorState.selectedElementId && pageId) handleUpdateElement(pageId, editorState.selectedElementId, updates);
                }}
                onDelete={handleDeleteElement}
                onBringToFront={handleBringToFront}
                onSendToBack={handleSendToBack}
                onStartCrop={() => setIsCropping(true)}
                onClose={() => setEditorState(prev => ({ ...prev, selectedElementId: null }))}
              />
            );
          })()}
        </div>
      </div>

      <footer className="flex h-8 items-center justify-between border-t bg-white px-4 text-[10px] text-gray-400">
        <div className="flex gap-4">
          <span>{translations[language].paperSize}</span>
          <span>{translations[language].dpi}</span>
          <span>{translations[language].colorProfile}</span>
        </div>
        <div>{translations[language].version}</div>
      </footer>

      {isTemplateSelectorOpen && <TemplateSelector language={language} onSelectTemplate={handleApplyTemplate} onClose={() => setIsTemplateSelectorOpen(false)} />}
      {isWizardOpen && <ResumeWizard language={language} onComplete={handleWizardComplete} onClose={() => setIsWizardOpen(false)} />}
      {showCamera && (
        <div className="fixed inset-0 z-[80] bg-black bg-opacity-90 flex flex-col items-center justify-center">
          <div className="relative w-full max-w-lg bg-black rounded-lg overflow-hidden border border-gray-800">
            <video ref={videoRef} className="w-full h-auto" autoPlay playsInline muted />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
              <button onClick={stopCamera} className="px-6 py-2 bg-gray-600 text-white rounded-full font-bold hover:bg-gray-700">{translations[language].cancel}</button>
              <button onClick={capturePhoto} className="px-6 py-2 bg-white text-black rounded-full font-bold hover:bg-gray-100 flex items-center gap-2"><Camera size={18} />{translations[language].capture}</button>
            </div>
          </div>
        </div>
      )}
      <div id="export-container" style={{ position: 'absolute', top: '-10000px', left: '-10000px', width: '595pt', zIndex: -100 }}>
        {editorState.pages.map((page) => (
          <div key={page.id} style={{ pageBreakAfter: 'always', width: '595pt', height: '842pt' }}>
            <EditorCanvas language={language} page={page} selectedElementId={null} onSelectElement={() => { }} onUpdateElement={() => { }} scale={1.33} isExporting={true} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
