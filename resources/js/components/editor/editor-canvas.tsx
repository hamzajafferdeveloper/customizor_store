import RotateAngleModal from '@/components/editor/rotate-angle-modal';
import SvgColorChangeModal from '@/components/editor/svg-color-change-modal';
import { downloadClippedCanvas } from '@/lib/downloadEditorCanvas';
import { handleDeleteItem, handleMouseDown } from '@/lib/editor';
import { onEvent } from '@/lib/event-bus';
import { CanvasItem } from '@/types/editor';
import { Maximize2, Pen, RotateCw, Trash2 } from 'lucide-react';
import { RefObject, useEffect, useRef, useState } from 'react';
import ZoomUndoRedo from './zoom-undo-redo';

type Props = {
    svgContainerRef: RefObject<HTMLDivElement | null>;
    fileInputRef: RefObject<HTMLInputElement | null>;
    handleSvgContainerClick: (event: React.MouseEvent<HTMLDivElement>) => void;
    handleUploadChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

    uploadedItems: CanvasItem[];

    /** History-aware setters */
    setUploadedItemsLive: React.Dispatch<React.SetStateAction<CanvasItem[]>>; // for drag/resize/rotate live
    setUploadedItemsCommit: React.Dispatch<React.SetStateAction<CanvasItem[]>>; // for discrete ops (add/delete/rotate confirm)
    finalizeGesture: () => void; // call on mouseup/touchend after a live gesture to push a snapshot

    selectedItemId: string | null;
    setSelectedItemId: React.Dispatch<React.SetStateAction<string | null>>;
    downloadRef: RefObject<HTMLDivElement | null>;

    // Undo/redo UI
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;

    svgOverlayBox: { left: number; top: number; width: number; height: number } | null;
    setSvgOverlayBox: React.Dispatch<
        React.SetStateAction<{ left: number; top: number; width: number; height: number; bottom: number; right: number; x: number; y: number } | null>
    >;
};

export default function EditorCanvas({
    downloadRef,
    svgContainerRef,
    fileInputRef,
    handleSvgContainerClick,
    handleUploadChange,
    uploadedItems,
    setUploadedItemsLive,
    setUploadedItemsCommit,
    finalizeGesture,
    selectedItemId,
    setSelectedItemId,
    onUndo,
    onRedo,
    canUndo,
    canRedo,
    svgOverlayBox,
    setSvgOverlayBox,
}: Props) {
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const offsetRef = useRef<{ offsetX: number; offsetY: number }>({ offsetX: 0, offsetY: 0 });
    const canvasContainerRef = useRef<HTMLDivElement | null>(null);
    const editorMianRef = useRef<HTMLDivElement | null>(null);
    const [openSvgDialog, setOpenSvgDialog] = useState<boolean>(false);
    const [selecetSvgId, setSelectedSvgId] = useState<string | null>(null);
    const [openRotateDialog, setOpenRotateDialog] = useState(false);

    const [containerRect, setContainerRect] = useState<DOMRect | null>(null);

    const [svgMaskUrl, setSvgMaskUrl] = useState<string | null>(null);
    const [clipPath, setClipPath] = useState<string | null>(null);

    const controllerRef = useRef<HTMLDivElement | null>(null);
    const [isResizing, setIsResizing] = useState(false);
    const resizeStart = useRef<{ x: number; y: number; width: number; height: number }>({ x: 0, y: 0, width: 0, height: 0 });

    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const panStart = useRef<{ x: number; y: number; panX: number; panY: number }>({ x: 0, y: 0, panX: 0, panY: 0 });

    const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
    const [lastPanPosition, setLastPanPosition] = useState<{ x: number; y: number } | null>(null);

    // --- PAN EVENTS (MOBILE + DESKTOP) ---
    useEffect(() => {
        if (!isPanning) return;

        const handleMouseMove = (e: MouseEvent) => {
            setPan((prev) => ({
                x: panStart.current.panX + (e.clientX - panStart.current.x),
                y: panStart.current.panY + (e.clientY - panStart.current.y),
            }));
        };
        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length !== 1) return;
            e.preventDefault();
            setPan((prev) => ({
                x: panStart.current.panX + (e.touches[0].clientX - panStart.current.x),
                y: panStart.current.panY + (e.touches[0].clientY - panStart.current.y),
            }));
        };
        const handleMouseUp = () => setIsPanning(false);
        const handleTouchEnd = () => setIsPanning(false);

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleTouchEnd);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isPanning]);

    const handlePanStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;
        if (target.closest('.uploaded-item') || target.closest('.controller-overlay')) return;

        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        e.preventDefault();
        setIsPanning(true);
        panStart.current = {
            x: clientX,
            y: clientY,
            panX: pan.x,
            panY: pan.y,
        };
    };

    const handlePanMove = (e: MouseEvent | TouchEvent) => {
        if (!isPanning || !lastPanPosition) return;
        const point = 'touches' in e ? e.touches[0] : e;
        const currentX = point.clientX;
        const currentY = point.clientY;
        const dx = currentX - lastPanPosition.x;
        const dy = currentY - lastPanPosition.y;
        setCanvasOffset((prevOffset) => ({ x: prevOffset.x + dx, y: prevOffset.y + dy }));
        setLastPanPosition({ x: currentX, y: currentY });
    };

    const handlePanEnd = () => {
        setIsPanning(false);
        setLastPanPosition(null);
    };

    // --- DRAGGING uploaded items (LIVE updates, commit on mouseup/touchend) ---
    useEffect(() => {
        const handleMove = (e: MouseEvent | TouchEvent) => {
            let clientX: number, clientY: number;
            if ('touches' in e) {
                if (e.touches.length !== 1) return;
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else {
                clientX = e.clientX;
                clientY = e.clientY;
            }
            if (!draggingId || !svgContainerRef.current) return;
            const container = svgContainerRef.current.getBoundingClientRect();
            const newX = clientX - container.left - offsetRef.current.offsetX;
            const newY = clientY - container.top - offsetRef.current.offsetY;

            setUploadedItemsLive((prev) => prev.map((item) => (item.id === draggingId ? { ...item, x: newX, y: newY } : item)));
        };

        const handleUp = () => {
            if (draggingId) {
                finalizeGesture();
            }
            setDraggingId(null);
        };

        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleUp);
        window.addEventListener('touchmove', handleMove, { passive: false });
        window.addEventListener('touchend', handleUp);
        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleUp);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleUp);
        };
    }, [draggingId, setUploadedItemsLive, finalizeGesture, svgContainerRef]);

    // Deselect on click outside
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (editorMianRef.current && editorMianRef.current.contains(e.target as Node)) {
                setSelectedItemId(null);
            }
        };
        window.addEventListener('mousedown', handleClick);
        return () => window.removeEventListener('mousedown', handleClick);
    }, []);

    // --- RESIZE (LIVE), commit on end (MOBILE + DESKTOP) ---
    useEffect(() => {
        if (!isResizing || !selectedItemId) return;

        const handleMove = (e: MouseEvent | TouchEvent) => {
            let clientX: number, clientY: number;

            if ('touches' in e) {
                if (e.touches.length !== 1) return;
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
                e.preventDefault(); // Prevent page scroll
            } else {
                clientX = e.clientX;
                clientY = e.clientY;
            }

            setUploadedItemsLive((prev) =>
                prev.map((item) => {
                    if (item.id !== selectedItemId) return item;
                    const dx = clientX - resizeStart.current.x;
                    const dy = clientY - resizeStart.current.y;
                    const scaleX = (resizeStart.current.width + dx) / resizeStart.current.width;
                    const scaleY = (resizeStart.current.height + dy) / resizeStart.current.height;
                    const scale = Math.max(scaleX, scaleY);
                    return {
                        ...item,
                        width: Math.max(20, resizeStart.current.width * scale),
                        height: Math.max(20, resizeStart.current.height * scale),
                    };
                }),
            );
        };

        const handleEnd = () => {
            setIsResizing(false);
            finalizeGesture();
        };

        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleEnd);
        window.addEventListener('touchmove', handleMove, { passive: false });
        window.addEventListener('touchend', handleEnd);

        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleEnd);
        };
    }, [isResizing, selectedItemId, setUploadedItemsLive, finalizeGesture]);

    // Measure / overlay / mask logic (unchanged except dependencies)
    useEffect(() => {
        if (!svgContainerRef.current) return;
        const box = svgContainerRef.current.getBoundingClientRect();
        setContainerRect(box);
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (!svgContainerRef.current) return;
            setContainerRect(svgContainerRef.current.getBoundingClientRect());
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const updateClipPath = () => {
            const svgContainer = document.getElementById('svg-container');
            if (!svgContainer) return;
            const svgEl = svgContainer.querySelector('svg');
            if (!svgEl) return;

            const bbox = svgEl.getBBox();
            const width = (svgEl as any).width?.baseVal?.value || 1000;
            const height = (svgEl as any).height?.baseVal?.value || 1000;

            const xPct = (bbox.x / width) * 100;
            const yPct = (bbox.y / height) * 100;
            const wPct = (bbox.width / width) * 100;
            const hPct = (bbox.height / height) * 100;

            setClipPath(`inset(${yPct}% ${100 - xPct - wPct}% ${100 - yPct - hPct}% ${xPct}%)`);
        };
        setTimeout(updateClipPath, 200);
    }, [svgContainerRef.current?.innerHTML]);

    useEffect(() => {
        const updateOverlayBox = () => {
            const svgContainer = document.getElementById('svg-container');
            if (!svgContainer) return;
            const svgEl = svgContainer.querySelector('svg');
            if (!svgEl) return;

            const rect = svgEl.getBoundingClientRect();
            const parentRect = svgContainer.getBoundingClientRect();

            setSvgOverlayBox({
                left: rect.left - parentRect.left,
                top: rect.top - parentRect.top + 1,
                width: rect.width,
                height: rect.height,
                bottom: 942,
                right: 1878,
                x: 556,
                y: 90,
            });
        };
        setTimeout(updateOverlayBox, 200);
    }, [svgContainerRef.current?.innerHTML]);

    useEffect(() => {
        const svgContainer = document.getElementById('svg-container');
        if (!svgContainer) return;
        const svgEl = svgContainer.querySelector('svg');
        if (!svgEl) return;

        (svgEl as any).setAttribute('width', '100%');
        (svgEl as any).setAttribute('height', '100%');
        (svgEl as any).style.width = '100%';
        (svgEl as any).style.height = '100%';
    }, [svgContainerRef.current?.innerHTML]);

    useEffect(() => {
        const svgContainer = document.getElementById('svg-container');
        if (!svgContainer) return;
        const svgEl = svgContainer.querySelector('svg');
        if (!svgEl) return;

        const clone = svgEl.cloneNode(true) as SVGSVGElement;
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(clone);
        setSvgMaskUrl(`url('data:image/svg+xml;utf8,${encodeURIComponent(svgString)}')`);
    }, [svgContainerRef.current?.innerHTML]);

    // Download event persists current state render
    useEffect(() => {
        const unsubscribe = onEvent<{ name: string; format: 'png' | 'svg' }>('download', ({ name, format }) => {
            handleDownload({ format, fileName: name });
        });
        return unsubscribe;
    }, [uploadedItems, svgOverlayBox, zoom, pan]);

    const handleDownload = ({ format, fileName }: { format: 'svg' | 'png'; fileName: string }) => {
        if (!svgOverlayBox) return;
        downloadClippedCanvas({
            svgContainerId: 'svg-container',
            uploadedItems,
            svgOverlayBox: svgOverlayBox,
            zoom,
            pan,
            format,
            fileName,
        });
    };

    useEffect(() => {
        const preventScroll = (e: TouchEvent) => {
            if (!canvasContainerRef.current) return;
            const touch = e.touches[0];
            const bounds = canvasContainerRef.current.getBoundingClientRect();
            if (touch.clientX >= bounds.left && touch.clientX <= bounds.right && touch.clientY >= bounds.top && touch.clientY <= bounds.bottom) {
                e.preventDefault();
            }
        };
        document.body.addEventListener('touchmove', preventScroll, { passive: false });
        return () => {
            document.body.removeEventListener('touchmove', preventScroll);
        };
    }, []);

    useEffect(() => {
        const handleTouchMove = (e: TouchEvent) => {
            if (isPanning) e.preventDefault();
            handlePanMove(e);
        };
        document.addEventListener('mousemove', handlePanMove);
        document.addEventListener('mouseup', handlePanEnd);
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchend', handlePanEnd);
        return () => {
            document.removeEventListener('mousemove', handlePanMove);
            document.removeEventListener('mouseup', handlePanEnd);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handlePanEnd);
        };
    }, [isPanning, lastPanPosition]);

    return (
        <main className="relative flex h-full min-h-0 w-full min-w-0 items-center justify-center" ref={editorMianRef}>
            {/* Hidden file input for uploads */}
            {fileInputRef && (
                <input type="file" accept=".svg,.png,.jpg,.jpeg" multiple className="hidden" ref={fileInputRef} onChange={handleUploadChange} />
            )}

            <div className='background-container w-full h-full max-h-fit flex justify-center border-2 dark:bg-transparent rounded-lg'>
                <div
                    ref={canvasContainerRef}
                    className="relative flex items-center justify-center overflow-hidden bg-none p-2 lg:h-[700px] lg:w-[700px] xl:h-[900px] xl:w-[900px] "
                    onMouseDown={handlePanStart}
                    onTouchStart={handlePanStart}
                    style={{
                        cursor: isPanning ? 'grabbing' : 'default',
                        minHeight: 0,
                        minWidth: 0,
                    }}
                >
                    <div
                        style={{
                            width: '100%',
                            height: '100%',
                            aspectRatio: svgOverlayBox ? `${svgOverlayBox.width} / ${svgOverlayBox.height}` : undefined,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                            transformOrigin: '0 0',
                            transition: isPanning ? 'none' : 'transform 0.1s',
                        }}
                    >
                        {/* SVG template container */}
                        <div
                            ref={downloadRef}
                            style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <div
                                id="svg-container"
                                className="h-full w-full"
                                ref={svgContainerRef}
                                onClick={handleSvgContainerClick}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    minWidth: 0,
                                    minHeight: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            />
                        </div>

                        {/* Uploaded items (masked) */}
                        {svgOverlayBox && svgMaskUrl && (
                            <div
                                style={{
                                    position: 'absolute',
                                    left: svgOverlayBox.left ?? 0,
                                    top: svgOverlayBox.top ?? 0,
                                    width: svgOverlayBox.width ?? 0,
                                    height: svgOverlayBox.height ?? 0,
                                    pointerEvents: 'none',
                                    WebkitMaskImage: svgMaskUrl || undefined,
                                    maskImage: svgMaskUrl || undefined,
                                    WebkitMaskRepeat: 'no-repeat',
                                    maskRepeat: 'no-repeat',
                                    WebkitMaskSize: '100% 100%',
                                    maskSize: '100% 100%',
                                    zIndex: 20,
                                    minWidth: 0,
                                    minHeight: 0,
                                }}
                                className="p-2"
                            >
                                {uploadedItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="uploaded-item"
                                        style={{
                                            position: 'absolute',
                                            left: item.x,
                                            top: item.y,
                                            width: item.width,
                                            height: item.height,
                                            transform: `rotate(${item.rotation}deg)`,
                                            cursor: 'move',
                                            zIndex: 10,
                                            pointerEvents: 'auto',
                                            borderRadius: 8,
                                        }}
                                        onMouseDown={(e) => {
                                            // start drag gesture (live updates)
                                            handleMouseDown(e, item, svgContainerRef, setDraggingId, offsetRef);
                                        }}
                                        onTouchStart={(e) => {
                                            handleMouseDown(e, item, svgContainerRef, setDraggingId, offsetRef);
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedItemId(item.id);
                                        }}
                                    >
                                        {item.type === 'image' ? (
                                            item.fileType === 'svg' ? (
                                                <object
                                                    type="image/svg+xml"
                                                    data={item.src}
                                                    className="pointer-events-none h-full w-full"
                                                    style={{ objectFit: 'fill' }}
                                                />
                                            ) : (
                                                <img
                                                    src={item.src}
                                                    alt={item.originalFileName}
                                                    className="pointer-events-none h-full w-full"
                                                    style={{ objectFit: 'fill' }}
                                                />
                                            )
                                        ) : (
                                            <div
                                                style={{
                                                    position: 'relative',
                                                    display: 'flex',
                                                    justifyContent:
                                                        item.textAlignment === 'center'
                                                            ? 'center'
                                                            : item.textAlignment === 'right'
                                                              ? 'flex-end'
                                                              : 'flex-start',
                                                    width: '100%',
                                                    height: '100%',
                                                }}
                                            >
                                                {/* Stroke layer */}
                                                <span
                                                    style={{
                                                        position: 'absolute',
                                                        fontSize: item.fontSize,
                                                        fontFamily: item.fontFamily,
                                                        fontStyle: item.italic ? 'italic' : 'normal',
                                                        fontWeight: item.bold ? 'bold' : 'normal',
                                                        WebkitTextStroke: `${item.stroke}px ${item.strokeColor}`,
                                                        color: 'transparent',
                                                    }}
                                                >
                                                    {item.text}
                                                </span>

                                                {/* Fill layer */}
                                                <span
                                                    style={{
                                                        color: item.color,
                                                        fontSize: item.fontSize,
                                                        fontFamily: item.fontFamily,
                                                        fontStyle: item.italic ? 'italic' : 'normal',
                                                        fontWeight: item.bold ? 'bold' : 'normal',
                                                        zIndex: 1,
                                                    }}
                                                >
                                                    {item.text}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Controller overlay */}
                        {selectedItemId &&
                            (() => {
                                const item = uploadedItems.find((i) => i.id === selectedItemId);
                                if (!item || !svgOverlayBox) return null;
                                return (
                                    <div
                                        ref={controllerRef}
                                        className="controller-overlay border-2 border-dashed border-indigo-500"
                                        style={{
                                            position: 'absolute',
                                            left: (svgOverlayBox.left ?? 0) + item.x - 16,
                                            top: (svgOverlayBox.top ?? 0) + item.y - 16,
                                            width: item.width + 32,
                                            height: item.height + 32,
                                            pointerEvents: 'auto',
                                            zIndex: 9999,
                                            borderRadius: 10,
                                            boxSizing: 'border-box',
                                            // pointerEvents: 'none',
                                            transform: `rotate(${item.rotation}deg)`,
                                        }}
                                        onMouseDown={(e) => {
                                            const target = e.target as HTMLElement;
                                            if (target.closest('.resize-handle') || target.closest('.rotate-handle')) return;
                                            // start drag gesture (live)
                                            handleMouseDown(e, item, svgContainerRef, setDraggingId, offsetRef);
                                        }}
                                    >
                                        {/* SVG Color Change (opens modal) */}
                                        {item.type === 'image' && (
                                            <div
                                                className="resize-handle absolute top-0 left-0 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-indigo-500 bg-white shadow"
                                                onMouseDown={(e) => {
                                                    e.stopPropagation();
                                                    setIsResizing(true);
                                                    resizeStart.current = { x: e.clientX, y: e.clientY, width: item.width, height: item.height };
                                                }}
                                                onClick={() => {
                                                    setOpenSvgDialog(true);
                                                    setSelectedSvgId(selectedItemId);
                                                }}
                                            >
                                                <Pen size={16} className="text-indigo-500" />
                                            </div>
                                        )}

                                        {/* Rotate Handle - opens angle modal (commit on confirm) */}
                                        <div
                                            className="rotate-handle absolute top-0 right-0 z-50 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-indigo-500 bg-white shadow"
                                            onMouseDown={(e) => {
                                                e.stopPropagation();
                                                setIsResizing(true);
                                                resizeStart.current = { x: e.clientX, y: e.clientY, width: item.width, height: item.height };
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenRotateDialog(true);
                                            }}
                                        >
                                            <RotateCw size={16} className="text-indigo-500" />
                                        </div>

                                        {/* Resize Handle (live updates, commit on mouseup) */}
                                        <div
                                            className="resize-handle absolute right-0 bottom-0 flex h-7 w-7 cursor-nesw-resize items-center justify-center rounded-full border-2 border-indigo-500 bg-white shadow"
                                            onMouseDown={(e) => {
                                                e.stopPropagation();
                                                setIsResizing(true);
                                                resizeStart.current = { x: e.clientX, y: e.clientY, width: item.width, height: item.height };
                                            }}
                                            onTouchStart={(e) => {
                                                e.stopPropagation();
                                                setIsResizing(true);
                                                const touch = e.touches[0];
                                                resizeStart.current = { x: touch.clientX, y: touch.clientY, width: item.width, height: item.height };
                                            }}
                                        >
                                            <Maximize2 size={16} className="text-indigo-500" />
                                        </div>

                                        {/* Delete Handle (commit) */}
                                        <div
                                            className="resize-handle absolute bottom-0 left-0 z-50 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-indigo-500 bg-white shadow"
                                            onMouseDown={(e) => {
                                                e.stopPropagation();
                                                setIsResizing(true);
                                                resizeStart.current = { x: e.clientX, y: e.clientY, width: item.width, height: item.height };
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteItem(selectedItemId, (updater: React.SetStateAction<CanvasItem[]>) => {
                                                    setUploadedItemsCommit(updater);
                                                });
                                            }}
                                        >
                                            <Trash2 size={16} className="text-indigo-500" />
                                        </div>
                                    </div>
                                );
                            })()}
                    </div>
                </div>
            </div>

            {/* Zoom / Pan / Undo-Redo bar */}
            <ZoomUndoRedo onUndo={onUndo} onRedo={onRedo} canUndo={canUndo} canRedo={canRedo} setZoom={setZoom} setPan={setPan} zoom={zoom} />

            {selecetSvgId && (
                <SvgColorChangeModal
                    open={openSvgDialog}
                    onOpenChange={() => {
                        setOpenSvgDialog(false);
                        setSelectedSvgId(null);
                    }}
                    selecetSvgId={selecetSvgId}
                    setUploadedItems={(updater) => {
                        // ✅ commit discrete color change into history
                        setUploadedItemsCommit((prev) => {
                            const newItems = typeof updater === 'function' ? (updater as (items: CanvasItem[]) => CanvasItem[])(prev) : updater;

                            // if color actually changed, push history snapshot
                            if (JSON.stringify(newItems) !== JSON.stringify(prev)) {
                                return newItems;
                            }
                            return prev;
                        });
                    }}
                    uploadedItems={uploadedItems}
                />
            )}

            <RotateAngleModal
                open={openRotateDialog}
                onOpenChange={setOpenRotateDialog}
                initialAngle={selectedItemId ? uploadedItems.find((i) => i.id === selectedItemId)?.rotation || 0 : 0}
                onConfirm={(angle) => {
                    if (!selectedItemId) return;
                    setUploadedItemsCommit((prev) => prev.map((item) => (item.id === selectedItemId ? { ...item, rotation: angle } : item)));
                }}
            />
        </main>
    );
}
