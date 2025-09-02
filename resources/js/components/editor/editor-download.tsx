import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { eventBus } from '@/lib/event-bus'; // ✅ Global Event Bus
import { Crown } from 'lucide-react';
import { use, useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    downlaodpng: boolean;
    downloadsvg: boolean;
};

const EditorDownload = ({ open, onOpenChange, downlaodpng, downloadsvg }: Props) => {
    const [name, setName] = useState<string>('custom-design');
    const [format, setFormat] = useState<'png' | 'svg'>('png');

    const handleDownload = () => {
        if (!name.trim()) return alert('Please enter a file name');

        // ✅ Dispatch global event
        eventBus.dispatchEvent(
            new CustomEvent('download', {
                detail: { name, format }, // Pass name and format
            }),
        );

        onOpenChange(false); // Close dialog
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Download File</DialogTitle>
                    <DialogDescription>Enter the name of file, then select a format.</DialogDescription>
                    <div className="mt-3 flex flex-col gap-3">
                        {/* ✅ File Name Input */}
                        <Input placeholder="Enter file name..." value={name} onChange={(e) => setName(e.target.value)} />

                        {/* ✅ Format Selection */}
                        <div className="flex w-full gap-2">
                            <div className="relative w-1/2">
                                <Button
                                    className={`w-full border-2 ${format === 'png' ? 'border-indigo-500 bg-indigo-100' : ''} ${downlaodpng ? '' : 'pointer-events-none opacity-50'}`}
                                    variant="ghost"
                                    onClick={() => setFormat('png')}
                                >
                                    PNG
                                </Button>
                                {!downlaodpng && (
                                    <Crown className="absolute -top-2 -right-2 h-4 w-4 rotate-[45deg] text-orange-500" strokeWidth={2} />
                                )}
                            </div>
                            <div className="relative w-1/2">
                                <Button
                                    className={`w-full border-2 ${format === 'svg' ? 'border-indigo-500 bg-indigo-100' : ''} ${downloadsvg ? '' : 'pointer-events-none opacity-85'}`}
                                    variant="ghost"
                                    onClick={() => setFormat('svg')}
                                >
                                    SVG
                                </Button>
                                {!downloadsvg && (
                                    <Crown className="absolute -top-2 -right-2 h-4 w-4 rotate-[45deg] text-orange-500" strokeWidth={2} />
                                )}
                            </div>
                        </div>

                        {/* ✅ Actions */}
                        <div className="flex w-full gap-2">
                            <Button className="w-1/2 border-2" variant="ghost" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button
                                className={`w-1/2 ${downloadsvg && downlaodpng ? '' : 'pointer-events-none opacity-50'}`}
                                onClick={handleDownload}
                            >
                                Download
                            </Button>
                        </div>
                    </div>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
};

export default EditorDownload;
