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
        let svgString = serializer.serializeToString(svgEl);

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

            svgString = fixSvgSize(svgString, width, height);

            // 🎭 Draw base SVG first (this contains the shape/mask)
            await drawSvgToCanvas(ctx, svgString, width, height);

            // 🎭 Create a mask canvas from the base SVG
            const maskCanvas = document.createElement('canvas');
            maskCanvas.width = width;
            maskCanvas.height = height;
            const maskCtx = maskCanvas.getContext('2d');
            if (!maskCtx) {
                ctx.restore();
                formatPngForDownload(canvas, fileName);
                return;
            }

            await new Promise<void>((resolve) => {
                const maskImg = new Image();
                maskImg.onload = () => {
                    maskCtx.drawImage(maskImg, 0, 0, width, height);
                    resolve();
                };
                maskImg.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
            });

            // Get mask image data for per-pixel clipping
            const maskImageData = maskCtx.getImageData(0, 0, width, height);
            const maskData = maskImageData.data;

            // Draw items with clipping applied
            for (const item of uploadedItems) {
                if (item.type === 'image') {
                    await drawImageItemWithMask(item, ctx, maskData, width, height);
                } else if (item.type === 'text' && item.text) {
                    drawTextItemWithMask(item, ctx, maskData, width, height);
                }
            }

            ctx.restore();
            formatPngForDownload(canvas, fileName);
        } finally {
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
    let svgString = serializer.serializeToString(svgEl);

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

    svgString = fixSvgSize(svgString, width, height);

    await drawSvgToCanvas(ctx, svgString, width, height);

    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = width;
    maskCanvas.height = height;
    const maskCtx = maskCanvas.getContext('2d');
    if (!maskCtx) {
        ctx.restore();
        formatPngForDownload(canvas, fileName);
        return;
    }

    await new Promise<void>((resolve) => {
        const maskImg = new Image();
        maskImg.onload = () => {
            maskCtx.drawImage(maskImg, 0, 0, width, height);
            resolve();
        };
        maskImg.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
    });

    // Get mask image data for per-pixel clipping
    const maskImageData = maskCtx.getImageData(0, 0, width, height);
    const maskData = maskImageData.data;

    // Draw parts with mask
    for (const part of uploadedPart) {
        if (part.path) {
            await drawImagePartWithMask(part, ctx, maskData, width, height);
        }
    }

    // Draw items with mask
    for (const item of uploadedItems) {
        if (item.type === 'image') {
            await drawImageItemWithMask(item, ctx, maskData, width, height);
        } else if (item.type === 'text' && item.text) {
            drawTextItemWithMask(item, ctx, maskData, width, height);
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

// 🎭 Draw image with clipping mask applied
async function drawImageItemWithMask(item: any, ctx: CanvasRenderingContext2D, maskData: Uint8ClampedArray, width: number, height: number) {
    return new Promise<void>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            // Create temporary canvas for this item
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = width;
            tempCanvas.height = height;
            const tempCtx = tempCanvas.getContext('2d');
            if (!tempCtx) {
                resolve();
                return;
            }

            // Draw the item on temp canvas
            tempCtx.save();
            tempCtx.translate(item.x + item.width / 2, item.y + item.height / 2);
            tempCtx.rotate((item.rotation * Math.PI) / 180);
            tempCtx.drawImage(img, -item.width / 2, -item.height / 2, item.width, item.height);
            tempCtx.restore();

            // Apply mask using imageData
            const itemImageData = tempCtx.getImageData(0, 0, width, height);
            const itemData = itemImageData.data;

            // Apply mask by multiplying alpha channels
            for (let i = 3; i < itemData.length; i += 4) {
                const maskAlpha = maskData[i] / 255;
                itemData[i] = Math.round(itemData[i] * maskAlpha);
            }

            tempCtx.putImageData(itemImageData, 0, 0);
            ctx.drawImage(tempCanvas, 0, 0);
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

// 🎭 Draw part (colored image) with clipping mask applied
async function drawImagePartWithMask(part: PartLayer, ctx: CanvasRenderingContext2D, maskData: Uint8ClampedArray, width: number, height: number) {
    return new Promise<void>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            // Create temporary canvas for this part
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = width;
            tempCanvas.height = height;
            const tempCtx = tempCanvas.getContext('2d');
            if (!tempCtx) {
                resolve();
                return;
            }

            // Draw the part on temp canvas
            tempCtx.drawImage(img, 0, 0, width, height);

            // Apply mask using imageData
            const partImageData = tempCtx.getImageData(0, 0, width, height);
            const partData = partImageData.data;

            // Apply mask by multiplying alpha channels
            for (let i = 3; i < partData.length; i += 4) {
                const maskAlpha = maskData[i] / 255;
                partData[i] = Math.round(partData[i] * maskAlpha);
            }

            tempCtx.putImageData(partImageData, 0, 0);
            ctx.drawImage(tempCanvas, 0, 0);
            resolve();
        };

        img.src = part.path;
    });
}

function drawTextItemWithMask(
    item: TextLayer,
    ctx: CanvasRenderingContext2D,
    maskData: Uint8ClampedArray,
    width: number,
    height: number
) {
    ctx.save();

    const fontWeight = item.bold ? 'bold' : 'normal';
    const fontStyle = item.italic ? 'italic' : 'normal';
    const fontSize = item.fontSize || 20;
    const fontFamily = item.fontFamily || 'Arial';

    // Create temporary canvas for text
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) {
        ctx.restore();
        return;
    }

    // Set font
    tempCtx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
    tempCtx.textAlign = item.textAlignment || 'center';
    tempCtx.textBaseline = 'middle';
    tempCtx.translate(item.x + (item.width || 0) / 2, item.y + (item.height || 0) / 2);
    if (item.rotation) tempCtx.rotate((item.rotation * Math.PI) / 180);

    // Stroke text (if stroke is defined)
    if (item.stroke && item.stroke > 0) {
        tempCtx.lineWidth = item.stroke && item.stroke >= 1 ? item.stroke - 1 : item.stroke;
        tempCtx.strokeStyle = item.strokeColor || '#000';
        tempCtx.lineJoin = 'round'; // smooth corners
        tempCtx.lineCap = 'round';

        tempCtx.strokeText(item.text || '', 0, 0);
    }

    // Fill text
    tempCtx.fillStyle = item.color || '#000';
    tempCtx.fillText(item.text || '', 0, 0);

    // Apply mask using imageData
    const textImageData = tempCtx.getImageData(0, 0, width, height);
    const textData = textImageData.data;

    // Apply mask by multiplying alpha channels
    for (let i = 3; i < textData.length; i += 4) {
        const maskAlpha = maskData[i] / 255;
        textData[i] = Math.round(textData[i] * maskAlpha);
    }

    tempCtx.putImageData(textImageData, 0, 0);
    ctx.drawImage(tempCanvas, 0, 0);
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

    console.log(serializer.serializeToString(svgEl));

    for (const item of uploadedItems) {
        if (item.type === 'image') {
            const href = await embedImageAsBase64(item.src || '');
            const transform = `translate(${item.x + item.width / 2},${item.y + item.height / 2}) rotate(${item.rotation || 0}) translate(${-item.width / 2},${-item.height / 2})`;
            itemSvgs.push(`<image href="${href}" width="${item.width}" height="${item.height}" transform="${transform}" />`);
        } else if (item.type === 'text' && item.text) {
            const fontWeight = item.bold ? '900' : '700';
            const fontStyle = item.italic ? 'italic' : 'normal';
            const fontSize = item.fontSize || 20;
            const fontFamily = item.fontFamily || 'Arial';
            const textAnchor = item.textAlignment === 'left' ? 'start' : item.textAlignment === 'right' ? 'end' : 'middle';
            const centerX = item.x + (item.width || 0) / 2;
            const centerY = item.y + (item.height || 0) / 2;
            const transform = `translate(${centerX},${centerY}) rotate(${item.rotation || 0}) translate(0, ${fontSize / 2})`;

            const stroke = item.stroke ? `stroke="${item.strokeColor || '#000'}" stroke-width="${item.stroke && item.stroke >= 1 ? item.stroke - 1  : item.stroke  }" stroke-linejoin="round" stroke-linecap="round"` : '';

            itemSvgs.push(
                `<text
                    font-family="${fontFamily}"
                    font-size="${fontSize}"
                    font-style="${fontStyle}"
                    font-weight="${fontWeight}"
                    fill="${item.color || '#000'}"
                    ${stroke}
                    text-anchor="${textAnchor}"
                    transform="${transform}"
                >
                    ${item.text}
                </text>`
            );

        }
    }

    const partSvgs = uploadedPart
        ? uploadedPart
              .map((part) => (part.path ? `<image href="${part.path}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet" />` : ''))
              .join('\n')
        : '';

    // Use the rendered base SVG as a mask so items/parts are clipped the same way PNG export does.
    // We embed the baseSvg as a data-image inside the mask so the mask reflects the visual rendering.
    const baseSvgDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(baseSvg);

    const svgOutput = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
            <defs>
                <!-- Use alpha channel of the embedded SVG image for masking -->
                <mask id="export-mask" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse" mask-type="alpha" x="0" y="0" width="${width}" height="${height}">
                    <image href="${baseSvgDataUrl}" x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet" />
                </mask>
            </defs>

            <!-- Render the base SVG visually so the template is visible in the exported SVG -->
            <image href="${baseSvgDataUrl}" x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet" />

            <!-- Draw parts and items inside a group that uses the mask -->
            <g mask="url(#export-mask)">
                ${partSvgs}
                ${itemSvgs.join('\n')}
            </g>
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

function fixSvgSize(svgString: string, width: number, height: number) {
    svgString = svgString.replace(/width="[^"]*"/, `width="${width}px"`);
    svgString = svgString.replace(/height="[^"]*"/, `height="${height}px"`);

    if (!svgString.includes('viewBox=')) {
        svgString = svgString.replace('<svg', `<svg viewBox="0 0 ${width} ${height}"`);
    }

    return svgString;
}
