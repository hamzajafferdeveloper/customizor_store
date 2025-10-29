import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CategoryForm } from '@/types/form';
import { useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

type Props = {
    open: boolean;
    onOpenChange: () => void;
};

export default function CreateProductTpyeModal({ open, onOpenChange }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('superadmin.product-type.store'));
        onOpenChange()
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Product Tpye</DialogTitle>
                    <DialogDescription>Enter details. Then Click Save.</DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="grid gap-2">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Product Type Name</Label>
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
