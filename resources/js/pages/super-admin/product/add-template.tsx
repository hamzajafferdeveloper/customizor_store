
import { Head } from '@inertiajs/react';

import SuperAdminLayout from '../../../layouts/super-admin-layout';
import { type BreadcrumbItem } from '../../../types';
import { Product } from '../../../types/data';
import AddTemplateSection from '@/components/sections/add-temaplate-section';



export default function AddTemplate({ product }: { product: Product }) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Add Template',
            href: `/product/add/template/product-slug=${product.slug}`,
        },
    ];



    return (
        <SuperAdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Template" />
            <AddTemplateSection product={product} />
        </SuperAdminLayout>
    );
}
