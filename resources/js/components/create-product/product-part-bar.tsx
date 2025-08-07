import { Input } from '@/components/ui/input';
import { Part, PartCategroyWithPart } from '@/types/data';
import { useState } from 'react';

type Props = {
    parts: PartCategroyWithPart[];
    addPart: ({ part }: { part: Part }) => void;
};

export default function PartsBar({ parts, addPart }: Props) {
    const [selectedCategory, setSelectedCategory] = useState<PartCategroyWithPart | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const normalizedQuery = searchQuery.toLowerCase();

    // Global filtering
    const matchingCategories = parts.filter((category) => {
        const categoryMatch = category.name.toLowerCase().includes(normalizedQuery);
        const partMatch = category.parts.some((part) => part.name.toLowerCase().includes(normalizedQuery));
        return categoryMatch || partMatch;
    });

    const matchingParts = parts.flatMap((category) => category.parts.filter((part) => part.name.toLowerCase().includes(normalizedQuery)));

    const isSearching = searchQuery.trim().length > 0;

    return (
        <div className="px-2">
            <div className="py-2">
                <Input placeholder="Search categories or parts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>

            {isSearching ? (
                <>
                    {/* Show matching categories */}
                    <div className="space-y-2">
                        <h1 className="py-1 text-lg font-semibold">Matching Categories</h1>
                        {matchingCategories.length > 0 ? (
                            matchingCategories.map((category) => (
                                <div
                                    key={category.id}
                                    className="w-full cursor-pointer rounded-md border p-2 hover:bg-gray-200/90 dark:hover:bg-gray-200/20"
                                    onClick={() => {
                                        setSelectedCategory(category);
                                        setSearchQuery(''); // Reset search on select
                                    }}
                                >
                                    {category.name}
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500">No matching categories found.</p>
                        )}
                    </div>

                    {/* Show matching parts */}
                    <div className="mt-4">
                        <h1 className="py-1 text-lg font-semibold">Matching Parts</h1>
                        {matchingParts.length > 0 ? (
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-5 lg:grid-cols-2">
                                {matchingParts.map((part) => (
                                    <div
                                        key={part.id}
                                        onClick={() => addPart({ part })}
                                        className="flex cursor-pointer flex-col overflow-hidden rounded-xl border border-gray-200 shadow-sm transition-all hover:shadow-md dark:border-gray-800"
                                    >
                                        <div className="aspect-square flex-1 bg-white">
                                            <img src={`/storage/${part.path}`} alt={part.name} className="h-full w-full object-contain p-2" />
                                        </div>
                                        <div className="truncate border-t bg-gray-50 px-2 py-1 text-center text-sm font-medium text-gray-700 dark:bg-transparent dark:text-gray-100">
                                            {part.name}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">No matching parts found.</p>
                        )}
                    </div>
                </>
            ) : selectedCategory ? (
                <>
                    <button onClick={() => setSelectedCategory(null)} className="mb-2 text-sm text-blue-500 hover:underline">
                        ← Back to categories
                    </button>

                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-5 lg:grid-cols-2">
                        {selectedCategory.parts.length > 0 ? (
                            selectedCategory.parts.map((part) => (
                                <div
                                    key={part.id}
                                    onClick={() => addPart({ part })}
                                    className="flex cursor-pointer flex-col overflow-hidden rounded-xl border border-gray-200 shadow-sm transition-all hover:shadow-md dark:border-gray-800"
                                >
                                    <div className="aspect-square flex-1 bg-white">
                                        <img src={`/storage/${part.path}`} alt={part.name} className="h-full w-full object-contain p-2" />
                                    </div>
                                    <div className="truncate border-t bg-gray-50 px-2 py-1 text-center text-sm font-medium text-gray-700 dark:bg-transparent dark:text-gray-100">
                                        {part.name}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="col-span-full text-sm text-gray-500">No parts available.</p>
                        )}
                    </div>
                </>
            ) : (
                <div className="space-y-2">
                    <h1 className="py-1 text-lg font-semibold">Logo Categories</h1>
                    {parts.length > 0 ? (
                        parts.map((category) => (
                            <div
                                key={category.id}
                                className="w-full cursor-pointer rounded-md border p-2 hover:bg-gray-200/90 dark:hover:bg-gray-200/20"
                                onClick={() => setSelectedCategory(category)}
                            >
                                {category.name}
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500">No categories found.</p>
                    )}
                </div>
            )}
        </div>
    );
}
