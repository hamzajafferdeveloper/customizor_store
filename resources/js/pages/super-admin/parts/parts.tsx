import ConfirmDialog from '@/components/confirm-dialog';
import CustomTableFooter from '@/components/table-footer';
import TableHeaderCustom from '@/components/table-header';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type Category } from '@/types/data';
import { LogoGalleryPagination, PartPagination } from '@/types/pagination';
import { Head, router, usePage, Link } from '@inertiajs/react';
import { EllipsisVertical, Pen, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import SuperAdminLayout from '@/layouts/super-admin-layout';
import EditCategoryModal from '@/pages/super-admin/logo-gallery/component/edit-logo-gallery-category';
import CreateLogoModal from "@/pages/super-admin/logo-gallery/component/create-logo";
import CreatePartModal from './component/create-part';

type FlashProps = {
    success?: string;
    error?: string;
};

export default function Parts({ parts, category }: { parts: PartPagination, category: Category }) {
    const page = usePage();
    const flash = (page.props as { flash?: FlashProps }).flash;

    const [openCreatePartModal, setOpenCreatePartModal] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [selectedPart, setSelectedPart] = useState<Category | null>(null);
    const [perPage, setPerPage] = useState<number>(parseInt(new URLSearchParams(window.location.search).get('per_page') || '10'));
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const handlePerPageChange = (value: number) => {
        setPerPage(value);
        router.get(`/parts/category=${category.id}`, { per_page: value }, { preserveState: true });
    };

    const handlePageChange = (url: string | null) => {
        if (url) {
            router.get(url, {}, { preserveState: true });
        }
    };

    const filterData = parts.data.filter((part) => part.name.toLowerCase().includes(searchValue.toLowerCase()));

    const handleDelete = () => {
        if (selectedPart) {
            router.delete(route('superadmin.parts.destroy', selectedPart?.id));
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

                            setOpenCreatePartModal(!openCreatePartModal);
                        }}
                        searchTxt="Search Category by Name..."
                        heading='All Parts'
                        desc={`List all of parts related to ${category.name}`}
                        // desc2={`Total No of Color is: ${categories.total}`}
                    />

                    <Table>
                        <TableCaption>A list of Parts.</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Part</TableHead>
                                <TableHead>Part Name</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filterData.map((part) => (
                                <TableRow key={part.id}>
                                    <TableCell>
                                        <img src={`/storage/${part.path}`} className="h-10 w-10" />
                                    </TableCell>
                                    <TableCell>
                                        {part.name}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger>
                                                <EllipsisVertical className="h-5 w-5 cursor-pointer" />
                                            </DropdownMenuTrigger>

                                            <DropdownMenuContent className="space-y-2">
                                                {/*<Button*/}
                                                {/*    variant="ghost"*/}
                                                {/*    className="flex w-full cursor-pointer justify-start bg-gray-400/20 text-gray-900"*/}
                                                {/*    onClick={() => {*/}
                                                {/*        setSelectedLogo(logo);*/}
                                                {/*        setEditOpen(true);*/}
                                                {/*    }}*/}
                                                {/*>*/}
                                                {/*    <DropdownMenuItem>*/}
                                                {/*        <Pen /> Edit*/}
                                                {/*    </DropdownMenuItem>*/}
                                                {/*</Button>*/}

                                                <Button
                                                    variant="ghost"
                                                    className="mt-1 flex w-full justify-start bg-red-400/20"
                                                    onClick={() => {
                                                        setSelectedPart(part);
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
                        data={parts}
                    />
                </div>
            </div>

            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="Delete Logo Gallery Category"
                description={`Are you sure you want to delete "${selectedPart?.name}"?`}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={handleDelete}
            />

            {openCreatePartModal && <CreatePartModal open={openCreatePartModal} onOpenChange={() => setOpenCreatePartModal(false)} categoryId={category.id} />}
            {/*{editOpen && selectedCategory && (*/}
            {/*    <EditCategoryModal*/}
            {/*        open={editOpen}*/}
            {/*        selectedCategory={selectedCategory}*/}
            {/*        onOpenChange={() => {*/}
            {/*            setEditOpen(false);*/}
            {/*            setSelectedCategory(null);*/}
            {/*        }}*/}
            {/*    />*/}
            {/*)}*/}
        </SuperAdminLayout>
    );
}
