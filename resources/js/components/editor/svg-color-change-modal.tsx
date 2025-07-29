import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { HexColorPicker } from 'react-colorful';
import { useEffect, useRef, useState } from 'react';
import { CanvasItem } from '@/types/editor';
import type { UploadLayer } from '@/types/editor';

type Props = {
    open: boolean;
    onOpenChange: () => void;
    selecetSvgId: string | null;
    uploadedItems: CanvasItem[];
    setUploadedItems: React.Dispatch<React.SetStateAction<CanvasItem[]>>;
};

const SvgColorChangeModal = ({ open, onOpenChange, selecetSvgId, uploadedItems, setUploadedItems }: Props) => {
    const [selectedItem, setSelectedItem] = useState<CanvasItem | null>(null);
    const [decodedSvg, setDecodedSvg] = useState<string>('');
    const [selectedElement, setSelectedElement] = useState<SVGElement | null>(null);
    const [currentColor, setCurrentColor] = useState('#000');
    const [selectedElementIndex, setSelectedElementIndex] = useState<number | null>(null);
    const svgContainerRef = useRef<HTMLDivElement>(null);
    const [originalSvg, setOriginalSvg] = useState<string>('');

    // ✅ Decode SVG from Base64 or URL
    useEffect(() => {
        if (!selecetSvgId) return;

        const item = uploadedItems.find(i => i.id === selecetSvgId);
        if (!item) return;

        setSelectedItem(item);
        setSelectedElement(null);
        setCurrentColor('#000');

        const loadSvg = async () => {
            if (!isUploadLayer(item)) return;
            if (!item.src) return;
            if (item.src.startsWith('data:image/svg+xml;base64,')) {
                const base64Content = item.src.replace('data:image/svg+xml;base64,', '');
                const decoded = atob(base64Content);
                setDecodedSvg(decoded);
                setOriginalSvg(decoded);
            } else if (item.src.startsWith('<svg')) {
                setDecodedSvg(item.src);
                setOriginalSvg(item.src);
            } else {
                const res = await fetch(item.src);
                const text = await res.text();
                if (text.includes('<svg')) {
                    setDecodedSvg(text);
                    setOriginalSvg(text);
                } else {
                    setDecodedSvg('');
                    setOriginalSvg('');
                }
            }
        };

        loadSvg();
    }, [selecetSvgId, uploadedItems]);

    const handleClickOnSvg = (e: React.MouseEvent<HTMLDivElement>) => {
        const svgRoot = svgContainerRef.current?.querySelector('svg');
        if (!svgRoot) return;
        const allowedTags = ['path', 'rect', 'circle', 'polygon', 'ellipse'];
        const target = e.target as SVGElement;
        if (!allowedTags.includes(target.tagName.toLowerCase())) return;
        setSelectedElement(target);
        const fill = target.getAttribute('fill') || '#000';
        setCurrentColor(fill);
        // Find the index of the clicked element among allowed elements
        const elements = Array.from(svgRoot.querySelectorAll(allowedTags.join(',')));
        const idx = elements.indexOf(target);
        setSelectedElementIndex(idx);
    };

    const handleColorChange = (color: string) => {
        setCurrentColor(color);
        if (selectedElement && selectedElementIndex !== null) {
            // Update the SVG string
            const parser = new DOMParser();
            const doc = parser.parseFromString(decodedSvg, 'image/svg+xml');
            const allowedTags = ['path', 'rect', 'circle', 'polygon', 'ellipse'];
            const elements = Array.from(doc.querySelectorAll(allowedTags.join(',')));
            if (elements[selectedElementIndex]) {
                elements[selectedElementIndex].setAttribute('fill', color);
                const serializer = new XMLSerializer();
                const updatedSvg = serializer.serializeToString(doc.documentElement);
                setDecodedSvg(updatedSvg);
            }
        }
    };

    // Add type guard for UploadLayer
    function isUploadLayer(item: CanvasItem): item is UploadLayer {
        return item.type === 'image';
    }

    // Handle Cancel
    const handleCancel = () => {
        setDecodedSvg(originalSvg);
        onOpenChange();
    };

    // Handle Save
    const handleSave = () => {
        if (!selecetSvgId) return;
        setUploadedItems(prev => prev.map(item => {
            if (item.id === selecetSvgId && isUploadLayer(item)) {
                // Encode SVG as base64 data URL
                const base64 = btoa(unescape(encodeURIComponent(decodedSvg)));
                return {
                    ...item,
                    src: 'data:image/svg+xml;base64,' + base64,
                };
            }
            return item;
        }));
        onOpenChange();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] h-fit overflow-hidden">
                <DialogHeader>
                    <DialogTitle>Change SVG Colors</DialogTitle>
                </DialogHeader>

                {decodedSvg ? (
                    <div className="flex flex-col ">
                        <div className="flex-1 overflow-y-auto flex flex-col gap-4">
                        <div className="flex flex-col gap-4">
                            {/* SVG Preview */}
                            <div
                                ref={svgContainerRef}
                                onClick={handleClickOnSvg}
                                className="border rounded-md p-2 cursor-pointer"
                                dangerouslySetInnerHTML={{ __html: decodedSvg }}
                            />
                        </div>
                        <div>
                            {selectedElement && (
                                <div className="flex flex-col gap-2">
                                    <p className="font-medium">Pick a Color:</p>
                                    <HexColorPicker color={currentColor} onChange={handleColorChange} />
                                </div>
                            )}
                        </div>
                        {/* Action Buttons */}
                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
                                type="button"
                                onClick={handleCancel}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
                                type="button"
                                onClick={handleSave}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                    </div>
                ) : (
                    <p>No valid SVG item selected.</p>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default SvgColorChangeModal;
