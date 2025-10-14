import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlignCenter, AlignLeft, AlignRight, Bold, ChevronsUpDown, Italic } from 'lucide-react';
import { useEffect, useState } from 'react';

import LimitModal from '@/components/editor/limit-modal';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover as ShadPopover, PopoverContent as ShadPopoverContent, PopoverTrigger as ShadPopoverTrigger } from '@/components/ui/popover';
import { defaultFonts } from '@/constant/fonts';
import { Font } from '@/types/data';
import { CanvasItem, TextLayer } from '@/types/editor';
import { HexColorPicker } from 'react-colorful';

type Props = {
    AddText: () => void;
    selectedItemId: string | null;
    uploadedItems: CanvasItem[];
    onUpdateTextLayer: (id: string, updates: Partial<TextLayer>) => void;
    limit: number | string;
    allowedfonts: Font[];
};

export default function EditorTextBar({ AddText, selectedItemId, uploadedItems, onUpdateTextLayer, limit, allowedfonts }: Props) {
    const textLayer =
        uploadedItems.find((item) => item.id === selectedItemId)?.type === 'text'
            ? (uploadedItems.find((item) => item.id === selectedItemId) as TextLayer)
            : null;

    const [textValue, setTextValue] = useState(textLayer?.text ?? '');
    const [fontSize, setFontSize] = useState(textLayer?.fontSize ?? 32);
    const [bold, setBold] = useState(textLayer?.bold ?? false);
    const [underline, setUnderline] = useState(textLayer?.underline ?? false);
    const [color, setColor] = useState(textLayer?.color ?? '#000000');
    const [fontFamily, setFontFamily] = useState(textLayer?.fontFamily ?? 'Arial');
    const [fontPath, setFontPath] = useState(textLayer?.fontPath ?? null);
    const [openFont, setOpenFont] = useState(false);
    const [italic, setItalic] = useState(textLayer?.italic ?? false);
    const [stroke, setStroke] = useState(textLayer?.stroke ?? 0);
    const [strokeColor, setStrokeColor] = useState(textLayer?.strokeColor ?? '#000000');
    const [limitModalOpen, setLimitModalOpen] = useState(false);
    const [textAlignment, setTextAlignment] = useState<'left' | 'center' | 'right'>('left');

    const textCount = uploadedItems.filter((item) => item.type === 'text').length;

    const handleAddText = () => {
        if (limit === 'unlimited' || textCount < Number(limit)) {
            AddText();
        } else {
            setLimitModalOpen(true);
        }
    };

    // ✅ Load custom fonts dynamically
    useEffect(() => {
        allowedfonts.forEach((font) => {
            const fontFace = new FontFace(font.name, `url(/storage/${font.path})`);
            fontFace
                .load()
                .then((loadedFace) => document.fonts.add(loadedFace))
                .catch((err) => console.error(`Error loading font ${font.name}:`, err));
        });
    }, [allowedfonts]);

    // ✅ Sync local state with textLayer when selection changes
    useEffect(() => {
        setTextValue(textLayer?.text ?? '');
        setFontSize(textLayer?.fontSize ?? 32);
        setBold(textLayer?.bold ?? false);
        setUnderline(textLayer?.underline ?? false);
        setColor(textLayer?.color ?? '#000000');
        setFontFamily(textLayer?.fontFamily ?? 'Arial');
        setFontPath(textLayer?.fontPath ?? null);
        setItalic(textLayer?.italic ?? false);
        setStroke(textLayer?.stroke ?? 0);
        setStrokeColor(textLayer?.strokeColor ?? '#000000');
    }, [textLayer?.id]);

    return (
        <div className="gap-2 p-4">
            <div className="border-b border-gray-200 py-2 shadow-sm dark:border-gray-200/50">
                <Button variant="outline" className="w-full cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-200/30" onClick={handleAddText}>
                    Add New Text
                </Button>
            </div>

            {selectedItemId && uploadedItems.find((item) => item.id === selectedItemId)?.type === 'text' && (
                <div className="flex flex-col gap-4">
                    {/* Text Input */}
                    <div className="flex flex-col gap-2">
                        <Label className="text-sm font-medium">Text</Label>
                        <Input
                            type="text"
                            placeholder="Enter your text here..."
                            value={textValue}
                            onChange={(e) => {
                                setTextValue(e.target.value);
                                if (textLayer) onUpdateTextLayer(textLayer.id, { text: e.target.value });
                            }}
                        />
                    </div>

                    {/* Font Selector */}
                    <div className="flex flex-col gap-2">
                        <Label className="text-sm font-medium">Font Family</Label>
                        <ShadPopover open={openFont} onOpenChange={setOpenFont}>
                            <ShadPopoverTrigger asChild>
                                <Button variant="outline" role="combobox" className="w-full justify-between">
                                    {fontFamily}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </ShadPopoverTrigger>
                            <ShadPopoverContent className="w-[220px] p-0">
                                <Command>
                                    <CommandInput placeholder="Search font..." />
                                    <CommandEmpty>No font found.</CommandEmpty>
                                    <CommandList>
                                        <CommandGroup heading="Default Fonts">
                                            {defaultFonts.map((font) => (
                                                <CommandItem
                                                    key={font}
                                                    value={font}
                                                    onSelect={() => {
                                                        setFontFamily(font);
                                                        setFontPath(null); // ✅ Default font = no custom path
                                                        setOpenFont(false);
                                                        if (textLayer) {
                                                            // @ts-ignore
                                                            onUpdateTextLayer(textLayer.id, { fontFamily: font, fontPath: null });
                                                        }
                                                    }}
                                                    className="cursor-pointer"
                                                >
                                                    <span style={{ fontFamily: font }}>{font}</span>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>

                                        {allowedfonts.length > 0 && (
                                            <CommandGroup heading="Custom Fonts">
                                                {allowedfonts.map((font) => (
                                                    <CommandItem
                                                        key={font.id}
                                                        value={font.name}
                                                        onSelect={() => {
                                                            setFontFamily(font.name);
                                                            setFontPath(`/storage/${font.path}`);
                                                            setOpenFont(false);
                                                            if (textLayer) {
                                                                onUpdateTextLayer(textLayer.id, {
                                                                    fontFamily: font.name,
                                                                    fontPath: `/storage/${font.path}`,
                                                                });
                                                            }
                                                        }}
                                                        className="cursor-pointer"
                                                    >
                                                        <span style={{ fontFamily: font.name }}>{font.name}</span>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        )}
                                    </CommandList>
                                </Command>
                            </ShadPopoverContent>
                        </ShadPopover>
                    </div>

                    {/* Color Picker */}
                    <div className="flex flex-col gap-2">
                        {/* Text Color Picker */}
                        <div className="flex flex-col gap-2">
                            <Label className="text-sm font-medium">Text Color</Label>

                            <div className="flex items-center gap-3">
                                {/* Native Color Input */}
                                <div className="relative">
                                    <input
                                        type="color"
                                        value={color}
                                        onChange={(e) => {
                                            const newColor = e.target.value;
                                            setColor(newColor);
                                            if (textLayer) onUpdateTextLayer(textLayer.id, { color: newColor });
                                        }}
                                        className="h-9 w-9 cursor-pointer appearance-none rounded-md border border-gray-300 p-0 dark:border-gray-600"
                                        style={{
                                            backgroundColor: color,
                                            WebkitAppearance: 'none',
                                            padding: 0,
                                        }}
                                    />
                                </div>

                                {/* Hex Display */}
                                <Input
                                    type="text"
                                    value={color}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setColor(val);
                                        if (textLayer) onUpdateTextLayer(textLayer.id, { color: val });
                                    }}
                                    className="w-[100px] text-center"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Font Settings */}
                    <div className="flex flex-col gap-3">
                        <div className="flex gap-2">
                            {/* Bold */}
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant={bold ? 'default' : 'outline'}
                                            size="icon"
                                            onClick={() => {
                                                setBold(!bold);
                                                if (textLayer) onUpdateTextLayer(textLayer.id, { bold: !bold });
                                            }}
                                        >
                                            <Bold size={18} />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Bold</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            {/* Italic */}
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant={italic ? 'default' : 'outline'}
                                            size="icon"
                                            onClick={() => {
                                                setItalic(!italic);
                                                if (textLayer) onUpdateTextLayer(textLayer.id, { italic: !italic });
                                            }}
                                        >
                                            <Italic size={18} />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Italic</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>

                        {/* Text Alignment */}
                        <div className="flex gap-2">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant={textAlignment === 'left' ? 'default' : 'outline'}
                                            onClick={() => {
                                                setTextAlignment('left');
                                                if (textLayer) onUpdateTextLayer(textLayer.id, { textAlignment: 'left' });
                                            }}
                                        >
                                            <AlignLeft size={18} />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Align Left</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant={textAlignment === 'center' ? 'default' : 'outline'}
                                            onClick={() => {
                                                setTextAlignment('center');
                                                if (textLayer) onUpdateTextLayer(textLayer.id, { textAlignment: 'center' });
                                            }}
                                        >
                                            <AlignCenter size={18} />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Algin Center</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant={textAlignment === 'right' ? 'default' : 'outline'}
                                            onClick={() => {
                                                setTextAlignment('right');
                                                if (textLayer) onUpdateTextLayer(textLayer.id, { textAlignment: 'right' });
                                            }}
                                        >
                                            <AlignRight size={18} />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Align Right</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>

                        {/* Font Size */}
                        <div>
                            <Label className="text-sm font-medium">Font Size</Label>
                            <Slider
                                value={[fontSize]}
                                onValueChange={(value: any) => {
                                    setFontSize(value[0]);
                                    if (textLayer) onUpdateTextLayer(textLayer.id, { fontSize: value[0] });
                                }}
                                min={8}
                                max={120}
                                step={1}
                            />
                        </div>

                        {/* Stroke */}
                        <div>
                            <Label className="text-sm font-medium">Stroke Size</Label>
                            <Slider
                                value={[stroke]}
                                onValueChange={(value: any) => {
                                    setStroke(value[0]);
                                    if (textLayer) onUpdateTextLayer(textLayer.id, { stroke: value[0] });
                                }}
                                min={0}
                                max={8}
                                step={1}
                            />
                        </div>

                        {/* Stroke Color */}
                        <div>
                            <Label className="text-sm font-medium">Stroke Color</Label>
                            <div className="flex items-center gap-3">
                                {/* Native Color Input */}
                                <div className="relative">
                                    <input
                                        type="color"
                                        value={strokeColor}
                                        onChange={(e) => {
                                            const newColor = e.target.value;
                                            setStrokeColor(newColor);
                                            if (textLayer) onUpdateTextLayer(textLayer.id, { strokeColor: newColor });
                                        }}
                                        className="h-9 w-9 cursor-pointer appearance-none rounded-md border border-gray-300 p-0 dark:border-gray-600"
                                        style={{
                                            backgroundColor: strokeColor,
                                            WebkitAppearance: 'none',
                                            padding: 0,
                                        }}
                                    />
                                </div>

                                {/* Hex Display */}
                                <Input
                                    type="text"
                                    value={strokeColor}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setStrokeColor(val);
                                        if (textLayer) onUpdateTextLayer(textLayer.id, { strokeColor: val });
                                    }}
                                    className="w-[100px] text-center"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <LimitModal open={limitModalOpen} onOpenChange={() => setLimitModalOpen(false)} />
        </div>
    );
}
