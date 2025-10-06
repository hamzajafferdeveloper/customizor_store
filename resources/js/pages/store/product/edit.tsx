import EditProductSection from '@/components/sections/edit-product-section';
import StoreLayout from '@/layouts/store-layout';
import { type SharedData } from '@/types';
import { Brand, Category, Color, Product } from '@/types/data';
import { StoreData } from '@/types/store';
import { Head, usePage } from '@inertiajs/react';

type Props = {
    store: StoreData;
    categories: Category[];
    colors: Color[];
    product: Product;
    brands: Brand[]
};

export default function Welcome({ store, categories, colors, product, brands }: Props) {
    const page = usePage<SharedData>();

    return (
        <StoreLayout store={store}>
            <Head title="Dashboard"></Head>
            <EditProductSection catogories={categories} colors={colors} product={product} store={store} brands={brands} />
        </StoreLayout>
    );
}
