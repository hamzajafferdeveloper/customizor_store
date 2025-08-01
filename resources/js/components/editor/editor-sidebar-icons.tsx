import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CanvasItem } from '@/types/editor';
import { Download, Home, Image, Layers, RotateCcw, Type, Upload } from 'lucide-react';
import { RefObject, useState } from 'react';
import ConfirmDialog from '../confirm-dialog';
import EditorDownload from './editor-download';
import LimitModal from './limit-modal';

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
    const [openResetDialog, setOpenResetDialog] = useState<boolean>(false);
    const [openOownlaodDialogBox, setOpenDownloadDialogBox] = useState<boolean>(false);
    const [limitModalOpen, setLimitModalOpen] = useState(false);

    const imageCount = uploadedItems.filter((item) => item.type === 'image').length;

    const handleUploadImage = () => {
        if (imageuploadLimit === 'unlimited' || imageCount < Number(imageuploadLimit)) {
            fileInputRef.current?.click();
        } else {
            setLimitModalOpen(true);
        }
    };

    const resetCanvas = () => {
        setOpenResetDialog(false);
        handleResetCanvas();
    };

    return (
        <div className="flex w-full flex-row justify-evenly  lg:flex-col">
            <Home
                className={`h-10 w-10 cursor-pointer rounded-md p-3 transition-all duration-500 ${showBar === 'colorbar' ? 'bg-gray-200/90 dark:bg-gray-200/20' : 'hover:bg-gray-200/90 dark:hover:bg-gray-200/20'}`}
                onClick={() => setShowBar('colorbar')}
            />
            <Layers
                className={`h-10 w-10 cursor-pointer rounded-md p-3 transition-all duration-500 ${showBar === 'layerbar' ? 'bg-gray-200/90 dark:bg-gray-200/20' : 'hover:bg-gray-200/90 dark:hover:bg-gray-200/20'}`}
                onClick={() => setShowBar('layerbar')}
            />
            <Type
                className={`h-10 w-10 cursor-pointer rounded-md p-3 transition-all duration-500 ${showBar === 'textbar' ? 'bg-gray-200/90 dark:bg-gray-200/20' : 'hover:bg-gray-200/90 dark:hover:bg-gray-200/20'}`}
                onClick={() => setShowBar('textbar')}
            />
            <Image
                className={`h-10 w-10 cursor-pointer rounded-md p-3 transition-all duration-500 ${showBar === 'logobar' ? 'bg-gray-200/90 dark:bg-gray-200/20' : 'hover:bg-gray-200/90 dark:hover:bg-gray-200/20'}`}
                onClick={() => setShowBar('logobar')}
            />

            {/* Download Canvas Button */}
            <Tooltip>
                <TooltipTrigger>
                    <div onClick={() => setOpenDownloadDialogBox(true)}>
                        <Download className="h-10 w-10 cursor-pointer rounded-md p-3 hover:bg-gray-200/90 dark:hover:bg-gray-200/20" />
                    </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                    <p>Download</p>
                </TooltipContent>
            </Tooltip>

            {/* Upload Image Button */}

            <Tooltip>
                <TooltipTrigger>
                    <div onClick={() => handleUploadImage()}>
                        <Upload className="h-10 w-10 cursor-pointer rounded-md p-3 hover:bg-gray-200/90 dark:hover:bg-gray-200/20" />
                    </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                    <p>Upload</p>
                </TooltipContent>
            </Tooltip>

            {/* Reset Canvas Button */}
            <Tooltip>
                <TooltipTrigger>
                    <div onClick={() => setOpenResetDialog(true)}>
                        <RotateCcw className="h-10 w-10 cursor-pointer rounded-md p-3 hover:bg-gray-200/90 dark:hover:bg-gray-200/20" />
                    </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                    <p>Reset</p>
                </TooltipContent>
            </Tooltip>

            <ConfirmDialog
                open={openResetDialog}
                onOpenChange={setOpenResetDialog}
                onConfirm={resetCanvas}
                title="Reset Canvas"
                description="Are you sure you want to reset the canvas?"
                confirmText="Reset"
                cancelText="Cancel"
            />
            <EditorDownload
                open={openOownlaodDialogBox}
                onOpenChange={() => setOpenDownloadDialogBox(false)}
                downloadsvg={downloadsvg}
                downlaodpng={downlaodpng}
            />
            <LimitModal open={limitModalOpen} onOpenChange={() => setLimitModalOpen(false)} />
        </div>
    );
}
