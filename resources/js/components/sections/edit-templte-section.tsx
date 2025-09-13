import { type SharedData } from '@/types';
import { Template } from '@/types/helper';
import { StoreData } from '@/types/store';
import { router, usePage } from '@inertiajs/react';
import { CircleSlash2, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useSidebar } from '../ui/sidebar';
import { Switch } from '../ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

type SelectedPart = {
    part_id: string;
    name?: string;
    type: 'protection' | 'leather';
    is_group?: boolean;
    color?: string;
    defaultColor?: string;
};

const EditTemplateSection = ({ template, store }: { template: Template; store?: StoreData }) => {
    const { toggleSidebar } = useSidebar();
    const sharedData = usePage<SharedData>();
    const fileRef = useRef<HTMLInputElement | null>(null);
    const svgContainerRef = useRef<HTMLDivElement | null>(null);

    const [svgContent, setSvgContent] = useState<string | null>(template?.template || null);
    //@ts-ignore
    const [selectedParts, setSelectedParts] = useState<SelectedPart[]>(
        (template?.part || []).map((p: any) => ({
            ...p,
            type: p.type || 'leather', // 👈 fallback if backend missed type
        })),
    );
    const [templateName, setTemplateName] = useState<string>(template?.name || '');
    const [showHoverColor, setShowHoverColor] = useState<boolean>(false);
    const [hoverColor, setHoverColor] = useState<string>('#1C175C');

    const selectedPartsRef = useRef<SelectedPart[]>([]);
    useEffect(() => {
        selectedPartsRef.current = selectedParts;
    }, [selectedParts]);

    // render backend svg into real DOM so clicks work
    useEffect(() => {
        if (!svgContent || !svgContainerRef.current) return;

        const parser = new DOMParser();
        const doc = parser.parseFromString(svgContent, 'image/svg+xml');
        const svgNode = doc.querySelector('svg');
        if (svgNode) {
            svgContainerRef.current.innerHTML = '';
            svgContainerRef.current.appendChild(svgNode);
        }
    }, [svgContent]);

    // upload file
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            setSvgContent(reader.result as string);
            setSelectedParts([]);
            setTemplateName('');
        };
        reader.readAsText(file);
    };

    // reset/remove backend template
    const handleRemoveTemplate = () => {
        setSvgContent(null);
        setSelectedParts([]);
        setTemplateName('');
        if (fileRef.current) fileRef.current.value = '';
        toast.info('Template removed. You can now upload a new one.');
    };

    // color change
    const handleColorChange = (partId: string, newColor: string) => {
        setSelectedParts((prev) => prev.map((p) => (p.part_id === partId ? { ...p, color: newColor } : p)));
        const el = svgContainerRef.current?.querySelector<SVGGraphicsElement>(`[part-id="${partId}"]`);
        if (el) {
            el.setAttribute('fill', newColor);
            setSvgContent(svgContainerRef.current?.innerHTML || null);
        }
    };

    // remove part
    const handleRemovePart = (partId: string) => {
        const el = svgContainerRef.current?.querySelector<SVGGraphicsElement>(`[part-id="${partId}"]`);
        if (el) {
            const orig = selectedParts.find((p) => p.part_id === partId)?.defaultColor ?? null;
            if (orig) el.setAttribute('fill', orig);
            el.removeAttribute('part-id');
        }
        setSelectedParts((prev) => prev.filter((p) => p.part_id !== partId));
        setSvgContent(svgContainerRef.current?.innerHTML || null);
    };

    // bind click
    useEffect(() => {
        if (!svgContainerRef.current) return;
        const svgEl = svgContainerRef.current.querySelector('svg');
        if (!svgEl) return;

        const onSvgClick = (event: Event) => {
            const target = (event.target as Element)?.closest<SVGGraphicsElement>('path,rect,circle,polygon,polyline,ellipse,line,g');
            if (!target) return;

            const existingId = target.getAttribute('part-id');
            if (existingId) {
                const exists = selectedPartsRef.current.some((p) => p.part_id === existingId);
                if (exists) {
                    toast.error('Part already selected');
                    return;
                }
            }

            const newId = existingId ?? `part-${Math.random().toString(36).slice(2, 9)}`;
            target.setAttribute('part-id', newId);

            const is_group = target.tagName.toLowerCase() === 'g';
            const defaultColor = target.getAttribute('fill') || '#000000';

            setSelectedParts((prev) => [
                ...prev,
                {
                    part_id: newId,
                    name: '',
                    color: defaultColor,
                    defaultColor,
                    is_group,
                    type: 'leather',
                },
            ]);

            setSvgContent(svgContainerRef.current?.innerHTML || null);
        };

        svgEl.addEventListener('click', onSvgClick);
        return () => svgEl.removeEventListener('click', onSvgClick);
    }, [svgContent]);

    // cleanup removed ids
    useEffect(() => {
        if (!svgContainerRef.current) return;
        const svgEl = svgContainerRef.current.querySelector('svg');
        if (!svgEl) return;
        const keep = new Set(selectedParts.map((p) => p.part_id));
        svgEl.querySelectorAll<SVGGraphicsElement>('[part-id]').forEach((el) => {
            const pid = el.getAttribute('part-id');
            if (pid && !keep.has(pid)) el.removeAttribute('part-id');
        });
    }, [selectedParts]);

    // submit
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
            id: template.id,
            name: templateName,
            svg: svgContent,
            parts: selectedParts,
        };

        if (store) {
            router.put(route('store.product.update.template', { storeId: store.id, id: template.id }), payload);
        } else {
            router.put(route('superadmin.product.update.template', template.id), payload);
        }
    };

    // force svg scale
    useEffect(() => {
        const svg = svgContainerRef.current?.querySelector('svg');
        if (svg) {
            svg.setAttribute('width', '100%');
            svg.setAttribute('height', '100%');
            svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
            svg.style.width = '100%';
            svg.style.height = '100%';
            svg.style.display = 'block';
            svg.style.maxHeight = '80vh';
        }
    }, [svgContent]);

    // sidebar auto-close
    useEffect(() => {
        if (sharedData.props.sidebarOpen === true) toggleSidebar();
    }, []);

    // hover preview
    useEffect(() => {
        if (!svgContainerRef.current) return;
        const svgEl = svgContainerRef.current.querySelector('svg');
        if (!svgEl) return;

        const oldStyle = svgEl.querySelector('#hover-style');
        if (oldStyle) oldStyle.remove();

        if (showHoverColor) {
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

            selectedParts.forEach((p) => {
                const el = svgEl.querySelector<SVGGraphicsElement>(`[part-id="${p.part_id}"]`);
                if (el) {
                    el.style.setProperty('--part-fill', hoverColor);
                }
            });
        } else {
            selectedParts.forEach((p) => {
                const el = svgEl.querySelector<SVGGraphicsElement>(`[part-id="${p.part_id}"]`);
                if (el) {
                    el.style.removeProperty('--part-fill');
                    if (p.defaultColor) el.setAttribute('fill', p.defaultColor);
                    else el.removeAttribute('fill');
                }
            });
        }

        return () => {
            const s = svgEl.querySelector('#hover-style');
            if (s) s.remove();
        };
    }, [showHoverColor, svgContent, selectedParts]);

    return (
        <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
            <div className="h-full w-full xl:flex">
                {/* Canvas */}
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
                        <div className="relative flex w-full items-center justify-center p-4 lg:w-[calc(100%-10rem)]">
                            <div className="flex aspect-square max-h-[80vh] w-full items-center justify-center overflow-hidden rounded-md border">
                                <div ref={svgContainerRef} className="h-full w-full object-contain" />
                            </div>

                            {/* Remove Template Button */}
                            <Button variant="destructive" size="sm" className="absolute top-4 right-4" onClick={handleRemoveTemplate}>
                                Remove Template
                            </Button>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <aside className="my-2 rounded-md border-2 p-2 xl:w-2/5">
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
                                className={`flex items-center gap-1 text-gray-500 ${
                                    selectedParts.length === 0 ? 'pointer-events-none opacity-50' : ''
                                }`}
                            >
                                <input
                                    type="color"
                                    value={hoverColor}
                                    onChange={(e) => setHoverColor(e.target.value)}
                                    className="h-6 w-6 rounded border"
                                />
                                <p>Show Color</p>
                                <Switch checked={showHoverColor} onCheckedChange={setShowHoverColor} />
                            </div>
                        </div>

                        {selectedParts.length === 0 ? (
                            <p className="p-2 text-sm text-gray-500">Click on SVG parts or groups to select them</p>
                        ) : (
                            <div className="my-2 h-full space-y-2">
                                {selectedParts.map((part) => (
                                    <div key={part.part_id} className="flex w-full items-center gap-2 rounded-md border border-gray-300 p-2">
                                        <Input
                                            placeholder={`Name for ${part.is_group ? 'Group' : 'Part'} ${part.part_id}`}
                                            value={part.name}
                                            onChange={(e) =>
                                                setSelectedParts((prev) =>
                                                    prev.map((p) => (p.part_id === part.part_id ? { ...p, name: e.target.value } : p)),
                                                )
                                            }
                                        />

                                        <input
                                            type="color"
                                            className="h-10 w-10 rounded border"
                                            value={part.color || '#000000'}
                                            onChange={(e) => handleColorChange(part.part_id, e.target.value)}
                                        />

                                        <Trash2 className="cursor-pointer text-red-500" onClick={() => handleRemovePart(part.part_id)} />

                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Switch
                                                    checked={part.type === 'protection'}
                                                    onCheckedChange={(checked) =>
                                                        setSelectedParts((prev) =>
                                                            prev.map((p) =>
                                                                p.part_id === part.part_id
                                                                    ? { ...p, type: checked ? 'protection' : 'leather' } // toggle type
                                                                    : p,
                                                            ),
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
                                                    checked={part.is_group || false}
                                                    onCheckedChange={(checked) =>
                                                        setSelectedParts((prev) =>
                                                            prev.map((p) => (p.part_id === part.part_id ? { ...p, is_group: checked } : p)),
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

export default EditTemplateSection;
