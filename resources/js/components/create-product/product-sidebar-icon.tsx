import { CanvasItem } from '@/types/editor';
import { RefObject } from 'react';
import CommonSideBarIcons from '../common/sidebar-icons';
import { Component } from 'lucide-react';

type Props = {
    setShowBar: Function;
    showBar: 'layerbar' | 'textbar' | 'logobar' | 'colorbar' | 'partsbar';
    fileInputRef: RefObject<HTMLInputElement | null>;
    handleResetCanvas: () => void;
    uploadedItems: CanvasItem[];
    downlaodpng: boolean;
    downloadsvg: boolean;
    imageuploadLimit: number | string;
};

export default function ProductSidebarIcons({
    setShowBar,
    showBar,
    fileInputRef,
    handleResetCanvas,
    uploadedItems,
    downlaodpng,
    downloadsvg,
    imageuploadLimit,
}: Props) {
    return (
        <div className="flex w-full flex-row justify-evenly lg:flex-col">
            <Component
                className={`h-10 w-10 cursor-pointer rounded-md p-3 transition-all duration-500 ${showBar === 'partsbar' ? 'bg-gray-200/90 dark:bg-gray-200/20' : 'hover:bg-gray-200/90 dark:hover:bg-gray-200/20'}`}
                onClick={() => setShowBar('partsbar')}
            />
            <CommonSideBarIcons
                setShowBar={setShowBar}
                showBar={showBar}
                fileInputRef={fileInputRef}
                handleResetCanvas={handleResetCanvas}
                uploadedItems={uploadedItems}
                downlaodpng={downlaodpng}
                downloadsvg={downloadsvg}
                imageuploadLimit={imageuploadLimit}
            />
        </div>
    );
}
