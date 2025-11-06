import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { StoreData } from '@/types/store';

export function StoreInfo({ store, showEmail = false }: { store: StoreData; showEmail?: boolean }) {
    const getInitials = useInitials();

    return (
        <div className='flex items-center gap-2'>
            <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                <AvatarImage src={`/storage/${store.logo}`} alt={store.name} />
                <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                    {getInitials(store.name)}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{store.name}</span>
                {showEmail && <span className="truncate text-xs text-muted-foreground">{store.email}</span>}
            </div>
        </div>
    );
}
