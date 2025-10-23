import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Category, CreateOwnProductType } from '@/types/data';
import { CreateOwnProductForm } from '@/types/form';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categories: Category[];
    Copdata: CreateOwnProductType | null; // existing product when editing
};

const CreateOwnProductEditModal = ({ open, onOpenChange, categories, Copdata }: Props) => {
    const { data, setData, post, processing, errors, reset } = useForm<Required<CreateOwnProductForm>>({
        category_id: 0,
        image: null,
        template: null,
    });

    // Pre-fill form when product changes
    useEffect(() => {
        if (Copdata) {
            setData({
                category_id: Copdata.category_id,
                image: null, // don’t preload file input
                template: null,
            });
        }
    }, [Copdata]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data) return;

        post(route('superadmin.create-your-own-product.update', Copdata?.id), {
            onSuccess: () => {
                reset();
                onOpenChange(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Product</DialogTitle>
                    <DialogDescription>Update the category or image, then click Save.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Category Select */}
                    <div className="grid gap-2">
                        <Label htmlFor="category">Category</Label>
                        <Select
                            value={data.category_id ? String(data.category_id) : undefined}
                            onValueChange={(val) => setData('category_id', Number(val))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((category) => (
                                    <SelectItem key={category.id} value={String(category.id)}>
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.category_id} />
                    </div>

                    {/* Image Upload */}
                    <div className="grid gap-2">
                        <Label htmlFor="image">Replace Image (optional)</Label>
                        <Input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={(e) => setData('image', e.target.files ? e.target.files[0] : null)}
                        />
                        <InputError message={errors.image} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="template">Replace Template (optional)</Label>
                        <Input
                            id="template"
                            type="file"
                            accept="image/svg+xml"
                            onChange={(e) => setData('template', e.target.files ? e.target.files[0] : null)}
                        />

                        <InputError message={errors.template} />
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                reset();
                                onOpenChange(false);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Updating...' : 'Update'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateOwnProductEditModal;
