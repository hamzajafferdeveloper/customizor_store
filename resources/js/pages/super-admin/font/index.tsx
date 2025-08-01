import ConfirmDialog from '@/components/confirm-dialog';
import CustomTableFooter from '@/components/table-footer';
import TableHeaderCustom from '@/components/table-header';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import SuperAdminLayout from '@/layouts/super-admin-layout';
import { FlashProps } from '@/types';
import { Font } from '@/types/data';
import { FontPagination } from '@/types/pagination';
import { Head, router, usePage } from '@inertiajs/react';
import { EllipsisVertical, Pen, SquareKanban, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import AssignStoreModal from './components/assign-store';
import CreateFontModal from './components/create-font';
import EditFontModal from './components/edit-font';

export type Plan = {
    id: number;
    name: string;
};

const FontPage = ({ fonts, plans }: { fonts: FontPagination, plans: Plan[] }) => {
    const page = usePage();
    const flash = (page.props as { flash?: FlashProps }).flash;

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const [perPage, setPerPage] = useState<number>(parseInt(new URLSearchParams(window.location.search).get('per_page') || '10'));
    const [createFontModalOpen, setCreateFontModalOpen] = useState(false);
    const [editFontModalOpen, setEditFontModalOpen] = useState(false);
    const [selectedFont, setSelectedFont] = useState<Font | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [assignFontModal, setAssignFontModal] = useState(false);

    const [searchValue, setSearchValue] = useState('');

    const handlePerPageChange = (value: number) => {
        setPerPage(value);
        router.get('/font', { per_page: value }, { preserveState: true });
    };

    const handlePageChange = (url: string | null) => {
        if (url) {
            router.get(url, {}, { preserveState: true });
        }
    };

    const filterData = fonts.data.filter((font) => font.name.toLowerCase().includes(searchValue.toLowerCase()));

    const handleDelete = () => {
        if (selectedFont) {
            router.delete(route('superadmin.fonts.destroy', selectedFont?.id));
            setConfirmOpen(false);
        } else {
            toast.error('SomeThing Went Wrong. Please Try Again later!');
        }
    };

    return (
        <SuperAdminLayout breadcrumbs={[{ title: 'All Store Plan', href: '/admin/plans' }]}>
            <Head title="Store Plans" />
            <div className="flex-1 overflow-x-auto p-4">
                <div className="mx-auto max-w-xl rounded-lg border p-4 shadow">
                    <TableHeaderCustom
                        btnText="Create"
                        searchValue={searchValue}
                        setSearchValue={setSearchValue}
                        btnType="button"
                        btnFunc={() => {
                            setCreateFontModalOpen(true);
                        }}
                        searchTxt="Search Font by Name..."
                        heading="All Fonts"
                        desc="List all Of Fonts Available"
                        // desc2={`Total No of Color is: ${colors.total}`}
                    />
                    <Table>
                        <TableCaption>A list of fonts.</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Font Name</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filterData.map((font) => (
                                <TableRow key={font.id}>
                                    <TableCell>{font.name}</TableCell>
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
                                                        setSelectedFont(font);
                                                        setAssignFontModal(true);
                                                    }}
                                                >
                                                    <DropdownMenuItem className="cursor-pointer">
                                                        <SquareKanban className="text-gray-900" /> <p className="text-gray-900">Store</p>
                                                    </DropdownMenuItem>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    className="mt-1 flex w-full justify-start bg-gray-400/20"
                                                    onClick={() => {
                                                        setSelectedFont(font);
                                                        setEditFontModalOpen(true);
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
                                                        setSelectedFont(font);
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
                    <CustomTableFooter perPage={perPage} handlePerPageChange={handlePerPageChange} handlePageChange={handlePageChange} data={fonts} />
                </div>
            </div>
            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="Delete Font"
                description={`Are you sure you want to delete "${selectedFont?.name}"?`}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={handleDelete}
            />
            <CreateFontModal open={createFontModalOpen} onOpenChange={() => setCreateFontModalOpen(false)} />
            {selectedFont && (
                <EditFontModal
                    open={editFontModalOpen}
                    onOpenChange={() => {
                        setEditFontModalOpen(false);
                        setSelectedFont(null);
                    }}
                    selectedFont={selectedFont}
                />
            )}
            {selectedFont && (
                <AssignStoreModal
                    open={assignFontModal}
                    onOpenChange={() => {
                        setAssignFontModal(false);
                        setSelectedFont(null);
                    }}
                    selectedFont={selectedFont}
                    plans={plans}
                />
            )}
        </SuperAdminLayout>
    );
};

export default FontPage;
