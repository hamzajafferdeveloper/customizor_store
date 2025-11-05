import { LoaderCircleIcon, X, CheckCircle2, CircleOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Permission = {
  id: number;
  key: string;
  description: string;
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

  useEffect(() => {
    if (open) {
      setIsLoading(true);
      fetch(`/${storeId}/permissions`)
        .then((response) => response.json())
        .then((data) => {
          setAllPermissions(data.all_permissions || []);
          setStorePermissions(data.store_permissions || []);
          setIsLoading(false);
        });
    }
  }, [open, storeId]);

  const handleOutsideClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onOpenChange(false);
  };

  const hasPermission = (permissionId: number) => {
    return storePermissions.some((p) => p.id === permissionId);
  };

  const handleRequestPermission = (permissionId: number) => {
    // You can update this to send an API call later
    alert(`Request sent for permission ID: ${permissionId}`);
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

              return (
                <div
                  key={permission.id}
                  className={`rounded-xl border p-4 shadow-sm transition-all ${
                    active
                      ? "border-green-400 bg-green-50"
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
                    ) : (
                      <CircleOff className="text-gray-400 h-5 w-5" />
                    )}
                  </div>

                  {/* Footer Button */}
                  {!active && (
                    <button
                      onClick={() => handleRequestPermission(permission.id)}
                      className="mt-3 w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      Request Access
                    </button>
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
