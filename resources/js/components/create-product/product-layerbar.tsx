import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CombinedLayer, PartLayer } from '@/types/createProduct';
import { CanvasItem } from '@/types/editor';
import { Pen, TextIcon, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import EditPart from './edit-part';

type Props = {
    uploadedItems: CanvasItem[];
    setUploadedItems: React.Dispatch<React.SetStateAction<CanvasItem[]>>;
    uploadedPart: PartLayer[];
    setUploadedPart: React.Dispatch<React.SetStateAction<PartLayer[]>>;
};

export default function EditorLayerBar({ uploadedItems, setUploadedItems, uploadedPart, setUploadedPart }: Props) {
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [search, setSearch] = useState<string>('');
    const [layers, setLayers] = useState<CombinedLayer[]>([]);
    const [selectedPart, setSelectedPart] = useState<PartLayer | null>(null);
    const [openEditImageModal, setOpenEditImageModal] = useState<boolean>(false);

    // ✅ Always derive layers from uploadedItems & uploadedPart
    useEffect(() => {
        const combinedLayers: CombinedLayer[] = [
            ...uploadedItems.map((i) => ({ ...i, layerType: 'item' })),
            ...uploadedPart.map((p) => ({ ...p, layerType: 'part' })),
        ];

        // Sort by zIndex for consistent stacking
        combinedLayers.sort((a, b) => a.zIndex - b.zIndex);

        setLayers(combinedLayers);
    }, [uploadedItems, uploadedPart]);

    const handleDragStart = (id: string) => setDraggingId(id);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, overId: string) => {
        e.preventDefault();
        if (draggingId && draggingId !== overId) {
            setLayers((prev) => {
                const draggingIndex = prev.findIndex((i) => i.id === draggingId);
                const overIndex = prev.findIndex((i) => i.id === overId);
                if (draggingIndex === -1 || overIndex === -1) return prev;

                const newList = [...prev];
                const [movedItem] = newList.splice(draggingIndex, 1);
                newList.splice(overIndex, 0, movedItem);
                return newList;
            });
        }
        setHoveredId(overId);
    };

    const handleDrop = () => {
        if (!draggingId) return;

        setLayers((prev) => {
            const newOrder = [...prev];

            // ✅ Update zIndex only, without overwriting color/path
            newOrder.forEach((layer, index) => {
                if (layer.layerType === 'item') {
                    setUploadedItems((prevItems) =>
                        prevItems.map((i) => (i.id === layer.id ? { ...i, zIndex: index } : i))
                    );
                } else {
                    setUploadedPart((prevParts) =>
                        prevParts.map((p) => (p.id === layer.id ? { ...p, zIndex: index } : p))
                    );
                }
            });

            return newOrder;
        });

        setDraggingId(null);
        setHoveredId(null);
    };

    const handleDelete = (id: string, layerType: 'item' | 'part') => {
        setLayers((prev) => prev.filter((l) => l.id !== id));

        if (layerType === 'item') {
            setUploadedItems((prev) => prev.filter((i) => i.id !== id));
        } else {
            setUploadedPart((prev) => prev.filter((p) => p.id !== id));
        }
    };

    const handleUpdateColor = (id: string, color: string, newImage: string) => {
        setUploadedPart((prev) =>
            prev.map((part) => (part.id === id ? { ...part, color, path: newImage } : part))
        );
    };

    const filteredLayers = layers.filter((item) =>
        (item.name || (item as CanvasItem).name || '').toLowerCase().includes(search.trim().toLowerCase())
    );

    return (
        <div className="h-full w-full rounded-lg bg-muted p-3 shadow-sm">
            <h2 className="mb-2 text-lg font-semibold">Layers</h2>
            {layers.length > 0 ? (
                <>
                    <Input
                        placeholder="Search layers by name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="mb-3"
                    />
                    <ScrollArea className="pr-2">
                        <div
                            className="flex flex-col gap-3"
                            onDrop={handleDrop}
                            onDragOver={(e) => e.preventDefault()}
                        >
                            {filteredLayers.length > 0 ? (
                                filteredLayers.map((item, index) => (
                                    <Card
                                        key={item.id}
                                        className={`relative cursor-move transition-all duration-200 ease-in-out select-none ${
                                            draggingId === item.id
                                                ? 'z-10 scale-[0.98] opacity-40 ring-2 ring-primary/30'
                                                : hoveredId === item.id
                                                ? 'ring-2 ring-muted-foreground/40'
                                                : ''
                                        }`}
                                        draggable
                                        onDragStart={() => handleDragStart(item.id)}
                                        onDragOver={(e) => handleDragOver(e, item.id)}
                                        onDragLeave={() => setHoveredId(null)}
                                    >
                                        <CardHeader className="flex flex-row items-center justify-between gap-3 px-3 py-2">
                                            <div className="flex flex-row items-center gap-3">
                                                <div className="flex h-6 w-6 items-center justify-center rounded bg-muted">
                                                    {item.layerType === 'part' ? (
                                                        <img
                                                            src={item.path}
                                                            alt={item.name}
                                                            className="h-5 w-5 object-contain"
                                                        />
                                                    ) : 'type' in item && item.type === 'image' ? (
                                                        <img
                                                            src={item.src}
                                                            alt={item.name}
                                                            className="h-5 w-5 object-contain"
                                                        />
                                                    ) : (
                                                        <TextIcon className="h-5 w-5 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div>
                                                    <CardTitle className="text-sm">
                                                        {item.name ||
                                                            (item as CanvasItem).name ||
                                                            `Layer ${index + 1}`}
                                                    </CardTitle>
                                                    <Badge
                                                        variant="outline"
                                                        className="mt-0.5 text-[10px]"
                                                    >
                                                        {item.layerType}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {item.layerType === 'part' && (
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            style={{
                                                                backgroundColor: item.color
                                                                    ? item.color
                                                                    : '#000000',
                                                            }}
                                                            className="h-8 w-8 rounded-md border"
                                                        />
                                                        <div
                                                            className="cursor-pointer p-1 transition-colors hover:text-blue-500"
                                                            onClick={() => {
                                                                setSelectedPart(item as PartLayer);
                                                                setOpenEditImageModal(true);
                                                            }}
                                                        >
                                                            <Pen className="h-4 w-4" />
                                                        </div>
                                                    </div>
                                                )}
                                                <div
                                                    className="cursor-pointer p-1 transition-colors hover:text-destructive"
                                                    onClick={() =>
                                                        handleDelete(item.id, item.layerType)
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </div>
                                            </div>
                                        </CardHeader>
                                    </Card>
                                ))
                            ) : (
                                <div className="py-4 text-center text-xs text-muted-foreground italic">
                                    No matching layers found.
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </>
            ) : (
                <div className="px-2 py-4 text-center text-sm text-muted-foreground italic">
                    No items available
                </div>
            )}

            {selectedPart && (
                <EditPart
                    open={openEditImageModal}
                    onUpdateColor={handleUpdateColor}
                    part={selectedPart}
                    onOpenChange={() => setOpenEditImageModal(false)}
                />
            )}
        </div>
    );
}
