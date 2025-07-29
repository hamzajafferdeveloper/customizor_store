import ConfirmDialog from '@/components/confirm-dialog';
import CustomTableFooter from '@/components/table-footer';
import TableHeaderCustom from '@/components/table-header';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type Category } from '@/types/data';
import { CategoryPagination } from '@/types/pagination';
import { Head, router, usePage, Link } from '@inertiajs/react';
import { EllipsisVertical, Pen, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import EditCategoryModal from '@/pages/super-admin/logo-gallery/component/edit-logo-gallery-category';
import SuperAdminLayout from '@/layouts/super-admin-layout';
import CreateCategoryModal from "@/pages/super-admin/logo-gallery/component/create-logo-gallery-category";

type FlashProps = {
    success?: string;
    error?: string;
};

export default function GalleryCategory({ categories }: { categories: CategoryPagination }) {
    const page = usePage();
    const flash = (page.props as { flash?: FlashProps }).flash;

    const [openCreateCategoryModal, setOpenCreateCategoryModal] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [perPage, setPerPage] = useState<number>(parseInt(new URLSearchParams(window.location.search).get('per_page') || '10'));
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const handlePerPageChange = (value: number) => {
        setPerPage(value);
        router.get('/logo-gallery/category', { per_page: value }, { preserveState: true });
    };

    const handlePageChange = (url: string | null) => {
        if (url) {
            router.get(url, {}, { preserveState: true });
        }
    };

    const filterData = categories.data.filter((cat) => cat.name.toLowerCase().includes(searchValue.toLowerCase()));

    const handleDelete = () => {
        if (selectedCategory) {
            router.delete(route('superadmin.logo.gallery.category.delete', selectedCategory?.id));
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
                            setOpenCreateCategoryModal(!openCreateCategoryModal);
                        }}
                        searchTxt="Search Category by Name..."
                        heading='All Category'
                        desc='List all Of Category Available'
                        // desc2={`Total No of Color is: ${categories.total}`}
                    />

                    <Table>
                        <TableCaption>A list of categories.</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Category Name</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filterData.map((category) => (
                                <TableRow key={category.id}>
                                    <TableCell>
                                        <Link href={route('superadmin.logo.gallery', category.id)} >{category.name}</Link>
                                    </TableCell>
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
                                                        setSelectedCategory(category);
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
                                                        setSelectedCategory(category);
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
                title="Delete Logo Gallery Category"
                description={`Are you sure you want to delete "${selectedCategory?.name}"?. All logo related to this category will be deleted as well.`}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={handleDelete}
            />

            {openCreateCategoryModal && <CreateCategoryModal open={openCreateCategoryModal} onOpenChange={() => setOpenCreateCategoryModal(false)} />}
            {editOpen && selectedCategory && (
                <EditCategoryModal
                    open={editOpen}
                    selectedCategory={selectedCategory}
                    onOpenChange={() => {
                        setEditOpen(false);
                        setSelectedCategory(null);
                    }}
                />
            )}
        </SuperAdminLayout>
    );
}
