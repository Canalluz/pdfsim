
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
import { loadStripe } from '@stripe/stripe-js';
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

const App: React.FC = () => {
  const [editorState, setEditorState] = useState<EditorState>(INITIAL_STATE);

  const [isCropping, setIsCropping] = useState(false);

  const [language, setLanguage] = useState<Language>('pt');

  const [isTemplateSelectorOpen, setIsTemplateSelectorOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isShapeSelectorOpen, setIsShapeSelectorOpen] = useState(false);
  const [isTableSelectorOpen, setIsTableSelectorOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [penSize, setPenSize] = useState(2);

  // Word Conversion States
  const [isConverting, setIsConverting] = useState(false);
  const [showWordReimport, setShowWordReimport] = useState(false);
  const wordInputRef = useRef<HTMLInputElement>(null);

  const currentPage = editorState.pages.find(p => p.id === editorState.currentPageId) || editorState.pages[0] || { id: 'temp-page', pageNumber: 1, elements: [] };

  // Global Keyboard Shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if delete key is pressed
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // Ignore if user is typing in an input or textarea
        const activeTag = document.activeElement?.tagName.toLowerCase();
        if (activeTag === 'input' || activeTag === 'textarea') return;

        if (editorState.selectedElementId) {
          handleDeleteElement();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editorState.selectedElementId]);

  const performReflow = useCallback((pages: PDFPage[]): PDFPage[] => {
    if (pages.length === 0) return pages;

    const PAGE_HEIGHT = 842;
    const MARGIN_BOTTOM = 40;
    const MARGIN_TOP = 50;

    const backgroundElements = pages[0].elements.filter(el => el.isBackground);
    const allContent: EditorElement[] = [];
    pages.forEach((p, pIdx) => {
      p.elements.filter(el => !el.isBackground).forEach(el => {
        allContent.push({ ...el, y: (pIdx * PAGE_HEIGHT) + el.y });
      });
    });
    allContent.sort((a, b) => a.y - b.y);

    const headerElements = backgroundElements.filter(el => el.y < 250);
    const topBackgroundHeight = headerElements.reduce((max, el) => Math.max(max, el.y + (el.height || 20)), 0);
    const REFLOW_MARGIN_TOP = headerElements.length > 0 ? Math.max(MARGIN_TOP + 120, topBackgroundHeight + 20) : MARGIN_TOP;

    const reflowedPages: PDFPage[] = [];
    let virtualYOffset = 0;

    allContent.forEach((el) => {
      let vY = el.y + virtualYOffset;
      let pIdx = Math.floor(vY / PAGE_HEIGHT);
      let rY = vY % PAGE_HEIGHT;
      const h = el.height || 20;

      if (pIdx > 0 && rY < REFLOW_MARGIN_TOP) {
        const shift = REFLOW_MARGIN_TOP - rY;
        virtualYOffset += shift;
        vY += shift;
        rY = REFLOW_MARGIN_TOP;
      }

      if (rY + h > PAGE_HEIGHT - MARGIN_BOTTOM) {
        const nextV = (pIdx + 1) * PAGE_HEIGHT + REFLOW_MARGIN_TOP;
        const shift = nextV - vY;
        virtualYOffset += shift;
        vY = nextV;
        pIdx++;
        rY = REFLOW_MARGIN_TOP;
      }

      while (reflowedPages.length <= pIdx) {
        const idx = reflowedPages.length;
        reflowedPages.push({
          id: `reflow-page-${idx + 1}`,
          pageNumber: idx + 1,
          backgroundImage: pages[idx]?.backgroundImage,
          elements: backgroundElements.map(bg => ({ ...bg, id: `${bg.id}-pg${idx + 1}` }))
        });
      }
      reflowedPages[pIdx].elements.push({ ...el, y: rY });
    });

    // Ensure we preserve all original pages if they exceed the content length
    while (reflowedPages.length < pages.length) {
      const idx = reflowedPages.length;
      reflowedPages.push({
        id: pages[idx].id, // Keep original ID if possible, or generate stable one
        pageNumber: idx + 1,
        backgroundImage: pages[idx]?.backgroundImage,
        elements: backgroundElements.map(bg => ({ ...bg, id: `${bg.id}-pg${idx + 1}` }))
      });
    }

    return reflowedPages.length > 0 ? reflowedPages : pages;
  }, []);

  const handleUpdateElement = useCallback((pageId: string, elementId: string, updates: Partial<EditorElement>) => {
    setEditorState(prev => {
      const pageIndex = prev.pages.findIndex(p => p.id === pageId);
      if (pageIndex === -1) return prev;

      const page = prev.pages[pageIndex];
      const element = page.elements.find(el => el.id === elementId);
      if (!element) return prev;

      let newElements = page.elements.map(el => el.id === elementId ? { ...el, ...updates } : el);

      // 1. Local Vertical Shifting
      if (updates.height !== undefined && Math.abs(updates.height - (element.height || 0)) > 0.1) {
        const diff = updates.height - (element.height || 0);
        const thresholdY = (element.y || 0) + (element.height || 0);
        newElements = newElements.map(el => {
          if (el.id !== elementId && !el.isBackground && (el.y || 0) >= thresholdY - 5) {
            return { ...el, y: (el.y || 0) + diff };
          }
          return el;
        });
      }

      const updatedPages = prev.pages.map((p, idx) => idx === pageIndex ? { ...p, elements: newElements } : p);

      // 2. Global Reflow Trigger Logic
      const needsReflow = (updates.height !== undefined || updates.y !== undefined || updates.content !== undefined);
      if (!needsReflow) return { ...prev, pages: updatedPages };

      return { ...prev, pages: performReflow(updatedPages) };
    });
  }, []);

  const handleUpdateDrawing = useCallback((pageId: string, dataUrl: string) => {
    setEditorState(prev => ({
      ...prev,
      pages: prev.pages.map(p => p.id === pageId ? { ...p, drawingData: dataUrl } : p),
      penMode: false,
      eraserMode: false
    }));
  }, []);

  const handleErase = useCallback((pageId: string, x: number, y: number, width: number, height: number) => {
    setEditorState(prev => ({
      ...prev,
      pages: prev.pages.map(p =>
        p.id === pageId
          ? {
            ...p,
            elements: [
              // Optimization: we could filter out fully contained elements here, 
              // but for a brush-style eraser, it's safer to just overlay white patches
              // to avoid flickering or accidental deletion of things the user just grazed.
              ...p.elements,
              {
                id: `erase-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                type: 'shape',
                x, y, width, height,
                content: '',
                locked: true,
                style: { backgroundColor: '#FFFFFF', borderWidth: 0, opacity: 1 }
              } as EditorElement
            ]
          }
          : p
      )
    }));
  }, []);



  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const [targetElementForImage, setTargetElementForImage] = useState<string | null>(null);
  const [targetElementForCamera, setTargetElementForCamera] = useState<string | null>(null);

  const handleImageUploadTrigger = (id?: string) => {
    if (typeof id === 'string') setTargetElementForImage(id);
    else setTargetElementForImage(null);
    fileInputRef.current?.click();
  };
  const handlePdfUploadTrigger = () => pdfInputRef.current?.click();

  const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          if (targetElementForImage) {
            // Find current page to update
            const pageId = editorState.pages.find(p => p.elements.some(el => el.id === targetElementForImage))?.id;
            if (pageId) {
              const el = editorState.pages.find(p => p.id === pageId)?.elements.find(el => el.id === targetElementForImage);
              if (el?.type === 'smart-element') {
                handleUpdateElement(pageId, targetElementForImage, {
                  componentData: { ...el.componentData, userImage: e.target.result as string }
                });
              } else {
                handleUpdateElement(pageId, targetElementForImage, {
                  style: {
                    ...el?.style,
                    background: `url(${e.target.result}) center/cover no-repeat`,
                    backgroundColor: 'transparent'
                  }
                });
              }
            }
            setTargetElementForImage(null);
          } else {
            handleAddElement('image', e.target.result as string);
          }
        }
      };
      reader.readAsDataURL(file);
    }
    // Reset input
    if (event.target) event.target.value = '';
    // Clear target if cancelled
    if (!file && targetElementForImage) setTargetElementForImage(null);
  };

  const handlePdfFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setIsConverting(true);

        // Upload to backend and get session ID
        const { uploadPDFToBackend, renderPdfPage } = await import('./utils/api');
        const response = await uploadPDFToBackend(file);

        // Render each page as background image (Hybrid Mode)
        const pages: PDFPage[] = [];

        for (let i = 0; i < response.pages.length; i++) {
          const pageNum = i + 1;

          // Render page as high-quality image
          const pageRender = await renderPdfPage(response.sessionId, pageNum, 150);

          pages.push({
            id: `page-${pageNum}`,
            pageNumber: pageNum,
            backgroundImage: pageRender.image, // Base64 PNG
            elements: [] // Start with empty overlay - user adds elements on top
          });
        }

        if (pages.length > 0) {
          setEditorState(prev => ({
            ...prev,
            pages: pages,
            currentPageId: pages[0].id,
            sessionId: response.sessionId,
            eraserMode: false
          }));
        } else {
          throw new Error("No pages extracted from PDF");
        }

      } catch (error) {
        console.error("PDF Import failed:", error);
        alert(translations[language].importError);
      } finally {
        setIsConverting(false);
      }
    }
    if (event.target) event.target.value = '';
  };

  // Camera Logic
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async (id?: string) => {
    if (typeof id === 'string') setTargetElementForCamera(id);
    else setTargetElementForCamera(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      setShowCamera(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
        }
      }, 100);
    } catch (err) {
      console.error("Camera error:", err);
      alert(translations[language].cameraError);
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
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const photoUrl = canvasRef.current.toDataURL('image/png');

        if (targetElementForCamera) {
          const pageId = editorState.pages.find(p => p.elements.some(el => el.id === targetElementForCamera))?.id;
          if (pageId) {
            const el = editorState.pages.find(p => p.id === pageId)?.elements.find(el => el.id === targetElementForCamera);
            if (el?.type === 'smart-element') {
              handleUpdateElement(pageId, targetElementForCamera, {
                componentData: { ...el.componentData, userImage: photoUrl }
              });
            } else {
              handleUpdateElement(pageId, targetElementForCamera, {
                style: { ...el?.style, background: `url(${photoUrl}) center/cover no-repeat`, backgroundColor: 'transparent' }
              });
            }
          }
          setTargetElementForCamera(null);
        } else {
          handleAddElement('image', photoUrl);
        }
        stopCamera();
      }
    }
  };

  // Word Conversion Handlers
  const handleConvertToWord = async () => {
    if (!editorState.sessionId) {
      alert(translations[language].importFirst);
      return;
    }

    setIsConverting(true);
    try {
      const { convertPdfToWord } = await import('./utils/api');
      const blob = await convertPdfToWord(editorState.sessionId);

      // Download the Word file
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'documento_editavel.docx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      // Show reimport button
      setShowWordReimport(true);
      alert(translations[language].wordDownloadSuccess);
    } catch (error) {
      console.error('Conversion error:', error);
      alert(translations[language].wordConvertError);
    } finally {
      setIsConverting(false);
    }
  };

  const handleWordReimport = () => {
    wordInputRef.current?.click();
  };

  const handleWordFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.docx')) {
        alert(translations[language].selectDocx);
        return;
      }

      setIsConverting(true);
      try {
        const { convertWordToPdf } = await import('./utils/api');
        const response = await convertWordToPdf(file);

        // Re-extract PDF with new content
        const { extractPDF } = await import('./utils/pdfExtractor');

        // Create a temporary file from the converted PDF
        // Since we can't directly access the backend file, we'll reload from backend
        // For now, we'll use the extraction result from the backend

        setEditorState(prev => {
          const newPages: PDFPage[] = [];

          response.pages.forEach((backendPage: any, index: number) => {
            const pageId = `page-${Date.now()}-${index}`;
            const elements: EditorElement[] = [];

            // Convert backend blocks to editor elements
            backendPage.blocks.forEach((block: any, blockIdx: number) => {
              elements.push({
                id: `block-${pageId}-${blockIdx}`,
                type: 'text',
                x: block.x,
                y: block.y,
                width: block.width,
                height: block.height,
                content: block.text,
                style: {
                  opacity: 1,
                  color: '#000000', // Default to black, can be updated based on block.color if available
                  fontSize: block.size,
                  fontFamily: block.font || 'Inter',
                  backgroundColor: 'transparent',
                }
              });
            });

            newPages.push({
              id: pageId,
              pageNumber: index + 1,
              elements: elements
            });
          });

          return {
            ...prev,
            pages: newPages,
            currentPageId: newPages[0]?.id || prev.currentPageId,
            sessionId: response.sessionId,
            eraserMode: false
          };
        });

        setShowWordReimport(false);
        alert(translations[language].wordImportSuccess);
      } catch (error) {
        console.error('Word import error:', error);
        alert(translations[language].wordImportError);
      } finally {
        setIsConverting(false);
      }
    }
    if (event.target) event.target.value = '';
  };

  const handleAddElement = useCallback((type: ElementType, content?: string, style?: any, tableData?: string[][], width?: number, height?: number) => {
    setEditorState(prev => {
      const newElement: EditorElement = {
        id: `el-${Date.now()}`,
        type,
        x: 100,
        y: 100,
        width: width || (type === 'table' ? 400 : (type === 'text' ? 450 : 150)),
        height: height || (type === 'table' ? 200 : (type === 'text' ? 50 : 150)),
        content: content || (type === 'text' ? translations[language].newText : 'https://picsum.photos/400/300'),
        tableData: tableData,
        style: {
          fontSize: type === 'table' ? 12 : 16,
          fontFamily: 'Inter',
          color: '#000000',
          borderRadius: 0,
          opacity: 1,
          textAlign: 'left',
          cellPadding: 8,
          headerBackgroundColor: '#f8fafc',
          borderColorTable: '#e2e8f0',
          ...style
        }
      };


      const updatedPages = prev.pages.map(page =>
        page.id === prev.currentPageId
          ? { ...page, elements: [...page.elements, newElement] }
          : page
      );

      return {
        ...prev,
        eraserMode: false,
        penMode: false,
        selectedElementId: newElement.id,
        pages: performReflow(updatedPages)
      };
    });
    setIsShapeSelectorOpen(false);
    setIsTableSelectorOpen(false);
  }, [editorState.currentPageId, editorState.pages, language]);

  const handleAddPage = useCallback(() => {
    setEditorState(prev => {
      const newPageNumber = prev.pages.length + 1;
      const newPageId = `page-${newPageNumber}-${Date.now()}`;

      // Identify background elements to copy (sidebars, headers, etc.)
      const currentPage = prev.pages.find(p => p.id === prev.currentPageId) || prev.pages[0];
      const backgroundElements = currentPage?.elements.filter(el => el.isBackground) || [];

      // Create copies of background elements with new IDs
      const copiedElements = backgroundElements.map(el => ({
        ...el,
        id: `${el.id}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
      }));

      return {
        ...prev,
        currentPageId: newPageId,
        pages: [
          ...prev.pages,
          {
            id: newPageId,
            pageNumber: newPageNumber,
            elements: copiedElements
          }
        ]
      };
    });
  }, [editorState.currentPageId, editorState.pages]);

  const handleDeleteElement = useCallback(() => {
    if (!editorState.selectedElementId) return;
    setEditorState(prev => {
      const updatedPages = prev.pages.map(page =>
        page.id === prev.currentPageId
          ? { ...page, elements: page.elements.filter(el => el.id !== prev.selectedElementId) }
          : page
      );

      return {
        ...prev,
        selectedElementId: null,
        pages: performReflow(updatedPages)
      };
    });
  }, [editorState.selectedElementId, editorState.currentPageId]);


  // Stripe Payment Integration
  const [stripePromise] = useState(() => loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY));

  const handleCheckoutAndExport = async () => {
    // 1. Save current state to localStorage to persist across redirect
    localStorage.setItem('pendingExportState', JSON.stringify({
      pages: editorState.pages,
      zoom: editorState.zoom
    }));

    // 2. Create Checkout Session
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiBase}/create-checkout-session`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro interno no servidor de pagamento' }));
        throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
      }

      const session = await response.json();

      // 3. Redirect to Stripe (New Way: Standard Redirect)
      if (session.url) {
        window.location.href = session.url;
      } else {
        throw new Error('URL de checkout não retornada pelo Stripe.');
      }
    } catch (error) {
      console.error('Detailed checkout error:', error);
      alert(error instanceof Error ? error.message : 'Erro crítico ao iniciar pagamento');
    }
  };

  // Check for payment success on load
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get('payment_success')) {
      // Restore state and trigger export
      const savedState = localStorage.getItem('pendingExportState');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        // We need to set state first, then wait for it to apply before exporting
        // Alternatively, we can pass the parsed pages directly to export function
        // For simplicity, let's just trigger the export with the saved data

        // Remove query param to prevent loop
        window.history.replaceState({}, document.title, window.location.pathname);
        localStorage.removeItem('pendingExportState');

        alert('Pagamento confirmado! Iniciando download...');

        // Trigger export with saved data immediately
        import('./utils/pdfExporter').then(async ({ exportToPDF, downloadPDF }) => {
          const exportPages = parsedState.pages.map((page: PDFPage) => ({
            lines: page.elements
              .filter(el => el.type === 'text')
              .map(el => ({
                text: el.content,
                x: el.x,
                y: el.y,
                fontSize: el.style.fontSize || 12,
                fontWeight: el.style.fontWeight,
                color: el.style.color
              })),
            shapes: page.elements
              .filter(el => el.type === 'shape')
              .map(el => ({
                x: el.x,
                y: el.y,
                width: el.width,
                height: el.height,
                backgroundColor: el.style.backgroundColor,
                opacity: el.style.opacity
              })),
            images: page.elements
              .filter(el => el.type === 'image')
              .map(el => ({
                x: el.x,
                y: el.y,
                width: el.width,
                height: el.height,
                src: el.content,
                opacity: el.style.opacity,
                rotation: el.rotation
              })),
            backgroundImage: page.backgroundImage,
            width: 595,
            height: 842,
            drawingData: page.drawingData
          }));

          const pdfBytes = await exportToPDF(exportPages);
          downloadPDF(pdfBytes, 'documento-final.pdf');
        });
      }
    }
  }, []);

  const handleApplyTemplate = (template: Template) => {
    const PAGE_HEIGHT = 842;
    const MARGIN_BOTTOM = 20; // Reduced to allow more content per page
    const MARGIN_TOP = 50;

    // Identify background elements that should repeat on every page (like sidebars)
    const backgroundElements = template.elements.filter(el => el.isBackground);

    // Calculate the height occupied by headers to avoid overlap on subsequent pages
    const headerElements = backgroundElements.filter(el => el.y < 250);
    const topBackgroundHeight = headerElements.reduce((max, el) => {
      const h = el.height || (el.type === 'text' ? (el.style.fontSize || 10) * 1.5 : 20);
      return Math.max(max, el.y + h);
    }, 0);

    // If there is a header, ensure content starts significantly lower on Page 2+
    const REFLOW_MARGIN_TOP = headerElements.length > 0
      ? Math.max(MARGIN_TOP + 120, topBackgroundHeight + 20)
      : MARGIN_TOP;

    const contentElements = template.elements.filter(el =>
      !el.isBackground
    ).sort((a, b) => a.y - b.y);

    const pages: PDFPage[] = [];
    let currentElements: EditorElement[] = [...backgroundElements];
    let pageNumber = 1;
    let yOffset = 0;
    let currentPageYMax = PAGE_HEIGHT - MARGIN_BOTTOM;

    contentElements.forEach((el, index) => {
      const elementHeight = el.height || 20;
      let elementY = el.y + yOffset;

      // Detection for orphan headers: if this is a header, peek if its next content fits
      const isHeader = el.id.endsWith('-h') || el.id.includes('header');
      let shouldBreak = elementY + elementHeight > currentPageYMax && el.type !== 'shape';

      if (isHeader && !shouldBreak) {
        // Peek up to 3 elements ahead (e.g., Header -> Line -> Padding -> Content)
        let peekY = elementY + elementHeight;
        for (let i = 1; i <= 3; i++) {
          const peekEl = contentElements[index + i];
          if (peekEl) {
            const peekElHeight = (peekEl.height || 20) + 4; // Reduced buffer for tighter fit
            const peekElAbsoluteY = peekEl.y + yOffset;

            // If the next logical vertical position or the actual element overflows, break
            if (peekY + peekElHeight > currentPageYMax || peekElAbsoluteY + peekElHeight > currentPageYMax) {
              shouldBreak = true;
              break;
            }
            peekY = Math.max(peekY + peekElHeight, peekElAbsoluteY + peekElHeight);
          }
        }
      }

      if (shouldBreak) {
        // Push current page
        pages.push({
          id: `page-${pageNumber}-${Date.now()}`,
          pageNumber: pageNumber,
          elements: currentElements.map(cel => ({ ...cel, id: `${cel.id}-${pageNumber}-${Math.random().toString(36).substr(2, 5)}` }))
        });

        // Setup for new page
        pageNumber++;
        currentElements = [...backgroundElements];

        // Reflow: this element (and subsequent ones) start from REFLOW_MARGIN_TOP
        yOffset = REFLOW_MARGIN_TOP - el.y;
        elementY = REFLOW_MARGIN_TOP;
      }

      currentElements.push({
        ...el,
        y: elementY,
        id: `${el.id}-${pageNumber}-${Math.random().toString(36).substr(2, 5)}`
      });
    });

    // Final Page
    pages.push({
      id: `page-${pageNumber}-${Date.now()}`,
      pageNumber: pageNumber,
      elements: currentElements
    });

    setEditorState(prev => ({
      ...prev,
      selectedElementId: null,
      pages: pages,
      currentPageId: pages[0].id,
      eraserMode: false
    }));
    setIsTemplateSelectorOpen(false);
  };



  const handleWizardComplete = (data: any) => {
    const targetTemplateId = 'champion-classic-elegant';
    const PAGE_HEIGHT = 842;
    const MARGIN_TOP = 50;
    const MARGIN_BOTTOM = 50;

    const pages: PDFPage[] = [];
    let currentElements: EditorElement[] = [];
    let pageNumber = 1;

    // --- Page 1 Setup ---
    // Photo
    if (data.photo) {
      currentElements.push({
        id: 'smart-photo',
        type: 'smart-element',
        x: 450,
        y: 40,
        width: 120,
        height: 150,
        content: 'ProfessionalPhoto',
        componentData: {
          templateId: targetTemplateId,
          userImage: data.photo,
          photoConfig: {
            recommendation: 'Ótima iluminação!'
          }
        },
        style: {
          opacity: 1,
          borderRadius: 0,
          background: 'transparent'
        }
      });
    }

    // Header Info (Keep as Text for flexibility)
    currentElements.push({
      id: 'name', type: 'text', x: 40, y: 50, width: 380, height: 36,
      content: data.fullName || 'SEU NOME',
      style: { fontSize: 28, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#2c3e50', textAlign: 'left' }
    });

    currentElements.push({
      id: 'contact', type: 'text', x: 40, y: 90, width: 380, height: 14,
      content: `${data.email} | ${data.phone}\n${data.location}`,
      style: { fontSize: 9, fontWeight: 'normal', fontFamily: 'Roboto', color: '#7f8c8d', textAlign: 'left' }
    });

    let yCursor = 160;

    // Helper to add element with flow logic
    const addSection = (id: string, height: number, componentData: any) => {
      if (yCursor + height > PAGE_HEIGHT - MARGIN_BOTTOM) {
        // Push current page
        pages.push({
          id: `page-${pageNumber}-${Date.now()}`,
          pageNumber: pageNumber,
          elements: [...currentElements] // Copy elements
        });
        // Reset for new page
        pageNumber++;
        currentElements = [];
        yCursor = MARGIN_TOP;
      }

      currentElements.push({
        id: id,
        type: 'smart-element',
        x: 40,
        y: yCursor,
        width: 515,
        height: height,
        content: 'ResumeSection',
        componentData: componentData,
        style: { opacity: 1 }
      });

      yCursor += height + 20; // Gap
    };

    // --- Sections ---

    // Summary
    if (data.summary) {
      addSection('smart-section-summary', 80, {
        templateId: targetTemplateId,
        section: {
          type: 'text',
          title: 'RESUMO PROFISSIONAL',
          content: data.summary
        }
      });
    }

    // Experience Section (Smart Timeline)
    if (data.experience.length > 0) {
      const height = data.experience.length * 80 + 40;
      addSection('smart-section-exp', height, {
        templateId: targetTemplateId,
        section: {
          type: 'timeline_experience',
          title: 'EXPERIÊNCIA PROFISSIONAL',
          items: data.experience
        }
      });
    }

    // Education Section (Smart List)
    if (data.education.length > 0) {
      const height = data.education.length * 60 + 40;
      addSection('smart-section-edu', height, {
        templateId: targetTemplateId,
        section: {
          type: 'education_list',
          title: 'FORMAÇÃO ACADÊMICA',
          items: data.education
        }
      });
    }

    // Skills Section (Smart Grid)
    if (data.skills.length > 0) {
      addSection('smart-section-skills', 100, {
        templateId: targetTemplateId,
        section: {
          type: 'skills_grid',
          title: 'COMPETÊNCIAS',
          content: data.skills
        }
      });
    }

    // Push final page
    pages.push({
      id: `page-${pageNumber}-${Date.now()}`,
      pageNumber: pageNumber,
      elements: currentElements
    });

    setEditorState(prev => ({
      ...prev,
      selectedElementId: null,
      pages: pages,
      currentPageId: pages[0].id
    }));
    setIsWizardOpen(false);
  };

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

      return {
        ...prev,
        pages: prev.pages.map(p => p.id === prev.currentPageId ? { ...p, elements: newElements } : p)
      };
    });
  }, [editorState.selectedElementId]);

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

      return {
        ...prev,
        pages: prev.pages.map(p => p.id === prev.currentPageId ? { ...p, elements: newElements } : p)
      };
    });
  }, [editorState.selectedElementId]);

  const handleToggleEraser = useCallback(() => {
    setEditorState(prev => ({ ...prev, eraserMode: !prev.eraserMode, penMode: false, selectedElementId: null }));
  }, []);

  const handleTogglePen = useCallback(() => {
    setEditorState(prev => ({ ...prev, penMode: !prev.penMode, eraserMode: false, selectedElementId: null }));
  }, []);

  const selectedElement = currentPage?.elements?.find(el => el.id === editorState.selectedElementId);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-100">
      {/* Top Header */}
      <header className="flex h-14 items-center justify-between border-b bg-white px-4 shadow-sm z-50">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm overflow-hidden">
            <img src="/logo.png" alt="PDF Sim Editor Logo" className="h-full w-full object-cover" />
          </div>
          <div className="mr-6">
            <h1 className="text-lg font-black text-gray-900 leading-tight">PDF Sim Editor</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">Professional Design Suite</p>
          </div>

          {/* Language Switcher - Relocated to Left and Resized */}
          <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm ml-2">
            <span className="text-sm font-black text-gray-800 uppercase tracking-tight">{translations[language].languageName}:</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setLanguage('pt')}
                className={`transition-all hover:scale-110 ${language === 'pt' ? 'grayscale-0 ring-2 ring-indigo-500 ring-offset-2' : 'grayscale opacity-40 hover:opacity-100'}`}
                title="Português / Brasil"
              >
                <img src="https://flagcdn.com/w80/br.png" alt="Brasil" className="w-12 h-auto rounded-md shadow-md" />
              </button>
              <button
                onClick={() => setLanguage('es')}
                className={`transition-all hover:scale-110 ${language === 'es' ? 'grayscale-0 ring-2 ring-indigo-500 ring-offset-2' : 'grayscale opacity-40 hover:opacity-100'}`}
                title="Español"
              >
                <img src="https://flagcdn.com/w80/es.png" alt="España" className="w-12 h-auto rounded-md shadow-md" />
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`transition-all hover:scale-110 ${language === 'en' ? 'grayscale-0 ring-2 ring-indigo-500 ring-offset-2' : 'grayscale opacity-40 hover:opacity-100'}`}
                title="English / UK"
              >
                <img src="https://flagcdn.com/w80/gb.png" alt="United Kingdom" className="w-12 h-auto rounded-md shadow-md" />
              </button>
            </div>
          </div>


          <button
            onClick={() => setIsWizardOpen(true)}
            className="flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg transition-all ml-4"
          >
            <Zap size={14} className="fill-yellow-300 text-yellow-300" />
            {translations[language].createWithAI}
          </button>
          <p className="text-xl font-semibold text-gray-700 italic animate-fade-in ml-6 whitespace-nowrap hidden xl:block">
            "Currículo profissional, visão de recrutador e edição de PDF"
          </p>
        </div>


        <div className="flex items-center gap-2">




          <div className="h-6 w-px bg-gray-200 mx-2" />

          {/* Word Conversion Buttons */}
          {editorState.sessionId && (
            <>

              {showWordReimport && (
                <button
                  onClick={handleWordReimport}
                  disabled={isConverting}
                  className="flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-all disabled:opacity-50 animate-pulse"
                  title={translations[language].wordReimportTitle}
                >
                  <Upload size={14} />
                  {isConverting ? translations[language].converting : translations[language].reimportWord}
                </button>
              )}
              <div className="h-6 w-px bg-gray-200 mx-2" />
            </>
          )}


        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleImageFileChange}
        />
        <input
          type="file"
          ref={pdfInputRef}
          className="hidden"
          accept="application/pdf"
          onChange={handlePdfFileChange}
        />
        <input
          type="file"
          ref={wordInputRef}
          className="hidden"
          accept=".docx"
          onChange={handleWordFileChange}
        />

        {/* Left Toolbar */}
        <Toolbar
          language={language}
          onAddElement={handleAddElement}
          onOpenTemplates={() => setIsTemplateSelectorOpen(true)}
          onAddImage={handleImageUploadTrigger}
          onAddPdf={handlePdfUploadTrigger}
          onAddCamera={startCamera}
          // Eraser removed
          onTogglePen={handleTogglePen}
          penActive={editorState.penMode}
          onToggleShapes={() => setIsShapeSelectorOpen(!isShapeSelectorOpen)}
          shapesActive={isShapeSelectorOpen}
          onToggleTable={() => setIsTableSelectorOpen(!isTableSelectorOpen)}
          tableActive={isTableSelectorOpen}
          onAddSignature={() => setIsSignatureModalOpen(true)}
          onAddPage={handleAddPage}
          penSize={penSize}
          onUpdatePenSize={setPenSize}
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
              const tableData = Array.from({ length: rows }).map(() =>
                Array.from({ length: cols }).map(() => '')
              );
              handleAddElement('table', '', {}, tableData);
            }}
            onClose={() => setIsTableSelectorOpen(false)}
          />
        )}

        {isSignatureModalOpen && (
          <SignatureModal
            language={language}
            onSave={(data, w, h) => {
              // Scale signature to a reasonable width (e.g., 150)
              const targetWidth = 150;
              const ratio = w ? (targetWidth / w) : 1;
              const targetHeight = h ? (h * ratio) : 50;

              handleAddElement('image', data, { isSignature: true }, undefined, targetWidth, targetHeight);
              setIsSignatureModalOpen(false);
            }}
            onClose={() => setIsSignatureModalOpen(false)}
          />
        )}

        {/* Main Canvas Area */}
        <main className={`relative flex-1 overflow-auto canvas-bg p-8 ${editorState.eraserMode ? 'cursor-crosshair' : ''}`}>
          <div className="flex flex-col items-center min-w-max min-h-full">
            {/* Page Navigation & Zoom - REDESIGNED for Vertical Scroll */}
            <div className="sticky top-0 mb-6 flex items-center gap-4 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 px-4 py-2 shadow-sm z-40">
              <span className="text-sm font-medium text-gray-600">{editorState.pages.length} {translations[language].pagesPlural}</span>
              <div className="h-4 w-px bg-gray-300" />

              {/* Zoom Controls */}
              <button
                onClick={() => setEditorState(prev => ({ ...prev, zoom: Math.max(150, prev.zoom - 10) }))}
                className="p-1 hover:bg-gray-100 rounded-full text-gray-600"
                title={translations[language].zoomOut}
              >
                -
              </button>
              <div className="flex items-center gap-2 min-w-[3rem] justify-center">
                <span className="text-xs font-medium text-gray-500">{editorState.zoom}%</span>
              </div>
              <button
                onClick={() => setEditorState(prev => ({ ...prev, zoom: Math.min(200, prev.zoom + 10) }))}
                className="p-1 hover:bg-gray-100 rounded-full text-gray-600"
                title={translations[language].zoomIn}
              >
                +
              </button>

              <div className="h-4 w-px bg-gray-300 mx-2" />

              <button
                onClick={() => setEditorState(INITIAL_STATE)}
                className="flex items-center justify-center h-10 w-10 rounded-full bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                title={translations[language].closeFile}
              >
                <X size={24} />
              </button>

              <div className="h-4 w-px bg-gray-300 mx-2" />

              <button
                onClick={handleCheckoutAndExport}
                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-2 text-sm font-bold text-white shadow-md hover:from-blue-700 hover:to-indigo-800 hover:shadow-lg transition-all transform hover:-translate-y-0.5"
              >
                <Download size={18} />
                {translations[language].exportPdf}
              </button>
            </div>

            <div className="flex flex-col gap-8 pb-20">
              {editorState.pages.map((page) => (
                <div key={page.id} className="shadow-lg transition-transform" onClick={() => setEditorState(prev => ({ ...prev, currentPageId: page.id }))}>
                  <EditorCanvas
                    language={language}
                    page={page}
                    selectedElementId={editorState.selectedElementId}
                    onSelectElement={(id) => setEditorState(prev => ({ ...prev, selectedElementId: id }))}
                    onUpdateElement={(id, updates) => handleUpdateElement(page.id, id, updates)}
                    isCropping={isCropping}
                    onCropConfirm={(cropBox) => {
                      if (editorState.selectedElementId) {
                        handleUpdateElement(page.id, editorState.selectedElementId, {
                          x: cropBox.x,
                          y: cropBox.y,
                          width: cropBox.width,
                          height: cropBox.height,
                          crop: {
                            x: cropBox.x,
                            y: cropBox.y,
                            width: cropBox.width,
                            height: cropBox.height
                          }
                        });
                        setIsCropping(false);
                      }
                    }}
                    onCropCancel={() => setIsCropping(false)}
                    scale={editorState.zoom / 100}
                    eraserMode={editorState.eraserMode}
                    penMode={editorState.penMode}
                    onUpdateDrawing={handleUpdateDrawing}
                    onErase={(x, y, w, h) => handleErase(page.id, x, y, w, h)}
                    onTriggerElementImageUpload={(id) => {
                      const el = page.elements.find(e => e.id === id);
                      if (el) handleUpdateElement(page.id, id, { content: 'https://picsum.photos/400/300' }); // Placeholder or trigger actual upload if exists
                    }}
                    onTriggerCamera={(id) => {
                      const el = page.elements.find(e => e.id === id);
                      if (el) handleUpdateElement(page.id, id, { content: 'https://picsum.photos/400/300' }); // Placeholder
                    }}
                    penSize={penSize}
                  />
                  <div className="flex flex-col items-center gap-2 mt-4">
                    <div className="text-xs text-gray-400 font-medium uppercase tracking-widest">{translations[language].page} {page.pageNumber}</div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddPage();
                      }}
                      className="group flex items-center gap-2 px-6 py-2.5 bg-white text-indigo-600 rounded-full text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all shadow-md border border-indigo-100"
                    >
                      <Plus size={16} className="group-hover:rotate-90 transition-transform" />
                      {translations[language].addPage}
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </main>

        {/* Right Sidebar: Properties & AI */}
        <div className="flex h-full">
          {(() => {
            const selectedElement = editorState.pages
              .flatMap(p => p.elements)
              .find(el => el.id === editorState.selectedElementId);

            return (
              <PropertiesSidebar
                language={language}
                element={selectedElement}
                onUpdate={(updates) => {
                  const pageId = editorState.pages.find(p => p.elements.some(el => el.id === editorState.selectedElementId))?.id;
                  if (editorState.selectedElementId && pageId) {
                    handleUpdateElement(pageId, editorState.selectedElementId, updates);
                  }
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
      </div >

      {/* Footer Info */}
      < footer className="flex h-8 items-center justify-between border-t bg-white px-4 text-[10px] text-gray-400" >
        <div className="flex gap-4">
          <span>{translations[language].paperSize}</span>
          <span>{translations[language].dpi}</span>
          <span>{translations[language].colorProfile}</span>
        </div>
        <div>{translations[language].version}</div>
      </footer >

      {/* Templates Modal */}
      {
        isTemplateSelectorOpen && (
          <TemplateSelector
            language={language}
            onSelectTemplate={handleApplyTemplate}
            onClose={() => setIsTemplateSelectorOpen(false)}
          />
        )
      }

      {/* Resume Wizard */}
      {
        isWizardOpen && (
          <ResumeWizard
            language={language}
            onComplete={handleWizardComplete}
            onClose={() => setIsWizardOpen(false)}
          />
        )
      }

      {/* Camera Modal */}
      {
        showCamera && (
          <div className="fixed inset-0 z-[80] bg-black bg-opacity-90 flex flex-col items-center justify-center">
            <div className="relative w-full max-w-lg bg-black rounded-lg overflow-hidden border border-gray-800">
              <video ref={videoRef} className="w-full h-auto" autoPlay playsInline muted />
              <canvas ref={canvasRef} className="hidden" />

              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                <button
                  onClick={stopCamera}
                  className="px-6 py-2 bg-gray-600 text-white rounded-full font-bold hover:bg-gray-700"
                >
                  {translations[language].cancel}
                </button>
                <button
                  onClick={capturePhoto}
                  className="px-6 py-2 bg-white text-black rounded-full font-bold hover:bg-gray-100 flex items-center gap-2"
                >
                  <Camera size={18} />
                  {translations[language].capture}
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default App;
