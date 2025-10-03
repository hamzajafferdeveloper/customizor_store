import ConfirmDialog from '@/components/confirm-dialog';
import { Button } from '@/components/ui/button';
import { isLightColor } from '@/lib/utils';
import { SharedData } from '@/types';
import { Product } from '@/types/data';
import { StoreData } from '@/types/store';
import { Link, router } from '@inertiajs/react';
import { Crown, Layers, Link2, Pen, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';

const SingleProductSection = ({
    product,
    auth,
    store,
    page_type,
}: {
    product: Product;
    auth: SharedData['auth'];
    store?: StoreData;
    page_type: string;
}) => {
    const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
    let parsedSizes: string[] = [];
    let parsedMaterials: string[] = [];
    try {
        parsedSizes = typeof product.sizes === 'string' ? JSON.parse(product.sizes) : product.sizes;
    } catch {
        console.error('Invalid sizes format');
    }

    try {
        parsedMaterials = typeof product.materials === 'string' ? JSON.parse(product.materials) : product.materials;
    } catch {
        console.error('Invalid materials format');
    }
    const handleDelete = () => {
        if (store) {
            if (auth?.user?.id === product.user_id) {
                router.delete(route('store.product.delete', { storeId: store.id, id: product.id }));
            } else {
                toast.error('You are not authorized to delete this product.');
                setConfirmOpen(false);
            }
        } else {
            router.delete(route('superadmin.product.destroy', product.id));
            setConfirmOpen(false);
        }
    };

    const isAdmin = auth?.user?.type === 'admin';

    return (
        <div>
            <div className="flex sm:justify-end -mt-4  sm:-mt-14 md:-mt-12 space-y-1 border-b p-3 ">
                <div className="flex cursor-pointer items-center gap-2 px-4">
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                        alt="WhatsApp"
                        className="h-7 w-7"
                        onClick={() => {
                            const url = `https://wa.me/?text=${encodeURIComponent(
                                `Check out this product: ${product.title.toUpperCase()} - ${window.location.href}`,
                            )}`;
                            window.open(url, '_blank');
                        }}
                    />
                    <Link2
                        className="h-5 w-5"
                        onClick={() => {
                            navigator.clipboard.writeText(window.location.href).then(
                                () => {
                                    toast.success('Link copied!');
                                },
                                () => {
                                    toast.error('Failed to copy the link!');
                                },
                            );
                        }}
                    />
                    {/* Store owner has priority over admin */}
                    {store?.id === product.store_id ? (
                        <>
                            {/* Edit Product */}

                            <Link href={route('store.product.edit', { storeId: store.id, slug: product.slug })}>
                                <Pen className="h-5 w-5" />
                            </Link>

                            {/* Delete Product */}
                            <Trash2 className="h-5 w-5 text-red-500" onClick={() => setConfirmOpen(true)} />

                            {/* Add / Edit Template */}
                            {!product.template ? (
                                <Link href={route('store.product.add.template', { storeId: store.id, slug: product.slug })}>
                                    <Layers className="h-5 w-5" />
                                </Link>
                            ) : (
                                <Link href={route('store.product.edit.template', { storeId: store.id, id: product.template.id })}>
                                    <Layers className="h-5 w-5" />
                                </Link>
                            )}
                        </>
                    ) : auth?.user?.type === 'admin' ? (
                        <>
                            {/* Edit Product */}
                            <Link href={route('superadmin.product.edit', product.slug)}>
                                <Pen className="h-5 w-5" />
                            </Link>

                            {/* Delete Product */}
                            <Trash2 className="h-5 w-5 text-red-500" onClick={() => setConfirmOpen(true)} />

                            {/* Add / Edit Template */}
                            {!product.template ? (
                                <Link href={route('superadmin.product.add.template', product.slug)}>
                                    <Layers className="h-5 w-5" />
                                </Link>
                            ) : (
                                <Link href={route('superadmin.product.edit.template', { id: product.template.id })}>
                                    <Layers className="h-5 w-5" />
                                </Link>
                            )}
                        </>
                    ) : null}
                </div>
            </div>
            <div className="lg:flex">
                <div className="flex lg:w-1/2">
                    <img src={`/storage/${product.image}`} className="max-h-screen" />
                </div>
                <div className="ml-10 space-y-2 p-5 lg:mr-0 lg:p-10 xl:p-14">
                    <h1 className="text-5xl font-bold">{product.title}</h1>
                    <p className="text-xs">SKU: {product.sku}</p>
                    <div className="gap-2 space-y-2 sm:flex sm:space-y-0">
                        <p className="w-fit rounded-full border-2 p-3 text-sm shadow-2xs">
                            Product Type: <b>{product.type}</b>{' '}
                        </p>
                        <p className="w-fit rounded-full border-2 p-3 text-sm shadow-2xs">
                            Product Price: <b>{product.price}</b>{' '}
                        </p>
                    </div>
                    <p className="pl-3 text-sm">Color:</p>
                    <div className="flex flex-wrap gap-2">
                        <div className="flex flex-wrap gap-2">
                            {product.product_colors.map((color) => {
                                const bg = color.color.hexCode;
                                const textColor = isLightColor(bg) ? 'text-black' : 'text-white';

                                return (
                                    <div
                                        key={color.id}
                                        className={`cursor-pointer rounded-full px-4 py-2 shadow-2xl ${textColor}`}
                                        style={{ backgroundColor: bg }}
                                    >
                                        {color.color.name}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <p className="pl-3 text-sm">Size:</p>
                    <div className="flex flex-wrap gap-2">
                        {parsedSizes.map((size: string, index: number) => (
                            <div
                                key={index}
                                className="cursor-pointer rounded-full border-2 px-4 py-2 shadow-orange-500 hover:bg-gray-200/80 dark:hover:bg-gray-200/10"
                            >
                                {size}
                            </div>
                        ))}
                    </div>

                    <p className="pl-3 text-sm">Material:</p>
                    <div className="flex flex-wrap gap-2">
                        {parsedMaterials.map((material: string, index: number) => (
                            <div
                                key={index}
                                className="cursor-pointer rounded-full border-2 px-4 py-2 shadow-orange-500 hover:bg-gray-200/80 dark:hover:bg-gray-200/10"
                            >
                                {material}
                            </div>
                        ))}
                    </div>
                    {product.template && (
                        <Link
                            // @ts-ignore
                            href={
                                page_type === 'home'
                                    ? (product.type === 'simple' || isAdmin) && route('customizer', product.template.id)
                                    : page_type === 'store' && route('store.product.customizer', { storeId: store?.id, id: product.template.id })
                            }
                        >
                            <Button
                                className={`relative flex w-full items-center justify-center gap-2 ${
                                    page_type === 'home' && product.type !== 'simple' && (!auth?.user || auth?.user?.type === 'user')
                                        ? 'pointer-events-none opacity-50'
                                        : 'cursor-pointer'
                                }`}
                            >
                                {page_type === 'home' && product.type !== 'simple' && (
                                    <>
                                        {!auth?.user ? (
                                            <span className="absolute left-3 flex items-center">
                                                <Crown className="h-4 w-4" />
                                            </span>
                                        ) : (
                                            auth &&
                                            auth?.user?.type === 'user' && (
                                                <span className="absolute left-3 flex items-center">
                                                    <Crown className="h-4 w-4" />
                                                </span>
                                            )
                                        )}
                                    </>
                                )}
                                <span className="ml-6">Customize</span>
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="Delete Category"
                description={`Are you sure you want to delete "${product.title}"?`}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={handleDelete}
            />
        </div>
    );
};

export default SingleProductSection;
