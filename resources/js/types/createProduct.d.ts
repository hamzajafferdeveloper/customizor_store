import { CanvasItem } from './editor';

export type PartLayer = {
    id: string;
    name: string;
    zIndex: number;
    category_id: string;
    path: string;
    color?: string; // Optional color
    updatedImage?: string; // Base64 image from recolor
};

type CanvasItemProductBase = CanvasItem & {
    layerType: 'item';
};

type PartLayerProductBase = PartLayer & {
    layerType: 'part';
};

export type CombinedLayer = CanvasItemProductBase | PartLayerProductBase;
