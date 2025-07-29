import { useState } from "react";
import { CanvasItem } from '@/types/editor';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TextIcon, Trash2 } from 'lucide-react';
import { handleDeleteItem } from "@/lib/editor";
import { Input } from "@/components/ui/input";

type Props = {
    uploadedItems: CanvasItem[];
    setUploadedItems: React.Dispatch<React.SetStateAction<CanvasItem[]>>;
};

export default function EditorLayerBar({ uploadedItems, setUploadedItems }: Props) {
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [search, setSearch] = useState<string>("");

    const handleDragStart = (id: string) => {
        setDraggingId(id);
        document.body.classList.add("dragging");
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>, overId: string) => {
        event.preventDefault();
        if (draggingId && draggingId !== overId) {
            setUploadedItems((prev) => {
                const draggingItem = prev.find((item) => item.id === draggingId);
                const withoutDragging = prev.filter((item) => item.id !== draggingId);
                const overIndex = withoutDragging.findIndex((item) => item.id === overId);

                if (!draggingItem || overIndex === -1) return prev;

                // Reverse overIndex to match actual UI
                const insertIndex = withoutDragging.length - overIndex;

                const newList = [...withoutDragging];
                newList.splice(insertIndex, 0, draggingItem);
                return newList;
            });
        }
    };

    const handleDragEnd = () => {
        setDraggingId(null);
        setHoveredId(null);
        document.body.classList.remove("dragging");
    };

    const filteredItems = uploadedItems.filter((item) =>
        (item.name || '').toLowerCase().includes(search.trim().toLowerCase())
    );

    return (
        <div className="w-full h-full bg-muted rounded-lg shadow-sm p-3">
            <h2 className="text-lg font-semibold mb-2">Layers</h2>
            {uploadedItems.length > 0 ? (
                <>
                    <Input
                        placeholder="Search layers by name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="mb-3"
                    />
                    <ScrollArea className="h-[400px] pr-2">
                        <div className="flex flex-col-reverse gap-3">
                            {filteredItems.length > 0 ? (
                                filteredItems.map((item, index) => (
                                    <Card
                                        key={item.id}
                                        style={{ minHeight: '48px' }}
                                        className={`relative transition-all duration-200 ease-in-out cursor-move select-none ${
                                            draggingId === item.id
                                                ? "opacity-40 scale-[0.98] ring-2 ring-primary/30 z-10"
                                                : hoveredId === item.id
                                                    ? "ring-2 ring-muted-foreground/40"
                                                    : "z-0"
                                        }`}
                                        draggable
                                        onDragStart={() => handleDragStart(item.id)}
                                        onDragOver={(e) => handleDragOver(e, item.id)}
                                        onDragLeave={() => setHoveredId(null)}
                                        onDragEnd={handleDragEnd}
                                    >
                                        <CardHeader className="flex flex-row items-center justify-between gap-3 px-3 py-2">
                                            <div className="flex flex-row items-center gap-3">
                                                <div className="w-6 h-6 flex items-center justify-center bg-muted rounded">
                                                    {item.type === "image" ? (
                                                        item.fileType === "svg" ? (
                                                            <object type="image/svg+xml" data={item.src} className="w-5 h-5" />
                                                        ) : item.fileType === "image" ? (
                                                            <img
                                                                src={item.src}
                                                                alt={item.originalFileName}
                                                                className="w-5 h-5 object-contain"
                                                            />
                                                        ) : (
                                                            <img
                                                                src={`/storage/${item.src}`}
                                                                alt={item.originalFileName}
                                                                className="w-5 h-5 object-contain"
                                                            />
                                                        )
                                                    ) : (
                                                        <TextIcon className="w-5 h-5 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <CardTitle className="text-sm">
                                                    {item.name || `Item ${index + 1}`}
                                                </CardTitle>
                                            </div>
                                            <div className="p-1 hover:text-destructive transition-colors">
                                                <Trash2
                                                    className="w-4 h-4"
                                                    onClick={() => handleDeleteItem(item.id, setUploadedItems)}
                                                />
                                            </div>
                                        </CardHeader>
                                    </Card>
                                ))
                            ) : (
                                <div className="text-center text-xs text-muted-foreground italic py-4">
                                    No matching layers found.
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </>
            ) : (
                <div className="text-sm text-muted-foreground italic px-2 py-4 text-center">
                    No items available
                </div>
            )}
        </div>
    );
}
