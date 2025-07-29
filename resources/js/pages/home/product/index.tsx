import ProductSection from '@/components/sections/product-sections';
import AppLayout from '@/layouts/app-layout';
import { SharedData } from '@/types';
import { Category, Color, Permission } from '@/types/data';
import { ProductPagination } from '@/types/pagination';
import { Head, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'react-toastify';

type Props = {
    products: ProductPagination;
    categories: Category[];
    colors: Color[];
    page_type: string;
};

export default function AllProduct({ products, categories, colors, page_type }: Props) {
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
        <AppLayout breadcrumbs={[{ title: 'All Product', href: '/product' }]}>
            <Head title="Product" />
            <ProductSection
                products={products}
                categories={categories}
                colors={colors}
                hasFilter={hasFilter}
                auth={auth}
                baseUrl="/product"
                createProductUrl={route('superadmin.product.create')}
                showProductRoute="product.show"
                page_type={page_type}
            />
        </AppLayout>
    );
}
