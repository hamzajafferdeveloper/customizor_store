import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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

export default function CreatePartModal({ open, onOpenChange, categoryId }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LogoForm>>({
        category_id: categoryId,
        name: '',
        source: null as unknown as File | string, // file or SVG string
    });

    const [fileInput, setFileInput] = useState<File | null>(null);

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();

        if (!fileInput) return;

        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('category_id', String(categoryId));
        formData.append('source', fileInput);

        post(route('superadmin.parts.create', categoryId), {
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
                    <DialogTitle>Create Part</DialogTitle>
                    <DialogDescription>Enter the part name and upload an image file.</DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Part Name</Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g. Part Name"
                        />
                        <InputError message={errors.name} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="source">Upload File</Label>
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
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Save
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
