import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Category } from '@/types/data';
import { CreateOwnProductForm } from '@/types/form';
import { useForm } from '@inertiajs/react';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categories: Category[];
};

const CreateOwnProductModal = ({ open, onOpenChange, categories }: Props) => {


    const { data, setData, post, processing, errors, reset } = useForm<Required<CreateOwnProductForm>>({
        category_id: 0,
        image: null,
    });



    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('superadmin.create-your-own-product.store'), {
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
                    <DialogTitle>Create Own Product</DialogTitle>
                    <DialogDescription>Select name and category, then upload image. Finally, click Save.</DialogDescription>
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
                        <Label htmlFor="image">Image</Label>
                        <Input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={(e) => setData('image', e.target.files ? e.target.files[0] : null)}
                        />
                        <InputError message={errors.image} />
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
                            {processing ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateOwnProductModal;
