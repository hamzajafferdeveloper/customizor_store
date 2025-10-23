'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import * as XLSX from 'xlsx';

export default function StoreDataTable({ stores, filters, countries }: any) {
    const [search, setSearch] = useState('');
    const [type, setType] = useState(filters.type || '');
    const [country, setCountry] = useState(filters.country || '');

    // ✅ Backend filters for type & country
    const applyFilters = () => {
        router.get(route('dashboard'), { type, country }, { preserveState: true });
    };

    // ✅ Frontend search
    const filteredStores = useMemo(() => {
        if (!stores?.data) return [];
        return stores.data.filter(
            (store: any) => store.name.toLowerCase().includes(search.toLowerCase()) || store.email.toLowerCase().includes(search.toLowerCase()),
        );
    }, [stores, search]);

    // ✅ Export to Excel
    const exportExcel = () => {
        if (filteredStores.length === 0) {
            alert('No data to export!');
            return;
        }

        // Prepare data (exclude logo)
        const exportData = filteredStores.map((store: any) => ({
            Name: store.name,
            Email: store.email,
            Country: store.country,
            Type: store.type,
            Status: store.status,
            'Created At': new Date(store.created_at).toLocaleDateString(),
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Stores');
        XLSX.writeFile(wb, 'stores.xlsx');
    };

    return (
        <Card className="p-4">
            {/* Filters Section */}
            <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex gap-2">
                    <Input
                        placeholder="Search stores by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-64"
                    />
                </div>
                <div className="flex gap-2">
                    <Button onClick={exportExcel} variant="outline" className="hover:bg-gray-200/20">
                        Export Excel
                    </Button>
                    {/* Type Filter */}
                    <Select
                        value={type || 'all'}
                        onValueChange={(v) => {
                            const newType = v === 'all' ? '' : v;
                            setType(newType);
                            router.get(route('dashboard'), { type: newType, country }, { preserveState: true });
                        }}
                    >
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Filter by Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="public">Public</SelectItem>
                            <SelectItem value="protected">Protected</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Country Filter */}
                    <Select
                        value={country || 'all'}
                        onValueChange={(v) => {
                            const newCountry = v === 'all' ? '' : v;
                            setCountry(newCountry);
                            router.get(route('dashboard'), { type, country: newCountry }, { preserveState: true });
                        }}
                    >
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Filter by Country" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Countries</SelectItem>
                            {countries.map((c: string, i: number) => (
                                <SelectItem key={i} value={c}>
                                    {c}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-md border">
                <Table>
                    <TableHeader className="bg-muted">
                        <TableRow>
                            <TableHead>Logo</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Country</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created At</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredStores.length > 0 ? (
                            filteredStores.map((store: any) => (
                                <TableRow key={store.id}>
                                    <TableCell>
                                        <img src={`/storage/${store.logo}`} alt="Logo" className="h-10 w-10 rounded-full object-cover" />
                                    </TableCell>
                                    <TableCell>{store.name}</TableCell>
                                    <TableCell>{store.email}</TableCell>
                                    <TableCell>{store.country}</TableCell>
                                    <TableCell>
                                        <span
                                            className={`rounded-full px-2 py-1 text-xs ${
                                                store.type === 'public' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                                            }`}
                                        >
                                            {store.type}
                                        </span>
                                    </TableCell>
                                    <TableCell>{store.status}</TableCell>
                                    <TableCell>{new Date(store.created_at).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="py-4 text-center">
                                    No stores found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between">
                <Button variant="outline" size="sm" disabled={!stores.prev_page_url} onClick={() => router.get(stores.prev_page_url)}>
                    <ChevronLeft className="h-4 w-4" /> Prev
                </Button>
                <span>
                    Page {stores.current_page} of {stores.last_page}
                </span>
                <Button variant="outline" size="sm" disabled={!stores.next_page_url} onClick={() => router.get(stores.next_page_url)}>
                    Next <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </Card>
    );
}
