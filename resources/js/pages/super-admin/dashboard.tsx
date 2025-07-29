import { StoreGrowthChart } from '@/components/dashboard/charts/chart-area-interactive';
import { WorldMapChart } from '@/components/dashboard/charts/world-map-chart';
import StoreDataTable from '@/components/dashboard/tables/store-data-table';
import UserDataTable from '@/components/dashboard/tables/user-data-table';
import { Badge } from '@/components/ui/badge';
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import SuperAdminLayout from '@/layouts/super-admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { IconTrendingUp } from '@tabler/icons-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    const { stats, storeChart, countryChart, stores, users, filters, countries } = usePage().props as any;

    return (
        <SuperAdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:grid-cols-2 xl:grid-cols-4 dark:*:data-[slot=card]:bg-card">
                    {/* Revenue Card */}
                    <Card className="@container/card">
                        <CardHeader>
                            <CardDescription>Total Revenue</CardDescription>
                            <CardTitle className="text-2xl font-semibold tabular-nums">${stats.revenue.total}</CardTitle>
                            <CardAction>
                                <Badge variant="outline">
                                    {stats.revenue.growth > 0 ? '+' : ''}
                                    {stats.revenue.growth}%
                                </Badge>
                            </CardAction>
                        </CardHeader>
                        <CardFooter className="flex-col items-start gap-1.5 text-sm">
                            {stats.revenue.growth > 0 ? 'Trending up this month' : 'Down this month'}
                        </CardFooter>
                    </Card>

                    {/* Users Card */}
                    <Card className="@container/card">
                        <CardHeader>
                            <CardDescription>Total Users</CardDescription>
                            <CardTitle className="text-2xl font-semibold tabular-nums">{stats.users.total}</CardTitle>
                            <CardAction>
                                <Badge variant="outline">
                                    <IconTrendingUp />
                                    {stats.users.growth > 0 ? '+' : ''}
                                    {stats.users.growth}%
                                </Badge>
                            </CardAction>
                        </CardHeader>
                        <CardFooter className="flex-col items-start gap-1.5 text-sm">
                            {stats.users.growth > 0 ? 'Trending up this month' : 'Down this month'}
                        </CardFooter>
                    </Card>

                    {/* Stores Card */}
                    <Card className="@container/card">
                        <CardHeader>
                            <CardDescription>Total Stores</CardDescription>
                            <CardTitle className="text-2xl font-semibold tabular-nums">{stats.stores.total}</CardTitle>
                            <CardAction>
                                <Badge variant="outline">
                                    <IconTrendingUp />
                                    {stats.stores.growth > 0 ? '+' : ''}
                                    {stats.stores.growth}%
                                </Badge>
                            </CardAction>
                        </CardHeader>
                        <CardFooter className="flex-col items-start gap-1.5 text-sm">
                            {stats.stores.growth > 0 ? 'Trending up this month' : 'Down this month'}
                        </CardFooter>
                    </Card>
                    <Card className="@container/card">
                        <CardHeader>
                            <CardDescription>Total Products</CardDescription>
                            <CardTitle className="text-2xl font-semibold tabular-nums">{stats.products.total}</CardTitle>
                            <CardAction>
                                <Badge variant="outline">
                                    <IconTrendingUp />
                                    {stats.products.growth > 0 ? '+' : ''}
                                    {stats.products.growth}%
                                </Badge>
                            </CardAction>
                        </CardHeader>
                        <CardFooter className="flex-col items-start gap-1.5 text-sm">
                            {stats.stores.growth > 0 ? 'Trending up this month' : 'Down this month'}
                        </CardFooter>
                    </Card>
                </div>
                <div className="flex flex-col gap-4 lg:flex-row">
                    <div className="w-full lg:w-3/5 xl:w-3/4">
                        <StoreGrowthChart storeChart={storeChart} />
                    </div>
                    <div className="w-full lg:w-2/5 xl:w-[24.5%]">
                        <WorldMapChart countryChart={countryChart} />
                    </div>
                </div>
                <div className='flex flex-col gap-4'>
                    <StoreDataTable stores={stores} filters={filters} countries={countries} />
                    <UserDataTable users={users}/>
                </div>
            </div>
        </SuperAdminLayout>
    );
}
