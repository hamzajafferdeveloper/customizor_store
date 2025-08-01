import CreateProductSection from '@/components/sections/create-product-section';
import ProductSection from '@/components/sections/product-sections';
import StoreLayout from '@/layouts/store-layout';
import { type SharedData } from '@/types';
import { Category, Color } from '@/types/data';
import { ProductPagination } from '@/types/pagination';
import { StoreData } from '@/types/store';
import { Head, usePage } from '@inertiajs/react';

type Props = {
    store: StoreData;
    categories: Category[];
    colors: Color[];
};

export default function Welcome({ store, categories, colors }: Props) {
    const page = usePage<SharedData>();

    return (
        <StoreLayout store={store}>
            <Head title="Dashboard"></Head>
            <CreateProductSection catogories={categories} colors={colors} store={store} />
        </StoreLayout>
    );
}
