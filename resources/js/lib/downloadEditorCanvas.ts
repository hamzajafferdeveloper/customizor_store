import { PartLayer } from '@/types/createProduct';
import { CanvasItem, TextLayer } from '@/types/editor';

/**
 * ✅ Export the clipped mask (template + uploaded items)
 *    - SVG: downloads
 *    - PNG: converts SVG to PNG and downloads
 *    - No uploadedPart logic here
 */
export async function downloadClippedCanvas({
    svgContainerId,
    uploadedItems,
    svgOverlayBox,
    zoom,
    pan,
    format = 'png',
    fileName = 'canvas',
}: {
    svgContainerId: string;
    uploadedItems: CanvasItem[];
    svgOverlayBox: { left: number; top: number; width: number; height: number };
    zoom: number;
    pan: { x: number; y: number };
    format: 'png' | 'svg';
    fileName?: string;
}) {
    const { width, height } = svgOverlayBox;
    const svgContainer = document.getElementById(svgContainerId);
    if (!svgContainer) return;

    const svgEl = svgContainer.querySelector('svg');
    if (!svgEl) return;

    // 🧠 Create loader (shown for both SVG and PNG)
    const loader = document.createElement('div');
    loader.id = 'export-loader';
    loader.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 18px;
    font-weight: 600;
    z-index: 9999;
  `;
    loader.textContent = format === 'svg' ? 'Generating SVG... please wait' : 'Generating PNG... please wait';
    document.body.appendChild(loader);

    try {
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgEl);

        // 🧩 SVG export
        if (format === 'svg') {
            try {
                // Generate full SVG file and download it
                const fullSvgString = await formatSVGForDownload(svgEl, uploadedItems, fileName, width, height, true);

                // @ts-ignore
                const blob = new Blob([fullSvgString], {
                    type: 'image/svg+xml;charset=utf-8',
                });
                const url = URL.createObjectURL(blob);

                const link = document.createElement('a');
                link.href = url;
                link.download = `${fileName}.svg`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // Wait briefly to ensure browser finishes starting the download
                await new Promise((res) => setTimeout(res, 500));
                URL.revokeObjectURL(url);
            } finally {
                // ✅ Hide loader AFTER SVG download triggered
                const loaderEl = document.getElementById('export-loader');
                if (loaderEl) loaderEl.remove();
            }
            return;
        }

        try {
            const canvas = document.createElement('canvas');
            canvas.width = width * zoom;
            canvas.height = height * zoom;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            ctx.save();
            ctx.scale(zoom, zoom);
            ctx.translate(pan.x, pan.y);

            await drawSvgToCanvas(ctx, svgString, width, height);

            for (const item of uploadedItems) {
                if (item.type === 'image') {
                    await drawImageItem(item, ctx);
                } else if (item.type === 'text' && item.text) {
                    drawTextItem(item, ctx);
                }
            }

            // 🎭 Apply mask using template (destination-in)
            await new Promise<void>((resolve) => {
                const maskImg = new Image();
                maskImg.onload = () => {
                    ctx.globalCompositeOperation = 'destination-in';
                    ctx.drawImage(maskImg, 0, 0, width, height);
                    ctx.globalCompositeOperation = 'source-over';
                    resolve();
                };
                maskImg.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
            });

            ctx.restore();
            formatPngForDownload(canvas, fileName);
        } finally {
            console.error('❌ Image failed to load during PNG export');
            const loaderEl = document.getElementById('export-loader');
            if (loaderEl) loaderEl.remove();
        }
    } catch (err) {
        console.error('❌ Export failed:', err);
        alert('Something went wrong during export.');
        const loaderEl = document.getElementById('export-loader');
        if (loaderEl) loaderEl.remove();
    }
}

/**
 * ✅ Export with parts (used in CreateProduct)
 */
export async function downloadCreateProduct({
    svgContainerId,
    uploadedItems,
    uploadedPart,
    svgOverlayBox,
    zoom,
    pan,
    format = 'png',
    fileName = 'canvas',
}: {
    svgContainerId: string;
    uploadedItems: CanvasItem[];
    uploadedPart: PartLayer[];
    svgOverlayBox: { left: number; top: number; width: number; height: number };
    zoom: number;
    pan: { x: number; y: number };
    format: 'png' | 'svg';
    fileName?: string;
}) {
    const { width, height } = svgOverlayBox;
    const svgContainer = document.getElementById(svgContainerId);
    if (!svgContainer) return;
    const svgEl = svgContainer.querySelector('svg');
    if (!svgEl) return;

    uploadedPart.forEach((part) => {
        if (part.color) {
            const el = svgEl.querySelector(`[part-id="${part.id}"], [data-category-id="${part.category_id}"]`);
            if (el) {
                el.setAttribute('fill', part.color);
                // @ts-ignore
                el.style.fill = part.color;
            }
        }
    });

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgEl);

    if (format === 'svg') {
        await formatSVGForDownload(svgEl, uploadedItems, fileName, width, height, false, uploadedPart);
        return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = width * zoom;
    canvas.height = height * zoom;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.translate(pan.x, pan.y);

    await drawSvgToCanvas(ctx, svgString, width, height);

    for (const part of uploadedPart) {
        if (part.path) {
            await new Promise<void>((resolve) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => {
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve();
                };
                img.src = part.path;
            });
        }
    }

    for (const item of uploadedItems) {
        if (item.type === 'image') {
            await drawImageItem(item, ctx);
        } else if (item.type === 'text' && item.text) {
            drawTextItem(item, ctx);
        }
    }

    ctx.restore();
    formatPngForDownload(canvas, fileName);
}

/**
 * ✅ New utility: create SVG string (like ClippedMask but returns only SVG)
 */
export function generateCanvasSVG({
    svgContainerId,
    uploadedItems,
    svgOverlayBox,
}: {
    svgContainerId: string;
    uploadedItems: CanvasItem[];
    svgOverlayBox: { left: number; top: number; width: number; height: number };
}) {
    const { width, height } = svgOverlayBox;
    const svgContainer = document.getElementById(svgContainerId);
    if (!svgContainer) return '';
    const svgEl = svgContainer.querySelector('svg');
    if (!svgEl) return '';
    return formatSVGForDownload(svgEl, uploadedItems, 'temp', width, height, true);
}

/* ------------------ Helpers ------------------ */

async function drawSvgToCanvas(ctx: CanvasRenderingContext2D, svgString: string, width: number, height: number) {
    return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 0, 0, width, height);
            resolve();
        };
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
    });
}

async function drawImageItem(item: any, ctx: CanvasRenderingContext2D) {
    return new Promise<void>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            ctx.save();
            ctx.translate(item.x + item.width / 2, item.y + item.height / 2);
            ctx.rotate((item.rotation * Math.PI) / 180);
            ctx.drawImage(img, -item.width / 2, -item.height / 2, item.width, item.height);
            ctx.restore();
            resolve();
        };

        if (item.file instanceof File) {
            const reader = new FileReader();
            reader.onload = () => (img.src = reader.result as string);
            reader.readAsDataURL(item.file);
        } else if (item.src?.startsWith('<svg')) {
            img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(item.src);
        } else {
            img.src = item.src || '';
        }
    });
}

function drawTextItem(item: TextLayer, ctx: CanvasRenderingContext2D) {
    ctx.save();
    const fontWeight = item.bold ? 'bold' : 'normal';
    const fontStyle = item.italic ? 'italic' : 'normal';
    const fontSize = item.fontSize || 20;
    const fontFamily = item.fontFamily || 'Arial';
    ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = item.color || '#000';
    ctx.textAlign = item.textAlignment || 'center';
    ctx.textBaseline = 'middle';
    ctx.translate(item.x + (item.width || 0) / 2, item.y + (item.height || 0) / 2);
    if (item.rotation) ctx.rotate((item.rotation * Math.PI) / 180);
    ctx.fillText(item.text || '', 0, 0);
    ctx.restore();
}

async function formatSVGForDownload(
    svgEl: SVGSVGElement,
    uploadedItems: CanvasItem[],
    fileName: string,
    width: number,
    height: number,
    returnString = false,
    uploadedPart?: PartLayer[],
) {
    console.log('SVG Element for formatting:', svgEl);
    const serializer = new XMLSerializer();
    const baseSvg = serializer.serializeToString(svgEl);

    const embedImageAsBase64 = async (src: string): Promise<string> => {
        if (!src) return '';
        if (src.startsWith('data:')) return src;
        return await new Promise((resolve) => {
            fetch(src)
                .then((res) => res.blob())
                .then((blob) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.readAsDataURL(blob);
                })
                .catch(() => resolve(src));
        });
    };

    const itemSvgs: string[] = [];

    for (const item of uploadedItems) {
        if (item.type === 'image') {
            const href = await embedImageAsBase64(item.src || '');
            const transform = `translate(${item.x + item.width / 2},${item.y + item.height / 2}) rotate(${item.rotation || 0}) translate(${-item.width / 2},${-item.height / 2})`;
            itemSvgs.push(`<image href="${href}" width="${item.width}" height="${item.height}" transform="${transform}" />`);
        } else if (item.type === 'text' && item.text) {
            const fontWeight = item.bold ? 'bold' : 'normal';
            const fontStyle = item.italic ? 'italic' : 'normal';
            const fontSize = item.fontSize || 20;
            const fontFamily = item.fontFamily || 'Arial';
            const textAnchor = item.textAlignment === 'left' ? 'start' : item.textAlignment === 'right' ? 'end' : 'middle';
            const centerX = item.x + (item.width || 0) / 2;
            const centerY = item.y + (item.height || 0) / 2;
            const transform = `translate(${centerX},${centerY}) rotate(${item.rotation || 0}) translate(0, ${fontSize / 2})`;
            itemSvgs.push(
                `<text font-family="${fontFamily}" font-size="${fontSize}" font-style="${fontStyle}" font-weight="${fontWeight}" fill="${item.color || '#000'}" text-anchor="${textAnchor}" transform="${transform}">${item.text}</text>`,
            );
        }
    }

    const partSvgs = uploadedPart
        ? uploadedPart
              .map((part) =>
                  part.path ? `<image href="${part.path}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet" />` : '',
              )
              .join('\n')
        : '';

    const svgOutput = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    ${baseSvg}
    ${partSvgs}
    ${itemSvgs.join('\n')}
  </svg>`;

    if (returnString) return svgOutput;

    const blob = new Blob([svgOutput], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function formatPngForDownload(canvas: HTMLCanvasElement, fileName: string) {
    canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileName}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 'image/png');
}
