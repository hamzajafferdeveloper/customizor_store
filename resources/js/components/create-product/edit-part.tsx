import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PartLayer } from '@/types/createProduct';
import { useEffect, useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Button } from '@/components/ui/button';
import { recolorImage } from '@/lib/create-product';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    part: PartLayer;
    onUpdateColor: (id: string, color: string, newImage: string) => void;
};

const EditPart = ({ open, onOpenChange, part, onUpdateColor }: Props) => {
    const [selectedColor, setSelectedColor] = useState(part.color || '#000000');
    const [previewImage, setPreviewImage] = useState(part.path);

    // Reset when modal opens
    useEffect(() => {
        if (open) {
            setSelectedColor(part.color || '#000000');
            setPreviewImage(part.path);
        }
    }, [open, part]);

    const handleColorChange = async (color: string) => {
        setSelectedColor(color);

        // Generate live preview image
        const updatedImage = await recolorImage(part.path, color);
        setPreviewImage(updatedImage);
    };

    const handleSave = () => {
        // Commit the change to parent
        onUpdateColor(part.id, selectedColor, previewImage);
        onOpenChange(false); // Close modal
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Change Part Color</DialogTitle>
                    <DialogDescription>Pick a color for this part below.</DialogDescription>
                </DialogHeader>

                <div className="mt-4 flex flex-col items-center gap-4">
                    {/* ✅ Preview */}
                    <div className="relative flex h-32 w-32 items-center justify-center rounded-md border bg-gray-100">
                        <img src={previewImage} alt={part.name} className="max-h-full max-w-full" />
                    </div>

                    {/* ✅ Color Picker */}
                    <HexColorPicker color={selectedColor} onChange={handleColorChange} />
                </div>

                {/* ✅ Footer with Save button */}
                <div className="mt-6 flex justify-end gap-3">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave}>Save</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};


export default EditPart;
