import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import SuperAdminLayout from '@/layouts/super-admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { LoaderCircleIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Extra Permission Requests',
        href: '/get-extra-permission-request',
    },
];

export default function ExtraPermissionRequest() {
    const { props }: any = usePage();
    const { requests, filters } = props;

    useEffect(() => {
        if (props.flash?.success) {
            toast.success(props.flash.success);
        }
    }, [props.flash?.success]);

    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [sort, setSort] = useState(filters.sort || 'desc');
    const [loading, setLoading] = useState(false);

    const handleFilter = () => {
        setLoading(true);
        router.get(
            '/get-extra-permission-request',
            { search, status, sort },
            {
                preserveState: true,
                onFinish: () => setLoading(false),
            },
        );
    };

    const handleRequestApproved = (id: number) => {
        router.post(
            `/approve-extra-permission-request/${id}`,
            {},
            {
                preserveState: true,
                onFinish: () => setLoading(false),
            },
        );
    }

    return (
        <SuperAdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Extra Permission Requests" />

            <div className="space-y-4 p-6">
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-white p-4 shadow-sm">
                    <Input
                        type="text"
                        placeholder="Search by store name or permission..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-64"
                    />

                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Filter by Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={sort} onValueChange={setSort}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Sort by Date" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="desc">Newest First</SelectItem>
                            <SelectItem value="asc">Oldest First</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button onClick={handleFilter} disabled={loading}>
                        {loading ? <LoaderCircleIcon className="mr-2 h-4 w-4 animate-spin" /> : 'Apply'}
                    </Button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-100">
                                <TableHead>ID</TableHead>
                                <TableHead>Store</TableHead>
                                <TableHead>Permission</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Requested At</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {requests.data.length > 0 ? (
                                requests.data.map((req: any) => (
                                    <TableRow key={req.id}>
                                        <TableCell className="font-medium">{req.id}</TableCell>
                                        <TableCell>
                                            <Link href={`/${req.store?.id}/profile`} className="flex gap-2 cursor-pointer hover:underline">
                                                <img
                                                    src={`/storage/${req.store?.logo}`}
                                                    alt={req.store?.name}
                                                    className="h-12 w-12 rounded-full object-cover"
                                                />
                                                <div>
                                                    {req.store?.name || 'N/A'} <br />
                                                    <span className="text-xs text-gray-500">{req.store?.email}</span>
                                                </div>
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            {req.permission?.key || 'N/A'} <br />
                                            <span className="text-xs text-gray-500">{req.permission?.description || ''}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={`rounded px-2 py-1 text-xs font-semibold ${
                                                    req.status === 'approved'
                                                        ? 'bg-green-100 text-green-700'
                                                        : req.status === 'rejected'
                                                          ? 'bg-red-100 text-red-700'
                                                          : 'bg-yellow-100 text-yellow-700'
                                                }`}
                                            >
                                                {req.status}
                                            </span>
                                        </TableCell>

                                        <TableCell>{new Date(req.created_at).toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Button disabled={req.status === 'approved'} onClick={() => handleRequestApproved(req.id)} className='cursor-pointer'>{req.status === 'approved' ? 'Approved' : 'Approve'}</Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-6 text-center text-gray-500">
                                        No permission requests found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                    <div>
                        Showing {requests.from} to {requests.to} of {requests.total} results
                    </div>
                    <div className="flex gap-2">
                        {requests.links.map((link: any, index: number) => (
                            <button
                                key={index}
                                onClick={() => link.url && router.visit(link.url)}
                                disabled={!link.url || link.active}
                                className={`rounded px-3 py-1 ${
                                    link.active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </SuperAdminLayout>
    );
}
