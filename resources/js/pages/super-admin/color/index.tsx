import ConfirmDialog from '@/components/confirm-dialog';
import CustomTableFooter from '@/components/table-footer';
import TableHeaderCustom from '@/components/table-header';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import SuperAdminLayout from '@/layouts/super-admin-layout';
import { Color } from '@/types/data';
import { ColorPagination } from '@/types/pagination';
import { Head, router, usePage } from '@inertiajs/react';
import { EllipsisVertical, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import CreateColorModal from './component/create-color';
import EditColorModal from './component/edit-modal';
import { Switch } from '@/components/ui/switch';

type FlashProps = {
    success?: string;
    error?: string;
};

export default function Category({ colors }: { colors: ColorPagination }) {
    const page = usePage();
    const flash = (page.props as { flash?: FlashProps }).flash;

    const [createCategoryModalOpen, setCreateCategoryModalOpen] = useState(false);
    const [editCategoryModalOpen, setEditCategoryModalOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [selectedColor, setSelectedColor] = useState<Color | null>(null);
    const [perPage, setPerPage] = useState<number>(parseInt(new URLSearchParams(window.location.search).get('per_page') || '10'));
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const handlePerPageChange = (value: number) => {
        setPerPage(value);
        router.get('/color', { per_page: value }, { preserveState: true });
    };

    const handlePageChange = (url: string | null) => {
        if (url) {
            router.get(url, {}, { preserveState: true });
        }
    };

    const filterData = colors.data.filter((cat) => cat.name.toLowerCase().includes(searchValue.toLowerCase()));

    const handleDelete = () => {
        if (selectedColor) {
            router.delete(route('superadmin.color.destroy', selectedColor?.id));
            setConfirmOpen(false);
        } else {
            toast.error('SomeThing Went Wrong. Please Try Again later!');
        }
    };

    const handleChangeColorType = (id: number, val: 'leather' | 'protection') => {
        router.put(route('superadmin.color.updateColorType', id), {
            color_type: val,
        });
    };

    return (
        <SuperAdminLayout breadcrumbs={[{ title: 'All Color', href: '/color' }]}>
            <Head title="Color" />
            <div className="flex-1 overflow-x-auto p-4">
                <div className="mx-auto max-w-xl rounded-lg border p-4 shadow">
                    <TableHeaderCustom
                        btnText="Create"
                        searchValue={searchValue}
                        setSearchValue={setSearchValue}
                        btnType="button"
                        btnFunc={() => {
                            setCreateCategoryModalOpen(!createCategoryModalOpen);
                        }}
                        searchTxt="Search Color by Name..."
                        heading="All Color"
                        desc="List all Of Color Available"
                        // desc2={`Total No of Color is: ${colors.total}`}
                    />

                    <Table>
                        <TableCaption>A list of color.</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Color Name</TableHead>
                                <TableHead>Color</TableHead>
                                <TableHead>Is Protection</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filterData.map((color) => (
                                <TableRow key={color.id}>
                                    <TableCell>{color.name}</TableCell>
                                    <TableCell>
                                        <div className="h-8 w-8 rounded-full" style={{ backgroundColor: color.hexCode }} />{' '}
                                    </TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={color.color_type === 'protection'}
                                            onCheckedChange={(checked) => handleChangeColorType(color.id, checked ? 'protection' : 'leather')}
                                        />
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
                                                        setSelectedColor(color);
                                                        setEditCategoryModalOpen(true);
                                                    }}
                                                >
                                                    <DropdownMenuItem className="cursor-pointer">
                                                        <Trash2 className="text-gray-900" /> <p className="text-gray-900">Edit</p>
                                                    </DropdownMenuItem>
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    className="mt-1 flex w-full justify-start bg-red-400/20"
                                                    onClick={() => {
                                                        setSelectedColor(color);
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
                        data={colors}
                    />
                </div>
            </div>

            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="Delete Color"
                description={`Are you sure you want to delete "${setSelectedColor?.name}"?`}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={handleDelete}
            />

            {createCategoryModalOpen && (
                <CreateColorModal open={createCategoryModalOpen} onOpenChange={() => setCreateCategoryModalOpen(!createCategoryModalOpen)} />
            )}
            {editCategoryModalOpen && selectedColor && (
                <EditColorModal
                    open={editCategoryModalOpen}
                    selectedColor={selectedColor}
                    onOpenChange={() => setEditCategoryModalOpen(!editCategoryModalOpen)}
                />
            )}
        </SuperAdminLayout>
    );
}
