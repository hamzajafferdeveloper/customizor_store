import { leatherColors, protectionColors } from '@/constant/editorcolor';
import { SharedData } from '@/types';
import { PartLayer } from '@/types/createProduct';
import { AllowedPermission, LogoCategory, Part, PartCategroyWithPart } from '@/types/data';
import { CanvasItem } from '@/types/editor';
import { SvgColorBar } from '@/types/helper';
import { usePage } from '@inertiajs/react';
import { RefObject, useState } from 'react';
import EditorLogoBar from '../editor/editor-logobar';
import EditorTextBar from '../editor/editor-textbar';
import ProductLayerBar from './product-layerbar';
import PartsBar from './product-part-bar';
import ProductSidebarIcons from './product-sidebar-icon';

type Props = {
    fileInputRef: RefObject<HTMLInputElement | null>;
    logoGallery: LogoCategory[];
    setUploadedItems: React.Dispatch<React.SetStateAction<CanvasItem[]>>;
    uploadedItems: CanvasItem[];
    handleResetCanvas: () => void;
    AddText: () => void;
    selectedItemId: string | null;
    Allowedpermissions: AllowedPermission;
    uploadedPart: PartLayer[];
    parts: PartCategroyWithPart[];
    setUploadedPart: React.Dispatch<React.SetStateAction<PartLayer[]>>;
    addPart: ({ part }: { part: Part }) => void;
};

export function CreateProductSidebar({
    fileInputRef,
    logoGallery,
    setUploadedItems,
    uploadedItems,
    handleResetCanvas,
    AddText,
    selectedItemId,
    Allowedpermissions,
    uploadedPart,
    setUploadedPart,
    parts,
    addPart,
}: Props) {
    const { auth } = usePage<SharedData>().props;

    const [showBar, setShowBar] = useState<'layerbar' | 'textbar' | 'logobar' | 'partsbar'>('textbar');

    // ✅ Check if user is admin
    const isAdmin = auth?.user?.type === 'admin';

    // ✅ Function to get permission or fallback for admin
    const getPermission = (key: string) => {
        if (isAdmin) return { is_enabled: true, limit: 'unlimited' };
        const permission = Allowedpermissions.permissions.find((p) => p.key === key);
        return {
            is_enabled: permission?.pivot?.is_enabled || false,
            limit: permission?.pivot?.limit || null,
        };
    };

    // ✅ Text Limit
    const textPermission = getPermission('text');
    const TextLimit: number | string = textPermission.is_enabled ? textPermission.limit || 'unlimited' : 0;

    // ✅ Image Limit
    const imagePermission = getPermission('image');
    const ImageLimit: number | string = imagePermission.is_enabled ? imagePermission.limit || 'unlimited' : 0;

    // ✅ Logo Gallery Show
    const ShowLogoGallery: boolean = getPermission('logo_gallery_show').is_enabled;

    // ✅ Use Logo Gallery
    const UseLogoGallery: boolean = getPermission('logo_gallery').is_enabled;

    // ✅ Change Layer Color
    const ChageLayerColor: boolean = getPermission('layer_color').is_enabled;

    // ✅ Download SVG
    const DownloadSVG: boolean = getPermission('download_svg').is_enabled;

    // ✅ Download PNG
    const DownloadPNG: boolean = getPermission('download_png').is_enabled;

    const color: SvgColorBar = {
        leatherColors: leatherColors,
        protectionColors: protectionColors,
    };

    return (
        <aside className="mt-2 h-full w-full space-y-2 lg:flex">
            <div className="h-fit rounded-md border shadow">
                {/* Icons Bar */}
                <ProductSidebarIcons
                    showBar={showBar}
                    setShowBar={setShowBar}
                    fileInputRef={fileInputRef}
                    handleResetCanvas={handleResetCanvas}
                    uploadedItems={uploadedItems}
                    downloadsvg={DownloadSVG}
                    downlaodpng={DownloadPNG}
                    imageuploadLimit={ImageLimit}
                />
            </div>

            {showBar === 'partsbar' ? (
                <div className="z-30 flex h-[70vh] w-full flex-col overflow-y-auto rounded-md border shadow-2xl lg:ml-2">
                    <p className="w-full shrink-0 p-3 text-center text-2xl font-semibold">Add Parts</p>

                    {/* Make EditorLayerBar grow + scroll if it overflows */}
                    <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
                        <PartsBar parts={parts} addPart={addPart} />
                    </div>
                </div>
            ) : showBar === 'layerbar' ? (
                <div className="z-30 flex h-[70vh] w-full flex-col overflow-y-auto rounded-md border shadow-2xl lg:ml-2">
                    <p className="w-full shrink-0 p-3 text-center text-2xl font-semibold">All added Layer</p>

                    {/* Make EditorLayerBar grow + scroll if it overflows */}
                    <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
                        <ProductLayerBar
                            uploadedItems={uploadedItems}
                            uploadedPart={uploadedPart}
                            setUploadedItems={setUploadedItems}
                            setUploadedPart={setUploadedPart}
                        />
                    </div>
                </div>
            ) : showBar === 'logobar' ? (
                <div className="z-30 flex h-[70vh] w-full flex-col overflow-y-auto rounded-md border shadow-2xl lg:ml-2">
                    <p className="w-full shrink-0 p-3 text-center text-2xl font-semibold">Logo Gallery</p>

                    {/* Make EditorLogoBar grow + scroll if it overflows */}
                    <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
                        <EditorLogoBar
                            logoGallery={logoGallery}
                            setUploadedItems={setUploadedItems}
                            showLogo={ShowLogoGallery}
                            useLogo={UseLogoGallery}
                        />
                    </div>
                </div>
            ) : (
                showBar === 'textbar' && (
                    <div className="z-30 flex h-[70vh] w-full flex-col overflow-y-auto rounded-md border shadow-2xl lg:ml-2">
                        <p className="w-full shrink-0 p-3 text-center text-2xl font-semibold">Text Settings</p>

                        {/* Make EditorColorBar grow + scroll if it overflows */}
                        <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
                            <EditorTextBar
                                AddText={AddText}
                                selectedItemId={selectedItemId}
                                uploadedItems={uploadedItems}
                                allowedfonts={Allowedpermissions.fonts}
                                limit={TextLimit}
                                onUpdateTextLayer={(id, updates) => {
                                    setUploadedItems((items) =>
                                        items.map((item) => (item.id === id && item.type === 'text' ? { ...item, ...updates } : item)),
                                    );
                                }}
                            />
                        </div>
                    </div>
                )
            )}
        </aside>
    );
}
