import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Category } from '@/types/data';
import { CategoryForm } from '@/types/form';
import { useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

type Props = {
    open: boolean;
    onOpenChange: () => void;
    selectedBrands: Category;
};

export default function EditBrandModal({ open, onOpenChange, selectedBrands }: Props) {
    const { data, setData, put, processing, errors, reset } = useForm<Required<CategoryForm>>({
        name: selectedBrands.name,
        slug_short: selectedBrands.slug_short,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('superadmin.brand.update', selectedBrands.id));
        onOpenChange();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Brand</DialogTitle>
                    <DialogDescription>Enter detail below. Then Click Save.</DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="grid gap-2">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Brand Name</Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Suit, Gloves etc"
                        />
                        <InputError message={errors.name} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="name">Short Slug</Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            tabIndex={1}
                            autoComplete="slug_short"
                            value={data.slug_short}
                            onChange={(e) => setData('slug_short', e.target.value)}
                            placeholder="ST, GV etc"
                        />
                        <InputError message={errors.name} />
                    </div>
                    <DialogFooter>
                        <Button className="w-full cursor-pointer" type="submit" tabIndex={2} disabled={processing}>
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            Save
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
