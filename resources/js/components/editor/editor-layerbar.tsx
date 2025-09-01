import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { handleDeleteItem } from '@/lib/editor';
import { CanvasItem } from '@/types/editor';
import { TextIcon, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type Props = {
    uploadedItems: CanvasItem[];
    setUploadedItems: React.Dispatch<React.SetStateAction<CanvasItem[]>>;
};

export default function EditorLayerBar({ uploadedItems, setUploadedItems }: Props) {
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [search, setSearch] = useState<string>('');
    const [touchStartY, setTouchStartY] = useState<number | null>(null);
    const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

    const layerBarRef = useRef<HTMLDivElement | null>(null);

    const handleDragStart = (id: string) => {
        setDraggingId(id);
        document.body.classList.add('dragging');
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
        document.body.classList.remove('dragging');
    };

    const filteredItems = uploadedItems.filter((item) => (item.name || '').toLowerCase().includes(search.trim().toLowerCase()));

    useEffect(() => {
        const preventScroll = (e: TouchEvent) => {
            // Only prevent if the touch is inside the canvas container
            if (!layerBarRef.current) return;

            const touch = e.touches[0];
            const bounds = layerBarRef.current.getBoundingClientRect();

            if (touch.clientX >= bounds.left && touch.clientX <= bounds.right && touch.clientY >= bounds.top && touch.clientY <= bounds.bottom) {
                e.preventDefault();
            }
        };

        document.body.addEventListener('touchmove', preventScroll, { passive: false });

        return () => {
            document.body.removeEventListener('touchmove', preventScroll);
        };
    }, []);

    return (
        <div className="w-full h-full p-3 rounded-lg shadow-sm bg-muted">
            <h2 className="mb-2 text-lg font-semibold">Layers</h2>
            {uploadedItems.length > 0 ? (
                <>
                    <Input placeholder="Search layers by name..." value={search} onChange={(e) => setSearch(e.target.value)} className="mb-3" />
                    <ScrollArea className="pr-2">
                        <div ref={layerBarRef} className="flex flex-col-reverse gap-3">
                            {filteredItems.length > 0 ? (
                                filteredItems.map((item, index) => (
                                    <Card
                                        key={item.id}
                                        className={`relative cursor-move transition-all duration-200 ease-in-out select-none ${
                                            draggingId === item.id
                                                ? 'z-10 scale-[0.98] opacity-40 ring-2 ring-primary/30'
                                                : hoveredId === item.id
                                                  ? 'ring-2 ring-muted-foreground/40'
                                                  : 'z-0'
                                        }`}
                                        draggable
                                        onDragStart={() => handleDragStart(item.id)}
                                        onDragOver={(e) => handleDragOver(e, item.id)}
                                        onDragLeave={() => setHoveredId(null)}
                                        onDragEnd={handleDragEnd}
                                        onTouchStart={(e) => {
                                            setDraggingId(item.id);
                                            setTouchStartY(e.touches[0].clientY);
                                            setDraggedItemIndex(index);
                                        }}
                                        onTouchMove={(e) => {
                                            const currentY = e.touches[0].clientY;
                                            if (touchStartY === null || draggedItemIndex === null) return;

                                            const deltaY = currentY - touchStartY;
                                            const direction = deltaY > 20 ? 'down' : deltaY < -20 ? 'up' : null;

                                            if (!direction) return;

                                            setUploadedItems((prev) => {
                                                const newItems = [...prev];
                                                const from = draggedItemIndex;
                                                const to = direction === 'down' ? from - 1 : from + 1;

                                                if (to < 0 || to >= newItems.length) return prev;

                                                // Swap
                                                [newItems[from], newItems[to]] = [newItems[to], newItems[from]];
                                                setDraggedItemIndex(to);
                                                setTouchStartY(currentY);
                                                return newItems;
                                            });
                                        }}
                                        onTouchEnd={() => {
                                            setDraggingId(null);
                                            setTouchStartY(null);
                                            setDraggedItemIndex(null);
                                        }}
                                    >
                                        <CardHeader className="flex flex-row items-center justify-between w-full gap-3 px-3 py-2">
                                            <div className="flex flex-row items-center w-3/4 gap-3">
                                                <div className="flex items-center justify-center w-6 h-6 rounded bg-muted">
                                                    {item.type === 'image' ? (
                                                        item.fileType === 'svg' ? (
                                                            <object type="image/svg+xml" data={item.src} className="w-5 h-5" />
                                                        ) : (
                                                            <img src={item.src} alt={item.originalFileName} className="object-contain w-5 h-5" />
                                                        )
                                                    ) : (
                                                        <TextIcon className="w-5 h-5 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <CardTitle className="text-sm truncate" title={item.name || `Item ${index + 1}`}>
                                                    {item.name || `Item ${index + 1}`}
                                                </CardTitle>
                                            </div>
                                            <div className="p-1 transition-colors hover:text-destructive">
                                                <Trash2 className="w-4 h-4" onClick={() => handleDeleteItem(item.id, setUploadedItems)} />
                                            </div>
                                        </CardHeader>
                                    </Card>
                                ))
                            ) : (
                                <div className="py-4 text-xs italic text-center text-muted-foreground">No matching layers found.</div>
                            )}
                        </div>
                    </ScrollArea>
                </>
            ) : (
                <div className="px-2 py-4 text-sm italic text-center text-muted-foreground">No items available</div>
            )}
        </div>
    );
}
