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
import CreateProductTpyeModal from './component/create-product-type';
import EditProductTpyeModal from './component/edit-product-type';

type FlashProps = {
    success?: string;
    error?: string;
};

export default function Brands({ product_types }: { product_types: CategoryPagination }) {
    const page = usePage();
    const flash = (page.props as { flash?: FlashProps }).flash;

    const [openProductTypeModal, setOpenProductTpyeModal] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [selectedProductTpye, setSelectedProductTpye] = useState<Category | null>(null);
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

    const filterData = product_types.data.filter((cat) => cat.name.toLowerCase().includes(searchValue.toLowerCase()));

    const handleDelete = () => {
        if (selectedProductTpye) {
            router.delete(route('superadmin.product-type.destroy', selectedProductTpye?.id));
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
                            setOpenProductTpyeModal(!openProductTypeModal);
                        }}
                        searchTxt="Search product type by Name..."
                        heading="All Product Type"
                        desc="List all Of Product Type Available"
                        // desc2={`Total No of Color is: ${categories.total}`}
                    />

                    <Table>
                        <TableCaption>A list of product type.</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product Type Name</TableHead>

                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filterData.map((brand) => (
                                <TableRow key={brand.id}>
                                    <TableCell>{brand.name}</TableCell>

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
                                                        setSelectedProductTpye(brand);
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
                                                        setSelectedProductTpye(brand);
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
                        data={product_types}
                    />
                </div>
            </div>

            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="Delete Brand"
                description={`Are you sure you want to delete "${selectedProductTpye?.name}"?`}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={handleDelete}
            />

            {openProductTypeModal && <CreateProductTpyeModal open={openProductTypeModal} onOpenChange={() => setOpenProductTpyeModal(false)} />}
            {editOpen && selectedProductTpye && (
                <EditProductTpyeModal
                    open={editOpen}
                    selectedProductTpye={selectedProductTpye}
                    onOpenChange={() => {
                        setEditOpen(false);
                        setSelectedProductTpye(null);
                    }}
                />
            )}
        </SuperAdminLayout>
    );
}
