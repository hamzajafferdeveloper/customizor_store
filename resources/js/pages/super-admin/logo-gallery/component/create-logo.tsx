import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogoForm } from '@/types/form';
import { useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

type Props = {
    open: boolean;
    onOpenChange: () => void;
    categoryId: number;
};

export default function CreateLogoModal({ open, onOpenChange, categoryId }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LogoForm>>({
        category_id: categoryId,
        name: '',
        source: null as unknown as File | string, // file or SVG string
    });

    const [fileInput, setFileInput] = useState<File | null>(null);

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();

        if (!fileInput) return;

        const isSvg = fileInput.type === 'image/svg+xml';

        if (isSvg) {
            const reader = new FileReader();
            reader.onload = () => {
                const svgContent = reader.result as string;
                post(route('superadmin.logo.gallery.create'), {
                    // @ts-expect-error
                    data: {
                        name: data.name,
                        category_id: categoryId,
                        source: svgContent,
                    },
                    onSuccess: () => {
                        reset();
                        onOpenChange();
                    },
                });
            };
            reader.readAsText(fileInput);
        } else {
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('category_id', String(categoryId));
            formData.append('source', fileInput);

            post(route('superadmin.logo.gallery.create'), {
                // @ts-expect-error
                data: formData,
                forceFormData: true,
                onSuccess: () => {
                    reset();
                    onOpenChange();
                },
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Logo</DialogTitle>
                    <DialogDescription>
                        Enter the logo name and upload an SVG or image file.
                    </DialogDescription>
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
                        <Label htmlFor="source">Upload File (SVG, PNG, etc.)</Label>
                        <Input
                            id="source"
                            type="file"
                            required
                            accept=".svg,.png,.jpg,.jpeg,.gif,.webp"
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
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                            Save
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
