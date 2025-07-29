import AppLayout from '@/layouts/app-layout';
import { SharedData } from '@/types';
import { Product } from '@/types/data';
import { Head, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import SingleProductSection from '@/components/sections/single-product-sections';

export default function SingleProduct({ product, page_type }: { product: Product, page_type: string }) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const { flash } = page.props;

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    return (
        <AppLayout breadcrumbs={[{ title: 'Single Product', href: `/product/${product.slug}` }]}>
            <Head title="Product" />
            <SingleProductSection product={product} auth={auth} page_type={page_type}  />
        </AppLayout>
    );
}
