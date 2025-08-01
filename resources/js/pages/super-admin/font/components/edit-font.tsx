import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Font } from '@/types/data';
import { useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

type Props = {
    open: boolean;
    onOpenChange: () => void;
    selectedFont: Font;
};

export default function EditFontModal({ open, onOpenChange, selectedFont }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: selectedFont.name,
        source: null as unknown as File | string, // file or SVG string
    });

    const [fileInput, setFileInput] = useState<File | null>(null);

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', data.name);
        if (fileInput) {
            formData.append('path', fileInput);
        }

        post(route('superadmin.fonts.update', selectedFont.id), {
            // @ts-expect-error
            data: formData,
            forceFormData: true,
            onSuccess: () => {
                reset();
                onOpenChange();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Font</DialogTitle>
                    <DialogDescription>Update the font name and upload an font file.</DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Logo Name</Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g. Company Logo"
                        />
                        <InputError message={errors.name} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="source">Upload File (.ttf, .woff)</Label>
                        <Input
                            id="source"
                            type="file"
                            accept=".ttf,.woff"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    setFileInput(file);
                                    setData('source', file); // Temporary, updated in submit
                                }
                            }}
                        />
                        <InputError message={errors.source} />
                    </div>
                    <DialogFooter>
                        <Button className="w-full" type="submit" disabled={processing}>
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Save
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
