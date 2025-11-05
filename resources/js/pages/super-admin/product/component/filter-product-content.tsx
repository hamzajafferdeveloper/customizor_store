'use client';

import { Button } from '@/components/ui/button';
import {
    SheetClose,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Color } from '@/types/data';
import { SlidersHorizontal, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { router } from '@inertiajs/react';

const FilterProductContent = ({ colors, baseUrl, product_type }: { colors: Color[], baseUrl: string; product_type: Category[] }) => {
    const [searchColor, setSearchColor] = useState<string>('');
    const [selectedColors, setSelectedColors] = useState<Color[]>([]);
    const [selectedType, setSelectedType] = useState<string | undefined>();

    const sheetCloseRef = useRef<HTMLButtonElement>(null); // ✅ Ref to SheetClose

    const searchedColor = colors.filter((col) =>
        col.name.toLowerCase().includes(searchColor.toLowerCase())
    );

    const toggleColor = (color: Color) => {
        setSelectedColors((prev) =>
            prev.some((c) => c.id === color.id)
                ? prev.filter((c) => c.id !== color.id)
                : [...prev, color]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const query: Record<string, string> = {};
        if (selectedType) query.type = selectedType;
        if (selectedColors.length > 0) {
            query.colors = selectedColors.map((c) => c.id).join(',');
        }

        router.get(baseUrl, query, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                // ✅ Close the Sheet after success
                if (sheetCloseRef.current) {
                    sheetCloseRef.current.click();
                }
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="grid gap-2 p-2">
            <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                    <SlidersHorizontal className="h-6 w-6" />
                    Filter Product
                </SheetTitle>
                <SheetDescription>
                    Select filters and then press apply when you're done.
                </SheetDescription>
            </SheetHeader>

            {/* Product Type */}
            <div className="space-y-1">
                <label className="text-sm font-medium">Product Type</label>
                <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full rounded-md border px-3 py-2 dark:bg-gray-700 dark:text-white text-sm"
                >
                    {product_type.map((type) => (
                        <option key={type.id} value={type.id}>
                            {type.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Color Search + Selection */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Colors</label>
                <input
                    placeholder="Search Color Name"
                    className="w-full p-2 rounded-md border text-sm"
                    value={searchColor}
                    onChange={(e) => setSearchColor(e.target.value)}
                />

                <div className="h-64 rounded-md w-full py-2 space-y-2 overflow-auto  border p-2">
                    {searchedColor.map((color) => {
                        const selected = selectedColors.some((c) => c.id === color.id);
                        return (
                            <div
                                key={color.id}
                                className={`w-full flex justify-between rounded-md border px-2 py-1 cursor-pointer ${
                                    selected ? 'dark:bg-gray-800 bg-gray-200' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                                onClick={() => toggleColor(color)}
                            >
                                <div className="flex gap-2 items-center">
                                    <div
                                        className="h-5 w-5 rounded-md"
                                        style={{ backgroundColor: color.hexCode }}
                                    />
                                    <p className="text-sm">{color.name}</p>
                                </div>
                                {selected && <p className="text-green-500 text-xs">Selected</p>}
                            </div>
                        );
                    })}
                    {searchedColor.length === 0 && (
                        <p className="text-xs text-muted-foreground">No matching colors.</p>
                    )}
                </div>

                {/* Selected color pills */}
                {selectedColors.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2 ">
                        {selectedColors.map((color) => (
                            <div
                                key={color.id}
                                className="flex items-center gap-1 rounded-full border px-2 py-1 text-xs text-muted-foreground"
                            >
                                <span
                                    className="inline-block h-3 w-3 rounded-full"
                                    style={{ backgroundColor: color.hexCode }}
                                />
                                {color.name}
                                <X
                                    className="h-3 w-3 cursor-pointer text-red-500 hover:text-red-700"
                                    onClick={() => toggleColor(color)}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <SheetFooter>
                <Button type="submit">Apply</Button>
                {/* Hidden SheetClose button to close programmatically */}
                <SheetClose asChild>
                    <button
                        ref={sheetCloseRef}
                        type="button"
                        className="hidden"
                    ></button>
                </SheetClose>
                <SheetClose asChild>
                    <Button type="button" variant="outline">
                        Close
                    </Button>
                </SheetClose>
            </SheetFooter>
        </form>
    );
};

export default FilterProductContent;
