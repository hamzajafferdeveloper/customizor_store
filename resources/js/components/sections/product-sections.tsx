import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import FilterProductContent from '@/pages/super-admin/product/component/filter-product-content';
import { SharedData } from '@/types';
import { Category, Color } from '@/types/data';
import { ProductPagination } from '@/types/pagination';
import { StoreData } from '@/types/store';
import { Link, router } from '@inertiajs/react';

import { Crown, Rabbit, SlidersHorizontal } from 'lucide-react';
import { useEffect, useState } from 'react';

type Props = {
    products: ProductPagination;
    categories: Category[];
    colors: Color[];
    hasFilter: boolean;
    auth: SharedData['auth'];
    baseUrl: string;
    createProductUrl: string;
    showProductRoute: string;
    store?: StoreData;
    page_type: string;
};

const ProductSection = ({ products, categories, colors, hasFilter, auth, baseUrl, createProductUrl, showProductRoute, store, page_type }: Props) => {
    const [searchValue, setSearchValue] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const filterData = products.data.filter((product) => {
        const matchesSearch = product.title.toLowerCase().includes(searchValue.toLowerCase());
        const matchesCategory = selectedCategoryId ? product.categories_id === selectedCategoryId : true;
        return matchesSearch && matchesCategory;
    });
    const [createOwnProductImage, setCreateOwnProductImage] = useState<string>('/storage/create-your-own-product-base.png');

    const clearFilters = () => {
        router.get(baseUrl, {}, { preserveScroll: true });
    };

    useEffect(() => {
        const category = categories.find((c) => c.id === selectedCategoryId);
        if (category?.own_product_image?.image) {
            console.log(category.own_product_image.image)
            setCreateOwnProductImage(`/storage/${category.own_product_image.image}`);
        } else {
            setCreateOwnProductImage('/storage/create-your-own-product-base.png');
        }
    }, [selectedCategoryId]);

    return (
        <div>
            {/* Category Filter */}
            <header className="mx-4 justify-between space-y-2 border-b py-2 sm:flex">
                <ul className="flex flex-wrap gap-2">
                    <li>
                        <Button
                            variant={selectedCategoryId === null ? 'default' : 'ghost'}
                            onClick={() => setSelectedCategoryId(null)}
                            className="cursor-pointer transition-all duration-300"
                        >
                            All
                        </Button>
                    </li>
                    {categories.map((category) => (
                        <li key={category.id}>
                            <Button
                                variant={selectedCategoryId === category.id ? 'default' : 'ghost'}
                                onClick={() => setSelectedCategoryId(category.id)}
                                className="cursor-pointer transition-all duration-300"
                            >
                                {category.name}
                            </Button>
                        </li>
                    ))}
                </ul>
                <div className="flex gap-2">
                    <Input placeholder="Search..." value={searchValue} onChange={(e) => setSearchValue(e.target.value)} />
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button className="cursor-pointer hover:bg-gray-200/80 dark:hover:bg-gray-200/10" variant="outline">
                                <SlidersHorizontal />
                                Filter
                            </Button>
                        </SheetTrigger>
                        <SheetContent>
                            <FilterProductContent baseUrl={baseUrl} colors={colors} />
                        </SheetContent>
                    </Sheet>
                    {hasFilter && (
                        <Button variant="destructive" onClick={clearFilters} className="cursor-pointer">
                            Clear Filters
                        </Button>
                    )}

                    {auth?.user?.type === 'admin' ? (
                        <Link href={createProductUrl} className="cursor-pointer">
                            <Button className="cursor-pointer">Create</Button>
                        </Link>
                    ) : (
                        store && (
                            <Link href={createProductUrl} className="cursor-pointer">
                                <Button className="cursor-pointer">Create</Button>
                            </Link>
                        )
                    )}
                </div>
            </header>

            <div className="px-4 py-2">
                {store?.banner?.path && (
                    <div
                        className="flex h-56 w-full rounded-md border md:h-64"
                        style={{
                            backgroundImage: `url('/storage/${store.banner.path}')`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    ></div>
                )}
            </div>

            <section className="grid grid-cols-1 gap-4 px-4 py-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                <Card
                    onClick={() => router.get(route('design.product'), {}, { preserveScroll: true })}
                    className="flex min-w-0 cursor-pointer flex-col justify-between transition hover:bg-gray-200/90 dark:hover:bg-gray-800/90"
                >
                    <CardHeader className="p-2">
                        <img src={createOwnProductImage} alt={createOwnProductImage} className="rounded-md object-cover" />
                    </CardHeader>
                    <CardContent className="flex flex-col">
                        <h1 className="font-semibold">Design your own product</h1>
                        <div className="flex flex-wrap gap-2"></div>
                    </CardContent>
                </Card>

                {filterData.length > 0 ? (
                    filterData.map((product) => {
                        const showCrown = page_type === 'home' && product.type !== 'simple' && auth?.user?.type !== 'admin';

                        return (
                            <Card
                                key={product.id}
                                onClick={() =>
                                    router.get(route(showProductRoute, { slug: product.slug, storeId: store?.id }), {}, { preserveScroll: true })
                                }
                                className="relative min-w-0 cursor-pointer transition hover:bg-gray-200/90 dark:hover:bg-gray-800/90"
                            >
                                {/* ✅ Crown Icon */}
                                {showCrown && (
                                    <div className="absolute top-2 right-2 rounded-full bg-yellow-500 p-1 shadow-md">
                                        <Crown className="h-5 w-5 text-white" />
                                    </div>
                                )}

                                <CardHeader className="p-2">
                                    <img src={`/storage/${product.image}`} alt={product.title} className="rounded-md object-cover" />
                                </CardHeader>
                                <CardContent className="flex flex-col">
                                    <h1 className="font-semibold">{product.title}</h1>
                                    <div className="flex flex-wrap gap-2">
                                        {product.product_colors.map((color: any) => (
                                            <div
                                                key={color.id}
                                                className="h-5 w-5 rounded-md border"
                                                style={{ backgroundColor: color.color.hexCode }}
                                            />
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                ) : (
                    <div className="flex h-full flex-col items-center justify-center text-gray-400/90">
                        <Rabbit className="h-64 w-64 rotate-y-180" />
                        <p>No Product Found.</p>
                    </div>
                )}
            </section>

            <footer className="flex w-full items-center justify-center border-t px-4 py-2">
                <div className="flex w-full max-w-xl items-center justify-between">
                    <div className={products.prev_page_url ? 'cursor-pointer' : 'pointer-events-none cursor-not-allowed opacity-50'}>
                        <Link href={products.prev_page_url || ''}>
                            <Button>Prev</Button>
                        </Link>
                    </div>
                    <div className="px-4 py-2">
                        <span className="text-center text-sm text-gray-500 dark:text-gray-50">
                            {products.from} - {products.to} of {products.total} Products
                        </span>
                    </div>

                    <div className={products.next_page_url ? 'cursor-pointer' : 'pointer-events-none cursor-not-allowed opacity-50'}>
                        <Link href={products.next_page_url || ''}>
                            <Button>Next</Button>
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default ProductSection;
