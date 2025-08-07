import { loadSvgMasktemplate } from '@/lib/create-product';
import { handleAddText, handleUploadFile } from '@/lib/editor';
import { PartLayer } from '@/types/createProduct';
import { AllowedPermission, LogoCategory, Part, PartCategroyWithPart } from '@/types/data';
import { CanvasItem } from '@/types/editor';
import { Template } from '@/types/helper';
import { useEffect, useRef, useState } from 'react';
import CreateProductCanvas from './product-canvas';
import { CreateProductSidebar } from './product-sidebar';

type Props = {
    template: Template;
    logoGallery: LogoCategory[];
    permissions: AllowedPermission;
    parts: PartCategroyWithPart[];
};

export default function CreateProductEditor({ template, logoGallery, permissions, parts }: Props) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const svgContainerRef = useRef<HTMLDivElement | null>(null);
    const downloadRef = useRef<HTMLDivElement | null>(null);
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [uploadedItems, setUploadedItems] = useState<CanvasItem[]>([]);
    const [uploadedPart, setUploadedPart] = useState<PartLayer[]>([]);

    const UploadFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        handleUploadFile(event, setUploadedItems);
    };

    const handleResetCanvas = () => {
        setUploadedItems([]);
        loadSvgMasktemplate(template);
    };

    const AddText = () => {
        handleAddText(setUploadedItems);
    };

    const AddPart = ({ part }: { part: Part }) => {
        setUploadedPart((prevParts) => {
            // ✅ Remove any part with the same category_id from state
            const filtered = prevParts.filter((p) => p.category_id !== String(part.parts_category_id));

            const imageUrl = `${window.location.origin}/storage/${part.path}`; // ✅ Ensure full URL

            const id = typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36);

            const newPart: PartLayer = {
                id: id,
                name: part.name,
                color: '#000000',
                zIndex: 10,
                category_id: String(part.parts_category_id),
                path: imageUrl, // ✅ Use normalized full URL
            };

            return [...filtered, newPart];
        });
    };

    useEffect(() => {
        loadSvgMasktemplate(template);
    }, [template]);

    return (
        <main className="flex flex-col p-2 lg:flex-row">
            <div className="order-1 flex-1 p-4 lg:order-2">
                <CreateProductCanvas
                    downloadRef={downloadRef}
                    svgContainerRef={svgContainerRef}
                    fileInputRef={fileInputRef}
                    // handleSvgContainerClick={handleSvgContainerClick}
                    handleUploadChange={UploadFile}
                    uploadedItems={uploadedItems}
                    setUploadedItems={setUploadedItems}
                    selectedItemId={selectedItemId}
                    setSelectedItemId={setSelectedItemId}
                    uploadedPart={uploadedPart}
                />
            </div>

            <div className="order-2 w-full p-4 lg:order-1 lg:w-1/3 lg:p-0 xl:w-1/4">
                <CreateProductSidebar
                    uploadedItems={uploadedItems}
                    setUploadedItems={setUploadedItems}
                    logoGallery={logoGallery}
                    fileInputRef={fileInputRef}
                    handleResetCanvas={handleResetCanvas}
                    AddText={AddText}
                    selectedItemId={selectedItemId}
                    Allowedpermissions={permissions}
                    uploadedPart={uploadedPart}
                    setUploadedPart={setUploadedPart}
                    parts={parts}
                    addPart={AddPart}
                />
            </div>
        </main>
    );
}
