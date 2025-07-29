'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserPagination } from '@/types/pagination';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import * as XLSX from 'xlsx';

interface User {
    id: number;
    name: string;
    email: string;
    type: string;
    email_verified_at: string | null;
    created_at: string;
}

export default function UserDataTable({ users }: { users: UserPagination }) {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const perPage = 10;

    // ✅ Filtered Users (frontend search)
    const filteredUsers = useMemo(() => {
        if (!users?.data) return [];
        return users.data.filter((user: User) => {
            const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) || user.email.toLowerCase().includes(search.toLowerCase());

            return matchesSearch;
        });
    }, [users, search]);

    // ✅ Paginate
    const totalPages = Math.ceil(filteredUsers.length / perPage);
    const paginatedUsers = filteredUsers.slice((page - 1) * perPage, page * perPage);

    // ✅ Export to Excel
    const exportExcel = () => {
        const ws = XLSX.utils.json_to_sheet(filteredUsers);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Users');
        XLSX.writeFile(wb, 'users.xlsx');
    };

    return (
        <Card className="p-4">
            {/* Filters Section */}
            <div className="mb-1 flex flex-row items-center justify-between">
                {/* Search Input & Button */}
                <Input
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                    className="w-52 sm:w-64"
                />
                <Button onClick={exportExcel} variant="outline" className="cursor-pointer hover:bg-gray-400/20">
                    Export Excel
                </Button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted">
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Email Verified</TableHead>
                            <TableHead>Created At</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedUsers.length > 0 ? (
                            paginatedUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        {user.email_verified_at ? (
                                            <span className="text-green-600">Verified</span>
                                        ) : (
                                            <span className="text-red-600">Not Verified</span>
                                        )}
                                    </TableCell>
                                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="py-4 text-center">
                                    No users found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
                    <ChevronLeft className="h-4 w-4" /> Prev
                </Button>
                <span>
                    Page {page} of {totalPages}
                </span>
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                    Next <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </Card>
    );
}
