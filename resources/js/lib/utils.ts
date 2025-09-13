import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Color from 'color';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const isLightColor = (hex: string): boolean => {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b);
    return luminance > 186; // threshold
};

export const generateUniqueId = () => {
  return typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2) + Date.now().toString(36);
};


export const extractFillMap = (svgText: string): Record<string, string> => {
  const map: Record<string, string> = {};
  const styleRegex = /\.([a-zA-Z0-9_-]+)\s*\{([^}]+)\}/g;
  let match;

  while ((match = styleRegex.exec(svgText)) !== null) {
    const className = match[1];
    const body = match[2];
    const fillMatch = body.match(/fill\s*:\s*([^;]+);?/);

    if (fillMatch) {
      try {
        const normalized = Color(fillMatch[1].trim()).hex().toUpperCase();
        map[className] = normalized;
      } catch {
        // skip invalid colors
      }
    }
  }
  return map;
};
