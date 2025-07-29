import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Permission, Plan } from '@/types/data';
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

type Props = {
    open: boolean;
    onOpenChange: () => void;
    plan: Plan;
    permissions: Permission[];
};

const PermissionsModal = ({ open, onOpenChange, plan, permissions }: Props) => {
    const [assigned, setAssigned] = useState<{ [key: number]: { is_enabled: boolean; limit: number | null } }>({});

    useEffect(() => {
        if (open) {
            const initialAssigned: any = {};
            plan.permissions?.forEach((perm) => {
                initialAssigned[perm.id] = {
                    // @ts-ignore
                    is_enabled: perm.pivot.is_enabled,
                    // @ts-ignore
                    limit: perm.pivot.limit,
                };
            });
            setAssigned(initialAssigned);
        }
    }, [open, plan]);

    const updateAssigned = (id: number, field: 'is_enabled' | 'limit', value: any) => {
        setAssigned((prev) => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: value,
            },
        }));
    };

    const handleSave = () => {
        router.post(route('plans.updatePermissions', plan.id), { permissions: assigned }, {
            onSuccess: () => onOpenChange(),
        });
    };

    const numericPermissions = ['image', 'text', 'products'];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl rounded-2xl shadow-xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Manage Permissions</DialogTitle>
                    <DialogDescription className="text-gray-500">
                        Update permissions for plan: <span className="font-semibold">{plan.name}</span>. If any thing is unlimited then don't entry any value to input.
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4 max-h-[400px] overflow-y-auto custom-scrollbar px-2 space-y-3">
                    {permissions.map((perm) => {
                        const current = assigned[perm.id] || { is_enabled: false, limit: null };
                        const isNumeric = numericPermissions.includes(perm.key);

                        return (
                            <div key={perm.id} className="flex items-center justify-between border-b py-2">
                                <div>
                                    <p className="font-semibold capitalize">{perm.key.replace('_', ' ')}</p>
                                    <p className="text-xs text-gray-500">{perm.description}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Switch
                                        checked={current.is_enabled}
                                        onCheckedChange={(val) => updateAssigned(perm.id, 'is_enabled', val)}
                                    />
                                    {isNumeric && current.is_enabled && (
                                        <Input
                                            type="number"
                                            className="w-20"
                                            value={current.limit || ''}
                                            placeholder="0"
                                            onChange={(e) => updateAssigned(perm.id, 'limit', parseInt(e.target.value) || 0)}
                                        />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex justify-end gap-3 mt-4">
                    <Button variant="outline" onClick={() => onOpenChange()}>Cancel</Button>
                    <Button onClick={handleSave}>Save Changes</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default PermissionsModal;
