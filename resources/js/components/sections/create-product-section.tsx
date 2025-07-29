import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Category, Color } from '@/types/data';
import { ProductForm } from '@/types/form';
import { StoreData } from '@/types/store';
import { useForm } from '@inertiajs/react';
import { RabbitIcon, X } from 'lucide-react';
import { FormEventHandler, useRef, useState } from 'react';

const CreateProductSection = ({ catogories, colors, store }: { catogories: Category[]; colors: Color[]; store?: StoreData }) => {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement | null>(null);

    const { data, setData, post, processing, errors } = useForm<ProductForm>({
        title: '',
        sku: '',
        image: null,
        type: 'simple',
        sizes: [],
        materials: [],
        colors: [],
        categories_id: null,
        price: 0,
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('image', file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSelectFile = () => {
        fileRef.current?.click();
    };

    const toggleMultiSelect = (field: 'colors' | 'materials', value: string | number) => {
        const current = data[field] as Array<string | number>;
        const exists = current.includes(value);
        const updated = exists ? current.filter((v) => v !== value) : [...current, value];

        setData(field as keyof ProductForm, updated as never);
    };

    const handleRemoveImage = () => {
        setData('image', null);
        setImagePreview(null);
        if (fileRef.current) fileRef.current.value = '';
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (store) {
            post(route('store.product.store', store?.id), {
                forceFormData: true, // This will internally convert data to FormData (including file/array handling)
                onError: (err) => console.error(err), // optional for debugging
                onSuccess: () => console.log('Submitted successfully!'),
            });
        } else {
            post(route('superadmin.product.store'), {
                forceFormData: true, // This will internally convert data to FormData (including file/array handling)
                onError: (err) => console.error(err), // optional for debugging
                onSuccess: () => console.log('Submitted successfully!'),
            });
        }
    };
    
    return (
        <div className="flex flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
            <div className="relative h-fit flex-1 overflow-hidden rounded-xl lg:mt-5 lg:flex dark:border-sidebar-border">
                <div className="flex h-fit w-full justify-center lg:w-1/2">
                    <Card className="w-full max-w-xl">
                        <CardHeader className="text-center">
                            <CardTitle>Create new Product</CardTitle>
                            <CardDescription>Enter the details of the product to create a new one</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="title">Product Title</Label>
                                    <Input
                                        id="title"
                                        type="text"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="Cotton Shirt..."
                                        required
                                    />
                                    <InputError message={errors.title} />
                                </div>

                                <div className="flex gap-2">
                                    <div className="grid gap-2 w-1/2">
                                        <Label htmlFor="sku">Product SKU</Label>
                                        <Input
                                            id="sku"
                                            type="text"
                                            value={data.sku}
                                            onChange={(e) => setData('sku', e.target.value)}
                                            placeholder="SKU-LG-RD"
                                            required
                                        />
                                        <InputError message={errors.sku} />
                                    </div>
                                    <div className="grid gap-2 w-1/2">
                                        <Label htmlFor="sku">Product Price</Label>
                                        <Input
                                            id="sku"
                                            type="text"
                                            value={data.price}
                                            onChange={(e) => setData('price', e.target.value)}
                                            placeholder="100.00"
                                            required
                                        />
                                        <InputError message={errors.price} />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label>Category</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-start">
                                                {catogories.find((c) => c.id === data.categories_id)?.name || 'Select Category'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[300px] p-0">
                                            <Command>
                                                <CommandInput placeholder="Search category..." />
                                                <CommandList>
                                                    <CommandEmpty>No results found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {catogories.map((category) => (
                                                            <CommandItem key={category.id} onSelect={() => setData('categories_id', category.id)}>
                                                                {category.name}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <InputError message={errors.categories_id} />
                                </div>

                                <div className="grid gap-2">
                                    <Label>Colors</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <div className="max-w-lg rounded-md border">
                                                <div
                                                    className="w-full justify-start overflow-x-auto px-2 py-1 whitespace-nowrap"
                                                    style={{ display: 'flex', alignItems: 'center' }}
                                                >
                                                    {data.colors.length > 0 ? (
                                                        <div className="flex min-w-0 items-center gap-2">
                                                            {colors
                                                                .filter((col) => data.colors.includes(col.id))
                                                                .map((col) => (
                                                                    <div
                                                                        key={col.id}
                                                                        className="flex shrink-0 items-center gap-1 rounded-md border px-3 py-2"
                                                                    >
                                                                        <div
                                                                            className="h-4 w-4 rounded-full border"
                                                                            style={{ backgroundColor: col.hexCode }}
                                                                        />
                                                                        <span className="text-sm">{col.name}</span>
                                                                        <X
                                                                            className="ml-1 h-4 w-4 cursor-pointer opacity-50 hover:opacity-80"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation(); // Prevents triggering the popover
                                                                                setData(
                                                                                    'colors',
                                                                                    data.colors.filter((id) => id !== col.id),
                                                                                );
                                                                            }}
                                                                        />
                                                                    </div>
                                                                ))}
                                                        </div>
                                                    ) : (
                                                        'Select Colors'
                                                    )}
                                                </div>
                                            </div>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[300px] p-0">
                                            <Command>
                                                <CommandInput placeholder="Search colors..." />
                                                <CommandList>
                                                    <CommandEmpty>No results found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {colors.map((color) => (
                                                            <CommandItem key={color.id} onSelect={() => toggleMultiSelect('colors', color.id)}>
                                                                <div className="flex items-center gap-2">
                                                                    <div
                                                                        className="h-4 w-4 rounded-full border"
                                                                        style={{ backgroundColor: color.hexCode }}
                                                                    />
                                                                    {color.name}
                                                                    {data.colors.includes(color.id) && <X className="ml-auto h-4 w-4 opacity-50" />}
                                                                </div>
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <InputError message={errors.colors} />
                                </div>

                                {!store && (
                                    <div className="grid gap-2">
                                        <Label>Type</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-full justify-start">
                                                    {data.type ? data.type : 'Select Product Type'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[300px] p-0">
                                                <Command>
                                                    <CommandInput placeholder="Search category..." />
                                                    <CommandList>
                                                        <CommandEmpty>No results found.</CommandEmpty>
                                                        <CommandGroup>
                                                            <CommandItem onSelect={() => setData('type', 'simple')}>Simple</CommandItem>
                                                            <CommandItem onSelect={() => setData('type', 'starter')}>Starter</CommandItem>
                                                            <CommandItem onSelect={() => setData('type', 'pro')}>Pro</CommandItem>
                                                            <CommandItem onSelect={() => setData('type', 'ultra')}>Ultra</CommandItem>
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        <InputError message={errors.categories_id} />
                                    </div>
                                )}

                                {['materials', 'sizes'].map((field) => (
                                    <div key={field} className="grid gap-2">
                                        <Label>{field.charAt(0).toUpperCase() + field.slice(1)}</Label>
                                        <Input
                                            placeholder={`Enter ${field}, comma separated`}
                                            value={(data as any)[field].join(', ')}
                                            onChange={(e) =>
                                                setData(
                                                    field as keyof ProductForm,
                                                    e.target.value.split(',').map((item: string) => item.trim()),
                                                )
                                            }
                                        />
                                        <InputError message={(errors as any)[field]} />
                                    </div>
                                ))}

                                <div className="grid gap-2">
                                    <Label htmlFor="image">Product Image</Label>
                                    <Input id="image" type="file" ref={fileRef} accept="image/*" onChange={handleImageChange} required />
                                    <InputError message={errors.image} />
                                </div>

                                <Button type="submit" className="mt-4 w-full" disabled={processing}>
                                    Create
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
                <div className="flex w-full items-center lg:w-1/2">
                    {imagePreview ? (
                        <div className="group relative mt-2 flex justify-center">
                            <div className="relative w-full max-w-xl lg:max-w-md xl:max-w-xl">
                                <img src={imagePreview} alt="Preview" className="w-full object-cover" />
                                <X
                                    className="absolute top-2 right-2 z-20 hidden cursor-pointer text-red-500 group-hover:block"
                                    onClick={handleRemoveImage}
                                />
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Hidden File Input */}
                            <input type="file" ref={fileRef} accept="image/*" onChange={handleImageChange} className="hidden" />

                            {/* Clickable Placeholder */}
                            <div className="mx-auto mt-2 cursor-pointer text-center text-gray-500/40" onClick={handleSelectFile}>
                                <RabbitIcon className="h-60 w-60" />
                                <p>No File Selected. Please select file</p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateProductSection;
