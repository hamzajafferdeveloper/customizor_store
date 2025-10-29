import EditProductSection from '@/components/sections/edit-product-section';
import SuperAdminLayout from '@/layouts/super-admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Brand, Category, Color, Product } from '@/types/data';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Create Product', href: '/product' }];

type Props = {
    catogories: Category[];
    colors: Color[];
    product: Product;
    brands: Brand[];
    productTypes: any[];
};

export default function EditProduct({ catogories, colors, product, brands, productTypes }: Props) {

    return (
        <SuperAdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Product" />
            <EditProductSection
                catogories={catogories}
                colors={colors}
                product={product}
                brands={brands}
                productTypes={productTypes}
            />
        </SuperAdminLayout>
    );
}
