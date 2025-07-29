import { Product } from '@/types/data';
import { StoreData } from '@/types/store';
import { router } from '@inertiajs/react';
import { CircleSlash2, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

type SelectedPart = {
    id: string;
    name?: string;
    protection?: boolean;
    isGroup?: boolean;
    color?: string;
};

const AddTemplateSection = ({ product, store }: { product: Product; store?: StoreData }) => {
    const fileRef = useRef<HTMLInputElement | null>(null);
    const svgContainerRef = useRef<HTMLDivElement | null>(null);
    const [svgContent, setSvgContent] = useState<string | null>(null);
    const [selectedParts, setSelectedParts] = useState<SelectedPart[]>([]);
    const [templateName, setTemplateName] = useState<string>('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const text = reader.result as string;
            setSvgContent(text);
        };
        reader.readAsText(file);
    };

    useEffect(() => {
        if (!svgContent || !svgContainerRef.current) return;

        const container = svgContainerRef.current;
        const svgEl = container.querySelector('svg');
        if (!svgEl) return;

        const parts = svgEl.querySelectorAll('path, rect, circle, polygon, polyline, ellipse, line');
        const handlers: { element: SVGGraphicsElement; handler: EventListener }[] = [];

        parts.forEach((el) => {
            const element = el as SVGGraphicsElement;
            element.style.cursor = 'pointer';

            const handleClick = (event: Event) => {
                event.stopPropagation();
                const target = event.currentTarget as SVGGraphicsElement;

                if (!target.id) {
                    const newId = `part-${Math.random().toString(36).substr(2, 9)}`;
                    target.setAttribute('part-id', newId);

                    const updatedSvg = svgContainerRef.current?.innerHTML;
                    if (updatedSvg) {
                        setSvgContent(updatedSvg);
                    }

                    setSelectedParts((prev) => [...prev, { id: newId, name: '', color: '#000000', isGroup: false, protection: false }]);
                } else {
                    toast.error('Part already selected');
                }
            };

            element.addEventListener('click', handleClick);
            handlers.push({ element, handler: handleClick });
        });

        return () => {
            handlers.forEach(({ element, handler }) => {
                element.removeEventListener('click', handler);
            });
        };
    }, [svgContent, selectedParts]);

    const handleColorChange = (partId: string, newColor: string) => {
        setSelectedParts((prev) => prev.map((part) => (part.id === partId ? { ...part, color: newColor } : part)));

        const el = svgContainerRef.current?.querySelector(`#${partId}`) as SVGGraphicsElement;
        if (el) {
            el.setAttribute('fill', newColor);
            const updatedSvg = svgContainerRef.current?.innerHTML;
            if (updatedSvg) setSvgContent(updatedSvg);
        }
    };

    const handleRemovePart = (partId: string) => {
        const el = svgContainerRef.current?.querySelector(`#${partId}`) as SVGGraphicsElement;
        if (el) {
            el.removeAttribute('stroke');
            el.removeAttribute('stroke-width');
            el.removeAttribute('part-id');

            const updatedSvg = svgContainerRef.current?.innerHTML;
            if (updatedSvg) setSvgContent(updatedSvg);
        }

        setSelectedParts((prev) => prev.filter((p) => p.id !== partId));
    };

    const handleSubmit = () => {
        if (!svgContent || selectedParts.length === 0) {
            toast.error('Please select parts and upload an SVG before saving.');
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
            svg.style.objectFit = 'contain'; // optional
            svg.style.display = 'block'; // avoids extra whitespace
        }
    }, [svgContent]);
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
                        <div className="h-[90vh] w-[800px] rounded-md border p-4">
                            <div className="h-full w-full overflow-hidden" ref={svgContainerRef} dangerouslySetInnerHTML={{ __html: svgContent }} />
                        </div>
                    )}
                </div>

                {/* Sidebar: Template Details + Parts */}
                <aside className="rounded-md border-2 p-2 xl:h-full xl:w-2/5">
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

                    <div className="mt-4 space-y-2">
                        <div className="flex justify-between border-b border-gray-300 p-3">
                            <h1 className="text-xl">Selected Parts</h1>
                        </div>

                        {selectedParts.length === 0 ? (
                            <p className="p-2 text-sm text-gray-500">Click on SVG parts to select them</p>
                        ) : (
                            selectedParts.map((part) => (
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
                                                    setSelectedParts((prev) => prev.map((p) => (p.id === part.id ? { ...p, isGroup: checked } : p)))
                                                }
                                            />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Group</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                            ))
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default AddTemplateSection;
