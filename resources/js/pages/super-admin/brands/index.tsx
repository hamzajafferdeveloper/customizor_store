import ConfirmDialog from '@/components/confirm-dialog';
import CustomTableFooter from '@/components/table-footer';
import TableHeaderCustom from '@/components/table-header';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import SuperAdminLayout from '@/layouts/super-admin-layout';
import { type Category } from '@/types/data';
import { CategoryPagination } from '@/types/pagination';
import { Head, router, usePage } from '@inertiajs/react';
import { EllipsisVertical, Pen, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import CategoryModal from './component/create-brands';
import EditBrandModal from './component/edit-modal';

type FlashProps = {
    success?: string;
    error?: string;
};

export default function Brands({ categories }: { categories: CategoryPagination }) {
    const page = usePage();
    const flash = (page.props as { flash?: FlashProps }).flash;

    const [openBrandModal, setOpenBrandModal] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [selectedBrands, setselectedBrands] = useState<Category | null>(null);
    const [perPage, setPerPage] = useState<number>(parseInt(new URLSearchParams(window.location.search).get('per_page') || '10'));
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const handlePerPageChange = (value: number) => {
        setPerPage(value);
        router.get('/category', { per_page: value }, { preserveState: true });
    };

    const handlePageChange = (url: string | null) => {
        if (url) {
            router.get(url, {}, { preserveState: true });
        }
    };

    const filterData = categories.data.filter((cat) => cat.name.toLowerCase().includes(searchValue.toLowerCase()));

    const handleDelete = () => {
        if (selectedBrands) {
            router.delete(route('superadmin.brand.destroy', selectedBrands?.id));
            setConfirmOpen(false);
        } else {
            toast.error('SomeThing Went Wrong. Please Try Again later!');
        }
    };

    return (
        <SuperAdminLayout breadcrumbs={[{ title: 'All Category', href: '/category' }]}>
            <Head title="Category" />
            <div className="flex-1 overflow-x-auto p-4">
                <div className="mx-auto max-w-xl rounded-lg border p-4 shadow">
                    <TableHeaderCustom
                        btnText="Create"
                        searchValue={searchValue}
                        setSearchValue={setSearchValue}
                        btnType="button"
                        btnFunc={() => {
                            setOpenBrandModal(!openBrandModal);
                        }}
                        searchTxt="Search brands by Name..."
                        heading="All Brands"
                        desc="List all Of Brands Available"
                        // desc2={`Total No of Color is: ${categories.total}`}
                    />

                    <Table>
                        <TableCaption>A list of categories.</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Brand Name</TableHead>
                                <TableHead>Short Slug</TableHead>

                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filterData.map((brand) => (
                                <TableRow key={brand.id}>
                                    <TableCell>{brand.name}</TableCell>
                                    <TableCell>{brand.slug_short}</TableCell>

                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger>
                                                <EllipsisVertical className="h-5 w-5 cursor-pointer" />
                                            </DropdownMenuTrigger>

                                            <DropdownMenuContent className="space-y-2">
                                                <Button
                                                    variant="ghost"
                                                    className="flex w-full cursor-pointer justify-start bg-gray-400/20 text-gray-900"
                                                    onClick={() => {
                                                        setselectedBrands(brand);
                                                        setEditOpen(true);
                                                    }}
                                                >
                                                    <DropdownMenuItem>
                                                        <Pen /> Edit
                                                    </DropdownMenuItem>
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    className="mt-1 flex w-full justify-start bg-red-400/20"
                                                    onClick={() => {
                                                        setselectedBrands(brand);
                                                        setConfirmOpen(true);
                                                    }}
                                                >
                                                    <DropdownMenuItem className="cursor-pointer">
                                                        <Trash2 className="text-red-900" /> <p className="text-red-900">Delete</p>
                                                    </DropdownMenuItem>
                                                </Button>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <CustomTableFooter
                        perPage={perPage}
                        handlePerPageChange={handlePerPageChange}
                        handlePageChange={handlePageChange}
                        data={categories}
                    />
                </div>
            </div>

            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="Delete Brand"
                description={`Are you sure you want to delete "${selectedBrands?.name}"?`}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={handleDelete}
            />

            {openBrandModal && <CategoryModal open={openBrandModal} onOpenChange={() => setOpenBrandModal(false)} />}
            {editOpen && selectedBrands && (
                <EditBrandModal
                    open={editOpen}
                    selectedBrands={selectedBrands}
                    onOpenChange={() => {
                        setEditOpen(false);
                        setselectedBrands(null);
                    }}
                />
            )}
        </SuperAdminLayout>
    );
}
