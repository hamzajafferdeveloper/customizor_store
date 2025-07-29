import ConfirmDialog from '@/components/confirm-dialog';
import CustomTableFooter from '@/components/table-footer';
import TableHeaderCustom from '@/components/table-header';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type Category } from '@/types/data';
import { LogoGalleryPagination } from '@/types/pagination';
import { Head, router, usePage, Link } from '@inertiajs/react';
import { EllipsisVertical, Pen, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import SuperAdminLayout from '@/layouts/super-admin-layout';
import EditCategoryModal from '@/pages/super-admin/logo-gallery/component/edit-logo-gallery-category';
import CreateLogoModal from "@/pages/super-admin/logo-gallery/component/create-logo";

type FlashProps = {
    success?: string;
    error?: string;
};

export default function GalleryCategory({ logos, category }: { logos: LogoGalleryPagination, category: Category }) {
    const page = usePage();
    const flash = (page.props as { flash?: FlashProps }).flash;

    const [openCreateLogoModal, setOpenCreateLogoModal] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [selectedLogo, setSelectedLogo] = useState<Category | null>(null);
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

    const filterData = logos.data.filter((cat) => cat.name.toLowerCase().includes(searchValue.toLowerCase()));

    const handleDelete = () => {
        if (selectedLogo) {
            router.delete(route('superadmin.logo.gallery.delete', selectedLogo?.id));
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

                            setOpenCreateLogoModal(!openCreateLogoModal);
                        }}
                        searchTxt="Search Category by Name..."
                        heading='All Logos'
                        desc={`List all Of Logos Related To ${category.name}`}
                        // desc2={`Total No of Color is: ${categories.total}`}
                    />

                    <Table>
                        <TableCaption>A list of Logos.</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Logo</TableHead>
                                <TableHead>Logo Name</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filterData.map((logo) => (
                                <TableRow key={logo.id}>
                                    <TableCell>
                                        <img src={`/storage/${logo.source}`} className="h-10 w-10" />
                                    </TableCell>
                                    <TableCell>
                                        {logo.name}
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
                                                        setSelectedLogo(logo);
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
                        data={logos}
                    />
                </div>
            </div>

            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="Delete Logo Gallery Category"
                description={`Are you sure you want to delete "${selectedLogo?.name}"?`}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={handleDelete}
            />

            {openCreateLogoModal && <CreateLogoModal open={openCreateLogoModal} onOpenChange={() => setOpenCreateLogoModal(false)} categoryId={category.id} />}
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
