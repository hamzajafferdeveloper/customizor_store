import { Input } from '@/components/ui/input';
import { handleUploadLogo } from '@/lib/editor';
import { LogoCategory, LogoGallery } from '@/types/data';
import { CanvasItem } from '@/types/editor';
import { useState } from 'react';

type Props = {
    logoGallery: LogoCategory[];
    setUploadedItems: React.Dispatch<React.SetStateAction<CanvasItem[]>>;
    showLogo: boolean;
    useLogo: boolean;
};

export default function EditorLogoBar({ logoGallery, setUploadedItems, showLogo, useLogo }: Props) {
    const [displayType, setDisplayType] = useState<'categories' | 'logos'>('categories');
    const [selectedCategory, setSelectedCategory] = useState<LogoCategory | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCategories = logoGallery.filter((category) => category.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const filteredLogos = selectedCategory?.logos.filter((logo) => logo.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const uploadLogo = (logo: LogoGallery) => {
        handleUploadLogo(logo, setUploadedItems);
    };

    return (
        <div className="px-2">
            <div className="py-2">
                <Input
                    placeholder={`Search ${displayType === 'categories' ? 'categories' : 'logos'}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {displayType === 'categories' ? (
                <div className="space-y-2">
                    <h1 className="py-1 text-lg font-semibold">Logo Categories</h1>
                    {filteredCategories.length > 0 ? (
                        filteredCategories.map((category) => (
                            <div
                                className="w-full cursor-pointer rounded-md border p-2 hover:bg-gray-200/90 dark:hover:bg-gray-200/20"
                                key={category.id}
                                onClick={() => {
                                    setSelectedCategory(category);
                                    setDisplayType('logos');
                                    setSearchQuery(''); // Reset search for logos
                                }}
                            >
                                {category.name}
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500">No matching categories found.</p>
                    )}
                </div>
            ) : selectedCategory ? (
                <>
                    <button
                        onClick={() => {
                            setDisplayType('categories');
                            setSelectedCategory(null);
                            setSearchQuery(''); // Reset search for categories
                        }}
                        className="mb-2 text-sm text-blue-500 hover:underline"
                    >
                        ← Back to categories
                    </button>

                    <div className="grid grid-cols-5 gap-4 lg:grid-cols-2">
                        {filteredLogos && filteredLogos.length > 0 ? (
                            filteredLogos.map((logo) => (
                                <div
                                    key={logo.id}
                                    className={
                                        `flex cursor-pointer flex-col overflow-hidden rounded-xl border border-gray-200 shadow-sm transition-all hover:shadow-md dark:border-gray-800
                                        ${!showLogo ? 'pointer-events-none opacity-50' : useLogo ? '' : 'pointer-events-none opacity-50'}`
                                    }
                                >
                                    <div className="aspect-square flex-1 bg-white">
                                        <img
                                            src={`/storage/${logo.source}`}
                                            alt={logo.name}
                                            className="h-full w-full object-contain p-2"
                                            onClick={() => uploadLogo(logo)}
                                        />
                                    </div>
                                    <div className="truncate border-t bg-gray-50 px-2 py-1 text-center text-sm font-medium text-gray-700 dark:bg-transparent dark:text-gray-100">
                                        {logo.name}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="col-span-full text-sm text-gray-500">No matching logos found.</p>
                        )}
                    </div>
                </>
            ) : (
                <p className="text-sm text-gray-500">No category selected.</p>
            )}
        </div>
    );
}
