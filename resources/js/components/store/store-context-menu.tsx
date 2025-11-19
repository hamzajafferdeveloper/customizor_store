import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { SharedData } from '@/types';
import { StoreData } from '@/types/store';
import { Link, router, usePage } from '@inertiajs/react';
import { LogOutIcon, Settings } from 'lucide-react';

interface UserMenuContentProps {
    store: StoreData;
}

export function StoreMenuContent({ store }: UserMenuContentProps) {
    const cleanup = useMobileNavigation();
    const { auth } = usePage<SharedData>().props;

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    const user = auth?.user;

    return (
        <>
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link
                        className="block w-full cursor-pointer"
                        href={route('store.profile', { storeSlug: store.slug })}
                        as="button"
                        prefetch
                        onClick={cleanup}
                    >
                        <Settings className="mr-2" />
                        Settings
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link
                        className="block w-full cursor-pointer"
                        href={route('logout')}
                        method="post"
                        as="button"
                        prefetch
                        onClick={cleanup}
                    >
                        <LogOutIcon className="mr-2" />
                        Logout
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
        </>
    );
}
