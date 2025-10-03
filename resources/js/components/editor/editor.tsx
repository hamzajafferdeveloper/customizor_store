import EditorCanvas from '@/components/editor/editor-canvas';
import { EditorSidebar } from '@/components/editor/editor-sidebar';
import { useSidebar } from '@/components/ui/sidebar';
import { handleAddText, handleClickonSvgContainer, handlePaintPart, handleUploadFile, loadSvgtemplate } from '@/lib/editor';
import { SharedData } from '@/types';
import { AllowedPermission, LogoCategory } from '@/types/data';
import { CanvasItem } from '@/types/editor';
import { Template, TemplatePart } from '@/types/helper';
import { usePage } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * Generic undo/redo store for a single state object.
 * Supports:
 *  - live updates (no history push)
 *  - commit() to snapshot the current present into undo stack
 *  - undo/redo
 */
function shallowEqual(objA: any, objB: any) {
    if (Object.is(objA, objB)) return true;
    if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) return false;
    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);
    if (keysA.length !== keysB.length) return false;
    for (let key of keysA) {
        if (!Object.prototype.hasOwnProperty.call(objB, key) || !Object.is(objA[key], objB[key])) return false;
    }
    return true;
}

function useHistoryState<T>(initial: T) {
    const [present, setPresent] = useState<T>(initial);
    const undoStack = useRef<T[]>([]);
    const redoStack = useRef<T[]>([]);
    const lastCommitted = useRef<T>(initial);

    const setLive = useCallback((updater: T | ((prev: T) => T)) => {
        setPresent((prev) => (typeof updater === 'function' ? (updater as (p: T) => T)(prev) : updater));
    }, []);

    const commit = useCallback(() => {
        const prev = lastCommitted.current;
        const now = present;
        if (shallowEqual(prev, now)) return;
        undoStack.current.push(prev);
        redoStack.current = [];
        lastCommitted.current = now;
    }, [present]);

    const setAndCommit = useCallback((updater: T | ((prev: T) => T)) => {
        setPresent((prev) => {
            const next = typeof updater === 'function' ? (updater as (p: T) => T)(prev) : updater;
            if (!shallowEqual(lastCommitted.current, next)) {
                undoStack.current.push(lastCommitted.current);
                redoStack.current = [];
                lastCommitted.current = next;
            }
            return next;
        });
    }, []);

    const undo = useCallback(() => {
        setPresent((curr) => {
            if (undoStack.current.length === 0) return curr;
            const prev = undoStack.current.pop()!;
            redoStack.current.push(curr);
            lastCommitted.current = prev;
            return prev;
        });
    }, []);

    const redo = useCallback(() => {
        setPresent((curr) => {
            if (redoStack.current.length === 0) return curr;
            const next = redoStack.current.pop()!;
            undoStack.current.push(curr);
            lastCommitted.current = next;
            return next;
        });
    }, []);

    const canUndo = undoStack.current.length > 0;
    const canRedo = redoStack.current.length > 0;

    const resetHistory = useCallback((state: T) => {
        undoStack.current = [];
        redoStack.current = [];
        lastCommitted.current = state;
        setPresent(state);
    }, []);

    return { present, setLive, setAndCommit, commit, undo, redo, canUndo, canRedo, resetHistory };
}

type Props = {
    template: Template;
    logoGallery: LogoCategory[];
    permissions: AllowedPermission;
};

type EditorState = {
    parts: TemplatePart[];
    uploadedItems: CanvasItem[];
};

export default function Editor({ template, logoGallery, permissions }: Props) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const svgContainerRef = useRef<HTMLDivElement | null>(null);
    const downloadRef = useRef<HTMLDivElement | null>(null);
    const [openColorMenu, setOpenColorMenu] = useState<string>('');
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

    const sharedData = usePage<SharedData>();
    // --- Sidebar state sync for non-users (admins, designers) ---
    if (sharedData.props.auth.user?.type !== 'user') {
        if (sharedData.props.auth.user != null) {
            const { toggleSidebar } = useSidebar();

            // Keep sidebar state in sync
            useEffect(() => {
                if (sharedData.props.sidebarOpen === true) {
                    toggleSidebar();
                }
            }, []);
        }
    }

    // --- History store over combined state (parts + uploadedItems) ---
    const { present, setLive, setAndCommit, commit, undo, redo, canUndo, canRedo, resetHistory } = useHistoryState<EditorState>({
        parts: [],
        uploadedItems: [],
    });

    // Convenient derived getters/setters that operate on the combined state
    const parts = present.parts;
    const uploadedItems = present.uploadedItems;

    const setUploadedItemsLive = (updater: React.SetStateAction<CanvasItem[]>) => {
        setLive((prev) => ({
            ...prev,
            uploadedItems: typeof updater === 'function' ? (updater as (p: CanvasItem[]) => CanvasItem[])(prev.uploadedItems) : updater,
        }));
    };

    const setUploadedItemsCommit = (updater: React.SetStateAction<CanvasItem[]>) => {
        setAndCommit((prev) => ({
            ...prev,
            uploadedItems: typeof updater === 'function' ? (updater as (p: CanvasItem[]) => CanvasItem[])(prev.uploadedItems) : updater,
        }));
    };

    const setPartsLive = (updater: React.SetStateAction<TemplatePart[]>) => {
        setLive((prev) => ({
            ...prev,
            parts: typeof updater === 'function' ? (updater as (p: TemplatePart[]) => TemplatePart[])(prev.parts) : updater,
        }));
    };

    const setPartsCommit = (updater: React.SetStateAction<TemplatePart[]>) => {
        setAndCommit((prev) => ({
            ...prev,
            parts: typeof updater === 'function' ? (updater as (p: TemplatePart[]) => TemplatePart[])(prev.parts) : updater,
        }));
    };

    // Expose a single pair to children: one for live, one for commit
    const uploadedSetters = useMemo(
        () => ({
            live: setUploadedItemsLive,
            commit: setUploadedItemsCommit,
            finalizeGesture: commit, // for drag/resize end
        }),
        [],
    );

    // Upload handler — commit
    const UploadFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const allZ = [...uploadedItems].map((l) => l.zIndex ?? 0);
        const maxZ = allZ.length ? Math.max(...allZ) : 0;
        handleUploadFile(
            event,
            (items: CanvasItem[] | ((prev: CanvasItem[]) => CanvasItem[])) => {
                setUploadedItemsCommit(items);
            },
            maxZ,
            setSelectedItemId,
        );
    };

    const handleSvgContainerClick = (event: React.MouseEvent<HTMLDivElement>) => {
        handleClickonSvgContainer(event, parts, setOpenColorMenu);
    };

    const handleResetCanvas = () => {
        // clears uploaded items and reloads template
        setAndCommit((prev) => ({ ...prev, uploadedItems: [] }));
        loadSvgtemplate(template, (newParts: TemplatePart[]) => {
            setAndCommit((prev) => ({ ...prev, parts: newParts }));
        });
    };

    const AddText = () => {
        const allZ = [...uploadedItems].map((l) => l.zIndex ?? 0);
        const maxZ = allZ.length ? Math.max(...allZ) : 0;
        handleAddText(
            (updater: React.SetStateAction<CanvasItem[]>) => {
                setUploadedItemsCommit(updater);
            },
            maxZ,
            setSelectedItemId,
        );
    };

    // Initial load of template into history "present" and commit as baseline
    useEffect(() => {
        loadSvgtemplate(template, (newParts: TemplatePart[]) => {
            resetHistory({ parts: newParts, uploadedItems: [] });
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [template]);

    // Keyboard shortcuts for undo / redo
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const isMac = navigator.platform.toUpperCase().includes('MAC');
            const mod = isMac ? e.metaKey : e.ctrlKey;

            if (!mod) return;

            // Undo: Ctrl/Cmd+Z
            if (e.key.toLowerCase() === 'z' && !e.shiftKey) {
                e.preventDefault();
                undo();
                return;
            }
            // Redo: Ctrl/Cmd+Shift+Z or Ctrl/Cmd+Y
            if ((e.key.toLowerCase() === 'z' && e.shiftKey) || e.key.toLowerCase() === 'y') {
                e.preventDefault();
                redo();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [undo, redo]);

    // Paint part: update state + DOM immediately
    const paintPart = (part: TemplatePart, color: string) => {
        setPartsCommit((prev) => prev.map((p) => (p.id === part.id ? { ...p, color } : p)));

        if (svgContainerRef.current) {
            handlePaintPart(part, color, svgContainerRef.current);
        }
    };

    // 🔑 Sync SVG DOM with React state whenever undo/redo changes `parts`
    useEffect(() => {
        if (!svgContainerRef.current) return;

        parts.forEach((part) => {
            if (part.color && part.color !== '#000000') {
                // ✅ apply only sidebar-assigned colors
                handlePaintPart(part, part.color, svgContainerRef.current!);
            } else {
                // ✅ reset to template defaults if no user color
                handlePaintPart(part, '', svgContainerRef.current!);
            }
        });
    }, [parts]);

    return (
        <main className="flex flex-col p-2 lg:flex-row">
            <div className="order-1 flex-1 p-4 lg:order-2">
                <EditorCanvas
                    downloadRef={downloadRef}
                    svgContainerRef={svgContainerRef}
                    fileInputRef={fileInputRef}
                    handleSvgContainerClick={handleSvgContainerClick}
                    handleUploadChange={UploadFile}
                    uploadedItems={uploadedItems}
                    // pass both live + commit setters to child
                    setUploadedItemsLive={uploadedSetters.live}
                    setUploadedItemsCommit={uploadedSetters.commit}
                    finalizeGesture={uploadedSetters.finalizeGesture}
                    selectedItemId={selectedItemId}
                    setSelectedItemId={setSelectedItemId}
                    onUndo={undo}
                    onRedo={redo}
                    canUndo={canUndo}
                    canRedo={canRedo}
                />
            </div>

            <div className="order-2 w-full p-4 lg:order-1 lg:w-1/3 lg:p-0 xl:w-1/4">
                <EditorSidebar
                    parts={parts}
                    openColorMenu={openColorMenu}
                    uploadedItems={uploadedItems}
                    // use commit setter for sidebar actions (duplicate/delete etc.)
                    setUploadedItems={setUploadedItemsCommit}
                    paintPart={paintPart}
                    logoGallery={logoGallery}
                    fileInputRef={fileInputRef}
                    handleResetCanvas={handleResetCanvas}
                    AddText={AddText}
                    selectedItemId={selectedItemId}
                    Allowedpermissions={permissions}
                    setSelectedItemId={setSelectedItemId}
                />
            </div>
        </main>
    );
}
