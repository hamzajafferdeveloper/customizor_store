import { downloadClippedCanvas } from '@/lib/downloadEditorCanvas';
import { handleDeleteItem, handleMouseDown } from '@/lib/editor';
import { onEvent } from '@/lib/event-bus';
import { CanvasItem } from '@/types/editor';
import { Maximize2, Minus, Pen, Plus, RefreshCw, RotateCw, Trash2, Undo2, Redo2 } from 'lucide-react';
import { RefObject, useEffect, useRef, useState } from 'react';
import RotateAngleModal from './rotate-angle-modal';
import SvgColorChangeModal from './svg-color-change-modal';

type Props = {
  svgContainerRef: RefObject<HTMLDivElement | null>;
  fileInputRef: RefObject<HTMLInputElement | null>;
  handleSvgContainerClick: (event: React.MouseEvent<HTMLDivElement>) => void;
  handleUploadChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  uploadedItems: CanvasItem[];

  /** History-aware setters */
  setUploadedItemsLive: React.Dispatch<React.SetStateAction<CanvasItem[]>>;   // for drag/resize/rotate live
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
  const [svgOverlayBox, setSvgOverlayBox] = useState<{ left: number; top: number; width: number; height: number } | null>(null);

  const controllerRef = useRef<HTMLDivElement | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const resizeStart = useRef<{ x: number; y: number; width: number; height: number }>({ x: 0, y: 0, width: 0, height: 0 });

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
      setPan(prev => ({
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

  const MIN_ZOOM = 0.2;
  const MAX_ZOOM = 3;
  const ZOOM_STEP = 0.1;

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleZoomIn = () => setZoom(z => Math.min(z + ZOOM_STEP, MAX_ZOOM));
  const handleZoomOut = () => setZoom(z => Math.max(z - ZOOM_STEP, MIN_ZOOM));

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
    setCanvasOffset(prevOffset => ({ x: prevOffset.x + dx, y: prevOffset.y + dy }));
    setLastPanPosition({ x: currentX, y: currentY });
  };

  const handlePanEnd = () => {
    setIsPanning(false);
    setLastPanPosition(null);
  };

  // --- DRAGGING uploaded items (LIVE updates, commit on mouseup) ---
  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      if (!draggingId || !svgContainerRef.current) return;
      const container = svgContainerRef.current.getBoundingClientRect();
      const newX = clientX - container.left - offsetRef.current.offsetX;
      const newY = clientY - container.top - offsetRef.current.offsetY;

      setUploadedItemsLive(prev =>
        prev.map(item => (item.id === draggingId ? { ...item, x: newX, y: newY } : item))
      );
    };

    const handleUp = () => {
      if (draggingId) {
        finalizeGesture(); // push a single history snapshot
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

  // --- RESIZE (LIVE), commit on end ---
  useEffect(() => {
    if (!isResizing) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      if (!selectedItemId) return;

      setUploadedItemsLive(prev =>
        prev.map(item => {
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
        })
      );
    };

    const handleUp = () => {
      setIsResizing(false);
      finalizeGesture();
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
      svgOverlayBox: { width: svgOverlayBox.width, height: svgOverlayBox.height },
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
    <main className="relative flex items-center justify-center w-full h-full" ref={editorMianRef}>
      {/* Hidden file input for uploads */}
      {fileInputRef && (
        <input type="file" accept=".svg,.png,.jpg,.jpeg" multiple className="hidden" ref={fileInputRef} onChange={handleUploadChange} />
      )}

      <div
        ref={canvasContainerRef}
        className="background-container relative w-full overflow-hidden rounded-lg border-2 bg-white p-6 lg:max-w-[55vw] dark:bg-transparent"
        onMouseDown={handlePanStart}
        onTouchStart={handlePanStart}
        style={{ cursor: isPanning ? 'grabbing' : 'default' }}
      >
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
          <div ref={downloadRef}>
            <div id="svg-container" className="w-full h-full" ref={svgContainerRef} onClick={handleSvgContainerClick} />
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
              }}
              className="p-2"
            >
              {uploadedItems.map(item => (
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
                  onMouseDown={e => {
                    // start drag gesture (live updates)
                    handleMouseDown(e, item, svgContainerRef, setDraggingId, offsetRef);
                  }}
                  onTouchStart={e => {
                    handleMouseDown(e, item, svgContainerRef, setDraggingId, offsetRef);
                  }}
                  onClick={e => {
                    e.stopPropagation();
                    setSelectedItemId(item.id);
                  }}
                >
                  {item.type === 'image' ? (
                    item.fileType === 'svg' ? (
                      <object type="image/svg+xml" data={item.src} className="w-full h-full pointer-events-none" style={{ objectFit: 'fill' }} />
                    ) : (
                      <img src={item.src} alt={item.originalFileName} className="w-full h-full pointer-events-none" style={{ objectFit: 'fill' }} />
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
                </div>
              ))}
            </div>
          )}

          {/* Controller overlay */}
          {selectedItemId &&
            (() => {
              const item = uploadedItems.find(i => i.id === selectedItemId);
              if (!item || !svgOverlayBox) return null;
              return (
                <div
                  ref={controllerRef}
                  className="border-2 border-indigo-500 border-dashed controller-overlay"
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
                    transform: `rotate(${item.rotation}deg)`,
                  }}
                  onMouseDown={e => {
                    const target = e.target as HTMLElement;
                    if (target.closest('.resize-handle') || target.closest('.rotate-handle')) return;
                    // start drag gesture (live)
                    handleMouseDown(e, item, svgContainerRef, setDraggingId, offsetRef);
                  }}
                >
                  {/* SVG Color Change (opens modal) */}
                  {item.type === 'image' && (
                    <div
                      className="absolute top-0 left-0 flex items-center justify-center bg-white border-2 border-indigo-500 rounded-full shadow cursor-pointer resize-handle h-7 w-7"
                      onMouseDown={e => {
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
                    className="absolute top-0 right-0 z-50 flex items-center justify-center bg-white border-2 border-indigo-500 rounded-full shadow cursor-pointer rotate-handle h-7 w-7"
                    onMouseDown={e => {
                      e.stopPropagation();
                      setIsResizing(true);
                      resizeStart.current = { x: e.clientX, y: e.clientY, width: item.width, height: item.height };
                    }}
                    onClick={e => {
                      e.stopPropagation();
                      setOpenRotateDialog(true);
                    }}
                  >
                    <RotateCw size={16} className="text-indigo-500" />
                  </div>

                  {/* Resize Handle (live updates, commit on mouseup) */}
                  <div
                    className="absolute bottom-0 right-0 flex items-center justify-center bg-white border-2 border-indigo-500 rounded-full shadow resize-handle h-7 w-7 cursor-nesw-resize"
                    onMouseDown={e => {
                      e.stopPropagation();
                      setIsResizing(true);
                      resizeStart.current = { x: e.clientX, y: e.clientY, width: item.width, height: item.height };
                    }}
                  >
                    <Maximize2 size={16} className="text-indigo-500" />
                  </div>

                  {/* Delete Handle (commit) */}
                  <div
                    className="absolute bottom-0 left-0 z-50 flex items-center justify-center bg-white border-2 border-indigo-500 rounded-full shadow cursor-pointer resize-handle h-7 w-7"
                    onMouseDown={e => {
                      e.stopPropagation();
                      setIsResizing(true);
                      resizeStart.current = { x: e.clientX, y: e.clientY, width: item.width, height: item.height };
                    }}
                    onClick={e => {
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

      {/* Zoom / Pan / Undo-Redo bar */}
      <div className="fixed flex gap-2 p-2 rounded shadow top-2 right-2 z-2 bg-white/80 lg:top-auto lg:right-8 lg:bottom-8 lg:left-auto dark:bg-gray-800/50">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-1 transition-all duration-75 rounded cursor-pointer hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-700"
          title="Undo (Ctrl/Cmd+Z)"
        >
          <Undo2 size={18} />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-1 transition-all duration-75 rounded cursor-pointer hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-700"
          title="Redo (Ctrl+Shift+Z or Ctrl+Y)"
        >
          <Redo2 size={18} />
        </button>

        <div className="w-px h-6 mx-1 bg-gray-200" />

        <button
          onClick={handleZoomOut}
          disabled={zoom <= MIN_ZOOM}
          className="p-1 transition-all duration-75 rounded cursor-pointer hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-700"
        >
          <Minus size={18} />
        </button>
        <span className="px-2 font-mono">{(zoom * 100).toFixed(0)}%</span>
        <button
          onClick={handleZoomIn}
          disabled={zoom >= MAX_ZOOM}
          className="p-1 transition-all duration-75 rounded cursor-pointer hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-700"
        >
          <Plus size={18} />
        </button>
        <button onClick={handleResetView} className="p-1 transition-all duration-75 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
          <RefreshCw size={18} />
        </button>
      </div>

      {selecetSvgId && (
        <SvgColorChangeModal
          open={openSvgDialog}
          onOpenChange={() => {
            setOpenSvgDialog(false);
            setSelectedSvgId(null);
          }}
          selecetSvgId={selecetSvgId}
          setUploadedItems={(updater) => {
            // committing because it's a discrete change
            setUploadedItemsCommit(updater);
          }}
          uploadedItems={uploadedItems}
        />
      )}

      <RotateAngleModal
        open={openRotateDialog}
        onOpenChange={setOpenRotateDialog}
        initialAngle={selectedItemId ? uploadedItems.find(i => i.id === selectedItemId)?.rotation || 0 : 0}
        onConfirm={(angle) => {
          if (!selectedItemId) return;
          setUploadedItemsCommit(prev => prev.map(item => (item.id === selectedItemId ? { ...item, rotation: angle } : item)));
        }}
      />
    </main>
  );
}
