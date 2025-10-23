import CustomTableFooter from '@/components/table-footer';
import TableHeaderCustom from '@/components/table-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import StoreLayout from '@/layouts/store-layout';
import { Order } from '@/types/data';
import { StoreData } from '@/types/store';
import { Head, Link, router } from '@inertiajs/react';
import { IconTrendingUp } from '@tabler/icons-react';
import { useMemo, useState } from 'react';

interface Props {
    store: StoreData;
    stats: any;
    orders: {
        data: Order[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export default function Welcome({ store, stats, orders }: Props) {
    const [searchValue, setSearchValue] = useState('');
    const [perPage, setPerPage] = useState(orders.per_page);
    const [loading, setLoading] = useState(false);
    const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

    const handleStatusChange = (orderId: number, newStatus: string) => {
        setLoading(true);
        setUpdatingOrderId(orderId);

        router.post(
            `/${store.id}/order/${orderId}/update-status`,
            { status: newStatus },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setLoading(false);
                    setUpdatingOrderId(null);
                },
                onError: () => {
                    setLoading(false);
                    setUpdatingOrderId(null);
                    alert('Failed to update order status.');
                },
                onFinish: () => {
                    setLoading(false);
                    setUpdatingOrderId(null);
                },
            },
        );
    };
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
        <StoreLayout store={store}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
                    {/* Revenue Card */}
                    <Card className="bg-gradient-to-t from-green-200 to-green-100 shadow-lg hover:shadow-2xl">
                        <CardHeader>
                            <CardDescription>Store Revenue</CardDescription>
                            <CardTitle className="text-2xl font-semibold tabular-nums">${stats.revenue.total}</CardTitle>
                            <CardAction>
                                <Badge
                                    variant="outline"
                                    className={`flex items-center gap-1 ${
                                        stats.revenue.growth > 0 ? 'border-green-700 text-green-700' : 'border-red-700 text-red-700'
                                    }`}
                                >
                                    {stats.revenue.growth > 0 ? (
                                        <IconTrendingUp className="h-4 w-4" />
                                    ) : (
                                        <IconTrendingUp className="h-4 w-4 rotate-180" />
                                    )}
                                    {stats.revenue.growth > 0 ? '+' : ''}
                                    {stats.revenue.growth}%
                                </Badge>
                            </CardAction>
                        </CardHeader>
                        <CardFooter className="flex-col items-start gap-1.5 text-sm">
                            {stats.revenue.growth > 0 ? 'Trending up this month' : 'Down this month'}
                        </CardFooter>
                    </Card>

                    {/* Product Revenue Card */}
                    <Card className="bg-gradient-to-t from-blue-200 to-blue-100 shadow-lg hover:shadow-2xl">
                        <CardHeader>
                            <CardDescription>Total Product</CardDescription>
                            <CardTitle className="text-2xl font-semibold tabular-nums">{stats.product.total}</CardTitle>
                            <CardAction>
                                <Badge
                                    variant="outline"
                                    className={`flex items-center gap-1 ${
                                        stats.product.growth > 0 ? 'border-blue-700 text-blue-700' : 'border-red-700 text-red-700'
                                    }`}
                                >
                                    {stats.product.growth > 0 ? (
                                        <IconTrendingUp className="h-4 w-4" />
                                    ) : (
                                        <IconTrendingUp className="h-4 w-4 rotate-180" />
                                    )}
                                    {stats.product.growth > 0 ? '+' : ''}
                                    {stats.product.growth}%
                                </Badge>
                            </CardAction>
                        </CardHeader>
                        <CardFooter className="flex-col items-start gap-1.5 text-sm">
                            {stats.product.growth > 0 ? 'Trending up this month' : 'Down this month'}
                        </CardFooter>
                    </Card>

                    {/* Users Card */}
                    <Card className="bg-gradient-to-t from-purple-200 to-purple-100 shadow-lg hover:shadow-2xl">
                        <CardHeader>
                            <CardDescription>Total Digital Product Sold</CardDescription>
                            <CardTitle className="text-2xl font-semibold tabular-nums"> $ {stats.digitalProductSold.total}</CardTitle>
                            <CardAction>
                                <Badge
                                    variant="outline"
                                    className={`flex items-center gap-1 ${
                                        stats.digitalProductSold.growth > 0 ? 'border-purple-700 text-purple-700' : 'border-red-700 text-red-700'
                                    }`}
                                >
                                    {stats.digitalProductSold.growth > 0 ? (
                                        <IconTrendingUp className="h-4 w-4" />
                                    ) : (
                                        <IconTrendingUp className="h-4 w-4 rotate-180" />
                                    )}
                                    {stats.digitalProductSold.growth > 0 ? '+' : ''}
                                    {stats.digitalProductSold.growth}%
                                </Badge>
                            </CardAction>
                        </CardHeader>
                        <CardFooter className="flex-col items-start gap-1.5 text-sm">
                            {stats.digitalProductSold.growth > 0 ? 'Trending up this month' : 'Down this month'}
                        </CardFooter>
                    </Card>

                    {/* Stores Card */}
                    <Card className="bg-gradient-to-t from-yellow-200 to-yellow-100 shadow-lg hover:shadow-2xl">
                        <CardHeader>
                            <CardDescription>Total Physical Product Sold</CardDescription>
                            <CardTitle className="text-2xl font-semibold tabular-nums"> $ {stats.physicalProductSold.total}</CardTitle>
                            <CardAction>
                                <Badge
                                    variant="outline"
                                    className={`flex items-center gap-1 ${
                                        stats.physicalProductSold.growth > 0 ? 'border-yellow-700 text-yellow-700' : 'border-red-700 text-red-700'
                                    }`}
                                >
                                    {stats.physicalProductSold.growth > 0 ? (
                                        <IconTrendingUp className="h-4 w-4" />
                                    ) : (
                                        <IconTrendingUp className="h-4 w-4 rotate-180" />
                                    )}
                                    {stats.physicalProductSold.growth > 0 ? '+' : ''}
                                    {stats.physicalProductSold.growth}%
                                </Badge>
                            </CardAction>
                        </CardHeader>
                        <CardFooter className="flex-col items-start gap-1.5 text-sm">
                            {stats.physicalProductSold.growth > 0 ? 'Trending up this month' : 'Down this month'}
                        </CardFooter>
                    </Card>
                </div>

                <div className="flex-1 overflow-x-auto p-4">
                    <div className="mx-auto rounded-lg border p-4 shadow">
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
                                    <TableHead>Order Status</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredOrders.map((order) => (
                                    <TableRow key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <TableCell>
                                            <Link href={`/${store.id}/order/show/${order.id}`}>{order.product.title}</Link>
                                        </TableCell>
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
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        className="w-40 capitalize"
                                                        variant="outline"
                                                        disabled={loading && order.id === updatingOrderId}
                                                    >
                                                        {loading && order.id === updatingOrderId ? 'Updating...' : order.order_status}
                                                    </Button>
                                                </DropdownMenuTrigger>

                                                <DropdownMenuContent className="w-56">
                                                    <DropdownMenuLabel>Order Status</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuRadioGroup
                                                        value={order.order_status}
                                                        onValueChange={(newStatus) => handleStatusChange(order.id, newStatus)}
                                                    >
                                                        <DropdownMenuRadioItem value="pending">Pending</DropdownMenuRadioItem>
                                                        <DropdownMenuRadioItem value="processing">Processing</DropdownMenuRadioItem>
                                                        <DropdownMenuRadioItem value="shipped">Shipped</DropdownMenuRadioItem>
                                                        <DropdownMenuRadioItem value="delivered">Delivered</DropdownMenuRadioItem>
                                                        <DropdownMenuRadioItem value="cancelled">Cancelled</DropdownMenuRadioItem>
                                                    </DropdownMenuRadioGroup>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
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
            </div>
        </StoreLayout>
    );
}
