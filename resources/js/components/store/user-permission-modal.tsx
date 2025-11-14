import { router } from "@inertiajs/react";
import { LoaderCircleIcon, X, CheckCircle2, CircleOff, Clock } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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
  storeId: string;
};

const PermissionModal = ({ open, onOpenChange, storeId }: Props) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [storePermissions, setStorePermissions] = useState<Permission[]>([]);
  const [requestedPermissions, setRequestedPermissions] = useState<Permission[]>([]);
  const [storeExtraPermissions, setStoreExtraPermissions] = useState<Permission[]>([]);

  useEffect(() => {
    if (open) {
      setIsLoading(true);
      fetch(`/${storeId}/permissions`)
        .then((response) => response.json())
        .then((data) => {
          setAllPermissions(data.all_permissions || []);
          setStorePermissions(data.store_permissions || []);
          setRequestedPermissions(data.requested_permissions || []);
          setStoreExtraPermissions(data.store_extra_permissions || []);
          setIsLoading(false);
        });
    }
  }, [open, storeId]);

  const handleOutsideClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onOpenChange(false);
  };

  console.log('storePermissions', storePermissions);
  console.log('requestedPermissions', requestedPermissions);
  console.log('storeExtraPermissions', storeExtraPermissions);

  const hasPermission = (permissionId: number) => {
    return storePermissions.some((p) => p.id === permissionId) || storeExtraPermissions.some((p) => p.permission_id === permissionId);
  };

  const hasRequestedPermission = (permissionId: number) => {
    return requestedPermissions.some((p) => p.permission_id === permissionId);
  };

  const handleRequestPermission = (permissionId: number) => {
    router.post(`/${storeId}/request-extra-permission/${permissionId}`, {}, {
      onSuccess: () => {
        // Add to requestedPermissions list optimistically
        const requested = allPermissions.find(p => p.id === permissionId);
        if (requested && !hasRequestedPermission(permissionId)) {
          setRequestedPermissions(prev => [...prev, requested]);
        }
      }
    });
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOutsideClick}
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div className="relative z-50 h-[90vh] w-[90vw] max-w-5xl overflow-auto rounded-xl border border-gray-300 bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-800">
            Store Permissions
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className="text-gray-600 hover:text-black"
          >
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
                      ? "border-green-400 bg-green-50"
                      : requested
                      ? "border-yellow-400 bg-yellow-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-800 capitalize">
                        {permission.key.replace("_", " ")}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {permission.description}
                      </p>
                    </div>

                    {active ? (
                      <CheckCircle2 className="text-green-500 h-5 w-5" />
                    ) : requested ? (
                      <Clock className="text-yellow-500 h-5 w-5" />
                    ) : (
                      <CircleOff className="text-gray-400 h-5 w-5" />
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
                    <div className="mt-3 w-full rounded-md bg-yellow-200 px-3 py-2 text-sm font-medium text-yellow-800 text-center">
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
