import OrderInvoice from '@/components/sections/invoice';
import SuperAdminLayout from '@/layouts/super-admin-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

type Props = {
    order: {
        user_id: number;
        product_id: number;
        store_id: number | null;
        price: number;
        name: string;
        number: string;
        email: string;
        country: string;
        address: string;
        has_delivery_address: boolean;
        delivery_address?: string;
        payment_status: string;
        file?: string;
    };
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Invoice', href: '/order/invoice' }];

const InvoicePage = ({ order }: Props) => {
    return (
        <SuperAdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Invoice" />
            <OrderInvoice order={order} />
        </SuperAdminLayout>
    );
};

export default InvoicePage;
