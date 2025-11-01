import ConfirmDialog from '@/components/confirm-dialog';
import { Button } from '@/components/ui/button';
import { isLightColor } from '@/lib/utils';
import { SharedData } from '@/types';
import { Product } from '@/types/data';
import { StoreData } from '@/types/store';
import { Link, router } from '@inertiajs/react';
import axios from 'axios';
import { Crown, Layers, Link2, Loader2, Pen, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import RelatedProductsSection from './related-product-section';

type BuyedProduct = {
    id: number;
    quantity: number;
    price: number;
    product_id: number;
    user_id: number;
    store_id: number;
    price_type: 'physical' | 'digital';
    product: Product;
    created_at: string;
    updated_at: string;
};

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
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [buyedProduct, setBuyedProduct] = useState<BuyedProduct[]>([]);
    const [loading, setLoading] = useState(false);
    const isAdmin = auth?.user?.type === 'admin';

    const handleCheckout = async () => {
        setLoading(true);
        try {
            const { data } = await axios.post(`/buy-product?product_id=${product.id}`);
            window.location.href = data.url;
        } catch {
            toast.error('Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        const isOwner = auth?.user?.id === product.user_id;
        if (store) {
            if (isOwner) router.delete(route('store.product.delete', { storeId: store.id, id: product.id }));
            else toast.error('You are not authorized to delete this product.');
        } else router.delete(route('superadmin.product.destroy', product.id));

        setConfirmOpen(false);
    };

    useEffect(() => {
        fetch('/buyed-products')
            .then((res) => res.json())
            .then((data) => setBuyedProduct(Array.isArray(data) ? data : (data.buyedProducts ?? [])))
            .catch(() => setBuyedProduct([]));
    }, []);

    // 🧭 Helpers
    const parsedSizes = safeParseArray(product.sizes);
    const parsedMaterials = safeParseArray(product.materials);

    const isProductBought = buyedProduct.some((item) => item.product_id === product.id);

    const customizeHref =
        page_type === 'home'
            ? product?.template?.id
                ? route('customizer', product.template.id)
                : '#'
            : product?.template?.id
              ? route('store.product.customizer', { storeId: store?.id, id: product.template.id })
              : '#';

    const isOwnerOrStore = product.user_id === auth?.user?.id || store?.id === product.store_id;

    const renderButton = () => {
        if (!auth?.user)
            return (
                <Link href={route('login')}>
                    <Button className="flex w-full cursor-pointer items-center justify-center gap-2 bg-gray-800 text-white hover:bg-gray-900">
                        Login to Customize
                    </Button>
                </Link>
            );

        // 👑 Admin always gets customize
        if (isAdmin)
            return (
                <Link href={customizeHref}>
                    <Button className="flex w-full items-center justify-center gap-2">Customize</Button>
                </Link>
            );

        // 🧍 Regular user logic
        if (product.price_type === 'digital' && !isProductBought) return renderCheckoutButton();

        // 🧵 Physical products → show Customize
        if (page_type === 'home' && product.type !== 'simple' && !isOwnerOrStore) return renderDisabledCustomize();

        return renderCustomizeButton();
    };

    const renderCheckoutButton = () => (
        <Button onClick={handleCheckout} disabled={loading} className="relative flex w-full items-center justify-center gap-2">
            {loading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Redirecting...
                </>
            ) : (
                'Proceed to Payment'
            )}
        </Button>
    );

    const renderCustomizeButton = () => (
        <Link href={customizeHref}>
            <Button className="relative flex w-full items-center justify-center gap-2">Customize</Button>
        </Link>
    );

    const renderDisabledCustomize = () => (
        <span>
            <Button className="pointer-events-none relative flex w-full items-center justify-center gap-2 opacity-50">
                <span className="absolute left-3 flex items-center">
                    <Crown className="h-4 w-4" />
                </span>
                <span className="ml-6">Customize</span>
            </Button>
        </span>
    );

    return (
        <div className="mx-auto w-full max-w-7xl">
            {/* Header Actions */}
            <div className="flex justify-end border-b p-3">
                <div className="flex items-center gap-2 px-4">
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                        alt="WhatsApp"
                        className="h-7 w-7 cursor-pointer"
                        onClick={() =>
                            window.open(
                                `https://wa.me/?text=${encodeURIComponent(
                                    `Check out this product: ${product.title.toUpperCase()} - ${window.location.href}`,
                                )}`,
                                '_blank',
                            )
                        }
                    />
                    <Link2
                        className="h-5 w-5 cursor-pointer"
                        onClick={() =>
                            navigator.clipboard
                                .writeText(window.location.href)
                                .then(() => toast.success('Link copied!'))
                                .catch(() => toast.error('Failed to copy link!'))
                        }
                    />

                    {/* Owner/Admin actions */}
                    {store?.id === product.store_id ? renderStoreActions(store, product) : isAdmin && renderAdminActions(product)}
                </div>
            </div>

            {/* Product Detail */}
            <div className="lg:flex">
                <div className="flex lg:w-1/2">
                    <img src={`/storage/${product.image}`} className="max-h-screen" />
                </div>
                <div className="ml-10 space-y-2 p-5 lg:mr-0 lg:p-10 xl:p-14">
                    <h1 className="text-5xl font-bold">{product.title}</h1>
                    <p className="text-xs">SKU: {product.sku}</p>

                    <div className="flex flex-wrap gap-2">
                        <Tag label="Product Type" value={product.type} />
                        <Tag label="Product Price" value={product.price} />
                    </div>

                    <Section label="Color">
                        {product.product_colors.map(({ id, color }) => {
                            const textColor = isLightColor(color.hexCode) ? 'text-black' : 'text-white';
                            return (
                                <div key={id} className={`rounded-full px-4 py-2 shadow-2xl ${textColor}`} style={{ backgroundColor: color.hexCode }}>
                                    {color.name}
                                </div>
                            );
                        })}
                    </Section>

                    <Section label="Size">
                        {parsedSizes.map((size, i) => (
                            <Chip key={i} text={size} />
                        ))}
                    </Section>

                    <Section label="Material">
                        {parsedMaterials.map((m, i) => (
                            <Chip key={i} text={m} />
                        ))}
                    </Section>

                    {/* Action Button */}
                    {product.template && renderButton()}
                </div>
            </div>

            <RelatedProductsSection store={store} />
            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="Delete Product"
                description={`Are you sure you want to delete "${product.title}"?`}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={handleDelete}
            />
        </div>
    );
};

// 🧩 Small Reusable UI Helpers
const Tag = ({ label, value }: { label: string; value: string | number }) => (
    <p className="w-fit rounded-full border-2 p-3 text-sm shadow-2xs">
        {label}: <b>{value}</b>
    </p>
);

const Section = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
        <p className="pl-3 text-sm">{label}:</p>
        <div className="flex flex-wrap gap-2">{children}</div>
    </div>
);

const Chip = ({ text }: { text: string }) => (
    <div className="rounded-full border-2 px-4 py-2 hover:bg-gray-200/80 dark:hover:bg-gray-200/10">{text}</div>
);

// 🧭 Utility: Safe JSON parsing
const safeParseArray = (val: any): string[] => {
    try {
        return typeof val === 'string' ? JSON.parse(val) : val || [];
    } catch {
        return [];
    }
};

// 🔧 Action Renderers
const renderStoreActions = (store: StoreData, product: Product) => (
    <>
        <Link href={route('store.product.edit', { storeId: store.id, sku: product.sku })}>
            <Pen className="h-5 w-5" />
        </Link>
        <Trash2 className="h-5 w-5 text-red-500" />
        <Link
            href={
                product.template
                    ? route('store.product.edit.template', {
                          storeId: store.id,
                          id: product.template.id,
                      })
                    : route('store.product.add.template', {
                          storeId: store.id,
                          slug: product.slug,
                      })
            }
        >
            <Layers className="h-5 w-5" />
        </Link>
    </>
);

const renderAdminActions = (product: Product) => (
    <>
        <Link href={route('superadmin.product.edit', product.sku)}>
            <Pen className="h-5 w-5" />
        </Link>
        <Trash2 className="h-5 w-5 text-red-500" />
        <Link
            href={
                product.template
                    ? route('superadmin.product.edit.template', {
                          id: product.template.id,
                      })
                    : route('superadmin.product.add.template', product.slug)
            }
        >
            <Layers className="h-5 w-5" />
        </Link>
    </>
);

export default SingleProductSection;
