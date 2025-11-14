import ProductSection from '@/components/sections/product-sections';
import StoreLayout from '@/layouts/store-layout';
import { type SharedData } from '@/types';
import { Category, Color } from '@/types/data';
import { ProductPagination } from '@/types/pagination';
import { StoreData } from '@/types/store';
import { Head, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'react-toastify';

type Props = {
    store: StoreData;
    products: ProductPagination;
    categories: Category[];
    colors: Color[];
    page_type: string;
    product_types: Category[];
};

export default function Welcome({ store, products, categories, colors, page_type, product_types }: Props) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const { flash } = page.props;
    const urlParams = new URLSearchParams(window.location.search);
    const hasFilter = urlParams.has('type') || urlParams.has('colors');

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    return (
        <StoreLayout store={store}>
            <Head title="Dashboard"></Head>
            <ProductSection
                products={products}
                categories={categories}
                colors={colors}
                hasFilter={hasFilter}
                auth={auth}
                store={store}
                baseUrl={`/${store.slug}/products`}
                createProductUrl={route('store.product.create', { storeSlug: store.slug })}
                showProductRoute="store.product.show"
                page_type={page_type}
                product_type={product_types}
            />
        </StoreLayout>
    );
}
