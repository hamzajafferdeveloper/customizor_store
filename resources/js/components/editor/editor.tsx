import { handleAddText, handleClickonSvgContainer, handlePaintPart, handleUploadFile, loadSvgtemplate } from '@/lib/editor';
import { SharedData } from '@/types';
import { AllowedPermission, LogoCategory } from '@/types/data';
import { CanvasItem } from '@/types/editor';
import { Template, TemplatePart } from '@/types/helper';
import { usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { useSidebar } from '../ui/sidebar';
import EditorCanvas from './editor-canvas';
import { EditorSidebar } from './editor-sidebar';

type Props = {
    template: Template;
    logoGallery: LogoCategory[];
    permissions: AllowedPermission;
};

export default function Editor({ template, logoGallery, permissions }: Props) {
    const { toggleSidebar } = useSidebar();
    const sharedData = usePage<SharedData>();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const svgContainerRef = useRef<HTMLDivElement | null>(null);
    const downloadRef = useRef<HTMLDivElement | null>(null);
    const [openColorMenu, setOpenColorMenu] = useState<string>('');
    const [parts, setParts] = useState<TemplatePart[]>([]);
    const [uploadedItems, setUploadedItems] = useState<CanvasItem[]>([]);
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

    const handleSvgContainerClick = (event: React.MouseEvent<HTMLDivElement>) => {
        handleClickonSvgContainer(event, parts, setOpenColorMenu);
    };

    const paintPart = (part: TemplatePart, color: string) => {
        if (svgContainerRef.current) {
            handlePaintPart(part, color, svgContainerRef.current);
        }
    };

    const UploadFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        handleUploadFile(event, setUploadedItems);
    };

    const handleResetCanvas = () => {
        setUploadedItems([]);
        loadSvgtemplate(template, setParts);
    };

    const AddText = () => {
        handleAddText(setUploadedItems);
    };

    useEffect(() => {
        loadSvgtemplate(template, setParts);
    }, [template]);

    useEffect(() => {
        if (sharedData.props.sidebarOpen === true) {
            toggleSidebar();
        }
    }, []);

    return (
        <main className="flex flex-col p-2 lg:flex-row">
            <div className="flex-1 order-1 p-4 lg:order-2">
                <EditorCanvas
                    downloadRef={downloadRef}
                    svgContainerRef={svgContainerRef}
                    fileInputRef={fileInputRef}
                    handleSvgContainerClick={handleSvgContainerClick}
                    handleUploadChange={UploadFile}
                    uploadedItems={uploadedItems}
                    setUploadedItems={setUploadedItems}
                    selectedItemId={selectedItemId}
                    setSelectedItemId={setSelectedItemId}
                />
            </div>

            <div className="order-2 w-full p-4 lg:order-1 lg:w-1/3 lg:p-0 xl:w-1/4">
                <EditorSidebar
                    parts={parts}
                    openColorMenu={openColorMenu}
                    uploadedItems={uploadedItems}
                    setUploadedItems={setUploadedItems}
                    paintPart={paintPart}
                    logoGallery={logoGallery}
                    fileInputRef={fileInputRef}
                    handleResetCanvas={handleResetCanvas}
                    AddText={AddText}
                    selectedItemId={selectedItemId}
                    Allowedpermissions={permissions}
                />
            </div>
        </main>
    );
}
