
export type ElementType = 'text' | 'image' | 'shape' | 'link' | 'table' | 'smart-element';

export interface EditorElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  content: string;
  // For specialized data
  componentData?: any; // For smart elements
  tableData?: string[][]; // 2D array for table cells
  // For image cropping
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  isBackground?: boolean; // Mark background images as non-interactive
  locked?: boolean;
  originId?: string; // To track split elements across pages
  style: {
    fontSize?: number;
    fontWeight?: string;
    fontFamily?: string;
    fontStyle?: string; // italic, normal, oblique
    color?: string;
    textAlign?: 'left' | 'center' | 'right';
    borderRadius?: number;
    opacity?: number;
    borderWidth?: number;
    borderColor?: string;
    backgroundColor?: string;
    // Table specific
    headerBackgroundColor?: string;
    headerTextColor?: string;
    cellPadding?: number;
    borderColorTable?: string;
    // Image specific
    brightness?: number; // 100% default
    contrast?: number;   // 100% default
    saturation?: number; // 100% default
    blur?: number;       // 0px default
    grayscale?: number;  // 0% default
    sepia?: number;      // 0% default
    background?: string; // For gradients
    boxShadow?: string;
    lineHeight?: number;
  };
}

export interface PDFBlock {
  text: string;
  bbox: [number, number, number, number];
  font: string;
  font_id: number | null;
  size: number;
  color: number;
  origin: [number, number];
  is_subset: boolean;
  flags: number;
}

export interface PDFFont {
  object_id: number;
  is_subset: boolean;
  type: string;
}

export interface PDFPage {
  id: string;
  pageNumber: number;
  backgroundImage?: string; // Base64 image of PDF page (for hybrid mode)
  drawingData?: string; // Base64 image of the drawing layer
  elements: EditorElement[];
  blocks?: PDFBlock[]; // Original text blocks from PDF
  width?: number;
  height?: number;
}

export interface EditorState {
  currentPageId: string;
  pages: PDFPage[];
  selectedElementId: string | null;
  zoom: number;
  sessionId?: string; // Backend session ID for Word conversion
  eraserMode?: boolean; // Eraser tool active
  penMode?: boolean; // Pen tool active
  fonts?: Record<string, PDFFont>; // Original fonts metadata
}
