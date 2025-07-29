import SingleProductSection from '@/components/sections/single-product-sections';
import StoreLayout from '@/layouts/store-layout';
import { type SharedData } from '@/types';
import { Product } from '@/types/data';
import { StoreData } from '@/types/store';
import { Head, usePage } from '@inertiajs/react';

type Props = {
    store: StoreData;
    product: Product;
    page_type: string;
};

export default function Welcome({ store, product, page_type }: Props) {
    const page = usePage<SharedData>();
    const { auth } = page.props;

    return (
        <StoreLayout store={store}>
            <Head title="Dashboard"></Head>
            <SingleProductSection product={product} auth={auth} store={store} page_type={page_type} />
        </StoreLayout>
    );
}
