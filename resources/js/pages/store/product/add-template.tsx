import AddTemplateSection from '@/components/sections/add-temaplate-section';
import StoreLayout from '@/layouts/store-layout';
import { type SharedData } from '@/types';
import { Product } from '@/types/data';
import { StoreData } from '@/types/store';
import { Head, usePage } from '@inertiajs/react';

type Props = {
    store: StoreData;
    product: Product;
};

export default function AddTemaplate({ store, product }: Props) {
    return (
        <StoreLayout store={store}>
            <Head title="Add Temaplate"></Head>
            <AddTemplateSection product={product} store={store} />
        </StoreLayout>
    );
}
