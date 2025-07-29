import CreateProductSection from '@/components/sections/create-product-section';
import SuperAdminLayout from '@/layouts/super-admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Category, Color } from '@/types/data';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Create Product', href: '/product' }];

type Props = {
    catogories: Category[];
    colors: Color[];
};

export default function CreateProduct({ catogories, colors }: Props) {
    return (
        <SuperAdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Product" />
            <CreateProductSection catogories={catogories} colors={colors} />
        </SuperAdminLayout>
    );
}
