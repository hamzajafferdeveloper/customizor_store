import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { SharedData } from '@/types';
import { StoreData } from '@/types/store';
import { Link, router, usePage } from '@inertiajs/react';
import { Settings } from 'lucide-react';
import { StoreInfo } from './store-info';

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
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex flex-col gap-2 px-1 py-1.5 text-left text-sm">
                    <StoreInfo store={store} showEmail={true} />
                    <Link href="/">
                        <UserInfo user={user} showEmail={true} />
                    </Link>
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link className="block w-full cursor-pointer" href={route('store.profile', store.id)} as="button" prefetch onClick={cleanup}>
                        <Settings className="mr-2" />
                        Settings
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
        </>
    );
}
