import SuperAdminLayout from '@/layouts/super-admin-layout';
import { BreadcrumbItem } from '@/types';
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
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Invoice', href: '/order/invoice' }];

const InvoicePage = ({ order }: Props) => {
    const infoRows = [
        { label: 'Order ID', value: order.product_id },
        { label: 'Store ID', value: order.store_id ?? 'N/A' },
        { label: 'Customer Name', value: order.name },
        { label: 'Email', value: order.email },
        { label: 'Phone', value: order.number },
        { label: 'Country', value: order.country },
        { label: 'Address', value: order.address },
        ...(order.has_delivery_address
            ? [{ label: 'Delivery Address', value: order.delivery_address }]
            : []),
        { label: 'Price', value: `$${order.price.toFixed(2)}` },
        { label: 'Payment Status', value: order.payment_status.toUpperCase() },
    ];

    const downloadInvoice = () => {
        const printContents = document.getElementById('invoice-content')?.innerHTML;
        const originalContents = document.body.innerHTML;

        if (printContents) {
            document.body.innerHTML = printContents;
            window.print();
            document.body.innerHTML = originalContents;
            window.location.reload();
        }
    };

    return (
        <SuperAdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Invoice" />
            <div className="max-w-5xl mx-auto px-4 py-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Invoice</h1>
                    <div className="flex gap-3">
                        <button
                            onClick={downloadInvoice}
                            className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-2 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-200 transition font-medium"
                        >
                            Download / Print
                        </button>
                        {order.file && (
                            <a
                                href={`/storage/${order.file}`}
                                target="_blank"
                                className="bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white px-5 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition font-medium flex items-center gap-2"
                            >
                                View File
                            </a>
                        )}
                    </div>
                </div>

                <div
                    id="invoice-content"
                    className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 space-y-8 border border-gray-200 dark:border-gray-700"
                >
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
                                Order Details
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400">
                                Invoice for your purchase
                            </p>
                        </div>
                        {order.file && (
                            <div className="w-full md:w-64 h-64 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                                <img
                                    src={`/storage/${order.file}`}
                                    alt="Product"
                                    className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                        )}
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {infoRows.map((row) => (
                            <div
                                key={row.label}
                                className="flex justify-between bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700"
                            >
                                <span className="font-medium text-gray-500 dark:text-gray-400">{row.label}</span>
                                <span className="font-semibold text-gray-900 dark:text-gray-100">{row.value}</span>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="mt-6 text-center text-gray-500 dark:text-gray-400">
                        Thank you for your purchase!
                    </div>
                </div>
            </div>
        </SuperAdminLayout>
    );
};

export default InvoicePage;
