import { loadSvgMasktemplate } from '@/lib/create-product';
import { handleAddText, handleUploadFile } from '@/lib/editor';
import { generateUniqueId } from '@/lib/utils';
import { PartLayer } from '@/types/createProduct';
import { AllowedPermission, LogoCategory, Part, PartCategroyWithPart } from '@/types/data';
import { CanvasItem } from '@/types/editor';
import { Template } from '@/types/helper';
import { useCallback, useEffect, useRef, useState } from 'react';
import CreateProductCanvas from './product-canvas';
import { CreateProductSidebar } from './product-sidebar';

// Generic shallowEqual helper for undo/redo
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

// Undo/Redo Hook
function useHistoryState<T>(initial: T) {
    const [present, setPresent] = useState<T>(initial);
    const undoStack = useRef<T[]>([]);
    const redoStack = useRef<T[]>([]);
    const lastCommitted = useRef<T>(initial);

    const setLive = useCallback((updater: T | ((prev: T) => T)) => {
        setPresent((prev) => (typeof updater === 'function' ? (updater as (p: T) => T)(prev) : updater));
    }, []);

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

    const commit = useCallback(() => {
        lastCommitted.current = present;
    }, [present]);

    return { present, setLive, setAndCommit, undo, redo, canUndo, canRedo, resetHistory, commit };
}

type Props = {
    template: Template;
    logoGallery: LogoCategory[];
    permissions: AllowedPermission;
    parts: PartCategroyWithPart[];
};

type EditorState = {
    uploadedItems: CanvasItem[];
    uploadedPart: PartLayer[];
};

export default function CreateProductEditor({ template, logoGallery, permissions, parts }: Props) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const svgContainerRef = useRef<HTMLDivElement | null>(null);
    const downloadRef = useRef<HTMLDivElement | null>(null);
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

    // --- History state for items + parts ---
    const { present, setLive, setAndCommit, undo, redo, canUndo, canRedo, resetHistory } = useHistoryState<EditorState>({
        uploadedItems: [],
        uploadedPart: [],
    });

    const uploadedItems = present.uploadedItems;
    const uploadedPart = present.uploadedPart;

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

    const setUploadedPartCommit = (updater: React.SetStateAction<PartLayer[]>) => {
        setAndCommit((prev) => ({
            ...prev,
            uploadedPart: typeof updater === 'function' ? (updater as (p: PartLayer[]) => PartLayer[])(prev.uploadedPart) : updater,
        }));
    };

    // --- Handlers with commit ---
    const UploadFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const allZ = [...uploadedItems, ...uploadedPart].map((l) => l.zIndex ?? 0);
        const maxZ = allZ.length ? Math.max(...allZ) : 0;
        handleUploadFile(event, setUploadedItemsCommit, maxZ);
    };

    const handleResetCanvas = () => {
        resetHistory({ uploadedItems: [], uploadedPart: [] });
        loadSvgMasktemplate(template);
    };

    const AddText = () => {
        const allZ = [...uploadedItems, ...uploadedPart].map((l) => l.zIndex ?? 0);
        const maxZ = allZ.length ? Math.max(...allZ) : 0;
        handleAddText(setUploadedItemsCommit, maxZ);
    };

    const AddPart = ({ part }: { part: Part }) => {
        setUploadedPartCommit((prevParts) => {
            const filtered = prevParts.filter((p) => p.category_id !== String(part.parts_category_id));
            const imageUrl = `${window.location.origin}/storage/${part.path}`;
            const allZ = [...uploadedItems, ...prevParts].map((l) => l.zIndex ?? 0);
            const maxZ = allZ.length ? Math.max(...allZ) : 0;
            const newPart: PartLayer = {
                id: generateUniqueId(),
                name: part.name,
                color: '#000000',
                zIndex: maxZ + 1,
                category_id: String(part.parts_category_id),
                path: imageUrl,
            };
            return [...filtered, newPart];
        });
    };

    useEffect(() => {
        loadSvgMasktemplate(template);
    }, [template]);

    return (
        <main className="flex flex-col p-2 lg:flex-row">
            <div className="order-1 flex-1 p-4 lg:order-2">
                <CreateProductCanvas
                    downloadRef={downloadRef}
                    svgContainerRef={svgContainerRef}
                    fileInputRef={fileInputRef}
                    handleUploadChange={UploadFile}
                    uploadedItems={uploadedItems}
                    setUploadedItems={setUploadedItemsCommit}
                    selectedItemId={selectedItemId}
                    setSelectedItemId={setSelectedItemId}
                    uploadedPart={uploadedPart}
                    setUploadedPart={setUploadedPartCommit} // pass setUploadedPart for parts management
                    // pass undo/redo
                    undo={undo}
                    redo={redo}
                    canUndo={canUndo}
                    canRedo={canRedo}
                />
            </div>

            <div className="order-2 w-full p-4 lg:order-1 lg:w-1/3 lg:p-0 xl:w-1/4">
                <CreateProductSidebar
                    uploadedItems={uploadedItems}
                    setUploadedItems={setUploadedItemsCommit}
                    logoGallery={logoGallery}
                    fileInputRef={fileInputRef}
                    handleResetCanvas={handleResetCanvas}
                    AddText={AddText}
                    selectedItemId={selectedItemId}
                    Allowedpermissions={permissions}
                    uploadedPart={uploadedPart}
                    setUploadedPart={setUploadedPartCommit}
                    parts={parts}
                    addPart={AddPart}
                    // optional: expose undo/redo buttons on sidebar
                    // undo={undo}
                    // redo={redo}
                    // canUndo={canUndo}
                    // canRedo={canRedo}
                />
            </div>
        </main>
    );
}
