import { router } from '@inertiajs/react';
import { CheckCircle2, CircleOff, Clock, LoaderCircleIcon, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type Permission = {
    id: number;
    key: string;
    description: string;
    limit: string | null;
    permission_id: number;
    pivot?: {
        is_enabled?: number;
    };
};

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    storeSlug: string;
};

const PermissionModal = ({ open, onOpenChange, storeSlug }: Props) => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const overlayRef = useRef<HTMLDivElement | null>(null);
    const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
    const [storePermissions, setStorePermissions] = useState<Permission[]>([]);
    const [requestedPermissions, setRequestedPermissions] = useState<Permission[]>([]);
    const [storeExtraPermissions, setStoreExtraPermissions] = useState<Permission[]>([]);

    useEffect(() => {
        if (open) {
            setIsLoading(true);
            fetch(`/${storeSlug}/permissions`)
                .then((response) => response.json())
                .then((data) => {
                    setAllPermissions(data.all_permissions || []);
                    setStorePermissions(data.store_permissions || []);
                    setRequestedPermissions(data.requested_permissions || []);
                    setStoreExtraPermissions(data.store_extra_permissions || []);
                    setIsLoading(false);
                });
        }
    }, [open, storeSlug]);

    const handleOutsideClick = (e: React.MouseEvent) => {
        if (e.target === overlayRef.current) onOpenChange(false);
    };

    const hasPermission = (permissionId: number) => {
        return storePermissions.some((p) => p.id === permissionId) || storeExtraPermissions.some((p) => p.permission_id === permissionId);
    };

    const hasRequestedPermission = (permissionId: number) => {
        return requestedPermissions.some((p) => p.permission_id === permissionId || p.id === permissionId);
    };

    const handleRequestPermission = (permissionId: number) => {
        router.post(
            `/${storeSlug}/request-extra-permission/${permissionId}`,
            {},
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    if (!hasRequestedPermission(permissionId)) {
                        setRequestedPermissions((prev) => [...prev, { permission_id: permissionId } as Permission]);
                    }
                },
            },
        );
    };

    return (
        <div
            ref={overlayRef}
            onClick={handleOutsideClick}
            className="fixed inset-0 z-80 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
            <div className="relative z-50 h-[90vh] w-[90vw] max-w-5xl overflow-auto rounded-xl border border-gray-300 bg-white p-6 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold text-gray-800">Store Permissions</h2>
                    <button onClick={() => onOpenChange(false)} className="text-gray-600 hover:text-black">
                        <X className="h-6 w-6 cursor-pointer" />
                    </button>
                </div>

                {/* Loader */}
                {isLoading ? (
                    <div className="flex h-[70vh] items-center justify-center">
                        <LoaderCircleIcon className="h-8 w-8 animate-spin text-gray-500" />
                    </div>
                ) : (
                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {allPermissions.map((permission) => {
                            const active = hasPermission(permission.id);
                            const requested = hasRequestedPermission(permission.id);

                            return (
                                <div
                                    key={permission.id}
                                    className={`rounded-xl border p-4 shadow-sm transition-all ${
                                        active
                                            ? 'border-green-400 bg-green-50'
                                            : requested
                                              ? 'border-yellow-400 bg-yellow-50'
                                              : 'border-gray-200 bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-800 capitalize">{permission.key.replace('_', ' ')}</h3>
                                            <p className="mt-1 text-xs text-gray-500">{permission.description}</p>
                                        </div>

                                        {active ? (
                                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                                        ) : requested ? (
                                            <Clock className="h-5 w-5 text-yellow-500" />
                                        ) : (
                                            <CircleOff className="h-5 w-5 text-gray-400" />
                                        )}
                                    </div>

                                    {/* Footer Button */}
                                    {!active && !requested && (
                                        <button
                                            onClick={() => handleRequestPermission(permission.id)}
                                            className="mt-3 w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                        >
                                            Request Access
                                        </button>
                                    )}

                                    {/* Requested State */}
                                    {requested && !active && (
                                        <div className="mt-3 w-full rounded-md bg-yellow-200 px-3 py-2 text-center text-sm font-medium text-yellow-800">
                                            Requested
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PermissionModal;
