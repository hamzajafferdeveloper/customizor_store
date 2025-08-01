import { useEffect, useRef, useState } from 'react';
import {handleAddText, handleClickonSvgContainer, handlePaintPart, handleUploadFile, loadSvgtemplate} from '@/lib/editor';
import { Template, TemplatePart } from '@/types/helper';
import EditorCanvas from './editor-canvas';
import { EditorSidebar } from './editor-sidebar';
import { CanvasItem } from '@/types/editor';
import { AllowedPermission, LogoCategory } from "@/types/data";

type Props = {
  template: Template;
    logoGallery: LogoCategory[]
    permissions: AllowedPermission
};

export default function Editor({ template, logoGallery, permissions }: Props) {
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

  return (
    <main className="flex flex-col p-2 lg:flex-row">
      <div className="order-1 flex-1 p-4 lg:order-2">
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

      <div className="order-2 w-full lg:order-1 p-4 lg:p-0 lg:w-1/3 xl:w-1/4">
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
