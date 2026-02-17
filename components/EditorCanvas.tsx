
import React, { useRef, useState, useEffect } from 'react';
import { PDFPage, EditorElement } from '../types';
import CropOverlay from './CropOverlay';
import { ProfessionalPhoto, ResumeSection } from './SmartResumeComponents';
import { Language, translations } from '../utils/i18n';
import { Image as ImageIcon, Plus, Bold, Italic, Type, Palette } from 'lucide-react';

interface EditorCanvasProps {
  language: Language;
  page: PDFPage;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<EditorElement>) => void;
  isCropping?: boolean;
  onCropConfirm?: (crop: any) => void;
  onCropCancel?: () => void;
  scale: number;
  eraserMode?: boolean;
  penMode?: boolean;
  onUpdateDrawing?: (pageId: string, dataUrl: string) => void;
  onErase?: (x: number, y: number, width: number, height: number) => void;
  onTriggerElementImageUpload?: (id: string) => void;
  onTriggerCamera?: (id: string) => void;
  brushSize?: { width: number; height: number };
  penSize?: number;
  isExporting?: boolean;
}

const EditorCanvas: React.FC<EditorCanvasProps> = ({
  language,
  page,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  isCropping = false,
  onCropConfirm,
  onCropCancel,
  scale,
  eraserMode = false,
  penMode = false,
  onUpdateDrawing,
  onErase,
  onTriggerElementImageUpload,
  onTriggerCamera,
  brushSize = { width: 120, height: 40 },
  penSize = 2,
  isExporting = false,
}) => {
  const t = translations[language] || translations['pt'];

  const canvasRef = useRef<HTMLDivElement>(null);
  const lastAutoHeights = useRef<Record<string, number>>({});
  const [resizing, setResizing] = useState<{
    handle: string;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    startElementX: number;
    startElementY: number;
    elementId: string;
  } | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Eraser state
  const [erasing, setErasing] = useState<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);

  // Drawing State
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPoint = useRef<{ x: number, y: number } | null>(null);

  // Initialize and Sync Drawing Canvas
  useEffect(() => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set dimensions based on logical BASE units for 1:1 mapping with elements
    // This solves the "drift" issue between drawing and elements
    canvas.width = BASE_WIDTH;
    canvas.height = BASE_HEIGHT;

    // If we have drawing data, load it onto the canvas
    if (page.drawingData) {
      const img = new Image();
      img.src = page.drawingData;
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [page.id]); // Reload on page change

  const getCanvasCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawCanvasRef.current) return { x: 0, y: 0 };
    const rect = drawCanvasRef.current.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e.nativeEvent) {
      clientX = e.nativeEvent.touches[0].clientX;
      clientY = e.nativeEvent.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    // Adjust for CSS scaling / zoom
    // We use the logical BASE_WIDTH to calculate the proportion
    const x = (clientX - rect.left) / (rect.width / BASE_WIDTH);
    const y = (clientY - rect.top) / (rect.height / BASE_HEIGHT);
    return { x, y };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!penMode && !eraserMode) return;
    setIsDrawing(true);
    const pos = getCanvasCoordinates(e);
    lastPoint.current = pos;
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !lastPoint.current || !drawCanvasRef.current) return;
    const ctx = drawCanvasRef.current.getContext('2d');
    if (!ctx) return;

    const pos = getCanvasCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(pos.x, pos.y);

    if (eraserMode) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 20;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = penSize;
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    lastPoint.current = pos;
  };

  const endDrawing = () => {
    if (isDrawing && drawCanvasRef.current && onUpdateDrawing) {
      onUpdateDrawing(page.id, drawCanvasRef.current.toDataURL('image/png'));
    }
    setIsDrawing(false);
    lastPoint.current = null;
  };

  const handleResizeStart = (e: React.MouseEvent, handle: string, element: EditorElement) => {
    e.stopPropagation();
    onSelectElement(element.id);
    setResizing({
      handle,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: element.width,
      startHeight: element.height,
      startElementX: element.x,
      startElementY: element.y,
      elementId: element.id
    });
  };

  const handleMouseDown = (e: React.MouseEvent, element?: EditorElement) => {
    if (eraserMode) {
      e.preventDefault();
      e.stopPropagation();

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const startX = (e.clientX - rect.left) / scale;
      const startY = (e.clientY - rect.top) / scale;

      setErasing({
        startX,
        startY,
        currentX: startX,
        currentY: startY
      });

      let lastErasePos = { x: startX, y: startY };

      const handleGlobalMouseMove = (moveEvent: MouseEvent) => {
        const moveRect = canvasRef.current?.getBoundingClientRect();
        if (!moveRect) return;

        const currentX = (moveEvent.clientX - moveRect.left) / scale;
        const currentY = (moveEvent.clientY - moveRect.top) / scale;

        setErasing(prev => prev ? {
          ...prev,
          currentX,
          currentY
        } : null);

        // Optimization: Only erase if moved significantly (e.g., 1/4 of brush size)
        const dist = Math.sqrt(Math.pow(currentX - lastErasePos.x, 2) + Math.pow(currentY - lastErasePos.y, 2));
        const minMove = Math.min(brushSize.width, brushSize.height) / 4;

        if ((dist >= minMove || dist === 0) && onErase) { // Allow initial click (dist=0) or movement
          onErase(
            currentX - brushSize.width / 2,
            currentY - brushSize.height / 2,
            brushSize.width,
            brushSize.height
          );
          lastErasePos = { x: currentX, y: currentY };
        }
      };

      const handleGlobalMouseUp = () => {
        setErasing(null);
        window.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('mouseup', handleGlobalMouseUp);
      };

      // Initial erase on click
      if (onErase) {
        onErase(
          startX - brushSize.width / 2,
          startY - brushSize.height / 2,
          brushSize.width,
          brushSize.height
        );
      }

      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
      return;
    }

    if (!element) return;

    // Force lock for ProfessionalPhoto to prevent dragging
    const isProfessionalPhoto = element.type === 'smart-element' && element.content === 'ProfessionalPhoto';

    if (element.locked || isProfessionalPhoto) {
      // Only select, don't allow dragging/resizing
      onSelectElement(element.id);
      return;
    }
    if (isCropping && selectedElementId === element.id) return;

    e.stopPropagation();
    onSelectElement(element.id);
    setDraggingId(element.id);

    // Fix: offset should be in page units to handle zoom correctly
    setDragOffset({
      x: (e.clientX / scale) - element.x,
      y: (e.clientY / scale) - element.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (erasing) return; // Handled by global effect

    if (resizing) {
      // ... resizing logic should also ideally handle scale, but it's using deltas which usually work better
      const deltaX = (e.clientX - resizing.startX) / scale;
      const deltaY = (e.clientY - resizing.startY) / scale;
      const updates: Partial<EditorElement> = {};

      if (resizing.handle.includes('e')) {
        updates.width = Math.max(10, resizing.startWidth + deltaX);
      }
      if (resizing.handle.includes('w')) {
        updates.width = Math.max(10, resizing.startWidth - deltaX);
        updates.x = resizing.startElementX + deltaX;
      }
      if (resizing.handle.includes('s')) {
        updates.height = Math.max(10, resizing.startHeight + deltaY);
      }
      if (resizing.handle.includes('n')) {
        updates.height = Math.max(10, resizing.startHeight - deltaY);
        updates.y = resizing.startElementY + deltaY;
      }

      onUpdateElement(resizing.elementId, updates);

      // Trigger auto-height if it's a text element (Width OR Height change)
      const element = page.elements.find(el => el.id === resizing.elementId);
      if (element?.type === 'text') {
        const textarea = canvasRef.current?.querySelector(`[data-element-id="${element.id}"] textarea`) as HTMLTextAreaElement;
        if (textarea) {
          // Force layout recalculation
          textarea.style.height = 'auto';
          const newHeight = Math.max(24, textarea.scrollHeight + 4);

          // Only update if dimensions actually changed significantly
          if (Math.abs(newHeight - (updates.height || element.height || 0)) > 1) {
            onUpdateElement(element.id, { height: newHeight });
          }
        }
      }
      return;
    }

    if (draggingId && canvasRef.current) {
      // Fix: coordinates should be in page units
      const newX = (e.clientX / scale) - dragOffset.x;
      const newY = (e.clientY / scale) - dragOffset.y;
      onUpdateElement(draggingId, { x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    if (erasing) return; // Handled by global effect
    setDraggingId(null);
    setResizing(null);
  };

  // Base dimensions for A4 at 72dpi
  const BASE_WIDTH = 595;
  const BASE_HEIGHT = 842;

  return (
    <div
      className={isExporting ? "relative" : "relative flex items-center justify-center p-12"}
      onClick={() => !isCropping && onSelectElement(null)}
    >
      <div
        style={{
          width: `${BASE_WIDTH * scale}px`,
          height: `${BASE_HEIGHT * scale}px`,
          position: 'relative',
          minWidth: `${BASE_WIDTH * scale}px`,
          minHeight: `${BASE_HEIGHT * scale}px`
        }}
      >
        <div
          ref={canvasRef}
          className={`relative pdf-page bg-white transition-transform origin-top-left ${isExporting ? '' : 'shadow-2xl border border-gray-300'}`}
          style={{
            width: `${BASE_WIDTH}px`,
            height: `${BASE_HEIGHT}px`,
            transform: `scale(${scale})`
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onMouseDown={(e) => eraserMode && handleMouseDown(e)}
        >
          {/* PDF Background Image (Non-interactive) */}
          {page.backgroundImage && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ zIndex: 0 }}
            >
              <img
                src={page.backgroundImage}
                alt={t.pageBackground(page.pageNumber)}
                className="w-full h-full object-contain"
                draggable={false}
              />
            </div>
          )}

          {/* Drawing Layer */}
          <canvas
            ref={drawCanvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={endDrawing}
            onMouseLeave={endDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={endDrawing}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: (penMode || eraserMode) ? 100 : 25, // Above elements when active
              pointerEvents: penMode ? 'auto' : 'none', // During eraserMode, we want the div below to catch events for patches
              cursor: eraserMode ? 'cell' : 'crosshair',
            }}
          />

          {/* Editable Overlay Elements */}
          {page.elements.map((el) => (
            <div
              key={el.id}
              onMouseDown={(e) => !eraserMode && handleMouseDown(e, el)}
              onClick={(e) => e.stopPropagation()}
              className={`absolute transition-shadow ${eraserMode || isExporting
                ? 'pointer-events-none' // Background images and all elements during eraser mode don't capture clicks
                : selectedElementId === el.id && !isCropping
                  ? 'ring-2 ring-indigo-500 shadow-lg cursor-move'
                  : 'hover:ring-1 hover:ring-indigo-300 cursor-move'
                } ${el.locked && el.type !== 'text' && el.type !== 'smart-element' ? 'pointer-events-none' : ''}`}
              style={{
                left: `${el.x}px`,
                top: `${el.y}px`,
                width: `${el.width}px`,
                height: `${el.height}px`,
                transform: `rotate(${el.rotation || 0}deg)`,
                cursor: (eraserMode || el.locked || (el.type === 'smart-element' && el.content === 'ProfessionalPhoto')) ? 'default' : 'move',
                // STRATIFIED Z-INDEX: 
                // Backgrounds (5-20), Normal Content (30-40), Selected Content (70)
                // Eraser Patches MUST be above everything (150+)
                zIndex: (selectedElementId === el.id || draggingId === el.id)
                  ? 70 // Always high if selected
                  : (el.id.startsWith('erase-') ? 200 : (el.isBackground ? 5 : (el.locked ? 60 : 30))),
              }}
            >
              {el.type === 'text' && (
                (selectedElementId === el.id && !isExporting) ? (
                  <textarea
                    autoFocus
                    placeholder={t.clickToEdit || 'Clique para editar...'}
                    value={el.content}
                    onChange={(e) => {
                      onUpdateElement(el.id, { content: e.target.value });

                      // Auto-resize logic using reset-and-measure pattern
                      const target = e.target;
                      const originalHeight = target.style.height;
                      target.style.height = 'auto';
                      const measuredHeight = Math.max(24, target.scrollHeight + 2);
                      target.style.height = originalHeight;

                      const delta = measuredHeight - el.height;
                      if (Math.abs(delta) > 2.5) {
                        onUpdateElement(el.id, { height: measuredHeight });

                        // PUSH LOGIC: Shift elements below this one
                        const elementsBelow = page.elements.filter(other =>
                          other.id !== el.id &&
                          other.y > el.y &&
                          Math.abs(other.x - el.x) < 50
                        );

                        elementsBelow.forEach(other => {
                          onUpdateElement(other.id, { y: other.y + delta });
                        });
                      }
                    }}
                    onFocus={(e) => {
                      if (el.content.trim() === '' || el.content === 'Novo Texto' || el.content.startsWith('[')) {
                        e.target.select();
                      }
                      const target = e.target;
                      // Don't auto-update height on focus unless it's genuinely overflowed
                      if (target.scrollHeight > el.height + 2) {
                        const measuredHeight = Math.max(24, target.scrollHeight + 2);
                        const delta = measuredHeight - el.height;

                        onUpdateElement(el.id, { height: measuredHeight });

                        // Push elements on focus as well
                        const elementsBelow = page.elements.filter(other =>
                          other.id !== el.id &&
                          other.y > el.y &&
                          Math.abs(other.x - el.x) < 50
                        );

                        elementsBelow.forEach(other => {
                          onUpdateElement(other.id, { y: other.y + delta });
                        });
                      }
                    }}
                    className="w-full h-full resize-none outline-none bg-transparent overflow-hidden"
                    style={{
                      fontSize: `${el.style.fontSize}px`,
                      fontWeight: el.style.fontWeight,
                      fontFamily: el.style.fontFamily,
                      fontStyle: el.style.fontStyle,
                      color: el.style.color || '#000000',
                      textAlign: el.style.textAlign,
                      opacity: el.style.opacity,
                      lineHeight: el.style.lineHeight || 1.4, // Increased from 1.2 for better visibility
                      boxShadow: el.style.boxShadow,
                      background: el.style.background,
                      backgroundColor: el.style.backgroundColor, // Added missing property
                      padding: '4px 8px', // Increased padding
                      boxSizing: 'border-box',
                      display: 'block',
                      margin: 0,
                      border: 'none',
                      verticalAlign: 'top',
                      caretColor: el.style.color || '#000000',
                    }}
                    data-element-id={el.id}
                  />
                ) : (
                  <div
                    className={`w-full h-full break-words outline-none whitespace-pre-wrap hover:bg-white/50 transition-colors ${!el.content ? 'text-gray-300 italic' : ''}`}
                    style={{
                      fontSize: `${el.style.fontSize}px`,
                      fontWeight: el.style.fontWeight,
                      fontFamily: el.style.fontFamily,
                      fontStyle: el.style.fontStyle,
                      color: el.style.color || '#000000',
                      textAlign: el.style.textAlign,
                      opacity: el.style.opacity,
                      backgroundColor: el.style.backgroundColor,
                      lineHeight: el.style.lineHeight || 1.4, // Sync with textarea
                      boxShadow: el.style.boxShadow,
                      background: el.style.background,
                      padding: '4px 8px', // Sync with textarea
                      boxSizing: 'border-box',
                      verticalAlign: 'top',
                      overflow: 'visible',
                    }}
                  >
                    {el.content || t.clickToEdit || 'Clique para editar...'}
                  </div>
                )
              )}
              {el.type === 'image' && (
                <>
                  <div className="w-full h-full overflow-hidden" style={{ borderRadius: `${el.style.borderRadius}px` }}>
                    <img
                      src={el.content}
                      alt="Element"
                      className="w-full h-full object-cover pointer-events-none"
                      style={{
                        opacity: el.style.opacity,
                        boxShadow: el.style.boxShadow,
                        border: el.style.borderWidth ? `${el.style.borderWidth}px solid ${el.style.borderColor || 'transparent'}` : undefined,
                        filter: `
                        brightness(${el.style.brightness ?? 100}%)
                        contrast(${el.style.contrast ?? 100}%)
                        saturate(${el.style.saturation ?? 100}%)
                        blur(${el.style.blur ?? 0}px)
                        grayscale(${el.style.grayscale ?? 0}%)
                        sepia(${el.style.sepia ?? 0}%)
                        `,
                      }}
                    />
                  </div>

                  {isCropping && selectedElementId === el.id && (
                    <CropOverlay
                      language={language}
                      element={el}
                      onConfirm={onCropConfirm!}
                      onCancel={onCropCancel!}
                    />
                  )}
                </>
              )}
              {el.type === 'shape' && (
                <div
                  className={`w-full h-full overflow-hidden flex items-center justify-center transition-all ${selectedElementId === el.id ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    onTriggerElementImageUpload?.(el.id);
                  }}
                  style={{
                    backgroundColor: el.style.backgroundColor || (!el.style.background ? '#CBD5E1' : 'transparent'),
                    background: el.style.background,
                    borderRadius: `${el.style.borderRadius}px`,
                    border: `${el.style.borderWidth || 0}px solid ${el.style.borderColor || 'transparent'}`,
                    opacity: el.style.opacity ?? 1,
                    boxShadow: el.style.boxShadow,
                    position: 'relative',
                    clipPath: el.style.clipPath
                  }}
                >
                  {selectedElementId === el.id && !el.style.background && !isExporting && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTriggerElementImageUpload?.(el.id);
                      }}
                      className="group/add p-3 bg-white/90 hover:bg-white rounded-full shadow-lg border border-indigo-100 transition-all transform hover:scale-110 flex items-center gap-2"
                      title={t.insertWithPhoto}
                    >
                      <div className="relative">
                        <ImageIcon size={20} className="text-indigo-600" />
                        <Plus size={10} className="absolute -top-1 -right-1 text-indigo-700 bg-white rounded-full border border-indigo-200" />
                      </div>
                      <span className="text-[10px] font-bold text-indigo-700 pr-1">{t.insertWithPhoto}</span>
                    </button>
                  )}
                </div>
              )}

              {el.type === 'smart-element' && (
                <div
                  className="w-full h-full"
                  style={{
                    opacity: el.style.opacity,
                    borderRadius: el.style.borderRadius,
                    boxShadow: el.style.boxShadow,
                    background: el.style.background || el.style.backgroundColor,
                    // Propagate text styles
                    fontSize: el.style.fontSize ? `${el.style.fontSize}px` : undefined,
                    color: el.style.color,
                    fontFamily: el.style.fontFamily,
                    textAlign: el.style.textAlign,
                    lineHeight: el.style.lineHeight || 1.2,
                    maxHeight: '100%',
                    overflow: el.content === 'ProfessionalPhoto' ? 'visible' : 'visible',
                    overflowY: el.content === 'ProfessionalPhoto' ? 'visible' : 'auto'
                  }}
                >
                  {el.content === 'ProfessionalPhoto' && (
                    <ProfessionalPhoto
                      elementId={el.id}
                      templateId={el.componentData?.templateId}
                      data={el.componentData}
                      userImage={el.componentData?.userImage}
                      onUpdate={(newData) => onUpdateElement(el.id, { componentData: newData })}
                      onUpdateElement={onUpdateElement}
                      onTriggerImageUpload={onTriggerElementImageUpload}
                      onTriggerCamera={onTriggerCamera}
                      isExporting={isExporting}
                    />
                  )}
                  {el.content === 'ResumeSection' && (
                    <ResumeSection
                      elementId={el.id}
                      templateId={el.componentData?.templateId}
                      data={el.componentData}
                      onUpdate={(newData) => onUpdateElement(el.id, { componentData: newData })}
                      onHeightChange={(newHeight) => {
                        const lastHeight = lastAutoHeights.current[el.id];
                        const currentHeight = el.height || 0;

                        // ONLY trigger if the content actually grew significantly beyond current 
                        // OR if it's the first time.
                        const isNew = lastHeight === undefined;
                        const isSignificantGrowth = newHeight > currentHeight + 2;
                        const isSignificantShrink = newHeight < lastHeight - 10;

                        if (isNew || isSignificantGrowth || isSignificantShrink) {
                          const delta = newHeight - currentHeight;
                          lastAutoHeights.current[el.id] = newHeight;

                          // 1. Update the self height
                          onUpdateElement(el.id, { height: newHeight + 8 });

                          // 2. PUSH LOGIC: Shift elements below this one
                          // Find elements with same X range and Y > current Y
                          const elementsBelow = page.elements.filter(other =>
                            other.id !== el.id &&
                            other.y > el.y &&
                            // Sharing X overlap (roughly same column)
                            Math.abs(other.x - el.x) < 50
                          );

                          elementsBelow.forEach(other => {
                            onUpdateElement(other.id, { y: other.y + delta });
                          });
                        }
                      }}
                      onTriggerImageUpload={onTriggerElementImageUpload}
                      onTriggerCamera={onTriggerCamera}
                    />
                  )}
                </div>
              )}

              {el.type === 'table' && (
                <div
                  className="w-full h-full overflow-hidden border-collapse"
                  style={{
                    borderRadius: `${el.style.borderRadius}px`,
                    opacity: el.style.opacity,
                    backgroundColor: el.style.backgroundColor || '#ffffff'
                  }}
                >
                  <table className="w-full h-full table-fixed border-collapse" style={{ height: '100%', width: '100%', tableLayout: 'fixed' }}>
                    <tbody>
                      {el.tableData?.map((row, rowIndex) => (
                        <tr key={rowIndex} style={{ height: `${100 / (el.tableData?.length || 1)}%` }}>
                          {row.map((cell, colIndex) => (
                            <td
                              key={colIndex}
                              className="border border-gray-300 relative group/cell"
                              style={{
                                padding: '0px', // Remove padding to avoid dimension shifts
                                borderColor: el.style.borderColorTable || '#e2e8f0',
                                backgroundColor: rowIndex === 0 ? (el.style.headerBackgroundColor || '#f8fafc') : 'transparent',
                                color: rowIndex === 0 ? (el.style.headerTextColor || el.style.color) : el.style.color,
                                fontSize: `${el.style.fontSize}px`,
                                fontFamily: el.style.fontFamily,
                                textAlign: el.style.textAlign as any,
                                width: `${100 / row.length}%`,
                                height: '100%',
                                boxSizing: 'border-box'
                              }}
                            >
                              <div className="w-full h-full relative" style={{ padding: `${el.style.cellPadding || 8}px`, boxSizing: 'border-box' }}>
                                {selectedElementId === el.id ? (
                                  <textarea
                                    value={cell}
                                    onChange={(e) => {
                                      const newData = [...(el.tableData || [])];
                                      newData[rowIndex][colIndex] = e.target.value;
                                      onUpdateElement(el.id, { tableData: newData });
                                    }}
                                    className="w-full h-full bg-transparent outline-none resize-none overflow-hidden"
                                    style={{ border: 'none', display: 'block' }}
                                  />
                                ) : (
                                  <div className="w-full h-full overflow-hidden break-words">
                                    {cell}
                                  </div>
                                )}
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Selection Border - Only for non-locked elements and not during export */}
              {selectedElementId === el.id && !el.locked && !isExporting && !(el.type === 'smart-element' && el.content === 'ProfessionalPhoto') && (
                <>
                  {/* Floating Toolbar for Text */}
                  {el.type === 'text' && (
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-xl border border-gray-200 flex items-center p-1 gap-1 z-[60] animate-in fade-in zoom-in duration-200">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateElement(el.id, { style: { ...el.style, fontWeight: el.style.fontWeight === 'bold' ? 'normal' : 'bold' } });
                        }}
                        className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${el.style.fontWeight === 'bold' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600'}`}
                        title="Bold"
                      >
                        <Bold size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateElement(el.id, { style: { ...el.style, fontStyle: el.style.fontStyle === 'italic' ? 'normal' : 'italic' } });
                        }}
                        className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${el.style.fontStyle === 'italic' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600'}`}
                        title="Italic"
                      >
                        <Italic size={14} />
                      </button>
                      <div className="w-px h-4 bg-gray-200 mx-1" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateElement(el.id, { style: { ...el.style, fontSize: Math.max(8, (el.style.fontSize || 16) - 1) } });
                        }}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
                        title="Decrease Font"
                      >
                        <Type size={12} />
                      </button>
                      <span className="text-[10px] font-bold text-gray-400 min-w-[20px] text-center">{el.style.fontSize}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateElement(el.id, { style: { ...el.style, fontSize: Math.min(120, (el.style.fontSize || 16) + 1) } });
                        }}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
                        title="Increase Font"
                      >
                        <Type size={16} />
                      </button>
                    </div>
                  )}

                  <div className="absolute inset-x-[-1px] inset-y-[-1px] border border-indigo-500 rounded-sm pointer-events-none z-50 shadow-[0_0_4px_rgba(79,70,229,0.2)]">
                    {/* Resize Handles - Square handles for professional look */}
                    <div
                      onMouseDown={(e) => handleResizeStart(e, 'nw', el)}
                      className="absolute -top-1 -left-1 w-2 h-2 bg-white border border-indigo-500 rounded-sm z-10 cursor-nwse-resize hover:scale-125 transition-transform pointer-events-auto"
                    />
                    <div
                      onMouseDown={(e) => handleResizeStart(e, 'ne', el)}
                      className="absolute -top-1 -right-1 w-2 h-2 bg-white border border-indigo-500 rounded-sm z-10 cursor-nesw-resize hover:scale-125 transition-transform pointer-events-auto"
                    />
                    <div
                      onMouseDown={(e) => handleResizeStart(e, 'sw', el)}
                      className="absolute -bottom-1 -left-1 w-2 h-2 bg-white border border-indigo-500 rounded-sm z-10 cursor-nesw-resize hover:scale-125 transition-transform pointer-events-auto"
                    />
                    <div
                      onMouseDown={(e) => handleResizeStart(e, 'se', el)}
                      className="absolute -bottom-1 -right-1 w-2 h-2 bg-white border border-indigo-500 rounded-sm z-10 cursor-nwse-resize hover:scale-125 transition-transform pointer-events-auto"
                    />

                    {/* Side Handles for better width control */}
                    <div
                      onMouseDown={(e) => handleResizeStart(e, 'e', el)}
                      className="absolute top-1/2 -right-1 w-1.5 h-4 bg-white border border-indigo-500 rounded-sm z-10 -translate-y-1/2 cursor-ew-resize hover:scale-110 transition-transform pointer-events-auto"
                    />
                    <div
                      onMouseDown={(e) => handleResizeStart(e, 'w', el)}
                      className="absolute top-1/2 -left-1 w-1.5 h-4 bg-white border border-indigo-500 rounded-sm z-10 -translate-y-1/2 cursor-ew-resize hover:scale-110 transition-transform pointer-events-auto"
                    />
                  </div>
                  {!el.locked && (
                    <div
                      className="absolute -top-4 left-1/2 -translate-x-1/2 w-2 h-2 bg-indigo-500 border border-white rounded-full z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                      title={t.rotate}
                    />
                  )}
                </>
              )}
            </div>
          ))}

          {/* Eraser Preview */}
          {erasing && (
            <div
              className="absolute border-2 border-indigo-400 bg-white/80 pointer-events-none z-[100] shadow-lg"
              style={{
                left: `${erasing.currentX - brushSize.width / 2}px`,
                top: `${erasing.currentY - brushSize.height / 2}px`,
                width: `${brushSize.width}px`,
                height: `${brushSize.height}px`,
                transform: 'translate(0, 0)',
                boxShadow: '0 0 15px rgba(0,0,0,0.1)'
              }}
            />
          )}
        </div>
      </div>
    </div >
  );
};

export default EditorCanvas;
