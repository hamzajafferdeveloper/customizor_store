import RotateAngleModal from '@/components/editor/rotate-angle-modal';
import SvgColorChangeModal from '@/components/editor/svg-color-change-modal';
import { downloadCreateProduct } from '@/lib/downloadEditorCanvas';
import { handleDeleteItem, handleMouseDown } from '@/lib/editor';
import { onEvent } from '@/lib/event-bus';
import { PartLayer } from '@/types/createProduct';
import { CanvasItem } from '@/types/editor';
import { Maximize2, Minus, Pen, Plus, Redo2, RefreshCw, RotateCw, Trash2, Undo2 } from 'lucide-react';
import React, { RefObject, useEffect, useRef, useState } from 'react';

type Props = {
    svgContainerRef: RefObject<HTMLDivElement | null>;
    fileInputRef: RefObject<HTMLInputElement | null>;
    // handleSvgContainerClick: (event: React.MouseEvent<HTMLDivElement>) => void;
    handleUploadChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    uploadedItems: CanvasItem[];
    setUploadedItems: React.Dispatch<React.SetStateAction<CanvasItem[]>>;
    selectedItemId: string | null;
    setSelectedItemId: React.Dispatch<React.SetStateAction<string | null>>;
    downloadRef: RefObject<HTMLDivElement | null>;
    uploadedPart: PartLayer[];
    setUploadedPart: React.Dispatch<React.SetStateAction<PartLayer[]>>;

    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
};

export default function CreateProductCanvas({
    downloadRef,
    svgContainerRef,
    fileInputRef,
    handleUploadChange,
    uploadedItems,
    setUploadedItems,
    selectedItemId,
    setSelectedItemId,
    uploadedPart,
    setUploadedPart,
    undo,
    redo,
    canUndo,
    canRedo,
}: Props & { setUploadedPart: React.Dispatch<React.SetStateAction<PartLayer[]>> }) {
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const offsetRef = useRef<{ offsetX: number; offsetY: number }>({ offsetX: 0, offsetY: 0 });
    const editorMianRef = useRef<HTMLDivElement | null>(null);
    const [openSvgDialog, setOpenSvgDialog] = useState<boolean>(false);
    const [selecetSvgId, setSelectedSvgId] = useState<string | null>(null);
    const [openRotateDialog, setOpenRotateDialog] = useState(false);

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
    const handlePanStart = (e: React.MouseEvent<HTMLDivElement>) => {
        // Only pan if not clicking on an item or controller
        if ((e.target as HTMLElement).closest('.uploaded-item') || (e.target as HTMLElement).closest('.controller-overlay')) {
            return;
        }
        e.preventDefault();
        setIsPanning(true);
        panStart.current = {
            x: e.clientX,
            y: e.clientY,
            panX: pan.x,
            panY: pan.y,
        };
    };

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
        const handleMouseMove = (e: MouseEvent) => {
            if (!selectedItemId) return;
            setUploadedItems((prev) =>
                prev.map((item) => {
                    if (item.id !== selectedItemId) return item;
                    const dx = e.clientX - resizeStart.current.x;
                    const dy = e.clientY - resizeStart.current.y;
                    return {
                        ...item,
                        width: Math.max(20, resizeStart.current.width + dx),
                        height: Math.max(20, resizeStart.current.height + dy),
                    };
                }),
            );
        };
        const handleMouseUp = () => setIsResizing(false);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing, selectedItemId, setUploadedItems]);

    // Rotate logic
    useEffect(() => {
        if (!isRotating) return;
        const handleMouseMove = (e: MouseEvent) => {
            if (!selectedItemId) return;
            setUploadedItems((prev) =>
                prev.map((item) => {
                    if (item.id !== selectedItemId) return item;
                    const centerX = item.x + item.width / 2;
                    const centerY = item.y + item.height / 2;
                    // Calculate current angle from center to mouse
                    const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
                    // Calculate new rotation
                    return {
                        ...item,
                        rotation: rotateStart.current.originalRotation + (currentAngle - rotateStart.current.initialAngle),
                    };
                }),
            );
        };
        const handleMouseUp = () => setIsRotating(false);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
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
            handleDownload({ format, fileName: name });
        });

        return unsubscribe; // ✅ Cleanup listener
    }, [uploadedItems, uploadedPart, svgOverlayBox, zoom, pan]);

    const handleDownload = ({ format, fileName }: { format: 'svg' | 'png'; fileName: string }) => {
        if (svgOverlayBox) {
            downloadCreateProduct({
                svgContainerId: 'svg-container',
                uploadedItems,
                uploadedPart,
                svgOverlayBox: { width: svgOverlayBox.width, height: svgOverlayBox.height },
                zoom,
                pan,
                format: format, // or "svg"
                fileName: fileName,
            });
        }
    };

    // Combine and sort layers by zIndex
    const combinedLayers = [
        ...uploadedItems.map((i) => ({ ...i, layerType: 'item' as const })),
        ...uploadedPart.map((p) => ({ ...p, layerType: 'part' as const })),
    ].sort((a, b) => {
        const aIndex = a.zIndex ?? 0;
        const bIndex = b.zIndex ?? 0;
        return bIndex - aIndex;
    });

    return (
        <main className="relative flex h-full w-full items-center justify-center" ref={editorMianRef}>
            {/* --- ZOOM & PAN CONTROLS --- */}

            {/* Hidden file input for uploads */}
            {fileInputRef && (
                <input type="file" accept=".svg,.png,.jpg,.jpeg" multiple className="hidden" ref={fileInputRef} onChange={handleUploadChange} />
            )}

            <div
                className="background-container relative w-full overflow-hidden rounded-lg border-2 bg-white p-6 lg:max-w-[700px] xl:max-w-[900px]"
                onMouseDown={handlePanStart}
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
                    <div>
                        <div id="svg-container" className="h-full w-full" ref={svgContainerRef} />
                        {uploadedPart.map((part) => (
                            <img
                                key={part.id}
                                src={part.path}
                                alt={part.name}
                                // className="border border-red-700"
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                    pointerEvents: 'none',
                                }}
                            />
                        ))}
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
                            {/* Combine and sort layers by zIndex */}
                            {combinedLayers.map((layer) => {
                                if (layer.layerType === 'part') {
                                    // Render part layer as image
                                    return (
                                        <img
                                            key={layer.id}
                                            src={layer.path}
                                            alt={layer.name}
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'contain',
                                                pointerEvents: 'none',
                                                zIndex: layer.zIndex,
                                            }}
                                        />
                                    );
                                } else {
                                    // Render uploaded item (logo, text, etc.)
                                    return (
                                        <div
                                            key={layer.id}
                                            className="uploaded-item"
                                            style={{
                                                position: 'absolute',
                                                left: layer.x,
                                                top: layer.y,
                                                width: layer.width,
                                                height: layer.height,
                                                transform: `rotate(${layer.rotation}deg)`,
                                                cursor: 'move',
                                                zIndex: layer.zIndex,
                                                pointerEvents: 'auto',
                                                borderRadius: 8,
                                            }}
                                            onMouseDown={(e) => handleMouseDown(e, layer, svgContainerRef, setDraggingId, offsetRef)}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedItemId(layer.id);
                                            }}
                                        >
                                            {layer.type === 'image' ? (
                                                layer.fileType === 'svg' ? (
                                                    <object
                                                        type="image/svg+xml"
                                                        data={layer.src}
                                                        className="pointer-events-none h-full w-full"
                                                        style={{ objectFit: 'fill' }}
                                                    />
                                                ) : layer.fileType === 'image' ? (
                                                    <img
                                                        src={layer.src}
                                                        alt={layer.originalFileName}
                                                        className="pointer-events-none h-full w-full"
                                                        style={{ objectFit: 'fill' }}
                                                    />
                                                ) : (
                                                    <img
                                                        src={layer.src}
                                                        alt={layer.originalFileName}
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
                                                            layer.textAlignment === 'center'
                                                                ? 'center'
                                                                : layer.textAlignment === 'right'
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
                                                            top: 0,
                                                            left: 0,
                                                            fontSize: layer.fontSize,
                                                            fontFamily: layer.fontFamily,
                                                            fontStyle: layer.italic ? 'italic' : 'normal',
                                                            fontWeight: layer.bold ? 'bold' : 'normal',
                                                            WebkitTextStroke: `${layer.stroke}px ${layer.strokeColor}`,
                                                            color: 'transparent',
                                                            zIndex: 0,
                                                        }}
                                                    >
                                                        {layer.text}
                                                    </span>

                                                    {/* Fill layer */}
                                                    <span
                                                        style={{
                                                            position: 'relative',
                                                            color: layer.color,
                                                            fontSize: layer.fontSize,
                                                            fontFamily: layer.fontFamily,
                                                            fontStyle: layer.italic ? 'italic' : 'normal',
                                                            fontWeight: layer.bold ? 'bold' : 'normal',
                                                            zIndex: 1,
                                                        }}
                                                    >
                                                        {layer.text}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                }
                            })}
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
                                                className="resize-handle absolute top-0 left-0 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-indigo-500 bg-white shadow"
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
                                        onClick={(e) => {
                                            // setOpenSvgDialog(true);
                                            e.stopPropagation();
                                            handleDeleteItem(selectedItemId, setUploadedItems);
                                        }}
                                    >
                                        <Trash2 size={16} className="text-indigo-500" />
                                    </div>
                                </div>
                            );
                        })()}
                </div>
            </div>

            {/* Move the zoom control bar OUTSIDE the canvas area, at the bottom-right of the main editor area */}
            <div className="fixed top-2 right-2 z-2 flex gap-2 rounded bg-white/80 p-2 shadow lg:top-auto lg:right-8 lg:bottom-8 lg:left-auto dark:bg-gray-800/50">
                <button
                    onClick={undo}
                    disabled={!canUndo}
                    className="cursor-pointer rounded p-1 transition-all duration-75 hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-700"
                    title="Undo (Ctrl/Cmd+Z)"
                >
                    <Undo2 size={18} />
                </button>
                <button
                    onClick={redo}
                    disabled={!canRedo}
                    className="cursor-pointer rounded p-1 transition-all duration-75 hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-700"
                    title="Redo (Ctrl+Shift+Z or Ctrl+Y)"
                >
                    <Redo2 size={18} />
                </button>
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
            <RotateAngleModal
                open={openRotateDialog}
                onOpenChange={setOpenRotateDialog}
                initialAngle={selectedItemId ? uploadedItems.find((i) => i.id === selectedItemId)?.rotation || 0 : 0}
                onConfirm={(angle) => {
                    if (!selectedItemId) return;
                    setUploadedItems((prev) => prev.map((item) => (item.id === selectedItemId ? { ...item, rotation: angle } : item)));
                }}
            />
        </main>
    );
}
