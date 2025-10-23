import CustomTableFooter from '@/components/table-footer';
import TableHeaderCustom from '@/components/table-header';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import SuperAdminLayout from '@/layouts/super-admin-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'All Orders', href: '/order/index' }];

type Order = {
    id: number;
    product: { title: string };
    price: number;
    payment_status: string;
    created_at: string;
    file?: string;
    address: string;
};

type Props = {
    orders: {
        data: Order[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
};

const Orders = ({ orders }: Props) => {
    const [searchValue, setSearchValue] = useState('');
    const [perPage, setPerPage] = useState(orders.per_page);

    // Format date using native JS
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    // Filtered orders (frontend-only)
    const filteredOrders = useMemo(() => {
        if (!searchValue) return orders.data;
        return orders.data.filter(
            (order) =>
                order.product.title.toLowerCase().includes(searchValue.toLowerCase()) ||
                order.address.toLowerCase().includes(searchValue.toLowerCase()),
        );
    }, [searchValue, orders.data]);

    return (
        <SuperAdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Orders" />
            <div className="flex-1 overflow-x-auto p-4">
                <div className="mx-auto max-w-7xl rounded-lg border p-4 shadow">
                    {/* Header with search */}
                    <TableHeaderCustom
                        searchValue={searchValue}
                        setSearchValue={setSearchValue}
                        searchTxt="Search orders by product or address..."
                        heading="All Orders"
                        desc={`Total orders: ${orders.total}`}
                    />

                    {/* Orders Table */}
                    <Table>
                        <TableCaption>List of all sold physical products.</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Payment Status</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredOrders.map((order) => (
                                <TableRow key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                    <TableCell><Link href={`/order/show/${order.id}`}>{order.product.title}</Link></TableCell>
                                    <TableCell>${order.price.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <span
                                            className={`rounded-full px-2 py-1 text-xs font-semibold ${
                                                order.payment_status === 'paid'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                                            }`}
                                        >
                                            {order.payment_status.toUpperCase()}
                                        </span>
                                    </TableCell>
                                    <TableCell>{formatDate(order.created_at)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {/* Table Footer with pagination */}
                    <CustomTableFooter
                        perPage={perPage}
                        handlePerPageChange={setPerPage} // optionally update per page locally
                        handlePageChange={() => {}} // disable server-side page change if desired
                        data={{ ...orders, data: filteredOrders }} // show filtered count
                    />
                </div>
            </div>
        </SuperAdminLayout>
    );
};

export default Orders;
