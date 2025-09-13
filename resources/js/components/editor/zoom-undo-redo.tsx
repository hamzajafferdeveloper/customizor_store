import { Minus, Plus, Redo2, RefreshCw, Undo2 } from 'lucide-react';

type Props = {
    // Undo/redo UI
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;

    // Zoom/pan UI
    zoom: number;
    setZoom: React.Dispatch<React.SetStateAction<number>>;
    setPan: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
};
const ZoomUndoRedo = ({ onUndo, onRedo, canUndo, canRedo, setZoom, setPan, zoom }: Props) => {
        const MIN_ZOOM = 0.2;
    const MAX_ZOOM = 3;
    const ZOOM_STEP = 0.1;

    const handleResetView = () => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    };

    const handleZoomIn = () => setZoom((z) => Math.min(z + ZOOM_STEP, MAX_ZOOM));
    const handleZoomOut = () => setZoom((z) => Math.max(z - ZOOM_STEP, MIN_ZOOM));
    return (
        <div className="fixed top-2 right-2 z-2 flex gap-2 rounded bg-white/80 p-2 shadow lg:top-auto lg:right-8 lg:bottom-8 lg:left-auto dark:bg-gray-800/50">
            <button
                onClick={onUndo}
                disabled={!canUndo}
                className="cursor-pointer rounded p-1 transition-all duration-75 hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-700"
                title="Undo (Ctrl/Cmd+Z)"
            >
                <Undo2 size={18} />
            </button>
            <button
                onClick={onRedo}
                disabled={!canRedo}
                className="cursor-pointer rounded p-1 transition-all duration-75 hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-700"
                title="Redo (Ctrl+Shift+Z or Ctrl+Y)"
            >
                <Redo2 size={18} />
            </button>

            <div className="mx-1 h-6 w-px bg-gray-200" />

            <button
                onClick={handleZoomOut}
                disabled={zoom <= MIN_ZOOM}
                className="cursor-pointer rounded p-1 transition-all duration-75 hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-700"
            >
                <Minus size={18} />
            </button>
            <span className="px-2 font-mono">{(zoom * 100).toFixed(0)}%</span>
            <button
                onClick={handleZoomIn}
                disabled={zoom >= MAX_ZOOM}
                className="cursor-pointer rounded p-1 transition-all duration-75 hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-700"
            >
                <Plus size={18} />
            </button>
            <button
                onClick={handleResetView}
                className="cursor-pointer rounded p-1 transition-all duration-75 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
                <RefreshCw size={18} />
            </button>
        </div>
    );
};

export default ZoomUndoRedo;
