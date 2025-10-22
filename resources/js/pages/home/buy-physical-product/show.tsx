import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
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

const ShowPhysicalProductOrder = ({ order }: Props) => {
    const infoRows = [
        { label: 'Order ID', value: order.product_id },
        { label: 'Store ID', value: order.store_id ?? 'N/A' },
        { label: 'Price', value: `$${order.price.toFixed(2)}` },
        { label: 'Customer Name', value: order.name },
        { label: 'Email', value: order.email },
        { label: 'Phone', value: order.number },
        { label: 'Country', value: order.country },
        { label: 'Address', value: order.address },
        ...(order.has_delivery_address ? [{ label: 'Delivery Address', value: order.delivery_address }] : []),
    ];

    return (
        <AppLayout>
            <Head title="Order Details" />
            <div className="max-w-5xl mx-auto px-4 py-8">
                <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">Order Details</h1>

                <div className="flex flex-col md:flex-row gap-6">
                    {/* Product Image */}
                    {order.file && (
                        <div className="relative w-full md:w-1/2 h-72 md:h-auto rounded-xl overflow-hidden shadow-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <img
                                src={`/storage/${order.file}`}
                                alt="Product File"
                                className="object-contain w-full h-full transition-transform duration-300 hover:scale-105"
                            />
                        </div>
                    )}

                    {/* Info Card */}
                    <div className="w-full md:w-1/2 bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 space-y-4">
                        {infoRows.map((row) => (
                            <div
                                key={row.label}
                                className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-gray-200 dark:border-gray-700 pb-3 last:border-b-0"
                            >
                                <span className="text-gray-500 dark:text-gray-400 font-medium">{row.label}</span>
                                <span className="mt-1 sm:mt-0 text-gray-900 dark:text-gray-100 font-semibold">{row.value}</span>
                            </div>
                        ))}

                        {/* Payment Status */}
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                            <span className="text-gray-500 dark:text-gray-400 font-medium">Payment Status</span>
                            <span
                                className={`mt-1 sm:mt-0 inline-block px-4 py-1 rounded-full text-sm font-semibold ${
                                    order.payment_status === 'paid'
                                        ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                        : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                                }`}
                            >
                                {order.payment_status.toUpperCase()}
                            </span>
                        </div>
                        <Button className='w-full'>
                            <a
                                href={`/storage/${order.file}`}
                                download
                            >
                                Download Image
                            </a>
                        </Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default ShowPhysicalProductOrder;
