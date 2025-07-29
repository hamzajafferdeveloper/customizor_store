/**
 * Export the current canvas (SVG template + uploaded items) as SVG or PNG.
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
    uploadedItems: {
        id: string;
        type: 'image' | 'text';
        src?: string;
        text?: string;
        fileType?: string; // svg, image, logo
        width: number;
        height: number;
        x: number;
        y: number;
        rotation: number;
        fontSize?: number;
        fontFamily?: string;
        bold?: boolean;
        underline?: boolean;
        color?: string;
    }[];
    svgOverlayBox: { width: number; height: number };
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

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgEl);

    // ✅ Create canvas with zoom & pan
    const canvas = document.createElement('canvas');
    canvas.width = width * zoom;
    canvas.height = height * zoom;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.translate(pan.x, pan.y);

    // ✅ Draw SVG template
    await new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 0, 0, width, height);
            resolve();
        };
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
    });

    // ✅ Draw all uploaded items
    for (const item of uploadedItems) {
        await new Promise<void>((resolve) => {
            if (item.type === 'image') {
                const img = new Image();
                img.crossOrigin = 'anonymous'; // ✅ Handle CORS issues for remote logos
                img.onload = () => {
                    ctx.save();
                    ctx.translate(item.x + item.width / 2, item.y + item.height / 2);
                    ctx.rotate((item.rotation * Math.PI) / 180);
                    ctx.drawImage(img, -item.width / 2, -item.height / 2, item.width, item.height);
                    ctx.restore();
                    resolve();
                };

                if (item.fileType === 'svg') {
                    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(item.src || '');
                } else if (item.fileType === 'logo') {
                    // ✅ Detect if the logo is SVG or raster
                    if (item.src?.trim().startsWith('<svg')) {
                        // Inline SVG content
                        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(item.src);
                    } else if (item.src?.endsWith('.svg')) {
                        // Logo file is SVG URL
                        img.src = item.src;
                    } else {
                        // ✅ Assume it's raster (PNG/JPG)
                        img.src = item.src || '';
                    }
                } else {
                    img.src = item.src || '';
                }
            }
        });
    }

    // ✅ Apply mask using template
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

    // ✅ Export file
    if (format === 'png') {
        canvas.toBlob((blob) => {
            if (!blob) return;
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${fileName}.png`;
            link.click();
            URL.revokeObjectURL(url);
        }, 'image/png');
    } else {
        const dataUrl = canvas.toDataURL('image/png');
        const svgWrapped = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
            <image href="${dataUrl}" width="${width}" height="${height}" />
        </svg>`;
        const blob = new Blob([svgWrapped], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileName}.svg`;
        link.click();
        URL.revokeObjectURL(url);
    }
}

// ✅ Generate text as SVG
function generateTextSVG(item: { text: string; fontSize?: number; fontFamily?: string; color?: string; bold?: boolean; underline?: boolean }) {
    return `<svg xmlns="http://www.w3.org/2000/svg">
        <text x="0" y="${item.fontSize || 16}" fill="${item.color || '#000'}"
        font-size="${item.fontSize || 16}" font-family="${item.fontFamily || 'Arial'}"
        font-weight="${item.bold ? 'bold' : 'normal'}"
        text-decoration="${item.underline ? 'underline' : 'none'}">${item.text}</text>
    </svg>`;
}
