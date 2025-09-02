import { CanvasItem } from '@/types/editor';
import { Home, Redo2, Undo2 } from 'lucide-react';
import { RefObject } from 'react';
import CommonSideBarIcons from '@/components/common/sidebar-icons';

type Props = {
    setShowBar: Function;
    showBar: 'layerbar' | 'textbar' | 'logobar' | 'colorbar';
    fileInputRef: RefObject<HTMLInputElement | null>;
    handleResetCanvas: () => void;
    uploadedItems: CanvasItem[];
    downlaodpng: boolean;
    downloadsvg: boolean;
    imageuploadLimit: number | string;
};

export default function EditorSidebarIcons({
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
        <div className="flex flex-row w-full justify-evenly lg:flex-col">
            <Home
                className={`w-8 h-8 p-2 lg:w-10 lg:h-10 lg:p-3 cursor-pointer rounded-md transition-all duration-500 ${showBar === 'colorbar' ? 'bg-gray-200/90 dark:bg-gray-200/20' : 'hover:bg-gray-200/90 dark:hover:bg-gray-200/20'}`}
                onClick={() => setShowBar('colorbar')}
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
