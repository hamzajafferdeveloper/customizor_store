import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ColorForm } from '@/types/form';
import { useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useRef, useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { useClickAway } from 'react-use';

type Props = {
    open: boolean;
    onOpenChange: () => void;
};

export default function CreateColorModal({ open, onOpenChange }: Props) {
    const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
    const pickerRef = useRef<HTMLDivElement>(null);

    const { data, setData, post, processing, errors, reset } = useForm<Required<ColorForm>>({
        name: '',
        hexCode: '#aabbcc',
        color_type: 'protection',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('superadmin.color.store'));
        onOpenChange();
    };

    // Close picker on outside click
    useClickAway(pickerRef, () => setShowColorPicker(false));

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Color</DialogTitle>
                    <DialogDescription>Enter Name and Select Color. Then Click Save.</DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="relative grid gap-4">
                    {/* Color Name */}
                    <div className="grid gap-2">
                        <Label htmlFor="name">Color Name</Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Red, Blue etc"
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="name">Color Type</Label>
                        <Select defaultValue={data.color_type} onValueChange={(val) => setData('color_type', val as 'protection' | 'leather')}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={data.color_type} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem className="cursor-pointer" value="protection">
                                    Protection
                                </SelectItem>
                                <SelectItem className="cursor-pointer" value="leather">
                                    Leather
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={errors.color_type} />
                    </div>

                    {/* Hex Code + Picker */}
                    <div className="grid gap-2">
                        <Label htmlFor="hexCode">Color Code</Label>
                        <div className="relative flex items-center gap-2">
                            <div
                                className="h-8 w-8 cursor-pointer rounded-md border"
                                style={{ backgroundColor: data.hexCode }}
                                onClick={() => setShowColorPicker(true)}
                            />
                            <Input
                                id="hexCode"
                                type="text"
                                required
                                tabIndex={2}
                                autoComplete="hexCode"
                                value={data.hexCode}
                                onChange={(e) => setData('hexCode', e.target.value)}
                                placeholder="#aabbcc"
                            />
                        </div>
                        <InputError message={errors.hexCode} />

                        {showColorPicker && (
                            <div ref={pickerRef} className="absolute top-full left-0 z-50 mt-2 rounded-md border bg-white p-2 shadow-lg">
                                <HexColorPicker color={data.hexCode} onChange={(color) => setData('hexCode', color)} />
                            </div>
                        )}
                    </div>

                    {/* Save Button */}
                    <DialogFooter>
                        <Button className="w-full cursor-pointer" type="submit" tabIndex={3} disabled={processing}>
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Save
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
