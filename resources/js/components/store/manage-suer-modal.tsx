import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import gsap from 'gsap';
import { Construction, LoaderCircleIcon, Trash2, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import ConfirmDialog from '../confirm-dialog';
import { Card } from '../ui/card';
import PermissionModal from './permissions-modal';

const ManageUserModal = ({
    openManageUserModal,
    setIsVisible,
    isVisible,
    setOpenManageUserModal,
    storeSlug,
}: {
    openManageUserModal: boolean;
    setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
    isVisible: boolean;
    setOpenManageUserModal: React.Dispatch<React.SetStateAction<boolean>>;
    storeSlug: string;
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [dropdownLoading, setDropdownLoading] = useState(false);
    const [users, setUsers] = useState<{ id: number; name: string; email: string }[]>([]);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchUser, setSearchUser] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [addingUserId, setAddingUserId] = useState<number | null>(null);
    const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
    const usersPerPage = 5;
    const [selectUser, setSelectUser] = useState<number | null>(null);
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [openPermissionModal, setOpenPermissionModal] = useState<boolean>(false);

    const overlayRef = useRef<HTMLDivElement | null>(null);
    const contentRef = useRef<HTMLDivElement | null>(null);

    /** 🧩 Fetch all store users */
    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/${storeSlug}/users`);
            if (!res.ok) throw new Error('Failed to fetch users');
            const data = await res.json();
            setUsers(data.users || []);
        } catch (error) {
            console.error(error);
            toast.error('Error fetching users');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    /** 🔎 Handle search users for dropdown */
    useEffect(() => {
        if (!searchUser.trim()) {
            setSuggestions([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setDropdownLoading(true);
            try {
                const res = await fetch(`/${storeSlug}/all/users?search=${encodeURIComponent(searchUser)}`);
                if (!res.ok) throw new Error('Search request failed');
                const data = await res.json();
                setSuggestions(data.users || []);
            } catch (error) {
                console.error(error);
                toast.error('Error searching users');
            } finally {
                setDropdownLoading(false);
                setIsDropdownVisible(true);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchUser]);

    /** 🧭 Animate Modal open/close */
    useEffect(() => {
        if (openManageUserModal) {
            document.body.style.overflow = 'hidden';
            setIsVisible(true);

            gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25 });
            gsap.fromTo(contentRef.current, { opacity: 0, y: 60, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.35 });
        } else if (isVisible) {
            gsap.to(contentRef.current, { opacity: 0, y: 40, scale: 0.95, duration: 0.25 });
            gsap.to(overlayRef.current, {
                opacity: 0,
                duration: 0.25,
                onComplete: () => {
                    setIsVisible(false);
                    document.body.style.overflow = 'auto';
                },
            });
        }
    }, [openManageUserModal]);

    const handleOutsideClick = (e: React.MouseEvent) => {
        if (e.target === overlayRef.current) setOpenManageUserModal(false);
    };

    /** ➕ Add user to store */
    const handleAddUser = async (id: number) => {
        setAddingUserId(id);
        try {
            const token = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
            const res = await fetch(`/${storeSlug}/add/user/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': token || '',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'include',
            });

            if (!res.ok) {
                const error = await res.json().catch(() => ({}));
                throw new Error(error.message || 'Failed to add user');
            }

            toast.success('User added to store successfully');
            fetchUsers();
            setSearchUser('');
            setSuggestions([]);
            setIsDropdownVisible(false);
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Request failed');
        } finally {
            setAddingUserId(null);
        }
    };

    const handleRemoveUser = async (id: number) => {
        setDeletingUserId(id);
        try {
            const token = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
            const res = await fetch(`/${storeSlug}/remove/user/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': token || '',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'include',
            });

            if (!res.ok) throw new Error('Failed to delete user');

            toast.success('User removed successfully');
            setUsers((prev) => prev.filter((u) => u.id !== id));
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'CSRF token mismatch or request failed');
        } finally {
            setDeletingUserId(null);
        }
    };

    const filteredUsers = users.filter(
        (u) => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const paginatedUsers = filteredUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);

    if (!isVisible) return null;

    return (
        <div
            ref={overlayRef}
            onClick={handleOutsideClick}
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
            <div ref={contentRef} className="relative z-50 h-[90vh] w-[90vh] overflow-auto rounded-xl border border-gray-300 bg-white p-6 shadow-2xl">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold text-gray-800">Manage Users</h2>
                    <button onClick={() => setOpenManageUserModal(false)} className="text-gray-600 hover:text-black">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex h-[70vh] items-center justify-center">
                        <LoaderCircleIcon className="h-8 w-8 animate-spin text-gray-500" />
                    </div>
                ) : (
                    <section className="mt-6 flex flex-col gap-3">
                        {/* 🔎 Search Input */}
                        <div>
                            <h1 className="text-lg font-medium text-gray-700">Search User to Add</h1>
                            <div className="relative mb-6 w-full">
                                <Input
                                    placeholder="Search by name or email..."
                                    value={searchUser}
                                    onChange={(e) => setSearchUser(e.target.value)}
                                    onFocus={() => searchUser && setIsDropdownVisible(true)}
                                    className="w-full border-gray-300 pr-10"
                                />
                                {searchUser && (
                                    <button
                                        onClick={() => {
                                            setSearchUser('');
                                            setSuggestions([]);
                                            setIsDropdownVisible(false);
                                        }}
                                        className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        <X size={18} />
                                    </button>
                                )}

                                {/* Suggestions */}
                                {isDropdownVisible && (
                                    <Card className="absolute z-50 mt-1 w-full border border-gray-200 bg-white shadow-lg">
                                        {dropdownLoading ? (
                                            <div className="flex items-center justify-center px-4 py-2 text-gray-500">
                                                <LoaderCircleIcon className="mr-2 h-4 w-4 animate-spin" /> Searching...
                                            </div>
                                        ) : suggestions.length > 0 ? (
                                            <ul className="max-h-60 overflow-y-auto">
                                                {suggestions.map((user) => {
                                                    const alreadyAdded = users.some((u) => u.id === user.id);

                                                    return (
                                                        <li key={user.id} className="flex items-center justify-between px-4 py-2 hover:bg-gray-50">
                                                            <div>
                                                                <p className="font-medium text-gray-800">{user.name}</p>
                                                                <p className="text-sm text-gray-500">{user.email}</p>
                                                            </div>

                                                            {alreadyAdded ? (
                                                                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                                                                    Already Added
                                                                </span>
                                                            ) : (
                                                                <Button
                                                                    variant="outline"
                                                                    disabled={addingUserId === user.id}
                                                                    onClick={() => handleAddUser(user.id)}
                                                                >
                                                                    {addingUserId === user.id ? (
                                                                        <LoaderCircleIcon className="h-4 w-4 animate-spin" />
                                                                    ) : (
                                                                        'Add'
                                                                    )}
                                                                </Button>
                                                            )}
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        ) : (
                                            <div className="px-4 py-2 text-gray-500">No users found</div>
                                        )}
                                    </Card>
                                )}
                            </div>
                        </div>

                        <div className="border-b border-dashed border-gray-300" />

                        {/* 🧾 User Table */}
                        <div>
                            <div className="mb-6 flex items-center justify-between">
                                <h1 className="text-lg font-medium text-gray-700">Users in Store #{storeSlug}</h1>
                                <Input
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-64 border-gray-300"
                                />
                            </div>

                            <Table>
                                <TableCaption>Users in store #{storeSlug}</TableCaption>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedUsers.length ? (
                                        paginatedUsers.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell>{user.name}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell className="text-right">
                                                    {/* <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-green-600 hover:text-green-800 cursor-pointer"
                                                        onClick={() => {
                                                            setSelectUser(user.id);
                                                            setOpenPermissionModal(true);
                                                        }}
                                                    >
                                                        <Construction className="h-4 w-4" />
                                                    </Button> */}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        disabled={deletingUserId === user.id}
                                                        onClick={() => {
                                                            setSelectUser(user.id);
                                                            setOpenConfirmDialog(true);
                                                        }}
                                                        className="text-red-600 hover:text-red-800 cursor-pointer"
                                                    >
                                                        {deletingUserId === user.id ? (
                                                            <LoaderCircleIcon className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center text-gray-500">
                                                No users found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="mt-4 flex items-center justify-center gap-2">
                                    <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
                                        Prev
                                    </Button>
                                    <span className="text-sm text-gray-700">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage((p) => p + 1)}
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                        </div>
                    </section>
                )}
            </div>

            {/* Confirm Delete Dialog */}
            {selectUser && (
                <ConfirmDialog
                    open={openConfirmDialog}
                    onOpenChange={setOpenConfirmDialog}
                    onConfirm={() => {
                        handleRemoveUser(selectUser);
                        setSelectUser(null);
                        setOpenConfirmDialog(false);
                    }}
                />
            )}
            {openPermissionModal && (
                <PermissionModal open={openPermissionModal} onOpenChange={setOpenPermissionModal} storeSlug={storeSlug} />
            )}
        </div>
    );
};

export default ManageUserModal;
