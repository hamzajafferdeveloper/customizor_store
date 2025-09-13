/**
 * Export the current canvas (SVG template + uploaded items) as SVG or PNG.
 */

import { PartLayer } from '@/types/createProduct';
import { CanvasItem, TextLayer } from '@/types/editor';

// ✅ Updated to support text items
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
    svgOverlayBox: { left: number; top: number; width: number; height: number; };
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

    // ✅ Draw all uploaded items (images + text)
    for (const item of uploadedItems) {
        if (item.type === 'image') {
            await new Promise<void>((resolve) => {
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

                if (item.fileType === 'svg') {
                    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(item.src || '');
                } else if (item.fileType === 'logo') {
                    if (item.src?.trim().startsWith('<svg')) {
                        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(item.src);
                    } else if (item.src?.endsWith('.svg')) {
                        img.src = item.src;
                    } else {
                        img.src = item.src || '';
                    }
                } else {
                    img.src = item.src || '';
                }
            });
        } else if (item.type === 'text' && item.text) {
            // ✅ Draw text with styles, rotation, and alignment
            formatTextForDownload(item, ctx, svgOverlayBox);
        }
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

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

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

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    }
}

/**
 * Export the current canvas (SVG template + uploaded items + uploaded parts) as SVG or PNG.
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
    svgOverlayBox: { left: number; top: number; width: number; height: number; };
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

    // --- Ensure part color changes are reflected in SVG before serialization ---
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

    // --- Create canvas ---
    const canvas = document.createElement('canvas');
    canvas.width = width * zoom;
    canvas.height = height * zoom;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.translate(pan.x, pan.y);

    // --- Draw SVG template ---
    await new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 0, 0, width, height);
            resolve();
        };
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
    });

    // --- Draw uploaded parts as images (with color if needed) ---
    for (const part of uploadedPart) {
        if (part.path) {
            await new Promise<void>((resolve) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => {
                    ctx.save();
                    ctx.globalAlpha = 1;
                    ctx.drawImage(img, 0, 0, width, height);
                    ctx.restore();
                    resolve();
                };
                img.src = part.path;
            });
        }
    }

    // --- Draw uploaded items (images + text as SVG) ---
    for (const item of uploadedItems) {
        await new Promise<void>((resolve) => {
            if (item.type === 'image') {
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
                if (item.fileType === 'svg' || item.src?.trim().startsWith('<svg')) {
                    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(item.src || '');
                } else {
                    img.src = item.src || '';
                }
            } else if (item.type === 'text' && item.text) {
                // ✅ Draw text with styles, rotation, and alignment
                formatTextForDownload(item, ctx, svgOverlayBox);
            } else {
                resolve();
            }
        });
    }

    // --- Apply mask (so output matches visible template) ---
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

    // --- Export ---
    if (format === 'png') {
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
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

const formatTextForDownload = (
  item: TextLayer,
  ctx: CanvasRenderingContext2D,
  svgOverlayBox: { left: number; top: number }
) => {
  ctx.save();

  const fontWeight = item.bold ? "bold" : "normal";
  const fontStyle = item.italic ? "italic" : "normal";
  const fontSize = item.fontSize || 20;
  const fontFamily = item.fontFamily || "Arial";

  ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.fillStyle = item.color || "#000000";

  // --- text alignment ---
  if (item.textAlignment === "left") ctx.textAlign = "left";
  else if (item.textAlignment === "right") ctx.textAlign = "right";
  else ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const maxTextWidth = item.width || 200;

  // --- word wrap ---
  const wrapText = (text: string, maxWidth: number): string[] => {
    const words = text.split(" ");
    const lines: string[] = [];
    let current = "";
    words.forEach((word) => {
      const testLine = current ? current + " " + word : word;
      if (ctx.measureText(testLine).width > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = testLine;
      }
    });
    if (current) lines.push(current);
    return lines;
  };

  const lines = wrapText(item.text, maxTextWidth);
  const lineHeight = fontSize * 1.2;
  const totalHeight = lines.length * lineHeight;

  // 🔥 FIX: normalize coords relative to overlayBox, and center box
  const baseX = item.x;
  const baseY = item.y;

  ctx.translate(baseX, baseY);

  if (item.rotation && item.rotation !== 0) {
    ctx.rotate((item.rotation * Math.PI) / 180);
  }

  // --- draw relative to box ---
  const startY = -(totalHeight / 2) + lineHeight / 2;

  lines.forEach((line, i) => {
    const y = startY + i * lineHeight;

    let x: number;
    if (item.textAlignment === "left") {
      x = -item.width / 2; // left edge
    } else if (item.textAlignment === "right") {
      x = item.width / 2; // right edge
    } else {
      x = 0; // center
    }

    // stroke
    if (item.strokeColor && item.stroke) {
      ctx.lineWidth = item.stroke;
      ctx.strokeStyle = item.strokeColor;
      ctx.strokeText(line, x, y);
    }
    // fill
    ctx.fillText(line, x, y);

    // underline
    if (item.underline) {
      const textWidth = ctx.measureText(line).width;
      const underlineY = y + fontSize / 2 + 2;

      ctx.beginPath();
      if (item.textAlignment === "left") {
        ctx.moveTo(x, underlineY);
        ctx.lineTo(x + textWidth, underlineY);
      } else if (item.textAlignment === "right") {
        ctx.moveTo(x - textWidth, underlineY);
        ctx.lineTo(x, underlineY);
      } else {
        ctx.moveTo(x - textWidth / 2, underlineY);
        ctx.lineTo(x + textWidth / 2, underlineY);
      }
      ctx.lineWidth = Math.max(1, fontSize / 12);
      ctx.strokeStyle = item.color || "#000000";
      ctx.stroke();
    }
  });

  ctx.restore();
};
