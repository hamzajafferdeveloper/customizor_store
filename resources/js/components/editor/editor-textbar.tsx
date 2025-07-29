'use client';

import { Bold, ChevronsUpDown, Underline } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';

import { CanvasItem, TextLayer } from '@/types/editor';
import { HexColorPicker } from 'react-colorful';
import { Popover as ShadPopover, PopoverContent as ShadPopoverContent, PopoverTrigger as ShadPopoverTrigger } from '../ui/popover';
import LimitModal from './limit-modal';

const fonts = [
    'Arial',
    'Verdana',
    'Helvetica',
    'Tahoma',
    'Trebuchet MS',
    'Georgia',
    'Times New Roman',
    'Courier New',
    'Lucida Console',
    'Impact',
    'Comic Sans MS',
    'Garamond',
    'Palatino',
    'Bookman',
    'Arial Black',
    'Candara',
    'Segoe UI',
    'Roboto',
    'Open Sans',
    'Montserrat',
];

type Props = {
    AddText: () => void;
    selectedItemId: string | null;
    uploadedItems: CanvasItem[];
    onUpdateTextLayer: (id: string, updates: Partial<TextLayer>) => void;
    limit: number | string; // e.g., 3 or 'unlimited'
};

export default function EditorTextBar({ AddText, selectedItemId, uploadedItems, onUpdateTextLayer, limit }: Props) {
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
    const [openFont, setOpenFont] = useState(false);

    const [limitModalOpen, setLimitModalOpen] = useState(false);

    const textCount = uploadedItems.filter((item) => item.type === 'text').length;

    const handleAddText = () => {
        if (limit === 'unlimited' || textCount < Number(limit)) {
            AddText();
        } else {
            setLimitModalOpen(true);
        }
    };

    // Sync local state with textLayer when selection changes
    useEffect(() => {
        setTextValue(textLayer?.text ?? '');
        setFontSize(textLayer?.fontSize ?? 32);
        setBold(textLayer?.bold ?? false);
        setUnderline(textLayer?.underline ?? false);
        setColor(textLayer?.color ?? '#000000');
        setFontFamily(textLayer?.fontFamily ?? 'Arial');
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
                    {/* ✅ Text Input */}
                    <div className="flex flex-col gap-2">
                        <Label className="text-sm font-medium">Text</Label>
                        <Input
                            type="text"
                            placeholder="Enter your text here..."
                            value={textValue}
                            onChange={(e) => {
                                setTextValue(e.target.value);
                                if (textLayer) {
                                    onUpdateTextLayer(textLayer.id, { text: e.target.value });
                                }
                            }}
                        />
                    </div>

                    {/* ✅ Font Family Selector */}
                    <div className="flex flex-col gap-2">
                        <Label className="text-sm font-medium">Font Family</Label>
                        <ShadPopover open={openFont} onOpenChange={setOpenFont}>
                            <ShadPopoverTrigger asChild>
                                <Button variant="outline" role="combobox" className="w-full justify-between">
                                    {fontFamily}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </ShadPopoverTrigger>
                            <ShadPopoverContent className="w-[200px] p-0">
                                <Command>
                                    <CommandInput placeholder="Search font..." />
                                    <CommandEmpty>No font found.</CommandEmpty>
                                    <CommandList>
                                        <CommandGroup>
                                            {fonts.map((font) => (
                                                <CommandItem
                                                    key={font}
                                                    value={font}
                                                    onSelect={() => {
                                                        setFontFamily(font);
                                                        setOpenFont(false);
                                                        if (textLayer) {
                                                            onUpdateTextLayer(textLayer.id, { fontFamily: font });
                                                        }
                                                    }}
                                                    className="cursor-pointer"
                                                >
                                                    <span style={{ fontFamily: font }}>{font}</span>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </ShadPopoverContent>
                        </ShadPopover>
                    </div>

                    {/* ✅ Font Settings */}
                    <div className="flex flex-col gap-3">
                        <Label className="text-sm font-medium">Font Settings</Label>

                        {/* Font Size Slider */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">Font Size</span>
                                <span className="text-xs font-semibold">{fontSize}px</span>
                            </div>
                            <Slider
                                value={[fontSize]}
                                onValueChange={(value: any) => {
                                    setFontSize(value[0]);
                                    if (textLayer) {
                                        onUpdateTextLayer(textLayer.id, { fontSize: value[0] });
                                    }
                                }}
                                min={8}
                                max={120}
                                step={1}
                            />
                        </div>

                        {/* Font Style Buttons */}
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
                                                if (textLayer) {
                                                    onUpdateTextLayer(textLayer.id, { bold: !bold });
                                                }
                                            }}
                                        >
                                            <Bold size={18} />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Bold</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            {/* Underline */}
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant={underline ? 'default' : 'outline'}
                                            size="icon"
                                            onClick={() => {
                                                setUnderline(!underline);
                                                if (textLayer) {
                                                    onUpdateTextLayer(textLayer.id, { underline: !underline });
                                                }
                                            }}
                                        >
                                            <Underline size={18} />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Underline</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>

                    {/* ✅ Color Picker */}
                    <div className="flex flex-col gap-2">
                        <Label className="text-sm font-medium">Text Color</Label>
                        <HexColorPicker
                            color={color}
                            onChange={(color) => {
                                setColor(color);
                                if (textLayer) {
                                    onUpdateTextLayer(textLayer.id, { color: color });
                                }
                            }}
                        />
                    </div>
                </div>
            )}
            <LimitModal open={limitModalOpen} onOpenChange={() => setLimitModalOpen(false)} />
        </div>
    );
}
