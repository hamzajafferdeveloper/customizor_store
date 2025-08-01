// types/canvas.ts

// Common base for all items on the canvas (image, SVG, or text)
export type CanvasItemBase = {
  id: string;
  name?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  isSelected?: boolean;
  zIndex?: number;
  opacity?: number; // Range: 0 (transparent) to 1 (opaque)
  visible?: boolean; // Defaults to true
  locked?: boolean; // Prevent editing when true
};

// Image or SVG layer
export type UploadLayer = CanvasItemBase & {
  type: 'image';
  fileType: 'svg' | 'image' | 'logo'; // Distinguishes between vector and raster
  src: string; // Data URL or object URL
  originalFileName?: string; // Optional display name
};

// Editable text layer
export type TextLayer = CanvasItemBase & {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
  fontPath?:string;
  bold?: boolean;
  color: string;
  stroke?: number;
  strokeColor?: string;
  italic?: boolean;
  underline?: boolean;
  isCurved?: boolean;
  curveValue?: number; // Degree or arc amount
  curveOrigin?: 'center' | 'left' | 'right';
};

// Discriminated union of all possible canvas items
export type CanvasItem = UploadLayer | TextLayer;

// Global canvas state
export type CanvasState = {
  items: CanvasItem[]; // All items currently on canvas
  selectedItemId: string | null; // Currently selected item
  zoom: number; // Zoom level (e.g., 1 = 100%)
  panX: number; // Horizontal pan offset
  panY: number; // Vertical pan offset
};
