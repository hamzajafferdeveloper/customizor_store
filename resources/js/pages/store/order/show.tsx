import OrderInvoice from '@/components/sections/invoice';
import StoreLayout from '@/layouts/store-layout';
import SuperAdminLayout from '@/layouts/super-admin-layout';
import { BreadcrumbItem } from '@/types';
import { StoreData } from '@/types/store';
import { Head } from '@inertiajs/react';
import React from 'react';

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
    store: StoreData
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Invoice', href: '/order/invoice' }];

const InvoicePage = ({ order, store }: Props) => {
    return (
        <StoreLayout store={store} breadcrumbs={breadcrumbs}>
            <Head title="Invoice" />
            <OrderInvoice order={order} />
        </StoreLayout>
    );
};

export default InvoicePage;
