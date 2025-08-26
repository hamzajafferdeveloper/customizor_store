import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { downloadClippedCanvas } from '@/lib/downloadEditorCanvas';
import { handleDeleteItem, handleMouseDown } from '@/lib/editor';
import { onEvent } from '@/lib/event-bus';
import { CanvasItem } from '@/types/editor';
import { Maximize2, Minus, Pen, Plus, RefreshCw, RotateCw, Trash2 } from 'lucide-react';
import { RefObject, useEffect, useRef, useState } from 'react';
import SvgColorChangeModal from './svg-color-change-modal';

type Props = {
    svgContainerRef: RefObject<HTMLDivElement | null>;
    fileInputRef: RefObject<HTMLInputElement | null>;
    handleSvgContainerClick: (event: React.MouseEvent<HTMLDivElement>) => void;
    handleUploadChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    uploadedItems: CanvasItem[];
    setUploadedItems: React.Dispatch<React.SetStateAction<CanvasItem[]>>;
    selectedItemId: string | null;
    setSelectedItemId: React.Dispatch<React.SetStateAction<string | null>>;
    downloadRef: RefObject<HTMLDivElement | null>;
};

export default function EditorCanvas({
    downloadRef,
    svgContainerRef,
    fileInputRef,
    handleSvgContainerClick,
    handleUploadChange,
    uploadedItems,
    setUploadedItems,
    selectedItemId,
    setSelectedItemId,
}: Props) {
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const offsetRef = useRef<{ offsetX: number; offsetY: number }>({ offsetX: 0, offsetY: 0 });
    const canvasContainerRef = useRef<HTMLDivElement | null>(null);
    const editorMianRef = useRef<HTMLDivElement | null>(null);
    const [openSvgDialog, setOpenSvgDialog] = useState<boolean>(false);
    const [selecetSvgId, setSelectedSvgId] = useState<string | null>(null);

    // Stores container position for calculations
    const [containerRect, setContainerRect] = useState<DOMRect | null>(null);

    // Stores SVG mask as data URL for clipping uploaded items
    const [svgMaskUrl, setSvgMaskUrl] = useState<string | null>(null);

    // Stores CSS clip-path based on SVG bounding box
    const [clipPath, setClipPath] = useState<string | null>(null);

    // Stores overlay box position and size for uploaded items container
    const [svgOverlayBox, setSvgOverlayBox] = useState<{
        left: number;
        top: number;
        width: number;
        height: number;
    } | null>(null);

    // --- MOVE NEW HOOKS HERE ---
    const controllerRef = useRef<HTMLDivElement | null>(null);
    const [isResizing, setIsResizing] = useState(false);
    const [isRotating, setIsRotating] = useState(false);
    const resizeStart = useRef<{ x: number; y: number; width: number; height: number }>({ x: 0, y: 0, width: 0, height: 0 });
    // Store initial mouse angle and original rotation
    const rotateStart = useRef<{ initialAngle: number; originalRotation: number }>({ initialAngle: 0, originalRotation: 0 });

    // --- ZOOM & PAN STATE ---
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const panStart = useRef<{ x: number; y: number; panX: number; panY: number }>({ x: 0, y: 0, panX: 0, panY: 0 });

    const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
    const [lastPanPosition, setLastPanPosition] = useState<{ x: number; y: number } | null>(null);

    // --- PAN EVENTS ---
    useEffect(() => {
        if (!isPanning) return;
        const handleMouseMove = (e: MouseEvent) => {
            setPan((prev) => ({
                x: panStart.current.panX + (e.clientX - panStart.current.x),
                y: panStart.current.panY + (e.clientY - panStart.current.y),
            }));
        };
        const handleMouseUp = () => setIsPanning(false);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isPanning]);

    // --- ZOOM LIMITS ---
    const MIN_ZOOM = 0.2;
    const MAX_ZOOM = 3;
    const ZOOM_STEP = 0.1;

    // --- RESET FUNCTION ---
    const handleResetView = () => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    };

    // --- ZOOM HANDLERS ---
    const handleZoomIn = () => setZoom((z) => Math.min(z + ZOOM_STEP, MAX_ZOOM));
    const handleZoomOut = () => setZoom((z) => Math.max(z - ZOOM_STEP, MIN_ZOOM));

    // --- PAN START HANDLER ---
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

    // --- PAN MOVE HANDLER ---
    const handlePanMove = (e: MouseEvent | TouchEvent) => {
        if (!isPanning || !lastPanPosition) return;

        const point = 'touches' in e ? e.touches[0] : e;
        const currentX = point.clientX;
        const currentY = point.clientY;

        const dx = currentX - lastPanPosition.x;
        const dy = currentY - lastPanPosition.y;

        setCanvasOffset((prevOffset) => ({
            x: prevOffset.x + dx,
            y: prevOffset.y + dy,
        }));

        setLastPanPosition({ x: currentX, y: currentY });
    };

    // --- PAN END HANDLER ---
    const handlePanEnd = () => {
        setIsPanning(false);
        setLastPanPosition(null);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent | TouchEvent) => {
            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

            if (!draggingId || !svgContainerRef.current) return;
            const container = svgContainerRef.current.getBoundingClientRect();

            const newX = clientX - container.left - offsetRef.current.offsetX;
            const newY = clientY - container.top - offsetRef.current.offsetY;

            setUploadedItems((prev) => prev.map((item) => (item.id === draggingId ? { ...item, x: newX, y: newY } : item)));
        };

        const handleUp = () => setDraggingId(null);

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleUp);
        window.addEventListener('touchmove', handleMouseMove);
        window.addEventListener('touchend', handleUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleUp);
            window.removeEventListener('touchmove', handleMouseMove);
            window.removeEventListener('touchend', handleUp);
        };
    }, [draggingId, setUploadedItems]);

    // Deselect on click outside
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            // Only deselect if click is inside editorMianRef
            if (editorMianRef.current && editorMianRef.current.contains(e.target as Node)) {
                setSelectedItemId(null);
            }
        };
        window.addEventListener('mousedown', handleClick);
        return () => window.removeEventListener('mousedown', handleClick);
    }, []);

    // Resize logic
    useEffect(() => {
        if (!isResizing) return;

        const handleMove = (e: MouseEvent | TouchEvent) => {
            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

            if (!selectedItemId) return;
            setUploadedItems((prev) =>
                prev.map((item) => {
                    if (item.id !== selectedItemId) return item;
                    const dx = clientX - resizeStart.current.x;
                    const dy = clientY - resizeStart.current.y;
                    return {
                        ...item,
                        width: Math.max(20, resizeStart.current.width + dx),
                        height: Math.max(20, resizeStart.current.height + dy),
                    };
                }),
            );
        };

        const handleUp = () => setIsResizing(false);

        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleUp);
        window.addEventListener('touchmove', handleMove);
        window.addEventListener('touchend', handleUp);

        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleUp);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleUp);
        };
    }, [isResizing, selectedItemId, setUploadedItems]);

    // Rotate logic
    useEffect(() => {
        if (!isRotating) return;

        const handleMove = (e: MouseEvent | TouchEvent) => {
            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

            if (!selectedItemId) return;
            setUploadedItems((prev) =>
                prev.map((item) => {
                    if (item.id !== selectedItemId) return item;

                    const centerX = item.x + item.width / 2;
                    const centerY = item.y + item.height / 2;
                    const currentAngle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);

                    return {
                        ...item,
                        rotation: rotateStart.current.originalRotation + (currentAngle - rotateStart.current.initialAngle),
                    };
                }),
            );
        };

        const handleUp = () => setIsRotating(false);

        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleUp);
        window.addEventListener('touchmove', handleMove);
        window.addEventListener('touchend', handleUp);

        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleUp);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleUp);
        };
    }, [isRotating, selectedItemId, setUploadedItems]);

    /**
     * ✅ Measure the bounding box of the container when mounted
     */
    useEffect(() => {
        if (!svgContainerRef.current) return;
        const box = svgContainerRef.current.getBoundingClientRect();
        setContainerRect(box);
    }, []);

    /**
     * ✅ Update container bounding box on window resize
     */
    useEffect(() => {
        const handleResize = () => {
            if (!svgContainerRef.current) return;
            setContainerRect(svgContainerRef.current.getBoundingClientRect());
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    /**
     * ✅ Handles global drag logic for uploaded items
     */
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!draggingId || !svgContainerRef.current) return;
            const container = svgContainerRef.current.getBoundingClientRect();

            const newX = e.clientX - container.left - offsetRef.current.offsetX;
            const newY = e.clientY - container.top - offsetRef.current.offsetY;

            setUploadedItems((prev) => prev.map((item) => (item.id === draggingId ? { ...item, x: newX, y: newY } : item)));
        };

        const handleMouseUp = () => setDraggingId(null);

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [draggingId, setUploadedItems]);

    /**
     * ✅ Calculate clip-path for bounding box of SVG template
     */
    useEffect(() => {
        const updateClipPath = () => {
            const svgContainer = document.getElementById('svg-container');
            if (!svgContainer) return;
            const svgEl = svgContainer.querySelector('svg');
            if (!svgEl) return;

            const bbox = svgEl.getBBox();
            const width = svgEl.width.baseVal.value || 1000;
            const height = svgEl.height.baseVal.value || 1000;

            // Convert bounding box to percentage-based inset
            const xPct = (bbox.x / width) * 100;
            const yPct = (bbox.y / height) * 100;
            const wPct = (bbox.width / width) * 100;
            const hPct = (bbox.height / height) * 100;

            setClipPath(`inset(${yPct}% ${100 - xPct - wPct}% ${100 - yPct - hPct}% ${xPct}%)`);
        };

        setTimeout(updateClipPath, 200); // Wait for SVG render
    }, [svgContainerRef.current?.innerHTML]);

    /**
     * ✅ Calculate overlay box dimensions for positioning uploaded items
     */
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
            });
        };

        setTimeout(updateOverlayBox, 200);
    }, [svgContainerRef.current?.innerHTML]);

    /**
     * ✅ Force SVG to scale to container size
     */
    useEffect(() => {
        const svgContainer = document.getElementById('svg-container');
        if (!svgContainer) return;
        const svgEl = svgContainer.querySelector('svg');
        if (!svgEl) return;

        svgEl.setAttribute('width', '100%');
        svgEl.setAttribute('height', '100%');
        svgEl.style.width = '100%';
        svgEl.style.height = '100%';
    }, [svgContainerRef.current?.innerHTML]);

    /**
     * ✅ Generate a mask image from SVG template for clipping uploaded items
     */
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

    /**
     * ✅ Store initial click offset for dragging
     */

    useEffect(() => {
        const unsubscribe = onEvent<{ name: string; format: 'png' | 'svg' }>('download', ({ name, format }) => {
            console.log('Download triggered:', name, format);
            handleDownload({ format, fileName: name });
        });

        return unsubscribe; // ✅ Cleanup listener
    }, [uploadedItems, svgOverlayBox, zoom, pan]);

    const handleDownload = ({ format, fileName }: { format: 'svg' | 'png'; fileName: string }) => {
        if (svgOverlayBox) {
            downloadClippedCanvas({
                svgContainerId: 'svg-container',
                uploadedItems,
                svgOverlayBox: { width: svgOverlayBox.width, height: svgOverlayBox.height },
                zoom,
                pan,
                format: format, // or "svg"
                fileName: fileName,
            });
        }
    };

    /**
     * ✅ Stop Scroll when use touch inside container
     */
    useEffect(() => {
        const preventScroll = (e: TouchEvent) => {
            // Only prevent if the touch is inside the canvas container
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
            if (isPanning) e.preventDefault(); // prevent scroll on touch drag
            handlePanMove(e); // call your pan move logic
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
        <main className="relative flex h-full w-full items-center justify-center" ref={editorMianRef}>
            {/* --- ZOOM & PAN CONTROLS --- */}

            {/* Hidden file input for uploads */}
            {fileInputRef && (
                <input type="file" accept=".svg,.png,.jpg,.jpeg" multiple className="hidden" ref={fileInputRef} onChange={handleUploadChange} />
            )}

            {/* <button className="cursor-pointer rounded-md bg-gray-300 px-4 py-2" onClick={() => handleDownload()}>
                Save
            </button> */}
            {/* Main editor container */}
            <div
                ref={canvasContainerRef}
                className="background-container relative w-full overflow-hidden rounded-lg border-2 bg-white p-6 lg:max-w-[55vw] dark:bg-transparent"
                onMouseDown={handlePanStart}
                onTouchStart={handlePanStart}
                style={{ cursor: isPanning ? 'grabbing' : 'default' }}
            >
                {/* --- ZOOM & PAN WRAPPER --- */}
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                        transformOrigin: '0 0',
                        transition: isPanning ? 'none' : 'transform 0.1s',
                        position: 'relative',
                    }}
                >
                    {/* SVG template container */}
                    <div className="" ref={downloadRef}>
                        <div id="svg-container" className="h-full w-full" ref={svgContainerRef} onClick={handleSvgContainerClick} />
                    </div>

                    {/* Uploaded items container (masked to SVG shape) */}
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
                                    onMouseDown={(e) => handleMouseDown(e, item, svgContainerRef, setDraggingId, offsetRef)}
                                    onTouchStart={(e) => handleMouseDown(e, item, svgContainerRef, setDraggingId, offsetRef)}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedItemId(item.id);
                                    }}
                                >
                                    <ContextMenu>
                                        <ContextMenuTrigger>
                                            {item.type === 'image' ? (
                                                item.fileType === 'svg' ? (
                                                    <object
                                                        type="image/svg+xml"
                                                        data={item.src}
                                                        className="pointer-events-none h-full w-full"
                                                        style={{ objectFit: 'fill' }}
                                                    />
                                                ) : item.fileType === 'image' ? (
                                                    <img
                                                        src={item.src}
                                                        alt={item.originalFileName}
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
                                                <div style={{ position: 'relative', display: 'inline-block' }}>
                                                    {/* Stroke layer */}
                                                    <span
                                                        style={{
                                                            position: 'absolute',
                                                            top: 0,
                                                            left: 0,
                                                            fontSize: item.fontSize,
                                                            fontFamily: item.fontFamily,
                                                            fontStyle: item.italic ? 'italic' : 'normal',
                                                            fontWeight: item.bold ? 'bold' : 'normal',
                                                            WebkitTextStroke: `${item.stroke}px ${item.strokeColor}`,
                                                            color: 'transparent',
                                                            zIndex: 0,
                                                        }}
                                                    >
                                                        {item.text}
                                                    </span>

                                                    {/* Fill layer */}
                                                    <span
                                                        style={{
                                                            position: 'relative',
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
                                        </ContextMenuTrigger>
                                        <ContextMenuContent>
                                            <ContextMenuItem onClick={() => handleDeleteItem(item.id, setUploadedItems)}>
                                                <Trash2 className="text-red-500" /> Delete
                                            </ContextMenuItem>
                                        </ContextMenuContent>
                                    </ContextMenu>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ✅ Controller OUTSIDE mask, always visible */}
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
                                        // Add rotation to controller overlay
                                        transform: `rotate(${item.rotation}deg)`,
                                    }}
                                    // Add onMouseDown to allow dragging from the controller overlay (except handles)
                                    onMouseDown={(e) => {
                                        // Prevent drag if clicking on resize or rotate handles
                                        const target = e.target as HTMLElement;
                                        if (target.closest('.resize-handle') || target.closest('.rotate-handle')) {
                                            return;
                                        }
                                        handleMouseDown(e, item, svgContainerRef, setDraggingId, offsetRef);
                                    }}
                                >
                                    {/* Handle Svg Color Change */}
                                    {item.type === 'image' && (
                                        <>
                                            <div
                                                className="resize-handle absolute bottom-0 left-0 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-indigo-500 bg-white shadow"
                                                onMouseDown={(e) => {
                                                    e.stopPropagation();
                                                    setIsResizing(true);
                                                    resizeStart.current = {
                                                        x: e.clientX,
                                                        y: e.clientY,
                                                        width: item.width,
                                                        height: item.height,
                                                    };
                                                }}
                                                onClick={() => {
                                                    setOpenSvgDialog(true);
                                                    setSelectedSvgId(selectedItemId);
                                                }}
                                            >
                                                <Pen size={16} className="text-indigo-500" />
                                            </div>
                                        </>
                                    )}
                                    {/* Resize Handle */}
                                    <div
                                        className="resize-handle absolute right-0 bottom-0 flex h-7 w-7 cursor-nesw-resize items-center justify-center rounded-full border-2 border-indigo-500 bg-white shadow"
                                        onMouseDown={(e) => {
                                            e.stopPropagation();
                                            setIsResizing(true);
                                            resizeStart.current = {
                                                x: e.clientX,
                                                y: e.clientY,
                                                width: item.width,
                                                height: item.height,
                                            };
                                        }}
                                    >
                                        <Maximize2 size={16} className="text-indigo-500" />
                                    </div>
                                    {/* Rotate Handle */}
                                    <div
                                        className="rotate-handle resize-handle absolute flex h-7 w-7 cursor-grab items-center justify-center rounded-full border-2 border-indigo-500 bg-white shadow"
                                        style={{
                                            left: '50%',
                                            top: -32,
                                            transform: 'translateX(-50%)',
                                        }}
                                        onMouseDown={(e) => {
                                            e.stopPropagation();
                                            setIsRotating(true);
                                            // Calculate initial angle from center to mouse
                                            const centerX = item.x + item.width / 2;
                                            const centerY = item.y + item.height / 2;
                                            const initialAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
                                            rotateStart.current = {
                                                initialAngle,
                                                originalRotation: item.rotation,
                                            };
                                        }}
                                    >
                                        <RotateCw size={16} className="text-indigo-500" />
                                    </div>
                                </div>
                            );
                        })()}
                </div>
            </div>
            {/* Move the zoom control bar OUTSIDE the canvas area, at the bottom-right of the main editor area */}
            <div className="fixed top-2 right-2 z-2 flex gap-2 rounded bg-white/80 p-2 shadow lg:top-auto lg:right-8 lg:bottom-8 lg:left-auto dark:bg-gray-800/50">
                <button
                    onClick={handleZoomOut}
                    disabled={zoom <= MIN_ZOOM}
                    className="rounded p-1 transition-all duration-75 hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-700"
                >
                    <Minus size={18} />
                </button>
                <span className="px-2 font-mono">{(zoom * 100).toFixed(0)}%</span>
                <button
                    onClick={handleZoomIn}
                    disabled={zoom >= MAX_ZOOM}
                    className="rounded p-1 transition-all duration-75 hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-700"
                >
                    <Plus size={18} />
                </button>
                <button onClick={handleResetView} className="rounded p-1 transition-all duration-75 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <RefreshCw size={18} />
                </button>
            </div>
            {selecetSvgId && (
                <SvgColorChangeModal
                    open={openSvgDialog}
                    onOpenChange={() => {
                        setOpenSvgDialog(false), setSelectedSvgId(null);
                    }}
                    selecetSvgId={selecetSvgId}
                    setUploadedItems={setUploadedItems}
                    uploadedItems={uploadedItems}
                />
            )}
        </main>
    );
}
