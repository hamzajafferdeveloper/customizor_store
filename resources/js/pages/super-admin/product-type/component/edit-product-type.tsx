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
    selectedProductTpye: Category;
};

export default function EditProductTpyeModal({ open, onOpenChange, selectedProductTpye }: Props) {
    const { data, setData, put, processing, errors, reset } = useForm({
        name: selectedProductTpye.name,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('superadmin.product-type.update', selectedProductTpye.id));
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
                        <Label htmlFor="name">Product Tpye Name</Label>
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
