import ConfirmDialog from '@/components/confirm-dialog';
import CustomTableFooter from '@/components/table-footer';
import TableHeaderCustom from '@/components/table-header';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import SuperAdminLayout from '@/layouts/super-admin-layout';
import { FlashProps } from '@/types';
import { Category, CreateOwnProductType } from '@/types/data';
import { CreateOwnProductPagination } from '@/types/pagination';
import { Head, router, usePage } from '@inertiajs/react';
import { EllipsisVertical, Pen, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import CreateOwnProductModal from './components/create-own-product-add-modal';
import CreateOwnProductEditModal from './components/create-own-product-edit-modal';

const CreateYourOwnProduct = ({ categories, CreateOwnProduct }: { categories: Category[]; CreateOwnProduct: CreateOwnProductPagination }) => {
    const page = usePage();
    const flash = (page.props as { flash?: FlashProps }).flash;

    const [searchValue, setSearchValue] = useState<string>('');
    const [createOwnProductModalOpen, setCreateOwnProductModalOpen] = useState<boolean>(false);
    const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
    const [editOpen, setEditOpen] = useState<boolean>(false);
    const [selectedCop, setSelectedCop] = useState<CreateOwnProductType | null>(null);
    const [perPage, setPerPage] = useState<number>(parseInt(new URLSearchParams(window.location.search).get('per_page') || '10'));

    const filterData = CreateOwnProduct.data.filter((cop) => cop.category.name.toLowerCase().includes(searchValue.toLowerCase()));

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const handleDelete = () => {
        if (selectedCop) {
            router.delete(route('superadmin.create-your-own-product.destroy', selectedCop?.id));
            setConfirmOpen(false);
        } else {
            toast.error('SomeThing Went Wrong. Please Try Again later!');
        }
    };

    const handlePerPageChange = (value: number) => {
        setPerPage(value);
        router.get('/create-your-own-product/index', { per_page: value }, { preserveState: true });
    };

    const handlePageChange = (url: string | null) => {
        if (url) {
            router.get(url, {}, { preserveState: true });
        }
    };

    return (
        <SuperAdminLayout breadcrumbs={[{ title: 'All Images Of Create Your Own Product', href: '/admin/plans' }]}>
            <Head title="Store Plans" />
            <div className="flex-1 overflow-x-auto p-4">
                <div className="mx-auto max-w-xl rounded-lg border p-4 shadow">
                    <TableHeaderCustom
                        btnText="Create"
                        searchValue={searchValue}
                        setSearchValue={setSearchValue}
                        btnType="button"
                        btnFunc={() => {
                            setCreateOwnProductModalOpen(true);
                        }}
                        searchTxt="Search Image By Category Name..."
                        heading="All Own Products Images"
                        desc="List all Of Product Available"
                        // desc2={`Total No of Color is: ${colors.total}`}
                    />
                    <Table>
                        <TableCaption>A list of color.</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Category Name</TableHead>
                                <TableHead>Image</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filterData.map((cop) => (
                                <TableRow key={cop.id}>
                                    <TableCell>{cop.category.name}</TableCell>
                                    <TableCell>
                                        <img src={`/storage/${cop.image}`} className="h-20 w-20" alt="" />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger>
                                                <EllipsisVertical className="h-5 w-5 cursor-pointer" />
                                            </DropdownMenuTrigger>

                                            <DropdownMenuContent className="space-y-2">
                                                <Button
                                                    variant="ghost"
                                                    className="mt-1 flex w-full justify-start bg-gray-400/20"
                                                    onClick={() => {
                                                        setSelectedCop(cop);
                                                        setEditOpen(true);
                                                    }}
                                                >
                                                    <DropdownMenuItem className="cursor-pointer">
                                                        <Pen className="text-gray-900" /> <p className="text-gray-900">Edit</p>
                                                    </DropdownMenuItem>
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    className="mt-1 flex w-full justify-start bg-red-400/20"
                                                    onClick={() => {
                                                        setSelectedCop(cop);
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
                            <CustomTableFooter
                                perPage={perPage}
                                handlePerPageChange={handlePerPageChange}
                                handlePageChange={handlePageChange}
                                data={CreateOwnProduct}
                            />
                        </TableBody>
                    </Table>
                </div>
            </div>
            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="Delete Product"
                description={`Are you sure you want to delete the image of "${selectedCop?.category?.name}"?`}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={handleDelete}
            />

            {editOpen && selectedCop && (
                <CreateOwnProductEditModal
                    open={editOpen}
                    categories={categories}
                    Copdata={selectedCop} // ✅ match the prop name in modal
                    onOpenChange={setEditOpen} // ✅ update edit state
                />
            )}

            {createOwnProductModalOpen && (
                <CreateOwnProductModal open={createOwnProductModalOpen} categories={categories} onOpenChange={setCreateOwnProductModalOpen} />
            )}
        </SuperAdminLayout>
    );
};

export default CreateYourOwnProduct;
