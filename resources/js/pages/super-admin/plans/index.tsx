import ConfirmDialog from '@/components/confirm-dialog';
import TableHeaderCustom from '@/components/table-header';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import SuperAdminLayout from '@/layouts/super-admin-layout';
import { FlashProps } from '@/types';
import { Permission, Plan } from '@/types/data';
import { Head, router, usePage } from '@inertiajs/react';
import { EllipsisVertical, Pen, SquareKanban, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import CreatePlanModal from './compoenents/create-plan';
import EditPlanModal from './compoenents/edit-plan';
import PermissionsModal from './compoenents/permissions';

const StoreType = ({ plans, permissions }: { plans: Plan[], permissions: Permission[] }) => {
    const page = usePage();
    const flash = (page.props as { flash?: FlashProps }).flash;

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const [createPlanModalOpen, setCreatePlanModalOpen] = useState(false);
    const [editPlanModalOpen, setEditPlanModalOpen] = useState(false);
    const [permissionModalOpen, setPermissionModalOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const handleDelete = () => {
        if (selectedPlan) {
            router.delete(route('superadmin.plan.destroy', selectedPlan?.id));
            setConfirmOpen(false);
        } else {
            toast.error('SomeThing Went Wrong. Please Try Again later!');
        }
    };

    const filterData = plans.filter((cat) => cat.name.toLowerCase().includes(searchValue.toLowerCase()));
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
                            setCreatePlanModalOpen(!createPlanModalOpen);
                        }}
                        searchTxt="Search Plan by Name..."
                        heading="All Plans"
                        desc="List all Of Plan Available for stores"
                        // desc2={`Total No of Color is: ${colors.total}`}
                    />
                    <Table>
                        <TableCaption>A list of categories.</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Plan Name</TableHead>
                                <TableHead>Plan Price</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filterData.map((plan) => (
                                <TableRow key={plan.id}>
                                    <TableCell>{plan.name}</TableCell>
                                    <TableCell>${plan.price}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger>
                                                <EllipsisVertical className="h-5 w-5 cursor-pointer" />
                                            </DropdownMenuTrigger>

                                            <DropdownMenuContent className="space-y-2">
                                                <Button
                                                    variant="ghost"
                                                    className="flex w-full cursor-pointer justify-start text-gray-900"
                                                    onClick={() => {
                                                        setSelectedPlan(plan);
                                                        setPermissionModalOpen(true);
                                                    }}
                                                >
                                                    <DropdownMenuItem className='cursor-pointer'>
                                                        <SquareKanban /> Permissions
                                                    </DropdownMenuItem>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    className="flex w-full cursor-pointer justify-start text-gray-900"
                                                    onClick={() => {
                                                        setSelectedPlan(plan);
                                                        setEditPlanModalOpen(true);
                                                    }}
                                                >
                                                    <DropdownMenuItem className='cursor-pointer'>
                                                        <Pen /> Edit
                                                    </DropdownMenuItem>
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    className="mt-1 flex w-full justify-start bg-red-400/20"
                                                    onClick={() => {
                                                        setSelectedPlan(plan);
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
                </div>
            </div>
            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="Delete Plan"
                description={`Are you sure you want to delete "${selectedPlan?.name}"? All store related to this plan will be lost.`}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={handleDelete}
            />
            {/* Create Plan Modal */}
            <CreatePlanModal open={createPlanModalOpen} onOpenChange={() => setCreatePlanModalOpen(false)} />
            {editPlanModalOpen && selectedPlan && (
                <EditPlanModal
                    open={editPlanModalOpen}
                    plan={selectedPlan}
                    onOpenChange={() => {
                        setSelectedPlan(null);
                        setEditPlanModalOpen(false);
                    }}
                />
            )}
            {permissionModalOpen && permissions && selectedPlan && (
                <PermissionsModal
                    open={permissionModalOpen}
                    plan={selectedPlan}
                    permissions={permissions}
                    onOpenChange={() => {
                        setSelectedPlan(null);
                        setPermissionModalOpen(false);
                    }}
                />
            )}
        </SuperAdminLayout>
    );
};

export default StoreType;
