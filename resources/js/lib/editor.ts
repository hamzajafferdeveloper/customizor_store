import { LogoGallery } from '@/types/data';
import { CanvasItem } from '@/types/editor';
import { Template, TemplatePart } from '@/types/helper';
import { RefObject } from 'react';
import { toBase64 } from './fileUtils';

const id = typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36);

// Click On SvgTemplate Container
export const handleClickonSvgContainer = (
    event: React.MouseEvent<HTMLDivElement>,
    parts: TemplatePart[],
    setOpenColorMenu: (value: string) => void,
): void => {
    const target = event.target as HTMLElement;
    const partId = target.getAttribute('part-id');
    if (partId) {
        const matchedPart = parts.find((part) => part.part_id.includes(partId));

        setOpenColorMenu(matchedPart?.name ?? '');
    }
};

// Load SvgTemplate and assign parts
export const loadSvgtemplate = (template: Template, setParts: any) => {
    const container = document.getElementById('svg-container');
    if (container && template.template) {
        container.innerHTML = template.template;

        // Ensure SVG root has xmlns:xlink attribute
        const svgEl = container.querySelector('svg');
        if (svgEl && !svgEl.hasAttribute('xmlns:xlink')) {
            svgEl.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
        }
    }

    const groupedParts = template.part.reduce((acc: any[], part: any) => {
        const existing = acc.find((p) => p.name === part.name);

        if (existing) {
            // Add this part_id to the existing group
            if (!existing.part_id.includes(part.part_id)) {
                existing.part_id.push(part.part_id);
            }
            existing.is_group = true;
        } else {
            acc.push({
                id: part.id,
                name: part.name,
                part_id: [part.part_id],
                template_id: part.template_id,
                type: part.type,
                color: part.color,
                is_group: false,
                created_at: part.created_at,
                updated_at: part.updated_at,
            });
        }

        return acc;
    }, []);

    const finalParts: TemplatePart[] = groupedParts.map((item) => ({ ...item }));

    setParts(finalParts);
};

// Paint Part of SvgTemplate
export const handlePaintPart = (part: TemplatePart, color: string, svgContainer: HTMLDivElement) => {
    const partIds = Array.isArray(part.part_id) ? part.part_id : [part.part_id];

    partIds.forEach((id) => {
        const el = svgContainer.querySelector(`[part-id="${id}"], [id="${id}"]`) as SVGElement | null;

        if (el) {
            // Prefer setting both fill attributes and style
            el.setAttribute('fill', color);
            el.setAttribute('stroke', color); // optional fallback

            // Handle inline style
            if (el.style) {
                el.style.fill = color;
            }
        } else {
            console.warn(`❌ Element not found for id/part-id: ${id}`);
        }
    });
};

// Handle Upload File
export const handleUploadFile = (
    e: React.ChangeEvent<HTMLInputElement>,
    setUploadedItems: (value: ((prevState: CanvasItem[]) => CanvasItem[]) | CanvasItem[]) => void,
) => {
    const files = e.target.files;
    if (!files) return;

    const newItems: CanvasItem[] = [];

    Array.from(files).forEach((file) => {
        const src = URL.createObjectURL(file);
        const isSvg = file.type === 'image/svg+xml';

        const newItem: CanvasItem = {
            id: id,
            type: 'image',
            fileType: isSvg ? 'svg' : 'image',
            src,
            name: file.name,
            originalFileName: file.name,
            x: 100,
            y: 100,
            width: 200,
            height: 200,
            rotation: 0,
            zIndex: 10,
        };

        newItems.push(newItem);
    });

    setUploadedItems((prev) => [...prev, ...newItems]);
};

// Handle Upload Logo
export const handleUploadLogo = async (logo: LogoGallery, setUploadedItems: React.Dispatch<React.SetStateAction<CanvasItem[]>>) => {
    const base64Logo = await toBase64(`/storage/${logo.source}`);

    const newItem: CanvasItem = {
        id: id,
        type: 'image',
        fileType: 'logo',
        src: base64Logo, // ✅ Use Base64
        name: logo.name,
        originalFileName: logo.name,
        x: 100,
        y: 100,
        width: 200,
        height: 200,
        rotation: 0,
        zIndex: 10,
    };

    setUploadedItems((prev) => [...prev, newItem]);
};
// Handle Add Text
export const handleAddText = (setUploadedItems: (value: ((prevState: CanvasItem[]) => CanvasItem[]) | CanvasItem[]) => void) => {
    const newItems: CanvasItem[] = [];

    const newItem: CanvasItem = {
        id: id,
        type: 'text',
        text: 'Text here',
        fontSize: 16,
        fontFamily: 'Arial',
        color: '#000000',
        x: 100,
        y: 100,
        width: 100,
        height: 20,
        rotation: 0,
        zIndex: 10,
        bold: false,
        underline: false,
        stroke: 0,
        strokeColor: '#000000',
        italic: false,
    };

    newItems.push(newItem);

    setUploadedItems((prev) => [...prev, ...newItems]);
};

// Handle Delete Item
export const handleDeleteItem = (id: string, setUploadedItems: (value: ((prevState: CanvasItem[]) => CanvasItem[]) | CanvasItem[]) => void) => {
    setUploadedItems((prevItems) => prevItems.filter((item) => item.id !== id));
};

// Handle Mouse function to move the items
export const handleMouseDown = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
    item: CanvasItem,
    svgContainerRef: RefObject<HTMLDivElement | null>,
    setDraggingId: (value: string) => void,
    offsetRef: RefObject<{ offsetX: number; offsetY: number }>,
) => {
    if (!svgContainerRef.current) return;

    const rect = svgContainerRef.current.getBoundingClientRect();

    // Get clientX and clientY from either mouse or touch event
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    setDraggingId(item.id);
    offsetRef.current = {
        offsetX: clientX - rect.left - item.x,
        offsetY: clientY - rect.top - item.y,
    };

    e.stopPropagation(); // Prevent parent handlers
    e.preventDefault(); // Prevent scroll/zoom
};
