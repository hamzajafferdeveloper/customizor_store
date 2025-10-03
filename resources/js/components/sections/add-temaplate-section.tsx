import { extractFillMap } from '@/lib/utils';
import { type SharedData } from '@/types';
import { Product } from '@/types/data';
import { StoreData } from '@/types/store';
import { router, usePage } from '@inertiajs/react';
import { CircleSlash2, RefreshCw, Trash2, ZoomIn, ZoomOut } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useSidebar } from '../ui/sidebar';
import { Switch } from '../ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

export type SelectedPart = {
    id: string;
    name?: string;
    protection?: boolean;
    isGroup?: boolean;
    color?: string; // user-selected color
    defaultColor?: string; // original SVG color
};

const AddTemplateSection = ({ product, store }: { product: Product; store?: StoreData }) => {
    const { toggleSidebar } = useSidebar();
    const sharedData = usePage<SharedData>();
    const fileRef = useRef<HTMLInputElement | null>(null);
    const svgContainerRef = useRef<HTMLDivElement | null>(null);

    const [svgContent, setSvgContent] = useState<string | null>(null);
    const [selectedParts, setSelectedParts] = useState<SelectedPart[]>([]);
    const [templateName, setTemplateName] = useState<string>('');
    const [showHoverColor, setShowHoverColor] = useState<boolean>(false);
    const [hoverColor, setHoverColor] = useState<string>('#1C175C');
    const [fillMap, setFillMap] = useState<Record<string, string>>({});

    // 🆕 Zoom & Pan
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const isPanning = useRef(false);
    const lastPos = useRef<{ x: number; y: number } | null>(null);

    const handleZoomIn = () => setZoom((z) => Math.min(z + 0.2, 5));
    const handleZoomOut = () => setZoom((z) => Math.max(z - 0.2, 0.2));
    const handleResetView = () => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    };

    const startPan = (e: React.MouseEvent | React.TouchEvent) => {
        isPanning.current = true;
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        lastPos.current = { x: clientX, y: clientY };
    };

    const movePan = (e: MouseEvent | TouchEvent) => {
        if (!isPanning.current || !lastPos.current) return;
        const clientX = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
        const clientY = 'touches' in e ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;

        const dx = clientX - lastPos.current.x;
        const dy = clientY - lastPos.current.y;

        setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
        lastPos.current = { x: clientX, y: clientY };
    };

    const endPan = () => {
        isPanning.current = false;
        lastPos.current = null;
    };

    useEffect(() => {
        window.addEventListener('mousemove', movePan);
        window.addEventListener('mouseup', endPan);
        window.addEventListener('touchmove', movePan);
        window.addEventListener('touchend', endPan);
        return () => {
            window.removeEventListener('mousemove', movePan);
            window.removeEventListener('mouseup', endPan);
            window.removeEventListener('touchmove', movePan);
            window.removeEventListener('touchend', endPan);
        };
    }, []);

    // 🔑 store latest selectedParts for handlers (so we don’t rebind)
    const selectedPartsRef = useRef<SelectedPart[]>([]);
    useEffect(() => {
        selectedPartsRef.current = selectedParts;
    }, [selectedParts]);

    const handleShowHoverColor = (checked: boolean) => {
        setShowHoverColor(checked);
    };

    const targetedSvgPart = (partId: string) => {
        if (!svgContent || !svgContainerRef.current) return;
        const svgEl = svgContainerRef.current.querySelector('svg');
        if (!svgEl) return;
        return svgEl.querySelector<SVGElement>(`[part-id="${partId}"]`);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const text = reader.result as string;
            setSvgContent(text);

            // ✅ extract default colors from <style>
            const map = extractFillMap(text);
            setFillMap(map);
        };
        reader.readAsText(file);
    };

    const handleColorChange = (partId: string, newColor: string) => {
        setSelectedParts((prev) => prev.map((part) => (part.id === partId ? { ...part, color: newColor } : part)));

        const el = svgContainerRef.current?.querySelector<SVGGraphicsElement>(`[part-id="${partId}"]`);
        if (el) {
            el.setAttribute('fill', newColor);
            const updatedSvg = svgContainerRef.current?.innerHTML;
            if (updatedSvg) setSvgContent(updatedSvg);
        }
    };

    const handleRemovePart = (partId: string) => {
        const targetedPart = targetedSvgPart(partId);
        if (targetedPart) {
            // restore default color if we had it
            const orig = selectedParts.find((p) => p.id === partId)?.defaultColor ?? null;
            if (orig) targetedPart.setAttribute('fill', orig);
            targetedPart.removeAttribute('part-id');
        }
        setSelectedParts((prev) => prev.filter((p) => p.id !== partId));

        const updatedSvg = svgContainerRef.current?.innerHTML;
        if (updatedSvg) setSvgContent(updatedSvg);
    };

    // ✅ Bind clicks once per svgContent load (not per selectedParts change)
    useEffect(() => {
        if (!svgContent || !svgContainerRef.current) return;

        const svgEl = svgContainerRef.current.querySelector('svg');
        if (!svgEl) return;

        const onSvgClick = (event: Event) => {
            const target = (event.target as Element)?.closest<SVGGraphicsElement>('path,rect,circle,polygon,polyline,ellipse,line');
            if (!target) return;

            const existingId = target.getAttribute('part-id');
            if (existingId) {
                const existsInState = selectedPartsRef.current.some((p) => p.id === existingId);
                if (existsInState) {
                    toast.error('Part already selected');
                    return;
                }
            }

            const newId = existingId ?? `part-${Math.random().toString(36).slice(2, 9)}`;
            target.setAttribute('part-id', newId);

            let defaultColor = target.getAttribute('fill');
            if (!defaultColor) {
                const className = Array.from(target.classList).find((c) => fillMap[c]);
                if (className) {
                    defaultColor = fillMap[className];
                }
            }
            if (!defaultColor) defaultColor = '#000000';

            setSelectedParts((prev) => [...prev, { id: newId, name: '', color: defaultColor, defaultColor, isGroup: false, protection: false }]);

            const updatedSvg = svgContainerRef.current?.innerHTML;
            if (updatedSvg) setSvgContent(updatedSvg);
        };

        svgEl.addEventListener('click', onSvgClick);
        return () => {
            svgEl.removeEventListener('click', onSvgClick);
        };
    }, [svgContent, showHoverColor, selectedParts]);

    // ✅ keep DOM in sync with selectedParts (e.g. when removing)
    useEffect(() => {
        if (!svgContainerRef.current) return;
        const svgEl = svgContainerRef.current.querySelector('svg');
        if (!svgEl) return;

        const keep = new Set(selectedParts.map((p) => p.id));
        svgEl.querySelectorAll<SVGGraphicsElement>('[part-id]').forEach((el) => {
            const pid = el.getAttribute('part-id');
            if (pid && !keep.has(pid)) {
                el.removeAttribute('part-id');
            }
        });
    }, [selectedParts]);

    const handleSubmit = () => {
        if (!svgContent || selectedParts.length === 0) {
            toast.error('Please select parts and upload an SVG before saving.');
            return;
        }

        if (!templateName.trim()) {
            toast.error('Template name is required.');
            return;
        }

        const invalidParts = selectedParts.filter((p) => !p.name || !p.name.trim());
        if (invalidParts.length > 0) {
            toast.error('Each part must have a name.');
            return;
        }

        const payload = {
            product_id: product.id,
            name: templateName,
            svg: svgContent,
            parts: selectedParts,
        };
        if (store) {
            router.post(route('store.product.store.template', { storeId: store.id, slug: product.slug }), payload);
        } else {
            router.post(route('superadmin.product.store.template', product.id), payload);
        }
    };

    useEffect(() => {
        const svg = svgContainerRef.current?.querySelector('svg');
        if (svg) {
            svg.setAttribute('width', '100%');
            svg.setAttribute('height', '100%');
            svg.style.width = '100%';
            svg.style.height = '100%';
            svg.style.objectFit = 'contain';
            svg.style.display = 'block';
        }
    }, [svgContent]);

    useEffect(() => {
        if (sharedData.props.sidebarOpen === true) {
            toggleSidebar();
        }
    }, []);

    // 🔁 Show per-part selected color when `showHoverColor` is ON using CSS variable
    useEffect(() => {
        if (!svgContainerRef.current) return;
        const svgEl = svgContainerRef.current.querySelector('svg');
        if (!svgEl) return;

        // remove old style if any
        const oldStyle = svgEl.querySelector('#hover-style');
        if (oldStyle) oldStyle.remove();

        if (showHoverColor) {
            // inject a single rule that uses a per-element CSS variable
            const style = document.createElement('style');
            style.id = 'hover-style';
            style.innerHTML = `
            [part-id] {
                fill: var(--part-fill) !important;
                opacity: 0.8;
                cursor: pointer;
                stroke: #333;
                stroke-width: 1px;
            }`;
            svgEl.appendChild(style);

            // set the CSS variable for each selected part element
            selectedParts.forEach((part) => {
                const el = svgEl.querySelector<SVGGraphicsElement>(`[part-id="${part.id}"]`);
                if (el) {
                    el.style.setProperty('--part-fill', hoverColor);
                }
            });
        } else {
            // remove any per-element CSS variable and restore the original/default fill attribute
            selectedParts.forEach((part) => {
                const el = svgEl.querySelector<SVGGraphicsElement>(`[part-id="${part.id}"]`);
                if (el) {
                    el.style.removeProperty('--part-fill');
                    if (part.defaultColor) {
                        el.setAttribute('fill', part.defaultColor);
                    } else {
                        // if there was no defaultColor, remove inline fill so original SVG styling remains
                        el.removeAttribute('fill');
                    }
                }
            });
        }

        // cleanup on unmount / re-run
        return () => {
            const s = svgEl.querySelector('#hover-style');
            if (s) s.remove();
        };
    }, [showHoverColor, svgContent, selectedParts]);

    return (
        <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
            <div className="h-full w-full xl:flex">
                {/* SVG Upload & Preview */}
                <div className="mb-5 flex w-full items-center justify-center xl:mb-0 xl:h-full">
                    <input type="file" ref={fileRef} accept=".svg" onChange={handleFileChange} className="hidden" />
                    {!svgContent ? (
                        <div
                            className="flex w-3/5 cursor-pointer flex-col items-center justify-center text-gray-400"
                            onClick={() => fileRef.current?.click()}
                        >
                            <CircleSlash2 className="h-60 w-60 opacity-50" />
                            <p>No SVG Template Selected. Click me to select Template</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex w-full items-center justify-center p-4 lg:w-[calc(100%-10rem)]">
                                <div className="flex aspect-square max-h-[80vh] w-full items-center justify-center overflow-hidden rounded-md border">
                                    <div
                                        ref={svgContainerRef}
                                        className="h-full w-full touch-none object-contain"
                                        style={{
                                            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                                            transformOrigin: 'center center',
                                            transition: isPanning.current ? 'none' : 'transform 0.1s ease-out',
                                            cursor: isPanning.current ? 'grabbing' : 'grab',
                                        }}
                                        onMouseDown={startPan}
                                        onTouchStart={startPan}
                                        dangerouslySetInnerHTML={{ __html: svgContent }}
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Sidebar: Template Details + Parts */}
                <aside className="my-2 rounded-md border-2 p-2 xl:w-2/5">
                    {svgContent && (
                        <div className="bottom-2 left-2 mb-2 flex gap-2">
                            <Button variant="outline" onClick={handleZoomOut}>
                                <ZoomOut className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" onClick={handleZoomIn}>
                                <ZoomIn className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" onClick={handleResetView}>
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                    <div className="flex w-full gap-2">
                        <Input
                            className="w-4/5"
                            placeholder="Enter Template Name Here..."
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                        />
                        <Button className="w-1/5" onClick={handleSubmit}>
                            Save
                        </Button>
                    </div>

                    <div className="mt-4 max-h-[75vh] overflow-y-auto">
                        <div className="flex h-full justify-between border-b border-gray-300 p-3">
                            <h1 className="text-xl">Selected Parts ({selectedParts.length})</h1>
                            <div
                                className={`flex items-center gap-1 text-gray-500 ${selectedParts.length === 0 ? 'pointer-events-none opacity-50' : ''}`}
                            >
                                <input
                                    type="color"
                                    value={hoverColor}
                                    onChange={(e) => setHoverColor(e.target.value)}
                                    className="h-6 w-6 rounded border"
                                />
                                <p>Show Color</p>
                                <Switch checked={showHoverColor} onCheckedChange={handleShowHoverColor} />
                            </div>
                        </div>

                        {selectedParts.length === 0 ? (
                            <p className="p-2 text-sm text-gray-500">Click on SVG parts to select them</p>
                        ) : (
                            <div className="my-2 h-full space-y-2">
                                {selectedParts.map((part) => (
                                    <div key={part.id} className="flex w-full items-center gap-2 rounded-md border border-gray-300 p-2">
                                        <Input
                                            placeholder={`Name for ${part.isGroup ? 'Group' : 'Part'} ${part.id}`}
                                            value={part.name}
                                            onChange={(e) =>
                                                setSelectedParts((prev) => prev.map((p) => (p.id === part.id ? { ...p, name: e.target.value } : p)))
                                            }
                                        />

                                        <input
                                            type="color"
                                            className="h-10 w-10 rounded border"
                                            value={part.color || '#000000'}
                                            onChange={(e) => handleColorChange(part.id, e.target.value)}
                                        />

                                        <Trash2 className="cursor-pointer text-red-500" onClick={() => handleRemovePart(part.id)} />

                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Switch
                                                    checked={part.protection || false}
                                                    onCheckedChange={(checked) =>
                                                        setSelectedParts((prev) =>
                                                            prev.map((p) => (p.id === part.id ? { ...p, protection: checked } : p)),
                                                        )
                                                    }
                                                />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Protection</p>
                                            </TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Switch
                                                    checked={part.isGroup || false}
                                                    onCheckedChange={(checked) =>
                                                        setSelectedParts((prev) =>
                                                            prev.map((p) => (p.id === part.id ? { ...p, isGroup: checked } : p)),
                                                        )
                                                    }
                                                />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Group</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default AddTemplateSection;
