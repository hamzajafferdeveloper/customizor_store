import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CanvasItem } from '@/types/editor';
import { Download, Image, Layers, RotateCcw, Type, Upload } from 'lucide-react';
import { RefObject, useState } from 'react';
import ConfirmDialog from '../confirm-dialog';
import EditorDownload from '../editor/editor-download';
import LimitModal from '../editor/limit-modal';

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

export default function CommonSideBarIcons({
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
        <div className="flex flex-row w-full justify-evenly lg:flex-col">
            <Layers
                className={`w-8 h-8 p-2 lg:w-10 lg:h-10 lg:p-3 cursor-pointer rounded-md  transition-all duration-500 ${showBar === 'layerbar' ? 'bg-gray-200/90 dark:bg-gray-200/20' : 'hover:bg-gray-200/90 dark:hover:bg-gray-200/20'}`}
                onClick={() => setShowBar('layerbar')}
            />
            <Type
                className={`w-8 h-8 p-2 lg:w-10 lg:h-10 lg:p-3 cursor-pointer rounded-md  transition-all duration-500 ${showBar === 'textbar' ? 'bg-gray-200/90 dark:bg-gray-200/20' : 'hover:bg-gray-200/90 dark:hover:bg-gray-200/20'}`}
                onClick={() => setShowBar('textbar')}
            />
            <Image
                className={`w-8 h-8 p-2 lg:w-10 lg:h-10 lg:p-3 cursor-pointer rounded-md  transition-all duration-500 ${showBar === 'logobar' ? 'bg-gray-200/90 dark:bg-gray-200/20' : 'hover:bg-gray-200/90 dark:hover:bg-gray-200/20'}`}
                onClick={() => setShowBar('logobar')}
            />

            {/* Download Canvas Button */}
            <Tooltip>
                <TooltipTrigger>
                    <div onClick={() => setOpenDownloadDialogBox(true)}>
                        <Download className="w-8 h-8 p-2 rounded-md cursor-pointer lg:w-10 lg:h-10 lg:p-3 hover:bg-gray-200/90 dark:hover:bg-gray-200/20" />
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
                        <Upload className="w-8 h-8 p-2 rounded-md cursor-pointer lg:w-10 lg:h-10 lg:p-3 hover:bg-gray-200/90 dark:hover:bg-gray-200/20" />
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
                        <RotateCcw className="w-8 h-8 p-2 rounded-md cursor-pointer lg:w-10 lg:h-10 lg:p-3 hover:bg-gray-200/90 dark:hover:bg-gray-200/20" />
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
